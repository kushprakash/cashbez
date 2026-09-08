CREATE TABLE `bill_stock_movements` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `local_id` varchar(255) NOT NULL,
  `merchant_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `type` enum('sale','manual_in','manual_out','adjustment') NOT NULL,
  `qty` decimal(10,2) NOT NULL,
  `stock_before` decimal(10,2) NOT NULL,
  `stock_after` decimal(10,2) NOT NULL,
  `note` text DEFAULT NULL,
  `reference_bill_local_id` varchar(255) DEFAULT NULL,
  `is_ghost` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bill_stock_movements_local_id_unique` (`local_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
