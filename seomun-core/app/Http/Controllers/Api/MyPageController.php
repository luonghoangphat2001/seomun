<?php

namespace App\Http\Controllers\Api;

use App\Enums\ApprovalStatus;
use App\Enums\FileType;
use App\Http\Controllers\Controller;
use App\Http\Requests\MyPage\ConvertToBusinessMemberRequest;
use App\Http\Requests\MyPage\UpdatePasswordRequest;
use App\Http\Requests\MyPage\UpdateProfileRequest;
use App\Http\Resources\VirtualAccountResource;
use App\Services\FileService;
use App\Services\MembershipService;
use App\Services\MyPageDashboardService;
use App\Services\PointBalanceService;
use App\Services\ProfileService;
use App\Services\VirtualAccountService;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class MyPageController extends Controller
{
    public function __construct(
        protected ProfileService $profileService,
        protected MyPageDashboardService $dashboardService,
        protected FileService $fileService,
        protected MembershipService $membershipService,
        protected PointBalanceService $pointBalanceService,
        protected WalletService $walletService,
        protected VirtualAccountService $virtaulAccountService,
    ) {}

    /**
     * Get current user profile
     * GET /api/mypage/profile
     */
    public function show(Request $request): JsonResponse
    {
        try {
            $user = $request->user()->load('customer');
            $virtualAccount = $this->virtaulAccountService->getMyVirtualAccounts($user->id);

            return response()->json([
                'success' => true,
                'data' => [
                    'profile' => $this->profileService->formatUserData($user, true),
                    'membership' => $this->membershipService->getMembershipSummary($user),
                    'point' => ['balance' => $this->pointBalanceService->getBalance($user)->balance],
                    'balance' => $this->walletService->getWallet($user->id),
                    'virtual_account' => $virtualAccount ? new VirtualAccountResource($virtualAccount) : null,
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get profile failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '프로필 정보를 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update user profile
     * PUT /api/mypage/profile
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        try {
            $user = $request->user()->load('customer');
            $validated = $request->validated();

            // Update profile
            $updatedUser = $this->profileService->updateProfile($user, $validated);
            $updatedUser->load('customer');

            return response()->json([
                'success' => true,
                'message' => '프로필이 성공적으로 업데이트되었습니다.',
                'data' => [
                    'profile' => $this->profileService->formatUserData($updatedUser, true),
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Update profile failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '프로필 업데이트 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Convert to business member
     * POST /api/mypage/convert-to-business-member
     */
    public function convertToBusinessMember(ConvertToBusinessMemberRequest $request): JsonResponse
    {
        try {
            $user = $request->user()->load('customer');
            $validated = $request->validated();

            if ($user->member_type === 'business' && $user->customer_id) {
                $customer = $user->customer;
                $customerData = $this->prepareCustomerData($validated, $customer->id, $user);
                $customer->update($customerData);
                $updatedUser = $user->fresh();
            } else {
                $customerData = $this->prepareCustomerData($validated, null, $user);
                $customer = \App\Models\Customer::create($customerData);

                $user->update([
                    'member_type' => 'business',
                    'customer_id' => $customer->id,
                    'approval_status' => ApprovalStatus::ACCEPTED,
                ]);

                $updatedUser = $user->fresh()->load('customer');
            }

            return response()->json([
                'success' => true,
                'message' => '사업자 회원으로 전환되었습니다.',
                'data' => [
                    'profile' => $this->profileService->formatUserData($updatedUser, true),
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Convert to business member failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '사업자 회원 전환 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function prepareCustomerData(array $data, ?int $customerId = null, $requestUser = null): array
    {
        $customerData = [
            'company_name' => $data['company_name'] ?? null,
            'business_registration_number' => $data['business_registration_number'] ?? null,
            'representative_name' => $data['representative_name'] ?? null,
            'industry_type' => $data['industry_type'] ?? null,
            'business_type' => $data['business_type'] ?? null,
            'postcode' => $data['business_postcode'] ?? null,
            'address' => $data['business_address'] ?? null,
            'detailed_address' => $data['business_address_detail'] ?? null,
            'tax_invoice_email' => $data['tax_invoice_email'] ?? null,
            'homepage_url' => $data['homepage_url'] ?? null,
        ];

        if (isset($data['business_registration_file']) && $data['business_registration_file'] instanceof \Illuminate\Http\UploadedFile) {
            $path = $data['business_registration_file']->store('customers/business-registration', 'public');
            $customerData['business_registration_file'] = $path;
            $this->fileService->create($data['business_registration_file'], $path, FileType::CUSTOMER_BUSINESS_REGISTRATION, $requestUser);
        }

        if ($customerId === null) {
            $customerData['access_code'] = $this->generateUniqueCustomerAccessCode();
            $customerData['shipping_fee_applied'] = 'none';
            $customerData['order_menus'] = '[]';
            $customerData['other_menus'] = '[]';
            $customerData['approval_status'] = ApprovalStatus::PENDING;
            $customerData['status'] = \App\Enums\CustomerStatus::INACTIVE;
        }

        return $customerData;
    }

    private function generateUniqueCustomerAccessCode(): string
    {
        do {
            $code = strtoupper(\Illuminate\Support\Str::random(8));
        } while (\App\Models\Customer::where('access_code', $code)->exists());

        return $code;
    }

    /**
     * Update user password
     * PUT /api/mypage/profile/password
     */
    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            // Update password
            $this->profileService->updatePassword(
                $user,
                $validated['current_password'],
                $validated['new_password']
            );

            return response()->json([
                'success' => true,
                'message' => '비밀번호가 성공적으로 변경되었습니다.',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Update password failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            $statusCode = 422;
            $message = '비밀번호 변경 중 오류가 발생했습니다.';

            // If it's a validation error (current password mismatch)
            if (str_contains($e->getMessage(), '현재 비밀번호')) {
                $statusCode = 400;
                $message = $e->getMessage();
            }

            return response()->json([
                'success' => false,
                'message' => $message,
                'error' => $e->getMessage(),
            ], $statusCode);
        }
    }

    /**
     * Upload business registration file (사업자등록증 업로드)
     * POST /api/mypage/profile/business-registration-file
     */
    public function uploadBusinessRegistrationFile(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
            ]);

            $user = $request->user();

            if ($user->member_type !== 'business' || ! $user->customer_id) {
                return response()->json([
                    'success' => false,
                    'message' => '기업 회원만 사업자등록증을 업로드할 수 있습니다.',
                ], 403);
            }

            $path = $request->file('file')->store('customers/business-registration', 'public');
            $url = Storage::disk('public')->url($path);
            $this->fileService->create($request->file('file'), $path, FileType::CUSTOMER_BUSINESS_REGISTRATION, $request->user());
            // Save path to customer record
            $user->customer()->update(['business_registration_file' => $path]);

            return response()->json([
                'success' => true,
                'message' => '사업자등록증이 업로드되었습니다.',
                'data' => [
                    'file_path' => $path,
                    'file_url' => $url,
                ],
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => '파일 형식이 올바르지 않습니다.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Upload business registration file failed', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '파일 업로드 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get MyPage dashboard data
     * GET /api/mypage/dashboard
     */
    public function dashboard(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $dashboardData = $this->dashboardService->getDashboardData($user);

            return response()->json([
                'success' => true,
                'data' => $dashboardData,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get MyPage dashboard failed', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => '대시보드 데이터를 가져오는 중 오류가 발생했습니다.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
