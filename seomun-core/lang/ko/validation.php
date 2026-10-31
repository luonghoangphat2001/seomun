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

    'required' => ':attribute 필드는 필수입니다.',
    'string' => ':attribute 필드는 문자열이어야 합니다.',
    'email' => ':attribute 필드는 유효한 이메일 주소여야 합니다.',
    'unique' => ':attribute은(는) 이미 사용 중입니다.',
    'exists' => '선택한 :attribute이(가) 유효하지 않습니다.',
    'min' => [
        'string' => ':attribute 필드는 최소 :min자여야 합니다.',
        'numeric' => ':attribute 필드는 최소 :min이어야 합니다.',
    ],
    'max' => [
        'string' => ':attribute 필드는 :max자를 초과할 수 없습니다.',
        'numeric' => ':attribute 필드는 :max를 초과할 수 없습니다.',
    ],
    'regex' => ':attribute 필드 형식이 유효하지 않습니다.',
    'confirmed' => ':attribute 확인이 일치하지 않습니다.',
    'boolean' => ':attribute 필드는 true 또는 false여야 합니다.',
    'accepted' => ':attribute을(를) 동의해야 합니다.',
    'nullable' => ':attribute 필드는 선택 사항입니다.',

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
        'username' => '아이디',
        'email' => '이메일',
        'password' => '비밀번호',
        'password_confirmation' => '비밀번호 확인',
        'name' => '이름',
        'phone' => '전화번호',
        'mobile' => '휴대폰',
        'postcode' => '우편번호',
        'address' => '주소',
        'detailed_address' => '상세주소',
        'authority' => '권한',
        'headquarters' => '본부',
        'business_office' => '사업소',
        'team' => '팀',
        'position' => '직책',
        'agree_privacy' => '개인정보취급방침',
        'agree_terms' => '이용약관',
    ],

];
