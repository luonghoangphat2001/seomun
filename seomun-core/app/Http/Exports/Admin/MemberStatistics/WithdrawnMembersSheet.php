<?php

namespace App\Http\Exports\Admin\MemberStatistics;

use App\Services\Admin\AdminMemberStatisticsService;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class WithdrawnMembersSheet implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithTitle
{
    protected AdminMemberStatisticsService $adminMemberStatisticsService;

    protected array $filters;

    public function __construct(
        AdminMemberStatisticsService $adminMemberStatisticsService,
        array $filters
    ) {
        $this->adminMemberStatisticsService = $adminMemberStatisticsService;
        $this->filters = $filters;
    }

    public function collection()
    {
        $data = $this->adminMemberStatisticsService->getWithdrawnMembersByPeriod($this->filters);

        return collect($data);
    }

    public function headings(): array
    {
        return [
            '고객 ID',             // Customer ID
            '고객명',              // Customer Name
            '일자',                // Date
            '탈퇴 회원 수',        // Withdrawn Members Count
        ];
    }

    public function map($item): array
    {
        return [
            $item['customer_id'],
            $item['customer_name'],
            $item['date'],
            $item['count'],
        ];
    }

    public function title(): string
    {
        return 'Withdrawn Members';
    }
}
