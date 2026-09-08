<?php

$file = 'clean_utility_operators.sql';
$content = file_get_contents($file);

echo "File size: " . strlen($content) . " bytes\n";

// Find the INSERT statement line number
$lines = explode("\n", $content);
echo "Total lines: " . count($lines) . "\n";

for ($i = 0; $i < count($lines); $i++) {
    if (strpos($lines[$i], 'INSERT INTO') !== false) {
        echo "Found INSERT statement at line: " . ($i + 1) . "\n";
        echo "Line content: " . $lines[$i] . "\n";
        
        // Extract from this line onwards
        $sqlLines = array_slice($lines, $i);
        $sqlOnly = implode("\n", $sqlLines);
        
        echo "SQL content length: " . strlen($sqlOnly) . " bytes\n";
        echo "First 200 chars: " . substr($sqlOnly, 0, 200) . "\n";
        
        file_put_contents('utility_operators_final.sql', $sqlOnly);
        echo "File written successfully\n";
        break;
    }
}
?>
