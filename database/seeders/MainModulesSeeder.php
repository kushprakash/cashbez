<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MainModulesSeeder extends Seeder
{
    public function run()
    {
        DB::table('main_modules')->insert([
            [
                'id' => 1,
                'main_module_name' => 'AEPS',
                'description' => 'Aadhaar Enabled Payment System',
                'created_at' => '2025-07-04 09:30:32',
                'updated_at' => '2025-07-04 09:30:32'
            ],
            [
                'id' => 2,
                'main_module_name' => 'Utility Service',
                'description' => 'Utility bills, recharge, etc.',
                'created_at' => '2025-07-04 09:30:32',
                'updated_at' => '2025-07-04 09:30:32'
            ]
        ]);
    }
}
