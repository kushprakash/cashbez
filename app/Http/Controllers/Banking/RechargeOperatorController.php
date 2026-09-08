<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\UtilityOperator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class RechargeOperatorController extends Controller
{
    /**
     * Display a listing of operators from utility_operators table.
     */
    public function index(Request $request)
    {
        try {
            $query = UtilityOperator::query();

            // Search by name, code, category, type, state
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%")
                      ->orWhere('category', 'like', "%{$search}%")
                      ->orWhere('type', 'like', "%{$search}%")
                      ->orWhere('state', 'like', "%{$search}%");
                });
            }

            // Filter by category or type if provided
            if ($request->has('category') && !empty($request->category)) {
                $query->where('category', $request->category);
            }
            if ($request->has('service_type') && !empty($request->service_type)) {
                $query->where(function ($q) use ($request) {
                    $q->where('category', $request->service_type)
                      ->orWhere('type', $request->service_type);
                });
            }

            // Pagination
            $perPage = $request->get('per_page', 10);
            if ($perPage == -1 || $perPage == 'all') {
                $operators = $query->orderBy('id', 'desc')->get();
                return response()->json([
                    'status' => 1,
                    'message' => 'Operators retrieved successfully',
                    'data' => $operators
                ]);
            }

            $operators = $query->orderBy('id', 'desc')->paginate($perPage);

            return response()->json([
                'status' => 1,
                'message' => 'Operators retrieved successfully',
                'data' => $operators->items(),
                'pagination' => [
                    'total' => $operators->total(),
                    'per_page' => $operators->perPage(),
                    'current_page' => $operators->currentPage(),
                    'last_page' => $operators->lastPage(),
                    'from' => $operators->firstItem(),
                    'to' => $operators->lastItem(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching utility operators: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch operators: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created operator in utility_operators table.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:200',
                'code' => 'required|string|max:50',
                'category' => 'required|string|max:100',
                'circle_id' => 'nullable',
                'state' => 'nullable|string|max:100',
                'label' => 'nullable|string|max:200',
                'icon' => 'nullable|string|max:500',
                'biller_icon' => 'nullable|string|max:500',
                'is_active' => 'nullable|in:0,1,true,false',
                'status' => 'nullable|in:0,1,true,false',
                'operator_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = [];
            // Category & Type get selected category
            $categoryVal = $request->input('category') ?: $request->input('service_type');
            $data['category'] = $categoryVal;
            $data['type'] = $request->input('type') ?: $categoryVal;

            // State gets utility_circles ID or code
            $stateVal = $request->input('state') ?: $request->input('circle_id');
            $data['state'] = $stateVal ? (string)$stateVal : null;

            $data['code'] = strtoupper($request->input('code') ?: $request->input('operator_code'));
            $data['name'] = $request->input('name');
            $data['label'] = $request->input('label') ?: $data['name'];

            // Status handling
            $isActive = $request->has('is_active') ? $request->input('is_active') : $request->input('status', true);
            $data['is_active'] = filter_var($isActive, FILTER_VALIDATE_BOOLEAN);

            // Handle Icon / Logo file upload
            if ($request->hasFile('operator_logo')) {
                $file = $request->file('operator_logo');
                $filename = 'operator_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('uploads/operators'), $filename);
                $data['icon'] = asset('uploads/operators/' . $filename);
                $data['biller_icon'] = asset('uploads/operators/' . $filename);
            } elseif ($request->has('icon')) {
                $data['icon'] = $request->input('icon');
            }

            if ($request->has('biller_icon')) {
                $data['biller_icon'] = $request->input('biller_icon');
            }

            $operator = UtilityOperator::create($data);

            return response()->json([
                'status' => 1,
                'message' => 'Operator created successfully',
                'data' => $operator
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating utility operator: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to create operator: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified operator.
     */
    public function show($id)
    {
        try {
            $operator = UtilityOperator::find($id);

            if (!$operator) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Operator not found'
                ], 404);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Operator details retrieved',
                'data' => $operator
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching operator: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified operator in utility_operators table.
     */
    public function update(Request $request, $id)
    {
        try {
            $operator = UtilityOperator::find($id);

            if (!$operator) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Operator not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:200',
                'code' => 'required|string|max:50',
                'category' => 'required|string|max:100',
                'circle_id' => 'nullable',
                'state' => 'nullable|string|max:100',
                'label' => 'nullable|string|max:200',
                'icon' => 'nullable|string|max:500',
                'biller_icon' => 'nullable|string|max:500',
                'is_active' => 'nullable',
                'status' => 'nullable',
                'operator_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $categoryVal = $request->input('category') ?: $request->input('service_type');
            $operator->category = $categoryVal;
            $operator->type = $request->input('type') ?: $categoryVal;

            $stateVal = $request->input('state') ?: $request->input('circle_id');
            $operator->state = $stateVal ? (string)$stateVal : null;

            $operator->code = strtoupper($request->input('code') ?: $request->input('operator_code'));
            $operator->name = $request->input('name');
            $operator->label = $request->input('label') ?: $operator->name;

            if ($request->has('is_active') || $request->has('status')) {
                $isActive = $request->has('is_active') ? $request->input('is_active') : $request->input('status');
                $operator->is_active = filter_var($isActive, FILTER_VALIDATE_BOOLEAN);
            }

            // Handle Logo file upload
            if ($request->hasFile('operator_logo')) {
                $file = $request->file('operator_logo');
                $filename = 'operator_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('uploads/operators'), $filename);
                $operator->icon = asset('uploads/operators/' . $filename);
                $operator->biller_icon = asset('uploads/operators/' . $filename);
            } elseif ($request->has('icon')) {
                $operator->icon = $request->input('icon');
            }

            if ($request->has('biller_icon')) {
                $operator->biller_icon = $request->input('biller_icon');
            }

            $operator->save();

            return response()->json([
                'status' => 1,
                'message' => 'Operator updated successfully',
                'data' => $operator
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating utility operator: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update operator: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified operator.
     */
    public function destroy($id)
    {
        try {
            $operator = UtilityOperator::find($id);

            if (!$operator) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Operator not found'
                ], 404);
            }

            $operator->delete();

            return response()->json([
                'status' => 1,
                'message' => 'Operator deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to delete operator: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle operator status or is_active.
     */
    public function toggleStatus(Request $request, $id)
    {
        try {
            $operator = UtilityOperator::find($id);

            if (!$operator) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Operator not found'
                ], 404);
            }

            $field = $request->input('field', 'is_active');
            if ($field === 'status' || $field === 'api_status') {
                $field = 'is_active';
            }

            $value = filter_var($request->input('value'), FILTER_VALIDATE_BOOLEAN);
            $operator->$field = $value;
            $operator->save();

            return response()->json([
                'status' => 1,
                'message' => 'Status updated successfully',
                'data' => $operator
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error toggling status: ' . $e->getMessage()
            ], 500);
        }
    }
}
