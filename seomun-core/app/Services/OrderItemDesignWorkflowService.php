<?php

namespace App\Services;

use App\Enums\DesignModeCode;
use App\Enums\OrderItemDesignWorkflowStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\OrderDesignReviewBatch;
use App\Models\OrderItem;
use App\Models\OrderItemDesignVersion;
use App\Models\OrderItemDesignWorkflow;
use App\Models\User;
use App\Services\Notifications\OrderNotificationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OrderItemDesignWorkflowService
{
    public function __construct(
        private readonly OrderNotificationService $orderNotificationService,
    ) {}

    public function requiresDesignApproval(Order $order): bool
    {
        $order->loadMissing('items.designGroup');

        return $order->items->contains(function (OrderItem $item): bool {
            $mode = $item->designGroup?->source_type;

            return $mode instanceof DesignModeCode && $mode->requiresDesignApproval();
        });
    }

    /**
     * Get design-service orders assigned to one designer. By default this
     * includes every workflow state, including customer_approved, so a
     * designer retains the complete history of orders assigned to them.
     *
     * @param  array{status?: string, per_page?: int}  $filters
     */
    public function assignedOrdersForDesigner(User $designer, array $filters): LengthAwarePaginator
    {
        $scope = fn (Builder|HasMany $query) => $query
            ->where('assigned_designer_id', $designer->id)
            ->when(
                isset($filters['status']),
                fn (Builder|HasMany $query) => $query->where('status', $filters['status']),
            );

        return Order::query()
            ->whereHas('itemDesignWorkflows', $scope)
            ->with([
                'user:id,username,name,phone,mobile',
                'product:id,name,slug,sku,images',
            ])
            ->withCount(['itemDesignWorkflows as assigned_design_item_count' => $scope])
            ->orderByDesc('updated_at')
            ->paginate((int) ($filters['per_page'] ?? 20));
    }

    /**
     * Create item workflows once a paid order enters the design service.
     * Repeated payment callbacks are safe because order_item_id is unique.
     */
    public function startForPaidOrder(Order $order): void
    {
        if ($order->payment_status !== PaymentStatus::PAID->value) {
            return;
        }

        $order->loadMissing('items.designGroup');

        $now = now();
        $rows = $order->items
            ->map(function (OrderItem $item) use ($order, $now): ?array {
                $mode = $item->designGroup?->source_type;

                if (! $mode instanceof DesignModeCode || ! $mode->requiresDesignApproval()) {
                    return null;
                }

                return [
                    'order_id' => $order->id,
                    'order_item_id' => $item->id,
                    'design_mode_code' => $mode->value,
                    'status' => OrderItemDesignWorkflowStatus::PendingAssignment->value,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            })
            ->filter()
            ->values()
            ->all();

        if ($rows !== []) {
            // The unique order_item_id index makes repeated payment callbacks
            // idempotent without a select/insert round trip per item.
            DB::table('order_item_design_workflows')->insertOrIgnore($rows);
        }
    }

    /**
     * @param  array<int, int>  $orderItemIds
     * @return array<int, int> Workflow IDs keyed by no particular order.
     */
    public function assignDesigner(Order $order, array $orderItemIds, User $designer, User $assignedBy): array
    {
        return DB::transaction(function () use ($order, $orderItemIds, $designer, $assignedBy): array {
            if (! $designer->isAdmin()) {
                throw new \InvalidArgumentException('디자이너는 관리자 계정이어야 합니다.', 422);
            }

            $workflowIds = $order->itemDesignWorkflows()
                ->whereIn('order_item_id', $orderItemIds)
                ->lockForUpdate()
                ->pluck('id');

            if ($workflowIds->count() !== count($orderItemIds)) {
                throw new \InvalidArgumentException('디자인 서비스 대상이 아닌 주문 항목이 포함되어 있습니다.', 422);
            }

            OrderItemDesignWorkflow::whereIn('id', $workflowIds)->update([
                'assigned_designer_id' => $designer->id,
                'assigned_by_user_id' => $assignedBy->id,
                'status' => OrderItemDesignWorkflowStatus::Assigned->value,
                'updated_at' => now(),
            ]);

            $this->syncOrderDesignStatus($order);

            return $workflowIds->map(fn ($id) => (int) $id)->all();
        });
    }

    public function submitDraft(Order $order, int $orderItemId, UploadedFile $file, ?string $note, User $designer): OrderItemDesignVersion
    {
        return DB::transaction(function () use ($order, $orderItemId, $file, $note, $designer): OrderItemDesignVersion {
            $workflow = $this->workflowForOrderItem($order, $orderItemId, true);

            if ($workflow->assigned_designer_id !== $designer->id && ! $designer->getAuthorityEnum()?->isSuperAdmin()) {
                throw new \InvalidArgumentException('지정된 디자이너만 시안을 업로드할 수 있습니다.', 403);
            }

            if (! in_array($workflow->status, [
                OrderItemDesignWorkflowStatus::Assigned,
                OrderItemDesignWorkflowStatus::InProgress,
                OrderItemDesignWorkflowStatus::RevisionRequested,
            ], true)) {
                throw new \InvalidArgumentException('현재 디자인 상태에서는 시안을 업로드할 수 없습니다.', 422);
            }

            $nextVersion = ((int) $workflow->versions()->max('version')) + 1;
            $path = $file->store(
                'orders/design-service/'.$order->order_number.'/'.$orderItemId,
                'public'
            );

            $version = $workflow->versions()->create([
                'version' => $nextVersion,
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'designer_note' => $note,
                'submitted_by_user_id' => $designer->id,
            ]);

            // Uploading stores a draft only. The customer-review state starts
            // when the designer explicitly saves and sends a review batch.
            $workflow->update(['status' => OrderItemDesignWorkflowStatus::InProgress]);
            $this->syncOrderDesignStatus($order);

            return $version->fresh('submittedBy');
        });
    }

    /**
     * Group selected draft versions into one customer-review link and send it
     * after the transaction commits. A link is a bearer credential, so only a
     * digest is persisted in the database.
     *
     * @param  array<int, int>  $versionIds
     * @return array{batch: OrderDesignReviewBatch, review_url: string}
     */
    public function createReviewBatch(Order $order, array $versionIds, User $designer): array
    {
        return DB::transaction(function () use ($order, $versionIds, $designer): array {
            $order = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();
            $versions = OrderItemDesignVersion::query()
                ->whereIn('id', $versionIds)
                ->where('order_item_design_versions.customer_response', 'pending')
                ->whereHas('workflow', fn ($query) => $query
                    ->where('order_id', $order->id)
                    ->whereIn('status', [
                        OrderItemDesignWorkflowStatus::Assigned->value,
                        OrderItemDesignWorkflowStatus::InProgress->value,
                        OrderItemDesignWorkflowStatus::RevisionRequested->value,
                        OrderItemDesignWorkflowStatus::CustomerReview->value,
                    ])
                )
                ->with('workflow')
                ->lockForUpdate()
                ->get();

            if ($versions->count() !== count(array_unique($versionIds))) {
                throw new \InvalidArgumentException('동일 주문의 아직 응답되지 않은 시안만 고객에게 전송할 수 있습니다.', 422);
            }

            foreach ($versions as $version) {
                $workflow = $version->workflow;
                if ($workflow->assigned_designer_id !== $designer->id && ! $designer->getAuthorityEnum()?->isSuperAdmin()) {
                    throw new \InvalidArgumentException('지정된 디자이너만 시안을 고객에게 전송할 수 있습니다.', 403);
                }
            }

            OrderItemDesignWorkflow::whereIn('id', $versions->pluck('order_item_design_workflow_id')->unique())
                ->update([
                    'status' => OrderItemDesignWorkflowStatus::CustomerReview->value,
                    'updated_at' => now(),
                ]);

            $this->syncOrderDesignStatus($order);

            $rawToken = Str::random(64);
            $batch = OrderDesignReviewBatch::create([
                'order_id' => $order->id,
                'token_hash' => hash('sha256', $rawToken),
                'created_by_user_id' => $designer->id,
                'expires_at' => now()->addMinutes(config('services.design_review.expiration_minutes')),
                'sent_at' => now(),
            ]);
            $batch->versions()->attach($versions->pluck('id'));

            $reviewUrl = $this->reviewUrl($rawToken);
            DB::afterCommit(fn () => $this->orderNotificationService->sendDesignConfirmationSms($order, $reviewUrl));

            return ['batch' => $batch->fresh('versions'), 'review_url' => $reviewUrl];
        });
    }

    public function respondToDraft(
        Order $order,
        int $orderItemId,
        int $versionId,
        string $response,
        ?string $note,
        User $customer,
    ): OrderItemDesignWorkflow {
        return DB::transaction(function () use ($order, $orderItemId, $versionId, $response, $note, $customer): OrderItemDesignWorkflow {
            if ($order->user_id !== $customer->id) {
                throw new ModelNotFoundException('주문을 찾을 수 없습니다.');
            }

            $workflow = $this->workflowForOrderItem($order, $orderItemId, true);

            if ($workflow->status !== OrderItemDesignWorkflowStatus::CustomerReview) {
                throw new \InvalidArgumentException('현재 고객 확인 대기 중인 디자인이 아닙니다.', 422);
            }

            $version = $workflow->versions()
                ->whereKey($versionId)
                ->where('customer_response', 'pending')
                ->lockForUpdate()
                ->firstOrFail();

            $version->update([
                'customer_response' => $response,
                'customer_note' => $note,
                'responded_at' => now(),
            ]);

            if ($response === 'approved') {
                $workflow->update([
                    'status' => OrderItemDesignWorkflowStatus::CustomerApproved,
                    'final_file_path' => $version->file_path,
                    'final_file_name' => $version->file_name,
                    'finalized_at' => now(),
                ]);

                $this->syncOrderDesignStatus($order);
            } else {
                $workflow->update([
                    'status' => OrderItemDesignWorkflowStatus::RevisionRequested,
                    'final_file_path' => null,
                    'final_file_name' => null,
                    'finalized_at' => null,
                ]);
                $this->syncOrderDesignStatus($order);
            }

            return $workflow->fresh(['orderItem', 'assignedDesigner', 'versions']);
        });
    }

    public function publicReview(string $token): array
    {
        $batch = $this->reviewBatchFromToken($token);
        $batch->load(['order', 'versions.workflow.orderItem']);

        return $this->formatReviewBatch($batch);
    }

    public function respondFromReviewLink(
        string $token,
        int $orderItemId,
        int $versionId,
        string $response,
        ?string $note,
    ): OrderItemDesignWorkflow {
        return DB::transaction(function () use ($token, $orderItemId, $versionId, $response, $note): OrderItemDesignWorkflow {
            $batch = $this->reviewBatchFromToken($token, true);
            $version = $batch->versions()
                ->select('order_item_design_versions.*')
                ->where('order_item_design_versions.id', $versionId)
                ->where('order_item_design_versions.customer_response', 'pending')
                ->with('workflow')
                ->lockForUpdate()
                ->firstOrFail();

            $workflow = $version->workflow;
            if ($workflow->order_item_id !== $orderItemId || $workflow->status !== OrderItemDesignWorkflowStatus::CustomerReview) {
                throw new \InvalidArgumentException('이 검토 링크에서 처리할 수 없는 디자인 항목입니다.', 422);
            }

            $version->update([
                'customer_response' => $response,
                'customer_note' => $note,
                'responded_at' => now(),
            ]);

            if ($response === 'approved') {
                $workflow->update([
                    'status' => OrderItemDesignWorkflowStatus::CustomerApproved,
                    'final_file_path' => $version->file_path,
                    'final_file_name' => $version->file_name,
                    'finalized_at' => now(),
                ]);
                $this->syncOrderDesignStatus($batch->order);
            } else {
                $workflow->update([
                    'status' => OrderItemDesignWorkflowStatus::RevisionRequested,
                    'final_file_path' => null,
                    'final_file_name' => null,
                    'finalized_at' => null,
                ]);
                $this->syncOrderDesignStatus($batch->order);
            }

            return $workflow->fresh(['orderItem', 'assignedDesigner', 'versions']);
        });
    }

    /**
     * Store several customer decisions from one review screen atomically.
     * Each row is intentionally tied to a version, not merely an order item,
     * so a designer always sees the exact draft and its rejection note.
     *
     * @param  array<int, array{order_item_id:int, version_id:int, response:string, note:?string}>  $responses
     * @return array<int, array{order_item_id:int, version_id:int, status:string}>
     */
    public function respondToReviewLinkBatch(string $token, array $responses): array
    {
        return DB::transaction(function () use ($token, $responses): array {
            $batch = $this->reviewBatchFromToken($token, true);
            $versionIds = array_column($responses, 'version_id');
            $versions = $batch->versions()
                ->select('order_item_design_versions.*')
                ->whereIn('order_item_design_versions.id', $versionIds)
                ->where('order_item_design_versions.customer_response', 'pending')
                ->with('workflow')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            if ($versions->count() !== count($responses)) {
                throw new \InvalidArgumentException('이미 처리되었거나 이 검토 링크에 없는 시안이 포함되어 있습니다.', 422);
            }

            $now = now();
            $versionUpdates = [];
            $workflowUpdates = [];
            $result = [];
            foreach ($responses as $response) {
                /** @var OrderItemDesignVersion $version */
                $version = $versions->get($response['version_id']);
                $workflow = $version->workflow;

                if (
                    $workflow->order_item_id !== $response['order_item_id']
                    || $workflow->status !== OrderItemDesignWorkflowStatus::CustomerReview
                ) {
                    throw new \InvalidArgumentException('이 검토 링크에서 처리할 수 없는 디자인 항목입니다.', 422);
                }

                $versionUpdates[] = [
                    'id' => $version->id,
                    'order_item_design_workflow_id' => $version->order_item_design_workflow_id,
                    'version' => $version->version,
                    'file_path' => $version->file_path,
                    'file_name' => $version->file_name,
                    'designer_note' => $version->designer_note,
                    'submitted_by_user_id' => $version->submitted_by_user_id,
                    'created_at' => $version->created_at,
                    'customer_response' => $response['response'],
                    'customer_note' => $response['note'],
                    'responded_at' => $now,
                    'updated_at' => $now,
                ];

                if ($response['response'] === 'approved') {
                    $workflowUpdates[] = [
                        'id' => $workflow->id,
                        'order_id' => $workflow->order_id,
                        'order_item_id' => $workflow->order_item_id,
                        'design_mode_code' => $workflow->design_mode_code,
                        'assigned_designer_id' => $workflow->assigned_designer_id,
                        'assigned_by_user_id' => $workflow->assigned_by_user_id,
                        'created_at' => $workflow->created_at,
                        'status' => OrderItemDesignWorkflowStatus::CustomerApproved->value,
                        'final_file_path' => $version->file_path,
                        'final_file_name' => $version->file_name,
                        'finalized_at' => $now,
                        'updated_at' => $now,
                    ];
                } else {
                    $workflowUpdates[] = [
                        'id' => $workflow->id,
                        'order_id' => $workflow->order_id,
                        'order_item_id' => $workflow->order_item_id,
                        'design_mode_code' => $workflow->design_mode_code,
                        'assigned_designer_id' => $workflow->assigned_designer_id,
                        'assigned_by_user_id' => $workflow->assigned_by_user_id,
                        'created_at' => $workflow->created_at,
                        'status' => OrderItemDesignWorkflowStatus::RevisionRequested->value,
                        'final_file_path' => null,
                        'final_file_name' => null,
                        'finalized_at' => null,
                        'updated_at' => $now,
                    ];
                }

                $result[] = [
                    'order_item_id' => $workflow->order_item_id,
                    'version_id' => $version->id,
                    'status' => $response['response'] === 'approved'
                        ? OrderItemDesignWorkflowStatus::CustomerApproved->value
                        : OrderItemDesignWorkflowStatus::RevisionRequested->value,
                ];
            }

            OrderItemDesignVersion::upsert(
                $versionUpdates,
                ['id'],
                ['customer_response', 'customer_note', 'responded_at', 'updated_at'],
            );
            OrderItemDesignWorkflow::upsert(
                $workflowUpdates,
                ['id'],
                ['status', 'final_file_path', 'final_file_name', 'finalized_at', 'updated_at'],
            );

            $this->syncOrderDesignStatus($batch->order);

            return $result;
        });
    }

    public function approveForProduction(Order $order, User $admin): Order
    {
        return DB::transaction(function () use ($order, $admin): Order {
            $order = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();
            $workflows = $order->itemDesignWorkflows()->lockForUpdate()->get();

            if ($workflows->isEmpty() || $workflows->contains(fn (OrderItemDesignWorkflow $workflow) => $workflow->status !== OrderItemDesignWorkflowStatus::CustomerApproved)) {
                throw new \InvalidArgumentException('모든 디자인 항목이 고객 승인된 후에만 주문을 승인할 수 있습니다.', 422);
            }

            if ($order->status !== OrderStatus::DesignConfirmed->value) {
                throw new \InvalidArgumentException('디자인 관리자 승인 대기 상태의 주문만 승인할 수 있습니다.', 422);
            }

            $metadata = is_array($order->metadata) ? $order->metadata : [];
            $metadata['design_admin_approval'] = [
                'approved_by_user_id' => $admin->id,
                'approved_at' => now()->toIso8601String(),
            ];

            $order->update([
                'status' => OrderStatus::Confirmed->value,
                'metadata' => $metadata,
            ]);

            return $order->fresh(['items.designWorkflow.versions', 'itemDesignWorkflows.assignedDesigner']);
        });
    }

    public function detail(Order $order): array
    {
        $this->startForPaidOrder($order);
        // Reload instead of loadMissing: the assignment endpoint may call this
        // right after a bulk update, and a cached null relation must not leak
        // into the response.
        $order->load([
            'product:id,name,slug,sku,images',
            'items.product:id,name,slug,sku,images',
            'items.designGroup:id,order_item_id,title,width_mm,height_mm,source_type,preview_image_path,preview_pdf_url,metadata',
            'items.designWorkflow.versions.submittedBy',
            'items.designWorkflow.assignedDesigner',
        ]);

        return [
            'order_number' => $order->order_number,
            'order_status' => $order->status instanceof OrderStatus ? $order->status->value : $order->status,
            'requires_admin_approval' => $order->items->contains(
                fn (OrderItem $item) => $item->designWorkflow !== null
            ),
            'items' => $order->items
                ->filter(fn (OrderItem $item) => $item->designWorkflow !== null)
                ->map(fn (OrderItem $item) => $this->formatWorkflow($item->designWorkflow, $item))
                ->values(),
        ];
    }

    /**
     * Keep the order-level design status as an aggregate of its item workflows.
     * A rejected item has priority because it needs designer action; a pending
     * customer review is next; only full customer approval reaches the admin
     * approval queue.
     */
    private function syncOrderDesignStatus(Order $order): void
    {
        $statuses = $order->itemDesignWorkflows()
            ->pluck('status')
            ->map(fn (OrderItemDesignWorkflowStatus|string $workflowStatus) => $workflowStatus instanceof OrderItemDesignWorkflowStatus
                ? $workflowStatus->value
                : $workflowStatus);
        if ($statuses->isEmpty()) {
            return;
        }

        $status = match (true) {
            $statuses->contains(OrderItemDesignWorkflowStatus::RevisionRequested->value)
                => OrderStatus::DesignRejected,
            $statuses->contains(OrderItemDesignWorkflowStatus::CustomerReview->value)
                => OrderStatus::DesignConfirmationRequested,
            $statuses->every(fn (string $workflowStatus) => $workflowStatus === OrderItemDesignWorkflowStatus::CustomerApproved->value)
                => OrderStatus::DesignConfirmed,
            default => OrderStatus::DesignInProgress,
        };

        if ($order->status !== $status->value) {
            $order->update(['status' => $status->value]);
        }
    }

    private function workflowForOrderItem(Order $order, int $orderItemId, bool $lock = false): OrderItemDesignWorkflow
    {
        $query = $order->itemDesignWorkflows()->where('order_item_id', $orderItemId);

        if ($lock) {
            $query->lockForUpdate();
        }

        return $query->firstOrFail();
    }

    private function formatWorkflow(OrderItemDesignWorkflow $workflow, OrderItem $item): array
    {
        $sourceType = $item->designGroup?->source_type;
        $configuration = is_array($item->configuration) ? $item->configuration : [];

        return [
            'order_item_id' => $item->id,
            'item_title' => $item->title,
            'quantity' => $item->quantity,
            'multiplier' => $item->multiplier,
            'unit' => $item->unit,
            'configuration' => $configuration,
            'selected_specification' => [
                'options' => $configuration['options'] ?? [],
                'input_options' => $configuration['input_options'] ?? [],
                'quantity' => $item->quantity,
                'multiplier' => $item->multiplier,
                'unit' => $item->unit,
            ],
            'customer_note' => $item->notes,
            'product' => $item->product ? [
                'id' => $item->product->id,
                'name' => $item->product->name,
                'slug' => $item->product->slug,
                'sku' => $item->product->sku,
                'images' => $item->product->images,
            ] : null,
            'design' => $item->designGroup ? [
                'title' => $item->designGroup->title,
                'source_type' => $sourceType instanceof DesignModeCode ? $sourceType->value : $sourceType,
                'width_mm' => $item->designGroup->width_mm,
                'height_mm' => $item->designGroup->height_mm,
                'preview_image_url' => $item->designGroup->preview_image_path
                    ? Storage::disk('public')->url($item->designGroup->preview_image_path)
                    : null,
                'preview_pdf_url' => $item->designGroup->preview_pdf_url,
                'metadata' => $item->designGroup->metadata,
            ] : null,
            'design_mode_code' => $workflow->design_mode_code,
            'status' => $workflow->status->value,
            'assigned_designer' => $workflow->assignedDesigner ? [
                'id' => $workflow->assignedDesigner->id,
                'username' => $workflow->assignedDesigner->username,
                'name' => $workflow->assignedDesigner->name,
            ] : null,
            'final_file' => $workflow->final_file_path ? [
                'name' => $workflow->final_file_name,
                'url' => Storage::disk('public')->url($workflow->final_file_path),
                'finalized_at' => $workflow->finalized_at?->toIso8601String(),
            ] : null,
            'versions' => $workflow->versions->map(fn (OrderItemDesignVersion $version) => [
                'id' => $version->id,
                'version' => $version->version,
                'file_name' => $version->file_name,
                'file_url' => Storage::disk('public')->url($version->file_path),
                'designer_note' => $version->designer_note,
                'customer_response' => $version->customer_response,
                'customer_note' => $version->customer_note,
                'submitted_at' => $version->created_at?->toIso8601String(),
                'responded_at' => $version->responded_at?->toIso8601String(),
            ])->values(),
        ];
    }

    private function reviewBatchFromToken(string $token, bool $lock = false): OrderDesignReviewBatch
    {
        $query = OrderDesignReviewBatch::query()
            ->where('token_hash', hash('sha256', $token))
            ->where('expires_at', '>', now());

        if ($lock) {
            $query->lockForUpdate();
        }

        return $query->firstOrFail();
    }

    private function reviewUrl(string $token): string
    {
        return rtrim((string) config('services.design_review.user_url'), '/').'/'.$token;
    }

    private function formatReviewBatch(OrderDesignReviewBatch $batch): array
    {
        $pendingVersions = $batch->versions
            ->where('customer_response', 'pending')
            ->values();

        return [
            'order_number' => $batch->order->order_number,
            'expires_at' => $batch->expires_at->toIso8601String(),
            'total_items' => $batch->versions->count(),
            'remaining_items' => $pendingVersions->count(),
            // Only unresolved items are returned to the SMS review screen so a
            // refresh after approval naturally shows the remaining items.
            'items' => $pendingVersions->map(fn (OrderItemDesignVersion $version) => [
                'order_item_id' => $version->workflow->order_item_id,
                'item_title' => $version->workflow->orderItem->title,
                'version_id' => $version->id,
                'version' => $version->version,
                'file_name' => $version->file_name,
                'file_url' => Storage::disk('public')->url($version->file_path),
                'designer_note' => $version->designer_note,
                'customer_response' => $version->customer_response,
                'customer_note' => $version->customer_note,
            ])->values(),
        ];
    }
}
