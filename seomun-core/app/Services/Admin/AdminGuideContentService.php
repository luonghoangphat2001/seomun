<?php

namespace App\Services\Admin;

use App\Http\Resources\Admin\AdminGuideContentResource;
use App\Models\Customer;
use App\Models\GuideContent;
use App\Models\User;
use App\Services\PaginationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminGuideContentService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * Get search filter options for guide contents.
     *
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        $authors = User::query()
            ->whereIn('id', function ($query) {
                $query->select('created_by')
                    ->from('guide_contents')
                    ->whereNotNull('created_by')
                    ->distinct();
            })
            ->select('id', 'username', 'name')
            ->orderBy('name')
            ->orderBy('username')
            ->limit(100)
            ->get()
            ->map(fn (User $user) => [
                'value' => $user->id,
                'label' => $user->name ?? $user->username ?? ('User #'.$user->id),
            ])
            ->all();

        $exposureTargetOptions = Customer::query()
            ->select('id', 'company_name')
            ->orderBy('company_name')
            ->limit(500)
            ->get()
            ->map(fn (Customer $c) => [
                'value' => $c->id,
                'label' => $c->company_name ?: ('Customer #'.$c->id),
            ])
            ->all();

        return [
            'exposure_status_options' => [
                ['value' => 'exposed', 'label' => 'Exposed'],
                ['value' => 'non-exposed', 'label' => 'Non-Exposed'],
            ],
            'type_options' => [
                ['value' => 'production_guide', 'label' => 'Production Guide'],
                ['value' => 'precaution', 'label' => 'Precaution'],
                ['value' => 'shipping', 'label' => 'Shipping'],
                ['value' => 'usage_guide', 'label' => 'Usage Guide'],
            ],
            'exposure_target_options' => $exposureTargetOptions,
            'author_options' => $authors,
        ];
    }

    /**
     * Get guide contents with filters for Super Admin.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getGuideContents(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = GuideContent::query()->with('createdBy');

        $title = Arr::get($filters, 'title');
        if ($title !== null && $title !== '') {
            $query->where('title', 'like', '%'.$title.'%');
        }

        $searchTerm = Arr::get($filters, 'search_term');
        if ($searchTerm) {
            $query->where(function (Builder $q) use ($searchTerm) {
                $q->where('title', 'like', '%'.$searchTerm.'%')
                    ->orWhere('content', 'like', '%'.$searchTerm.'%');
            });
        }

        $authorId = Arr::get($filters, 'author_id');
        if ($authorId) {
            $query->where('created_by', $authorId);
        }

        $type = Arr::get($filters, 'type');
        if ($type) {
            $query->where('type', $type);
        }

        $exposureStatus = Arr::get($filters, 'exposure_status');
        if ($exposureStatus) {
            if ($exposureStatus === 'exposed') {
                $query->where('is_active', true)
                    ->where(function (Builder $q) {
                        $q->whereNull('published_at')
                            ->orWhere('published_at', '<=', now());
                    })
                    ->where(function (Builder $q) {
                        $q->whereNull('expires_at')
                            ->orWhere('expires_at', '>=', now());
                    });
            } else {
                $query->where(function (Builder $q) {
                    $q->where('is_active', false)
                        ->orWhere(function (Builder $q2) {
                            $q2->whereNotNull('published_at')
                                ->where('published_at', '>', now());
                        })
                        ->orWhere(function (Builder $q2) {
                            $q2->whereNotNull('expires_at')
                                ->where('expires_at', '<', now());
                        });
                });
            }
        }

        $exposureStartDate = Arr::get($filters, 'exposure_start_date');
        if ($exposureStartDate) {
            $query->whereDate('published_at', '>=', $exposureStartDate);
        }
        $exposureEndDate = Arr::get($filters, 'exposure_end_date');
        if ($exposureEndDate) {
            $query->where(function (Builder $q) use ($exposureEndDate) {
                $q->whereNull('expires_at')
                    ->orWhereDate('expires_at', '<=', $exposureEndDate);
            });
        }

        $sortBy = Arr::get($filters, 'sort_by', 'created_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');

        $sortColumn = match ($sortBy) {
            'title' => 'title',
            'author' => 'created_by',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
            default => 'created_at',
        };

        $query->orderBy($sortColumn, $sortOrder);

        $currentPage = Arr::get($filters, 'current_page', 1);

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }

    /**
     * Get single guide content detail.
     */
    public function getGuideContent(int $id): GuideContent
    {
        return GuideContent::with('createdBy')->findOrFail($id);
    }

    /**
     * Create a new guide content.
     *
     * @param  array<string, mixed>  $data
     */
    public function createGuideContent(User $adminUser, array $data): GuideContent
    {
        return DB::transaction(function () use ($adminUser, $data) {
            $exposureTarget = $data['exposure_target'] ?? 'all';

            if ($exposureTarget === null || $exposureTarget === '' || (is_array($exposureTarget) && count($exposureTarget) === 0)) {
                $exposureTarget = 'all';
            }

            return GuideContent::create([
                'title' => $data['title'],
                'content' => $data['content'],
                'type' => $data['type'] ?? 'general',
                'attachments' => $data['attachments'] ?? null,
                'is_active' => $data['exposure_status'] === 'exposed',
                'published_at' => $data['exposure_start_date'] ?? null,
                'expires_at' => $data['exposure_end_date'] ?? null,
                'exposure_target' => $exposureTarget === 'all' ? 'all' : (array) $exposureTarget,
                'created_by' => $adminUser->id,
            ]);
        });
    }

    /**
     * Update an existing guide content.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateGuideContent(int $id, array $data): GuideContent
    {
        return DB::transaction(function () use ($id, $data) {
            $guideContent = GuideContent::findOrFail($id);

            $updateData = [];

            if (isset($data['title'])) {
                $updateData['title'] = $data['title'];
            }
            if (isset($data['content'])) {
                $updateData['content'] = $data['content'];
            }
            if (isset($data['type'])) {
                $updateData['type'] = $data['type'];
            }
            if (isset($data['attachments'])) {
                $updateData['attachments'] = $data['attachments'];
            }
            if (isset($data['is_active'])) {
                $updateData['is_active'] = $data['is_active'];
            }
            if (isset($data['exposure_status'])) {
                $updateData['is_active'] = $data['exposure_status'] === 'exposed';
            }
            if (isset($data['exposure_start_date'])) {
                $updateData['published_at'] = $data['exposure_start_date'];
            }
            if (isset($data['exposure_end_date'])) {
                $updateData['expires_at'] = $data['exposure_end_date'];
            }
            if (isset($data['exposure_target'])) {
                $updateData['exposure_target'] = $data['exposure_target'];
            }

            $guideContent->update($updateData);

            return $guideContent;
        });
    }

    /**
     * Delete a guide content.
     */
    public function deleteGuideContent(int $id): void
    {
        DB::transaction(function () use ($id) {
            $guideContent = GuideContent::findOrFail($id);
            $guideContent->delete();
        });
    }
}