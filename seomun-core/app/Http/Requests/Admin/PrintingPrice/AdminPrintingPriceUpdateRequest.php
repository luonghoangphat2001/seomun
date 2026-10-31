<?php

namespace App\Http\Requests\Admin\PrintingPrice;

use App\Enums\MachineType;
use App\Enums\BookPrintingSizeType;
use App\Enums\PaperSizeDivisionCode;
use App\Enums\PrintSideType;
use App\Enums\BookPrintingType;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminPrintingPriceUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'machine_type' => ['sometimes', 'required', 'string', 'in:' . implode(',', MachineType::values())],
            'book_printing_size_type' => ['sometimes', 'required', 'string', 'in:' . implode(',', BookPrintingSizeType::values())],
            'paper_size_division_code' => ['sometimes', 'required', 'string', 'in:' . implode(',', array_column(PaperSizeDivisionCode::cases(), 'value'))],
            'side_type' => [
                'sometimes',
                'nullable',
                'string',
                'in:' . implode(',', PrintSideType::values()),
            ],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'book_printing_type' => [
                'sometimes',
                'nullable',
                'string',
                'in:' . implode(',', BookPrintingType::values()),
            ],
            'is_hot_deal' => ['sometimes', 'boolean'],
            'items' => ['nullable', 'array'],
            'items.*.id' => ['nullable', 'integer', 'exists:printing_price_items,id'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
            'items.*.supply_price' => ['required_with:items', 'integer', 'min:0'],
            'items.*.cost' => ['required_with:items', 'integer', 'min:0'],
        ];
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
