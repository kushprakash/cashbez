<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$packages = DB::table('commission_packages')->get();
echo "Total packages in DB: " . $packages->count() . "\n";
print_r($packages->toArray());
