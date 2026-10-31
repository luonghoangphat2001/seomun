<?php

namespace App\Services\Admin;

use App\Models\Customer;
use App\Models\PaymentTransaction;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class AdminSettlementReportService
{
    /**
     * Get detailed report data by customer, product, category
     */
    public function getReportData(array $filters = []): array
    {
        try {
            \Log::info('AdminSettlementReportService::getReportData called', $filters);

            $query = PaymentTransaction::with([
                'order.items.product.category',
                'order.user.customer',
            ])->filters($filters);

            \Log::info('PaymentTransaction query built');

            $paymentTransactions = $query->get();
            \Log::info('PaymentTransactions retrieved', ['count' => $paymentTransactions->count()]);

            $reportData = [];

            foreach ($paymentTransactions as $transaction) {
                try {
                    $order = $transaction->order;
                    if (! $order || $order->subtotal_amount <= 0) {
                        continue;
                    }

                    $customer = $order->user?->customer ?? null;

                    $paymentAmount = $transaction->amount;

                    foreach ($order->items as $item) {
                        try {
                            $product = $item->product ?? null;
                            $category = $product?->category ?? null;

                            if (! $product || ! $category) {
                                continue;
                            }

                            // Calculate proportional amounts
                            $itemProportion = $item->total_price / $order->subtotal_amount;
                            $itemPaymentAmount = $paymentAmount * $itemProportion;
                            $supplyPrice = $item->total_price;
                            $vatAmount = $order->tax_amount * $itemProportion;
                            $commissionRate = $this->getCommissionRate($customer);
                            $commissionAmount = $supplyPrice * ($commissionRate / 100);

                            $reportData[] = [
                                'transaction_id' => $transaction->transaction_id,
                                'order_number' => $order->order_number,
                                'status' => $transaction->status->label(),
                                'payment_status' => $transaction->payment_method?->label() ?? $transaction->getRawOriginal('payment_method') ?? 'N/A',
                                'receivable_status' => $this->getReceivableStatus($transaction),
                                'paid_at' => $transaction->paid_at,
                                'failed_at' => $transaction->failed_at,
                                'created_at' => $transaction->created_at,
                                'customer_id' => $customer?->id,
                                'customer_name' => $customer?->company_name,
                                'product_id' => $product->id,
                                'product_name' => $product->name,
                                'category_id' => $category->id,
                                'category_name' => $category->name,
                                'payment_amount' => round($itemPaymentAmount, 2),
                                'supply_price' => round($supplyPrice, 2),
                                'vat' => round($vatAmount, 2),
                                'commission' => round($commissionAmount, 2),
                            ];
                        } catch (\Throwable $itemTh) {
                            \Log::error('Error processing order item', [
                                'transaction_id' => $transaction->id,
                                'order_id' => $order->id,
                                'item_id' => $item->id,
                                'message' => $itemTh->getMessage(),
                                'trace' => $itemTh->getTraceAsString(),
                            ]);

                            continue;
                        }
                    }
                } catch (\Throwable $orderTh) {
                    \Log::error('Error processing transaction', [
                        'transaction_id' => $transaction->id,
                        'message' => $orderTh->getMessage(),
                        'trace' => $orderTh->getTraceAsString(),
                    ]);

                    continue;
                }
            }

            \Log::info('Report data generated', ['count' => count($reportData)]);

            return $reportData;
        } catch (\Throwable $th) {
            \Log::error('AdminSettlementReportService::getReportData error', [
                'message' => $th->getMessage(),
                'trace' => $th->getTraceAsString(),
            ]);
            throw $th;
        }
    }

    /**
     * Get paginated report
     */
    public function getPaginate(array $filters = []): LengthAwarePaginator
    {
        $data = $this->getReportData($filters);

        $page = $filters['page'] ?? config('app.paginate.page');
        $perPage = $filters['per_page'] ?? config('app.paginate.per_page');
        $offset = ($page - 1) * $perPage;

        $paginatedData = array_slice($data, $offset, $perPage);

        return new Paginator(
            $paginatedData,
            count($data),
            $perPage,
            $page,
            ['path' => request()->url(), 'pageName' => 'page']
        );
    }

    /**
     * Get receivable status
     */
    private function getReceivableStatus(PaymentTransaction $transaction): string
    {
        if ($transaction->status->isCompleted()) {
            return 'Received';
        }

        if ($transaction->status->isPending()) {
            return 'Partially Received';
        }

        return 'Outstanding';
    }

    /**
     * Get commission rate for customer
     */
    private function getCommissionRate(?Customer $customer): float
    {
        if (! $customer) {
            return 0;
        }

        return ($customer->commission_cloud_card ?? 0) +
            ($customer->commission_office_printing ?? 0) +
            ($customer->commission_pro_order ?? 0) +
            ($customer->commission_custom_product ?? 0) +
            ($customer->commission_promo_material ?? 0) +
            ($customer->commission_name_tag ?? 0) +
            ($customer->commission_large_format_print ?? 0) +
            ($customer->commission_file_order ?? 0);
    }
}
