ALTER TABLE `income_tax_applications` 
CHANGE `aadhar_file` `aadhar_front_file` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL;

ALTER TABLE `income_tax_applications` 
ADD COLUMN `aadhar_back_file` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL AFTER `aadhar_front_file`;
