<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=laravel', 'root', '');
    $result = $pdo->query('SHOW CREATE TABLE utility_operators');
    $row = $result->fetch();
    echo "Table structure:\n";
    echo $row[1];
    echo "\n\n";
    
    // Also check indexes
    $result = $pdo->query('SHOW INDEX FROM utility_operators');
    echo "Indexes:\n";
    while ($row = $result->fetch()) {
        echo "Key: " . $row['Key_name'] . ", Column: " . $row['Column_name'] . ", Unique: " . ($row['Non_unique'] ? 'No' : 'Yes') . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
