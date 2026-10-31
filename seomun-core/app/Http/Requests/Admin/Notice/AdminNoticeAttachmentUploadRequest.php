<?php

namespace App\Http\Requests\Admin\Notice;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminNoticeAttachmentUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * FSD: File up attachments for notice. PDF, JPEG, PNG, max 5MB.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:5120', // 5MB
                'mimes:pdf,jpeg,jpg,png',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => '첨부파일을 선택해 주세요.',
            'file.file' => '유효한 파일을 업로드해 주세요.',
            'file.max' => '첨부파일 크기는 5MB 이하여야 합니다.',
            'file.mimes' => '첨부파일은 PDF, JPEG, PNG 형식만 가능합니다.',
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
