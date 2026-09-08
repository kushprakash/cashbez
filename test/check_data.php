<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$app->boot();

// Get database connection
$pdo = new PDO('mysql:host=127.0.0.1;dbname=laravel', 'root', '');

echo "Database Tables and Row Counts:\n";
echo "================================\n";

$tables = [
    'main_modules',
    'modules', 
    'sub_modules',
    'users',
    'roles',
    'module_permissions',
    'module_commissions',
    'role_module_permissions',
    'role_module_commissions',
    'user_role_permissions',
    'user_role_commissions',
    'subscriptions',
    'subscription_masters'
];

foreach ($tables as $table) {
    try {
        $stmt = $pdo->query("SELECT COUNT(*) FROM `$table`");
        $count = $stmt->fetchColumn();
        echo sprintf("%-25s: %d rows\n", $table, $count);
    } catch (Exception $e) {
        echo sprintf("%-25s: Error - %s\n", $table, $e->getMessage());
    }
}

echo "\nSample Data from main_modules:\n";
echo "==============================\n";
$stmt = $pdo->query("SELECT * FROM main_modules");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "ID: {$row['id']}, Name: {$row['name']}, Status: {$row['status']}\n";
}

echo "\nSample Data from modules:\n";  
echo "=========================\n";
$stmt = $pdo->query("SELECT * FROM modules");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "ID: {$row['id']}, Main Module ID: {$row['main_module_id']}, Name: {$row['name']}, Status: {$row['status']}\n";
}
