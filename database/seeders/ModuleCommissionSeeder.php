<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ModuleCommissionSeeder extends Seeder
{
    public function run()
    {
        DB::table('module_commissions')->insert([
            [
                'module_id' => 1,
                'sub_module_id' => null,
                'mode' => 'default',
                'from_amt' => 0,
                'to_amt' => 1000,
                'commission_type' => 'percent',
                'commission' => 5.00,
                'status' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
}
