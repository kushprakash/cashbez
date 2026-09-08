<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    // Get column information
    $columns = \DB::select("PRAGMA table_info(passbooks)");
    
    echo "Passbooks table structure:\n";
    echo "Column Name | Type | Not Null | Default | Primary Key\n";
    echo "------------------------------------------------------\n";
    
    foreach ($columns as $column) {
        echo sprintf("%-12s | %-8s | %-8s | %-7s | %-11s\n", 
            $column->name, 
            $column->type, 
            $column->notnull ? 'YES' : 'NO',
            $column->dflt_value ?? 'NULL',
            $column->pk ? 'YES' : 'NO'
        );
    }
    
    // Check if transaction_id column exists
    $hasTransactionId = false;
    $hasDescription = false;
    $hasDetails = false;
    
    foreach ($columns as $column) {
        if ($column->name === 'transaction_id') {
            $hasTransactionId = true;
        }
        if ($column->name === 'description') {
            $hasDescription = true;
        }
        if ($column->name === 'details') {
            $hasDetails = true;
        }
    }
    
    echo "\nVerification Results:\n";
    echo "transaction_id column exists: " . ($hasTransactionId ? "YES ✓" : "NO ✗") . "\n";
    echo "description column exists: " . ($hasDescription ? "YES ✓" : "NO ✗") . "\n";
    echo "details column exists: " . ($hasDetails ? "NO ✓" : "YES ✗ (should not exist)") . "\n";
    
    if ($hasTransactionId && $hasDescription && !$hasDetails) {
        echo "\n✅ Migration successful! All changes applied correctly.\n";
    } else {
        echo "\n❌ Migration issues detected.\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
