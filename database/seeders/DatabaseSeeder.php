<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            ModulesSeeder::class,
            RolesSeeder::class,
            SubModulesSeeder::class,
            ModulePermissionsSeeder::class,
            ModuleCommissionsActualSeeder::class,
            UsersSeeder::class,
            RoleModulePermissionsSeeder::class,
            RoleModuleCommissionSeeder::class,
            SubscriptionsSeeder::class,
            SubscriptionMastersSeeder::class,
            UserRolePermissionsSeeder::class,
            UserRoleCommissionsSeeder::class,
            LoanLeadSeeder::class,
        ]);
    }
}
