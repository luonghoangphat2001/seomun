<?php

namespace App\Http\Exports\Admin;

use App\Helpers\ExportLocaleHelper;
use App\Services\Admin\AdminErpOptionService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class AdminErpOptionExport implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    use Exportable;

    protected array $filters;
    protected AdminErpOptionService $adminErpOptionService;
    protected string $locale;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
        $this->adminErpOptionService = app(AdminErpOptionService::class);
        $this->locale = Arr::get($filters, 'locale', 'en');
    }

    public function collection(): Collection
    {
        $query = $this->adminErpOptionService->buildQuery($this->filters);
        $exportType = Arr::get($this->filters, 'export_type', 'ALL');

        switch ($exportType) {
            case 'ALL':
                break;
            case 'CURRENT_PAGE':
                $currentPage = (int) Arr::get($this->filters, 'current_page', 1);
                $perPage = (int) Arr::get($this->filters, 'per_page', 20);
                $query->offset(($currentPage - 1) * $perPage)->limit($perPage);
                break;
            case 'SELECTED':
                $selectedIds = Arr::get($this->filters, 'selected_ids', []);
                if ($selectedIds !== []) {
                    $query->whereIn('erp_options.id', $selectedIds);
                }
                break;
            default:
                throw new \InvalidArgumentException("Invalid export_type: {$exportType}");
        }

        return $query->get();
    }

    public function map($erpOption): array
    {
        $statusLabels = [
            'en' => ['Active', 'Inactive'],
            'ko' => ['활성', '비활성'],
            'ja' => ['有効', '無効'],
        ];

        $statusLabel = $erpOption->is_active
            ? ($statusLabels[$this->locale][0] ?? 'Active')
            : ($statusLabels[$this->locale][1] ?? 'Inactive');

        return [
            $erpOption->id,
            $erpOption->erpOptionGroup->code?->value ?? null,
            $erpOption->erpOptionGroup->label ?? null,
            $erpOption->code,
            $erpOption->label,
            $erpOption->value,
            $erpOption->additional_price,
            $statusLabel,
            $erpOption->erpOptionGroup->display_type ?? null,
            $erpOption->erpOptionGroup?->is_required ? 'Y' : 'N',
            $erpOption->sort_order,
            $erpOption->created_at?->format('Y-m-d H:i:s'),
        ];
    }

    public function headings(): array
    {
        return ExportLocaleHelper::getErpOptionHeadings($this->locale);
    }

    public function title(): string
    {
        return ExportLocaleHelper::getErpOptionSheetName($this->locale);
    }
}
