<?php

namespace App\Services\Popbill;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\BankDeposit;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Services\OrderItemDesignWorkflowService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BankDepositMatcher
{
    public function __construct(private OrderItemDesignWorkflowService $workflow) {}

    public function autoMatch(BankDeposit $deposit): void
    {
        if ($deposit->status !== 'unmatched') {
            return;
        }
        // No amount-only or fuzzy matching; references and receiving account must agree.
        $matches = PaymentTransaction::with('order')
            ->where('payment_method', PaymentMethod::BANK_TRANSFER->value)
            ->where('status', PaymentStatus::PENDING->value)
            ->where('currency', 'KRW')->where('amount', $deposit->amount)
            ->where('created_at', '<=', $deposit->deposited_at)
            ->get()->filter(fn ($payment) => $this->eligible($deposit, $payment)
                && $this->referencesMatch($deposit, $payment));

        if ($matches->count() !== 1) {
            BankDeposit::whereKey($deposit->id)->where('status', 'unmatched')->update([
                'match_reason' => $matches->isEmpty() ? 'no_exact_match' : 'ambiguous_match',
            ]);

            return;
        }
        try {
            $this->confirm($deposit->id, $matches->first()->id);
        } catch (ValidationException) {
            // A concurrent cancellation, manual confirmation, or payment won the race.
            BankDeposit::whereKey($deposit->id)->where('status', 'unmatched')
                ->update(['match_reason' => 'payment_changed']);
        }
    }

    public function confirm(int $depositId, int $paymentId, ?int $adminId = null, ?string $note = null): BankDeposit
    {
        return DB::transaction(function () use ($depositId, $paymentId, $adminId, $note) {
            $orderId = PaymentTransaction::findOrFail($paymentId)->order_id;
            // Same order -> payment lock order as checkout.
            $order = Order::whereKey($orderId)->lockForUpdate()->firstOrFail();
            $payment = PaymentTransaction::whereKey($paymentId)->lockForUpdate()->firstOrFail();
            $payment->setRelation('order', $order);
            $deposit = BankDeposit::whereKey($depositId)->lockForUpdate()->firstOrFail();
            if ($deposit->payment_transaction_id === $paymentId && $deposit->status === 'matched') {
                return $deposit;
            }
            if ($deposit->status !== 'unmatched' || ! $this->eligible($deposit, $payment)
                || ($adminId === null && ! $this->referencesMatch($deposit, $payment))) {
                throw ValidationException::withMessages(['payment_transaction_id' => '입금 내역과 결제 정보를 확인해 주세요.']);
            }

            $payment->update([
                'status' => PaymentStatus::PAID,
                'pg_name' => 'popbill',
                'pg_transaction_id' => $deposit->provider_tid,
                'paid_at' => $deposit->deposited_at,
            ]);
            $order->update([
                'payment_status' => PaymentStatus::PAID->value,
                'payment_method' => PaymentMethod::BANK_TRANSFER->value,
                'status' => OrderStatus::PendingReception->value,
            ]);
            $deposit->update([
                'status' => 'matched', 'match_reason' => $adminId ? 'manual' : 'exact_match',
                'payment_transaction_id' => $payment->id, 'order_id' => $order->id,
                'matched_by' => $adminId, 'admin_note' => $note, 'matched_at' => now(),
            ]);
            $this->workflow->startForPaidOrder($order);

            return $deposit->fresh();
        }, 3);
    }

    private function eligible(BankDeposit $deposit, PaymentTransaction $payment): bool
    {
        $order = $payment->order;

        return config('popbill.enabled') && (! app()->environment('production') || ! config('popbill.test'))
            && $payment->isPending() && $payment->payment_method === PaymentMethod::BANK_TRANSFER
            && $payment->currency === 'KRW' && (string) $payment->amount === (string) $deposit->amount
            && ($payment->metadata['bank_account_identity'] ?? null) === $deposit->account_identity
            && $payment->created_at->lte($deposit->deposited_at)
            && $order && $order->currency === 'KRW'
            && (int) $order->total_amount === (int) $deposit->amount
            && $order->payment_status === PaymentStatus::PENDING->value
            && $order->status === OrderStatus::AwaitingPayment->value;
    }

    private function referencesMatch(BankDeposit $deposit, PaymentTransaction $payment): bool
    {
        // Bank remarks differ by bank. Only accept full-field matches, never substrings.
        // Do not use POPBiLL's user-editable memo as payment evidence.
        $remarks = array_map(fn ($value) => trim((string) $value), $deposit->remarks);
        $instructions = $payment->metadata['bank_transfer'] ?? [];
        if (($instructions['matching_rule'] ?? null) === 'depositor_name_v1') {
            $name = trim((string) $payment->bank_account_holder);

            // Woori's verified sender display is remark1, not branch/channel or editable memo.
            return $name !== '' && $name === ($remarks[0] ?? '');
        }
        if (($instructions['matching_rule'] ?? null) === 'reference_v1') {
            $reference = PaymentReference::forId($payment->id);

            return ($instructions['transfer_reference'] ?? null) === $reference
                && in_array($reference, $remarks, true);
        }
        // Preserve the conservative rule for payments issued before reference_v1.
        $name = trim((string) $payment->bank_account_holder);
        $reference = (string) $payment->order->order_number;

        return $name !== '' && $name !== $reference
            && in_array($name, $remarks, true) && in_array($reference, $remarks, true);
    }
}
