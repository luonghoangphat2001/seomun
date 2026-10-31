<?php

namespace App\Http\Controllers\Api;

use App\Models\Product;
use App\Http\Requests\DielineDownloadRequest;
use App\Http\Requests\DielinePreviewRequest;
use App\Http\Resources\DielineDownloadResource;
use App\Http\Resources\DielinePreviewResource;
use App\Http\Resources\Admin\AdminFileResource;
use App\Services\DielineService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class DielineController extends BaseController
{
    public function __construct(
        protected DielineService $dielineService,
    ) {}

    /**
     * Preview dieline dimensions for a given trim size (no file generation).
     * POST /products/{slug}/dieline/preview
     */
    public function preview(DielinePreviewRequest $request, string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)->with('specification')->firstOrFail();
        $spec = $product->specification;

        if (! $spec || ! $spec->dieline_enabled) {
            return $this->responseError(404, '해당 상품은 칼선(Dieline) 다운로드를 지원하지 않습니다.');
        }

        $validated = $request->validated();

        $parameters = $this->dielineService->resolveRequestParameters($spec, $validated);

        $dims = $this->dielineService->calculateDimensions(
            (float) $validated['trim_width_mm'],
            (float) $validated['trim_height_mm'],
            $parameters['margin_mm'],
            $parameters['safe_margin_mm'],
            $parameters['type'],
            $parameters['booklet_part'],
            $parameters['spine_thickness_mm']
        );

        $bookletDimensions = null;
        if ($parameters['type'] === 'booklet') {
            $cover = $this->dielineService->calculateDimensions(
                (float) $validated['trim_width_mm'],
                (float) $validated['trim_height_mm'],
                $parameters['margin_mm'],
                $parameters['safe_margin_mm'],
                'booklet',
                'cover',
                $parameters['spine_thickness_mm']
            );
            $inner = $this->dielineService->calculateDimensions(
                (float) $validated['trim_width_mm'],
                (float) $validated['trim_height_mm'],
                $parameters['margin_mm'],
                $parameters['safe_margin_mm'],
                'booklet',
                'inner',
                $parameters['spine_thickness_mm']
            );
            $bookletDimensions = [
                'cover' => [
                    'spine_thickness_mm' => $cover['spine_thickness_mm'],
                    'flat_width_mm' => $cover['working_width_mm'],
                    'flat_height_mm' => $cover['working_height_mm'],
                ],
                'inner' => [
                    'working_width_mm' => $inner['working_width_mm'],
                    'working_height_mm' => $inner['working_height_mm'],
                ],
            ];
        }

        return $this->responseSuccess(200, '칼선 규격이 계산되었습니다.', (new DielinePreviewResource([
            'product_slug' => $product->slug,
            'type' => $parameters['type'],
            'bleed_mm' => $parameters['margin_mm'],
            'safe_margin_mm' => $parameters['safe_margin_mm'],
            'dimensions' => [
                'trim_size' => [
                    'width_mm' => $validated['trim_width_mm'],
                    'height_mm' => $validated['trim_height_mm'],
                    'label' => '재단사이즈',
                ],
                'working_size' => [
                    'width_mm' => $dims['working_width_mm'],
                    'height_mm' => $dims['working_height_mm'],
                    'label' => '작업사이즈 (Bleed 포함)',
                ],
                'safe_zone' => [
                    'width_mm' => $dims['safe_width_mm'],
                    'height_mm' => $dims['safe_height_mm'],
                    'label' => '작업안전선',
                ],
            ],
            'booklet_dimensions' => $bookletDimensions,
            // Backward-compatible flat payload for existing clients.
            'dieline' => $dims,
        ]))->resolve());
    }

    /**
     * Download custom dieline file (.ai or .pdf) for a product with user-supplied trim size.
     * POST /products/{slug}/dieline/download
     */
    public function download(DielineDownloadRequest $request, string $slug): Response|JsonResponse
    {
        $product = Product::where('slug', $slug)->with('specification')->firstOrFail();
        $spec = $product->specification;

        if (! $spec || ! $spec->dieline_enabled) {
            return $this->responseError(404, '해당 상품은 칼선(Dieline) 다운로드를 지원하지 않습니다.');
        }

        $validated = $request->validated();

        $trimWidth = (float) $validated['trim_width_mm'];
        $trimHeight = (float) $validated['trim_height_mm'];
        $parameters = $this->dielineService->resolveRequestParameters($spec, $validated);
        $format = 'ai';

        $result = $this->dielineService->generateAndStore(
            $trimWidth,
            $trimHeight,
            $parameters['margin_mm'],
            $product->slug,
            $parameters['safe_margin_mm'],
            $parameters['type'],
            $parameters['booklet_part'],
            $parameters['spine_thickness_mm'],
            $format
        );

        if (($validated['delivery'] ?? 'download') === 'download') {
            return response($result['content'], 200, [
                'Content-Type' => $result['mime_type'],
                'Content-Disposition' => 'attachment; filename="'.$result['filename'].'"',
                'Content-Length' => (string) $result['file_size_bytes'],
            ]);
        }

        return $this->responseSuccess(200, '칼선 파일이 성공적으로 생성되었습니다.', (new DielineDownloadResource([
            'download_url' => $result['url'],
            'url' => $result['url'],
            'filename' => $result['filename'],
            'format' => $result['format'],
            'expires_in_hours' => $result['expires_in_hours'],
            'file_size_bytes' => $result['file_size_bytes'],
            'mime_type' => $result['mime_type'],
            'dimensions' => $result['dimensions'],
        ]))->resolve());
    }

    /**
     * Get list of standard size dielines available for this product (Storefront Product Page).
     * GET /products/{slug}/standard-dielines
     */
    public function standardDielines(string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        $file = $product->dielineFile;
        $items = $file ? [[
            'id' => $file->id,
            'title' => $file->name,
            'file_name' => $file->name,
            'file_type' => pathinfo($file->name, PATHINFO_EXTENSION),
            'file_size_formatted' => $this->formatFileSize((int) $file->size),
            'download_url' => $file->url,
            'file' => (new AdminFileResource($file))->resolve(),
        ]] : [];

        return $this->responseSuccess(200, '표준 칼선 목록이 성공적으로 조회되었습니다.', [
            'product_name' => $product->name,
            'dielines' => $items,
        ]);
    }

    protected function formatFileSize(int $bytes): string
    {
        if ($bytes <= 0) {
            return '0 B';
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $unit = min((int) floor(log($bytes, 1024)), count($units) - 1);

        return round($bytes / (1024 ** $unit), 1).' '.$units[$unit];
    }

}
