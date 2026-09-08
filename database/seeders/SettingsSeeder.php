<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Setting::updateOrCreate(
            ['id' => 1], // Check for the first setting record
            [
                'user_id' => 1, // Admin user ID
                'company_name' => 'Your Company Name',
                'about' => 'This is a sample about section for your company.',
                'copy_right' => '© 2025 Your Company Name. All rights reserved.',
                'email' => 'info@yourcompany.com',
                'mobile_no' => '+1234567890',
                'theme_color_primary' => '#007bff',
                'theme_color_secondary' => '#6c757d',
                'currency_code' => 'USD',
                'meta_title' => 'Your Company - Home',
                'meta_description' => 'Welcome to Your Company - providing excellent services.',
                'status' => 1,
            ]
        );
    }
}
