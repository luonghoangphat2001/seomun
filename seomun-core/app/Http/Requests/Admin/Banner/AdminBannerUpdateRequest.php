<?php

namespace App\Http\Requests\Admin\Banner;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminBannerUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'image_path' => ['sometimes', 'string', 'max:500'],
            'image_path_mobile' => ['sometimes', 'nullable', 'string', 'max:500'],
            'link_url' => ['sometimes', 'nullable', 'string', 'max:500'],
            'exposure_target' => ['sometimes', 'nullable'],
            'exposure_location' => ['sometimes', 'string', 'max:50'],
            'status' => ['sometimes', 'string', 'in:exposed,non-exposed'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
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
