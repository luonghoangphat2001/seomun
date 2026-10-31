<?php

namespace App\Services\MyPage;

use App\Http\Resources\WorkerResource;
use App\Models\User;
use App\Models\Worker;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class MyPageWorkerService
{
    public function __construct(
        protected PaginationService $paginationService,
    ) {}

    public function getWorkers(User $user, ?string $searchType, ?string $keyword, int $perPage): array
    {
        if (! $user->id) {
            throw new \InvalidArgumentException('기업회원만 작업자 목록을 조회할 수 있습니다.');
        }

        $query = Worker::where('user_id', $user->id);

        if ($keyword) {
            if (in_array($searchType, ['name', 'mobile'], true)) {
                $query->where($searchType, 'like', "%{$keyword}%");
            } else {
                $query->where(function ($q) use ($keyword) {
                    $q->where('name', 'like', "%{$keyword}%")
                        ->orWhere('mobile', 'like', "%{$keyword}%");
                });
            }
        }

        $paginator = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return [
            'items'      => WorkerResource::collection($paginator->items()),
            'pagination' => $this->paginationService->format($paginator),
        ];
    }

    public function getWorker(User $user, int $id): WorkerResource
    {
        $worker = Worker::where('user_id', $user->id)->findOrFail($id);

        return new WorkerResource($worker);
    }

    public function createWorker(User $user, array $data): WorkerResource
    {
        if (! $user->id) {
            throw new \InvalidArgumentException('사용자만 작업자를 등록할 수 있습니다.');
        }

        $worker = Worker::create([
            'user_id' => $user->id,
            'name'        => $data['name'],
            'mobile'      => $data['mobile'],
        ]);

        return new WorkerResource($worker);
    }

    public function updateWorker(User $user, int $id, array $data): WorkerResource
    {
        $worker = Worker::where('user_id', $user->id)->findOrFail($id);
        $worker->update(array_filter($data, fn($v) => $v !== null));

        return new WorkerResource($worker->fresh());
    }

    /**
     * @throws ModelNotFoundException
     */
    public function deleteWorker(User $user, int $id): void
    {
        Worker::where('user_id', $user->id)->findOrFail($id)->delete();
    }

    public function batchDeleteWorkers(User $user, array $ids): int
    {
        return Worker::where('user_id', $user->id)->whereIn('id', $ids)->delete();
    }
}
