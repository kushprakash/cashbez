-- ============================================================
-- AEPS Device Evidence Table
-- ============================================================
-- Purpose: Store biometric device evidence for audit, fraud detection, 
-- and regulatory compliance. Uses SHA-256 fingerprint of L1 device 
-- certificate (NOT raw serial number) as cryptographic device identity.
--
-- Usage: Run this SQL in phpMyAdmin
-- ============================================================

CREATE TABLE IF NOT EXISTS `aeps_device_evidence` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Merchant identification
    `mid` VARCHAR(50) NOT NULL COMMENT 'Merchant ID',
    
    -- Device cryptographic identity (SHA-256 of L1 certificate)
    `device_cert_fingerprint` VARCHAR(64) NOT NULL COMMENT 'SHA-256 of L1 device certificate',
    
    -- RD Device metadata
    `vendor` VARCHAR(50) NOT NULL COMMENT 'RD Vendor (Mantra, Morpho, etc)',
    `model` VARCHAR(50) NOT NULL COMMENT 'Device model (MFS100, MFS110, MSO13
    00, etc)',
    `dp_id` VARCHAR(50) NULL COMMENT 'Device Provider ID (e.g. MANTRA.MSIPL)',
    `rds_id` VARCHAR(50) NULL COMMENT 'RD Service ID',
    `rds_ver` VARCHAR(20) NULL COMMENT 'RD Service Version',
    `dc` VARCHAR(100) NULL COMMENT 'Device certificate identifier (dc attribute)',
    `mc` VARCHAR(100) NULL COMMENT 'Machine Code from device',
    
    -- Mobile device info (the phone running the app)
    `mobile_device_id` VARCHAR(100) NOT NULL COMMENT 'Android ID / iOS identifierForVendor',
    `os_info` VARCHAR(50) NULL COMMENT 'Android 14, iOS 17, etc',
    
    -- Tracking timestamps
    `first_seen_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'First time this device was used by this merchant',
    `last_seen_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last transaction with this device',
    
    -- Analytics
    `txn_count` INT UNSIGNED DEFAULT 0 COMMENT 'Number of transactions with this device',
    
    -- Audit trail
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX `idx_mid` (`mid`),
    INDEX `idx_fingerprint` (`device_cert_fingerprint`),
    INDEX `idx_vendor` (`vendor`),
    INDEX `idx_last_seen` (`last_seen_at`),
    
    -- Unique constraint: one fingerprint per merchant
    UNIQUE KEY `unique_device_per_merchant` (`mid`, `device_cert_fingerprint`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Biometric device evidence for audit, fraud detection, and compliance';

-- ============================================================
-- Usage Notes:
-- ============================================================
-- 1. device_cert_fingerprint = SHA-256 hash of the Base64 L1 certificate
--    (NOT the printed serial number visible in app)
--
-- 2. For fraud investigation:
--    - Track device reuse: SELECT mid, COUNT(*) FROM aeps_device_evidence 
--      WHERE device_cert_fingerprint = 'xxx' GROUP BY mid
--    - Blacklist by fingerprint, NOT by serial number
--
-- 3. For audits:
--    - This table proves which physical devices were used
--    - Certificate fingerprint is cryptographically verifiable
--
-- 4. The mobile_device_id tracks the Android/iOS phone, 
--    device_cert_fingerprint tracks the biometric hardware
-- ============================================================
