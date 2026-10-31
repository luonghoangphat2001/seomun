<?php

namespace App\Services\Admin;

use App\Enums\FileType;
use App\Models\User;
use App\Models\UserGuide;
use App\Services\FileService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Storage;

class AdminUserGuideService
{

    public function __construct(
        protected FileService $fileService,
    ) {}
    /**
     * Get UserGuide with filters & pagination
     */
    protected string $disk = 'public';

    protected string $dir = 'user-guides';

    public function getUserGuides(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = UserGuide::query()->with('products');
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage);
    }

    public function getUserGuide(string $id): UserGuide
    {
        $query = UserGuide::query()->with('products');

        $data = $query->where('id', $id)->first();

        if (! $data) {
            throw new ModelNotFoundException('data not found.');
        }

        return $data;
    }

    public function create(array $data, ?User $user = null): UserGuide
    {
        $file = $data['attached_file'];

        $path = $file->store($this->dir, $this->disk);
        $this->fileService->create($file, $path, FileType::USER_GUIDES, $user);
        $guide = UserGuide::create([
            'status' => $data['status'],
            'button_name' => $data['button_name'],
            'attached_file' => $path,
        ]);

        $guide->products()->sync($data['product_ids']);

        return $guide->load('products');
    }

    public function update(UserGuide $guide, array $data, ?User $user = null): UserGuide
    {
        // If attached_file is present and is a valid uploaded file, replace it.
        // If attached_file is null/empty (eg. PATCH with attached_file=''), we KEEP the existing file.
        if (array_key_exists('attached_file', $data)) {
            if ($data['attached_file']) {
                if ($guide->attached_file) {
                    Storage::disk($this->disk)->delete($guide->attached_file);
                }
                $data['attached_file'] = $data['attached_file']->store($this->dir, $this->disk);
                $this->fileService->create($data['attached_file'], $data['attached_file'], FileType::USER_GUIDES, $user);
            } else {
                // Do not overwrite DB column with null when client sends empty field.
                unset($data['attached_file']);
            }
        }

        $guide->update(collect($data)->except('product_ids')->toArray());

        if (isset($data['product_ids'])) {
            $guide->products()->sync($data['product_ids']);
        }

        return $guide->load('products');
    }
}
