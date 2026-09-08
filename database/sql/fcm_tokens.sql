-- ============================================
-- FCM Tokens Table Migration
-- Run this SQL in your database
-- ============================================

CREATE TABLE fcm_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(500) NOT NULL,
    device_type ENUM('android', 'ios', 'web') DEFAULT 'android',
    device_id VARCHAR(255) NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    -- Indexes for performance
    INDEX idx_fcm_user_id (user_id),
    INDEX idx_fcm_token (token(255)),
    INDEX idx_fcm_active (is_active),
    
    -- Unique constraint to prevent duplicate tokens per user
    UNIQUE KEY unique_user_token (user_id, token(255))
);

-- ============================================
-- Notes:
-- 1. FCM tokens can be up to 250 characters, but we use 500 for safety
-- 2. token index is limited to 255 chars due to MySQL index limitations
-- 3. is_active allows soft-deactivation on logout without deletion
-- ============================================
