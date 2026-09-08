<?php

$cert = '-----BEGIN CERTIFICATE-----
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
-----END CERTIFICATE-----';

echo "Testing certificate validation...\n";

// Method 1: Try to get public key directly from certificate (current approach)
$publicKey1 = openssl_pkey_get_public($cert);
if ($publicKey1) {
    echo "✓ Method 1: Direct public key extraction from certificate - SUCCESS\n";
    $sessionKey = random_bytes(16);
    if (openssl_public_encrypt($sessionKey, $encrypted, $publicKey1, OPENSSL_PKCS1_PADDING)) {
        echo "✓ Method 1: RSA encryption test - SUCCESS\n";
    } else {
        echo "✗ Method 1: RSA encryption test - FAILED\n";
    }
} else {
    echo "✗ Method 1: Direct public key extraction from certificate - FAILED\n";
    echo "Error: " . openssl_error_string() . "\n";
}

// Method 2: Extract public key from certificate properly
$cert_resource = openssl_x509_read($cert);
if ($cert_resource) {
    echo "✓ Method 2: Certificate parsing - SUCCESS\n";
    
    $public_key = openssl_pkey_get_public($cert_resource);
    if ($public_key) {
        echo "✓ Method 2: Public key extraction from parsed certificate - SUCCESS\n";
        
        $details = openssl_pkey_get_details($public_key);
        echo "Key type: " . $details['type'] . "\n";
        echo "Key bits: " . $details['bits'] . "\n";
        
        // Test encryption
        $sessionKey = random_bytes(16);
        if (openssl_public_encrypt($sessionKey, $encrypted, $public_key, OPENSSL_PKCS1_PADDING)) {
            echo "✓ Method 2: RSA encryption test - SUCCESS\n";
            echo "Encrypted session key length: " . strlen($encrypted) . " bytes\n";
            echo "Base64 encoded length: " . strlen(base64_encode($encrypted)) . " chars\n";
        } else {
            echo "✗ Method 2: RSA encryption test - FAILED\n";
            echo "Error: " . openssl_error_string() . "\n";
        }
    } else {
        echo "✗ Method 2: Public key extraction from parsed certificate - FAILED\n";
        echo "Error: " . openssl_error_string() . "\n";
    }
} else {
    echo "✗ Method 2: Certificate parsing - FAILED\n";
    echo "Error: " . openssl_error_string() . "\n";
}

echo "\nCertificate details:\n";
$cert_info = openssl_x509_parse($cert);
if ($cert_info) {
    echo "Subject: " . $cert_info['subject']['CN'] . "\n";
    echo "Issuer: " . $cert_info['issuer']['CN'] . "\n";
    echo "Valid from: " . date('Y-m-d H:i:s', $cert_info['validFrom_time_t']) . "\n";
    echo "Valid to: " . date('Y-m-d H:i:s', $cert_info['validTo_time_t']) . "\n";
    
    // Check if certificate is expired
    if (time() > $cert_info['validTo_time_t']) {
        echo "⚠️  WARNING: Certificate has EXPIRED!\n";
    } else {
        echo "✓ Certificate is still valid\n";
    }
}
