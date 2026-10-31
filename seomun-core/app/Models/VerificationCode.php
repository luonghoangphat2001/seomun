<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VerificationCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'identifier',
        'type',
        'code',
        'purpose',
        'attempts',
        'max_attempts',
        'expires_at',
        'verified_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'verified_at' => 'datetime',
        'attempts' => 'integer',
        'max_attempts' => 'integer',
    ];

    /**
     * Check if the verification code is valid
     */
    public function isValid(): bool
    {
        if ($this->verified_at !== null) {
            return false; // Already verified
        }

        if ($this->expires_at->isPast()) {
            return false; // Expired
        }

        if ($this->attempts >= $this->max_attempts) {
            return false; // Max attempts reached
        }

        return true;
    }

    /**
     * Increment attempt count
     */
    public function incrementAttempts(): void
    {
        $this->increment('attempts');
    }

    /**
     * Mark as verified
     */
    public function markAsVerified(): void
    {
        $this->update([
            'verified_at' => now(),
        ]);
    }

    /**
     * Generate a random 6-digit code
     */
    public static function generateCode(): string
    {
        return str_pad((string) rand(100000, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Create a new verification code
     */
    public static function createCode(string $identifier, string $type, string $purpose = 'find_username', int $expiresInMinutes = 10): self
    {
        // Invalidate any existing unverified codes for this identifier
        self::where('identifier', $identifier)
            ->where('type', $type)
            ->where('purpose', $purpose)
            ->whereNull('verified_at')
            ->where('expires_at', '>', now())
            ->update(['expires_at' => now()->subMinute()]);

        return self::create([
            'identifier' => $identifier,
            'type' => $type,
            'code' => self::generateCode(),
            'purpose' => $purpose,
            'expires_at' => now()->addMinutes($expiresInMinutes),
            'attempts' => 0,
            'max_attempts' => 5,
        ]);
    }
}
