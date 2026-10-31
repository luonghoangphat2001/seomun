<?php

namespace App\Services;

use App\Models\AccessLog;
use App\Models\ProxyLoginSession;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class ProxyLoginService
{
    /** Create a one-time code that will only travel in an HttpOnly cookie. */
    public function start(User $admin, User $target, Request $request): array
    {
        $handoffCode = $this->generateHandOffCode();
        $handoffExpiresAt = now()->addMinutes((int) config('sanctum.proxy_login_handoff_expiration', 2));

        $session = DB::transaction(function () use ($admin, $target, $request, $handoffCode, $handoffExpiresAt): ProxyLoginSession {
            $session = ProxyLoginSession::create([
                'admin_user_id' => $admin->id,
                'target_user_id' => $target->id,
                'handoff_token_hash' => $this->getHandOffToken($handoffCode),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'expires_at' => $handoffExpiresAt,
            ]);

            AccessLog::create([
                'user_id' => $target->id,
                'login_id' => $target->username,
                'ip_address' => $request->ip() ?? '0.0.0.0',
                'browser_info' => $request->userAgent() ? substr($request->userAgent(), 0, 255) : null,
                'user_agent' => $request->userAgent(),
                'event_type' => 'proxy_login',
                'management' => 'Proxy Login Handoff',
                'explanation' => "Admin #{$admin->id} ({$admin->username}): Login as customer",
                'connection_time' => now(),
                'access_date' => now()->toDateString(),
            ]);

            activity('proxy_login')
                ->causedBy($admin)
                ->performedOn($target)
                ->event('proxy_login_started')
                ->withProperties([
                    'proxy_login_session_id' => $session->id,
                    'handoff_expires_at' => $handoffExpiresAt->toIso8601String(),
                ])
                ->log('Administrator started a proxy login handoff.');

            return $session;
        });

        return ['session' => $session, 'handoff_code' => $handoffCode];
    }

    /** Consume the one-time code and issue a short-lived customer bearer token. */
    public function exchange(string $handoffCode, Request $request): array
    {
        return DB::transaction(function () use ($handoffCode, $request): array {
            $session = ProxyLoginSession::query()
                ->where('handoff_token_hash', $this->getHandOffToken($handoffCode))
                ->lockForUpdate()
                ->first();

            if (! $session || ! $session->isPendingHandoff()) {
                abort(401, 'Proxy login handoff is invalid or expired.');
            }

            $target = User::find($session->target_user_id);
            if (! $target || ! $target->isUser() || ! $target->isActive()) {
                abort(422, 'The customer account is no longer available for proxy login.');
            }

            $tokenExpiresAt = now()->addMinutes((int) config('sanctum.proxy_login_expiration', 60));
            $newToken = $target->createToken('proxy-login:admin-'.$session->admin_user_id, ['*'], $tokenExpiresAt);

            $session->update([
                'personal_access_token_id' => $newToken->accessToken->id,
                'handoff_consumed_at' => now(),
                'expires_at' => $tokenExpiresAt,
                'ip_address' => $request->ip() ?? $session->ip_address,
                'user_agent' => $request->userAgent() ?? $session->user_agent,
            ]);

            return [
                'session' => $session->fresh(),
                'access_token' => $newToken->plainTextToken,
                'expires_in' => now()->diffInSeconds($tokenExpiresAt),
            ];
        });
    }

    /** Return the proxy session for the current Sanctum token, if any. */
    public function currentSession(User $target): ?ProxyLoginSession
    {
        $token = $target->currentAccessToken();
        if (! $token) {
            return null;
        }

        return ProxyLoginSession::query()
            ->where('personal_access_token_id', $token->id)
            ->where('target_user_id', $target->id)
            ->whereNotNull('handoff_consumed_at')
            ->whereNull('ended_at')
            ->where('expires_at', '>', now())
            ->first();
    }

    public function end(ProxyLoginSession $session, User $admin): void
    {
        DB::transaction(function () use ($session, $admin): void {
            if ($session->ended_at !== null) {
                return;
            }

            if ($session->personal_access_token_id) {
                PersonalAccessToken::whereKey($session->personal_access_token_id)->delete();
            }
            $session->update(['ended_at' => now()]);

            activity('proxy_login')
                ->causedBy($admin)
                ->performedOn($session->targetUser)
                ->event('proxy_login_ended')
                ->withProperties(['proxy_login_session_id' => $session->id])
                ->log('Administrator ended a proxy login session.');
        });
    }

    private function getHandOffToken(string $handoffCode): string
    {
        return hash('sha256', $handoffCode);
    }

    private function generateHandOffCode(): string
    {
        return Str::random(64);
    }
}
