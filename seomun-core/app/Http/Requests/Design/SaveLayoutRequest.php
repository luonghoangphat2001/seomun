<?php

namespace App\Http\Requests\Design;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveLayoutRequest extends FormRequest
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
            'layout_data' => [
                Rule::requiredIf(function () {
                    return $this->input('format') !== 'svg';
                }),
                'array',
            ],
            'svg_content' => [
                Rule::requiredIf(function () {
                    return $this->input('format') === 'svg';
                }),
                'string',
            ],
            'format' => ['sometimes', 'string', 'in:json,svg'],
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
            'layout_data.required' => 'json 형식일 경우 레이아웃 데이터는 필수입니다.',
            'layout_data.array' => '레이아웃 데이터는 배열이어야 합니다.',
            'svg_content.required' => 'svg 형식일 경우 SVG 내용은 필수입니다.',
            'svg_content.string' => 'SVG 내용은 문자열이어야 합니다.',
            'format.in' => '형식은 json 또는 svg이어야 합니다.',
        ];
    }
}
