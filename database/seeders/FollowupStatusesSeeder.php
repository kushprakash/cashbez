<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\FollowupStatus;
use App\Models\FollowupType;

class FollowupStatusesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some followup types
        $phoneType = FollowupType::where('name', 'Phone Call')->first();
        $emailType = FollowupType::where('name', 'Email')->first();
        $meetingType = FollowupType::where('name', 'Meeting')->first();

        $followupStatuses = [
            // Phone Call statuses
            [
                'name' => 'Call Answered',
                'description' => 'Customer answered the phone call',
                'color' => '#28a745',
                'followup_type_id' => $phoneType?->id ?? 1,
                'admin_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Call Not Answered',
                'description' => 'Customer did not answer the phone call',
                'color' => '#ffc107',
                'followup_type_id' => $phoneType?->id ?? 1,
                'admin_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Number Busy',
                'description' => 'Phone line was busy',
                'color' => '#fd7e14',
                'followup_type_id' => $phoneType?->id ?? 1,
                'admin_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Number Invalid',
                'description' => 'Phone number is invalid or not reachable',
                'color' => '#dc3545',
                'followup_type_id' => $phoneType?->id ?? 1,
                'admin_id' => null,
                'is_active' => true,
            ],
            
            // Email statuses
            [
                'name' => 'Email Sent',
                'description' => 'Email has been sent successfully',
                'color' => '#007bff',
                'followup_type_id' => $emailType?->id ?? 2,
                'admin_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Email Opened',
                'description' => 'Customer opened the email',
                'color' => '#28a745',
                'followup_type_id' => $emailType?->id ?? 2,
                'admin_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Email Bounced',
                'description' => 'Email failed to deliver',
                'color' => '#dc3545',
                'followup_type_id' => $emailType?->id ?? 2,
                'admin_id' => null,
                'is_active' => true,
            ],
            
            // Meeting statuses
            [
                'name' => 'Meeting Scheduled',
                'description' => 'Meeting has been scheduled with customer',
                'color' => '#007bff',
                'followup_type_id' => $meetingType?->id ?? 4,
                'admin_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Meeting Completed',
                'description' => 'Meeting was conducted successfully',
                'color' => '#28a745',
                'followup_type_id' => $meetingType?->id ?? 4,
                'admin_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Meeting Cancelled',
                'description' => 'Meeting was cancelled',
                'color' => '#dc3545',
                'followup_type_id' => $meetingType?->id ?? 4,
                'admin_id' => null,
                'is_active' => true,
            ],
        ];

        foreach ($followupStatuses as $status) {
            FollowupStatus::create($status);
        }
    }
}
