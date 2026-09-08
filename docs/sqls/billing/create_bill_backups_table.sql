CREATE TABLE IF NOT EXISTS `bill_backups` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `merchant_id` BIGINT UNSIGNED NOT NULL,
  `source` ENUM('manual','auto','drive') NOT NULL DEFAULT 'manual',
  `version` VARCHAR(10) NOT NULL DEFAULT '1.0',
  `size_bytes` BIGINT UNSIGNED NULL,
  `drive_file_id` VARCHAR(255) NULL,
  `payload` LONGTEXT NOT NULL COMMENT 'Full JSON backup payload',
  `status` ENUM('success','failed') NOT NULL DEFAULT 'success',
  `error` TEXT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  INDEX `bill_backups_merchant_id_index` (`merchant_id`),
  INDEX `bill_backups_source_index` (`source`),
  INDEX `bill_backups_created_at_index` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
