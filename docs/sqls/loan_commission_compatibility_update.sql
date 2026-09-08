-- =====================================================
-- Loan Commission Report - Compatibility Updates
-- =====================================================
-- This script adds missing fields and sample data to work with existing tables

-- 1. Add missing commission fields if they don't exist
-- =====================================================
-- Check and add commission_set_at field
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_name = 'loan_leads' 
    AND table_schema = DATABASE() 
    AND column_name = 'commission_set_at') = 0,
    'ALTER TABLE loan_leads ADD COLUMN commission_set_at TIMESTAMP NULL DEFAULT NULL AFTER commission_released_by',
    'SELECT "commission_set_at already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add commission_set_by field
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE table_name = 'loan_leads' 
    AND table_schema = DATABASE() 
    AND column_name = 'commission_set_by') = 0,
    'ALTER TABLE loan_leads ADD COLUMN commission_set_by BIGINT(20) UNSIGNED NULL DEFAULT NULL AFTER commission_set_at',
    'SELECT "commission_set_by already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Ensure sample admin users exist (compatible with your existing users table)
-- =====================================================
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `mobile`, `role`, `password`, `status`, `remember_token`, `created_at`, `updated_at`) VALUES
(2, 'Admin User', 'admin@example.com', '9876543212', 1, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 'admin_token_789', NOW(), NOW()),
(3, 'John Doe', 'user@example.com', '9876543210', 3, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 'user_token_123', NOW(), NOW()),
(4, 'Jane Smith', 'jane@example.com', '9876543211', 3, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 'user_token_456', NOW(), NOW());

-- 3. Update existing loan lead to have commission data for testing
-- =====================================================
UPDATE `loan_leads` 
SET 
    `commission_amount` = 5000.00,
    `commission_status` = 'released',
    `commission_released_at` = DATE_SUB(NOW(), INTERVAL 5 DAY),
    `commission_released_by` = 1,
    `commission_set_at` = DATE_SUB(NOW(), INTERVAL 10 DAY),
    `commission_set_by` = 1
WHERE `lead_id` = 'PL000001';

-- 4. Add more sample loan leads with commission data (if they don't exist)
-- =====================================================
INSERT IGNORE INTO `loan_leads` (
    `lead_id`, `user_id`, `loan_type`, `full_name`, `mobile`, `email`, `dob`, `pan`,
    `employment_type`, `monthly_income`, `company_name`, `job_title`,
    `business_name`, `business_type`, `annual_turnover`, `monthly_profit`,
    `loan_amount`, `loan_purpose`, `loan_tenure`, `status`,
    `commission_amount`, `commission_status`, `commission_released_at`, `commission_released_by`,
    `commission_set_at`, `commission_set_by`, `created_at`, `updated_at`
) VALUES
-- Business Loan - Approved Commission
('BL000001', 1, 'business', 'Priya Sharma', '9876543211', 'priya@example.com', '1985-03-15', 'ABCDE1234F',
 NULL, NULL, NULL, NULL,
 'Sharma Enterprises', 'partnership', 2000000.00, 100000.00,
 1000000.00, 'Business expansion', 60, 'approved',
 10000.00, 'approved', NULL, NULL,
 DATE_SUB(NOW(), INTERVAL 10 DAY), 1, DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),

-- Personal Loan - Pending Commission
('PL000002', 1, 'personal', 'Amit Patel', '9876543212', 'amit@example.com', '1990-07-20', 'FGHIJ5678K',
 'self_employed', 75000.00, NULL, 'Consultant',
 NULL, NULL, NULL, NULL,
 300000.00, 'Medical expenses', 24, 'processing',
 3000.00, 'pending', NULL, NULL,
 DATE_SUB(NOW(), INTERVAL 15 DAY), 1, DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),

-- Business Loan - Released Commission
('BL000002', 1, 'business', 'Sunita Singh', '9876543213', 'sunita@example.com', '1982-11-10', 'LMNOP9012Q',
 NULL, NULL, NULL, NULL,
 'Singh Trading Co', 'proprietorship', 5000000.00, 200000.00,
 2000000.00, 'Working capital', 36, 'disbursed',
 20000.00, 'released', DATE_SUB(NOW(), INTERVAL 2 DAY), 1,
 DATE_SUB(NOW(), INTERVAL 7 DAY), 1, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Personal Loan - Pending Commission
('PL000003', 1, 'personal', 'Vikash Gupta', '9876543214', 'vikash@example.com', '1988-09-05', 'RSTUV3456W',
 'salaried', 80000.00, 'Infosys', 'Senior Developer',
 NULL, NULL, NULL, NULL,
 800000.00, 'Debt consolidation', 48, 'under_review',
 8000.00, 'pending', NULL, NULL,
 DATE_SUB(NOW(), INTERVAL 10 DAY), 1, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY));

-- 5. Add sample history records (compatible with your VARCHAR changed_by_role field)
-- =====================================================
INSERT IGNORE INTO `loan_lead_history` (
    `lead_id`, `old_status`, `new_status`, `changed_by`, `changed_by_role`, `remarks`, `created_at`
) VALUES
('PL000001', 'contacted', 'document_pending', 1, '1', 'Documents requested from customer', DATE_SUB(NOW(), INTERVAL 25 DAY)),
('PL000001', 'document_pending', 'under_review', 1, '1', 'All documents received, under review', DATE_SUB(NOW(), INTERVAL 20 DAY)),
('PL000001', 'under_review', 'approved', 1, '1', 'Loan approved for ₹5,00,000', DATE_SUB(NOW(), INTERVAL 15 DAY)),
('PL000001', 'approved', 'disbursed', 1, '1', 'Loan amount disbursed to customer account', DATE_SUB(NOW(), INTERVAL 10 DAY)),
('PL000001', 'disbursed', 'disbursed', 1, '1', 'Commission released: ₹5,000', DATE_SUB(NOW(), INTERVAL 5 DAY)),

('BL000001', 'new', 'contacted', 1, '1', 'Business loan inquiry processed', DATE_SUB(NOW(), INTERVAL 23 DAY)),
('BL000001', 'contacted', 'document_pending', 1, '1', 'Business documents requested', DATE_SUB(NOW(), INTERVAL 18 DAY)),
('BL000001', 'document_pending', 'approved', 1, '1', 'Business loan approved for ₹10,00,000', DATE_SUB(NOW(), INTERVAL 10 DAY)),
('BL000001', 'approved', 'approved', 1, '1', 'Commission set to ₹10,000 with status approved', DATE_SUB(NOW(), INTERVAL 10 DAY)),

('PL000002', 'new', 'contacted', 1, '1', 'Customer contacted for personal loan', DATE_SUB(NOW(), INTERVAL 13 DAY)),
('PL000002', 'contacted', 'processing', 1, '1', 'Application under processing', DATE_SUB(NOW(), INTERVAL 8 DAY)),

('BL000002', 'new', 'under_review', 1, '1', 'Business loan application received', DATE_SUB(NOW(), INTERVAL 18 DAY)),
('BL000002', 'under_review', 'approved', 1, '1', 'Business loan approved', DATE_SUB(NOW(), INTERVAL 10 DAY)),
('BL000002', 'approved', 'disbursed', 1, '1', 'Loan disbursed successfully', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('BL000002', 'disbursed', 'disbursed', 1, '1', 'Commission released: ₹20,000', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- 6. Display summary information
-- =====================================================
SELECT '=== LOAN COMMISSION REPORT SETUP COMPLETE ===' as message;

SELECT 
    commission_status as 'Commission Status',
    COUNT(*) as 'Count',
    CONCAT('₹', FORMAT(SUM(commission_amount), 2)) as 'Total Amount'
FROM loan_leads 
WHERE commission_amount IS NOT NULL 
GROUP BY commission_status
ORDER BY 
    CASE commission_status 
        WHEN 'pending' THEN 1 
        WHEN 'approved' THEN 2 
        WHEN 'released' THEN 3 
        WHEN 'cancelled' THEN 4 
    END;

SELECT 
    loan_type as 'Loan Type',
    COUNT(*) as 'Total Leads',
    COUNT(CASE WHEN commission_amount IS NOT NULL THEN 1 END) as 'With Commission',
    CONCAT('₹', FORMAT(COALESCE(SUM(commission_amount), 0), 2)) as 'Total Commission'
FROM loan_leads 
GROUP BY loan_type;

-- =====================================================
-- API Testing Information
-- =====================================================
/*
🎯 API Endpoint: GET /api/admin/loan-leads/commission-report

🔑 Test Tokens (based on your existing user data):
   - Super Admin: Use your existing admin token or create one
   - Admin: admin_token_789

📝 Test API Call:
curl -X GET "http://localhost/project/api/admin/loan-leads/commission-report" \
     -H "Token: admin_token_789" \
     -H "Content-Type: application/json"

🎛️ Available Filters:
   - commission_status: pending, approved, released, cancelled
   - loan_type: personal, business
   - date_from: YYYY-MM-DD
   - date_to: YYYY-MM-DD

📊 Sample Filter Call:
curl -X GET "http://localhost/project/api/admin/loan-leads/commission-report?commission_status=released&loan_type=personal" \
     -H "Token: admin_token_789" \
     -H "Content-Type: application/json"

⚠️ Important Notes:
1. This script adds missing commission fields to your existing table structure
2. Updates your existing PL000001 record with commission data for testing
3. Adds sample data that's compatible with your table constraints
4. Uses VARCHAR for changed_by_role to match your existing structure
*/