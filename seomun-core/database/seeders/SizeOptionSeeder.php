<?php

namespace Database\Seeders;

use App\Enums\ErpOptionGroupCode;
use App\Enums\ErpOptionGroupType;
use App\Models\ErpOption;
use App\Models\ErpOptionGroup;
use App\Models\SizeOption;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class SizeOptionSeeder extends Seeder
{
    public function run()
    {
        $erpOptionGroup = ErpOptionGroup::where('code', ErpOptionGroupCode::SIZE->value)->first();
        if ($erpOptionGroup) {
            ErpOption::where('erp_option_group_id', $erpOptionGroup->id)->forceDelete();
        }
        Schema::disableForeignKeyConstraints();
        SizeOption::truncate();
        Schema::enableForeignKeyConstraints();

        $sizes = [
            ['name' => '90x50', 'cutting_width' => 90, 'cutting_height' => 50, 'working_width' => 92, 'working_height' => 52],
            ['name' => '86x52', 'cutting_width' => 86, 'cutting_height' => 52, 'working_width' => 88, 'working_height' => 54],
        ];

        foreach ($sizes as $size) {
            $data = SizeOption::create($size);
            $this->syncErpOptions($data, $erpOptionGroup);
        }
    }

    public function syncErpOptions(SizeOption $size, $erpOptionGroup): void
    {
        ErpOption::create([
            'erp_option_group_id' => $erpOptionGroup->id,
            'size_option_id' => $size->id,
            'label' => $size->name,
            'code' => (string) $size->cutting_width . '_' . $size->cutting_height,
            'value' => (string) $size->id,
            'is_active' => true,
        ]);
    }
}
