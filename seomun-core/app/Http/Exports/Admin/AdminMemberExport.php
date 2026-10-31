<?php

namespace App\Http\Exports\Admin;

use App\Enums\ApprovalStatus;
use App\Enums\UserStatus;
use App\Helpers\ExportLocaleHelper;
use App\Services\Admin\AdminMemberService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class AdminMemberExport implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    use Exportable;

    protected array $filters;

    protected AdminMemberService $adminMemberService;

    protected string $locale;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
        $this->adminMemberService = app(AdminMemberService::class);
        $this->locale = Arr::get($filters, 'locale', 'en');
    }

    public function collection(): Collection
    {
        $query = $this->adminMemberService->buildQuery($this->filters);

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
                if (empty($selectedIds)) {
                    return new Collection();
                }
                $query->whereIn('users.id', $selectedIds);
                break;
            default:
                throw new \InvalidArgumentException("Invalid export_type: {$exportType}");
        }

        return $query->get();
    }

    public function map($member): array
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
        $approvalStatus = $member->approval_status
            ? ($approvalLabels[$locale][$member->approval_status->value] ?? $member->approval_status->label())
            : 'N/A';

        $statusLabels = [
            'en' => [
                UserStatus::ACTIVE->value => 'Active',
                UserStatus::INACTIVE->value => 'Inactive',
                UserStatus::BLOCKED->value => 'Blocked',
                UserStatus::WITHDRAWN->value => 'Withdrawn',
            ],
            'ko' => [
                UserStatus::ACTIVE->value => '활성',
                UserStatus::INACTIVE->value => '비활성',
                UserStatus::BLOCKED->value => '차단',
                UserStatus::WITHDRAWN->value => '탈퇴',
            ],
            'ja' => [
                UserStatus::ACTIVE->value => '有効',
                UserStatus::INACTIVE->value => '無効',
                UserStatus::BLOCKED->value => 'ブロック',
                UserStatus::WITHDRAWN->value => '退会',
            ],
        ];
        $status = $member->status
            ? ($statusLabels[$locale][$member->status->value] ?? 'N/A')
            : 'N/A';

        return [
            $member->id,
            $member->username,
            $member->name,
            $member->email,
            $member->phone,
            $member->mobile,
            $status,
            $member->company_name ?? null,
            $member->note ?? null,
            $member->created_at?->format('Y-m-d H:i:s'),
        ];
    }

    public function headings(): array
    {
        return ExportLocaleHelper::getMemberHeadings($this->locale);
    }

    public function title(): string
    {
        return ExportLocaleHelper::getMemberSheetName($this->locale);
    }
}
