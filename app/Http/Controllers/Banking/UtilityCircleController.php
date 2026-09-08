<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\UtilityCircle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class UtilityCircleController extends Controller
{
    /**
     * Display a listing of Utility Circles.
     */
    public function index(Request $request)
    {
        try {
            $query = UtilityCircle::query();

            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
                });
            }

            if ($request->has('status') && $request->status !== null && $request->status !== '') {
                $query->where('status', filter_var($request->status, FILTER_VALIDATE_BOOLEAN));
            }

            $perPage = $request->get('per_page', 10);
            if ($perPage == -1 || $perPage == 'all') {
                $circles = $query->orderBy('id', 'asc')->get();
                return response()->json([
                    'status' => 1,
                    'message' => 'Utility circles retrieved successfully',
                    'data' => $circles
                ]);
            }

            $circles = $query->orderBy('id', 'asc')->paginate($perPage);

            return response()->json([
                'status' => 1,
                'message' => 'Utility circles retrieved successfully',
                'data' => $circles->items(),
                'pagination' => [
                    'total' => $circles->total(),
                    'per_page' => $circles->perPage(),
                    'current_page' => $circles->currentPage(),
                    'last_page' => $circles->lastPage(),
                    'from' => $circles->firstItem(),
                    'to' => $circles->lastItem(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching utility circles: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch utility circles: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created circle.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => 'required|string|max:50|unique:utility_circles,code',
                'name' => 'required|string|max:150',
                'status' => 'nullable|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();
            $data['status'] = isset($data['status']) ? filter_var($data['status'], FILTER_VALIDATE_BOOLEAN) : true;

            $circle = UtilityCircle::create($data);

            return response()->json([
                'status' => 1,
                'message' => 'Utility Circle created successfully',
                'data' => $circle
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating Utility Circle: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to create circle: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified circle.
     */
    public function show($id)
    {
        try {
            $circle = UtilityCircle::find($id);

            if (!$circle) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Circle not found'
                ], 404);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Circle details retrieved',
                'data' => $circle
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching circle: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified circle.
     */
    public function update(Request $request, $id)
    {
        try {
            $circle = UtilityCircle::find($id);

            if (!$circle) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Circle not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'code' => 'required|string|max:50|unique:utility_circles,code,' . $id,
                'name' => 'required|string|max:150',
                'status' => 'nullable|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();
            if (isset($data['status'])) {
                $data['status'] = filter_var($data['status'], FILTER_VALIDATE_BOOLEAN);
            }

            $circle->update($data);

            return response()->json([
                'status' => 1,
                'message' => 'Utility Circle updated successfully',
                'data' => $circle
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating Utility Circle: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update circle: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified circle.
     */
    public function destroy($id)
    {
        try {
            $circle = UtilityCircle::find($id);

            if (!$circle) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Circle not found'
                ], 404);
            }

            $circle->delete();

            return response()->json([
                'status' => 1,
                'message' => 'Circle deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to delete circle: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle circle status.
     */
    public function toggleStatus(Request $request, $id)
    {
        try {
            $circle = UtilityCircle::find($id);

            if (!$circle) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Circle not found'
                ], 404);
            }

            $circle->status = !$circle->status;
            $circle->save();

            return response()->json([
                'status' => 1,
                'message' => 'Status updated successfully',
                'data' => $circle
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error toggling status: ' . $e->getMessage()
            ], 500);
        }
    }
}
