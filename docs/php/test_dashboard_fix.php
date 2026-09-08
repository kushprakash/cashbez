<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\DashboardController;

// Create a mock user with role 2 (admin)
$mockUser = new User();
$mockUser->id = 16;
$mockUser->mid = 'ADMIN001';
$mockUser->role = 2;
$mockUser->name = 'Test Admin';

// Create a mock request
$request = new Request();
$request->attributes->set('user', $mockUser);

// Test the dashboard controller
$controller = new DashboardController();

try {
    echo "Testing dashboard with fixed admin_mid column...\n";
    
    // This should work now without the admin_id error
    $response = $controller->index($request);
    
    $data = $response->getData(true);
    
    if ($data['status'] == 1) {
        echo "✅ Dashboard data fetched successfully!\n";
        echo "Message: " . $data['message'] . "\n";
        
        // Check if user stats are included for admin role
        if (isset($data['data']['users'])) {
            echo "✅ User statistics included for admin role\n";
        } else {
            echo "❌ User statistics missing\n";
        }
        
    } else {
        echo "❌ Dashboard failed: " . $data['message'] . "\n";
        if (isset($data['error'])) {
            echo "Error: " . $data['error'] . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Exception occurred: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
}

echo "\nTest completed.\n";