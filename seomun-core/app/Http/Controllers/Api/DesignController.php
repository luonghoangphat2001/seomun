<?php

namespace App\Http\Controllers\Api;

use App\Enums\DesignModeCode;
use App\Http\Requests\Design\SaveLayoutRequest;
use App\Http\Requests\Design\StoreDesignRequest;
use App\Http\Requests\Design\StoreOrderArtworkRequest;
use App\Http\Requests\Design\StoreUploadFileDesignRequest;
use App\Http\Requests\Design\UpdateArtworkRequest;
use App\Http\Requests\Design\UpdateDesignRequest;
use App\Http\Requests\Design\UploadLogoRequest;
use App\Models\DesignGroup;
use App\Models\OrderArtwork;
use App\Models\UploadArtwork;
use App\Services\DesignService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DesignController extends BaseController
{
    public function __construct(
        protected DesignService $designService
    ) {}

    protected function findArtworkForViewer(Request $request, int $id): OrderArtwork
    {
        $user = $request->user();
        $query = OrderArtwork::where('id', $id);

        if (! $user->isAdmin()) {
            $query->whereHas('designGroup', fn($q) => $q->where('user_id', $user->id));
        }

        return $query->firstOrFail();
    }

    protected function findDesignGroupForViewer(Request $request, int $id): DesignGroup
    {
        $user = $request->user();
        $query = DesignGroup::where('id', $id)->with('product');

        if (! $user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        return $query->firstOrFail();
    }

    public function store(StoreDesignRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $designGroup = $this->designService->createDesign($request->user(), $data);

            return response()->json([
                'success' => true,
                'message' => '디자인이 성공적으로 생성되었습니다.',
                'data' => [
                    'design_group' => $this->formatDesignGroupResponse($designGroup),
                ],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function storeUploadFile(StoreUploadFileDesignRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $artworksData = $data['artwork'] ?? [];

            // Create a new design group for upload files
            $designGroup = $this->designService->createDesignGroup($request->user(), [
                'source_type' => DesignModeCode::UPLOAD_FILE->value,
                'title' => $data['title'] ?? null,
                'product_id' => $data['product_id'] ?? null,
                'size_option_id' => null
            ]);

            // Create artworks for the design group with user for file service
            $artworks = $this->designService->createUploadArtworks($designGroup->id, $artworksData);

            return response()->json([
                'success' => true,
                'message' => '디자인이 성공적으로 생성되었습니다.',
                'data' => [
                    'design_group' => $this->formatDesignGroupResponse($designGroup),
                ],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function storeOrderArtwork(StoreOrderArtworkRequest $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();

            $designGroup = DesignGroup::where('id', $id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            $data = $request->validated();
            $artwork = $this->designService->createSideArtwork($id, $data);

            return response()->json([
                'success' => true,
                'message' => '주문 아트워크가 성공적으로 생성되었습니다.',
                'data' => [
                    'artwork' => $this->formatArtworkResponse($artwork),
                ],
            ], 201);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '디자인 그룹을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $group = $this->findDesignGroupForViewer($request, $id);
            $includeLayout = $request->boolean('include_layout', false);

            return response()->json([
                'success' => true,
                'data' => $this->formatDesignGroupResponse($group, $includeLayout),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '디자인을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function update(UpdateDesignRequest $request, int $id): JsonResponse
    {
        try {
            $group = $this->findDesignGroupForViewer($request, $id);

            $data = $request->only([
                'title',
                'metadata',
                'preview_image_path',
                'size_option_id',
                'width_mm',
                'height_mm'
            ]);

            $sizeOptionId = $data['size_option_id'] ?? null;
            $widthMm = $data['width_mm'] ?? null;
            $heightMm = $data['height_mm'] ?? null;

            if ($sizeOptionId && ($widthMm === null || $heightMm === null)) {
                $sizeOption = \App\Models\SizeOption::find($sizeOptionId);
                if ($sizeOption) {
                    $widthMm ??= $sizeOption->cutting_width;
                    $heightMm ??= $sizeOption->cutting_height;
                }
            }

            if ($widthMm !== null) {
                $data['width_mm'] = $widthMm;
            }
            if ($heightMm !== null) {
                $data['height_mm'] = $heightMm;
            }

            $group->update($data);

            $this->designService->updateDesign($group, $request->all());

            return response()->json([
                'success' => true,
                'message' => '디자인이 성공적으로 수정되었습니다.',
                'data' => [
                    'design_group' => $this->formatDesignGroupResponse($group->fresh()),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '디자인을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function updateOrderArtwork(UpdateArtworkRequest $request, int $orderArtworkId): JsonResponse
    {
        try {
            $artwork = OrderArtwork::whereHas('designGroup', fn($q) => $q->where('user_id', $request->user()->id))
                ->where('id', $orderArtworkId)
                ->firstOrFail();

            $artwork = $this->designService->updateArtwork($artwork, $request->validated());

            return response()->json([
                'success' => true,
                'message' => '아트워크가 성공적으로 수정되었습니다.',
                'data' => [
                    'artwork' => $this->formatArtworkResponse($artwork),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '아트워크를 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function uploadLogo(UploadLogoRequest $request, int $orderArtworkId): JsonResponse
    {
        try {
            $artwork = OrderArtwork::whereHas('designGroup', fn($q) => $q->where('user_id', $request->user()->id))
                ->where('id', $orderArtworkId)
                ->firstOrFail();

            $logoPath = $this->designService->uploadLogo($artwork, $request->file('logo'));
            $artwork = $artwork->fresh();

            return response()->json([
                'success' => true,
                'message' => '로고가 성공적으로 업로드되었습니다.',
                'data' => [
                    'logo_path' => $logoPath,
                    'logo_url' => $this->designService->getLogoUrl($artwork) ?? null,
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '디자인을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function uploadPreviewImage(Request $request, int $orderArtworkId): JsonResponse
    {
        try {
            $artwork = OrderArtwork::whereHas('designGroup', fn($q) => $q->where('user_id', $request->user()->id))
                ->where('id', $orderArtworkId)
                ->firstOrFail();

            $request->validate([
                'preview_front' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
                'preview_back' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            ]);

            if (! $request->hasFile('preview_front') && ! $request->hasFile('preview_back')) {
                return response()->json([
                    'success' => false,
                    'message' => 'preview_front 또는 preview_back 중 하나 이상은 필수입니다.',
                ], 422);
            }

            if ($request->hasFile('preview_front')) {
                $artworkFront = $this->designService->getArtworkForSide($artwork, 'front');
                if (! $artworkFront) {
                    return response()->json([
                        'success' => false,
                        'message' => '앞면 디자인을 찾을 수 없습니다.',
                    ], 404);
                }
                $this->designService->uploadPreview($artworkFront, $request->file('preview_front'));
            }

            if ($request->hasFile('preview_back')) {
                $artworkBack = $this->designService->getArtworkForSide($artwork, 'back');
                if (! $artworkBack) {
                    return response()->json([
                        'success' => false,
                        'message' => '뒷면 디자인을 찾을 수 없습니다.',
                    ], 404);
                }
                $this->designService->uploadPreview($artworkBack, $request->file('preview_back'));
            }

            $artwork = $artwork->fresh();

            return response()->json([
                'success' => true,
                'message' => '미리보기 이미지가 성공적으로 업로드되었습니다.',
                'data' => [
                    'front' => [
                        'preview_path' => $this->designService->getPreviewPathForSide($artwork, 'front'),
                        'preview_url' => $this->designService->getPreviewUrlForSide($artwork, 'front'),
                    ],
                    'back' => [
                        'preview_path' => $this->designService->getPreviewPathForSide($artwork, 'back'),
                        'preview_url' => $this->designService->getPreviewUrlForSide($artwork, 'back'),
                    ],
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '디자인을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function getPreviewImage(Request $request, int $orderArtworkId): JsonResponse
    {
        try {
            $artwork = $this->findArtworkForViewer($request, $orderArtworkId);

            return response()->json([
                'success' => true,
                'data' => [
                    'front' => [
                        'preview_path' => $this->designService->getPreviewPathForSide($artwork, 'front'),
                        'preview_url' => $this->designService->getPreviewUrlForSide($artwork, 'front'),
                    ],
                    'back' => [
                        'preview_path' => $this->designService->getPreviewPathForSide($artwork, 'back'),
                        'preview_url' => $this->designService->getPreviewUrlForSide($artwork, 'back'),
                    ],
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '디자인을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function saveLayout(SaveLayoutRequest $request, int $orderArtworkId): JsonResponse
    {
        try {
            $artwork = OrderArtwork::whereHas('designGroup', fn($q) => $q->where('user_id', $request->user()->id))
                ->where('id', $orderArtworkId)
                ->firstOrFail();

            $validated = $request->validated();
            $format = $validated['format'] ?? 'json';

            if ($format === 'svg' && isset($validated['svg_content'])) {
                $s3Path = $this->designService->saveSvgData($artwork, $validated['svg_content']);
            } else {
                $s3Path = $this->designService->saveLayoutData($artwork, $validated['layout_data']);
            }

            return response()->json([
                'success' => true,
                'message' => '레이아웃이 성공적으로 저장되었습니다.',
                'data' => [
                    'layout_s3_path' => $s3Path,
                    'layout_url' => $this->designService->getLayoutDataUrl($artwork->fresh()) ?? null,
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '디자인을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function generatePreview(Request $request, int $orderArtworkId): JsonResponse
    {
        try {
            $artwork = OrderArtwork::whereHas('designGroup', fn($q) => $q->where('user_id', $request->user()->id))
                ->where('id', $orderArtworkId)
                ->firstOrFail();

            $format = $request->input('format', 'png');
            $s3Path = $this->designService->generatePreview($artwork, $format);

            return response()->json([
                'success' => true,
                'message' => '미리보기가 성공적으로 생성되었습니다.',
                'data' => [
                    'preview_path' => $s3Path,
                    'preview_url' => $this->designService->getPreviewUrl($artwork->fresh()) ?? null,
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '디자인을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $group = DesignGroup::where('user_id', $request->user()->id)
                ->where('id', $id)
                ->firstOrFail();

            foreach ($group->orderArtworks as $artwork) {
                $this->designService->deleteDesign($artwork);
            }

            $group->delete();

            return response()->json([
                'success' => true,
                'message' => '디자인이 성공적으로 삭제되었습니다.',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '디자인을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function destroyOrderArtwork(Request $request, int $orderArtworkId): JsonResponse
    {
        try {
            $artwork = OrderArtwork::whereHas('designGroup', fn($q) => $q->where('user_id', $request->user()->id))
                ->where('id', $orderArtworkId)
                ->firstOrFail();

            $this->designService->deleteDesign($artwork);

            return response()->json([
                'success' => true,
                'message' => '디자인이 성공적으로 삭제되었습니다.',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '디자인을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    protected function formatDesignGroupResponse(DesignGroup $group, bool $includeLayout = false): array
    {
        $response = [
            'id' => $group->id,
            'user_id' => $group->user_id,
            'product_id' => $group->product_id,
            'product_slug' => $group->product?->slug,
            'title' => $group->title,
            'source_type' => $group->source_type?->value,
            'order_id' => $group->order_id,
            'order_item_id' => $group->order_item_id,
            'size_option_id' => $group->size_option_id,
            'size_option_name' => $group->sizeOption?->name,
            'size_option_width' => $group->sizeOption?->cutting_width,
            'size_option_height' => $group->sizeOption?->cutting_height,
            'width_mm' => $group->width_mm,
            'height_mm' => $group->height_mm,
            'metadata' => $group->metadata,
            'file_metadata' => $group->file_metadata,
            'preview_image_path' => $group->preview_image_path,
            'preview_pdf_url' => $group->preview_pdf_url,
            'artworks' => $group->orderArtworks()
        ];

        if ($group->source_type?->value === DesignModeCode::WEB_EDITOR->value) {
            $response['artworks'] = $group->orderArtworks
                ->map(fn(OrderArtwork $a) => $this->formatArtworkResponse($a, $includeLayout))
                ->all();
        }

        if ($group->source_type?->value === DesignModeCode::UPLOAD_FILE->value) {
            $response['upload_artworks'] = $group->uploadArtworks
                ->map(fn(UploadArtwork $a) => $this->formatUploadArtworkResponse($a))
                ->all();
        }

        return $response;
    }

    protected function formatArtworkResponse(OrderArtwork $artwork, bool $includeLayout = false): array
    {
        $response = [
            'id' => $artwork->id,
            'design_group_id' => $artwork->design_group_id,
            'side' => $artwork->side,
            'logo_path' => $artwork->logo_path,
            'logo_url' => $this->designService->getLogoUrl($artwork),
            'preview_image_path' => $artwork->preview_image_path,
            'cutline_image_url' => $artwork->cutline_image_url,
        ];

        if ($includeLayout) {
            $response['layout_data'] = $this->designService->loadLayoutData($artwork);
            $response['layout_s3_path'] = $artwork->layout_s3_path;
            $response['layout_url'] = $artwork->layout_s3_path ? $this->designService->getLayoutDataUrl($artwork) : null;
        } else {
            $response['layout_data'] = $artwork->layout_data;
            $response['has_layout_s3'] = ! empty($artwork->layout_s3_path);
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
}
