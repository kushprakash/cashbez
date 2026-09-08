<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\Admin\ManageUserReportController;
use Illuminate\Http\Request;
use App\Models\User;

try {
    $user = User::where('mid', 'BP0000001')->first() ?? User::first();
    if (!$user) {
        echo "No user found in database.\n";
        exit;
    }
    
    echo "Testing getUserLogs for User ID: {$user->id}, MID: {$user->mid}\n\n";

    $controller = new ManageUserReportController();
    $request = new Request();
    
    $response = $controller->getUserLogs($request, $user->id);
    $data = json_decode($response->getContent(), true);

    echo "Response Status: " . ($data['status'] ?? 'N/A') . "\n";
    echo "Total Logs Found: " . ($data['total'] ?? 0) . "\n\n";

    if (!empty($data['data'])) {
        echo "Sample Log Item:\n";
        print_r($data['data'][0]);
    } else {
        echo "No logs found for this user MID.\n";
    }

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
