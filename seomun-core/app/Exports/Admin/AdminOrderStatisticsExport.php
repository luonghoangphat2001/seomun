<?php

namespace App\Exports\Admin;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class AdminOrderStatisticsExport implements WithMultipleSheets
{
    protected $summary = [];

    protected $ratios = [];

    protected $sales = [];

    public function __construct(
        protected array $data = []
    ) {
        $this->summary = $data['summary'] ?? [];
        $this->ratios = $data['ratios_order_status'] ?? [];
        $this->sales = $data['sales_analytics'] ?? [];
    }

    /**
     * Set multiple sheet
     */
    public function sheets(): array
    {
        return [
            new SummarySheet($this->summary, $this->ratios),
            new OrderSaleStaticsExport($this->sales),
        ];
    }
}
