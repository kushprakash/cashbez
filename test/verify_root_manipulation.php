<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Role;

// Find a user with root string
$user = User::whereNotNull('root')->where('root', '!=', '')->first();
if (!$user) {
    echo "No user with root found.\n";
    exit;
}

echo "TESTING ROOT MANIPULATION FOR USER ID: {$user->id} ({$user->name}, MID: {$user->mid})\n";
echo "CURRENT ROOT STRING: {$user->root}\n";

$rootIds = array_values(array_filter(array_map('trim', explode(',', $user->root))));
echo "EXPLODED ROOT IDS: " . json_encode($rootIds) . "\n";

$chainUsers = User::whereIn('id', $rootIds)->get()->keyBy('id');
$rootChain = [];
foreach ($rootIds as $rId) {
    if (isset($chainUsers[$rId])) {
        $cu = $chainUsers[$rId];
        $rName = Role::where('id', $cu->role)->value('name')
            ?? Role::where('id', $cu->role_id)->value('name')
            ?? ('Role #' . $cu->role);
        $rootChain[] = [
            'id' => (int) $cu->id,
            'mid' => $cu->mid,
            'name' => $cu->name,
            'role' => (int) $cu->role,
            'role_name' => $rName
        ];
    }
}

echo "PARSED ROOT CHAIN:\n" . json_encode($rootChain, JSON_PRETTY_PRINT) . "\n";
