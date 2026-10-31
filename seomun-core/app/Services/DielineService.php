<?php

namespace App\Services;

use App\Models\ProductSpecification;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\Storage;

class DielineService
{
    // 1 mm in points (PDF unit: 1pt = 1/72 inch, 1 inch = 25.4mm)
    private const MM_TO_PT = 72 / 25.4;
    private const DEFAULT_BLEED_MM = 2.0;
    private const DEFAULT_SAFE_MARGIN_MM = 2.0;
    private const GENERATED_FILE_RETENTION_HOURS = 24;

    public function defaultBleedMm(): float
    {
        return self::DEFAULT_BLEED_MM;
    }

    public function defaultSafeMarginMm(): float
    {
        return self::DEFAULT_SAFE_MARGIN_MM;
    }

    /** @return array{margin_mm: float, safe_margin_mm: float, type: string, booklet_part: ?string, spine_thickness_mm: float} */
    public function resolveRequestParameters(ProductSpecification $spec, array $data): array
    {
        $type = $data['type'] ?? 'single_sheet';

        return [
            'margin_mm' => (float) ($spec->dieline_margin_mm ?? $this->defaultBleedMm()),
            'safe_margin_mm' => $this->resolveSafeMarginMm($spec),
            'type' => $type,
            'booklet_part' => $data['booklet_part'] ?? ($type === 'booklet' ? 'cover' : null),
            'spine_thickness_mm' => (float) ($data['spine_thickness_mm'] ?? 0.0),
        ];
    }

    private function resolveSafeMarginMm(ProductSpecification $spec): float
    {
        $horizontal = null;
        $vertical = null;

        if ($spec->size_width_mm !== null && $spec->safe_width !== null) {
            $horizontal = ((float) $spec->size_width_mm - (float) $spec->safe_width) / 2;
        }

        if ($spec->size_height_mm !== null && $spec->safe_height !== null) {
            $vertical = ((float) $spec->size_height_mm - (float) $spec->safe_height) / 2;
        }

        if ($horizontal !== null || $vertical !== null) {
            return max(0.0, $horizontal ?? $vertical ?? 0.0, $vertical ?? $horizontal ?? 0.0);
        }

        return $this->defaultSafeMarginMm();
    }

    /**
     * Calculate dieline dimensions from trim size, bleed margin, and safe margin.
     * Supports single sheet and booklet (cover vs inner).
     *
     * @return array{
     *   trim_width_mm: float,
     *   trim_height_mm: float,
     *   working_width_mm: float,
     *   working_height_mm: float,
     *   bleed_width_mm: float,
     *   bleed_height_mm: float,
     *   safe_width_mm: float,
     *   safe_height_mm: float,
     *   margin_mm: float,
     *   safe_margin_mm: float,
     *   type: string,
     *   booklet_part: ?string,
     *   spine_thickness_mm: float
     * }
     */
    public function calculateDimensions(
        float $trimWidthMm,
        float $trimHeightMm,
        float $marginMm = 2.0,
        float $safeMarginMm = 2.0,
        string $type = 'single_sheet',
        ?string $bookletPart = null,
        float $spineThicknessMm = 0.0
    ): array {
        $marginMm = max(0.0, $marginMm);
        $safeMarginMm = max(0.0, $safeMarginMm);

        $actualTrimW = $trimWidthMm;
        $actualTrimH = $trimHeightMm;

        // If booklet cover: flat width is 2 * trimWidth + spine
        if ($type === 'booklet' && in_array($bookletPart, ['cover', 'all'], true)) {
            $actualTrimW = ($trimWidthMm * 2) + $spineThicknessMm;
        }

        // Working size = trim + margin on each side
        $workingWidth = $actualTrimW + ($marginMm * 2);
        $workingHeight = $actualTrimH + ($marginMm * 2);

        // Safe area = trim - safe margin on each side
        $safeWidth = max(0, $actualTrimW - ($safeMarginMm * 2));
        $safeHeight = max(0, $actualTrimH - ($safeMarginMm * 2));

        return [
            'trim_width_mm' => round($actualTrimW, 2),
            'trim_height_mm' => round($actualTrimH, 2),
            'working_width_mm' => round($workingWidth, 2),
            'working_height_mm' => round($workingHeight, 2),
            'bleed_width_mm' => round($workingWidth, 2),
            'bleed_height_mm' => round($workingHeight, 2),
            'safe_width_mm' => round($safeWidth, 2),
            'safe_height_mm' => round($safeHeight, 2),
            'margin_mm' => round($marginMm, 2),
            'safe_margin_mm' => round($safeMarginMm, 2),
            'type' => $type,
            'booklet_part' => $bookletPart,
            'spine_thickness_mm' => round($spineThicknessMm, 2),
            'single_page_trim_width_mm' => round($trimWidthMm, 2),
            'single_page_trim_height_mm' => round($trimHeightMm, 2),
        ];
    }

    /**
     * Generate AI or PDF dieline file, store to public disk, return public URL and metadata.
     * Files are stored under dielines/ and expire after 24h.
     */
    public function generateAndStore(
        float $trimWidthMm,
        float $trimHeightMm,
        float $marginMm,
        string $productSlug,
        float $safeMarginMm = 2.0,
        string $type = 'single_sheet',
        ?string $bookletPart = null,
        float $spineThicknessMm = 0.0,
        string $format = 'ai'
    ): array {
        $this->cleanupExpiredFiles();

        $ext = strtolower($format) === 'pdf' ? 'pdf' : 'ai';

        $dims = $this->calculateDimensions(
            $trimWidthMm,
            $trimHeightMm,
            $marginMm,
            $safeMarginMm,
            $type,
            $bookletPart,
            $spineThicknessMm
        );

        if ($type === 'booklet' && $bookletPart === 'all') {
            return $this->generateBookletArchive(
                $trimWidthMm,
                $trimHeightMm,
                $marginMm,
                $safeMarginMm,
                $productSlug,
                $spineThicknessMm,
                $format
            );
        }

        $fileContent = $ext === 'ai'
            ? $this->generateIllustratorDieline($dims, $productSlug)
            : $this->generateVectorDieline($dims, $productSlug);

        $partSuffix = $bookletPart ? "_{$bookletPart}" : '';
        $filename = sprintf(
            'dielines/%s_%sx%smm%s_%s.%s',
            $productSlug,
            $dims['trim_width_mm'],
            $dims['trim_height_mm'],
            $partSuffix,
            now()->format('YmdHis'),
            $ext
        );

        Storage::disk('public')->put($filename, $fileContent);

        return [
            'content' => $fileContent,
            'url' => Storage::disk('public')->url($filename),
            'filename' => basename($filename),
            'format' => $ext,
            'expires_in_hours' => self::GENERATED_FILE_RETENTION_HOURS,
            'file_size_bytes' => strlen($fileContent),
            'mime_type' => $ext === 'ai' ? 'application/postscript' : 'application/pdf',
            'dimensions' => $dims,
        ];
    }

    /**
     * Generate both booklet cover and inner dielines as one downloadable archive.
     */
    protected function generateBookletArchive(
        float $trimWidthMm,
        float $trimHeightMm,
        float $marginMm,
        float $safeMarginMm,
        string $productSlug,
        float $spineThicknessMm,
        string $format
    ): array {
        if (! class_exists(\ZipArchive::class)) {
            throw new \RuntimeException('ZIP 확장 모듈이 설치되지 않았습니다.');
        }

        $extension = strtolower($format) === 'pdf' ? 'pdf' : 'ai';
        $tempFile = tempnam(sys_get_temp_dir(), 'dieline_booklet_');
        $zip = new \ZipArchive;
        $zip->open($tempFile, \ZipArchive::CREATE | \ZipArchive::OVERWRITE);

        foreach (['cover', 'inner'] as $part) {
            $dims = $this->calculateDimensions(
                $trimWidthMm,
                $trimHeightMm,
                $marginMm,
                $safeMarginMm,
                'booklet',
                $part,
                $spineThicknessMm
            );
            $content = $extension === 'ai'
                ? $this->generateIllustratorDieline($dims, $productSlug)
                : $this->generateVectorDieline($dims, $productSlug);
            $name = sprintf(
                '%s_%sx%smm_%s.%s',
                $productSlug,
                $dims['trim_width_mm'],
                $dims['trim_height_mm'],
                $part,
                $extension
            );
            $zip->addFromString($name, $content);
        }

        $zip->close();
        $content = file_get_contents($tempFile) ?: '';
        @unlink($tempFile);

        $filename = sprintf(
            '%s_%sx%smm_booklet.zip',
            $productSlug,
            $trimWidthMm,
            $trimHeightMm
        );
        $path = 'dielines/'.$filename;
        Storage::disk('public')->put($path, $content);

        return [
            'content' => $content,
            'url' => Storage::disk('public')->url($path),
            'filename' => $filename,
            'format' => 'zip',
            'expires_in_hours' => self::GENERATED_FILE_RETENTION_HOURS,
            'file_size_bytes' => strlen($content),
            'mime_type' => 'application/zip',
            'dimensions' => $this->calculateDimensions(
                $trimWidthMm,
                $trimHeightMm,
                $marginMm,
                $safeMarginMm,
                'booklet',
                'all',
                $spineThicknessMm
            ),
        ];
    }

    /**
     * Generate vector dieline content compatible with Adobe Illustrator (.ai) and PDF.
     */
    public function generateVectorDieline(array $dims, string $productName): string
    {
        $pageWidthMm = $dims['working_width_mm'] + 20; // 10mm padding each side for measurement labels
        $pageHeightMm = $dims['working_height_mm'] + 20;

        $html = $this->buildDielineHtml($dims, $pageWidthMm, $pageHeightMm, $productName);

        $options = new Options;
        $options->set('isRemoteEnabled', false);
        $options->set('defaultFont', 'Helvetica');
        $options->set('dpi', 300);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $orientation = $pageWidthMm > $pageHeightMm ? 'landscape' : 'portrait';
        $dompdf->setPaper([0, 0, $pageWidthMm * self::MM_TO_PT, $pageHeightMm * self::MM_TO_PT], $orientation);
        $dompdf->render();

        $output = $dompdf->output();

        // Inject spot color and layer comments for Adobe Illustrator
        return $this->injectSpotColor($output, $dims);
    }

    /**
     * Generate Illustrator-compatible vector output without raster/PDF conversion.
     */
    protected function generateIllustratorDieline(array $dims, string $productName): string
    {
        $pageWidthPt = ($dims['working_width_mm'] + 20) * self::MM_TO_PT;
        $pageHeightPt = ($dims['working_height_mm'] + 20) * self::MM_TO_PT;
        $offsetPt = 10 * self::MM_TO_PT;
        $trimX = $offsetPt + ($dims['margin_mm'] * self::MM_TO_PT);
        $trimY = $offsetPt + ($dims['margin_mm'] * self::MM_TO_PT);
        $trimW = $dims['trim_width_mm'] * self::MM_TO_PT;
        $trimH = $dims['trim_height_mm'] * self::MM_TO_PT;
        $safeX = $trimX + ($dims['safe_margin_mm'] * self::MM_TO_PT);
        $safeY = $trimY + ($dims['safe_margin_mm'] * self::MM_TO_PT);
        $safeW = $dims['safe_width_mm'] * self::MM_TO_PT;
        $safeH = $dims['safe_height_mm'] * self::MM_TO_PT;
        $label = $this->escapePostScriptText(sprintf(
            '%s | Working %.2fx%.2fmm | Trim %.2fx%.2fmm | Safe %.2fx%.2fmm',
            $productName,
            $dims['working_width_mm'],
            $dims['working_height_mm'],
            $dims['trim_width_mm'],
            $dims['trim_height_mm'],
            $dims['safe_width_mm'],
            $dims['safe_height_mm']
        ));

        $postScript = "%!PS-Adobe-3.0 EPSF-3.0\n";
        $postScript .= "%%Creator: Seomun DielineService\n";
        $postScript .= sprintf("%%%%BoundingBox: 0 0 %d %d\n", (int) ceil($pageWidthPt), (int) ceil($pageHeightPt));
        $postScript .= "%%LanguageLevel: 3\n%%Pages: 1\n%%EndComments\n";
        $postScript .= "%%BeginLayer: Working Size\n0.45 setlinewidth 0.45 0.45 0.45 setrgbcolor\n";
        $postScript .= $this->postScriptRectangle($offsetPt, $offsetPt, $dims['working_width_mm'] * self::MM_TO_PT, $dims['working_height_mm'] * self::MM_TO_PT, true);
        $postScript .= "%%EndLayer\n%%BeginLayer: Trim / Cut Line\n1.2 setlinewidth 1 0 1 setrgbcolor\n";
        $postScript .= $this->postScriptRectangle($trimX, $trimY, $trimW, $trimH, false);
        $postScript .= "%%EndLayer\n%%BeginLayer: Safety Margin\n0.45 setlinewidth 0 0.33 1 setrgbcolor\n";
        $postScript .= $this->postScriptRectangle($safeX, $safeY, $safeW, $safeH, true);
        $postScript .= "%%EndLayer\n";

        if ($dims['type'] === 'booklet' && $dims['booklet_part'] === 'cover' && $dims['spine_thickness_mm'] > 0) {
            $spineX1 = $trimX + ($dims['single_page_trim_width_mm'] * self::MM_TO_PT);
            $spineX2 = $spineX1 + ($dims['spine_thickness_mm'] * self::MM_TO_PT);
            $postScript .= "%%BeginLayer: Spine\n0.7 setlinewidth 1 0.5 0 setrgbcolor [3 3] 0 setdash\n";
            $postScript .= sprintf("newpath %.3f %.3f moveto %.3f %.3f lineto stroke\n", $spineX1, $trimY, $spineX1, $trimY + $trimH);
            $postScript .= sprintf("newpath %.3f %.3f moveto %.3f %.3f lineto stroke\n", $spineX2, $trimY, $spineX2, $trimY + $trimH);
            $postScript .= "[] 0 setdash %%EndLayer\n";
        }

        $postScript .= "0 0 0 setrgbcolor /Helvetica findfont 7 scalefont setfont\n";
        $postScript .= sprintf("%.3f %.3f moveto (%s) show\nshowpage\n%%EOF\n", $offsetPt, 5 * self::MM_TO_PT, $label);

        return $postScript;
    }

    private function postScriptRectangle(float $x, float $y, float $width, float $height, bool $dashed): string
    {
        $dash = $dashed ? '[3 3] 0 setdash' : '[] 0 setdash';

        return sprintf(
            "%s\nnewpath %.3f %.3f moveto %.3f %.3f lineto %.3f %.3f lineto %.3f %.3f lineto closepath stroke\n",
            $dash,
            $x,
            $y,
            $x + $width,
            $y,
            $x + $width,
            $y + $height,
            $x,
            $y + $height
        );
    }

    private function escapePostScriptText(string $text): string
    {
        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $text);
    }

    /**
     * Backward compatible wrapper for generatePdf.
     */
    public function generatePdf(float $trimWidthMm, float $trimHeightMm, float $marginMm, string $productName): string
    {
        $dims = $this->calculateDimensions($trimWidthMm, $trimHeightMm, $marginMm);

        return $this->generateVectorDieline($dims, $productName);
    }

    /**
     * Build HTML for vector rendering. Draws:
     * - Working size / Bleed line (outer boundary)
     * - Trim line / Cut line (Spot color PANTONE Die Cut)
     * - Safety margin (Safe zone guide)
     * - If booklet cover: Spine guide lines in center
     */
    private function buildDielineHtml(array $dims, float $pageWidthMm, float $pageHeightMm, string $productName): string
    {
        $offsetX = 10; // 10mm left padding
        $offsetY = 10; // 10mm top padding

        // Convert to px for CSS (1mm = 3.7795px at 96dpi)
        $px = fn (float $mm): float => round($mm * 3.7795, 2);

        $pageW = $px($pageWidthMm);
        $pageH = $px($pageHeightMm);

        $ox = $px($offsetX);
        $oy = $px($offsetY);

        $workW = $px($dims['working_width_mm']);
        $workH = $px($dims['working_height_mm']);

        $trimOffX = $px($offsetX + $dims['margin_mm']);
        $trimOffY = $px($offsetY + $dims['margin_mm']);
        $trimW = $px($dims['trim_width_mm']);
        $trimH = $px($dims['trim_height_mm']);

        $safeOffX = $trimOffX + $px($dims['safe_margin_mm']);
        $safeOffY = $trimOffY + $px($dims['safe_margin_mm']);
        $safeW = $px($dims['safe_width_mm']);
        $safeH = $px($dims['safe_height_mm']);

        $labelY = $px($offsetY + $dims['working_height_mm'] + 4);

        $spineHtml = '';
        if ($dims['type'] === 'booklet' && $dims['booklet_part'] === 'cover' && $dims['spine_thickness_mm'] > 0) {
            $singleTrimW = $px($dims['single_page_trim_width_mm'] ?? (($dims['trim_width_mm'] - $dims['spine_thickness_mm']) / 2));
            $spineW = $px($dims['spine_thickness_mm']);
            $spineX1 = $trimOffX + $singleTrimW;
            $spineX2 = $spineX1 + $spineW;

            $spineHtml = <<<HTML
  <div style="position: absolute; left: {$spineX1}px; top: {$trimOffY}px; width: 0; height: {$trimH}px; border-left: 1px dashed #FF9900;"></div>
  <div style="position: absolute; left: {$spineX2}px; top: {$trimOffY}px; width: 0; height: {$trimH}px; border-left: 1px dashed #FF9900;"></div>
HTML;
        }

        $partTitle = match ($dims['booklet_part']) {
            'cover' => ' [Booklet Cover / 표지]',
            'inner' => ' [Booklet Inner / 내지]',
            default => '',
        };

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: {$pageW}px; height: {$pageH}px; background: #fff; font-family: -apple-system, BlinkMacSystemFont, "Malgun Gothic", Dotum, sans-serif; }
  .page { position: relative; width: {$pageW}px; height: {$pageH}px; }

  /* Working size / Bleed area (outermost) — extend background to here */
  .dieline-rect {
    position: absolute;
    left: {$ox}px; top: {$oy}px;
    width: {$workW}px; height: {$workH}px;
    border: 1px dashed #888888;
    background: transparent;
  }

  /* Trim / Cut line — Spot Color PANTONE Die Cut, machine cuts here */
  .trim-rect {
    position: absolute;
    left: {$trimOffX}px;
    top:  {$trimOffY}px;
    width: {$trimW}px; height: {$trimH}px;
    border: 1.5px solid #FF00FF;
    background: transparent;
  }

  /* Safe area — keep important content inside */
  .safe-rect {
    position: absolute;
    left: {$safeOffX}px;
    top:  {$safeOffY}px;
    width: {$safeW}px; height: {$safeH}px;
    border: 1px dashed #0055FF;
    background: transparent;
  }

  .labels {
    position: absolute;
    top: {$labelY}px;
    left: {$ox}px;
    font-size: 8px;
    line-height: 1.5;
    color: #222;
  }
  .bleed-color { color: #666666; font-weight: bold; }
  .spot { color: #D6008F; font-weight: bold; }
  .safe-color { color: #0055FF; font-weight: bold; }
  .spine-color { color: #E67E22; font-weight: bold; }
</style>
</head>
<body>
<div class="page">
  <div class="dieline-rect"></div>
  <div class="trim-rect"></div>
  <div class="safe-rect"></div>
  {$spineHtml}
  <div class="labels">
    <strong>[Adobe Illustrator Template{$partTitle}]</strong><br>
    <span class="bleed-color">[--] 작업사이즈 (Working Size):</span> {$dims['working_width_mm']} x {$dims['working_height_mm']} mm (Bleed: {$dims['margin_mm']}mm)<br>
    <span class="spot">[M] 재단사이즈 (Trim / Cut Line):</span> {$dims['trim_width_mm']} x {$dims['trim_height_mm']} mm<br>
    <span class="safe-color">[B] 작업안전선 (Safety Margin):</span> {$dims['safe_width_mm']} x {$dims['safe_height_mm']} mm (Safe Margin: {$dims['safe_margin_mm']}mm)
    {$this->renderSpineLabel($dims)}
  </div>
</div>
</body>
</html>
HTML;
    }

    private function renderSpineLabel(array $dims): string
    {
        if ($dims['type'] === 'booklet' && $dims['booklet_part'] === 'cover' && $dims['spine_thickness_mm'] > 0) {
            return "<br><span class=\"spine-color\">[S] 책등두께 (Spine Thickness):</span> {$dims['spine_thickness_mm']} mm";
        }

        return '';
    }

    /**
     * Post-process the PDF to add Spot Color definitions and AI Layer metadata.
     */
    private function injectSpotColor(string $pdf, array $dims): string
    {
        $spotDef = "\n%% PANTONE Die Cut Spot Color Layer\n"
            ."% Working: {$dims['working_width_mm']}x{$dims['working_height_mm']}mm "
            ."| Trim: {$dims['trim_width_mm']}x{$dims['trim_height_mm']}mm "
            ."| Safe: {$dims['safe_width_mm']}x{$dims['safe_height_mm']}mm\n";

        $pdf = str_replace('1 0 1 RG', '1 0 1 RG % PANTONE Die Cut', $pdf);
        $pdf = str_replace('1 0 1 rg', '1 0 1 rg % PANTONE Die Cut', $pdf);

        return str_replace('%%EOF', $spotDef.'%%EOF', $pdf);
    }

    private function cleanupExpiredFiles(): void
    {
        $disk = Storage::disk('public');
        $files = $disk->files('dielines');

        $retentionHours = self::GENERATED_FILE_RETENTION_HOURS;

        foreach ($files as $file) {
            if ($disk->lastModified($file) < now()->subHours($retentionHours)->timestamp) {
                $disk->delete($file);
            }
        }
    }
}
