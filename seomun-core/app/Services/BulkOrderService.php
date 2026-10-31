<?php

namespace App\Services;

use App\Enums\FileType;
use App\Http\Exports\BulkOrderTemplateExport;
use App\Models\BulkOrderBatch;
use App\Models\BulkOrderEntry;
use App\Models\DesignGroup;
use App\Models\Order;
use App\Models\OrderArtwork;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Template;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;

/**
 * Bulk order: persist batch configuration, Excel rows, and validation only.
 * Orders are created elsewhere (cart / checkout), not in this service.
 */
class BulkOrderService
{

    public function __construct(
        protected FileService $fileService,
    ) {}

    /** Maximum data rows (cases) allowed per Excel upload for one batch. */
    public const MAX_ENTRIES_PER_BATCH = 100;

    /**
     * Create a new bulk order batch.
     *
     * @param  array<string, mixed>  $payload
     */
    public function createBatch(array $payload, User $user): BulkOrderBatch
    {
        $product = Product::active()->findOrFail($payload['product_id']);

        $batch = BulkOrderBatch::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'name' => $payload['name'] ?? null,
            'status' => 'draft',
            'configuration' => $payload['configuration'] ?? [],
            'metadata' => $payload['metadata'] ?? [],
        ]);

        return $batch;
    }

    /**
     * Upload and parse Excel file for bulk order batch.
     */
    public function uploadExcel(BulkOrderBatch $batch, UploadedFile $file, ?User $user = null): BulkOrderBatch
    {
        // Validate file type
        $allowedMimes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        if (! in_array($file->getMimeType(), $allowedMimes)) {
            throw new \InvalidArgumentException('유효하지 않은 파일 형식입니다. 엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
        }

        // Store file
        $path = $file->store('bulk-orders', 'local');
        $this->fileService->create($file, $path, FileType::BULK_ORDERS, $user);
        // Update batch with file path
        $batch->update([
            'excel_path' => $path,
            'status' => 'uploaded',
        ]);

        // Parse Excel file (will be implemented with Excel library)
        // For now, we'll create a placeholder structure
        $this->parseExcelFile($batch, $path);

        return $batch->fresh(['entries']);
    }

    /**
     * Parse Excel file and create entries.
     */
    protected function parseExcelFile(BulkOrderBatch $batch, string $filePath): void
    {
        $fullPath = storage_path('app/' . $filePath);

        if (! is_file($fullPath)) {
            throw new \RuntimeException('업로드된 엑셀 파일을 찾을 수 없습니다.');
        }

        // Clear previous entries if user re-uploads Excel for the same batch
        $batch->entries()->delete();

        $spreadsheet = IOFactory::load($fullPath);
        $sheet = $spreadsheet->getActiveSheet();

        $highestRow = (int) $sheet->getHighestRow();
        $highestColumn = $sheet->getHighestColumn();
        $highestColumnIndex = Coordinate::columnIndexFromString($highestColumn);

        // Our standard template:
        // Row 1: instruction
        // Row 2: labels (Korean)
        // Row 3: technical keys (e.g. name-1, hp-1, tel-1, email-2, ...)
        // Row 4+: yellow area where users input data (initially contains example row which users overwrite)

        // Build map: column index => technical key
        $columnMap = [];
        for ($col = 1; $col <= $highestColumnIndex; $col++) {
            $technical = trim((string) $sheet->getCellByColumnAndRow($col, 3)->getCalculatedValue());
            if ($technical === '') {
                continue;
            }
            $columnMap[$col] = $technical;
        }

        if ($columnMap === []) {
            // No technical row found – nothing to parse
            $batch->update([
                'expected_count' => 0,
                'success_count' => 0,
                'error_count' => 0,
            ]);

            return;
        }

        $created = 0;

        // Start from row 4 (yellow data area). Any non-empty row here is treated as data.
        for ($row = 4; $row <= $highestRow; $row++) {
            $rowData = [];
            $hasValue = false;

            foreach ($columnMap as $col => $technical) {
                $value = $sheet->getCellByColumnAndRow($col, $row)->getCalculatedValue();
                if (is_null($value)) {
                    continue;
                }

                $value = trim((string) $value);
                if ($value === '') {
                    continue;
                }

                $hasValue = true;
                $rowData[$technical] = $value;

                // Also populate normalized keys for validation / order creation convenience
                $normalizedKey = $this->normalizeTechnicalKey($technical);
                if ($normalizedKey !== null && ! array_key_exists($normalizedKey, $rowData)) {
                    $rowData[$normalizedKey] = $value;
                }
            }

            $this->enrichRowDataWithTemplateFieldKeys($batch, $rowData);

            if (! $hasValue) {
                // Treat first completely empty row as the end of data
                continue;
            }

            if ($created >= self::MAX_ENTRIES_PER_BATCH) {
                $this->abortParseExceedsMaxEntries($batch);
            }

            BulkOrderEntry::create([
                'batch_id' => $batch->id,
                'row_number' => $row,
                'data' => $rowData,
                'status' => 'pending',
            ]);

            $created++;
        }

        $batch->update([
            'expected_count' => $created,
            'success_count' => 0,
            'error_count' => 0,
        ]);
    }

    /**
     * Roll back parsed entries and fail when the sheet has more than {@see MAX_ENTRIES_PER_BATCH} data rows.
     */
    protected function abortParseExceedsMaxEntries(BulkOrderBatch $batch): never
    {
        $batch->entries()->delete();
        $batch->update([
            'expected_count' => 0,
            'success_count' => 0,
            'error_count' => 0,
        ]);

        throw new \InvalidArgumentException(
            '대량 주문은 1회 업로드당 최대 ' . self::MAX_ENTRIES_PER_BATCH . '건까지 가능합니다. 파일을 나누어 업로드하거나 초과된 행을 삭제해 주세요.'
        );
    }

    /**
     * Normalize technical Excel column keys into semantic keys
     * understood by validation/order creation logic.
     */
    protected function normalizeTechnicalKey(string $technical): ?string
    {
        $key = strtolower(trim($technical));

        if ($key === '') {
            return null;
        }

        // English / alternate name columns (before generic "name" prefix)
        if (str_starts_with($key, 'eng_name') || str_starts_with($key, 'eng_lastname')) {
            return 'eng_name';
        }

        // Common mappings from our standard template
        if (str_starts_with($key, 'name')) {
            return 'name';
        }

        if (str_starts_with($key, 'hp') || str_starts_with($key, 'mobile')) {
            // 휴대폰
            return 'mobile';
        }

        if (str_starts_with($key, 'tel') || str_starts_with($key, 'phone')) {
            // 유선
            return 'phone';
        }

        if (str_starts_with($key, 'email')) {
            return 'email';
        }

        if (str_starts_with($key, 'addr') || str_starts_with($key, 'address')) {
            // addr1-1, address-1, etc.
            return 'address';
        }

        if (str_starts_with($key, 'postcode') || str_starts_with($key, 'zip')) {
            return 'postcode';
        }

        if (str_starts_with($key, 'dept') || str_starts_with($key, 'department') || str_starts_with($key, 'part')) {
            return 'department';
        }

        if (str_starts_with($key, 'title') || str_starts_with($key, 'position')) {
            return 'position';
        }

        // For other columns we keep only the technical key
        return null;
    }

    /**
     * Validate all entries in a batch.
     *
     * @return array<string, mixed>
     */
    public function validateBatch(BulkOrderBatch $batch): array
    {
        if ($batch->status !== 'uploaded') {
            throw new \InvalidArgumentException('Batch must be in uploaded status to validate.');
        }

        $entryCount = $batch->entries()->count();
        if ($entryCount > self::MAX_ENTRIES_PER_BATCH) {
            throw new \InvalidArgumentException(
                'Bulk order allows at most ' . self::MAX_ENTRIES_PER_BATCH . ' entries per batch. Current count: ' . $entryCount . '.'
            );
        }

        $entries = $batch->entries;
        $validCount = 0;
        $invalidCount = 0;

        foreach ($entries as $entry) {
            $validation = $this->validateEntry($entry);

            if ($validation['valid']) {
                $entry->update([
                    'status' => 'valid',
                    'error_message' => null,
                ]);
                $validCount++;
            } else {
                $entry->update([
                    'status' => 'invalid',
                    'error_message' => $validation['error'],
                ]);
                $invalidCount++;
            }
        }

        $batch->update([
            'status' => 'validated',
            'success_count' => $validCount,
            'error_count' => $invalidCount,
        ]);

        return [
            'valid_count' => $validCount,
            'invalid_count' => $invalidCount,
            'total_count' => $entries->count(),
        ];
    }

    /**
     * Validate a single entry.
     *
     * @return array<string, mixed>
     */
    protected function validateEntry(BulkOrderEntry $entry): array
    {
        $data = $entry->data ?? [];
        $errors = [];

        // Required fields validation
        if (empty($data['name'])) {
            $errors[] = '이름은 필수 항목입니다.';
        }

        if (empty($data['phone']) && empty($data['mobile'])) {
            $errors[] = '전화번호 또는 휴대폰 번호는 필수 항목입니다.';
        }

        // Email validation if provided
        if (! empty($data['email']) && ! filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = '올바르지 않은 이메일 형식입니다.';
        }

        return [
            'valid' => empty($errors),
            'error' => empty($errors) ? null : implode(', ', $errors),
        ];
    }

    /**
     * Cancel a bulk order batch.
     */
    public function cancelBatch(BulkOrderBatch $batch): BulkOrderBatch
    {
        if (in_array($batch->status, ['confirmed', 'cancelled'])) {
            throw new \InvalidArgumentException('현재 상태에서는 배치를 취소할 수 없습니다.');
        }

        $batch->update([
            'status' => 'cancelled',
        ]);

        return $batch;
    }

    /**
     * Get batches for a user.
     *
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator
     */
    public function getBatches(User $user, array $filters = [], int $perPage = 15)
    {
        $query = BulkOrderBatch::where('user_id', $user->id)
            ->with(['product', 'entries'])
            ->orderBy('created_at', 'desc');

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }

        return $query->paginate($perPage);
    }

    /**
     * Get batch details with entries.
     */
    public function getBatch(BulkOrderBatch $batch, User $user): BulkOrderBatch
    {
        if ($batch->user_id !== $user->id) {
            throw new ModelNotFoundException('대량 주문 배치를 찾을 수 없습니다.');
        }

        return $batch->load(['product', 'entries']);
    }

    /**
     * Column definitions for bulk-order Excel (row 2 label, row 3 technical id, row 4 example).
     * Built from product template layout_config.layers (type=text). Falls back to legacy columns if none.
     *
     * @return array<int, array{label: string, technical: string, example: string, side?: string}>
     */
    public function getBulkOrderExcelColumnDefinitions(Product $product, ?int $templateId = null): array
    {
        $template = $this->resolveTemplateForBulkOrder($product, $templateId);
        if ($template === null) {
            return BulkOrderTemplateExport::fallbackColumnDefinitions();
        }

        $columns = $this->extractBulkOrderColumnsFromTemplate($template);

        return $columns !== [] ? $columns : BulkOrderTemplateExport::fallbackColumnDefinitions();
    }

    /**
     * Resolve template used for bulk order Excel column definitions.
     */
    public function resolveTemplateForBulkOrder(Product $product, ?int $templateId = null): ?Template
    {
        $query = Template::query()
            ->where('product_id', $product->id)
            ->where('is_active', true);

        if ($templateId !== null) {
            return (clone $query)->whereKey($templateId)->first();
        }

        return $query->orderBy('id')->first();
    }

    /**
     * @return array<int, array{label: string, technical: string, example: string, side: string}>
     */
    protected function extractBulkOrderColumnsFromTemplate(Template $template): array
    {
        $layout = $template->layout_config ?? [];
        if (! is_array($layout)) {
            return [];
        }

        $layers = $layout['layers'] ?? [];
        if (! is_array($layers)) {
            return [];
        }

        $textLayers = [];
        foreach ($layers as $layer) {
            if (! is_array($layer)) {
                continue;
            }
            if (($layer['type'] ?? '') !== 'text') {
                continue;
            }
            $options = $layer['options'] ?? [];
            if (is_array($options) && array_key_exists('editable', $options) && $options['editable'] === false) {
                continue;
            }
            $id = $layer['id'] ?? null;
            if ($id === null || $id === '') {
                continue;
            }
            $side = (string) ($layer['side'] ?? 'front');
            $label = (string) ($layer['label'] ?? $id);
            if ($side === 'back') {
                $label .= ' (뒷면)';
            }
            $textLayers[] = [
                'layer' => $layer,
                'side' => $side,
                'label' => $label,
                'sort_y' => (float) ($layer['position']['y'] ?? 0),
                'sort_x' => (float) ($layer['position']['x'] ?? 0),
            ];
        }

        usort($textLayers, function (array $a, array $b): int {
            $sideOrder = static fn(string $s): int => $s === 'back' ? 1 : 0;
            $cmpSide = $sideOrder($a['side']) <=> $sideOrder($b['side']);
            if ($cmpSide !== 0) {
                return $cmpSide;
            }
            $cmpY = $a['sort_y'] <=> $b['sort_y'];
            if ($cmpY !== 0) {
                return $cmpY;
            }

            return $a['sort_x'] <=> $b['sort_x'];
        });

        $columns = [];
        foreach ($textLayers as $item) {
            $layer = $item['layer'];
            $id = (string) ($layer['id'] ?? '');
            $columns[] = [
                'label' => $item['label'],
                'technical' => $id,
                'example' => (string) ($layer['default_value'] ?? ''),
                'side' => $item['side'],
            ];
        }

        return $columns;
    }

    /**
     * Add template field_key aliases so entry data matches layout (layer id → field_key).
     *
     * @param  array<string, mixed>  $rowData
     */
    protected function enrichRowDataWithTemplateFieldKeys(BulkOrderBatch $batch, array &$rowData): void
    {
        $configuration = $batch->configuration ?? [];
        if (! is_array($configuration) || empty($configuration['template_id'])) {
            return;
        }

        $templateId = (int) $configuration['template_id'];
        $template = Template::query()
            ->whereKey($templateId)
            ->where('product_id', $batch->product_id)
            ->where('is_active', true)
            ->first();

        if ($template === null) {
            return;
        }

        $layout = $template->layout_config ?? [];
        $layers = is_array($layout) ? ($layout['layers'] ?? []) : [];
        if (! is_array($layers)) {
            return;
        }

        foreach ($layers as $layer) {
            if (! is_array($layer) || ($layer['type'] ?? '') !== 'text') {
                continue;
            }
            $id = $layer['id'] ?? null;
            $fieldKey = $layer['field_key'] ?? null;
            if ($id === null || $id === '' || $fieldKey === null || $fieldKey === '' || $fieldKey === $id) {
                continue;
            }
            if (! array_key_exists($id, $rowData)) {
                continue;
            }
            if (! array_key_exists($fieldKey, $rowData)) {
                $rowData[$fieldKey] = $rowData[$id];
            }
        }
    }

    /**
     * Create OrderArtwork rows (front/back per entry) for a single order line produced from a bulk batch checkout.
     */
    public function attachArtworksFromBatchToOrderItem(
        Order $order,
        OrderItem $orderItem,
        BulkOrderBatch $batch,
        User $user
    ): void {
        $configuration = is_array($batch->configuration) ? $batch->configuration : [];
        $designModeId = isset($configuration['design_mode_id']) ? (int) $configuration['design_mode_id'] : 0;
        if ($designModeId < 1) {
            return;
        }

        $product = $batch->relationLoaded('product')
            ? $batch->product
            : $batch->product()->first();
        if ($product === null) {
            return;
        }

        $templateId = isset($configuration['template_id']) ? (int) $configuration['template_id'] : null;
        $template = $this->resolveTemplateForBulkOrder($product, $templateId);

        $entries = $batch->relationLoaded('entries')
            ? $batch->entries->where('status', 'valid')->sortBy('row_number')->values()
            : $batch->entries()->where('status', 'valid')->orderBy('row_number')->get();

        foreach ($entries as $entry) {
            $rowData = $entry->data ?? [];
            if (! is_array($rowData)) {
                $rowData = [];
            }
            $this->enrichRowDataWithTemplateFieldKeys($batch, $rowData);

            $frontTextFields = $this->buildTextFieldsForSide($template, $rowData, 'front');
            $backTextFields = $this->buildTextFieldsForSide($template, $rowData, 'back');

            $designGroup = DesignGroup::create([
                'user_id' => $user->id,
                'product_id' => $template->product_id ?? null,
                'order_id' => $order->id,
                'order_item_id' => $orderItem->id,
                'design_mode_id' => $designModeId,
                'title' => $template->name,
                'size_option_id' => $template->size_option_id ?? null,
                'text_fields' => $frontTextFields,
                'metadata' => [
                    'bulk_order_batch_id' => $batch->id,
                    'bulk_order_entry_id' => $entry->id,
                    'row_number' => $entry->row_number,
                ],
            ]);

            OrderArtwork::create([
                'design_group_id' => $designGroup->id,
                'side' => 'front',
                'layout_data' => null,
                'logo_path' => null,
                'preview_image_path' => null,
            ]);

            if ($this->textFieldsHaveAnyValue($backTextFields)) {
                OrderArtwork::create([
                    'design_group_id' => $designGroup->id,
                    'side' => 'back',
                    'layout_data' => null,
                    'logo_path' => null,
                    'preview_image_path' => null,
                ]);
            }
        }
    }

    /**
     * @return array<string, string>
     */
    protected function buildTextFieldsForSide(?Template $template, array $data, string $side): array
    {
        if ($template === null) {
            return $this->legacyBulkOrderTextFields($data, $side);
        }

        $layout = $template->layout_config ?? [];
        $layers = is_array($layout) ? ($layout['layers'] ?? []) : [];
        if (! is_array($layers)) {
            return $this->legacyBulkOrderTextFields($data, $side);
        }

        $fields = [];
        foreach ($layers as $layer) {
            if (! is_array($layer) || ($layer['type'] ?? '') !== 'text') {
                continue;
            }
            $layerSide = (string) ($layer['side'] ?? 'front');
            if ($layerSide !== $side) {
                continue;
            }
            $options = $layer['options'] ?? [];
            if (is_array($options) && array_key_exists('editable', $options) && $options['editable'] === false) {
                continue;
            }
            $id = $layer['id'] ?? null;
            if ($id === null || $id === '') {
                continue;
            }
            $fieldKey = (string) ($layer['field_key'] ?? $id);
            $value = $data[$id] ?? '';
            if ($value === '' && $fieldKey !== $id) {
                $value = $data[$fieldKey] ?? '';
            }
            $fields[$fieldKey] = is_scalar($value) ? (string) $value : '';
        }

        return $fields;
    }

    /**
     * @return array<string, string>
     */
    protected function legacyBulkOrderTextFields(array $data, string $side): array
    {
        if ($side !== 'front') {
            return [];
        }

        return [
            'name' => $data['name'] ?? '',
            'position' => $data['position'] ?? '',
            'department' => $data['department'] ?? '',
        ];
    }

    /**
     * @param  array<string, string>  $fields
     */
    protected function textFieldsHaveAnyValue(array $fields): bool
    {
        foreach ($fields as $value) {
            if ($value !== null && trim((string) $value) !== '') {
                return true;
            }
        }

        return false;
    }
}
