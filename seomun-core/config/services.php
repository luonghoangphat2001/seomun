<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'twilio' => [
        'account_sid' => env('TWILIO_ACCOUNT_SID'),
        'auth_token' => env('TWILIO_AUTH_TOKEN'),
        'from_number' => env('TWILIO_FROM_NUMBER'),
    ],

    /* Legacy CoolSMS/Solapi config retained for rollback reference.
    'coolsms' => [
        'api_key' => env('COOLSMS_API_KEY'),
        'api_secret' => env('COOLSMS_API_SECRET'),
        'sender_number' => env('COOLSMS_SENDER_NUMBER'),
    ],
    */

    'design_review' => [
        'user_url' => env('DESIGN_REVIEW_USER_URL', 'https://www.print-ly.co.kr/ko/design-review'),
        'expiration_minutes' => (int) env('DESIGN_REVIEW_LINK_EXPIRATION', 10080),
    ],

    'kakao' => [
        'client_id'     => env('KAKAO_CLIENT_ID'),
        'client_secret' => env('KAKAO_CLIENT_SECRET'),
        'redirect'      => env('KAKAO_REDIRECT_URI'),
    ],

    'naver' => [
        'client_id'     => env('NAVER_CLIENT_ID'),
        'client_secret' => env('NAVER_CLIENT_SECRET'),
        'redirect'      => env('NAVER_REDIRECT_URI'),
    ],

    'hanjin' => [
        'base_url'        => env('HANJIN_BASE_URL', 'https://api-stg.hanjin.com'),
        'auth_url'        => env('HANJIN_AUTH_URL', 'https://api-stg.hanjin.com/v1/util/hmacgen'),
        'tracking_url'    => env('HANJIN_TRACKING_URL', 'https://api-stg.hanjin.com/parcel-delivery/v1/tracking/tracking-wbl'),
        'client_id'       => env('HANJIN_CLIENT_ID', 'SEOMUN'),
        'x_api_key'       => env('HANJIN_X_API_KEY'),
        'hmac_secret'     => env('HANJIN_HMAC_SECRET'),
        'cust_edi_cd'     => env('HANJIN_CUST_EDI_CD', 'SEOMUN'),
        'timeout'         => (int) env('HANJIN_TIMEOUT', 15),
        'connect_timeout' => (int) env('HANJIN_CONNECT_TIMEOUT', 5),
    ],

];
