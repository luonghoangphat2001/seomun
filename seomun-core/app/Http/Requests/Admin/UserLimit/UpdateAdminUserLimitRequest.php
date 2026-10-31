<?php

namespace App\Http\Requests\Admin\UserLimit;

use App\Enums\UserLimitStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdminUserLimitRequest extends FormRequest
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id', Rule::unique('user_limits')->ignore($this->route('user_limit'))],
            'limit' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'in:'.implode(',', array_column(UserLimitStatus::cases(), 'value'))],
        ];
    }
}
