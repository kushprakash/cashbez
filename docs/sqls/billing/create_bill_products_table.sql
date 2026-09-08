CREATE TABLE IF NOT EXISTS `bill_products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `merchant_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `selling_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `purchase_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `gst_rate` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `unit` VARCHAR(50) NULL,
  `stock_qty` DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  `low_stock_threshold` DECIMAL(10,3) NULL,
  `barcode` VARCHAR(100) NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  INDEX `bill_products_merchant_id_index` (`merchant_id`),
  INDEX `bill_products_barcode_index` (`barcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
