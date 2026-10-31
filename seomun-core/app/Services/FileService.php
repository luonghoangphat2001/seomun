<?php

namespace App\Services;

use App\Enums\FileType;
use App\Http\Resources\Admin\AdminFileResource;
use App\Models\File;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class FileService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    public function getSearchFilters(): array
    {
        $authors = User::query()
            ->whereIn('id', function ($query) {
                $query->select('created_by')
                    ->from('files')
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

        return [
            'type_options' => FileType::options(),
            'author_options' => $authors,
        ];
    }

    public function getFiles(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = File::query()->with('createdBy');

        // Name filter
        $name = Arr::get($filters, 'name');
        if ($name) {
            $query->where('name', 'like', '%' . $name . '%');
        }

        // Type filter
        $type = Arr::get($filters, 'type');
        if ($type) {
            $query->where('type', $type);
        }

        // Created By filter
        $createdBy = Arr::get($filters, 'created_by');
        if ($createdBy) {
            $query->where('created_by', $createdBy);
        }

        $startDate = Arr::get($filters, 'start_date');
        $endDate = Arr::get($filters, 'end_date');
        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        // Sort
        $sortBy = Arr::get($filters, 'sort_by', 'created_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');

        // Map sort_by to actual column
        $sortColumn = match ($sortBy) {
            'name' => 'name',
            'type' => 'type',
            'size' => 'size',
            'author' => 'created_by',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
            default => 'created_at',
        };

        $query->orderBy($sortColumn, $sortOrder);

        return $query->paginate($perPage);
    }

    public function create(
        UploadedFile $file,
        string $path,
        FileType $type,
        ?User $user = null,
    ): File {
        return File::create([
            'name' => $file->getClientOriginalName(),
            'path' => $path,
            'url' => asset('storage/' . $path),
            'type' => $type->value,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'created_by' => $user?->id,
        ]);
    }

    public function upload(
        UploadedFile $file,
        FileType $type,
        ?User $user = null,
    ): File {
        $path = $file->store($type->value, 'public');

        return $this->create($file, $path, $type, $user);
    }

    public function getFile(int $id): File
    {
        return File::with('createdBy')->findOrFail($id);
    }
}
