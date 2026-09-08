<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

$jsonFile = __DIR__ . '/va_temp.json';
if (!file_exists($jsonFile)) {
    echo "Error: va_temp.json file not found.\n";
    exit(1);
}

$jsonContent = file_get_contents($jsonFile);
$rows = json_decode($jsonContent, true);

if (!is_array($rows)) {
    echo "Error: Failed to parse va_temp.json.\n";
    exit(1);
}

echo "Total rows to import into 'va' table: " . count($rows) . "\n";

// Clear existing table data before importing
DB::table('va')->truncate();

$insertData = [];
$now = Carbon::now()->toDateTimeString();

function parseDate($dateStr, $default) {
    if (empty($dateStr)) {
        return $default;
    }
    $clean = trim(preg_replace('/\s*(AM|PM|am|pm)$/i', '', (string)$dateStr));
    try {
        return Carbon::parse($clean)->toDateTimeString();
    } catch (\Exception $e) {
        return $default;
    }
}

foreach ($rows as $idx => $row) {
    $createdAt = parseDate($row['Created At'] ?? null, $now);

    $insertData[] = [
        'id'                     => (int)($row['id'] ?? ($idx + 1)),
        'mid'                    => null, // mid column created after id for future use
        'mobile'                 => !empty($row['Mobile No']) ? (string)$row['Mobile No'] : null,
        'username'               => !empty($row['Username']) ? (string)$row['Username'] : null,
        'account_number'         => !empty($row['Account Number']) ? (string)$row['Account Number'] : null,
        'account_ifsc'           => !empty($row['Account IFSC']) ? (string)$row['Account IFSC'] : null,
        'virtual_account_id'     => !empty($row['Virtual Account ID']) ? (string)$row['Virtual Account ID'] : null,
        'virtual_account_number' => !empty($row['Virtual Account Number']) ? (string)$row['Virtual Account Number'] : null,
        'virtual_ifsc'           => !empty($row['Virtual IFSC']) ? (string)$row['Virtual IFSC'] : null,
        'virtual_upi_handle'     => !empty($row['Virtual Upi Handle']) ? (string)$row['Virtual Upi Handle'] : null,
        'status'                 => 1,
        'created_at'             => $createdAt,
        'updated_at'             => $now,
    ];

    if (count($insertData) >= 100) {
        DB::table('va')->insert($insertData);
        $insertData = [];
    }
}

if (!empty($insertData)) {
    DB::table('va')->insert($insertData);
}

$count = DB::table('va')->count();
echo "Import completed successfully! Total rows imported into table 'va': {$count}\n";
