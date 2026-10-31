<?php

namespace App\Services\Admin;

use App\Models\Equipment;
use App\Models\EquipmentLog;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;

class AdminEquipmentService
{
    public function getList(?string $searchType, ?string $keyword, ?string $workProcess, ?string $status, int $perPage, ?string $machineType = null): LengthAwarePaginator
    {
        $query = Equipment::query();

        if ($keyword) {
            if ($searchType && in_array($searchType, ['company_name', 'name', 'maintenance_company', 'manager_name'])) {
                $query->where($searchType, 'like', "%{$keyword}%");
            } else {
                // Global search across main fields when search_type is not specified
                $query->where(function ($q) use ($keyword) {
                    $q->where('name', 'like', "%{$keyword}%")
                        ->orWhere('maintenance_company', 'like', "%{$keyword}%")
                        ->orWhere('manager_name', 'like', "%{$keyword}%")
                        ->orWhere('manager_phone', 'like', "%{$keyword}%")
                        ->orWhere('company_name', 'like', "%{$keyword}%");
                });
            }
        }

        if ($workProcess !== null) {
            $query->where('work_process', $workProcess);
        }

        if ($machineType !== null) {
            $query->where('machine_type', $machineType);
        }

        if ($status !== null) {
            $query->where('status', $status);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function getById(int $id): Equipment
    {
        return Equipment::findOrFail($id);
    }

    public function create(array $data): Equipment
    {
        return Equipment::create($data);
    }

    public function update(int $id, array $data): Equipment
    {
        $equipment = Equipment::findOrFail($id);
        $equipment->update(array_filter($data, fn ($v) => $v !== null));

        return $equipment->fresh();
    }

    /**
     * @throws ModelNotFoundException
     */
    public function delete(int $id): void
    {
        Equipment::findOrFail($id)->delete();
    }

    public function getLogs(int $equipmentId): \Illuminate\Database\Eloquent\Collection
    {
        Equipment::findOrFail($equipmentId);

        return EquipmentLog::where('equipment_id', $equipmentId)
            ->orderBy('log_date', 'desc')
            ->get();
    }

    public function createLog(int $equipmentId, array $data): EquipmentLog
    {
        Equipment::findOrFail($equipmentId);

        return EquipmentLog::create(['equipment_id' => $equipmentId, ...$data]);
    }

    /**
     * @throws ModelNotFoundException
     */
    public function updateLog(int $equipmentId, int $logId, array $data): EquipmentLog
    {
        Equipment::findOrFail($equipmentId);
        $log = EquipmentLog::where('equipment_id', $equipmentId)->findOrFail($logId);
        $log->update(array_filter($data, fn ($v) => $v !== null));

        return $log->fresh();
    }

    /**
     * @throws ModelNotFoundException
     */
    public function deleteLog(int $equipmentId, int $logId): void
    {
        $log = EquipmentLog::where('equipment_id', $equipmentId)->findOrFail($logId);
        $log->delete();
    }
}
