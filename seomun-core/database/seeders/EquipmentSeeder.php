<?php

namespace Database\Seeders;

use App\Models\Equipment;
use App\Models\EquipmentLog;
use Illuminate\Database\Seeder;

class EquipmentSeeder extends Seeder
{
    public function run(): void
    {
        EquipmentLog::query()->delete();
        Equipment::query()->delete();

        $equipments = [
            [
                'company_name'        => '서문인쇄',
                'name'                => '디지털 인쇄기 P1350 (흑백)',
                'machine_type'        => 'P1350',
                'maintenance_company' => '캐논코리아 비즈니스솔루션',
                'manager_name'        => '박인쇄',
                'manager_phone'       => '010-1234-5678',
                'introduced_at'       => '2022-03-15',
                'image'               => null,
                'work_process'        => 'printing',
                'status'              => 'active',
                'notes'               => '단가설정 P1350 연동 흑백 전용 고속 인쇄기',
            ],
            [
                'company_name'        => '서문인쇄',
                'name'                => '디지털 인쇄기 P140 (컬러)',
                'machine_type'        => 'P140',
                'maintenance_company' => '한국후지필름비즈니스이노베이션',
                'manager_name'        => '이컬러',
                'manager_phone'       => '010-9876-5432',
                'introduced_at'       => '2023-01-10',
                'image'               => null,
                'work_process'        => 'printing',
                'status'              => 'active',
                'notes'               => '단가설정 P140 연동 컬러 전용 디지털 프레스',
            ],
            [
                'company_name'        => '서문인쇄',
                'name'                => 'UV 코팅기 C2',
                'machine_type'        => null,
                'maintenance_company' => '대경테크',
                'manager_name'        => '이코팅',
                'manager_phone'       => '010-2345-6789',
                'introduced_at'       => '2023-06-20',
                'image'               => null,
                'work_process'        => 'coating',
                'status'              => 'active',
                'notes'               => null,
            ],
            [
                'company_name'        => '서문인쇄',
                'name'                => '재단기 K3',
                'machine_type'        => null,
                'maintenance_company' => '신성엔지니어링',
                'manager_name'        => '최재단',
                'manager_phone'       => '010-3456-7890',
                'introduced_at'       => '2021-11-10',
                'image'               => null,
                'work_process'        => 'cutting',
                'status'              => 'maintenance',
                'notes'               => '정기 점검 중',
            ],
            [
                'company_name'        => '서문인쇄',
                'name'                => '고속 중철 제본기 H5',
                'machine_type'        => null,
                'maintenance_company' => '한국호리존',
                'manager_name'        => '강후가공',
                'manager_phone'       => '010-5678-9012',
                'introduced_at'       => '2024-02-18',
                'image'               => null,
                'work_process'        => 'post_processing',
                'status'              => 'active',
                'notes'               => '후가공 전용 고속 중철기',
            ],
        ];

        foreach ($equipments as $data) {
            $equipment = Equipment::create($data);

            EquipmentLog::create([
                'equipment_id'        => $equipment->id,
                'log_date'            => now()->subMonths(2)->toDateString(),
                'maintenance_details' => '오일 교환 및 벨트 점검',
                'special_notes'       => '다음 점검 3개월 후',
                'cost_type'           => 'paid',
                'manager'             => '홍길동',
            ]);

            EquipmentLog::create([
                'equipment_id'        => $equipment->id,
                'log_date'            => now()->subMonth()->toDateString(),
                'maintenance_details' => '정기 청소 및 소모품 교체',
                'special_notes'       => null,
                'cost_type'           => 'free',
                'manager'             => '김철수',
            ]);
        }
    }
}
