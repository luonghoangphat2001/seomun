<?php

namespace App\Http\Requests\MyPage;

use App\Models\AddressBook;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChangeOrderShippingAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'address_book_id' => [
                'required',
                'integer',
                Rule::exists(AddressBook::class, 'id')->where('user_id', $this->user()->id),
            ],
        ];
    }
}
