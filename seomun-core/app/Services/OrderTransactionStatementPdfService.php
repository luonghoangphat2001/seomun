<?php

namespace App\Services;

use App\Helpers\DateHelper;
use App\Models\Order;
use App\Models\User;
use Dompdf\Dompdf;
use Dompdf\Options;

class OrderTransactionStatementPdfService
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

        $html = view('pdf.order-transaction-statement', [
            'order'        => $order,
            'summary'      => $this->summary($order),
            'fontPath'     => storage_path('fonts/NanumGothic.ttf'),
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
        $total       = (float) $order->total_amount;
        $supplyPrice = round($total / 1.1, 0);
        $vat         = round($total - $supplyPrice, 0);

        return [
            'currency'        => $order->currency ?? 'KRW',
            'subtotal'        => (float) $order->subtotal_amount,
            'discount'        => (float) $order->discount_amount,
            'point_discount'  => (int) ($order->point_discount ?? 0),
            'shipping_fee'    => (float) $order->shipping_fee,
            'total'           => $total,
            'supply_price'    => $supplyPrice,
            'vat'             => $vat,
            'payment_status'  => $order->payment_status ?? '-',
            'paid_amount'     => in_array($order->payment_status, ['paid', 'partial'])
                ? $total
                : 0.0,
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
