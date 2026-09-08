<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\ApiSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ApiSettingController extends Controller
{
    /**
     * Display a listing of API settings.
     */
    public function index(Request $request)
    {
        try {
            $query = ApiSetting::query();

            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('api_name', 'like', "%{$search}%")
                      ->orWhere('api_short_name', 'like', "%{$search}%")
                      ->orWhere('ip_address', 'like', "%{$search}%");
                });
            }

            $perPage = $request->get('per_page', 10);
            if ($perPage == -1 || $perPage == 'all') {
                $settings = $query->orderBy('id', 'desc')->get();
                return response()->json([
                    'status' => 1,
                    'message' => 'API settings retrieved successfully',
                    'data' => $settings
                ]);
            }

            $settings = $query->orderBy('id', 'desc')->paginate($perPage);

            return response()->json([
                'status' => 1,
                'message' => 'API settings retrieved successfully',
                'data' => $settings->items(),
                'pagination' => [
                    'total' => $settings->total(),
                    'per_page' => $settings->perPage(),
                    'current_page' => $settings->currentPage(),
                    'last_page' => $settings->lastPage(),
                    'from' => $settings->firstItem(),
                    'to' => $settings->lastItem(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching API settings: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch API settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created API setting.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'api_name' => 'required|string|max:200',
                'api_short_name' => 'required|string|max:100',
                'ip_address' => 'nullable|string|max:100',
                'only_fetch_bill' => 'nullable',
                'services' => 'nullable',
                'first_low_balance_alert' => 'nullable|numeric',
                'second_low_balance_alert' => 'nullable|numeric',
                'third_low_balance_alert' => 'nullable|numeric',
                'recharge_config' => 'nullable',
                'status_check_config' => 'nullable',
                'balance_config' => 'nullable',
                'callback_config' => 'nullable',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();

            $data['only_fetch_bill'] = filter_var($request->input('only_fetch_bill', false), FILTER_VALIDATE_BOOLEAN);

            // Decode JSON strings if passed as string
            $jsonFields = ['services', 'recharge_config', 'status_check_config', 'balance_config', 'callback_config'];
            foreach ($jsonFields as $field) {
                if (isset($data[$field]) && is_string($data[$field])) {
                    $data[$field] = json_decode($data[$field], true);
                }
            }

            $setting = ApiSetting::create($data);

            return response()->json([
                'status' => 1,
                'message' => 'API setting saved successfully',
                'data' => $setting
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating API setting: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to save API setting: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified API setting.
     */
    public function show($id)
    {
        try {
            $setting = ApiSetting::find($id);

            if (!$setting) {
                return response()->json([
                    'status' => 0,
                    'message' => 'API setting not found'
                ], 404);
            }

            return response()->json([
                'status' => 1,
                'message' => 'API setting details retrieved',
                'data' => $setting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching API setting: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified API setting.
     */
    public function update(Request $request, $id)
    {
        try {
            $setting = ApiSetting::find($id);

            if (!$setting) {
                return response()->json([
                    'status' => 0,
                    'message' => 'API setting not found'
                ], 404);
            }

            $data = $request->all();

            if (isset($data['only_fetch_bill'])) {
                $data['only_fetch_bill'] = filter_var($data['only_fetch_bill'], FILTER_VALIDATE_BOOLEAN);
            }

            $jsonFields = ['services', 'recharge_config', 'status_check_config', 'balance_config', 'callback_config'];
            foreach ($jsonFields as $field) {
                if (isset($data[$field]) && is_string($data[$field])) {
                    $data[$field] = json_decode($data[$field], true);
                }
            }

            $setting->update($data);

            return response()->json([
                'status' => 1,
                'message' => 'API setting updated successfully',
                'data' => $setting
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating API setting: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update API setting: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified API setting.
     */
    public function destroy($id)
    {
        try {
            $setting = ApiSetting::find($id);

            if (!$setting) {
                return response()->json([
                    'status' => 0,
                    'message' => 'API setting not found'
                ], 404);
            }

            $setting->delete();

            return response()->json([
                'status' => 1,
                'message' => 'API setting deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to delete API setting: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test & Fetch live response schema from target API URL.
     */
    public function fetchTestResponse(Request $request)
    {
        try {
            $url = $request->input('url');
            $method = strtoupper($request->input('method', 'GET'));
            $params = $request->input('params', []);

            if (empty($url)) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Target URL is required'
                ], 400);
            }

            // Build query params or POST body
            $queryParams = [];
            if (is_array($params)) {
                foreach ($params as $p) {
                    $keyName = $p['key'] ?? $p['name'] ?? null;
                    if (!empty($keyName)) {
                        $val = isset($p['value']) && $p['value'] !== '' ? $p['value'] : (isset($p['static_value']) && $p['static_value'] !== '' ? $p['static_value'] : null);
                        if (empty($val)) {
                            $lowerKey = strtolower($keyName);
                            if (str_contains($lowerKey, 'number') || str_contains($lowerKey, 'mobile')) {
                                $val = '9999999999';
                            } elseif (str_contains($lowerKey, 'amount')) {
                                $val = '10';
                            } elseif (str_contains($lowerKey, 'operator')) {
                                $val = 'VF';
                            } elseif (str_contains($lowerKey, 'ref')) {
                                $val = 'REF' . rand(1000, 9999);
                            } elseif (str_contains($lowerKey, 'date')) {
                                $val = date('Y-m-d');
                            } else {
                                $val = 'TEST_VAL';
                            }
                        }
                        $queryParams[$keyName] = $val;
                    }
                }
            }

            $ch = curl_init();
            $targetUrl = $url;

            if ($method === 'GET' && !empty($queryParams)) {
                $targetUrl .= (str_contains($url, '?') ? '&' : '?') . http_build_query($queryParams);
            }

            curl_setopt_array($ch, [
                CURLOPT_URL => $targetUrl,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 15,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            ]);

            if ($method === 'POST') {
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($queryParams));
            }

            $rawResponse = curl_exec($ch);
            $curlErr = curl_error($ch);
            curl_close($ch);

            if ($curlErr) {
                return response()->json([
                    'status' => 0,
                    'message' => 'CURL Request Failed: ' . $curlErr,
                    'raw_response' => null,
                    'keys' => []
                ]);
            }

            $resDataClean = str_replace(["\xEF\xBB\xBF", "\u{FEFF}"], '', trim($rawResponse));
            $resDataClean = preg_replace('/[\x00-\x1F\x7F]/', '', $resDataClean);

            $decoded = json_decode($resDataClean, true);
            if (!$decoded) {
                $decoded = json_decode($rawResponse, true);
            }

            // Automatic XML to Array conversion if provider returned XML response
            if (!$decoded && (str_starts_with($resDataClean, '<') || str_contains($resDataClean, '</'))) {
                try {
                    libxml_use_internal_errors(true);
                    $xml = @simplexml_load_string($resDataClean, 'SimpleXMLElement', LIBXML_NOCDATA);
                    if ($xml === false) {
                        $xml = @simplexml_load_string($rawResponse, 'SimpleXMLElement', LIBXML_NOCDATA);
                    }
                    if ($xml !== false) {
                        $decoded = json_decode(json_encode($xml), true);
                    }
                    libxml_clear_errors();
                } catch (\Throwable $e) {
                    // Silence XML errors
                }
            }

            $extractedKeys = [];
            $displayResponse = $rawResponse;
            if (is_array($decoded)) {
                $extractedKeys = $this->extractKeysRecursive($decoded);
                $displayResponse = json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            } else {
                $extractedKeys = ['status', 'STATUS', 'resText', 'orderId', 'txnid', 'operator', 'balance', 'message', 'Message'];
            }

            return response()->json([
                'status' => 1,
                'message' => 'API response fetched successfully',
                'raw_response' => $displayResponse,
                'keys' => array_values(array_unique($extractedKeys))
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching API response: ' . $e->getMessage()
            ], 500);
        }
    }

    private function extractKeysRecursive($array, $prefix = '')
    {
        $keys = [];
        foreach ($array as $k => $v) {
            $keyPath = $prefix ? "{$prefix}.{$k}" : $k;
            $keys[] = (string) $k;
            $keys[] = $keyPath;

            if (is_array($v)) {
                $keys = array_merge($keys, $this->extractKeysRecursive($v, $keyPath));
            }
        }
        return $keys;
    }
}
