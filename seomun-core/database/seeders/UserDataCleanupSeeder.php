<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserDataCleanupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Cleanup user data by removing factory-created users.
     * Keeps only users from UserSeeder (superadmin, storeadmin, normaluser).
     * You can add additional usernames or emails to keep (only need one of them).
     */
    public function run(): void
    {
        $this->command->info('Starting user data cleanup...');

        // List of usernames that should be kept (from UserSeeder + additional)
        // You can add usernames here even if you don't know the email
        $seederUsernames = [
            'superadmin',
            'storeadmin',
            'normaluser',
            'hong123',
            'admin001',
            'leekangin',
            'john_manager',
            'jane_customer',
            'bob_approver',
            'alice_member',
            'charlie_viewer',
            'ABC123_admin',
            'bdmjnnpv123_admin',
            'abc123456_admin',
            'poong',
            // Add more usernames here if needed (e.g., 'admin', 'testuser', etc.)
        ];

        // List of emails that should be kept (from UserSeeder + additional)
        // You can add emails here even if you don't know the username
        $seederEmails = [
            'superadmin@example.com',
            'storeadmin@example.com',
            'normaluser@example.com',
            // Add more emails here if needed (e.g., 'admin@company.com', 'test@example.com', etc.)
        ];

        // Disable foreign key checks temporarily
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        try {
            // Get all users
            $allUsers = User::all();
            $totalUsers = $allUsers->count();

            $this->command->info("Total users found: {$totalUsers}");

            // Find users to delete (not from UserSeeder)
            $usersToDelete = User::whereNotIn('username', $seederUsernames)
                ->whereNotIn('email', $seederEmails)
                ->get();

            $deletedCount = 0;
            $deletedUsernames = [];

            foreach ($usersToDelete as $user) {
                // Check if user has related data that might cause issues
                $hasOrders = DB::table('orders')->where('user_id', $user->id)->exists();
                $hasCartItems = DB::table('cart_items')
                    ->join('carts', 'cart_items.cart_id', '=', 'carts.id')
                    ->where('carts.user_id', $user->id)
                    ->exists();
                $hasAddressBooks = DB::table('address_books')->where('user_id', $user->id)->exists();

                if ($hasOrders || $hasCartItems || $hasAddressBooks) {
                    $this->command->warn("Skipping user '{$user->username}' (ID: {$user->id}) - has related data (orders, cart items, or address books)");

                    continue;
                }

                // Delete related data first
                DB::table('address_books')->where('user_id', $user->id)->delete();
                DB::table('recently_viewed_products')->where('user_id', $user->id)->delete();
                DB::table('user_coupons')->where('user_id', $user->id)->delete();
                DB::table('user_admin_permissions')->where('user_id', $user->id)->delete();

                // Delete user
                $deletedUsernames[] = $user->username;
                $user->delete();
                $deletedCount++;
            }

            if ($deletedCount > 0) {
                $this->command->info("Deleted {$deletedCount} factory-created users:");
                foreach ($deletedUsernames as $username) {
                    $this->command->info("  - {$username}");
                }
            } else {
                $this->command->info('No factory-created users found to delete.');
            }

            // Verify kept users
            $keptUsers = User::whereIn('username', $seederUsernames)
                ->orWhereIn('email', $seederEmails)
                ->get();

            $this->command->info('');
            $this->command->info('Kept users from UserSeeder:');
            foreach ($keptUsers as $user) {
                $this->command->info("  - {$user->username} ({$user->email})");
            }

            // Check for users with related data that couldn't be deleted
            $remainingFactoryUsers = User::whereNotIn('username', $seederUsernames)
                ->whereNotIn('email', $seederEmails)
                ->count();

            if ($remainingFactoryUsers > 0) {
                $this->command->warn('');
                $this->command->warn("Warning: {$remainingFactoryUsers} factory-created users still exist.");
                $this->command->warn('These users have related data (orders, cart items, etc.) and were not deleted.');
                $this->command->warn('You may need to manually review and delete them if needed.');
            }

        } finally {
            // Re-enable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }

        $finalCount = User::count();
        $this->command->info('');
        $this->command->info('User data cleanup completed!');
        $this->command->info("Final user count: {$finalCount}");
    }
}
