<?php

namespace App\Services\Admin;

use App\Enums\FaqCategory;
use App\Models\Faq;
use App\Models\User;
use App\Services\PaginationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminFaqService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * Get search filter options for FAQs.
     *
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        $registrantIds = Faq::query()
            ->whereNotNull('created_by')
            ->distinct()
            ->pluck('created_by');
        $registrants = User::query()
            ->whereIn('id', $registrantIds)
            ->select('id', 'username', 'name')
            ->orderBy('username')
            ->limit(100)
            ->get()
            ->map(fn (User $user) => [
                'value' => $user->id,
                'label' => $user->username ?? $user->name ?? ('User #'.$user->id),
            ])
            ->values()
            ->all();

        return [
            'faq_category_options' => array_map(
                fn (FaqCategory $c) => [
                    'value' => $c->value,
                    'label' => $c->label(),
                    'label_en' => $c->labelEn(),
                ],
                FaqCategory::cases()
            ),
            'posting_status_options' => [
                ['value' => 'exposed', 'label' => 'Exposed'],
                ['value' => 'non-exposed', 'label' => 'Non-Exposed'],
            ],
            'exposure_target_options' => [
                ['value' => 'all', 'label' => 'All'],
                ['value' => 'user', 'label' => 'User'],
            ],
            'registrant_options' => $registrants,
        ];
    }

    /**
     * Get FAQs with filters for Super Admin.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getFaqs(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = Faq::query()->with('createdBy');

        // Search term (category, question, answer)
        $search = Arr::get($filters, 'search_term');
        if ($search) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('category', 'like', '%'.$search.'%')
                    ->orWhere('question', 'like', '%'.$search.'%')
                    ->orWhere('answer', 'like', '%'.$search.'%');
            });
        }

        // Filter by FAQ category
        $category = Arr::get($filters, 'faq_category');
        if ($category) {
            $query->where('category', $category);
        }

        // Filter by title (question)
        $title = Arr::get($filters, 'title');
        if ($title) {
            $query->where('question', 'like', '%'.$title.'%');
        }

        // Filter by author (created_by)
        $authorId = Arr::get($filters, 'author_id');
        if ($authorId) {
            $query->where('created_by', $authorId);
        }

        // Filter by posting status (exposed / non-exposed)
        $postingStatus = Arr::get($filters, 'posting_status');
        if ($postingStatus) {
            if ($postingStatus === 'exposed') {
                $query->where('is_active', true);
            } elseif ($postingStatus === 'non-exposed') {
                $query->where('is_active', false);
            }
        }

        // Filter by exposure target
        $exposureTarget = Arr::get($filters, 'exposure_target');
        if ($exposureTarget) {
            $query->whereJsonContains('exposure_target', $exposureTarget);
        }

        // Filter by registration date
        $registrationDateFrom = Arr::get($filters, 'registration_date_from');
        $registrationDateTo = Arr::get($filters, 'registration_date_to');
        if ($registrationDateFrom) {
            $query->whereDate('created_at', '>=', $registrationDateFrom);
        }
        if ($registrationDateTo) {
            $query->whereDate('created_at', '<=', $registrationDateTo);
        }

        // Sorting
        $sortBy = Arr::get($filters, 'sort_by', 'created_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');

        $sortColumn = match ($sortBy) {
            'category' => 'category',
            'title' => 'question',
            'created_at' => 'created_at',
            default => 'created_at',
        };

        $query->orderBy($sortColumn, $sortOrder);

        $currentPage = Arr::get($filters, 'current_page', 1);

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }

    public function getFaq(int $id): Faq
    {
        return Faq::with('createdBy')->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function createFaq(User $adminUser, array $data): Faq
    {
        return DB::transaction(function () use ($adminUser, $data) {
            return Faq::create([
                'category' => $data['category'] ?? FaqCategory::MEMBERSHIP->value,
                'question' => $data['question'],
                'answer' => $data['answer'],
                'sort_order' => $data['sort_order'] ?? 0,
                'is_active' => $data['posting_status'] === 'exposed',
                'created_by' => $adminUser->id,
                'exposure_target' => $data['exposure_target'] ?? ['all'],
            ]);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateFaq(int $id, array $data): Faq
    {
        return DB::transaction(function () use ($id, $data) {
            $faq = Faq::findOrFail($id);

            $updateData = Arr::only($data, [
                'category',
                'question',
                'answer',
                'sort_order',
                'exposure_target',
            ]);

            if (isset($data['posting_status'])) {
                $updateData['is_active'] = $data['posting_status'] === 'exposed';
            }

            $faq->update($updateData);

            return $faq;
        });
    }

    public function deleteFaq(int $id): void
    {
        DB::transaction(function () use ($id) {
            $faq = Faq::findOrFail($id);
            $faq->delete();
        });
    }
}
