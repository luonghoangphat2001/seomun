<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EditorSize;
use App\Models\EditorSizeType;

class EditorSizeSeeder extends Seeder
{
    public function run(): void
    {
        $type = EditorSizeType::first();

        EditorSize::insert([
            [
                'name' => '정비율',
                'width' => 1200,
                'height' => 1200,
                'unit' => 'mm',
                'editor_size_type_id' => $type->id,
            ],
            [
                'name' => '가로형',
                'width' => 500,
                'height' => 90,
                'unit' => 'mm',
                'editor_size_type_id' => $type->id,
            ],
            [
                'name' => '가로형 3:1',
                'width' => 1800,
                'height' => 600,
                'unit' => 'mm',
                'editor_size_type_id' => $type->id,
            ],
            [
                'name' => '가로 포스터형',
                'width' => 1680,
                'height' => 1188,
                'unit' => 'mm',
                'editor_size_type_id' => $type->id,
            ],
        ]);
    }
}