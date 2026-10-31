<?php

namespace App\Http\Requests\Admin\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;

class AdminProductUploadImagesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
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
                function (string $attr, mixed $value, \Closure $fail): void {
                    $files = $this->normalizeToArray($this->file('images'));
                    if (count($files) === 0) {
                        $fail('At least one image is required.');

                        return;
                    }
                    if (count($files) > 5) {
                        $fail('이미지는 최대 5개까지 업로드 가능합니다.');

                        return;
                    }
                    foreach ($files as $file) {
                        $v = Validator::make(
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
}
