<?php

namespace App\Http\Requests\Admin\UserLimit;

use App\Enums\UserLimitStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreAdminUserLimitRequest extends FormRequest
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
        $UserLimitStatusValues = array_column(UserLimitStatus::cases(), 'value');

        return [
            'user_id' => ['required', 'unique:user_limits,user_id', 'exists:users,id'],
            'limit' => ['required', 'numeric', 'min:0'],
            'remaining_amount' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'in:'.implode(',', $UserLimitStatusValues)],
        ];
    }
}
