<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserRoleCommissionsSeeder extends Seeder
{
    public function run()
    {
        DB::table('user_role_commissions')->insert([
            [
                'id' => 3,
                'user_id' => 3,
                'role_id' => 2,
                'main_module_id' => 1,
                'module_id' => 2,
                'sub_module_id' => 2,
                'commission_id' => 2,
                'status' => 1,
                'created_at' => '2025-07-07 08:00:27',
                'updated_at' => '2025-07-07 08:00:27'
            ],
            [
                'id' => 4,
                'user_id' => 3,
                'role_id' => 2,
                'main_module_id' => 1,
                'module_id' => 2,
                'sub_module_id' => 3,
                'commission_id' => 3,
                'status' => 1,
                'created_at' => '2025-07-07 08:00:27',
                'updated_at' => '2025-07-07 08:00:27'
            ],
            [
                'id' => 7,
                'user_id' => 10,
                'role_id' => 5,
                'main_module_id' => 1,
                'module_id' => 2,
                'sub_module_id' => 2,
                'commission_id' => 2,
                'status' => 1,
                'created_at' => '2025-07-07 08:00:27',
                'updated_at' => '2025-07-07 08:00:27'
            ],
            [
                'id' => 8,
                'user_id' => 10,
                'role_id' => 5,
                'main_module_id' => 1,
                'module_id' => 2,
                'sub_module_id' => 2,
                'commission_id' => 8,
                'status' => 1,
                'created_at' => '2025-07-07 08:00:27',
                'updated_at' => '2025-07-07 08:00:27'
            ],
            [
                'id' => 9,
                'user_id' => 11,
                'role_id' => 5,
                'main_module_id' => 1,
                'module_id' => 2,
                'sub_module_id' => 2,
                'commission_id' => 2,
                'status' => 1,
                'created_at' => '2025-07-08 02:08:52',
                'updated_at' => '2025-07-08 02:08:52'
            ],
            [
                'id' => 10,
                'user_id' => 11,
                'role_id' => 5,
                'main_module_id' => 1,
                'module_id' => 2,
                'sub_module_id' => 2,
                'commission_id' => 8,
                'status' => 1,
                'created_at' => '2025-07-08 02:08:52',
                'updated_at' => '2025-07-08 02:08:52'
            ]
        ]);
    }
}
