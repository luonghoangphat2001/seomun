<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; font-size: 14px; color: #333; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 40px auto; padding: 32px; border: 1px solid #eee; border-radius: 8px; }
        .title { font-size: 20px; font-weight: bold; margin-bottom: 24px; }
        .code-box { font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; background: #f5f5f5; padding: 20px; border-radius: 6px; margin: 24px 0; }
        .reset-btn { display: block; text-align: center; margin: 24px 0; }
        .reset-btn a { background: #f5c518; color: #222; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: bold; }
        .notice { font-size: 12px; color: #888; margin-top: 24px; }
        .footer { margin-top: 32px; font-size: 12px; color: #aaa; text-align: center; border-top: 1px solid #eee; padding-top: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="title">
            @if ($purpose === 'register') 회원가입 인증번호
            @elseif ($purpose === 'find_username') 아이디 찾기 인증번호
            @elseif ($purpose === 'reset_password') 비밀번호 재설정
            @else 인증번호 안내
            @endif
        </div>

        @if ($resetLink)
            <p>아래 버튼을 클릭하여 비밀번호를 재설정하거나, 인증번호를 직접 입력하세요.</p>
            <div class="reset-btn">
                <a href="{{ $resetLink }}">비밀번호 재설정하기</a>
            </div>
            <p style="text-align:center; color:#888; font-size:12px;">또는 아래 인증번호를 입력하세요.</p>
        @else
            <p>아래 인증번호를 입력하세요. 인증번호는 3분간 유효합니다.</p>
        @endif

        <div class="code-box">{{ $code }}</div>

        <div class="notice">
            본 메일은 발신 전용입니다. 인증번호를 요청하지 않으셨다면 이 메일을 무시하세요.
        </div>

        <div class="footer">Seomun &copy; {{ date('Y') }}</div>
    </div>
</body>
</html>
