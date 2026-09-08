<?php

$file = 'c:\Users\admin\Downloads\electricity_boards.sql';
$content = file_get_contents($file);

// Extract INSERT statements
preg_match_all('/\((\d+), \'([^\']+)\', \'([^\']*)\', \'([^\']+)\', \'([^\']+)\', \'([^\']+)\', \'([^\']+)\', \'([^\']+)\'\)/', $content, $matches, PREG_SET_ORDER);

echo "-- Cleaned SQL for utility_operators table\n";
echo "-- This SQL is compatible with the Laravel migration structure\n\n";

echo "INSERT INTO `utility_operators` (`type`, `state`, `code`, `name`, `category`, `label`, `icon`, `is_active`, `created_at`, `updated_at`) VALUES\n";

$values = [];
foreach ($matches as $match) {
    $type = addslashes($match[2]);
    $state = addslashes($match[3]);
    $code = addslashes($match[4]);
    $name = addslashes($match[5]);
    $category = addslashes($match[6]);
    $label = addslashes($match[7]);
    $icon = addslashes($match[8]);
    
    // Add default values for new columns
    $is_active = 1;
    $created_at = 'NOW()';
    $updated_at = 'NOW()';
    
    $values[] = "('{$type}', '{$state}', '{$code}', '{$name}', '{$category}', '{$label}', '{$icon}', {$is_active}, {$created_at}, {$updated_at})";
}

echo implode(",\n", $values) . ";\n";

echo "\n-- Total records: " . count($values) . "\n";
