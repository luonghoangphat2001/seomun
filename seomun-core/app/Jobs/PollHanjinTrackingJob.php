<?php

namespace App\Jobs;

use App\Models\DeliveryTracking;
use App\Services\DeliveryTrackingPollingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PollHanjinTrackingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 30;

    public function __construct(
        public readonly int $deliveryTrackingId,
        public readonly bool $force = false,
    ) {}

    /**
     * @return array<int, int>
     */
    public function backoff(): array
    {
        return [60, 300, 900];
    }

    public function handle(DeliveryTrackingPollingService $service): void
    {
        $tracking = DeliveryTracking::find($this->deliveryTrackingId);

        if (! $tracking) {
            Log::warning('PollHanjinTrackingJob: tracking record not found', [
                'delivery_tracking_id' => $this->deliveryTrackingId,
            ]);

            return;
        }

        $service->poll($tracking, $this->force);
    }

    public function failed(\Throwable $e): void
    {
        Log::error('PollHanjinTrackingJob failed permanently', [
            'delivery_tracking_id' => $this->deliveryTrackingId,
            'error' => $e->getMessage(),
        ]);
    }
}
