<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

// Fake a request context
$request = new \Illuminate\Http\Request();
$request->merge(['isAdmin' => true]);
$request->merge(['admin' => (object)['id' => 1]]);

// Get lead controller instance
$controller = new \App\Http\Controllers\CRM\LeadController();

// Call the index method
$leads = $controller->index($request);

echo "Leads API Response with Follow-up Information:\n";
echo "==============================================\n\n";

foreach ($leads as $lead) {
    echo "Lead ID: " . $lead->id . "\n";
    echo "Name: " . $lead->name . "\n";
    echo "Lead Status: " . ($lead->status ? $lead->status->name : 'No Status') . "\n";
    echo "Latest Follow-up Type: " . ($lead->latestFollowup && $lead->latestFollowup->followupType ? $lead->latestFollowup->followupType->name : 'No Follow-up') . "\n";
    echo "Latest Follow-up Status: " . ($lead->latestFollowup && $lead->latestFollowup->followupStatus ? $lead->latestFollowup->followupStatus->name : 'No Follow-up') . "\n";
    echo "Follow-up Date: " . ($lead->latestFollowup ? $lead->latestFollowup->followup_date : 'No Follow-up') . "\n";
    echo str_repeat('-', 50) . "\n";
}
