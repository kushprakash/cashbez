<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    DB::statement('SET FOREIGN_KEY_CHECKS=0');
    DB::statement('DROP TABLE IF EXISTS emails');
    DB::statement('DROP TABLE IF EXISTS email_recipients');
    DB::statement('DROP TABLE IF EXISTS email_attachments');
    DB::statement('SET FOREIGN_KEY_CHECKS=1');
    echo "Tables dropped successfully\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
