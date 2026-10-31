<?php

namespace Database\Seeders;

use App\Models\AdminPermission;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AdminPermissionTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first user as created_by (or create a dummy one if none exists)
        $createdBy = User::first();
        if (! $createdBy) {
            $createdBy = User::create([
                'name' => 'System Admin',
                'username' => 'system_admin',
                'email' => 'system@example.com',
                'password' => bcrypt('password'),
                'authority' => 'master',
            ]);
        }

        $permissions = [
            [
                'name' => 'Master Admin',
                'description' => 'Full administrative access to all features',
                'usage_status' => 'active',
                'menu_permissions' => [
                    [
                        'menu' => 'member_list',
                        'actions' => ['view', 'register', 'edit', 'delete', 'approval'],
                    ],
                    [
                        'menu' => 'member_registration',
                        'actions' => ['view', 'register', 'edit', 'delete'],
                    ],
                    [
                        'menu' => 'customer_list',
                        'actions' => ['view', 'register', 'edit', 'delete'],
                    ],
                    [
                        'menu' => 'customer_registration',
                        'actions' => ['view', 'register', 'edit'],
                    ],
                    [
                        'menu' => 'approval_management',
                        'actions' => ['view', 'approval', 'edit'],
                    ],
                    [
                        'menu' => 'exposure_control',
                        'actions' => ['view', 'edit'],
                    ],
                ],
            ],
            [
                'name' => 'Member Manager',
                'description' => 'Can manage members only',
                'usage_status' => 'active',
                'menu_permissions' => [
                    [
                        'menu' => 'member_list',
                        'actions' => ['view', 'register', 'edit', 'delete'],
                    ],
                    [
                        'menu' => 'member_registration',
                        'actions' => ['view', 'register', 'edit'],
                    ],
                ],
            ],
            [
                'name' => 'Customer Manager',
                'description' => 'Can manage customers only',
                'usage_status' => 'active',
                'menu_permissions' => [
                    [
                        'menu' => 'customer_list',
                        'actions' => ['view', 'register', 'edit', 'delete'],
                    ],
                    [
                        'menu' => 'customer_registration',
                        'actions' => ['view', 'register', 'edit'],
                    ],
                    [
                        'menu' => 'approval_management',
                        'actions' => ['view', 'approval'],
                    ],
                ],
            ],
            [
                'name' => 'View Only',
                'description' => 'Read-only access to all features',
                'usage_status' => 'active',
                'menu_permissions' => [
                    [
                        'menu' => 'member_list',
                        'actions' => ['view'],
                    ],
                    [
                        'menu' => 'member_registration',
                        'actions' => ['view'],
                    ],
                    [
                        'menu' => 'customer_list',
                        'actions' => ['view'],
                    ],
                    [
                        'menu' => 'customer_registration',
                        'actions' => ['view'],
                    ],
                    [
                        'menu' => 'approval_management',
                        'actions' => ['view'],
                    ],
                    [
                        'menu' => 'exposure_control',
                        'actions' => ['view'],
                    ],
                ],
            ],
            [
                'name' => 'Approval Manager',
                'description' => 'Can only approve customers',
                'usage_status' => 'active',
                'menu_permissions' => [
                    [
                        'menu' => 'approval_management',
                        'actions' => ['view', 'approval'],
                    ],
                    [
                        'menu' => 'customer_list',
                        'actions' => ['view'],
                    ],
                ],
            ],
            [
                'name' => 'Inactive Permission',
                'description' => 'This permission is inactive for testing',
                'usage_status' => 'inactive',
                'menu_permissions' => [
                    [
                        'menu' => 'member_list',
                        'actions' => ['view'],
                    ],
                ],
            ],
            [
                'name' => 'Order Manager',
                'description' => 'Can manage orders only',
                'usage_status' => 'inactive',
                'menu_permissions' => [
                    [
                        'menu' => 'customer_list',
                        'actions' => ['view'],
                    ],
                ],
            ],
        ];

        DB::transaction(function () use ($permissions, $createdBy) {
            foreach ($permissions as $permissionData) {
                // Check if permission already exists
                $existing = AdminPermission::where('name', $permissionData['name'])->first();

                if (! $existing) {
                    AdminPermission::create([
                        'name' => $permissionData['name'],
                        'description' => $permissionData['description'],
                        'usage_status' => $permissionData['usage_status'],
                        'menu_permissions' => $permissionData['menu_permissions'],
                        'created_by' => $createdBy->id,
                    ]);
                    $this->command->info("Created permission: {$permissionData['name']}");
                } else {
                    $this->command->warn("Permission '{$permissionData['name']}' already exists, skipping...");
                }
            }
        });

        $this->command->info('Admin Permission seeding completed!');
        $this->command->info('Total permissions: '.AdminPermission::count());
    }
}
