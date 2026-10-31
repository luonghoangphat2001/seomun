<?php

namespace App\Services\Admin;

use App\Models\Attendance;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;

class AdminAttendanceService
{
    public function getList(?int $userId, ?string $dateFrom, ?string $dateTo, ?string $status, int $perPage): LengthAwarePaginator
    {
        $query = Attendance::with('user');

        if ($userId !== null) {
            $query->where('user_id', $userId);
        }

        if ($dateFrom !== null) {
            $query->where('attendance_date', '>=', $dateFrom);
        }

        if ($dateTo !== null) {
            $query->where('attendance_date', '<=', $dateTo);
        }

        if ($status !== null) {
            $query->where('status', $status);
        }

        return $query->orderBy('attendance_date', 'desc')->paginate($perPage);
    }

    public function getById(int $id): Attendance
    {
        return Attendance::with('user')->findOrFail($id);
    }

    public function create(array $data): Attendance
    {
        $attendance = Attendance::create($data);

        return $attendance->load('user');
    }

    public function update(int $id, array $data): Attendance
    {
        $attendance = Attendance::findOrFail($id);
        $attendance->update(array_filter($data, fn ($v) => $v !== null));

        return $attendance->fresh('user');
    }

    /**
     * @throws ModelNotFoundException
     */
    public function delete(int $id): void
    {
        Attendance::findOrFail($id)->delete();
    }
}
