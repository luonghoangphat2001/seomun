<?php

namespace App\Http\Requests\Order;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;

class ValidateOrderRequest extends StoreOrderRequest
{
    /**
     * Handle a failed validation attempt: return 200 with valid=false and errors
     * instead of throwing ValidationException (422).
     */
    protected function failedValidation(Validator $validator): void
    {
        $errors = collect($validator->errors())->map(function ($messages, $field) {
            return [
                'field' => $field,
                'message' => implode(' ', Arr::wrap($messages)),
            ];
        })->values()->all();

        $response = new JsonResponse([
            'success' => true,
            'data' => [
                'valid' => false,
                'warnings' => [],
                'errors' => $errors,
            ],
        ], 200);

        throw new ValidationException($validator, $response);
    }
}
