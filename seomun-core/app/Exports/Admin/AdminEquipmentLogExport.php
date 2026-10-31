<?php

namespace App\Exports\Admin;

use App\Models\EquipmentLog;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AdminEquipmentLogExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable;

    public function __construct(protected array $filters = []) {}

    public function query()
    {
        $equipmentId = Arr::get($this->filters, 'equipment_id');

        return EquipmentLog::where('equipment_id', $equipmentId)
            ->orderBy('log_date', 'desc');
    }

    public function map($log): array
    {
        return [
            $log->id,
            $log->log_date ? $log->log_date->format('Y-m-d') : 'N/A',
            $log->maintenance_details,
            $log->special_notes,
            $log->cost_type,
            $log->manager,
            $log->created_at->format('Y-m-d H:i:s'),
        ];
    }

    public function headings(): array
    {
        return [
            'ID',
            '작업 일자',
            '보수 내역',
            '특이 사항',
            '비용 유형',
            '담당자',
            '등록 일시',
        ];
    }
}
