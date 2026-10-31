<?php

namespace App\Http\Exports\Admin;

use App\Services\Admin\AdminTaskLogService;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Spatie\Activitylog\Models\Activity;

class AdminTaskLogExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable;

    public function __construct(protected array $filters = []) {}

    public function query()
    {
        $query = Activity::query()->with(['causer', 'subject']);

        // Apply filters similar to AdminTaskLogService::getTaskLogs
        $menu = Arr::get($this->filters, 'menu');
        if ($menu) {
            $query->where('log_name', $menu);
        }

        $workerName = Arr::get($this->filters, 'worker_name');
        if ($workerName) {
            $query->where('causer_type', 'App\Models\User')
                ->whereHas('causer', function ($q) use ($workerName) {
                    $q->where(function ($inner) use ($workerName) {
                        $inner->where('name', 'like', '%' . $workerName . '%')
                            ->orWhere('username', 'like', '%' . $workerName . '%')
                            ->orWhere('email', 'like', '%' . $workerName . '%');
                    });
                });
        }

        $taskType = Arr::get($this->filters, 'task_type');
        if ($taskType) {
            $query->where('event', $taskType);
        }

        $dateFrom = Arr::get($this->filters, 'date_from');
        $dateTo = Arr::get($this->filters, 'date_to');
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $subjectType = Arr::get($this->filters, 'subject_type');
        if ($subjectType) {
            $query->where('subject_type', $subjectType);
        }

        $query->orderBy('created_at', 'desc');

        return $query;
    }

    public function map($activity): array
    {
        $service = app(AdminTaskLogService::class);
        $parsed = $service->parseActivityProperties($activity);

        $taskTypeLabel = match ($activity->event) {
            'created' => 'Register',
            'updated' => 'Modify',
            'deleted' => 'Delete',
            'approved' => 'Approval',
            default => ucfirst($activity->event ?? 'Unknown'),
        };

        $workerName = $activity->causer
            ? ($activity->causer->name ?? $activity->causer->username ?? $activity->causer->email ?? 'N/A')
            : 'System';

        $targetMenu = $activity->subject_type ? class_basename($activity->subject_type) : 'N/A';
        $dataIdentifier = $activity->subject_id ?? 'N/A';

        // Format before/after values as JSON strings for Excel
        $beforeValues = ! empty($parsed['before']) ? json_encode($parsed['before'], JSON_UNESCAPED_UNICODE) : '';
        $afterValues = ! empty($parsed['after']) ? json_encode($parsed['after'], JSON_UNESCAPED_UNICODE) : '';

        return [
            $activity->id,
            $activity->log_name ?? 'System',
            $taskTypeLabel,
            $workerName,
            $targetMenu,
            $dataIdentifier,
            $beforeValues,
            $afterValues,
            $activity->description,
            $activity->created_at->format('Y-m-d H:i:s'),
        ];
    }

    public function headings(): array
    {
        return [
            'ID',               // ID
            '메뉴',             // Menu
            '작업 유형',         // Task Type
            '작업자',           // Worker
            '대상 메뉴',         // Target Menu
            '데이터 식별자',     // Data Identifier
            '변경 전 값',        // Before Values
            '변경 후 값',        // After Values
            '설명',             // Description
            '생성 일시',         // Created At
        ];
    }
}
