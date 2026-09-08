<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ModuleCommissionsActualSeeder extends Seeder
{
    public function run()
    {
        DB::table('module_commissions')->insert([
            [
                'id' => 1,
                'user_id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'mode' => '1',
                'from_amt' => 100.00,
                'to_amt' => 1000.00,
                'commission_type' => '0',
                'commission' => 2.00,
                'status' => 1,
                'created_at' => '2025-07-07 06:20:59',
                'updated_at' => '2025-07-07 07:05:41'
            ],
            [
                'id' => 2,
                'user_id' => 1,
                'main_module_id' => 2,
                'module_id' => 2,
                'sub_module_id' => 2,
                'mode' => '0',
                'from_amt' => null,
                'to_amt' => null,
                'commission_type' => '1',
                'commission' => 3.00,
                'status' => 1,
                'created_at' => '2025-07-07 06:21:11',
                'updated_at' => '2025-07-07 06:21:11'
            ],
            [
                'id' => 3,
                'user_id' => 1,
                'main_module_id' => 2,
                'module_id' => 2,
                'sub_module_id' => 3,
                'mode' => '0',
                'from_amt' => null,
                'to_amt' => null,
                'commission_type' => '1',
                'commission' => 2.00,
                'status' => 1,
                'created_at' => '2025-07-07 06:25:36',
                'updated_at' => '2025-07-07 06:25:36'
            ],
            [
                'id' => 4,
                'user_id' => 1,
                'main_module_id' => 2,
                'module_id' => 2,
                'sub_module_id' => 4,
                'mode' => '0',
                'from_amt' => null,
                'to_amt' => null,
                'commission_type' => '1',
                'commission' => 2.00,
                'status' => 1,
                'created_at' => '2025-07-07 06:33:09',
                'updated_at' => '2025-07-07 06:33:42'
            ],
            [
                'id' => 5,
                'user_id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'mode' => '1',
                'from_amt' => 1001.00,
                'to_amt' => 2500.00,
                'commission_type' => '0',
                'commission' => 4.00,
                'status' => 1,
                'created_at' => '2025-07-07 07:06:03',
                'updated_at' => '2025-07-07 07:06:03'
            ],
            [
                'id' => 6,
                'user_id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'mode' => '1',
                'from_amt' => 2501.00,
                'to_amt' => 5000.00,
                'commission_type' => '0',
                'commission' => 7.00,
                'status' => 1,
                'created_at' => '2025-07-07 07:06:27',
                'updated_at' => '2025-07-07 07:06:27'
            ],
            [
                'id' => 7,
                'user_id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'mode' => '1',
                'from_amt' => 5001.00,
                'to_amt' => 9999.00,
                'commission_type' => '0',
                'commission' => 12.00,
                'status' => 1,
                'created_at' => '2025-07-07 07:06:59',
                'updated_at' => '2025-07-07 07:06:59'
            ],
            [
                'id' => 8,
                'user_id' => 3,
                'main_module_id' => 2,
                'module_id' => 2,
                'sub_module_id' => 2,
                'mode' => '0',
                'from_amt' => null,
                'to_amt' => null,
                'commission_type' => '1',
                'commission' => 2.00,
                'status' => 1,
                'created_at' => '2025-07-07 08:28:01',
                'updated_at' => '2025-07-07 08:28:01'
            ]
        ]);
    }
}
