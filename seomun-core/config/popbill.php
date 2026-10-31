<?php

return [
    'enabled' => (bool) env('POPBILL_BANK_ENABLED', false),
    'test' => (bool) env('POPBILL_TEST', true),
    'link_id' => env('POPBILL_LINK_ID'),
    'secret_key' => env('POPBILL_SECRET_KEY'),
    'corp_num' => env('POPBILL_CORP_NUM'),
    'user_id' => env('POPBILL_USER_ID'),
    'sms_enabled' => (bool) env('POPBILL_SMS_ENABLED', false),
    'sms_sender_number' => env('POPBILL_SMS_SENDER_NUMBER'),
    // Account registration and bank lookup passwords are managed in POPBiLL.
    'accounts' => [
        'woori' => [
            'bank_code' => '0020',
            'bank_name' => 'Woori Bank',
            'number' => env('POPBILL_WOORI_ACCOUNT_NUMBER'),
            'holder' => env('POPBILL_WOORI_ACCOUNT_HOLDER'),
        ],
        'hana' => [
            'bank_code' => '0081',
            'bank_name' => 'Hana Bank',
            'number' => env('POPBILL_HANA_ACCOUNT_NUMBER'),
            'holder' => env('POPBILL_HANA_ACCOUNT_HOLDER'),
        ],
        'im' => [
            'bank_code' => '0031',
            'bank_name' => 'iM Bank',
            'number' => env('POPBILL_IM_ACCOUNT_NUMBER'),
            'holder' => env('POPBILL_IM_ACCOUNT_HOLDER'),
        ],
    ],
];
