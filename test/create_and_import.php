<?php

$file = 'c:\Users\admin\Downloads\electricity_boards.sql';
$content = file_get_contents($file);

// Extract INSERT statements and create clean records
preg_match_all('/\((\d+), \'([^\']+)\', \'([^\']*)\', \'([^\']+)\', \'([^\']+)\', \'([^\']+)\', \'([^\']+)\', \'([^\']+)\'\)/', $content, $matches, PREG_SET_ORDER);

$combinations = [];
$unique_records = [];

foreach ($matches as $match) {
    $type = $match[2];
    $state = $match[3];
    $code = $match[4];
    $name = $match[5];
    $category = $match[6];
    $label = $match[7];
    $icon = $match[8];
    
    // Create combination key for uniqueness check
    $combo_key = $type . '|' . $code . '|' . $category;
    
    if (!isset($combinations[$combo_key])) {
        $combinations[$combo_key] = true;
        $unique_records[] = [
            'type' => $type,
            'state' => $state,
            'code' => $code,
            'name' => $name,
            'category' => $category,
            'label' => $label,
            'icon' => $icon
        ];
    }
}

echo "Creating clean SQL file...\n";
echo "Total unique records: " . count($unique_records) . "\n";

// Create SQL file
$sql = "INSERT INTO `utility_operators` (`type`, `state`, `code`, `name`, `category`, `label`, `icon`, `is_active`, `created_at`, `updated_at`) VALUES\n";

$values = [];
foreach ($unique_records as $record) {
    $type = addslashes($record['type']);
    $state = addslashes($record['state']);
    $code = addslashes($record['code']);
    $name = addslashes($record['name']);
    $category = addslashes($record['category']);
    $label = addslashes($record['label']);
    $icon = addslashes($record['icon']);
    
    $values[] = "('{$type}', '{$state}', '{$code}', '{$name}', '{$category}', '{$label}', '{$icon}', 1, NOW(), NOW())";
}

$sql .= implode(",\n", $values) . ";";

file_put_contents('import_utility_operators.sql', $sql);

echo "SQL file created: import_utility_operators.sql\n";

// Now import it
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=laravel', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Importing data...\n";
    $result = $pdo->exec($sql);
    echo "Records inserted: $result\n";
    
    // Verify the data
    $result = $pdo->query('SELECT COUNT(*) as count FROM utility_operators');
    $count = $result->fetch()['count'];
    echo "Total records in table: $count\n";
    
    // Show some sample data
    echo "\nSample records:\n";
    $result = $pdo->query('SELECT type, code, name FROM utility_operators LIMIT 5');
    while ($row = $result->fetch()) {
        echo "Type: {$row['type']}, Code: {$row['code']}, Name: {$row['name']}\n";
    }
    
    // Test that the composite unique constraint is working
    echo "\nTesting composite unique constraint...\n";
    $result = $pdo->query("SELECT type, code, category, COUNT(*) as cnt FROM utility_operators GROUP BY type, code, category HAVING cnt > 1");
    $duplicates = $result->fetchAll();
    if (empty($duplicates)) {
        echo "✅ No duplicate combinations found - constraint working correctly!\n";
    } else {
        echo "❌ Found duplicate combinations:\n";
        foreach ($duplicates as $dup) {
            echo "  {$dup['type']}|{$dup['code']}|{$dup['category']} appears {$dup['cnt']} times\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
