<?php

namespace App\Http\Requests\Design;

use Illuminate\Foundation\Http\FormRequest;

class StoreUploadFileDesignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'title' => ['required', 'string', 'max:255'],
            'artwork' => ['required', 'array', 'max:1'],
            'artwork.*.url' => ['required', 'string', 'url'],
            'artwork.*.name' => ['required', 'string', 'max:255'],
            'artwork.*.size' => ['required', 'integer'],
            'artwork.*.mime' => ['nullable', 'string', 'max:100'],
            'artwork.*.metadata' => ['nullable', 'array'],
            'artwork.*.print_as_is' => ['nullable', 'boolean'],
            'artwork.*.print_without_proof' => ['nullable', 'boolean'],
        ];
    }
}
