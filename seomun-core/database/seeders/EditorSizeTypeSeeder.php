<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EditorSizeType;

class EditorSizeTypeSeeder extends Seeder
{
    public function run(): void
    {
        // Level 1
        $type2Fold = EditorSizeType::create([
            'name' => '2단 리플렛',
            'parent_id' => null,
        ]);

        $type3Fold = EditorSizeType::create([
            'name' => '3단 리플렛',
            'parent_id' => null,
        ]);

        $type4Fold = EditorSizeType::create([
            'name' => '4단 리플렛',
            'parent_id' => null,
        ]);

        // Level 2
        EditorSizeType::insert([
            [
                'name' => '3단 300 x 213mm',
                'parent_id' => $type3Fold->id,
            ],
            [
                'name' => '3단 N접지',
                'parent_id' => $type3Fold->id,
            ],
            [
                'name' => '가로형 3단',
                'parent_id' => $type3Fold->id,
            ],
        ]);
    }
}