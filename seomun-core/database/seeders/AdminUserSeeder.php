<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['username' => 'admin'],
            [
                'name'             => '관리자',
                'email'            => 'admin@seomun.com',
                'password'         => bcrypt('admin1234@'),
                'phone'            => '02-1234-5678',
                'mobile'           => '010-1234-5678',
                'postcode'         => '03172',
                'address'          => '서울시 종로구 세종대로 1',
                'detailed_address' => '101호',
                'authority'        => 'super_admin',
                'headquarters'     => '서문인쇄',
                'business_office'  => '본사',
                'team'             => '관리팀',
                'position'         => '관리자',
                'agree_privacy'    => true,
                'agree_terms'      => true,
                'agreed_at'        => now(),
                'remember_token'   => Str::random(10),
            ]
        );

        $this->command->info('Admin user created: username=admin / password=admin1234@');
    }
}
