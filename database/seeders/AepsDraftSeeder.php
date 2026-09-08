<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AepsDraft;
use App\Models\User;

class AepsDraftSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first user for testing (or create one if needed)
        $user = User::first();
        
        if (!$user) {
            echo "No users found. Please create a user first.\n";
            return;
        }

        // Sample AEPS draft data based on the validation rules
        AepsDraft::create([
            'mid' => 'EN101',
            'latitude' => 28.6139,
            'longitude' => 77.2090,
            'shop_city' => 'New Delhi',
            'shop_address' => '123 Main Street, Connaught Place',
            'state_id' => 'DL',
            'shop_district' => 'Central Delhi',
            'shop_pin_code' => '110001',
            'shop_name' => 'Sample Electronics Store',
            'pan_no' => 'ABCDE1234F',
            'aadhaar_number' => '123456789012',
            'full_name' => 'John Doe Kumar',
            'phone' => '9876543210',
            'email' => 'john.doe@example.com',
            'account_number' => '1234567890123456',
            'ifsc_code' => 'HDFC0001234',
            'bank_name' => 'HDFC Bank',
            'bank_branch' => 'Connaught Place Branch',
            'phone_verified_at' => 0,
            'email_verified_at' => 0,
            'aadhaar_verified_at' => 0,
            'pan_verified_at' => 0,
            'bank_verified_at' => 0,
            'status' => 'draft',
            'created_by' => $user->id,
            'admin_id' => $user->id,
        ]);

        echo "Sample AEPS draft record created successfully!\n";
    }
}
