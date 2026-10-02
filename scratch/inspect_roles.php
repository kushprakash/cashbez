<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$roles = DB::table('roles')->get(['id', 'name', 'user_id', 'status']);
echo json_encode($roles, JSON_PRETTY_PRINT);
