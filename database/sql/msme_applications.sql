-- MSME Applications Table
-- Run this SQL in phpMyAdmin

CREATE TABLE `msme_applications` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `admin_id` bigint(20) UNSIGNED DEFAULT NULL,
  `owner_name` varchar(255) NOT NULL,
  `shop_name` varchar(255) NOT NULL,
  `shop_address` text NOT NULL,
  `mobile_number` varchar(20) NOT NULL,
  `email_id` varchar(255) NOT NULL,
  `pancard_number` varchar(50) NOT NULL,
  `pancard_file` varchar(255) DEFAULT NULL,
  `aadharcard_number` varchar(50) NOT NULL,
  `aadharcard_front` varchar(255) DEFAULT NULL,
  `aadharcard_back` varchar(255) DEFAULT NULL,
  `account_number` varchar(50) NOT NULL,
  `ifsc_code` varchar(20) NOT NULL,
  `bank_passbook` varchar(255) DEFAULT NULL,
  `aplication_reciept` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '0=pending, 1=approved, 2=rejected, 3=error',
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `msme_applications_user_id_index` (`user_id`),
  KEY `msme_applications_admin_id_index` (`admin_id`),
  KEY `msme_applications_status_index` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
