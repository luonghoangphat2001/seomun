<?php

namespace App\Http\Requests\Admin\EditorSize;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminEditorSizeStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'editor_size_type_id' => ['required', 'integer', 'exists:editor_size_types,id'],
            'name' => ['required', 'string', 'max:255'],
            'width' => ['required', 'integer', 'min:1'],
            'height' => ['required', 'integer', 'min:1'],
            'unit' => ['required', 'string', 'max:20'],
            'thumbnail_url' => ['nullable', 'string', 'max:500'],
            'is_active' => ['required', 'string', 'in:active,hidden'],
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
