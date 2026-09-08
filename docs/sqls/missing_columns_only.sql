-- =====================================================
-- Missing Columns for Loan Commission Report
-- =====================================================

-- Missing columns in loan_leads table:
-- =====================================================
ALTER TABLE `loan_leads` 
ADD COLUMN `commission_set_at` TIMESTAMP NULL DEFAULT NULL AFTER `commission_released_by`,
ADD COLUMN `commission_set_by` BIGINT(20) UNSIGNED DEFAULT NULL AFTER `commission_set_at`;

-- Note: All other required columns already exist in your loan_leads table:
-- ✅ commission_amount (already exists)
-- ✅ commission_status (already exists) 
-- ✅ commission_released_at (already exists)
-- ✅ commission_released_by (already exists)

-- Missing columns in loan_lead_history table:
-- =====================================================
-- All required columns already exist in your loan_lead_history table:
-- ✅ lead_id (already exists)
-- ✅ old_status (already exists)
-- ✅ new_status (already exists)
-- ✅ changed_by (already exists)
-- ✅ changed_by_role (already exists - VARCHAR format is fine)
-- ✅ remarks (already exists)
-- ✅ created_at (already exists)

-- No additional columns needed for loan_lead_history table

-- =====================================================
-- Summary:
-- =====================================================
-- loan_leads: Need 2 columns (commission_set_at, commission_set_by)
-- loan_lead_history: No missing columns
-- users: No changes needed (already exists)
-- =====================================================