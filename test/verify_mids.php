<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Mid;

echo "Total MIDs: " . Mid::count() . "\n";
echo "First MID: " . Mid::first()->mid . "\n";  
echo "Last MID: " . Mid::orderBy('id', 'desc')->first()->mid . "\n";
echo "Not used MIDs: " . Mid::where('status', 0)->count() . "\n";
echo "Used MIDs: " . Mid::where('status', 1)->count() . "\n";

echo "\nFirst 5 MIDs:\n";
Mid::take(5)->get(['id', 'mid', 'status'])->each(function($mid) {
    echo $mid->id . " - " . $mid->mid . " - Status: " . $mid->status . "\n";
});
