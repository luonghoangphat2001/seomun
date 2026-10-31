<?php

namespace App\Exports\Admin;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithTitle;

class OrderSaleStaticsExport implements FromCollection, WithTitle
{
    protected $sales_product = [];

    protected $sales_customer = [];

    protected $sales_category = [];

    public function __construct(
        protected array $data = [],
    ) {
        $this->sales_product = $data['product'] ?? [];
        $this->sales_customer = $data['users'] ?? [];
        $this->sales_category = $data['category'] ?? [];
    }

    public function collection(): Collection
    {
        $rows = [];

        // Sale products statics
        $rows[] = ['Product ID', 'Product Name', 'Total Quantity', 'Total Amount'];
        if (! empty($this->sales_product)) {
            foreach ($this->sales_product as $product) {
                $rows[] = [$product['id'], $product['name'], $product['total_quantity'] ?? 0, $product['total_amount'] ?? 0];
            }
        }
        $rows[] = ['', '', ''];

        // Sale category statics
        $rows[] = ['Category ID', 'Category Name', 'Total Quantity', 'Total Amount'];
        if (! empty($this->sales_category)) {
            foreach ($this->sales_category as $category) {
                $rows[] = [$category['id'], $category['name'], $category['total_quantity'] ?? 0, $category['total_amount'] ?? 0];
            }
        }
        $rows[] = ['', '', ''];

        // Sale customer statics
        $rows[] = ['Customer ID', 'Customer Name', 'Total Quantity', 'Total Amount'];
        if (! empty($this->sales_customer)) {
            foreach ($this->sales_customer as $customer) {
                $rows[] = [$customer['id'], $customer['name'], $customer['total_quantity'] ?? 0, $customer['total_amount'] ?? 0];
            }
        }
        $rows[] = ['', '', ''];

        return collect($rows);
    }

    public function headings(): array
    {
        return [
            '주문 매출 통계', // Order Sales Statistics
        ];
    }

    public function title(): string
    {
        return 'Order Sales Statics';
    }
}
