<?php

namespace App\Http\Requests\Admin\PrintingPrice;

use App\Enums\MachineType;
use App\Enums\BookPrintingSizeType;
use App\Enums\PrintSideType;
use App\Enums\BookPrintingType;
use Illuminate\Foundation\Http\FormRequest;

class AdminPrintingPriceListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'machine_type' => ['nullable', 'string', 'in:' . implode(',', MachineType::values())],
            'book_printing_size_type' => ['nullable', 'string', 'in:' . implode(',', BookPrintingSizeType::values())],
            'side_type' => ['nullable', 'string', 'in:' . implode(',', PrintSideType::values())],
            'book_printing_type' => ['nullable', 'string', 'in:' . implode(',', BookPrintingType::values())],
            'name' => ['nullable', 'string', 'max:255'],
            'is_hot_deal' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'current_page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}