<?php

namespace App\Http\Requests\Admin\Paper;

use App\Enums\ErpOptionGroupCode;
use App\Enums\PaperCategory;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Rule;
use Illuminate\Database\Query\Builder;

class AdminPaperUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category' => ['sometimes', new Enum(PaperCategory::class)],
            'manufacturer' => ['sometimes', 'string', 'max:255'],
            'name' => ['sometimes', 'string', 'max:255'],
            'specification' => ['sometimes', 'array'],
            'specification.thickness_mm' => ['required_with:specification', 'numeric'],
            'specification.image' => ['nullable', 'string'],
            'specification.description' => ['nullable', 'string'],
            'pattern' => ['sometimes', 'string', 'max:100'],
            'paper_type_option_value_id' => [
                'sometimes',
                'integer',
                $this->optionExistsRule(ErpOptionGroupCode::PAPER_TYPE->value),
            ],
            'paper_color_option_value_id' => [
                'sometimes',
                'integer',
                $this->optionExistsRule(ErpOptionGroupCode::PAPER_COLOR->value),
            ],
            'paper_weight_option_value_id' => [
                'sometimes',
                'integer',
                $this->optionExistsRule(ErpOptionGroupCode::PAPER_WEIGHT->value),
            ],
            'is_active' => ['sometimes', 'string', 'in:active,hidden'],
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
