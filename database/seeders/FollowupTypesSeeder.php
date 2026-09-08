<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\FollowupType;

class FollowupTypesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $followupTypes = [
            [
                'name' => 'Phone Call',
                'description' => 'Regular phone call follow-up with prospect',
                'color' => '#007bff',
                'admin_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Email',
                'description' => 'Email communication with prospect',
                'color' => '#28a745',
                'admin_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'WhatsApp',
                'description' => 'WhatsApp message follow-up',
                'color' => '#25d366',
                'admin_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Meeting',
                'description' => 'In-person or virtual meeting',
                'color' => '#dc3545',
                'admin_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'SMS',
                'description' => 'Text message follow-up',
                'color' => '#ffc107',
                'admin_id' => null,
                'is_active' => true,
            ],
        ];

        foreach ($followupTypes as $type) {
            FollowupType::create($type);
        }
    }
}
