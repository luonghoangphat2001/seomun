<?php

namespace App\Http\Requests\Admin\Shipment;

use App\Enums\OrderShipmentStatus;
use App\Enums\OrderShipmentType;
use Carbon\Carbon;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminShipmentListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'search_term'         => 'nullable|string|max:255',
            'shipment_date_range' => 'nullable|string|max:255',
            'shipment_date_from'  => 'nullable|date',
            'shipment_date_to'    => 'nullable|date|after_or_equal:shipment_date_from',
            'order_number'        => 'nullable|string|max:100',
            'customer_name'       => 'nullable|string|max:255',
            'tracking_number'     => 'nullable|string|max:100',
            'shipment_status'     => ['nullable', 'string', Rule::in(array_column(OrderShipmentStatus::cases(), 'value'))],
            'shipment_type'       => ['nullable', 'string', Rule::in(array_column(OrderShipmentType::cases(), 'value'))],
            'page'                => 'nullable|integer|min:1',
            'current_page'        => 'nullable|integer|min:1',
            'per_page'            => 'nullable|integer|min:1|max:100',
            'sort_by'             => 'nullable|string|in:shipped_at,shipment_date,order_number,created_at',
            'sort_order'          => 'nullable|string|in:asc,desc',
        ];
    }

    protected function prepareForValidation(): void
    {
        $page = $this->input('page') ?? $this->input('current_page');
        $merge = ['current_page' => $page];

        $range = $this->input('shipment_date_range');
        if (is_string($range) && trim($range) !== '' && ! $this->filled('shipment_date_from') && ! $this->filled('shipment_date_to')) {
            [$from, $to] = $this->parseDateRange($range);
            if ($from) {
                $merge['shipment_date_from'] = $from;
            }
            if ($to) {
                $merge['shipment_date_to'] = $to;
            }
        }

        $this->merge($merge);
    }

    /**
     * @return array{0:?string,1:?string}
     */
    private function parseDateRange(string $range): array
    {
        $raw = trim($range);
        $raw = str_replace(['~', 'to', 'TO', '|'], '-', $raw);
        $raw = str_replace([' - '], ',', $raw);
        $parts = array_values(array_filter(array_map('trim', explode(',', $raw))));

        if (count($parts) < 2) {
            return [null, null];
        }

        return [$this->normalizeDate($parts[0]), $this->normalizeDate($parts[1])];
    }

    private function normalizeDate(string $value): ?string
    {
        try {
            return Carbon::parse($value)->toDateString();
        } catch (\Throwable) {
            return null;
        }
    }
}
