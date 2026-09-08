<?php

$file = 'c:\Users\admin\Downloads\electricity_boards.sql';
$content = file_get_contents($file);

// Extract INSERT statements
preg_match_all('/\((\d+), \'([^\']+)\', \'([^\']*)\', \'([^\']+)\', \'([^\']+)\', \'([^\']+)\', \'([^\']+)\', \'([^\']+)\'\)/', $content, $matches, PREG_SET_ORDER);

$combinations = [];
$duplicates = [];
$unique_records = [];

foreach ($matches as $match) {
    $id = $match[1];
    $type = $match[2];
    $state = $match[3];
    $code = $match[4];
    $name = $match[5];
    $category = $match[6];
    $label = $match[7];
    $icon = $match[8];
    
    // Create combination key
    $combo_key = $type . '|' . $code . '|' . $category;
    
    if (isset($combinations[$combo_key])) {
        if (!isset($duplicates[$combo_key])) {
            $duplicates[$combo_key] = [$combinations[$combo_key]];
        }
        $duplicates[$combo_key][] = [
            'id' => $id,
            'type' => $type,
            'state' => $state,
            'code' => $code,
            'name' => $name,
            'category' => $category,
            'label' => $label,
            'icon' => $icon
        ];
    } else {
        $combinations[$combo_key] = [
            'id' => $id,
            'type' => $type,
            'state' => $state,
            'code' => $code,
            'name' => $name,
            'category' => $category,
            'label' => $label,
            'icon' => $icon
        ];
        $unique_records[] = $combinations[$combo_key];
    }
}

echo "Duplicate combinations found:\n";
foreach ($duplicates as $combo => $records) {
    echo "\nCombination: $combo\n";
    foreach ($records as $record) {
        echo "  ID: {$record['id']}, Name: {$record['name']}\n";
    }
}

echo "\n\nGenerating clean SQL with unique records only...\n";

echo "-- Cleaned SQL for utility_operators table (duplicates removed)\n";
echo "-- Total unique records: " . count($unique_records) . "\n\n";

echo "INSERT INTO `utility_operators` (`type`, `state`, `code`, `name`, `category`, `label`, `icon`, `is_active`, `created_at`, `updated_at`) VALUES\n";

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

echo implode(",\n", $values) . ";\n";
