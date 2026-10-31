<?php

namespace App\Http\Resources;

use App\Enums\DesignModeCode;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MyPageOrderDeliveryTrackingDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $order = (new OrderResource($this->resource))->toArray($request);
        $items = OrderItemResource::collection(
            $this->resource->items
        )->resolve($request);
        $productInfos = collect($items)
            ->map(function (array $item) {
                return $this->formatProductInfo($item);
            })
            ->all();
        $proofSection = $this->buildProofConfirmationSection($order, $productInfos);
        $trackingSection = $this->buildTrackingSection($order, $proofSection);

        $historyCount = (int) ($this->resource->shipping_address_histories_count ?? 0);

        $orderShipments = $order['order_shipments'];

        if ($orderShipments instanceof \Illuminate\Http\Resources\MissingValue) {
            $orderShipments = [];
        }

        return [
            'order' => $order,
            'sections' => [
                'orderer_info' => [
                    'order_number' => $order['order_number'] ?? null,
                    'order_date' => $order['metadata']['placed_at'] ?? $order['created_at'] ?? null,
                    'orderer_name' => $order['contact']['name'] ?? null,
                    'orderer_phone' => $order['contact']['phone'] ?? null,
                    'orderer_address' => $order['contact']['address'] ?? null,
                    'customer_manager' => $order['customer_manager'] ?? null,
                ],
                'tracking' => $trackingSection,
                'product_infos' => $productInfos,
                'proof_confirmation' => $proofSection,
                'shipping_info' => $order['shipping'] ?? [],
                'order_shipments' => $order['order_shipments'] ?? [],
                /** 배송지 변경 이력 (변경 이력 확인 버튼) — FE: history_available 이면 모달 API 호출 */
                'shipping_address_change' => [
                    'history_available' => $historyCount > 0,
                    'version_count' => $historyCount,
                    'last_changed_at' => $this->resource->latestShippingAddressHistory?->changed_at?->toIso8601String(),
                ],
                'payment_info' => [
                    'payment_method' => $order['payment_method'] ?? null,
                    'payment_status' => $order['payment_status'] ?? null,
                    'totals' => $order['totals'] ?? [],
                    'payment_details' => $order['payment_details'] ?? [],
                    'shipping_fee_breakdown' => $this->buildShippingFeeBreakdown($orderShipments),
                ],
            ],
        ];
    }

    /**
     * Normalize item row for "주문상품 정보" blocks.
     *
     * @param  array<string, mixed>  $item
     * @return array<string, mixed>
     */
    private function formatProductInfo(array $item): array
    {
        $config = is_array($item['configuration'] ?? null) ? $item['configuration'] : [];
        $preview = is_array($item['design_preview'] ?? null) ? $item['design_preview'] : [];
        $quantity = (int) ($item['quantity'] ?? 0);
        $cases = (float) ($item['number_of_cases'] ?? ($item['multiplier'] ?? 1));
        $totalQty = (int) ($item['total_quantity'] ?? ($quantity * $cases));

        return [
            // Original item payload for FE fallback.
            'raw' => $item,
            // Flattened fields for table-like UI (as shown in design).
            'product_name' => $item['title'] ?? ($config['product_name'] ?? null),
            'size' => $config['size'] ?? null,
            'paper' => $config['paper'] ?? null,
            'print_surface' => $config['print_surface'] ?? null,
            'quantity' => $quantity,
            'number_of_cases' => $cases,
            'total_quantity' => $totalQty,
            'quantity_label' => $quantity . ' x ' . $cases,
            'coating' => $config['coating'] ?? null,
            'finishing' => $config['finishing'] ?? null,
            'attachment' => $config['attachment'] ?? null,
            'upload_file' => $config['design_preview'] ?? null,
            'design_preview' => [
                'front_image_url' => $preview['front_image_url'] ?? null,
                'back_image_url' => $preview['back_image_url'] ?? null,
            ],
            'unit_price' => $item['unit_price'] ?? null,
            'total_price' => $item['total_price'] ?? null,
        ];
    }

    /**
     * Data model for "수정 파일 및 확인" modal.
     *
     * @param  array<string, mixed>  $order
     * @param  array<int, array<string, mixed>>  $productInfos
     * @return array<string, mixed>
     */
    private function buildProofConfirmationSection(array $order, array $productInfos): array
    {
        $proof = is_array($order['proof'] ?? null) ? $order['proof'] : [];
        $status = (string) ($proof['status'] ?? '');
        $confirmedAt = $proof['confirmed_at'] ?? null;

        $documents = collect($productInfos)->map(function (array $product, int $index) {
            $preview = is_array($product['design_preview'] ?? null) ? $product['design_preview'] : [];

            return [
                'sequence' => $index + 1,
                'product_name' => $product['product_name'] ?? null,
                'upload_file_url' => $product['upload_file'] ?? null,
                'preview_images' => array_values(array_filter([
                    $preview['front_image_url'] ?? null,
                    $preview['back_image_url'] ?? null,
                ])),
            ];
        })->values()->all();

        return [
            'status' => $status !== '' ? $status : null,
            'confirmed_at' => $confirmedAt,
            'corrections' => is_array($proof['corrections'] ?? null) ? $proof['corrections'] : [],
            'file_resubmissions' => is_array($proof['file_resubmissions'] ?? null) ? $proof['file_resubmissions'] : [],
            'documents' => $documents,
            'actions' => [
                'request_revision' => [
                    'enabled' => $confirmedAt === null,
                    'method' => 'POST',
                    'endpoint' => '/api/mypage-order-delivery-tracking/histories/' . ($order['order_number'] ?? '') . '/proof/revision-request',
                ],
                'resubmit_file' => [
                    'enabled' => $confirmedAt === null,
                    'method' => 'POST',
                    'endpoint' => '/api/mypage-order-delivery-tracking/histories/' . ($order['order_number'] ?? '') . '/proof/resubmit-file',
                ],
                'confirm_proof' => [
                    'enabled' => $confirmedAt === null,
                    'method' => 'POST',
                    'endpoint' => '/api/mypage-order-delivery-tracking/histories/' . ($order['order_number'] ?? '') . '/proof/confirm',
                ],
            ],
        ];
    }

    /**
     * Tracking rows for detail page.
     * Rule: design flow (디자인현황) is pre-production and is only relevant
     * when order uses design request mode (non-web-editor).
     *
     * @param  array<string, mixed>  $order
     * @param  array<string, mixed>  $proofSection
     * @return array<string, mixed>
     */
    private function buildTrackingSection(array $order, array $proofSection): array
    {
        $designModeCode = strtolower((string) ($order['product']['design_mode']['code'] ?? ''));
        $designModeName = strtolower((string) ($order['product']['design_mode']['name'] ?? ''));
        $isWebEditor = $designModeCode === DesignModeCode::WEB_EDITOR->value || str_contains($designModeName, 'web');
        $designRequired = ! $isWebEditor;

        $orderStage = (string) ($order['order_status_stage'] ?? '');
        $shippingMethod = strtolower(($order['shipping_method']->value ?? ''));
        $proofConfirmedAt = $proofSection['confirmed_at'] ?? null;

        $productionSteps = $this->buildProductionSteps();
        $designSteps = $this->buildDesignSteps();
        $deliverySteps = $this->buildDeliverySteps();

        if ($orderStage === 'delivered') {
            $this->markStepStates($deliverySteps, 'delivered');

            return [
                'display_mode' => 'delivery_only',
                'design_required' => $designRequired,
                'design_mode_code' => $designModeCode !== '' ? $designModeCode : null,
                'groups' => [
                    'production' => ['visible' => false, 'steps' => $productionSteps],
                    'design' => ['visible' => false, 'steps' => $designSteps],
                    'delivery' => ['visible' => true, 'steps' => $deliverySteps],
                ],
            ];
        }

        if ($orderStage === 'shipping') {
            $deliveryCurrent = match ($shippingMethod) {
                'pickup' => 'pickup',
                'courier' => 'courier',
                'quick' => 'quick',
                'direct' => 'direct',
                default => 'courier',
            };
            $this->markStepStates($deliverySteps, $deliveryCurrent);
        }

        if ($designRequired) {
            $designCurrent = match ($orderStage) {
                'payment_completed' => 'awaiting_payment',
                'order_confirmed' => $proofConfirmedAt ? 'design_done' : 'draft_delivery',
                'in_production', 'shipping' => 'design_done',
                default => 'awaiting_payment',
            };
            $this->markStepStates($designSteps, $designCurrent);
        }

        $productionCurrent = match ($orderStage) {
            'payment_completed' => 'awaiting_payment',
            'order_confirmed' => 'pending_reception',
            'in_production' => 'proofreading',
            'shipping' => 'production_done',
            default => 'awaiting_payment',
        };
        $this->markStepStates($productionSteps, $productionCurrent);

        return [
            'display_mode' => $designRequired ? 'design_then_production' : 'production_then_delivery',
            'design_required' => $designRequired,
            'design_mode_code' => $designModeCode !== '' ? $designModeCode : null,
            'groups' => [
                'production' => ['visible' => true, 'steps' => $productionSteps],
                'design' => ['visible' => $designRequired, 'steps' => $designSteps],
                'delivery' => ['visible' => true, 'steps' => $deliverySteps],
            ],
        ];
    }

    /**
     * @return array<int, array{key:string,label:string,state:string}>
     */
    private function buildProductionSteps(): array
    {
        return [
            ['key' => 'awaiting_payment', 'label' => '결제 대기', 'state' => 'upcoming'],
            ['key' => 'pending_reception', 'label' => '접수 대기', 'state' => 'upcoming'],
            ['key' => 'file_error', 'label' => '파일 에러', 'state' => 'upcoming'],
            ['key' => 'proofreading', 'label' => '교정', 'state' => 'upcoming'],
            ['key' => 'typesetting', 'label' => '조판', 'state' => 'upcoming'],
            ['key' => 'printing_output', 'label' => '출력', 'state' => 'upcoming'],
            ['key' => 'press', 'label' => '인쇄', 'state' => 'upcoming'],
            ['key' => 'post_processing', 'label' => '후가공', 'state' => 'upcoming'],
            ['key' => 'production_done', 'label' => '생산 완료', 'state' => 'upcoming'],
        ];
    }

    /**
     * @return array<int, array{key:string,label:string,state:string}>
     */
    private function buildDesignSteps(): array
    {
        return [
            ['key' => 'awaiting_payment', 'label' => '결제 대기', 'state' => 'upcoming'],
            ['key' => 'pending_reception', 'label' => '접수 대기', 'state' => 'upcoming'],
            ['key' => 'designing', 'label' => '디자인 중', 'state' => 'upcoming'],
            ['key' => 'draft_delivery', 'label' => '시안 전달 및 교정', 'state' => 'upcoming'],
            ['key' => 'design_done', 'label' => '디자인 완료', 'state' => 'upcoming'],
        ];
    }

    /**
     * @return array<int, array{key:string,label:string,state:string}>
     */
    private function buildDeliverySteps(): array
    {
        return [
            ['key' => 'pickup', 'label' => '방문 수령', 'state' => 'upcoming'],
            ['key' => 'courier', 'label' => '택배배송', 'state' => 'upcoming'],
            ['key' => 'quick', 'label' => '퀵배송', 'state' => 'upcoming'],
            ['key' => 'direct', 'label' => '직배송', 'state' => 'upcoming'],
            ['key' => 'delivered', 'label' => '배송완료', 'state' => 'upcoming'],
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $orderShipments
     * @return array<int, array<string, mixed>>
     */
    private function buildShippingFeeBreakdown(array $orderShipments): array
    {
        if (empty($orderShipments)) {
            return [];
        }

        $grouped = [];
        foreach ($orderShipments as $shipment) {
            $type = $shipment['type'] ?? null;
            if ($type === null) {
                continue;
            }
            if (! isset($grouped[$type])) {
                $grouped[$type] = [
                    'type'          => $type,
                    'type_label_ko' => $shipment['type_label_ko'] ?? $type,
                    'fee'           => 0.0,
                ];
            }
            $grouped[$type]['fee'] += (float) ($shipment['shipping_fee'] ?? 0);
        }

        return array_values(array_map(function (array $row): array {
            $row['fee'] = number_format($row['fee'], 2, '.', '');
            return $row;
        }, $grouped));
    }

    /**
     * @param  array<int, array{key:string,label:string,state:string}>  $steps
     */
    private function markStepStates(array &$steps, string $currentKey): void
    {
        $currentIndex = collect($steps)->search(fn(array $step): bool => $step['key'] === $currentKey);
        if (! is_int($currentIndex)) {
            return;
        }

        foreach ($steps as $index => $step) {
            if ($index < $currentIndex) {
                $steps[$index]['state'] = 'done';
            } elseif ($index === $currentIndex) {
                $steps[$index]['state'] = 'current';
            } else {
                $steps[$index]['state'] = 'upcoming';
            }
        }
    }
}
