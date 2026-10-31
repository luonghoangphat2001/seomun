<?php

namespace Database\Seeders;

use App\Enums\UserAuthority;
use App\Enums\UserStatus;
use App\Models\AccessLog;
use App\Models\User;
use Illuminate\Database\Seeder;

class AccessLogSeeder extends Seeder
{
    /**
     * Seed sample access logs for admin screen.
     */
    public function run(): void
    {
        // Ensure we have a few users to attach logs to
        $admin = User::firstOrCreate(
            ['email' => 'admin@axndx.org'],
            [
                'name' => 'Admin User',
                'username' => 'admin',
                'password' => bcrypt('Password123!'),
                'authority' => UserAuthority::SUPER_ADMIN->value,
                'status' => UserStatus::ACTIVE,
            ]
        );

        $manager = User::firstOrCreate(
            ['email' => 'manager@axndx.org'],
            [
                'name' => 'Manager',
                'username' => 'manager',
                'password' => bcrypt('Password123!'),
                'authority' => UserAuthority::STORE_ADMIN->value,
                'status' => UserStatus::ACTIVE,
            ]
        );

        $staff = User::firstOrCreate(
            ['email' => 'staff1@axndx.org'],
            [
                'name' => 'Staff 1',
                'username' => 'staff1',
                'password' => bcrypt('Password123!'),
                'authority' => UserAuthority::USER->value,
                'status' => UserStatus::ACTIVE,
            ]
        );

        $now = now();

        $records = [
            // Normal logins
            [
                'user' => $admin,
                'login_id' => 'admin@axndx.org',
                'ip' => '10.0.0.50',
                'browser' => 'Chrome 131.0 - Windows 10',
                'event' => 'login',
                'management' => 'Log In',
                'explanation' => null,
                'minutes' => -60,
            ],
            [
                'user' => $manager,
                'login_id' => 'manager@axndx.org',
                'ip' => '10.0.0.50',
                'browser' => 'Firefox 133.0 - Windows 10',
                'event' => 'login',
                'management' => 'Log In',
                'explanation' => null,
                'minutes' => -55,
            ],
            [
                'user' => $staff,
                'login_id' => 'staff1@axndx.org',
                'ip' => '10.0.0.50',
                'browser' => 'Safari 18.1 - macOS 14',
                'event' => 'login',
                'management' => 'Log In',
                'explanation' => null,
                'minutes' => -50,
            ],

            // Login failed attempts (abnormal)
            [
                'user' => null,
                'login_id' => 'manager@axndx.org',
                'ip' => '172.16.0.25',
                'browser' => 'Firefox 133.0 - Windows 10',
                'event' => 'login_failed',
                'management' => 'Login Failed',
                'explanation' => 'Invalid credentials provided',
                'minutes' => -45,
            ],
            [
                'user' => null,
                'login_id' => 'supervisor@axndx.org',
                'ip' => '192.168.1.101',
                'browser' => 'Chrome 131.0 - Windows 10',
                'event' => 'login_failed',
                'management' => 'Login Failed',
                'explanation' => 'Invalid credentials provided',
                'minutes' => -40,
            ],
            [
                'user' => null,
                'login_id' => 'supervisor@axndx.org',
                'ip' => '192.168.1.101',
                'browser' => 'Chrome 131.0 - Windows 10',
                'event' => 'login_failed',
                'management' => 'Login Failed',
                'explanation' => 'Invalid credentials provided',
                'minutes' => -39,
            ],
            [
                'user' => null,
                'login_id' => 'supervisor@axndx.org',
                'ip' => '192.168.1.101',
                'browser' => 'Chrome 131.0 - Windows 10',
                'event' => 'login_failed',
                'management' => 'Login Failed',
                'explanation' => 'Multiple failed attempts detected from same IP',
                'minutes' => -38,
            ],

            // Logins from different IPs (for IP filter demo)
            [
                'user' => $staff,
                'login_id' => 'staff1@axndx.org',
                'ip' => '203.0.113.45',
                'browser' => 'Chrome 131.0 - Windows 10',
                'event' => 'login',
                'management' => 'Log In',
                'explanation' => 'Login from unusual IP address',
                'minutes' => -30,
            ],
            [
                'user' => $staff,
                'login_id' => 'staff1@axndx.org',
                'ip' => '203.0.113.45',
                'browser' => 'Chrome 131.0 - Ubuntu 22.04',
                'event' => 'logout',
                'management' => 'Log Out',
                'explanation' => null,
                'minutes' => -25,
            ],
            [
                'user' => $manager,
                'login_id' => 'manager@axndx.org',
                'ip' => '10.0.0.50',
                'browser' => 'Chrome 131.0 - Ubuntu 22.04',
                'event' => 'logout',
                'management' => 'Log Out',
                'explanation' => null,
                'minutes' => -20,
            ],
        ];

        foreach ($records as $record) {
            $time = $now->copy()->addMinutes($record['minutes']);

            AccessLog::create([
                'user_id' => $record['user']?->id,
                'login_id' => $record['login_id'],
                'ip_address' => $record['ip'],
                'browser_info' => $record['browser'],
                'user_agent' => $record['browser'],
                'event_type' => $record['event'],
                'management' => $record['management'],
                'explanation' => $record['explanation'],
                'connection_time' => $time,
                'access_date' => $time->toDateString(),
            ]);
        }
    }
}
