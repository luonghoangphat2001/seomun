<?php

namespace App\Services;

use App\Helpers\DateHelper;
use App\Models\Order;
use App\Models\User;
use Dompdf\Dompdf;
use Dompdf\Options;

class OrderQuotationPdfService
{
    public function __construct(
        protected CompanySettingsService $companySettingsService
    ) {}

    public function getOrder(User $user, string $orderNumber): Order
    {
        $order = Order::with(['items'])
            ->where('user_id', $user->id)
            ->where('order_number', $orderNumber)
            ->first();

        if (! $order) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('주문을 찾을 수 없습니다.');
        }

        return $order;
    }

    public function render(Order $order): string
    {
        $companySetting = $this->companySettingsService->getSettings();

        $html = view('pdf.order-quotation', [
            'order' => $order,
            'summary' => $this->summary($order),
            'fontPath' => storage_path('fonts/NanumGothic.ttf'),
            'fontPathBold' => storage_path('fonts/NanumGothic-Bold.ttf'),
            'issuedAt' => DateHelper::toKorea(
             $order->placed_at),
            'companySetting' => $companySetting,
            'stampDataUri' => $this->companySettingsService->getStampDataUri(),
        ])->render();

        return $this->renderPdf($html);
    }

    /**
     * @return array<string, float|int|string|null>
     */
    private function summary(Order $order): array
    {
        $lineItemsTotal = $order->items->sum(fn ($item) => (float) $item->total_price);

        return [
            'currency' => $order->currency ?? 'KRW',
            'line_items_total' => $lineItemsTotal,
            'subtotal' => (float) $order->subtotal_amount,
            'discount' => (float) $order->discount_amount,
            'point_discount' => (int) ($order->point_discount ?? 0),
            'shipping_fee' => (float) $order->shipping_fee,
            'tax' => (float) $order->tax_amount,
            'total' => (float) $order->total_amount,
            'estimated_production_days' => (int) ($order->estimated_production_days ?? 0),
        ];
    }

    private function renderPdf(string $html): string
    {
        $options = new Options;
        $options->set('defaultFont', 'NanumGothic');
        $options->set('fontDir', storage_path('fonts'));
        $options->set('fontCache', storage_path('fonts'));
        $options->setChroot('/');

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return (string) $dompdf->output();
    }
}
