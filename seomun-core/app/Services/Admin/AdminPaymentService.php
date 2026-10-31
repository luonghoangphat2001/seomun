<?php

namespace App\Services\Admin;

use App\Enums\PaymentMethod;
use App\Http\Resources\AdminPaymentResource;
use App\Models\PaymentTransaction;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use InvalidArgumentException;

class AdminPaymentService
{
    public function __construct(protected PaymentRepositoryInterface $paymentRepo) {}

    public function getPaginate(array $fillters, int $perPage): LengthAwarePaginator
    {
        return $this->paymentRepo->getPaginated($fillters, $perPage);
    }

    public function getById(int $id): AdminPaymentResource
    {
        $payment = $this->paymentRepo->findById($id);

        if (! $payment) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException("Payment #{$id} not found");
        }

        return new AdminPaymentResource($payment);
    }

    /**
     * Configure period
     */
    public function configPeriod(string $period = 'monthly', ?string $startDate = null, ?string $endDate = null): array
    {
        $config = [];

        // If custom dates are provided, use them
        if ($startDate && $endDate) {
            $config['start_date'] = $startDate;
            $config['end_date'] = $endDate;

            return $config;
        }

        $now = Carbon::now();
        switch ($period) {
            case 'quarterly':
                $config['start_date'] = $now->startOfQuarter()->toDateString();
                $config['end_date'] = $now->endOfQuarter()->toDateString();
                break;

            case 'yearly':
                $config['start_date'] = $now->startOfYear()->toDateString();
                $config['end_date'] = $now->endOfYear()->toDateString();
                break;

            case 'monthly':
            default:
                $config['start_date'] = $now->startOfMonth()->toDateString();
                $config['end_date'] = $now->endOfMonth()->toDateString();
                break;
        }

        return $config;
    }

    /**
     * Get payment statistics - main service method that orchestrates the statistics gathering
     */
    public function getPaymentStatistics(array $customerIds = [], array $configPeriod = []): array
    {
        if (empty($configPeriod) || ! isset($configPeriod['start_date']) || ! isset($configPeriod['end_date'])) {
            throw new InvalidArgumentException('Invalid config period');
        }

        $paymentMethodStats = $this->getPaymentMethodStatistics($customerIds, $configPeriod);
        $paymentStatusStats = $this->getPaymentStatusStatistics($customerIds, $configPeriod);

        return [
            'start_date' => $configPeriod['start_date'],
            'end_date' => $configPeriod['end_date'],
            'sales_statistics' => $paymentMethodStats, // Sales statistics by payment method
            'payment_status_statistics' => $paymentStatusStats, // Payment status statistics (success/failed)
        ];
    }

    /**
     * Get payment status statistics - successful/failed/refunded payments with percentages
     */
    private function getPaymentStatusStatistics(array $customerIds = [], array $configPeriod = []): array
    {
        $rawData = $this->paymentRepo->getPaymentStatistics($customerIds, $configPeriod);

        $statusStats = [
            'successful' => [
                'count' => 0,
                'amount' => 0,
                'percentage_count' => 0,
                'percentage_amount' => 0,
            ],
            'failed' => [
                'count' => 0,
                'amount' => 0,
                'percentage_count' => 0,
                'percentage_amount' => 0,
            ],
            'refunded' => [
                'count' => 0,
                'amount' => 0,
                'percentage_count' => 0,
                'percentage_amount' => 0,
            ],
        ];

        foreach ($rawData['results'] as $result) {
            $statusStats['successful']['count'] += $result['successful_count'];
            $statusStats['successful']['amount'] += $result['successful_amount'];
            $statusStats['failed']['count'] += $result['failed_count'];
            $statusStats['failed']['amount'] += $result['failed_amount'];
            $statusStats['refunded']['count'] += $result['refunded_count'];
            $statusStats['refunded']['amount'] += $result['refunded_amount'];
        }

        if ($rawData['total_count'] > 0) {
            $statusStats['successful']['percentage_count'] = round(($statusStats['successful']['count'] / $rawData['total_count']) * 100, 2);
            $statusStats['failed']['percentage_count'] = round(($statusStats['failed']['count'] / $rawData['total_count']) * 100, 2);
            $statusStats['refunded']['percentage_count'] = round(($statusStats['refunded']['count'] / $rawData['total_count']) * 100, 2);
        }

        if ($rawData['total_amount'] > 0) {
            $statusStats['successful']['percentage_amount'] = round(($statusStats['successful']['amount'] / $rawData['total_amount']) * 100, 2);
            $statusStats['failed']['percentage_amount'] = round(($statusStats['failed']['amount'] / $rawData['total_amount']) * 100, 2);
            $statusStats['refunded']['percentage_amount'] = round(($statusStats['refunded']['amount'] / $rawData['total_amount']) * 100, 2);
        }

        return $statusStats;
    }

    /**
     * Get payment statistics by payment method
     */
    private function getPaymentMethodStatistics(array $customerIds = [], array $configPeriod = []): array
    {
        $rawData = $this->paymentRepo->getPaymentStatistics($customerIds, $configPeriod);

        $processedResults = [];
        foreach ($rawData['results'] as $result) {
            $paymentMethod = $result['payment_method'];
            $key = $this->normalizePaymentMethod($paymentMethod);

            if (empty($key)) {
                continue;
            }

            if (! isset($processedResults[$key])) {
                $processedResults[$key] = $this->createEmptyPaymentMethodStat($key);
            }

            $processedResults[$key] = $this->mergePaymentMethodStat($processedResults[$key], $result);
        }

        return $this->finalizePaymentMethodStats($processedResults, $rawData['total_count'], $rawData['total_amount']);
    }

    /**
     * Normalize payment method for grouping similar methods (e.g., card and credit_card)
     */
    private function normalizePaymentMethod($paymentMethod): string
    {
        if (empty($paymentMethod)) {
            return '';
        }

        if ($paymentMethod instanceof PaymentMethod) {
            $paymentMethod = $paymentMethod->value;
        }

        if (in_array($paymentMethod, ['card', 'credit_card'])) {
            return PaymentMethod::CARD->value;
        }

        return $paymentMethod;
    }

    /**
     * Create an empty payment method stat structure
     */
    private function createEmptyPaymentMethodStat(string $paymentMethod): array
    {
        return [
            'payment_method' => $paymentMethod,
            'total_count' => 0,
            'successful_count' => 0,
            'failed_count' => 0,
            'refunded_count' => 0,
            'successful_amount' => 0,
            'failed_amount' => 0,
            'refunded_amount' => 0,
            'total_amount' => 0,
            'unit' => 'count',
        ];
    }

    /**
     * Merge payment method stat with new data
     */
    private function mergePaymentMethodStat(array $existing, array $new): array
    {
        return [
            'payment_method' => $existing['payment_method'],
            'total_count' => $existing['total_count'] + $new['total_count'],
            'successful_count' => $existing['successful_count'] + $new['successful_count'],
            'failed_count' => $existing['failed_count'] + $new['failed_count'],
            'refunded_count' => $existing['refunded_count'] + $new['refunded_count'],
            'successful_amount' => $existing['successful_amount'] + $new['successful_amount'],
            'failed_amount' => $existing['failed_amount'] + $new['failed_amount'],
            'refunded_amount' => $existing['refunded_amount'] + $new['refunded_amount'],
            'total_amount' => $existing['total_amount'] + $new['total_amount'],
            'unit' => 'count',
        ];
    }

    /**
     * Finalize payment method stats by adding percentages and labels
     */
    private function finalizePaymentMethodStats(array $stats, int $totalCount, float $totalAmount): array
    {
        foreach ($stats as &$stat) {
            $stat['successful_percentage'] = $totalCount > 0 ? round(($stat['successful_count'] / $totalCount) * 100, 2) : 0;
            $stat['failed_percentage'] = $totalCount > 0 ? round(($stat['failed_count'] / $totalCount) * 100, 2) : 0;
            $stat['refunded_percentage'] = $totalCount > 0 ? round(($stat['refunded_count'] / $totalCount) * 100, 2) : 0;
            $stat['amount_percentage'] = $totalAmount > 0 ? round(($stat['total_amount'] / $totalAmount) * 100, 2) : 0;
            $stat['payment_method_label'] = $this->getPaymentMethodLabel($stat['payment_method']);
        }

        return $stats;
    }

    /**
     * Get payment method label from enum
     */
    private function getPaymentMethodLabel(string $paymentMethod): string
    {
        try {
            $method = PaymentMethod::fromStored($paymentMethod);

            return $method ? $method->label() : $paymentMethod;
        } catch (\Throwable $e) {
            return $paymentMethod;
        }
    }
}
