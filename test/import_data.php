<?php

try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=laravel', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $sql = file_get_contents('clean_utility_operators.sql');
    
    // Split the file by semicolons to execute each statement separately
    $statements = explode(';', $sql);
    
    $inserted = 0;
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (empty($statement) || substr($statement, 0, 2) === '--') {
            continue;
        }
        
        try {
            $result = $pdo->exec($statement);
            if ($result !== false) {
                $inserted += $result;
            }
            echo "Executed statement successfully\n";
        } catch (Exception $e) {
            echo "Error executing statement: " . $e->getMessage() . "\n";
            echo "Statement: " . substr($statement, 0, 100) . "...\n";
        }
    }
    
    echo "\nTotal records inserted: $inserted\n";
    
    // Verify the data
    $result = $pdo->query('SELECT COUNT(*) as count FROM utility_operators');
    $count = $result->fetch()['count'];
    echo "Total records in table: $count\n";
    
} catch (Exception $e) {
    echo "Database connection error: " . $e->getMessage() . "\n";
}
