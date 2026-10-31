<?php

namespace App\Http\Requests\Admin\Pricing;

use App\Enums\PricingCalculatorType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PricingProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:100', Rule::unique('pricing_profiles', 'code')->ignore($this->route('pricingProfile'))],
            'name' => ['required', 'string', 'max:255'],
            'calculator_type' => ['required', Rule::in(PricingCalculatorType::values())],
            'settings' => ['nullable', 'array'],
            'settings.supported_structures' => ['nullable', 'array'],
            'settings.supported_structures.*' => ['string', Rule::in(['single', 'cover_inner'])],
            'settings.required_option_group_codes' => ['nullable', 'array'],
            'settings.required_option_group_codes.*' => ['string', 'max:100'],
            'settings.allowed_option_group_codes' => ['nullable', 'array'],
            'settings.allowed_option_group_codes.*' => ['string', 'max:100'],
            'settings.sections' => ['required_if:calculator_type,paper_print', 'array'],
            'settings.sections.*.paper_option_group' => ['required_with:settings.sections', 'string', 'max:100'],
            'settings.sections.*.side_option_group' => ['nullable', 'string', 'max:100'],
            'settings.sections.*.page_count_field' => ['nullable', 'string', 'max:100'],
            'settings.sections.*.printing_price_id' => ['required_with:settings.sections', 'integer', 'exists:printing_prices,id'],
            'settings.custom_size' => ['nullable', 'array'],
            'settings.custom_size.enabled' => ['nullable', 'boolean'],
            'settings.custom_size.min_width_mm' => ['required_if:settings.custom_size.enabled,true', 'integer', 'min:1'],
            'settings.custom_size.max_width_mm' => ['required_if:settings.custom_size.enabled,true', 'integer', 'gte:settings.custom_size.min_width_mm'],
            'settings.custom_size.min_height_mm' => ['required_if:settings.custom_size.enabled,true', 'integer', 'min:1'],
            'settings.custom_size.max_height_mm' => ['required_if:settings.custom_size.enabled,true', 'integer', 'gte:settings.custom_size.min_height_mm'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
