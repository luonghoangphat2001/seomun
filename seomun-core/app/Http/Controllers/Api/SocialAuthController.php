<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Enums\UserAuthority;
use App\Enums\UserRegistrationPath;
use App\Enums\UserStatus;
use App\Models\AccessLog;
use App\Models\User;
use App\Services\MembershipService;
use App\Services\TokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function __construct(
        protected TokenService $tokenService,
        protected MembershipService $membershipService,
    ) {}

    /**
     * GET /api/auth/social/{provider}/redirect-url
     *
     * Returns the OAuth redirect URL. FE redirects the user to this URL.
     */
    public function redirectUrl(string $provider): JsonResponse
    {
        $this->validateProvider($provider);

        $url = Socialite::driver($provider)
            ->stateless()
            ->redirect()
            ->getTargetUrl();

        return response()->json([
            'success' => true,
            'data'    => ['redirect_url' => $url],
        ]);
    }

    /**
     * POST /api/auth/social/{provider}/callback
     *
     * FE sends the OAuth `code` received from the provider.
     * BE exchanges it for user info, finds or creates the user, returns tokens.
     */
    public function callback(Request $request, string $provider): JsonResponse
    {
        $this->validateProvider($provider);

        $request->validate([
            'code' => 'required|string',
        ]);

        try {
            // Exchange code → access token → social user info
            $driver = Socialite::driver($provider)->stateless();

            $tokenData = $driver->getAccessTokenResponse(
                $request->input('code')
            );

            $socialUser = $driver->userFromToken(
                $tokenData['access_token']
            );

            $name = $socialUser->getName()
                ?: $socialUser->getNickname()
                ?: '회원';

            $socialId = (string) $socialUser->getId();

            $socialKey = $provider . '_id';

            // Generate short unique username
            $username = $provider . '_' . substr(
                hash('sha256', $socialId),
                0,
                16
            );

            $email = $socialUser->getEmail();

            // If email is not provided, generate a fake one
            if (! $email) {
                $email = $username . '@social.local';
            }

            DB::beginTransaction();

            // 1. Find existing user by social ID
            $user = User::whereJsonContains(
                'metadata->social',
                [$socialKey => $socialId]
            )->first();

            // 2. If social ID is not linked, find user by email
            if (! $user) {
                $user = User::where('email', $email)->first();
            }

            // 3. Create new social user if not found
            if (! $user) {
                $user = User::create([
                    'name'              => $name,
                    'email'             => $email,
                    'username'          => $username,
                    'password'          => bcrypt(Str::random(32)),
                    'status'            => UserStatus::ACTIVE->value,
                    'authority'         => UserAuthority::USER->value,
                    'registration_path' => UserRegistrationPath::SOCIAL_LOGIN->value,
                    'metadata'          => [
                        'social' => [
                            $socialKey => $socialId,
                        ],
                    ],
                ]);

                $this->membershipService->assignDefaultTier($user);
            } else {
                // 4. Existing user → link social ID
                $metadata = $user->metadata ?? [];
                $social = $metadata['social'] ?? [];

                if (($social[$socialKey] ?? null) !== $socialId) {
                    $social[$socialKey] = $socialId;

                    $metadata['social'] = $social;

                    $user->metadata = $metadata;
                    $user->save();
                }
            }

            // Block inactive/blocked accounts
            if ($user->status !== UserStatus::ACTIVE) {
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => match ($user->status) {
                        UserStatus::INACTIVE  => '계정이 비활성화 상태입니다.',
                        UserStatus::BLOCKED   => '계정이 차단되었습니다.',
                        UserStatus::WITHDRAWN => '탈퇴한 계정입니다.',
                        default               => '로그인할 수 없는 계정입니다.',
                    },
                ], 403);
            }

            $tokens = $this->tokenService->createTokens(
                $user,
                $provider . '_social'
            );

            DB::commit();

            $this->logAccess(
                $request,
                'social_login',
                $user,
                $provider
            );

            return response()->json([
                'success' => true,
                'message' => '로그인에 성공했습니다.',
                'data' => [
                    'user'               => $this->formatUserData($user),
                    'access_token'       => $tokens['access_token'],
                    'refresh_token'      => $tokens['refresh_token'],
                    'token_type'         => 'Bearer',
                    'expires_in'         => $tokens['expires_in'],
                    'refresh_expires_in' => $tokens['refresh_expires_in'],
                ],
            ]);
        } catch (\Throwable $e) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }

            return response()->json([
                'success' => false,
                'message' => '소셜 로그인 중 오류가 발생했습니다.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/auth/social/{provider}/callback-direct
     *
     * For testing only — Kakao/Naver redirects directly to BE.
     * BE handles the callback and returns JSON with tokens.
     */
    public function callbackDirect(Request $request, string $provider): JsonResponse
    {
        $request->merge(['code' => $request->query('code')]);

        return $this->callback($request, $provider);
    }

    private function validateProvider(string $provider): void
    {
        if (! in_array($provider, ['kakao', 'naver'], true)) {
            abort(404, '지원하지 않는 소셜 로그인입니다.');
        }
    }

    private function formatUserData(User $user): array
    {
        $authorityEnum = $user->getAuthorityEnum();

        return [
            'id'               => $user->id,
            'status'           => $user->status,
            'member_type'      => $user->member_type,
            'username'         => $user->username,
            'name'             => $user->name,
            'email'            => $user->email,
            'phone'            => $user->phone,
            'mobile'           => $user->mobile,
            'postcode'         => $user->postcode,
            'address'          => $user->address,
            'detailed_address' => $user->detailed_address,
            'authority'        => $user->authority,
            'role'             => $user->authority,
            'is_admin'         => $authorityEnum?->isAdmin() ?? false,
            'is_super_admin'   => $authorityEnum?->isSuperAdmin() ?? false,
            'is_store_admin'   => $user->isStoreAdmin(),
            'is_normal_user'   => $authorityEnum === UserAuthority::USER,
            'customer_id'      => $user->customer_id,
        ];
    }

    private function logAccess(Request $request, string $eventType, User $user, string $provider): void
    {
        try {
            AccessLog::create([
                'user_id'    => $user->id,
                'event_type' => $eventType,
                'login_id'   => $provider,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (\Throwable) {
            // Non-critical, do not break the login flow
        }
    }
}
