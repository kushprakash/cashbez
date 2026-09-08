<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleModuleCommissionsSeeder extends Seeder
{
    public function run()
    {
        DB::table('role_module_commissions')->insert([
            [
                'id' => 1,
                'role_id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'commission_id' => 1,
                'commission' => '2.50',
                'created_at' => '2025-07-04 10:13:21',
                'updated_at' => '2025-07-04 10:13:21'
            ],
            [
                'id' => 2,
                'role_id' => 1,
                'main_module_id' => 1,
                'module_id' => 2,
                'commission_id' => 2,
                'commission' => '5.50',
                'created_at' => '2025-07-04 10:13:21',
                'updated_at' => '2025-07-04 10:13:21'
            ],
            [
                'id' => 3,
                'role_id' => 1,
                'main_module_id' => 1,
                'module_id' => 3,
                'commission_id' => 3,
                'commission' => '1.50',
                'created_at' => '2025-07-04 10:13:21',
                'updated_at' => '2025-07-04 10:13:21'
            ],
            [
                'id' => 4,
                'role_id' => 1,
                'main_module_id' => 1,
                'module_id' => 4,
                'commission_id' => 4,
                'commission' => '1.50',
                'created_at' => '2025-07-04 10:13:21',
                'updated_at' => '2025-07-04 10:13:21'
            ],
            [
                'id' => 5,
                'role_id' => 1,
                'main_module_id' => 2,
                'module_id' => 5,
                'commission_id' => 5,
                'commission' => '3.50',
                'created_at' => '2025-07-04 10:13:21',
                'updated_at' => '2025-07-04 10:13:21'
            ],
            [
                'id' => 6,
                'role_id' => 1,
                'main_module_id' => 2,
                'module_id' => 6,
                'commission_id' => 6,
                'commission' => '3.50',
                'created_at' => '2025-07-04 10:13:21',
                'updated_at' => '2025-07-04 10:13:21'
            ],
            [
                'id' => 7,
                'role_id' => 1,
                'main_module_id' => 2,
                'module_id' => 7,
                'commission_id' => 7,
                'commission' => '3.50',
                'created_at' => '2025-07-04 10:13:21',
                'updated_at' => '2025-07-04 10:13:21'
            ],
            [
                'id' => 8,
                'role_id' => 1,
                'main_module_id' => 2,
                'module_id' => 8,
                'commission_id' => 8,
                'commission' => '3.50',
                'created_at' => '2025-07-04 10:13:21',
                'updated_at' => '2025-07-04 10:13:21'
            ]
        ]);
    }
}
