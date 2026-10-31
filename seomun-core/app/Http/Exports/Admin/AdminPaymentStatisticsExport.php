<?php

namespace App\Http\Exports\Admin;

use App\Services\Admin\AdminPaymentService;
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

class AdminPaymentStatisticsExport implements WithMultipleSheets
{
    use Exportable;

    protected array $data = [];

    protected array $filters = [];

    public function __construct(array $dataOrFilters = [])
    {
        if (isset($dataOrFilters['sales_statistics']) || isset($dataOrFilters['payment_status_statistics'])) {
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

        $service = app(AdminPaymentService::class);
        $customerIds = $this->filters['customer_ids'] ?? [];
        if (is_string($customerIds)) {
            $customerIds = array_map('intval', array_filter(array_map('trim', explode(',', $customerIds))));
        }

        $period = $this->filters['period'] ?? 'monthly';
        $startDate = $this->filters['start_date'] ?? null;
        $endDate = $this->filters['end_date'] ?? null;
        $configPeriod = $service->configPeriod($period, $startDate, $endDate);

        $this->data = $service->getPaymentStatistics($customerIds, $configPeriod);

        return $this->data;
    }

    /**
     * Define sheets for Excel export
     */
    public function sheets(): array
    {
        $data = $this->resolveData();

        return [
            new PaymentStatusSheet($data),
            new PaymentMethodSheet($data),
        ];
    }
}

/**
 * Sheet 1: Payment Status Statistics (Successful, Failed, Refunded)
 */
class PaymentStatusSheet implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function collection(): Collection
    {
        $statusStats = $this->data['payment_status_statistics'] ?? [];

        $successful = $statusStats['successful'] ?? ['count' => 0, 'amount' => 0, 'percentage_count' => 0, 'percentage_amount' => 0];
        $failed = $statusStats['failed'] ?? ['count' => 0, 'amount' => 0, 'percentage_count' => 0, 'percentage_amount' => 0];
        $refunded = $statusStats['refunded'] ?? ['count' => 0, 'amount' => 0, 'percentage_count' => 0, 'percentage_amount' => 0];

        $totalCount = $successful['count'] + $failed['count'] + $refunded['count'];
        $totalAmount = $successful['amount'] + $failed['amount'] + $refunded['amount'];

        $rows = [
            [
                'status' => '성공 (Successful)',
                'count' => $successful['count'],
                'percentage_count' => ($successful['percentage_count'] ?? 0) . '%',
                'amount' => number_format($successful['amount'], 2),
                'percentage_amount' => ($successful['percentage_amount'] ?? 0) . '%',
            ],
            [
                'status' => '실패 (Failed)',
                'count' => $failed['count'],
                'percentage_count' => ($failed['percentage_count'] ?? 0) . '%',
                'amount' => number_format($failed['amount'], 2),
                'percentage_amount' => ($failed['percentage_amount'] ?? 0) . '%',
            ],
            [
                'status' => '환불 (Refunded)',
                'count' => $refunded['count'],
                'percentage_count' => ($refunded['percentage_count'] ?? 0) . '%',
                'amount' => number_format($refunded['amount'], 2),
                'percentage_amount' => ($refunded['percentage_amount'] ?? 0) . '%',
            ],
            [
                'status' => '합계 (Total)',
                'count' => $totalCount,
                'percentage_count' => ($totalCount > 0 ? '100%' : '0%'),
                'amount' => number_format($totalAmount, 2),
                'percentage_amount' => ($totalAmount > 0 ? '100%' : '0%'),
            ],
        ];

        return collect($rows);
    }

    public function headings(): array
    {
        return [
            '상태',
            '결제 건수',
            '건수 비율 (%)',
            '결제 금액',
            '금액 비율 (%)',
        ];
    }

    public function map($row): array
    {
        return [
            $row['status'],
            $row['count'],
            $row['percentage_count'],
            $row['amount'],
            $row['percentage_amount'],
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:E1')->getFont()->setBold(true);
        $sheet->getStyle('A1:E1')->getFill()->setFillType(Fill::FILL_SOLID);
        $sheet->getStyle('A1:E1')->getFill()->getStartColor()->setRGB('4a5568');
        $sheet->getStyle('A1:E1')->getFont()->getColor()->setRGB('ffffff');

        // Total row bold
        $sheet->getStyle('A5:E5')->getFont()->setBold(true);
    }

    public function title(): string
    {
        return '결제 상태별 통계';
    }
}

/**
 * Sheet 2: Payment Method Statistics
 */
class PaymentMethodSheet implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function collection(): Collection
    {
        return collect($this->data['sales_statistics'] ?? []);
    }

    public function headings(): array
    {
        return [
            '결제 수단',
            '총 건수',
            '성공 건수',
            '실패 건수',
            '환불 건수',
            '성공 금액',
            '실패 금액',
            '환불 금액',
            '총 금액',
            '성공률 (%)',
            '매출 비중 (%)',
        ];
    }

    public function map($item): array
    {
        $label = $item['payment_method_label'] ?? $item['payment_method'] ?? '-';

        return [
            $label,
            $item['total_count'] ?? 0,
            $item['successful_count'] ?? 0,
            $item['failed_count'] ?? 0,
            $item['refunded_count'] ?? 0,
            number_format($item['successful_amount'] ?? 0, 2),
            number_format($item['failed_amount'] ?? 0, 2),
            number_format($item['refunded_amount'] ?? 0, 2),
            number_format($item['total_amount'] ?? 0, 2),
            ($item['successful_percentage'] ?? 0) . '%',
            ($item['amount_percentage'] ?? 0) . '%',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:K1')->getFont()->setBold(true);
        $sheet->getStyle('A1:K1')->getFill()->setFillType(Fill::FILL_SOLID);
        $sheet->getStyle('A1:K1')->getFill()->getStartColor()->setRGB('4a5568');
        $sheet->getStyle('A1:K1')->getFont()->getColor()->setRGB('ffffff');
    }

    public function title(): string
    {
        return '결제 수단별 통계';
    }
}
