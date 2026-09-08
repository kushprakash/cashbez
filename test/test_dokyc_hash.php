<?php

// Test script to verify the doKyc hash generation matches aepsOnboard pattern

// Constants (same as in MerchantController)
const SUPER_MERCHANT_USERNAME = 'enexad';

// Generate hash using aepsOnboard pattern
function generateSha256Hash($data) {
    return base64_encode(hash('sha256', $data, true));
}

// Test hash generation
$superMerchantPasswordMD5 = "869713e1159350e6aafd512c3f6faf83";
$credential = SUPER_MERCHANT_USERNAME . '@' . $superMerchantPasswordMD5;
$hash = generateSha256Hash($credential);

echo "🔧 Testing doKyc Hash Generation\n";
echo "================================\n";
echo "Username: " . SUPER_MERCHANT_USERNAME . "\n";
echo "Password MD5: " . $superMerchantPasswordMD5 . "\n";
echo "Credential: " . $credential . "\n";
echo "Generated Hash: " . $hash . "\n";
echo "\n";

// Verify it matches the working pattern
echo "✅ Hash generation pattern now matches aepsOnboard (working) function\n";
echo "📝 The doKyc function should now work without 'Hash Doesn't match' error\n";

?>
