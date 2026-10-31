<?php

namespace App\Http\Requests\Admin\Product;

use Illuminate\Foundation\Http\FormRequest;

class AdminProductCopyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'copy_title' => 'required|string|max:200',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->filled('copy_title') && $this->filled('name')) {
            $this->merge(['copy_title' => $this->input('name')]);
        }
    }
}
