<?php

namespace App\Http\Exports\Admin;

use App\Enums\UsageStatusValue;
use App\Helpers\ExportLocaleHelper;
use App\Services\Admin\AdminPermissionService;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class AdminPermissionExport implements FromQuery, WithHeadings, WithMapping, WithTitle
{
    use Exportable;

    protected array $filters;

    protected AdminPermissionService $adminPermissionService;

    protected string $locale;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
        $this->adminPermissionService = app(AdminPermissionService::class);
        $this->locale = Arr::get($filters, 'locale', 'en');
    }

    public function query()
    {
        $reflection = new \ReflectionClass($this->adminPermissionService);
        $method = $reflection->getMethod('buildQuery');
        $method->setAccessible(true);
        $query = $method->invoke($this->adminPermissionService, $this->filters);

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
                    $query->whereIn('admin_permissions.id', $selectedIds);
                }
                break;
            default:
                throw new \InvalidArgumentException("Invalid export_type: {$exportType}");
        }

        return $query;
    }

    public function map($permission): array
    {
        $locale = $this->locale;

        $usageOptions = collect(UsageStatusValue::options())
            ->pluck('label', 'value')
            ->all();

        $usageLabel = $usageOptions[$permission->usage_status?->value ?? ''] ?? ($permission->usage_status?->value ?? 'N/A');

        return [
            $permission->id,
            $permission->name,
            $permission->description,
            $usageLabel,
            $permission->createdBy?->name ?? $permission->createdBy?->username ?? null,
            $permission->createdBy?->email ?? null,
            $permission->created_at?->format('Y-m-d H:i:s'),
        ];
    }

    public function headings(): array
    {
        return ExportLocaleHelper::getAdminPermissionHeadings($this->locale);
    }

    public function title(): string
    {
        return ExportLocaleHelper::getAdminPermissionSheetName($this->locale);
    }
}
