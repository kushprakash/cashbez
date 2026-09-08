<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $tables = DB::select('SHOW TABLES');
    echo "ALL TABLES MATCHING 'log':\n";
    foreach ($tables as $t) {
        $props = get_object_vars($t);
        $tableName = reset($props);
        if (str_contains(strtolower($tableName), 'log')) {
            echo "-> " . $tableName . "\n";
            $columns = Schema::getColumnListing($tableName);
            echo "   Columns: " . implode(', ', $columns) . "\n";
            $count = DB::table($tableName)->count();
            echo "   Row count: $count\n";
        }
    }
    
    echo "\nCHECKING IF 'logs' TABLE EXISTS:\n";
    if (Schema::hasTable('logs')) {
        echo "Table 'logs' EXISTS!\n";
        $columns = Schema::getColumnListing('logs');
        echo "Columns: " . implode(', ', $columns) . "\n";
    } else {
        echo "Table 'logs' does NOT exist in database 'bharat-pay'.\n";
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
