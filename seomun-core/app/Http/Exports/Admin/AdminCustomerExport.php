<?php

namespace App\Http\Exports\Admin;

use App\Enums\ApprovalStatus;
use App\Enums\CustomerStatus;
use App\Helpers\ExportLocaleHelper;
use App\Services\Admin\AdminCustomerService;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class AdminCustomerExport implements FromQuery, WithHeadings, WithMapping, WithTitle
{
    use Exportable;

    protected array $filters;

    protected AdminCustomerService $adminCustomerService;

    protected string $locale;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
        $this->adminCustomerService = app(AdminCustomerService::class);
        $this->locale = Arr::get($filters, 'locale', 'en');
    }

    public function query()
    {
        $reflection = new \ReflectionClass($this->adminCustomerService);
        $method = $reflection->getMethod('buildQuery');
        $method->setAccessible(true);
        $query = $method->invoke($this->adminCustomerService, $this->filters);

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
                    $query->whereIn('customers.id', $selectedIds);
                }
                break;
            default:
                throw new \InvalidArgumentException("Invalid export_type: {$exportType}");
        }

        return $query;
    }

    public function map($customer): array
    {
        $locale = $this->locale;

        $approvalLabels = [
            'en' => [
                ApprovalStatus::PENDING->value => 'Pending',
                ApprovalStatus::ACCEPTED->value => 'Accept',
                ApprovalStatus::REJECTED->value => 'Reject',
            ],
            'ko' => [
                ApprovalStatus::PENDING->value => '대기',
                ApprovalStatus::ACCEPTED->value => '승인',
                ApprovalStatus::REJECTED->value => '거절',
            ],
            'ja' => [
                ApprovalStatus::PENDING->value => '保留',
                ApprovalStatus::ACCEPTED->value => '承認',
                ApprovalStatus::REJECTED->value => '拒否',
            ],
        ];
        $approvalStatus = $customer->approval_status
            ? ($approvalLabels[$locale][$customer->approval_status->value] ?? $customer->approval_status->label())
            : null;

        $statusLabels = [
            'en' => ['Active', 'Inactive'],
            'ko' => ['활성', '비활성'],
            'ja' => ['有効', '無効'],
        ];
        $status = match ($customer->status ?? '') {
            CustomerStatus::ACTIVE->value => $statusLabels[$locale][0] ?? 'Active',
            CustomerStatus::INACTIVE->value => $statusLabels[$locale][1] ?? 'Inactive',
            default => 'N/A',
        };

        return [
            $customer->id,
            $customer->company_name,
            $customer->business_registration_number,
            $customer->representative_name,
            $customer->contact_name,
            $customer->contact_phone,
            $customer->contact_email,
            $approvalStatus ?? 'N/A',
            $status,
            $customer->code?->code ?? null,
            $customer->created_at?->format('Y-m-d H:i:s'),
        ];
    }

    public function headings(): array
    {
        return ExportLocaleHelper::getCustomerHeadings($this->locale);
    }

    public function title(): string
    {
        return ExportLocaleHelper::getCustomerSheetName($this->locale);
    }
}
