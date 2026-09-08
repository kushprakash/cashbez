<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\LoanLead;
use App\Models\User;
use Illuminate\Support\Facades\DB;

// Load Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Create sample data directly
try {
    // Check if tables exist, if not create them
    if (!DB::connection()->getSchemaBuilder()->hasTable('loan_leads')) {
        echo "Creating loan_leads table...\n";
        
        DB::statement("
            CREATE TABLE loan_leads (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                lead_id VARCHAR(255) UNIQUE NOT NULL,
                user_id BIGINT NOT NULL,
                loan_type ENUM('personal', 'business') NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                mobile VARCHAR(20) NOT NULL,
                email VARCHAR(255),
                dob DATE,
                pan VARCHAR(10),
                employment_type ENUM('salaried', 'self_employed', 'business', 'professional'),
                monthly_income DECIMAL(12,2),
                company_name VARCHAR(255),
                job_title VARCHAR(255),
                work_experience INT,
                business_name VARCHAR(255),
                business_type VARCHAR(255),
                business_category VARCHAR(255),
                business_registration_number VARCHAR(255),
                gst_number VARCHAR(255),
                business_vintage INT,
                annual_turnover DECIMAL(15,2),
                monthly_profit DECIMAL(12,2),
                business_address TEXT,
                business_city VARCHAR(255),
                business_state VARCHAR(255),
                business_pincode VARCHAR(10),
                loan_amount DECIMAL(12,2) NOT NULL,
                loan_purpose VARCHAR(255),
                loan_tenure INT,
                existing_loans BOOLEAN DEFAULT FALSE,
                existing_loan_amount DECIMAL(12,2),
                credit_score INT,
                address TEXT,
                city VARCHAR(255),
                state VARCHAR(255),
                pincode VARCHAR(10),
                bank_statements_months INT,
                collateral_available BOOLEAN DEFAULT FALSE,
                collateral_type VARCHAR(255),
                collateral_value DECIMAL(15,2),
                lead_source VARCHAR(255),
                preferred_contact_time VARCHAR(255),
                consent BOOLEAN DEFAULT TRUE,
                consent_timestamp TIMESTAMP,
                status ENUM('new','contacted','document_pending','under_review','processing','approved','disbursed','rejected','cancelled') DEFAULT 'new',
                assigned_to BIGINT,
                admin_id BIGINT,
                created_by BIGINT,
                notes TEXT,
                admin_notes TEXT,
                status_message TEXT,
                commission_amount DECIMAL(10,2),
                commission_status ENUM('pending','approved','released','cancelled'),
                commission_released_at TIMESTAMP NULL,
                commission_released_by BIGINT,
                commission_set_at TIMESTAMP NULL,
                commission_set_by BIGINT,
                approved_amount DECIMAL(12,2),
                approved_tenure INT,
                approved_interest_rate DECIMAL(5,2),
                rejection_reason TEXT,
                documents_submitted BOOLEAN DEFAULT FALSE,
                verification_status ENUM('pending','verified','rejected'),
                disbursement_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL
            )
        ");
        
        echo "loan_leads table created successfully!\n";
    }
    
    if (!DB::connection()->getSchemaBuilder()->hasTable('loan_lead_history')) {
        echo "Creating loan_lead_history table...\n";
        
        DB::statement("
            CREATE TABLE loan_lead_history (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                lead_id VARCHAR(255) NOT NULL,
                old_status VARCHAR(255),
                new_status VARCHAR(255) NOT NULL,
                changed_by BIGINT,
                changed_by_role INT,
                remarks TEXT,
                ip_address VARCHAR(45),
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ");
        
        echo "loan_lead_history table created successfully!\n";
    }
    
    // Create sample users if they don't exist
    $user1 = DB::table('users')->where('email', 'user1@example.com')->first();
    if (!$user1) {
        DB::table('users')->insert([
            'name' => 'John Doe',
            'email' => 'user1@example.com',
            'mobile' => '9876543210',
            'role' => 3,
            'password' => bcrypt('password'),
            'status' => 1,
            'remember_token' => 'sample_token_123',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        $user1_id = DB::getPdo()->lastInsertId();
    } else {
        $user1_id = $user1->id;
    }
    
    $admin = DB::table('users')->where('email', 'admin@example.com')->first();
    if (!$admin) {
        DB::table('users')->insert([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'mobile' => '9876543212',
            'role' => 1,
            'password' => bcrypt('password'),
            'status' => 1,
            'remember_token' => 'admin_token_789',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        $admin_id = DB::getPdo()->lastInsertId();
    } else {
        $admin_id = $admin->id;
    }
    
    // Insert sample loan leads
    $loanLeads = [
        [
            'lead_id' => 'PL000001',
            'user_id' => $user1_id,
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
            'commission_released_at' => date('Y-m-d H:i:s', strtotime('-5 days')),
            'commission_released_by' => $admin_id,
            'created_at' => date('Y-m-d H:i:s', strtotime('-30 days')),
            'updated_at' => date('Y-m-d H:i:s', strtotime('-5 days'))
        ],
        [
            'lead_id' => 'BL000001',
            'user_id' => $user1_id,
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
            'commission_set_at' => date('Y-m-d H:i:s', strtotime('-10 days')),
            'commission_set_by' => $admin_id,
            'created_at' => date('Y-m-d H:i:s', strtotime('-25 days')),
            'updated_at' => date('Y-m-d H:i:s', strtotime('-10 days'))
        ],
        [
            'lead_id' => 'PL000002',
            'user_id' => $user1_id,
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
            'created_at' => date('Y-m-d H:i:s', strtotime('-15 days')),
            'updated_at' => date('Y-m-d H:i:s', strtotime('-5 days'))
        ]
    ];
    
    foreach ($loanLeads as $leadData) {
        // Check if lead already exists
        $existing = DB::table('loan_leads')->where('lead_id', $leadData['lead_id'])->first();
        if (!$existing) {
            DB::table('loan_leads')->insert($leadData);
            echo "Created loan lead: " . $leadData['lead_id'] . "\n";
        }
    }
    
    echo "Sample data created successfully!\n";
    echo "You can now test the commission report API at: /api/admin/loan-leads/commission-report\n";
    echo "Use admin token: admin_token_789\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}