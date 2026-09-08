<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ProxyController extends Controller
{
    /**
     * Proxy requests to the CodeIgniter API with CORS handling.
     *
     * @param Request $request
     * @param string $endpoint
     * @return \Illuminate\Http\JsonResponse
     */
    public function handle(Request $request, $endpoint)
    {
        // Handle preflight OPTIONS requests for CORS
        if ($request->method() === 'OPTIONS') {
            return response()->json(['status' => 'OK'], 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
        }

        // Base URL for the CodeIgniter API
        $baseUrl = env('CODEIGNITER_API_BASE_URL', 'https://example-ci-api.com');

        // Construct the target URL
        $url = rtrim($baseUrl, '/') . '/' . ltrim($endpoint, '/');

        try {
            // Forward the request with method, headers, and data
            $response = Http::withHeaders($request->headers->all())
                ->send($request->method(), $url, [
                    'query' => $request->query(),
                    'json' => $request->json()->all() ?? [],
                    'form_params' => $request->all(),
                ]);

            // Return the response from CodeIgniter API with CORS headers
            return response()->json($response->json(), $response->status())
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
        } catch (\Exception $e) {
            // Handle errors and return a proper response with CORS headers
            return response()->json([
                'error' => 'Failed to connect to the API',
                'message' => $e->getMessage(),
            ], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
        }
    }
}
