<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\FollowupType;

class FollowupTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $followupTypes = [
            ['name' => 'Call', 'color' => '#007bff', 'description' => 'Phone calls with prospects', 'sort_order' => 1],
            ['name' => 'Meeting', 'color' => '#28a745', 'description' => 'Face-to-face or virtual meetings', 'sort_order' => 2],
            ['name' => 'Email', 'color' => '#17a2b8', 'description' => 'Email communications', 'sort_order' => 3],
            ['name' => 'Demo', 'color' => '#ffc107', 'description' => 'Product demonstrations', 'sort_order' => 4],
            ['name' => 'Proposal', 'color' => '#dc3545', 'description' => 'Proposal presentations', 'sort_order' => 5],
        ];

        foreach ($followupTypes as $followupType) {
            FollowupType::updateOrCreate(
                ['name' => $followupType['name']],
                $followupType
            );
        }
    }
}
