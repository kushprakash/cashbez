-- Create add_funds table
CREATE TABLE IF NOT EXISTS `add_funds` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `account_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `txnid` varchar(255) NOT NULL,
  `order_id` varchar(255) NOT NULL,
  `status` enum('pending','success','failed') NOT NULL DEFAULT 'pending',
  `utr` varchar(255) DEFAULT NULL,
  `paytm_response` text DEFAULT NULL,
  `device_id` varchar(255) DEFAULT NULL,
  `sim_verified` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `add_funds_txnid_unique` (`txnid`),
  KEY `add_funds_user_id_foreign` (`user_id`),
  KEY `add_funds_account_id_foreign` (`account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add Paytm credentials to settings table
-- Run these primarily if columns don't exist
ALTER TABLE `settings` ADD `paytm_mid` VARCHAR(255) NULL AFTER `currency_code`;
ALTER TABLE `settings` ADD `paytm_sign` TEXT NULL AFTER `paytm_mid`;
