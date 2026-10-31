<?php

namespace App\Services\Admin;

use App\Enums\InquiryCategory;
use App\Enums\InquiryStatus;
use App\Enums\RealtimeNotificationType;
use App\Events\MemberNotificationRequested;
use App\Http\Resources\AdminInquiryDetailResource;
use App\Models\Inquiry;
use App\Models\InquiryAttachment;
use App\Models\InquiryComment;
use App\Models\InquiryInternalMemo;
use App\Models\User;
use App\Services\FileService;
use App\Services\Notifications\InquiryNotificationService;
use App\Services\PaginationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Spatie\Activitylog\Models\Activity;

class AdminInquiryService
{
    public function __construct(
        protected PaginationService $paginationService,
        protected FileService $fileService,
        protected InquiryNotificationService $notificationService,
    ) {}

    /**
     * Get filter metadata for admin inquiry list.
     *
     * @return array<string, mixed>
     */
    public function getFilterSearch(): array
    {
        // Inquiry type options from enum
        $inquiryTypeOptions = array_map(function (InquiryCategory $category) {
            return [
                'value' => $category->value,
                'label' => $category->label(),
            ];
        }, InquiryCategory::cases());

        // Status options from enum
        $statusOptions = array_map(function (InquiryStatus $status) {
            return [
                'value' => $status->value,
                'label' => $status->label(),
            ];
        }, InquiryStatus::cases());

        // Priority options (static for now, FE enum should align)
        $priorityOptions = [
            ['value' => 'low', 'label' => 'Low'],
            ['value' => 'medium', 'label' => 'Medium'],
            ['value' => 'high', 'label' => 'High'],
        ];

        // Assigned-to options: distinct replied_by users on inquiries
        $assignedUserIds = Inquiry::query()
            ->whereNotNull('replied_by')
            ->distinct()
            ->pluck('replied_by')
            ->filter();

        $assignedToOptions = User::query()
            ->whereIn('id', $assignedUserIds)
            ->get()
            ->map(function (User $user) {
                return [
                    'value' => $user->id,
                    'label' => $user->name,
                ];
            })
            ->values()
            ->toArray();

        return [
            'filters' => [
                'inquiry_type_options' => $inquiryTypeOptions,
                'status_options' => $statusOptions,
                'priority_options' => $priorityOptions,
                'assigned_to_options' => $assignedToOptions,
            ],
        ];
    }

    public function getInquiries(User $user, array $data): LengthAwarePaginator
    {
        try {
            $query = $this->buildQuery($data);

            return $query->paginate($data['per_page'] ?? 15);
        } catch (\Exception $e) {
            Log::error('Get Inquiries failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Build base inquiry list query with filters (used by getInquiries and export).
     *
     * @param  array<string, mixed>  $data
     * @return Builder<Inquiry>
     */
    public function buildQuery(array $data): Builder
    {
        $query = Inquiry::query();

        if (array_key_exists('status', $data)) {
            $query->where('status', $data['status']);
        }

        if (array_key_exists('inquiry_type', $data)) {
            $query->where('category', $data['inquiry_type']);
        }

        if (! empty($data['customer_name'] ?? null)) {
            $customerName = $data['customer_name'];
            $query->whereHas('user.customer', function ($c) use ($customerName) {
                $c->where('company_name', 'like', "%{$customerName}%");
            });
        }

        if (! empty($data['inquirer_name'] ?? null)) {
            $inquirerName = $data['inquirer_name'];
            $query->whereHas('user', function ($u) use ($inquirerName) {
                $u->where('name', 'like', "%{$inquirerName}%");
            });
        }

        if (! empty($data['assigned_to'] ?? null)) {
            $query->where('replied_by', $data['assigned_to']);
        }

        if (array_key_exists('has_attachment', $data) && $data['has_attachment'] !== null && $data['has_attachment'] !== '') {
            if (filter_var($data['has_attachment'], FILTER_VALIDATE_BOOLEAN)) {
                $query->whereHas('attachments');
            } else {
                $query->whereDoesntHave('attachments');
            }
        }

        $search = $data['search_term'] ?? $data['search'] ?? null;
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($u) use ($search) {
                    $u->where('name', 'like', "%{$search}%");
                })
                    ->orWhereHas('user.customer', function ($c) use ($search) {
                        $c->where('company_name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('repliedBy', function ($r) use ($search) {
                        $r->where('name', 'like', "%{$search}%");
                    })
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if (! empty($data['created_from'] ?? null)) {
            $query->whereDate('inquiries.created_at', '>=', $data['created_from']);
        }
        if (! empty($data['created_to'] ?? null)) {
            $query->whereDate('inquiries.created_at', '<=', $data['created_to']);
        }

        $query->with([
            'user',
            'user.customer',
            'attachments',
            'repliedBy',
            'comments',
        ]);

        $sortBy = $data['sort_by'] ?? 'created_at';
        $sortOrder = $data['sort_order'] ?? 'desc';

        if ($sortBy === 'customer_name') {
            $query->join('users', 'inquiries.user_id', '=', 'users.id')
                ->leftJoin('customers', 'users.customer_id', '=', 'customers.id')
                ->select('inquiries.*')
                ->orderBy('customers.company_name', $sortOrder);
        } elseif ($sortBy === 'inquiry_type') {
            $query->orderBy('category', $sortOrder);
        } elseif (in_array($sortBy, ['created_at', 'updated_at', 'status'], true)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query;
    }

    public function answerInquiry(User $user, $id, array $data): AdminInquiryDetailResource
    {
        try {
            DB::beginTransaction();

            $inquiry = Inquiry::findOrFail($id);
            $contactPhone = array_key_exists('contact_phone', $data) ? $data['contact_phone'] : $user->phone;
            $isEdited = $inquiry->reply_content !== null;
            $inquiry->update([
                'replied_by' => $user->id,
                'reply_contact_phone' => $contactPhone,
                'reply_content' => $data['reply_content'],
                'status' => InquiryStatus::RESPONDED,
                'is_edited_reply' => $isEdited,
            ]);

            if (! empty($data['attachments'])) {
                foreach ($data['attachments'] as $attachment) {
                    InquiryAttachment::create([
                        'inquiry_id' => $inquiry->id,
                        'file_name' => $attachment['name'],
                        'file_path' => $attachment['key'],
                        'file_size' => $attachment['size'],
                        'is_reply_attachment' => true,
                    ]);
                }
            }

            DB::commit();

            $inquiry->load(['attachments']);
            $this->notificationService->notifyInquiryAnswered($inquiry);
            $this->broadcastMemberInquiryReply($inquiry, null);

            return new AdminInquiryDetailResource($inquiry);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Create inquiry answer failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Allowed status transitions per FSD: Pending → Responded.
     */
    private const STATUS_TRANSITIONS = [
        'pending' => ['responded'],
        'responded' => ['pending'], // reopen
    ];

    /**
     * Update inquiry status (Admin API).
     * Validates transition per FSD: Received → Processing → Completed.
     *
     * @param  array<string,mixed>  $data
     */
    public function updateStatus(User $adminUser, int $id, array $data): AdminInquiryDetailResource
    {
        return DB::transaction(function () use ($adminUser, $id, $data) {
            $inquiry = Inquiry::findOrFail($id);

            $oldStatus = $inquiry->status?->value ?? 'pending';
            $newStatus = $data['status'];

            $allowed = self::STATUS_TRANSITIONS[$oldStatus] ?? [];
            if (! in_array($newStatus, $allowed, true)) {
                $allowedList = implode(', ', $allowed);
                throw ValidationException::withMessages([
                    'status' => [__('Invalid status transition. Current: :current. Allowed next: :allowed.', [
                        'current' => $oldStatus,
                        'allowed' => $allowedList ?: '-',
                    ])],
                ]);
            }

            $inquiry->update([
                'status' => $newStatus,
            ]);

            // Optional note as admin comment (shows up in timeline)
            if (! empty($data['note'])) {
                InquiryComment::create([
                    'inquiry_id' => $inquiry->id,
                    'user_id' => $adminUser->id,
                    'author_name' => $adminUser->name,
                    'content' => $data['note'],
                    'is_admin' => true,
                ]);
            }

            // TODO: add activity log for audit_logs API if needed

            $inquiry->load(['user', 'user.customer', 'attachments', 'repliedBy']);

            return new AdminInquiryDetailResource($inquiry);
        });
    }

    /**
     * Assign manager for inquiry (Admin API).
     *
     * @param  array<string,mixed>  $data
     */
    public function assignManager(User $adminUser, int $id, array $data): AdminInquiryDetailResource
    {
        return DB::transaction(function () use ($adminUser, $id, $data) {
            $inquiry = Inquiry::findOrFail($id);
            $oldAssigned = $inquiry->replied_by;

            $inquiry->update([
                'replied_by' => $data['assigned_to'],
            ]);

            // Optional note as admin comment
            if (! empty($data['note'])) {
                InquiryComment::create([
                    'inquiry_id' => $inquiry->id,
                    'user_id' => $adminUser->id,
                    'author_name' => $adminUser->name,
                    'content' => $data['note'],
                    'is_admin' => true,
                ]);
            }

            // TODO: add activity log for audit_logs API if needed

            $inquiry->load(['user', 'user.customer', 'attachments', 'repliedBy']);

            return new AdminInquiryDetailResource($inquiry);
        });
    }

    /**
     * Get the answer for an inquiry.
     */
    public function getAnswer(int $id): array
    {
        $inquiry = Inquiry::query()
            ->with(['attachments', 'repliedBy'])
            ->findOrFail($id);

        $replyAttachments = $inquiry->attachments
            ? $inquiry->attachments->where('is_reply_attachment', true)->values()
            : collect();

        return [
            'answer' => $inquiry->reply_content ? [
                'inquiry_id' => $inquiry->id,
                'content' => $inquiry->reply_content,
                'contact_phone' => $inquiry->reply_contact_phone,
                'replied_by' => $inquiry->repliedBy ? [
                    'id' => $inquiry->repliedBy->id,
                    'name' => $inquiry->repliedBy->name,
                ] : null,
                'attachments' => $replyAttachments->map(fn ($a) => [
                    'key' => $a->file_path,
                    'name' => $a->file_name,
                    'url' => str_starts_with($a->file_path, 'http') ? $a->file_path : asset('storage/'.$a->file_path),
                    'size' => $a->file_size,
                ])->values(),
                'is_edited' => $inquiry->is_edited_reply,
            ] : null,
        ];
    }

    /**
     * Update (edit) inquiry answer.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateAnswer(User $user, int $id, array $data): AdminInquiryDetailResource
    {
        $inquiry = Inquiry::findOrFail($id);

        $inquiry->update([
            'replied_by' => $user->id,
            'reply_contact_phone' => $data['contact_phone'] ?? $user->phone,
            'reply_content' => $data['reply_content'],
            'is_edited_reply' => true,
        ]);

        $inquiry->load(['user', 'user.customer', 'attachments', 'repliedBy']);

        return new AdminInquiryDetailResource($inquiry);
    }

    /**
     * Delete inquiry answer (clear reply, set status back to in progress).
     */
    public function deleteAnswer(User $user, int $id): AdminInquiryDetailResource
    {
        $inquiry = Inquiry::findOrFail($id);

        $inquiry->update([
            'replied_by' => null,
            'reply_contact_phone' => null,
            'reply_content' => null,
            'is_edited_reply' => false,
            'status' => InquiryStatus::PENDING,
        ]);

        $inquiry->load(['user', 'user.customer', 'attachments', 'repliedBy']);

        return new AdminInquiryDetailResource($inquiry);
    }

    public function getInquiryForAdmin(User $user, int $id): AdminInquiryDetailResource
    {
        try {
            $inquiry = Inquiry::query()
                ->with(['user', 'user.customer', 'user.customer.code', 'attachments', 'repliedBy', 'product'])
                ->findOrFail($id);

            return new AdminInquiryDetailResource($inquiry);
        } catch (\Exception $e) {
            Log::error('Delete Color failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Get related inquiries for a given inquiry.
     *
     * @return array<string, mixed>
     */
    public function getRelatedInquiries(User $user, int $id): array
    {
        $inquiry = Inquiry::query()
            ->with(['user'])
            ->findOrFail($id);

        $related = Inquiry::query()
            ->where('id', '!=', $inquiry->id)
            ->where(function ($q) use ($inquiry) {
                $q->where('user_id', $inquiry->user_id);

                if ($inquiry->order_number) {
                    $q->orWhere('order_number', $inquiry->order_number);
                }
            })
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        $items = $related->map(function (Inquiry $item) use ($inquiry) {
            $relationType = null;
            $relationTypeLabel = null;

            if ($item->order_number && $item->order_number === $inquiry->order_number) {
                $relationType = 'same_order';
                $relationTypeLabel = '같은 주문';
            } elseif ($item->user_id === $inquiry->user_id) {
                $relationType = 'same_customer';
                $relationTypeLabel = '같은 고객';
            }

            return [
                'id' => $item->id,
                'inquiry_number' => $item->inquiry_number,
                'title' => $item->title,
                'status' => $item->status?->value,
                'status_label' => $item->status?->label(),
                'created_at' => $item->created_at,
                'relation_type' => $relationType,
                'relation_type_label' => $relationTypeLabel,
            ];
        })->values();

        return [
            'related_inquiries' => $items,
        ];
    }

    /**
     * Get timeline events for an inquiry (read-only, derived from current data).
     *
     * @return array<string, mixed>
     */
    public function getTimeline(User $user, int $id): array
    {
        $inquiry = Inquiry::query()
            ->with(['user', 'repliedBy', 'comments.user'])
            ->findOrFail($id);

        $events = [];
        $eventId = 1;

        // Created event
        $events[] = [
            'id' => $eventId++,
            'inquiry_id' => $inquiry->id,
            'event_type' => 'created',
            'event_type_label' => '문의 등록',
            'title' => 'Inquiry created',
            'description' => $inquiry->title,
            'created_by' => [
                'id' => $inquiry->user->id ?? null,
                'name' => $inquiry->user->name ?? null,
            ],
            'created_at' => $inquiry->created_at,
            'metadata' => null,
        ];

        // Answered event (if any)
        if ($inquiry->reply_content && $inquiry->repliedBy) {
            $events[] = [
                'id' => $eventId++,
                'inquiry_id' => $inquiry->id,
                'event_type' => 'answered',
                'event_type_label' => '답변 등록',
                'title' => 'Inquiry answered',
                'description' => $inquiry->reply_content,
                'created_by' => [
                    'id' => $inquiry->repliedBy->id,
                    'name' => $inquiry->repliedBy->name,
                ],
                'created_at' => $inquiry->updated_at,
                'metadata' => null,
            ];
        }

        // Comment events
        foreach ($inquiry->comments as $comment) {
            $events[] = [
                'id' => $eventId++,
                'inquiry_id' => $inquiry->id,
                'event_type' => $comment->is_admin ? 'admin_comment' : 'comment',
                'event_type_label' => $comment->is_admin ? '관리자 댓글' : '댓글',
                'title' => 'Comment added',
                'description' => $comment->content,
                'created_by' => [
                    'id' => $comment->user->id ?? null,
                    'name' => $comment->user->name ?? $comment->author_name,
                ],
                'created_at' => $comment->created_at,
                'metadata' => null,
            ];
        }

        // Sort by created_at asc for timeline
        usort($events, function ($a, $b) {
            return strtotime((string) $a['created_at']) <=> strtotime((string) $b['created_at']);
        });

        return [
            'timeline' => $events,
        ];
    }

    /**
     * Get replies view for an inquiry.
     * Uses main reply_content + reply attachments as a single reply item.
     *
     * @return array<string, mixed>
     */
    public function getReplies(User $user, int $id): array
    {
        $inquiry = Inquiry::query()
            ->with(['comments.user', 'attachments'])
            ->findOrFail($id);

        $allReplyAttachments = $inquiry->attachments
            ? $inquiry->attachments->where('is_reply_attachment', true)
            : collect();

        // Primary source: admin comments as individual replies
        $adminComments = $inquiry->comments
            ? $inquiry->comments->where('is_admin', true)->values()
            : collect();

        $replies = $adminComments->map(function (InquiryComment $comment) use ($inquiry, $allReplyAttachments) {
            $commentAttachments = $allReplyAttachments->where('comment_id', $comment->id)->values();

            return [
                'id' => $comment->id,
                'inquiry_id' => $inquiry->id,
                'content' => $comment->content,
                'created_by' => [
                    'id' => $comment->user->id ?? null,
                    'name' => $comment->user->name ?? $comment->author_name,
                ],
                'notification_channel' => null,
                'notification_sent' => null,
                'notification_sent_at' => null,
                'notification_status' => null,
                'attachments' => $commentAttachments->map(fn ($a) => [
                    'key' => $a->file_path,
                    'name' => $a->file_name,
                    'url' => str_starts_with($a->file_path, 'http') ? $a->file_path : asset('storage/'.$a->file_path),
                    'size' => $a->file_size,
                ])->values(),
                'created_at' => $comment->created_at,
                'updated_at' => $comment->updated_at,
            ];
        })->all();

        // Backward compatibility: if no admin comments yet, fall back to single reply_content
        if ($replies === [] && $inquiry->reply_content && $inquiry->repliedBy) {
            $replies[] = [
                'id' => $inquiry->id,
                'inquiry_id' => $inquiry->id,
                'content' => $inquiry->reply_content,
                'created_by' => [
                    'id' => $inquiry->repliedBy->id,
                    'name' => $inquiry->repliedBy->name,
                ],
                'notification_channel' => null,
                'notification_sent' => null,
                'notification_sent_at' => null,
                'notification_status' => null,
                'attachments' => [],
                'created_at' => $inquiry->updated_at,
                'updated_at' => $inquiry->updated_at,
            ];
        }

        return [
            'replies' => $replies,
        ];
    }

    /**
     * Create a new admin reply (comment) for an inquiry.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function createReply(User $user, int $id, array $data): array
    {
        return DB::transaction(function () use ($user, $id, $data) {
            $inquiry = Inquiry::findOrFail($id)->load('user');

            $comment = InquiryComment::create([
                'inquiry_id' => $inquiry->id,
                'user_id' => $user->id,
                'author_name' => $user->name,
                'content' => $data['reply_content'],
                'is_admin' => true,
            ]);

            // Keep existing single-answer fields in sync for backward compatibility
            $contactPhone = array_key_exists('contact_phone', $data) ? $data['contact_phone'] : $user->phone;
            $oldReplyContent = $inquiry->reply_content;
            $isEdited = $oldReplyContent !== null;
            $inquiry->disableLogging();
            $inquiry->update([
                'replied_by' => $user->id,
                'reply_contact_phone' => $contactPhone,
                'reply_content' => $data['reply_content'],
                'status' => InquiryStatus::RESPONDED,
                'is_edited_reply' => $isEdited,
            ]);
            $inquiry->enableLogging();

            activity('inquiry')
                ->performedOn($inquiry)
                ->causedBy($user)
                ->event('updated')
                ->withProperties([
                    'old' => ['reply_content' => $oldReplyContent],
                    'attributes' => ['reply_content' => $data['reply_content']],
                ])
                ->log('Inquiry has been updated');

            if (! empty($data['attachments'])) {
                InquiryAttachment::insert(array_map(fn ($a) => [
                    'inquiry_id' => $inquiry->id,
                    'comment_id' => $comment->id,
                    'file_name' => $a['name'],
                    'file_path' => $a['key'],
                    'file_size' => $a['size'],
                    'is_reply_attachment' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ], $data['attachments']));
            }

            if ($comment && $inquiry && ! empty($data['channels'])) {
                $this->notificationService->notifyInquiryAnswered($inquiry, $comment, $data['channels']);
            }

            $this->broadcastMemberInquiryReply($inquiry, $comment->id);

            $comment->load('user');
            $commentAttachments = InquiryAttachment::where('comment_id', $comment->id)->get();

            return [
                'reply' => [
                    'id' => $comment->id,
                    'inquiry_id' => $inquiry->id,
                    'content' => $comment->content,
                    'created_by' => [
                        'id' => $comment->user->id ?? null,
                        'name' => $comment->user->name ?? $comment->author_name,
                    ],
                    'notification_channel' => null,
                    'notification_sent' => null,
                    'notification_sent_at' => null,
                    'notification_status' => null,
                    'attachments' => $commentAttachments->map(fn ($a) => [
                        'key' => $a->file_path,
                        'name' => $a->file_name,
                        'url' => str_starts_with($a->file_path, 'http') ? $a->file_path : asset('storage/'.$a->file_path),
                        'size' => $a->file_size,
                    ])->values(),
                    'created_at' => $comment->created_at,
                    'updated_at' => $comment->updated_at,
                ],
            ];
        });
    }

    /**
     * Update an existing admin reply (comment) for an inquiry.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function updateReply(User $user, int $id, int $replyId, array $data): array
    {
        return DB::transaction(function () use ($user, $id, $replyId, $data) {
            $inquiry = Inquiry::findOrFail($id);

            $comment = InquiryComment::query()
                ->where('inquiry_id', $inquiry->id)
                ->where('id', $replyId)
                ->where('is_admin', true)
                ->firstOrFail();

            $oldReplyContent = $comment->content;
            $comment->update([
                'content' => $data['reply_content'],
            ]);

            // Sync latest reply into inquiry main fields
            $contactPhone = array_key_exists('contact_phone', $data) ? $data['contact_phone'] : $user->phone;
            $inquiry->disableLogging();
            $inquiry->update([
                'replied_by' => $user->id,
                'reply_contact_phone' => $contactPhone,
                'reply_content' => $data['reply_content'],
                'is_edited_reply' => true,
            ]);
            $inquiry->enableLogging();

            activity('inquiry')
                ->performedOn($inquiry)
                ->causedBy($user)
                ->event('updated')
                ->withProperties([
                    'old' => ['reply_content' => $oldReplyContent],
                    'attributes' => ['reply_content' => $data['reply_content']],
                ])
                ->log('Inquiry has been updated');

            if (array_key_exists('attachments', $data)) {
                InquiryAttachment::where('comment_id', $comment->id)
                    ->where('is_reply_attachment', true)
                    ->delete();

                if (! empty($data['attachments'])) {
                    InquiryAttachment::insert(array_map(fn ($a) => [
                        'inquiry_id' => $inquiry->id,
                        'comment_id' => $comment->id,
                        'file_name' => $a['name'],
                        'file_path' => $a['key'],
                        'file_size' => $a['size'],
                        'is_reply_attachment' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ], $data['attachments']));
                }
            }

            $comment->load('user');
            $attachments = InquiryAttachment::where('comment_id', $comment->id)->get();

            if (! empty($data['channels'])) {
                $this->notificationService->notifyInquiryAnswered($inquiry, $comment, $data['channels']);
            }

            $this->broadcastMemberInquiryReply($inquiry, $comment->id);

            return [
                'reply' => [
                    'id' => $comment->id,
                    'inquiry_id' => $inquiry->id,
                    'content' => $comment->content,
                    'created_by' => [
                        'id' => $comment->user->id ?? null,
                        'name' => $comment->user->name ?? $comment->author_name,
                    ],
                    'notification_channel' => null,
                    'notification_sent' => null,
                    'notification_sent_at' => null,
                    'notification_status' => null,
                    'attachments' => $attachments->map(fn ($a) => [
                        'key' => $a->file_path,
                        'name' => $a->file_name,
                        'size' => $a->file_size,
                    ])->values(),
                    'created_at' => $comment->created_at,
                    'updated_at' => $comment->updated_at,
                ],
            ];
        });
    }

    private function broadcastMemberInquiryReply(Inquiry $inquiry, ?int $replyId): void
    {
        if ($inquiry->user_id === null) {
            return;
        }

        event(new MemberNotificationRequested(
            userId: (int) $inquiry->user_id,
            type: RealtimeNotificationType::INQUIRY_REPLY,
            payload: [
                'inquiry_id' => $inquiry->id,
                'inquiry_type' => $inquiry->category?->value,
                'reply_id' => $replyId,
            ],
        ));
    }

    /**
     * Delete an admin reply (comment) for an inquiry.
     *
     * @return array<string, mixed>
     */
    public function deleteReply(User $user, int $id, int $replyId): array
    {
        return DB::transaction(function () use ($id, $replyId) {
            $inquiry = Inquiry::findOrFail($id);

            $comment = InquiryComment::query()
                ->where('inquiry_id', $inquiry->id)
                ->where('id', $replyId)
                ->where('is_admin', true)
                ->firstOrFail();

            $comment->delete();

            // Re-sync inquiry main reply fields from latest remaining admin comment (if any)
            $latestComment = InquiryComment::query()
                ->where('inquiry_id', $inquiry->id)
                ->where('is_admin', true)
                ->latest('created_at')
                ->first();

            if ($latestComment) {
                $inquiry->update([
                    'replied_by' => $latestComment->user_id,
                    'reply_content' => $latestComment->content,
                    'is_edited_reply' => true,
                ]);
            } else {
                $inquiry->update([
                    'replied_by' => null,
                    'reply_contact_phone' => null,
                    'reply_content' => null,
                    'is_edited_reply' => false,
                    'status' => InquiryStatus::PENDING,
                ]);
            }

            return [
                'deleted' => true,
            ];
        });
    }

    /**
     * Get audit logs for an inquiry.
     *
     * @return array<string, mixed>
     */
    public function getAuditLogs(User $user, int $id): array
    {
        $logs = [];

        $activities = Activity::where('subject_type', Inquiry::class)
            ->where('subject_id', $id)
            ->orderByDesc('created_at')
            ->get();

        $userIdFields = ['replied_by'];

        foreach ($activities as $activity) {
            $properties = $activity->properties ?? collect();
            $old = (array) ($properties['old'] ?? []);
            $new = (array) ($properties['attributes'] ?? []);

            // created event — single entry, no field breakdown
            if ($activity->event === 'created') {
                $logs[] = [
                    'action' => 'created',
                    'field' => null,
                    'old_value' => null,
                    'new_value' => null,
                    'changed_by' => $activity->causer ? [
                        'id' => $activity->causer->id,
                        'name' => $activity->causer->name,
                        'email' => $activity->causer->email,
                    ] : null,
                    'changed_at' => $activity->created_at,
                    'ip_address' => $properties['ip'] ?? null,
                ];

                continue;
            }

            $changedKeys = array_unique(array_merge(array_keys($old), array_keys($new)));

            foreach ($changedKeys as $field) {
                $oldVal = $old[$field] ?? null;
                $newVal = $new[$field] ?? null;

                if ($oldVal === $newVal) {
                    continue;
                }

                if (in_array($field, $userIdFields)) {
                    $oldVal = $oldVal ? User::find($oldVal)?->name ?? $oldVal : null;
                    $newVal = $newVal ? User::find($newVal)?->name ?? $newVal : null;
                }

                $logs[] = [
                    'action' => $activity->event,
                    'field' => $field,
                    'old_value' => $oldVal,
                    'new_value' => $newVal,
                    'changed_by' => $activity->causer ? [
                        'id' => $activity->causer->id,
                        'name' => $activity->causer->name,
                        'email' => $activity->causer->email,
                    ] : null,
                    'changed_at' => $activity->created_at,
                    'ip_address' => $properties['ip'] ?? null,
                ];
            }
        }

        return [
            'audit_logs' => $logs,
        ];
    }

    /**
     * Get internal memo for an inquiry.
     *
     * @return array<string, mixed>
     */
    public function getInternalMemo(User $user, int $id): array
    {
        $inquiry = Inquiry::query()->findOrFail($id);

        $memos = InquiryInternalMemo::query()
            ->where('inquiry_id', $inquiry->id)
            ->with('user:id,name,email')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (InquiryInternalMemo $memo) {
                return [
                    'id' => $memo->id,
                    'content' => $memo->content,
                    'created_by' => $memo->user ? [
                        'id' => $memo->user->id,
                        'name' => $memo->user->name,
                        'email' => $memo->user->email,
                    ] : null,
                    'created_at' => $memo->created_at,
                ];
            })
            ->values()
            ->all();

        return [
            'memos' => $memos,
        ];
    }

    /**
     * Create internal memo for an inquiry.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function createInternalMemo(User $user, int $id, array $data): array
    {
        $inquiry = Inquiry::query()->findOrFail($id);

        $memo = InquiryInternalMemo::create([
            'inquiry_id' => $inquiry->id,
            'user_id' => $user->id,
            'content' => $data['content'],
        ]);

        $memo->load('user:id,name,email');

        return [
            'memo' => [
                'id' => $memo->id,
                'content' => $memo->content,
                'created_by' => [
                    'id' => $memo->user->id,
                    'name' => $memo->user->name,
                    'email' => $memo->user->email,
                ],
                'created_at' => $memo->created_at,
            ],
        ];
    }
}
