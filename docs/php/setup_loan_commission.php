<?php
/**
 * Quick setup script for Loan Commission Report
 * Run this file directly to create tables and sample data
 */

// Database configuration - Update these with your actual database credentials
$host = 'localhost';
$dbname = 'your_database_name';  // Update this
$username = 'root';              // Update this
$password = '';                  // Update this

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Connected to database successfully!\n\n";
    
    // Check if loan_leads table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'loan_leads'");
    if ($stmt->rowCount() == 0) {
        echo "📋 Creating loan_leads table...\n";
        
        $sql = "
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
            consent_timestamp TIMESTAMP NULL,
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
            deleted_at TIMESTAMP NULL,
            
            INDEX idx_user_status (user_id, status),
            INDEX idx_loan_type_status (loan_type, status),
            INDEX idx_assigned_to (assigned_to),
            INDEX idx_commission_status (commission_status),
            INDEX idx_created_at (created_at),
            INDEX idx_mobile (mobile),
            INDEX idx_email (email)
        )";
        
        $pdo->exec($sql);
        echo "✅ loan_leads table created successfully!\n";
    } else {
        echo "✅ loan_leads table already exists.\n";
    }
    
    // Check if loan_lead_history table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'loan_lead_history'");
    if ($stmt->rowCount() == 0) {
        echo "📋 Creating loan_lead_history table...\n";
        
        $sql = "
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            INDEX idx_lead_id (lead_id),
            INDEX idx_changed_by (changed_by),
            INDEX idx_created_at (created_at),
            INDEX idx_status_change (old_status, new_status)
        )";
        
        $pdo->exec($sql);
        echo "✅ loan_lead_history table created successfully!\n";
    } else {
        echo "✅ loan_lead_history table already exists.\n";
    }
    
    echo "\n📊 Creating sample data...\n";
    
    // Ensure we have test users
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    
    // Check for admin user
    $stmt->execute(['admin@example.com']);
    $admin = $stmt->fetch();
    if (!$admin) {
        $pdo->prepare("
            INSERT INTO users (name, email, mobile, role, password, status, remember_token, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ")->execute([
            'Admin User', 'admin@example.com', '9876543212', 1, 
            password_hash('password', PASSWORD_DEFAULT), 1, 'admin_token_789'
        ]);
        $admin_id = $pdo->lastInsertId();
        echo "✅ Created admin user (ID: $admin_id)\n";
    } else {
        $admin_id = $admin['id'];
        echo "✅ Admin user exists (ID: $admin_id)\n";
    }
    
    // Check for regular user
    $stmt->execute(['user@example.com']);
    $user = $stmt->fetch();
    if (!$user) {
        $pdo->prepare("
            INSERT INTO users (name, email, mobile, role, password, status, remember_token, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ")->execute([
            'John Doe', 'user@example.com', '9876543210', 3, 
            password_hash('password', PASSWORD_DEFAULT), 1, 'user_token_123'
        ]);
        $user_id = $pdo->lastInsertId();
        echo "✅ Created regular user (ID: $user_id)\n";
    } else {
        $user_id = $user['id'];
        echo "✅ Regular user exists (ID: $user_id)\n";
    }
    
    // Create sample loan leads
    $sampleLeads = [
        [
            'lead_id' => 'PL000001',
            'user_id' => $user_id,
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
            'user_id' => $user_id,
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
            'user_id' => $user_id,
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
        ],
        [
            'lead_id' => 'BL000002',
            'user_id' => $user_id,
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
            'commission_released_at' => date('Y-m-d H:i:s', strtotime('-2 days')),
            'commission_released_by' => $admin_id,
            'created_at' => date('Y-m-d H:i:s', strtotime('-20 days')),
            'updated_at' => date('Y-m-d H:i:s', strtotime('-2 days'))
        ],
        [
            'lead_id' => 'PL000003',
            'user_id' => $user_id,
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
            'created_at' => date('Y-m-d H:i:s', strtotime('-10 days')),
            'updated_at' => date('Y-m-d H:i:s', strtotime('-3 days'))
        ]
    ];
    
    $insertStmt = $pdo->prepare("
        INSERT INTO loan_leads (
            lead_id, user_id, loan_type, full_name, mobile, email, employment_type,
            monthly_income, company_name, business_name, business_type, annual_turnover,
            monthly_profit, loan_amount, loan_purpose, loan_tenure, status, commission_amount,
            commission_status, commission_released_at, commission_released_by, commission_set_at,
            commission_set_by, created_at, updated_at
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
    ");
    
    foreach ($sampleLeads as $lead) {
        // Check if lead already exists
        $checkStmt = $pdo->prepare("SELECT id FROM loan_leads WHERE lead_id = ?");
        $checkStmt->execute([$lead['lead_id']]);
        
        if ($checkStmt->rowCount() == 0) {
            $insertStmt->execute([
                $lead['lead_id'], $lead['user_id'], $lead['loan_type'], $lead['full_name'],
                $lead['mobile'], $lead['email'], $lead['employment_type'] ?? null,
                $lead['monthly_income'] ?? null, $lead['company_name'] ?? null,
                $lead['business_name'] ?? null, $lead['business_type'] ?? null,
                $lead['annual_turnover'] ?? null, $lead['monthly_profit'] ?? null,
                $lead['loan_amount'], $lead['loan_purpose'], $lead['loan_tenure'],
                $lead['status'], $lead['commission_amount'], $lead['commission_status'],
                $lead['commission_released_at'] ?? null, $lead['commission_released_by'] ?? null,
                $lead['commission_set_at'] ?? null, $lead['commission_set_by'] ?? null,
                $lead['created_at'], $lead['updated_at']
            ]);
            echo "✅ Created loan lead: {$lead['lead_id']}\n";
        } else {
            echo "ℹ️  Loan lead {$lead['lead_id']} already exists\n";
        }
    }
    
    echo "\n🎉 Setup completed successfully!\n\n";
    echo "📊 Commission Report Summary:\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    
    // Get summary stats
    $stats = $pdo->query("
        SELECT 
            commission_status,
            COUNT(*) as count,
            SUM(commission_amount) as total_amount
        FROM loan_leads 
        WHERE commission_amount IS NOT NULL 
        GROUP BY commission_status
    ")->fetchAll();
    
    $totalAmount = 0;
    $totalCount = 0;
    
    foreach ($stats as $stat) {
        $status = ucfirst($stat['commission_status']);
        $count = $stat['count'];
        $amount = number_format($stat['total_amount'], 2);
        echo "💰 {$status}: {$count} leads, ₹{$amount}\n";
        $totalAmount += $stat['total_amount'];
        $totalCount += $count;
    }
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "🎯 Total: {$totalCount} leads, ₹" . number_format($totalAmount, 2) . "\n\n";
    
    echo "🔗 API Endpoint: /api/admin/loan-leads/commission-report\n";
    echo "🔑 Test with admin token: admin_token_789\n";
    echo "🌐 Frontend component ready at: LoanCommissionReport.jsx\n\n";
    
    echo "📝 Test API call:\n";
    echo "curl -X GET 'http://localhost/project/api/admin/loan-leads/commission-report' \\\n";
    echo "     -H 'Token: admin_token_789' \\\n";
    echo "     -H 'Content-Type: application/json'\n\n";
    
} catch (PDOException $e) {
    echo "❌ Database Error: " . $e->getMessage() . "\n";
    echo "\n💡 Please update the database credentials at the top of this file:\n";
    echo "   - \$host = 'localhost';\n";
    echo "   - \$dbname = 'your_database_name';  // Update this\n";
    echo "   - \$username = 'root';              // Update this\n";
    echo "   - \$password = '';                  // Update this\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>