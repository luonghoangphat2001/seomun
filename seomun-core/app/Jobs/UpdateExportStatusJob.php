<?php

namespace App\Jobs;

use App\Enums\ExcelHistoryStatus;
use App\Models\ExportHistory;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;

class UpdateExportStatusJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public ExportHistory $history) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Check if file actually exists before marking as completed
        $fileExists = Storage::disk('public')->exists($this->history->file_path);

        if ($fileExists) {
            $this->history->update([
                'status' => ExcelHistoryStatus::COMPLETED->value,
            ]);
        } else {
            // File doesn't exist, mark as failed
            $this->history->update([
                'status' => ExcelHistoryStatus::FAILED->value,
            ]);

            \Log::error('Export file not found', [
                'history_id' => $this->history->id,
                'file_path' => $this->history->file_path,
                'module' => $this->history->module,
            ]);
        }
    }
}
