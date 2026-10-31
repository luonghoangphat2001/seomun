<?php

namespace App\Http\Exports\Admin;

use App\Enums\InquiryCategory;
use App\Enums\InquiryStatus;
use App\Helpers\ExportLocaleHelper;
use App\Services\Admin\AdminInquiryService;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class AdminInquiryExport implements FromQuery, WithHeadings, WithMapping, WithTitle
{
    use Exportable;

    protected array $filters;

    protected AdminInquiryService $adminInquiryService;

    protected string $locale;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
        $this->adminInquiryService = app(AdminInquiryService::class);
        $this->locale = Arr::get($filters, 'locale', 'ko');
    }

    public function query()
    {
        $query = $this->adminInquiryService->buildQuery($this->filters);

        $exportType = Arr::get($this->filters, 'export_type', 'ALL');
        switch ($exportType) {
            case 'ALL':
                break;
            case 'CURRENT_PAGE':
                $currentPage = (int) Arr::get($this->filters, 'current_page', 1);
                $perPage = (int) Arr::get($this->filters, 'per_page', 20);
                $inquiryIds = (clone $query)
                    ->select('inquiries.id')
                    ->offset(($currentPage - 1) * $perPage)
                    ->limit($perPage)
                    ->pluck('inquiries.id');

                $query->whereIn('inquiries.id', $inquiryIds);
                break;
            case 'SELECTED':
                $selectedIds = Arr::get($this->filters, 'selected_ids', []);
                if ($selectedIds !== []) {
                    $query->whereIn('inquiries.id', $selectedIds);
                }
                break;
            default:
                throw new \InvalidArgumentException("Invalid export_type: {$exportType}");
        }

        return $query;
    }

    public function map($inquiry): array
    {
        $locale = $this->locale;

        $inquiryTypeLabels = [
            'en' => [
                InquiryCategory::PRODUCT->value  => 'Product Inquiry',
                InquiryCategory::QUOTE->value    => 'Quote Inquiry',
                InquiryCategory::SHIPPING->value => 'Shipping Inquiry',
                InquiryCategory::PAYMENT->value  => 'Payment Inquiry',
                InquiryCategory::REWORK->value   => 'Rework Inquiry',
                InquiryCategory::REFUND->value   => 'Refund Inquiry',
            ],
            'ko' => [
                InquiryCategory::PRODUCT->value  => '상품문의',
                InquiryCategory::QUOTE->value    => '견적문의',
                InquiryCategory::SHIPPING->value => '배송문의',
                InquiryCategory::PAYMENT->value  => '결제문의',
                InquiryCategory::REWORK->value   => '재작업문의',
                InquiryCategory::REFUND->value   => '환불문의',
            ],
            'ja' => [
                InquiryCategory::PRODUCT->value  => '商品のお問い合わせ',
                InquiryCategory::QUOTE->value    => '見積もりのお問い合わせ',
                InquiryCategory::SHIPPING->value => '配送のお問い合わせ',
                InquiryCategory::PAYMENT->value  => '決済のお問い合わせ',
                InquiryCategory::REWORK->value   => ' 재작업 お問い合わせ',
                InquiryCategory::REFUND->value   => '返金のお問い合わせ',
            ],
        ];

        $inquiryType = $inquiry->category
            ? ($inquiryTypeLabels[$locale][$inquiry->category->value] ?? $inquiry->category->label())
            : '';

        $statusLabels = [
            'en' => [
                InquiryStatus::PENDING->value     => 'Received',
                InquiryStatus::RESPONDED->value   => 'Responded',
            ],
            'ko' => [
                InquiryStatus::PENDING->value     => '접수',
                InquiryStatus::RESPONDED->value   => '답변완료',
            ],
            'ja' => [
                InquiryStatus::PENDING->value     => '受付',
                InquiryStatus::RESPONDED->value   => '回答済み',
            ],
        ];
        $status = $inquiry->status
            ? ($statusLabels[$locale][$inquiry->status->value] ?? $inquiry->status->label())
            : '';

        $hasAttachmentLabels = [
            'en' => ['Yes', 'No'],
            'ko' => ['예', '아니오'],
            'ja' => ['はい', 'いいえ'],
        ];
        $hasAttachment = $inquiry->relationLoaded('attachments') && $inquiry->attachments->isNotEmpty()
            ? ($hasAttachmentLabels[$locale][0] ?? 'Yes')
            : ($hasAttachmentLabels[$locale][1] ?? 'No');

        $personInCharge = $inquiry->repliedBy?->name ?? '';

        return [
            $inquiry->id,
            $inquiry->inquiry_number,
            $inquiryType,
            $inquiry->title,
            $inquiry->user->customer->company_name ?? '',
            $inquiry->user->name ?? '',
            $status,
            $personInCharge,
            $hasAttachment,
            $inquiry->created_at?->format('Y-m-d H:i:s'),
        ];
    }

    public function headings(): array
    {
        return ExportLocaleHelper::getInquiryHeadings($this->locale);
    }

    public function title(): string
    {
        return ExportLocaleHelper::getInquirySheetName($this->locale);
    }
}
