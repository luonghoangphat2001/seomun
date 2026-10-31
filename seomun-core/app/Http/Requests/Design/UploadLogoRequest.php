<?php

namespace App\Http\Requests\Design;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UploadLogoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'logo' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png,svg,webp',
                'max:5120', // 5MB
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'logo.required' => '로고 파일은 필수입니다.',
            'logo.image' => '로고는 이미지 파일이어야 합니다.',
            'logo.mimes' => '로고는 jpeg, jpg, png, svg, webp 형식의 파일이어야 합니다.',
            'logo.max' => '로고 파일 크기는 5MB를 초과할 수 없습니다.',
        ];
    }
}
