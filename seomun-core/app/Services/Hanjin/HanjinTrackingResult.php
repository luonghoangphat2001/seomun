<?php

namespace App\Services\Hanjin;

class HanjinTrackingResult
{
    /**
     * @param  array<int, array<string, mixed>>  $history
     * @param  array<string, mixed>  $raw
     */
    public function __construct(
        public readonly string $invoiceNumber,
        public readonly ?string $latestStatusCode,
        public readonly ?string $latestStatusName,
        public readonly ?\DateTimeInterface $latestStatusAt,
        public readonly bool $isTerminal,
        public readonly array $history,
        public readonly array $raw,
        public readonly ?string $resultCode = null,
        public readonly ?string $resultMessage = null,
    ) {}

    public function hasData(): bool
    {
        return $this->latestStatusCode !== null;
    }

    public function isError(): bool
    {
        return $this->resultCode !== null && $this->resultCode !== 'OK';
    }
}
