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
        $this->translateJsonColumn('orders', 'selected_options');
        $this->translateJsonColumn('order_items', 'configuration');
    }

    public function down(): void
    {
        // Historical snapshots may already have Korean labels, so reverting
        // every matching label to English would corrupt legitimate data.
    }

    public function translateOptionGroupNames(array $data): array
    {
        $code = $data['code'] ?? null;
        if (is_string($code) && isset(self::LABELS[$code]) && isset($data['name'])) {
            $data['name'] = self::LABELS[$code];
        }

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = $this->translateOptionGroupNames($value);
            }
        }

        return $data;
    }

    private function translateJsonColumn(string $table, string $column): void
    {
        DB::table($table)
            ->select(['id', $column])
            ->whereNotNull($column)
            ->chunkById(200, function ($rows) use ($table, $column): void {
                foreach ($rows as $row) {
                    $rawValue = $row->{$column};
                    $data = is_string($rawValue)
                        ? json_decode($rawValue, true, 512, JSON_THROW_ON_ERROR)
                        : $rawValue;

                    if (! is_array($data)) {
                        continue;
                    }

                    $translated = $this->translateOptionGroupNames($data);
                    if ($translated === $data) {
                        continue;
                    }

                    DB::table($table)
                        ->where('id', $row->id)
                        ->update([
                            $column => json_encode(
                                $translated,
                                JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
                            ),
                        ]);
                }
            });
    }
};
