<?php

namespace App\Jobs;

use App\Models\PartnerOrder;
use App\Services\WebhookOrder\WebhookOrderService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DownloadDesignFileJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 120;

    public function __construct(
        public readonly string $fileUrl,
        public readonly string $externalOrderId,
    ) {}

    public function handle(WebhookOrderService $service): void
    {
        $localPath = $service->downloadDesignFile($this->fileUrl, $this->externalOrderId);

        if (! $localPath) {
            \Log::warning('DownloadDesignFileJob: download returned null', [
                'url' => $this->fileUrl,
                'external_order_id' => $this->externalOrderId,
            ]);

            return;
        }

        $updated = PartnerOrder::where('order_external_number', $this->externalOrderId)
            ->update(['design_file_local' => $localPath]);

        if (! $updated) {
            \Log::warning('DownloadDesignFileJob: order not found', [
                'external_order_id' => $this->externalOrderId,
            ]);

            return;
        }

        \Log::info('DownloadDesignFileJob: completed', [
            'external_order_id' => $this->externalOrderId,
            'local_path' => $localPath,
        ]);
    }

    public function failed(\Throwable $e): void
    {
        \Log::error('DownloadDesignFileJob: failed after all retries', [
            'url' => $this->fileUrl,
            'external_order_id' => $this->externalOrderId,
            'error' => $e->getMessage(),
        ]);
    }
}
