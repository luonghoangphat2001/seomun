<?php

namespace App\Http\Requests\Admin\Template;

use Illuminate\Foundation\Http\FormRequest;

class AdminTemplateCopyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'copy_title' => 'required|string|max:255',
            'copy_layers' => 'nullable|boolean',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->filled('copy_title') && $this->filled('name')) {
            $this->merge(['copy_title' => $this->input('name')]);
        }
    }
}
