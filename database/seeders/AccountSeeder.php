<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Passbook;
use App\Models\User;
use Illuminate\Database\Seeder;

class AccountSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Get first user as default user
        $user = User::first();
        
        if (!$user) {
            $this->command->error('No users found. Please create users first.');
            return;
        }

        $accountsData = [
            [
                'user_id' => $user->id,
                'name' => 'Savings Account',
                'number' => '1234567890',
                'mpin' => '1234',
                'hold_amount' => 0.00,
                'created_by' => $user->id,
                'admin_id' => $user->id,
                'status' => 1,
                'initial_balance' => 25000.00
            ],
            [
                'user_id' => $user->id,
                'name' => 'Current Account',
                'number' => '5678901234',
                'mpin' => '5678',
                'hold_amount' => 0.00,
                'created_by' => $user->id,
                'admin_id' => $user->id,
                'status' => 1,
                'initial_balance' => 50000.00
            ],
            [
                'user_id' => $user->id,
                'name' => 'Salary Account',
                'number' => '9012345678',
                'mpin' => '9012',
                'hold_amount' => 0.00,
                'created_by' => $user->id,
                'admin_id' => $user->id,
                'status' => 1,
                'initial_balance' => 15000.00
            ]
        ];

        foreach ($accountsData as $accountData) {
            $initialBalance = $accountData['initial_balance'];
            unset($accountData['initial_balance']);
            
            // Create account without balance
            $account = Account::create($accountData);
            
            // Create initial passbook entry with opening balance
            if ($initialBalance > 0) {
                Passbook::create([
                    'user_id' => $user->id,
                    'account_id' => $account->id,
                    'transaction_id' => \Str::uuid(),
                    'description' => 'Account opening balance',
                    'type' => Passbook::TYPE_CREDIT,
                    'pre_balance' => 0,
                    'amount' => $initialBalance,
                    'balance' => $initialBalance,
                    'created_by' => $user->id,
                    'admin_id' => $user->id
                ]);
            }
        }

        $this->command->info('Sample accounts with passbook entries created successfully.');
    }
}
