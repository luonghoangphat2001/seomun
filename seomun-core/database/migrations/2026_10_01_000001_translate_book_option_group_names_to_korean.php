<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const LABELS = [
        'cover_paper' => '표지 용지',
        'printed_cover_side' => '표지 인쇄 면',
        'printed_color_cover_fside' => '표지 앞면 인쇄 색상',
        'printed_color_cover_bside' => '표지 뒷면 인쇄 색상',
        'inner_paper' => '내지 용지',
        'printed_inner_side' => '내지 인쇄 면',
        'printed_color_inner_fside' => '내지 앞면 인쇄 색상',
        'printed_color_inner_bside' => '내지 뒷면 인쇄 색상',
    ];

    public function up(): void
    {
        foreach (self::LABELS as $code => $label) {
            DB::table('erp_option_groups')->where('code', $code)->update(['label' => $label]);
            DB::table('product_option_groups')->where('code', $code)->update(['name' => $label]);
        }
    }

    public function down(): void
    {
        foreach (array_keys(self::LABELS) as $code) {
            $englishLabel = str($code)->replace('_', ' ')->title()->toString();

            DB::table('erp_option_groups')->where('code', $code)->update(['label' => $englishLabel]);
            DB::table('product_option_groups')->where('code', $code)->update(['name' => $englishLabel]);
        }
    }
};
