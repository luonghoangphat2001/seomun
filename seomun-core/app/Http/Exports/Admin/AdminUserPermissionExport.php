<?php

namespace App\Http\Exports\Admin;

use App\Helpers\ExportLocaleHelper;
use App\Services\Admin\AdminUserPermissionService;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class AdminUserPermissionExport implements FromQuery, WithHeadings, WithMapping, WithTitle
{
    use Exportable;

    protected array $filters;

    protected AdminUserPermissionService $adminUserPermissionService;

    protected string $locale;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
        $this->adminUserPermissionService = app(AdminUserPermissionService::class);
        $this->locale = Arr::get($filters, 'locale', 'en');
    }

    public function query()
    {
        $reflection = new \ReflectionClass($this->adminUserPermissionService);
        $method = $reflection->getMethod('buildQuery');
        $method->setAccessible(true);
        $query = $method->invoke($this->adminUserPermissionService, $this->filters);

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
                    $query->whereIn('user_admin_permissions.id', $selectedIds);
                }
                break;
            default:
                throw new \InvalidArgumentException("Invalid export_type: {$exportType}");
        }

        return $query;
    }

    public function map($userPermission): array
    {
        return [
            $userPermission->id,
            $userPermission->user?->customer?->company_name ?? null,
            $userPermission->user?->name ?? null,
            $userPermission->user?->username ?? null,
            $userPermission->user?->email ?? null,
            $userPermission->adminPermission?->name ?? null,
            $userPermission->status,
            $userPermission->grant_date?->format('Y-m-d H:i:s'),
            $userPermission->createdBy?->name ?? $userPermission->createdBy?->username ?? null,
        ];
    }

    public function headings(): array
    {
        return ExportLocaleHelper::getUserPermissionHeadings($this->locale);
    }

    public function title(): string
    {
        return ExportLocaleHelper::getUserPermissionSheetName($this->locale);
    }
}
