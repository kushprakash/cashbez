<?php

$file = 'c:\Users\admin\Downloads\electricity_boards.sql';
$content = file_get_contents($file);

// Extract all INSERT statements
preg_match_all('/\((\d+), \'([^\']+)\', \'([^\']*)\', \'([^\']+)\', \'([^\']+)\', \'([^\']+)\', \'([^\']+)\', \'([^\']+)\'\)/', $content, $matches, PREG_SET_ORDER);

$codes = [];
$duplicates = [];

foreach ($matches as $match) {
    $id = $match[1];
    $type = $match[2];
    $state = $match[3];
    $code = $match[4];
    $name = $match[5];
    
    if (isset($codes[$code])) {
        if (!isset($duplicates[$code])) {
            $duplicates[$code] = [$codes[$code]];
        }
        $duplicates[$code][] = [
            'id' => $id,
            'type' => $type,
            'state' => $state,
            'name' => $name
        ];
    } else {
        $codes[$code] = [
            'id' => $id,
            'type' => $type,
            'state' => $state,
            'name' => $name
        ];
    }
}

echo "Duplicate codes found:\n";
foreach ($duplicates as $code => $records) {
    echo "\nCode: $code\n";
    foreach ($records as $record) {
        echo "  ID: {$record['id']}, Type: {$record['type']}, State: {$record['state']}, Name: {$record['name']}\n";
    }
}

if (empty($duplicates)) {
    echo "No duplicates found!\n";
}
