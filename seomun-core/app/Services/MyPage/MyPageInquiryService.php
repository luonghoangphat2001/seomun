<?php

namespace App\Services\MyPage;

use App\Enums\FileType;
use App\Enums\InquiryCategory;
use App\Enums\InquiryStatus;
use App\Http\Resources\InquiryCommentResource;
use App\Http\Resources\InquiryResource;
use App\Models\Inquiry;
use App\Models\InquiryAttachment;
use App\Models\InquiryComment;
use App\Models\User;
use App\Services\FileService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Builder;

class MyPageInquiryService
{
    public function __construct(
        protected PaginationService $paginationService,
        protected FileService $fileService,
    ) {}

    /**
     * Get paginated inquiries with filters
     */
    public function getInquiries(User $user, array $filters, int $perPage = 15): array
    {
        try {
            $query = Inquiry::where('user_id', $user->id)
                ->with(['attachments', 'user', 'product'])
                ->latest();

            $query = $this->buildQuery($query, $filters);

            $inquiries = $query->paginate($perPage);

            return [
                'inquiries' => InquiryResource::collection($inquiries->items()),
                'pagination' => $this->paginationService->format($inquiries),
            ];
        } catch (\Exception $e) {
            Log::error('Get MyPage inquiries failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }


    public function buildQuery(Builder $query, array $data): Builder
    {
        if (array_key_exists('status', $data)) {
            $query->where('status', $data['status']);
        }

        if (array_key_exists('category', $data)) {
            $query->where('category', $data['category']);
        }

        if (! empty($data['customer_name'] ?? null)) {
            $customerName = $data['customer_name'];
            $query->whereHas('user.customer', function ($c) use ($customerName) {
                $c->where('company_name', 'like', "%{$customerName}%");
            });
        }

        if (! empty($data['inquirer_name'] ?? null)) {
            $inquirerName = $data['inquirer_name'];
            $query->whereHas('user', function ($u) use ($inquirerName) {
                $u->where('name', 'like', "%{$inquirerName}%");
            });
        }

        if (! empty($data['assigned_to'] ?? null)) {
            $query->where('replied_by', $data['assigned_to']);
        }

        if (array_key_exists('has_attachment', $data) && $data['has_attachment'] !== null && $data['has_attachment'] !== '') {
            if (filter_var($data['has_attachment'], FILTER_VALIDATE_BOOLEAN)) {
                $query->whereHas('attachments');
            } else {
                $query->whereDoesntHave('attachments');
            }
        }

        $search = $data['search_term'] ?? $data['search'] ?? null;
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($u) use ($search) {
                    $u->where('name', 'like', "%{$search}%");
                })
                    ->orWhereHas('user.customer', function ($c) use ($search) {
                        $c->where('company_name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('repliedBy', function ($r) use ($search) {
                        $r->where('name', 'like', "%{$search}%");
                    })
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if (! empty($data['created_from'] ?? null)) {
            $query->whereDate('inquiries.created_at', '>=', $data['created_from']);
        }
        if (! empty($data['created_to'] ?? null)) {
            $query->whereDate('inquiries.created_at', '<=', $data['created_to']);
        }

        $query->with([
            'user',
            'user.customer',
            'attachments',
            'repliedBy',
            'comments',
        ]);

        $sortBy = $data['sort_by'] ?? 'created_at';
        $sortOrder = $data['sort_order'] ?? 'desc';

        if ($sortBy === 'customer_name') {
            $query->join('users', 'inquiries.user_id', '=', 'users.id')
                ->leftJoin('customers', 'users.customer_id', '=', 'customers.id')
                ->select('inquiries.*')
                ->orderBy('customers.company_name', $sortOrder);
        } elseif ($sortBy === 'inquiry_type') {
            $query->orderBy('category', $sortOrder);
        } elseif (in_array($sortBy, ['created_at', 'updated_at', 'status'], true)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query;
    }

    /**
     * Get inquiry detail with comments and attachments
     *
     * @throws ModelNotFoundException
     */
    public function getInquiryDetail(User $user, int $id): InquiryResource
    {
        try {
            $inquiry = Inquiry::where('user_id', $user->id)
                ->with(['comments', 'attachments', 'user', 'product'])
                ->findOrFail($id);

            return new InquiryResource($inquiry);
        } catch (\Exception $e) {
            Log::error('Get MyPage inquiry detail failed', [
                'user_id' => $user->id,
                'inquiry_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Create a new inquiry
     *
     * @param  UploadedFile|array|null  $files  Single file, array of files, or null
     */
    public function createInquiry(User $user, array $data, UploadedFile|array|null $files = null): InquiryResource
    {
        try {
            DB::beginTransaction();

            // Create inquiry
            $inquiry = Inquiry::create([
                'user_id' => $user->id,
                'product_id' => $data['product_id'] ?? null,
                'category' => InquiryCategory::from($data['category']),
                'title' => $data['title'],
                'content' => $data['content'],
                'order_number' => $data['order_number'] ?? null,
                'contact' => $data['contact'],
                'manager_name' => $data['manager_name'] ?? null,
                'status' => InquiryStatus::PENDING,
            ]);

            // Handle file uploads (support both single file and array of files)
            if ($files) {
                // Normalize to array
                if (! is_array($files)) {
                    $files = [$files];
                }

                foreach ($files as $file) {
                    if ($file && $file->isValid()) {
                        $path = $file->store('inquiry-attachments', 'public');
                        $this->fileService->create($file, $path, FileType::INQUIRY_ATTACHMENTS, $user);

                        InquiryAttachment::create([
                            'inquiry_id' => $inquiry->id,
                            'file_name' => $file->getClientOriginalName(),
                            'file_path' => $path,
                            'file_type' => $file->getMimeType(),
                            'file_size' => $file->getSize(),
                        ]);
                    }
                }
            }

            DB::commit();

            $inquiry->load(['comments', 'attachments', 'user', 'product']);

            return new InquiryResource($inquiry);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Create MyPage inquiry failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Add comment to inquiry
     *
     * @throws ModelNotFoundException
     */
    public function addComment(User $user, int $inquiryId, array $data): InquiryCommentResource
    {
        try {
            // Verify inquiry belongs to user
            $inquiry = Inquiry::where('user_id', $user->id)->findOrFail($inquiryId);

            // Create comment
            $comment = InquiryComment::create([
                'inquiry_id' => $inquiry->id,
                'user_id' => $user->id,
                'author_name' => $data['author_name'] ?? $user->name,
                'content' => $data['content'],
                'is_admin' => false,
            ]);

            $attachments = $data['attachments'] ?? [];

            if ($attachments && !is_array($attachments)) {
                $attachments = [$attachments];
            }

            DB::transaction(function () use ($attachments, $inquiry, $user) {
                foreach ($attachments as $attachment) {
                    if ($attachment && $attachment->isValid()) {
                        $path = $attachment->store('inquiry-attachments', 'public');

                        $this->fileService->create(
                            $attachment,
                            $path,
                            FileType::INQUIRY_ATTACHMENTS,
                            $user
                        );

                        InquiryAttachment::create([
                            'inquiry_id' => $inquiry->id,
                            'file_name' => $attachment->getClientOriginalName(),
                            'file_path' => $path,
                            'file_type' => $attachment->getMimeType(),
                            'file_size' => $attachment->getSize(),
                            'is_reply_attachment' => true,
                        ]);
                    }
                }
            });
            return new InquiryCommentResource($comment);
        } catch (\Exception $e) {
            Log::error('Add inquiry comment failed', [
                'user_id' => $user->id,
                'inquiry_id' => $inquiryId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}
