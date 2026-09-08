<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Mid;
use Illuminate\Support\Facades\DB;

class MidSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Disable foreign key checks for better performance
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Truncate the table to start fresh
        Mid::truncate();
        
        $mids = [];
        $batchSize = 1000;
        
        for ($i = 1; $i <= 10000; $i++) {
            $mids[] = [
                'mid' => 'ENX' . str_pad($i, 7, '0', STR_PAD_LEFT),
                'status' => 0, // Default status is 0 (not used)
                'created_at' => now(),
                'updated_at' => now(),
            ];
            
            // Insert in batches for better performance
            if (count($mids) === $batchSize) {
                Mid::insert($mids);
                $mids = [];
            }
        }
        
        // Insert remaining records
        if (!empty($mids)) {
            Mid::insert($mids);
        }
        
        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        
        $this->command->info('Successfully seeded 10000 MIDs from ENX0000001 to ENX0010000');
    }
}
