<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Health Check Controller
 * 
 * Minimal endpoint for observability - no Blade, no migrations, no heavy queries.
 * Used by: CI pipeline, load balancers, uptime monitors, k6 load tests.
 */
class HealthController extends Controller
{
    /**
     * Health check endpoint
     * 
     * Returns:
     * - 200 if app is healthy
     * - 503 if any critical check fails
     */
    public function __invoke(): JsonResponse
    {
        $start = microtime(true);
        $checks = [];
        $healthy = true;

        // 1. App boot check (implicit - if we got here, app booted)
        $checks['app'] = 'ok';

        // 2. Cache check (write + read + delete)
        try {
            $cacheKey = 'health_check_' . uniqid();
            Cache::put($cacheKey, 'ok', 10);
            $cacheValue = Cache::get($cacheKey);
            Cache::forget($cacheKey);
            $checks['cache'] = $cacheValue === 'ok' ? 'ok' : 'fail';
        } catch (\Throwable $e) {
            $checks['cache'] = 'fail';
            $healthy = false;
        }

        // 3. Database ping (SELECT 1, not schema queries)
        try {
            DB::select('SELECT 1');
            $checks['database'] = 'ok';
        } catch (\Throwable $e) {
            $checks['database'] = 'fail';
            $healthy = false;
        }

        // Response time in ms
        $responseTime = round((microtime(true) - $start) * 1000, 2);

        return response()->json([
            'status' => $healthy ? 'healthy' : 'unhealthy',
            'checks' => $checks,
            'response_time_ms' => $responseTime,
            'timestamp' => now()->toIso8601String(),
        ], $healthy ? 200 : 503);
    }
}
