<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\OrganizationUnit;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrganizationUnitSeeder extends Seeder
{
    /**
     * Seed organization units for testing.
     *
     * Prerequisites: at least one Customer (e.g. run PartnerSeeder first).
     *
     * Run:
     *   php artisan db:seed --class=OrganizationUnitSeeder
     *
     * Optional: run UserSeeder first so storeadmin exists; this seeder will link
     * storeadmin to the first customer so GET /api/store-admin/organization-chart returns data.
     */
    public function run(): void
    {
        $customers = Customer::limit(3)->get();

        if ($customers->isEmpty()) {
            $this->command->warn('No customers found. Run PartnerSeeder or create a customer first.');

            return;
        }

        foreach ($customers as $index => $customer) {
            $this->seedTreeForCustomer($customer, $index);
        }

        // Optionally attach first store_admin to first customer so GET /api/store-admin/organization-chart returns data
        $storeAdmin = User::where('authority', 'store_admin')->first();
        $firstCustomer = $customers->first();
        if ($storeAdmin && $firstCustomer && $storeAdmin->customer_id !== $firstCustomer->id) {
            $storeAdmin->update(['customer_id' => $firstCustomer->id]);
            $this->command->info('Store admin ('.$storeAdmin->username.') linked to customer_id '.$firstCustomer->id.' for org chart testing.');
        }

        $this->command->info('Organization units seeded for '.$customers->count().' customer(s).');
    }

    private function seedTreeForCustomer(Customer $customer, int $index): void
    {
        // Avoid duplicate trees if seeder is run multiple times
        if (OrganizationUnit::where('customer_id', $customer->id)->exists()) {
            return;
        }

        $so = 0;

        // Level 1: Headquarters
        $hq1 = OrganizationUnit::create([
            'customer_id' => $customer->id,
            'parent_id' => null,
            'level' => 'headquarters',
            'name_ko' => $index === 0 ? '서울 본부' : '부산 본부',
            'name_en' => $index === 0 ? 'Seoul HQ' : 'Busan HQ',
            'code' => 'HQ'.($index + 1),
            'position' => null,
            'sort_order' => $so++,
            'is_active' => true,
        ]);

        $hq2 = OrganizationUnit::create([
            'customer_id' => $customer->id,
            'parent_id' => null,
            'level' => 'headquarters',
            'name_ko' => '경기 본부',
            'name_en' => 'Gyeonggi HQ',
            'code' => 'HQ'.($index + 1).'-2',
            'position' => null,
            'sort_order' => $so++,
            'is_active' => true,
        ]);

        // Level 2: Business office under Seoul HQ
        $bo1 = OrganizationUnit::create([
            'customer_id' => $customer->id,
            'parent_id' => $hq1->id,
            'level' => 'business_office',
            'name_ko' => '강남 사업소',
            'name_en' => 'Gangnam Office',
            'code' => 'BO-GANGNAM',
            'position' => null,
            'sort_order' => 0,
            'is_active' => true,
        ]);

        $bo2 = OrganizationUnit::create([
            'customer_id' => $customer->id,
            'parent_id' => $hq1->id,
            'level' => 'business_office',
            'name_ko' => '판교 사업소',
            'name_en' => 'Pangyo Office',
            'code' => 'BO-PANGYO',
            'position' => null,
            'sort_order' => 1,
            'is_active' => true,
        ]);

        // Level 3: Teams under Gangnam Office
        OrganizationUnit::create([
            'customer_id' => $customer->id,
            'parent_id' => $bo1->id,
            'level' => 'team',
            'name_ko' => '디자인팀',
            'name_en' => 'Design Team',
            'code' => 'TEAM-DESIGN',
            'position' => 'Manager',
            'sort_order' => 0,
            'is_active' => true,
        ]);

        OrganizationUnit::create([
            'customer_id' => $customer->id,
            'parent_id' => $bo1->id,
            'level' => 'team',
            'name_ko' => '영업팀',
            'name_en' => 'Sales Team',
            'code' => 'TEAM-SALES',
            'position' => 'Director',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        // One team under Pangyo Office
        OrganizationUnit::create([
            'customer_id' => $customer->id,
            'parent_id' => $bo2->id,
            'level' => 'team',
            'name_ko' => '개발팀',
            'name_en' => 'Dev Team',
            'code' => 'TEAM-DEV',
            'position' => 'Team Lead',
            'sort_order' => 0,
            'is_active' => true,
        ]);

        // One business office + team under Gyeonggi HQ
        $bo3 = OrganizationUnit::create([
            'customer_id' => $customer->id,
            'parent_id' => $hq2->id,
            'level' => 'business_office',
            'name_ko' => '수원 사업소',
            'name_en' => 'Suwon Office',
            'code' => 'BO-SUWON',
            'position' => null,
            'sort_order' => 0,
            'is_active' => true,
        ]);

        OrganizationUnit::create([
            'customer_id' => $customer->id,
            'parent_id' => $bo3->id,
            'level' => 'team',
            'name_ko' => '생산팀',
            'name_en' => 'Production Team',
            'code' => 'TEAM-PROD',
            'position' => 'Manager',
            'sort_order' => 0,
            'is_active' => true,
        ]);
    }
}
