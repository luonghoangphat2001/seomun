<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class TemplateMail extends Mailable
{
    public function __construct(
        private readonly string $mailSubject,
        private readonly string $mailContent,
        private readonly array $mailAttachments = [],
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->mailSubject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.template',
            with: [
                'content' => $this->mailContent,
            ],
        );
    }

    public function attachments(): array
    {
        return collect($this->mailAttachments)
            ->map(fn (string $path) => Attachment::fromPath($path))
            ->all();
    }
}