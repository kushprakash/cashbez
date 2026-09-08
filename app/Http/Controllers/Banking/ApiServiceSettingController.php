<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\ApiServiceSetting;
use App\Models\ApiSetting;
use Illuminate\Http\Request;

class ApiServiceSettingController extends Controller
{
    /**
     * Default list of services supported
     */
    private $defaultServices = [
        'Prepaid',
        'DTH',
        'Postpaid',
        'Landline',
        'Broadband',
        'Electricity',
        'Water',
        'Gas',
        'Fastag'
    ];

    /**
     * Get all service wise API settings & list of active APIs
     */
    public function index()
    {
        try {
            // Fetch all active APIs for dropdowns
            $apis = ApiSetting::where('is_active', true)
                ->select('id', 'api_name', 'api_short_name', 'services')
                ->get();

            // Fetch existing settings
            $existingSettings = ApiServiceSetting::all()->keyBy('service_type');

            $servicesData = [];
            foreach ($this->defaultServices as $service) {
                if ($existingSettings->has($service)) {
                    $servicesData[] = $existingSettings->get($service);
                } else {
                    $servicesData[] = [
                        'id' => null,
                        'service_type' => $service,
                        'profit_only' => false,
                        'api_1' => null,
                        'api_2' => null,
                        'api_3' => null,
                        'api_4' => null,
                        'pending_api_1' => null,
                        'pending_api_2' => null,
                    ];
                }
            }

            return response()->json([
                'status' => 1,
                'message' => 'Service wise API settings fetched successfully',
                'data' => [
                    'services' => $servicesData,
                    'apis' => $apis
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch service wise API settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk save / update service wise API settings
     */
    public function store(Request $request)
    {
        try {
            $services = $request->input('services', []);
            if (!is_array($services)) {
                return response()->json(['status' => 0, 'message' => 'Invalid data format'], 400);
            }

            foreach ($services as $srv) {
                if (empty($srv['service_type'])) continue;

                ApiServiceSetting::updateOrCreate(
                    ['service_type' => $srv['service_type']],
                    [
                        'profit_only'   => !empty($srv['profit_only']),
                        'api_1'         => !empty($srv['api_1']) ? $srv['api_1'] : null,
                        'api_2'         => !empty($srv['api_2']) ? $srv['api_2'] : null,
                        'api_3'         => !empty($srv['api_3']) ? $srv['api_3'] : null,
                        'api_4'         => !empty($srv['api_4']) ? $srv['api_4'] : null,
                        'pending_api_1' => !empty($srv['pending_api_1']) ? $srv['pending_api_1'] : null,
                        'pending_api_2' => !empty($srv['pending_api_2']) ? $srv['pending_api_2'] : null,
                    ]
                );
            }

            return response()->json([
                'status' => 1,
                'message' => 'Service wise API settings saved successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to save service wise API settings: ' . $e->getMessage()
            ], 500);
        }
    }
}
