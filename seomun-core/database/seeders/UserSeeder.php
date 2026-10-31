<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Simple common password for testing on staging
        $defaultPassword = 'password123';

        // Super Admin
        User::firstOrCreate(
            ['username' => 'superadmin'],
            [
                'name' => 'Super Admin',
                'email' => 'superadmin@example.com',
                'password' => Hash::make($defaultPassword),
                'phone' => '000-0000-0000',
                'mobile' => '000-0000-0000',
                'postcode' => '00000',
                'address' => 'N/A',
                'detailed_address' => 'N/A',
                'authority' => 'super_admin',
                'headquarters' => 'HQ',
                'business_office' => 'Global',
                'team' => 'Platform',
                'position' => 'Super Admin',
                'agree_privacy' => true,
                'agree_terms' => true,
                'agreed_at' => now(),
                'remember_token' => Str::random(10),
            ]
        );

        // Store Admin
        User::firstOrCreate(
            ['username' => 'storeadmin'],
            [
                'name' => 'Store Admin',
                'email' => 'storeadmin@example.com',
                'password' => Hash::make($defaultPassword),
                'phone' => '000-0000-0001',
                'mobile' => '000-0000-0001',
                'postcode' => '00001',
                'address' => 'N/A',
                'detailed_address' => 'N/A',
                'authority' => 'store_admin',
                'headquarters' => 'HQ',
                'business_office' => 'Main Store',
                'team' => 'Store',
                'position' => 'Store Admin',
                'agree_privacy' => true,
                'agree_terms' => true,
                'agreed_at' => now(),
                'remember_token' => Str::random(10),
            ]
        );

        // Normal User (focus for staging test)
        User::firstOrCreate(
            ['username' => 'normaluser'],
            [
                'name' => 'Normal User',
                'email' => 'normaluser@example.com',
                'password' => Hash::make($defaultPassword),
                'phone' => '000-0000-0003',
                'mobile' => '000-0000-0003',
                'postcode' => '00003',
                'address' => 'N/A',
                'detailed_address' => 'N/A',
                'authority' => 'normal_user',
                'headquarters' => 'HQ',
                'business_office' => 'Online',
                'team' => 'Customer',
                'position' => 'User',
                'agree_privacy' => true,
                'agree_terms' => true,
                'agreed_at' => now(),
                'remember_token' => Str::random(10),
            ]
        );

        if (isset($this->command)) {
            $this->command->info('User roles seeded successfully!');
            $this->command->info('Login accounts (all use password: '.$defaultPassword.'):');
            $this->command->info('  - SUPER ADMIN  -> username: superadmin');
            $this->command->info('  - STORE ADMIN  -> username: storeadmin');
            $this->command->info('  - NORMAL USER  -> username: normaluser');
        }
    }
}
