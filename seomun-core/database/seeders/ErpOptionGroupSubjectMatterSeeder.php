<?php

namespace Database\Seeders;

use App\Enums\ErpOptionGroupCode;
use App\Enums\ErpOptionGroupType;
use App\Models\ErpOption;
use App\Models\ErpOptionGroup;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ErpOptionGroupSubjectMatterSeeder extends Seeder
{
    public function run(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
        } elseif ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys=OFF');
        }

        $subjectMatterGroup = ErpOptionGroup::where('code', ErpOptionGroupCode::SUBJECT_MATTER->value)->first();

        if ($subjectMatterGroup) {
            DB::table('erp_options')->where('erp_option_group_id', $subjectMatterGroup->id)->delete();
            $subjectMatterGroup->delete();
        }

        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        } elseif ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys=ON');
        }

        $group = ErpOptionGroup::create([
            'code' => ErpOptionGroupCode::SUBJECT_MATTER,
            'label' => '소재',
            'type' => ErpOptionGroupType::DEFAULT,
            'display_type' => 'select',
            'is_required' => false,
            'sort_order' => 10,
        ]);

        $options = [
            ['code' => 'banner_150_denier', 'label' => 'Banner 150 denier', 'value' => 'banner_150_denier', 'sort_order' => 1, 'is_active' => true],
            ['code' => 'photocheon_450_denier', 'label' => 'Photocheon 450 denier', 'value' => 'photocheon_450_denier', 'sort_order' => 2, 'is_active' => true],
            ['code' => '450_denier_tent_fabric', 'label' => '450 denier tent fabric', 'value' => '450_denier_tent_fabric', 'sort_order' => 3, 'is_active' => true],
            ['code' => 'pvc_white', 'label' => 'PVC White', 'value' => 'pvc_white', 'sort_order' => 4, 'is_active' => true],
            ['code' => 'pvc_gray', 'label' => 'PVC Gray', 'value' => 'pvc_gray', 'sort_order' => 5, 'is_active' => true],
            ['code' => 'synthetic_paper_non_adhesive', 'label' => 'Synthetic paper (non-adhesive)', 'value' => 'synthetic_paper_non_adhesive', 'sort_order' => 6, 'is_active' => true],
            ['code' => 'photographic_paper', 'label' => 'photographic paper', 'value' => 'photographic_paper', 'sort_order' => 7, 'is_active' => true],
            ['code' => 'pet_210u', 'label' => 'PET 210u', 'value' => 'pet_210u', 'sort_order' => 8, 'is_active' => true],
            ['code' => 'mesh_1000_denier', 'label' => 'Mesh 1000 denier', 'value' => 'mesh_1000_denier', 'sort_order' => 9, 'is_active' => true],
            ['code' => 'white_5t_foam_board', 'label' => 'White 5T Foam Board', 'value' => 'white_5t_foam_board', 'sort_order' => 10, 'is_active' => true],
            ['code' => 'white_foamex_1t', 'label' => 'White Foamex 1T', 'value' => 'white_foamex_1t', 'sort_order' => 11, 'is_active' => true],
            ['code' => 'white_foamex_2t', 'label' => 'White Foamex 2T', 'value' => 'white_foamex_2t', 'sort_order' => 12, 'is_active' => true],
            ['code' => 'white_foamex_3t', 'label' => 'White Foamex 3T', 'value' => 'white_foamex_3t', 'sort_order' => 13, 'is_active' => true],
            ['code' => 'white_foamex_5t', 'label' => 'White Foamex 5T', 'value' => 'white_foamex_5t', 'sort_order' => 14, 'is_active' => true],
        ];

        foreach ($options as $optionData) {
            $group->erpOptions()->create($optionData);
        }
    }
}