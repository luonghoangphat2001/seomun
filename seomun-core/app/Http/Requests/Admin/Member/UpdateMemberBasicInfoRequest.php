<?php

namespace App\Http\Requests\Admin\Member;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMemberBasicInfoRequest extends FormRequest
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
        $memberId = $this->route('id');

return [
            'name' => 'required|string|max:100',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($memberId),
            ],
            'phone' => 'nullable|string|max:20|regex:/^[0-9-]+$/',
            'mobile' => 'nullable|string|max:20|regex:/^[0-9-]+$/',
            'postcode' => 'nullable|string|max:10',
            'address' => 'nullable|string|max:255',
            'detailed_address' => 'nullable|string|max:255',
            'note' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => '이름은 필수입니다.',
            'email.required' => '이메일은 필수입니다.',
            'email.email' => '올바른 이메일 형식이 아닙니다.',
            'email.unique' => '이미 사용 중인 이메일입니다.',
            'phone.regex' => '올바른 전화번호 형식이 아닙니다.',
            'mobile.regex' => '올바른 휴대폰 번호 형식이 아닙니다.',
        ];
    }
}
