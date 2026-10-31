<?php

namespace App\Http\Requests\MyPage;

use App\Enums\InquiryCategory;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Rule;

class StoreInquiryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled by auth middleware
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Handle file normalization for both single and multiple files
        // When multiple files are sent as: attachments=@file1.pdf, attachments=@file2.pdf
        // Laravel may parse them in different ways depending on how they're sent

        $allFiles = $this->files->all();

        // Check raw $_FILES for multiple files with same name
        // When client sends attachments[]=@file1, attachments[]=@file2, PHP will parse as array
        $rawFiles = $_FILES ?? [];

        // Handle multiple files from $_FILES array
        if (isset($rawFiles['attachments']['name']) && is_array($rawFiles['attachments']['name']) && count($rawFiles['attachments']['name']) > 1) {
            // Multiple files were sent - reconstruct UploadedFile instances
            $uploadedFiles = [];
            $fileCount = count($rawFiles['attachments']['name']);

            for ($i = 0; $i < $fileCount; $i++) {
                if (! empty($rawFiles['attachments']['tmp_name'][$i]) &&
                    file_exists($rawFiles['attachments']['tmp_name'][$i])) {
                    try {
                        $uploadedFiles[] = new UploadedFile(
                            $rawFiles['attachments']['tmp_name'][$i],
                            $rawFiles['attachments']['name'][$i],
                            $rawFiles['attachments']['type'][$i] ?? null,
                            $rawFiles['attachments']['error'][$i] ?? UPLOAD_ERR_OK,
                            true // test = true để không move file ngay
                        );
                    } catch (\Exception $e) {
                        // Skip invalid files
                    }
                }
            }

            if (count($uploadedFiles) > 0) {
                $allFiles['attachments'] = $uploadedFiles;
                $this->files->replace($allFiles);

                return; // Exit early, files are already normalized
            }
        }

        // Check if attachments exist
        if (isset($allFiles['attachments'])) {
            $attachment = $allFiles['attachments'];

            // If it's a single UploadedFile (not array), convert to array
            // Check for both Laravel and Symfony UploadedFile classes
            $isUploadedFile = $attachment instanceof UploadedFile
                || $attachment instanceof \Symfony\Component\HttpFoundation\File\UploadedFile;

            if ($isUploadedFile) {
                $allFiles['attachments'] = [$attachment];
                $this->files->replace($allFiles);
            } elseif (is_array($attachment)) {
                // Already an array - Laravel parsed multiple files correctly
                // Ensure all items in array are UploadedFile instances
                $validFiles = array_filter($attachment, fn ($f) => $f instanceof UploadedFile);
                if (count($validFiles) !== count($attachment)) {
                    $allFiles['attachments'] = array_values($validFiles);
                    $this->files->replace($allFiles);
                }
            }
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $categoryValues = array_map(fn ($case) => $case->value, InquiryCategory::cases());

        $rules = [
            'category' => [
                'required',
                'string',
                Rule::in($categoryValues),
            ],
            'product_id' => 'nullable|integer|exists:products,id',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'order_number' => 'nullable|string|max:50',
            'contact' => 'required|string|max:20',
            'manager_name' => 'nullable|string|max:255',
        ];

        // Decide validation strategy based on how files are sent
        $files = $this->file('attachments');

        if (is_array($files)) {
            // Multiple files case
            $rules['attachments'] = 'nullable|array';
            $rules['attachments.*'] = [
                'nullable',
                'file',
                'mimes:pdf,jpeg,jpg,png',
                'mimetypes:application/pdf,application/x-pdf,image/jpeg,image/jpg,image/png,image/x-png',
                'max:5120', // 5MB
            ];
        } else {
            // Single file case
            $rules['attachments'] = [
                'nullable',
                'file',
                'mimes:pdf,jpeg,jpg,png',
                'mimetypes:application/pdf,application/x-pdf,image/jpeg,image/jpg,image/png,image/x-png',
                'max:5120', // 5MB
            ];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'category.required' => '문의 카테고리를 선택해주세요.',
            'category.in' => '올바른 문의 카테고리를 선택해주세요.',
            'product_id.integer' => '상품 ID가 올바르지 않습니다.',
            'product_id.exists' => '선택한 상품을 찾을 수 없습니다.',
            'title.required' => '제목을 입력해주세요.',
            'title.max' => '제목은 :max자를 초과할 수 없습니다.',
            'content.required' => '문의 내용을 입력해주세요.',
            'contact.required' => '연락처를 입력해주세요.',
            'contact.max' => '연락처는 :max자를 초과할 수 없습니다.',
            'order_number.max' => '주문번호는 :max자를 초과할 수 없습니다.',
            'manager_name.max' => '담당자명은 :max자를 초과할 수 없습니다.',

            'attachments.*.file' => '첨부파일이 올바른 파일 형식이 아닙니다.',
            'attachments.*.mimes' => '첨부파일은 PDF, JPEG, PNG 형식만 가능합니다.',
            'attachments.*.mimetypes' => '첨부파일의 MIME 타입이 올바르지 않습니다. PDF, JPEG, PNG 형식만 가능합니다.',
            'attachments.*.max' => '첨부파일 크기는 최대 5MB까지 가능합니다.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     *
     * @return void
     *
     * @throws HttpResponseException
     */
    protected function failedValidation(Validator $validator)
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
