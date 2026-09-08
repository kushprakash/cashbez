<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Include the helper function
require_once 'app/Helpers/TransactionHelper.php';

// Mock request class for testing
class MockRequest {
    private $data = [];
    private $user = null;
    
    public function __construct($data = [], $user = null) {
        $this->data = $data;
        $this->user = $user;
    }
    
    public function input($key, $default = null) {
        return $this->data[$key] ?? $default;
    }
    
    public function all() {
        return $this->data;
    }
    
    public function only($keys) {
        $result = [];
        foreach ((array)$keys as $key) {
            if (isset($this->data[$key])) {
                $result[$key] = $this->data[$key];
            }
        }
        return $result;
    }
    
    public function user() {
        return $this->user;
    }
    
    public function get($key) {
        return $this->data[$key] ?? null;
    }
}

// Create a mock user
$mockUser = (object) ['id' => 1];

// Test data
$requestData = [
    'account_id' => 1,
    'mpin' => '1234',
    'amount' => 100.00,
    'user' => $mockUser
];

$transactionData = [
    'account_id' => 1,
    'type' => 'DR',
    'amount' => 100.00,
    'description' => 'Test transaction',
    'transaction_id' => 'TEST-' . time()
];

// Create mock request
$request = new MockRequest($requestData, $mockUser);

echo "=== Starting Transaction Debug Test ===\n";
echo "Request Data: " . json_encode($requestData, JSON_PRETTY_PRINT) . "\n";
echo "Transaction Data: " . json_encode($transactionData, JSON_PRETTY_PRINT) . "\n";

try {
    // Test processTransaction
    echo "\n=== Calling processTransaction ===\n";
    $result = processTransaction($request, $transactionData);
    
    echo "Result: " . json_encode($result, JSON_PRETTY_PRINT) . "\n";
    
    // Check if there are any accounts in the database
    echo "\n=== Database Check ===\n";
    $accountCount = \App\Models\Account::count();
    echo "Total accounts in database: {$accountCount}\n";
    
    if ($accountCount > 0) {
        $firstAccount = \App\Models\Account::first();
        echo "First account details:\n";
        echo "ID: {$firstAccount->id}\n";
        echo "User ID: {$firstAccount->user_id}\n";
        echo "Balance: {$firstAccount->balance}\n";
        echo "Status: {$firstAccount->status}\n";
        echo "Has MPIN: " . ($firstAccount->hasMpin() ? 'Yes' : 'No') . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== Test Completed ===\n";
