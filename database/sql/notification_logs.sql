-- ============================================
-- FCM Notification Logs Table Migration
-- Run this SQL in your database
-- ============================================

CREATE TABLE notification_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL COMMENT 'Recipient user (NULL for campaigns)',
    sent_by BIGINT UNSIGNED NOT NULL COMMENT 'Admin/user who sent the notification',
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type ENUM('transaction', 'account', 'system', 'promotional', 'security', 'service') DEFAULT 'system',
    data JSON NULL COMMENT 'Additional notification data payload',
    status ENUM('pending', 'sent', 'failed', 'partial') DEFAULT 'pending',
    tokens_sent INT DEFAULT 0 COMMENT 'Number of FCM tokens sent to',
    tokens_delivered INT DEFAULT 0 COMMENT 'Number successfully delivered',
    tokens_failed INT DEFAULT 0 COMMENT 'Number failed to deliver',
    fcm_response JSON NULL COMMENT 'FCM API response details',
    campaign_id VARCHAR(50) NULL COMMENT 'Campaign identifier for grouping',
    scheduled_at TIMESTAMP NULL COMMENT 'When notification is scheduled to send',
    sent_at TIMESTAMP NULL COMMENT 'When notification was actually sent',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    -- Indexes for performance
    INDEX idx_notif_user_id (user_id),
    INDEX idx_notif_sent_by (sent_by),
    INDEX idx_notif_type (type),
    INDEX idx_notif_status (status),
    INDEX idx_notif_campaign_id (campaign_id),
    INDEX idx_notif_created_at (created_at),
    INDEX idx_notif_sent_at (sent_at),
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- Notes:
-- 1. user_id is NULL for broadcast/campaign notifications
-- 2. sent_by tracks which admin/system sent the notification
-- 3. status: pending (scheduled), sent (all delivered), failed (all failed), partial (some delivered)
-- 4. campaign_id groups related notifications together
-- ============================================
