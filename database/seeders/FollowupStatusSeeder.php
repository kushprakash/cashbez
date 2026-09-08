<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\FollowupStatus;
use App\Models\FollowupType;

class FollowupStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get followup types
        $callType = FollowupType::where('name', 'Call')->first();
        $meetingType = FollowupType::where('name', 'Meeting')->first();
        $emailType = FollowupType::where('name', 'Email')->first();
        $demoType = FollowupType::where('name', 'Demo')->first();
        $proposalType = FollowupType::where('name', 'Proposal')->first();

        $followupStatuses = [
            // Call statuses
            ['name' => 'Connected', 'color' => '#28a745', 'followup_type_id' => $callType?->id, 'sort_order' => 1],
            ['name' => 'Positive Response', 'color' => '#28a745', 'followup_type_id' => $callType?->id, 'sort_order' => 2],
            ['name' => 'Interested', 'color' => '#17a2b8', 'followup_type_id' => $callType?->id, 'sort_order' => 3],
            ['name' => 'Not Reachable', 'color' => '#ffc107', 'followup_type_id' => $callType?->id, 'sort_order' => 4],
            ['name' => 'Busy', 'color' => '#ffc107', 'followup_type_id' => $callType?->id, 'sort_order' => 5],
            ['name' => 'Callback Requested', 'color' => '#17a2b8', 'followup_type_id' => $callType?->id, 'sort_order' => 6],
            ['name' => 'Not Interested', 'color' => '#dc3545', 'followup_type_id' => $callType?->id, 'sort_order' => 7],
            ['name' => 'Wrong Number', 'color' => '#dc3545', 'followup_type_id' => $callType?->id, 'sort_order' => 8],

            // Meeting statuses
            ['name' => 'Meeting Scheduled', 'color' => '#007bff', 'followup_type_id' => $meetingType?->id, 'sort_order' => 1],
            ['name' => 'Meeting Completed', 'color' => '#28a745', 'followup_type_id' => $meetingType?->id, 'sort_order' => 2],
            ['name' => 'Meeting Postponed', 'color' => '#ffc107', 'followup_type_id' => $meetingType?->id, 'sort_order' => 3],
            ['name' => 'Meeting Cancelled', 'color' => '#dc3545', 'followup_type_id' => $meetingType?->id, 'sort_order' => 4],

            // Email statuses
            ['name' => 'Email Sent', 'color' => '#007bff', 'followup_type_id' => $emailType?->id, 'sort_order' => 1],
            ['name' => 'Email Opened', 'color' => '#17a2b8', 'followup_type_id' => $emailType?->id, 'sort_order' => 2],
            ['name' => 'Email Replied', 'color' => '#28a745', 'followup_type_id' => $emailType?->id, 'sort_order' => 3],
            ['name' => 'Email Bounced', 'color' => '#dc3545', 'followup_type_id' => $emailType?->id, 'sort_order' => 4],

            // Demo statuses
            ['name' => 'Demo Scheduled', 'color' => '#007bff', 'followup_type_id' => $demoType?->id, 'sort_order' => 1],
            ['name' => 'Demo Completed', 'color' => '#28a745', 'followup_type_id' => $demoType?->id, 'sort_order' => 2],
            ['name' => 'Demo Interested', 'color' => '#28a745', 'followup_type_id' => $demoType?->id, 'sort_order' => 3],
            ['name' => 'Demo Not Interested', 'color' => '#dc3545', 'followup_type_id' => $demoType?->id, 'sort_order' => 4],

            // Proposal statuses
            ['name' => 'Proposal Sent', 'color' => '#007bff', 'followup_type_id' => $proposalType?->id, 'sort_order' => 1],
            ['name' => 'Proposal Under Review', 'color' => '#ffc107', 'followup_type_id' => $proposalType?->id, 'sort_order' => 2],
            ['name' => 'Proposal Accepted', 'color' => '#28a745', 'followup_type_id' => $proposalType?->id, 'sort_order' => 3],
            ['name' => 'Proposal Rejected', 'color' => '#dc3545', 'followup_type_id' => $proposalType?->id, 'sort_order' => 4],

            // General statuses (no specific type)
            ['name' => 'Follow Up Later', 'color' => '#6c757d', 'followup_type_id' => null, 'sort_order' => 1],
        ];

        foreach ($followupStatuses as $followupStatus) {
            FollowupStatus::updateOrCreate(
                [
                    'name' => $followupStatus['name'],
                    'followup_type_id' => $followupStatus['followup_type_id']
                ],
                $followupStatus
            );
        }
    }
}
