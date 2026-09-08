<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\ApiOperatorMapping;
use App\Models\ApiSetting;
use App\Models\BbpsCategory;
use App\Models\UtilityOperator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class OperatorMappingController extends Controller
{
    /**
     * Get APIs and Categories dropdown options.
     */
    public function getOptions()
    {
        try {
            // Get all APIs
            $apis = ApiSetting::select('id', 'api_name', 'api_short_name')
                ->where('is_active', true)
                ->orderBy('api_name')
                ->get();

            // Get Categories from bbps_category
            $categories = [];
            if (Schema::hasTable('bbps_category')) {
                $categories = BbpsCategory::select('id', 'name', 'category', 'label', 'image')
                    ->orderBy('name')
                    ->get();
            }

            // Fallback to utility_operators categories if bbps_category is empty
            if ($categories->isEmpty() && Schema::hasTable('utility_operators')) {
                $uniqueCategories = UtilityOperator::whereNotNull('category')
                    ->where('category', '!=', '')
                    ->distinct()
                    ->pluck('category');

                $categories = $uniqueCategories->map(function ($cat) {
                    return [
                        'id' => $cat,
                        'name' => ucfirst($cat),
                        'category' => $cat,
                        'label' => ucfirst($cat),
                    ];
                });
            }

            return response()->json([
                'status' => 1,
                'message' => 'Options retrieved successfully',
                'data' => [
                    'apis' => $apis,
                    'categories' => $categories
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching operator mapping options: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch options: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get fixed operators for chosen category along with existing mapped API operator codes.
     */
    public function getOperators(Request $request)
    {
        try {
            $apiId = $request->input('api_id');
            $category = $request->input('category');

            if (empty($apiId)) {
                return response()->json([
                    'status' => 0,
                    'message' => 'API ID is required'
                ], 400);
            }

            // Fetch operators from utility_operators
            $query = UtilityOperator::query();
            if (!empty($category)) {
                $categoriesToMatch = $this->normalizeCategory($category);
                $query->where(function ($q) use ($categoriesToMatch, $category) {
                    $q->whereIn('category', $categoriesToMatch)
                      ->orWhereIn('type', $categoriesToMatch)
                      ->orWhere('category', 'like', "%{$category}%");
                });
            }
            $operators = $query->orderBy('name')->get();

            // Fetch existing mappings for this API
            $mappings = [];
            if (Schema::hasTable('api_operator_mappings')) {
                $mappings = ApiOperatorMapping::where('api_id', $apiId)
                    ->get()
                    ->keyBy('utility_operator_id');
            }

            // Merge mapping info with operators
            $data = $operators->map(function ($op) use ($mappings) {
                $mapping = $mappings->get($op->id);
                return [
                    'utility_operator_id' => $op->id,
                    'name' => $op->name,
                    'code' => $op->code,
                    'category' => $op->category,
                    'type' => $op->type,
                    'biller_icon' => $op->biller_icon || $op->icon,
                    'is_active' => $op->is_active,
                    'api_operator_code' => $mapping ? ($mapping->api_operator_code ?? '') : '',
                    'mapping_id' => $mapping ? $mapping->id : null,
                    'mapping_status' => $mapping ? $mapping->is_active : true,
                ];
            });

            return response()->json([
                'status' => 1,
                'message' => 'Operators retrieved successfully',
                'data' => $data
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching operators for mapping: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch operators: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Map category aliases between BBPS Categories and Utility Operators categories.
     */
    private function normalizeCategory($category)
    {
        if (empty($category)) return [];

        $catLower = strtolower(trim($category));

        $map = [
            'prepaid' => ['MobilePrepaid', 'Prepaid', 'Mobile Recharge'],
            'mobile recharge' => ['MobilePrepaid', 'Prepaid', 'Mobile Recharge'],
            'mobileprepaid' => ['MobilePrepaid', 'Prepaid', 'Mobile Recharge'],
            'mobile postpaid' => ['PostPaid', 'Postpaid', 'Mobile Postpaid'],
            'postpaid' => ['PostPaid', 'Postpaid', 'Mobile Postpaid'],
            'postpaid recharge' => ['PostPaid', 'Postpaid', 'Mobile Postpaid'],
            'fastag' => ['FASTag', 'Fastag'],
            'loan repayment' => ['Loan', 'Loan Repayment'],
            'loan' => ['Loan', 'Loan Repayment'],
            'pay bill payment' => ['Pay Bill Payments', 'Pay Bill Payment'],
            'dth' => ['DTH', 'DTH Recharge'],
            'dth recharge' => ['DTH', 'DTH Recharge'],
            'gas' => ['Gas', 'LPG Gas', 'Piped Gas'],
            'lpg gas' => ['Gas', 'LPG Gas', 'Piped Gas'],
        ];

        return $map[$catLower] ?? [$category];
    }

    /**
     * Bulk save or update operator mappings for an API and Category.
     */
    public function saveMappings(Request $request)
    {
        try {
            $apiId = $request->input('api_id');
            $category = $request->input('category');
            $mappings = $request->input('mappings', []);

            if (empty($apiId)) {
                return response()->json([
                    'status' => 0,
                    'message' => 'API ID is required'
                ], 400);
            }

            if (!is_array($mappings)) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Mappings must be an array'
                ], 400);
            }

            DB::beginTransaction();

            foreach ($mappings as $item) {
                if (empty($item['utility_operator_id'])) {
                    continue;
                }

                ApiOperatorMapping::updateOrCreate(
                    [
                        'api_id' => $apiId,
                        'utility_operator_id' => $item['utility_operator_id']
                    ],
                    [
                        'category' => $category ?? ($item['category'] ?? null),
                        'operator_code' => $item['code'] ?? ($item['operator_code'] ?? null),
                        'api_operator_code' => isset($item['api_operator_code']) ? trim($item['api_operator_code']) : null,
                        'is_active' => filter_var($item['mapping_status'] ?? true, FILTER_VALIDATE_BOOLEAN)
                    ]
                );
            }

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Operator mappings saved successfully!'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error saving operator mappings: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to save operator mappings: ' . $e->getMessage()
            ], 500);
        }
    }
}
