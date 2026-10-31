<?php

namespace App\Http\Exports\Admin;

use App\Services\Admin\AdminProductStatisticsService;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithTitle;

class AdminProductStatisticsExport implements WithMultipleSheets
{
    use Exportable;

    protected array $filters;

    protected AdminProductStatisticsService $adminProductStatisticsService;

    protected string $locale;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
        $this->adminProductStatisticsService = app(AdminProductStatisticsService::class);
        $this->locale = Arr::get($filters, 'locale', 'en');
    }

    public function sheets(): array
    {
        return [
            new SalesVolumeSheet($this->adminProductStatisticsService, $this->filters, $this->locale),
            new TopNSalesSheet($this->adminProductStatisticsService, $this->filters, $this->locale),
            new PromotedProductsCTRSpec($this->adminProductStatisticsService, $this->filters, $this->locale),
            new StatisticsByStatusSheet($this->adminProductStatisticsService, $this->filters, $this->locale),
        ];
    }
}

/**
 * Sales Volume Sheet
 */
class SalesVolumeSheet implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithTitle
{
    protected AdminProductStatisticsService $adminProductStatisticsService;

    protected array $filters;

    protected string $locale;

    public function __construct(
        AdminProductStatisticsService $adminProductStatisticsService,
        array $filters,
        string $locale
    ) {
        $this->adminProductStatisticsService = $adminProductStatisticsService;
        $this->filters = $filters;
        $this->locale = $locale;
    }

    public function collection()
    {
        $data = $this->adminProductStatisticsService->getSalesVolumeByProduct($this->filters);

        return collect($data);
    }

    public function headings(): array
    {
        return [
            '상품 ID',             // Product ID
            '상품명',              // Product Name
            '상태',                // Status
            '총 판매 수량',        // Total Quantity Sold
            '총 매출액',           // Total Revenue
        ];
    }

    public function map($item): array
    {
        return [
            $item['product_id'],
            $this->getProductName($item),
            $this->getStatusLabel($item['is_active']),
            $item['total_quantity'],
            number_format($item['total_revenue'], 2),
        ];
    }

    public function title(): string
    {
        return 'Sales Volume';
    }

    protected function getProductName($item): string
    {
        return match ($this->locale) {
            'ko' => $item['name'] ?? '',
            'en' => $item['name_en'] ?? $item['name'] ?? '',
            'ja' => $item['name_ja'] ?? $item['name'] ?? '',
            default => $item['name'] ?? '',
        };
    }

    protected function getStatusLabel($isActive): string
    {
        $labels = [
            'en' => [true => 'Sold', false => 'Hidden'],
            'ko' => [true => '판매중', false => '숨김'],
            'ja' => [true => '販売中', false => '非表示'],
        ];

        return $labels[$this->locale][$isActive] ?? ($isActive ? 'Sold' : 'Hidden');
    }
}

/**
 * Top N Sales Sheet
 */
class TopNSalesSheet implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithTitle
{
    protected AdminProductStatisticsService $adminProductStatisticsService;

    protected array $filters;

    protected string $locale;

    public function __construct(
        AdminProductStatisticsService $adminProductStatisticsService,
        array $filters,
        string $locale
    ) {
        $this->adminProductStatisticsService = $adminProductStatisticsService;
        $this->filters = $filters;
        $this->locale = $locale;
    }

    public function collection()
    {
        $limit = Arr::get($this->filters, 'limit', 10);
        $data = $this->adminProductStatisticsService->getTopNSalesProducts($limit, $this->filters);

        return collect($data);
    }

    public function headings(): array
    {
        return [
            '순위',                // Rank
            '상품 ID',             // Product ID
            '상품명',              // Product Name
            '상태',                // Status
            '총 판매 수량',        // Total Quantity Sold
            '총 매출액',           // Total Revenue
        ];
    }

    public function map($item): array
    {
        return [
            $item['rank'],
            $item['product_id'],
            $this->getProductName($item),
            $this->getStatusLabel($item['is_active']),
            $item['total_quantity'],
            number_format($item['total_revenue'], 2),
        ];
    }

    public function title(): string
    {
        return 'Top N Products';
    }

    protected function getProductName($item): string
    {
        return match ($this->locale) {
            'ko' => $item['name'] ?? '',
            'en' => $item['name_en'] ?? $item['name'] ?? '',
            'ja' => $item['name_ja'] ?? $item['name'] ?? '',
            default => $item['name'] ?? '',
        };
    }

    protected function getStatusLabel($isActive): string
    {
        $labels = [
            'en' => [true => 'Sold', false => 'Hidden'],
            'ko' => [true => '판매중', false => '숨김'],
            'ja' => [true => '販売中', false => '非表示'],
        ];

        return $labels[$this->locale][$isActive] ?? ($isActive ? 'Sold' : 'Hidden');
    }
}

/**
 * Promoted Products CTR Sheet
 */
class PromotedProductsCTRSpec implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithTitle
{
    protected AdminProductStatisticsService $adminProductStatisticsService;

    protected array $filters;

    protected string $locale;

    public function __construct(
        AdminProductStatisticsService $adminProductStatisticsService,
        array $filters,
        string $locale
    ) {
        $this->adminProductStatisticsService = $adminProductStatisticsService;
        $this->filters = $filters;
        $this->locale = $locale;
    }

    public function collection()
    {
        $data = $this->adminProductStatisticsService->getPromotedProductsCTR($this->filters);

        return collect($data);
    }

    public function headings(): array
    {
        return [
            '상품 ID',             // Product ID
            '상품명',              // Product Name
            '상태',                // Status
            '조회수',              // View Count
            '노출수',              // Exposure Count (Impressions)
            '클릭수',              // Click Count
            '클릭률 (%)',           // CTR (%)
        ];
    }

    public function map($item): array
    {
        return [
            $item['product_id'],
            $this->getProductName($item),
            $this->getStatusLabel($item['is_active']),
            $item['view_count'],
            $item['exposure_count'],
            $item['click_count'],
            number_format($item['ctr'], 2),
        ];
    }

    public function title(): string
    {
        return 'Promoted Products CTR';
    }

    protected function getProductName($item): string
    {
        return match ($this->locale) {
            'ko' => $item['name'] ?? '',
            'en' => $item['name_en'] ?? $item['name'] ?? '',
            'ja' => $item['name_ja'] ?? $item['name'] ?? '',
            default => $item['name'] ?? '',
        };
    }

    protected function getStatusLabel($isActive): string
    {
        $labels = [
            'en' => [true => 'Sold', false => 'Hidden'],
            'ko' => [true => '판매중', false => '숨김'],
            'ja' => [true => '販売中', false => '非表示'],
        ];

        return $labels[$this->locale][$isActive] ?? ($isActive ? 'Sold' : 'Hidden');
    }
}

/**
 * Statistics by Status Sheet
 */
class StatisticsByStatusSheet implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithTitle
{
    protected AdminProductStatisticsService $adminProductStatisticsService;

    protected array $filters;

    protected string $locale;

    public function __construct(
        AdminProductStatisticsService $adminProductStatisticsService,
        array $filters,
        string $locale
    ) {
        $this->adminProductStatisticsService = $adminProductStatisticsService;
        $this->filters = $filters;
        $this->locale = $locale;
    }

    public function collection()
    {
        $data = $this->adminProductStatisticsService->getStatisticsByStatus($this->filters);

        $rows = [];
        foreach ($data as $status => $stats) {
            $rows[] = [
                'status' => $status,
                'product_count' => $stats['product_count'],
                'total_quantity' => $stats['total_quantity'],
                'total_revenue' => $stats['total_revenue'],
                'avg_price' => $stats['avg_price'],
            ];
        }

        return collect($rows);
    }

    public function headings(): array
    {
        return [
            '상태',                // Status
            '상품 수',              // Number of Products
            '총 판매 수량',        // Total Quantity Sold
            '총 매출액',           // Total Revenue
            '평균 가격',           // Average Price
        ];
    }

    public function map($item): array
    {
        return [
            $this->getStatusLabel($item['status']),
            $item['product_count'],
            $item['total_quantity'],
            number_format($item['total_revenue'], 2),
            number_format($item['avg_price'], 2),
        ];
    }

    public function title(): string
    {
        return 'Statistics by Status';
    }

    protected function getStatusLabel($status): string
    {
        $labels = [
            'en' => ['sold' => 'Sold', 'hidden' => 'Hidden'],
            'ko' => ['sold' => '판매중', 'hidden' => '숨김'],
            'ja' => ['sold' => '販売中', 'hidden' => '非表示'],
        ];

        return $labels[$this->locale][$status] ?? $status;
    }
}
