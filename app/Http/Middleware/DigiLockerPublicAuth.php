<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;

/**
 * DigiLocker Public Endpoint Middleware
 * 
 * Validates merchant credentials (mid/mkey) for DigiLocker authentication endpoints.
 * Does NOT require user authentication tokens since users are signing up/logging in.
 * 
 * Security Features:
 * - Validates merchant credentials against database
 * - Checks merchant account status
 * - Rate limiting compatible
 * - Logs authentication attempts
 * - Prevents unauthorized merchant access
 */
class DigiLockerPublicAuth
{
    /**
     * Handle an incoming request for DigiLocker public endpoints.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get merchant credentials from headers (preferred) or request body
        $mid = $request->header('mid') ?? $request->input('mid');
        $mkey = $request->header('mkey') ?? $request->input('mkey');

        // Validate that credentials are provided
        if (empty($mid) || empty($mkey)) {
            return response()->json([
                'status' => 0,
                'message' => 'Merchant credentials (mid/mkey) are required',
                'error_code' => 'MISSING_MERCHANT_CREDENTIALS'
            ], 400);
        }

        // Verify merchant credentials against database
        $merchant = User::where('mid', $mid)
                        ->where('mkey', $mkey)
                        ->first();

        if (!$merchant) {
            // Log failed authentication attempt for security monitoring
            \Log::warning('DigiLocker: Invalid merchant credentials', [
                'mid' => $mid,
                'ip' => $request->ip(),
                'endpoint' => $request->path()
            ]);

            return response()->json([
                'status' => 0,
                'message' => 'Invalid merchant credentials',
                'error_code' => 'INVALID_MERCHANT_CREDENTIALS'
            ], 401);
        }

        // Check if merchant account is active
        if ($merchant->status == 0) {
            return response()->json([
                'status' => 0,
                'message' => 'Merchant account is inactive',
                'error_code' => 'INACTIVE_MERCHANT'
            ], 403);
        }

        // Optional: Check if merchant has DigiLocker feature enabled
        // Uncomment if you have a feature flag system
        // if (!$merchant->hasFeature('digilocker')) {
        //     return response()->json([
        //         'status' => 0,
        //         'message' => 'DigiLocker feature not enabled for this merchant',
        //         'error_code' => 'FEATURE_DISABLED'
        //     ], 403);
        // }

        // Attach merchant to request for use in controller
        $request->merge([
            'merchant' => $merchant,
            'merchant_id' => $merchant->id,
            'admin_mid' => $merchant->admin_mid
        ]);

        // Log successful authentication for audit trail
        \Log::info('DigiLocker: Merchant authenticated', [
            'mid' => $mid,
            'merchant_id' => $merchant->id,
            'endpoint' => $request->path()
        ]);

        return $next($request);
    }
}
