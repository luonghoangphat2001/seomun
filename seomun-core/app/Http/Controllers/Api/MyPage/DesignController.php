<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Enums\DesignModeCode;
use App\Http\Controllers\Api\BaseController;
use App\Models\DesignGroup;
use App\Models\UploadArtwork;
use App\Services\DesignService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DesignController extends BaseController
{
    public function __construct(
        protected DesignService $designService,
        protected PaginationService $paginationService
    ) {}

    /**
     * Get designs list for current user
     * GET /api/mypage/designs
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $filters = $request->only([
                'side',
                'size_id',
                'source_type',
                'product_id',
                'sort_by',
                'sort_order',
            ]);

            $perPage = (int) $request->input('per_page', 15);

            $groups = $this->designService->getUserDesignGroupSearch($user, $filters, $perPage);

            $formattedDesigns = collect($groups->items())->map(fn(DesignGroup $group) => $this->formatDesignGroupResponse($group));

            return $this->responsePaginatedSuccess(200, '성공적으로 조회되었습니다.', [
                'designs' => $formattedDesigns,
            ], $this->paginationService->format($groups));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function getAvailableSizes(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $sizes = $this->designService->getAvailableSizes($user);

            return response()->json([
                'success' => true,
                'data' => [
                    'sizes' => $sizes,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    protected function formatDesignGroupResponse(DesignGroup $group): array
    {
        $response = [
            'id' => $group->id,
            'product_id' => $group->product_id,
            'order_id' => $group->order_id,
            'order_item_id' => $group->order_item_id,
            'product_slug' => $group->product?->slug,
            'product_name' => [
                'en' => $group->product?->name_en,
                'ko' => $group->product?->name,
            ],
            'source_type' => $group->source_type,
            'title' => $group->title,
            'metadata' => $group->metadata,
            'size_option_id' => $group->size_option_id,
            'width_mm' => $group->width_mm,
            'height_mm' => $group->height_mm,
            'preview' => [],
            'artworks' => [],
            'created_at' => $group->created_at?->toISOString(),
            'updated_at' => $group->updated_at?->toISOString(),
        ];

        foreach (['front', 'back'] as $side) {
            $artwork = $group->orderArtworks()->where('side', $side)->first();
            $response['preview'][$side] = [
                'preview_path' => $artwork?->preview_image_path,
                'preview_url' => $artwork ? $this->designService->getPreviewUrl($artwork) : null,
            ];
            $response['artworks'][$side] = $artwork ? $this->formatArtworkResponse($artwork) : null;
        }

        if ($group->source_type?->value === DesignModeCode::UPLOAD_FILE->value) {
            $firstArtwork = $group->uploadArtworks->first();

            if ($firstArtwork) {
                $response['upload_artwork'] = $this->formatUploadArtworkResponse($firstArtwork);
            }
        }

        return $response;
    }

    protected function formatUploadArtworkResponse(UploadArtwork $artwork): array
    {
        return [
            'id' => $artwork->id,
            'design_group_id' => $artwork->design_group_id,
            'url' => $artwork->url,
            'name' => $artwork->name,
            'size' => $artwork->size,
            'mime' => $artwork->mime,
            'metadata' => $artwork->metadata,
            'print_as_is' => $artwork->print_as_is,
            'print_without_proof' => $artwork->print_without_proof,
            'created_at' => $artwork->created_at?->toISOString(),
            'updated_at' => $artwork->updated_at?->toISOString(),
        ];
    }

    protected function formatArtworkResponse(\App\Models\OrderArtwork $artwork): array
    {
        return [
            'id' => $artwork->id,
            'design_group_id' => $artwork->design_group_id,
            'side' => $artwork->side,
            'logo_path' => $artwork->logo_path,
            'logo_url' => $this->designService->getLogoUrl($artwork),
            'preview_image_path' => $artwork->preview_image_path,
            'preview_url' => $this->designService->getPreviewUrl($artwork),
            'layout_data' => $artwork->layout_data,
            'layout_s3_path' => $artwork->layout_s3_path,
            'created_at' => $artwork->created_at?->toISOString(),
            'updated_at' => $artwork->updated_at?->toISOString(),
        ];
    }
}
