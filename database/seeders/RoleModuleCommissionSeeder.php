<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleModuleCommissionSeeder extends Seeder
{
    public function run()
    {
        DB::table('role_module_commission')->insert([
            [
                'id' => 1,
                'user_id' => 1,
                'role_id' => 2,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'commission_id' => 1,
                'status' => 1,
                'created_at' => '2025-07-07 07:17:08',
                'updated_at' => '2025-07-07 07:17:08'
            ],
            [
                'id' => 2,
                'user_id' => 1,
                'role_id' => 2,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'commission_id' => 5,
                'status' => 1,
                'created_at' => '2025-07-07 07:17:08',
                'updated_at' => '2025-07-07 07:17:08'
            ],
            [
                'id' => 3,
                'user_id' => 1,
                'role_id' => 2,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'commission_id' => 6,
                'status' => 1,
                'created_at' => '2025-07-07 07:17:09',
                'updated_at' => '2025-07-07 07:17:09'
            ],
            [
                'id' => 4,
                'user_id' => 1,
                'role_id' => 2,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'commission_id' => 7,
                'status' => 1,
                'created_at' => '2025-07-07 07:17:09',
                'updated_at' => '2025-07-07 07:17:09'
            ],
            [
                'id' => 5,
                'user_id' => 1,
                'role_id' => 2,
                'main_module_id' => 1,
                'module_id' => 2,
                'sub_module_id' => 2,
                'commission_id' => 2,
                'status' => 1,
                'created_at' => '2025-07-07 07:17:09',
                'updated_at' => '2025-07-07 07:17:09'
            ],
            [
                'id' => 6,
                'user_id' => 1,
                'role_id' => 2,
                'main_module_id' => 1,
                'module_id' => 2,
                'sub_module_id' => 3,
                'commission_id' => 3,
                'status' => 1,
                'created_at' => '2025-07-07 07:17:09',
                'updated_at' => '2025-07-07 07:17:09'
            ],
            [
                'id' => 7,
                'user_id' => 3,
                'role_id' => 8,
                'main_module_id' => 1,
                'module_id' => 2,
                'sub_module_id' => 2,
                'commission_id' => 2,
                'status' => 1,
                'created_at' => '2025-07-07 08:34:30',
                'updated_at' => '2025-07-07 08:34:30'
            ],
            [
                'id' => 8,
                'user_id' => 1,
                'role_id' => 5,
                'main_module_id' => 1,
                'module_id' => 2,
                'sub_module_id' => 2,
                'commission_id' => 2,
                'status' => 1,
                'created_at' => '2025-07-07 10:52:02',
                'updated_at' => '2025-07-07 10:52:02'
            ],
            [
                'id' => 9,
                'user_id' => 1,
                'role_id' => 5,
                'main_module_id' => 1,
                'module_id' => 2,
                'sub_module_id' => 2,
                'commission_id' => 8,
                'status' => 1,
                'created_at' => '2025-07-07 10:52:02',
                'updated_at' => '2025-07-07 10:52:02'
            ]
        ]);
    }
}
