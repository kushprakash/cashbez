<?php

$file = 'clean_utility_operators.sql';
$content = file_get_contents($file);

// Find the INSERT statement
$insertPos = strpos($content, 'INSERT INTO');
if ($insertPos === false) {
    die("No INSERT statement found\n");
}

$sqlOnly = substr($content, $insertPos);

// Write only the SQL part
file_put_contents('utility_operators_final.sql', $sqlOnly);

echo "Extracted SQL-only file: utility_operators_final.sql\n";

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
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
