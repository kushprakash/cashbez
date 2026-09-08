<?php

// Test the PAN verification API directly
$mid = "G195064846";
$mkey = "PRA3948146";
$wallet = "G53BD90U9F612K83574F1";
$txnid = rand(11111111, 99999999);
$pan_no = "AAAAA1111A"; // Test PAN - replace with actual PAN

$url = "https://dashboard.goterpay.com/api/v3/verification/panvalidate?mid=$mid&mkey=$mkey&subwallet=$wallet&txnid=$txnid&pancard=" . urlencode($pan_no);

echo "Testing PAN API\n";
echo "URL: $url\n\n";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
$curlErrorNo = curl_errno($ch);

curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Curl Error: $curlError\n";
echo "Curl Error No: $curlErrorNo\n";
echo "Response:\n";
var_dump($response);
echo "\n\nDecoded Response:\n";
var_dump(json_decode($response, true));
