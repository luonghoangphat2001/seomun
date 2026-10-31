<?php

namespace App\Http\Requests\MyPage;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled by auth middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->user();

        return [
            // Basic Information
            'name' => 'sometimes|required|string|max:100',
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'phone' => 'nullable|string|max:20|regex:/^[0-9-]+$/',
            'mobile' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^[0-9-]+$/',
                Rule::unique('users', 'mobile')->ignore($user->id),
            ],

            // Address Information
            'postcode' => 'nullable|string|max:10',
            'address' => 'nullable|string|max:255',
            'detailed_address' => 'nullable|string|max:255',

            // Organization Information
            'headquarters' => 'nullable|string|max:100',
            'business_office' => 'nullable|string|max:100',
            'team' => 'nullable|string|max:100',
            'position' => 'nullable|string|max:100',

            // Agreements
            'agree_sms' => 'nullable|boolean',
            'agree_email' => 'nullable|boolean',

            // Business (Customer) Information — only for business members
            'company_name' => 'nullable|string|max:255',
            'business_registration_number' => 'nullable|string|max:50',
            'representative_name' => 'nullable|string|max:100',
            'contact_name' => 'nullable|string|max:100',
            'contact_phone' => 'nullable|string|max:20|regex:/^[0-9-]+$/',
            'contact_email' => 'nullable|email|max:255',
            'business_type' => 'nullable|string|max:100',
            'business_items' => 'nullable|string|max:100',
            'industry_type' => 'nullable|string|max:100',
            'business_postcode' => 'nullable|string|max:10',
            'business_address' => 'nullable|string|max:255',
            'business_detailed_address' => 'nullable|string|max:255',
            'tax_invoice_email' => 'nullable|email|max:255',
            'homepage_url' => 'nullable|string|max:255',
            'business_registration_file' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            // Basic Information
            'name.required' => '이름을 입력해주세요.',
            'name.max' => '이름은 :max자를 초과할 수 없습니다.',

            'email.required' => '이메일을 입력해주세요.',
            'email.email' => '올바른 이메일 형식을 입력해주세요.',
            'email.unique' => '이미 사용중인 이메일입니다.',
            'email.max' => '이메일은 :max자를 초과할 수 없습니다.',

            'phone.regex' => '올바른 전화번호 형식을 입력해주세요.',
            'phone.max' => '전화번호는 :max자를 초과할 수 없습니다.',

            'mobile.regex' => '올바른 핸드폰 번호 형식을 입력해주세요.',
            'mobile.max' => '핸드폰 번호는 :max자를 초과할 수 없습니다.',
            'mobile.unique' => '이미 사용중인 핸드폰 번호입니다.',

            // Address Information
            'postcode.max' => '우편번호는 :max자를 초과할 수 없습니다.',
            'address.max' => '주소는 :max자를 초과할 수 없습니다.',
            'detailed_address.max' => '상세주소는 :max자를 초과할 수 없습니다.',

            // Organization Information
            'headquarters.max' => '본부는 :max자를 초과할 수 없습니다.',
            'business_office.max' => '사업소는 :max자를 초과할 수 없습니다.',
            'team.max' => '팀은 :max자를 초과할 수 없습니다.',
            'position.max' => '직책은 :max자를 초과할 수 없습니다.',
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
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => '입력값이 올바르지 않습니다.',
            'errors' => $validator->errors(),
        ], 422));
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Normalize phone and mobile numbers (remove hyphens for storage)
        $data = $this->all();

        if (isset($data['phone']) && ! empty($data['phone'])) {
            $data['phone'] = preg_replace('/[^0-9]/', '', $data['phone']);
        }

        if (isset($data['mobile']) && ! empty($data['mobile'])) {
            $data['mobile'] = preg_replace('/[^0-9]/', '', $data['mobile']);
        }

        $this->merge($data);
    }
}
