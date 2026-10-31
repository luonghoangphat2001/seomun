<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\Admin\AdminOrderItemResource;
use App\Models\Order;
use App\Models\OrderArtwork;
use App\Models\OrderItem;
use App\Models\User;
use App\Services\Notifications\OrderNotificationService;
use App\Services\SmsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class AdminOrderDesignController extends BaseController
{
    public function __construct(
        protected OrderNotificationService $orderNotificationService,
    ) {}

    /**
     * Get design file info for an order (cyan file management).
     */
    public function show(string $orderNumber): JsonResponse
    {
        try {
            $order = Order::where('order_number', $orderNumber)
                ->firstOrFail();

            return $this->responseSuccess(200, '디자인 파일 정보가 성공적으로 조회되었습니다.', [
                'order_number' => $order->order_number,
                'status' => $order->status,
                'items' => $order->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'metadata' => $item->metadata,
                    ];
                }),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Admin uploads a revised design file for an order artwork.
     * On upload: order status → design_confirmation_requested, SMS/KakaoTalk sent to customer.
     */
    public function uploadRevisedFile(Request $request, string $orderNumber): JsonResponse
    {
        $request->validate([
            'file'       => 'required|file|mimes:pdf,ai,jpg,jpeg,png|max:51200',
            'artwork_id' => 'nullable|integer|exists:order_artworks,id',
        ]);

        try {
            $order = Order::with(['designGroup', 'user'])
                ->where('order_number', $orderNumber)
                ->firstOrFail();

            DB::transaction(function () use ($request, $order) {
                $file     = $request->file('file');
                $path     = $file->store('orders/revised-designs/' . $order->order_number, 'public');
                $fileName = $file->getClientOriginalName();

                if ($request->filled('artwork_id')) {
                    $artwork = OrderArtwork::where('id', $request->input('artwork_id'))
                        ->where('order_id', $order->id)
                        ->firstOrFail();
                    $artwork->update([
                        'revised_file_path'          => $path,
                        'revised_file_name'          => $fileName,
                        'rejection_reason'            => null,
                        'rejected_at'                => null,
                        'confirmed_at'               => null,
                        'confirmation_requested_at'  => now(),
                    ]);
                } else {
                    $order->artworks()->update([
                        'revised_file_path'         => $path,
                        'revised_file_name'         => $fileName,
                        'rejection_reason'           => null,
                        'rejected_at'               => null,
                        'confirmed_at'              => null,
                        'confirmation_requested_at' => now(),
                    ]);
                }

                $order->update(['status' => OrderStatus::DesignConfirmationRequested->value]);
            });

            $this->orderNotificationService->sendDesignConfirmationNotification($order);

            $order->refresh()->load('artworks');

            return $this->responseSuccess(200, '디자인 교정 파일 업로드 완료. 고객에게 확인 요청 알림을 발송했습니다.', [
                'order_number' => $order->order_number,
                'status'       => $order->status,
                'artworks'     => $order->artworks->map(fn(OrderArtwork $a) => $this->formatArtwork($a)),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function resubmitProofFile(Request $request, string $orderNumber): JsonResponse
    {
        try {
            $validated = $request->validate([
                'file_url' => 'required|string',
                'file_name' => 'required|string',
                'note' => 'nullable|string',
                'order_item_id' => 'required|integer|exists:order_items,id',
            ]);
            $order = Order::where('order_number', $orderNumber)
                ->firstOrFail();

            $status = OrderStatus::tryFrom($order->status);

            if (! in_array($order->status, OrderStatus::getStatusEditFileUpload(), true)) {
                throw new \RuntimeException(
                    sprintf(
                        '현재 주문 상태(%s)에서는 파일 업로드가 허용되지 않습니다.',
                        $status?->label() ?? $order->status
                    ),
                    400
                );
            }

            $this->assertProofNotYetConfirmed($order, $validated['order_item_id']);

            $orderItem = OrderItem::findOrFail($validated['order_item_id']);

            if ($orderItem->order_id !== $order->id) {
                throw new \RuntimeException('주문 항목이 해당 주문에 속하지 않습니다.', 400);
            }

            $itemMetadata = is_array($orderItem->metadata) ? $orderItem->metadata : [];
            $resubmissions = is_array($itemMetadata['file_resubmissions'] ?? null) ? $itemMetadata['file_resubmissions'] : [];

            $row = [
                'submitted_at' => now()->toIso8601String(),
                'file_url'     => $validated['file_url'],
                'file_name'    => $validated['file_name'],
                'note'         => $validated['note'],
            ];

            $resubmissions[] = $row;
            $itemMetadata['file_resubmissions'] = $resubmissions;
            $itemMetadata['proof_status'] = 'file_resubmitted';
            $itemMetadata['proof_confirmed_at'] = null;

            $orderItem->update(['metadata' => $itemMetadata]);

            return $this->responseSuccess(200, '파일 재접수가 완료되었습니다.', [
                'order_number'     => $order->order_number,
                'order_item_id'    => $orderItem->id,
                'metadata'         => $orderItem->metadata,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    private function assertProofNotYetConfirmed(Order $order, int $orderItemId): void
    {
        $orderItem = OrderItem::findOrFail($orderItemId);

        if ($orderItem->order_id !== $order->id) {
            throw new \RuntimeException('주문 항목이 해당 주문에 속하지 않습니다.', 400);
        }

        $itemMetadata = is_array($orderItem->metadata) ? $orderItem->metadata : [];
        if (! empty($itemMetadata['proof_confirmed_at'])) {
            throw new \RuntimeException('이미 교정 확인이 완료된 주문 항목이 있어 수정/재접수를 할 수 없습니다.', 400);
        }
    }

    /**
     * Get rejection reason recorded by customer (admin reads it here).
     */
    public function getRejectionReason(string $orderNumber): JsonResponse
    {
        try {
            $order = Order::with('artworks')
                ->where('order_number', $orderNumber)
                ->firstOrFail();

            $rejected = $order->artworks
                ->whereNotNull('rejection_reason')
                ->values()
                ->map(fn(OrderArtwork $a) => [
                    'artwork_id'       => $a->id,
                    'side'             => $a->side,
                    'rejection_reason' => $a->rejection_reason,
                    'rejected_at'      => $a->rejected_at?->format('Y-m-d H:i:s'),
                ]);

            return $this->responseSuccess(200, '디자인 반려 사유 조회 성공', [
                'order_number'     => $order->order_number,
                'status'           => $order->status,
                'rejected_artworks' => $rejected,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    private function formatArtwork(OrderArtwork $artwork): array
    {
        return [
            'id'                        => $artwork->id,
            'side'                      => $artwork->side,
            'design_title'              => $artwork->design_title,
            'revised_file_name'         => $artwork->revised_file_name,
            'revised_file_url'          => $artwork->revised_file_path
                ? Storage::disk('public')->url($artwork->revised_file_path)
                : null,
            'rejection_reason'          => $artwork->rejection_reason,
            'confirmation_requested_at' => $artwork->confirmation_requested_at?->format('Y-m-d H:i:s'),
            'confirmed_at'              => $artwork->confirmed_at?->format('Y-m-d H:i:s'),
            'rejected_at'               => $artwork->rejected_at?->format('Y-m-d H:i:s'),
        ];
    }
}
