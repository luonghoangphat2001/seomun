<?php

namespace App\Services\Admin;

use App\Enums\ExcelHistoryStatus;
use App\Jobs\UpdateExportStatusJob;
use App\Models\ExportHistory;
use Maatwebsite\Excel\Facades\Excel;

class AdminExportHistoryService
{
    /**
     * Process execute excel
     */
    public function executeExcel(string $exportClass, array $filters, int $user_id, string $basePath = 'exports', string $baseName = 'export'): ExportHistory
    {
        $fileName = $baseName . '_' . now()->format('Y-m-d_H-i-s') . '.xlsx';
        $filePath = $basePath . '/' . $fileName;

        $history = $this->create($user_id, $baseName, $fileName, $filePath, ExcelHistoryStatus::PROCESSING->value, $filters);

        Excel::queue(new $exportClass($filters), $filePath, 'public')
            ->allOnQueue('export')
            ->chain([
                (new UpdateExportStatusJob($history))->onQueue('export'),
            ]);

        return $history;
    }

    public function getHistory(int $id): ExportHistory
    {
        return ExportHistory::findOrFail($id);
    }

    /**
     * Create new export history
     */
    public function create(int $user_id, string $module, string $fileName, string $filePath, string $status, array $filters = []): ExportHistory
    {
        return ExportHistory::create([
            'user_id' => $user_id,
            'module' => $module,
            'file_name' => $fileName,
            'file_path' => $filePath,
            'status' => $status,
            'filters' => $filters,
        ]);
    }
}
