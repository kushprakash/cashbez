<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\ApiSetting;
use App\Models\ApiPendingSetting;
use App\Models\ApiSpecialSetting;
use App\Models\UtilityOperator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use DB;

class ApiPendingSettingController extends Controller
{
    /**
     * Get Pending API Matrix & Active APIs / Operators
     */
    public function getPendingSettings(Request $request)
    {
        try {
            // 1. Fetch categories from bbps_category table
            $bbpsCategories = DB::table('bbps_category')
                ->whereNotNull('category')
                ->where('category', '!=', '')
                ->pluck('category')
                ->unique()
                ->values()
                ->toArray();

            // Default categories fallback if bbps_category is empty
            if (empty($bbpsCategories)) {
                $bbpsCategories = ['Prepaid', 'Postpaid', 'DTH', 'Electricity', 'Landline', 'Water', 'Gas', 'Broadband', 'Insurance', 'FASTag', 'Loan Repayment', 'Cable TV'];
            }

            $serviceCategories = $bbpsCategories;

            $requestedService = $request->get('service_type');
            if (empty($requestedService)) {
                $serviceType = $serviceCategories[0];
            } else {
                $serviceType = $requestedService;
            }

            // Fetch active APIs matching the selected service category in api_settings.services
            $apis = ApiSetting::where(function ($q) use ($serviceType) {
                $q->whereJsonContains('services', $serviceType)
                  ->orWhereJsonContains('services', strtolower($serviceType))
                  ->orWhere('services', 'like', '%"' . $serviceType . '"%')
                  ->orWhere('services', 'like', '%' . $serviceType . '%');
            })
            ->orderBy('id', 'asc')
            ->get();

            // 2. Fetch operators: Operator-wise ONLY for Prepaid, Postpaid, DTH, and Insurance.
            // API-wise for all other categories (Electricity, Water, Gas, Landline, Broadband, etc.)
            $operatorWiseCategories = ['Prepaid', 'Mobile Recharge', 'Postpaid', 'Mobile Postpaid', 'DTH', 'Insurance'];

            if (in_array($serviceType, $operatorWiseCategories)) {
                $operatorsQuery = UtilityOperator::where('is_active', true);

                if ($serviceType === 'Prepaid' || $serviceType === 'Mobile Recharge') {
                    $operatorsQuery->where(function($q) {
                        $q->where('category', 'MobilePrepaid')
                          ->orWhere('category', 'Prepaid')
                          ->orWhere('type', 'Prepaid')
                          ->orWhereIn('code', ['JIO', 'AIRTEL', 'VI', 'BSNL']);
                    });
                } else if ($serviceType === 'Postpaid' || $serviceType === 'Mobile Postpaid') {
                    $operatorsQuery->where(function($q) {
                        $q->where('category', 'MobilePostpaid')
                          ->orWhere('category', 'Postpaid')
                          ->orWhere('type', 'Postpaid');
                    });
                } else if ($serviceType === 'DTH') {
                    $operatorsQuery->where(function($q) {
                        $q->where('category', 'DTH')->orWhere('type', 'DTH');
                    });
                } else if ($serviceType === 'Insurance') {
                    $operatorsQuery->where(function($q) {
                        $q->where('category', 'Insurance')->orWhere('type', 'Insurance');
                    });
                }

                $dbOperators = $operatorsQuery->select('code', 'name')->get();

                $operators = $dbOperators->unique('code')->values()->map(function($op) {
                    return [
                        'code' => $op->code,
                        'name' => !empty($op->name) ? $op->name : $op->code
                    ];
                })->toArray();

                if (empty($operators)) {
                    if ($serviceType === 'Prepaid' || $serviceType === 'Mobile Recharge') {
                        $operators = [
                            ['code' => 'JIO', 'name' => 'JIO'],
                            ['code' => 'AIRTEL', 'name' => 'AIRTEL'],
                            ['code' => 'VI', 'name' => 'VI'],
                            ['code' => 'BSNL', 'name' => 'BSNL'],
                        ];
                    } else if ($serviceType === 'DTH') {
                        $operators = [
                            ['code' => 'TATA_PLAY', 'name' => 'TATA PLAY'],
                            ['code' => 'AIRTEL_DTH', 'name' => 'AIRTEL DTH'],
                            ['code' => 'DISH_TV', 'name' => 'DISH TV'],
                            ['code' => 'SUN_DIRECT', 'name' => 'SUN DIRECT'],
                            ['code' => 'VIDEOCON_D2H', 'name' => 'D2H'],
                        ];
                    } else if ($serviceType === 'Insurance') {
                        $operators = [
                            ['code' => 'LIC', 'name' => 'LIC OF INDIA'],
                            ['code' => 'HDFC_LIFE', 'name' => 'HDFC LIFE'],
                            ['code' => 'ICICI_PRU', 'name' => 'ICICI PRUDENTIAL'],
                            ['code' => 'SBI_LIFE', 'name' => 'SBI LIFE'],
                        ];
                    }
                }
            } else {
                // For all other categories (Electricity, Water, Gas, Landline, Broadband, etc.)
                // Matrix is API-wise, NOT operator-wise!
                $operators = [
                    ['code' => 'ALL', 'name' => 'ALL']
                ];
            }

            $timeFrames = ['7AM- 12PM', '5PM- 10PM', 'OTHER'];

            // Fetch existing matrix counts for this service_type
            $pendingRows = ApiPendingSetting::where('service_type', $serviceType)->get();

            $matrix = [];
            foreach ($pendingRows as $row) {
                // Normalize time_frame string key
                $tfKey = str_replace(' ', '', $row->time_frame);
                $matrix[$row->api_id][$row->operator_code][$tfKey] = $row->max_pending_count;
                $matrix[$row->api_id][$row->operator_code][$row->time_frame] = $row->max_pending_count;
            }

            return response()->json([
                'status' => 1,
                'message' => 'Pending API Settings fetched successfully',
                'data' => [
                    'service_type' => $serviceType,
                    'service_categories' => $serviceCategories,
                    'apis' => $apis,
                    'operators' => $operators,
                    'time_frames' => $timeFrames,
                    'matrix' => $matrix
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching pending API settings: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch pending API settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save/Update Bulk Pending API Matrix Settings
     */
    public function savePendingSettings(Request $request)
    {
        try {
            $serviceType = $request->input('service_type', 'Prepaid');
            $matrix = $request->input('matrix', []); // format: [api_id][operator_code][time_frame] => count

            if (!is_array($matrix)) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Invalid matrix format'
                ], 422);
            }

            DB::beginTransaction();

            foreach ($matrix as $apiId => $opMap) {
                if (!is_array($opMap)) continue;

                foreach ($opMap as $opCode => $tfMap) {
                    if (!is_array($tfMap)) continue;

                    foreach ($tfMap as $timeFrame => $count) {
                        // Standardize time_frame display label
                        $cleanTf = trim($timeFrame);
                        if (str_replace(' ', '', $cleanTf) === '7AM-12PM') {
                            $cleanTf = '7AM- 12PM';
                        } elseif (str_replace(' ', '', $cleanTf) === '5PM-10PM') {
                            $cleanTf = '5PM- 10PM';
                        }

                        ApiPendingSetting::updateOrCreate(
                            [
                                'api_id' => $apiId,
                                'service_type' => $serviceType,
                                'operator_code' => $opCode,
                                'time_frame' => $cleanTf,
                            ],
                            [
                                'max_pending_count' => (int) $count,
                            ]
                        );
                    }
                }
            }

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Pending API Settings updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error saving pending API settings: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to save pending API settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset Pending API Matrix Settings for a service
     */
    public function resetPendingSettings(Request $request)
    {
        try {
            $serviceType = $request->input('service_type', 'Prepaid');

            ApiPendingSetting::where('service_type', $serviceType)->delete();

            return response()->json([
                'status' => 1,
                'message' => 'Pending API Settings reset successfully for ' . $serviceType
            ]);

        } catch (\Exception $e) {
            Log::error('Error resetting pending API settings: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to reset pending API settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Special Plan Settings CRUD Methods
     */
    public function getSpecialSettings(Request $request)
    {
        try {
            $query = ApiSpecialSetting::with('api:id,api_name,api_short_name');

            if ($request->has('api_id') && !empty($request->api_id)) {
                $query->where('api_id', $request->api_id);
            }

            $specialSettings = $query->orderBy('id', 'desc')->get();

            return response()->json([
                'status' => 1,
                'message' => 'Special API settings retrieved',
                'data' => $specialSettings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch special settings: ' . $e->getMessage()
            ], 500);
        }
    }

    public function storeSpecialSetting(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'api_id' => 'required|exists:api_settings,id',
                'operator_code' => 'required|string|max:50',
                'amount' => 'required|numeric|min:0',
                'circle' => 'nullable|string|max:100',
                'is_active' => 'nullable|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();
            $data['circle'] = !empty($data['circle']) ? strtoupper($data['circle']) : 'ALL';
            $data['operator_code'] = strtoupper($data['operator_code']);
            $data['is_active'] = isset($data['is_active']) ? filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN) : true;

            $setting = ApiSpecialSetting::create($data);

            return response()->json([
                'status' => 1,
                'message' => 'Special Plan rule saved successfully',
                'data' => $setting->load('api:id,api_name,api_short_name')
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error saving special setting: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to save special plan rule: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateSpecialSetting(Request $request, $id)
    {
        try {
            $setting = ApiSpecialSetting::find($id);

            if (!$setting) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Special setting rule not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'api_id' => 'nullable|exists:api_settings,id',
                'operator_code' => 'nullable|string|max:50',
                'amount' => 'nullable|numeric|min:0.01',
                'circle' => 'nullable|string|max:100',
                'is_active' => 'nullable|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();
            if (isset($data['circle'])) {
                $data['circle'] = !empty($data['circle']) ? strtoupper($data['circle']) : 'ALL';
            }
            if (isset($data['operator_code'])) {
                $data['operator_code'] = strtoupper($data['operator_code']);
            }
            if (isset($data['is_active'])) {
                $data['is_active'] = filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN);
            }

            $setting->update($data);

            return response()->json([
                'status' => 1,
                'message' => 'Special Plan rule updated successfully',
                'data' => $setting->load('api:id,api_name,api_short_name')
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating special setting: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update special plan rule: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroySpecialSetting($id)
    {
        try {
            $setting = ApiSpecialSetting::find($id);

            if (!$setting) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Special setting rule not found'
                ], 404);
            }

            $setting->delete();

            return response()->json([
                'status' => 1,
                'message' => 'Special Plan rule deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to delete special plan rule: ' . $e->getMessage()
            ], 500);
        }
    }

    public function toggleSpecialSettingStatus($id)
    {
        try {
            $setting = ApiSpecialSetting::find($id);

            if (!$setting) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Special setting rule not found'
                ], 404);
            }

            $setting->is_active = !$setting->is_active;
            $setting->save();

            return response()->json([
                'status' => 1,
                'message' => 'Special Plan rule status updated',
                'data' => $setting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to toggle status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Service Categories list from bbps_category table
     */
    public function getServiceCategories()
    {
        try {
            $categories = DB::table('bbps_category')
                ->whereNotNull('category')
                ->where('category', '!=', '')
                ->pluck('category')
                ->unique()
                ->values()
                ->toArray();

            if (empty($categories)) {
                $categories = [
                    'Prepaid', 'Postpaid', 'DTH', 'Electricity', 'Landline', 'Water', 'Gas', 
                    'Broadband', 'Insurance', 'FASTag', 'Loan Repayment', 'Cable TV', 
                    'Municipal Tax', 'Housing Society', 'Hospital', 'Credit Card'
                ];
            }

            return response()->json([
                'status' => 1,
                'message' => 'Service categories retrieved successfully',
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch categories: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Utility Circles from utility_circles table
     */
    public function getUtilityCircles()
    {
        try {
            $circles = DB::table('utility_circles')
                ->where('status', 1)
                ->select('id', 'code', 'name')
                ->get();

            return response()->json([
                'status' => 1,
                'message' => 'Utility circles retrieved successfully',
                'data' => $circles
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch utility circles: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Quick update State/Circle for an API
     */
    public function updateApiCircle(Request $request, $id)
    {
        try {
            $api = ApiSetting::findOrFail($id);
            $circle = $request->input('circle', 'ALL');
            $api->circle = !empty($circle) ? $circle : 'ALL';
            $api->save();

            return response()->json([
                'status' => 1,
                'message' => 'API Circle updated to ' . $api->circle,
                'data' => $api
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update API Circle: ' . $e->getMessage()
            ], 500);
        }
    }
}
