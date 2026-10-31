<?php

namespace App\Http\Requests\Admin\WebEditor;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminWebEditorStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:' . implode(',', \App\Enums\WebEditorType::values())],
            'width' => ['required', 'numeric', 'min:0'],
            'height' => ['required', 'numeric', 'min:0'],
            'unit' => ['required', 'string', 'in:mm'],
            'dpi' => ['nullable', 'integer', 'min:1'],
            'bleed' => ['nullable', 'numeric', 'min:0'],
            'safe_area' => ['nullable', 'numeric', 'min:0'],
            'config_json' => ['nullable', 'array'],
            'status' => ['required', 'string', 'in:active,hidden'],
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