<?php

namespace App\Http\Requests\Admin\Popup;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminPopupStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string'], // Either content or image_path required
            'image_path' => ['nullable', 'string', 'max:500'], // Either content or image_path required
            'exposure_target' => ['nullable'], // all | array of customer IDs
            'exposure_location' => ['nullable', 'string', 'max:50'],
            'width' => ['nullable', 'integer', 'min:1'],
            'height' => ['nullable', 'integer', 'min:1'],
            'status' => ['required', 'string', 'in:exposed,non-exposed'],
            'exposure_start_date' => ['nullable', 'date'],
            'exposure_end_date' => ['nullable', 'date', 'after_or_equal:exposure_start_date'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            if (empty($this->input('content')) && empty($this->input('image_path'))) {
                $validator->errors()->add('content', 'Either content or image_path must be provided.');
                $validator->errors()->add('image_path', 'Either content or image_path must be provided.');
            }
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
