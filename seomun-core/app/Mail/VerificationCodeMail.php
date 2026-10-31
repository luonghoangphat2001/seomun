<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerificationCodeMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $code,
        public string $purpose,
        public ?string $resetLink = null,
    ) {}

    public function envelope(): Envelope
    {
        $subject = match ($this->purpose) {
            'register'       => '[Seomun] 회원가입 인증번호',
            'find_username'  => '[Seomun] 아이디 찾기 인증번호',
            'reset_password' => '[Seomun] 비밀번호 재설정',
            default          => '[Seomun] 인증번호',
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.verification-code');
    }

    public function attachments(): array
    {
        return [];
    }
}
