<?php

namespace App\Services\Admin;

use App\Enums\UsageStatusValue;
use App\Http\Resources\Admin\AdminTemplateResource;
use App\Models\Template;
use App\Models\User;
use App\Services\PaginationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminTemplateService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {
    }

    /**
     * Get search filter options for templates.
     *
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        return [
            'status_options' => UsageStatusValue::options(),
            'type_options' => \App\Enums\TemplateType::options(),
            'side_options' => \App\Enums\TemplateSide::options(),
            'orientation_options' => \App\Enums\TemplateOrientation::options(),
            'specification_search_hint' => 'e.g. 90x50mm, 300gsm, A4 (searches in size, paper, sides)',
        ];
    }

    /**
     * Build query for templates with filters.
     * This method is used by both getTemplates and export.
     *
     * @param  array<string, mixed>  $filters
     */
    protected function buildQuery(array $filters): Builder
    {
        $query = Template::query()->with(['createdBy', 'sizeOption', 'webEditor']);

        // Filter by template name
        $templateName = Arr::get($filters, 'template_name');
        if ($templateName) {
            $query->where('name', 'like', '%' . $templateName . '%');
        }

        // Filter by linked product
        $linkedProduct = Arr::get($filters, 'linked_product');
        if ($linkedProduct) {
            $query->whereHas('webEditor.products', function (Builder $builder) use ($linkedProduct) {
                $builder->where(function (Builder $q) use ($linkedProduct) {
                    $q->where('name', 'like', "%{$linkedProduct}%")
                        ->orWhere('sku', 'like', "%{$linkedProduct}%");
                });
            });
        }

        // Filter by product_id
        $productId = Arr::get($filters, 'product_id');
        if ($productId) {
            $query->whereHas('webEditor.products', function (Builder $builder) use ($productId) {
                $builder->where('products.id', $productId);
            });
        }

        // Filter by specification: keyword search in all specification values (size, paper, sides, etc.)
        // User can type e.g. "90x50mm", "300gsm", "A4" without knowing the key name
        $specification = Arr::get($filters, 'specification');
        if ($specification !== null && $specification !== '') {
            $like = '%' . str_replace(['%', '_'], ['\%', '\_'], $specification) . '%';
            $specKeys = ['size', 'paper', 'sides']; // keys in specifications JSON to search in
            $query->where(function (Builder $q) use ($like, $specKeys) {
                foreach ($specKeys as $key) {
                    $q->orWhereRaw(
                        'JSON_UNQUOTE(JSON_EXTRACT(specifications, ?)) LIKE ?',
                        ['$.' . $key, $like]
                    );
                }
            });
        }

        // Filter by status (active/inactive)
        $status = Arr::get($filters, 'status');
        if ($status) {
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Filter by registrant
        $registrant = Arr::get($filters, 'registrant');
        if ($registrant) {
            $query->whereHas('createdBy', function (Builder $builder) use ($registrant) {
                $builder->where('username', 'like', '%' . $registrant . '%')
                    ->orWhere('name', 'like', '%' . $registrant . '%')
                    ->orWhere('email', 'like', '%' . $registrant . '%');
            });
        }

        // Filter by last modified date
        $lastModifiedFrom = Arr::get($filters, 'last_modified_from');
        $lastModifiedTo = Arr::get($filters, 'last_modified_to');
        if ($lastModifiedFrom) {
            $query->where('updated_at', '>=', $lastModifiedFrom);
        }
        if ($lastModifiedTo) {
            $query->where('updated_at', '<=', $lastModifiedTo);
        }

        // Sort
        $sortBy = Arr::get($filters, 'sort_by', 'created_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');

        $allowedSortFields = ['name', 'created_at', 'updated_at', 'is_active'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query;
    }

    /**
     * Get templates with filters for Super Admin.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getTemplates(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->buildQuery($filters);
        $currentPage = Arr::get($filters, 'current_page', 1);

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }

    /**
     * Get single template by ID.
     */
    public function getTemplate(int $id): Template
    {
        return Template::with(['createdBy', 'sizeOption', 'webEditor'])->findOrFail($id);
    }

    /**
     * Create a new template.
     *
     * @param  array<string, mixed>  $data
     */
    public function createTemplate(User $adminUser, array $data): Template
    {
        return DB::transaction(function () use ($adminUser, $data) {
            $layoutConfig = $this->normalizeLayoutConfigBackgroundKeysForStorage(Arr::get($data, 'layout_config'));

            $template = Template::create([
                'name' => $data['name'],
                'size_option_id' => Arr::get($data, 'size_option_id'),
                'specifications' => Arr::get($data, 'specifications'),
                'file_path' => Arr::get($data, 'file_path'),
                'safety_line' => Arr::get($data, 'safety_line'),
                'cut_line' => Arr::get($data, 'cut_line'),
                'font_set' => Arr::get($data, 'font_set'),
                'color_set' => Arr::get($data, 'color_set'),
                'spot_color' => Arr::get($data, 'spot_color'),
                // Store JSON fields as-is; FE owns layout_config logic.
                'layout_config' => $layoutConfig,
                'editor_permission' => Arr::get($data, 'editor_permission'),
                'front_preview_url' => Arr::get($data, 'front_preview_url'),
                'back_preview_url' => Arr::get($data, 'back_preview_url'),
                'preview_images' => Arr::get($data, 'preview_images'),
                'is_active' => Arr::get($data, 'is_active', true),
                'web_editor_id' => Arr::get($data, 'web_editor_id'),
                'type' => Arr::get($data, 'type'),
                'orientation' => Arr::get($data, 'orientation'),
                'side' => Arr::get($data, 'side'),
                'created_by' => $adminUser->id,
            ]);

            return $template;
        });
    }

    /**
     * Update an existing template.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateTemplate(int $id, array $data): Template
    {
        return DB::transaction(function () use ($id, $data) {
            $template = Template::findOrFail($id);

            $incomingLayoutConfig = Arr::get($data, 'layout_config', $template->layout_config);
            $layoutConfig = $this->normalizeLayoutConfigBackgroundKeysForStorage($incomingLayoutConfig);

            $template->update([
                'name' => Arr::get($data, 'name', $template->name),
                'product_id' => Arr::get($data, 'product_id', $template->product_id),
                'size_option_id' => Arr::get($data, 'size_option_id', $template->size_option_id),
                'specifications' => Arr::get($data, 'specifications', $template->specifications),
                'file_path' => Arr::get($data, 'file_path', $template->file_path),
                'safety_line' => Arr::get($data, 'safety_line', $template->safety_line),
                'cut_line' => Arr::get($data, 'cut_line', $template->cut_line),
                'font_set' => Arr::get($data, 'font_set', $template->font_set),
                'color_set' => Arr::get($data, 'color_set', $template->color_set),
                'spot_color' => Arr::get($data, 'spot_color', $template->spot_color),
                'layout_config' => $layoutConfig,
                'editor_permission' => Arr::get($data, 'editor_permission', $template->editor_permission),
                'front_preview_url' => Arr::get($data, 'front_preview_url', $template->front_preview_url),
                'back_preview_url' => Arr::get($data, 'back_preview_url', $template->back_preview_url),
                'preview_images' => Arr::get($data, 'preview_images', $template->preview_images),
                'is_active' => Arr::get($data, 'is_active', $template->is_active),
                'type' => Arr::get($data, 'type', $template->type),
                'orientation' => Arr::get($data, 'orientation', $template->orientation),
                'side' => Arr::get($data, 'side', $template->side),
                'web_editor_id' => Arr::get($data, 'web_editor_id', $template->web_editor_id),
            ]);

            return $template->load(['createdBy', 'sizeOption']);
        });
    }

    /**
     * Delete a template (soft delete).
     */
    public function deleteTemplate(int $id): void
    {
        DB::transaction(function () use ($id) {
            $template = Template::findOrFail($id);
            $template->delete();
        });
    }

    public function getTemplateCopyPreview(int $id): array
    {
        $template = Template::query()->findOrFail($id);

        $stem = $this->templateTitleStem((string) $template->name);
        $next = $this->nextTemplateCopySuffixNumber($stem, $template);
        $defaultCopyTitle = $stem . ' copy(' . $next . ')';

        return [
            'template_no' => (int) $template->id,
            'template_id' => (int) $template->id,
            'title' => $template->name,
            'default_copy_title' => $defaultCopyTitle,
            'default_copy_layers' => true,
        ];
    }

    public function copyTemplate(int $id, User $adminUser, string $copyTitle, bool $copyLayers = true): Template
    {
        return DB::transaction(function () use ($id, $adminUser, $copyTitle, $copyLayers) {
            $source = Template::query()->findOrFail($id);

            $clone = $source->replicate();
            $clone->name = mb_substr(trim($copyTitle), 0, 255);
            $clone->created_by = $adminUser->id;

            $layoutConfig = $source->layout_config;
            if (!$copyLayers && is_array($layoutConfig)) {
                $layoutConfig = $this->layoutConfigWithoutLayers($layoutConfig);
            }

            $clone->layout_config = $this->normalizeLayoutConfigBackgroundKeysForStorage(
                is_array($layoutConfig) ? $layoutConfig : null
            );

            $clone->save();

            return $clone->load(['createdBy']);
        });
    }

    private function templateTitleStem(string $name): string
    {
        $trimmed = trim($name);
        $stem = preg_replace('/\s+copy(?:\(v?\d+\))?$/iu', '', $trimmed);
        $stem = trim((string) $stem);

        return $stem !== '' ? $stem : $trimmed;
    }

    private function nextTemplateCopySuffixNumber(string $stem, Template $source): int
    {
        $regex = '/^' . preg_quote($stem, '/') . '\s+copy(?:\(v?(\d+)\))?$/iu';
        $max = 0;

        $this->templatesSharingCopyNamespace($source)
            ->select(['id', 'name'])
            ->chunkById(150, function ($rows) use ($regex, &$max) {
                foreach ($rows as $row) {
                    if (preg_match($regex, (string) $row->name, $matches)) {
                        $n = isset($matches[1]) && $matches[1] !== '' ? (int) $matches[1] : 1;
                        $max = max($max, $n);
                    }
                }
            });

        return $max + 1;
    }

    private function templatesSharingCopyNamespace(Template $source): Builder
    {
        $query = Template::query();

        return $query;
    }

    private function layoutConfigWithoutLayers(array $layoutConfig): array
    {
        $layoutConfig['layers'] = [];

        return $layoutConfig;
    }

    /**
     * Normalize layout_config.background keys so stored JSON always matches FE shape:
     * front_image_url/back_image_url.
     *
     * @param  array<string, mixed>|null  $layoutConfig
     * @return array<string, mixed>|null
     */
    protected function normalizeLayoutConfigBackgroundKeysForStorage(?array $layoutConfig): ?array
    {
        if ($layoutConfig === null) {
            return null;
        }

        if (!isset($layoutConfig['background']) || !is_array($layoutConfig['background'])) {
            return $layoutConfig;
        }

        $bg = $layoutConfig['background'];

        // Map legacy front/back to FE keys.
        if (array_key_exists('front', $bg) && !array_key_exists('front_image_url', $bg)) {
            $bg['front_image_url'] = $bg['front'];
        }
        if (array_key_exists('back', $bg) && !array_key_exists('back_image_url', $bg)) {
            $bg['back_image_url'] = $bg['back'];
        }

        // Remove legacy keys.
        unset($bg['front'], $bg['back']);

        $layoutConfig['background'] = $bg;

        return $layoutConfig;
    }

    /**
     * Format list response with pagination and resources.
     *
     * @return array<string, mixed>
     */
    public function formatListResponse(LengthAwarePaginator $paginator): array
    {
        return [
            'templates' => AdminTemplateResource::collection($paginator->items()),
            'pagination' => $this->paginationService->format($paginator),
        ];
    }
}
