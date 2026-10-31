<?php

namespace App\Http\Exports\Admin;

use App\Services\Admin\AdminInquiryStatisticsService;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AdminInquiryStatisticsExport implements WithMultipleSheets
{
    use Exportable;

    protected array $data = [];

    protected array $filters = [];

    public function __construct(array $dataOrFilters = [])
    {
        if (isset($dataOrFilters['summary']) || isset($dataOrFilters['total_inquiries'])) {
            $this->data = $dataOrFilters;
        } else {
            $this->filters = $dataOrFilters;
        }
    }

    /**
     * Resolve statistics data (either pre-passed or fetched from service)
     */
    protected function resolveData(): array
    {
        if (! empty($this->data)) {
            return $this->data;
        }

        $service = app(AdminInquiryStatisticsService::class);
        $customerIds = $this->filters['customer_ids'] ?? [];
        if (is_string($customerIds)) {
            $customerIds = array_map('intval', array_filter(array_map('trim', explode(',', $customerIds))));
        }

        $config = [];
        if (isset($this->filters['start_date']) && isset($this->filters['end_date'])) {
            $config['start_date'] = $this->filters['start_date'];
            $config['end_date'] = $this->filters['end_date'];
        } else {
            $period = $this->filters['period'] ?? '30d';
            $config = $service->periodConfig($period);
        }

        $this->data = $service->getInquiryStatistics($customerIds, $config);

        return $this->data;
    }

    /**
     * Define sheets for Excel export
     */
    public function sheets(): array
    {
        $data = $this->resolveData();

        return [
            new InquirySummarySheet($data),
            new InquiryPersonInChargeSheet($data),
        ];
    }
}

/**
 * Sheet 1: Inquiry Summary & Status Breakdown
 */
class InquirySummarySheet implements FromCollection, ShouldAutoSize, WithStyles, WithTitle
{
    protected array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function collection(): Collection
    {
        $rows = [];
        $summary = $this->data['summary'] ?? [];
        $totalInquiries = $this->data['total_inquiries'] ?? 0;
        $byStatus = $this->data['by_processing_status'] ?? [];
        $byType = $this->data['by_inquiry_type'] ?? [];

        // 1. KPI Summary
        $rows[] = ['구분', '항목', '값', '단위', '설명'];
        $rows[] = ['요약 지표', '총 문의 수', $totalInquiries, '건', '해당 기간 접수된 총 문의'];
        $rows[] = ['요약 지표', '해결률', $summary['resolution_rate']['value'] ?? 0, '%', '목표: 95%'];
        $rows[] = ['요약 지표', '평균 처리 시간', $summary['avg_processing_time']['value'] ?? 0, '시간', '응답 속도'];
        $rows[] = ['요약 지표', '답변대기/미배정', $summary['unassigned']['value'] ?? 0, '건', '조치 필요'];

        // Blank separator
        $rows[] = ['', '', '', '', ''];

        // 2. By Processing Status
        $rows[] = ['상태별 문의 현황', '처리 상태', '건수', '비율 (%)', ''];
        foreach ($byStatus as $item) {
            $count = $item['count'] ?? 0;
            $ratio = $totalInquiries > 0 ? round(($count / $totalInquiries) * 100, 1) : 0;
            $rows[] = ['상태별', $item['label'] ?? $item['status'], $count, $ratio . '%', ''];
        }

        // Blank separator
        $rows[] = ['', '', '', '', ''];

        // 3. By Inquiry Type
        $rows[] = ['유형별 문의 현황', '문의 유형', '건수', '비율 (%)', ''];
        foreach ($byType as $item) {
            $count = $item['count'] ?? 0;
            $ratio = $totalInquiries > 0 ? round(($count / $totalInquiries) * 100, 1) : 0;
            $rows[] = ['유형별', $item['label'] ?? $item['type'], $count, $ratio . '%', ''];
        }

        return collect($rows);
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:E1')->getFont()->setBold(true);
        $sheet->getStyle('A1:E1')->getFill()->setFillType(Fill::FILL_SOLID);
        $sheet->getStyle('A1:E1')->getFill()->getStartColor()->setRGB('4a5568');
        $sheet->getStyle('A1:E1')->getFont()->getColor()->setRGB('ffffff');

        // Style section headers
        $sheet->getStyle('A7:E7')->getFont()->setBold(true);
        $sheet->getStyle('A7:E7')->getFill()->setFillType(Fill::FILL_SOLID);
        $sheet->getStyle('A7:E7')->getFill()->getStartColor()->setRGB('4a5568');
        $sheet->getStyle('A7:E7')->getFont()->getColor()->setRGB('ffffff');
    }

    public function title(): string
    {
        return '문의 통계 요약';
    }
}

/**
 * Sheet 2: Inquiries by Person in Charge
 */
class InquiryPersonInChargeSheet implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function collection(): Collection
    {
        return collect($this->data['by_person_in_charge'] ?? []);
    }

    public function headings(): array
    {
        return [
            '담당자 ID',
            '담당자명',
            '이메일',
            '처리 건수',
            '평균 처리 시간 (시간)',
        ];
    }

    public function map($item): array
    {
        $person = $item['person_in_charge'] ?? [];

        return [
            $person['id'] ?? '-',
            $person['name'] ?? '미배정',
            $person['email'] ?? '-',
            $item['cases_processed'] ?? 0,
            $item['avg_processing_time'] ?? 0,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:E1')->getFont()->setBold(true);
        $sheet->getStyle('A1:E1')->getFill()->setFillType(Fill::FILL_SOLID);
        $sheet->getStyle('A1:E1')->getFill()->getStartColor()->setRGB('4a5568');
        $sheet->getStyle('A1:E1')->getFont()->getColor()->setRGB('ffffff');
    }

    public function title(): string
    {
        return '담당자별 처리 현황';
    }
}
