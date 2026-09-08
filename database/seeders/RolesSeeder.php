<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesSeeder extends Seeder
{
    public function run()
    {
        DB::table('roles')->insert([
            [
                'id' => 1,
                'user_id' => 1,
                'name' => 'Super Admin',
                'status' => 1,
                'created_at' => '2025-07-05 02:34:33',
                'updated_at' => '2025-07-05 02:34:33'
            ],
            [
                'id' => 2,
                'user_id' => 1,
                'name' => 'Admin',
                'status' => 1,
                'created_at' => '2025-07-05 02:34:40',
                'updated_at' => '2025-07-05 02:34:40'
            ],
            [
                'id' => 3,
                'user_id' => 1,
                'name' => 'Super Distributer',
                'status' => 1,
                'created_at' => '2025-07-05 02:34:49',
                'updated_at' => '2025-07-05 02:35:11'
            ],
            [
                'id' => 4,
                'user_id' => 1,
                'name' => 'Distributer',
                'status' => 1,
                'created_at' => '2025-07-05 02:35:26',
                'updated_at' => '2025-07-05 02:35:26'
            ],
            [
                'id' => 5,
                'user_id' => 1,
                'name' => 'Retailer',
                'status' => 1,
                'created_at' => '2025-07-05 02:35:37',
                'updated_at' => '2025-07-05 23:14:35'
            ],
            [
                'id' => 6,
                'user_id' => 1,
                'name' => 'Customer',
                'status' => 1,
                'created_at' => '2025-07-05 02:35:42',
                'updated_at' => '2025-07-05 02:35:42'
            ],
            [
                'id' => 8,
                'user_id' => 3,
                'name' => 'Test Role',
                'status' => 1,
                'created_at' => '2025-07-06 00:55:13',
                'updated_at' => '2025-07-06 00:55:13'
            ]
        ]);
    }
}
