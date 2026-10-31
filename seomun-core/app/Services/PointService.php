<?php

namespace App\Services;

use App\Models\User;

class PointService
{
    public function __construct(
        protected PointSettingsService $pointSettingService,
        protected PointBalanceService $pointBalanceService,
        protected PointTransactionService $pointTransactionService
    ) {}

    public function calculateMaxPointUsable(array $payload, User $user): int
    {
        $subtotal = (float) ($payload['subtotal_amount'] ?? 0);
        $tax = (float) ($payload['tax_amount'] ?? 0);
        $discount = (float) ($payload['discount_amount'] ?? 0);

        $orderAmount = $subtotal + $tax - $discount;

        if ($orderAmount <= 0) {
            return 0;
        }

        if (! $this->pointSettingService->canUsePoints($subtotal)) {
            return 0;
        }

        // Balance user
        $balance = (int) $this->pointBalanceService->getBalance($user)->balance;

        if ($balance <= 0) {
            return 0;
        }

        $maxByPolicy = (int) $this->pointSettingService
            ->calculateMaxUsablePoints($subtotal);

        $maxByOrder = (int) $orderAmount;

        $maxUsable = min($balance, $maxByPolicy, $maxByOrder);

        $maxUsable = floor($maxUsable / 100) * 100;

        return max(0, $maxUsable);
    }

    public function calculateWithPoint(array $payload, int $pointsToUse, User $user): array
    {
        $subtotal = (float) $payload['subtotal_amount'];
        $tax = (float) $payload['tax_amount'];
        $shipping = (float) $payload['shipping_fee'];
        $discount = (float) $payload['discount_amount'];

        $pointUsed = 0;
        $pointDiscount = 0;
        $balance = (int) $this->pointBalanceService->getBalance($user)->balance;

        if ($pointsToUse > 0) {

            // rule check
            if (! $this->pointSettingService->canUsePoints($subtotal)) {
                throw new \Exception('포인트를 사용할 수 없는 주문입니다.');
            }

            // balance
            $balance = (int) $this->pointBalanceService->getBalance($user)->balance;

            if ($pointsToUse > 0 && ($pointsToUse % 100 !== 0 || $pointsToUse < 0)) {
                throw new \Exception('포인트는 100P 단위로만 사용할 수 있습니다.');
            }

            // max usable
            $maxUsable = $this->pointSettingService
                ->calculateMaxUsablePoints($subtotal);

            // Points cannot be used to pay for shipping costs.
            $pointMaxAllowUse = $subtotal + $tax - $discount;

            $pointUsed = min($pointsToUse, $balance, $maxUsable, (int) floor($pointMaxAllowUse));
            $pointUsed = (int) (floor($pointUsed / 100) * 100);
            if ($pointUsed < $pointsToUse) {
                throw new \Exception('포인트가 부족하거나 사용 한도를 초과했습니다.');
            }

            $pointDiscount = $pointUsed;
        }

        // final total
        $total = $subtotal + $tax + $shipping - $discount - $pointDiscount;

        return [
            'summary' => [
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping_fee' => $shipping,
                'discount' => $discount,

                'point_requested' => $pointsToUse,
                'point_used' => $pointUsed,
                'point_discount' => $pointDiscount,
                'point_balance' => $balance,

                'total' => max(0, $total),
            ],
        ];
    }
}
