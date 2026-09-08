<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ModulePermissionsSeeder extends Seeder
{
    public function run()
    {
        DB::table('module_permissions')->insert([
            [
                'id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'name' => 'AEPS Withdrawal',
                'endpoint' => 'aeps/withdrawal',
                'route' => 'aeps/withdrawal',
                'status' => 0,
                'created_at' => '2025-07-05 03:18:23',
                'updated_at' => '2025-07-05 23:20:30'
            ],
            [
                'id' => 2,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'name' => 'AEPS Balance Enquery',
                'endpoint' => 'aeps/balance-enquiry',
                'route' => 'aeps/balance-enquiry',
                'status' => 1,
                'created_at' => '2025-07-05 03:19:20',
                'updated_at' => '2025-07-05 03:19:20'
            ],
            [
                'id' => 3,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'name' => 'AEPS Mini Statement',
                'endpoint' => 'aeps/mini-statement',
                'route' => 'aeps/mini-statement',
                'status' => 1,
                'created_at' => '2025-07-05 03:19:47',
                'updated_at' => '2025-07-05 03:19:47'
            ],
            [
                'id' => 4,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'name' => 'AEPS Transaction Report',
                'endpoint' => 'aeps/report',
                'route' => 'aeps/report',
                'status' => 1,
                'created_at' => '2025-07-05 03:20:11',
                'updated_at' => '2025-07-05 03:20:11'
            ],
            [
                'id' => 5,
                'main_module_id' => 2,
                'module_id' => 2,
                'sub_module_id' => 2,
                'name' => 'Mobile Recharge',
                'endpoint' => 'mobile/recharge',
                'route' => 'mobile/recharge',
                'status' => 1,
                'created_at' => '2025-07-05 03:20:54',
                'updated_at' => '2025-07-05 03:20:54'
            ],
            [
                'id' => 6,
                'main_module_id' => 2,
                'module_id' => 2,
                'sub_module_id' => 2,
                'name' => 'Mobile Recharge Report',
                'endpoint' => 'mobile/recharge-report',
                'route' => 'mobile/recharge-report',
                'status' => 1,
                'created_at' => '2025-07-05 03:21:20',
                'updated_at' => '2025-07-05 03:21:20'
            ],
            [
                'id' => 7,
                'main_module_id' => 2,
                'module_id' => 2,
                'sub_module_id' => 3,
                'name' => 'DTH Recharge',
                'endpoint' => 'dth/recharge',
                'route' => 'dth/recharge',
                'status' => 1,
                'created_at' => '2025-07-05 03:21:43',
                'updated_at' => '2025-07-05 03:21:43'
            ],
            [
                'id' => 8,
                'main_module_id' => 2,
                'module_id' => 2,
                'sub_module_id' => 3,
                'name' => 'DTH Recharge Report',
                'endpoint' => 'dth/recharge-report',
                'route' => 'dth/recharge-report',
                'status' => 1,
                'created_at' => '2025-07-05 03:22:05',
                'updated_at' => '2025-07-05 03:22:05'
            ],
            [
                'id' => 9,
                'main_module_id' => 2,
                'module_id' => 2,
                'sub_module_id' => 4,
                'name' => 'Bill Fetch',
                'endpoint' => 'bill/fetch',
                'route' => 'bill/fetch',
                'status' => 1,
                'created_at' => '2025-07-05 03:22:34',
                'updated_at' => '2025-07-05 09:08:51'
            ],
            [
                'id' => 10,
                'main_module_id' => 2,
                'module_id' => 2,
                'sub_module_id' => 4,
                'name' => 'Bill Pay',
                'endpoint' => 'bill/pay',
                'route' => 'bill/pay',
                'status' => 1,
                'created_at' => '2025-07-05 03:22:50',
                'updated_at' => '2025-07-05 03:22:50'
            ],
            [
                'id' => 11,
                'main_module_id' => 2,
                'module_id' => 2,
                'sub_module_id' => 4,
                'name' => 'Bill Payment Report',
                'endpoint' => 'bill/payment-report',
                'route' => 'bill/payment-report',
                'status' => 1,
                'created_at' => '2025-07-05 03:23:18',
                'updated_at' => '2025-07-05 03:23:18'
            ]
        ]);
    }
}
