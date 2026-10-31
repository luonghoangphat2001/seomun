<?php

namespace App\Services\Admin;

use App\Enums\InquiryCategory;
use App\Enums\InquiryStatus;
use App\Models\Inquiry;
use Illuminate\Support\Facades\DB;

class AdminInquiryStatisticsService
{
    /**
     * Get inquiry statistics based on filters
     */
    public function getInquiryStatistics(array $customerIds = [], array $config = []): array
    {
        $totalInquiries = $this->getTotalInquiries($customerIds, $config);
        $byStatus = $this->getInquiriesByStatus($customerIds, $config);
        $byPersonInCharge = $this->getInquiriesByPersonInCharge($customerIds, $config);

        // Calculate summary metrics
        $summary = $this->getSummaryMetrics($totalInquiries, $byStatus, $byPersonInCharge);

        $data = [
            'summary' => $summary,
            'total_inquiries' => $totalInquiries,
            'by_inquiry_type' => $this->getInquiriesByType($customerIds, $config),
            'by_processing_status' => $byStatus,
            'by_person_in_charge' => $byPersonInCharge,
        ];

        return $data;
    }

    /**
     * Calculate summary metrics for dashboard display
     */
    private function getSummaryMetrics(int $totalInquiries, array $byStatus, array $byPersonInCharge): array
    {
        $pendingCount = collect($byStatus)->where('status', InquiryStatus::PENDING->value)->first()['count'] ?? 0;
        $respondedCount = collect($byStatus)->where('status', InquiryStatus::RESPONDED->value)->first()['count'] ?? 0;

        $resolutionRate = $totalInquiries > 0 ? round(($respondedCount / $totalInquiries) * 100, 1) : 0;
        $avgProcessingTime = collect($byPersonInCharge)->avg('avg_processing_time');
        $avgProcessingTime = $avgProcessingTime ? round($avgProcessingTime, 1) : 0;

        return [
            'total_inquiries' => [
                'value' => $totalInquiries,
                'label' => 'TOTAL INQUIRIES',
                'unit' => 'count',
                'description' => 'Received this period',
            ],
            'resolution_rate' => [
                'value' => $resolutionRate,
                'label' => 'RESOLUTION RATE',
                'unit' => 'percent',
                'description' => 'Target: 95%',
            ],
            'avg_processing_time' => [
                'value' => $avgProcessingTime,
                'label' => 'AVG. PROCESS TIME',
                'unit' => 'hours',
                'description' => 'Response speed',
            ],
            'unassigned' => [
                'value' => $pendingCount,
                'label' => 'UNASSIGNED',
                'unit' => 'count',
                'description' => 'Action required',
            ],
        ];
    }

    /**
     * Get period configuration
     */
    public function periodConfig(string $period = '30d'): array
    {
        return match ($period) {
            '7d' => [
                'start_date' => now()->subDays(7),
                'end_date' => now(),
            ],
            '90d' => [
                'start_date' => now()->subDays(90),
                'end_date' => now(),
            ],
            '365d' => [
                'start_date' => now()->subDays(365),
                'end_date' => now(),
            ],
            default => [
                'start_date' => now()->subDays(30),
                'end_date' => now(),
            ],
        };
    }

    /**
     * Get total inquiries count
     */
    private function getTotalInquiries(array $customerIds = [], array $config = []): int
    {
        return $this->applyFilters(Inquiry::query(), $customerIds, $config)->count();
    }

    /**
     * Get inquiries by type (category)
     */
    private function getInquiriesByType(array $customerIds = [], array $config = []): array
    {
        $query = $this->applyFilters(Inquiry::query(), $customerIds, $config);

        $results = $query->select('category', DB::raw('count(*) as count'))
            ->groupBy('category')
            ->get();

        $data = [];
        foreach (InquiryCategory::cases() as $category) {
            $data[] = [
                'type' => $category->value,
                'label' => $category->label(),
                'count' => $results->where('category', $category->value)->first()?->count ?? 0,
            ];
        }

        return $data;
    }

    /**
     * Get inquiries by processing status
     */
    private function getInquiriesByStatus(array $customerIds = [], array $config = []): array
    {
        $query = $this->applyFilters(Inquiry::query(), $customerIds, $config);

        $results = $query->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        $data = [];
        foreach (InquiryStatus::cases() as $status) {
            $data[] = [
                'status' => $status->value,
                'label' => $status->label(),
                'count' => $results->where('status', $status->value)->first()?->count ?? 0,
            ];
        }

        return $data;
    }

    /**
     * Get inquiries by person in charge with processing time
     */
    private function getInquiriesByPersonInCharge(array $customerIds = [], array $config = []): array
    {
        $query = $this->applyFilters(Inquiry::query(), $customerIds, $config);

        $results = $query->select(
            'replied_by',
            DB::raw('count(*) as cases_processed'),
            DB::raw('avg(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_processing_time')
        )
            ->whereNotNull('replied_by')
            ->groupBy('replied_by')
            ->with(['repliedBy:id,name,email'])
            ->get();

        $data = [];
        foreach ($results as $result) {
            $data[] = [
                'person_in_charge' => [
                    'id' => $result?->repliedBy->id,
                    'name' => $result?->repliedBy->name,
                    'email' => $result?->repliedBy->email,
                ],
                'cases_processed' => $result?->cases_processed,
                'avg_processing_time' => round($result?->avg_processing_time, 2),
            ];
        }

        return $data;
    }

    /**
     * Apply common filters to the query
     */
    private function applyFilters($query, array $customerIds = [], array $config = [])
    {
        if (! empty($customerIds)) {
            $query->whereHas('user', function ($q) use ($customerIds) {
                $q->whereIn('id', $customerIds);
            });
        }

        if (isset($config['start_date'])) {
            $query->whereDate('created_at', '>=', $config['start_date']);
        }

        if (isset($config['end_date'])) {
            $query->whereDate('created_at', '<=', $config['end_date']);
        }

        return $query;
    }
}
