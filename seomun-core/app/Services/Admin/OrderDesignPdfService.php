<?php

namespace App\Services\Admin;

use App\Models\Order;
use App\Models\OrderArtwork;
use App\Models\OrderItem;
use App\Services\DesignService;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Collection;

/**
 * Builds print-ready designs and preview PDFs for orders.
 * Supports exact 1:1 working size PDF export without A4 borders.
 */
class OrderDesignPdfService
{
    private const MM_TO_PT = 72 / 25.4;

    public function __construct(
        protected DesignService $designService
    ) {}

    /**
     * Generate 1:1 actual working-size print design PDF without A4 borders, crop marks, or safety zones.
     * Artboard 1: Front side (e.g. 92x52mm).
     * Artboard 2: Back side (e.g. 92x52mm).
     *
     * @return array{
     *   content: string,
     *   filename: string,
     *   format: string,
     *   mime: string,
     *   width_mm: float,
     *   height_mm: float,
     *   pages_count: int,
     *   sides: array<int, string>,
     *   source_type: string,
     *   warning: string|null
     * }
     */
    public function buildPrintDesign(Order $order, string $format = 'pdf', ?int $orderItemId = null): array
    {
        $order->loadMissing([
            'items.designGroup.sizeOption',
            'items.product.specification',
            'artworks.designGroup',
        ]);

        /** @var Collection<int, OrderArtwork> $artworks */
        $artworks = collect($order->artworks ?? []);

        // Filter by item if requested
        if ($orderItemId) {
            $artworks = $artworks->filter(fn (OrderArtwork $a) => (int) $a->designGroup?->order_item_id === $orderItemId);
        }

        $items = $orderItemId
            ? $order->items->filter(fn ($it) => (int) $it->id === $orderItemId)
            : $order->items;

        $targetItem = $items->first();

        if (! $orderItemId && $items->count() > 1) {
            $dimensionsByItem = $items->map(fn (OrderItem $item) => $this->resolveWorkingDimensions($item, null));
            $firstDimensions = $dimensionsByItem->first();
            $hasDifferentDimensions = $dimensionsByItem->contains(
                fn (array $dimensions) => $dimensions !== $firstDimensions
            );

            if ($hasDifferentDimensions) {
                throw new \LogicException('주문 상품별 작업 사이즈가 달라 order_item_id를 지정해야 합니다.');
            }
        }

        // Determine working dimensions (in mm)
        $dimensions = $this->resolveWorkingDimensions($targetItem, $artworks->first());
        $widthMm = $dimensions['width_mm'];
        $heightMm = $dimensions['height_mm'];

        // Order artworks: Front first, then Back
        $sortedArtworks = $this->collectArtworksForItem($artworks);

        $pages = [];
        $sides = [];
        foreach ($sortedArtworks as $art) {
            $dataUri = $this->getImageDataUri($art);
            if ($dataUri) {
                $pages[] = [
                    'side' => $art->side ?? 'front',
                    'data_uri' => $dataUri,
                ];
                $sides[] = $art->side ?? 'front';
            }
        }

        if (empty($pages)) {
            // Fallback placeholder
            $pages[] = [
                'side' => 'front',
                'data_uri' => $this->getPlaceholderImageDataUri(),
            ];
            $sides[] = 'front';
        }

        $widthPt = $widthMm * self::MM_TO_PT;
        $heightPt = $heightMm * self::MM_TO_PT;

        $html = $this->buildPrintHtml($pages, $widthPt, $heightPt);
        $binary = $this->renderCustomSizePdf($html, $widthPt, $heightPt);

        $ext = 'pdf';
        $filename = sprintf('print_%s.%s', preg_replace('/[^a-zA-Z0-9\-]/', '-', $order->order_number), $ext);
        $mime = 'application/pdf';

        return [
            'content' => $binary,
            'filename' => $filename,
            'format' => $ext,
            'mime' => $mime,
            'width_mm' => $widthMm,
            'height_mm' => $heightMm,
            'pages_count' => count($pages),
            'sides' => $sides,
            'source_type' => 'raster_fallback',
            'warning' => '기존 주문으로 미리보기 이미지가 포함되어 있습니다.',
        ];
    }

    /**
     * Generate a ZIP archive containing 1:1 print design PDFs for multiple orders.
     *
     * @param  iterable<Order>  $orders
     */
    public function buildBulkPrintZip(iterable $orders, string $format = 'pdf'): string
    {
        if (! class_exists(\ZipArchive::class)) {
            throw new \RuntimeException('ZIP 확장 모듈이 설치되지 않았습니다.');
        }

        $tempFile = tempnam(sys_get_temp_dir(), 'order_bulk_print_');
        $zip = new \ZipArchive;
        $zip->open($tempFile, \ZipArchive::CREATE | \ZipArchive::OVERWRITE);

        foreach ($orders as $order) {
            $result = $this->buildPrintDesign($order, $format);
            $zip->addFromString($result['filename'], $result['content']);
        }

        $zip->close();
        $binary = file_get_contents($tempFile) ?: '';
        @unlink($tempFile);

        return $binary;
    }

    /**
     * Resolve exact working dimensions in mm from DesignGroup, SizeOption, or standard fallback.
     *
     * @return array{width_mm: float, height_mm: float}
     */
    protected function resolveWorkingDimensions(?OrderItem $item, ?OrderArtwork $artwork): array
    {
        // 1. Check DesignGroup on item
        if ($item?->designGroup) {
            $dg = $item->designGroup;
            if ($dg->width_mm && $dg->height_mm) {
                return [
                    'width_mm' => (float) $dg->width_mm,
                    'height_mm' => (float) $dg->height_mm,
                ];
            }
        }

        // 2. Check SizeOption
        if ($item?->designGroup?->sizeOption) {
            $so = $item->designGroup->sizeOption;
            if ($so->working_width && $so->working_height) {
                return [
                    'width_mm' => (float) $so->working_width,
                    'height_mm' => (float) $so->working_height,
                ];
            }
            if ($so->cutting_width && $so->cutting_height) {
                return [
                    'width_mm' => (float) $so->cutting_width,
                    'height_mm' => (float) $so->cutting_height,
                ];
            }
        }

        // 3. Check product specification for legacy orders without a design group.
        if ($item?->product?->specification) {
            $spec = $item->product->specification;
            if ($spec->size_width_mm && $spec->size_height_mm) {
                return [
                    'width_mm' => (float) $spec->size_width_mm,
                    'height_mm' => (float) $spec->size_height_mm,
                ];
            }
        }

        // 4. Check DesignGroup via artwork
        if ($artwork?->designGroup) {
            $dg = $artwork->designGroup;
            if ($dg->width_mm && $dg->height_mm) {
                return [
                    'width_mm' => (float) $dg->width_mm,
                    'height_mm' => (float) $dg->height_mm,
                ];
            }
        }

        throw new \LogicException('주문 디자인의 작업 사이즈를 확인할 수 없습니다.');
    }

    /**
     * Build HTML for print design: exactly 100% full bleed, zero padding, zero margins, no headers.
     */
    protected function buildPrintHtml(array $pages, float $widthPt, float $heightPt): string
    {
        $body = '';
        foreach ($pages as $index => $page) {
            $isLast = ($index === count($pages) - 1);
            $break = $isLast ? 'auto' : 'always';
            $body .= sprintf(
                '<div class="print-page" style="page-break-after: %s;"><img src="%s" /></div>',
                $break,
                $page['data_uri']
            );
        }

        return view('pdf.order-print-design', compact('body', 'widthPt', 'heightPt'))->render();
    }

    protected function renderCustomSizePdf(string $html, float $widthPt, float $heightPt): string
    {
        $options = new Options;
        $options->set('isRemoteEnabled', false);
        $options->set('isHtml5ParserEnabled', true);
        $options->set('dpi', 300);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $orientation = $widthPt > $heightPt ? 'landscape' : 'portrait';
        $dompdf->setPaper([0, 0, $widthPt, $heightPt], $orientation);
        $dompdf->render();

        return (string) $dompdf->output();
    }

    // =========================================================================
    // Legacy Preview PDF Methods (Preserved for existing view design as PDF)
    // =========================================================================

    /**
     * Generate PDF binary content for the order's designs (one page per side: front, back).
     *
     * @return string PDF binary content
     */
    public function buildPdf(Order $order): string
    {
        // Load items + artworks so we can produce stable output even when an order has multiple items/designs.
        // We still include artworks that have order_id but no order_item_id (legacy), grouped last.
        $order->loadMissing(['items', 'artworks']);

        /** @var Collection<int, OrderArtwork> $artworks */
        $artworks = collect($order->artworks ?? []);

        // Group by order_item_id (null group last).
        $groups = $artworks->groupBy(fn (OrderArtwork $a) => $a->order_item_id ?? 0);

        $pages = [];
        foreach ($order->items as $item) {
            $group = $groups->get($item->id, collect());
            foreach ($this->collectArtworksForItem($group) as $artwork) {
                $pages[] = $this->buildPage($order, $item->title ?? ('Item #'.$item->id), $artwork);
            }
        }
        // Legacy/unlinked artworks (order_item_id null or 0)
        $legacy = $groups->get(0, collect());
        foreach ($this->collectArtworksForItem($legacy) as $artwork) {
            $pages[] = $this->buildPage($order, 'Unassigned', $artwork);
        }

        if (empty($pages)) {
            return $this->buildEmptyPdf($order->order_number);
        }

        return $this->renderPdf($order->order_number, $pages);
    }

    /**
     * Generate a single merged PDF binary containing designs for multiple orders.
     *
     * @param  iterable<Order>  $orders
     * @return string PDF binary content
     */
    public function buildBulkPdf(iterable $orders): string
    {
        $allPages = [];

        foreach ($orders as $order) {
            $order->loadMissing(['items', 'artworks']);
            /** @var Collection<int, OrderArtwork> $artworks */
            $artworks = collect($order->artworks ?? []);
            $groups = $artworks->groupBy(fn (OrderArtwork $a) => $a->order_item_id ?? 0);

            $orderPages = [];
            foreach ($order->items as $item) {
                $group = $groups->get($item->id, collect());
                foreach ($this->collectArtworksForItem($group) as $artwork) {
                    $orderPages[] = $this->buildPage($order, $item->title ?? ('Item #'.$item->id), $artwork);
                }
            }
            $legacy = $groups->get(0, collect());
            foreach ($this->collectArtworksForItem($legacy) as $artwork) {
                $orderPages[] = $this->buildPage($order, 'Unassigned', $artwork);
            }

            if (empty($orderPages)) {
                $allPages[] = [
                    'label' => $order->order_number,
                    'side' => 'none',
                    'data_uri' => $this->getPlaceholderImageDataUri(),
                    'empty_message' => 'No design preview available for order '.$order->order_number.'.',
                ];
            } else {
                foreach ($orderPages as $page) {
                    $allPages[] = $page;
                }
            }
        }

        if (empty($allPages)) {
            return $this->buildEmptyPdf('bulk-orders');
        }

        return $this->renderPdf('bulk-orders', $allPages);
    }

    /**
     * Generate a ZIP archive containing individual design PDFs for multiple orders.
     *
     * @param  iterable<Order>  $orders
     * @return string ZIP binary content
     */
    public function buildBulkZip(iterable $orders): string
    {
        if (! class_exists(\ZipArchive::class)) {
            return $this->buildBulkPdf($orders);
        }

        $tempFile = tempnam(sys_get_temp_dir(), 'order_bulk_zip_');
        $zip = new \ZipArchive();
        $zip->open($tempFile, \ZipArchive::CREATE | \ZipArchive::OVERWRITE);

        foreach ($orders as $order) {
            $pdfContent = $this->buildPdf($order);
            $filename = 'design-'.preg_replace('/[^a-zA-Z0-9\-]/', '-', $order->order_number).'.pdf';
            $zip->addFromString($filename, $pdfContent);
        }

        $zip->close();
        $binary = file_get_contents($tempFile) ?: '';
        @unlink($tempFile);

        return $binary;
    }

    /**
     * Collect artworks ordered by side (front first, then back).
     *
     * @param  Collection<int, OrderArtwork>  $artworks
     * @return array<int, OrderArtwork>
     */
    protected function collectArtworksForItem(Collection $artworks): array
    {
        $front = $artworks->firstWhere('side', 'front');
        $back = $artworks->firstWhere('side', 'back');
        $result = [];
        if ($front) {
            $result[] = $front;
        }
        if ($back) {
            $result[] = $back;
        }
        // If no front/back, use all in collection order
        if (empty($result)) {
            return $artworks->values()->all();
        }

        return $result;
    }

    protected function getImageDataUri(OrderArtwork $artwork): ?string
    {
        $content = $this->designService->getPreviewContent($artwork);
        if ($content === null || $content === '') {
            return null;
        }

        $path = $artwork->preview_image_path ?? '';
        $mime = $this->mimeFromPath($path);

        return 'data:'.$mime.';base64,'.base64_encode($content);
    }

    /** Minimal 1x1 transparent PNG as data URI (placeholder when no preview file). */
    protected function getPlaceholderImageDataUri(): string
    {
        $base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

        return 'data:image/png;base64,'.$base64;
    }

    protected function mimeFromPath(string $path): string
    {
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        return match ($ext) {
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            default => 'image/jpeg',
        };
    }

    protected function buildEmptyPdf(string $orderNumber): string
    {
        $html = $this->wrapPage(
            '<p style="text-align:center;color:#666;">No design preview available for order '.e($orderNumber).'.</p>'
        );

        return $this->renderHtmlToPdf($html);
    }

    /**
     * @param  array<int, array{label: string, side: string, data_uri: string, empty_message?: string}>  $pages
     */
    protected function renderPdf(string $orderNumber, array $pages): string
    {
        $body = '';
        foreach ($pages as $index => $page) {
            $isLast = ($index === count($pages) - 1);
            $pageBreak = $isLast ? 'auto' : 'always';
            $body .= '<div class="page" style="page-break-after: '.$pageBreak.'; text-align:center;">';
            if (! empty($page['empty_message'])) {
                $body .= '<p style="font-size:14px;color:#666;padding-top:40px;">'.e($page['empty_message']).'</p>';
            } else {
                $label = $page['side'] === 'back' ? 'Back Side' : 'Front Side';
                $body .= '<p style="font-size:12px;color:#666;margin-bottom:8px;">'.e($page['label']).' — '.$label.'</p>';
                $body .= '<img src="'.$page['data_uri'].'" style="max-width:100%; height:auto; max-height:90vh;" />';
            }
            $body .= '</div>';
        }

        $html = $this->wrapPage($body);

        return $this->renderHtmlToPdf($html);
    }

    protected function wrapPage(string $body): string
    {
        return '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:DejaVu Sans,sans-serif;margin:20px;} .page{min-height:80vh;}</style></head><body>'.$body.'</body></html>';
    }

    protected function buildPage(Order $order, string $itemLabel, OrderArtwork $artwork): array
    {
        $imageData = $this->getImageDataUri($artwork);
        if ($imageData === null) {
            $imageData = $this->getPlaceholderImageDataUri();
        }

        return [
            'label' => $order->order_number.' — '.$itemLabel,
            'side' => $artwork->side,
            'data_uri' => $imageData,
        ];
    }

    protected function renderHtmlToPdf(string $html): string
    {
        $options = new Options;
        $options->set('isRemoteEnabled', false);
        $options->set('isHtml5ParserEnabled', true);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return (string) $dompdf->output();
    }
}
