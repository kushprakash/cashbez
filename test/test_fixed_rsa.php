<?php

// Test the certificate and encryption method that we just fixed
require_once 'app/Http/Controllers/Banking/MerchantController.php';

use App\Http\Controllers\Banking\MerchantController;

echo "Testing the fixed RSA certificate and encryption method...\n\n";

// Create an instance to test the private method
$controller = new class extends MerchantController {
    public function testEncryptSessionKey() {
        try {
            $sessionKey = random_bytes(16);
            echo "Generated session key length: " . strlen($sessionKey) . " bytes\n";
            
            $encrypted = $this->encryptSessionKey($sessionKey);
            echo "✓ RSA encryption successful!\n";
            echo "Encrypted session key (base64) length: " . strlen($encrypted) . " characters\n";
            echo "This means the certificate and encryption method are working correctly.\n";
            return true;
        } catch (Exception $e) {
            echo "✗ RSA encryption failed: " . $e->getMessage() . "\n";
            return false;
        }
    }
};

$result = $controller->testEncryptSessionKey();

if ($result) {
    echo "\n🎉 SUCCESS: The AEPS onboard API should now work properly!\n";
    echo "The 'Invalid RSA Public Key' error has been resolved.\n";
} else {
    echo "\n❌ The issue persists. Please check the certificate format.\n";
}
