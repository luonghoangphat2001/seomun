<?php

namespace App\Http\Requests\Admin\PaperPrice;

use App\Enums\PaperSizeDivisionCode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminPaperPriceUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'paper_id' => [
                'sometimes',
                'exists:papers,id',
                Rule::unique('paper_prices', 'paper_id')
                    ->where(function ($query) {
                        return $query->where('paper_size_division_code', $this->paper_size_division_code);
                    })
                    ->ignore($this->route('paperPrice')?->id),
            ],
            'paper_size_division_code' => [
                'sometimes',
                'string',
                Rule::enum(PaperSizeDivisionCode::class),
            ],
            'supply_price' => 'sometimes|numeric|min:0',
            'cost' => 'sometimes|numeric|min:0',
            'is_hot_deal' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'paper_id.exists' => '선택한 용지가 존재하지 않습니다.',
            'paper_id.unique' => '해당 용지와 용지 규격의 가격 정보가 이미 등록되어 있습니다.',

            'paper_size_division_code.string' => '용지 규격이 올바르지 않습니다.',
            'paper_size_division_code.enum' => '용지 규격이 올바르지 않습니다.',

            'supply_price.numeric' => '공급가는 숫자여야 합니다.',
            'supply_price.min' => '공급가는 0 이상이어야 합니다.',

            'cost.numeric' => '판매가는 숫자여야 합니다.',
            'cost.min' => '판매가는 0 이상이어야 합니다.',

            'is_hot_deal.boolean' => '핫딜 여부 값이 올바르지 않습니다.',
        ];
    }
}
