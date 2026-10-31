<?php

namespace App\Http\Exports\Admin;

use App\Services\Admin\AdminTemplateService;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AdminTemplateExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable;

    protected array $filters;

    protected AdminTemplateService $adminTemplateService;

    protected string $locale;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
        $this->adminTemplateService = app(AdminTemplateService::class);
        $this->locale = Arr::get($filters, 'locale', 'en');
    }

    public function query()
    {
        $reflection = new \ReflectionClass($this->adminTemplateService);
        $method = $reflection->getMethod('buildQuery');
        $method->setAccessible(true);
        $query = $method->invoke($this->adminTemplateService, $this->filters);

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
                    $query->whereIn('templates.id', $selectedIds);
                }
                break;
            default:
                throw new \InvalidArgumentException("Invalid export_type: {$exportType}");
        }

        return $query;
    }

    public function map($template): array
    {
        $statusLabels = [
            'en' => ['Active', 'Inactive'],
            'ko' => ['활성', '비활성'],
            'ja' => ['有効', '無効'],
        ];

        $status = $template->is_active
            ? ($statusLabels[$this->locale][0] ?? 'Active')
            : ($statusLabels[$this->locale][1] ?? 'Inactive');

        return [
            $template->id,
            $template->name,
            $template->product->name ?? null,
            $template->product->sku ?? null,
            json_encode($template->specifications ?? []),
            $status,
            $template->createdBy->name ?? null,
            $template->created_at?->format('Y-m-d H:i:s'),
            $template->updated_at?->format('Y-m-d H:i:s'),
        ];
    }

    public function headings(): array
    {
        $headings = [
            'en' => [
                'ID',
                'Template Name',
                'Linked Product Name',
                'Linked Product Code',
                'Specifications',
                'Status',
                'Registrant',
                'Registered At',
                'Last Modified At',
            ],
            'ko' => [
                'ID',
                '템플릿 이름',
                '연결된 상품명',
                '연결된 상품 코드',
                '규격 정보',
                '상태',
                '등록자',
                '등록일시',
                '최종 수정일시',
            ],
            'ja' => [
                'ID',
                'テンプレート名',
                '連携商品名',
                '連携商品コード',
                '仕様情報',
                'ステータス',
                '登録者',
                '登録日時',
                '最終更新日時',
            ],
        ];

        return $headings[$this->locale] ?? $headings['en'];
    }
}
