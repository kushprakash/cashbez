CREATE TABLE `income_tax_applications` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `application_type` enum('individual','business') COLLATE utf8mb4_unicode_ci NOT NULL,
  
  -- Common Fields
  `pan_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aadhar_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mobile_number` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `itr_password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL, -- If already registered
  
  -- Bank Details
  `bank_account_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ifsc_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL, -- Saving/Current
  
  -- Business Specific
  `bussiness_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nature_of_business` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL, -- Prop, type etc
  `total_sales` decimal(15,2) DEFAULT NULL,
  `profit_margin` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_expenses` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  
  -- Deductions
  `deduction_lic_tuition` decimal(15,2) DEFAULT NULL,
  `deduction_fd_nsc` decimal(15,2) DEFAULT NULL,
  `deduction_home_loan` decimal(15,2) DEFAULT NULL,
  `deduction_health_insurance` decimal(15,2) DEFAULT NULL,
  `deduction_savings_interest` decimal(15,2) DEFAULT NULL,
  
  -- Files (Paths)
  `pan_file` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_proof_file` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `aadhar_file` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL, -- Combined or front
  `bank_statement_file` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `form_16_file` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL, -- Form 16 or 16A or Salary Slip
  
  -- Admin / Status
  `status` tinyint(1) NOT NULL DEFAULT 0, -- 0: Pending, 1: Approved, 2: Rejected, 3: Error/Correction
  `admin_id` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `application_reciept` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `income_tax_applications_user_id_foreign` (`user_id`),
  KEY `income_tax_applications_admin_id_foreign` (`admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
