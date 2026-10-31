<?php

namespace Database\Seeders;

use App\Enums\ApprovalStatus;
use App\Enums\UserStatus;
use App\Models\AdminPermission;
use App\Models\Customer;
use App\Models\User;
use App\Models\UserAdminPermission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class UserAdminPermissionTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create admin user (created_by)
        $adminUser = User::where('authority', 'master')->first();
        if (! $adminUser) {
            $adminUser = User::first();
            if (! $adminUser) {
                $adminUser = User::create([
                    'name' => 'Super Admin',
                    'username' => 'super_admin',
                    'email' => 'superadmin@example.com',
                    'password' => bcrypt('password'),
                    'authority' => 'master',
                ]);
            }
        }

        // Get admin permissions (should run AdminPermissionTestSeeder first)
        $permissions = AdminPermission::all();
        if ($permissions->isEmpty()) {
            $this->command->warn('No admin permissions found. Please run AdminPermissionTestSeeder first.');
            $this->command->info('Running AdminPermissionTestSeeder...');
            $this->call(AdminPermissionTestSeeder::class);
            $permissions = AdminPermission::all();
        }

        // Get or create test users
        $users = $this->getOrCreateTestUsers($adminUser);

        // Get customers for users
        $customers = Customer::all();
        if ($customers->isEmpty()) {
            $this->command->warn('No customers found. Creating test customers...');
            $customers = collect($this->createTestCustomers());
        }

        // Assign customers to some users
        $this->assignCustomersToUsers($users, $customers);

        // Create user permissions
        $userPermissions = [
            // User 1: Master Admin permission (active)
            [
                'user' => $users[0],
                'permission' => $permissions->where('name', 'Master Admin')->first(),
                'status' => 'active',
                'grant_date' => now()->subDays(30),
            ],
            // User 1: Member Manager permission (active)
            [
                'user' => $users[0],
                'permission' => $permissions->where('name', 'Member Manager')->first(),
                'status' => 'active',
                'grant_date' => now()->subDays(15),
            ],
            // User 2: Customer Manager permission (active)
            [
                'user' => $users[1],
                'permission' => $permissions->where('name', 'Customer Manager')->first(),
                'status' => 'active',
                'grant_date' => now()->subDays(20),
            ],
            // User 2: View Only permission (active)
            [
                'user' => $users[1],
                'permission' => $permissions->where('name', 'View Only')->first(),
                'status' => 'active',
                'grant_date' => now()->subDays(10),
            ],
            // User 3: Approval Manager permission (active)
            [
                'user' => $users[2],
                'permission' => $permissions->where('name', 'Approval Manager')->first(),
                'status' => 'active',
                'grant_date' => now()->subDays(5),
            ],
            // User 3: View Only permission (inactive) - for testing inactive filter
            [
                'user' => $users[2],
                'permission' => $permissions->where('name', 'View Only')->first(),
                'status' => 'inactive',
                'grant_date' => now()->subDays(3),
            ],
            // User 4: Member Manager permission (active)
            [
                'user' => $users[3],
                'permission' => $permissions->where('name', 'Member Manager')->first(),
                'status' => 'active',
                'grant_date' => now()->subDays(7),
            ],
            // User 5: Customer Manager permission (inactive) - for testing
            [
                'user' => $users[4],
                'permission' => $permissions->where('name', 'Customer Manager')->first(),
                'status' => 'inactive',
                'grant_date' => now()->subDays(1),
            ],
        ];

        DB::transaction(function () use ($userPermissions, $adminUser) {
            foreach ($userPermissions as $upData) {
                if (! $upData['user'] || ! $upData['permission']) {
                    continue;
                }

                // Check if already exists
                $existing = UserAdminPermission::where('user_id', $upData['user']->id)
                    ->where('admin_permission_id', $upData['permission']->id)
                    ->first();

                if (! $existing) {
                    UserAdminPermission::create([
                        'user_id' => $upData['user']->id,
                        'admin_permission_id' => $upData['permission']->id,
                        'status' => $upData['status'],
                        'grant_date' => $upData['grant_date'],
                        'created_by' => $adminUser->id,
                    ]);
                    $this->command->info("Created user permission: {$upData['user']->name} -> {$upData['permission']->name} ({$upData['status']})");
                } else {
                    $this->command->warn("User permission already exists: {$upData['user']->name} -> {$upData['permission']->name}, skipping...");
                }
            }
        });

        $this->command->info('User Admin Permission seeding completed!');
        $this->command->info('Total user permissions: '.UserAdminPermission::count());
    }

    /**
     * Get or create test users
     */
    private function getOrCreateTestUsers(User $adminUser): array
    {
        $users = [];

        $userData = [
            [
                'name' => 'John Manager',
                'username' => 'john_manager',
                'email' => 'john.manager@example.com',
                'authority' => 'employee',
            ],
            [
                'name' => 'Jane Customer',
                'username' => 'jane_customer',
                'email' => 'jane.customer@example.com',
                'authority' => 'employee',
            ],
            [
                'name' => 'Bob Approver',
                'username' => 'bob_approver',
                'email' => 'bob.approver@example.com',
                'authority' => 'team_approval',
            ],
            [
                'name' => 'Alice Member',
                'username' => 'alice_member',
                'email' => 'alice.member@example.com',
                'authority' => 'employee',
            ],
            [
                'name' => 'Charlie Viewer',
                'username' => 'charlie_viewer',
                'email' => 'charlie.viewer@example.com',
                'authority' => 'employee',
            ],
        ];

        foreach ($userData as $data) {
            $user = User::where('email', $data['email'])->first();
            if (! $user) {
                $user = User::create([
                    'name' => $data['name'],
                    'username' => $data['username'],
                    'email' => $data['email'],
                    'password' => bcrypt('password'),
                    'authority' => $data['authority'],
                    'status' => UserStatus::ACTIVE,
                    'approval_status' => ApprovalStatus::ACCEPTED,
                ]);
                $this->command->info("Created user: {$user->name}");
            }
            $users[] = $user;
        }

        return $users;
    }

    /**
     * Create test customers
     */
    private function createTestCustomers(): array
    {
        $customers = [];
        $customerData = [
            [
                'company_name' => 'ABC Corporation',
                'business_registration_number' => '123-45-67890',
                'representative_name' => 'John Doe',
                'contact_name' => 'John Manager',
                'contact_email' => 'contact@abc.com',
                'contact_phone' => '010-1234-5678',
                'status' => 'active',
                'approval_status' => ApprovalStatus::ACCEPTED,
            ],
            [
                'company_name' => 'XYZ Company',
                'business_registration_number' => '987-65-43210',
                'representative_name' => 'Jane Smith',
                'contact_name' => 'Jane Customer',
                'contact_email' => 'contact@xyz.com',
                'contact_phone' => '010-9876-5432',
                'status' => 'active',
                'approval_status' => ApprovalStatus::ACCEPTED,
            ],
        ];

        foreach ($customerData as $data) {
            $customer = Customer::where('business_registration_number', $data['business_registration_number'])->first();
            if (! $customer) {
                $customer = Customer::create($data);
                $this->command->info("Created customer: {$customer->company_name}");
            }
            $customers[] = $customer;
        }

        return $customers;
    }

    /**
     * Assign customers to users
     */
    private function assignCustomersToUsers(array $users, Collection $customers): void
    {
        if ($customers->isEmpty()) {
            return;
        }

        // Assign first customer to first 2 users
        if (isset($users[0]) && $customers->count() > 0) {
            $users[0]->update(['customer_id' => $customers[0]->id]);
        }
        if (isset($users[1]) && $customers->count() > 0) {
            $users[1]->update(['customer_id' => $customers[0]->id]);
        }

        // Assign second customer to next 2 users
        if (isset($users[2]) && $customers->count() > 1) {
            $users[2]->update(['customer_id' => $customers[1]->id]);
        }
        if (isset($users[3]) && $customers->count() > 1) {
            $users[3]->update(['customer_id' => $customers[1]->id]);
        }
    }
}
