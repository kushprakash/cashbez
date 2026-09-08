-- ============================================================
-- COMPLETE SQL: Truncate + Column Migration + Sample Data
-- Cascade: Lead Type → Lead Source → Follow-up Type → Followup Status / Lead Status
-- Added: 'position' column to lead_status (1 to 3, where 3 is final)
-- admin_id = 21, created_by = 21
-- ============================================================

-- ============================================================
-- STEP 1: SAFE TRUNCATE ALL TABLES
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `lead_activities`;
TRUNCATE TABLE `followups`;
TRUNCATE TABLE `followup_statuses`;
TRUNCATE TABLE `lead_status`;
TRUNCATE TABLE `followup_types`;
TRUNCATE TABLE `lead_types`;
TRUNCATE TABLE `leads`;
TRUNCATE TABLE `lead_sources`;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- STEP 2: ADD COLUMNS (skip if already exist)
-- ============================================================

-- A1: lead_type_id on followup_types
SET @c1 = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='followup_types' AND COLUMN_NAME='lead_type_id');
SET @s1 = IF(@c1=0,'ALTER TABLE `followup_types` ADD COLUMN `lead_type_id` BIGINT UNSIGNED NULL AFTER `sort_order`','SELECT 1');
PREPARE st1 FROM @s1; EXECUTE st1; DEALLOCATE PREPARE st1;

-- A2: lead_source_id on followup_types
SET @c2 = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='followup_types' AND COLUMN_NAME='lead_source_id');
SET @s2 = IF(@c2=0,'ALTER TABLE `followup_types` ADD COLUMN `lead_source_id` BIGINT UNSIGNED NULL AFTER `lead_type_id`','SELECT 1');
PREPARE st2 FROM @s2; EXECUTE st2; DEALLOCATE PREPARE st2;

-- A3: lead_status_id on followups
SET @c3 = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='followups' AND COLUMN_NAME='lead_status_id');
SET @s3 = IF(@c3=0,'ALTER TABLE `followups` ADD COLUMN `lead_status_id` BIGINT UNSIGNED NULL AFTER `followup_status_id`','SELECT 1');
PREPARE st3 FROM @s3; EXECUTE st3; DEALLOCATE PREPARE st3;

-- A4: followup tracking columns on lead_activities
SET @c4 = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='lead_activities' AND COLUMN_NAME='followup_type_id');
SET @s4 = IF(@c4=0,'ALTER TABLE `lead_activities` ADD COLUMN `followup_type_id` BIGINT UNSIGNED NULL AFTER `next_followup`, ADD COLUMN `followup_status_id` BIGINT UNSIGNED NULL AFTER `followup_type_id`, ADD COLUMN `lead_status_id` BIGINT UNSIGNED NULL AFTER `followup_status_id`, ADD COLUMN `followup_time` TIME NULL AFTER `lead_status_id`, ADD COLUMN `followup_notes` TEXT NULL AFTER `followup_time`','SELECT 1');
PREPARE st4 FROM @s4; EXECUTE st4; DEALLOCATE PREPARE st4;

-- A5: lead_type_id on lead_sources
SET @c5 = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='lead_sources' AND COLUMN_NAME='lead_type_id');
SET @s5 = IF(@c5=0,'ALTER TABLE `lead_sources` ADD COLUMN `lead_type_id` BIGINT UNSIGNED NULL AFTER `name`','SELECT 1');
PREPARE st5 FROM @s5; EXECUTE st5; DEALLOCATE PREPARE st5;

-- A6: position on lead_status
SET @c6 = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='lead_status' AND COLUMN_NAME='position');
SET @s6 = IF(@c6=0,'ALTER TABLE `lead_status` ADD COLUMN `position` INT NOT NULL DEFAULT 1 AFTER `color`','SELECT 1');
PREPARE st6 FROM @s6; EXECUTE st6; DEALLOCATE PREPARE st6;


-- ============================================================
-- STEP 3: INSERT LEAD TYPES
-- ============================================================
INSERT INTO `lead_types` (`id`, `name`, `description`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'Sale Business', 'Business sales and revenue generation leads', 21, 21, NOW(), NOW()),
(2, 'Retailer Onboarding', 'New retailer registration and onboarding leads', 21, 21, NOW(), NOW()),
(3, 'Tech Support', 'Technical support and issue resolution leads', 21, 21, NOW(), NOW()),
(4, 'Operational Support', 'Operational support and process assistance leads', 21, 21, NOW(), NOW());

-- ============================================================
-- STEP 4: INSERT LEAD SOURCES (linked to Lead Type)
-- ============================================================
INSERT INTO `lead_sources` (`id`, `name`, `lead_type_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'Walk-in', 1, 21, 21, NOW(), NOW()),
(2, 'Phone Call', 1, 21, 21, NOW(), NOW()),
(3, 'Website', 1, 21, 21, NOW(), NOW()),
(4, 'Referral', 1, 21, 21, NOW(), NOW()),
(5, 'Social Media', 1, 21, 21, NOW(), NOW()),
(6, 'Field Visit', 2, 21, 21, NOW(), NOW()),
(7, 'Partner Referral', 2, 21, 21, NOW(), NOW()),
(8, 'WhatsApp Campaign', 2, 21, 21, NOW(), NOW()),
(9, 'Exhibition/Event', 2, 21, 21, NOW(), NOW()),
(10, 'Telecalling', 2, 21, 21, NOW(), NOW()),
(11, 'Helpdesk', 3, 21, 21, NOW(), NOW()),
(12, 'App/Portal', 3, 21, 21, NOW(), NOW()),
(13, 'Phone Call', 3, 21, 21, NOW(), NOW()),
(14, 'WhatsApp', 3, 21, 21, NOW(), NOW()),
(15, 'Email', 3, 21, 21, NOW(), NOW()),
(16, 'Internal Transfer', 4, 21, 21, NOW(), NOW()),
(17, 'Branch Request', 4, 21, 21, NOW(), NOW()),
(18, 'Escalation', 4, 21, 21, NOW(), NOW()),
(19, 'Walk-in', 4, 21, 21, NOW(), NOW()),
(20, 'Phone Call', 4, 21, 21, NOW(), NOW());

-- ============================================================
-- STEP 5: INSERT FOLLOWUP TYPES (linked to Lead Type + Lead Source)
-- Each lead source gets 2 followup types
-- ============================================================

-- Sale Business → Walk-in (src=1)
INSERT INTO `followup_types` (`id`, `name`, `color`, `description`, `is_active`, `sort_order`, `lead_type_id`, `lead_source_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'Walk-in Follow-up Call', '#0d6efd', 'Follow-up call after walk-in visit', 1, 1, 1, 1, 21, 21, NOW(), NOW()),
(2, 'Walk-in Meeting', '#198754', 'Schedule meeting after walk-in', 1, 2, 1, 1, 21, 21, NOW(), NOW());

-- Sale Business → Phone Call (src=2)
INSERT INTO `followup_types` (`id`, `name`, `color`, `description`, `is_active`, `sort_order`, `lead_type_id`, `lead_source_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
(3, 'Sales Callback', '#6f42c1', 'Callback for phone inquiry', 1, 1, 1, 2, 21, 21, NOW(), NOW()),
(4, 'Phone Demo', '#ffc107', 'Product demo over phone', 1, 2, 1, 2, 21, 21, NOW(), NOW());

-- Sale Business → Website (src=3)
INSERT INTO `followup_types` (`id`, `name`, `color`, `description`, `is_active`, `sort_order`, `lead_type_id`, `lead_source_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
(5, 'Website Lead Email', '#dc3545', 'Email to website lead', 1, 1, 1, 3, 21, 21, NOW(), NOW()),
(6, 'Online Demo', '#0dcaf0', 'Online product demo', 1, 2, 1, 3, 21, 21, NOW(), NOW());

-- Sale Business → Referral (src=4)
INSERT INTO `followup_types` (`id`, `name`, `color`, `description`, `is_active`, `sort_order`, `lead_type_id`, `lead_source_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
(7, 'Referral Call', '#20c997', 'Call referred lead', 1, 1, 1, 4, 21, 21, NOW(), NOW()),
(8, 'Referral Meeting', '#fd7e14', 'Meet referred lead', 1, 2, 1, 4, 21, 21, NOW(), NOW());

-- Sale Business → Social Media (src=5)
INSERT INTO `followup_types` (`id`, `name`, `color`, `description`, `is_active`, `sort_order`, `lead_type_id`, `lead_source_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
(9, 'Social Media Reply', '#d63384', 'Reply to social media inquiry', 1, 1, 1, 5, 21, 21, NOW(), NOW()),
(10, 'DM Follow-up', '#25d366', 'Follow-up via DM', 1, 2, 1, 5, 21, 21, NOW(), NOW());

-- Retailer Onboarding → Field Visit (src=6)
INSERT INTO `followup_types` (`id`, `name`, `color`, `description`, `is_active`, `sort_order`, `lead_type_id`, `lead_source_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
(11, 'Site Visit', '#0d6efd', 'Visit retailer site', 1, 1, 2, 6, 21, 21, NOW(), NOW()),
(12, 'Document Pickup', '#198754', 'Pick up KYC documents', 1, 2, 2, 6, 21, 21, NOW(), NOW());

-- Retailer Onboarding → Partner Referral (src=7)
INSERT INTO `followup_types` (`id`, `name`, `color`, `description`, `is_active`, `sort_order`, `lead_type_id`, `lead_source_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
(13, 'Partner Call', '#6f42c1', 'Call referred retailer', 1, 1, 2, 7, 21, 21, NOW(), NOW()),
(14, 'Partner Meeting', '#ffc107', 'Meet referred retailer', 1, 2, 2, 7, 21, 21, NOW(), NOW());

-- Retailer Onboarding → WhatsApp Campaign (src=8)
INSERT INTO `followup_types` (`id`, `name`, `color`, `description`, `is_active`, `sort_order`, `lead_type_id`, `lead_source_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
(15, 'WhatsApp Follow-up', '#25d366', 'Follow-up WhatsApp lead', 1, 1, 2, 8, 21, 21, NOW(), NOW()),
(16, 'WhatsApp Call', '#dc3545', 'Call WhatsApp lead', 1, 2, 2, 8, 21, 21, NOW(), NOW());

-- Retailer Onboarding → Exhibition/Event (src=9)
INSERT INTO `followup_types` (`id`, `name`, `color`, `description`, `is_active`, `sort_order`, `lead_type_id`, `lead_source_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
(17, 'Event Follow-up Call', '#0dcaf0', 'Call event lead', 1, 1, 2, 9, 21, 21, NOW(), NOW()),
(18, 'Event Demo', '#fd7e14', 'Demo for event lead', 1, 2, 2, 9, 21, 21, NOW(), NOW());

-- Retailer Onboarding → Telecalling (src=10)
INSERT INTO `followup_types` (`id`, `name`, `color`, `description`, `is_active`, `sort_order`, `lead_type_id`, `lead_source_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
(19, 'Telecalling Follow-up', '#d63384', 'Follow-up telecalling lead', 1, 1, 2, 10, 21, 21, NOW(), NOW()),
(20, 'Document Request', '#20c997', 'Request documents from telecall lead', 1, 2, 2, 10, 21, 21, NOW(), NOW());

-- Tech Support → Helpdesk (src=11)
INSERT INTO `followup_types` (`id`, `name`, `color`, `description`, `is_active`, `sort_order`, `lead_type_id`, `lead_source_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
(21, 'Helpdesk Call', '#dc3545', 'Follow-up helpdesk ticket', 1, 1, 3, 11, 21, 21, NOW(), NOW()),
(22, 'Ticket Follow-up', '#6610f2', 'Update on open ticket', 1, 2, 3, 11, 21, 21, NOW(), NOW());

-- Tech Support → App/Portal (src=12)
INSERT INTO `followup_types` (`id`, `name`, `color`, `description`, `is_active`, `sort_order`, `lead_type_id`, `lead_source_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
(23, 'App Issue Call', '#0d6efd', 'Call about app issue', 1, 1, 3, 12, 21, 21, NOW(), NOW()),
(24, 'Remote Fix', '#198754', 'Remote fix for app issue', 1, 2, 3, 12, 21, 21, NOW(), NOW());

-- Tech Support → Phone Call (src=13)
INSERT INTO `followup_types` (`id`, `name`, `color`, `description`, `is_active`, `sort_order`, `lead_type_id`, `lead_source_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
(25, 'Tech Phone Follow-up', '#ffc107', 'Phone follow-up for tech issue', 1, 1, 3, 13, 21, 21, NOW(), NOW()),
(26, 'Escalation Call', '#dc3545', 'Escalation call for tech issue', 1, 2, 3, 13, 21, 21, NOW(), NOW());

-- Tech Support → WhatsApp (src=14)
INSERT INTO `followup_types` (`id`, `name`, `color`, `description`, `is_active`, `sort_order`, `lead_type_id`, `lead_source_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
(27, 'WhatsApp Support', '#25d366', 'WhatsApp tech support', 1, 1, 3, 14, 21, 21, NOW(), NOW()),
(28, 'WhatsApp Video Call', '#6f42c1', 'Video call via WhatsApp', 1, 2, 3, 14, 21, 21, NOW(), NOW());

-- Tech Support → Email (src=15)
INSERT INTO `followup_types` (`id`, `name`, `color`, `description`, `is_active`, `sort_order`, `lead_type_id`, `lead_source_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
(29, 'Email Support', '#0dcaf0', 'Email tech support', 1, 1, 3, 15, 21, 21, NOW(), NOW()),
(30, 'Email Escalation', '#e35d6a', 'Escalation via email', 1, 2, 3, 15, 21, 21, NOW(), NOW());

-- Operational Support → Internal Transfer (src=16)
INSERT INTO `followup_types` (`id`, `name`, `color`, `description`, `is_active`, `sort_order`, `lead_type_id`, `lead_source_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
(31, 'Internal Call', '#0d6efd', 'Internal follow-up call', 1, 1, 4, 16, 21, 21, NOW(), NOW()),
(32, 'Process Check', '#198754', 'Check process status', 1, 2, 4, 16, 21, 21, NOW(), NOW());

-- Operational Support → Branch Request (src=17)
INSERT INTO `followup_types` (`id`, `name`, `color`, `description`, `is_active`, `sort_order`, `lead_type_id`, `lead_source_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
(33, 'Branch Visit', '#ffc107', 'Visit branch for support', 1, 1, 4, 17, 21, 21, NOW(), NOW()),
(34, 'Branch Call', '#dc3545', 'Call branch for follow-up', 1, 2, 4, 17, 21, 21, NOW(), NOW());

-- Operational Support → Escalation (src=18)
INSERT INTO `followup_types` (`id`, `name`, `color`, `description`, `is_active`, `sort_order`, `lead_type_id`, `lead_source_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
(35, 'Escalation Call', '#e35d6a', 'Escalation follow-up call', 1, 1, 4, 18, 21, 21, NOW(), NOW()),
(36, 'Management Meeting', '#6f42c1', 'Meeting with management', 1, 2, 4, 18, 21, 21, NOW(), NOW());

-- Operational Support → Walk-in (src=19)
INSERT INTO `followup_types` (`id`, `name`, `color`, `description`, `is_active`, `sort_order`, `lead_type_id`, `lead_source_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
(37, 'Walk-in Support', '#20c997', 'Support for walk-in customer', 1, 1, 4, 19, 21, 21, NOW(), NOW()),
(38, 'On-site Fix', '#fd7e14', 'Fix issue on-site', 1, 2, 4, 19, 21, 21, NOW(), NOW());

-- Operational Support → Phone Call (src=20)
INSERT INTO `followup_types` (`id`, `name`, `color`, `description`, `is_active`, `sort_order`, `lead_type_id`, `lead_source_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
(39, 'Ops Phone Follow-up', '#d63384', 'Ops phone follow-up', 1, 1, 4, 20, 21, 21, NOW(), NOW()),
(40, 'Follow-up Call', '#25d366', 'General follow-up call', 1, 2, 4, 20, 21, 21, NOW(), NOW());


-- ============================================================
-- STEP 6: INSERT FOLLOWUP STATUSES (3 per followup type)
-- ============================================================
INSERT INTO `followup_statuses` (`name`, `color`, `description`, `is_active`, `sort_order`, `followup_type_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
-- ft1: Walk-in Follow-up Call
('Connected', '#198754', 'Call connected', 1, 1, 1, 21, 21, NOW(), NOW()),
('Not Reachable', '#dc3545', 'Not reachable', 1, 2, 1, 21, 21, NOW(), NOW()),
('Callback Requested', '#ffc107', 'Callback requested', 1, 3, 1, 21, 21, NOW(), NOW()),
-- ft2: Walk-in Meeting
('Meeting Scheduled', '#0d6efd', 'Meeting scheduled', 1, 1, 2, 21, 21, NOW(), NOW()),
('Meeting Completed', '#198754', 'Meeting completed', 1, 2, 2, 21, 21, NOW(), NOW()),
('Meeting Cancelled', '#dc3545', 'Meeting cancelled', 1, 3, 2, 21, 21, NOW(), NOW()),
-- ft3: Sales Callback
('Connected', '#198754', 'Call connected', 1, 1, 3, 21, 21, NOW(), NOW()),
('Busy', '#ffc107', 'Person busy', 1, 2, 3, 21, 21, NOW(), NOW()),
('Switched Off', '#dc3545', 'Phone off', 1, 3, 3, 21, 21, NOW(), NOW()),
-- ft4: Phone Demo
('Demo Scheduled', '#0d6efd', 'Demo planned', 1, 1, 4, 21, 21, NOW(), NOW()),
('Demo Completed', '#198754', 'Demo done', 1, 2, 4, 21, 21, NOW(), NOW()),
('Demo Cancelled', '#dc3545', 'Demo cancelled', 1, 3, 4, 21, 21, NOW(), NOW()),
-- ft5: Website Lead Email
('Email Sent', '#0d6efd', 'Email sent', 1, 1, 5, 21, 21, NOW(), NOW()),
('Email Replied', '#198754', 'Got reply', 1, 2, 5, 21, 21, NOW(), NOW()),
('No Reply', '#ffc107', 'No reply', 1, 3, 5, 21, 21, NOW(), NOW()),
-- ft6: Online Demo
('Demo Scheduled', '#0d6efd', 'Demo scheduled', 1, 1, 6, 21, 21, NOW(), NOW()),
('Demo Completed', '#198754', 'Demo completed', 1, 2, 6, 21, 21, NOW(), NOW()),
('Interested', '#20c997', 'Customer interested', 1, 3, 6, 21, 21, NOW(), NOW()),
-- ft7: Referral Call
('Connected', '#198754', 'Call connected', 1, 1, 7, 21, 21, NOW(), NOW()),
('Not Reachable', '#dc3545', 'Not reachable', 1, 2, 7, 21, 21, NOW(), NOW()),
('Interested', '#0dcaf0', 'Interested', 1, 3, 7, 21, 21, NOW(), NOW()),
-- ft8: Referral Meeting
('Meeting Scheduled', '#0d6efd', 'Meeting planned', 1, 1, 8, 21, 21, NOW(), NOW()),
('Meeting Completed', '#198754', 'Meeting done', 1, 2, 8, 21, 21, NOW(), NOW()),
('No Show', '#6c757d', 'No show', 1, 3, 8, 21, 21, NOW(), NOW()),
-- ft9: Social Media Reply
('Replied', '#198754', 'Replied', 1, 1, 9, 21, 21, NOW(), NOW()),
('No Response', '#ffc107', 'No response', 1, 2, 9, 21, 21, NOW(), NOW()),
('Interested', '#0dcaf0', 'Interested', 1, 3, 9, 21, 21, NOW(), NOW()),
-- ft10: DM Follow-up
('Message Sent', '#0d6efd', 'DM sent', 1, 1, 10, 21, 21, NOW(), NOW()),
('Seen', '#0dcaf0', 'Message seen', 1, 2, 10, 21, 21, NOW(), NOW()),
('Replied', '#198754', 'Got reply', 1, 3, 10, 21, 21, NOW(), NOW()),
-- ft11: Site Visit
('Visit Scheduled', '#0d6efd', 'Visit planned', 1, 1, 11, 21, 21, NOW(), NOW()),
('Visit Completed', '#198754', 'Visit done', 1, 2, 11, 21, 21, NOW(), NOW()),
('Retailer Not Available', '#ffc107', 'Not available', 1, 3, 11, 21, 21, NOW(), NOW()),
-- ft12: Document Pickup
('Documents Received', '#198754', 'Docs received', 1, 1, 12, 21, 21, NOW(), NOW()),
('Documents Incomplete', '#dc3545', 'Docs incomplete', 1, 2, 12, 21, 21, NOW(), NOW()),
('KYC Verified', '#20c997', 'KYC done', 1, 3, 12, 21, 21, NOW(), NOW()),
-- ft13: Partner Call
('Connected', '#198754', 'Connected', 1, 1, 13, 21, 21, NOW(), NOW()),
('Not Interested', '#6c757d', 'Not interested', 1, 2, 13, 21, 21, NOW(), NOW()),
('Interested', '#0dcaf0', 'Interested', 1, 3, 13, 21, 21, NOW(), NOW()),
-- ft14: Partner Meeting
('Meeting Scheduled', '#0d6efd', 'Scheduled', 1, 1, 14, 21, 21, NOW(), NOW()),
('Meeting Completed', '#198754', 'Completed', 1, 2, 14, 21, 21, NOW(), NOW()),
('Meeting Rescheduled', '#ffc107', 'Rescheduled', 1, 3, 14, 21, 21, NOW(), NOW()),
-- ft15: WhatsApp Follow-up
('Message Sent', '#0d6efd', 'Sent', 1, 1, 15, 21, 21, NOW(), NOW()),
('Replied', '#198754', 'Replied', 1, 2, 15, 21, 21, NOW(), NOW()),
('Not Delivered', '#dc3545', 'Not delivered', 1, 3, 15, 21, 21, NOW(), NOW()),
-- ft16: WhatsApp Call
('Connected', '#198754', 'Connected', 1, 1, 16, 21, 21, NOW(), NOW()),
('Not Reachable', '#dc3545', 'Not reachable', 1, 2, 16, 21, 21, NOW(), NOW()),
('Callback Requested', '#ffc107', 'Callback', 1, 3, 16, 21, 21, NOW(), NOW()),
-- ft17: Event Follow-up Call
('Connected', '#198754', 'Connected', 1, 1, 17, 21, 21, NOW(), NOW()),
('Interested', '#0dcaf0', 'Interested', 1, 2, 17, 21, 21, NOW(), NOW()),
('Not Interested', '#6c757d', 'Not interested', 1, 3, 17, 21, 21, NOW(), NOW()),
-- ft18: Event Demo
('Demo Scheduled', '#0d6efd', 'Scheduled', 1, 1, 18, 21, 21, NOW(), NOW()),
('Demo Completed', '#198754', 'Completed', 1, 2, 18, 21, 21, NOW(), NOW()),
('Demo Cancelled', '#dc3545', 'Cancelled', 1, 3, 18, 21, 21, NOW(), NOW()),
-- ft19: Telecalling Follow-up
('Connected', '#198754', 'Connected', 1, 1, 19, 21, 21, NOW(), NOW()),
('Not Reachable', '#dc3545', 'Not reachable', 1, 2, 19, 21, 21, NOW(), NOW()),
('Interested', '#0dcaf0', 'Interested', 1, 3, 19, 21, 21, NOW(), NOW()),
-- ft20: Document Request
('Documents Pending', '#ffc107', 'Pending', 1, 1, 20, 21, 21, NOW(), NOW()),
('Documents Received', '#198754', 'Received', 1, 2, 20, 21, 21, NOW(), NOW()),
('KYC Rejected', '#dc3545', 'Rejected', 1, 3, 20, 21, 21, NOW(), NOW()),
-- ft21: Helpdesk Call
('Issue Reported', '#0d6efd', 'Reported', 1, 1, 21, 21, 21, NOW(), NOW()),
('Issue Resolved', '#198754', 'Resolved', 1, 2, 21, 21, 21, NOW(), NOW()),
('Escalated', '#dc3545', 'Escalated', 1, 3, 21, 21, 21, NOW(), NOW()),
-- ft22: Ticket Follow-up
('Ticket Updated', '#0d6efd', 'Updated', 1, 1, 22, 21, 21, NOW(), NOW()),
('Ticket Resolved', '#198754', 'Resolved', 1, 2, 22, 21, 21, NOW(), NOW()),
('Awaiting Info', '#ffc107', 'Awaiting info', 1, 3, 22, 21, 21, NOW(), NOW()),
-- ft23: App Issue Call
('Issue Reported', '#0d6efd', 'Reported', 1, 1, 23, 21, 21, NOW(), NOW()),
('Issue Resolved', '#198754', 'Resolved', 1, 2, 23, 21, 21, NOW(), NOW()),
('Not Reachable', '#6c757d', 'Not reachable', 1, 3, 23, 21, 21, NOW(), NOW()),
-- ft24: Remote Fix
('Session Scheduled', '#0d6efd', 'Scheduled', 1, 1, 24, 21, 21, NOW(), NOW()),
('Issue Fixed', '#198754', 'Fixed', 1, 2, 24, 21, 21, NOW(), NOW()),
('Needs On-site', '#dc3545', 'Needs on-site', 1, 3, 24, 21, 21, NOW(), NOW()),
-- ft25: Tech Phone Follow-up
('Connected', '#198754', 'Connected', 1, 1, 25, 21, 21, NOW(), NOW()),
('Issue Resolved', '#20c997', 'Resolved', 1, 2, 25, 21, 21, NOW(), NOW()),
('Escalated', '#dc3545', 'Escalated', 1, 3, 25, 21, 21, NOW(), NOW()),
-- ft26: Escalation Call
('Escalated to L2', '#ffc107', 'L2 escalation', 1, 1, 26, 21, 21, NOW(), NOW()),
('Escalated to L3', '#dc3545', 'L3 escalation', 1, 2, 26, 21, 21, NOW(), NOW()),
('Resolved', '#198754', 'Resolved', 1, 3, 26, 21, 21, NOW(), NOW()),
-- ft27: WhatsApp Support
('Message Sent', '#0d6efd', 'Sent', 1, 1, 27, 21, 21, NOW(), NOW()),
('Replied', '#198754', 'Replied', 1, 2, 27, 21, 21, NOW(), NOW()),
('Issue Resolved', '#20c997', 'Resolved', 1, 3, 27, 21, 21, NOW(), NOW()),
-- ft28: WhatsApp Video Call
('Call Scheduled', '#0d6efd', 'Scheduled', 1, 1, 28, 21, 21, NOW(), NOW()),
('Call Completed', '#198754', 'Completed', 1, 2, 28, 21, 21, NOW(), NOW()),
('Call Failed', '#dc3545', 'Failed', 1, 3, 28, 21, 21, NOW(), NOW()),
-- ft29: Email Support
('Email Sent', '#0d6efd', 'Sent', 1, 1, 29, 21, 21, NOW(), NOW()),
('Reply Received', '#198754', 'Replied', 1, 2, 29, 21, 21, NOW(), NOW()),
('No Response', '#ffc107', 'No response', 1, 3, 29, 21, 21, NOW(), NOW()),
-- ft30: Email Escalation
('Escalation Sent', '#dc3545', 'Sent', 1, 1, 30, 21, 21, NOW(), NOW()),
('Response Received', '#198754', 'Received', 1, 2, 30, 21, 21, NOW(), NOW()),
('Pending', '#ffc107', 'Pending', 1, 3, 30, 21, 21, NOW(), NOW()),
-- ft31: Internal Call
('Connected', '#198754', 'Connected', 1, 1, 31, 21, 21, NOW(), NOW()),
('Issue Noted', '#0d6efd', 'Noted', 1, 2, 31, 21, 21, NOW(), NOW()),
('Resolved', '#20c997', 'Resolved', 1, 3, 31, 21, 21, NOW(), NOW()),
-- ft32: Process Check
('Review Done', '#198754', 'Done', 1, 1, 32, 21, 21, NOW(), NOW()),
('Changes Needed', '#ffc107', 'Changes needed', 1, 2, 32, 21, 21, NOW(), NOW()),
('No Changes', '#6c757d', 'No changes', 1, 3, 32, 21, 21, NOW(), NOW()),
-- ft33: Branch Visit
('Visit Scheduled', '#0d6efd', 'Scheduled', 1, 1, 33, 21, 21, NOW(), NOW()),
('Visit Completed', '#198754', 'Completed', 1, 2, 33, 21, 21, NOW(), NOW()),
('Visit Cancelled', '#dc3545', 'Cancelled', 1, 3, 33, 21, 21, NOW(), NOW()),
-- ft34: Branch Call
('Connected', '#198754', 'Connected', 1, 1, 34, 21, 21, NOW(), NOW()),
('Not Reachable', '#dc3545', 'Not reachable', 1, 2, 34, 21, 21, NOW(), NOW()),
('Issue Resolved', '#20c997', 'Resolved', 1, 3, 34, 21, 21, NOW(), NOW()),
-- ft35: Escalation Call (Ops)
('Escalated', '#dc3545', 'Escalated', 1, 1, 35, 21, 21, NOW(), NOW()),
('Under Review', '#ffc107', 'Under review', 1, 2, 35, 21, 21, NOW(), NOW()),
('Resolved', '#198754', 'Resolved', 1, 3, 35, 21, 21, NOW(), NOW()),
-- ft36: Management Meeting
('Meeting Scheduled', '#0d6efd', 'Scheduled', 1, 1, 36, 21, 21, NOW(), NOW()),
('Meeting Completed', '#198754', 'Completed', 1, 2, 36, 21, 21, NOW(), NOW()),
('Action Items Created', '#ffc107', 'Action items', 1, 3, 36, 21, 21, NOW(), NOW()),
-- ft37: Walk-in Support
('Issue Noted', '#0d6efd', 'Noted', 1, 1, 37, 21, 21, NOW(), NOW()),
('Resolved On-site', '#198754', 'Resolved', 1, 2, 37, 21, 21, NOW(), NOW()),
('Needs Follow-up', '#ffc107', 'Needs follow-up', 1, 3, 37, 21, 21, NOW(), NOW()),
-- ft38: On-site Fix
('Fix Scheduled', '#0d6efd', 'Scheduled', 1, 1, 38, 21, 21, NOW(), NOW()),
('Fix Completed', '#198754', 'Completed', 1, 2, 38, 21, 21, NOW(), NOW()),
('Fix Failed', '#dc3545', 'Failed', 1, 3, 38, 21, 21, NOW(), NOW()),
-- ft39: Ops Phone Follow-up
('Connected', '#198754', 'Connected', 1, 1, 39, 21, 21, NOW(), NOW()),
('Issue Noted', '#0d6efd', 'Noted', 1, 2, 39, 21, 21, NOW(), NOW()),
('Resolved on Call', '#20c997', 'Resolved', 1, 3, 39, 21, 21, NOW(), NOW()),
-- ft40: Follow-up Call
('Connected', '#198754', 'Connected', 1, 1, 40, 21, 21, NOW(), NOW()),
('Not Reachable', '#dc3545', 'Not reachable', 1, 2, 40, 21, 21, NOW(), NOW()),
('Completed', '#20c997', 'Completed', 1, 3, 40, 21, 21, NOW(), NOW());


-- ============================================================
-- STEP 7: INSERT LEAD STATUSES (3 per followup type, assigned positions 1, 2, 3)
-- Position 3 is the terminal state (Follow-up button will hide)
-- ============================================================
INSERT INTO `lead_status` (`name`, `color`, `position`, `followup_type_id`, `admin_id`, `created_by`, `created_at`, `updated_at`) VALUES
-- ft1-2: Walk-in
('New Lead', '#0d6efd', 1, 1, 21, 21, NOW(), NOW()),
('Interested', '#198754', 2, 1, 21, 21, NOW(), NOW()),
('Not Interested', '#dc3545', 3, 1, 21, 21, NOW(), NOW()),
('Meeting Pending', '#0d6efd', 1, 2, 21, 21, NOW(), NOW()),
('Deal Won', '#198754', 3, 2, 21, 21, NOW(), NOW()),
('Deal Lost', '#dc3545', 3, 2, 21, 21, NOW(), NOW()),
-- ft3-4: Phone Call
('New Lead', '#0d6efd', 1, 3, 21, 21, NOW(), NOW()),
('Follow Up Later', '#ffc107', 2, 3, 21, 21, NOW(), NOW()),
('Converted', '#20c997', 3, 3, 21, 21, NOW(), NOW()),
('Demo Pending', '#0d6efd', 1, 4, 21, 21, NOW(), NOW()),
('Evaluating', '#ffc107', 2, 4, 21, 21, NOW(), NOW()),
('Ready to Purchase', '#198754', 3, 4, 21, 21, NOW(), NOW()),
-- ft5-6: Website
('Contacted', '#0d6efd', 1, 5, 21, 21, NOW(), NOW()),
('Engaged', '#198754', 2, 5, 21, 21, NOW(), NOW()),
('Cold Lead', '#6c757d', 3, 5, 21, 21, NOW(), NOW()),
('Demo Pending', '#0d6efd', 1, 6, 21, 21, NOW(), NOW()),
('Interested', '#198754', 2, 6, 21, 21, NOW(), NOW()),
('Not Interested', '#dc3545', 3, 6, 21, 21, NOW(), NOW()),
-- ft7-8: Referral
('New Referral', '#0d6efd', 1, 7, 21, 21, NOW(), NOW()),
('Interested', '#198754', 2, 7, 21, 21, NOW(), NOW()),
('Converted', '#20c997', 3, 7, 21, 21, NOW(), NOW()),
('Negotiation', '#ffc107', 1, 8, 21, 21, NOW(), NOW()),
('Proposal Sent', '#6f42c1', 2, 8, 21, 21, NOW(), NOW()),
('Deal Won', '#198754', 3, 8, 21, 21, NOW(), NOW()),
-- ft9-10: Social Media
('New Lead', '#0d6efd', 1, 9, 21, 21, NOW(), NOW()),
('Engaged', '#198754', 2, 9, 21, 21, NOW(), NOW()),
('Cold Lead', '#6c757d', 3, 9, 21, 21, NOW(), NOW()),
('Contacted', '#0d6efd', 1, 10, 21, 21, NOW(), NOW()),
('Interested', '#198754', 2, 10, 21, 21, NOW(), NOW()),
('Not Interested', '#dc3545', 3, 10, 21, 21, NOW(), NOW()),
-- ft11-12: Field Visit
('New Retailer', '#0d6efd', 1, 11, 21, 21, NOW(), NOW()),
('Onboarding Started', '#ffc107', 2, 11, 21, 21, NOW(), NOW()),
('Onboarded', '#198754', 3, 11, 21, 21, NOW(), NOW()),
('Documents Awaited', '#ffc107', 1, 12, 21, 21, NOW(), NOW()),
('Verified', '#198754', 2, 12, 21, 21, NOW(), NOW()),
('Rejected', '#dc3545', 3, 12, 21, 21, NOW(), NOW()),
-- ft13-14: Partner Referral
('New Retailer', '#0d6efd', 1, 13, 21, 21, NOW(), NOW()),
('Interested', '#198754', 2, 13, 21, 21, NOW(), NOW()),
('Not Interested', '#dc3545', 3, 13, 21, 21, NOW(), NOW()),
('Meeting Pending', '#0d6efd', 1, 14, 21, 21, NOW(), NOW()),
('Onboarding Started', '#ffc107', 2, 14, 21, 21, NOW(), NOW()),
('Onboarded', '#198754', 3, 14, 21, 21, NOW(), NOW()),
-- ft15-16: WhatsApp Campaign
('New Lead', '#0d6efd', 1, 15, 21, 21, NOW(), NOW()),
('Interested', '#198754', 2, 15, 21, 21, NOW(), NOW()),
('Not Interested', '#dc3545', 3, 15, 21, 21, NOW(), NOW()),
('New Retailer', '#0d6efd', 1, 16, 21, 21, NOW(), NOW()),
('Pending Decision', '#ffc107', 2, 16, 21, 21, NOW(), NOW()),
('Onboarded', '#198754', 3, 16, 21, 21, NOW(), NOW()),
-- ft17-18: Exhibition/Event
('New Lead', '#0d6efd', 1, 17, 21, 21, NOW(), NOW()),
('Interested', '#198754', 2, 17, 21, 21, NOW(), NOW()),
('Follow Up Later', '#ffc107', 3, 17, 21, 21, NOW(), NOW()),
('Demo Pending', '#0d6efd', 1, 18, 21, 21, NOW(), NOW()),
('Onboarding Started', '#ffc107', 2, 18, 21, 21, NOW(), NOW()),
('Onboarded', '#198754', 3, 18, 21, 21, NOW(), NOW()),
-- ft19-20: Telecalling
('New Lead', '#0d6efd', 1, 19, 21, 21, NOW(), NOW()),
('Interested', '#198754', 2, 19, 21, 21, NOW(), NOW()),
('Not Interested', '#dc3545', 3, 19, 21, 21, NOW(), NOW()),
('Documents Awaited', '#ffc107', 1, 20, 21, 21, NOW(), NOW()),
('Under Verification', '#0dcaf0', 2, 20, 21, 21, NOW(), NOW()),
('Verified', '#198754', 3, 20, 21, 21, NOW(), NOW()),
-- ft21-22: Helpdesk
('Issue Open', '#dc3545', 1, 21, 21, 21, NOW(), NOW()),
('In Progress', '#ffc107', 2, 21, 21, 21, NOW(), NOW()),
('Resolved', '#198754', 3, 21, 21, 21, NOW(), NOW()),
('Ticket Open', '#dc3545', 1, 22, 21, 21, NOW(), NOW()),
('Awaiting Customer', '#ffc107', 2, 22, 21, 21, NOW(), NOW()),
('Closed', '#6c757d', 3, 22, 21, 21, NOW(), NOW()),
-- ft23-24: App/Portal
('Issue Open', '#dc3545', 1, 23, 21, 21, NOW(), NOW()),
('In Progress', '#ffc107', 2, 23, 21, 21, NOW(), NOW()),
('Resolved', '#198754', 3, 23, 21, 21, NOW(), NOW()),
('Awaiting Session', '#0d6efd', 1, 24, 21, 21, NOW(), NOW()),
('Fix Applied', '#198754', 2, 24, 21, 21, NOW(), NOW()),
('Monitoring', '#ffc107', 3, 24, 21, 21, NOW(), NOW()),
-- ft25-26: Tech Phone Call
('Issue Open', '#dc3545', 1, 25, 21, 21, NOW(), NOW()),
('Resolved', '#198754', 3, 25, 21, 21, NOW(), NOW()),
('Escalated', '#e35d6a', 3, 25, 21, 21, NOW(), NOW()),
('L2 Review', '#ffc107', 1, 26, 21, 21, NOW(), NOW()),
('L3 Review', '#dc3545', 2, 26, 21, 21, NOW(), NOW()),
('Resolved', '#198754', 3, 26, 21, 21, NOW(), NOW()),
-- ft27-28: WhatsApp Tech
('Chat Open', '#0d6efd', 1, 27, 21, 21, NOW(), NOW()),
('Issue Resolved', '#198754', 3, 27, 21, 21, NOW(), NOW()),
('Pending Reply', '#ffc107', 2, 27, 21, 21, NOW(), NOW()),
('Call Pending', '#0d6efd', 1, 28, 21, 21, NOW(), NOW()),
('Issue Resolved', '#198754', 3, 28, 21, 21, NOW(), NOW()),
('Needs Visit', '#dc3545', 3, 28, 21, 21, NOW(), NOW()),
-- ft29-30: Email Tech
('Email Pending', '#0d6efd', 1, 29, 21, 21, NOW(), NOW()),
('Solution Provided', '#198754', 2, 29, 21, 21, NOW(), NOW()),
('Awaiting Feedback', '#ffc107', 3, 29, 21, 21, NOW(), NOW()),
('Escalation Pending', '#dc3545', 1, 30, 21, 21, NOW(), NOW()),
('Resolved', '#198754', 3, 30, 21, 21, NOW(), NOW()),
('Closed', '#6c757d', 3, 30, 21, 21, NOW(), NOW()),
-- ft31-32: Internal Transfer
('Issue Reported', '#dc3545', 1, 31, 21, 21, NOW(), NOW()),
('Under Investigation', '#ffc107', 2, 31, 21, 21, NOW(), NOW()),
('Resolved', '#198754', 3, 31, 21, 21, NOW(), NOW()),
('Review Pending', '#0d6efd', 1, 32, 21, 21, NOW(), NOW()),
('Changes Applied', '#198754', 2, 32, 21, 21, NOW(), NOW()),
('No Action Required', '#6c757d', 3, 32, 21, 21, NOW(), NOW()),
-- ft33-34: Branch Request
('Visit Pending', '#0d6efd', 1, 33, 21, 21, NOW(), NOW()),
('Completed', '#198754', 3, 33, 21, 21, NOW(), NOW()),
('Follow-up Needed', '#ffc107', 2, 33, 21, 21, NOW(), NOW()),
('Issue Reported', '#dc3545', 1, 34, 21, 21, NOW(), NOW()),
('Resolved', '#198754', 3, 34, 21, 21, NOW(), NOW()),
('Escalated', '#e35d6a', 3, 34, 21, 21, NOW(), NOW()),
-- ft35-36: Escalation
('Under Review', '#ffc107', 1, 35, 21, 21, NOW(), NOW()),
('Resolved', '#198754', 3, 35, 21, 21, NOW(), NOW()),
('Escalated Further', '#dc3545', 3, 35, 21, 21, NOW(), NOW()),
('Discussion Pending', '#0d6efd', 1, 36, 21, 21, NOW(), NOW()),
('Action Items Created', '#ffc107', 2, 36, 21, 21, NOW(), NOW()),
('Completed', '#198754', 3, 36, 21, 21, NOW(), NOW()),
-- ft37-38: Walk-in Ops
('Issue Noted', '#0d6efd', 1, 37, 21, 21, NOW(), NOW()),
('Resolved On-site', '#198754', 3, 37, 21, 21, NOW(), NOW()),
('Needs Escalation', '#dc3545', 3, 37, 21, 21, NOW(), NOW()),
('Fix Pending', '#0d6efd', 1, 38, 21, 21, NOW(), NOW()),
('Fix Applied', '#198754', 3, 38, 21, 21, NOW(), NOW()),
('Fix Failed', '#dc3545', 3, 38, 21, 21, NOW(), NOW()),
-- ft39-40: Phone Call Ops
('Issue Reported', '#dc3545', 1, 39, 21, 21, NOW(), NOW()),
('Resolved', '#198754', 3, 39, 21, 21, NOW(), NOW()),
('Follow-up Needed', '#ffc107', 2, 39, 21, 21, NOW(), NOW()),
('Connected', '#198754', 1, 40, 21, 21, NOW(), NOW()),
('Completed', '#20c997', 3, 40, 21, 21, NOW(), NOW()),
('Needs Follow-up', '#ffc107', 2, 40, 21, 21, NOW(), NOW());


-- ============================================================
-- DONE! Cascade: Lead Type → Lead Source → Follow-up Type → Status
-- 4 Lead Types, 20 Lead Sources, 40 Follow-up Types
-- 120 Follow-up Statuses, 120 Lead Statuses with Position (1-3)
-- ============================================================
