<?php

namespace App\Services;

use App\Enums\ExposureTarget;
use App\Enums\FaqCategory;
use App\Http\Resources\FaqResource;
use App\Models\Faq;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class FaqService
{
    public function __construct(
        protected PaginationService $paginationService,
    ) {}

    /**
     * Get paginated active FAQs.
     */
    public function list(?User $user, ?string $category, ?string $search, int $perPage): array
    {
        $exposureFilter = fn (Builder $q) => $this->applyExposureFilter($q, $user);

        $query = Faq::active()->ordered()->where($exposureFilter);

        if ($category) {
            $query->ofCategory($category);
        }

        if ($search) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('question', 'like', "%{$search}%")
                    ->orWhere('answer', 'like', "%{$search}%");
            });
        }

        $faqs = $query->paginate($perPage);

        return [
            'faqs' => FaqResource::collection($faqs->items()),
            'pagination' => $this->paginationService->format($faqs),
        ];
    }

    /**
     * Get FAQ count per category for tab badges, respecting active search filters.
     */
    public function categoryCounts(?User $user, ?string $search = null): array
    {
        $exposureFilter = fn (Builder $q) => $this->applyExposureFilter($q, $user);

        $query = Faq::active()->where($exposureFilter);

        if ($search) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('question', 'like', "%{$search}%")
                    ->orWhere('answer', 'like', "%{$search}%");
            });
        }

        $counts = $query->selectRaw('category, COUNT(*) as count')
            ->groupBy('category')
            ->pluck('count', 'category');

        return collect(FaqCategory::cases())->mapWithKeys(
            fn (FaqCategory $category) => [$category->value => (int) ($counts[$category->value] ?? 0)]
        )->all();
    }

    /**
     * Get single FAQ.
     */
    public function show(int $id): FaqResource
    {
        return new FaqResource(Faq::findOrFail($id));
    }

    /**
     * Increment view count for a FAQ.
     */
    public function incrementView(int $id): void
    {
        Faq::findOrFail($id)->incrementViewCount();
    }

    private function applyExposureFilter(Builder $query, ?User $user): void
    {
        $query->where(function (Builder $q) use ($user) {
            $q->whereJsonContains('exposure_target', ExposureTarget::ALL->value)
                ->orWhereNull('exposure_target');

            if ($user) {
                $q->orWhereJsonContains('exposure_target', ExposureTarget::USER->value);
            }
        });
    }
}
