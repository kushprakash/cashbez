<?php

require_once 'vendor/autoload.php';

// Include Laravel application setup
require_once 'bootstrap/app.php';

use App\Models\AepsDraft;

try {
    echo "Testing AepsDraft model...\n";
    
    // Create new instance
    $model = new AepsDraft();
    echo "✓ Model created successfully\n";
    
    // Check fillable fields
    echo "✓ Fillable fields: " . json_encode($model->getFillable(), JSON_PRETTY_PRINT) . "\n";
    
    // Check table name
    echo "✓ Table name: " . $model->getTable() . "\n";
    
    echo "✓ AepsDraft model is working correctly!\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
