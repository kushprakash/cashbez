<?php

namespace Database\Seeders;

use App\Models\LoanLead;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LoanLeadSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // First ensure we have some users
        $user1 = User::firstOrCreate([
            'email' => 'user1@example.com'
        ], [
            'mid' => 'CW9990001',
            'mkey' => 'sample_mkey_1',
            'admin_mid' => 'CW0000001',
            'name' => 'John Doe',
            'mobile' => '9876543210',
            'role' => 3, // Regular user
            'password' => bcrypt('password'),
            'status' => 1,
            'remember_token' => 'sample_token_123'
        ]);

        $user2 = User::firstOrCreate([
            'email' => 'user2@example.com'
        ], [
            'mid' => 'CW9990002',
            'mkey' => 'sample_mkey_2',
            'admin_mid' => 'CW0000001',
            'name' => 'Jane Smith',
            'mobile' => '9876543211',
            'role' => 3, // Regular user
            'password' => bcrypt('password'),
            'status' => 1,
            'remember_token' => 'sample_token_456'
        ]);

        $admin = User::firstOrCreate([
            'email' => 'admin@example.com'
        ], [
            'mid' => 'CW9990003',
            'mkey' => 'sample_mkey_3',
            'admin_mid' => 'CW0000001',
            'name' => 'Admin User',
            'mobile' => '9876543212',
            'role' => 1, // Admin
            'password' => bcrypt('password'),
            'status' => 1,
            'remember_token' => 'admin_token_789'
        ]);

        // Create sample loan leads
        $loanLeads = [
            [
                'user_id' => $user1->id,
                'loan_type' => 'personal',
                'full_name' => 'Rajesh Kumar',
                'mobile' => '9876543210',
                'email' => 'rajesh@example.com',
                'employment_type' => 'salaried',
                'monthly_income' => 50000,
                'company_name' => 'TCS',
                'loan_amount' => 500000,
                'loan_purpose' => 'Home renovation',
                'loan_tenure' => 36,
                'status' => 'disbursed',
                'commission_amount' => 5000,
                'commission_status' => 'released',
                'commission_released_at' => now()->subDays(5),
                'commission_released_by' => $admin->id,
                'created_at' => now()->subDays(30),
                'updated_at' => now()->subDays(5)
            ],
            [
                'user_id' => $user1->id,
                'loan_type' => 'business',
                'full_name' => 'Priya Sharma',
                'mobile' => '9876543211',
                'email' => 'priya@example.com',
                'business_name' => 'Sharma Enterprises',
                'business_type' => 'Retail',
                'annual_turnover' => 2000000,
                'monthly_profit' => 100000,
                'loan_amount' => 1000000,
                'loan_purpose' => 'Business expansion',
                'loan_tenure' => 60,
                'status' => 'approved',
                'commission_amount' => 10000,
                'commission_status' => 'approved',
                'commission_set_at' => now()->subDays(10),
                'commission_set_by' => $admin->id,
                'created_at' => now()->subDays(25),
                'updated_at' => now()->subDays(10)
            ],
            [
                'user_id' => $user2->id,
                'loan_type' => 'personal',
                'full_name' => 'Amit Patel',
                'mobile' => '9876543212',
                'email' => 'amit@example.com',
                'employment_type' => 'self_employed',
                'monthly_income' => 75000,
                'loan_amount' => 300000,
                'loan_purpose' => 'Medical expenses',
                'loan_tenure' => 24,
                'status' => 'processing',
                'commission_amount' => 3000,
                'commission_status' => 'pending',
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(5)
            ],
            [
                'user_id' => $user2->id,
                'loan_type' => 'business',
                'full_name' => 'Sunita Singh',
                'mobile' => '9876543213',
                'email' => 'sunita@example.com',
                'business_name' => 'Singh Trading Co',
                'business_type' => 'Trading',
                'annual_turnover' => 5000000,
                'monthly_profit' => 200000,
                'loan_amount' => 2000000,
                'loan_purpose' => 'Working capital',
                'loan_tenure' => 36,
                'status' => 'disbursed',
                'commission_amount' => 20000,
                'commission_status' => 'released',
                'commission_released_at' => now()->subDays(2),
                'commission_released_by' => $admin->id,
                'created_at' => now()->subDays(20),
                'updated_at' => now()->subDays(2)
            ],
            [
                'user_id' => $user1->id,
                'loan_type' => 'personal',
                'full_name' => 'Vikash Gupta',
                'mobile' => '9876543214',
                'email' => 'vikash@example.com',
                'employment_type' => 'salaried',
                'monthly_income' => 80000,
                'company_name' => 'Infosys',
                'loan_amount' => 800000,
                'loan_purpose' => 'Debt consolidation',
                'loan_tenure' => 48,
                'status' => 'under_review',
                'commission_amount' => 8000,
                'commission_status' => 'pending',
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(3)
            ]
        ];

        foreach ($loanLeads as $leadData) {
            // Generate lead_id
            $prefix = $leadData['loan_type'] === 'business' ? 'BL' : 'PL';
            $lastId = LoanLead::max('id') ?? 0;
            $leadData['lead_id'] = $prefix . str_pad($lastId + 1, 6, '0', STR_PAD_LEFT);
            
            LoanLead::create($leadData);
        }

        $this->command->info('Sample loan leads created successfully!');
    }
}