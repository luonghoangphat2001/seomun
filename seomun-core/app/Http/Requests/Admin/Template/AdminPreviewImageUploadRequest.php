<?php

namespace App\Http\Requests\Admin\Template;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\UploadedFile;

class AdminPreviewImageUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Accept single file or array (FE: images[] or multiple "images"). No 'array' rule.
     */
    public function rules(): array
    {
        return [
            'images' => [
                'required',
                function (string $attr, mixed $value, \Closure $fail): void {
                    $files = $this->normalizeToArray($this->file('images'));
                    if (count($files) === 0) {
                        $fail('At least one image is required.');

                        return;
                    }
                    if (count($files) > 1) {
                        $fail('이미지는 최대 1개까지 업로드 가능합니다.');

                        return;
                    }
                    foreach ($files as $file) {
                        $v = \Illuminate\Support\Facades\Validator::make(
                            ['f' => $file],
                            ['f' => ['image', 'mimes:jpeg,jpg,png,webp', 'max:5120']],
                            [
                                'f.image' => '파일은 이미지여야 합니다.',
                                'f.mimes' => '허용되는 형식: jpeg, jpg, png, webp.',
                                'f.max' => '각 이미지는 5MB를 초과할 수 없습니다.',
                            ]
                        );
                        if ($v->fails()) {
                            $fail($v->errors()->first());

                            return;
                        }
                    }
                },
            ],
        ];
    }

    /** Single file or array -> always array of UploadedFile. */
    private function normalizeToArray(mixed $value): array
    {
        if ($value === null) {
            return [];
        }
        if ($value instanceof UploadedFile) {
            return [$value];
        }
        if (is_array($value)) {
            return array_values(array_filter($value, fn ($v) => $v instanceof UploadedFile));
        }

        return [];
    }

    public function messages(): array
    {
        return [
            'images.required' => 'At least one image is required.',
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
