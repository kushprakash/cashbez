-- Card Downloads Table
-- Run directly in phpMyAdmin

CREATE TABLE `card_downloads` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `card_type` varchar(20) NOT NULL COMMENT 'aadhaar, pan, dl, voter, rc',
  `doc_number` varchar(50) NOT NULL,
  `dob` date DEFAULT NULL COMMENT 'required for DL',
  `refid` varchar(50) DEFAULT NULL,
  `otp` varchar(10) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=pending,1=success,2=failed',
  `api_response` longtext DEFAULT NULL COMMENT 'JSON response from GoterPay',
  `transaction_id` varchar(50) DEFAULT NULL,
  `customer_name` varchar(100) DEFAULT NULL COMMENT 'name from API response',
  `amount` decimal(8,2) NOT NULL DEFAULT 25.00,
  `commission` decimal(8,2) NOT NULL DEFAULT 20.00,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_card` (`user_id`, `card_type`),
  KEY `idx_doc_number` (`doc_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
