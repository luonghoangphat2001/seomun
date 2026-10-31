<?php

namespace App\Services;

use App\Mail\TemplateMail;
use Illuminate\Support\Facades\Mail;

class MailService
{
    public function send(
        string $email,
        string $subject,
        string $content,
        ?string $recipientName = null,
        array $attachments = [],
    ): bool {
        Mail::to($email, $recipientName)
            ->send(
                new TemplateMail(
                    mailSubject: $subject,
                    mailContent: $content,
                    mailAttachments: $attachments,
                )
            );

        return true;
    }
}
