<?php

try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=laravel', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== ALL TABLES IN DATABASE ===\n\n";
    
    // Get all tables
    $result = $pdo->query("SHOW TABLES");
    $tables = $result->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Total tables created: " . count($tables) . "\n\n";
    
    foreach ($tables as $index => $table) {
        echo sprintf("%2d. %s\n", $index + 1, $table);
    }
    
    echo "\n=== TABLE CATEGORIES ===\n\n";
    
    // Categorize tables
    $categories = [
        'Core System' => ['users', 'cache', 'jobs', 'personal_access_tokens', 'migrations'],
        'Modules & Permissions' => ['modules', 'sub_modules', 'module_permissions', 'role_module_permissions', 'user_role_permissions', 'module_commissions', 'user_role_commissions', 'role_module_commission'],
        'Roles & Auth' => ['roles', 'otps'],
        'Subscriptions' => ['subscriptions', 'subscription_masters', 'role_subscription_masters'],
        'Settings' => ['settings'],
        'HR Management' => ['departments', 'designations', 'employees', 'attendance', 'leaves', 'salaries', 'payrolls', 'salary_payments', 'payslips'],
        'User Management' => ['user_kyc'],
        'Lead Management' => ['lead_types', 'lead_sources', 'lead_status', 'leads', 'lead_transfer_logs', 'lead_activities', 'followups', 'custom_fields', 'lead_custom_values', 'followup_types', 'followup_statuses'],
        'Email System' => ['email_threads', 'emails', 'email_recipients', 'email_attachments'],
        'Financial System' => ['accounts', 'passbooks', 'recharges'],
        'Utility Services' => ['utility_operators']
    ];
    
    foreach ($categories as $category => $categoryTables) {
        echo "📁 $category:\n";
        foreach ($categoryTables as $table) {
            if (in_array($table, $tables)) {
                echo "   ✅ $table\n";
            }
        }
        echo "\n";
    }
    
    echo "=== SAMPLE DATA CHECK ===\n\n";
    
    // Check which tables have data
    $tablesWithData = [];
    foreach ($tables as $table) {
        try {
            $result = $pdo->query("SELECT COUNT(*) as count FROM `$table`");
            $count = $result->fetch()['count'];
            if ($count > 0) {
                $tablesWithData[$table] = $count;
            }
        } catch (Exception $e) {
            // Skip if there's an error
        }
    }
    
    if (!empty($tablesWithData)) {
        echo "Tables with data:\n";
        foreach ($tablesWithData as $table => $count) {
            echo "  📊 $table: $count records\n";
        }
    } else {
        echo "No tables have data yet (all empty).\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
