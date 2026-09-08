<?php
// Secret Token to secure mid generation url
$secret_token = 'bharatpay_secure_token_9835';

if (php_sapi_name() !== 'cli' && (!isset($_GET['token']) || $_GET['token'] !== $secret_token)) {
    header('HTTP/1.1 403 Forbidden');
    echo 'Access Denied: Invalid Token';
    exit;
}

// Bootstrap Laravel
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Mid;
use Illuminate\Support\Facades\DB;

try {
    echo "<h2>Bharat-Pay AGENT MID Generator</h2>";
    echo "<hr>";

    // Disable query logging to prevent memory leakage during massive insert
    DB::connection()->disableQueryLog();

    // 1. Clear/Truncate existing old MIDs table
    DB::table('mids')->truncate();
    echo "<strong style='color:orange;'>Previous MIDs removed successfully.</strong><br><br>";

    $count_to_generate = 25000;
    $mids_to_insert = [];
    $generated_count = 0;

    echo "Generating 25,000 MIDs in AGENT format (AGENT0 to AGENT24999)...<br><br>";

    // Generate AGENT0, AGENT1, AGENT2 ... AGENT24999
    for ($i = 0; $i < $count_to_generate; $i++) {
        $mid_str = 'AGENT' . $i;
        $mids_to_insert[] = [
            'mid' => $mid_str,
            'status' => 0,
            'created_at' => now(),
            'updated_at' => now()
        ];

        // Insert in chunks of 5000 for high performance
        if (count($mids_to_insert) >= 5000) {
            DB::table('mids')->insert($mids_to_insert);
            $generated_count += count($mids_to_insert);
            $mids_to_insert = [];
        }
    }

    // Insert remaining
    if (count($mids_to_insert) > 0) {
        DB::table('mids')->insert($mids_to_insert);
        $generated_count += count($mids_to_insert);
    }

    echo "<h3 style='color:green;'>SUCCESS: Generated & Inserted $generated_count MIDs!</h3>";
    echo "First MID: <strong>AGENT0</strong><br>";
    echo "Last MID: <strong>AGENT" . ($count_to_generate - 1) . "</strong><br>";

} catch (\Exception $e) {
    echo "<h3 style='color:red;'>FAILED to generate MIDs</h3>";
    echo "Error: " . $e->getMessage();
}
