<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Worker;
use Illuminate\Database\Seeder;

class WorkerSeeder extends Seeder
{
    public function run(): void
    {
        $customer = Customer::first();

        if (! $customer) {
            $this->command->warn('No customers found. Skipping WorkerSeeder.');
            return;
        }

        Worker::query()->delete();

        $workers = [
            ['name' => '홍길동', 'mobile' => '010-1234-5678'],
            ['name' => '김철수', 'mobile' => '010-2345-6789'],
            ['name' => '이영희', 'mobile' => '010-3456-7890'],
            ['name' => '박민준', 'mobile' => '010-4567-8901'],
            ['name' => '최지은', 'mobile' => '010-5678-9012'],
        ];

        foreach ($workers as $worker) {
            Worker::create([
                'customer_id' => $customer->id,
                ...$worker,
            ]);
        }
    }
}
