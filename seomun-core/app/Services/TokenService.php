<?php

namespace App\Services;

use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Support\Str;

class TokenService
{
    /**
     * Create access token and refresh token
     */
    public function createTokens(User $user, ?string $deviceName = null): array
    {
        // Get expiration from config (default 15 minutes)
        $accessTokenExpiration = (int) config('sanctum.expiration', 15);

        // Create access token with expiration
        $accessToken = $user->createToken(
            $deviceName ?? 'auth_token',
            ['*'],
            now()->addMinutes($accessTokenExpiration)
        )->plainTextToken;

        // Create refresh token (7 days)
        $refreshToken = $this->createRefreshToken($user, $deviceName);

        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken['token'],
            'expires_in' => $accessTokenExpiration * 60, // seconds
            'refresh_expires_in' => 7 * 24 * 60 * 60, // 7 days in seconds
        ];
    }

    /**
     * Create refresh token
     */
    private function createRefreshToken(User $user, ?string $deviceName = null): array
    {
        $token = Str::random(64);

        $refreshToken = RefreshToken::create([
            'user_id' => $user->id,
            'token' => hash('sha256', $token),
            'device_name' => $deviceName ?? 'unknown',
            'ip_address' => request()->ip(),
            'expires_at' => now()->addDays(7),
        ]);

        return [
            'token' => $token, // Plain text token (only shown once)
            'id' => $refreshToken->id,
        ];
    }

    /**
     * Refresh access token using refresh token
     */
    public function refreshAccessToken(string $refreshToken): ?array
    {
        $hashedToken = hash('sha256', $refreshToken);

        $token = RefreshToken::where('token', $hashedToken)
            ->where('expires_at', '>', now())
            ->with('user')
            ->first();

        if (! $token || ! $token->isValid()) {
            return null;
        }

        $user = $token->user;

        // Update last used
        $token->update(['last_used_at' => now()]);

        // Get expiration from config
        $accessTokenExpiration = (int) config('sanctum.expiration', 15);

        // Create new access token
        $accessToken = $user->createToken(
            $token->device_name ?? 'auth_token',
            ['*'],
            now()->addMinutes($accessTokenExpiration)
        )->plainTextToken;

        return [
            'access_token' => $accessToken,
            'expires_in' => $accessTokenExpiration * 60,
        ];
    }

    /**
     * Revoke refresh token
     */
    public function revokeRefreshToken(string $refreshToken): bool
    {
        $hashedToken = hash('sha256', $refreshToken);

        $token = RefreshToken::where('token', $hashedToken)->first();

        if ($token) {
            $token->delete();

            return true;
        }

        return false;
    }

    /**
     * Revoke all refresh tokens for user
     */
    public function revokeAllUserTokens(User $user): void
    {
        RefreshToken::where('user_id', $user->id)->delete();
        $user->tokens()->delete();
    }
}
