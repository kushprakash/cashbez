-- SQL Import Script for uti_psa_agents generated from ACTIVE PAN CARD USER - PAN UPDATEDuuuuuuuu.xlsx

-- Matches pan_no with aeps_drafts.pan_no -> mid & admin_id -> users.mid -> user_id

-- Generated At: 2026-09-01 13:11:59



INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNECHM-815', 'DIPAK SARKAR', 'DIPAK SARKAR', 'DIPAKSARKAR250@GMAIL.COM', '8918670375', '735101', 'JALPAIGURI, WEST BENGAL, null, null, JAPAIGURI AND ALIPURDUAR, WEST BENGAL, 735101', 'WEST BENGAL', 'JAPAIGURI AND ALIPURDUAR', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'MVCPS4379F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'MVCPS4379F' LIMIT 1) AS admin_id, 'ANNECHM-816', 'PAPPU BACHAAR', 'PAPPU BACHHAR', 'SANAANIMA656@GMAIL.COM', '9690048520', '743235', 'BONGAON, RAMCHANDRAPUR, null, null, 24 PGS NORTH, WEST BENGAL, 743235', 'WEST BENGAL', '24 PGS NORTH', 'MVCPS4379F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BCXPB3625G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BCXPB3625G' LIMIT 1) AS admin_id, 'ANNECHM-ANNECHM-778', 'KANAILAL BISWAS', 'KANAILAL BISWAS', 'KANAILALBISWAS1989@GMAIL.COM', '8017979267', '743251', 'PAR KRISNACHANDRAPUR, KRISHNACHANDRAPUR, , , NORTH 24 PARGANAS, WEST BENGAL, 743251', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'BCXPB3625G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNECHM-814', 'SUBRATA GANGULY', 'SUBRATA GANGULY', 'SUBRATAGANGULY.VNP@GMAIL.COM', '9749025790', '735101', 'JALPAIGURI, JALPAIGURI, null, null, JAPAIGURI AND ALIPURDUAR, WEST BENGAL, 735101', 'WEST BENGAL', 'JAPAIGURI AND ALIPURDUAR', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNECHM-813', 'JANAKI ROY', 'JANAKI ROY', 'RDALLINONE97@GMAIL.COM', '9144110043', '735101', 'JAIPAIGURI, JAIPAIGURI, null, null, JAPAIGURI AND ALIPURDUAR, WEST BENGAL, 735101', 'WEST BENGAL', 'JAPAIGURI AND ALIPURDUAR', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNECHM-811', 'ANUPAM ROY', 'ANUPAM ROY', 'ROYDIGITALSEVAKENDRA@GMAIL.COM', '9382055308', '735101', 'JALPAIGURI, JALPAGURI, , , JALPAIGURI/DARJEELING, WEST BENGAL, 735101', 'WEST BENGAL', 'JALPAIGURI/DARJEELING', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EYJPS8685G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EYJPS8685G' LIMIT 1) AS admin_id, 'ANNECHM-810', 'TARA MAA ENTERPRISE', 'MANORANJAN SAMANTA', 'SAMANTAMONTU72@GMAIL.COM', '8001904347', '721211', 'CHAKPURUSOTTAM, CHAKPURUSOTTAM, , , WEST MEDINIPUR, WEST BENGAL, 721211', 'WEST BENGAL', 'WEST MEDINIPUR', 'EYJPS8685G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BLGMP5913G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BLGMP5913G' LIMIT 1) AS admin_id, 'ANNECHM-779', 'FIROJ MOLLA', 'FIROJ MOLLA', 'BLGMP5913G@GMAIL.COM', '9152658994', NULL, NULL, NULL, NULL, 'BLGMP5913G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AQXPC8765B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AQXPC8765B' LIMIT 1) AS admin_id, 'ANNECHM-ANNECHM-788', 'RUDRA CHAKRABORTY', 'RUDRA CHAKRABORTY', 'CHAKRABORTYELECTRONIC@GMAIL.COM', '9735363688', '721146', 'UTTARGOBINDANAGAR , GHATAL, null, null, PACHIM MEDIINIPUR, WEST BENGAL, 721146', 'WEST BENGAL', 'PACHIM MEDIINIPUR', 'AQXPC8765B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-809', 'A2Z CLICK SOLUTIONS', 'WAHAJUL HAQUE', 'SAMEYPE@GMAIL.COM', '8240039776', '712125', '4/1 VICTORIA LANE, TELINIPARA, BHADRESWAR M, HOOGHLY, HOOGHLY, WEST BENGAL, 712125', 'WEST BENGAL', 'HOOGHLY', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GNKPM7881J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GNKPM7881J' LIMIT 1) AS admin_id, 'ANNECHM-803', 'SHOWKAT MONDAL', 'SHOWKAT MONDAL', 'SHOWKATMONDAL180@GMAIL.COM', '9064741685', '741257', 'KARAMCHABELIA, KATHDANGA, null, null, NADIA, WEST BENGAL, 741257', 'WEST BENGAL', 'NADIA', 'GNKPM7881J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'LSSPS3049G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'LSSPS3049G' LIMIT 1) AS admin_id, 'ANNECHM-790', 'SUMAN SARDAR', 'SUMAN SARDAR', 'SUMANSARDAR747768@GMAIL.COM', '9732885839', '743286', 'PURBA POLTA, SWARUPNAGAR, , , 24 PGS NORTH, WEST BENGAL, 743286', 'WEST BENGAL', '24 PGS NORTH', 'LSSPS3049G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-800', 'VINAY KUMAR', 'VINAY KUMAR', 'CAREPAYBHARAT@GMAIL.COM', '9910250428', '843128', 'SAGHARI, MUZAFFARPUR, , , MUZAFFARPUR, BIHAR, 843128', 'BIHAR', 'MUZAFFARPUR', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ABDPF2560L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ABDPF2560L' LIMIT 1) AS admin_id, 'ANNECHM-795', 'UMAR FARUQUE', 'UMAR FARUQUE', 'UMAR2ITAHAR@GMAIL.COM', '9735077154', '733128', 'KAPASIA, ITAHAR, , , UTTAR DINAJAPUR, WEST BENGAL, 733128', 'WEST BENGAL', 'UTTAR DINAJAPUR', 'ABDPF2560L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DYLPB4618H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DYLPB4618H' LIMIT 1) AS admin_id, 'ANNECHM-799', 'SOUMYADEEP BAIRAGI', 'SOUMYADEEP BAIRAGI', 'SOUMYADEEPBAIRAGI36@GMAIL.COM', '9734524674', '741257', 'KASTADANGA, KASTHADANGA, , , NADIA, WEST BENGAL, 741257', 'WEST BENGAL', 'NADIA', 'DYLPB4618H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CRLPG6722R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CRLPG6722R' LIMIT 1) AS admin_id, 'ANNECHM-798', 'ANNECHM-798', 'SUDIP GHOSH', 'GHOSHSUDIP060@GMAIL.COM', '7029161408', '743245', 'TENTULBARIA, NORTH 24 PARGANAS, , , 24 PGS NORTH, WEST BENGAL, 743245', 'WEST BENGAL', '24 PGS NORTH', 'CRLPG6722R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-SKABED', 'SK ABED', 'SK ABED', 'YMATOURANDTRAVELS@GMAIL.COM', '9735381929', '721440', 'JANKAR ROAD, PURBA MADINAPUR, null, null, PURBA MEDINIPUR, WEST BENGAL, 721440', 'WEST BENGAL', 'PURBA MEDINIPUR', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'HBUPD3052B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'HBUPD3052B' LIMIT 1) AS admin_id, 'ANNECHM-797', 'ATISH DUTTA', 'ATISH DUTTA', 'ATISHDUTTA7@GMAIL.COM', '9302067248', '741257', 'MADHPUR, MOLLABALIA, NADIA, WEST BENGAL, 741257, , , NADIA, WEST BENGAL, 741257', 'WEST BENGAL', 'NADIA', 'HBUPD3052B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AXUPB6590K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AXUPB6590K' LIMIT 1) AS admin_id, 'ANNECHM-796', 'BISWAS ONLINE DOT COM', 'DIPANKAR BISWAS', 'BISWASONLINE.COM@GMAIL.COM', '9775673182', '741257', 'KASTADANGA, KASHTADANGA, HARINGHATA, NADIA, NADIA, WEST BENGAL, 741257', 'WEST BENGAL', 'NADIA', 'AXUPB6590K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DZHPG8676M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DZHPG8676M' LIMIT 1) AS admin_id, 'ANNECHM-794', 'ANKITA ONLINE', 'ANUP GAYEN', 'ANUPGAYEN1998@GMAIL.COM', '7407072352', '721467', 'DURIA,NARAYANGARH, NARAYANGARH, , , PACHIM MEDIINIPUR, WEST BENGAL, 721467', 'WEST BENGAL', 'PACHIM MEDIINIPUR', 'DZHPG8676M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GTUPM8343H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GTUPM8343H' LIMIT 1) AS admin_id, 'ANNECHM-793', 'NAKUL MONDAL', 'NAKUL MONDAL', 'NAKULMONDAL134@GMAIL.COM', '9800378905', '743235', 'ASHANNAGAR, PO-KALUPUR,, -NORTH 24 PARGANAS, PIN 743235, PS:- BONGAON, 24 PGS NORTH, WEST BENGAL, 743235', 'WEST BENGAL', '24 PGS NORTH', 'GTUPM8343H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'HFHPR4576D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'HFHPR4576D' LIMIT 1) AS admin_id, 'ANNECHM-792', 'JOY ROY', 'JOY ROY', 'JOYR85963@GMAIL.COM', '9635791239', '743245', 'BALLAVPUR ,BONGAON , BONGAON ,NORTH 24 PARGANAS, BALLAVPUR ,BONGAON , BONGAON ,NORTH 24 PARGANAS, 24 PGS NORTH, WEST BENGAL, 743245', 'WEST BENGAL', '24 PGS NORTH', 'HFHPR4576D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-669', 'VIPINDAS P.V', 'VIPIN DAS . P.V', 'onlinepsa89@gmail.com', '7029137198', '673528', 'PUTHANPURAVALAPPIL(H, PILLAPPERUVANNA, null, null, KOZHIKODE, KERALA, 673528', 'KERALA', 'KOZHIKODE', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ARUPN6441K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ARUPN6441K' LIMIT 1) AS admin_id, 'ANNECHM-668', 'THULASEEDHARAN', 'THULASEEDHARAN', 'MFTJS2019@GMAIL.COM', '8086144212', '695002', 'THIRUVANANTHAPURAM, THIRUVANANTHAPURAM, , , THIRUVANANTHAPURAM, KERALA, 695002', 'KERALA', 'THIRUVANANTHAPURAM', 'ARUPN6441K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FCYPR1713Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FCYPR1713Q' LIMIT 1) AS admin_id, 'ANNECHM-667', 'MAA ONLINE SERVICE CENTRE', 'MOFIZUR RAHMAN', 'MOFIZURR042@GMAIL.COM', '8473862482', '781127', 'KAMRUP, VILL- NO 1 DAKSHIN RANGAPANI, , , NORTH 24 PARGANAS, WEST BENGAL, 781127', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'FCYPR1713Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-666', 'THULASEEDHARAN NAIR K', 'THULASEEDHARAN NAIR', 'onlinepsa89@gmail.com', '7029137198', '695002', 'THIRUVANTHAPURAM, THIRUVANTHAPURAM, null, null, THIRUVANANTHAPURAM, KERALA, 695002', 'KERALA', 'THIRUVANANTHAPURAM', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-665', 'SAJI', 'SAJI', 'NC4SERVICE@GMAIL.COM', '9961296294', '670631', 'KANNUR, KANNUR, KANNUR, KANNUR, KANNUR, KERALA, 670631', 'KERALA', 'KANNUR', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CSNPM1750N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CSNPM1750N' LIMIT 1) AS admin_id, 'ANNECHM-664', 'SAFIULLAH MANDAL', 'SAFIULLAH MANDAL', 'SAFIMANDAL590@GMAIL.COM', '7477873735', '743251', 'AMBIKAPUR, MAMUDPUR , MAMUDPUR AMBIKAPUR,, MAMUDPUR, , MALAPPURAM, KERALA, 743251', 'KERALA', 'MALAPPURAM', 'CSNPM1750N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CSLPM8425L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CSLPM8425L' LIMIT 1) AS admin_id, 'ANNECHM-663', 'BABLU MANDAL', 'BABLU MANDAL', 'BMONDAL973449@GMAIL.COM', '9734490072', '743235', 'GANRAPOTA, KALAMPUR, , , ALWAR, RAJASTHAN, 743235', 'RAJASTHAN', 'ALWAR', 'CSLPM8425L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DPWPB3235Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DPWPB3235Q' LIMIT 1) AS admin_id, 'ANNECHM-662', 'JOYANTA DIGITAL SERVICE CENTER', 'JOYANTA', 'onlinepsa89@gmail.com', '8317829625', '741249', 'MADHPUR, MOLLABELIA, MADHPUR, MOLLABELIA, , , WAYANAD, KERALA, 741249', 'KERALA', 'WAYANAD', 'DPWPB3235Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DUWPM4980C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DUWPM4980C' LIMIT 1) AS admin_id, 'ANNECHM-661', 'MINIMOL M', 'MINIMOL M', 'mini4maxwell@gmail.com', '9567496528', '695026', 'TRIVANDRUM, TRIVANDRUM, , , THIRUVANANTHAPURAM, KERALA, 695026', 'KERALA', 'THIRUVANANTHAPURAM', 'DUWPM4980C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AYOPH3624H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AYOPH3624H' LIMIT 1) AS admin_id, 'ANNECHM-660', 'HANEEFA', 'HANEEFA K P', 'KP_HANEEFA@YAHOO.COM', '7559053323', '671531', 'MAFAZ,, POST KOLAVAYAL, KASARGOD, , KASARGOD, KERALA, 671531', 'KERALA', 'KASARGOD', 'AYOPH3624H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CEFPT7882G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CEFPT7882G' LIMIT 1) AS admin_id, 'ANNECHM-659', 'GOUTAM TALUKDAR', 'GOUTAM TALUKDAR', 'GOUTAMTALUKDER7432@GMAIL.COM', '8016778877', '743251', 'GAZIPUR, GAZIPUR, , , ERNAKULAM, KERALA, 743251', 'KERALA', 'ERNAKULAM', 'CEFPT7882G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ITRPK4818J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ITRPK4818J' LIMIT 1) AS admin_id, 'ANNECHM-658', 'MANATOSH KAR', '8609119015', 'KARMANATOSH624@GMAIL.COM', '8609119015', '741238', 'PANDAPARA,DEBAGRAM, GANGNAPUR,NADIA, , , NADIA, WEST BENGAL, 741238', 'WEST BENGAL', 'NADIA', 'ITRPK4818J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AIWPH2748G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AIWPH2748G' LIMIT 1) AS admin_id, 'ANNECHM-570', 'HALDER ONLINE', 'TUSHAR HALDER', 'HALDERTUSHAR617@GMAIL.COM', '8345042632', '743235', 'ANGRALI, NORTH 24 PARGANAS, WEST BENGAL, ANGRALI, NORTH 24 PARGANAS, WEST BENGAL, 743235', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'AIWPH2748G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CLRPJ8141D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CLRPJ8141D' LIMIT 1) AS admin_id, 'ANNECHM-657', 'MA LAXMI ENTERPRICE', 'BAISAKHI JANA', 'CHANDROKANTAP@GMAIL.COM', '8240914468', '743349', 'JAGANNATH CHAK, MADHUSUDAN CHAK, JAGANNATH CHAK, , SOUTH ,24 PARGANAS, WEST BENGAL, 743349', 'WEST BENGAL', 'SOUTH ,24 PARGANAS', 'CLRPJ8141D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DRIPA3683K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DRIPA3683K' LIMIT 1) AS admin_id, 'ANNECHM-656', 'MUHAMMAD ASHRAF', 'MUHAMMAD ASHRAF', 'rahiyanasharaf@gmail.com', '8714228591', '690524', 'KOLLAM, KOLLAM, KALEELILTHARA, PADINJATTAKARA P O, KOLLAM, KERALA, 690524', 'KERALA', 'KOLLAM', 'DRIPA3683K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ITRPK4818J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ITRPK4818J' LIMIT 1) AS admin_id, 'ANNECHM-655', 'MANATOSH KAR', 'MANATOSH KAR', 'KARDEBAGRAM@GMAIL.COM', '6297494402', '741238', 'DEBAGRAM , RANAGHAT, DEBAGRAM , RANAGHAT , NADIA, RANAGHAT, NADIA, NADIA, WEST BENGAL, 741238', 'WEST BENGAL', 'NADIA', 'ITRPK4818J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CJCPJ5305E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CJCPJ5305E' LIMIT 1) AS admin_id, 'ANNECHM-654', 'REMYA J', 'REMYA J', 'REMYAJ69@GMAIL.COM', '9747789965', '691312', 'PALLIPADINJATTE GRAH, PALLIPADINJATTE GRAHAM, MANALI, , , KOLLAM, KERALA, 691312', 'KERALA', 'KOLLAM', 'CJCPJ5305E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BLTPP3570P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BLTPP3570P' LIMIT 1) AS admin_id, 'ANNECHM-653', 'SANJU PODDER', 'SANJU PODDER', 'CYBERPOINT815@GMAIL.COM', '8001151239', '743251', 'VILL PURBA MALIPOTA, PO JAGADISHPUR, PS BAGDAH, , PATHANAMTHITTA, KERALA, 743251', 'KERALA', 'PATHANAMTHITTA', 'BLTPP3570P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-652', 'SHAHEENA', 'SHAHEENA', 'onlinepsa890@gmail.com', '7029137199', '680554', 'AMBALATH VEETTIL HOU, AMBALATH VEETTIL HOUSE, IRINGAPURAM, IRINGAPURAM, THRISSUR, KERALA, 680554', 'KERALA', 'THRISSUR', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-651', 'HELYY', 'TESTING', 'onlinepsa8911@gmail.com', '7029137298', '124456', 'TESTING, TESTING, null, null, AMRELI, GUJARAT, 124456', 'GUJARAT', 'AMRELI', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ACBPU8633N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ACBPU8633N' LIMIT 1) AS admin_id, 'ANNECHM-650', 'UMMER P', 'UMMER P', 'UMERSAALI.777@GMAIL.COM', '9947522477', '670612', 'KANNUR,PADUVILAYI, KANNUR,PADUVILAYI, , , KANNUR, KERALA, 670612', 'KERALA', 'KANNUR', 'ACBPU8633N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AVHPH1819G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AVHPH1819G' LIMIT 1) AS admin_id, 'ANNECHM-649', 'RAJJAK HUSSAIN', 'RAJJAK INTERNET CAFE', 'RAJJAKHKHAN0807@GMAIL.COM', '9123602431', '733202', 'VILL-RADHARGACHH, PO-BURIJAGIR, PS-ISLAMPUR, , UTTAR DINAJPUR, WEST BENGAL, 733202', 'WEST BENGAL', 'UTTAR DINAJPUR', 'AVHPH1819G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-648', 'UMMER PALORA', 'UMMER PALORA', 'UMERSAALI.777@GMAIL.COM', '9947522477', '670612', 'VALIYADAROTH HOUSE, ANJARAKKANDY, null, null, KANNUR, KERALA, 670612', 'KERALA', 'KANNUR', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-647', 'TESTING', '4010000000', 'TESING@GMAIL.COM', '4010000000', '124456', 'TESTING, TESTING, null, null, AMRELI, GUJARAT, 124456', 'GUJARAT', 'AMRELI', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-646', 'HELYY', 'TESTING', 'TESING@GMAIL.COM', '4010000000', '124456', 'TESTING, TESTING, null, null, AMRELI, GUJARAT, 124456', 'GUJARAT', 'AMRELI', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-639', 'HELYY', 'TESTING', 'bharatpays27@gmail.com', '7908494885', '124456', 'TESTING, TESTING, null, null, AMRELI, GUJARAT, 124456', 'GUJARAT', 'AMRELI', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-637', 'HELYY', 'TESTING', 'TESING@GMAIL.COM', '4016000000', '124456', 'TESTING, TESTING, null, null, AMRELI, GUJARAT, 124456', 'GUJARAT', 'AMRELI', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-636', 'HELYY', 'TESTING', 'TESING@GMAIL.COM', '4016000000', '124456', 'TESTING, TESTING, null, null, AMRELI, GUJARAT, 124456', 'GUJARAT', 'AMRELI', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-635', 'HELYY', 'TESTING', 'Karmonkaj@gmail.com', '9231514878', '124456', 'TESTING, TESTING, null, null, AMRELI, GUJARAT, 124456', 'GUJARAT', 'AMRELI', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-634', 'HELYY', 'TESTING', 'TESING@GMAIL.COM', '4016000000', '124456', 'TESTING, TESTING, null, null, AMRELI, GUJARAT, 124456', 'GUJARAT', 'AMRELI', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'JFNPS1007E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'JFNPS1007E' LIMIT 1) AS admin_id, 'ANNECHM-633', 'HELYY', 'TESTING', 'bharatpays27@gmail.com', '7005284390', '124456', 'TESTING, TESTING, null, null, AMRELI, GUJARAT, 124456', 'GUJARAT', 'AMRELI', 'JFNPS1007E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-632', 'HELYY', 'TESTING', 'TESING@GMAIL.COM', '4016000000', '124456', 'TESTING, TESTING, null, null, AMRELI, GUJARAT, 124456', 'GUJARAT', 'AMRELI', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-631', 'HELYY', 'TESTING', 'TESING@GMAIL.COM', '4016000000', '124456', 'TESTING, TESTING, null, null, AMRELI, GUJARAT, 124456', 'GUJARAT', 'AMRELI', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-630', 'HELYY', 'TESTING', 'TESING@GMAIL.COM', '4016000000', '124456', 'TESTING, TESTING, null, null, AMRELI, GUJARAT, 124456', 'GUJARAT', 'AMRELI', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-629', 'HELYY', 'TESTING', 'TESING@GMAIL.COM', '4016000000', '124456', 'TESTING, TESTING, null, null, AMRELI, GUJARAT, 124456', 'GUJARAT', 'AMRELI', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-628', 'HELYY', 'TESTING', 'TESING@GMAIL.COM', '4016000000', '124456', 'TESTING, TESTING, null, null, AMRELI, GUJARAT, 124456', 'GUJARAT', 'AMRELI', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-627', 'HELYY', 'TESTING', 'TESING@GMAIL.COM', '4016000000', '124456', 'TESTING, TESTING, null, null, AMRELI, GUJARAT, 124456', 'GUJARAT', 'AMRELI', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-626', 'HELYY', 'TESTING', 'TESING@GMAIL.COM', '4016000000', '124456', 'TESTING, TESTING, null, null, AMRELI, GUJARAT, 124456', 'GUJARAT', 'AMRELI', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EOKPB2031A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EOKPB2031A' LIMIT 1) AS admin_id, 'ANNECHM-625', 'HELYY', 'TESTING', 'suman736394@gmail.com', '7477720241', '124456', 'TESTING, TESTING, null, null, AMRELI, GUJARAT, 124456', 'GUJARAT', 'AMRELI', 'EOKPB2031A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-622', 'HELYY', 'TESTING', 'TESTING@GMAIL.COM', '9016100000', '123456', 'TESTING, TESTING, null, null, AMRELI, GUJARAT, 123456', 'GUJARAT', 'AMRELI', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DLOPR1524N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DLOPR1524N' LIMIT 1) AS admin_id, 'ANNECHM-624', 'PATRA DIGITAL CENTRE', 'PRANABESH PATRA', 'RONEYALEX111@GMAIL.COM', '8891742386', '743349', 'MADHUSUDAN CHAK,, -RAIDIGHI,PI, , , ALAPPUZHA, KERALA, 743349', 'KERALA', 'ALAPPUZHA', 'DLOPR1524N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FZRPM1673Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FZRPM1673Q' LIMIT 1) AS admin_id, 'ANNECHM-623', 'AHEDUR RAHAMAN MONDAL', 'AHEDUR RAHAMAN MONDA', 'AHEDURRAHAMAN5@GMAIL.COM', '8001020423', '743235', 'BHASHANPOTA, BHASHANPOTA, GHATBAOR, BONGAON, NORTH 24 PARGANAS, WEST BENGAL, 743235', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'FZRPM1673Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNECHM-622', 'AHEDUR RAHAMAN MONDAL', 'AHEDUR RAHAMAN MONDA', 'Onlinepsa89@gmail.com', '7029137198', '743235', 'BHASANPOTA, BHASANPOTA, null, null, 24 PGS NORTH, WEST BENGAL, 743235', 'WEST BENGAL', '24 PGS NORTH', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-621', 'SOMA SAMANTA BERA', 'SOMA SAMANTA BERA', 'gakir63732@mytaemin.com', '8317829626', '721632', 'MAHAMMADPUR, MAHAMMADPUR, null, null, PURBA MEDINIPUR, WEST BENGAL, 721632', 'WEST BENGAL', 'PURBA MEDINIPUR', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CIUPB4013L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CIUPB4013L' LIMIT 1) AS admin_id, 'ANNECHM-620', 'BRINDABAN BANERJEE', 'BRINDABAN BANERJEE', 'BRINDABANBANERJEE5@GMAIL.COM', '9932558328', '743251', 'BAGANGRAM, BAGANGRAM, PIPLIPARA, PIPLIPARA, NORTH 24 PARGANAS, WEST BENGAL, 743251', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'CIUPB4013L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GTAPD7205M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GTAPD7205M' LIMIT 1) AS admin_id, 'ANNECHM-619', 'MAULIK', '9016105096', 'MAULIKDOBARIYA9999@GMAIL.COM', '9016105096', '365480', 'BHADARDEM ROAD,NEAR , TESTING, null, null, AHMEDABAD, GUJARAT, 365480', 'GUJARAT', 'AHMEDABAD', 'GTAPD7205M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNECHM-619', 'RAJKUMAR GHORAI', 'RAJKUMAR GHORAI', 'GHORAI908@GMAIL.COM', '84361 9248', '721633', 'PURBA MEDINIPUR, PURBA MEDINIPUR, PURBA MEDINIPUR, PURBA MEDINIPUR, PURBA MEDINIPUR, WEST BENGAL, 721633', 'WEST BENGAL', 'PURBA MEDINIPUR', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DOPPG8843P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DOPPG8843P' LIMIT 1) AS admin_id, 'ANNECHM-618', 'SUPRIYA BARMAN', 'SUPRIYA BARMAN', 'PRASENJITBARMAN10000@GMAIL.COM', '9339509484', '721633', 'VILL-SANTRABARH,P.O., VILL-SANTRABARH P.O.-KHAGDA BI, SANTRABARH, SANTRABARH, PURBA MEDINIPUR, WEST BENGAL, 721633', 'WEST BENGAL', 'PURBA MEDINIPUR', 'DOPPG8843P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GCXPK0204H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GCXPK0204H' LIMIT 1) AS admin_id, 'ANNECHM-617', 'AKSHAY KUMAR', 'AKSHAY KUMAR', 'AKSHAYBGP31296@GMAIL.COM', '9534399540', '813105', 'BHAGALPUR, BHAGALPUR, , , PURBA MEDINIPUR, WEST BENGAL, 813105', 'WEST BENGAL', 'PURBA MEDINIPUR', 'GCXPK0204H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BBVPS7494B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BBVPS7494B' LIMIT 1) AS admin_id, 'ANNECHM-616', 'JAYANTA SARKAR', 'JAYANTA SARKAR', 'onlinepsa89@gmail.com', '8317829625', '743235', 'BONGAON, MOTIGONJ, BONGAON, , NORTH 24 PARGANAS, WEST BENGAL, 743235', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'BBVPS7494B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CPAPB3555A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CPAPB3555A' LIMIT 1) AS admin_id, 'ANNECHM-615', 'ANANTA BERA', 'ANANTA BERA', 'ANANTABERA92@GMAIL.COM', '8759357239', '721602', 'DURGACHAK, DURGACHAK BLOCK D 110/1, null, null, PURBA MEDINIPUR, WEST BENGAL, 721602', 'WEST BENGAL', 'PURBA MEDINIPUR', 'CPAPB3555A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EKWPM7299M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EKWPM7299M' LIMIT 1) AS admin_id, 'ANNECHM-614', 'SANDIP MONDAL', 'MONDAL TELECOM', 'SHUBHAJIT2RAY4@GMAIL.COM', '9800012422', '743405', 'RAMCHANDRAPUR, CHHAYGHARIA, , , 24 PGS NORTH, WEST BENGAL, 743405', 'WEST BENGAL', '24 PGS NORTH', 'EKWPM7299M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'NZIPS6012J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'NZIPS6012J' LIMIT 1) AS admin_id, 'ANNECHM-613', 'SHAHEENA', 'SHAMSUDHEEN', 'VTECH.GVR1@GMAIL.COM', '7736399607', '680103', 'AMBALATH VEETTIL, HOUSE, null, null, THRISSUR, KERALA, 680103', 'KERALA', 'THRISSUR', 'NZIPS6012J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DGIPM3301R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DGIPM3301R' LIMIT 1) AS admin_id, 'ANNECHM-612', 'AMRITA MONDAL', 'AMRITA MONDAL', 'MONDALAMIRTO2018@GMAIL.COM', '9091280507', '743251', 'GOBRAPUR, GOBRAPUR, BONGAON, , NORTH 24 PARGANAS, WEST BENGAL, 743251', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'DGIPM3301R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ANTPH4756N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ANTPH4756N' LIMIT 1) AS admin_id, 'ANNECHM-610', 'HARITHA', 'HARIDAS', 'HARITHAHS.HARI@GMAIL.COM', '9048391038', '691001', 'ASHOKA MANDIRAM, ERAVIPURAM, , , KOLLAM, KERALA, 691001', 'KERALA', 'KOLLAM', 'ANTPH4756N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-611', 'RAM PRAKASH', 'RAM PRAKASH', 'ONLINEPSA89@GMAIL.COM', '7029137198', '271607', 'BHITAUDI, BHITAUDI, null, null, BALRAMPUR, UTTAR PRADESH, 271607', 'UTTAR PRADESH', 'BALRAMPUR', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DFCPP9861N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DFCPP9861N' LIMIT 1) AS admin_id, 'ANNECHM-609', 'SAINJEET PANDEY', 'SAINJEET', 'RIGHTSHOP06@GMAIL.COM', '6306588169', '271607', 'BHITAUDI SHRIDUTTGAN, BHITAUDI SHRIDUTTGANJ UTRAULA , null, null, BALRAMPUR, UTTAR PRADESH, 271607', 'UTTAR PRADESH', 'BALRAMPUR', 'DFCPP9861N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GFVPR7727M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GFVPR7727M' LIMIT 1) AS admin_id, 'ANNECHM-608', 'RAKHILNATH R', 'RAKHILNATH R', 'REVATHYCOMPUTERS5@GMAIL.COM', '9037448410', '691504', 'NIKITHA BHAVANAM, PUNUKKANNOOR, , , KOLLAM, KERALA, 691504', 'KERALA', 'KOLLAM', 'GFVPR7727M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'NHRPS4912Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'NHRPS4912Q' LIMIT 1) AS admin_id, 'ANNECHM-607', 'MANATOSH KAR', '6297494402', 'koubrurainson@gmail.com', '7005437388', '741238', 'PANDEPARA,DEBAGRAM, GANGNAPUR,NADIA, null, null, NADIA, WEST BENGAL, 741238', 'WEST BENGAL', 'NADIA', 'NHRPS4912Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'HIBPM8555E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'HIBPM8555E' LIMIT 1) AS admin_id, 'ANNECHM-606', 'JIMMYTODIK D MOMIN', 'SUBRATA BISWAS', 'JIMMYDOKONGSIMOMIN@GMAIL.COM', '6009148152', '794002', 'MEGHALAYA, WEST GARO HILS, TURA, CHAMBILDAM, KOLKATA, WEST BENGAL, 794002', 'WEST BENGAL', 'KOLKATA', 'HIBPM8555E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BYYPP1371C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BYYPP1371C' LIMIT 1) AS admin_id, 'ANNECHM-605', 'MOBILE SERVICE CENTER', '9641132993', 'ANIMESHKUMER998@GMAIL.COM', '9641132993', '741223', 'SUTRA,GOURIPUR,CHAKD, SUTRA,GOURIPUR,CHAKDAHA,NADIA, null, null, NADIA, WEST BENGAL, 741223', 'WEST BENGAL', 'NADIA', 'BYYPP1371C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DTLPP5194K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DTLPP5194K' LIMIT 1) AS admin_id, 'ANNECHM-604', 'PATRA DIGITAL CENTER', 'PRANABESH PATRA', 'PRANABESHPATRA914@GMAIL.COM', '9732979232', '743349', 'MADHUSUDAN CHAK, RAIDIGHI, , , ALAPPUZHA, KERALA, 743349', 'KERALA', 'ALAPPUZHA', 'DTLPP5194K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EOZPM9715R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EOZPM9715R' LIMIT 1) AS admin_id, 'ANNECHM-603', 'MUFSEER M', 'MUFSEER M', 'EMITRACH123@GMAIL.COM', '8891470386', '670613', 'KADEEJA, MANZIL, null, null, KANNUR, KERALA, 670613', 'KERALA', 'KANNUR', 'EOZPM9715R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CWAPN7337R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CWAPN7337R' LIMIT 1) AS admin_id, 'ANNECHM-602', 'DEEPA C NAIR', 'MANOJ', 'AKCOMPUTERCENTER12@GMAIL.COM', '8921405542', '691538', 'CHANDRIKA BHAVAN,, KOKKADU, , , KOLLAM, KERALA, 691538', 'KERALA', 'KOLLAM', 'CWAPN7337R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ATAPA4149F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ATAPA4149F' LIMIT 1) AS admin_id, 'ANNECHM-601', 'ABDUL RAFEEK AMBALATH', 'ABDUL RAFEEK AMBALAT', 'VTECH.GVR@GMAIL.COM', '9847735677', '680103', 'AMBALATH VEETTIL, IRINGAPPURAM P O, null, null, THRISSUR, KERALA, 680103', 'KERALA', 'THRISSUR', 'ATAPA4149F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AMFPR2288G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AMFPR2288G' LIMIT 1) AS admin_id, 'ANNECHM-600', 'SAMIR ROY', 'SAMIR ROY', 'onlinepsa89@gmail.com', '7029137198', '712407', 'BANDIPUR, BANDIPUR, null, null, HOOGHLY, WEST BENGAL, 712407', 'WEST BENGAL', 'HOOGHLY', 'AMFPR2288G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EESPM9619K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EESPM9619K' LIMIT 1) AS admin_id, 'ANNECHM-599', 'BADSHA ALAM MOLLICK', 'BADSHA ALAM MOLLICK', 'BADSHAMOLLICK67965@GMAIL.COM', '7001316802', '722101', 'AGURI BAND PUNISL, BANKURA, PUNISOLE, ONDA, BANKURA, WEST BENGAL, 722101', 'WEST BENGAL', 'BANKURA', 'EESPM9619K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DPKPB1921K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DPKPB1921K' LIMIT 1) AS admin_id, 'ANNECHM-598', 'SUSANTA BISWAS', 'SUSANTA BISWAS', 'SUSANTA63BISWAS@GMAIL.COM', '9064570648', '743251', 'AMDOB, BAGDHA, AMDOB, BAGDHA, NORTH 24 PARGANAS, WEST BENGAL, 743251', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'DPKPB1921K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BZGPT8784E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BZGPT8784E' LIMIT 1) AS admin_id, 'ANNECHM-597', 'RUKSANA T', 'RUKSANA T', 'RUKSANASUDEER17@GMAIL.COM', '9778382123', '695009', 'TC 43/2678, NEELATTINKARA, , , THIRUVANANTHAPURAM, KERALA, 695009', 'KERALA', 'THIRUVANANTHAPURAM', 'BZGPT8784E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FSRPB1346G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FSRPB1346G' LIMIT 1) AS admin_id, 'ANNECHM-596', 'PRABIR BISWAS', '8172038390', 'PRABIRBISWAS3456789@GMAIL.COM', '8172038390', '735304', '119 ANDARAN KUCHLIBA, 119 ANDARAN KUCHLIBARI, 119 ANDARAN KUCHLIBA, 119 ANDARAN KUCHLIBA, COOCH BEHAR, WEST BENGAL, 735304', 'WEST BENGAL', 'COOCH BEHAR', 'FSRPB1346G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ELBPR1759D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ELBPR1759D' LIMIT 1) AS admin_id, 'ANNECHM-595', 'ALEENA', 'RAJEEV', 'ALEENARAJEEV6268@GMAIL.COM', '9961558344', '686534', 'KAVALACKAL HOUSE EAR, NEELAMPEROOR ALAPPUZHA, , , ALAPPUZHA, KERALA, 686534', 'KERALA', 'ALAPPUZHA', 'ELBPR1759D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CUNPM1232K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CUNPM1232K' LIMIT 1) AS admin_id, 'ANNECHM-594', 'JITHA M', 'ANIYAN KUNJU', 'JITHAM958@GMAIL.COM', '9562569989', '690506', 'AJITH BHAVANAM, MUTHUKULAM NORTH, , , ALAPPUZHA, KERALA, 690506', 'KERALA', 'ALAPPUZHA', 'CUNPM1232K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CIKPM7694A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CIKPM7694A' LIMIT 1) AS admin_id, 'ANNECHM-593', 'SADEK ALI MANDAL', '9967941561', 'SADEKALIMANDAL123456@GMAIL.COM', '9967941561', '722101', 'PUNISOLE PUNISOLE AG, PUNISOLE PUNISOLE AGURI BAND P, , , BANKURA, WEST BENGAL, 722101', 'WEST BENGAL', 'BANKURA', 'CIKPM7694A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-592', 'HARAN CHANDA', 'SUNITE SHOE HOUSE', 'suniteshoes@gmail.com', '7908494885', '788724', 'ASSAM, KARIMGANJ, PATHARKANDI, BIATHAKHAL BASTI, KARIMGANJ, ASSAM, 788724', 'ASSAM', 'KARIMGANJ', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ALZPC8667M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ALZPC8667M' LIMIT 1) AS admin_id, 'ANNECHM-591', 'SUPRIYA CHAKRABORTY', 'SUPRIYA CHAKRABORTY', 'CHAKRABORTYSUPRIYA1988@GMAIL.COM', '8348362528', '743245', 'C/O- SUMIT RANJAN CH, GAIGHATA, 743245, , , NORTH 24 PARGANAS, WEST BENGAL, 743245', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'ALZPC8667M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ELQPB1389L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ELQPB1389L' LIMIT 1) AS admin_id, 'ANNECHM-590', 'SUVADIP BISWAS', 'SUVADIP BISWAS', 'SUVODIPBISWAS780@GMAIL.COM', '7384916066', '743245', 'MATUADHAM, MONDALPARA, null, null, NORTH 24 PARGANAS, WEST BENGAL, 743245', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'ELQPB1389L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EYWPP5751H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EYWPP5751H' LIMIT 1) AS admin_id, 'ANNECHM-589', 'SUNITI GUCHHAIT PATRA', 'SUNITI GUCHHAIT PATR', 'JGTELESHOP19@GMAIL.COM', '8972746872', '743374', 'JAMTALA NISCHINTAPUR, KULPI, null, null, 24 PARGANAS (S), WEST BENGAL, 743374', 'WEST BENGAL', '24 PARGANAS (S)', 'EYWPP5751H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CMAPV8859G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CMAPV8859G' LIMIT 1) AS admin_id, 'ANNECHM-588', 'MANJU B VARGHESE', 'SNOOP', 'MANJULALU97@GMAIL.COM', '9562651725', '683542', 'MADECKAL HOUSE, PERUMBAVOOR WEST VENGOLA, , , ERNAKULAM, KERALA, 683542', 'KERALA', 'ERNAKULAM', 'CMAPV8859G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GNRPS7753A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GNRPS7753A' LIMIT 1) AS admin_id, 'ANNECHM-587', 'SREEJA M S', 'SREEJA M S', 'EIJANASEVAKPRA@GMAIL.COM', '9847680862', '685604', 'VADACKAL(H), PADAMUGHAM P O, , , IDUKKI, KERALA, 685604', 'KERALA', 'IDUKKI', 'GNRPS7753A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AAWPI3501Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AAWPI3501Q' LIMIT 1) AS admin_id, 'ANNECHM-586', 'INDRANI DEVI G S', 'INDRANI DEVI G S', 'INDRANI.INDUASHOK@GMAIL.COM', '6238352811', '695009', 'MPRA 68D, OPP. CHINMAYA VIDYALAYA,, null, null, THIRUVANANTHAPURAM, KERALA, 695009', 'KERALA', 'THIRUVANANTHAPURAM', 'AAWPI3501Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EQBPR0432N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EQBPR0432N' LIMIT 1) AS admin_id, 'ANNECHM-585', 'ASWATHY R', 'ASWATHY', 'SQUAREKOLLAM2019@GMAIL.COM', '9605199113', '691601', 'VALLIKEEZHIL V EEDU, MURUNTHAL, , , KOLLAM, KERALA, 691601', 'KERALA', 'KOLLAM', 'EQBPR0432N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-584', 'SAMRAT BHATTACHARJEE', 'SAMRAT', 'SAMRATBHATTACHARJEE44@GMAIL.COM', '8638935835', '788712', 'ASSAM, KARIMGANJ, NAZARATILLA, KARNAMADHU, KARIMGANJ, ASSAM, 788712', 'ASSAM', 'KARIMGANJ', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BHJPV8644J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BHJPV8644J' LIMIT 1) AS admin_id, 'ANNECHM-580', 'VARGHESE', 'MERIN VARGHESE', 'MERINVARGHESE1117@GMAIL.COM', '8547423772', '601021', 'KOLLAM, KOLLAM, , , KOLLAM, KERALA, 601021', 'KERALA', 'KOLLAM', 'BHJPV8644J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FZMPM6919Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FZMPM6919Q' LIMIT 1) AS admin_id, 'ANNECHM-579', 'SUBHRANSHU MONDAL', 'SUBHRANSHU MONDAL', 'MONDALSUBHRANSHU31@GMAIL.COM', '8637880757', '743235', '24 PARGANAS (S), 24 PARGANAS (S), , , 24 PARGANAS (S), WEST BENGAL, 743235', 'WEST BENGAL', '24 PARGANAS (S)', 'FZMPM6919Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'JVUPS1914M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'JVUPS1914M' LIMIT 1) AS admin_id, 'ANNECHM-578', 'SUNIMOL S', 'SUNIMOL S', 'SUNI4JOSE@GMAIL.COM', '9633892527', '695001', 'THIRUVANANTHAPURAM, THIRUVANANTHAPURAM, THIRUVANANTHAPURAM, THIRUVANANTHAPURAM, THIRUVANANTHAPURAM, KERALA, 695001', 'KERALA', 'THIRUVANANTHAPURAM', 'JVUPS1914M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FFMPM1902M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FFMPM1902M' LIMIT 1) AS admin_id, 'ANNECHM-577', 'RAJIB MANNA', 'RAJIB MANNA', 'MANNARAJIB1234@GMAIL.COM', '9635023586', '721641', 'CHAKBOALIA, CHAKBOALIA, , , PASCHIM MEDINIPUR, WEST BENGAL, 721641', 'WEST BENGAL', 'PASCHIM MEDINIPUR', 'FFMPM1902M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CWNPM3857N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CWNPM3857N' LIMIT 1) AS admin_id, 'ANNECHM-576', 'BARUN MONDAL', 'BARUN MONDAL', 'Onlinepsa89@gmail.com', '7029137198', '743235', 'MANIGRAM,DHARMAPUKUR, BONGAON MANIGRAM, null, null, NORTH 24 PARGANAS, WEST BENGAL, 743235', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'CWNPM3857N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GLMPM6313M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GLMPM6313M' LIMIT 1) AS admin_id, 'ANNECHM-575', 'TUHIN MONDAL', 'TUHIN MONDAL', 'TUHINMONDAL551@GMAIL.COM', '8145458103', '743235', 'KALMEGHA , GHATBAOR , 24 NORTH PARGANAS , WEST BANGA, KALMEGHA, KALMEGHA, NORTH 24 PARGANAS, WEST BENGAL, 743235', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'GLMPM6313M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-574', 'MAULIK DOBARIYA', 'SDFDSF', 'onlinepsa89@gmail.com', '7029137198', '365480', 'BHADARDEM ROAD,NEAR , CDSFGHJM, null, null, WEST MEDINIPUR, WEST BENGAL, 365480', 'WEST BENGAL', 'WEST MEDINIPUR', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-BHARAT01', 'MAULIK', '9016105096', 'MAULIKDOBARIYA9999@GMAIL.COM', '9016105096', '365480', 'BHADARDEM ROAD,NEAR , DEVALKI, null, null, AHMEDABAD, GUJARAT, 365480', 'GUJARAT', 'AHMEDABAD', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GTAPD7205M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GTAPD7205M' LIMIT 1) AS admin_id, 'ANNECHM-BHARAT7384', 'MAULIK DOBARIYA', 'MAULIK DOBARIYA', 'MAULIKDOBARIYA9999@GMAIL.COM', '9016105096', '365601', 'AMRELI, AMRELI, null, null, AMRELI, GUJARAT, 365601', 'GUJARAT', 'AMRELI', 'GTAPD7205M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX72510', 'RAJIB PAN CENTRE', 'RAJIB MANNA', 'MANNARAJIB1234@GMAIL.COM', '9635023586', '721641', 'CHAKBOALIA,SAHAPUR.D, CHAKBOALIA,SAHAPUR.DASPUR.PASC, , , WEST MEDINIPUR, WEST BENGAL, 721641', 'WEST BENGAL', 'WEST MEDINIPUR', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX56738', 'RADHARAMAN ENTERPRISE', 'GOUR KANTI DAS', 'DASROHIT750@GMAIL.COM', '7002879883', '788806', 'VILL-SRIGOURI, ASSAM BADARPUR, null, null, KARIMGANJ, ASSAM, 788806', 'ASSAM', 'KARIMGANJ', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EPOPR4704D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EPOPR4704D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX60217', 'DIGITAL JANASEVANAKENDRAM', 'ATHIRAREMESAN', 'RETHEESHTA123@GMAIL.COM', '9656766429', '688525', 'THAMARAPPALLIVELI , THAMARAPPALLIVELI CHARAMANGALA, null, null, ALAPPUZHA, KERALA, 688525', 'KERALA', 'ALAPPUZHA', 'EPOPR4704D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EMOPR9527R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EMOPR9527R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX75041', 'PRATUSH ROY', 'PRATUSH ROY', 'onlinepsa89@gmail.com', '7029137198', '743411', 'BASIRHAT GHORIBARI , BASIRHAT GHORIBARI ,TAKI ROAD , null, null, NORTH 24 PARGANAS, WEST BENGAL, 743411', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'EMOPR9527R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AYBPB4838J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AYBPB4838J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX36587', 'E SEVANA', 'NISHA BABU', 'AKHILAPRADEEP84@GMAIL.COM', '8281862745', '691311', 'KEEZHOOTTU VEEDU, , KEEZHOOTTU VEEDU, MANNOOR PO, , null, null, KOLLAM, KERALA, 691311', 'KERALA', 'KOLLAM', 'AYBPB4838J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FLGPB7227G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FLGPB7227G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX04596', 'KAMDEB LAB', 'KAMDEB BERA', 'KAMDEBBERA@GMAIL.COM', '8967811689', '721401', 'VILL-DURMUTH,P.O-FUL, VILL-DURMUTH,P.O-FULESWAR,P.S-, null, null, PURBA MEDINIPUR, WEST BENGAL, 721401', 'WEST BENGAL', 'PURBA MEDINIPUR', 'FLGPB7227G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AWFPC4356E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AWFPC4356E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX01293', 'CHAKRABORTY GRAMIN SEBAKENDRA', 'DEBNATH CHAKRABORTY', 'DEBNATH.RSBY@GMAIL.COM', '9932336113', '721139', 'DEHATI,PANSKURA, DEHATI,PANSKURA, null, null, PURBA MEDINAPUR, WEST BENGAL, 721139', 'WEST BENGAL', 'PURBA MEDINAPUR', 'AWFPC4356E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BEJPM1078Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BEJPM1078Q' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX53869', 'NINAS GRAPHICS', 'JOSE MARTIN MORRIS', 'GRAPHICSNINAS@GMAIL.COM', '8111939787', '691303', 'PANAYIL BUILDINGS , PANAYIL BUILDINGS PANAYIL JUNC, , , KOLLAM, KERALA, 691303', 'KERALA', 'KOLLAM', 'BEJPM1078Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BOBPV5262H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BOBPV5262H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX52986', 'JANASEVANA CENTRE', 'RAJI .V', 'R33571986@GMAIL.COM', '9496268820', '691532', 'JANASEVA CENTRE,ANAD, JANASEVA CENTRE,ANAD ,POLICODU, , , KOLLAM, KERALA, 691532', 'KERALA', 'KOLLAM', 'BOBPV5262H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GRXPS5979A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GRXPS5979A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX78496', 'INGO TECH', 'JESSY SASIDHARAN', 'INGONET2022@GMAIL.COM', '8891179740', '690531', 'INGO TECH CSC, KAND, INGO TECH CSC, KANDALLOOR NOR, KANDALLOOR NORTH, PATTOLIMARKET P O, ALAPPUZHA, KERALA, 690531', 'KERALA', 'ALAPPUZHA', 'GRXPS5979A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AZXPD7176J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AZXPD7176J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX58146', 'MATANGINI ONLINE', 'SWARNENDU DAS', 'OMATANGINI@GMAIL.COM', '9434896937', '721152', 'VILL-KEDARPUR,, VILL-KEDARPUR,P.O-PANSKURA R.S, , , PURBA MEDINIPUR, WEST BENGAL, 721152', 'WEST BENGAL', 'PURBA MEDINIPUR', 'AZXPD7176J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FOVPB5405N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FOVPB5405N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX53809', 'BISWAS STORE', 'RADHARANI BISWAS', 'ABISWAS@GMAIL.COM', '7501180072', '743245', 'MONDALPARA, CHANDPAR, MONDALPARA, CHANDPARA, GAIGHAT, , , NORTH 24 PARGANAS, WEST BENGAL, 743245', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'FOVPB5405N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'OHDPS5639R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'OHDPS5639R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX48175', 'AGRO SERVICE CENTRE & CYBER POINT', 'SUSMITA SAMANTA', 'ASCCYBERPOINT@GMAIL.COM', '7908983876', '721211', 'VILL- SALAMPUR, P.O.- BRAHMANBASAN, P.S.- DASPUR, DIST.- PASCHIM MEDINIPUR, PASCHIM MEDINIPUR, WEST BENGAL, 721211', 'WEST BENGAL', 'PASCHIM MEDINIPUR', 'OHDPS5639R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX64209', 'GOURANGA DHALI', 'SATHI DHALI TARAFDER', 'jananidigital19@gmail.com', '9609807545', '741257', 'KASTADANGA, VILL-KASTADANGA,NADIA, , , NORTH 24 PARGANAS, WEST BENGAL, 741257', 'WEST BENGAL', 'NORTH 24 PARGANAS', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DZTPS4890F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DZTPS4890F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX81406', 'SARDAR TELECOM', 'ABDUL KAYEM SARDAR', 'ABDULKAYUMSARDAR@GMAIL.COM', '6295228265', '743273', 'VILL+PO - BALTI, , VILL+PO - BALTI, PS - SWARUPNA, null, null, NORTH 24 PARGANAS, WEST BENGAL, 743273', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'DZTPS4890F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FFRPS8514E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FFRPS8514E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX73189', 'DIGITAL MOBILE SHOP', 'KANCHAN SHARMA', 'KPS89065@GMAIL.COM', '8906563196', '734426', 'VILL-BADLAKATA, P.O-CHITALGHATA, P.S-PHANSIDEWA, DIST-DARJEELING, DARJILING, WEST BENGAL, 734426', 'WEST BENGAL', 'DARJILING', 'FFRPS8514E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BPMPG7971Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BPMPG7971Q' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX31287', 'STUDIO CANVAS', 'BUBAI GHOSH', 'STUDIOCANVAS743375@GMAIL.COM', '9547022006', '743375', 'TALDANGA, USTHI,, DIAMOND HARBOUR, SOUTH24PGS, 743375, SOUTH ,24 PARGANAS, WEST BENGAL, 743375', 'WEST BENGAL', 'SOUTH ,24 PARGANAS', 'BPMPG7971Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'LZBPK8096F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'LZBPK8096F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX85420', 'AKP CYBER CEFE KAMTA MATHIYA', 'ANGAD KUMAR', 'AKPCYBERCAFE@GMAIL.COM', '8651095150', NULL, 'VILL KAMTA MATHIYA , VILL KAMTA MATHIYA POST MASAD, null, null, ARWAL, BIHAR, null', 'BIHAR', 'ARWAL', 'LZBPK8096F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CNQPR8815K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CNQPR8815K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX50748', 'MOBILE SHOP', 'MD MOTIBUR RAHAMAN', 'RAHAMANMDMOTIBUR2@GMAIL.COM', '6296946139', '734426', 'VILL-MAHAMMADPUR, P.O-BIDHANNAGAR, P.S-PHANSIDEWA, DIST-DARJEELING, DARJILING, WEST BENGAL, 734426', 'WEST BENGAL', 'DARJILING', 'CNQPR8815K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'HCMPM2921K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'HCMPM2921K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX20483', 'GRAHOK SEBA KENDRA', 'RAJAUL KARIM MUNNA', 'rajaulkarimmunna@gmail.com', '7627938180', '799273', 'CHAWMANU BAZAR DHALA, CHAWMANU BAZAR DHALAI TRIPURA, null, null, DHALAI, TRIPURA, 799273', 'TRIPURA', 'DHALAI', 'HCMPM2921K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AFHPA4164M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AFHPA4164M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX05436', 'E-SAHAJOGA', 'BINOD KUMAR ACHARYA', 'BINODACHARYA1979@GMAIL.COM', '6371094465', '751002', 'SUNDARPADA BHUBANESW, SUNDARPADA BHUBANESWAR, null, null, KHORDHA, ODISHA, 751002', 'ODISHA', 'KHORDHA', 'AFHPA4164M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DOPPR1048M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DOPPR1048M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX60839', 'DIYA ADS', 'DEEPESH KUMAR', 'DEEPESHSRKUMAR@GMAIL.COM', '7907030533', '695584', 'VRINDAVANAM, PULIKKAVILAKOM, KAVUVILA, POTHENCODE PO, TRIVANDRUM, THIRUVANANTHAPURAM, KERALA, 695584', 'KERALA', 'THIRUVANANTHAPURAM', 'DOPPR1048M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EMQPD0261J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EMQPD0261J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX12690', 'DIGITAL SERVICE', 'SUPARNA', 'DIGITALSERVICEBYSD@GMAIL.COM', '6289420851', '700040', '27/1R/1 M.N. SEN LAN, 27/1R/1 M.N. SEN LANE REGENT P, null, null, KOLKATA, WEST BENGAL, 700040', 'WEST BENGAL', 'KOLKATA', 'EMQPD0261J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CIPPM6889J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CIPPM6889J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX42160', 'DIGITAL WORLD', 'SABIR MONDAL', 'SABIRALIMONDAL0@GMAIL.COM', '8116511511', '743405', 'JAYANTIPUR, PETRAPOL, JAYANTIPUR, PETRAPOLE, PETRAPO, VILL - JAYANTIPUR, P.O. - PETRAPOLE, NORTH 24 PARGANAS, WEST BENGAL, 743405', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'CIPPM6889J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AYYPB1043Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AYYPB1043Q' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX35970', 'BISWAS COMPUTER CENTRE', 'SANJIB BISWAS', 'SANJIBTHN@GMAIL.COM', '8641909338', '743287', 'CHIKANPARA, THAKURNAGAR, GAIGHATA, CHIKANPARA, NORTH 24 PARGANAS, WEST BENGAL, 743287', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'AYYPB1043Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FRVPR7610L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FRVPR7610L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX87120', 'JANASEVANA THEKKADA', 'LEENA K R', 'JANASEVANATHEKKADA@GMAIL.COM', '9526127650', '695615', 'DARUL ISHQ, THEKKADA, , , THIRUVANANTHAPURAM, KERALA, 695615', 'KERALA', 'THIRUVANANTHAPURAM', 'FRVPR7610L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CELPP1556D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CELPP1556D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX87345', 'INDRAJEET PATEL', 'INDRAJEET PATEL', 'www.indrajeetpatel@gmail.com', '9794004916', NULL, 'null, null, null, null, null, UTTAR PRADESH, null', 'UTTAR PRADESH', NULL, 'CELPP1556D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FAYPM4191R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FAYPM4191R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX87461', 'AKTAR MOBILE ONLINE', 'AKTARUL MONDAL', 'aktarul385@gmail.com', '9326419652', '743235', 'MANIGRAM , DHARMAPUKURIA BONGAON , , , 24 PGS NORTH, WEST BENGAL, 743235', 'WEST BENGAL', '24 PGS NORTH', 'FAYPM4191R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AMBPB8357N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AMBPB8357N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX87543', 'GRAHOK SEBA KENDRO', 'RAJIB BISWAS', 'rb512764@gmail.com', '9331587362', '743127', '4 NO VIVEKANANDA GAR, 4 NO VIVEKANANDA GAR, , , 24 PGS NORTH, WEST BENGAL, 743127', 'WEST BENGAL', '24 PGS NORTH', 'AMBPB8357N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CRIPP4092E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CRIPP4092E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX87629', 'JOY TELECOM', 'JOY PODDER', 'JOYSUSMITA951@GMAIL.COM', '7029372775', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CRIPP4092E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BKBPB9951P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BKBPB9951P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX89037', 'SMART INDIA', 'SAYAN BARMAN', 'sayanbarman10@gmail.com', '8787587726', NULL, 'null, null, null, null, null, TRIPURA, null', 'TRIPURA', NULL, 'BKBPB9951P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AERPI3444P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AERPI3444P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX89643', 'AS ELECTRONIC', 'SAHADUL ISLAM', 'sahadulislam42@gmail.com', '8486466947', NULL, 'null, null, null, null, null, ASSAM, null', 'ASSAM', NULL, 'AERPI3444P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CNQPM8510G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CNQPM8510G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX90148', 'AR ONLINE SERVICE', 'MD ANOWAR HOSSEIN MOLLA', 'aronlineservice1@gmail.com', '9647119967', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CNQPM8510G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AXWPB0882G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AXWPB0882G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX90236', 'PRERANA STUDIO AND XEROX', 'PROSENJIT BACHHAR', 'prosenjit7440@gmail.com', '9775507440', '743273', 'VILL- TARALI, P.O- NITYANANDAKATI, PS- SWARUPNAGAR, , NORTH 24 PARGANAS, WEST BENGAL, 743273', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'AXWPB0882G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EWFPS6038M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EWFPS6038M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX90326', 'SWARUP ON LINE SHOP', 'SWARUP SARKAR', 'sarkarswarup756@gmail.com', '9732567821', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'EWFPS6038M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'JOXPS6328H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'JOXPS6328H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX90364', 'UNIQUE TELECOM', 'SHUBHANKAR SAHA', 'sahashubhankar069@gmail.com', '9609183767', '741165', 'VILL- NARAYANPUR, P.O-AMIYA NARAYANPUR, , , NADIA, WEST BENGAL, 741165', 'WEST BENGAL', 'NADIA', 'JOXPS6328H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GRSPD7317B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GRSPD7317B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX90418', 'BAPPA TELECOM', 'JAGATJIBAN DAS', 'Jagatjibandas43825@gmail.com', '8670416565', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'GRSPD7317B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EEMPM8440A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EEMPM8440A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX90468', 'MANNA DIGITAL CYBAR CAFE', 'BIPLAB MANNA', 'baba98@gmail.com', '7577607209', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'EEMPM8440A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'HHWPK2875H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'HHWPK2875H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX90471', 'CYBERPARK ESEVA KENDRA', 'SHASHI RANJAN KUMAR', 'cyberparkeseva2001@gmail.com', '8507057857', NULL, 'null, null, null, null, null, BIHAR, null', 'BIHAR', NULL, 'HHWPK2875H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'NBVPS8928G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'NBVPS8928G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX90742', 'SOUMITRA SAMANTA', 'SOUMITRA SAMANTA', 'soumitrasamant328@gmail.com', '8001400792', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'NBVPS8928G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FZIPM8217F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FZIPM8217F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX90815', 'RITAM ONLINE', 'RITAM MONDAL', 'ritammandal052@gmail.com', '8250201810', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'FZIPM8217F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BYLPG9173N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BYLPG9173N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX91264', 'MAMA BHAGNA TELECOM', 'HASANUR GAZI', 'mdhasanurgazi@gmail.com', '7501316185', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BYLPG9173N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AYSPH1961M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AYSPH1961M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX91306', 'HALDAR TELECOME', 'SUJIT HALDAR', 'GRP.SUJIT@GMAIL.COM', '9547261534', '733124', 'PURANPARA, GANGARAMPUR, , , DAKSHIN DINAJPUR, WEST BENGAL, 733124', 'WEST BENGAL', 'DAKSHIN DINAJPUR', 'AYSPH1961M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CKMPB5596G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CKMPB5596G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX91468', 'PARNA ONLINE SERVICE', 'UTTAM BISWAS', 'uttamanc@gmail.com', '7679995740', '743287', 'KAROLA, THAKURNAGAR, NORTH 24 PGS, W.B, , , NORTH 24 PARGANAS, WEST BENGAL, 743287', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'CKMPB5596G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GWJPD1898E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GWJPD1898E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX91803', 'M S DHALI TELECOM', 'SAHIB A LI DHALI', 'labludhali1@gmail.com', '8537934931', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'GWJPD1898E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DDXPR6053K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DDXPR6053K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX92078', 'ROY XEROX AND ONLINE SERVICES', 'BISWAJIT ROY', 'biswajitr873@gmail.com', '6290815525', '700128', 'DIGBERIA BRIGHT GATE, DIGBERIA BRIGHT GATE, , , NORTH 24 PARGANAS, WEST BENGAL, 700128', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'DDXPR6053K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BISPP7059M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BISPP7059M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX92156', 'PRITAM SERVICES', 'PRANATI PURKAIT', 'TAPANPURKAIT4@GMAIL.COM', '7908121253', '743376', 'VILL- BELEGACHI (S),, BARIIPUR, , , 24 PARGANAS (S), WEST BENGAL, 743376', 'WEST BENGAL', '24 PARGANAS (S)', 'BISPP7059M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BTFPR9441B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BTFPR9441B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX92163', 'ROY TELECOM', 'PROSENJIT ROY', 'prosen8646jit@gmail.com', '7699829215', '743251', 'CHAMPARUI, AMDOBE, BAGDAH, NORTH TWENTY FOUR PAGRANAS, 24 PGS NORTH, WEST BENGAL, 743251', 'WEST BENGAL', '24 PGS NORTH', 'BTFPR9441B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BEEPM4616K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BEEPM4616K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX92487', 'BISWAJIT MANDAL', 'BISWAJIT MANDAL', 'bjm.dicosta@gmail.com', '9733809080', '743251', 'ASHARU, BAGDHA, ASHARU, , NORTH 24 PARGANAS, WEST BENGAL, 743251', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'BEEPM4616K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DLIPB1759P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DLIPB1759P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX92508', 'BEHERA DTP CENTER', 'BISWAJEET BEHERA', 'bbiswajeet439@gmail.com', '7008391473', NULL, 'null, null, null, null, null, ODISHA, null', 'ODISHA', NULL, 'DLIPB1759P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'PSSPS9569H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'PSSPS9569H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX92578', 'ALAM SK', 'ALAM SK', 'ask20968080@gmail.com', '7501584074', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'PSSPS9569H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BZGPB5856D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BZGPB5856D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX92845', 'PRASENJIT BARMAN', 'PRASENJIT BARMAN', 'prasenjitbarman10000@gmail.com', '7797596051', '721633', 'SANTRABARH, SASIGANJ, , , PURBA MEDINIPUR, WEST BENGAL, 721633', 'WEST BENGAL', 'PURBA MEDINIPUR', 'BZGPB5856D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EXQPM8338J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EXQPM8338J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX93062', 'MONDAL ENTER PRIZE', 'AVIJIT MONDAL', 'bm1715945@gmail.com', '7431944350', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'EXQPM8338J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BSDPA1168H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BSDPA1168H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX93128', 'MODICARE DP', 'ANILKUMAR', 'anilstudio015@gmail.com', '8281707122', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'BSDPA1168H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'HOXPK3474N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'HOXPK3474N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX93271', 'AAYUSHMAN ONLINE CENTER', 'ARTI KUMARI', 'sudhirsir563@gmail.com', '7320855484', NULL, 'null, null, null, null, null, BIHAR, null', 'BIHAR', NULL, 'HOXPK3474N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GKRPS0688R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GKRPS0688R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX93581', 'JENISHENTERPRISES', 'ELANGBAM JUNJUL SINGH', 'powerimphal@gmail.com', '8575262388', '795005', 'KHURAI , KONGPAL, , , IMPHAL EAST, MANIPUR, 795005', 'MANIPUR', 'IMPHAL EAST', 'GKRPS0688R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BSAPM6809E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BSAPM6809E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX93724', 'HABIBUR RAHAMAN MONDAL', 'HABIBUR RAHAMAN MONDAL', 'hrmondal201@gmail.com', '9775572912', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BSAPM6809E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CBCPB6567J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CBCPB6567J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX94206', 'DEV STORES', 'BIJU B PANICKER', 'pepsibiju@gmail.com', '9746870824', '688524', 'CMC 23, CHERTHALA P O, , , ALAPPUZHA, KERALA, 688524', 'KERALA', 'ALAPPUZHA', 'CBCPB6567J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'MVPPS3917L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'MVPPS3917L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX94560', 'PRASANTA CYBER CAFE', 'PRASANTA KUMAR SAHOO', 'tulusahoo721@gmail.com', '9090193497', NULL, 'null, null, null, null, null, ODISHA, null', 'ODISHA', NULL, 'MVPPS3917L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AAOPI5759C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AAOPI5759C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX94573', 'MD RAFIKUL ISLAM', 'SANMATINAGAR,MURSHIDABAD, WEST BENGAL', 'MINHAJULISLAM1282007@GMAIL.COM', '6296609081', '742213', 'SANMATINAGAR, SANMATINAGAR, , , MURSHIDABAD, WEST BENGAL, 742213', 'WEST BENGAL', 'MURSHIDABAD', 'AAOPI5759C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'IJTPK4058N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'IJTPK4058N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX94587', 'SK ELEKTRONIC', 'HAMIDA KHAN', 'sukuralikhank0786@gmail.com', '7001406421', '722101', 'PUNISOLE, PUNISOLE, , , BANKURA, WEST BENGAL, 722101', 'WEST BENGAL', 'BANKURA', 'IJTPK4058N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX94783', 'RAIKWAR ONLINE CENTER', 'JAGDISH RAIKWAR', 'MUKESHRAIKWAR9826@GMAIL.COM', '9294550898', NULL, 'null, null, null, null, null, MADHYA PRADESH, null', 'MADHYA PRADESH', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CJVPB7403C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CJVPB7403C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX94860', 'BABLU BARMAN', 'BABLU BARMAN', 'bablubarman415@gmail.com', '8759828024', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CJVPB7403C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BHPLA0079G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BHPLA0079G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX95143', 'AKHTAR TELICOM', 'SELIM AKHTAR', 'SELIM973500@GMAIL.COM', '6297161360', '733143', 'BOSTOMTOLA, HATGACHHI, ITAHAR, , UTTAR DINAJPUR, WEST BENGAL, 733143', 'WEST BENGAL', 'UTTAR DINAJPUR', 'BHPLA0079G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AYCPH9953P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AYCPH9953P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX95168', 'AJMAL HOSSAIN', 'AJMAL HOSSAIN', 'ajmalhossain0502@gmail.com', '9134505084', '733128', 'BANSHTHUPI, BANSHTHUPI, ITAHAR, ITAHAR, UTTAR DINAJAPUR, WEST BENGAL, 733128', 'WEST BENGAL', 'UTTAR DINAJAPUR', 'AYCPH9953P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CGJPN6952K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CGJPN6952K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX95410', 'AYUSH COMMUNICATION', 'SURENDRA NAIK', 'surendranaik69941@gmail.com', '9074303828', NULL, 'null, null, null, null, null, ODISHA, null', 'ODISHA', NULL, 'CGJPN6952K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'JCXPK2477K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'JCXPK2477K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX95487', 'JANASEVANA KENDRAM', 'FOUSIYA K K', 'janasevanakendram7979@gmail.com', '9567418979', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'JCXPK2477K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BXQPB0781D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BXQPB0781D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX95607', 'HARA KRISHNA INFOTECH', 'SUNDAR LAL BARMAN', 'swarnadip4747@gmail.com', '9635202594', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BXQPB0781D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BCPPM6647B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BCPPM6647B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX95712', 'ANUP BHANDAR', 'SUDARSHAN MANDAL', 'sudhanmandal1@gmail.com', '7002023571', NULL, 'null, null, null, null, null, ASSAM, null', 'ASSAM', NULL, 'BCPPM6647B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AWGPL9217J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AWGPL9217J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX95786', 'THE NEW INDIA ASSURANCE AGENT PORTAL OFFICE', 'SAJITHA C L', 'sajithashinelal@gmail.com', '9995863633', '691533', 'KRISHNAMRUTHAM, VAYYANAM.P.O , VAYYANAM, AYUR, KOLLAM, KERALA, 691533', 'KERALA', 'KOLLAM', 'AWGPL9217J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ABNPL7743D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ABNPL7743D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX96174', 'EDAYAM JANASEVANA', 'RAMESAN L', 'edayamjansevana@gmail.com', '9495703138', '691532', 'EDAYAM PO, EDAYAM , , , KOLLAM, KERALA, 691532', 'KERALA', 'KOLLAM', 'ABNPL7743D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ELEPS2517F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ELEPS2517F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX96271', 'SANNYASI INFOTEACH', 'NRIPEN SANNYASI', 'teamnripensannyasi09@gmail.com', '9832004293', '733124', 'PATAN, JALALPUR, , PATAN, JALALPUR, , , DAKSHIN DINAJPUR, WEST BENGAL, 733124', 'WEST BENGAL', 'DAKSHIN DINAJPUR', 'ELEPS2517F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'JCQPS1610K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'JCQPS1610K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX96273', 'ANANDU SURESH', 'INGO TECH', 'anandusuresh141@gmail.com', '9400531681', '690531', 'SARASWATHY BHAVANAM , KANDALLOOR NORTH, PATTOLIMARKET P O, , ALAPPUZHA, KERALA, 690531', 'KERALA', 'ALAPPUZHA', 'JCQPS1610K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GLWPM7488D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GLWPM7488D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX96415', 'ONLINE SEVA KENDRA', 'BINAY MANDAL', 'MANDALBINAY1991@GMAIL.COM', '8013236810', '743373', 'KRISHNANAGAR, SAGAR KRISHNANAGAR, , , SOUTH 24 PARGANAS, WEST BENGAL, 743373', 'WEST BENGAL', 'SOUTH 24 PARGANAS', 'GLWPM7488D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GTUPM8343H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GTUPM8343H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX96453', 'ONLINE SERVICE POIENT', 'SAMEN MONDAL', 'nakulmondal134@gmail.com', '9800378905', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'GTUPM8343H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CCRPM3504J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CCRPM3504J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX96827', 'AZAHAR UDDIN MONDAL', 'AZAHAR UDDIN MONDAL', 'PROGOTIONLINE@GMAIL.COM', '8436165417', '741257', 'KASHTADANGA, KASHTADANGA, NADIA, NADIA, NADIA, WEST BENGAL, 741257', 'WEST BENGAL', 'NADIA', 'CCRPM3504J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CNBPS6864C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CNBPS6864C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX96872', 'SARKAR ELECTRONICS', 'ASHOK', 'ashok.a.sarkar@gmail.com', '7427913278', '743235', 'NETAJI NAGAR, RAMCHANDRAPUR, , , NORTH 24 PARGANAS, WEST BENGAL, 743235', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'CNBPS6864C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'IQLPS9136L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'IQLPS9136L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX97150', 'AR ENTERPRISES', 'ANJU SASEENDHRAN', 'ANJUJANASEVA@GMAIL.COM', '6235100628', '688504', 'KAVALECHIRA BUILDING, PULINCUNNOO P O, KANNADY, ALAPPUZHA, ALAPPUZHA, KERALA, 688504', 'KERALA', 'ALAPPUZHA', 'IQLPS9136L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FYMPM2740A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FYMPM2740A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX97246', 'MISHRA ENTERPRISE', 'SUVAJIT MISHRA', 'suvajitm808@gmail.com', '8436361802', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'FYMPM2740A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FKVPK0820E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FKVPK0820E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX97253', 'BHAWANI ONLINE CENTRE BASOPATTI', 'SONU KUMAR', 'sonukumarthakur78@gmail.com', '7260907723', NULL, 'null, null, null, null, null, BIHAR, null', 'BIHAR', NULL, 'FKVPK0820E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DITPM7593C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DITPM7593C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX97405', 'NUR ENTERPRISE INTERIOR', 'SULTANA MANJURA', 'mahi2islam6@gmail.com', '7001434769', '743427', 'VILL-MAGURALI SATPAI, PO-SAYESTANAGAR, PS-BADURIA, , 24 PGS NORTH, WEST BENGAL, 743427', 'WEST BENGAL', '24 PGS NORTH', 'DITPM7593C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'HGUPK8974E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'HGUPK8974E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX98025', 'SK STORE', 'SREEJITH E K', 'skstoreshoranur@gmail.com', '9846666624', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'HGUPK8974E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'LKCPK1882M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'LKCPK1882M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX98120', 'CYBER POINT', 'HASAN UJJAMAN KHAN', 'CYBERPOINTPITPUR@GMAIL.COM', '9434873800', '721139', 'PURBA PITPUR, KESHAPAT, PANSKURA, PURBA MEDINIPUR, EAST MEDINIPORE, WEST BENGAL, 721139', 'WEST BENGAL', 'EAST MEDINIPORE', 'LKCPK1882M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BVLPM4148J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BVLPM4148J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX98136', 'KRIPA ONLINE SERVICE', 'MONZI, B', 'kripaonlineservice@gmail.com', '9633393039', '691333', '.MARKET JN., KARAVALOOR, , , KOLLAM, KERALA, 691333', 'KERALA', 'KOLLAM', 'BVLPM4148J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BJHPM7439L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BJHPM7439L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX98153', 'KHUSHI XEROX', 'SUNIL KUMAR MARNDI', 'khushixerox2020@gmail.com', '9438151137', NULL, 'null, null, null, null, null, ODISHA, null', 'ODISHA', NULL, 'BJHPM7439L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ANLPK9682J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ANLPK9682J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX98157', 'JANASEVA KENDRA', 'HARIHAR KARAN', 'karanh298@gmail.com', '8917697303', '752102', 'DANDILO, DANDILO, BRAHMAN SARANGI, , KHORDA, ODISHA, 752102', 'ODISHA', 'KHORDA', 'ANLPK9682J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BMFPG9402A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BMFPG9402A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX98176', 'ONLINE SHOP', 'SAMRAT MAJUMDER', 'majumdersamrat113@gmail.com', '8535898538', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BMFPG9402A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DRHPS7457C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DRHPS7457C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX98253', 'UTTAM SHILL', 'UTTAM SHILL', 'CONTACT.UTTAMS@GMAIL.COM', '8918496235', '733202', 'ISLAMPUR, STATE FARM COLONY, ISLAMPUR,, , , UTTAR DINAJAPUR, WEST BENGAL, 733202', 'WEST BENGAL', 'UTTAR DINAJAPUR', 'DRHPS7457C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AIQPV5524N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AIQPV5524N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX98345', 'JENESEVANA KENDRAM', 'SAJITHA KUMARY V', 'sajithagic@gmail.com', '9446365323', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'AIQPV5524N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'HUCPS4118E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'HUCPS4118E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX98542', 'ORMA ONLINE SERVICES', 'SALIMKUMAR S', 'salimkumarorma64@gmail.com', '9447952462', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'HUCPS4118E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AZXPC6547J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AZXPC6547J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX98605', 'CHATTERJEE STUDEO AND XEROX', 'CHANCHAL CHATTOPADHYAY', 'chanchalchattopadhyay4@gmail.com', '6296715263', '743370', 'DAYAPUR, SB COASTAL, , , SOUTH 24 PARGANAS, WEST BENGAL, 743370', 'WEST BENGAL', 'SOUTH 24 PARGANAS', 'AZXPC6547J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'MVCPS4379F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'MVCPS4379F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEXDATA01', 'SANDIP TELECOM', 'SANDIP MONDAL', 'mr.das6600@gmail.com', '7908624790', '743235', 'NETAJINAGAR, BONGAON, , , NORTH 24 PARGANAS, WEST BENGAL, 743235', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'MVCPS4379F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AVGPK9134L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AVGPK9134L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX64920', 'ARATI TELECOM', 'SUBHANKAR KUNDU', 'KUNDUSUVANKAR2014@GMAIL.COM', '9547603380', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'AVGPK9134L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ACRPU4456F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ACRPU4456F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX65473', 'LEKHANI ENTERPRISE', 'UDITNARAYAN UTTHASINI', 'lekhanienterpris@gmail.com', '9093741128', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'ACRPU4456F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX65742', 'NARENDRA SINGH LODHI', 'NARENDRA SINGH LODHI', 'LODHESHWARDIGITAL@GMAIL.COM', '8827149607', '472115', 'KUDILA RAOD, KHARGAPUR, KHARGAPUR, KHARGAPUR, TIKAMGARH, MADHYA PRADESH, 472115', 'MADHYA PRADESH', 'TIKAMGARH', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CCKPA6322B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CCKPA6322B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX67189', 'EMITHRAM CSP', 'CYRIL ABRAHAM', 'plackal2018@gmail.com', '9447700474', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'CCKPA6322B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AJUPT9756B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AJUPT9756B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX67850', 'PRINTERRTECNOLOGY', 'TANYA TABASSUM', 'PRINTERRTECHNOLOGY5@GMAIL.COM', '8697753594', '700023', '33/H/13, DENT MISSION ROAD, KHIDDERPORE, KOLKATA, KOLKATA, WEST BENGAL, 700023', 'WEST BENGAL', 'KOLKATA', 'AJUPT9756B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AHSPH7383N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AHSPH7383N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX67951', 'SUPRIYA ONLINE', 'ARPON HALDER', 'arponhalder123@gmail.com', '9932527640', '741505', 'VILL BER HANSKHALI, HANSKHALI, HANSKHALI, DIST NADIA, NADIA, WEST BENGAL, 741505', 'WEST BENGAL', 'NADIA', 'AHSPH7383N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'JFSPK6134P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'JFSPK6134P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX68017', 'KARAN ONLINE CENTER', 'SOUMITRA KARAN', 'SOUMITRAKARAN77@GMAIL.COM', '8967327967', '721139', 'DAKSHIN MECHOGRAM, UTTAR MECHOGRAM, , , PURBA MEDINIPUR, WEST BENGAL, 721139', 'WEST BENGAL', 'PURBA MEDINIPUR', 'JFSPK6134P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CECPP5402F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CECPP5402F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX68109', 'PAN CARD CENTRE', 'TARANISEN PATRA', 'taranisenpatra16@gmail.com', '8917325875', NULL, 'null, null, null, null, null, ODISHA, null', 'ODISHA', NULL, 'CECPP5402F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BFKPH5952J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BFKPH5952J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX68274', 'SABBIR AHAMED', 'SAMSHUL HOQUE', 'Samsul9564590955@gmail.com', '9564590955', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BFKPH5952J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'QFJPS6810E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'QFJPS6810E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX68439', 'BARSHA ONLINE SERVICE', 'RABIN SANTRA', 'rabinsantra159@gmail.com', '8250159993', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'QFJPS6810E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CPJPD7059A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CPJPD7059A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX68590', 'MA KALI COMIUNICATION', 'BISWAJIT DHALI', 'DHALIRUMA3@GMAIL.COM', '8981138803', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CPJPD7059A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX69014', 'ABHISHEK COMPUTER', 'ABHISHEK KUMHAR', 'KUMHARABHISHEK@GMAIL.COM', '6232500755', NULL, 'null, null, null, null, null, MADHYA PRADESH, null', 'MADHYA PRADESH', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AZDPB0874D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AZDPB0874D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX69102', 'SAROJINI GRAPHICS', 'GAJENDRA', 'sarojinib.4321@gmail.com', '7894814381', NULL, 'null, null, null, null, null, ODISHA, null', 'ODISHA', NULL, 'AZDPB0874D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CROPP7955E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CROPP7955E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX69103', 'PAL TELECOM', 'SUSANTA PAL', 'palsusanta199@gmail.com', '7797975554', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CROPP7955E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FUCPM4583B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FUCPM4583B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX69201', 'KAUSHANI VARIETIES', 'PRITIKANA MUKHERJEE', 'gungun.kaushik.mun@gmail.com', '9933391308', '743245', 'BOCKCHARA, BAIKARA, , , 24 PARGANAS (S), WEST BENGAL, 743245', 'WEST BENGAL', '24 PARGANAS (S)', 'FUCPM4583B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BLLPC8612H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BLLPC8612H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX69257', 'DELTA PRINTERS', 'ELDHOSE CHACKO', 'e4eldhose77@gmail.com', '9645957148', '686681', 'XII/180 E, VENGASSERIYIL BUILDING, KEERAMPARA P. O., KEERAMPARA, KOTHAMANGALAM, ERNAKULAM, KERALA, 686681', 'KERALA', 'ERNAKULAM', 'BLLPC8612H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DIQPM9557M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DIQPM9557M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX69327', 'WEBSHACK INTERNET CAFE', 'SURAJ MONDAL', 'surajmondal721@gmail.com', '8348863488', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DIQPM9557M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CHDPB0980L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CHDPB0980L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX69713', 'BARIK ONLINE ZONE', 'TANMOY BARIK', 'tanmoybarik93@gmail.com', '9734828266', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CHDPB0980L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CJCPM5810P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CJCPM5810P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX69827', 'SRI BISHNU INTERNET ZONE', 'SUMAN MANDAL', 'suman.sahaj123@gmail.com', '9735436069', '712122', 'VILL - TILARI, POST - TILARI, P.S - GOGHAT, DIST -HOOGHLY, HOOGHLY, WEST BENGAL, 712122', 'WEST BENGAL', 'HOOGHLY', 'CJCPM5810P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'INLPK2347Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'INLPK2347Q' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX70291', 'ROSHNI MOBILE CENTER', 'RAKESH MOLLA', 'LALTUMOLLA51@GMAIL.COM', '9153662013', '743286', 'SWARUPNAGAR, SHEK PARA, BANGLANI, , NORTH 24 PARGANAS, WEST BENGAL, 743286', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'INLPK2347Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GDXPM3548B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GDXPM3548B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX70365', 'HUJAYFA MONDAL', 'HUJAYFA MONDAL', 'hujayfamondal67@gmail.com', '9832938362', '743232', 'BAKSA PASCHIM PARA, BAKSA PASCHIM PARA, BAKSA PASCHIM PARA, BAKSA PASCHIM PARA, NORTH 24 PARGANAS, WEST BENGAL, 743232', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'GDXPM3548B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX70819', 'MAHESH COMPUTER CENTRE', 'MAHESH KUMAR RAJAK', 'MAHESHKUMARRAJAK454545@GMAIL.COM', '8878441447', NULL, 'null, null, null, null, null, MADHYA PRADESH, null', 'MADHYA PRADESH', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DQCPA4667J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DQCPA4667J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX70862', 'IMRAN ONLINE CENTRE', 'IMRAN ALI', 'AMIIMRANALI1232@GMAIL.COM', '7679582810', '742223', 'KHIDIRPUR, KHIDIRPUR, , , MURSHIDABAD, WEST BENGAL, 742223', 'WEST BENGAL', 'MURSHIDABAD', 'DQCPA4667J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BXCPM5354F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BXCPM5354F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX71095', 'ANIKA DIGITAL ONLINE SEVA', 'AZHARUDDIN MONDAL', 'azharuddinmondal91@gmail.com', '7076226076', '743273', 'BALTI, SWARUPNAGAR, , , 24 PGS NORTH, WEST BENGAL, 743273', 'WEST BENGAL', '24 PGS NORTH', 'BXCPM5354F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BLSPG2819M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BLSPG2819M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX71293', 'GAZI NET POINT', 'HASANUJJAMAN GAZI', 'hasanurgazi76@gmail.com', '9096341570', '743273', 'NABATKATI, AMUDIA, AMUDIA, SWARUPNAGR, NORTH 24 PARGANAS, WEST BENGAL, 743273', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'BLSPG2819M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DMUPK9468P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DMUPK9468P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX71568', 'PRIME SERVICE', 'LINEESH', 'primemangilkai@gmail.com', '7356451050', '673105', 'KARINGATTIYIL, PATHIYARAKKARA, , , KOZHIKODE, KERALA, 673105', 'KERALA', 'KOZHIKODE', 'DMUPK9468P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AOTPC0144G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AOTPC0144G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX71924', 'MADANMOHAN STUDENT CORNER', 'DURGASANKAR CHAKRABORTY', 'chakrabortydurgasankar153@gmail.com', '9933195550', '721146', 'RAMCHANDRAPUR, HATSARBERIA, , , PASCHIM MEDINIPUR, WEST BENGAL, 721146', 'WEST BENGAL', 'PASCHIM MEDINIPUR', 'AOTPC0144G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FPFPR7531G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FPFPR7531G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX71942', 'PIXEL', 'SHAFI', 'pixelnewshop@gmail.com', '8089786743', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'FPFPR7531G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CSLPS6087E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CSLPS6087E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX72039', 'SHRI WORLD', 'DEBASISH SUR', 'shriworld@yahoo.com', '9903547610', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CSLPS6087E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BSHPV7814F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BSHPV7814F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX72136', 'PREETHIMOL V', 'PREETHIMOL V', 'preethyrajeev4@gmail.com', '9961388469', '686102', 'PUTHENPARAMBIL, PANACHIKAVU P O, , , KOTTAYAM, KERALA, 686102', 'KERALA', 'KOTTAYAM', 'BSHPV7814F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FRYPM4087B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FRYPM4087B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX72304', 'GLOBAL COMPUTERS', 'MUHAMMAD JALEEL M', 'GLOBALTOUCHACL@GMAIL.COM', '8606393248', '691306', 'ANCHAL, ANCHAL PO, KOLLAM, , KOLLAM, KERALA, 691306', 'KERALA', 'KOLLAM', 'FRYPM4087B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX72461', 'RADHA RANI COMPUTER RAMPURA', 'MANOJ RAJPOOT', 'RADHARANICOMPUTERAMPURA@GMAIL.COM', '9340722563', NULL, 'null, null, null, null, null, MADHYA PRADESH, null', 'MADHYA PRADESH', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX72918', 'GAURI UPADHYAY', 'TAXADO PRIVATE LIMIT', 'GAURIU784@GMAIL.COM', '7754951133', '273001', 'GORAKHPUR, UTTARPRADESH, , , 24 PGS NORTH, WEST BENGAL, 273001', 'WEST BENGAL', '24 PGS NORTH', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BTQPM4725A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BTQPM4725A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX73406', 'ESMATARA TELECOM', 'IMRAN MALLICK', 'AYANTELECOM162@GMAIL.COM', '9123069269', '712203', 'BANGIHATI, MALLICKPARA, SERAMPORE, HOOGHLY, HOOGHLY, WEST BENGAL, 712203', 'WEST BENGAL', 'HOOGHLY', 'BTQPM4725A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'JESPS5031L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'JESPS5031L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX73548', 'UMMEHANI GAZI', 'SOUTH TWENTY FOUR PARGANAS', 'hani@gmail.com', '6344090080', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'JESPS5031L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AKWPM8568R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AKWPM8568R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX73651', 'MANDAL ONLINE CENTERS', 'SHYAMAL KUMAR MANDAL', 'shyamalnishindra@gmail.com', '9563322608', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'AKWPM8568R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX73906', 'SHRI BANKE BIHARI COMPUTERS', 'KM RAKSHA YADAV', 'dy247273@gmail.com', '8109212980', '284204', 'GANDHIGANJ, MAURANIPUR, MAURANIPUR, MAURANIPUR, JHANSI, UTTAR PRADESH, 284204', 'UTTAR PRADESH', 'JHANSI', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ECXPM9402D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ECXPM9402D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX73981', 'JANASEVANA KENDRAM', 'VISHNU MOHAN', 'janasevana1286@gmail.com', '7736385822', '691504', 'VISHNU BHAVANAM, PUNUKKANNOOR, PERUMPUZHA P O, KOLLAM, KOLLAM, KERALA, 691504', 'KERALA', 'KOLLAM', 'ECXPM9402D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DMXPR1344Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DMXPR1344Q' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX74063', 'SOHEL CYBER CAFE', 'SAIDUL RAHAMAN', 'saidulislam70010@gmail.com', '7001043979', '732124', 'DURGAPUR, GAJOL, GAZOLE, MALDA, , , MALDA, WEST BENGAL, 732124', 'WEST BENGAL', 'MALDA', 'DMXPR1344Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DRVPM5803G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DRVPM5803G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX74183', 'MONDAL ATM SERVICE', 'SANKAR MONDAL', 'sankarmondal043@gmail.com', '8637015674', '743262', 'SATBERIA, SATBERIA, , , 24 PGS NORTH, WEST BENGAL, 743262', 'WEST BENGAL', '24 PGS NORTH', 'DRVPM5803G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DEZPM8561L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DEZPM8561L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX74813', 'ABUJAR MONDAL', 'ABUJAR MONDAL', 'abujarpranuae@gmail.com', '7478553280', '743235', 'BAJITALA, BONGAON, BAJITALA, , NORTH 24 PARGANAS, WEST BENGAL, 743235', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'DEZPM8561L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CQYPM2860C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CQYPM2860C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX74891', 'UPOKAR ONLINE SERVICE', 'SABBIR MANDAL', 'sabbirmandal333@gmail.com', '7872581966', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CQYPM2860C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AMKPL5830F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AMKPL5830F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX75281', 'SOUMEN MOBILE', 'SOUMEN LAL', 'soumen.lal94@gmail.com', '8768313645', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'AMKPL5830F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GKRPK5880D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GKRPK5880D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX75306', 'STK MINI CYB', 'SOURAV KARAN', 'bharatpays27@gmail.com', '7908494885', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'GKRPK5880D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BOBPR5889A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BOBPR5889A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX75403', 'SONADEEP ELECTRONIC', 'SANATAN RAY', 'raysanatan8918155889@gmail.com', '9614249764', '733127', 'UTTAR JOYPUR, GANGARAMPUR, BELBARI, DAKSHIN DINAJPUR, DAKSHIN DINAJPUR, WEST BENGAL, 733127', 'WEST BENGAL', 'DAKSHIN DINAJPUR', 'BOBPR5889A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CUQPG6115E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CUQPG6115E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX75804', 'CSC EI ADITYA COMMUNICATIONS', 'MANOJ VIJAYAKUMAR GUPTA', 'cscmgk@gmail.com', '7902777337', '679514', 'SREEVALSAM BUILDING, MANGALAMKUNNU, KATTUKULAM PO, SREEKRISHNAPURAM , PALAKKAD, KERALA, 679514', 'KERALA', 'PALAKKAD', 'CUQPG6115E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GIKPD2453J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GIKPD2453J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX76012', 'DASCOMUNICATION ONLINE SERVICES', 'LAKSHAN CHANDRA DAS', 'kabitadas5237@gmail.com', '7548955237', '741257', 'VILL-DASBARIA,, PO-DIGHALGRAM, PS-HARINGHATA, DIST-NADIA, NADIA, WEST BENGAL, 741257', 'WEST BENGAL', 'NADIA', 'GIKPD2453J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'MDOPS1140J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'MDOPS1140J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX76092', 'SASMAL COMPUTER CENTER', 'PRANAY SASMAL', 'pranaysasmal02@gmail.com', '8167554471', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'MDOPS1140J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CVVAT1567R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CVVAT1567R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX76123', 'KHURSHED ALAM', 'KHURSHED ALAM', 'khurshedalam7811@gmail.com', '8133941559', NULL, 'null, null, null, null, null, ASSAM, null', 'ASSAM', NULL, 'CVVAT1567R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AMEPP9781H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AMEPP9781H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX76149', 'AAK ASSOCIATES', 'SAROJ PRASAD', 'aakassoc8s@gmail.com', '7004183209', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'AMEPP9781H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AGNPU1155F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AGNPU1155F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX76421', 'AZHARI E SERVUCE', 'MOHD UNISH', 'yunusazhari088@gmail.com', '8630244778', '243006', 'EJAJ NAGAR GOUTIYA, NEAR MERAJ SHABASHAD, , , BAREILLY, UTTAR PRADESH, 243006', 'UTTAR PRADESH', 'BAREILLY', 'AGNPU1155F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EEGPS0465M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EEGPS0465M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX76481', 'SANTANU SAMANTA', 'SANTANU SAMANTA', 'santanusamanta192@gmail.com', '8293179359', '721602', 'DURGACHAK NEW COLONY, DURGACHAK, , , EAST MIDNAPORE, WEST BENGAL, 721602', 'WEST BENGAL', 'EAST MIDNAPORE', 'EEGPS0465M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CMRPP4836N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CMRPP4836N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX76930', 'TARA MAA ZEROX ONLINE', 'ANUP KUMAR PRAMANIK', 'anuppramanik01@gmail.com', '9143044942', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CMRPP4836N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX78194', 'KISHAN MOBAILE SHOP', 'RAMKISHAN AHIRWAR', 'KISHANRADHAHIRWAR5@GMAIL.COM', '7580812682', NULL, 'null, null, null, null, null, MADHYA PRADESH, null', 'MADHYA PRADESH', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BWOPK1966J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BWOPK1966J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX78250', 'KARAN XEROX', 'KOUSIK KARAN', 'kousikkaran75@gmail.com', '9735708745', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BWOPK1966J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX78365', 'SOURAV BISWAS', 'SOURAV BISWAS', 'BSOURAV595@GMAIL.COM', '7074577802', '743251', 'HARINATHPUR,, ,BEARA, , , 24 PGS NORTH, WEST BENGAL, 743251', 'WEST BENGAL', '24 PGS NORTH', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CEVPB5746R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CEVPB5746R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX78512', 'KRISHNAA TIMBEER AND XEROX', 'CHIRANJIT BHASKAR', 'CHIRANJITKBHASKAR@GMAIL.COM', '7550995541', '743405', 'VILL - KHALITPUR, P.O. - KHALITPUR, , , NORTH 24 PARGANAS, WEST BENGAL, 743405', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'CEVPB5746R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BXGPM4204A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BXGPM4204A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX78639', 'SAI BABA DOT COM', 'ARINDAM MALIK', 'arindam.malik@rediffmail.com', '9082016711', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BXGPM4204A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ANIPH0989G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ANIPH0989G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX78906', 'MA LOXMI TELICOM AND SAYBUR CAF', 'JAYANTA HALDER', 'Jayantahalder428@gmail.com', '7699673315', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'ANIPH0989G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BOIPA2490F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BOIPA2490F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX78910', 'SIDDIK STER', 'MOHAMMED SIDDIK ALI', 'mhammedsiddikali@gmail.com', '7002174396', NULL, 'null, null, null, null, null, ASSAM, null', 'ASSAM', NULL, 'BOIPA2490F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BYWPK5410K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BYWPK5410K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX78934', 'HABIBUL KHAN', 'HABIBUL KHAN', 'habibulkhan1@gmail.com', '8250469239', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BYWPK5410K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EEHPP6567N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EEHPP6567N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX79035', 'DOLPHIN SERVICES', 'RAJA PODDER', 'rajapodder90@gmail.com', '9614890035', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'EEHPP6567N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CDEPB9863R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CDEPB9863R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX79064', 'SHIBNAGAR NATIONAL YOUTH COMPUTER CENTRE', 'ARUP BERA', 'bera20arup19@gmail.com', '9330215297', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CDEPB9863R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'MDNPS1385J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'MDNPS1385J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX79328', 'MAADURGADPS', 'RATIRANJAN SUNDARAYA', 'ratiranjanabul2017@gmail.com', '7809790382', '752056', 'AT-BHATAPADA, PO-BANGIDA, PS-KHORDHA SADAR, DIST-KHORDHA, KHORDHA, ODISHA, 752056', 'ODISHA', 'KHORDHA', 'MDNPS1385J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CRSPC4316G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CRSPC4316G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX79380', 'CHAKRABORTY SYBER KAFE', 'BARUN CHAKRABORTY', 'chakrabarun7@gmail.com', '7029066347', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CRSPC4316G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BWTPS7904K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BWTPS7904K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX79521', 'RAJ INFOTEC', 'RAJ SRIVASTAVA', 'rajjmd2016@gmail.com', '8423563528', NULL, 'null, null, null, null, null, UTTAR PRADESH, null', 'UTTAR PRADESH', NULL, 'BWTPS7904K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FSEPM9552C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FSEPM9552C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX79548', 'MONDAL XEROX CYBER CAFE', 'AKBAR ALI MONDAL', 'akbaralimondal1111@gmail.com', '7479062823', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'FSEPM9552C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BXJPN7361L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BXJPN7361L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX79648', 'NAG ONLINE SERVICE', 'SAMANTA NAG', 'samanthng45@gmail.com', '8895218341', NULL, 'null, null, null, null, null, ODISHA, null', 'ODISHA', NULL, 'BXJPN7361L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ERAPM7417J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ERAPM7417J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX80147', 'MP COMMUNICATION', 'BRIGHT M', 'eimpcom4962@gmail.com', '8138844962', '695026', 'TC 66/204(7), POONTHURA, , , THIRUVANANTHAPURAM, KERALA, 695026', 'KERALA', 'THIRUVANANTHAPURAM', 'ERAPM7417J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DDJPB4561A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DDJPB4561A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX80329', 'AS COMPUTER AND CAFE', 'SANTU BAG', 'bagsantu50@gmail.com', '9679119748', '722141', 'DESHRA KOTULPUR , DESHRA BANKURA, , , BANKURA, WEST BENGAL, 722141', 'WEST BENGAL', 'BANKURA', 'DDJPB4561A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FEAPM0763P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FEAPM0763P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX80479', 'MONDAL CYBER ZONE', 'APURBA CHANDRA MONDAL', 'amazinapur@gmail.com', '9804821367', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'FEAPM0763P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GXGPS5344A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GXGPS5344A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX80712', 'VIKRAM TELECOM', 'VIKRAM SINGH', 'vikramsingh600@gmail.com', '8054436711', NULL, 'null, null, null, null, null, PUNJAB, null', 'PUNJAB', NULL, 'GXGPS5344A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BCZPH9102E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BCZPH9102E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX80935', 'SUJAN ONLINE POINT', 'SUJAN DAS', 'SUJANONLINEPOINT@GMAIL.COM', '8918355619', '743235', 'GHATBAOR , GHATBAOR , BONGAON, NORTH 24 PARGANAS, WEST BENGAL , 743235, NORTH 24 PARGANAS, WEST BENGAL, 743235', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'BCZPH9102E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GHIPS9469C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GHIPS9469C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX81290', 'SARKAR ENTERPRISE', 'ASIT SARKAR', 'sarkarasit7063@gmail.com', '9733158422', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'GHIPS9469C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CGCPP0678K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CGCPP0678K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX81420', 'RATANJOY PURTY', 'RATANJOY PURTY', 'ratanjoypurty@gmail.com', '9040861029', NULL, 'null, null, null, null, null, ODISHA, null', 'ODISHA', NULL, 'CGCPP0678K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GOFPM0007A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GOFPM0007A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX81576', 'BIMALA BHANDAR', 'BAPAN MONDAL', 'tanusreemondal882@gmail.com', '7001880048', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'GOFPM0007A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX81607', 'BALAJI ENTERPRISES', 'BALRAM RATHOD', 'balramrathod143@gmail.com', '9754098888', NULL, 'null, null, null, null, null, MADHYA PRADESH, null', 'MADHYA PRADESH', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BVXPK1800P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BVXPK1800P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX81649', 'PANCHAVADI', 'BINUKUMAR K', 'panchavadistudiokdl@gmail.com', '9946729212', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'BVXPK1800P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BFZPS9442D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BFZPS9442D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX81729', 'AYUSH STORES', 'KARTIK SINHA', 'kartiklic12206@gmail.com', '9775128830', '743347', 'BHUBANNAGAR, BHUBANNAGAR, , , SOUTH 24 PARGANAS, WEST BENGAL, 743347', 'WEST BENGAL', 'SOUTH 24 PARGANAS', 'BFZPS9442D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX82417', 'SHREE BAGESHWAR BALA JI COMPUTER', 'ABHISHEK DIKSHIT', 'ABHISHEKDIKSHIT93@GMAIL.COM', '7389528620', NULL, 'null, null, null, null, null, MADHYA PRADESH, null', 'MADHYA PRADESH', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ESHPS4126L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ESHPS4126L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX82456', 'NITISH KANTI SARKAR', 'NITISH KANTI SARKAR', 'nitishsarkaricfai@gmail.com', '9733212352', '743232', 'BEARA, BAGDHA, NORTH 24 PARGANS, , NORTH 24 PARGANAS, WEST BENGAL, 743232', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'ESHPS4126L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'INFPS7036N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'INFPS7036N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX83120', 'ABHIJIT SAHA', 'ABHIJIT SAHA', 'sahasangita680@gmail.com', '9932591654', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'INFPS7036N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DOFPM3158P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DOFPM3158P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX83165', 'FARHAN ENTERPRISE', 'MUSTAK SEKH', 'SKMUSTAK737@GMAIL.COM', '7407345707', '721631', 'CHHAYGHARI . DAUDPUR, CHHAYGHARI .DAUDPUR, , , WEST MEDINIPUR, WEST BENGAL, 721631', 'WEST BENGAL', 'WEST MEDINIPUR', 'DOFPM3158P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BAWPB1617F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BAWPB1617F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX83425', 'EI JANA SEVANA KENDRAM', 'BHIJU K', 'bhijuk@gmail.com', '9446104502', '678555', 'SHAJU NIVAS , ALAMPADY, KOZHINJAMPARA, PALAKKAD, PALAKKAD, KERALA, 678555', 'KERALA', 'PALAKKAD', 'BAWPB1617F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GTOPS4325H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GTOPS4325H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX83465', 'NIKITA ONLINE TELECOME STORE', 'NITAYANAND SARKAR', 'nikitasarkar681@gmail.com', '8158041790', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'GTOPS4325H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DMPPM5649D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DMPPM5649D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX83607', 'UTPAL CYBER CAFE', 'UTPAL MUNDARI', 'utpalmundari466@gmail.com', '7584078899', '741502', 'PAKHIURA, KUMARI RAMNAGAR, HANSKHALI, NADIA, NADIA, WEST BENGAL, 741502', 'WEST BENGAL', 'NADIA', 'DMPPM5649D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CPPPC2370K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CPPPC2370K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX83947', 'DEHATI TATHYA MITRA KENDRA', 'PARBATI CHAKRABORTY', '1997parbatideb@gmail.com', '8317856583', '721139', 'DEHATI, DEHATI, PANSKURA, PURBA MEDINIPUR, EAST MEDINIPORE, WEST BENGAL, 721139', 'WEST BENGAL', 'EAST MEDINIPORE', 'CPPPC2370K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX84013', 'BISWA FOUNDATION', 'BISWAJIT SARKAR', 'biswajitsarkar.bs17@gmail.com', '9862662532', NULL, 'null, null, null, null, null, TRIPURA, null', 'TRIPURA', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX84103', 'SANJIT DAS', '9749167112', 'digitalsevaajit@GMAIL.COM', '7384887588', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CJLPK4475P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CJLPK4475P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX84321', 'BADA BOOKING POINT', 'RAVI KUMAR', 'faxoxy@gmail.com', '9472633563', '801108', 'MANER, MANER,, MANER, MANER, , , PATNA, BIHAR, 801108', 'BIHAR', 'PATNA', 'CJLPK4475P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BHPPD8663K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BHPPD8663K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX84537', 'BIPLAB KUMAR DHALI', 'BIDUR', 'monusonas19@gmail.com', '9046712006', '743270', 'OLD HELENCHA, HELENCHA COLONY, BAGDAH, NIRTH TWENTY FOUR PARGONA, NORTH 24 PARGANAS, WEST BENGAL, 743270', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'BHPPD8663K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FDKPP6656P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FDKPP6656P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX84597', 'SOMANATH PADHI', 'SOMANATH PADHI', 'somanathpadhi422@gmail.com', '9556573938', '751019', 'PATRAPADA, PATRAPADA, , , KHORDA, ODISHA, 751019', 'ODISHA', 'KHORDA', 'FDKPP6656P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ASIPC3350M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ASIPC3350M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX84637', 'JAYGURU PRINTERS', 'SHYAMSUNDAR CHAKRABORTY', 'shyamsundarchakraborty635@gmail.com', '9933361869', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'ASIPC3350M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GFNPD5090H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GFNPD5090H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX84792', 'SUVACCHA ONLINE SERVICE CENTER', 'BABLU DOLAI', 'babludolai0@gmail.com', '8158956901', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'GFNPD5090H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'JESPV9647J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'JESPV9647J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX85019', 'BAIDYA COMMUNICATION', 'TARIKUL ISLAM BAIDYA', 'tarikulislambaidya2550@gmail.com', '9064402458', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'JESPV9647J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DPDPA7672R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DPDPA7672R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX85071', 'SM TELECOM', 'MD MAINUDDIN ANSARI', 'mainuddnansari999s@gmail.com', '9734945050', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DPDPA7672R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'JBIPS7794K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'JBIPS7794K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX85172', 'ZETLI GRAPHICS SOLUTION', 'TAKHELLAMBAM ZETLI SINGH', 'xetli31@gmail.com', '8787585567', NULL, 'null, null, null, null, null, MANIPUR, null', 'MANIPUR', NULL, 'JBIPS7794K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AGUPN8054B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AGUPN8054B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX85246', 'JAI MATA DI MOBILE SHOP', 'SATYANAM', 'Satyanamlohi1977@gmail.com', '9838685441', NULL, 'null, null, null, null, null, UTTAR PRADESH, null', 'UTTAR PRADESH', NULL, 'AGUPN8054B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BQOPA1304A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BQOPA1304A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX85302', 'FIROZ ALAM', 'FIROZ ALAM', 'alamf6558@gmail.com', '9593804280', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BQOPA1304A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX85306', 'RAMESHWAR LODHI', 'RAJPOOTJICOMPUTERS', 'RAMESHWARLODHI2020@GMAIL.COM', '9669273543', NULL, 'null, null, null, null, null, MADHYA PRADESH, null', 'MADHYA PRADESH', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'KUOPK7806J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'KUOPK7806J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX85423', 'SAMAD', 'MD ABU SAMAD SK', 'samad.web1998@gmail.com', '9474994602', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'KUOPK7806J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AOLPD8680E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AOLPD8680E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX85697', 'TEJA ENTERPRISES', 'DAVID KUMAR M R', 'mrdavidkumar@gmail.com', '9449180520', '573212', 'MARKULI VILLAGE, MARKULI POST, SHANTHIGRAMA HOBLI, HASSAN, HASSAN, KARNATAKA, 573212', 'KARNATAKA', 'HASSAN', 'AOLPD8680E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AKDPI4872R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AKDPI4872R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX85723', 'SAHIDUL NET AND XEROX', 'SAHIDUL ISLAM', 'mohensk2454@gmail.com', '7076041002', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'AKDPI4872R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX85769', 'VISHWAKARMA COMPUTER', 'RAMESHWAR VISHWAKARMA', 'RAMESHWARVISHWAKARMAFUTER@GMAIL.COM', '7999769293', NULL, 'null, null, null, null, null, MADHYA PRADESH, null', 'MADHYA PRADESH', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BTXPB1256N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BTXPB1256N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX86214', 'ARCHANAENTERPRISE', 'ARUN BHUNIA', 'archanaenterprise2010@gmail.com', '7003672840', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BTXPB1256N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EEBPA9297E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EEBPA9297E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX86341', 'MD ASADULLAH', 'MD ASADULLAH', 'MDASADULLAH7384@GMAIL.COM', '7384750919', '742151', 'VILL-RAJANAGAR, P.O-LASKARPUR, P.S-LALGOLA, DIST-MURSHIDABAD, MURSHIDABAD, WEST BENGAL, 742151', 'WEST BENGAL', 'MURSHIDABAD', 'EEBPA9297E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CFAPG6581F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CFAPG6581F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX86375', 'UNIQUE NET POINT', 'KAMAL HOSSAIN GAZI', 'uniquenetpoint5@gmail.com', '9064965596', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CFAPG6581F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BJYPT3988G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BJYPT3988G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX86394', 'SHREYASI TELECOM', 'CHHATTU TARAFDER', 'chhattutarafder007@gmail.com', '9679261977', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BJYPT3988G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FDWPM8680J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FDWPM8680J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX86439', 'NILADRI NET POINT', 'NILADRI MONDAL', 'niladrimondal2018@gmail.com', '6296054882', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'FDWPM8680J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX86510', 'SANJU COMPUTER', 'SANJIT DEBNATH', 'dsanjit112@gmail.com', '9612551896', NULL, 'null, null, null, null, null, TRIPURA, null', 'TRIPURA', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BOWPM1520E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BOWPM1520E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX86537', 'FIO E CENTRE', 'MELSIAN', 'fioecentre@gmail.com', '9842124004', '627852', '71/1, MAIN ROAD, AGARAKATTU, AYIKUDI, TENKASI, TAMIL NADU, 627852', 'TAMIL NADU', 'TENKASI', 'BOWPM1520E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ELCPD2342K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ELCPD2342K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX86542', 'DAS CAFE', 'NEPAL DAS', 'dasanupam933@gmail.com', '9679729843', '743383', 'MAIPITH, BAIKUNTHAPUR, HIGHROAD KEORATALA BAZER, BAIKUNTHAPUR, SOUTH 24 PARGANAS, WEST BENGAL, 743383', 'WEST BENGAL', 'SOUTH 24 PARGANAS', 'ELCPD2342K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BRGPG6168P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BRGPG6168P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX86974', 'SUBHENDU LINK POINT', 'SUBHENDU GHORAI', 'subhendulinkpoint07@gmail.com', '9093028256', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BRGPG6168P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'JQOPS6308L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'JQOPS6308L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX87105', 'APLUS DIGITAL SERVICE CENTER', 'ALOK KUMAR SWAIN', 'SWAINALOK1995@GMAIL.COM', '9348513353', NULL, 'null, null, null, null, null, ODISHA, null', 'ODISHA', NULL, 'JQOPS6308L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ANCPY7915R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ANCPY7915R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX43721', 'SHIVAAY DIGITAL SEVA', 'AJEET YADAV', 'smartshiva177@gmail.com', '9142214617', NULL, 'null, null, null, null, null, JHARKHAND, null', 'JHARKHAND', NULL, 'ANCPY7915R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BYUPP8532M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BYUPP8532M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX43765', 'ISHA COMMUNICATION', 'DIPTI DIGANTA PRADHAN', 'diptidiganta@gmail.com', '7978378116', '751019', 'PLOT NO -737/2084, LANE-II, , , KHORDHA, ODISHA, 751019', 'ODISHA', 'KHORDHA', 'BYUPP8532M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GJIPM6550E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GJIPM6550E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX43780', 'SARIFUL ISLAM', 'SARIFUL ISLAM', 'ISARIFUL961@GMAIL.COM', '8851977830', '743401', 'BADURIA, BADURIA, , , NORTH 24 PARGANAS, WEST BENGAL, 743401', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'GJIPM6550E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ALOPP3672J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ALOPP3672J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX43962', 'SONALI CYBER CAFE', 'SABITRA KUMAR PRADHAN', 'sabitrakumar@gmail.com', '9778567755', '751002', 'SISUPALGARH, BHUBANESWAR, , , KHORDHA, ODISHA, 751002', 'ODISHA', 'KHORDHA', 'ALOPP3672J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'HJWPK0695B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'HJWPK0695B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX43967', 'PRABHAT JNP DIGITAL POINT', 'SUBRAT KUMBHAKAR', 'apjhelping@gmail.com', '8260957664', NULL, 'null, null, null, null, null, ODISHA, null', 'ODISHA', NULL, 'HJWPK0695B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ELWPM0977B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ELWPM0977B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX45083', 'BISWAKARMA ONLINE XEROX CENTER', 'TAPAN MODAK', 'tmodak852@gmail.com', '8240825231', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'ELWPM0977B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BDWPJ1937R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BDWPJ1937R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX45206', 'VED SOUND SYSTEM', 'VED PRAKAS JAISWAL', 'VEDDJMIX@GMAIL.COM', '8005477095', '231218', 'COALGATE , RENUSAGAR , NEAR HITACHI ATM , , SONBHADRA, UTTAR PRADESH, 231218', 'UTTAR PRADESH', 'SONBHADRA', 'BDWPJ1937R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BLWPG0972K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BLWPG0972K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX45281', 'JG ONLINE PARISEVA', 'SUVEDU GUCHHAIT', 'suvendu45guchhait@gmail.com', '8515822875', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BLWPG0972K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BVTPM9535M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BVTPM9535M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX45691', 'MONDAL TELECOM', 'KASHEM MONDAL', 'KASHEM.MONDAL83@GMAIL.COM', '9007138254', '712407', 'BANDIPUR, BANDIPUR, BANDIPUR, , HOOGHLY, WEST BENGAL, 712407', 'WEST BENGAL', 'HOOGHLY', 'BVTPM9535M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'LPDPK2935P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'LPDPK2935P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX45693', 'ANKIT FINANCE', 'ANKIT KUMAR', 'Ak9587841@gmail.com', '7678331015', NULL, 'null, null, null, null, null, BIHAR, null', 'BIHAR', NULL, 'LPDPK2935P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AILPU3948C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AILPU3948C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX45763', 'SMART LINK', 'LAIJU U', 'eismartlink82@gmail.com', '7769465728', '691535', 'ENTHALIL VEEDU, ENTHALIL VEEDU, , , KOLLAM, KERALA, 691535', 'KERALA', 'KOLLAM', 'AILPU3948C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'OTMPS7396G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'OTMPS7396G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX45837', 'RADHEY MOBILE STORE', 'PROSHANTA SHARMA', 'PROSHANTASHARMA781@GMAIL.COM', '8436807243', '733202', 'VILL-BIJBARI, P.O-DULALIBHITA, , , NORTH DINAJPUR, WEST BENGAL, 733202', 'WEST BENGAL', 'NORTH DINAJPUR', 'OTMPS7396G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX45913', 'ANNEX DATA SERVICE', 'ANIMA SANA', 'sanaanima656@gmail.com', '7551803433', '743235', 'BONGAON, BONGAON, , , NORTH 24 PARGANAS, WEST BENGAL, 743235', 'WEST BENGAL', 'NORTH 24 PARGANAS', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ADIPT3623M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ADIPT3623M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX45980', 'HUMAN COMMUNICATION', 'BISWAJIT TARAFDER', 'BISWAJIT7453@GMAIL.COM', '9153097453', '741248', 'CHANDURIA NORTH EAST, CHANDURIA, , , NADIA, WEST BENGAL, 741248', 'WEST BENGAL', 'NADIA', 'ADIPT3623M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BZIPG4689M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BZIPG4689M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX46015', 'APARUPA STUDIO', 'RANAJIT GHANTI', 'aparupastudio09@gmail.com', '7001970553', '743349', 'NANDAKUMARPUR, NANDAKUMARPUR, , , SOUTH 24 PARGANAS, WEST BENGAL, 743349', 'WEST BENGAL', 'SOUTH 24 PARGANAS', 'BZIPG4689M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ABSPF9670J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ABSPF9670J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX46073', 'HARISONS', 'FEMINA HARIS', 'feminakuttu@gmail.com', '7034019520', '679329', 'FEMINA HARIS, METHALAYIL HOUSE, NILAMBUR, MALAPPURAM, MALAPPURAM, KERALA, 679329', 'KERALA', 'MALAPPURAM', 'ABSPF9670J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CHEPA5121B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CHEPA5121B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX46087', 'SOHELI TELECOM', 'MASUM AKTAR', 'masum.akhter1990@gmail.com', '8159007917', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CHEPA5121B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ATDPT6596L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ATDPT6596L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX46150', 'KARTHIK', 'THANKA M', 'thankamabl2022@gmail.com', '9656485895', '673593', 'KARTHIK EI SOLUTIONS, AMBALAVAYAL, , , WAYANAD, KERALA, 673593', 'KERALA', 'WAYANAD', 'ATDPT6596L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'KSKPK4750H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'KSKPK4750H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX46239', 'BULBUL COMPUER XEROX', 'ASRAFUL ISLAM', 'islam.asraful87@gmail.com', '9732921470', '742302', 'JAMANPUR, PAMAIPUR, ISLAMPUR, , MURSHIDABAD, WEST BENGAL, 742302', 'WEST BENGAL', 'MURSHIDABAD', 'KSKPK4750H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CVUPB4621B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CVUPB4621B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX46305', 'SATISH TELECOM', 'SHANTI BISWAS', 'samirbiswas48@gmail.com', '9800056522', '741223', 'SUTRA, GOURIPUR, CHAKDAHA, NADIA, NAIDA, WEST BENGAL, 741223', 'WEST BENGAL', 'NAIDA', 'CVUPB4621B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ENHPB1598C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ENHPB1598C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX46321', 'BARMAN ONLINE SHOP', 'APURBO BARMAN', 'apurbobarman720@gmail.com', '8597496750', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'ENHPB1598C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CPBPS9704K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CPBPS9704K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX46518', 'MA TARA CENTER', 'AKHIL SAHA', 'sahaakhil2020@gmail.com', '9714084310', '741222', 'BEJPARA, CHAKDAHA, DIGHRA, , NADIA, WEST BENGAL, 741222', 'WEST BENGAL', 'NADIA', 'CPBPS9704K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'KKQPS9455F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'KKQPS9455F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX46578', 'ON TIME TECH EI JANASEVANA', 'SUBEESH BALAKRISHNAN', 'itssubi@gmail.com', '7306603872', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'KKQPS9455F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GCLPP0742M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GCLPP0742M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX46857', 'ONLINE SOLVE', 'SUBHANKAR PODDER', 'subhankarpodder.31@gmail.com', '8617319075', '743235', 'JOYPUR MATHPARA, BONGAON, KOLKATA, WEST BENGAL, 24 PGS NORTH, WEST BENGAL, 743235', 'WEST BENGAL', '24 PGS NORTH', 'GCLPP0742M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GSIPD5648M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GSIPD5648M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX47013', 'EAZYZONE', 'JOY DAS', 'djoy15971@gmail.com', '7908075155', '743263', 'MANIKNAGAR, ASHOKENAGAR, , , 24 PGS NORTH, WEST BENGAL, 743263', 'WEST BENGAL', '24 PGS NORTH', 'GSIPD5648M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EEHPB9254J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EEHPB9254J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX47025', 'BIPUL TELECOM', 'BIPUL BHUIMALI', 'bipulbhuimali76@gmail.com', '8768782195', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'EEHPB9254J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CNHPS9415D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CNHPS9415D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX47196', 'DIGITAL COMPUTER', 'SWAPAN KUMAR SAMANTA', 'sujankumar10220@gmail.com', '7003241179', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CNHPS9415D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DTYPS6665H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DTYPS6665H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX47290', 'BRIGHT COMMERCIAL INSTITUTE', 'SHEELA K.R', 'sheelakr018@gmail.com', '9961497866', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'DTYPS6665H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'OUWPS5749Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'OUWPS5749Q' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX47326', 'COPYCAT', 'SANJULAL M S', 'COPYCATMTDY@GMAIL.COM', '8943007433', '670645', 'MISBAH COMPLEX, CALICUT ROAD, MANANTHAVADY, , WAYANAD, KERALA, 670645', 'KERALA', 'WAYANAD', 'OUWPS5749Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GTSPK9861G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GTSPK9861G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX47368', 'ANAYA ONLINE STORE', 'RUPALI KHATUN', 'rupalikhatun8906@gmail.com', '8016937421', '736167', 'VILL BALAPUKHARI, CHAMTA, SITAI, COOCH BEHAR, COOCH BEHAR, WEST BENGAL, 736167', 'WEST BENGAL', 'COOCH BEHAR', 'GTSPK9861G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX47531', 'ROSHI ONLINE CENTER', 'SUNIL KUMAR LODHI', 'RAJPOOTSUNIL2003@GMAIL.COM', '7869909687', NULL, 'null, null, null, null, null, MADHYA PRADESH, null', 'MADHYA PRADESH', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BVWPK5025R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BVWPK5025R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX47561', 'AFGAN ENTERPRISE', 'ALAUDDIN ALI KHAN', 'alauddinkhan51510@gmail.com', '9734794778', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BVWPK5025R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EJUPD5614N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EJUPD5614N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX47598', 'CYBER HELP', 'ARINDAM DAS', 'arindamdsaat@gmail.com', '8536870739', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'EJUPD5614N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GILPS8651A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GILPS8651A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX48176', 'SARDAR DIGITAL', 'NAZMA SARDAR', 'nazmasardar90@gmail.com', '9734396001', '743273', 'NITYANANDAKATI, NITYANANDAKATI, , , NORTH 24 PARGANAS, WEST BENGAL, 743273', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'GILPS8651A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DCHPS0053M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DCHPS0053M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX48197', 'MOUSUMI ENTERPRISE', 'GOUTAM SARKAR', 'mousumienterprise@ymail.com', '9064778194', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DCHPS0053M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CKQPJ4576C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CKQPJ4576C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX49052', 'JIBUS JANSAEVANAKENDRAM', 'JIBU T JOSEPH', 'jibutjoseph@gmail.com', '9961633462', '689105', 'THUNDIYIL HOUSE, MANJADI, THIRUVALLA, , PATHANAMTHITTA, KERALA, 689105', 'KERALA', 'PATHANAMTHITTA', 'CKQPJ4576C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AZZPV9651N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AZZPV9651N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX49075', 'CELEBRANCE CONSULTING', 'GINCY VARGHESE', 'celebrance17@gmail.com', '9048954094', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'AZZPV9651N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'MVNPK4500R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'MVNPK4500R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX49573', 'JANASEVANA KENDRAM', 'SUDHEER', 'ashinvilla@gmail.com', '9539914346', '691536', 'ASHIN VILLA,, VELUMTHARA, CHARIPPARAMPU PO, KADAKKAL, KOLLAM, KERALA, 691536', 'KERALA', 'KOLLAM', 'MVNPK4500R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FXIPB7544G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FXIPB7544G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX49807', 'BOSE ONLINE SERVICE POINT', 'VIBEKANANDA BOSE', 'rbose1796@gmail.com', '9609789761', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'FXIPB7544G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DYDPB6710G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DYDPB6710G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX49810', 'RAHIDUL MONDAL', 'RUNA LAILA BIBI', 'rahidulmondal857@gmail.com', '8670458071', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DYDPB6710G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CLSPS6774G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CLSPS6774G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX49812', 'JANASEVANA KENDRAM', 'SIJINA T J', 'SIJINAJAISON@GMAIL.COM', '9048935349', '680601', 'KALAPPURAKKAL, VELUR CHUNGAM, , , THRISSUR, KERALA, 680601', 'KERALA', 'THRISSUR', 'CLSPS6774G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BISPV7339A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BISPV7339A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX49860', 'EI SOLUTIONS', 'VIJINA A', 'kumarsuresh81@gmail.com', '9074522692', '671315', 'PUTHIYAKOTTA, KANHANGAD, , , KASARGOD, KERALA, 671315', 'KERALA', 'KASARGOD', 'BISPV7339A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DLYPM9440P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DLYPM9440P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX50148', 'IMRAN CYBER CAFE', 'BABUSONA MOLLA', 'babusonakhan2017@gmail.com', '8240214143', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DLYPM9440P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DNKPR0764N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DNKPR0764N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX50341', 'CROSS MOUNTAIN INTERNATIONAL', 'VIJAYARAJI KR', 'krvijayaraji@gmail.com', '9744698405', '671315', 'NO.XIV/127, MALL OF INDIA, 2ND FLOOR, KANHANGAD, , KASARGOD, KERALA, 671315', 'KERALA', 'KASARGOD', 'DNKPR0764N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BCSPH4016C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BCSPH4016C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX50617', 'RIK DIGITAL', 'KARTIK HALDER', 'kartikhalder1997@gmail.com', '9091540455', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BCSPH4016C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DVSPM5855B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DVSPM5855B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX50692', 'SURAJIT MANDAL', 'MANDAL TELECOM', 'ratnaaratidigitalstudio@gmail.com', '9382751805', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DVSPM5855B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BFBPA2232K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BFBPA2232K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX51347', 'PAYBR RECHARGE SOLUTION', 'BARKAT ALI', 'BARKATALI8372@GMAIL.COM', '8918580942', '732201', 'KALIACHAK, CHARIANAN, KALIACHAK, CHARIANANTAPUR, , MALDA, MALDA, WAYANAD, KERALA, 732201', 'KERALA', 'WAYANAD', 'BFBPA2232K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DVHPB8505C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DVHPB8505C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX51398', 'DIKSHA ONLINE', 'SHYAM SUNDER BISWAS', 'rajbiswas8250@gmail.com', '7797616071', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DVHPB8505C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GHBPM4551A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GHBPM4551A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX51623', 'MURMU MOBILE SHOP', 'ABINASH MURMU', 'murmuabinash1234@gmail.com', '7319450317', '732124', 'CHAKAIIL ,KATIKANDAR, CHAKAIL,KATIKANDAR , , , MALDA, WEST BENGAL, 732124', 'WEST BENGAL', 'MALDA', 'GHBPM4551A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EEPPP7980K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EEPPP7980K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX51834', 'MAWLANA TELICOM', 'IBRAHIM PIYADA', 'ibrahimpiyada2@gmail.com', '8513966782', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'EEPPP7980K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CNXPC0032J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CNXPC0032J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX52013', 'AKUL JANASEVANA', 'VIDHYAMOL C M', 'vidhyapkons@gmail.com', '9400140460', '691012', 'KUMARI MANDHIRAM, EDAKKATTU NAGAR 91, THIRUMULLAVARAM PO, , KOLLAM, KERALA, 691012', 'KERALA', 'KOLLAM', 'CNXPC0032J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DEJII7428R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DEJII7428R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX52479', 'ONLINE', 'UMESH', 'umesh.prasad635@gmail.com', '7011123611', NULL, 'null, null, null, null, null, DELHI, null', 'DELHI', NULL, 'DEJII7428R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DSCPM6481C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DSCPM6481C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX52806', 'SAMIN 786 786', 'SAMIN MANDAL', 'saminmondal19@gmail.com', '9609183875', '743251', 'BHARATPUR, BHARATPUR, BONGAON, NORTH 24 PARGANAS, NORTH 24 PARGANAS, WEST BENGAL, 743251', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'DSCPM6481C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'OBQPS3987H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'OBQPS3987H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX52906', 'BISHMA SUKHAM', 'BISHMA SUKHAM', 'BISHMASUKHAM@GMAIL.COM', '7085079931', '795001', 'SINGJAMEI, SINGJAMEI MAYENGBAM LEIKAI, OPP NRL OIL PUMP, , EAST MEDINIPUR, WEST BENGAL, 795001', 'WEST BENGAL', 'EAST MEDINIPUR', 'OBQPS3987H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'SANNI1234K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'SANNI1234K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX53029', 'SANNIK PRAMANIK', 'SANNIK PRAMANIK', 'sannikpramanik1234@gmail.com', '7029524420', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'SANNI1234K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DPLPR0866C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DPLPR0866C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX53427', 'JANASEVANAKENDRAM PADAM', 'RAJESH K', 'rajeshkaruppaswamy555@gmail.com', '9074617774', '689694', 'MANGALATHU VEEDU, PADAM PO, KALANJOOR, PATHANAMTHITTA, PATHANAMTHITTA, KERALA, 689694', 'KERALA', 'PATHANAMTHITTA', 'DPLPR0866C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ANTPH3241A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ANTPH3241A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX53480', 'SAYAN ONLINE SERVICE', 'JAIBUL HOQUE', 'jiyabulhoque05@gmail.com', '7872591318', '733129', 'JINGAON, RAGHUNATHPUR, KALIYAGANJ, 733129, UTTAR DINAJPUR, WEST BENGAL, 733129', 'WEST BENGAL', 'UTTAR DINAJPUR', 'ANTPH3241A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DHGPG0429H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DHGPG0429H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX53618', 'GAZI TELECOM', 'DELOWER HASAN GAZI', 'god38709@gmail.com', '8116206349', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DHGPG0429H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DVMPS1208E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DVMPS1208E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX53761', 'RUBAIT DIGITAL ONLINE', 'AMZAD HOSSAIN SARDAR', 'ahsardar3192@gmail.com', '9734613192', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DVMPS1208E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'NPKPS1349J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'NPKPS1349J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX53786', 'SMR ENTERPRISES', 'SANDAPURAM YELLAMMA', 'smrenterprises237@gmail.com', '9391114619', NULL, 'null, null, null, null, null, TELANGANA, null', 'TELANGANA', NULL, 'NPKPS1349J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FZUPS3211M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FZUPS3211M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX54023', 'INSURENCE POINT', 'PRASHANT KUMAR SINGH', 'Prashantbjpsingh@gmail.com', '8932060004', NULL, 'null, null, null, null, null, UTTAR PRADESH, null', 'UTTAR PRADESH', NULL, 'FZUPS3211M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX54127', 'SUJIT SARKAR', 'SUJIT SARKAR', 'sujitsarkar.ss151@gmail.com', '8415068015', NULL, 'null, null, null, null, null, TRIPURA, null', 'TRIPURA', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CNKPG7630M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CNKPG7630M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX54386', 'TARSHID ONLINE HOME', 'RANJU GAZI', 'ranjukhatungazi91@gmail.com', '8967327462', '743273', 'BALTI, SWARUPNAGAR, BALTI, SWARUPNAGAR, NORTH 24 PARGANAS, WEST BENGAL, 743273', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'CNKPG7630M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GMCPS6778H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GMCPS6778H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX54790', 'S TELECOM', 'NAZMUL HAQUE SHEIKH', 'sahabsk1234@gmail.com', '7602530358', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'GMCPS6778H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BNDPA5258B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BNDPA5258B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX56310', 'DAILY INTERNET', 'IMJAD ALI', 'imjadali95@gmail.com', '9933998462', '742225', 'SUJAPUR, RAGHUNATHGANJ,MURSHIDABAD, , , MURSHIDABAD, WEST BENGAL, 742225', 'WEST BENGAL', 'MURSHIDABAD', 'BNDPA5258B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BHVPC4293C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BHVPC4293C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX56320', 'NAGARUKHRA ICC TECHNLOGY', 'BIPUL CHAKRABORTY', 'icctnagarukhra@gmail.com', '9681121761', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BHVPC4293C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EFYPS9059J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EFYPS9059J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX56382', 'SIJI', 'SIJI', 'SIJIKLM089@GMAIL.COM', '9567444384', '691001', 'KADAPPAKKADA, KADAPPAKKADA, , , KOLLAM, KERALA, 691001', 'KERALA', 'KOLLAM', 'EFYPS9059J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'HSMPS9944A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'HSMPS9944A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX56391', 'WEB WORLD', 'POOJA SAJEEV', 'webworld0803@gmail.com', '9495088961', '691305', 'WEBWORLD0803, TB JUNCTION PUNALUR, , , KOLLAM, KERALA, 691305', 'KERALA', 'KOLLAM', 'HSMPS9944A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EUKPS7335L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EUKPS7335L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX56708', 'SAU XROX AND STUDIO', 'PRANAB SAU', 'pranabsau@gmail.com', '9547266670', '721641', 'SAHAPUR, SAHAPUR, DASPUR, PASCHIM MEDINIPUR, WEST MIDNAPORE, WEST BENGAL, 721641', 'WEST BENGAL', 'WEST MIDNAPORE', 'EUKPS7335L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ATDPL3079J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ATDPL3079J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX56729', 'LAISHRAM VARIETY STORE', 'VISHAL LAISHRAM', 'VLKHUMANCHA@GMAIL.COM', '7005603903', '795149', 'YAIRIPOK TULIHAL, LAISHRAM LEIKAI, , , IMPHAL EAST, MANIPUR, 795149', 'MANIPUR', 'IMPHAL EAST', 'ATDPL3079J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX56740', 'ASHISH KUMAR AHIRWAR', 'WARD 03 MANPASAR CHANDPURA KHARGAPUR', 'ASHISHAHIRWAR362@GMAIL.COM', '6260367898', NULL, 'null, null, null, null, null, MAHARASHTRA, null', 'MAHARASHTRA', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FMDPK4544M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FMDPK4544M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX56748', 'FRIENDSHIP COMMUNICATION', 'DEEPAK KUMAR', 'cscainkhanbhimanichak@gmail.com', '9608787006', NULL, 'null, null, null, null, null, BIHAR, null', 'BIHAR', NULL, 'FMDPK4544M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'HJYPK2940H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'HJYPK2940H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX56847', 'ARADHYA SHOP', 'TARANAGAR', 'indrajit.indra88@gmail.com', '9064073363', '743378', 'TARANAGAR, TARANAGAR, TARANAGAR, , SOUTH 24 PARGANAS, WEST BENGAL, 743378', 'WEST BENGAL', 'SOUTH 24 PARGANAS', 'HJYPK2940H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AJCPS4997B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AJCPS4997B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX57019', 'ROYAL ACADEMY', 'SHAKKEELA S', 'royal4639022@gmail.com', '9400998355', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'AJCPS4997B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'IKWPS2482E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'IKWPS2482E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX57038', 'RADHE RADHE JAN SEWA KENDRA RAIPURA JAT', 'JITENDRA SINGH', 'radhe97584747@gmail.com', '9758474707', '281122', 'RAIPURA JAT, RAIPURA JAT, FARAH, MATHURA, MATHURA, UTTAR PRADESH, 281122', 'UTTAR PRADESH', 'MATHURA', 'IKWPS2482E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CGPPM0843L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CGPPM0843L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX57048', 'ADRIJA TELECOM', 'SAJAL MISHRA', 'banash.sajal90@gmail.com', '9732589424', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CGPPM0843L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'SEBGA9073T' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'SEBGA9073T' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX57290', 'SEBGA ONLINE', 'SEBGATULLA MOLLA', 'ukufashion01@gmail.com', '8373211516', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'SEBGA9073T', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AORPH4097K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AORPH4097K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX57308', 'MAHENDRASING SHOP', 'MAHENDRASING HAJERI', 'mahendrasinghajeri565@gmail.com', '6362136831', NULL, 'null, null, null, null, null, KARNATAKA, null', 'KARNATAKA', NULL, 'AORPH4097K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ASYPR3847C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ASYPR3847C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX57320', 'NUR ONLINE CENTER', 'SHAHIBAR RAHMAN', 'shahibar2915@gmail.com', '8638047698', NULL, 'null, null, null, null, null, ASSAM, null', 'ASSAM', NULL, 'ASYPR3847C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GCGPS6027F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GCGPS6027F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX57860', 'SARDAR PAN CENTRE', 'JAMSED SARDAR', 'jamsed2sardar@gmail.com', '7699709988', '743273', 'MAJHER PARA , NITYANANDAKATI , SWARUPNAGAR , BASIRHAT , 24 PARGANAS (S), WEST BENGAL, 743273', 'WEST BENGAL', '24 PARGANAS (S)', 'GCGPS6027F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DQAPA2046D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DQAPA2046D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX57926', 'SS MULTY PAY', 'JUBAIR ALAM', 'jubairalam88@gmail.com', '9939868933', '824120', 'AMJHAR SHARIF, HASPURA, AURANGABAD, HASPURA, AURANGABAD(BH), BIHAR, 824120', 'BIHAR', 'AURANGABAD(BH)', 'DQAPA2046D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DZCPA2022N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DZCPA2022N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX58240', 'ANISH ONLINE SERVICE', 'ANISH AHAMED', 'aali801730@gmail.com', '9832591256', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DZCPA2022N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CGVPD2704D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CGVPD2704D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX58431', 'SAHEB DAS', 'SOUTH TWENTY FOUR PARGANAS', 'sahebdas2509@gmail.com', '8927331441', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CGVPD2704D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ANYPR6275P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ANYPR6275P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX58437', 'DURJOY ONLINE CENTER', 'DURJOY SHEKHAR ROY', 'durjoy.sroy@gmail.com', '9804931431', '733124', 'GANGARAMPUR BUS STAN, GANGARAMPUR, , , DAKSHIN DINAJPUR, WEST BENGAL, 733124', 'WEST BENGAL', 'DAKSHIN DINAJPUR', 'ANYPR6275P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'KKMPS6573Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'KKMPS6573Q' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX58901', 'RINA MOBILE SHOPS', 'YUDHISTHIR SARKAR', 'yudhisthirsarkar@gmail.com', '8371082492', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'KKMPS6573Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BGWPM0116Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BGWPM0116Q' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX58934', 'MITRA ONLINE SHOP', 'BAPPA MITRA', 'mitrabappa780@gmail.com', '9153089491', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BGWPM0116Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CDLPR7178C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CDLPR7178C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX59012', 'AXISPAY', 'CHANDAN ROY', 'chandanroy20051992@gmail.com', '9153796606', '743456', 'BANAMALIPAR DIGHRA , BANAMALIPARA,DIGHRA,CHAKDAHA,N, , , NADIA, WEST BENGAL, 743456', 'WEST BENGAL', 'NADIA', 'CDLPR7178C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BLUPP0128A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BLUPP0128A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX59037', 'KALYANI COMMUNICATIONS', 'PRAMOD KUMAR PARIDA', 'KCOMMUNICATION522@GMAIL.COM', '9439921793', '751019', 'PRAMOD KUMAR PARIDA , RAGHUNATH NAGAR ATO STAND, DUMDUMA BHUBANESWAR, KHORDA ODISHA, KHORDA, ODISHA, 751019', 'ODISHA', 'KHORDA', 'BLUPP0128A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AGNPN8464E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AGNPN8464E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX59137', 'MOBILEHOSPITAL', 'BISESWAR NANDA', 'bisheswar.nanda.mobile@gmail.com', '9776414717', NULL, 'null, null, null, null, null, ODISHA, null', 'ODISHA', NULL, 'AGNPN8464E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AQHPH9837M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AQHPH9837M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX59284', 'PARULA STUDIO XEROX', 'ARUP HALDAR', 'aruph839@gmail.com', '7908776687', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'AQHPH9837M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'IRGPS1879Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'IRGPS1879Q' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX59372', 'SURYA''S JANASEVANA KENDRAM', 'SUNITHA SAJEEV', 'sunithasajeev537@gmail.com', '9744547932', '682506', 'KOVIL HOUSE, PWD ROAD, NEAR VYASAPURRAM TEMPLE, PANANGAD, ERNAKULAM, KERALA, 682506', 'KERALA', 'ERNAKULAM', 'IRGPS1879Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BMLPM9215K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BMLPM9215K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX59623', 'ALIZA ENTERPRISE', 'TAHAJUL MONDAL', 'tahajul.deo@gmail.com', '9609169121', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BMLPM9215K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FZYPM1809P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FZYPM1809P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX59813', 'SAHIN TELECOM', 'MONOYAR MOLLA', 'monoyarmolla45943@gmail.com', '9564923976', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'FZYPM1809P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'NLIPS0703J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'NLIPS0703J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX60157', 'ARINDAM SARDAR', 'ARINDAM SARDAR', 'arindamsardar42@gmail.com', '7908833158', '743273', 'TARANIPUR, TARANIPUR, , , NORTH 24 PARGANAS, WEST BENGAL, 743273', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'NLIPS0703J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EHZPD4865E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EHZPD4865E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX60391', 'CYBER COLLECTION', 'SUROJIT DEBNATH', 'surojitdebnath9093@gmail.com', '7908316528', '743263', 'ASHOKENAGAR, MANIKNAGAR, , , 24 PGS NORTH, WEST BENGAL, 743263', 'WEST BENGAL', '24 PGS NORTH', 'EHZPD4865E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DEYPR6799C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DEYPR6799C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX60712', 'SAIRAM XEROX SHOP', 'SAIRAM RAO', 'srutisai21@gmail.com', '7787978754', NULL, 'null, null, null, null, null, ODISHA, null', 'ODISHA', NULL, 'DEYPR6799C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BSPPJ3806F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BSPPJ3806F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX60752', 'GANESH JHA ENTERPRISES', 'GANESH JHA', 'g9mass@yahoo.in', '9560370078', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BSPPJ3806F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AGUPA9317J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AGUPA9317J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX60754', 'ADHIKARY FINANCIAL CONSULTANCY SERVICES', 'RANJIT KUMAR ADHIKARY', 'ranjit_ranita@yahoo.co.in', '9231514878', '743287', 'KAROLA, THAKURNAGAR, GAIGHATA, , 24 PGS NORTH, WEST BENGAL, 743287', 'WEST BENGAL', '24 PGS NORTH', 'AGUPA9317J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GEEPM7004E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GEEPM7004E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX60794', 'BASAR TELECOM', 'ABUL BASAR MOLLA', 'abulbasarmolla99@gmail.com', '9614918372', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'GEEPM7004E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DMUPD8840J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DMUPD8840J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX60941', 'GROW UP - TAX & ACCOUNTS', 'SOURAV DAS', 'GROWUPTAXWB@GMAIL.COM', '8509567102', '743222', '8NO KALIBARI MORE, ASHOKENAGAR, ASHOKENAGAR, , NORTH 24 PARGANAS, WEST BENGAL, 743222', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'DMUPD8840J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GRRPK4676J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GRRPK4676J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX61439', 'ADIL RECHARGE AND PAYMENT POINT', 'ARJINA KHATUN', 'arjina9647@gmail.com', '9647266235', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'GRRPK4676J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DWZPM0977E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DWZPM0977E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX61493', 'DIGHALGRAM ICC TECHNOLOGY COMPUTER CENTRE', 'FARUK MRIDHA', 'farukmridha2019@gmail.com', '9382763669', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DWZPM0977E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ANOPH5625B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ANOPH5625B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX61835', 'FK TRAVEL', 'FARUK HOSSAIN', 'fh256572@gmail.com', '8250918821', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'ANOPH5625B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BTQPP1557F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BTQPP1557F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX61972', 'SP ENTERPRISE', 'GOURHARI PAIK', 'gourharipaik0@gmail.com', '9933585575', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BTQPP1557F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX62059', 'SHRI BANKE BIHARI COMPUTERS', 'RAKSHA YADAV', 'pantkg2000@gmail.com', '8109212980', '472001', 'MAURANIPUR, MAURANIPUR, JHANSI, JHANSI, TIKAMGARH, MADHYA PRADESH, 472001', 'MADHYA PRADESH', 'TIKAMGARH', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BCBPH7107K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BCBPH7107K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX62149', 'RIDDIYA ONLINE CENTER', 'REZZAK HOSSAIN', 'rezzak.dta@gmail.com', '6297703068', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BCBPH7107K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CITPB3438C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CITPB3438C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX62354', 'BERATELECOM', 'TAPASI RANA BERA', 'beratelecom@gmail.com', '7076332313', '721467', 'VILL-BILKUA, PO-KOLANDA, , , PASCHIM MEDINIPUR, WEST BENGAL, 721467', 'WEST BENGAL', 'PASCHIM MEDINIPUR', 'CITPB3438C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CHLPM0386B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CHLPM0386B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX62503', 'SAJIDA TELECOM', 'SAIFUDDIN MOLLA', 'smolla778@gmail.com', '9734647325', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CHLPM0386B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EZQPK7676R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EZQPK7676R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX62894', 'N K MULTI POINT', 'TAUHEED AHMAD KHAN', 'nkmultipoint@gmail.com', '8630509528', '243005', 'JAGATPUR, NAI BASTI, OLD CITY, BAREILLY, BAREILLY, UTTAR PRADESH, 243005', 'UTTAR PRADESH', 'BAREILLY', 'EZQPK7676R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FTUPM2050Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FTUPM2050Q' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX62907', 'FM MOBILE AND ONLINE', 'FARIDUL MONDAL', 'mondalfaridul754@gmail.com', '7029537591', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'FTUPM2050Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BNZPH7889B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BNZPH7889B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX63249', 'DEBASHIS ONLINE CENTER', 'DEBASHIS HEMBROM', 'dhembrom1991@gmail.com', '7365017081', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BNZPH7889B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AUWPH3722N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AUWPH3722N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX63425', 'EJAJ ONLINE CENTER AND ELECTRIC', 'INJAMAMUL HOSSAIN', 'injamamulhossain67@gmail.com', '7908490967', '732124', 'LAKSHMIPUR, LAKSHMIPUR, , , MALDA, WEST BENGAL, 732124', 'WEST BENGAL', 'MALDA', 'AUWPH3722N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ASPPG9750L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ASPPG9750L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX63725', 'ARUP XEROX AND ONLINE CENTRE', 'ARUP GHORAI', 'arupghorai22@gmail.com', '7001727152', '721641', 'JAGANNATHPUR, JAGANNATHPUR, DASPUR, PASCHIM MEDINIPUR, WEST MIDNAPORE, WEST BENGAL, 721641', 'WEST BENGAL', 'WEST MIDNAPORE', 'ASPPG9750L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX64180', 'RADHARAMON COMPUTER', 'HARAN CHANDA', 'HARANCHANDA1984@GMAIL.COM', '7099476862', NULL, 'null, null, null, null, null, ASSAM, null', 'ASSAM', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BKDPP3492B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BKDPP3492B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX64280', 'JANASEVANAKENDRAM POOMKAVU', 'PHILOMINA V A', 'sujastarnet@gmail.com', '9539074539', '688521', 'POOMKAVU, PATHIRAPPALLY P O, ALAPPUZHA, , ALAPPUZHA, KERALA, 688521', 'KERALA', 'ALAPPUZHA', 'BKDPP3492B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DLEPG8681R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DLEPG8681R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX64327', 'GHOSH ONLINE SARVIS', 'RAJESH GHOSH', 'donrajesh7001@gmail.com', '7718429297', '743232', 'JHIKRA, JHIKRA,BAGDAH, , , 24 PARGANAS (S), WEST BENGAL, 743232', 'WEST BENGAL', '24 PARGANAS (S)', 'DLEPG8681R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EGZPK6561H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EGZPK6561H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX64372', 'AARADHYA ONLINE', 'RAJIV KUMAR', 'rajivsks01@gmail.com', '8825369586', NULL, 'null, null, null, null, null, BIHAR, null', 'BIHAR', NULL, 'EGZPK6561H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CMLPB2902D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CMLPB2902D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX64801', 'SHIBANI ONLINE CENTRE', 'PRASENJIT BHUNIA', 'MANISHABHUNIA2003@GMAIL.COM', '8001414795', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CMLPB2902D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DYQPP3033P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DYQPP3033P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX23658', 'MODARAN STUDIO', 'PABAN PRAMANIK', 'modernamarshi@gmail.com', '6294136496', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DYQPP3033P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DAAPM0319B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DAAPM0319B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX23749', 'MAITY CSC', 'SANJOY MAITY', 'sanjoymaity07@gmail.com', '8116427555', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DAAPM0319B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'MYFPS9742A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'MYFPS9742A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX23961', 'ROHAN ALI', 'MOSTAJIL SK', 'MOSTAJILSK4426@GMAIL.COM', '7318767801', '731222', 'PARAIPUR, KANAIGHAT,, PARAIPUR, KANAIGHAT, MURSHIDAB, , , MURSHIDABAD, WEST BENGAL, 731222', 'WEST BENGAL', 'MURSHIDABAD', 'MYFPS9742A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BHRPP2874E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BHRPP2874E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX24079', 'ABAKASH INTERNET', 'SOUMEN PAL', 'soumenpaul300@gmail.com', '9775923988', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BHRPP2874E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FNUPS3852N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FNUPS3852N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX24318', 'SARDAR STUDIO', 'AJAHAR SARDAR', 'mithunsardar110022@gmail.com', '8016975853', '743273', 'TARALI, SWARUPNAGAR, HAKIMPUR, SWARUPNAGAR, NORTH 24 PARGANAS, WEST BENGAL, 743273', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'FNUPS3852N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ACGPH1983B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ACGPH1983B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX24718', 'WEBZONE', 'SYED MUZAFFAR HUSSAIN', 'WEBZONE.DELTA@GMAIL.COM', '9238570268', '751003', 'PLOT NO 373, DELTA , BARAMUNDA, BHUBANESWAR, KHORDA, ODISHA, 751003', 'ODISHA', 'KHORDA', 'ACGPH1983B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BNNPG6594E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BNNPG6594E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX24785', 'TATHYAMITRA KENDRA', 'SANTU GHOSH', 'santughosh58@gmail.com', '9732354439', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BNNPG6594E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BSVPG5993C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BSVPG5993C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX24790', 'MAA LAXMI STUDIO AND XEROX', 'SUKUMAR GHOSH', 'buddhadevghosh369@gmail.com', '6294518080', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BSVPG5993C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'IVSPK3948C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'IVSPK3948C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX24793', 'FIROJ ONLINE WORKER', 'FIROJ KHAN', 'firojsarmin1433@gmail.com', '8509695847', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'IVSPK3948C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EWFPM1945F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EWFPM1945F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX24873', 'SM TELECOM', 'SITARAM MAHTO', 'sitarammahto@gmail.com', '7808765462', NULL, 'null, null, null, null, null, BIHAR, null', 'BIHAR', NULL, 'EWFPM1945F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ASHPM0359B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ASHPM0359B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX25183', 'CYBERTRON CYBER CAFE', 'AMIT MONDAL', 'NICOLAS1876@GMAIL.COM', '7001342903', '741223', 'VILL- CHUADANGA, P.O- GOURIPUR, P.S- CHAKDAHA, , NADIA, WEST BENGAL, 741223', 'WEST BENGAL', 'NADIA', 'ASHPM0359B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AXQPG2219L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AXQPG2219L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX25486', 'TUHIN ENTERPRISE', 'TUHIN GAYEN', 'tuhin.gayen1986@gmail.com', '6295693416', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'AXQPG2219L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'HZKPS2788P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'HZKPS2788P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX25603', 'FRINENDS', 'NISHA T S', 'friendssevabdm@gmail.com', '8606597721', '679334', 'VELIYODAN, BHOODANAM, , , MALAPPURAM, KERALA, 679334', 'KERALA', 'MALAPPURAM', 'HZKPS2788P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FEZPM7990M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FEZPM7990M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX25839', 'MONOTOSH ONLINE', 'GOUTAM MAJUMDAR', 'sb202713@gmail.com', '8335933888', '743235', 'ROYPUR, PANCHITA, , , 24 PARGANAS (S), WEST BENGAL, 743235', 'WEST BENGAL', '24 PARGANAS (S)', 'FEZPM7990M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'PJRPS1225N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'PJRPS1225N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX25893', 'EI SOLUTION', 'SANJITH.S', 'sanjithsk@gmail.com', '7907685139', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'PJRPS1225N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CKYPB4399H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CKYPB4399H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX25903', 'GB COMPUTER', 'GOUTAM BISWAS', 'goutambiswas50@gmail.com', '9002224399', '741222', 'RASULLAPUR, DEWLI, CHAKDAHA, , , NADIA, WEST BENGAL, 741222', 'WEST BENGAL', 'NADIA', 'CKYPB4399H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EDRPP6655Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EDRPP6655Q' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX25916', 'CHERIYAMADATHIL ASSOCIATE', 'SUVEEN V P', 'suveenvp3@gmail.com', '9048314992', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'EDRPP6655Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DKKPA7993F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DKKPA7993F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX26037', 'EISOLUTIONS', 'AMITH', 'amiththampi7025@gmail.com', '7025235745', '685606', 'KUZHIPPALLIYIL, KANJIKUZHY, , , IDUKKI, KERALA, 685606', 'KERALA', 'IDUKKI', 'DKKPA7993F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX26107', 'AARYANSH COMPUTER', 'DEEPNARAYAN PAL', 'DEEPANARAYAN885104@GMAIL.COM', '9144885104', NULL, 'null, null, null, null, null, MADHYA PRADESH, null', 'MADHYA PRADESH', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AHTPT9171D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AHTPT9171D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX26301', 'NANMACHARITABLE WELFARE AND EDUCATIONAL TRUST', 'ABDUL AZEEZ T', 'nanmacharitabletrustkoolivayal@gmail.com', '9446916143', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'AHTPT9171D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'LAWPS5865E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'LAWPS5865E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX26531', 'KASSY STUDIO', 'BIJOY SARKAR', 'bijoyesarkar21@gmail.com', '8638446053', NULL, 'null, null, null, null, null, ASSAM, null', 'ASSAM', NULL, 'LAWPS5865E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FNUPS8407R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FNUPS8407R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX26534', 'PASHUPATI SAMADDER', 'PASHUPATI SAMADDER', 'pashupatisamadder47@gmail.com', '8918749281', '741238', 'GANGNAPUR, SAMADDERPARA, , , NADIA, WEST BENGAL, 741238', 'WEST BENGAL', 'NADIA', 'FNUPS8407R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AZNPB7217N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AZNPB7217N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX26598', 'ADRIJA INTERNET AND TELECOM', 'SIDDHESWAR BISWAS', 'siddheswarbiswas@gmail.com', '6294337167', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'AZNPB7217N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CPSPS8404M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CPSPS8404M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX26783', 'FRIENDSHIP CYBERCAFE', 'SANTU SAMANTA', 'friendshipsantu@gmail.com', '9851113366', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CPSPS8404M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DAYPS4123K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DAYPS4123K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX26859', 'HASIBUL SHAIKH', 'HASIBUL SHAIKH', 'ihasibulshaikh@gmail.com', '9064189230', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DAYPS4123K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CYOPA8751J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CYOPA8751J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX26890', 'GOLDEN MOBILE CENTRE', 'MD ASIF AQBAL', 'Goldenbossb@gmail.com', '6201064621', NULL, 'null, null, null, null, null, BIHAR, null', 'BIHAR', NULL, 'CYOPA8751J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AQZPR5089G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AQZPR5089G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX27340', 'SUBHARANJAN DAS', 'SUBHORANJAN DAS', 'darshandunia@gmail.com', '8910995989', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'AQZPR5089G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'KDMPK0457G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'KDMPK0457G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX27830', 'KHAN MOBILE CENTAR', 'ABU SOHEL KHAN', 'abusohelkhan36@gmail.com', '9734542924', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'KDMPK0457G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ETWPR7452A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ETWPR7452A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX27840', 'BIBEK ONLINE COMPUTER SHOP', 'BIBEK ROY', 'roybibek894206@gmail.com', '9641234913', '735304', '110 BAJE JAMA KUCHLI, 110 BAJE JAMA KUCHLI, 110 BAJE JAMA KUCHLI, , COOCH BEHAR, WEST BENGAL, 735304', 'WEST BENGAL', 'COOCH BEHAR', 'ETWPR7452A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GEOPM1290C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GEOPM1290C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX27843', 'PRADIP NET POINT', 'PRADIP MANDAL', 'pm42349@gmail.com', '6295480937', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'GEOPM1290C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BNMPM9387A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BNMPM9387A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX27935', 'MINI COMPUTER CENTER', 'MINIMOL CHELLAPPAN', '7306322069mini@gmail.com', '7306322069', '688505', '385 A, VALIYAPARAMPIL(MOHANAM), THEKKEMURI, CHAMPAKULAM, ALAPPUZHA, KERALA, 688505', 'KERALA', 'ALAPPUZHA', 'BNMPM9387A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BWYPS5919P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BWYPS5919P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX28013', 'SOYETA INTERNET POINT', 'MANINDRO NATH SARKAR', 'manindronath1989@gmail.com', '7699201504', '743427', 'KAIJURI, KAIJURI, SWARUPNAGAR, NORTH 24 PARGANAS, NORTH 24 PARGANAS, WEST BENGAL, 743427', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'BWYPS5919P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BCXPS2833R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BCXPS2833R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX28153', 'SANDRACOMMUNICATIONS', 'CHANDRAN', 'sandracommu288@gmail.com', '6282073467', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'BCXPS2833R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DVLPG7571K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DVLPG7571K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX28416', 'GHOSH TELECOM', 'SHIVAM GHOSH', 'pdas92339@gmail.com', '9093628932', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DVLPG7571K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'MYHPS4606P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'MYHPS4606P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX28614', 'KANGLEIPAKNA YAIFARE', 'NONGMAITHEM JAMESBON SINGH', 'nongmaithemjamesbon@gmail.com', '9366466511', NULL, 'null, null, null, null, null, MANIPUR, null', 'MANIPUR', NULL, 'MYHPS4606P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BPDPK2834R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BPDPK2834R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX28904', 'MANOJ KUMAR', 'MANOJ DTH & PHOTO STATE', 'manojku39@gmail.com', '9973677622', '801104', 'ASPURA BIKRAM, BIKRAM, , , BURDWAN, WEST BENGAL, 801104', 'WEST BENGAL', 'BURDWAN', 'BPDPK2834R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX29150', 'KASHIRAM PAN CARD CENTER', 'KASHIRAM RAIKWAR', 'KASHIRAM.DBTHCH@GMAIL.COM', '9074173617', NULL, 'null, null, null, null, null, MADHYA PRADESH, null', 'MADHYA PRADESH', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CSPPP1616L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CSPPP1616L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX29307', 'SWAMI VIVEKANANDA ONLINE', 'MITHUN PAUL', 'mithunpaul1994@rediffmail.com', '9046024731', '733158', 'VILL DHULATAIR, PO ATRAI, PS PATIRAM, PIN 733158, DAKSHIN DINAJPUR, WEST BENGAL, 733158', 'WEST BENGAL', 'DAKSHIN DINAJPUR', 'CSPPP1616L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BRAPK3447D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BRAPK3447D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX29345', 'KHANBHAI CYBERPOINT AND STUDENT CORNER', 'MILAN KHAN', 'milankhan0000@gmail.com', '8016090317', '721641', 'JAGANNATHPUR, JAGANNATHPUR, DASPUR, PASCHIM MEDINIPUR, WEST MIDNAPORE, WEST BENGAL, 721641', 'WEST BENGAL', 'WEST MIDNAPORE', 'BRAPK3447D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CBFPD5772A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CBFPD5772A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX29407', 'BAPPA ENTERPRISE', 'BAPPA DAS', 'bappaenterprise147@gmail.com', '9593577700', '733143', 'PAHARAJPUR, BEKIDANGA, BAGANBARI, MANASHA MANDIR PASE, UTTAR DINAJPUR, WEST BENGAL, 733143', 'WEST BENGAL', 'UTTAR DINAJPUR', 'CBFPD5772A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DWSPR2607R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DWSPR2607R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX29408', 'JAYANTI MULTIMEDIA', 'SUBRATA ROY', 'subratasitu2020@gmail.com', '9635244123', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DWSPR2607R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EQVPR0316H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EQVPR0316H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX29461', 'STUDIO SONALI', 'ASHUTOSH RAY', 'rayashutosh724@gmail.com', '8609092719', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'EQVPR0316H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DLTPG0420B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DLTPG0420B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX29506', 'ARGHA DEEP GHOSH', 'MOJAMMEL', 'ghosharghadeep1@gmail.com', '9002468931', '733133', '1122, PATIRAM KACHARIPARA, PATIRAM, , DAKSHIN DINAJPUR, WEST BENGAL, 733133', 'WEST BENGAL', 'DAKSHIN DINAJPUR', 'DLTPG0420B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BAAPR0101C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BAAPR0101C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX29541', 'JANASEVANAKENDRAM', 'B RATHEESH', 'janasevakendraeranthode@gmail.com', '9961982332', '679325', 'ANGADIPPURAM, ERANTHODE, , , MALAPPURAM, KERALA, 679325', 'KERALA', 'MALAPPURAM', 'BAAPR0101C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'KDNPK3183E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'KDNPK3183E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX29615', 'NITISH CYBER CAFE', 'NITISH KUMAR', 'nitish2146@gmail.com', '6205248092', '801108', 'VIL- AHIYAPUR , POST-MANER PS- MANER, , , PATNA, BIHAR, 801108', 'BIHAR', 'PATNA', 'KDNPK3183E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ALCPT2754P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ALCPT2754P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX29846', 'CSC KANNIAKULANGARA', 'E S THAHA', 'csc.kkra@gmail.com', '8129326047', '695615', 'NEAR B.HS , KANNIAKULANGARA, VEMBAYAM P O, TRIVANDRUM, THIRUVANANTHAPURAM, KERALA, 695615', 'KERALA', 'THIRUVANANTHAPURAM', 'ALCPT2754P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DSEPS6542A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DSEPS6542A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX29861', 'PRONEET DIGITAL CENTRE', 'BIPRADAS SARDAR', 'sbipradass10@gmail.com', '9635170937', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DSEPS6542A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EDUPA6482B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EDUPA6482B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX30214', 'AJ ONLINE SERVICE', 'AYUB ALI', 'AYUBAKAND2022@GMAIL.COM', '8116635005', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'EDUPA6482B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FPMPR1921H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FPMPR1921H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX30458', 'BISWAJIT COMPEUTER AND GIFT HOUSE', 'BISWAJIT ROY', 'roybiswajit8884@gmail.com', '7384348885', '735304', '123 ANDARAN KHARKHAR, 123 ANDARAN KHARKHAR, , , COOCH BEHAR, WEST BENGAL, 735304', 'WEST BENGAL', 'COOCH BEHAR', 'FPMPR1921H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EREPD2121L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EREPD2121L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX30476', 'ANUSHREE BANKING POINT', 'REBA DAS', 'rebadas830@gmail.com', '7477756121', '721139', 'VILL-CHIARA, POST-GOLGHAT, DIST-PURBA MEDINIPUR, , EAST MIDNAPORE, WEST BENGAL, 721139', 'WEST BENGAL', 'EAST MIDNAPORE', 'EREPD2121L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AFEPA0142G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AFEPA0142G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX30648', 'ONLINE SEVA KENDRAM', 'ABDUL SALAM', 'kmamadavoormukku@gmail.com', '9495244716', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'AFEPA0142G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'JFJSF5317R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'JFJSF5317R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX30869', 'SARDAR ONLINE', 'JAHANGIR SARDAR', 'sardarjahangir152@gmail.com', '8879558834', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'JFJSF5317R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FGKPS3915P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FGKPS3915P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX30879', 'OM MOBILE', 'RAMJEE KUMAR', 'ramjeekumar122@gmail.com', '7903941309', NULL, 'null, null, null, null, null, BIHAR, null', 'BIHAR', NULL, 'FGKPS3915P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'JESPS5031G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'JESPS5031G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX31067', 'ACCURATE CYBER CAFE', 'MAHIUDDIN SHAIKH', 'ercafe@gmail.com', '8891732594', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'JESPS5031G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BVQPR3043C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BVQPR3043C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX31094', 'PUTHIYIDAMKUNNU JANASEVANA KENDRAM', 'LALITHA KUMARI', 'lalidhababu@gmail.com', '9747785971', '670645', 'PUTHIYIDAMKUNNU , KUNNAMANAGALAM , POST, WAYANAD, WAYANAD, KERALA, 670645', 'KERALA', 'WAYANAD', 'BVQPR3043C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX31472', 'MAYAN', 'MAYAN ALI', 'mipl.moldable@gmail.com', '7002726553', NULL, 'null, null, null, null, null, ASSAM, null', 'ASSAM', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX31487', 'AAYRA MOBILE SHOP KUDILA', 'JUBED KHAN', 'JUBEDKHAN.KUDILA@GMAIL.COM', '6265762661', NULL, 'null, null, null, null, null, MADHYA PRADESH, null', 'MADHYA PRADESH', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AVBPN2148Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AVBPN2148Q' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX31704', 'NAYAK DIGITAL SEVA', 'HANUMAN NAYAK', 'bsphn99@gmail.com', '9470818191', '847222', 'BASOPATTI, PURVI, , , MADHUBANI, BIHAR, 847222', 'BIHAR', 'MADHUBANI', 'AVBPN2148Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX31759', 'PAN', 'SUNDAR LAL AHIRWAR', 'RAMJI56@GMAIL.COM', '7771967489', NULL, 'null, null, null, null, null, MADHYA PRADESH, null', 'MADHYA PRADESH', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FPWPP0841C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FPWPP0841C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX32569', 'ONLINE BUSINESS', 'SHUBHAM PAL', 'shubhampal8170@gmail.com', '7629054337', NULL, 'null, null, null, null, null, TRIPURA, null', 'TRIPURA', NULL, 'FPWPP0841C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'HFXPK5431J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'HFXPK5431J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX32694', 'LN SINGH PAN CENTRE', 'SAURABH KUMAR', 'saurabh15181996@gmail.com', '8160096185', NULL, 'null, null, null, null, null, UTTAR PRADESH, null', 'UTTAR PRADESH', NULL, 'HFXPK5431J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GFZPM4972M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GFZPM4972M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX32761', 'ANJALI DIGITAL SEVA', 'GOUTAM MONDAL', 'goutammondal81331@gmail.com', '8001876259', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'GFZPM4972M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DYIPR0308P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DYIPR0308P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX32786', 'ROY TELE COM', 'MADHAB ROY', 'roym07506@gmail.com', '6297886439', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DYIPR0308P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CCPPB4071B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CCPPB4071B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX32795', 'AZAD HIND SERVICES', 'PALASH BHATTACHARAYA', 'pinkibhattacharya97@gmail.com', '8945922186', '743273', 'TARALI, HAKIMPUR, , , 24 PGS NORTH, WEST BENGAL, 743273', 'WEST BENGAL', '24 PGS NORTH', 'CCPPB4071B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ASFPH5471F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ASFPH5471F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX32859', 'HALDAR TELECOM', 'RAKHI HALDAR', 'durlavhaldar1987@gmail.com', '7074454802', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'ASFPH5471F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX32875', 'PRATIMA MOBILE SHOP', 'SUTAP SIKDAR', 'sutapsikdar9@gmail.com', '8119999041', NULL, 'null, null, null, null, null, TRIPURA, null', 'TRIPURA', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FKDPP0133H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FKDPP0133H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX34061', 'PAIK TELECOM', 'SOURAV PAIK', 'souravpaik905@gmail.com', '9800805562', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'FKDPP0133H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX34180', 'ANSARI SHOP', 'ABU HURAIRA', 'ABUHURAIRA.CSCJANSEVAKENDRA@GMAIL.COM', '8858225708', NULL, 'null, null, null, null, null, GUJARAT, null', 'GUJARAT', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AGVPD9598D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AGVPD9598D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX34207', 'ARUN DUBEY CSC', 'ARUN DUBEY', 'arundubeycsc@gmail.com', '9719850466', NULL, 'null, null, null, null, null, UTTAR PRADESH, null', 'UTTAR PRADESH', NULL, 'AGVPD9598D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CUKPM6089B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CUKPM6089B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX34607', 'MAMATA COMPUTER', 'TANMOY MALAKAR', 'tanmoymalakar2014@gmail.com', '8515964513', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CUKPM6089B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ALVPT6399P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ALVPT6399P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX34687', 'SARGA', 'ARUN THULASEEDHARAN', 'arunprojects1@gmail.com', '9447274545', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'ALVPT6399P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BZFPR4656E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BZFPR4656E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX34807', 'JIU GANGADHAR INTERNET & ZEROX', 'BAPPA RAJAK', 'bapparajak86@gmail.com', '7477657757', '722138', 'BAITAL, JOYPUR, BANKURA, 722138, BANKURA, WEST BENGAL, 722138', 'WEST BENGAL', 'BANKURA', 'BZFPR4656E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ETRPM7097B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ETRPM7097B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX34825', 'NUR ONLINE', 'NURHOSSAIN MONDAL', 'nurhossainmondal69@gmail.com', '8967362001', '743273', 'SWARUPNAGAR, AMUDIA, , , NORTH 24 PARGANAS, WEST BENGAL, 743273', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'ETRPM7097B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BWAPP0578F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BWAPP0578F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX35028', 'MAA MOBILE AND XEROX CENTRE', 'KARTICK PAUL', 'kartickpaul5@gmail.com', '8967497060', '743273', 'VILL-SUBIDPUR, P.O-PURANDARPUR, P.S-GAIGHATA, , NORTH 24 PARGANAS, WEST BENGAL, 743273', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'BWAPP0578F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX35497', 'KHUSHI COMPUTER', 'MAHESH KUMAR RAJAK', 'ONLINEKHUSI8109@GMAIL.COM', '6367612467', '472111', 'WARD NO. 06, MANIPURA MUHALLA , BALDEVGARH, TIKAMGARH, TIKAMGARH, MADHYA PRADESH, 472111', 'MADHYA PRADESH', 'TIKAMGARH', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DNEPS9932M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DNEPS9932M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX35624', 'SHIBI', 'SHIBI SIVAPRASAD', 'shibisd@gmail.com', '9744854455', '686143', 'EDAPPARAMBIL HOUSE, AKKARAPPADOM P.O, VAIKOM, , KOTTAYAM, KERALA, 686143', 'KERALA', 'KOTTAYAM', 'DNEPS9932M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BMUPN5964R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BMUPN5964R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX35840', 'MANGALATHU STORES', 'SANILKUMAR', 'sanilntym1971@gmail.com', '9961133927', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'BMUPN5964R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FONPR8668D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FONPR8668D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX35847', 'MONISANKAR ROY', 'MONI SANKAR RAY', 'cybermonisankar@gmail.com', '8617482337', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'FONPR8668D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BFVPA1579R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BFVPA1579R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX36075', 'MONU ALAM', 'MONU ALAM', 'monualam88@gmail.com', '9939717955', NULL, 'null, null, null, null, null, BIHAR, null', 'BIHAR', NULL, 'BFVPA1579R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CLOPD6141G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CLOPD6141G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX36418', 'JOY GURU MOBILE STORE', 'NIRANJAN DEY', 'deyseenu33@gmail.com', '9382031080', '741223', 'SRINAGAR, RAJARMATH, , , NADIA, WEST BENGAL, 741223', 'WEST BENGAL', 'NADIA', 'CLOPD6141G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ENCPS3310E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ENCPS3310E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX36508', 'AONE CITIZEN SERVICE', 'HOSSAIN ALI SHEIKH', 'aonecitizenservice@gmail.com', '8250743225', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'ENCPS3310E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FOPPR1301B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FOPPR1301B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX36582', 'MRITYUNJOY STONARI', 'MRITYUNJOY ROY', 'mrityunjoyroy9577@gmail.com', '8250889577', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'FOPPR1301B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FGJPM8139L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FGJPM8139L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX36592', 'MONDAL ONLINE', 'BIPLAB MONDAL', 'mbiplab357@gmail.com', '8167672288', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'FGJPM8139L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AXZPJ3557D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AXZPJ3557D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX36752', 'MAA SARASWATI TELECOM', 'SHIBSANKAR JANA', 'shibsankar7872@gmail.com', '7872287061', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'AXZPJ3557D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CZDPM5032N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CZDPM5032N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX36780', 'NUR MOBILE CENTER', 'SAHANUR MIAH', 'msahanur485@gmail.com', '8617467414', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CZDPM5032N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ADDPL4177F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ADDPL4177F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX36854', 'P T STORE', 'LISSY JACOB', 'JLISSY51@GMAIL.COM1', '7907170062', '673122', 'MUTTIL, KOLAVAYAL, KOLAVAYAL, , WAYANAD, KERALA, 673122', 'KERALA', 'WAYANAD', 'ADDPL4177F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DSSPM3532E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DSSPM3532E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX37015', 'BRIGHT ONLINE', 'MD TAHA MOLLA', 'taha@gmail.com', '9788770720', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DSSPM3532E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX37108', 'PAN CENTER', 'SONAM', 'NAMANCOMPUTERCENTER17@GMAIL.COM', '7080957186', '472115', 'KHARGAPUR, KHARGAPUR, KHARGAPUR, KHARGAPUR, TIKAMGARH, MADHYA PRADESH, 472115', 'MADHYA PRADESH', 'TIKAMGARH', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CSTPG7331R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CSTPG7331R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX37584', 'MANBODH GOPAL', 'MANBODH GOPAL', 'manbodhgopal@gmail.com', '8455063308', NULL, 'null, null, null, null, null, ODISHA, null', 'ODISHA', NULL, 'CSTPG7331R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'MVGPS8215J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'MVGPS8215J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX37645', 'SARKAR TELENET', 'AVIJIT SARKAR', 'AVIJITSARKAR462@GMAIL.COM', '9476482629', '743235', 'VILL- ANGARPUKURIA, PO- BOALDAH, PS- BONGAON, DIST- NORTH 24 PARGANAS, PIN- 743235, 24 PGS NORTH, WEST BENGAL, 743235', 'WEST BENGAL', '24 PGS NORTH', 'MVGPS8215J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DVSPM7025K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DVSPM7025K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX37914', 'RAJA ONLINE', 'ANIRBAN MONDAL', 'anirbanmondal608@gmail.com', '9851816629', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DVSPM7025K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DMEPB8762H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DMEPB8762H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX38165', 'CYBERPOINT', 'TRISNA BERA', 'TRISNABERA306@GMAIL.COM', '7098953491', '721602', 'D-110/1, DURGACHAK D BLOCK, DURGACHAK, , EAST MEDINIPUR, WEST BENGAL, 721602', 'WEST BENGAL', 'EAST MEDINIPUR', 'DMEPB8762H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DXMPS4934K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DXMPS4934K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX38547', 'ASRA COMMUNICATIONS', 'SHAIK HUSSAIN', 'malkapur7861@gmail.com', '9703255329', NULL, 'null, null, null, null, null, TELANGANA, null', 'TELANGANA', NULL, 'DXMPS4934K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CODPM9616K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CODPM9616K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX38954', 'UPAHAR XEROX CENTRE', 'SUMIT MISTRY', 'THEUPAHARXEROXCENTRE@GMAIL.COM', '9547544089', '743368', 'BORIA, DIAMOND HARBOUR, , , SOUTH 24 PARGANAS, WEST BENGAL, 743368', 'WEST BENGAL', 'SOUTH 24 PARGANAS', 'CODPM9616K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BYOPM5533K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BYOPM5533K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX39261', 'MAHATO DIGITAL', 'RANDHIR MAHATO', 'randhirmahato12@gmail.com', '7739819141', NULL, 'null, null, null, null, null, JHARKHAND, null', 'JHARKHAND', NULL, 'BYOPM5533K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BWOPA4513P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BWOPA4513P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX39627', 'RADHA GOPINATH MOBILE SERVICE', 'SUBHAS ADHIKARY', 'subhasadhikari11@gmail.com', '8001989294', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BWOPA4513P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CWBPK5409G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CWBPK5409G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX39670', 'COMMON SERVICE CENTER', 'MANOJ KUNJAPPAN', 'cscmannoor@gmail.com', '9447826480', '691311', 'MANNOOR, MANNOOR, , , KOLLAM, KERALA, 691311', 'KERALA', 'KOLLAM', 'CWBPK5409G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AYVPP7966M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AYVPP7966M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX39718', 'MAA TARA COMMUNICATION', 'MAHABIR PAL', 'mahabirpaul1983@gmail.com', '9230122429', '700067', '110,, ULTADANGA MAIN ROAD, ULTADANGA MAIN ROAD, , KOLKATA, WEST BENGAL, 700067', 'WEST BENGAL', 'KOLKATA', 'AYVPP7966M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BEWPH1442G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BEWPH1442G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX39824', 'CYBER WORLD', 'RAJKUMAR HALDAR', 'halderrajkumar1000d@gmail.com', '9093886350', '743329', 'SUKANTA PALLI, DIGHIRPAR, CANNING, , SOUTH 24 PARGANAS, WEST BENGAL, 743329', 'WEST BENGAL', 'SOUTH 24 PARGANAS', 'BEWPH1442G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BJHPS5871E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BJHPS5871E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX39867', 'LIC PREMIUM POINT', 'SAROJ KANTA SAHOO', 'KUMARSAROJLIC@GMAIL.COM', '9937142330', NULL, 'null, null, null, null, null, ODISHA, null', 'ODISHA', NULL, 'BJHPS5871E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DUZPG4908R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DUZPG4908R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX40236', 'BAPPA GHOSH', 'BAPPA GHOSH', 'sddotcom27@gmail.com', '9339940932', '741223', 'BAGDOB SILINDA, CHAKDAHA NADIA 741223, , , NADIA, WEST BENGAL, 741223', 'WEST BENGAL', 'NADIA', 'DUZPG4908R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GKCPS2923E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GKCPS2923E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX40296', 'JANASEVANA KENDRAM', 'SOORAJ S S', 'soorajkadakkal5@gmail.com', '8137077240', '691536', 'SHANDHA, MANDHIRAM, ATTUPURAM EDATHARA, PO KADAKKAL, KOLLAM, KERALA, 691536', 'KERALA', 'KOLLAM', 'GKCPS2923E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EBYPM9468R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EBYPM9468R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX40586', 'SALAUDDIN ONLINE', 'SALAUDDIN MOLLA', 'salauddin1999m@gmail.com', '7908211129', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'EBYPM9468R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DSKPB0339C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DSKPB0339C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX40857', 'LAKSHMI PAN CENTER', 'LAKSHMI BISWAS', 'lakshmibiswas246@gmail.com', '9734114393', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DSKPB0339C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FCCPP2337A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FCCPP2337A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX40859', 'ANKITA ONLINE', 'UJJWAL PAIK', 'ankitaonline77@gmail.com', '7908036434', '743349', 'NARANPUR, MADHSUDAN CHAK, RAIDIGHI, , SOUTH 24 PARGANAS, WEST BENGAL, 743349', 'WEST BENGAL', 'SOUTH 24 PARGANAS', 'FCCPP2337A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'LOIPS4682F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'LOIPS4682F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX40865', 'YOGEESHWARA COMMUNICATIONS EI JANASEVANAKENDRAM', 'SUJA S V', 'sujaprasanthvt1989@gmail.com', '9633263101', '691003', 'RAMANKULANGARA, KOLLAM, , , KOLLAM, KERALA, 691003', 'KERALA', 'KOLLAM', 'LOIPS4682F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CQPPM2170L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CQPPM2170L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX40918', 'MA GANDHESWARI VANDAR', 'KRISHNA KANTA MOULE', 'iamkrishnakantamoule@gmail.com', '9732562504', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CQPPM2170L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX40931', 'MOLSHOY STAR PRINTER', 'SAMIR KUMAR MOLSHOY', 'Samirkumarmolshoy@gmail.com', '9612553513', NULL, 'null, null, null, null, null, TRIPURA, null', 'TRIPURA', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BAAPM3747H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BAAPM3747H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX41029', 'OM COMMUNICATION', 'PALASH MONDAL', 'omcomxerox@gmail.com', '7001817526', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BAAPM3747H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BRXPD1197E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BRXPD1197E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX41536', 'DAS STUDIO', 'SANJAY DAS', 'rumadas0810@gmail.com', '9748262263', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BRXPD1197E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX41650', 'BALRAM RATHOD', 'BALRAM RATHOD', 'BALRAMRATHOD143@GMAIL.COM', '9754098888', NULL, 'null, null, null, null, null, MADHYA PRADESH, null', 'MADHYA PRADESH', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AXJPB9592J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AXJPB9592J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX41827', 'PARTHA BISWAS', 'PARTHA BISWAS', 'prithatechnologies@gmail.com', '9800000799', '743270', 'BAIKHOLA, BANESHWARPUR, BOIKOLA, , 24 PGS NORTH, WEST BENGAL, 743270', 'WEST BENGAL', '24 PGS NORTH', 'AXJPB9592J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'KCOPS7186D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'KCOPS7186D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX41853', 'KARIM MOBILE REPAIRING CENTRE', 'ABU KARIM SHAIKH', 'abukarimshaikh80@gmail.com', '8967082858', '741138', 'VILL. - KINUPOTA, P.O - TENTULBERIA, P.S - NAKASHIPARA, , NADIA, WEST BENGAL, 741138', 'WEST BENGAL', 'NADIA', 'KCOPS7186D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FNXPS4242H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FNXPS4242H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX42509', 'CSC SHAMNA S', 'SHAMNA S', 'WWW.CSCINDKERALA.11@GMAIL.COM', '9633553130', '683105', 'ADHIYA HOUSE NEW AJA, KUTTAMASSERY, , , ERNAKULAM, KERALA, 683105', 'KERALA', 'ERNAKULAM', 'FNXPS4242H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX42510', 'SHREE BALAJI MOBILE SHOP', 'PREMNARAYAN VISHWAKARMA', 'PREMNARAYANVISHWAKARMA266@GAMIL.COM', '8085803882', NULL, 'null, null, null, null, null, MADHYA PRADESH, null', 'MADHYA PRADESH', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BGEPA1837J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BGEPA1837J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX42936', 'TOUHED ALAM', 'TOUHED ALAM', 'Touhedalam161@gmail.com', '8389852648', '733128', 'ITAHAR, GOTHLU, , , NORTH DINAJPUR, WEST BENGAL, 733128', 'WEST BENGAL', 'NORTH DINAJPUR', 'BGEPA1837J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DGPPM3101N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DGPPM3101N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX03972', 'KALIMATA XEROX', 'JAYANTA MAJHI', 'joyantamajhi3@gmail.com', '8145638937', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DGPPM3101N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'JAHAN7384U' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'JAHAN7384U' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX04136', 'UMMEHANI GAZI', 'UMMEHANI GAZI', 'ani@gmail.com', '7324181959', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'JAHAN7384U', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ALGPH6273B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ALGPH6273B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX04152', 'DIGITAL COMPUTER AND XEROX', 'NAIMUL HAQUE', 'DIGITALPC786@GMAIL.COM', '8926613611', '74305', 'BILASPUR, KALIGANJ, JALANGI, MURSHIDABAD, MURSHIDABAD, WEST BENGAL, 74305', 'WEST BENGAL', 'MURSHIDABAD', 'ALGPH6273B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AEZPG9626J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AEZPG9626J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX04158', 'MS NASAL XEROXSOFT', 'RAJESH GUPTA', 'rajeshguptaalo2020@gmail.com', '9436627111', NULL, 'null, null, null, null, null, ARUNACHAL PRADESH, null', 'ARUNACHAL PRADESH', NULL, 'AEZPG9626J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DDWPA4696E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DDWPA4696E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX04258', 'JAHANGIR ONLINE POINT', 'JAHANGIR ALAM', 'alamjahangir73322@gmail.com', '8250858212', '733128', 'GOTHLIU, ITAHAR, ITAHAR, UTTAR DINAJPUR, UTTAR DINAJAPUR, WEST BENGAL, 733128', 'WEST BENGAL', 'UTTAR DINAJAPUR', 'DDWPA4696E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FFUPK2470A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FFUPK2470A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX04271', 'ARUN JAN SEVA KENDRA USAWAN', 'JAYANTA KUMAR', 'arunkashyap77695@gmail.com', '8439010256', NULL, 'null, null, null, null, null, UTTAR PRADESH, null', 'UTTAR PRADESH', NULL, 'FFUPK2470A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'APKPM5663A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'APKPM5663A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX04893', 'TELECOM', 'AKTAR MOLLA', 'injamulmolla743235@gmail.com', '8420744876', '743235', 'SABHAIPUR, NAKFUL, BONGAON, , NORTH 24 PARGANAS, WEST BENGAL, 743235', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'APKPM5663A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'HMLPM6576B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'HMLPM6576B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX04951', 'BIDUR MONDAL', 'BIDUR MONDAL', 'wbgaming140@gmail.com', '9339063705', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'HMLPM6576B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX04953', 'SAMRAT BHATTACHARJEE', 'SAMRAT BHATTACHARJEE', 'mrbhattacharjee.b@gmail.com', '8486138944', NULL, 'null, null, null, null, null, ASSAM, null', 'ASSAM', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FCSPR4266Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FCSPR4266Q' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX05126', 'JANASEVANA KENDRAM CHERIYAVELINALLOOR', 'VIDU RAMAKRISHNAN', 'viduramakrishnanvrk1997@gmail.com', '8848418565', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'FCSPR4266Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BCMPA1947B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BCMPA1947B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX05247', 'BANDU TELECOM', 'ANOWAR HOSSAIN SK', 'anowarhossainsk@gmail.com', '7384701143', '742121', 'NOWDA, MAHAMMADPUR, MAHAMMADPUR, , MURSHIDABAD, WEST BENGAL, 742121', 'WEST BENGAL', 'MURSHIDABAD', 'BCMPA1947B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX05769', 'A TO Z ONLINE SERVICE', 'SK JALALUDDIN', 'atozonlineservice7384@gmail.com', '7384981523', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX05782', 'HARSH COMPUTER', 'SURENDRA PRATAP JHA', 'SURENDRABIGHA1992@GMAIL.COM', '9617748214', NULL, 'null, null, null, null, null, MADHYA PRADESH, null', 'MADHYA PRADESH', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BDNPM1324A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BDNPM1324A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX05938', 'AMMAL JANASEVANA KENDRA', 'MOIDEEN M', 'ammalagencieskdy@gmail.com', '9497150517', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'BDNPM1324A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ILTPS8532R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ILTPS8532R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX06438', 'GOUTAM SAU', 'TARGET ONLINE SERVIC', 'saugoutam567@gmail.com', '9647927168', '721444', 'PATASHPUR 2, KOURMAISHALI, ICHHABARI, , EAST MIDNAPORE, WEST BENGAL, 721444', 'WEST BENGAL', 'EAST MIDNAPORE', 'ILTPS8532R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'COCPP1231A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'COCPP1231A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX06475', 'TRINATHA DEVA COMMUNICTION', 'DIPU PRASAD PRADHAN', 'trinathadeva@gmail.com', '8249621612', '752102', 'BARIJANGA, NUAPADA, BALIPATNA, KHORDHA, KHORDA, ODISHA, 752102', 'ODISHA', 'KHORDA', 'COCPP1231A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ACPPH2835K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ACPPH2835K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX06723', 'MICRO SOLUTION INFOCOM', 'DEBASIS HALDER', 'microsolution.deba@gmail.com', '9933699223', '743329', 'CANNING TOWN, CANNING, CANNING, , SOUTH 24 PARGANAS, WEST BENGAL, 743329', 'WEST BENGAL', 'SOUTH 24 PARGANAS', 'ACPPH2835K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FWNPM7899M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FWNPM7899M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX06894', 'LAXMI TELECOM', 'BADU MARDI', 'badumardi000@gmail.com', '9339667688', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'FWNPM7899M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FRPPK5544E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FRPPK5544E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX06945', 'SUNNY DIGITAL STUDIO', 'SOORAJ KUMAR', 'SOORAJ9761@GMAIL.COM', '9761553263', NULL, 'null, null, null, null, null, UTTAR PRADESH, null', 'UTTAR PRADESH', NULL, 'FRPPK5544E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DSRPS5873R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DSRPS5873R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX07148', 'CC EI SOLUTIONS', 'SHIJU V J', 'shijuvjjohn@gmail.com', '9389764951', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'DSRPS5873R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ASLPV0670J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ASLPV0670J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX07154', 'RANGA SWAMY PAN SERVICES', 'KURNOOL VENKATESH', 'kranga8185@gmail.com', '8185828908', NULL, 'null, null, null, null, null, TELANGANA, null', 'TELANGANA', NULL, 'ASLPV0670J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GRJPS6635B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GRJPS6635B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX07194', 'SARKAR DIGITAL SERVICES', 'SUJAN SARKAR', 'sujansarkar9898@gmail.com', '8967432032', '732124', 'MOYNA, GAZOLE, MALDA, MOYNA, GAZOLE, MALDA, , , MALDA, WEST BENGAL, 732124', 'WEST BENGAL', 'MALDA', 'GRJPS6635B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AQHPH5316F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AQHPH5316F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX07329', 'HALDAR ELECTRIC', 'SUSHIL HALDAR', 'sushilhaldar92@gmail.com', '6295012771', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'AQHPH5316F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CXPYK8824K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CXPYK8824K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX07365', 'AMIR TELECOME', 'AMIR HOSEN KHAN', 'rujainak0786@gmail.com', '8918712016', '722152', 'BRINDABONI ADHKARA , TALDANGRA BANKURA, , , BANKURA, WEST BENGAL, 722152', 'WEST BENGAL', 'BANKURA', 'CXPYK8824K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DQSPA0970E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DQSPA0970E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX07586', 'FAIMA ONLINE CENTRE', 'SABBIR ALAM', 'sa89593@gmail.com', '9593625388', '733140', 'KATKIHARI, PRANSAGAR, , , DAKSHIN DINAJPUR, WEST BENGAL, 733140', 'WEST BENGAL', 'DAKSHIN DINAJPUR', 'DQSPA0970E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CJZPG9854Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CJZPG9854Q' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX07628', 'AMINA ONLINE', 'INJAMAMUL HAQUE GAIN', 'injamamulhgain@gmail.com', '8509156392', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CJZPG9854Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX07815', 'SHOP', 'SAMRAT BHATTACHARJEE', 'SAMRATBHATTACHARJEE44@GMAIL.COM', '8099513961', NULL, 'null, null, null, null, null, ASSAM, null', 'ASSAM', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'OCGPS7678N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'OCGPS7678N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX07826', 'SAHA DIGITAL', 'SIMANTA SAHA', 'simanta111222@gmail.com', '8927817690', '741122', 'NATNA PATTABUKA, NATNA PATTABUKA, NATNA PATTABUKA, , NADIA, WEST BENGAL, 741122', 'WEST BENGAL', 'NADIA', 'OCGPS7678N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EQWPM2901Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EQWPM2901Q' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX07843', 'EA SONS', 'MUHAMMADALI EANTHAN', 'muhammadalie0786@gmail.com', '8714121837', '670645', 'PEECHAMKODE, THARUVANA, , , WAYANAD, KERALA, 670645', 'KERALA', 'WAYANAD', 'EQWPM2901Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ADKPH2441R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ADKPH2441R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX07958', 'SANKAR HALDER', 'SANKAR HALDER', 'sankar.sct78@gmail.com', '8918677678', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'ADKPH2441R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EFUPM8305B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EFUPM8305B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX08132', 'STAR TELECOM CSC', 'UTTAM MAITI', 'uttammaiti7@gmail.com', '9800238898', '743347', 'UKILERHAT, RAJNAGAR, , , 24 PARGANAS (S), WEST BENGAL, 743347', 'WEST BENGAL', '24 PARGANAS (S)', 'EFUPM8305B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BWOPD6874L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BWOPD6874L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX08345', 'EXSERVICE MAN COMMUTICATIONS', 'VEENA MOL G', 'EXSERVICEPTPM12@GMAIL.COM', '9400274036', '689695', 'PATHANAPURAM, EXSERVICEMAN COMMUNICATION PAT, NIRATHUPARA, , KOLLAM, KERALA, 689695', 'KERALA', 'KOLLAM', 'BWOPD6874L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BUSPB3629R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BUSPB3629R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX08432', 'GANESH RECHARGE', 'GANESH BISWAS', 'ganeshbiswas9777@gmail.com', '9777831230', NULL, 'null, null, null, null, null, ODISHA, null', 'ODISHA', NULL, 'BUSPB3629R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ATZPH0652D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ATZPH0652D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX08516', 'PAPAI TELECOM', 'PAPAI HALDER', 'papaihalder136@gmail.com', '8967227645', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'ATZPH0652D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FEHPS0531G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FEHPS0531G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX08731', 'PIN2 STUDIO', 'GAJENDRA SAHU', 'gajenderasahu3333@gmail.com', '9204002314', NULL, 'null, null, null, null, null, JHARKHAND, null', 'JHARKHAND', NULL, 'FEHPS0531G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX08912', 'TAXADO PRIVATE LIMITED', 'ARJUN YADAV', 'TAXADOTECHNOLOGY@GMAIL.COM', '8587083843', '273009', 'TARAMANDAL, TARAMANDAL, GORAKHPUR, , , , NORTH 24 PARGANAS, WEST BENGAL, 273009', 'WEST BENGAL', 'NORTH 24 PARGANAS', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CHCPB5034L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CHCPB5034L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX09186', 'SAMRAT BHATTACHARJEE', 'SAMRAT BHATTACHARJEE', 'SAMRATBHATTACHARJEE44@GMAIL.COM', '8486138944', '788710', 'OLD MISSION ROAD, C/O NIRANJAN DAS, , , KARIMGANJ, ASSAM, 788710', 'ASSAM', 'KARIMGANJ', 'CHCPB5034L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FMSPB0455H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FMSPB0455H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX09374', 'LIPIKA STORE', 'DEB RANJAN BARMAN', '9800343970d@gmail.com', '9800343970', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'FMSPB0455H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX09567', 'JADIYA COMPUTERS', 'AADESH JADIYA', 'JADIYACOMPUTERS@GMAIL.COM', '9893373724', NULL, 'null, null, null, null, null, MADHYA PRADESH, null', 'MADHYA PRADESH', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'HGAPS7247J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'HGAPS7247J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX09641', 'SMART DIGITAL HUB', 'SHAFEEK', 'mobilecafetkp@gmail.com', '9947539947', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'HGAPS7247J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DRCPK3600J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DRCPK3600J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX10257', 'ADRIJA SHOP POINT', 'ANJAN KANRI', 'anjanbankura91@gmail.com', '9609021551', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DRCPK3600J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EJLPS7768M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EJLPS7768M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX10479', 'BINA XEROX CENTER', 'MANIK SARKAR', 'manikkeshabpur26@gmail.com', '9679914826', '733124', 'KESHABPUR, RAJIBPUR, GANGARAMPUR, DAKSHIN DINAJPUR, DAKSHIN DINAJPUR, WEST BENGAL, 733124', 'WEST BENGAL', 'DAKSHIN DINAJPUR', 'EJLPS7768M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AXZPA5884E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AXZPA5884E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX10536', 'ONLINE SHOP', 'SHIBAJI ACHARYYA', 'shibaji90934@gmail.com', '9093407521', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'AXZPA5884E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CSKPM0369Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CSKPM0369Q' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX10538', 'MAITY ONLINE SERVICE CENTER', 'SANTANU MAITY', 'Maitysantanu054@gmail.com', '9775413312', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CSKPM0369Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX10649', 'GAUTAM BUDDHA ONLINE CENTER', 'HEERA LAL AHIRWAR', 'HIRALALAHIRWAR484@GMAIL.COM', '9755818513', NULL, 'null, null, null, null, null, MADHYA PRADESH, null', 'MADHYA PRADESH', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CLDPB6498K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CLDPB6498K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX10725', 'SUDWIP COMMUNICATION', 'SUDWIP BAL', 'sudwipbal66@gmail.com', '8170999309', '743270', 'CHOATIA BHABANIPUR N, CHOATIA BHABANIPUR NORTH 24 PG, , , NORTH 24 PARGANAS, WEST BENGAL, 743270', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'CLDPB6498K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'PNSPS9230N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'PNSPS9230N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX10734', 'RUPAM SARKAR', 'RUPAM SARKAR', 'RUPRIYACOMPUTROIX@GMAIL.COM', '9593328973', '741222', 'RASULLAPUR, DEWLI, NADIA, CHAKDAHA, NADIA, WEST BENGAL, 741222', 'WEST BENGAL', 'NADIA', 'PNSPS9230N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CSDPB3341L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CSDPB3341L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX10926', 'JB CYBER CAFE', 'SHAMBHU BARMAN', 'shambhuhelpline.co.in@gmail.com', '8016594871', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CSDPB3341L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ECDPR0744D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ECDPR0744D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX10928', 'GALAXY', 'RENJITH R', 'ren.dev1990@gmail.com', '9444394834', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'ECDPR0744D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CUZPP1305G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CUZPP1305G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX12463', 'DISHARI COMPUTER', 'BAPPA PATRA', 'BAPPAANU143@GMAIL.COM', '8348037697', '712611', 'VILL-PUNDAHIT, P.O- ASHUDKHOLA, P.S- GOGHAT, , HOOGHLY, WEST BENGAL, 712611', 'WEST BENGAL', 'HOOGHLY', 'CUZPP1305G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ANDPH4157M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ANDPH4157M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX12498', 'MAHABUL TELICOM', 'MD MAHABUL HOSSAIN', 'mahabultelicom@gmail.com', '7797361351', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'ANDPH4157M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BUIPS8527H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BUIPS8527H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX12580', 'FINLAN ONLINE', 'PARTHA SIKDER', 'PARTHASIKDER13@GMAIL.COM', '9153005414', '743329', 'VILL-NO1 DIGHIRPAR, , CANNING, , , 24 PARGANAS (S), WEST BENGAL, 743329', 'WEST BENGAL', '24 PARGANAS (S)', 'BUIPS8527H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ACMPI5846A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ACMPI5846A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX12586', 'MONIHAR ELECTRONICS', 'ESFADUL ISLAM', 'esfadulislam33@gmail.com', '9732842430', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'ACMPI5846A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CADPS3069N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CADPS3069N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX12640', 'NINGOMBAM ENTERPRISES', 'NINGOMBAM BIRLA SINGH', 'birlaningombam@gmail.com', '7308168529', NULL, 'null, null, null, null, null, MANIPUR, null', 'MANIPUR', NULL, 'CADPS3069N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX12796', 'HARISHANKAR KUSHWAHA', 'MAA SANTOSHI PAN CENTE', 'HARISHANKARFUTER@GMAIL.COM', '9174051627', NULL, 'null, null, null, null, null, MADHYA PRADESH, null', 'MADHYA PRADESH', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BBXPB8580R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BBXPB8580R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX12809', 'CYBERARENA INTERNET CAFE', 'RAJESH BISWAS', 'cyberarena.internetcafe@gmail.com', '9804270113', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BBXPB8580R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'LBEPS9456G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'LBEPS9456G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX12879', 'MATTRI COMPUTER', 'MRINAL SINGH', 'mrinalsingh0169@gmail.com', '8001851146', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'LBEPS9456G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AFUPH2102M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AFUPH2102M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX13067', 'BEST COPY PRINTING ZONE', 'PHANINDRA NATH HEMBROM', 'bestcopyprintingzone@gmail.com', '7001706824', '733124', 'RAJIBPUR, RAJIBPUR, , , DAKSHIN DINAJPUR, WEST BENGAL, 733124', 'WEST BENGAL', 'DAKSHIN DINAJPUR', 'AFUPH2102M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DKGPG8970N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DKGPG8970N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX13246', 'SMART HUB', 'RAJU BALI GAZI', 'rajubaligazi@gmail.com', '9711776510', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DKGPG8970N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BMFPJ0415E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BMFPJ0415E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX13248', 'JANASEVANA KENDRAM EI SOLUTIONS', 'ALFY JOHN', 'coupletravels6@gmail.com', '7025430331', '743235', 'P.O ANAKKARA, P.O ANAKKARA, P.O ANAKKARA, P.O ANAKKARA, PATHANAMTHITTA, KERALA, 743235', 'KERALA', 'PATHANAMTHITTA', 'BMFPJ0415E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DDLPB4501E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DDLPB4501E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX13529', 'BISWAS STUDIO AND VARIETIES', 'MRITUNJOY BISWAS', 'mobilepays.in@gmail.com', '9002990749', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DDLPB4501E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ATWPH5316D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ATWPH5316D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX13594', 'NUR MOBILE', 'NUR HAQUE', 'nurhoqueraju@gmail.com', '9641164266', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'ATWPH5316D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BECPH34253' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BECPH34253' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX13680', 'JANA SEVANA KENDRAM', 'SAJIDA HARIS', 'hariskundukc@gmail.com', '8138801196', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'BECPH34253', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FUBPM4613K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FUBPM4613K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX13698', 'UNIQUE ONLINE', 'MANJURA MONDAL', 'brahaman8001@gmail.com', '8972065231', '743235', 'BHASHANPOTA,GHATBAOR, BHASHANPOTA,GHATBAOR, , , NORTH 24 PARGANAS, WEST BENGAL, 743235', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'FUBPM4613K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AFNPF0343M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AFNPF0343M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX13750', 'SUHANA COMPUTER CENTRE', 'UMAR FARUQUE', 'ufaruque946@gmail.com', '7478755629', '732125', 'BISHANPUR, DHANGARA, CHANCHAL, , MALDA, WEST BENGAL, 732125', 'WEST BENGAL', 'MALDA', 'AFNPF0343M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GWMPM4790M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GWMPM4790M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX13852', 'KARTICK MAITY', 'KARTICK MAITY', 'mkartick858@gmail.com', '8371867188', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'GWMPM4790M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AFJPE6129E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AFJPE6129E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX14285', 'STANTONYS DTP AND PHOTOSTAT CENTER', 'SHINNY EASAPPAN', 'shinimejo6@gmail.com', '9562238992', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'AFJPE6129E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'KFOPS1174A' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'KFOPS1174A' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX14305', 'MAA TARINI COMMUNICATION', 'ASWINI KUMAR SAHOO', 'ASWINISAHOO430@GMAIL.COM', '8895557516', NULL, 'null, null, null, null, null, ODISHA, null', 'ODISHA', NULL, 'KFOPS1174A', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AQHPJ0063B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AQHPJ0063B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX14376', 'JKGRAPHICS', 'JOFFIN J KADAVIL', 'jkgraphics17@gmail.com', '9497146548', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'AQHPJ0063B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ARPPM9244G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ARPPM9244G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX14526', 'ARATI STUDIO XEROX', 'SOURINDRA NATH MONDAL', 'sourindranath123@gmail.com', '8250722404', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'ARPPM9244G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CAIPM9062Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CAIPM9062Q' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX14732', 'MONDAL TELECOM', 'RAHAMAN MONDAL', 'RAHAMANMONDAL1409@GMAIL.COM', '9091801568', '743405', 'BHIRA CHHAYGHORIA BO, BHIRA CHHAYGHARIA BONGAON, , , NORTH 24 PARGANAS, WEST BENGAL, 743405', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'CAIPM9062Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BPHPG4335P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BPHPG4335P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX14985', 'UTI PAN SEBA', 'SANJOY GHOSH', 'info.panrecharge@gmail.com', '7318846797', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BPHPG4335P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DYUPA3597R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DYUPA3597R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX15026', 'KALAM COMPUTER CENTRE AND CSP', 'ABUL KALAM AZAD', 'abulkalam36200@gmail.com', '8695233515', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DYUPA3597R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BCHPH8211G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BCHPH8211G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX15873', 'SAS ONLINE CENTRE', 'SHARIFA C H', 'sasmpd2019@gmail.com', '9605159165', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'BCHPH8211G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AFKPE9261N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AFKPE9261N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX16083', 'RONAL EKKA', 'RONAL EKKA', 'ronalekka123@gmail.com', '7602277093', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'AFKPE9261N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CFMPR2346F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CFMPR2346F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX16207', 'CSC SANJAY PADAMATI2 GP', 'SANJAY ROY', 's4sanjay36@gmail.com', '9635969941', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CFMPR2346F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'APUPK9424R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'APUPK9424R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX16273', 'LALU JI KA BIJLIDUKAN', 'SHAKIR KHAN', 'sakir012@gmail.com', '7260871901', '824120', 'PIRU , HASPURA , AURANGABADA , BIHAR , AURANGABAD(BH), BIHAR, 824120', 'BIHAR', 'AURANGABAD(BH)', 'APUPK9424R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AYTPL8157E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AYTPL8157E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX16784', 'TOP FORM EI JANASEVANA KENDRAM', 'LIJI', 'topformpoint2022@gmail.com', '9061008015', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'AYTPL8157E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BBPPA2430R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BBPPA2430R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX16835', 'HASAN BATER WATCH', 'MIR HASAN ALI', 'mirhasan793@gmail.com', '7797028793', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BBPPA2430R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DUPPM6512K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DUPPM6512K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX17206', 'MONDAL STORES ENTERPRISE', 'RAKESH MONDAL', 'a8670877048@gmail.com', '8670877048', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DUPPM6512K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ATTPH8778G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ATTPH8778G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX17285', 'TARA MAA ONLINE', 'DEBASISH HALDER', 'taramaaonline22@gmail.com', '9775754801', '743235', 'NAKFUL, NAKFUL, , , 24 PGS NORTH, WEST BENGAL, 743235', 'WEST BENGAL', '24 PGS NORTH', 'ATTPH8778G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX17356', 'SHRI BALA JI OFSET', 'RAHUL SEN', 'RAHULSEN0207@GMAIL.COM', '7000359938', NULL, 'null, null, null, null, null, MADHYA PRADESH, null', 'MADHYA PRADESH', NULL, NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'OSUPS6601D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'OSUPS6601D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX17625', 'GOLAPI NET POINT', 'SABIR SARDAR', 'sabirsardar4u@gmail.com', '6295873249', '743273', 'BALTI, SWARUPNAGAR , , , NORTH 24 PARGANAS, WEST BENGAL, 743273', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'OSUPS6601D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GIFPM0944G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GIFPM0944G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX17695', 'ASHIRBAD STUDIO', 'PALLABI MAITY', 'ganeshmaity867@gmail.com', '7478106626', '721641', 'JAGANNATHPUR, DASPUR, , , PACHIM MEDIINIPUR, WEST BENGAL, 721641', 'WEST BENGAL', 'PACHIM MEDIINIPUR', 'GIFPM0944G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FWVPM1819R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FWVPM1819R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX18253', 'KRISHNA ENTERPRISE', 'KRISHNENDU MISTRI', 'krishnendumistri00@gmail.com', '7076741313', '743349', 'VILL- NARANPUR, P.O- MADHUSUDAN CHAK, P.S- RAIDIGHI, , SOUTH 24 PARGANAS, WEST BENGAL, 743349', 'WEST BENGAL', 'SOUTH 24 PARGANAS', 'FWVPM1819R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DFFPA8405C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DFFPA8405C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX18263', 'A SQUARE COMMUNICATIONS MALANCHUTTU', 'AJEESH U S', 'ajeshunni2020@gmail.com', '8129180673', '695508', 'A SQUARE , COMMUNICATIONS, PARASUVAIKKAL, , THIRUVANANTHAPURAM, KERALA, 695508', 'KERALA', 'THIRUVANANTHAPURAM', 'DFFPA8405C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FHNPK5220B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FHNPK5220B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX18309', 'DIGITAL SEVA POINT', 'BAPAN KHANRA', 'KHANRABAPAN81@GMAIL.COM', '8145888751', '721641', 'PAIKAN BOALIA, BALAK ROUTH, DASPUR, , PASCHIM MEDINIPUR, WEST BENGAL, 721641', 'WEST BENGAL', 'PASCHIM MEDINIPUR', 'FHNPK5220B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AWCPB5076D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AWCPB5076D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX18406', 'JANASEVA', 'BEENA THANKAPPAN', 'beetas345@gmail.com', '9447521973', '680684', 'CHAZHIKADAN HOUSE, CHEMBUCHIRA P O, NOOLUVALLY, KODAKARA VIA, THRISSUR, KERALA, 680684', 'KERALA', 'THRISSUR', 'AWCPB5076D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AONPI0347B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AONPI0347B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX18436', 'ESOLUTIONSJANASEVAKENDRAM', 'SOFIYA NASSER', 'esolutionsknlr@gmail.com', '8089082522', '691576', 'VADAKKEMUKKU , KANNANALLOOR, , , KOLLAM, KERALA, 691576', 'KERALA', 'KOLLAM', 'AONPI0347B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'GQMPM8260E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'GQMPM8260E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX18495', 'MILAN TELECOM', 'MILAN MONDAL', 'MILANMONDAL4006@GMAIL.COM', '8348134160', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'GQMPM8260E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CCWPK9221K' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CCWPK9221K' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX18749', 'KALPANA MULTI SHOP', 'CHINMOY KAMAR', 'chinmoykamar1981@gmail.com', '9732787091', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'CCWPK9221K', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CZAPM5820P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CZAPM5820P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX18975', 'AMIT TELECOM', 'AMIT MONDAL', 'amitmondal.am360@gmail.com', '8609320050', '743349', 'NANDAKUMAR PUR, NANDAKUMAR PUR, , , SOUTH 24 PARGANAS, WEST BENGAL, 743349', 'WEST BENGAL', 'SOUTH 24 PARGANAS', 'CZAPM5820P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AQZPR5041D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AQZPR5041D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX19360', 'CYBERPARK E SEVA KENDRA', 'SANJAY RANJAN', 'psskolkata05@gmail.com', '9038376255', '700115', 'T N BANERJEE ROAD, JAIPRAKASH NAGAR, SUKCHAR, KOLKATA, 24 PGS NORTH, WEST BENGAL, 700115', 'WEST BENGAL', '24 PGS NORTH', 'AQZPR5041D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BDMPP8128G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BDMPP8128G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX19504', 'SUBIR PRAMANIK', 'SUBIR PRAMANIK', 'pramaniksubir24@gmail.com', '9732518105', '743251', 'KANIARA, BAGDAH, BAGDAH, , NORTH 24 PARGANAS, WEST BENGAL, 743251', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'BDMPP8128G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ANZPA8797J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ANZPA8797J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX19835', 'APARNA STORE', 'BIPRADAS ADHIKARI', 'bipradas1972@gmail.com', '9143116144', '741222', 'JAGADISHPUR, DIGHRA, CHAKDAHA, NADIA, NADIA, WEST BENGAL, 741222', 'WEST BENGAL', 'NADIA', 'ANZPA8797J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'KYLPS6071Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'KYLPS6071Q' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX20451', 'SUNRISE ONLINE STORE', 'KARNOOL SURESH', 'sureshkurnool304@gmail.com', '9182298066', NULL, 'null, null, null, null, null, TELANGANA, null', 'TELANGANA', NULL, 'KYLPS6071Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BEZPS8760P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BEZPS8760P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX20587', 'MODERN CAFE', 'SUMAN SIKDAR', 'rinjoy.sikdarr@gmail.com', '6290674717', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BEZPS8760P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'APSPA0887N' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'APSPA0887N' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX20638', 'AKTAR ONLINE', 'SAMIM AKTAR', 'AKTARONLINE814@gmail.com', '8348214338', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'APSPA0887N', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BGEPA3192C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BGEPA3192C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX20916', 'MIZANUR ONLINE', 'MD MANJAR ALI', 'mdmanjarali1991@gmail.com', '9153274488', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BGEPA3192C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AGLPC8279Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AGLPC8279Q' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX21095', 'AVE COMMUNICATIONS', 'DERIC CARDOZ', 'ave.communication@gmail.com', '9447810465', '690525', 'VAVVAKKAVU VALLIKAVU, KOLABHAGATHU JUNCTION, VALLIKKAVU, NEAR BSM CLINIC, KOLLAM, KERALA, 690525', 'KERALA', 'KOLLAM', 'AGLPC8279Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AQHPD0639D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AQHPD0639D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX21496', 'AIRVOICE MOBILE SHOP', 'BIKRAM KESHARI DALAI', 'dalaibikram10@gmail.com', '9778888188', '752031', 'BANPUR, BANPUR, TULASIDEIPUR, COLLEGE ROAD, KHORDA, ODISHA, 752031', 'ODISHA', 'KHORDA', 'AQHPD0639D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'HWYPS9954J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'HWYPS9954J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX21530', 'AMAN COMPUTER CENTAR', 'SONARUDDIN SEKH', 'amanullasekh93@gmaii.com', '9064865307', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'HWYPS9954J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BNJPG3497C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BNJPG3497C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX21603', 'DIVINE ONLINE SOLUTIONS', 'ATHIRA O G', 'athiragopi122@gmail.com', '9656685929', '670721', 'NADAVAYAL, WAYANAD, , , WAYANAD, KERALA, 670721', 'KERALA', 'WAYANAD', 'BNJPG3497C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DCYPP6242Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DCYPP6242Q' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX21735', 'SOUMEN ENTERPRISE', 'SOUMEN PRAMANIK', 'soumenpramanik7098@gmail.com', '7908637104', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DCYPP6242Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AYRPT9021B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AYRPT9021B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX21748', 'GROKH SEVA KENDRA', 'CHANCHAL TUDU', 'santaliweb@gmail.com', '7318955244', '712146', 'GAZINADASPUR, GAZINADASPUR , , , HOOGHLY, WEST BENGAL, 712146', 'WEST BENGAL', 'HOOGHLY', 'AYRPT9021B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AGUPA9317J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AGUPA9317J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX21860', 'RANJIT ADHIKARY', 'RANJIT ADHIKARY', 'RANJITADHIKARY014@GMAIL.COM', '9231514878', '743355', 'KAROLA, KAROLA, , , JORHAT, ASSAM, 743355', 'ASSAM', 'JORHAT', 'AGUPA9317J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DARPS5851R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DARPS5851R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX21873', 'MANNA ONLINE POINT', 'NURUL SARKAR', 'MANNASARKAR7029@GMAIL.COM', '9832347075', '732124', 'MASHIMPUR,BABUPUR, GAZOLE,MALDA, WEST BENGAL, 732124, MALDA, WEST BENGAL, 732124', 'WEST BENGAL', 'MALDA', 'DARPS5851R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CLKPR8287F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CLKPR8287F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX21956', 'ABHIS DTH CARE', 'RADHAKRISNAN R', 'rrkndth@gmail.com', '9846851460', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'CLKPR8287F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'JESPS5798J' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'JESPS5798J' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX23045', 'MAOLANA ONLINE CENTRE', 'MD SALAUDDIN MOLLA', 'mdsalauddinmolla02061996@gmail.com', '7029750954', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'JESPS5798J', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CRCPP1129G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CRCPP1129G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX23549', 'SEVA POINT', 'SUBRATA PAUL', 'TRAININGHUB66@GMAIL.COM', '8348442845', '733158', 'PARIAL, ATRAI, , , DAKSHIN DINAJPUR, WEST BENGAL, 733158', 'WEST BENGAL', 'DAKSHIN DINAJPUR', 'CRCPP1129G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DGQPS1922C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DGQPS1922C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX23578', 'SARKAR MOBILE', 'PALASH SARKAR', 'palashsarkar769941@gmail.com', '7699412500', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'DGQPS1922C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CNZPD1712L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CNZPD1712L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX01234', 'DUTTA CYBER POINT', 'SUBHAM DUTTA', 'dsubham995@gmail.com', '8145633177', '722141', 'JALITHA, KOTULPUR, BANKURA, , BANKURA, WEST BENGAL, 722141', 'WEST BENGAL', 'BANKURA', 'CNZPD1712L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CPVPM8104F' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CPVPM8104F' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX01526', 'SUBRATA MALLICK', 'SUBRATA MALLICK', 'MALLICK.SUBRATA.05@GMAIL.COM', '9775566406', '743235', 'ANGARPUKURIA, GHATBAOR, BONGAON, , NORTH 24 PARGANAS, WEST BENGAL, 743235', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'CPVPM8104F', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ARWPB0272G' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ARWPB0272G' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX01529', 'DIPANKAR BISWAS', 'DIPANKAR BISWAS', 'KRISHNASTUDIODIP@GMAIL.COM', '9153747103', '743235', 'SHUKPUKUR, GHATBAOR, , , GAYA, BIHAR, 743235', 'BIHAR', 'GAYA', 'ARWPB0272G', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BDUPM0047H' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BDUPM0047H' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX01532', 'SMONLINE', 'SUJIT MONDAL', 'smsujit1982educare@gmail.com', '9734411666', '743251', 'PATSHIMULIA, PATSHIMULIA, BONGAON, NORTH 24 PARGANAS, NORTH 24 PARGANAS, WEST BENGAL, 743251', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'BDUPM0047H', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FHMPR7742L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FHMPR7742L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX01729', 'EI SOLUTIONS JANASEVANA KENDRAM', 'RAJESH P R', 'rajeshrajappan867@gmail.com', '8157087895', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'FHMPR7742L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'FEKPM5393R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'FEKPM5393R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX01965', 'MEHTAZ CYBER CAFE', 'SAHRUKH MIAH', 'sahrukhmiah765@gmail.com', '7478609101', '736167', 'NAGAR GIDARI , CHAMTA , PANIKHAWA , SITAI , COOCH BEHAR, WEST BENGAL, 736167', 'WEST BENGAL', 'COOCH BEHAR', 'FEKPM5393R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CXQPS9170Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CXQPS9170Q' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX02139', 'SAIDTP ONLINE', 'SANJOY KUMAR SAHU', 'saidtp2018@gmail.com', '9777408514', NULL, 'null, null, null, null, null, ODISHA, null', 'ODISHA', NULL, 'CXQPS9170Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AMKPB9097Q' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AMKPB9097Q' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX02174', 'SABAREENADH K B', 'SABAREENADH K B', 'kollayilkollayil08@gmail.com', '8075621595', '691541', 'MAHALEKSHMI, KOLLAYIL, , , KOLLAM, KERALA, 691541', 'KERALA', 'KOLLAM', 'AMKPB9097Q', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'ASAPP2977M' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'ASAPP2977M' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX02438', 'SAI COMMUNICATION', 'VIRAJSUBUDHI', 'virajsubudhi@gmail.com', '9438071400', NULL, 'null, null, null, null, null, ODISHA, null', 'ODISHA', NULL, 'ASAPP2977M', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'APWPR5596R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'APWPR5596R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX02463', 'GOPAL ROY', 'GOPAL ROY', 'ACTIVE24EPOINT@GMAIL.COM', '7076074764', '743701', 'SRIMANTAPUR, SULKADURGAPUR, GOPALNAGAR, 743701, NORTH 24 PARGANAS, WEST BENGAL, 743701', 'WEST BENGAL', 'NORTH 24 PARGANAS', 'APWPR5596R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT NULL AS user_id, NULL AS admin_id, 'ANNECHM-ANNEX02695', 'SHYAMAL BISWAS', 'SHYAMAL BISWAS', 'shyamal021999@gmail.com', '7384893274', '743405', 'KHALITPUR, BONGAON, KHALITPUR, , NORTH 24 PARGANAS, WEST BENGAL, 743405', 'WEST BENGAL', 'NORTH 24 PARGANAS', NULL, 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'NHLPS9282R' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'NHLPS9282R' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX02831', 'SAHA TELECOME', 'SAYANTAN SAHA', 'Sahasayantan09@gmail.com', '6295421552', '741165', 'NARAYANPUR, AMIYA NARAYANPUR, THANARPARA, , NADIA, WEST BENGAL, 741165', 'WEST BENGAL', 'NADIA', 'NHLPS9282R', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'EJPPS9121E' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'EJPPS9121E' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX02958', 'AKSHARA COMPUTERS', 'SHANI ABDUL BASHEER', 'bashirshani@gmail.com', '9188886543', '691533', 'EDAMULACKAL , EDAMULACKAL AYUR, , , KOLLAM, KERALA, 691533', 'KERALA', 'KOLLAM', 'EJPPS9121E', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BOKPM8107B' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BOKPM8107B' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX02986', 'NETAI ONLINE CENTER', 'NETAI MAHANTA', 'netaigrp@gmail.com', '9932324679', NULL, 'null, null, null, null, null, WEST BENGAL, null', 'WEST BENGAL', NULL, 'BOKPM8107B', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'DEDPM8548P' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'DEDPM8548P' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX03265', 'SUBRATA MANDAL', 'SUBRATA MANDAL', 'sm1421499@gmail.com', '9564767336', '743251', 'TANKSHALI, TANKSHALI, TANKSHALI, , ERNAKULAM, KERALA, 743251', 'KERALA', 'ERNAKULAM', 'DEDPM8548P', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'CFDPR4695L' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'CFDPR4695L' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX03576', 'NANDANAM EI SOLUTIONS', 'MANURAJ', 'manuraj7672@gmail.om', '9562361109', NULL, 'null, null, null, null, null, KERALA, null', 'KERALA', NULL, 'CFDPR4695L', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'BKMPA1469C' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'BKMPA1469C' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX03697', 'A2ZSOLUTIONS', 'AMJITH M', 'manu.vadamon@gmail.com', '8086368299', '691306', 'VRINDAVANAM, VADAMON PO, , , KOLLAM, KERALA, 691306', 'KERALA', 'KOLLAM', 'BKMPA1469C', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();

INSERT INTO `uti_psa_agents` (`user_id`, `admin_id`, `agent_id`, `name`, `contact_person`, `email`, `mobile_no`, `pin`, `location`, `state`, `district`, `pan_no`, `status`, `created_at`, `updated_at`)
SELECT (SELECT u.id FROM aeps_drafts ad JOIN users u ON u.mid = ad.mid WHERE UPPER(TRIM(ad.pan_no)) = 'AXRPA0572D' LIMIT 1) AS user_id, (SELECT ad.admin_id FROM aeps_drafts ad WHERE UPPER(TRIM(ad.pan_no)) = 'AXRPA0572D' LIMIT 1) AS admin_id, 'ANNECHM-ANNEX03715', 'ALR SOLUTIONS', 'ABDUL RAFEEK', 'ALREIMDR@GMAIL.COM', '9526560171', '695602', 'MAVINMOODU , MADAVOOR, M, , THIRUVANANTHAPURAM, KERALA, 695602', 'KERALA', 'THIRUVANANTHAPURAM', 'AXRPA0572D', 1, NOW(), NOW()
ON DUPLICATE KEY UPDATE `status` = 1, `name` = VALUES(`name`), `email` = VALUES(`email`), `mobile_no` = VALUES(`mobile_no`), `updated_at` = NOW();