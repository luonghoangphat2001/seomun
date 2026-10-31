<?php

namespace App\Http\Requests\Admin\Product;

use App\Enums\ErpOptionGroupCode;
use App\Models\Product;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminProductUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // TODO: Add admin authorization check
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $id = $this->route('id'); // Get product ID or slug from route

        // Get product ID - if id is numeric, use it as ID, otherwise query by slug
        $productId = is_numeric($id)
            ? $id
            : Product::where('slug', $id)->value('id');

        // Create unique rules that ignore current product
        $slugRule = $productId
            ? Rule::unique('products', 'slug')->ignore($productId)
            : 'unique:products,slug';

        $skuRule = $productId
            ? Rule::unique('products', 'sku')->ignore($productId)
            : 'unique:products,sku';

        return [
            // Basic Information (all optional for update)
            'category_id' => 'sometimes|integer|exists:categories,id',
            'name' => 'sometimes|string|max:200',
            'name_en' => 'nullable|string|max:200',
            'name_ja' => 'nullable|string|max:200',
            'slug' => ['sometimes', 'string', 'max:200', $slugRule],
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',

            'pricing_profile_id' => 'sometimes|integer|exists:pricing_profiles,id',
            'pricing_structure' => ['sometimes', Rule::in(['single', 'cover_inner'])],
            'sku' => ['nullable', 'string', 'max:100', $skuRule],
            'requires_separate_shipping' => 'nullable|boolean',
            'separate_shipping_fee' => 'nullable|numeric|min:0',

            // Representative image(s) – FSD: set via CRUD (no upload). Array of image URLs.
            'images' => 'nullable|array',
            'images.*' => 'url|max:500',

            // Status & Flags (sales status: is_active = sold/hidden, is_featured = promotional)
            'is_active' => 'sometimes|boolean',
            'is_popular' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'allow_file_upload' => 'sometimes|boolean',
            'allow_web_editor' => 'sometimes|boolean',
            'is_blank_canvas' => 'sometimes|boolean',
            'stock_quantity' => 'sometimes|integer|min:0',
            'min_quantity' => 'sometimes|integer|min:1',
            'max_quantity' => 'nullable|integer|min:1',
            'sort_order' => 'sometimes|integer',

            // Specification (optional)
            'specification' => 'nullable|array',
            'specification.size_width_mm' => 'nullable|numeric',
            'specification.size_height_mm' => 'nullable|numeric',
            'specification.size_unit' => 'nullable|string|max:10',
            'specification.paper_type' => 'nullable|string|max:100',
            'specification.paper_weight_gsm' => 'nullable|integer',
            'specification.print_side' => 'nullable|string|max:20',
            'specification.coating' => 'nullable|string|max:50',
            'specification.corner_finish' => 'nullable|string|max:50',
            'specification.production_time_days' => 'nullable|integer|min:0',
            'specification.notes' => 'nullable|string',
            'specification.dieline_enabled' => 'nullable|boolean',
            'specification.dieline_margin_mm' => 'nullable|numeric|min:0|max:50',

            // Option Groups (optional)
            'option_groups' => 'nullable|array',
            'option_groups.*.code' => [
                'sometimes',
                'string',
                Rule::in(array_column(ErpOptionGroupCode::cases(), 'value')),
            ],
            'option_groups.*.erp_option_group_id' => 'sometimes|integer|exists:erp_option_groups,id',
            'option_groups.*.name' => 'sometimes|string|max:150',
            'option_groups.*.display_type' => 'sometimes|string|max:50',
            'option_groups.*.info_icon_enabled' => 'sometimes|boolean',
            'option_groups.*.info_content' => 'sometimes|string|max:500',
            'option_groups.*.is_required' => 'sometimes|boolean',
            'option_groups.*.sort_order' => 'sometimes|integer',
            'option_groups.*.options' => 'nullable|array',
            'option_groups.*.options.*.option_code' => 'nullable|string|max:100',
            'option_groups.*.options.*.field_name' => 'nullable|string|max:150',
            'option_groups.*.options.*.category' => 'nullable|string|max:100',
            'option_groups.*.options.*.erp_option_id' => 'nullable|integer|exists:erp_options,id',
            'option_groups.*.options.*.label' => 'required|string|max:150',
            'option_groups.*.options.*.value' => 'nullable|string|max:150',
            'option_groups.*.options.*.additional_price' => 'nullable|numeric|min:0',
            'option_groups.*.options.*.metadata' => 'nullable|array',
            'option_groups.*.options.*.sort_order' => 'integer',
            'option_groups.*.options.*.is_active' => 'boolean',


            // Product Sets (optional)
            'product_sets.quantity' => 'required|integer|min:1',
            'product_sets.set_type' => ['required', Rule::in(['input', 'select'])],
            'product_sets.min_set' => 'nullable|integer|min:1',
            'product_sets.max_set' => 'nullable|integer|min:1|gte:product_sets.min_set',
            'product_sets.step_set' => 'nullable|integer|min:1',
            'product_sets.set_unit' => 'nullable|string|max:50',
            'product_sets.select_options' => 'nullable|array',
            'product_sets.select_options.*.label' => ['required', 'string', 'max:255'],
            'product_sets.select_options.*.value' => ['required', 'integer',],

            // Web Editor
            'web_editor_id' => 'nullable|integer|exists:web_editors,id',
            'dieline_file_id' => 'sometimes|nullable|integer|exists:files,id',

            // Info Icon (optional)
            'info_icon' => 'nullable|array',
            'info_icon.size' => 'nullable|string|max:255',
            'info_icon.paper' => 'nullable|string|max:255',
            'info_icon.printed_color' => 'nullable|string|max:255',
            'info_icon.quantity' => 'nullable|nullable|max:255',
            'info_icon.post_processing' => 'nullable|string|max:255',
            'info_icon.design' => 'nullable|string|max:500',

            // Shopping Setting Items
            'shopping_setting_item_ids' => 'nullable|array',
            'shopping_setting_item_ids.*' => 'integer|exists:shopping_setting_items,id',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $itemIds = $this->input('shopping_setting_item_ids', []);
            if (!empty($itemIds) && is_array($itemIds)) {
                $settingIds = \App\Models\ShoppingSettingItem::whereIn('id', $itemIds)->pluck('shopping_setting_id')->toArray();
                if (count($settingIds) !== count(array_unique($settingIds))) {
                    $validator->errors()->add('shopping_setting_item_ids', '각 쇼핑 설정 유형(Type)당 최대 1개의 항목만 선택할 수 있습니다.');
                }
            }
        });
    }
}
