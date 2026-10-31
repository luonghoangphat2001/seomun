<?php

namespace App\Http\Requests\Admin\Popup;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminPopupListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search_term' => ['nullable', 'string', 'max:255'],
            'popup_name' => ['nullable', 'string', 'max:255'],
            'exposure_location' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'string', 'in:exposed,non-exposed'],
            'registrant_id' => ['nullable', 'integer', 'exists:users,id'],
            'exposure_period_from' => ['nullable', 'date'],
            'exposure_period_to' => ['nullable', 'date', 'after_or_equal:exposure_period_from'],
            'sort_by' => ['nullable', 'string', 'in:name,created_at'],
            'sort_order' => ['nullable', 'string', 'in:asc,desc'],
            'page' => ['nullable', 'integer', 'min:1'],
            'current_page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $page = $this->input('page') ?? $this->input('current_page');

        $this->merge([
            'current_page' => $page,
        ]);
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
