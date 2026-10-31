<?php

namespace Database\Seeders\unitprice;

use App\Enums\ErpOptionGroupCode;
use App\Enums\ErpOptionGroupType;
use App\Enums\PaperCategory;
use App\Models\ErpOption;
use App\Models\ErpOptionGroup;
use App\Models\Paper;
use App\Models\Product;
use App\Models\SizeOption;
use App\Models\UnitPrice;
use App\Models\UnitPriceItem;
use App\Services\Admin\AdminPaperService;
use App\Services\Admin\AdminProductService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use PhpOffice\PhpSpreadsheet\IOFactory;

class CloneUnitPriceSeeder extends Seeder
{

    public function __construct(
        protected AdminPaperService $paperService,
        protected AdminProductService $adminProductService,
    ) {}
    public function run(): void
    {
        $masterProduct = Product::where('slug', 'square-sticker')->firstOrFail();
        $targetProduct = Product::where('slug', 'design-sticker')->firstOrFail();

        // remove UnitPrice + UnitPriceItem
        $oldUnitPriceIds = UnitPrice::where('product_id', $targetProduct->id)
            ->pluck('id');

        UnitPriceItem::whereIn('unit_price_id', $oldUnitPriceIds)->delete();

        UnitPrice::where('product_id', $targetProduct->id)->delete();

        // Clone UnitPrice from master-envelope
        $masterUnitPrices = UnitPrice::where('product_id', $masterProduct->id)
            ->get();

        foreach ($masterUnitPrices as $masterUnitPrice) {
            $unitPrice = UnitPrice::create([
                'product_id' => $targetProduct->id,
                'erp_size_option_id' => $masterUnitPrice->erp_size_option_id,
                'erp_paper_option_id' => $masterUnitPrice->erp_paper_option_id,
                'is_active' => $masterUnitPrice->is_active,
            ]);

            // Clone UnitPriceItem
            $masterItems = UnitPriceItem::where(
                'unit_price_id',
                $masterUnitPrice->id
            )->get();

            foreach ($masterItems as $masterItem) {
                UnitPriceItem::create([
                    'unit_price_id' => $unitPrice->id,
                    'quantity_min' => $masterItem->quantity_min,
                    'price_value' => $masterItem->price_value,
                    'raw_cost' => $masterItem->raw_cost,
                    'attributes' => $masterItem->attributes,
                    'is_active' => $masterItem->is_active,
                ]);
            }
        }
    }
}
