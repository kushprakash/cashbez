<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubModulesSeeder extends Seeder
{
    public function run()
    {
        DB::table('sub_modules')->insert([
            [
                'id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'name' => 'AEPS',
                'status' => 1,
                'created_at' => '2025-07-05 02:44:50',
                'updated_at' => '2025-07-05 03:29:13'
            ],
            [
                'id' => 2,
                'main_module_id' => 2,
                'module_id' => 2,
                'name' => 'Mobile Recharge',
                'status' => 1,
                'created_at' => '2025-07-05 03:06:05',
                'updated_at' => '2025-07-05 03:06:29'
            ],
            [
                'id' => 3,
                'main_module_id' => 2,
                'module_id' => 2,
                'name' => 'DTH Recharge',
                'status' => 1,
                'created_at' => '2025-07-05 03:06:47',
                'updated_at' => '2025-07-05 03:06:47'
            ],
            [
                'id' => 4,
                'main_module_id' => 2,
                'module_id' => 2,
                'name' => 'Bill Payment',
                'status' => 1,
                'created_at' => '2025-07-05 03:07:00',
                'updated_at' => '2025-07-05 03:07:00'
            ]
        ]);
    }
}
