<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DielineDownloadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'trim_width_mm' => ['required', 'numeric', 'min:10', 'max:2000'],
            'trim_height_mm' => ['required', 'numeric', 'min:10', 'max:2000'],
            'type' => ['nullable', 'string', 'in:single_sheet,booklet'],
            'booklet_part' => ['nullable', 'string', 'in:cover,inner,all'],
            'spine_thickness_mm' => ['required_if:type,booklet', 'numeric', 'min:0', 'max:100'],
            'delivery' => ['nullable', 'string', 'in:download,url'],
        ];
    }
}
