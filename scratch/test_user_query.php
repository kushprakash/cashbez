<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$controller = new \App\Http\Controllers\Banking\CommissionMasterController();
$request = Illuminate\Http\Request::create('/api/commission-master/users/search', 'GET', ['q' => '']);
$response = $controller->searchUsers($request);

echo "STATUS: " . $response->getStatusCode() . "\n";
echo "BODY: " . $response->getContent() . "\n";
