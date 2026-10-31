<?php

namespace App\Services;

use App\Enums\DeliveryStatus;
use App\Jobs\PollHanjinTrackingJob;
use App\Models\DeliveryTracking;
use App\Services\Hanjin\HanjinApiClient;
use App\Services\Hanjin\HanjinStatusMapper;
use App\Services\Hanjin\HanjinTrackingResult;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

class DeliveryTrackingPollingService
{
    /**
     * Circuit breaker cache key. Holds timestamp until which polling is paused.
     */
    private const CIRCUIT_KEY = 'hanjin:tracking:circuit_open_until';

    /**
     * Consecutive 5xx failures required to open the circuit.
     */
    private const CIRCUIT_FAILURE_THRESHOLD = 5;

    /**
     * Duration (seconds) the circuit stays open once tripped.
     */
    private const CIRCUIT_COOLDOWN_SECONDS = 300;

    /**
     * Polling intervals per status (seconds).
     */
    private const INTERVAL_PICKUP_FRESH = 2 * 3600;

    private const INTERVAL_PICKUP_AGED = 6 * 3600;

    private const INTERVAL_IN_TRANSIT = 6 * 3600;

    public function __construct(
        protected HanjinApiClient $client,
        protected HanjinStatusMapper $mapper
    ) {}

    /**
     * Build the query that finds trackings eligible for polling right now.
     *
     * @param  bool  $force  ignore the per-tracking backoff
     * @return Builder<DeliveryTracking>
     */
    public function pollableQuery(bool $force = false): Builder
    {
        $query = DeliveryTracking::query()
            ->whereNotIn('delivery_status', [DeliveryStatus::Delivered->value])
            ->whereNotNull('invoice_number');

        if ($force) {
            return $query;
        }

        $now = now();

        return $query->where(function (Builder $q) use ($now) {
            // Pickup: every 2h for first 24h since waybill_registered_at, then 6h.
            $q->where(function (Builder $pickup) use ($now) {
                $pickup->where('delivery_status', DeliveryStatus::Pickup->value)
                    ->where(function (Builder $age) use ($now) {
                        $age->whereNull('waybill_registered_at')
                            ->orWhere('waybill_registered_at', '>=', $now->copy()->subDay());
                    })
                    ->where(function (Builder $since) use ($now) {
                        $since->whereNull('updated_at')
                            ->orWhere('updated_at', '<=', $now->copy()->subSeconds(self::INTERVAL_PICKUP_FRESH));
                    });
            })->orWhere(function (Builder $pickupAged) use ($now) {
                $pickupAged->where('delivery_status', DeliveryStatus::Pickup->value)
                    ->where('waybill_registered_at', '<', $now->copy()->subDay())
                    ->where(function (Builder $since) use ($now) {
                        $since->whereNull('updated_at')
                            ->orWhere('updated_at', '<=', $now->copy()->subSeconds(self::INTERVAL_PICKUP_AGED));
                    });
            })->orWhere(function (Builder $transit) use ($now) {
                $transit->where('delivery_status', DeliveryStatus::InTransit->value)
                    ->where(function (Builder $since) use ($now) {
                        $since->whereNull('updated_at')
                            ->orWhere('updated_at', '<=', $now->copy()->subSeconds(self::INTERVAL_IN_TRANSIT));
                    });
            });
        });
    }

    /**
     * Dispatch polling jobs for every pollable tracking.
     */
    public function dispatchPollBatch(?int $limit = null, bool $force = false): int
    {
        if ($this->isCircuitOpen()) {
            Log::warning('Hanjin delivery polling skipped: circuit breaker is open', [
                'open_until' => Cache::get(self::CIRCUIT_KEY),
            ]);

            return 0;
        }

        $query = $this->pollableQuery($force)->orderBy('updated_at');

        if ($limit !== null && $limit > 0) {
            $query->limit($limit);
        }

        /** @var EloquentCollection<int, DeliveryTracking> $batch */
        $batch = $query->get();

        foreach ($batch as $tracking) {
            PollHanjinTrackingJob::dispatch($tracking->id, $force);
        }

        return $batch->count();
    }

    /**
     * Poll a single tracking record. Returns true when DB was updated.
     */
    public function poll(DeliveryTracking $tracking, bool $force = false): bool
    {
        if (! $force && $tracking->delivery_status === DeliveryStatus::Delivered) {
            return false;
        }

        if (! $force && $this->isCircuitOpen()) {
            return false;
        }

        try {
            $result = $this->client->getTracking($tracking->invoice_number);
        } catch (ConnectionException $e) {
            $this->recordCircuitFailure();
            Log::warning('Hanjin tracking poll: connection error', [
                'delivery_tracking_id' => $tracking->id,
                'invoice_number' => $tracking->invoice_number,
                'error' => $e->getMessage(),
            ]);

            return false;
        } catch (RequestException $e) {
            $status = $e->response?->status();
            if ($status !== null && $status >= 500) {
                $this->recordCircuitFailure();
            }
            Log::warning('Hanjin tracking poll: HTTP error', [
                'delivery_tracking_id' => $tracking->id,
                'invoice_number' => $tracking->invoice_number,
                'status' => $status,
                'error' => $e->getMessage(),
            ]);

            return false;
        } catch (Throwable $e) {
            Log::error('Hanjin tracking poll: unexpected error', [
                'delivery_tracking_id' => $tracking->id,
                'invoice_number' => $tracking->invoice_number,
                'error' => $e->getMessage(),
            ]);

            return false;
        }

        $this->resetCircuitFailures();

        if (! $result->hasData()) {
            Log::info('Hanjin tracking poll: no data returned', [
                'delivery_tracking_id' => $tracking->id,
                'invoice_number' => $tracking->invoice_number,
            ]);

            return false;
        }

        return $this->applyResult($tracking, $result);
    }

    /**
     * Persist tracking result. Returns true when the record was actually changed.
     */
    protected function applyResult(DeliveryTracking $tracking, HanjinTrackingResult $result): bool
    {
        $newStatus = $this->mapper->map($result->latestStatusCode);
        $newCourier = $result->history[0]['agency_name'] ?? $tracking->courier_name;

        $previousStatus = $tracking->delivery_status;
        $previousLatest = $this->latestTimestamp($tracking);

        $latest = $result->latestStatusAt;
        $statusChanged = $newStatus !== $previousStatus;
        $progressed = $latest !== null && ($previousLatest === null || $latest > $previousLatest);

        if (! $statusChanged && ! $progressed) {
            // Touch only if we want a heartbeat; otherwise skip the write.
            return false;
        }

        $tracking->fill([
            'delivery_status' => $newStatus,
            'tracking_info' => [
                'latest_status_code' => $result->latestStatusCode,
                'latest_status_name' => $result->latestStatusName,
                'latest_status_date' => $latest?->format('Y-m-d H:i:s'),
                'is_terminal' => $result->isTerminal,
                'history' => $result->history,
                'updated_via' => 'hanjin_poll',
            ],
        ]);

        if ($newCourier && $tracking->courier_name !== $newCourier) {
            $tracking->courier_name = $newCourier;
        }

        $tracking->save();

        if ($statusChanged) {
            Log::info('DeliveryTracking status changed', [
                'delivery_tracking_id' => $tracking->id,
                'invoice_number' => $tracking->invoice_number,
                'order_id' => $tracking->order_id,
                'from' => $previousStatus?->value,
                'to' => $newStatus->value,
                'status_code' => $result->latestStatusCode,
            ]);
        }

        return true;
    }

    protected function latestTimestamp(DeliveryTracking $tracking): ?Carbon
    {
        $raw = $tracking->tracking_info['latest_status_date'] ?? null;
        if (! is_string($raw) || $raw === '') {
            return null;
        }

        try {
            return Carbon::createFromFormat('Y-m-d H:i:s', $raw);
        } catch (Throwable) {
            try {
                return Carbon::parse($raw);
            } catch (Throwable) {
                return null;
            }
        }
    }

    protected function isCircuitOpen(): bool
    {
        $openUntil = Cache::get(self::CIRCUIT_KEY);

        return is_numeric($openUntil) && (int) $openUntil > time();
    }

    protected function recordCircuitFailure(): void
    {
        $key = self::CIRCUIT_KEY.':failures';
        $failures = (int) Cache::get($key, 0) + 1;

        if ($failures >= self::CIRCUIT_FAILURE_THRESHOLD) {
            Cache::put(self::CIRCUIT_KEY, time() + self::CIRCUIT_COOLDOWN_SECONDS, self::CIRCUIT_COOLDOWN_SECONDS);
            Cache::forget($key);
            Log::warning('Hanjin circuit breaker opened', [
                'cooldown_seconds' => self::CIRCUIT_COOLDOWN_SECONDS,
                'failures' => $failures,
            ]);

            return;
        }

        Cache::put($key, $failures, now()->addMinutes(10));
    }

    protected function resetCircuitFailures(): void
    {
        Cache::forget(self::CIRCUIT_KEY.':failures');
    }
}
