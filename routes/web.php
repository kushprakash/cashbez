<?php

use Illuminate\Support\Facades\Route;

Route::get('/deploy-update', function () {
    chdir(base_path());
    $gitOutput = shell_exec('git pull origin main 2>&1');

    \Illuminate\Support\Facades\Artisan::call('optimize:clear');
    $optimizeOutput = \Illuminate\Support\Facades\Artisan::output();

    \Illuminate\Support\Facades\Artisan::call('config:clear');
    $configOutput = \Illuminate\Support\Facades\Artisan::output();

    \Illuminate\Support\Facades\Artisan::call('route:clear');
    $routeOutput = \Illuminate\Support\Facades\Artisan::output();

    \Illuminate\Support\Facades\Artisan::call('view:clear');
    $viewOutput = \Illuminate\Support\Facades\Artisan::output();

    $opcacheReset = false;
    if (function_exists('opcache_reset')) {
        $opcacheReset = @opcache_reset();
    }

    return response()->json([
        'status' => 1,
        'message' => 'Commands executed successfully',
        'commands' => [
            'git_pull' => trim($gitOutput ?? ''),
            'optimize_clear' => trim($optimizeOutput ?? ''),
            'config_clear' => trim($configOutput ?? ''),
            'route_clear' => trim($routeOutput ?? ''),
            'view_clear' => trim($viewOutput ?? ''),
            'opcache_reset' => $opcacheReset ? 'Reset successfully' : 'Not available or not enabled'
        ]
    ]);
});

Route::get('/{any}', function () {
    return response()
        ->view('welcome')
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
        ->header('Pragma', 'no-cache')
        ->header('Expires', '0');
})->where('any', '.*');