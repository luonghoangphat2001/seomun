<?php

namespace App\Exports\Admin;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithTitle;

class SummarySheet implements FromCollection, WithTitle
{
    public function __construct(
        protected array $summary = [],
        protected array $ratios = [],
    ) {}

    public function collection(): Collection
    {
        $rows = [];

        // Orders Summary
        $rows[] = ['Metric', 'Current Period', 'Change (%)'];
        if (! empty($this->summary)) {
            $rows[] = ['Total Orders', $this->summary['orders']['current'] ?? 0, $this->summary['orders']['change'] ?? 0];
            $rows[] = ['Total Sales', $this->summary['sales']['current'] ?? 0, $this->summary['sales']['change'] ?? 0];
            $rows[] = ['Cancellations/Returns', $this->summary['cancellations_returns']['current'] ?? 0, $this->summary['cancellations_returns']['change'] ?? 0];
        }
        $rows[] = ['', '', '']; // Empty row

        // Order Status Ratios
        $rows[] = ['Order Status', 'Percentage (%)'];
        if (! empty($this->ratios)) {
            foreach ($this->ratios as $status => $percentage) {
                $rows[] = [$status, $percentage];
            }
        }

        return collect($rows);
    }

    public function headings(): array
    {
        return [
            '주문 통계 요약', // Summary Order Statistics
        ];
    }

    public function title(): string
    {
        return 'Summary Order Statics';
    }
}
