<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubscriptionsSeeder extends Seeder
{
    public function run()
    {
        DB::table('subscriptions')->insert([
            [
                'id' => 9,
                'user_id' => 1,
                'module_id' => 1,
                'plan_id' => 5,
                'start_at' => '2025-07-11 16:51:09',
                'end_at' => '2025-08-11 16:51:09',
                'status' => 1,
                'created_at' => '2025-07-11 16:51:09',
                'updated_at' => '2025-07-11 16:51:09'
            ]
        ]);
    }
}
