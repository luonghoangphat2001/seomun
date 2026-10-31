<?php

namespace App\Http\Exports\Admin;

use App\Helpers\ExportLocaleHelper;
use App\Models\Product;
use App\Services\Admin\AdminProductService;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class AdminProductExport implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    use Exportable;

    protected array $filters;

    protected AdminProductService $adminProductService;

    protected string $locale;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
        $this->adminProductService = app(AdminProductService::class);
        $this->locale = Arr::get($filters, 'locale', 'en');
    }

    public function collection()
    {
        $exportType = Arr::get($this->filters, 'export_type', 'ALL');

        // Build base query with filters
        $reflection = new \ReflectionClass($this->adminProductService);
        $buildQueryMethod = $reflection->getMethod('buildQuery');
        $buildQueryMethod->setAccessible(true);

        $query = $buildQueryMethod->invoke($this->adminProductService, $this->filters);

        // Apply export type logic
        switch ($exportType) {
            case 'ALL':
                // Export all products matching filters
                $query->with($this->getRelationships());
                break;

            case 'CURRENT_PAGE':
                // Export only current page
                $currentPage = Arr::get($this->filters, 'current_page', 1);
                $perPage = Arr::get($this->filters, 'per_page', 20);
                $query->with($this->getRelationships());
                // Use offset/limit for current page
                $query->offset(($currentPage - 1) * $perPage)->limit($perPage);
                break;

            case 'SELECTED':
                // Export only selected products
                $selectedIds = Arr::get($this->filters, 'selected_ids', []);
                if (empty($selectedIds)) {
                    return collect([]);
                }
                $query->whereIn('id', $selectedIds);
                $query->with($this->getRelationships());
                break;

            default:
                throw new \InvalidArgumentException("Invalid export_type: {$exportType}");
        }

        // Apply sorting
        $sortBy = Arr::get($this->filters, 'sort_by', 'created_at');
        $sortOrder = Arr::get($this->filters, 'sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        return $query->get();
    }

    protected function getRelationships(): array
    {
        return ['category', 'pricingProfile'];
    }

    public function map($product): array
    {
        $locale = $this->locale;

        // Get product name based on locale
        $productName = match ($locale) {
            'ko' => $product->name ?? '',
            'en' => $product->name_en ?? $product->name ?? '',
            'ja' => $product->name_ja ?? $product->name ?? '',
            default => $product->name ?? $product->name ?? '',
        };

        // Format status based on locale
        $statusLabels = [
            'en' => ['Sold', 'Hidden'],
            'ko' => ['판매중', '숨김'],
            'ja' => ['販売中', '非表示'],
        ];
        $status = $product->is_active
            ? ($statusLabels[$locale][0] ?? 'Sold')
            : ($statusLabels[$locale][1] ?? 'Hidden');

        // Format promotional
        $promoLabels = [
            'en' => ['Yes', 'No'],
            'ko' => ['예', '아니오'],
            'ja' => ['はい', 'いいえ'],
        ];
        $promotional = ($product->is_promotional ?? false)
            ? ($promoLabels[$locale][0] ?? 'Yes')
            : ($promoLabels[$locale][1] ?? 'No');

        // Format is_public
        $isPublicLabels = [
            'en' => ['Public', 'Private'],
            'ko' => ['공개', '비공개'],
            'ja' => ['公開', '非公開'],
        ];
        $isPublic = $product->is_active
            ? ($isPublicLabels[$locale][0] ?? 'Public')
            : ($isPublicLabels[$locale][1] ?? 'Private');

        // Format has_quotation
        $hasQuotation = $product->pricingProfile !== null;
        $quotationLabels = [
            'en' => ['Yes', 'No'],
            'ko' => ['예', '아니오'],
            'ja' => ['はい', 'いいえ'],
        ];
        $quotation = $hasQuotation
            ? ($quotationLabels[$locale][0] ?? 'Yes')
            : ($quotationLabels[$locale][1] ?? 'No');

        // Format availability
        $availabilityLabels = [
            'en' => ['In Stock', 'Out of Stock'],
            'ko' => ['재고 있음', '재고 없음'],
            'ja' => ['在庫あり', '在庫切れ'],
        ];
        $availability = $product->stock_quantity > 0
            ? ($availabilityLabels[$locale][0] ?? 'In Stock')
            : ($availabilityLabels[$locale][1] ?? 'Out of Stock');

        return [
            $product->id,
            $productName, // Only one product name column based on locale
            $product->sku,
            $product->category->name ?? null,
            $status,
            $promotional,
            null,
            $product->stock_quantity,
            $product->created_at?->format('Y-m-d H:i:s'),
            $product->branch_name ?? '',
            $product->client_name ?? '',
            $isPublic,
            $quotation,
            $availability,
        ];
    }

    public function headings(): array
    {
        return ExportLocaleHelper::getProductHeadings($this->locale);
    }

    public function title(): string
    {
        return ExportLocaleHelper::getProductSheetName($this->locale);
    }
}
