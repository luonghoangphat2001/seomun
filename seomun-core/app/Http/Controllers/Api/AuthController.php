<?php

namespace App\Http\Controllers\Api;

use App\Enums\ApprovalStatus;
use App\Enums\CustomerStatus;
use App\Enums\FileType;
use App\Enums\UserAuthority;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\ChangePhoneRequest;
use App\Http\Requests\Auth\FindUsernameRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordWithCodeRequest;
use App\Http\Requests\Auth\SendChangePhoneVerificationCodeRequest;
use App\Http\Requests\Auth\SendVerificationCodeRequest;
use App\Http\Requests\Auth\VerifyVerificationCodeRequest;
use App\Jobs\SendVerificationCodeSmsJob;
use App\Mail\VerificationCodeMail;
use App\Models\AccessLog;
use App\Models\Customer;
use App\Models\User;
use App\Models\VerificationCode;
use App\Services\FileService;
use App\Services\MembershipService;
use App\Services\OrganizationChartService;
use App\Services\PointTransactionService;
use App\Services\TokenService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function __construct(
        protected TokenService $tokenService,
        protected OrganizationChartService $organizationChartService,
        protected PointTransactionService $pointTransactionService,
        protected MembershipService $membershipService,
        protected FileService $fileService
    ) {}

    /**
     * Get organization options for registration form (조직 코드 선택 옵션)
     */
    public function organizationOptions(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                // When set, uses the same tenant filter as GET /api/store-admin/organization-chart
                'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
                // Customer access code (고객 접속코드) — resolves to customer_id for dropdown without duplicates across tenants
                'access_code' => ['nullable', 'string', 'max:20'],
            ]);

            $customerId = isset($validated['customer_id']) ? (int) $validated['customer_id'] : null;

            if (! empty($validated['access_code'])) {
                $customer = Customer::query()
                    ->where('access_code', $validated['access_code'])
                    ->first();

                if (! $customer) {
                    return response()->json([
                        'success' => false,
                        'message' => '유효하지 않은 접속코드입니다.',
                        'detail' => 'access_code를 확인해주세요.',
                    ], 422);
                }

                if ($customerId !== null && $customerId !== (int) $customer->id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'customer_id와 access_code가 일치하지 않습니다.',
                    ], 422);
                }

                $customerId = (int) $customer->id;
            }

            if ($customerId !== null) {
                $units = $this->organizationChartService->getOrganizationUnitsScopedLikeChart($customerId);
            } else {
                $units = $this->organizationChartService->getOrganizationUnitsUnscoped();
            }

            $organizations = $this->organizationChartService->mapUnitsToOrganizationOptions($units);

            return response()->json([
                'success' => true,
                'data' => [
                    'organizations' => $organizations,
                    'meta' => [
                        'scope' => $customerId !== null ? 'customer' : 'all_tenants',
                        'customer_id' => $customerId,
                        'access_code' => $validated['access_code'] ?? null,
                    ],
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Register a new user
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();
            $validated = $request->validated();
            $validated = $this->normalizePhoneNumbers($validated);
            $validated['authority'] = UserAuthority::USER->value;

            $this->assertMobileVerified($validated['mobile']);

            $customerId = ($validated['member_type'] ?? 'individual') === 'business'
                ? $this->createCustomerForBusinessSignup($request, $validated)
                : null;

            $user = $this->createUserFromRegistration($validated, $customerId);

            $this->membershipService->assignDefaultTier($user);

            if ($user->isUser()) {
                $this->pointTransactionService->awardSignupReward($user, null);
            }
            $tokens = $this->tokenService->createTokens($user, $request->input('device_name'));
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => '회원가입이 완료되었습니다.',
                'data' => [
                    'user' => $this->formatUserData($user),
                    'access_token' => $tokens['access_token'],
                    'refresh_token' => $tokens['refresh_token'],
                    'token_type' => 'Bearer',
                    'expires_in' => $tokens['expires_in'],
                    'refresh_expires_in' => $tokens['refresh_expires_in'],
                ],
            ], 201);
        } catch (HttpResponseException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '회원가입 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Login user
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $credentials = [
                'username' => $validated['username'],
                'password' => $validated['password'],
            ];

            if (! Auth::attempt($credentials, $request->input('remember', false))) {
                $this->logAccess($request, 'login_failed', null, $validated['username'], 'Invalid credentials');

                return response()->json([
                    'success' => false,
                    'message' => '아이디 또는 비밀번호가 일치하지 않습니다.',
                ], 401);
            }

            $user = Auth::user();

            if ($user->status !== UserStatus::ACTIVE) {
                Auth::logout();

                return response()->json([
                    'success' => false,
                    'message' => match ($user->status) {
                        UserStatus::INACTIVE => '계정이 비활성화 상태입니다.',
                        UserStatus::BLOCKED => '계정이 차단되었습니다.',
                        default => '로그인할 수 없는 계정입니다.',
                    },
                ], 403);
            }

            \Illuminate\Support\Facades\DB::table('users')
                ->where('id', $user->id)
                ->update([
                    'last_login_at' => now(),
                    'last_login_ip' => $request->ip(),
                ]);

            $tokens = $this->tokenService->createTokens($user, $request->input('device_name'));

            return response()->json([
                'success' => true,
                'message' => '로그인에 성공했습니다.',
                'data' => [
                    'user' => $this->formatUserData($user),
                    'access_token' => $tokens['access_token'],
                    'refresh_token' => $tokens['refresh_token'],
                    'token_type' => 'Bearer',
                    'expires_in' => $tokens['expires_in'],
                    'refresh_expires_in' => $tokens['refresh_expires_in'],
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '로그인 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $this->logAccess($request, 'logout', $user, $user->username);

            // Delete current access token
            $user->currentAccessToken()->delete();

            // Optionally revoke refresh token if provided
            if ($request->has('refresh_token')) {
                $this->tokenService->revokeRefreshToken($request->input('refresh_token'));
            }

            return response()->json([
                'success' => true,
                'message' => '로그아웃되었습니다.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '로그아웃 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Refresh access token using refresh token
     */
    public function refresh(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'refresh_token' => 'required|string',
            ]);

            $result = $this->tokenService->refreshAccessToken($request->input('refresh_token'));

            if (! $result) {
                return response()->json([
                    'success' => false,
                    'message' => '리프레시 토큰이 유효하지 않거나 만료되었습니다.',
                ], 401);
            }

            return response()->json([
                'success' => true,
                'message' => '액세스 토큰이 갱신되었습니다.',
                'data' => [
                    'access_token' => $result['access_token'],
                    'token_type' => 'Bearer',
                    'expires_in' => $result['expires_in'],
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '토큰 갱신 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get current authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $this->formatUserData($user, true),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '사용자 정보를 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send verification code (인증번호 전송)
     */
    public function sendVerificationCode(SendVerificationCodeRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $purpose = $validated['purpose'] === 'find_id' ? 'find_username' : $validated['purpose'];
            $type = $validated['type'];

            $normalizedIdentifier = $this->resolveNormalizedIdentifier($type, $validated);
            if (! $normalizedIdentifier) {
                return $this->identifierMissingResponse($type);
            }

            $user = null;
            if ($purpose !== 'register') {
                $user = $this->lookupUserForPurpose($purpose, $type, $normalizedIdentifier, $validated);
                if (! $user) {
                    return response()->json(['success' => false, 'message' => '일치하는 사용자를 찾을 수 없습니다.'], 404);
                }
            }

            $verificationCode = VerificationCode::createCode($normalizedIdentifier, $type, $purpose, 3);

            $this->dispatchVerificationCode($type, $normalizedIdentifier, $verificationCode->code, $purpose, $user);

            $responseData = [
                'identifier' => $normalizedIdentifier,
                'type'       => $type,
                'purpose'    => $validated['purpose'],
                'expires_at' => $verificationCode->expires_at,
            ];

            if (app()->environment(['local', 'staging', 'testing'])) {
                $responseData['code']          = $verificationCode->code;
                $responseData['debug_notice']  = '비프로덕션 환경에서만 응답에 인증번호가 포함됩니다.';
            }

            return response()->json(['success' => true, 'message' => '인증번호가 전송되었습니다.', 'data' => $responseData], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => '인증번호 전송 중 오류가 발생했습니다.', 'error' => $e->getMessage()], 500);
        }
    }

    private function findVerifiedCode(string $identifier, string $type, string $purpose, string $code): ?VerificationCode
    {
        return VerificationCode::where('identifier', $identifier)
            ->where('type', $type)
            ->where('purpose', $purpose)
            ->where('code', $code)
            ->whereNotNull('verified_at')
            ->where('expires_at', '>', now())
            ->orderBy('created_at', 'desc')
            ->first();
    }

    private function resolveNormalizedIdentifier(string $type, array $validated): ?string
    {
        if ($type === 'business') {
            return $validated['business_registration_number'] ?? null;
        }

        $raw = $type === 'email' ? ($validated['email'] ?? null) : ($validated['mobile'] ?? null);

        return $this->normalizeIdentifier($type, $raw);
    }

    private function identifierMissingResponse(string $type): JsonResponse
    {
        $detail = match ($type) {
            'email'    => '이메일을 입력해주세요.',
            'mobile'   => '핸드폰 번호를 입력해주세요.',
            'business' => '사업자번호를 입력해주세요.',
            default    => '인증 정보를 입력해주세요.',
        };

        return response()->json([
            'success' => false,
            'message' => '인증 정보가 올바르지 않습니다.',
            'detail'  => $detail,
        ], 400);
    }

    private function lookupUserForPurpose(string $purpose, string $type, string $normalizedIdentifier, array $validated): ?User
    {
        $identifierField = $type === 'email' ? 'email' : 'mobile';
        $rawIdentifier   = $type === 'email' ? ($validated['email'] ?? null) : ($validated['mobile'] ?? null);

        $withIdentifier = function ($q) use ($identifierField, $rawIdentifier, $normalizedIdentifier) {
            $q->where($identifierField, $rawIdentifier);
            if ($identifierField === 'mobile') {
                $q->orWhereRaw("REPLACE(REPLACE(REPLACE(REPLACE(mobile, '-', ''), ' ', ''), '(', ''), ')', '') = ?", [$normalizedIdentifier]);
            }
        };

        if ($purpose === 'find_username') {
            if ($type === 'business') {
                return User::whereHas('customer', function ($q) use ($validated) {
                    $q->where('company_name', $validated['company_name'])
                      ->where('business_registration_number', $validated['business_registration_number'])
                      ->where('representative_name', $validated['representative_name']);
                })->first();
            }

            return User::where('name', $validated['name'])->where($withIdentifier)->first();
        }else if ($purpose === 'change_phone') {
            return User::where('username', $validated['username'])->first();
        }

        $query = User::where('username', $validated['username'])->where($withIdentifier);

        if ($purpose === 'reset_password' && ! empty($validated['name'])) {
            $query->where('name', $validated['name']);
        }

        return $query->first();
    }

    private function dispatchVerificationCode(string $type, string $identifier, string $code, string $purpose, ?User $user): void
    {
        if ($type === 'mobile') {
            SendVerificationCodeSmsJob::dispatch($identifier, $code);

            return;
        }

        $resetLink = null;
        if ($purpose === 'reset_password' && $user) {
            $token     = Password::createToken($user);
            $resetLink = url(config('app.frontend_url', config('app.url')) . '/reset-password?token=' . $token . '&email=' . urlencode($identifier));
        }

        Mail::to($identifier)->queue(new VerificationCodeMail($code, $purpose, $resetLink));
    }

    /**
     * Verify verification code (인증번호 확인)
     */
    public function verifyVerificationCode(VerifyVerificationCodeRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $purpose = $validated['purpose'] === 'find_id' ? 'find_username' : $validated['purpose'];

            // Get identifier based on type (email or mobile)
            // When type is 'email', email is required and mobile is optional
            // When type is 'mobile', mobile is required and email is optional
            $identifier = $validated['type'] === 'email'
                ? ($validated['email'] ?? null)
                : ($validated['mobile'] ?? null);
            $normalizedIdentifier = $this->normalizeIdentifier($validated['type'], $identifier);

            if (! $normalizedIdentifier) {
                return response()->json([
                    'success' => false,
                    'message' => '인증 정보가 올바르지 않습니다.',
                    'detail' => $validated['type'] === 'email'
                        ? '이메일을 입력해주세요.'
                        : '핸드폰 번호를 입력해주세요.',
                ], 400);
            }

            $verificationCode = VerificationCode::where('identifier', $normalizedIdentifier)
                ->where('type', $validated['type'])
                ->where('purpose', $purpose)
                ->whereNull('verified_at')
                ->where('expires_at', '>', now())
                ->orderBy('created_at', 'desc')
                ->first();

            if (! $verificationCode) {
                return response()->json([
                    'success' => false,
                    'message' => '인증번호를 찾을 수 없거나 만료되었습니다.',
                ], 404);
            }

            if (! $verificationCode->isValid()) {
                return response()->json([
                    'success' => false,
                    'message' => '인증번호가 유효하지 않습니다.',
                    'detail' => '시도 횟수를 초과했거나 만료되었습니다.',
                ], 400);
            }

            if ($verificationCode->code !== $validated['code']) {
                $verificationCode->incrementAttempts();

                return response()->json([
                    'success' => false,
                    'message' => '인증번호가 일치하지 않습니다.',
                    'detail' => '인증번호를 다시 확인해주세요.',
                ], 400);
            }

            // Mark as verified
            $verificationCode->markAsVerified();

            return response()->json([
                'success' => true,
                'message' => '인증번호 확인이 완료되었습니다.',
                'data' => [
                    'verified' => true,
                    'identifier' => $identifier,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '인증번호 확인 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Find username by name and verified OTP
     */
    public function findUsername(FindUsernameRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $type = $validated['type'];

            $normalizedIdentifier = $this->resolveNormalizedIdentifier($type, $validated);
            if (! $normalizedIdentifier) {
                return $this->identifierMissingResponse($type);
            }

            // Mobile requires OTP verification; email and business find directly
            if ($type === 'mobile') {
                $verificationCode = $this->findVerifiedCode($normalizedIdentifier, $type, 'find_username', $validated['verification_code']);
                if (! $verificationCode) {
                    return response()->json(['success' => false, 'message' => '인증번호 확인이 필요합니다.', 'detail' => '인증번호를 먼저 확인해주세요.'], 400);
                }
            }

            $user = $this->lookupUserForPurpose('find_username', $type, $normalizedIdentifier, $validated);
            if (! $user) {
                return response()->json(['success' => false, 'message' => '일치하는 사용자를 찾을 수 없습니다.'], 404);
            }

            return response()->json([
                'success' => true,
                'message' => '아이디를 찾았습니다.',
                'data'    => [
                    'username'   => $user->username,
                    'created_at' => $user->created_at?->format('Y.m.d'),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => '아이디 찾기 중 오류가 발생했습니다.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Reset password using verified OTP
     */
    public function resetPasswordWithCode(ResetPasswordWithCodeRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $type = $validated['type'];

            $normalizedIdentifier = $this->resolveNormalizedIdentifier($type, $validated);
            if (! $normalizedIdentifier) {
                return $this->identifierMissingResponse($type);
            }
            $verificationCode = null;
            if ($type === 'mobile') {
                $verificationCode = $this->findVerifiedCode($normalizedIdentifier, $type, 'reset_password', $validated['verification_code']);
                if (! $verificationCode) {
                    return response()->json(['success' => false, 'message' => '인증번호 확인이 필요합니다.', 'detail' => '인증번호를 먼저 확인해주세요.'], 400);
                }
            }

            $user = $this->lookupUserForPurpose('reset_password', $type, $normalizedIdentifier, $validated);
            if (! $user) {
                return response()->json(['success' => false, 'message' => '일치하는 사용자를 찾을 수 없습니다.'], 404);
            }

            $user->update(['password' => Hash::make($validated['password'])]);
            if ($type === 'mobile') {
                $verificationCode->update(['expires_at' => now()]);
            }

            return response()->json(['success' => true, 'message' => '비밀번호가 성공적으로 재설정되었습니다.'], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => '비밀번호 재설정 중 오류가 발생했습니다.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Send password reset link
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $identifierField = $validated['type'] === 'email' ? 'email' : 'mobile';
            $identifierValue = $validated[$identifierField] ?? null;

            $user = User::where('username', $validated['username'])
                ->where('name', $validated['name'])
                ->where($identifierField, $identifierValue)
                ->first();

            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => '일치하는 사용자를 찾을 수 없습니다.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => '사용자 확인이 완료되었습니다. 인증번호를 전송해주세요.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '비밀번호 찾기 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reset password
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $status = Password::reset(
                [
                    'email' => $validated['email'],
                    'password' => $validated['password'],
                    'password_confirmation' => $validated['password_confirmation'],
                    'token' => $validated['token'],
                ],
                function ($user, $password) {
                    $user->forceFill([
                        'password' => Hash::make($password),
                    ])->setRememberToken(Str::random(60));

                    $user->save();

                    event(new PasswordReset($user));
                }
            );

            if ($status === Password::PASSWORD_RESET) {
                return response()->json([
                    'success' => true,
                    'message' => '비밀번호가 성공적으로 재설정되었습니다.',
                ], 200);
            }

            return response()->json([
                'success' => false,
                'message' => '비밀번호 재설정에 실패했습니다. 토큰이 유효하지 않거나 만료되었습니다.',
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '비밀번호 재설정 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Change password for authenticated user
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $user = $request->user();

            // Verify current password
            if (! Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => '현재 비밀번호가 일치하지 않습니다.',
                ], 400);
            }

            // Check if new password is different from current password
            if (Hash::check($validated['new_password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => '새 비밀번호는 현재 비밀번호와 달라야 합니다.',
                ], 400);
            }

            // Update password
            $user->update([
                'password' => Hash::make($validated['new_password']),
            ]);

            // Optional: Revoke all other tokens (force re-login on other devices)
            // $user->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => '비밀번호가 성공적으로 변경되었습니다.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '비밀번호 변경 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send verification code to new phone number for change phone
     */
    public function sendChangePhoneVerificationCode(SendChangePhoneVerificationCodeRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $user = $request->user();

            // Normalize mobile number (remove hyphens, spaces, etc.)
            $newMobile = preg_replace('/[^0-9]/', '', $validated['new_mobile']);

            // Check if new mobile is same as current mobile
            $currentMobile = preg_replace('/[^0-9]/', '', $user->mobile ?? '');
            if ($newMobile === $currentMobile) {
                return response()->json([
                    'success' => false,
                    'message' => '새 핸드폰 번호는 현재 번호와 달라야 합니다.',
                ], 400);
            }

            // Check if new mobile is already used by another user
            $existingUser = User::where('id', '!=', $user->id)
                ->where(function ($q) use ($newMobile) {
                    $q->where('mobile', $newMobile)
                        ->orWhereRaw("REPLACE(REPLACE(REPLACE(REPLACE(mobile, '-', ''), ' ', ''), '(', ''), ')', '') = ?", [$newMobile]);
                })
                ->first();

            if ($existingUser) {
                return response()->json([
                    'success' => false,
                    'message' => '이미 사용 중인 핸드폰 번호입니다.',
                ], 400);
            }

            // Create verification code
            $verificationCode = VerificationCode::createCode(
                $newMobile,
                'mobile',
                'change_phone',
                10 // expires in 10 minutes
            );

            // Dispatch SMS job to queue
            SendVerificationCodeSmsJob::dispatch($newMobile, $verificationCode->code);

            $responseData = [
                'new_mobile' => $validated['new_mobile'],
                'expires_at' => $verificationCode->expires_at,
            ];

            // Only expose verification code in non-production environments for testing
            if (app()->environment(['local', 'staging', 'testing'])) {
                $responseData['code'] = $verificationCode->code;
                $responseData['debug_notice'] = '비프로덕션 환경에서만 응답에 인증번호가 포함됩니다.';
            }

            return response()->json([
                'success' => true,
                'message' => '인증번호가 전송되었습니다.',
                'data' => $responseData,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '인증번호 전송 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Change phone number for authenticated user
     */
    public function changePhone(ChangePhoneRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $user = $request->user();

            // Normalize mobile number
            $newMobile = preg_replace('/[^0-9]/', '', $validated['new_mobile']);

            // Verify verification code
            $verificationCode = VerificationCode::where('identifier', $newMobile)
                ->where('type', 'mobile')
                ->where('purpose', 'change_phone')
                ->where('code', $validated['verification_code'])
                ->whereNull('verified_at')
                ->where('expires_at', '>', now())
                ->orderBy('created_at', 'desc')
                ->first();

            if (! $verificationCode) {
                return response()->json([
                    'success' => false,
                    'message' => '인증번호를 찾을 수 없거나 만료되었습니다.',
                ], 404);
            }

            if (! $verificationCode->isValid()) {
                return response()->json([
                    'success' => false,
                    'message' => '인증번호가 유효하지 않습니다.',
                    'detail' => '시도 횟수를 초과했거나 만료되었습니다.',
                ], 400);
            }

            // Verify code matches
            if ($verificationCode->code !== $validated['verification_code']) {
                $verificationCode->incrementAttempts();

                return response()->json([
                    'success' => false,
                    'message' => '인증번호가 일치하지 않습니다.',
                    'detail' => '인증번호를 다시 확인해주세요.',
                ], 400);
            }

            // Check if new mobile is already used by another user
            $existingUser = User::where('id', '!=', $user->id)
                ->where(function ($q) use ($newMobile) {
                    $q->where('mobile', $newMobile)
                        ->orWhereRaw("REPLACE(REPLACE(REPLACE(REPLACE(mobile, '-', ''), ' ', ''), '(', ''), ')', '') = ?", [$newMobile]);
                })
                ->first();

            if ($existingUser) {
                return response()->json([
                    'success' => false,
                    'message' => '이미 사용 중인 핸드폰 번호입니다.',
                ], 400);
            }

            // Mark verification code as verified
            $verificationCode->markAsVerified();

            // Update user mobile
            $user->update([
                'mobile' => $newMobile,
            ]);

            // Invalidate the code after use (set expires_at to now)
            $verificationCode->update([
                'expires_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => '핸드폰 번호가 성공적으로 변경되었습니다.',
                'data' => [
                    'user' => $this->formatUserData($user->fresh()),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '핸드폰 번호 변경 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Normalize identifier (email or mobile) for consistent comparison.
     */
    private function normalizeIdentifier(string $type, ?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        if ($type === 'mobile') {
            // Keep only digits for mobile comparisons
            $digitsOnly = preg_replace('/\D+/', '', $value);

            return $digitsOnly ?: null;
        }

        return trim($value);
    }

    /**
     * Format user data for API response
     */
    private function formatUserData(User $user, bool $includeAgreedAt = false): array
    {
        $authorityEnum = $user->getAuthorityEnum();

        $data = [
            'id' => $user->id,
            'status' => $user->status,
            'member_type' => $user->member_type,
            'username' => $user->username,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'mobile' => $user->mobile,
            'postcode' => $user->postcode,
            'address' => $user->address,
            'detailed_address' => $user->detailed_address,
            'authority' => $user->authority, // Code: 'super_admin', 'store_admin', 'normal_user'
            'role' => $user->authority, // Alias for authority (for FE convenience)
            'is_admin' => $authorityEnum?->isAdmin() ?? false,
            'is_super_admin' => $authorityEnum?->isSuperAdmin() ?? false,
            'is_store_admin' => $user->isStoreAdmin(),
            'is_normal_user' => $authorityEnum === UserAuthority::USER,
            'headquarters' => $user->headquarters,
            'business_office' => $user->business_office,
            'team' => $user->team,
            'position' => $user->position,
            'customer_id' => $user->customer_id,
            'customer' => $user->customer_id ? [
                'id' => $user->customer?->id,
                'company_name' => $user->customer?->company_name,
                'business_registration_number' => $user->customer?->business_registration_number,
                'representative_name' => $user->customer?->representative_name,
                'industry_type' => $user->customer?->industry_type,
                'business_type' => $user->customer?->business_type,
                'postcode' => $user->customer?->postcode,
                'address' => $user->customer?->address,
                'detailed_address' => $user->customer?->detailed_address,
                'tax_invoice_email' => $user->customer?->tax_invoice_email,
                'homepage_url' => $user->customer?->homepage_url,
                'approval_status' => $user->customer?->approval_status,
            ] : null,
        ];

        if ($includeAgreedAt) {
            $data['agreed_at'] = $user->agreed_at;
        }

        return $data;
    }

    private function normalizePhoneNumbers(array $validated): array
    {
        if (isset($validated['phone'])) {
            $validated['phone'] = preg_replace('/[^0-9]/', '', $validated['phone']);
        }
        if (isset($validated['mobile'])) {
            $validated['mobile'] = preg_replace('/[^0-9]/', '', $validated['mobile']);
        }

        return $validated;
    }

    private function assertMobileVerified(string $mobile): void
    {
        $normalizedMobile = preg_replace('/[^0-9]/', '', $mobile);

        $verified = VerificationCode::where('identifier', $normalizedMobile)
            ->where('type', 'mobile')
            ->where('purpose', 'register')
            ->whereNotNull('verified_at')
            ->where('verified_at', '>=', now()->subMinutes(30))
            ->exists();

        if (! $verified) {
            throw new HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => '휴대폰 인증을 완료해주세요.',
                ], 422)
            );
        }
    }

    private function createCustomerForBusinessSignup(Request $request, array $validated): int
    {
        $filePath = null;
        if ($request->hasFile('business_registration_file')) {
            $filePath = $request->file('business_registration_file')
                ->store('business-registrations', 'public');
            $this->fileService->create($request->file('business_registration_file'), $filePath, FileType::BUSINESS_REGISTRATIONS, $request->user());
        }

        $customer = Customer::create([
            'company_name' => $validated['company_name'],
            'business_registration_number' => $validated['business_registration_number'],
            'representative_name' => $validated['representative_name'],
            'industry_type' => $validated['industry_type'] ?? null,
            'business_type' => $validated['business_type'] ?? null,
            'postcode' => $validated['business_postcode'] ?? null,
            'address' => $validated['business_address'] ?? null,
            'detailed_address' => $validated['business_address_detail'] ?? null,
            'contact_name' => $validated['name'],
            'contact_email' => $validated['email'] ?? null,
            'contact_mobile' => $validated['mobile'],
            'tax_invoice_email' => $validated['tax_invoice_email'] ?? null,
            'homepage_url' => $validated['homepage_url'] ?? null,
            'business_registration_file' => $filePath,
            'access_code' => $this->generateUniqueCustomerAccessCode(),
            'shipping_fee_applied' => 'none',
            'order_menus' => '[]',
            'other_menus' => '[]',
            'approval_status' => ApprovalStatus::PENDING,
            'status' => CustomerStatus::INACTIVE,
        ]);

        return $customer->id;
    }

    private function createUserFromRegistration(array $validated, ?int $customerId): User
    {
        return User::create([
            'member_type' => $validated['member_type'],
            'customer_id' => $customerId,
            'status' => UserStatus::ACTIVE,
            'name' => $validated['name'],
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'mobile' => $validated['mobile'] ?? null,
            'postcode' => $validated['postcode'] ?? null,
            'address' => $validated['address'] ?? null,
            'detailed_address' => $validated['detailed_address'] ?? null,
            'authority' => $validated['authority'] ?? null,
            'headquarters' => $validated['headquarters'] ?? null,
            'business_office' => $validated['business_office'] ?? null,
            'team' => $validated['team'] ?? null,
            'position' => $validated['position'] ?? null,
            'agree_privacy' => filter_var($validated['agree_privacy'], FILTER_VALIDATE_BOOLEAN),
            'agree_terms' => filter_var($validated['agree_terms'], FILTER_VALIDATE_BOOLEAN),
            'agree_sms' => filter_var($validated['agree_sms'], FILTER_VALIDATE_BOOLEAN),
            'agree_email' => filter_var($validated['agree_email'], FILTER_VALIDATE_BOOLEAN),
            'agreed_at' => now(),
        ]);
    }

    private function generateUniqueCustomerAccessCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (Customer::where('access_code', $code)->exists());

        return $code;
    }

    private function logAccess(Request $request, string $eventType, ?User $user, ?string $loginId, ?string $explanation = null): void
    {
        try {
            $now = now();
            AccessLog::create([
                'user_id' => $user?->id,
                'login_id' => $loginId ?? $user?->username ?? 'unknown',
                'ip_address' => $request->ip() ?? '0.0.0.0',
                'browser_info' => $request->userAgent() ? substr($request->userAgent(), 0, 255) : null,
                'user_agent' => $request->userAgent(),
                'event_type' => $eventType,
                'management' => $eventType === 'login' ? 'Log In' : ($eventType === 'logout' ? 'Log Out' : 'Login Failed'),
                'explanation' => $explanation,
                'connection_time' => $now,
                'access_date' => $now->toDateString(),
            ]);
        } catch (\Throwable $e) {
            report($e);
        }
    }
}
