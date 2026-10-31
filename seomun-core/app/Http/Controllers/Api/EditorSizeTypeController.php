<?php

namespace App\Http\Controllers\Api;

use App\Models\EditorSizeType;
use Illuminate\Http\JsonResponse;

class EditorSizeTypeController extends BaseController
{
    public function index(): JsonResponse
    {
        $types = EditorSizeType::with(['children' => function ($query) {
            $query->where('is_active', true)->orderBy('sort_order');
        }])
            ->where('is_active', true)
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'editor_size_types' => $types->map(fn ($type) => [
                    'id' => $type->id,
                    'name' => $type->name,
                    'children' => $type->children->map(fn ($child) => [
                        'id' => $child->id,
                        'name' => $child->name,
                    ]),
                ]),
            ],
        ]);
    }
}
