<?php

namespace App\Http\Requests\Admin\Category;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AdminCategoryExposureImageUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Upload banner or icon image for category exposure. Returns path to send in PUT exposure.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'image', 'max:5120'], // 5MB
            'type' => ['required', 'string', 'in:banner,icon'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => '파일을 선택해 주세요.',
            'file.image' => '이미지 파일만 업로드 가능합니다.',
            'file.max' => '파일 크기는 5MB 이하여야 합니다.',
            'type.in' => 'type은 banner 또는 icon 이어야 합니다.',
        ];
    }
}
