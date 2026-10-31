<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\User;
use Illuminate\Database\Seeder;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $admins = User::whereIn('authority', ['super_admin', 'store_admin'])->limit(3)->get();

        if ($admins->isEmpty()) {
            $admins = User::query()->limit(3)->get();
        }

        if ($admins->isEmpty()) {
            $this->command->warn('No users found. Skipping AttendanceSeeder.');
            return;
        }

        Attendance::query()->delete();

        $statuses = ['present', 'present', 'present', 'late', 'absent', 'vacation', 'half_day'];

        foreach ($admins as $admin) {
            for ($i = 6; $i >= 0; $i--) {
                $date = now()->subDays($i);
                if ($date->isWeekend()) {
                    continue;
                }

                $status = $statuses[array_rand($statuses)];

                Attendance::create([
                    'user_id'         => $admin->id,
                    'attendance_date' => $date->toDateString(),
                    'check_in'        => $status === 'absent' ? null : ($status === 'late' ? '10:15' : '09:00'),
                    'check_out'       => in_array($status, ['absent', 'half_day']) ? null : '18:00',
                    'status'          => $status,
                    'notes'           => $status === 'absent' ? '병가' : null,
                ]);
            }
        }
    }
}
