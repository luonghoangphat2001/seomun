<?php

namespace App\Http\Controllers\Api;

use App\Enums\TemplateType;
use App\Http\Resources\TemplatePublicResource;
use App\Http\Resources\WebEditorResource;
use App\Models\Product;
use App\Models\Template;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TemplateController extends BaseController
{
    /**
     * Get active templates for a given product (by slug).
     * Used by user web to show available templates for a product.
     */
    public function byProduct(Request $request, string $slug): JsonResponse
    {
        try {
            $product = Product::query()->where('slug', $slug)->first();
            if (! $product) {
                return response()->json([
                    'success' => false,
                    'message' => '상품을 찾을 수 없습니다.',
                ], 404);
            }

            $templates = Template::query()
                ->with('webEditor', 'sizeOption')
                ->active()
                ->whereHas('webEditor.products', function ($query) use ($product) {
                    $query->whereKey($product->id);
                })
                ->when($request->filled('type'), function ($query) use ($request) {
                    $type = $request->string('type');
                    $query->where('type', $type);
                })
                ->orderBy('id')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'templates' => TemplatePublicResource::collection($templates),
                ],
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get web editors associated with a product.
     */
    public function webEditorsByProduct(string $slug): JsonResponse
    {
        try {
            $product = Product::query()->where('slug', $slug)->first();
            if (! $product) {
                return response()->json([
                    'success' => false,
                    'message' => '상품을 찾을 수 없습니다.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'web_editors' => \App\Http\Resources\WebEditorResource::collection($product->webEditors),
                ],
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get a single active template by ID for rendering Simple Text Editing / Web Editor.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $template = Template::query()
                ->with(['webEditor', 'sizeOption'])
                ->active()
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'template' => new TemplatePublicResource($template),
                ],
            ], 200);
        } catch (ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => '템플릿을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function searchFilters(Request $request, string $slug): JsonResponse
    {
        try {
            $product = Product::query()
                ->where('slug', $slug)
                ->firstOrFail();


            if (! $product->web_editor_id) {
                $availableTypes = [];
            } else {
                $availableTypes = $product->webEditor
                    ->templates()
                    ->distinct()
                    ->pluck('type')
                    ->filter()
                    ->map(fn(TemplateType $type) => $type->value)
                    ->all();
            }
            $typeOptions = collect(TemplateType::options())
                ->filter(fn($option) => in_array($option['value'], $availableTypes, true))
                ->values()
                ->all();

            return response()->json([
                'success' => true,
                'data' => [
                    'filters' => [
                        'type_options' => $typeOptions,
                    ],
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }
}
