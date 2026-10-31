<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\PaymentWebhookEventType;
use App\Enums\PaymentWebhookProcessingStatus;
use App\Enums\PaymentWebhookProvider;
use App\Enums\RefundHistoryStatus;
use App\Enums\WalletTransactionType;
use App\Exceptions\TossPaymentSessionExpiredException;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\RefundHistory;
use App\Models\User;
use App\Models\VirtualAccount;
use App\Models\Wallet;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PaymentService
{
    public function __construct(
        protected PointTransactionService $pointTransactionService,
        protected WalletTransactionService $walletTransactionService,
        protected PaymentWebhookLogService $paymentWebhookLogService,
        protected OrderItemDesignWorkflowService $designWorkflowService,
    ) {}

    /**
     * Initiate payment for an order
     *
     * @throws Exception
     */
    public function initiatePayment(Order $order, string $paymentMethod, array $additionalData = []): PaymentTransaction
    {
        // Never accept provider identity or receiving-account instructions from the browser.
        $metadata = $additionalData['metadata'] ?? [];
        unset($metadata['bank_account_identity'], $metadata['bank_transfer']);
        if (config('popbill.enabled') && $paymentMethod === PaymentMethod::BANK_TRANSFER->value) {
            $accounts = app(\App\Services\Popbill\BankAccounts::class);
            $key = (string) ($additionalData['bank_account_key'] ?? '');
            $metadata['bank_account_identity'] = $accounts->identity($key);
            $additionalData['bank_account_holder'] = trim((string) ($additionalData['bank_account_holder'] ?? ''));
            if ($additionalData['bank_account_holder'] === '') {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'bank_account_holder' => '입금자명을 입력해 주세요.',
                ]);
            }
        }
        $additionalData['metadata'] = $metadata;

        return DB::transaction(function () use ($order, $paymentMethod, $additionalData): PaymentTransaction {
            // Reload and lock order row to avoid race conditions (double pending payments)
            $order = Order::whereKey($order->id)->lockForUpdate()->first();

            if (config('popbill.enabled') && $paymentMethod === PaymentMethod::BANK_TRANSFER->value
                && ($order->currency !== 'KRW' || $order->total_amount <= 0)) {
                throw new Exception('계좌이체는 0원 초과 KRW 주문만 가능합니다.', 422);
            }

            // Orders that are already fully paid/refunded cannot proceed to new payment
            if (
                in_array($order->payment_status, [
                    PaymentStatus::PAID->value,
                    PaymentStatus::REFUNDED->value,
                    PaymentStatus::PARTIALLY_REFUNDED->value,
                ], true)
            ) {
                throw new Exception('이 주문은 이미 결제가 완료되었습니다.', 400);
            }

            // Orders in certain terminal states cannot be paid
            $blockedOrderStatuses = [
                OrderStatus::Cancelled->value,
                OrderStatus::Completed->value,
                OrderStatus::RefundRequested->value,
                OrderStatus::RefundCompleted->value,
            ];

            if (in_array($order->status, $blockedOrderStatuses, true)) {
                throw new Exception('현재 상태의 주문은 결제할 수 없습니다.', 400);
            }

            // Validate payment method
            $paymentMethodEnum = PaymentMethod::tryFrom($paymentMethod);
            if (! $paymentMethodEnum) {
                throw new Exception('유효하지 않은 결제 수단입니다.', 400);
            }

            // If there is an existing latest transaction, handle resume/change-of-method or amount-change cases
            $latestTransaction = $order->paymentTransaction()->latest('id')->first();

            if ($latestTransaction && $latestTransaction->isPending()) {
                $latestMethodEnum = $latestTransaction->getPaymentMethodEnum();
                $sameMethod = $latestMethodEnum && $latestMethodEnum->value === $paymentMethodEnum->value;
                $sameAmount = (string) $latestTransaction->amount === ($order->currency === 'KRW'
                    ? $order->total_amount.'.00' : (string) $order->total_amount);
                $sameCurrency = $latestTransaction->currency === $order->currency;

                $sameBank = ($latestTransaction->metadata['bank_account_identity'] ?? null)
                    === ($additionalData['metadata']['bank_account_identity'] ?? null);
                $sameDepositor = $latestTransaction->bank_account_holder === ($additionalData['bank_account_holder'] ?? null);
                $currentReferenceFormat = ! config('popbill.enabled') || $paymentMethod !== 'bank_transfer'
                    || ($latestTransaction->metadata['bank_transfer']['matching_rule'] ?? null) === 'depositor_name_v1';
                if ($sameMethod && $sameAmount && $sameCurrency && $sameBank && $sameDepositor && $currentReferenceFormat) {
                    // Reuse existing pending transaction
                    return $latestTransaction->fresh();
                }

                // Auto-cancel previous pending transaction before creating a new one
                $latestTransaction->update([
                    'status' => PaymentStatus::CANCELLED->value,
                    'refund_reason' => 'Auto-cancel before creating new payment (method/amount changed)',
                    'failed_at' => now(),
                ]);

                $order->update([
                    'payment_status' => PaymentStatus::CANCELLED->value,
                ]);
            }

            // Generate unique transaction ID
            $transactionId = $this->generateTransactionId();

            // Create payment transaction with normalized payment method value
            $transaction = PaymentTransaction::create([
                'order_id' => $order->id,
                'transaction_id' => $transactionId,
                'payment_method' => $paymentMethodEnum->value,
                'status' => PaymentStatus::PENDING->value,
                'amount' => $order->total_amount,
                'currency' => $order->currency,
                'bank_account_holder' => $additionalData['bank_account_holder'] ?? null,
                'metadata' => $additionalData['metadata'] ?? null,
            ]);

            if (config('popbill.enabled') && $paymentMethod === 'bank_transfer') {
                $savedMetadata = $transaction->metadata ?? [];
                $savedMetadata['bank_transfer'] = app(\App\Services\Popbill\BankAccounts::class)->instructions(
                    $additionalData['bank_account_key'],
                    \App\Services\Popbill\PaymentReference::forId($transaction->id),
                );
                $transaction->update(['metadata' => $savedMetadata]);
            }

            // Update order payment status
            $order->update([
                'status' => OrderStatus::AwaitingPayment->value,
                'payment_status' => PaymentStatus::PENDING->value,
            ]);

            // If payment method requires immediate verification (card, seomun_pay, toss),
            // here you would integrate with PG (Payment Gateway).
            if ($paymentMethodEnum->requiresImmediateVerification()) {
                // TODO: Integrate with actual PG (KG Inicis, Toss, etc.)
                // $pgResponse = $this->callPaymentGateway($transaction, $additionalData);
                // $transaction->update(['pg_transaction_id' => $pgResponse['tid'], ...]);
            }

            return $transaction->fresh();
        });
    }

    /**
     * Confirm payment with Toss Payments after frontend receives success redirect.
     *
     * @param  array{paymentKey:string,orderId:string,amount:int}  $data
     *
     * @throws Exception
     */
    public function confirmTossPayment(array $data): PaymentTransaction
    {
        $order = Order::where('order_number', $data['orderId'])->first();

        if (! $order) {
            throw new Exception('주문을 찾을 수 없습니다.', 404);
        }

        if ((int) $order->total_amount !== (int) $data['amount']) {
            throw new Exception('토스 결제 금액이 일치하지 않습니다.', 400);
        }

        $secretKey = config('services.toss.secret_key', env('TOSS_SECRET_KEY'));
        $baseUrl = rtrim(config('services.toss.base_url', env('TOSS_BASE_URL', 'https://api.tosspayments.com')), '/');

        if (! $secretKey) {
            throw new Exception('토스 시크릿 키가 설정되지 않았습니다.', 500);
        }

        $response = Http::withBasicAuth($secretKey, '')
            ->post($baseUrl.'/v1/payments/confirm', [
                'paymentKey' => $data['paymentKey'],
                'orderId' => $data['orderId'],
                'amount' => $data['amount'],
            ]);

        if ($response->failed()) {
            $body = $response->json();
            $tossCode = $body['code'] ?? null;
            $tossMessage = $body['message'] ?? $response->body();

            if ($tossCode === 'NOT_FOUND_PAYMENT_SESSION') {
                throw new TossPaymentSessionExpiredException(
                    '결제 시간이 만료되었습니다. 결제를 다시 시작해 주세요.',
                    400
                );
            }

            throw new Exception('토스 결제 승인 실패: '.$tossMessage, $response->status());
        }

        $payload = $response->json();

        // Find existing transaction for this order/paymentKey if any
        $transaction = PaymentTransaction::where('order_id', $order->id)
            ->where('amount', $data['amount'])
            ->first();
        $paymentMethodEnum = $this->resolvePaymentMethodFromToss($payload['method'] ?? null);
        if (! $transaction) {
            // Create new transaction as paid
            $transaction = PaymentTransaction::create([
                'order_id' => $order->id,
                'transaction_id' => $this->generateTransactionId(),
                'pg_transaction_id' => $data['paymentKey'],
                'payment_method' => $paymentMethodEnum->value,
                'card_number' => $payload['card']['number'] ?? null,
                'status' => PaymentStatus::PAID->value,
                'amount' => $payload['totalAmount'] ?? $order->total_amount,
                'currency' => $payload['currency'] ?? $order->currency,
                'pg_name' => 'toss',
                'pg_response' => $payload,
                'paid_at' => now(),
            ]);
        } else {
            $transaction->update([
                'status' => PaymentStatus::PAID->value,
                'pg_transaction_id' => $data['paymentKey'],
                'pg_request' => $data,
                'pg_response' => $payload,
                'paid_at' => now(),
                'card_number' => $payload['card']['number'] ?? null,
                'currency' => $payload['currency'],
            ]);
        }

        $order->update([
            'payment_status' => PaymentStatus::PAID->value,
            'status' => OrderStatus::PendingReception->value, // 'payment_completed'
            'payment_method' => $paymentMethodEnum->value,
        ]);

        $this->designWorkflowService->startForPaidOrder($order->fresh());

        return $transaction->fresh('order');
    }

    /**
     * Verify payment (callback from PG or manual confirmation)
     *
     * @throws Exception
     */
    public function verifyPayment(string $transactionId, array $verificationData = []): PaymentTransaction
    {
        $transaction = PaymentTransaction::where('transaction_id', $transactionId)->first();

        if (! $transaction) {
            throw new Exception('결제 정보를 찾을 수 없습니다.', 404);
        }

        if (config('popbill.enabled') && $transaction->payment_method === PaymentMethod::BANK_TRANSFER) {
            throw new Exception('입금 확인은 은행 거래내역 대조 후 처리됩니다.', 403);
        }

        if ($transaction->isPaid()) {
            throw new Exception('이미 완료된 결제입니다.', 400);
        }

        // Update transaction with PG response
        $transaction->update([
            'status' => PaymentStatus::PAID->value,
            'pg_transaction_id' => $verificationData['pg_transaction_id'] ?? null,
            'pg_response' => $verificationData['pg_response'] ?? null,
            'card_name' => $verificationData['card_name'] ?? null,
            'card_number' => $verificationData['card_number'] ?? null,
            'paid_at' => now(),
        ]);

        // Update order payment status
        $transaction->order->update([
            'payment_status' => PaymentStatus::PAID->value,
        ]);

        $this->designWorkflowService->startForPaidOrder($transaction->order->fresh());

        return $transaction->fresh('order');
    }

    /**
     * Handle payment webhook from PG
     *
     * @throws Exception
     */
    public function handleWebhook(array $webhookData): PaymentTransaction
    {
        // Extract transaction ID from webhook data
        // This depends on PG provider format
        $pgTransactionId = $webhookData['tid'] ?? $webhookData['transaction_id'] ?? null;

        if (! $pgTransactionId) {
            throw new Exception('유효하지 않은 웹훅 데이터: 거래 ID가 누락되었습니다.', 400);
        }

        $transaction = PaymentTransaction::where('pg_transaction_id', $pgTransactionId)->first();

        if (! $transaction) {
            throw new Exception('결제 거래 정보를 찾을 수 없습니다.', 404);
        }

        // Update based on webhook status
        if (config('popbill.enabled') && $transaction->payment_method === PaymentMethod::BANK_TRANSFER) {
            throw new Exception('은행 입금은 POPBiLL 거래내역으로 확인해야 합니다.', 403);
        }
        $webhookStatus = $webhookData['status'] ?? 'unknown';

        $newStatus = match ($webhookStatus) {
            'paid', 'success', 'completed' => PaymentStatus::PAID->value,
            'failed', 'error' => PaymentStatus::FAILED->value,
            'cancelled' => PaymentStatus::CANCELLED->value,
            default => $transaction->status,
        };

        $updateData = [
            'status' => $newStatus,
            'pg_response' => $webhookData,
        ];

        if ($newStatus === PaymentStatus::PAID->value) {
            $updateData['paid_at'] = now();

            // Update order payment status
            $transaction->order->update([
                'payment_status' => PaymentStatus::PAID->value,
            ]);

            $this->designWorkflowService->startForPaidOrder($transaction->order->fresh());
        } elseif ($newStatus === PaymentStatus::FAILED->value) {
            $updateData['failed_at'] = now();

            // Update order payment status
            $transaction->order->update([
                'payment_status' => PaymentStatus::FAILED->value,
            ]);
        }

        $transaction->update($updateData);

        return $transaction->fresh('order');
    }

    /**
     * Cancel payment
     *
     * @throws Exception
     */
    public function cancelPayment(string $transactionId, ?string $reason = null): PaymentTransaction
    {
        $transaction = PaymentTransaction::where('transaction_id', $transactionId)->first();

        if (! $transaction) {
            throw new Exception('결제 정보를 찾을 수 없습니다.', 404);
        }

        if (config('popbill.enabled') && $transaction->payment_method === PaymentMethod::BANK_TRANSFER) {
            return DB::transaction(function () use ($transaction, $reason) {
                $order = Order::whereKey($transaction->order_id)->lockForUpdate()->firstOrFail();
                $payment = PaymentTransaction::whereKey($transaction->id)->lockForUpdate()->firstOrFail();
                if (! $payment->isPending() || $order->payment_status !== PaymentStatus::PENDING->value) {
                    throw new Exception('입금 대기 중인 결제만 취소할 수 있습니다.', 422);
                }
                $payment->update(['status' => PaymentStatus::CANCELLED, 'refund_reason' => $reason, 'failed_at' => now()]);
                $order->update(['payment_status' => PaymentStatus::CANCELLED->value]);
                $order->userCoupon?->rollback();

                return $payment->fresh('order');
            }, 3);
        }

        if ($transaction->isPaid()) {
            throw new Exception('이미 완료된 결제는 취소할 수 없습니다. 환불을 요청하세요.', 400);
        }

        $transaction->update([
            'status' => PaymentStatus::CANCELLED->value,
            'refund_reason' => $reason,
            'failed_at' => now(),
        ]);

        // Update order payment status
        $transaction->order->update([
            'payment_status' => PaymentStatus::CANCELLED->value,
        ]);

        $transaction->order->userCoupon?->rollback();

        return $transaction->fresh('order');
    }

    /**
     * Request refund for completed payment
     *
     * @param  float|null  $amount  Partial refund amount (null for full refund)
     *
     * @throws Exception
     */
    public function requestRefund(string $transactionId, string $reason, ?float $amount = null): PaymentTransaction
    {
        return DB::transaction(function () use ($transactionId, $reason, $amount) {
            $transaction = PaymentTransaction::where('transaction_id', $transactionId)
                ->lockForUpdate()
                ->first();

            if (! $transaction) {
                throw new Exception('결제 정보를 찾을 수 없습니다.', 404);
            }

            if (! $transaction->isPaid()) {
                throw new Exception('완료된 결제만 환불할 수 있습니다.', 400);
            }

            if ($transaction->status === PaymentStatus::REFUNDED) {
                throw new Exception('이미 전액 환불된 결제입니다.', 400);
            }

            $order = $transaction->order;
            $user = $order->user;

            $refundAmount = $amount !== null ? (float) $amount : (float) $transaction->amount;
            $isPartialRefund = $refundAmount < (float) $transaction->amount;

            if ($user->refund_bank == null || $user->refund_account_number == null || $user->refund_account_name == null) {
                throw new Exception('환불계좌를 등록하여주십시요');
            }

            if ($refundAmount <= 0 || $refundAmount > (float) $transaction->amount) {
                throw new Exception('환불 금액이 유효하지 않습니다.', 400);
            }

            // Call payment gateway to actually cancel/refund
            $paymentMethod = $transaction->getPaymentMethodEnum();

            if (! $transaction->pg_transaction_id) {
                throw new Exception('토스 결제 키(paymentKey)가 없어 환불할 수 없습니다.', 400);
            }

            $tossPayload = [
                'cancelReason' => $reason,
                'refundReceiveAccount' => [
                    'bank' => $user->refund_bank ?? $transaction->virtual_account_bank,
                    'accountNumber' => $user->refund_account_number ?? $transaction->virtual_account_number,
                    'holderName' => $user->refund_account_name ?? $transaction->virtual_account_number,
                ],
            ];
            if ($isPartialRefund) {
                $tossPayload['cancelAmount'] = $refundAmount;
            }

            $this->cancelTossPayment($transaction->pg_transaction_id, $tossPayload);

            $refundStatus = $isPartialRefund
                ? PaymentStatus::PARTIALLY_REFUNDED->value
                : PaymentStatus::REFUNDED->value;

            $transaction->update([
                'status' => $refundStatus,
                'refund_reason' => $reason,
                'refunded_at' => now(),
            ]);

            // Update order payment status and order status
            $order->update([
                'payment_status' => $refundStatus,
                'status' => OrderStatus::RefundCompleted->value,
            ]);

            if (! $isPartialRefund) {
                $order->userCoupon?->rollback();
            }

            // Create refund history record
            RefundHistory::create([
                'user_id' => $order->user_id,
                'settlement_date' => now()->toDateString(),
                'refund_amount' => (int) $refundAmount,
                'account_holder' => $user->refund_account_name ?? $order->contact_name,
                'bank_code' => $user->refund_bank ?? $transaction->virtual_account_bank,
                'account_number' => $user->refund_account_number ?? $transaction->virtual_account_number,
                'deposit_date' => null,
                'status' => RefundHistoryStatus::Completed->value,
                'note' => sprintf(
                    '[%s] %s%s',
                    $transaction->transaction_id,
                    $reason,
                    $isPartialRefund ? ' (부분환불)' : ''
                ),
            ]);

            return $transaction->fresh('order');
        });
    }

    /**
     * Cancel a Toss payment via Toss Payments API.
     *
     * Endpoint: POST /v1/payments/{paymentKey}/cancel
     * Docs: https://docs.tosspayments.com/en/api-guide#cancel-a-payment
     *
     * @param  string  $paymentKey  The paymentKey (pg_transaction_id) returned by Toss.
     * @param  array{cancelReason:string,cancelAmount?:int|float,refundReceiveAccount?:array{bank:string,accountNumber:string,holderName:string},taxFreeAmount?:int|float,currency?:string}  $payload
     * @return array The JSON response (Payment object) returned by Toss Payments.
     *
     * @throws Exception
     */
    public function cancelTossPayment(string $paymentKey, array $payload): array
    {
        $secretKey = config('services.toss.secret_key', env('TOSS_SECRET_KEY'));
        $baseUrl = rtrim(config('services.toss.base_url', env('TOSS_BASE_URL', 'https://api.tosspayments.com')), '/');

        if (! $secretKey) {
            throw new Exception('토스 시크릿 키가 설정되지 않았습니다.', 500);
        }

        if (empty($payload['cancelReason'])) {
            throw new Exception('취소 사유(cancelReason)는 필수입니다.', 400);
        }

        $idempotencyKey = (string) Str::uuid();

        $response = Http::withBasicAuth($secretKey, '')
            ->withHeaders([
                'Idempotency-Key' => $idempotencyKey,
            ])
            ->post($baseUrl.'/v1/payments/'.$paymentKey.'/cancel', $payload);

        if ($response->failed()) {
            $body = $response->json();
            $message = $body['message'] ?? '토스 결제 취소에 실패했습니다.';

            throw new Exception('토스 결제 취소 실패: '.$message, $response->status());
        }

        return $response->json();
    }

    /**
     * Create a virtual account with Toss Payments.
     *
     * @param  array  $payload  The payload for the Toss Payments API.
     * @return array The JSON response from Toss Payments.
     *
     * @throws Exception
     */
    public function createTossVirtualAccount(array $payload): array
    {
        $secretKey = config('services.toss.secret_key', env('TOSS_SECRET_KEY'));
        $baseUrl = rtrim(config('services.toss.base_url', env('TOSS_BASE_URL', 'https://api.tosspayments.com')), '/');

        if (! $secretKey) {
            throw new Exception('토스 시크릿 키가 설정되지 않았습니다.', 500);
        }

        $response = Http::withBasicAuth($secretKey, '')
            ->post($baseUrl.'/v1/virtual-accounts', $payload);

        if ($response->failed()) {
            $body = $response->json();
            $message = $body['message'] ?? '토스페이먼츠 가상계좌 발급에 실패했습니다.';

            throw new Exception($message, $response->status());
        }

        return $response->json();
    }

    /**
     * Handle deposit callback from Toss Payments.
     *
     * @param  array{createdAt:string,secret:string,status:string,transactionKey:string,orderId:string}  $webhookData
     *
     * @throws Exception
     */
    public function handleDepositCallback(array $webhookData): PaymentTransaction
    {
        $this->paymentWebhookLogService->log([
            'provider' => PaymentWebhookProvider::TOSS,
            'event_type' => PaymentWebhookEventType::DEPOSIT_CALLBACK,
            'transaction_key' => $webhookData['transactionKey'],
            'order_id' => $webhookData['orderId'],
            'payload' => $webhookData,
            'processing_status' => PaymentWebhookProcessingStatus::RECEIVED,
        ]);

        return DB::transaction(function () use ($webhookData) {

            $transaction = PaymentTransaction::with('order.user')
                ->where(function ($query) use ($webhookData) {
                    $query->WhereHas('order', function ($orderQuery) use ($webhookData) {
                        $orderQuery->where(
                            'order_number',
                            $webhookData['orderId']
                        );
                    });
                })
                ->lockForUpdate()
                ->first();

            if (! $transaction) {
                throw new \RuntimeException('결제 거래 정보를 찾을 수 없습니다.');
            }

            $expectedSecret = $transaction->metadata['secret'] ?? null;

            if (! $expectedSecret || $webhookData['secret'] !== $expectedSecret) {
                throw new \RuntimeException('유효하지 않은 웹훅 서명입니다.');
            }

            $oldStatus = $transaction->status;

            $newStatus = match ($webhookData['status']) {
                'DONE' => PaymentStatus::PAID->value,
                'CANCELED' => PaymentStatus::CANCELLED->value,
                'PARTIAL_CANCELED' => PaymentStatus::PARTIALLY_REFUNDED->value,
                'FAILED' => PaymentStatus::FAILED->value,
                default => $oldStatus,
            };

            $updateData = [
                'status' => $newStatus,
                'pg_response' => $webhookData,
                'pg_transaction_id' => $webhookData['transactionKey'],
            ];

            match ($newStatus) {
                PaymentStatus::PAID->value => $updateData['paid_at'] = now(),
                PaymentStatus::FAILED->value => $updateData['failed_at'] = now(),
                PaymentStatus::CANCELLED->value,
                PaymentStatus::PARTIALLY_REFUNDED->value => $updateData['refunded_at'] = now(),
                default => null,
            };

            $transaction->update($updateData);

            if ($transaction->order) {
                $transaction->order->update([
                    'payment_status' => $newStatus,
                ]);
            }

            if (
                $oldStatus !== PaymentStatus::PAID->value
                && $newStatus === PaymentStatus::PAID->value
            ) {
                $this->walletTransactionService->createWalletTransaction(
                    $transaction->order->user->id,
                    $transaction->amount,
                    WalletTransactionType::DEPOSIT
                );
            }

            return $transaction->fresh('order');
        });
    }

    public function payByVirtualAccount(array $validated): PaymentTransaction
    {
        return DB::transaction(function () use ($validated) {

            $order = Order::query()
                ->where('order_number', $validated['order_number'])
                ->lockForUpdate()
                ->firstOrFail();

            $existingPayment = PaymentTransaction::query()
                ->where('order_id', $order->id)
                ->first();

            if ($existingPayment) {
                throw new \RuntimeException(
                    '이미 결제 내역이 존재합니다.'
                );
            }

            if (
                in_array($order->payment_status, [
                    PaymentStatus::PAID->value,
                    PaymentStatus::REFUNDED->value,
                    PaymentStatus::PARTIALLY_REFUNDED->value,
                ], true)
            ) {
                throw new \RuntimeException('이미 결제 완료된 주문입니다.');
            }

            $wallet = Wallet::with('user')
                ->where('user_id', $order->user_id)
                ->lockForUpdate()
                ->first();

            if (! $wallet) {
                throw new \RuntimeException('지갑을 찾을 수 없습니다.');
            }

            $amount = (int) $order->total_amount;
            $metadata = $validated['metadata'] ?? [];

            $paymentStatus = PaymentStatus::PAID->value;

            if ($wallet->balance < $amount) {
                $virtualPayment = $this->createPaymentByVirtualAccount(
                    $wallet->user,
                    $order
                );
                $metadata = array_merge(
                    $metadata,
                    is_array($virtualPayment)
                    ? $virtualPayment
                    : $virtualPayment->toArray()
                );
                $paymentStatus = PaymentStatus::PENDING->value;
            }

            $walletTransaction = $this->walletTransactionService
                ->createWalletTransaction(
                    $wallet->user_id,
                    -$amount,
                    WalletTransactionType::PAYMENT
                );

            $existingAccount = VirtualAccount::where('user_id', $wallet->user->id)->first();

            if (! $existingAccount) {
                throw new Exception('전용 계정을 찾을 수 없습니다');
            }

            $paymentTransaction = PaymentTransaction::create([
                'order_id' => $order->id,
                'transaction_id' => $this->generateTransactionId(),
                'payment_method' => PaymentMethod::VIRTUAL_ACCOUNT->value,
                'status' => $paymentStatus,
                'amount' => $amount,
                'currency' => $order->currency,
                'pg_name' => 'wallet',
                'virtual_account_number' => $existingAccount->account_number ?? null,
                'virtual_account_bank' => $existingAccount->bank_code ?? null,
                'virtual_account_expires_at' => $existingAccount->closed_at ?? null,
                'bank_account_holder' => $existingAccount->customer_name ?? null,
                'metadata' => ! empty($metadata)
                    ? $metadata
                    : null,
            ]);

            if (isset($walletTransaction)) {
                $walletTransaction->update([
                    'reference_id' => $paymentTransaction->id,
                ]);
            }

            $order->update([
                'payment_status' => $paymentStatus,
                'payment_method' => PaymentMethod::VIRTUAL_ACCOUNT->value,
                'status' => $paymentStatus == PaymentStatus::PAID->value
                    ? ($this->designWorkflowService->requiresDesignApproval($order)
                        ? OrderStatus::PendingReception->value
                        : OrderStatus::Confirmed->value)
                    : OrderStatus::AwaitingPayment->value,
            ]);

            $this->designWorkflowService->startForPaidOrder($order->fresh());

            return $paymentTransaction->fresh('order');
        });
    }

    public function createPaymentByVirtualAccount(User $user, Order $order)
    {
        return DB::transaction(function () use ($user, $order) {

            $existingAccount = VirtualAccount::where('user_id', $user->id)->first();

            if (! $existingAccount) {
                throw new Exception('전용 계정을 찾을 수 없습니다.');
            }

            // if ($existingAccount->closed_at && $existingAccount->closed_at->isPast()) {
            //     throw new \Exception("전용 계정이 만료되었습니다.");
            // }

            $tossPayload = [
                'amount' => (float) $order->total_amount,
                'orderId' => $order->order_number,
                'orderName' => $order->product_name ?? 'Payment order #'.$order->id,
                'customerName' => $user->name,
                'bank' => $existingAccount['bank_code'],
                'accountType' => '고정',
                'accountKey' => $user->id,
            ];

            return $this->createTossVirtualAccount($tossPayload);
        });
    }

    /**
     * Generate unique transaction ID
     */
    public function generateTransactionId(): string
    {
        do {
            $transactionId = 'TXN-'.now()->format('YmdHis').'-'.strtoupper(Str::random(8));
        } while (PaymentTransaction::where('transaction_id', $transactionId)->exists());

        return $transactionId;
    }

    private function resolvePaymentMethodFromToss(?string $method): PaymentMethod
    {
        return match ($method) {
            'CARD', '카드' => PaymentMethod::CARD,
            'VIRTUAL_ACCOUNT', '가상계좌' => PaymentMethod::VIRTUAL_ACCOUNT,
            'TRANSFER', '계좌이체' => PaymentMethod::BANK_TRANSFER,
            default => PaymentMethod::TOSS,
        };
    }
}
