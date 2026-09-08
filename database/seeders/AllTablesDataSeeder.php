<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\MainModule;
use App\Models\Module;
use App\Models\SubModule;
use App\Models\ModuleCommission;
use App\Models\ModulePermission;
use App\Models\Role;
use App\Models\RoleModuleCommission;
use App\Models\RoleModulePermission;
use App\Models\Subscription;
use App\Models\SubscriptionMaster;
use App\Models\RoleSubscriptionMaster;

class AllTablesDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed Main Modules
        $this->seedMainModules();
        
        // Seed Modules
        $this->seedModules();
        
        // Seed Sub Modules
        $this->seedSubModules();
        
        // Seed Roles
        $this->seedRoles();
        
        // Seed Module Commissions
        $this->seedModuleCommissions();
        
        // Seed Module Permissions
        $this->seedModulePermissions();
        
        // Seed Role Module Commissions
        $this->seedRoleModuleCommissions();
        
        // Seed Role Module Permissions
        $this->seedRoleModulePermissions();
        
        // Seed Subscription Masters
        $this->seedSubscriptionMasters();
        
        // Seed Role Subscription Masters
        $this->seedRoleSubscriptionMasters();
        
        // Seed Subscriptions
        $this->seedSubscriptions();
        
        echo "All tables data seeded successfully!\n";
    }
    
    private function seedMainModules()
    {
        $mainModules = [
            [
                'id' => 1,
                'name' => 'Banking',
                'status' => 1,
                'created_at' => '2025-07-27 00:50:48',
                'updated_at' => '2025-07-27 00:50:48',
            ],
            [
                'id' => 2,
                'name' => 'Micro Finance',
                'status' => 1,
                'created_at' => '2025-07-27 00:50:48',
                'updated_at' => '2025-07-27 00:50:48',
            ],
            [
                'id' => 3,
                'name' => 'Master',
                'status' => 1,
                'created_at' => '2025-07-27 01:37:17',
                'updated_at' => '2025-07-27 01:37:17',
            ],
            [
                'id' => 4,
                'name' => 'HRMS',
                'status' => 1,
                'created_at' => '2025-08-03 22:29:11',
                'updated_at' => '2025-08-03 22:29:11',
            ],
        ];

        foreach ($mainModules as $mainModule) {
            MainModule::updateOrCreate(['id' => $mainModule['id']], $mainModule);
        }
        
        echo "Main Modules seeded successfully!\n";
    }
    
    private function seedModules()
    {
        $modules = [
            [
                'id' => 1,
                'main_module_id' => 1,
                'name' => 'AEPS',
                'icon' => 'bx  bx-fingerprint',
                'status' => 1,
                'created_at' => '2025-07-04 21:10:21',
                'updated_at' => '2025-07-28 08:10:50',
            ],
            [
                'id' => 2,
                'main_module_id' => 1,
                'name' => 'Utility Service',
                'icon' => 'bx  bx-bulb',
                'status' => 1,
                'created_at' => '2025-07-04 21:10:42',
                'updated_at' => '2025-07-28 08:15:02',
            ],
            [
                'id' => 3,
                'main_module_id' => 3,
                'name' => 'Module Master',
                'icon' => 'fa fa-cogs',
                'status' => 1,
                'created_at' => '2025-07-27 01:37:33',
                'updated_at' => '2025-07-30 03:42:01',
            ],
            [
                'id' => 4,
                'main_module_id' => 3,
                'name' => 'Role & Permissions',
                'icon' => 'fa fa-cogs',
                'status' => 1,
                'created_at' => '2025-07-27 01:37:48',
                'updated_at' => '2025-07-30 03:42:13',
            ],
            [
                'id' => 5,
                'main_module_id' => 3,
                'name' => 'Commission Master',
                'icon' => 'fa fa-cogs',
                'status' => 1,
                'created_at' => '2025-07-27 01:38:00',
                'updated_at' => '2025-07-30 03:42:23',
            ],
            [
                'id' => 6,
                'main_module_id' => 3,
                'name' => 'Subscription Master',
                'icon' => 'fa fa-cogs',
                'status' => 1,
                'created_at' => '2025-07-27 01:38:10',
                'updated_at' => '2025-07-30 03:42:29',
            ],
            [
                'id' => 7,
                'main_module_id' => 1,
                'name' => 'User Master',
                'icon' => 'bx bx-user',
                'status' => 0,
                'created_at' => '2025-07-28 00:26:15',
                'updated_at' => '2025-07-28 08:39:19',
            ],
            [
                'id' => 9,
                'main_module_id' => 1,
                'name' => 'Subscription',
                'icon' => 'bx bx-calendar-plus',
                'status' => 1,
                'created_at' => '2025-07-28 07:12:01',
                'updated_at' => '2025-07-28 08:22:36',
            ],
            [
                'id' => 11,
                'main_module_id' => 3,
                'name' => 'User Master',
                'icon' => 'bx bx-user',
                'status' => 1,
                'created_at' => '2025-07-28 08:36:16',
                'updated_at' => '2025-07-28 08:36:16',
            ],
            [
                'id' => 12,
                'main_module_id' => 3,
                'name' => 'Setting',
                'icon' => 'fa fa-cogs',
                'status' => 1,
                'created_at' => '2025-07-30 05:03:59',
                'updated_at' => '2025-07-30 05:04:16',
            ],
            [
                'id' => 13,
                'main_module_id' => 4,
                'name' => 'Employee',
                'icon' => 'bx bx-user',
                'status' => 1,
                'created_at' => '2025-08-03 22:30:11',
                'updated_at' => '2025-08-04 03:01:31',
            ],
            [
                'id' => 14,
                'main_module_id' => 4,
                'name' => 'Departments',
                'icon' => 'fa fa-outdent',
                'status' => 1,
                'created_at' => '2025-08-03 23:45:11',
                'updated_at' => '2025-08-04 03:04:08',
            ],
            [
                'id' => 15,
                'main_module_id' => 4,
                'name' => 'Designation',
                'icon' => 'fa fa-delicious',
                'status' => 1,
                'created_at' => '2025-08-04 00:42:53',
                'updated_at' => '2025-08-04 03:05:40',
            ],
            [
                'id' => 16,
                'main_module_id' => 4,
                'name' => 'Attendance',
                'icon' => 'fa fa-calendar-check-o',
                'status' => 1,
                'created_at' => '2025-08-04 03:21:45',
                'updated_at' => '2025-08-04 03:21:45',
            ],
            [
                'id' => 17,
                'main_module_id' => 4,
                'name' => 'Leave',
                'icon' => 'fa fa-low-vision',
                'status' => 1,
                'created_at' => '2025-08-05 10:30:27',
                'updated_at' => '2025-08-05 11:24:50',
            ],
            [
                'id' => 18,
                'main_module_id' => 4,
                'name' => 'Payrole',
                'icon' => 'fa fa-inr',
                'status' => 1,
                'created_at' => '2025-08-05 11:53:40',
                'updated_at' => '2025-08-05 13:05:52',
            ],
        ];

        foreach ($modules as $module) {
            Module::updateOrCreate(['id' => $module['id']], $module);
        }
        
        echo "Modules seeded successfully!\n";
    }
    
    private function seedSubModules()
    {
        $subModules = [
            [
                'id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'name' => 'AEPS',
                'status' => 1,
                'created_at' => '2025-07-04 21:14:50',
                'updated_at' => '2025-07-04 21:59:13',
            ],
            [
                'id' => 2,
                'main_module_id' => 2,
                'module_id' => 2,
                'name' => 'Mobile Recharge',
                'status' => 1,
                'created_at' => '2025-07-04 21:36:05',
                'updated_at' => '2025-07-04 21:36:29',
            ],
            [
                'id' => 3,
                'main_module_id' => 2,
                'module_id' => 2,
                'name' => 'DTH Recharge',
                'status' => 1,
                'created_at' => '2025-07-04 21:36:47',
                'updated_at' => '2025-07-04 21:36:47',
            ],
            [
                'id' => 4,
                'main_module_id' => 2,
                'module_id' => 2,
                'name' => 'Bill Payment',
                'status' => 1,
                'created_at' => '2025-07-04 21:37:00',
                'updated_at' => '2025-07-04 21:37:00',
            ],
            [
                'id' => 5,
                'main_module_id' => 3,
                'module_id' => 3,
                'name' => 'Main Module',
                'status' => 1,
                'created_at' => '2025-07-27 01:39:25',
                'updated_at' => '2025-07-27 01:39:25',
            ],
            [
                'id' => 6,
                'main_module_id' => 3,
                'module_id' => 3,
                'name' => 'Module',
                'status' => 1,
                'created_at' => '2025-07-27 01:39:30',
                'updated_at' => '2025-07-27 01:45:16',
            ],
            [
                'id' => 7,
                'main_module_id' => 3,
                'module_id' => 3,
                'name' => 'Sub Module',
                'status' => 1,
                'created_at' => '2025-07-27 01:39:39',
                'updated_at' => '2025-07-27 01:45:24',
            ],
            [
                'id' => 8,
                'main_module_id' => 3,
                'module_id' => 3,
                'name' => 'Permission',
                'status' => 1,
                'created_at' => '2025-07-27 01:39:53',
                'updated_at' => '2025-07-27 01:45:38',
            ],
            [
                'id' => 9,
                'main_module_id' => 3,
                'module_id' => 4,
                'name' => 'User Role',
                'status' => 1,
                'created_at' => '2025-07-27 01:42:11',
                'updated_at' => '2025-07-27 01:42:11',
            ],
            [
                'id' => 10,
                'main_module_id' => 3,
                'module_id' => 4,
                'name' => 'Role Permission',
                'status' => 1,
                'created_at' => '2025-07-27 01:42:58',
                'updated_at' => '2025-07-27 01:42:58',
            ],
            [
                'id' => 11,
                'main_module_id' => 3,
                'module_id' => 4,
                'name' => 'User Role Permission',
                'status' => 1,
                'created_at' => '2025-07-27 01:43:06',
                'updated_at' => '2025-07-27 01:43:06',
            ],
            [
                'id' => 12,
                'main_module_id' => 3,
                'module_id' => 5,
                'name' => 'Commission',
                'status' => 1,
                'created_at' => '2025-07-27 01:43:26',
                'updated_at' => '2025-07-27 01:43:26',
            ],
            [
                'id' => 13,
                'main_module_id' => 3,
                'module_id' => 5,
                'name' => 'Role Commission',
                'status' => 1,
                'created_at' => '2025-07-27 01:43:35',
                'updated_at' => '2025-07-27 01:43:35',
            ],
            [
                'id' => 14,
                'main_module_id' => 3,
                'module_id' => 5,
                'name' => 'User Role Commission',
                'status' => 1,
                'created_at' => '2025-07-27 01:43:45',
                'updated_at' => '2025-07-27 01:43:45',
            ],
            [
                'id' => 15,
                'main_module_id' => 3,
                'module_id' => 6,
                'name' => 'Subscription',
                'status' => 1,
                'created_at' => '2025-07-27 01:44:05',
                'updated_at' => '2025-07-27 01:44:05',
            ],
            [
                'id' => 16,
                'main_module_id' => 3,
                'module_id' => 6,
                'name' => 'Role Subscription',
                'status' => 1,
                'created_at' => '2025-07-27 01:44:17',
                'updated_at' => '2025-07-27 01:44:17',
            ],
            [
                'id' => 17,
                'main_module_id' => 1,
                'module_id' => 7,
                'name' => 'User Master',
                'status' => 1,
                'created_at' => '2025-07-28 00:26:40',
                'updated_at' => '2025-07-28 00:31:26',
            ],
            [
                'id' => 21,
                'main_module_id' => 1,
                'module_id' => 9,
                'name' => 'Subscription',
                'status' => 1,
                'created_at' => '2025-07-28 07:12:18',
                'updated_at' => '2025-07-28 07:12:18',
            ],
            [
                'id' => 22,
                'main_module_id' => 3,
                'module_id' => 11,
                'name' => 'User Master',
                'status' => 1,
                'created_at' => '2025-07-28 08:36:50',
                'updated_at' => '2025-07-28 08:36:50',
            ],
        ];

        foreach ($subModules as $subModule) {
            SubModule::updateOrCreate(['id' => $subModule['id']], $subModule);
        }
        
        echo "Sub Modules seeded successfully!\n";
    }
    
    private function seedRoles()
    {
        $roles = [
            [
                'id' => 1,
                'user_id' => 1,
                'name' => 'Super Admin',
                'status' => 1,
                'created_at' => '2025-07-04 21:04:33',
                'updated_at' => '2025-07-04 21:04:33',
            ],
            [
                'id' => 2,
                'user_id' => 1,
                'name' => 'Admin',
                'status' => 1,
                'created_at' => '2025-07-04 21:04:40',
                'updated_at' => '2025-07-04 21:04:40',
            ],
            [
                'id' => 3,
                'user_id' => 1,
                'name' => 'Super Distributer',
                'status' => 1,
                'created_at' => '2025-07-04 21:04:49',
                'updated_at' => '2025-07-04 21:05:11',
            ],
            [
                'id' => 4,
                'user_id' => 1,
                'name' => 'Distributer',
                'status' => 1,
                'created_at' => '2025-07-04 21:05:26',
                'updated_at' => '2025-07-04 21:05:26',
            ],
            [
                'id' => 5,
                'user_id' => 1,
                'name' => 'Retailer',
                'status' => 1,
                'created_at' => '2025-07-04 21:05:37',
                'updated_at' => '2025-07-05 17:44:35',
            ],
            [
                'id' => 6,
                'user_id' => 1,
                'name' => 'Customer',
                'status' => 1,
                'created_at' => '2025-07-04 21:05:42',
                'updated_at' => '2025-07-04 21:05:42',
            ],
            [
                'id' => 8,
                'user_id' => 3,
                'name' => 'Test Role',
                'status' => 1,
                'created_at' => '2025-07-05 19:25:13',
                'updated_at' => '2025-07-05 19:25:13',
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(['id' => $role['id']], $role);
        }
        
        echo "Roles seeded successfully!\n";
    }
    
    private function seedModuleCommissions()
    {
        $moduleCommissions = [
            [
                'id' => 1,
                'user_id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'mode' => '1',
                'txn_type' => 'Commission',
                'from_amt' => 100.00,
                'to_amt' => 1000.00,
                'commission_type' => '0',
                'commission' => 2.00,
                'status' => 1,
                'created_at' => '2025-07-07 00:50:59',
                'updated_at' => '2025-07-07 01:35:41',
            ],
            [
                'id' => 2,
                'user_id' => 1,
                'main_module_id' => 2,
                'module_id' => 2,
                'sub_module_id' => 2,
                'mode' => '0',
                'txn_type' => 'Commission',
                'from_amt' => null,
                'to_amt' => null,
                'commission_type' => '1',
                'commission' => 3.00,
                'status' => 1,
                'created_at' => '2025-07-07 00:51:11',
                'updated_at' => '2025-07-07 00:51:11',
            ],
            [
                'id' => 3,
                'user_id' => 1,
                'main_module_id' => 2,
                'module_id' => 2,
                'sub_module_id' => 3,
                'mode' => '0',
                'txn_type' => 'Commission',
                'from_amt' => null,
                'to_amt' => null,
                'commission_type' => '1',
                'commission' => 2.00,
                'status' => 1,
                'created_at' => '2025-07-07 00:55:36',
                'updated_at' => '2025-07-07 00:55:36',
            ],
            [
                'id' => 4,
                'user_id' => 1,
                'main_module_id' => 2,
                'module_id' => 2,
                'sub_module_id' => 4,
                'mode' => '0',
                'txn_type' => 'Commission',
                'from_amt' => null,
                'to_amt' => null,
                'commission_type' => '1',
                'commission' => 2.00,
                'status' => 1,
                'created_at' => '2025-07-07 01:03:09',
                'updated_at' => '2025-07-07 01:03:42',
            ],
            [
                'id' => 5,
                'user_id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'mode' => '1',
                'txn_type' => 'Commission',
                'from_amt' => 1001.00,
                'to_amt' => 2500.00,
                'commission_type' => '0',
                'commission' => 4.00,
                'status' => 1,
                'created_at' => '2025-07-07 01:36:03',
                'updated_at' => '2025-07-07 01:36:03',
            ],
            [
                'id' => 6,
                'user_id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'mode' => '1',
                'txn_type' => 'Commission',
                'from_amt' => 2501.00,
                'to_amt' => 5000.00,
                'commission_type' => '0',
                'commission' => 7.00,
                'status' => 1,
                'created_at' => '2025-07-07 01:36:27',
                'updated_at' => '2025-07-07 01:36:27',
            ],
            [
                'id' => 7,
                'user_id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'mode' => '1',
                'txn_type' => 'Commission',
                'from_amt' => 5001.00,
                'to_amt' => 9999.00,
                'commission_type' => '0',
                'commission' => 12.00,
                'status' => 1,
                'created_at' => '2025-07-07 01:36:59',
                'updated_at' => '2025-07-07 01:36:59',
            ],
            [
                'id' => 8,
                'user_id' => 3,
                'main_module_id' => 2,
                'module_id' => 2,
                'sub_module_id' => 2,
                'mode' => '0',
                'txn_type' => 'Commission',
                'from_amt' => null,
                'to_amt' => null,
                'commission_type' => '1',
                'commission' => 2.00,
                'status' => 1,
                'created_at' => '2025-07-07 02:58:01',
                'updated_at' => '2025-07-07 02:58:01',
            ],
        ];

        foreach ($moduleCommissions as $moduleCommission) {
            ModuleCommission::updateOrCreate(['id' => $moduleCommission['id']], $moduleCommission);
        }
        
        echo "Module Commissions seeded successfully!\n";
    }
    
    private function seedModulePermissions()
    {
        $modulePermissions = [
            [
                'id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'name' => 'AEPS Withdrawal',
                'endpoint' => 'aeps/withdrawal',
                'route' => 'aeps/withdrawal',
                'status' => 0,
                'menu_show' => 1,
                'created_at' => '2025-07-04 21:48:23',
                'updated_at' => '2025-07-05 17:50:30',
            ],
            [
                'id' => 2,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'name' => 'AEPS Balance Enquiry',
                'endpoint' => 'aeps/balance-enquiry',
                'route' => 'aeps/balance-enquiry',
                'status' => 1,
                'menu_show' => 1,
                'created_at' => '2025-07-04 21:49:20',
                'updated_at' => '2025-07-04 21:49:20',
            ],
            [
                'id' => 3,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'name' => 'AEPS Mini Statement',
                'endpoint' => 'aeps/mini-statement',
                'route' => 'aeps/mini-statement',
                'status' => 1,
                'menu_show' => 1,
                'created_at' => '2025-07-04 21:49:47',
                'updated_at' => '2025-07-04 21:49:47',
            ],
            [
                'id' => 4,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'name' => 'AEPS Transaction Report',
                'endpoint' => 'aeps/report',
                'route' => 'aeps/report',
                'status' => 1,
                'menu_show' => 1,
                'created_at' => '2025-07-04 21:50:11',
                'updated_at' => '2025-07-04 21:50:11',
            ],
            [
                'id' => 5,
                'main_module_id' => 2,
                'module_id' => 2,
                'sub_module_id' => 2,
                'name' => 'Mobile Recharge',
                'endpoint' => 'mobile/recharge',
                'route' => 'mobile/recharge',
                'status' => 1,
                'menu_show' => 1,
                'created_at' => '2025-07-04 21:50:54',
                'updated_at' => '2025-07-04 21:50:54',
            ],
            [
                'id' => 6,
                'main_module_id' => 2,
                'module_id' => 2,
                'sub_module_id' => 2,
                'name' => 'Mobile Recharge Report',
                'endpoint' => 'mobile/recharge-report',
                'route' => 'mobile/recharge-report',
                'status' => 1,
                'menu_show' => 1,
                'created_at' => '2025-07-04 21:51:20',
                'updated_at' => '2025-07-04 21:51:20',
            ],
        ];

        foreach ($modulePermissions as $modulePermission) {
            ModulePermission::updateOrCreate(['id' => $modulePermission['id']], $modulePermission);
        }
        
        echo "Module Permissions seeded successfully!\n";
    }
    
    private function seedRoleModuleCommissions()
    {
        $roleModuleCommissions = [
            [
                'id' => 1,
                'main_module_id' => 1,
                'user_id' => 1,
                'role_id' => 2,
                'module_id' => 1,
                'sub_module_id' => 1,
                'commission_id' => 1,
                'status' => 1,
                'created_at' => '2025-07-07 01:47:08',
                'updated_at' => '2025-07-07 01:47:08',
            ],
            [
                'id' => 2,
                'main_module_id' => 1,
                'user_id' => 1,
                'role_id' => 2,
                'module_id' => 1,
                'sub_module_id' => 1,
                'commission_id' => 5,
                'status' => 1,
                'created_at' => '2025-07-07 01:47:08',
                'updated_at' => '2025-07-07 01:47:08',
            ],
        ];

        foreach ($roleModuleCommissions as $roleModuleCommission) {
            RoleModuleCommission::updateOrCreate(['id' => $roleModuleCommission['id']], $roleModuleCommission);
        }
        
        echo "Role Module Commissions seeded successfully!\n";
    }
    
    private function seedRoleModulePermissions()
    {
        $roleModulePermissions = [
            [
                'id' => 1,
                'user_id' => 1,
                'role_id' => 2,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'permission_id' => 1,
                'status' => 1,
                'created_at' => '2025-07-07 00:49:55',
                'updated_at' => '2025-07-07 00:49:55',
            ],
            [
                'id' => 2,
                'user_id' => 1,
                'role_id' => 2,
                'main_module_id' => 1,
                'module_id' => 1,
                'sub_module_id' => 1,
                'permission_id' => 2,
                'status' => 1,
                'created_at' => '2025-07-07 00:49:55',
                'updated_at' => '2025-07-07 00:49:55',
            ],
        ];

        foreach ($roleModulePermissions as $roleModulePermission) {
            RoleModulePermission::updateOrCreate(['id' => $roleModulePermission['id']], $roleModulePermission);
        }
        
        echo "Role Module Permissions seeded successfully!\n";
    }
    
    private function seedSubscriptionMasters()
    {
        $subscriptionMasters = [
            [
                'id' => 1,
                'user_id' => 1,
                'main_module_id' => 2,
                'module_id' => 2,
                'duration' => 2,
                'duration_type' => 'Month',
                'description' => 'Unlimited Service 1,Latest Updates,Detailed Reports',
                'price' => 499.00,
                'status' => 1,
                'created_at' => '2025-07-07 21:30:35',
                'updated_at' => '2025-07-08 03:22:09',
            ],
            [
                'id' => 2,
                'user_id' => 1,
                'main_module_id' => 2,
                'module_id' => 2,
                'duration' => 3,
                'duration_type' => 'Month',
                'description' => 'Unlimited Service 1,Latest Updates,Detailed Reports',
                'price' => 999.00,
                'status' => 1,
                'created_at' => '2025-07-07 21:39:18',
                'updated_at' => '2025-07-07 21:39:18',
            ],
        ];

        foreach ($subscriptionMasters as $subscriptionMaster) {
            SubscriptionMaster::updateOrCreate(['id' => $subscriptionMaster['id']], $subscriptionMaster);
        }
        
        echo "Subscription Masters seeded successfully!\n";
    }
    
    private function seedRoleSubscriptionMasters()
    {
        // Role subscription masters data can be added here if needed
        echo "Role Subscription Masters seeded successfully!\n";
    }
    
    private function seedSubscriptions()
    {
        $subscriptions = [
            [
                'id' => 9,
                'user_id' => 1,
                'main_module_id' => 1,
                'module_id' => 1,
                'plan_id' => 5,
                'start_at' => '2025-07-11 16:51:09',
                'end_at' => '2025-08-11 16:51:09',
                'status' => 1,
                'created_at' => '2025-07-11 16:51:09',
                'updated_at' => '2025-07-11 16:51:09',
            ],
        ];

        foreach ($subscriptions as $subscription) {
            Subscription::updateOrCreate(['id' => $subscription['id']], $subscription);
        }
        
        echo "Subscriptions seeded successfully!\n";
    }
}
