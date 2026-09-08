CREATE TABLE IF NOT EXISTS `bills` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `merchant_id` BIGINT UNSIGNED NOT NULL,
  `customer_id` BIGINT UNSIGNED NULL,
  `local_id` VARCHAR(64) NOT NULL,
  `bill_number` VARCHAR(20) NOT NULL,
  `payment_mode` ENUM('cash','upi','udhar') NOT NULL DEFAULT 'cash',
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `gst_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `gst_enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `notes` TEXT NULL,
  `status` ENUM('draft','sent','paid') NOT NULL DEFAULT 'draft',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  INDEX `bills_merchant_id_index` (`merchant_id`),
  INDEX `bills_payment_mode_index` (`payment_mode`),
  UNIQUE INDEX `bills_local_id_unique` (`local_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
