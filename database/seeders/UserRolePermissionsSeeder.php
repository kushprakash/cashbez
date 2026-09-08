<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserRolePermissionsSeeder extends Seeder
{
    public function run()
    {
        DB::table('user_role_permissions')->insert([
            [
                'id' => 45,
                'user_id' => 1,
                'role_id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'permission_id' => 1,
                'status' => 1,
                'created_at' => '2025-07-11 11:19:17',
                'updated_at' => '2025-07-11 11:19:17'
            ],
            [
                'id' => 46,
                'user_id' => 1,
                'role_id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'permission_id' => 2,
                'status' => 1,
                'created_at' => '2025-07-11 11:19:17',
                'updated_at' => '2025-07-11 11:19:17'
            ],
            [
                'id' => 47,
                'user_id' => 1,
                'role_id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'permission_id' => 3,
                'status' => 1,
                'created_at' => '2025-07-11 11:19:17',
                'updated_at' => '2025-07-11 11:19:17'
            ],
            [
                'id' => 48,
                'user_id' => 1,
                'role_id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'permission_id' => 4,
                'status' => 1,
                'created_at' => '2025-07-11 11:19:17',
                'updated_at' => '2025-07-11 11:19:17'
            ]
        ]);
    }
}
