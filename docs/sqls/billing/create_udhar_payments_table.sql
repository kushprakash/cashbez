CREATE TABLE IF NOT EXISTS `bill_udhar_payments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `udhar_entry_id` BIGINT UNSIGNED NOT NULL,
  `local_id` VARCHAR(64) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `note` VARCHAR(255) NULL,
  `paid_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  UNIQUE INDEX `bill_udhar_payments_local_id_unique` (`local_id`),
  INDEX `bill_udhar_payments_entry_id_index` (`udhar_entry_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
