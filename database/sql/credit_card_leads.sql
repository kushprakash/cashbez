-- Credit Card Leads Table
-- This table stores credit card lead information submitted by users

CREATE TABLE IF NOT EXISTS `credit_card_leads` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'Reference to users table',
  `lead_id` VARCHAR(20) NOT NULL UNIQUE COMMENT 'Unique lead identifier format: L20251031001',
  `full_name` VARCHAR(100) NOT NULL COMMENT 'Full name of the applicant',
  `mobile` VARCHAR(15) NOT NULL COMMENT 'Mobile number with country code',
  `email` VARCHAR(100) NOT NULL COMMENT 'Email address',
  `dob` DATE NOT NULL COMMENT 'Date of birth',
  `pan` VARCHAR(10) NOT NULL COMMENT 'PAN card number',
  `monthly_income` DECIMAL(12,2) NOT NULL COMMENT 'Monthly income in rupees',
  `desired_card` VARCHAR(50) NOT NULL COMMENT 'Type of card desired (Cashback, Rewards, Travel, etc.)',
  `lead_source` VARCHAR(50) NOT NULL DEFAULT 'Website' COMMENT 'Source of the lead',
  `preferred_contact_time` ENUM('morning', 'afternoon', 'evening', 'anytime') NOT NULL DEFAULT 'anytime' COMMENT 'Preferred time for contact',
  `consent` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'User consent flag',
  `consent_timestamp` TIMESTAMP NULL COMMENT 'Timestamp when consent was given',
  `status` ENUM('new', 'contacted', 'document_pending', 'under_review', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'new' COMMENT 'Current status of lead',
  `assigned_to` BIGINT UNSIGNED NULL COMMENT 'Admin user assigned to this lead',
  `admin_id` BIGINT UNSIGNED NULL COMMENT 'Admin who manages this lead',
  `created_by` BIGINT UNSIGNED NOT NULL COMMENT 'User who created the lead',
  `notes` TEXT NULL COMMENT 'Additional notes or comments',
  `admin_notes` TEXT NULL COMMENT 'Admin internal notes',
  `status_message` VARCHAR(255) NULL COMMENT 'Status message visible to user',
  `commission_amount` DECIMAL(10,2) NULL COMMENT 'Commission amount for this lead',
  `commission_status` ENUM('pending', 'approved', 'released', 'cancelled') NULL DEFAULT 'pending' COMMENT 'Commission release status',
  `commission_released_at` TIMESTAMP NULL COMMENT 'When commission was released',
  `commission_released_by` BIGINT UNSIGNED NULL COMMENT 'Admin who released commission',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL COMMENT 'Soft delete timestamp',
  
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_lead_id` (`lead_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_assigned_to` (`assigned_to`),
  INDEX `idx_admin_id` (`admin_id`),
  INDEX `idx_created_by` (`created_by`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_commission_status` (`commission_status`),
  
  CONSTRAINT `fk_ccl_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ccl_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ccl_admin_id` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ccl_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ccl_commission_released_by` FOREIGN KEY (`commission_released_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Credit card lead management table';

-- Create lead status history table for tracking status changes
CREATE TABLE IF NOT EXISTS `credit_card_lead_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `lead_id` VARCHAR(20) NOT NULL COMMENT 'Reference to credit_card_leads.lead_id',
  `old_status` VARCHAR(50) NULL COMMENT 'Previous status',
  `new_status` VARCHAR(50) NOT NULL COMMENT 'New status',
  `changed_by` BIGINT UNSIGNED NOT NULL COMMENT 'User who made the change',
  `changed_by_role` VARCHAR(50) NOT NULL COMMENT 'Role of the user who made the change',
  `remarks` TEXT NULL COMMENT 'Remarks for the status change',
  `ip_address` VARCHAR(45) NULL COMMENT 'IP address of the user',
  `user_agent` TEXT NULL COMMENT 'Browser user agent',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX `idx_lead_id` (`lead_id`),
  INDEX `idx_changed_by` (`changed_by`),
  INDEX `idx_created_at` (`created_at`),
  
  CONSTRAINT `fk_cclh_lead_id` FOREIGN KEY (`lead_id`) REFERENCES `credit_card_leads` (`lead_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cclh_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Credit card lead status change history';

-- Insert sample data (optional - for testing)
-- INSERT INTO `credit_card_leads` (
--   `user_id`, `lead_id`, `full_name`, `mobile`, `email`, `dob`, `pan`, 
--   `monthly_income`, `desired_card`, `lead_source`, `preferred_contact_time`, 
--   `consent`, `consent_timestamp`, `status`, `assigned_to`, `admin_id`, 
--   `created_by`, `notes`, `created_at`, `updated_at`
-- ) VALUES (
--   1, 'L20251031001', 'Amit Kumar', '+919876543210', 'amit@example.com', '1990-04-15', 'ABCDE1234F',
--   50000.00, 'Cashback', 'Website', 'evening', 
--   1, '2025-10-31 10:00:00', 'new', NULL, 1, 
--   1, 'Interested in cashback + no annual fee', '2025-10-31 10:00:00', '2025-10-31 10:00:00'
-- );
