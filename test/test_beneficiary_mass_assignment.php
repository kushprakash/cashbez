<?php

require_once 'vendor/autoload.php';

use App\Models\Beneficiary;

// Load Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing Beneficiary mass assignment...\n";

// Check fillable properties
$beneficiary = new Beneficiary();
$fillable = $beneficiary->getFillable();

echo "Fillable properties:\n";
foreach ($fillable as $property) {
    echo "- $property\n";
}

echo "\nIs user_id fillable? " . (in_array('user_id', $fillable) ? 'YES' : 'NO') . "\n";

// Test creating with data
try {
    $testData = [
        'user_id' => 1,
        'name' => 'Test Beneficiary',
        'account' => '1234567890',
        'ifsc' => 'TEST0001234',
        'branch' => 'Test Branch'
    ];
    
    echo "\nTest data:\n";
    print_r($testData);
    
    // Just test the mass assignment without actually saving
    $beneficiary = new Beneficiary($testData);
    echo "\nMass assignment successful!\n";
    echo "Beneficiary user_id: " . $beneficiary->user_id . "\n";
    
} catch (Exception $e) {
    echo "\nError during mass assignment: " . $e->getMessage() . "\n";
}
