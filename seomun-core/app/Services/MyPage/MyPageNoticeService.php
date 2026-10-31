<?php

namespace App\Services\MyPage;

use App\Enums\NoticeType;
use App\Http\Resources\NoticeResource;
use App\Models\Notice;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;

class MyPageNoticeService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * Get paginated Notices with filters
     */
    public function getNotices(?string $type = null, ?string $search = null, int $perPage = 15, ?string $excludeIds = null): array
    {
        try {
            $query = Notice::active()->published();

            // Filter by type
            if ($type && $type !== NoticeType::ALL->value) {
                $query->ofType($type);
            }

            // Exclude IDs
            if ($excludeIds) {
                $ids = array_filter(explode(',', $excludeIds), fn($id) => is_numeric($id));
                if (!empty($ids)) {
                    $query->whereNotIn('id', $ids);
                }
            }

            // Search by title or content
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('content', 'like', "%{$search}%");
                });
            }

            // Order: pinned first, then by published_at desc
            $notices = $query->orderBy('is_pinned', 'desc')
                ->orderBy('published_at', 'desc')
                ->paginate($perPage);

            return [
                'notices' => NoticeResource::collection($notices->items()),
                'pagination' => $this->paginationService->format($notices),
            ];
        } catch (\Exception $e) {
            Log::error('Get MyPage Notices failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Get one paginated notice page and group that page by category.
     *
     * @return array{notices: array<int, array<string, mixed>>, pagination: array<string, mixed>}
     */
    public function getNoticesByCategory(?string $category = null, ?string $search = null, int $perPage = 15, ?string $excludeIds = null): array
    {
        $query = Notice::active()->published();

        if ($category && $category !== NoticeType::ALL->value) {
            $query->ofType($category);
        }

        if ($excludeIds) {
            $ids = array_filter(explode(',', $excludeIds), fn ($id) => is_numeric($id));

            if (! empty($ids)) {
                $query->whereNotIn('id', $ids);
            }
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $paginator = $query->orderBy('is_pinned', 'desc')
            ->orderBy('published_at', 'desc')
            ->paginate($perPage);
        $pageNotices = collect($paginator->items());

        $categories = collect(NoticeType::cases())->map(function (NoticeType $noticeType) use ($pageNotices): array {
            $categoryNotices = $noticeType === NoticeType::ALL
                ? $pageNotices
                : $pageNotices->where('type', $noticeType->value);

            return [
                'category' => $noticeType->value,
                'category_label' => $noticeType->label(),
                'items' => NoticeResource::collection($categoryNotices->values()->all()),
            ];
        })->all();

        return [
            'notices' => $categories,
            'pagination' => $this->paginationService->format($paginator),
        ];
    }

    /**
     * Get Notice by ID and increment view count
     *
     * @throws ModelNotFoundException
     */
    public function getNoticeDetail(int $id): array
    {
        try {
            $notice = Notice::active()->published()->findOrFail($id);

            // Increment view count
            $notice->incrementViewCount();

            $baseQuery = Notice::active()->published();

            $prev = (clone $baseQuery)
                ->where('id', '<', $id)
                ->orderBy('id', 'desc')
                ->select(['id', 'title', 'published_at'])
                ->first();

            $next = (clone $baseQuery)
                ->where('id', '>', $id)
                ->orderBy('id', 'asc')
                ->select(['id', 'title', 'published_at'])
                ->first();

            $related = (clone $baseQuery)
                ->where('type', $notice->type)
                ->where('id', '!=', $id)
                ->orderBy('published_at', 'desc')
                ->select(['id', 'title', 'published_at', 'view_count'])
                ->limit(5)
                ->get();

            return [
                'notice'  => new NoticeResource($notice),
                'prev'    => $prev ? ['id' => $prev->id, 'title' => $prev->title, 'published_at' => $prev->published_at?->toDateTimeString()] : null,
                'next'    => $next ? ['id' => $next->id, 'title' => $next->title, 'published_at' => $next->published_at?->toDateTimeString()] : null,
                'related' => $related->map(fn ($n) => [
                    'id'           => $n->id,
                    'title'        => $n->title,
                    'published_at' => $n->published_at?->toDateTimeString(),
                    'view_count'   => $n->view_count,
                ])->values(),
            ];
        } catch (\Exception $e) {
            Log::error('Get MyPage Notice detail failed', [
                'notice_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}
