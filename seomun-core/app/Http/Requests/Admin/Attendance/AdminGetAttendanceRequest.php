<?php

namespace App\Http\Requests\Admin\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class AdminGetAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id'    => 'nullable|integer|exists:users,id',
            'date_from'  => 'nullable|date',
            'date_to'    => 'nullable|date|after_or_equal:date_from',
            'status'     => 'nullable|string|in:present,absent,late,half_day,vacation',
            'per_page'   => 'nullable|integer|between:1,100',
        ];
    }
}
