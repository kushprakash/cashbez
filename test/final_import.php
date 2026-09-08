<?php

$file = 'clean_utility_operators.sql';
$content = file_get_contents($file);

// Find the INSERT statement and extract from there
$lines = explode("\n", $content);
$sqlLines = [];
$startFound = false;

foreach ($lines as $line) {
    if (strpos($line, 'INSERT INTO') !== false) {
        $startFound = true;
    }
    
    if ($startFound) {
        $sqlLines[] = $line;
    }
}

$sqlOnly = implode("\n", $sqlLines);

// Write only the SQL part
file_put_contents('utility_operators_final.sql', $sqlOnly);

echo "Extracted SQL file created: utility_operators_final.sql\n";

// Now import it
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=laravel', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $result = $pdo->exec($sqlOnly);
    echo "Records inserted: $result\n";
    
    // Verify the data
    $result = $pdo->query('SELECT COUNT(*) as count FROM utility_operators');
    $count = $result->fetch()['count'];
    echo "Total records in table: $count\n";
    
    // Show some sample data
    $result = $pdo->query('SELECT type, code, name FROM utility_operators LIMIT 5');
    echo "\nSample records:\n";
    while ($row = $result->fetch()) {
        echo "Type: {$row['type']}, Code: {$row['code']}, Name: {$row['name']}\n";
    }
    
    // Test the composite unique constraint
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
