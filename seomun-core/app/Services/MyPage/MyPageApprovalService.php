<?php

namespace App\Services\MyPage;

use App\Enums\ApprovalStatus;
use App\Enums\UserStatus;
use App\Models\Approval;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MyPageApprovalService
{
    /**
     * Get approval settings for user
     */
    public function getSettings(User $user): array
    {
        return [
            'individual_approval' => $user->individual_approval ?? false,
            'approval_line' => $user->approval_line ?? [],
        ];
    }

    /**
     * Update approval settings for user
     */
    public function updateSettings(User $user, array $data): array
    {
        DB::beginTransaction();
        try {
            $updateData = [];

            if (isset($data['individual_approval'])) {
                $updateData['individual_approval'] = (bool) $data['individual_approval'];
            }

            if (isset($data['approval_line'])) {
                $this->validateApprovalLine($data['approval_line']);
                $updateData['approval_line'] = $data['approval_line'];
            }

            $user->update($updateData);

            DB::commit();

            return $this->getSettings($user->fresh());
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update approval settings', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get organization labels, organization option lists, and approver candidates
     * for building the approval line UI.
     *
     * - Organization labels come from the user's company (customer) org_level_*_name.
     * - Organization options are unique values of headquarters/business_office/team/position
     *   among users belonging to the same company (customer).
     * - Approver candidates are active, approved users of the same company (excluding self).
     */
    public function getOptions(User $user): array
    {
        $user->loadMissing('customer');
        $customer = $user->customer;

        $organizationLabels = [
            'level_1' => $customer?->org_level_1_name ?? '본부',
            'level_2' => $customer?->org_level_2_name ?? '사업소',
            'level_3' => $customer?->org_level_3_name ?? '팀',
        ];

        $candidatesQuery = User::query()
            ->where('id', '!=', $user->id)
            ->where('status', UserStatus::ACTIVE)
            ->where('approval_status', ApprovalStatus::ACCEPTED);

        if ($user->customer_id !== null) {
            $candidatesQuery->where('customer_id', $user->customer_id);
        }

        $candidates = $candidatesQuery
            ->orderBy('headquarters')
            ->orderBy('business_office')
            ->orderBy('team')
            ->orderBy('position')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'username',
                'email',
                'headquarters',
                'business_office',
                'team',
                'position',
                'authority',
            ]);

        $organizationOptions = [
            'headquarters' => $candidates->pluck('headquarters')->filter()->unique()->values()->all(),
            'business_office' => $candidates->pluck('business_office')->filter()->unique()->values()->all(),
            'team' => $candidates->pluck('team')->filter()->unique()->values()->all(),
            'position' => $candidates->pluck('position')->filter()->unique()->values()->all(),
        ];

        $approverCandidates = $candidates->map(function (User $candidate) {
            return [
                'id' => $candidate->id,
                'name' => $candidate->name,
                'username' => $candidate->username,
                'email' => $candidate->email,
                'headquarters' => $candidate->headquarters,
                'business_office' => $candidate->business_office,
                'team' => $candidate->team,
                'position' => $candidate->position,
                'authority' => $candidate->authority,
            ];
        })->values()->all();

        return [
            'organization_labels' => $organizationLabels,
            'organization_options' => $organizationOptions,
            'approver_candidates' => $approverCandidates,
        ];
    }

    /**
     * Get approval progress for an order
     */
    public function getApprovalProgress(string $orderNumber, User $user): ?array
    {
        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', $user->id)
            ->first();

        if (! $order) {
            return null;
        }

        $approval = Approval::where('approvable_type', Order::class)
            ->where('approvable_id', $order->id)
            ->with(['items.approver', 'requester'])
            ->first();

        if (! $approval) {
            return null;
        }

        return [
            'order_number' => $orderNumber,
            'status' => $approval->status,
            'current_stage' => $approval->current_stage,
            'total_stages' => $approval->total_stages,
            'requested_at' => $approval->requested_at,
            'approved_at' => $approval->approved_at,
            'rejected_at' => $approval->rejected_at,
            'reject_reason' => $approval->reject_reason,
            'stages' => $approval->items->map(function ($item) {
                return [
                    'stage' => $item->stage,
                    'approver' => [
                        'id' => $item->approver->id,
                        'name' => $item->approver->name,
                        'email' => $item->approver->email,
                    ],
                    'status' => $item->status,
                    'comment' => $item->comment,
                    'approved_at' => $item->approved_at,
                    'rejected_at' => $item->rejected_at,
                ];
            })->toArray(),
        ];
    }

    /**
     * Validate approval line structure
     */
    private function validateApprovalLine(array $approvalLine): void
    {
        if (! is_array($approvalLine)) {
            throw new \InvalidArgumentException('결재선은 배열 형식이어야 합니다.');
        }

        // Validate structure: [{'stage': 1, 'approver_id': 1}, ...]
        foreach ($approvalLine as $stage) {
            if (! isset($stage['stage']) || ! isset($stage['approver_id'])) {
                throw new \InvalidArgumentException('결재선 항목에는 stage와 approver_id가 필요합니다.');
            }

            // Check if approver exists
            if (! User::find($stage['approver_id'])) {
                throw new \InvalidArgumentException("결재자 ID {$stage['approver_id']}가 존재하지 않습니다.");
            }
        }
    }
}
