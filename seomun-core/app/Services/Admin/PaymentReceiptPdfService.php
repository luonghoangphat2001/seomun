<?php

namespace App\Services\Admin;

use App\Models\PaymentTransaction;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\Storage;

class PaymentReceiptPdfService
{
    private string $disk = 'public';
    private string $dir  = 'payment-receipts';

    public function generate(int $transactionId): string
    {
        $transaction = PaymentTransaction::with(['order.items.product', 'order.user.customer'])
            ->findOrFail($transactionId);

        $order    = $transaction->order;
        $customer = $order?->user?->customer;

        $items = ($order?->items ?? collect())->map(fn ($item) => [
            'product_name' => $item->product?->name ?? $item->product_name ?? '-',
            'quantity'     => $item->quantity,
            'price'        => $item->price,
        ])->toArray();

        $html = view('admin.pdf.payment-receipt', [
            'transaction'  => $transaction,
            'order'        => $order,
            'customer'     => $customer,
            'items'        => $items,
            'fontPath'     => storage_path('fonts/NanumGothic.ttf'),
            'fontPathBold' => storage_path('fonts/NanumGothic-Bold.ttf'),
        ])->render();

        $pdf = $this->renderPdf($html);

        $filename = $this->dir . '/receipt-' . ($order?->order_number ?? $transactionId) . '-' . now()->format('Ymd_His') . '.pdf';
        Storage::disk($this->disk)->put($filename, $pdf);

        return url(Storage::disk($this->disk)->url($filename));
    }

    private function renderPdf(string $html): string
    {
        $options = new Options();
        $options->set('defaultFont', 'NanumGothic');
        $options->set('isRemoteEnabled', true);
        $options->setChroot('/');
        $options->set('fontDir', storage_path('fonts'));
        $options->set('fontCache', storage_path('fonts'));

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return $dompdf->output();
    }
}
