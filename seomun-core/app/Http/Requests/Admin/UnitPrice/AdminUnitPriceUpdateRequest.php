<?php

namespace App\Http\Requests\Admin\UnitPrice;

use App\Enums\ErpOptionGroupCode;
use App\Enums\UnitPriceCategory;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
use Illuminate\Database\Query\Builder;

class AdminUnitPriceUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'erp_size_option_id' => [
                'nullable',
                'integer',
                $this->optionExistsRule(ErpOptionGroupCode::SIZE->value),
            ],

            'erp_paper_option_id' => [
                'nullable',
                'integer',
                $this->optionExistsRule(ErpOptionGroupCode::PAPER->value),
            ],
            'erp_subject_master_option_id' => [
                'nullable',
                'integer',
                $this->optionExistsRule(ErpOptionGroupCode::SUBJECT_MATTER->value),
            ],
            'product_id' => ['sometimes', 'integer', 'exists:products,id'],
            'combination_options' => ['nullable', 'array'],
            'items' => ['nullable', 'array'],
            'items.*.price_value' => ['required_with:items', 'numeric', 'min:0'],
            'items.*.raw_cost' => ['nullable', 'numeric', 'min:0'],
            'items.*.attributes' => ['nullable', 'array'],
            'items.*.quantity_min' => ['nullable', 'integer', 'min:1'],
            'items.*.is_active' => ['boolean'],
        ];
    }

     private function optionExistsRule(string $groupCode): \Illuminate\Validation\Rules\Exists
    {
        return Rule::exists('erp_options', 'id')
            ->where(function (Builder $query) use ($groupCode) {
                $query->whereExists(function ($subQuery) use ($groupCode) {
                    $subQuery->selectRaw(1)
                        ->from('erp_option_groups')
                        ->whereColumn(
                            'erp_option_groups.id',
                            'erp_options.erp_option_group_id'
                        )
                        ->where('erp_option_groups.code', $groupCode);
                });
            });
    }
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => '입력값이 올바르지 않습니다.',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
