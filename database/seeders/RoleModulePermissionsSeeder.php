<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleModulePermissionsSeeder extends Seeder
{
    public function run()
    {
        DB::table('role_module_permissions')->insert([
            [
                'id' => 1,
                'user_id' => 1,
                'role_id' => 2,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'permission_id' => 1,
                'status' => 1,
                'created_at' => '2025-07-07 06:19:55',
                'updated_at' => '2025-07-07 06:19:55'
            ],
            [
                'id' => 2,
                'user_id' => 1,
                'role_id' => 2,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'permission_id' => 2,
                'status' => 1,
                'created_at' => '2025-07-07 06:19:55',
                'updated_at' => '2025-07-07 06:19:55'
            ],
            [
                'id' => 3,
                'user_id' => 1,
                'role_id' => 2,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'permission_id' => 3,
                'status' => 1,
                'created_at' => '2025-07-07 06:19:56',
                'updated_at' => '2025-07-07 06:19:56'
            ],
            [
                'id' => 4,
                'user_id' => 1,
                'role_id' => 2,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'permission_id' => 4,
                'status' => 1,
                'created_at' => '2025-07-07 06:19:56',
                'updated_at' => '2025-07-07 06:19:56'
            ],
            [
                'id' => 5,
                'user_id' => 1,
                'role_id' => 2,
                'main_module_id' => 2,
                'module_id' => 2,
                'sub_module_id' => 2,
                'permission_id' => 5,
                'status' => 1,
                'created_at' => '2025-07-07 06:19:56',
                'updated_at' => '2025-07-07 06:19:56'
            ],
            [
                'id' => 6,
                'user_id' => 1,
                'role_id' => 2,
                'main_module_id' => 2,
                'module_id' => 2,
                'sub_module_id' => 2,
                'permission_id' => 6,
                'status' => 1,
                'created_at' => '2025-07-07 06:19:56',
                'updated_at' => '2025-07-07 06:19:56'
            ],
            [
                'id' => 7,
                'user_id' => 3,
                'role_id' => 8,
                'main_module_id' => 2,
                'module_id' => 2,
                'sub_module_id' => 2,
                'permission_id' => 5,
                'status' => 1,
                'created_at' => '2025-07-07 08:21:24',
                'updated_at' => '2025-07-07 08:21:24'
            ],
            [
                'id' => 8,
                'user_id' => 1,
                'role_id' => 5,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'permission_id' => 1,
                'status' => 1,
                'created_at' => '2025-07-07 10:43:58',
                'updated_at' => '2025-07-07 10:43:58'
            ],
            [
                'id' => 9,
                'user_id' => 1,
                'role_id' => 5,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'permission_id' => 2,
                'status' => 1,
                'created_at' => '2025-07-07 10:43:58',
                'updated_at' => '2025-07-07 10:43:58'
            ],
            [
                'id' => 10,
                'user_id' => 1,
                'role_id' => 5,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'permission_id' => 3,
                'status' => 1,
                'created_at' => '2025-07-07 10:43:58',
                'updated_at' => '2025-07-07 10:43:58'
            ],
            [
                'id' => 11,
                'user_id' => 1,
                'role_id' => 5,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'permission_id' => 4,
                'status' => 1,
                'created_at' => '2025-07-07 10:43:58',
                'updated_at' => '2025-07-07 10:43:58'
            ],
            [
                'id' => 12,
                'user_id' => 1,
                'role_id' => 5,
                'main_module_id' => 2,
                'module_id' => 2,
                'sub_module_id' => 2,
                'permission_id' => 5,
                'status' => 1,
                'created_at' => '2025-07-07 10:43:58',
                'updated_at' => '2025-07-07 10:43:58'
            ],
            [
                'id' => 13,
                'user_id' => 1,
                'role_id' => 5,
                'main_module_id' => 2,
                'module_id' => 2,
                'sub_module_id' => 2,
                'permission_id' => 6,
                'status' => 1,
                'created_at' => '2025-07-07 10:43:59',
                'updated_at' => '2025-07-07 10:43:59'
            ]
        ]);
    }
}
