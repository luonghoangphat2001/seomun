<?php

namespace Database\Seeders;

use App\Enums\ErpOptionGroupCode;
use App\Enums\ErpOptionGroupType;
use App\Enums\PaperCategory;
use App\Models\ErpOption;
use App\Models\ErpOptionGroup;
use App\Models\Paper;
use App\Services\Admin\AdminPaperService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class StickyNoteSeeder extends Seeder
{

    public function __construct(
        protected AdminPaperService $paperService,
    ) {}
    public function run(): void
    {
        $color = "No";
        $erpOptionGroup = ErpOptionGroup::where('code', ErpOptionGroupCode::PAPER->value)->first();
        if ($erpOptionGroup) {
            ErpOption::where('erp_option_group_id', $erpOptionGroup->id)->forceDelete();
        }
        Schema::disableForeignKeyConstraints();
        Paper::truncate();
        Schema::enableForeignKeyConstraints();

        $sampleData = [
            [
                'paper_type' => 'imitation',
                'color' => $color,
                'basis_weight_gsm' => 80,
                'thickness_mm' => 0.2,
                'unit_weight_g' => 11.3,
                'pages_count' => 50,
                'double_sided_volume' => null,
                'book_spine_mm' => 10,
                'total_weight_g' => 565,
                'total_weight_kg' => 0.565,
            ]
        ];

        $erpOptionGroupIds = ErpOptionGroup::whereIn('code', [
            ErpOptionGroupCode::PAPER_TYPE->value,
            ErpOptionGroupCode::PAPER_COLOR->value,
            ErpOptionGroupCode::PAPER_WEIGHT->value,
        ])->pluck('id', 'code');

        $uniqueCombinations = array_unique(array_map('json_encode', array_map(fn($data) => [
            $data['paper_type'],
            $data['color'],
            $data['basis_weight_gsm'],
        ], $sampleData)));

        $uniqueCombinations = array_map('json_decode', $uniqueCombinations);
        $erpOptionIds = [];

        $paperGroupId = ErpOptionGroup::firstOrCreate([
            'code' => ErpOptionGroupCode::PAPER_TYPE->value,
        ], [
            'label' => 'Paper',
            'type' => ErpOptionGroupType::PAPER,
            'display_type' => 'select',
            'is_required' => true,
            'sort_order' => 1,
        ])->id;

        $colorGroupId = $erpOptionGroupIds[ErpOptionGroupCode::PAPER_COLOR->value];
        $weightGroupId = $erpOptionGroupIds[ErpOptionGroupCode::PAPER_WEIGHT->value];

        foreach ($uniqueCombinations as [$paperType, $color, $weight]) {
            $paperOption = ErpOption::firstOrCreate([
                'code' => 'paper_type_' . $paperType
            ], [
                'erp_option_group_id' => $paperGroupId,
                'label' => $paperType,
                'value' => $paperType,
            ]);

            $colorOption = ErpOption::firstOrCreate([
                'code' => 'paper_color_' . $color,
            ], [
                'erp_option_group_id' => $colorGroupId,
                'code' => 'paper_color_' . $color,
                'label' => $color,
                'value' => $color,
            ]);

            $weightOption = ErpOption::firstOrCreate([
                'code' => 'paper_weight_' . $weight,
            ], [
                'erp_option_group_id' => $weightGroupId,

                'value' => $weight,
                'label' => $weight,
            ]);

            $erpOptionIds[$paperGroupId . '_' . $paperType] = $paperOption->id;
            $erpOptionIds[$colorGroupId . '_' . $color] = $colorOption->id;
            $erpOptionIds[$weightGroupId . '_' . $weight] = $weightOption->id;
        }

        foreach ($sampleData as $data) {
            $paper = Paper::firstOrCreate([
                'name' => $data['paper_type'] . ' ' . $data['color'] . ' ' . $data['basis_weight_gsm'] . 'g',
            ],[
                'category' => PaperCategory::GENERAL,
                'manufacturer' => '',
                'name' => $data['paper_type'] . ' ' . $data['color'] . ' ' . $data['basis_weight_gsm'] . 'g',
                'specification' => [
                    'thickness_mm' => $data['thickness_mm'],
                    'unit_weight_g' => $data['unit_weight_g'],
                ],
                'pattern' => 'None',
                'paper_type_option_value_id' => $erpOptionIds[$paperGroupId . '_' . $data['paper_type']] ?? null,
                'paper_color_option_value_id' => $erpOptionIds[$colorGroupId . '_' . $data['color']] ?? null,
                'paper_weight_option_value_id' => $erpOptionIds[$weightGroupId . '_' . $data['basis_weight_gsm']] ?? null,
                'is_active' => true,
            ]);

            $this->paperService->syncErpOptions($paper);
        }
    }
}
