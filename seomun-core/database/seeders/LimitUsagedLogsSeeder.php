<?php

namespace Database\Seeders;

use Database\Factories\LimitUsagedLogsFactory;
use Illuminate\Database\Seeder;

class LimitUsagedLogsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        LimitUsagedLogsFactory::new()->count(100)->create();
    }
}
