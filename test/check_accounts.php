<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Account;
use App\Models\User;

echo "=== Account Debug Information ===\n";

$accounts = Account::all();
foreach ($accounts as $account) {
    echo "Account ID: {$account->id}\n";
    echo "User ID: {$account->user_id}\n";
    echo "Balance: {$account->balance}\n";
    echo "Status: {$account->status}\n";
    echo "Has MPIN: " . ($account->hasMpin() ? 'Yes' : 'No') . "\n";
    echo "Hold Amount: {$account->hold_amount}\n";
    echo "---\n";
}

echo "\n=== User Information ===\n";
$users = User::all();
foreach ($users as $user) {
    echo "User ID: {$user->id}\n";
    echo "Name: {$user->name}\n";
    echo "Email: {$user->email}\n";
    echo "---\n";
}
