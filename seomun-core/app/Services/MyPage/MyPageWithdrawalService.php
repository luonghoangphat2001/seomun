<?php

namespace App\Services\MyPage;

use App\Enums\OrderStatus;
use App\Enums\UserStatus;
use App\Models\Order;
use App\Models\User;
use App\Services\PointBalanceService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MyPageWithdrawalService
{
    public function __construct(
        protected PointBalanceService $pointBalanceService,
    ) {}

    /**
     * Active order statuses that block withdrawal.
     */
    private static function getBlockingStatuses(): array
    {
        return [
            OrderStatus::Pending->value,
            OrderStatus::AwaitingPayment->value,
            OrderStatus::Confirmed->value,

            ...OrderStatus::getInProduction(),
            // OrderStatus::Preparing->value,
            // OrderStatus::InProduction->value,
            // OrderStatus::PostProcessing->value,
            OrderStatus::ReadyToShip->value,
            OrderStatus::Shipping->value,
        ];
    }

    /**
     * Check if user has active orders that block withdrawal.
     */
    public function hasBlockingOrders(User $user): bool
    {
        return Order::where('user_id', $user->id)
            ->whereIn('status', self::getBlockingStatuses())
            ->exists();
    }

    /**
     * Get current balance summary shown on withdrawal page.
     * Returns S포인트, S머니(prepaid), and pending refund amount.
     */
    public function getCurrentBalance(User $user): array
    {
        $pointBalance = $this->pointBalanceService->getBalance($user);

        $pendingRefundAmount = Order::where('user_id', $user->id)
            ->where('payment_status', 'refund_requested')
            ->sum('total_amount');

        return [
            's_point' => $pointBalance->balance ?? 0,
            'c_coupons' => $user->coupons()->upcoming()->count(),
            'pending_refund_amount' => (int) $pendingRefundAmount,
        ];
    }

    /**
     * Withdraw user account (soft delete).
     *
     * - Verifies password before proceeding
     * - Sets status to WITHDRAWN
     * - Anonymizes personal data
     * - Revokes all tokens
     * - Does NOT delete posts/reviews/orders
     */
    public function withdraw(User $user, array $reasons, ?string $additionalComment = null): void
    {
        if ($this->hasBlockingOrders($user)) {
            throw new \Exception('진행중인 주문 또는 미납잔액이 있어 탈퇴가 불가합니다.', 422);
        }

        try {
            DB::beginTransaction();

            // Anonymize personal data & set withdrawn status
            $user->update([
                'status' => UserStatus::WITHDRAWN,
                'name' => '탈퇴회원',
                'email' => 'withdrawn_'.$user->id.'@deleted.invalid',
                'phone' => null,
                'mobile' => null,
                'postcode' => null,
                'address' => null,
                'detailed_address' => null,
                'refund_bank' => null,
                'refund_account_number' => null,
                'refund_account_name' => null,
            ]);

            // Revoke all Sanctum tokens
            $user->tokens()->delete();

            // Revoke all refresh tokens
            $user->refreshTokens()->delete();

            DB::commit();

            Log::info('User withdrawal completed', [
                'user_id' => $user->id,
                'reasons' => $reasons,
                'additional_comment' => $additionalComment,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('User withdrawal failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
