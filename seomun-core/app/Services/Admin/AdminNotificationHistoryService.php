<?php

namespace App\Services\Admin;

use App\Http\Resources\Admin\AdminNotificationHistoryResource;
use App\Models\NotificationHistory;
use App\Models\NotificationTemplate;
use App\Models\User;
use App\Services\PaginationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminNotificationHistoryService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * Get search filter options for notification history.
     *
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        $templateNumbers = NotificationTemplate::query()
            ->select('template_number')
            ->distinct()
            ->orderBy('template_number')
            ->pluck('template_number')
            ->filter()
            ->values()
            ->map(fn (string $number) => [
                'value' => $number,
                'label' => $number,
            ])
            ->all();

        $recipientNames = NotificationHistory::query()
            ->select('recipient_name')
            ->distinct()
            ->orderBy('recipient_name')
            ->pluck('recipient_name')
            ->filter()
            ->values()
            ->map(fn (string $name) => [
                'value' => $name,
                'label' => $name,
            ])
            ->all();

        $senders = User::query()
            ->whereIn('id', function ($query) {
                $query->select('sender_id')
                    ->from('notification_histories')
                    ->whereNotNull('sender_id')
                    ->distinct();
            })
            ->select('id', 'username', 'name')
            ->orderBy('name')
            ->orderBy('username')
            ->limit(100)
            ->get()
            ->map(fn (User $user) => [
                'value' => $user->id,
                'label' => $user->name ?? $user->username ?? ('User #'.$user->id),
            ])
            ->all();

        return [
            'template_number_options' => $templateNumbers,
            'notification_type_options' => [
                ['value' => 'email', 'label' => 'Email'],
                ['value' => 'notification_talk', 'label' => 'Notification Talk'],
                ['value' => 'sms', 'label' => 'SMS'],
            ],
            'recipient_name_options' => $recipientNames,
            'sending_result_options' => [
                ['value' => 'success', 'label' => 'Success'],
                ['value' => 'failure', 'label' => 'Failure'],
            ],
            'sender_options' => $senders,
        ];
    }

    /**
     * Get notification history list with filters.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getHistories(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = NotificationHistory::query()
            ->with(['template', 'sender']);

        // Search term
        $search = Arr::get($filters, 'search_term');
        if ($search) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('message_title', 'like', '%'.$search.'%')
                    ->orWhere('recipient_name', 'like', '%'.$search.'%')
                    ->orWhere('recipient_contact', 'like', '%'.$search.'%');
            });
        }

        // Filter by template number
        $templateNumber = Arr::get($filters, 'template_number');
        if ($templateNumber) {
            $query->whereHas('template', function (Builder $builder) use ($templateNumber) {
                $builder->where('template_number', 'like', '%'.$templateNumber.'%');
            });
        }

        // Filter by notification type
        $notificationType = Arr::get($filters, 'notification_type');
        if ($notificationType) {
            $query->where('notification_type', $notificationType);
        }

        // Filter by recipient name
        $recipientName = Arr::get($filters, 'recipient_name');
        if ($recipientName) {
            $query->where('recipient_name', 'like', '%'.$recipientName.'%');
        }

        // Filter by sending date
        $sendingDateFrom = Arr::get($filters, 'sending_date_from');
        $sendingDateTo = Arr::get($filters, 'sending_date_to');
        if ($sendingDateFrom) {
            $query->whereDate('sent_at', '>=', $sendingDateFrom);
        }
        if ($sendingDateTo) {
            $query->whereDate('sent_at', '<=', $sendingDateTo);
        }

        // Filter by sending result
        $sendingResult = Arr::get($filters, 'sending_result');
        if ($sendingResult) {
            $query->where('sending_result', $sendingResult);
        }

        // Filter by sender
        $senderId = Arr::get($filters, 'sender_id');
        if ($senderId) {
            $query->where('sender_id', $senderId);
        }

        // Sort
        $sortBy = Arr::get($filters, 'sort_by', 'sent_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');

        $sortColumn = match ($sortBy) {
            'recipient_name' => 'recipient_name',
            'sent_at' => 'sent_at',
            default => 'sent_at',
        };

        $query->orderBy($sortColumn, $sortOrder);

        $currentPage = Arr::get($filters, 'current_page', 1);

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }

    public function getHistory(int $id): NotificationHistory
    {
        return NotificationHistory::with(['template', 'sender'])->findOrFail($id);
    }

    /**
     * Resend a notification based on existing history.
     *
     * @param  array<string, mixed>  $overrideData
     */
    public function resend(NotificationHistory $history, array $overrideData = []): NotificationHistory
    {
        return DB::transaction(function () use ($history, $overrideData) {
            // For now, we just create a new history record with status success/failure = same as original.
            // Integration with real sending channels can be implemented later.

            $data = [
                'notification_template_id' => $history->notification_template_id,
                'notification_type' => $history->notification_type,
                'recipient_name' => $overrideData['recipient_name'] ?? $history->recipient_name,
                'recipient_contact' => $overrideData['recipient_contact'] ?? $history->recipient_contact,
                'message_title' => $overrideData['message_title'] ?? $history->message_title,
                'message_content' => $overrideData['message_content'] ?? $history->message_content,
                'sending_result' => 'success', // Assume success for now
                'failure_reason' => null,
                'sender_id' => $overrideData['sender_id'] ?? $history->sender_id,
                'sent_at' => now(),
                'meta' => $history->meta,
            ];

            return NotificationHistory::create($data);
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function formatListResponse(LengthAwarePaginator $paginator): array
    {
        return [
            'histories' => AdminNotificationHistoryResource::collection($paginator->items()),
            'pagination' => $this->paginationService->format($paginator),
        ];
    }
}
