<?php

namespace App\Http\Requests\Admin\Popup;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminPopupUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'content' => ['sometimes', 'nullable', 'string'],
            'image_path' => ['sometimes', 'nullable', 'string', 'max:500'],
            'exposure_target' => ['sometimes', 'nullable'],
            'exposure_location' => ['sometimes', 'nullable', 'string', 'max:50'],
            'width' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'height' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'status' => ['sometimes', 'string', 'in:exposed,non-exposed'],
            'exposure_start_date' => ['sometimes', 'nullable', 'date'],
            'exposure_end_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:exposure_start_date'],
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
