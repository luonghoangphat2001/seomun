<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines contain the default error messages used by
    | the validator class.
    |
    */

    'required' => 'The :attribute field is required.',
    'string' => 'The :attribute field must be a string.',
    'email' => 'The :attribute field must be a valid email address.',
    'unique' => 'The :attribute has already been taken.',
    'exists' => 'The selected :attribute is invalid.',
    'min' => [
        'string' => 'The :attribute field must be at least :min characters.',
        'numeric' => 'The :attribute field must be at least :min.',
    ],
    'max' => [
        'string' => 'The :attribute field must not be greater than :max characters.',
        'numeric' => 'The :attribute field must not be greater than :max.',
    ],
    'regex' => 'The :attribute field format is invalid.',
    'confirmed' => 'The :attribute field confirmation does not match.',
    'boolean' => 'The :attribute field must be true or false.',
    'accepted' => 'The :attribute field must be accepted.',
    'nullable' => 'The :attribute field is optional.',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    |
    | The following language lines are used to swap our attribute placeholder
    | with something more reader friendly.
    |
    */

    'attributes' => [
        'username' => 'username',
        'email' => 'email',
        'password' => 'password',
        'password_confirmation' => 'password confirmation',
        'name' => 'name',
        'phone' => 'phone',
        'mobile' => 'mobile',
        'postcode' => 'postcode',
        'address' => 'address',
        'detailed_address' => 'detailed address',
        'authority' => 'authority',
        'headquarters' => 'headquarters',
        'business_office' => 'business office',
        'team' => 'team',
        'position' => 'position',
        'agree_privacy' => 'privacy policy',
        'agree_terms' => 'terms of service',
    ],

];
