<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubscriptionMastersSeeder extends Seeder
{
    public function run()
    {
        DB::table('subscription_masters')->insert([
            [
                'id' => 1,
                'user_id' => 1,
                'main_module_id' => 1,
                'module_id' => 2,
                'duration' => 2,
                'duration_type' => 'Month',
                'description' => 'Unlimited Scored 1,Latest Prediction File,Detailed Score Report',
                'price' => 499,
                'status' => 1,
                'created_at' => '2025-07-08 03:00:35',
                'updated_at' => '2025-07-08 08:52:09'
            ],
            [
                'id' => 2,
                'user_id' => 1,
                'main_module_id' => 1,
                'module_id' => 2,
                'duration' => 3,
                'duration_type' => 'Month',
                'description' => 'Unlimited Scored 1,Latest Prediction File,Detailed Score Report',
                'price' => 999,
                'status' => 1,
                'created_at' => '2025-07-08 03:09:18',
                'updated_at' => '2025-07-08 03:09:18'
            ],
            [
                'id' => 3,
                'user_id' => 1,
                'main_module_id' => 1,
                'module_id' => 2,
                'duration' => 6,
                'duration_type' => 'Month',
                'description' => 'Unlimited Scored 1,Latest Prediction File,Detailed Score Report',
                'price' => 999,
                'status' => 1,
                'created_at' => '2025-07-08 03:09:18',
                'updated_at' => '2025-07-08 03:09:18'
            ],
            [
                'id' => 4,
                'user_id' => 1,
                'main_module_id' => 1,
                'module_id' => 2,
                'duration' => 1,
                'duration_type' => 'Year',
                'description' => 'Unlimited Scored 1,Latest Prediction File,Detailed Score Report',
                'price' => 999,
                'status' => 1,
                'created_at' => '2025-07-08 03:09:18',
                'updated_at' => '2025-07-08 03:09:18'
            ],
            [
                'id' => 5,
                'user_id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'duration' => 1,
                'duration_type' => 'Month',
                'description' => 'Unlimited Scored 1,Latest Prediction File,Detailed Score Report',
                'price' => 499,
                'status' => 1,
                'created_at' => '2025-07-08 03:00:35',
                'updated_at' => '2025-07-08 03:05:23'
            ],
            [
                'id' => 6,
                'user_id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'duration' => 3,
                'duration_type' => 'Month',
                'description' => 'Unlimited Scored 1,Latest Prediction File,Detailed Score Report',
                'price' => 999,
                'status' => 1,
                'created_at' => '2025-07-08 03:09:18',
                'updated_at' => '2025-07-08 03:09:18'
            ],
            [
                'id' => 7,
                'user_id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'duration' => 6,
                'duration_type' => 'Month',
                'description' => 'Unlimited Scored 1,Latest Prediction File,Detailed Score Report',
                'price' => 999,
                'status' => 1,
                'created_at' => '2025-07-08 03:09:18',
                'updated_at' => '2025-07-08 03:09:18'
            ],
            [
                'id' => 8,
                'user_id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'duration' => 1,
                'duration_type' => 'Year',
                'description' => 'Unlimited Scored 1,Latest Prediction File,Detailed Score Report',
                'price' => 999,
                'status' => 1,
                'created_at' => '2025-07-08 03:09:18',
                'updated_at' => '2025-07-08 03:09:18'
            ]
        ]);
    }
}
