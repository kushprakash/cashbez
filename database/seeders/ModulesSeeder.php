<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ModulesSeeder extends Seeder
{
    public function run()
    {
        DB::table('modules')->insert([
            [
                'id' => 1,
                'main_module_id' => 1,
                'name' => 'AEPS',
                'status' => 1,
                'created_at' => '2025-07-05 02:40:21',
                'updated_at' => '2025-07-05 03:08:03'
            ],
            [
                'id' => 2,
                'main_module_id' => 2,
                'name' => 'Utility Service',
                'status' => 1,
                'created_at' => '2025-07-05 02:40:42',
                'updated_at' => '2025-07-05 02:40:42'
            ]
        ]);
    }
}
