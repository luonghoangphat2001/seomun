<?php

namespace App\Services\MyPage;

use App\Enums\ExposureTarget;
use App\Http\Resources\FaqResource;
use App\Models\Faq;
use App\Models\User;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;

class MyPageFaqService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * Get paginated FAQs with filters
     */
    public function getFaqs(?User $user = null, ?string $category = null, ?string $search = null, int $perPage = 15): array
    {
        try {
            $query = Faq::active()->ordered()->where(function (Builder $q) use ($user) {
                $q->whereJsonContains('exposure_target', ExposureTarget::ALL->value)
                    ->orWhereNull('exposure_target');

                if ($user) {
                    $q->orWhereJsonContains('exposure_target', ExposureTarget::USER->value);
                }
            });

            // Filter by category
            if ($category) {
                $query->ofCategory($category);
            }

            // Search by question or answer
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('question', 'like', "%{$search}%")
                        ->orWhere('answer', 'like', "%{$search}%");
                });
            }

            $faqs = $query->paginate($perPage);

            return [
                'faqs' => FaqResource::collection($faqs->items()),
                'pagination' => $this->paginationService->format($faqs),
            ];
        } catch (\Exception $e) {
            Log::error('Get MyPage FAQs failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Get FAQ by ID and increment view count
     *
     * @throws ModelNotFoundException
     */
    public function getFaqDetail(int $id): FaqResource
    {
        try {
            $faq = Faq::active()->findOrFail($id);

            // Increment view count
            $faq->incrementViewCount();

            return new FaqResource($faq);
        } catch (\Exception $e) {
            Log::error('Get MyPage FAQ detail failed', [
                'faq_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}
