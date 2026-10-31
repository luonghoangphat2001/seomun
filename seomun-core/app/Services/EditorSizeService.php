<?php

namespace App\Services;

use App\Models\EditorSize;
use Illuminate\Http\Request;

class EditorSizeService
{
    public function getList(Request $request)
    {
        $query = EditorSize::with('sizeType')
            ->where('is_active', true)
            ->orderBy('created_at', 'desc');

        if ($request->filled('type_id')) {
            $query->where('editor_size_type_id', $request->input('type_id'));
        }

        if ($request->filled('product_id')) {
            $query->whereHas('templates', function ($q) use ($request) {
                $q->where('product_id', $request->input('product_id'))
                    ->where('is_active', true);
            });
        }

        if ($request->filled('keyword')) {
            $keyword = $request->input('keyword');

            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%");
            });
        }

        return $query->get()->map(fn($size) => [
            'id' => $size->id,
            'type_id' => $size->editor_size_type_id,
            'type_name' => $size->sizeType?->name,
            'name' => $size->name,
            'width' => $size->width,
            'height' => $size->height,
            'unit' => $size->unit,
            'thumbnail_url' => $size->thumbnail_url,
        ]);
    }
}
