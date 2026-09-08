<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = DB::table('users')->select('id', 'name', 'mid', 'role', 'root', 'refer_by')->get();
echo "USERS COUNT: " . count($users) . "\n";
echo json_encode($users, JSON_PRETTY_PRINT);
