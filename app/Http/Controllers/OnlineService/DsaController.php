<?php

namespace App\Http\Controllers\OnlineService;

use App\Http\Controllers\Controller;
use App\Services\IndiaSalesDsaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DsaController extends Controller
{
    private IndiaSalesDsaService $dsaService;

    public function __construct(IndiaSalesDsaService $dsaService)
    {
        $this->dsaService = $dsaService;
    }

    /**
     * Get DSA dashboard URL for iframe embedding (Web)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function dashboard(Request $request)
    {
        try {
            $user = $request->user;

            if (!$user) {
                return response()->json([
                    'status' => 0,
                    'message' => 'User not authenticated',
                ], 401);
            }
            
         
            // Get login URL from IndiaSales
            $result = $this->dsaService->getLoginUrl($user);

            if ($result['success']) {
                return response()->json([
                    'status' => 1,
                    'message' => 'DSA dashboard URL generated successfully',
                    'data' => [
                        'url' => $result['login_url'],
                        'dashboard_url' => $result['dashboard_url'],
                    ],
                ]);
            }

            return response()->json([
                'status' => 0,
                'message' => $result['message'] ?? 'Failed to generate DSA dashboard URL',
            ], 400);

        } catch (\Exception $e) {
            Log::error('DsaController: Dashboard error', [
                'error' => $e->getMessage(),
                'user_id' => $request->user->id ?? null,
            ]);

            return response()->json([
                'status' => 0,
                'message' => 'An error occurred. Please try again.',
            ], 500);
        }
    }

    /**
     * Get DSA dashboard URL for mobile app (Flutter WebView)
     * Returns the direct IndiaSales /link/<token> URL for WebView
     * WebView will load this URL and allow natural redirect to /dashboard
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function appDashboard(Request $request)
    {
        try {
            $user = $request->user;

            if (!$user) {
                return response()->json([
                    'status' => 0,
                    'message' => 'User not authenticated',
                ], 401);
            }

            // Get login URL from IndiaSales (returns /link/<token> format)
            $result = $this->dsaService->getLoginUrl($user);

            if ($result['success']) {
                // Return the direct IndiaSales login URL
                // WebView will load this and let it redirect naturally to /dashboard
                return response()->json([
                    'status' => 1,
                    'message' => 'DSA service ready',
                    'data' => [
                        'webview_url' => $result['login_url'], // Direct /link/<token> URL
                    ],
                ]);
            }

            return response()->json([
                'status' => 0,
                'message' => $result['message'] ?? 'Failed to load DSA service',
            ], 400);

        } catch (\Exception $e) {
            Log::error('DsaController: App Dashboard error', [
                'error' => $e->getMessage(),
                'user_id' => $request->user->id ?? null,
            ]);

            return response()->json([
                'status' => 0,
                'message' => 'An error occurred. Please try again.',
            ], 500);
        }
    }

    
}
