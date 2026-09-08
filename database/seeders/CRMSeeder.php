<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LeadType;
use App\Models\LeadSource;
use App\Models\LeadStatus;

class CRMSeeder extends Seeder
{
    public function run()
    {
        // Seed Lead Types
        $leadTypes = [
            ['name' => 'Loan', 'description' => 'Personal, Business, Home Loans'],
            ['name' => 'Sales', 'description' => 'Product and Service Sales'],
            ['name' => 'School', 'description' => 'Educational Institutions'],
            ['name' => 'Insurance', 'description' => 'Life, Health, Vehicle Insurance'],
            ['name' => 'Real Estate', 'description' => 'Property Buy/Sell/Rent'],
        ];

        foreach ($leadTypes as $type) {
            LeadType::firstOrCreate(['name' => $type['name']], $type);
        }

        // Seed Lead Sources
        $leadSources = [
            ['name' => 'Website'],
            ['name' => 'Facebook'],
            ['name' => 'Google Ads'],
            ['name' => 'Referral'],
            ['name' => 'Cold Call'],
            ['name' => 'Walk-in'],
            ['name' => 'Email Campaign'],
            ['name' => 'WhatsApp'],
        ];

        foreach ($leadSources as $source) {
            LeadSource::firstOrCreate(['name' => $source['name']], $source);
        }

        // Seed Lead Status
        $leadStatuses = [
            ['name' => 'New', 'color' => '#007bff'],
            ['name' => 'Contacted', 'color' => '#17a2b8'],
            ['name' => 'Positive', 'color' => '#28a745'],
            ['name' => 'Follow-up', 'color' => '#ffc107'],
            ['name' => 'Not Interested', 'color' => '#6c757d'],
            ['name' => 'Closed Won', 'color' => '#28a745'],
            ['name' => 'Closed Lost', 'color' => '#dc3545'],
        ];

        foreach ($leadStatuses as $status) {
            LeadStatus::firstOrCreate(['name' => $status['name']], $status);
        }
    }
}
