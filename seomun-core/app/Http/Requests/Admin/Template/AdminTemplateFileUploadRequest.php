<?php

namespace App\Http\Requests\Admin\Template;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AdminTemplateFileUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     * FSD: upload file (AI/PDF) only.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:51200', // 50MB
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $ext = strtolower($value->getClientOriginalExtension());
                    if (! in_array($ext, ['ai', 'pdf'], true)) {
                        $fail('파일 형식은 AI 또는 PDF만 가능합니다.');
                    }
                },
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => '템플릿 파일을 선택해 주세요.',
            'file.file' => '유효한 파일을 업로드해 주세요.',
            'file.max' => '파일 크기는 50MB 이하여야 합니다.',
        ];
    }
}
