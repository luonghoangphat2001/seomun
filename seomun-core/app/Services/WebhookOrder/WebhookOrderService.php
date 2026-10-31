<?php

namespace App\Services\WebhookOrder;

use App\Constants\WebhookErrorCode;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Exceptions\WebhookOrderException;
use App\Models\Customer;
use App\Models\ErpOptionGroup;
use App\Models\OrderCodeOptionMapping;
use App\Models\PartnerOrder;
use App\Models\PartnerOrderGroup;
use App\Models\PartnerOrderItem;
use App\Services\Price\PriceCalculator;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class WebhookOrderService
{
    /**
     * Receive (upsert) a single PartnerOrder — idempotent by order_external_number
     */
    public function receiveOrder(array $orderData, Customer $customer): PartnerOrder
    {
        \Log::info('Start receiveOrder process', [
            'order_idx' => $orderData['order_idx'] ?? null,
            'customer_id' => $customer->id,
        ]);

        return DB::transaction(function () use ($orderData, $customer) {
            $externalNumber = $orderData['order_idx'] ?? null;

            $order = PartnerOrder::where('order_external_number', $externalNumber)->first();

            if ($order) {
                // Only allow update if order is still in pending status
                $updatableStatuses = [OrderStatus::Pending->value, OrderStatus::Draft->value];
                if (! in_array($order->status, $updatableStatuses)) {
                    \Log::info('PartnerOrder cannot be updated — status is not pending', [
                        'order_external_number' => $externalNumber,
                        'status' => $order->status,
                    ]);
                    throw new WebhookOrderException(
                        "Order '{$externalNumber}' cannot be updated because it is already in status: {$order->status}",
                        WebhookErrorCode::ORD002,
                        422
                    );
                }

                \Log::info('PartnerOrder already exists, updating', [
                    'order_external_number' => $externalNumber,
                    'partner_order_id' => $order->id,
                ]);

                return $this->updateExistingOrder($order, $orderData);
            }

            $order = PartnerOrder::create([
                'order_number' => $this->generateOrderNumber(),
                'order_external_number' => $externalNumber,
                'customer_id' => $customer->id,
                'product_name' => $this->getProductName($orderData),
                'status' => OrderStatus::Pending->value,
                'payment_status' => PaymentStatus::PENDING->value,
                'currency' => 'KRW',
                'subtotal_amount' => $this->calculateSubtotal($orderData),
                'tax_amount' => $this->calculateTax($orderData),
                'shipping_fee' => $this->getShippingFee($orderData),
                'total_amount' => $this->calculateTotal($orderData),
                'placed_at' => now(),

                // Contact
                'contact_name' => $orderData['f_name'] ?? '',
                'contact_tel' => $orderData['tel'] ?? '',
                'contact_phone' => $orderData['hp'] ?? '',
                'contact_phone2' => $orderData['hp2'] ?? '',
                'contact_email' => $orderData['email'] ?? '',

                // Sender
                'sender_name' => $orderData['f_name'] ?? '',
                'sender_phone' => $orderData['f_tel'] ?? '',
                'sender_zipcode' => $orderData['f_zipcode'] ?? '',
                'sender_address' => $orderData['f_addr'] ?? '',
                'sender_address2' => $orderData['f_addr2'] ?? '',

                // Shipping
                'shipping_name' => $orderData['d_name'] ?? '',
                'shipping_phone' => $orderData['d_tel'] ?? '',
                'shipping_phone2' => $orderData['d_hp'] ?? '',
                'shipping_postcode' => $orderData['d_zipcode'] ?? '',
                'shipping_address' => $orderData['d_addr1'] ?? '',
                'shipping_address_detail' => $orderData['d_addr2'] ?? '',
                'shipping_method' => $orderData['d_type_admin'] ?? '',
                'shipping_time' => $orderData['d_time'] ?? '',

                // Metadata
                'metadata' => [
                    'order_idx' => $externalNumber,
                ],
            ]);

            foreach ($orderData['items'] ?? [] as $itemData) {
                $this->createPartnerOrderItem($order, $itemData);
            }

            $order->load('items');

            \Log::info('PartnerOrder created successfully', [
                'partner_order_id' => $order->id,
                'order_number' => $order->order_number,
                'items_count' => $order->items->count(),
            ]);

            return $order;
        });
    }

    /**
     * Batch receive — per-order try/catch, returns per-order results
     */
    public function receiveOrders(array $ordersData, Customer $customer): array
    {
        $results = [];

        foreach ($ordersData as $orderData) {
            try {
                if (empty($orderData) || ! is_array($orderData)) {
                    $results[] = [
                        'external_order_id' => null,
                        'status' => 'error',
                        'error' => 'Invalid order data: null or empty',
                    ];

                    continue;
                }

                $order = $this->receiveOrder($orderData, $customer);
                $results[] = [
                    'external_order_id' => $orderData['order_idx'] ?? null,
                    'order_number' => $order->order_number,
                    'status' => 'success',
                ];
            } catch (\Exception $e) {
                $results[] = [
                    'external_order_id' => $orderData['order_idx'] ?? null,
                    'status' => 'error',
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    /**
     * Approve a group of orders identified by external_order_ids.
     * Creates a PartnerOrderGroup, assigns all matching orders to it,
     * updates their status to confirmed, and returns the group.
     */
    public function approveOrderGroup(array $externalOrderIds, array $shippingData, ?Customer $customer = null): PartnerOrderGroup
    {
        return DB::transaction(function () use ($externalOrderIds, $shippingData, $customer) {
            // Validate all orders exist
            $orders = PartnerOrder::whereIn('order_external_number', $externalOrderIds)->get();

            $foundIds = $orders->pluck('order_external_number')->toArray();
            $missingIds = array_diff($externalOrderIds, $foundIds);
            if (! empty($missingIds)) {
                throw new WebhookOrderException(
                    'Orders not found: '.implode(', ', $missingIds),
                    WebhookErrorCode::ORD005,
                    404
                );
            }

            // Validate all orders are in pending status and not already grouped
            foreach ($orders as $order) {
                if ($order->status !== OrderStatus::Pending->value) {
                    throw new WebhookOrderException(
                        "Order '{$order->order_external_number}' cannot be approved — current status: {$order->status}",
                        WebhookErrorCode::ORD003,
                        422
                    );
                }
                if ($order->order_group_id !== null) {
                    throw new WebhookOrderException(
                        "Order '{$order->order_external_number}' is already assigned to a group",
                        WebhookErrorCode::ORD004,
                        422
                    );
                }
            }
            $group = PartnerOrderGroup::create([
                'group_order_number' => $this->generateGroupOrderNumber(),
                'customer_id' => $customer?->id,
                'status' => OrderStatus::Confirmed->value,
                'contact_name' => $shippingData['contact_name'] ?? null,
                'contact_tel' => $shippingData['contact_tel'] ?? null,
                'contact_phone' => $shippingData['contact_phone'] ?? null,
                'contact_phone2' => $shippingData['contact_phone2'] ?? null,
                'contact_email' => $shippingData['contact_email'] ?? null,
                'sender_name' => $shippingData['sender_name'] ?? null,
                'sender_phone' => $shippingData['sender_phone'] ?? null,
                'sender_zipcode' => $shippingData['sender_zipcode'] ?? null,
                'sender_address' => $shippingData['sender_address'] ?? null,
                'sender_address2' => $shippingData['sender_address2'] ?? null,
                'shipping_name' => $shippingData['shipping_name'] ?? null,
                'shipping_phone' => $shippingData['shipping_phone'] ?? null,
                'shipping_phone2' => $shippingData['shipping_phone2'] ?? null,
                'shipping_postcode' => $shippingData['shipping_postcode'] ?? null,
                'shipping_address' => $shippingData['shipping_address'] ?? null,
                'shipping_address_detail' => $shippingData['shipping_address_detail'] ?? null,
                'shipping_method' => $shippingData['shipping_method'] ?? null,
                'shipping_time' => $shippingData['shipping_time'] ?? null,
            ]);

            PartnerOrder::whereIn('order_external_number', $externalOrderIds)
                ->update([
                    'order_group_id' => $group->id,
                    'status' => OrderStatus::Confirmed->value,
                ]);

            // Set stable order_sequence for each order within the group
            $sequence = 1;
            foreach ($orders as $order) {
                $order->update(['order_sequence' => $sequence++]);
            }

            return $group->load('orders');
        });
    }

    protected function generateGroupOrderNumber(): string
    {
        $today = now()->format('Ymd');
        $prefix = 'BO2'.$today;

        $last = DB::table('partner_order_groups')
            ->where('group_order_number', 'like', $prefix.'%')
            ->lockForUpdate()
            ->max('group_order_number');

        $next = $last ? ((int) substr($last, -4)) + 1 : 1;

        return $prefix.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Download a design file from a remote URL, convert it to PDF, and store locally.
     * Always saves as .pdf regardless of source format.
     * Returns the storage path (relative to storage/app) or null on failure.
     */
    public function downloadDesignFile(string $url, string $externalOrderId): ?string
    {
        try {
            $response = Http::timeout(30)->get($url);

            if (! $response->successful()) {
                Log::warning('Failed to download design file', [
                    'url' => $url,
                    'external_order_id' => $externalOrderId,
                    'status' => $response->status(),
                ]);

                return null;
            }

            $storagePath = "public/designs/{$externalOrderId}/design.pdf";
            $pdfContent = $this->convertToPdf($response->body(), $url);

            Storage::disk('local')->put($storagePath, $pdfContent);

            // Return the relative path within the public disk (without "public/" prefix)
            // so Storage::disk('public')->url($path) works correctly
            return "designs/{$externalOrderId}/design.pdf";
        } catch (\Exception $e) {
            Log::error('Exception downloading design file', [
                'url' => $url,
                'external_order_id' => $externalOrderId,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Convert raw file content to PDF using dompdf.
     * Images are wrapped in an HTML <img> tag; existing PDFs are returned as-is.
     */
    protected function convertToPdf(string $content, string $url): string
    {
        $extension = strtolower(pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));

        // Already a PDF — return as-is
        if ($extension === 'pdf' || str_starts_with($content, '%PDF')) {
            return $content;
        }

        // For images: embed as base64 in HTML and render via dompdf
        $mime = $this->guessMimeType($extension);
        $base64 = base64_encode($content);
        $html = '<html><body style="margin:0;padding:0;">'
            .'<img src="data:'.$mime.';base64,'.$base64.'" style="max-width:100%;"/>'
            .'</body></html>';

        $options = new Options;
        $options->set('isRemoteEnabled', false);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4');
        $dompdf->render();

        return $dompdf->output();
    }

    protected function guessMimeType(string $extension): string
    {
        return match ($extension) {
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            default => 'application/octet-stream',
        };
    }

    /**
     * Map raw partner approval payload (f_name, d_addr1, etc.) to internal field names.
     * Keeps the controller thin — no field mapping logic in HTTP layer.
     */
    public function mapApprovalData(array $orderData): array
    {
        return [
            'contact_name' => $orderData['f_name'] ?? null,
            'contact_tel' => $orderData['tel'] ?? null,
            'contact_phone' => $orderData['hp'] ?? null,
            'contact_phone2' => $orderData['hp2'] ?? null,
            'contact_email' => $orderData['email'] ?? null,

            'sender_name' => $orderData['f_name'] ?? null,
            'sender_phone' => $orderData['f_tel'] ?? null,
            'sender_zipcode' => $orderData['f_zipcode'] ?? null,
            'sender_address' => $orderData['f_addr'] ?? null,
            'sender_address2' => $orderData['f_addr2'] ?? null,

            'shipping_name' => $orderData['d_name'] ?? null,
            'shipping_phone' => $orderData['d_tel'] ?? null,
            'shipping_phone2' => $orderData['d_hp'] ?? null,
            'shipping_postcode' => $orderData['d_zipcode'] ?? null,
            'shipping_address' => $orderData['d_addr1'] ?? null,
            'shipping_address_detail' => $orderData['d_addr2'] ?? null,
            'shipping_method' => $orderData['d_type_admin'] ?? null,
            'shipping_time' => $orderData['d_time'] ?? null,
        ];
    }

    /**
     * Create a PartnerOrderItem for the given order
     */
    public function createPartnerOrderItem(PartnerOrder $order, array $itemData): PartnerOrderItem
    {
        $orderCode = $this->determineOrderCode($itemData);
        $optionMapping = OrderCodeOptionMapping::where('order_code', $orderCode)->first();

        $sizeSel = $itemData['size_sel'] ?? '';

        $apiRatioCom = (float) ($itemData['api_ratio_com'] ?? 100);
        $sizeRatio = (float) ($itemData['size_ratio'] ?? 100);

        $calculatedPrice = $this->recalculatePrice($itemData, $apiRatioCom, $sizeRatio);

        $finalPrice = $calculatedPrice['price'];
        $quantity = (int) ($itemData['qnt'] ?? 1);
        $totalPrice = $finalPrice * $quantity;

        $configuration = [
            'api_ratio_com' => $apiRatioCom,
            'size_ratio' => $sizeRatio,
            'item' => [
                'item_code' => $itemData['item_code'] ?? '',
                'item_code3' => $itemData['item_code'] ?? '',
                'name3' => $itemData['item_name3'] ?? '',
                'size_sel' => $sizeSel,
                'qnt' => $quantity,
                'amount' => $finalPrice,
                'amount_frontend' => $itemData['amount'] ?? 0,
                'calculated_price' => $calculatedPrice,
                'subject' => $itemData['subject'] ?? '',
                'opt1' => $itemData['opt1'] ?? '',
                'opt2' => $itemData['opt2'] ?? '',
                'opt3' => $itemData['opt3'] ?? '',
                'opt4' => $itemData['opt4'] ?? '',
                'opt5' => $itemData['opt5'] ?? '',
                'opt6' => $itemData['opt6'] ?? '',
                'opt7' => $itemData['opt7'] ?? '',
                'opt8' => $itemData['opt8'] ?? '',
                'size1' => $itemData['size1'] ?? 0,
                'size2' => $itemData['size2'] ?? 0,
                'filename' => $itemData['filename'] ?? '',
            ],
        ];

        if ($optionMapping) {
            $configuration['options'] = $this->mapOptions($optionMapping, $itemData);
        }

        return PartnerOrderItem::create([
            'partner_order_id' => $order->id,
            'title' => $itemData['item_name3'] ?? '',
            'quantity' => $quantity,
            'unit_price' => $finalPrice,
            'total_price' => $totalPrice,
            'configuration' => $configuration,
            'notes' => null,
        ]);
    }

    // ─── Private helpers ────────────────────────────────────────────────────────

    protected function updateExistingOrder(PartnerOrder $order, array $orderData): PartnerOrder
    {
        $order->update([
            'contact_name' => $orderData['f_name'] ?? $order->contact_name,
            'contact_tel' => $orderData['tel'] ?? $order->contact_tel,
            'contact_phone' => $orderData['hp'] ?? $order->contact_phone,
            'contact_phone2' => $orderData['hp2'] ?? $order->contact_phone2,
            'contact_email' => $orderData['email'] ?? $order->contact_email,

            'sender_name' => $orderData['f_name'] ?? $order->sender_name,
            'sender_phone' => $orderData['f_tel'] ?? $order->sender_phone,
            'sender_zipcode' => $orderData['f_zipcode'] ?? $order->sender_zipcode,
            'sender_address' => $orderData['f_addr'] ?? $order->sender_address,
            'sender_address2' => $orderData['f_addr2'] ?? $order->sender_address2,

            'shipping_name' => $orderData['d_name'] ?? $order->shipping_name,
            'shipping_phone' => $orderData['d_tel'] ?? $order->shipping_phone,
            'shipping_phone2' => $orderData['d_hp'] ?? $order->shipping_phone2,
            'shipping_postcode' => $orderData['d_zipcode'] ?? $order->shipping_postcode,
            'shipping_address' => $orderData['d_addr1'] ?? $order->shipping_address,
            'shipping_address_detail' => $orderData['d_addr2'] ?? $order->shipping_address_detail,
            'shipping_method' => $orderData['d_type_admin'] ?? $order->shipping_method,
            'shipping_time' => $orderData['d_time'] ?? $order->shipping_time,

            'metadata' => [
                'order_idx' => $orderData['order_idx'] ?? $order->order_external_number,
            ],
        ]);

        return $order->load('items');
    }

    protected function determineOrderCode(array $itemData): string
    {
        return $itemData['item_code'] ?? '9403';
    }

    protected function deriveOpt7FromSizeSel(string $orderCode, string $sizeSel): string
    {
        if (empty($sizeSel)) {
            return '';
        }

        if ($orderCode >= 9400 && $orderCode <= 9499) {
            return "(실내){$sizeSel}거치대";
        }
        if ($orderCode >= 9500 && $orderCode <= 9599) {
            return "(실외){$sizeSel}거치대";
        }
        if ($orderCode >= 9600 && $orderCode <= 9699) {
            return "(입간판){$sizeSel}거치대";
        }
        if ($orderCode == '9301') {
            return "({$sizeSel})미니배너거치대";
        }

        return "{$sizeSel}거치대";
    }

    protected function recalculatePrice(array $itemData, float $apiRatioCom = 100, float $sizeRatio = 100): array
    {
        $calculator = new PriceCalculator;
        $result = $calculator->calculate($itemData, $apiRatioCom, $sizeRatio);

        return [
            'price_cost' => $result['base']['price_cost'],
            'price_prn' => $result['sale']['price_prn'],
            'price_opt1' => $result['sale']['price_opt1'],
            'price_opt2' => $result['sale']['price_opt2'],
            'price' => $result['sale']['price'],
            'tax' => $result['sale']['tax'],
            'price_prd' => $result['sale']['price_prd'],
            'paper_width' => $result['debug']['paper_width'] ?? '0',
            '_debug' => $result['debug'],
        ];
    }

    protected function mapOptions(OrderCodeOptionMapping $optionMapping, array $itemData): array
    {
        $mappedOptions = [];
        $erpOptionGroups = ErpOptionGroup::whereIn('id', $optionMapping->erp_option_group_ids)
            ->with('erpOptions')
            ->get();

        foreach ($erpOptionGroups as $group) {
            $optionValue = $this->getOptionValueForGroup($group, $itemData);
            if (! $optionValue) {
                continue;
            }

            $availableOptions = $optionMapping->erpOptions()
                ->where('erp_option_group_id', $group->id)
                ->get();

            foreach ($availableOptions as $option) {
                if ($option->value === $optionValue || strpos($option->value, $optionValue) === 0) {
                    $mappedOptions[] = [
                        'group_id' => $group->id,
                        'group_code' => $group->code,
                        'group_name' => $group->label,
                        'option_id' => $option->id,
                        'code' => $option->code,
                        'label' => $option->label,
                        'value' => $option->value,
                        'additional_price' => $option->additional_price,
                    ];
                    break;
                }
            }
        }

        return $mappedOptions;
    }

    protected function getOptionValueForGroup(ErpOptionGroup $group, array $itemData): ?string
    {
        $map = [
            'OP901' => 'opt1',
            'OP902' => 'opt2',
            'OP903' => 'opt3',
            'OP904' => 'opt4',
        ];

        return $itemData[$map[$group->code] ?? ''] ?? null;
    }

    protected function calculateSubtotal(array $orderData): float
    {
        $subtotal = 0;
        foreach ($orderData['items'] ?? [] as $item) {
            $subtotal += $item['amount'] ?? 0;
        }

        return $subtotal;
    }

    protected function calculateTax(array $orderData): float
    {
        return round($this->calculateSubtotal($orderData) * 0.1);
    }

    protected function getShippingFee(array $orderData): float
    {
        return 0;
    }

    protected function calculateTotal(array $orderData): float
    {
        return $this->calculateSubtotal($orderData)
            + $this->calculateTax($orderData)
            + $this->getShippingFee($orderData);
    }

    protected function getProductName(array $orderData): string
    {
        $firstItem = $orderData['items'][0] ?? null;

        return $firstItem ? ($firstItem['item_name3'] ?? 'product') : 'product';
    }

    protected function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'P-'.now()->format('YmdHis').'-'.strtoupper(Str::random(4));
            $exists = DB::table('partner_orders')
                ->where('order_number', $orderNumber)
                ->lockForUpdate()
                ->exists();
        } while ($exists);

        return $orderNumber;
    }
}
