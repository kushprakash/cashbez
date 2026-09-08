<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Employee;
use App\Models\Attendance;
use App\Models\Leave;
use App\Models\Payroll;
use App\Models\SalaryPayment;
use App\Models\Payslip;
use App\Models\Setting;

class CompleteDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed Users
        $this->seedUsers();
        
        // Seed Departments
        $this->seedDepartments();
        
        // Seed Designations
        $this->seedDesignations();
        
        // Seed Employees
        $this->seedEmployees();
        
        // Seed Attendance
        $this->seedAttendance();
        
        // Seed Leaves
        $this->seedLeaves();
        
        // Seed Payrolls
        $this->seedPayrolls();
        
        // Seed Salary Payments
        $this->seedSalaryPayments();
        
        // Seed Payslips
        $this->seedPayslips();
        
        // Seed Settings
        $this->seedSettings();
        
        echo "All data seeded successfully!\n";
    }
    
    private function seedUsers()
    {
        $users = [
            [
                'id' => 1,
                'mid' => 'CW0000001',
                'mkey' => 'cNGHE78SD3Qo1qBO91w28vtddB1JAuXo',
                'admin_mid' => 'CW0000001',
                'mobile' => '9835153380',
                'name' => 'Lov Prakash',
                'email' => 'lovprakash03@gmail.com',
                'email_verified_at' => 0,
                'aadhar_verified_at' => 0,
                'password' => '$2y$12$BFTJm07B/nd5co3FVwBoxucGup9xFNS4SmL5vXh22uUXBKx9Esq4.',
                'role' => '1',
                'root' => '',
                'status' => 1,
                'created_at' => '2025-07-04 21:03:32',
                'updated_at' => '2025-08-07 04:14:43',
            ],
            [
                'id' => 3,
                'mid' => 'CW0000002',
                'mkey' => 'cNGHE78SD3Qo1qBO9145654alkklsd1536w3465',
                'admin_mid' => 'CW0000002',
                'mobile' => '7255818469',
                'name' => 'Kush Prakash',
                'email' => 'kushprakash92@gmail.com',
                'email_verified_at' => 0,
                'aadhar_verified_at' => 0,
                'password' => '$2y$12$BFTJm07B/nd5co3FVwBoxucGup9xFNS4SmL5vXh22uUXBKx9Esq4.',
                'role' => '2',
                'root' => '',
                'status' => 1,
                'created_at' => '2025-07-04 21:03:32',
                'updated_at' => '2025-07-27 01:54:03',
            ],
            [
                'id' => 11,
                'mid' => 'CW0000004',
                'mkey' => '6ejhBwsO1KrCzj7VGkuYigrNwtNJt0Sc',
                'admin_mid' => 'CW0000002',
                'mobile' => '7903891905',
                'name' => 'Satyendra Kumar',
                'email' => 'satyendra.kumar033@gmail.com',
                'email_verified_at' => 0,
                'aadhar_verified_at' => 0,
                'password' => '$2y$12$JomJf1Pddv1grxQRn.JkvuKNEjrDCmU.jfP3OmcIkK3OU/EJ52b8W',
                'aadhar_number' => '854796321452',
                'role' => '5',
                'root' => ',CW0000002',
                'refer_by' => 'CW0000002',
                'status' => 1,
                'created_at' => '2025-07-07 15:08:52',
                'updated_at' => '2025-07-07 15:08:52',
            ],
            [
                'id' => 14,
                'mid' => 'CW0000005',
                'mkey' => 'YERtV7tMRHkhHP3loQayuLQwKT3Zbrhr',
                'admin_mid' => 'CW0000002',
                'mobile' => '9939527762',
                'name' => 'Sonu Kumar',
                'email' => 'sonu.enexa@gmail.com',
                'email_verified_at' => 0,
                'aadhar_verified_at' => 0,
                'password' => '$2y$12$NF3c0PFx1/TbRhZlUyHwU.7WiS8XFjSBdryplBQQqSXYV0EmUQpKq',
                'aadhar_number' => '852147856325',
                'role' => '8',
                'root' => ',CW0000002',
                'refer_by' => 'CW0000002',
                'status' => 1,
                'created_at' => '2025-07-27 02:05:47',
                'updated_at' => '2025-07-27 02:06:24',
            ],
            [
                'id' => 16,
                'mid' => 'CW0000006',
                'mkey' => 'H0ilBxZrKi3iR1YBlLxQ879qA3XJIap2',
                'admin_mid' => 'CW0000001',
                'mobile' => '9856985621',
                'name' => 'Amar',
                'email' => 'admin01@gmail.com',
                'email_verified_at' => 0,
                'aadhar_verified_at' => 0,
                'password' => '$2y$12$FrKPT7.xbtuVXBevGZboS.H.LDY1b4n.Nw9BkYgHqbsEQwcFzow6m',
                'role' => '8',
                'root' => ',CW0000001',
                'status' => 1,
                'created_at' => '2025-08-04 02:57:34',
                'updated_at' => '2025-08-04 02:57:34',
            ],
            [
                'id' => 17,
                'mid' => 'CW0000007',
                'mkey' => 'w5OvzKUS6xEeVA8S3A235ldgCmZji43m',
                'admin_mid' => 'CW0000001',
                'mobile' => '8521478521',
                'name' => 'Ujjwal',
                'email' => 'admin03@example.com',
                'email_verified_at' => 0,
                'aadhar_verified_at' => 0,
                'password' => '$2y$12$4fyIDpNGZ4jRlOALHOGX.OlvHInhV/nn.DVm/5h0ZwwxBHuMT5956',
                'role' => '8',
                'root' => ',CW0000001',
                'status' => 1,
                'created_at' => '2025-08-04 03:00:33',
                'updated_at' => '2025-08-04 03:00:33',
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(['id' => $user['id']], $user);
        }
        
        echo "Users seeded successfully!\n";
    }
    
    private function seedDepartments()
    {
        $departments = [
            [
                'id' => 1,
                'name' => 'HR',
                'status' => 1,
                'user_id' => 1,
                'created_at' => '2025-08-04 05:59:02',
                'updated_at' => '2025-08-04 05:59:02',
            ],
            [
                'id' => 2,
                'name' => 'IT',
                'status' => 1,
                'user_id' => 1,
                'created_at' => '2025-08-04 05:59:08',
                'updated_at' => '2025-08-04 05:59:08',
            ],
            [
                'id' => 3,
                'name' => 'Finance',
                'status' => 1,
                'user_id' => 1,
                'created_at' => '2025-08-04 05:59:15',
                'updated_at' => '2025-08-04 05:59:15',
            ],
            [
                'id' => 4,
                'name' => 'Marketing',
                'status' => 1,
                'user_id' => 1,
                'created_at' => '2025-08-04 05:59:22',
                'updated_at' => '2025-08-04 05:59:22',
            ],
        ];

        foreach ($departments as $department) {
            Department::updateOrCreate(['id' => $department['id']], $department);
        }
        
        echo "Departments seeded successfully!\n";
    }
    
    private function seedDesignations()
    {
        $designations = [
            [
                'id' => 1,
                'title' => 'HR Manager',
                'department_id' => 1,
                'user_id' => 1,
                'created_at' => '2025-08-04 05:59:46',
                'updated_at' => '2025-08-04 05:59:46',
            ],
            [
                'id' => 2,
                'title' => 'Software Developer',
                'department_id' => 2,
                'user_id' => 1,
                'created_at' => '2025-08-04 05:59:58',
                'updated_at' => '2025-08-04 05:59:58',
            ],
            [
                'id' => 3,
                'title' => 'Accountant',
                'department_id' => 3,
                'user_id' => 1,
                'created_at' => '2025-08-04 06:00:08',
                'updated_at' => '2025-08-04 06:00:08',
            ],
            [
                'id' => 4,
                'title' => 'Marketing Executive',
                'department_id' => 4,
                'user_id' => 1,
                'created_at' => '2025-08-04 06:00:18',
                'updated_at' => '2025-08-04 06:00:18',
            ],
        ];

        foreach ($designations as $designation) {
            Designation::updateOrCreate(['id' => $designation['id']], $designation);
        }
        
        echo "Designations seeded successfully!\n";
    }
    
    private function seedEmployees()
    {
        $employees = [
            [
                'id' => 1,
                'user_id' => 17,
                'super_user_id' => 1,
                'emp_code' => 'EMP001',
                'department_id' => 2,
                'designation_id' => 2,
                'join_date' => '2025-08-04',
                'dob' => '1995-01-15',
                'gender' => 'Male',
                'contact_no' => '8521478521',
                'address' => 'Patna, Bihar',
                'emergency_contact' => '9876543210',
                'status' => 'Active',
                'created_at' => '2025-08-04 06:01:16',
                'updated_at' => '2025-08-04 06:01:16',
            ],
        ];

        foreach ($employees as $employee) {
            Employee::updateOrCreate(['id' => $employee['id']], $employee);
        }
        
        echo "Employees seeded successfully!\n";
    }
    
    private function seedAttendance()
    {
        $attendances = [
            [
                'id' => 4,
                'user_id' => 17,
                'date' => '2025-08-04',
                'check_in' => '10:12:57',
                'check_out' => '19:14:14',
                'status' => 'Present',
                'check_in_latitude' => 25.62344860,
                'check_in_longitude' => 85.13237790,
                'check_out_latitude' => 25.62344860,
                'check_out_longitude' => 85.13237790,
                'check_in_address' => 'Patna, Bihar, India',
                'check_out_address' => 'Patna, Bihar, India',
                'total_hours' => 4.02,
                'created_at' => '2025-08-04 13:42:57',
                'updated_at' => '2025-08-04 13:44:14',
            ],
            [
                'id' => 5,
                'user_id' => 17,
                'date' => '2025-08-05',
                'check_in' => '09:12:57',
                'check_out' => '19:14:14',
                'status' => 'Present',
                'check_in_latitude' => 25.62344860,
                'check_in_longitude' => 85.13237790,
                'check_out_latitude' => 25.62344860,
                'check_out_longitude' => 85.13237790,
                'check_in_address' => 'Patna, Bihar, India',
                'check_out_address' => 'Patna, Bihar, India',
                'total_hours' => 4.02,
                'created_at' => '2025-08-04 13:42:57',
                'updated_at' => '2025-08-04 13:44:14',
            ],
            [
                'id' => 6,
                'user_id' => 1,
                'date' => '2025-08-06',
                'check_in' => '15:32:11',
                'check_out' => '15:32:23',
                'status' => 'Present',
                'check_in_latitude' => 25.61802240,
                'check_in_longitude' => 85.11815680,
                'check_out_latitude' => 25.61802240,
                'check_out_longitude' => 85.11815680,
                'check_in_address' => '104, Gandhi Nagar, Anandpuri, Patna, Patna, Patna Division, Bihar, India, 800001',
                'check_out_address' => '104, Gandhi Nagar, Anandpuri, Patna, Patna, Patna Division, Bihar, India, 800001',
                'total_hours' => 0.00,
                'created_at' => '2025-08-06 10:02:11',
                'updated_at' => '2025-08-06 10:02:23',
            ],
        ];

        foreach ($attendances as $attendance) {
            Attendance::updateOrCreate(['id' => $attendance['id']], $attendance);
        }
        
        echo "Attendance seeded successfully!\n";
    }
    
    private function seedLeaves()
    {
        $leaves = [
            [
                'id' => 1,
                'user_id' => 17,
                'leave_type' => 'Annual',
                'from_date' => '2025-08-07',
                'to_date' => '2025-08-09',
                'reason' => 'Personal work',
                'status' => 'Approved',
                'applied_at' => '2025-08-06 06:30:45',
                'approved_by' => 1,
                'approved_at' => '2025-08-06 06:31:01',
                'approval_remarks' => 'Approved',
                'created_at' => '2025-08-06 06:30:45',
                'updated_at' => '2025-08-06 06:31:01',
            ],
        ];

        foreach ($leaves as $leave) {
            Leave::updateOrCreate(['id' => $leave['id']], $leave);
        }
        
        echo "Leaves seeded successfully!\n";
    }
    
    private function seedPayrolls()
    {
        $payrolls = [
            [
                'id' => 1,
                'user_id' => 17,
                'created_by' => 1,
                'basic' => 25000.00,
                'hra' => 5000.00,
                'travel' => 2000.00,
                'bonus' => 3000.00,
                'allowances' => 1000.00,
                'deductions' => 2000.00,
                'pf' => 1500.00,
                'tax' => 3000.00,
                'created_at' => '2025-08-06 06:33:15',
                'updated_at' => '2025-08-06 06:33:15',
            ],
        ];

        foreach ($payrolls as $payroll) {
            Payroll::updateOrCreate(['id' => $payroll['id']], $payroll);
        }
        
        echo "Payrolls seeded successfully!\n";
    }
    
    private function seedSalaryPayments()
    {
        $salaryPayments = [
            [
                'id' => 1,
                'user_id' => 17,
                'month' => 8,
                'year' => 2025,
                'total_days' => 31,
                'payable_days' => 28,
                'gross' => 36000.00,
                'deductions' => 6500.00,
                'net' => 29500.00,
                'status' => 'Paid',
                'company_bank' => 'HDFC Bank',
                'transaction_mode' => 'online',
                'utr' => 'UTR123456789',
                'paid_leaves' => 3,
                'present_days' => 28,
                'created_at' => '2025-08-06 06:34:37',
                'updated_at' => '2025-08-06 06:34:37',
            ],
        ];

        foreach ($salaryPayments as $salaryPayment) {
            SalaryPayment::updateOrCreate(['id' => $salaryPayment['id']], $salaryPayment);
        }
        
        echo "Salary Payments seeded successfully!\n";
    }
    
    private function seedPayslips()
    {
        $payslips = [
            [
                'id' => 1,
                'salary_payment_id' => 1,
                'user_id' => 17,
                'month' => 8,
                'year' => 2025,
                'earnings' => 36000.00,
                'deductions' => 6500.00,
                'net' => 29500.00,
                'pdf_path' => 'payslips/payslip_17_8_2025.pdf',
                'created_at' => '2025-08-06 06:34:37',
                'updated_at' => '2025-08-06 06:34:37',
            ],
        ];

        foreach ($payslips as $payslip) {
            Payslip::updateOrCreate(['id' => $payslip['id']], $payslip);
        }
        
        echo "Payslips seeded successfully!\n";
    }
    
    private function seedSettings()
    {
        $settings = [
            [
                'id' => 1,
                'user_id' => 1,
                'company_name' => 'ENEXA',
                'about' => 'ENEXA is a leading provider of financial and digital services.',
                'copy_right' => '© 2025 ENEXA. All rights reserved.',
                'address' => 'Patna, Bihar, India',
                'email' => 'info@enexa.com',
                'website' => 'https://enexa.com',
                'whatsapp_no' => '9835153380',
                'mobile_no' => '9835153380',
                'landline_no' => '0612-1234567',
                'meta_title' => 'ENEXA - Financial Services',
                'meta_keyword' => 'financial services, AEPS, money transfer, bill payment',
                'meta_description' => 'ENEXA provides comprehensive financial and digital services including AEPS, money transfer, and bill payment solutions.',
                'theme_color_primary' => '#007bff',
                'theme_color_secondary' => '#6c757d',
                'currency_code' => 'INR',
                'status' => 1,
                'created_at' => '2025-08-06 06:35:00',
                'updated_at' => '2025-08-06 06:35:00',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(['id' => $setting['id']], $setting);
        }
        
        echo "Settings seeded successfully!\n";
    }
}
