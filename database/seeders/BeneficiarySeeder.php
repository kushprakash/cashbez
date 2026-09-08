<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Beneficiary;
use App\Models\User;

class BeneficiarySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first user for testing (you can adjust this based on your user setup)
        $user = User::first();
        $admin = User::where('role', 'admin')->first() ?? $user;

        if (!$user) {
            $this->command->info('No users found. Please create users first.');
            return;
        }

        $beneficiaries = [
            [
                'user_id' => $user->id,
                'name' => 'John Doe',
                'account' => '1234567890123456',
                'ifsc' => 'SBIN0001234',
                'branch' => 'SBI Main Branch',
                'admin_id' => $admin->id,
                'created_by' => $user->id,
                'account_verified' => true,
                'ifsc_verified' => true,
                'verification_data' => json_encode([
                    'ifsc_data' => [
                        'verified' => true,
                        'bank' => 'State Bank of India',
                        'branch' => 'SBI Main Branch',
                        'city' => 'Mumbai',
                        'state' => 'Maharashtra'
                    ],
                    'account_data' => [
                        'verified' => true,
                        'account_holder_name' => 'John Doe'
                    ],
                    'verified_at' => now()->toISOString()
                ])
            ],
            [
                'user_id' => $user->id,
                'name' => 'Jane Smith',
                'account' => '9876543210987654',
                'ifsc' => 'HDFC0001234',
                'branch' => 'HDFC Bank Branch',
                'admin_id' => $admin->id,
                'created_by' => $user->id,
                'account_verified' => true,
                'ifsc_verified' => true,
                'verification_data' => json_encode([
                    'ifsc_data' => [
                        'verified' => true,
                        'bank' => 'HDFC Bank',
                        'branch' => 'HDFC Bank Branch',
                        'city' => 'Delhi',
                        'state' => 'Delhi'
                    ],
                    'account_data' => [
                        'verified' => true,
                        'account_holder_name' => 'Jane Smith'
                    ],
                    'verified_at' => now()->toISOString()
                ])
            ],
            [
                'user_id' => $user->id,
                'name' => 'Bob Johnson',
                'account' => '5555666677778888',
                'ifsc' => 'ICIC0001234',
                'branch' => 'ICICI Bank Branch',
                'admin_id' => $admin->id,
                'created_by' => $user->id,
                'account_verified' => false,
                'ifsc_verified' => true,
                'verification_data' => json_encode([
                    'ifsc_data' => [
                        'verified' => true,
                        'bank' => 'ICICI Bank',
                        'branch' => 'ICICI Bank Branch',
                        'city' => 'Bangalore',
                        'state' => 'Karnataka'
                    ],
                    'account_data' => [
                        'verified' => false,
                        'error' => 'Account verification pending'
                    ],
                    'verified_at' => now()->toISOString()
                ])
            ]
        ];

        foreach ($beneficiaries as $beneficiary) {
            Beneficiary::create($beneficiary);
        }

        $this->command->info('Beneficiary seeder completed successfully!');
    }
}
