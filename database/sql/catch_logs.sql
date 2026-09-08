-- ===========================================
-- SQL for catch_logs table
-- Run this in phpMyAdmin
-- ===========================================

CREATE TABLE IF NOT EXISTS `catch_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `ref_id` VARCHAR(30) NOT NULL,
    `user_id` BIGINT UNSIGNED NULL,
    `mid` VARCHAR(20) NULL,
    `request` TEXT NULL,
    `endpoint` VARCHAR(100) NOT NULL,
    `api` VARCHAR(255) NULL,
    `message` TEXT NOT NULL,
    `error` TEXT NOT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(500) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `catch_logs_ref_id_unique` (`ref_id`),
    KEY `catch_logs_user_id_index` (`user_id`),
    KEY `catch_logs_mid_index` (`mid`),
    KEY `catch_logs_created_at_index` (`created_at`),
    KEY `catch_logs_mid_created_at_index` (`mid`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
