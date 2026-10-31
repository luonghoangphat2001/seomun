<?php

namespace App\Services\Admin;

use App\Models\Order;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\Storage;

class WorkInstructionPdfService
{
    private string $disk = 'public';
    private string $dir = 'work-instructions';

    public function generateForOrder(int $orderId): string
    {
        $order = Order::with(['items.product', 'user'])->findOrFail($orderId);

        $html = view('admin.pdf.work-instruction', [
            'orders'   => collect([$order]),
            'fontPath'     => storage_path('fonts/NanumGothic.ttf'),
            'fontPathBold' => storage_path('fonts/NanumGothic-Bold.ttf'),
        ])->render();
        $pdf = $this->renderPdf($html);

        $filename = $this->dir . '/work-instruction-' . $order->order_number . '-' . now()->format('Ymd_His') . '.pdf';
        Storage::disk($this->disk)->put($filename, $pdf);

        return url(Storage::disk($this->disk)->url($filename));
    }

    public function generateBatch(array $orderIds): string
    {
        $orders = Order::with(['items.product', 'user'])
            ->whereIn('id', $orderIds)
            ->get();

        $html = view('admin.pdf.work-instruction', [
            'orders'   => $orders,
            'fontPath'     => storage_path('fonts/NanumGothic.ttf'),
            'fontPathBold' => storage_path('fonts/NanumGothic-Bold.ttf'),
        ])->render();
        $pdf = $this->renderPdf($html);

        $filename = $this->dir . '/work-instructions-batch-' . now()->format('Ymd_His') . '.pdf';
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
