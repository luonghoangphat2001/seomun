<?php

namespace App\Http\Requests\MyPage;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class ConvertToBusinessMemberRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'company_name' => 'required|string|max:200',
            'business_registration_number' => 'required|string|max:20|unique:customers,business_registration_number',
            'representative_name' => 'required|string|max:100',
            'industry_type' => 'nullable|string|max:100',
            'business_type' => 'nullable|string|max:100',
            'business_postcode' => 'required|string|max:10',
            'business_address' => 'required|string|max:255',
            'business_address_detail' => 'nullable|string|max:255',
            'tax_invoice_email' => 'nullable|email|max:255',
            'homepage_url' => 'nullable|url|max:255',
            'business_registration_file' =>  'required|file|mimes:pdf,jpg,jpeg,png|max:10240'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'company_name.required' => '기업명을 입력해주세요.',
            'business_registration_number.required' => '사업자등록번호를 입력해주세요.',
            'business_registration_number.unique' => '이미 등록된 사업자등록번호입니다.',
            'representative_name.required' => '대표자명을 입력해주세요.',
            'business_postcode.required' => '기업 우편번호를 입력해주세요.',
            'business_address.required' => '기업 주소를 입력해주세요.',
            'business_registration_file.required' => '사업자등록증을 업로드해주세요.',
            'business_registration_file.mimes' => '사업자등록증은 PDF, JPG, PNG 형식만 가능합니다.',
            'business_registration_file.max' => '파일 크기는 10MB를 초과할 수 없습니다.',
            'tax_invoice_email.email' => '올바른 이메일 형식을 입력해주세요.',
            'homepage_url.url' => '올바른 URL 형식을 입력해주세요.',
        ];
    }

    /**
     * Handle a failed validation attempt.
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
}