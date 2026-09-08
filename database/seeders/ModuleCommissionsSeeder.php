<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ModuleCommissionsSeeder extends Seeder
{
    public function run()
    {
        DB::table('module_commissions')->insert([
            [
                'id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'commission_name' => 'UIDAI Aadhar Pay',
                'commission_type' => 'percentage',
                'description' => 'UIDAI Aadhar Pay',
                'created_at' => '2025-07-04 09:31:36',
                'updated_at' => '2025-07-04 09:31:36'
            ],
            [
                'id' => 2,
                'main_module_id' => 1,
                'module_id' => 2,
                'commission_name' => 'Cash Withdrawal',
                'commission_type' => 'percentage',
                'description' => 'UIDAI Cash Withdrawal',
                'created_at' => '2025-07-04 09:32:24',
                'updated_at' => '2025-07-04 09:32:24'
            ],
            [
                'id' => 3,
                'main_module_id' => 1,
                'module_id' => 3,
                'commission_name' => 'Balance Enquiry',
                'commission_type' => 'fixed',
                'description' => 'Balance Enquiry',
                'created_at' => '2025-07-04 09:32:51',
                'updated_at' => '2025-07-04 09:32:51'
            ],
            [
                'id' => 4,
                'main_module_id' => 1,
                'module_id' => 4,
                'commission_name' => 'Aadhar Authentication',
                'commission_type' => 'fixed',
                'description' => 'Aadhar Authentication',
                'created_at' => '2025-07-04 09:33:21',
                'updated_at' => '2025-07-04 09:33:21'
            ],
            [
                'id' => 5,
                'main_module_id' => 2,
                'module_id' => 5,
                'commission_name' => 'Prepaid Mobile Recharge',
                'commission_type' => 'percentage',
                'description' => 'Prepaid Mobile Recharge',
                'created_at' => '2025-07-04 09:33:56',
                'updated_at' => '2025-07-04 09:33:56'
            ],
            [
                'id' => 6,
                'main_module_id' => 2,
                'module_id' => 6,
                'commission_name' => 'Postpaid Mobile Bill',
                'commission_type' => 'percentage',
                'description' => 'Postpaid Mobile Bill',
                'created_at' => '2025-07-04 09:34:14',
                'updated_at' => '2025-07-04 09:34:14'
            ],
            [
                'id' => 7,
                'main_module_id' => 2,
                'module_id' => 7,
                'commission_name' => 'DTH Recharge',
                'commission_type' => 'percentage',
                'description' => 'DTH Recharge',
                'created_at' => '2025-07-04 09:34:30',
                'updated_at' => '2025-07-04 09:34:30'
            ],
            [
                'id' => 8,
                'main_module_id' => 2,
                'module_id' => 8,
                'commission_name' => 'Electricity Bill',
                'commission_type' => 'percentage',
                'description' => 'Electricity Bill',
                'created_at' => '2025-07-04 09:34:49',
                'updated_at' => '2025-07-04 09:34:49'
            ]
        ]);
    }
}
