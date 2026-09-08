<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Lead;
use App\Models\Followup;

class UpdateLeadFollowupDates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'leads:update-followup-dates';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update all leads with their latest followup dates based on followup records';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Updating lead followup dates...');
        
        $leads = Lead::all();
        $updatedCount = 0;
        
        foreach ($leads as $lead) {
            // Get the latest followup for this lead
            $latestFollowup = Followup::where('lead_id', $lead->id)
                ->orderBy('followup_date', 'desc')
                ->orderBy('created_at', 'desc')
                ->first();
            
            if ($latestFollowup && $latestFollowup->followup_date) {
                // Update the lead's followup_date
                $lead->update(['followup_date' => $latestFollowup->followup_date]);
                $updatedCount++;
                $this->line("Updated Lead ID {$lead->id} with followup date: {$latestFollowup->followup_date}");
            }
        }
        
        $this->info("Successfully updated {$updatedCount} leads with their latest followup dates.");
        
        return 0;
    }
}
