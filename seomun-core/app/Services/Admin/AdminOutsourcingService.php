<?php

namespace App\Services\Admin;

use App\Enums\FileType;
use App\Models\OutsourcingCompany;
use App\Models\User;
use App\Services\FileService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class AdminOutsourcingService
{
    protected string $disk = 'public';
    protected string $dir = 'outsourcing/registration-certificates';

    public function __construct(
        protected PaginationService $paginationService,
        protected FileService $fileService,
    ) {}

    public function getList(?string $searchType, ?string $keyword, ?bool $isActive, int $perPage): LengthAwarePaginator
    {
        $query = OutsourcingCompany::query();

        if ($keyword) {
            $field = in_array($searchType, ['name', 'work_details', 'representative_name', 'email', 'contact', 'address', 'registration_number'])
                ? $searchType
                : 'name';
            $query->where($field, 'like', "%{$keyword}%");
        }

        if ($isActive !== null) {
            $query->where('is_active', $isActive);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function getById(int $id): OutsourcingCompany
    {
        return OutsourcingCompany::findOrFail($id);
    }

    public function create(array $data, ?User $user = null): OutsourcingCompany
    {
        return OutsourcingCompany::create($data);
    }

    public function update(int $id, array $data, ?User $user = null): OutsourcingCompany
    {
        $company = OutsourcingCompany::findOrFail($id);

        if (array_key_exists('registration_certificate', $data)) {
            $newCert = $data['registration_certificate'];
            // If new certificate path is different from the existing one, delete the old file
            if ($company->registration_certificate && $company->registration_certificate !== $newCert) {
                if (Storage::disk($this->disk)->exists($company->registration_certificate)) {
                    Storage::disk($this->disk)->delete($company->registration_certificate);
                }
            }

            if ($newCert === null || $newCert === '') {
                unset($data['registration_certificate']);
            }
        }

        $company->update(array_filter($data, fn ($v) => $v !== null));

        return $company->fresh();
    }

    /**
     * @throws ModelNotFoundException
     */
    public function delete(int $id): void
    {
        OutsourcingCompany::findOrFail($id)->delete();
    }
}
