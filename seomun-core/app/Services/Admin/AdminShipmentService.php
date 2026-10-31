<?php

namespace App\Services\Admin;

use App\Enums\DeliveryStatus;
use App\Enums\OrderShipmentStatus;
use App\Enums\OrderStatus;
use App\Models\DeliveryTracking;
use App\Models\OrderShipment;
use App\Models\User;
use App\Services\Hanjin\HanjinApiClient;
use App\Services\Hanjin\HanjinStatusMapper;
use App\Services\Hanjin\HanjinTrackingResult;
use App\Services\PaginationService;
use Carbon\Carbon;
use DateTimeInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;

class AdminShipmentService
{
    public function __construct(
        protected PaginationService $paginationService,
        protected HanjinApiClient $hanjinClient,
        protected HanjinStatusMapper $hanjinStatusMapper,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        return [
            'shipment_status_options' => collect(OrderShipmentStatus::cases())->map(fn($s) => [
                'value' => $s->value,
                'label' => $s->value,
            ])->toArray(),
            'shipping_manager_options' => User::query()
                ->whereNotNull('name')
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn($u) => ['value' => $u->id, 'label' => $u->name])
                ->toArray(),
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function getShipments(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->buildQuery($filters);
        $sortBy = Arr::get($filters, 'sort_by', 'shipped_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');

        $sortColumn = match ($sortBy) {
            'order_number'  => 'orders.order_number',
            'shipped_at',
            'shipment_date' => 'order_shipments.shipped_at',
            default         => 'order_shipments.created_at',
        };

        $query->orderBy($sortColumn, $sortOrder);
        $currentPage = (int) Arr::get($filters, 'current_page', 1);

        return $query->paginate($perPage, ['order_shipments.*'], 'page', $currentPage);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function buildQuery(array $filters): Builder
    {
        $query = OrderShipment::query()
            ->select('order_shipments.*')
            ->join('orders', 'order_shipments.order_id', '=', 'orders.id')
            ->with(['order.items.product', 'items.product']);

        $searchTerm = Arr::get($filters, 'search_term');
        if ($searchTerm !== null && $searchTerm !== '') {
            $like = '%' . str_replace(['%', '_'], ['\%', '\_'], $searchTerm) . '%';
            $query->where(function (Builder $q) use ($like) {
                $q->where('orders.order_number', 'like', $like)
                    ->orWhere('orders.company_name', 'like', $like)
                    ->orWhere('order_shipments.tracking_number', 'like', $like);
            });
        }

        $dateFrom = Arr::get($filters, 'shipment_date_from');
        if ($dateFrom) {
            $query->where('order_shipments.created_at', '>=', $dateFrom);
        }
        $dateTo = Arr::get($filters, 'shipment_date_to');
        if ($dateTo) {
            $query->where('order_shipments.created_at', '<=', $dateTo . ' 23:59:59');
        }

        $orderNumber = Arr::get($filters, 'order_number');
        if ($orderNumber) {
            $query->where('orders.order_number', 'like', '%' . $orderNumber . '%');
        }

        $customerName = Arr::get($filters, 'customer_name');
        if ($customerName) {
            $query->where('orders.company_name', 'like', '%' . $customerName . '%');
        }

        $status = Arr::get($filters, 'shipment_status');
        if ($status !== null && $status !== '') {
            $query->where('order_shipments.status', $status);
        }

        $type = Arr::get($filters, 'shipment_type');
        if ($type !== null && $type !== '') {
            $query->where('order_shipments.type', $type);
        }

        $trackingNumber = Arr::get($filters, 'tracking_number');
        if ($trackingNumber) {
            $query->where('order_shipments.tracking_number', 'like', '%' . $trackingNumber . '%');
        }

        return $query;
    }

    /**
     * Update the tracking number (and optional carrier info) of a shipment.
     * Only allowed when the shipment does not already have a tracking number.
     * Before persisting, the tracking number is resolved through the Hanjin API
     * and the actual carrier status is used for the auto-created DeliveryTracking
     * row. When a tracking number is registered on a pending shipment, the
     * shipment is auto-transitioned to "shipped" and `shipped_at` is stamped.
     *
     * @param  array<string, mixed>  $data
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     * @throws \RuntimeException when shipment already has a tracking number
     *                          or Hanjin did not return a usable status
     */
    public function updateTrackingNumber(int $shipmentId, array $data): OrderShipment
    {
        /** @var OrderShipment $shipment */
        $shipment = OrderShipment::query()->findOrFail($shipmentId);

        $trackingNumber = trim((string) Arr::get($data, 'tracking_number', ''));
        if ($trackingNumber === '') {
            throw new \RuntimeException('송장번호가 비어 있습니다.', 422);
        }

        if (! empty($shipment->tracking_number) && trim((string) $shipment->tracking_number) !== '') {
            throw new \RuntimeException('이미 송장번호가 등록된 출고건입니다. 송장번호는 한 번만 등록할 수 있습니다.', 409);
        }

        if (! in_array($shipment->order->status, OrderStatus::getShippableStatuses())) {
            throw new \RuntimeException('주문 상태: 비활성.', 409);
        }

        $hanjinResult = $this->fetchHanjinTracking($trackingNumber);

        $shipment->tracking_number = $trackingNumber;
        $shipment->carrier_code = Arr::get($data, 'carrier_code');
        $shipment->carrier_name = Arr::get($data, 'carrier_name') ?: $this->resolveCourierName($hanjinResult);

        if ($shipment->status === OrderShipmentStatus::PENDING) {
            $shipment->status = OrderShipmentStatus::SHIPPED;
            if (! $shipment->shipped_at) {
                $shipment->shipped_at = Carbon::now();
            }
        }

        $shipment->save();

        $this->ensureDeliveryTracking($shipment, $trackingNumber, $hanjinResult);

        return $shipment;
    }

    /**
     * Fetch the tracking record from Hanjin. Throws RuntimeException with the
     * proper status code when the carrier cannot be reached or has no data.
     */
    protected function fetchHanjinTracking(string $trackingNumber): HanjinTrackingResult
    {
        try {
            $result = $this->hanjinClient->getTracking($trackingNumber);
        } catch (ConnectionException $e) {
            Log::warning('Hanjin unreachable while registering tracking number', [
                'invoice_number' => $trackingNumber,
                'error' => $e->getMessage(),
            ]);
            throw new \RuntimeException('택배사 시스템에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.', 502);
        } catch (RequestException $e) {
            $status = $e->response?->status();
            Log::warning('Hanjin returned error while registering tracking number', [
                'invoice_number' => $trackingNumber,
                'status' => $status,
                'error' => $e->getMessage(),
            ]);
            throw new \RuntimeException('택배사 조회에 실패했습니다. 잠시 후 다시 시도해 주세요.', 502);
        } catch (\Throwable $e) {
            Log::error('Unexpected error fetching Hanjin tracking', [
                'invoice_number' => $trackingNumber,
                'error' => $e->getMessage(),
            ]);
            throw new \RuntimeException('택배사 조회 중 오류가 발생했습니다.', 500);
        }

        if (! $result->hasData()) {
            throw new \RuntimeException('택배사 시스템에서 해당 송장번호의 배송 정보를 찾을 수 없습니다. 송장번호를 확인해 주세요.', 422);
        }

        return $result;
    }

    protected function resolveCourierName(?HanjinTrackingResult $result): ?string
    {
        if (! $result) {
            return null;
        }

        $history = $result->history;
        if ($history === []) {
            return null;
        }

        foreach ($history as $entry) {
            $agency = $entry['agency_name'] ?? null;
            if (is_string($agency) && trim($agency) !== '') {
                return trim($agency);
            }
        }

        return null;
    }

    /**
     * Create a DeliveryTracking row for the shipment's order if one does not
     * already exist. Safe to call repeatedly. The status/courier are sourced
     * from the Hanjin lookup performed in fetchHanjinTracking().
     */
    protected function ensureDeliveryTracking(
        OrderShipment $shipment,
        string $trackingNumber,
        HanjinTrackingResult $hanjinResult
    ): void {
        if (! $shipment->order_id) {
            return;
        }

        $deliveryStatus = $this->hanjinStatusMapper->map($hanjinResult->latestStatusCode);
        $courierName = $this->resolveCourierName($hanjinResult) ?? $shipment->carrier_name;
        $latestAt = $hanjinResult->latestStatusAt;

        DeliveryTracking::updateOrCreate(
            [
                'order_id' => $shipment->order_id,
            ],
            [
                'invoice_number' => $trackingNumber,
                'waybill_registered_at' => (
                    $latestAt instanceof DateTimeInterface
                    ? Carbon::instance($latestAt)
                    : Carbon::now()
                )->toDateString(),
                'delivery_status' => $deliveryStatus,
                'courier_name' => $courierName,
                'tracking_info' => [
                    'source' => 'admin_shipment_tracking',
                    'order_shipment_id' => $shipment->id,
                    'carrier_code' => $shipment->carrier_code,
                    'carrier_name' => $courierName,
                    'latest_status_code' => $hanjinResult->latestStatusCode,
                    'latest_status_name' => $hanjinResult->latestStatusName,
                    'latest_status_date' => $latestAt?->format('Y-m-d H:i:s'),
                    'is_terminal' => $hanjinResult->isTerminal,
                    'history' => $hanjinResult->history,
                ],
            ]
        );
    }
}
