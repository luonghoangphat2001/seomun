<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\PaymentTransaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PaymentTransactionSeeder extends Seeder
{
    public function run(): void
    {
        $taxInvoiceStatuses  = ['pending', 'issued', 'deleted', null, null];
        $cashReceiptStatuses = ['pending', 'issued', 'deleted', null, null];

        // Find orders that don't have a payment transaction yet
        $orders = Order::doesntHave('paymentTransaction')->take(20)->get();

        if ($orders->isEmpty()) {
            // All orders already have transactions — just update existing ones
            $transactions = PaymentTransaction::take(20)->get();

            if ($transactions->isEmpty()) {
                $this->command->warn('No payment transactions found. Run OrderSeeder first.');
                return;
            }

            $this->updateTransactions($transactions, $taxInvoiceStatuses, $cashReceiptStatuses);
            return;
        }

        // Create new payment transactions for orders that don't have one
        $index = 0;
        foreach ($orders as $order) {
            $taxStatus  = $taxInvoiceStatuses[$index % count($taxInvoiceStatuses)];
            $cashStatus = $cashReceiptStatuses[($index + 2) % count($cashReceiptStatuses)];
            $paidAt     = now()->subDays(rand(1, 60));

            PaymentTransaction::create([
                'order_id'               => $order->id,
                'transaction_id'         => 'TXN-' . strtoupper(Str::random(12)),
                'payment_method'         => 'card',
                'status'                 => 'paid',
                'amount'                 => $order->total_amount,
                'currency'               => $order->currency ?? 'KRW',
                'paid_at'                => $paidAt,
                'tax_invoice_status'     => $taxStatus,
                'tax_invoice_issued_at'  => $taxStatus === 'issued' ? $paidAt->copy()->addDay() : null,
                'cash_receipt_status'    => $cashStatus,
                'cash_receipt_issued_at' => $cashStatus === 'issued' ? $paidAt->copy()->addDay() : null,
                'receipt_notes'          => ($taxStatus || $cashStatus) ? '테스트 발행 요청' : null,
            ]);

            $index++;
        }

        $this->command->info("Created {$orders->count()} payment transactions.");
        $this->reportCounts();
    }

    private function updateTransactions(iterable $transactions, array $taxStatuses, array $cashStatuses): void
    {
        foreach ($transactions as $index => $transaction) {
            $taxStatus  = $taxStatuses[$index % count($taxStatuses)];
            $cashStatus = $cashStatuses[($index + 2) % count($cashStatuses)];
            $paidAt     = $transaction->paid_at ?? now()->subDays(rand(1, 60));

            $transaction->update([
                'tax_invoice_status'     => $taxStatus,
                'tax_invoice_issued_at'  => $taxStatus === 'issued' ? $paidAt->copy()->addDay() : null,
                'cash_receipt_status'    => $cashStatus,
                'cash_receipt_issued_at' => $cashStatus === 'issued' ? $paidAt->copy()->addDay() : null,
                'receipt_notes'          => ($taxStatus || $cashStatus) ? '테스트 발행 요청' : null,
            ]);
        }

        $this->command->info("Updated {$transactions->count()} payment transactions.");
        $this->reportCounts();
    }

    private function reportCounts(): void
    {
        $taxCount  = PaymentTransaction::whereNotNull('tax_invoice_status')->count();
        $cashCount = PaymentTransaction::whereNotNull('cash_receipt_status')->count();
        $this->command->info("Tax invoices: {$taxCount} | Cash receipts: {$cashCount}");
    }
}
