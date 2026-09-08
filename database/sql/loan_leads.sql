-- SQL for Unified Loan Leads Table (Single table for both Personal and Business loans)
CREATE TABLE `loan_leads` (
    `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` bigint(20) UNSIGNED DEFAULT NULL,
    `lead_id` varchar(50) NOT NULL UNIQUE,
    `loan_type` enum('personal','business') NOT NULL DEFAULT 'personal',
    `full_name` varchar(255) NOT NULL,
    `mobile` varchar(20) NOT NULL,
    `email` varchar(255) NOT NULL,
    `dob` date NOT NULL,
    `pan` varchar(10) NOT NULL,
    
    -- Personal Loan Fields
    `employment_type` enum('salaried','self_employed','business','unemployed') DEFAULT NULL,
    `monthly_income` decimal(15,2) DEFAULT NULL,
    `company_name` varchar(255) DEFAULT NULL,
    `job_title` varchar(255) DEFAULT NULL,
    `work_experience` int(11) DEFAULT NULL COMMENT 'in months',
    
    -- Business Loan Fields
    `business_name` varchar(255) DEFAULT NULL,
    `business_type` enum('proprietorship','partnership','private_limited','public_limited','llp','other') DEFAULT NULL,
    `business_category` varchar(255) DEFAULT NULL,
    `business_registration_number` varchar(100) DEFAULT NULL,
    `gst_number` varchar(20) DEFAULT NULL,
    `business_vintage` int(11) DEFAULT NULL COMMENT 'in months',
    `annual_turnover` decimal(15,2) DEFAULT NULL,
    `monthly_profit` decimal(15,2) DEFAULT NULL,
    `business_address` text DEFAULT NULL,
    `business_city` varchar(100) DEFAULT NULL,
    `business_state` varchar(100) DEFAULT NULL,
    `business_pincode` varchar(10) DEFAULT NULL,
    
    -- Common Loan Fields
    `loan_amount` decimal(15,2) NOT NULL,
    `loan_purpose` varchar(255) DEFAULT NULL,
    `loan_tenure` int(11) NOT NULL COMMENT 'in months',
    `existing_loans` boolean DEFAULT FALSE,
    `existing_loan_amount` decimal(15,2) DEFAULT NULL,
    `credit_score` int(11) DEFAULT NULL,
    
    -- Personal/Residential Address
    `address` text DEFAULT NULL,
    `city` varchar(100) DEFAULT NULL,
    `state` varchar(100) DEFAULT NULL,
    `pincode` varchar(10) DEFAULT NULL,
    
    -- Additional Fields
    `bank_statements_months` int(11) DEFAULT 12 COMMENT 'months of bank statements available',
    `collateral_available` boolean DEFAULT FALSE,
    `collateral_type` varchar(255) DEFAULT NULL,
    `collateral_value` decimal(15,2) DEFAULT NULL,
    
    `lead_source` varchar(100) DEFAULT 'Website',
    `preferred_contact_time` enum('morning','afternoon','evening','anytime') DEFAULT 'anytime',
    `consent` boolean DEFAULT FALSE,
    `consent_timestamp` timestamp NULL DEFAULT NULL,
    `status` enum('new','contacted','document_pending','under_review','approved','rejected','cancelled','processing','disbursed') DEFAULT 'new',
    `assigned_to` bigint(20) UNSIGNED DEFAULT NULL,
    `admin_id` bigint(20) UNSIGNED DEFAULT NULL,
    `created_by` bigint(20) UNSIGNED DEFAULT NULL,
    `notes` text DEFAULT NULL,
    `admin_notes` text DEFAULT NULL,
    `status_message` text DEFAULT NULL,
    
    -- Commission Fields
    `commission_amount` decimal(10,2) DEFAULT NULL,
    `commission_status` enum('pending','approved','released','cancelled') DEFAULT NULL,
    `commission_released_at` timestamp NULL DEFAULT NULL,
    `commission_released_by` bigint(20) UNSIGNED DEFAULT NULL,
    
    -- Approval Fields
    `approved_amount` decimal(15,2) DEFAULT NULL,
    `approved_tenure` int(11) DEFAULT NULL,
    `approved_interest_rate` decimal(5,2) DEFAULT NULL,
    `rejection_reason` text DEFAULT NULL,
    `documents_submitted` boolean DEFAULT FALSE,
    `verification_status` enum('pending','verified','failed') DEFAULT 'pending',
    `disbursement_date` date DEFAULT NULL,
    
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` timestamp NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `loan_leads_lead_id_unique` (`lead_id`),
    KEY `loan_leads_user_id_foreign` (`user_id`),
    KEY `loan_leads_assigned_to_foreign` (`assigned_to`),
    KEY `loan_leads_admin_id_foreign` (`admin_id`),
    KEY `loan_leads_created_by_foreign` (`created_by`),
    KEY `loan_leads_commission_released_by_foreign` (`commission_released_by`),
    KEY `loan_leads_status_index` (`status`),
    KEY `loan_leads_loan_type_index` (`loan_type`),
    KEY `loan_leads_created_at_index` (`created_at`),
    KEY `loan_leads_deleted_at_index` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SQL for Loan Lead History Table
CREATE TABLE `loan_lead_history` (
    `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    `lead_id` varchar(50) NOT NULL,
    `old_status` varchar(100) DEFAULT NULL,
    `new_status` varchar(100) NOT NULL,
    `changed_by` bigint(20) UNSIGNED DEFAULT NULL,
    `changed_by_role` varchar(100) DEFAULT NULL,
    `remarks` text DEFAULT NULL,
    `ip_address` varchar(45) DEFAULT NULL,
    `user_agent` text DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    KEY `loan_lead_history_lead_id_index` (`lead_id`),
    KEY `loan_lead_history_changed_by_foreign` (`changed_by`),
    KEY `loan_lead_history_created_at_index` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key constraints (uncomment if you want to add them)
-- ALTER TABLE `loan_leads` ADD CONSTRAINT `loan_leads_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
-- ALTER TABLE `loan_leads` ADD CONSTRAINT `loan_leads_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL;
-- ALTER TABLE `loan_leads` ADD CONSTRAINT `loan_leads_admin_id_foreign` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
-- ALTER TABLE `loan_leads` ADD CONSTRAINT `loan_leads_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
-- ALTER TABLE `loan_leads` ADD CONSTRAINT `loan_leads_commission_released_by_foreign` FOREIGN KEY (`commission_released_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
-- ALTER TABLE `loan_lead_history` ADD CONSTRAINT `loan_lead_history_changed_by_foreign` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

-- Insert sample data for testing (optional)
-- Personal Loan Sample
-- INSERT INTO `loan_leads` (`lead_id`, `loan_type`, `full_name`, `mobile`, `email`, `dob`, `pan`, `employment_type`, `monthly_income`, `loan_amount`, `loan_purpose`, `loan_tenure`, `status`) VALUES
-- ('PL001', 'personal', 'John Doe', '9876543210', 'john.doe@example.com', '1990-01-15', 'ABCDE1234F', 'salaried', 50000.00, 500000.00, 'home_improvement', 24, 'new');

-- Business Loan Sample
-- INSERT INTO `loan_leads` (`lead_id`, `loan_type`, `full_name`, `mobile`, `email`, `dob`, `pan`, `business_name`, `business_type`, `business_vintage`, `annual_turnover`, `loan_amount`, `loan_purpose`, `loan_tenure`, `status`) VALUES
-- ('BL001', 'business', 'Jane Smith', '9876543211', 'jane.smith@example.com', '1985-05-20', 'XYZAB5678C', 'Smith Enterprises', 'proprietorship', 36, 2000000.00, 1000000.00, 'business_expansion', 36, 'new');
