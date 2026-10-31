<?php

namespace Database\Seeders;

use App\Enums\ErpOptionDependencyType;
use App\Enums\ErpOptionGroupCode;
use App\Enums\ErpOptionGroupType;
use App\Models\ErpOption;
use App\Models\ErpOptionDependency;
use App\Models\ErpOptionGroup;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ErpOptionGroupSeeder extends Seeder
{
    private array $groupIds = [];

    public function run(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
        } elseif ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys=OFF');
        }

        DB::table('erp_options')->truncate();
        DB::table('erp_option_groups')->truncate();
        DB::table('erp_option_dependencies')->truncate();

        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        } elseif ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys=ON');
        }

        $this->seedGroups();
        $this->seedDependencies();

        $this->command->info('ERP option groups seeded successfully.');
        $this->command->info('Total groups: ' . count($this->groupIds));
    }

    private function seedGroups(): void
    {
        $groups = $this->getGroupTemplates();

        foreach ($groups as $groupData) {
            $group = ErpOptionGroup::create([
                'code' => $groupData['code']->value,
                'label' => $groupData['label'],
                'type' => $groupData['type'],
                'display_type' => $groupData['display_type'],
                'is_required' => $groupData['is_required'],
                'sort_order' => $groupData['sort_order'],
            ]);

            $this->groupIds[$groupData['code']->value] = $group->id;

            foreach ($groupData['options'] as $optionData) {
                ErpOption::create(array_merge($optionData, [
                    'erp_option_group_id' => $group->id,
                ]));
            }
        }
    }

    private function seedDependencies(): void
    {
        $dependencies = $this->getDependencyTemplates();

        foreach ($dependencies as $dep) {
            ErpOptionDependency::create([
                'trigger_option_group_id' => $dep['trigger_option_group_id'],
                'trigger_option_id' => $dep['trigger_option_id'],
                'affected_option_group_id' => $dep['affected_option_group_id'],
                'dependency_type' => $dep['dependency_type'],
                'allowed_options' => $dep['allowed_options'],
            ]);
        }
    }

    private function getGroupTemplates(): array
    {
        return [
            [
                'code' => ErpOptionGroupCode::SIZE,
                'label' => '사이즈',
                'type' => ErpOptionGroupType::STANDARD,
                'display_type' => 'select',
                'is_required' => true,
                'sort_order' => 1,
                'options' => [
                    ['code' => 'size_90x50', 'label' => '90x50mm (일반)', 'value' => '90x50', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'size_50x90', 'label' => '50x90mm (세로)', 'value' => '50x90', 'additional_price' => 0, 'sort_order' => 2, 'is_active' => true],
                    ['code' => 'size_86x54', 'label' => '86x54mm (신용카드)', 'value' => '86x54', 'additional_price' => 500, 'sort_order' => 3, 'is_active' => true],
                    ['code' => 'size_54x86', 'label' => '54x86mm (신용카드 세로)', 'value' => '54x86', 'additional_price' => 500, 'sort_order' => 4, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::PAPER_TYPE,
                'label' => '용지 종류',
                'type' => ErpOptionGroupType::PAPER,
                'display_type' => 'select',
                'is_required' => true,
                'sort_order' => 2,
                'options' => [
                    ['code' => 'paper_bannuvo', 'label' => '반누보 (홀로화이트)', 'value' => 'bannuvo', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'paper_white', 'label' => '백지 (화이트)', 'value' => 'white', 'additional_price' => -200, 'sort_order' => 2, 'is_active' => true],
                    ['code' => 'paper_imitation', 'label' => '모조지 (이밋)', 'value' => 'imitation', 'additional_price' => -300, 'sort_order' => 3, 'is_active' => true],
                    ['code' => 'paper_premium', 'label' => '고급지', 'value' => 'premium', 'additional_price' => 500, 'sort_order' => 4, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::PAPER_COLOR,
                'label' => '용지 색상',
                'type' => ErpOptionGroupType::PAPER,
                'display_type' => 'select',
                'is_required' => true,
                'sort_order' => 3,
                'options' => [
                    ['code' => 'paper_color_natural', 'label' => '내츄럴', 'value' => 'natural', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'paper_color_ultra_white', 'label' => '울트라화이트', 'value' => 'ultra_white', 'additional_price' => 0, 'sort_order' => 2, 'is_active' => true],
                    ['code' => 'paper_color_white', 'label' => '화이트', 'value' => 'white', 'additional_price' => 0, 'sort_order' => 3, 'is_active' => true],
                    ['code' => 'paper_color_ivory', 'label' => '미색 (아이보리)', 'value' => 'ivory', 'additional_price' => 0, 'sort_order' => 4, 'is_active' => true],
                    ['code' => 'paper_color_cream', 'label' => '크림', 'value' => 'cream', 'additional_price' => 0, 'sort_order' => 5, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::PAPER_WEIGHT,
                'label' => '용지 평량',
                'type' => ErpOptionGroupType::PAPER,
                'display_type' => 'select',
                'is_required' => true,
                'sort_order' => 4,
                'options' => [
                    ['code' => 'paper_weight_210', 'label' => '210g/m²', 'value' => '210', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'paper_weight_240', 'label' => '240g/m²', 'value' => '240', 'additional_price' => 200, 'sort_order' => 2, 'is_active' => true],
                    ['code' => 'paper_weight_300', 'label' => '300g/m²', 'value' => '300', 'additional_price' => 400, 'sort_order' => 3, 'is_active' => true],
                    ['code' => 'paper_weight_350', 'label' => '350g/m²', 'value' => '350', 'additional_price' => 600, 'sort_order' => 4, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::PRINTED_SIDE,
                'label' => '인쇄 면',
                'type' => ErpOptionGroupType::PRINTED_COLOR,
                'display_type' => 'select',
                'is_required' => true,
                'sort_order' => 5,
                'options' => [
                    ['code' => 'printed_side_single', 'label' => '단면', 'value' => 'single', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'printed_side_double', 'label' => '양면', 'value' => 'double', 'additional_price' => 500, 'sort_order' => 2, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::PRINTED_COLOR_FSIDE,
                'label' => '전면 인쇄 색상',
                'type' => ErpOptionGroupType::PRINTED_COLOR,
                'display_type' => 'select',
                'is_required' => true,
                'sort_order' => 6,
                'options' => [
                    ['code' => 'printed_color_4c', 'label' => '칼라 4도 (CMYK)', 'value' => '4c', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'printed_color_1c', 'label' => '단색 (1도)', 'value' => '1c', 'additional_price' => -200, 'sort_order' => 2, 'is_active' => true],
                    ['code' => 'printed_color_gold', 'label' => '별색 (금)', 'value' => 'gold', 'additional_price' => 800, 'sort_order' => 3, 'is_active' => true],
                    ['code' => 'printed_color_silver', 'label' => '별색 (은)', 'value' => 'silver', 'additional_price' => 800, 'sort_order' => 4, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::PRINTED_COLOR_BSIDE,
                'label' => '후면 인쇄 색상',
                'type' => ErpOptionGroupType::PRINTED_COLOR,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 7,
                'options' => [
                    ['code' => 'printed_color_none', 'label' => '해당없음', 'value' => 'none', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'printed_color_4c', 'label' => '칼라 4도 (CMYK)', 'value' => '4c', 'additional_price' => 0, 'sort_order' => 2, 'is_active' => true],
                    ['code' => 'printed_color_1c', 'label' => '단색 (1도)', 'value' => '1c', 'additional_price' => -200, 'sort_order' => 3, 'is_active' => true],
                    ['code' => 'printed_color_gold', 'label' => '별색 (금)', 'value' => 'gold', 'additional_price' => 800, 'sort_order' => 4, 'is_active' => true],
                    ['code' => 'printed_color_silver', 'label' => '별색 (은)', 'value' => 'silver', 'additional_price' => 800, 'sort_order' => 5, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::COATED,
                'label' => '코팅',
                'type' => ErpOptionGroupType::POST_PROCESSING,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 8,
                'options' => [
                    ['code' => 'coated_none', 'label' => '해당없음', 'value' => 'none', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'coated_matte', 'label' => '무광코팅', 'value' => 'matte', 'additional_price' => 300, 'sort_order' => 2, 'is_active' => true],
                    ['code' => 'coated_glossy', 'label' => '유광코팅', 'value' => 'glossy', 'additional_price' => 300, 'sort_order' => 3, 'is_active' => true],
                    ['code' => 'coated_soft_touch', 'label' => '순백 코팅', 'value' => 'soft_touch', 'additional_price' => 500, 'sort_order' => 4, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::OSHI,
                'label' => '오시',
                'type' => ErpOptionGroupType::POST_PROCESSING,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 9,
                'options' => [
                    ['code' => 'oshi_none', 'label' => '해당없음', 'value' => 'none', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'oshi_1', 'label' => '1줄 (중앙)', 'value' => '1', 'additional_price' => 200, 'sort_order' => 2, 'is_active' => true],
                    ['code' => 'oshi_2', 'label' => '2줄', 'value' => '2', 'additional_price' => 400, 'sort_order' => 3, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::OSHI_DIRECTION,
                'label' => '오시 방향',
                'type' => ErpOptionGroupType::POST_PROCESSING,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 10,
                'options' => [
                    ['code' => 'oshi_dir_horizontal', 'label' => '가로 오시', 'value' => 'horizontal', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'oshi_dir_vertical', 'label' => '세로 오시', 'value' => 'vertical', 'additional_price' => 0, 'sort_order' => 2, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::ROUNDING,
                'label' => '라운딩',
                'type' => ErpOptionGroupType::POST_PROCESSING,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 11,
                'options' => [
                    ['code' => 'rounding_none', 'label' => '해당없음', 'value' => 'none', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'rounding_4', 'label' => '4모서리', 'value' => '4', 'additional_price' => 400, 'sort_order' => 2, 'is_active' => true],
                    ['code' => 'rounding_2', 'label' => '2모서리', 'value' => '2', 'additional_price' => 300, 'sort_order' => 3, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::ROUNDING_POSITION,
                'label' => '라운딩 위치',
                'type' => ErpOptionGroupType::POST_PROCESSING,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 12,
                'options' => [
                    ['code' => 'rounding_pos_top', 'label' => '상단 좌우', 'value' => 'top', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'rounding_pos_bottom', 'label' => '하단 좌우', 'value' => 'bottom', 'additional_price' => 0, 'sort_order' => 2, 'is_active' => true],
                    ['code' => 'rounding_pos_left', 'label' => '좌측 상하', 'value' => 'left', 'additional_price' => 0, 'sort_order' => 3, 'is_active' => true],
                    ['code' => 'rounding_pos_right', 'label' => '우측 상하', 'value' => 'right', 'additional_price' => 0, 'sort_order' => 4, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::BOX_FRONT,
                'label' => '전면 박',
                'type' => ErpOptionGroupType::POST_PROCESSING,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 13,
                'options' => [
                    ['code' => 'box_front_none', 'label' => '해당없음', 'value' => 'none', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'box_front_gold', 'label' => '금박', 'value' => 'gold', 'additional_price' => 800, 'sort_order' => 2, 'is_active' => true],
                    ['code' => 'box_front_silver', 'label' => '은박', 'value' => 'silver', 'additional_price' => 800, 'sort_order' => 3, 'is_active' => true],
                    ['code' => 'box_front_hologram', 'label' => '홀로그램', 'value' => 'hologram', 'additional_price' => 1200, 'sort_order' => 4, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::BOX_FRONT_SIZE,
                'label' => '전면 박 사이즈',
                'type' => ErpOptionGroupType::POST_PROCESSING,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 14,
                'options' => [
                    ['code' => 'box_front_size_small', 'label' => '소형 (30x30)', 'value' => 'small', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'box_front_size_medium', 'label' => '중형 (50x50)', 'value' => 'medium', 'additional_price' => 0, 'sort_order' => 2, 'is_active' => true],
                    ['code' => 'box_front_size_large', 'label' => '대형 (80x80)', 'value' => 'large', 'additional_price' => 0, 'sort_order' => 3, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::BOX_BACK,
                'label' => '후면 박',
                'type' => ErpOptionGroupType::POST_PROCESSING,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 15,
                'options' => [
                    ['code' => 'box_back_none', 'label' => '해당없음', 'value' => 'none', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'box_back_gold', 'label' => '금박', 'value' => 'gold', 'additional_price' => 800, 'sort_order' => 2, 'is_active' => true],
                    ['code' => 'box_back_silver', 'label' => '은박', 'value' => 'silver', 'additional_price' => 800, 'sort_order' => 3, 'is_active' => true],
                    ['code' => 'box_back_hologram', 'label' => '홀로그램', 'value' => 'hologram', 'additional_price' => 1200, 'sort_order' => 4, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::BOX_BACK_SIZE,
                'label' => '후면 박 사이즈',
                'type' => ErpOptionGroupType::POST_PROCESSING,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 16,
                'options' => [
                    ['code' => 'box_back_size_small', 'label' => '소형 (30x30)', 'value' => 'small', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'box_back_size_medium', 'label' => '중형 (50x50)', 'value' => 'medium', 'additional_price' => 0, 'sort_order' => 2, 'is_active' => true],
                    ['code' => 'box_back_size_large', 'label' => '대형 (80x80)', 'value' => 'large', 'additional_price' => 0, 'sort_order' => 3, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::EMBOSSING,
                'label' => '형압',
                'type' => ErpOptionGroupType::POST_PROCESSING,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 17,
                'options' => [
                    ['code' => 'embossing_none', 'label' => '해당없음', 'value' => 'none', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'embossing_raised', 'label' => '형압 (올림)', 'value' => 'raised', 'additional_price' => 500, 'sort_order' => 2, 'is_active' => true],
                    ['code' => 'embossing_deboss', 'label' => '압인 (내림)', 'value' => 'deboss', 'additional_price' => 500, 'sort_order' => 3, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::EPOXY,
                'label' => '에폭시',
                'type' => ErpOptionGroupType::POST_PROCESSING,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 18,
                'options' => [
                    ['code' => 'epoxy_none', 'label' => '해당없음', 'value' => 'none', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'epoxy_clear', 'label' => '에폭시 (투명)', 'value' => 'clear', 'additional_price' => 1000, 'sort_order' => 2, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::TRANSPARENT_EMBOSSING,
                'label' => '투명엠보싱',
                'type' => ErpOptionGroupType::POST_PROCESSING,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 19,
                'options' => [
                    ['code' => 'uv_clear_none', 'label' => '해당없음', 'value' => 'none', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'uv_clear_partial', 'label' => '부분 UV', 'value' => 'partial', 'additional_price' => 600, 'sort_order' => 2, 'is_active' => true],
                    ['code' => 'uv_clear_full', 'label' => '전면 UV', 'value' => 'full', 'additional_price' => 800, 'sort_order' => 3, 'is_active' => true],
                ],
            ],
            [
                'code' => ErpOptionGroupCode::EMBOSSING_BOX,
                'label' => '박 형압',
                'type' => ErpOptionGroupType::POST_PROCESSING,
                'display_type' => 'select',
                'is_required' => false,
                'sort_order' => 20,
                'options' => [
                    ['code' => 'embossing_box_none', 'label' => '해당없음', 'value' => 'none', 'additional_price' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['code' => 'embossing_box_gold', 'label' => '금박 형압', 'value' => 'gold', 'additional_price' => 1200, 'sort_order' => 2, 'is_active' => true],
                    ['code' => 'embossing_box_silver', 'label' => '은박 형압', 'value' => 'silver', 'additional_price' => 1200, 'sort_order' => 3, 'is_active' => true],
                ],
            ],
        ];
    }

    private function getDependencyTemplates(): array
    {
        $dependencies = [];

        $paperNameGroupId = $this->groupIds[ErpOptionGroupCode::PAPER_TYPE->value] ?? null;
        $paperColorGroupId = $this->groupIds[ErpOptionGroupCode::PAPER_COLOR->value] ?? null;
        $paperWeightGroupId = $this->groupIds[ErpOptionGroupCode::PAPER_WEIGHT->value] ?? null;
        $printedSideGroupId = $this->groupIds[ErpOptionGroupCode::PRINTED_SIDE->value] ?? null;
        $printedColorFsideGroupId = $this->groupIds[ErpOptionGroupCode::PRINTED_COLOR_FSIDE->value] ?? null;
        $printedColorBsideGroupId = $this->groupIds[ErpOptionGroupCode::PRINTED_COLOR_BSIDE->value] ?? null;
        $oshiGroupId = $this->groupIds[ErpOptionGroupCode::OSHI->value] ?? null;
        $oshiDirectionGroupId = $this->groupIds[ErpOptionGroupCode::OSHI_DIRECTION->value] ?? null;
        $roundingGroupId = $this->groupIds[ErpOptionGroupCode::ROUNDING->value] ?? null;
        $roundingPositionGroupId = $this->groupIds[ErpOptionGroupCode::ROUNDING_POSITION->value] ?? null;
        $boxFrontGroupId = $this->groupIds[ErpOptionGroupCode::BOX_FRONT->value] ?? null;
        $boxFrontSizeGroupId = $this->groupIds[ErpOptionGroupCode::BOX_FRONT_SIZE->value] ?? null;
        $boxBackGroupId = $this->groupIds[ErpOptionGroupCode::BOX_BACK->value] ?? null;
        $boxBackSizeGroupId = $this->groupIds[ErpOptionGroupCode::BOX_BACK_SIZE->value] ?? null;

        $paperNameFirstOption = ErpOption::where('erp_option_group_id', $paperNameGroupId)->first()?->id;
        $paperColorFirstOption = ErpOption::where('erp_option_group_id', $paperColorGroupId)->first()?->id;
        $paperWeightFirstOption = ErpOption::where('erp_option_group_id', $paperWeightGroupId)->first()?->id;
        $printedSideFirstOption = ErpOption::where('erp_option_group_id', $printedSideGroupId)->first()?->id;
        $printedSideSecondOption = ErpOption::where('erp_option_group_id', $printedSideGroupId)->latest()->first()?->id;
        $printedColorFsideFirstOption = ErpOption::where('erp_option_group_id', $printedColorFsideGroupId)->first()?->id;
        $printedColorBsideFirstOption = ErpOption::where('erp_option_group_id', $printedColorBsideGroupId)->first()?->id;
        $oshiFirstOption = ErpOption::where('erp_option_group_id', $oshiGroupId)->first()?->id;
        $oshiDirectionFirstOption = ErpOption::where('erp_option_group_id', $oshiDirectionGroupId)->first()?->id;
        $roundingFirstOption = ErpOption::where('erp_option_group_id', $roundingGroupId)->first()?->id;
        $roundingPositionFirstOption = ErpOption::where('erp_option_group_id', $roundingPositionGroupId)->first()?->id;
        $boxFrontFirstOption = ErpOption::where('erp_option_group_id', $boxFrontGroupId)->first()?->id;
        $boxFrontSizeFirstOption = ErpOption::where('erp_option_group_id', $boxFrontSizeGroupId)->first()?->id;
        $boxBackFirstOption = ErpOption::where('erp_option_group_id', $boxBackGroupId)->first()?->id;
        $boxBackSizeFirstOption = ErpOption::where('erp_option_group_id', $boxBackSizeGroupId)->first()?->id;

        if ($paperNameGroupId && $paperColorGroupId && $paperColorFirstOption) {
            $dependencies[] = [
                'trigger_option_group_id' => $paperNameGroupId,
                'trigger_option_id' => $paperNameFirstOption,
                'affected_option_group_id' => $paperColorGroupId,
                'dependency_type' => ErpOptionDependencyType::FILTER_OPTIONS,
                'allowed_options' => [$paperColorFirstOption],
            ];
        }

        if ($paperNameGroupId && $paperWeightGroupId && $paperWeightFirstOption) {
            $dependencies[] = [
                'trigger_option_group_id' => $paperNameGroupId,
                'trigger_option_id' => $paperNameFirstOption,
                'affected_option_group_id' => $paperWeightGroupId,
                'dependency_type' => ErpOptionDependencyType::FILTER_OPTIONS,
                'allowed_options' => [$paperWeightFirstOption],
            ];
        }

        if ($printedSideGroupId && $printedColorBsideGroupId && $printedColorBsideFirstOption) {
            $dependencies[] = [
                'trigger_option_group_id' => $printedSideGroupId,
                'trigger_option_id' => $printedSideSecondOption,
                'affected_option_group_id' => $printedColorBsideGroupId,
                'dependency_type' => ErpOptionDependencyType::HIDE_GROUP,
                'allowed_options' => null,
            ];
        }

        if ($oshiGroupId && $oshiDirectionGroupId && $oshiDirectionFirstOption) {
            $dependencies[] = [
                'trigger_option_group_id' => $oshiGroupId,
                'trigger_option_id' => $oshiFirstOption,
                'affected_option_group_id' => $oshiDirectionGroupId,
                'dependency_type' => ErpOptionDependencyType::FILTER_OPTIONS,
                'allowed_options' => [$oshiDirectionFirstOption],
            ];
        }

        if ($roundingGroupId && $roundingPositionGroupId && $roundingPositionFirstOption) {
            $dependencies[] = [
                'trigger_option_group_id' => $roundingGroupId,
                'trigger_option_id' => $roundingFirstOption,
                'affected_option_group_id' => $roundingPositionGroupId,
                'dependency_type' => ErpOptionDependencyType::FILTER_OPTIONS,
                'allowed_options' => [$roundingPositionFirstOption],
            ];
        }

        if ($boxFrontGroupId && $boxFrontSizeGroupId && $boxFrontSizeFirstOption) {
            $dependencies[] = [
                'trigger_option_group_id' => $boxFrontGroupId,
                'trigger_option_id' => $boxFrontFirstOption,
                'affected_option_group_id' => $boxFrontSizeGroupId,
                'dependency_type' => ErpOptionDependencyType::FILTER_OPTIONS,
                'allowed_options' => [$boxFrontSizeFirstOption],
            ];
        }

        if ($boxBackGroupId && $boxBackSizeGroupId && $boxBackSizeFirstOption) {
            $dependencies[] = [
                'trigger_option_group_id' => $boxBackGroupId,
                'trigger_option_id' => $boxBackFirstOption,
                'affected_option_group_id' => $boxBackSizeGroupId,
                'dependency_type' => ErpOptionDependencyType::FILTER_OPTIONS,
                'allowed_options' => [$boxBackSizeFirstOption],
            ];
        }

        $epoxyGroupId = $this->groupIds[ErpOptionGroupCode::EPOXY->value] ?? null;
        $embossingGroupId = $this->groupIds[ErpOptionGroupCode::EMBOSSING->value] ?? null;
        $transparentEmbossingGroupId = $this->groupIds[ErpOptionGroupCode::TRANSPARENT_EMBOSSING->value] ?? null;
        $embossingBoxGroupId = $this->groupIds[ErpOptionGroupCode::EMBOSSING_BOX->value] ?? null;
        $epoxyOptionId = ErpOption::where('erp_option_group_id', $epoxyGroupId)->first()?->id;
        $embossingOptionId = ErpOption::where('erp_option_group_id', $embossingGroupId)->first()?->id;
        $transparentEmbossingOptionId = ErpOption::where('erp_option_group_id', $transparentEmbossingGroupId)->first()?->id;

        if ($epoxyGroupId && $embossingGroupId && $embossingOptionId) {
            $dependencies[] = [
                'trigger_option_group_id' => $epoxyGroupId,
                'trigger_option_id' => $epoxyOptionId,
                'affected_option_group_id' => $embossingGroupId,
                'dependency_type' => ErpOptionDependencyType::HIDE_GROUP,
                'allowed_options' => null,
            ];
        }

        if ($embossingGroupId && $transparentEmbossingGroupId && $transparentEmbossingOptionId) {
            $dependencies[] = [
                'trigger_option_group_id' => $embossingGroupId,
                'trigger_option_id' => $embossingOptionId,
                'affected_option_group_id' => $transparentEmbossingGroupId,
                'dependency_type' => ErpOptionDependencyType::HIDE_GROUP,
                'allowed_options' => null,
            ];
        }

        if ($embossingGroupId && $embossingBoxGroupId && $embossingOptionId) {
            $dependencies[] = [
                'trigger_option_group_id' => $embossingGroupId,
                'trigger_option_id' => $embossingOptionId,
                'affected_option_group_id' => $embossingBoxGroupId,
                'dependency_type' => ErpOptionDependencyType::FILTER_OPTIONS,
                'allowed_options' => ErpOption::where('erp_option_group_id', $embossingBoxGroupId)
                    ->where('value', '!=', 'none')
                    ->pluck('id')
                    ->toArray(),
            ];
        }

        return $dependencies;
    }
}