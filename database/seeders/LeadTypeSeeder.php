<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\LeadType;

class LeadTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $leadTypes = [
            ['name' => 'Sales Lead', 'description' => 'Potential customers for sales'],
            ['name' => 'Marketing Lead', 'description' => 'Leads from marketing campaigns'],
            ['name' => 'Referral Lead', 'description' => 'Leads from referrals'],
            ['name' => 'Partnership Lead', 'description' => 'Potential business partners'],
            ['name' => 'Support Lead', 'description' => 'Customer support inquiries'],
        ];

        foreach ($leadTypes as $leadType) {
            LeadType::updateOrCreate(
                ['name' => $leadType['name']],
                $leadType
            );
        }
    }
}
