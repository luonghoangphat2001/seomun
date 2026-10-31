<?php

namespace App\Console\Commands;

use App\Enums\ExcelHistoryStatus;
use App\Models\ExportHistory;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CheckStuckExports extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'export:check-stuck {--minutes=30 : Minutes to consider export as stuck}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check and mark stuck export histories as failed';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $minutes = (int) $this->option('minutes');
        $cutoffTime = now()->subMinutes($minutes);

        $stuckExports = ExportHistory::where('status', ExcelHistoryStatus::PROCESSING->value)
            ->where('created_at', '<', $cutoffTime)
            ->get();

        if ($stuckExports->isEmpty()) {
            $this->info('No stuck exports found.');

            return Command::SUCCESS;
        }

        $this->info("Found {$stuckExports->count()} stuck export(s).");

        foreach ($stuckExports as $export) {
            // Check if file exists
            $fileExists = Storage::disk('public')->exists($export->file_path);

            if (! $fileExists) {
                $export->update([
                    'status' => ExcelHistoryStatus::FAILED->value,
                ]);

                $this->warn("Marked export #{$export->id} ({$export->module}) as failed - file not found.");

                \Log::warning('Export marked as failed (stuck check)', [
                    'history_id' => $export->id,
                    'module' => $export->module,
                    'file_path' => $export->file_path,
                    'created_at' => $export->created_at,
                ]);
            } else {
                // File exists but status is still processing - might be a race condition
                // Update to completed
                $export->update([
                    'status' => ExcelHistoryStatus::COMPLETED->value,
                ]);

                $this->info("Marked export #{$export->id} ({$export->module}) as completed - file found.");
            }
        }

        return Command::SUCCESS;
    }
}
