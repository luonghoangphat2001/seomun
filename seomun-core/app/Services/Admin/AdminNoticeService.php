<?php

namespace App\Services\Admin;

use App\Enums\NoticeType;
use App\Http\Resources\Admin\AdminNoticeResource;
use App\Models\Customer;
use App\Models\Notice;
use App\Models\User;
use App\Services\PaginationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminNoticeService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * Get search filter options for notices.
     *
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        // Get authors from notices (users who created notices)
        $authors = User::query()
            ->whereIn('id', function ($query) {
                $query->select('created_by')
                    ->from('notices')
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

        // Exposure target = customer list for FE dropdown (노출 대상)
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
            'exposure_location_options' => [
                ['value' => 'main', 'label' => 'Main'],
                ['value' => 'login', 'label' => 'Login'],
                ['value' => 'dashboard', 'label' => 'Dashboard'],
            ],
            'exposure_target_options' => $exposureTargetOptions,
            'author_options' => $authors,
            'notice_type_options' => collect(NoticeType::cases())->map(fn (NoticeType $type) => [
                'value' => $type->value,
                'label' => $type->label(),
                'label_en' => $type->labelEn(),
            ])->all(),
        ];
    }

    /**
     * Get notices with filters for Super Admin.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getNotices(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = Notice::query()->with('createdBy');

        // Title search (FE: title)
        $title = Arr::get($filters, 'title');
        if ($title !== null && $title !== '') {
            $query->where('title', 'like', '%'.$title.'%');
        }

        $type = Arr::get($filters, 'type');
        if ($type && $type !== NoticeType::ALL->value) {
            $query->where('type', $type);
        }

        // Search term (title or content) - backward compat, merged search box
        $searchTerm = Arr::get($filters, 'search_term');
        if ($searchTerm) {
            $query->where(function (Builder $q) use ($searchTerm) {
                $q->where('title', 'like', '%'.$searchTerm.'%')
                    ->orWhere('content', 'like', '%'.$searchTerm.'%');
            });
        }

        // Filter by author (created_by)
        $authorId = Arr::get($filters, 'author_id');
        if ($authorId) {
            $query->where('created_by', $authorId);
        }

        // Filter by registrant (created_by) - FE: registrant_id
        $registrantId = Arr::get($filters, 'registrant_id');
        if ($registrantId) {
            $query->where('created_by', $registrantId);
        }

        // Filter by exposure location
        $exposureLocation = Arr::get($filters, 'exposure_location');
        if ($exposureLocation) {
            $query->where('exposure_location', $exposureLocation);
        }

        // Filter by exposure status (exposed/non-exposed)
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

        // Exposure period: Notice uses published_at / expires_at (FE: exposure_start_date, exposure_end_date)
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

        // Sort (FE: sort_by = NOTICE_SORT_BY, sort_order)
        $sortBy = Arr::get($filters, 'sort_by', 'created_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');

        // Map sort_by to actual column
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
     * Get single notice detail.
     */
    public function getNotice(int $id): Notice
    {
        return Notice::with('createdBy')->findOrFail($id);
    }

    /**
     * Create a new notice.
     *
     * @param  array<string, mixed>  $data
     */
    public function createNotice(User $adminUser, array $data): Notice
    {
        return DB::transaction(function () use ($adminUser, $data) {
            // Normalize exposure_target: 'all' or array of customer IDs
            $exposureTarget = $data['exposure_target'] ?? 'all';

            if ($exposureTarget === null || $exposureTarget === '' || (is_array($exposureTarget) && count($exposureTarget) === 0)) {
                $exposureTarget = 'all';
            }

            return Notice::create([
                'title' => $data['title'],
                'content' => $data['content'],
                'type' => $data['type'] ?? 'other',
                'attachments' => $data['attachments'] ?? null,
                'is_pinned' => $data['is_pinned'] ?? false,
                'is_active' => $data['exposure_status'] === 'exposed',
                'published_at' => $data['exposure_start_date'] ?? null,
                'expires_at' => $data['exposure_end_date'] ?? null,
                'exposure_target' => $exposureTarget === 'all' ? 'all' : (array) $exposureTarget,
                'exposure_location' => $data['exposure_location'],
                'created_by' => $adminUser->id,
            ]);
        });
    }

    /**
     * Update an existing notice.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateNotice(int $id, array $data): Notice
    {
        return DB::transaction(function () use ($id, $data) {
            $notice = Notice::findOrFail($id);

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
            if (isset($data['is_pinned'])) {
                $updateData['is_pinned'] = $data['is_pinned'];
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
            if (isset($data['exposure_location'])) {
                $updateData['exposure_location'] = $data['exposure_location'];
            }

            $notice->update($updateData);

            return $notice;
        });
    }

    /**
     * Delete a notice.
     */
    public function deleteNotice(int $id): void
    {
        DB::transaction(function () use ($id) {
            $notice = Notice::findOrFail($id);
            $notice->delete(); // soft delete
        });
    }
}
