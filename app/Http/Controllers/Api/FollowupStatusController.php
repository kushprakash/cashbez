<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FollowupStatus;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FollowupStatusController extends Controller
{
    /**
     * Display a listing of followup statuses.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = FollowupStatus::query()
                ->with(['followupType:id,name', 'admin:id,name,email', 'createdBy:id,name,email'])
                ->active()
                ->ordered();

            // Filter by followup type if provided
            if ($request->has('followup_type_id') && $request->followup_type_id) {
                $query->forType($request->followup_type_id);
            }
            
            $followupStatuses = $query->get(['id', 'name', 'color', 'description', 'followup_type_id', 'admin_id', 'created_by', 'created_at', 'updated_at']);
            
            return response()->json($followupStatuses);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch followup statuses',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created followup status.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:100',
                'color' => 'required|string|max:7',
                'description' => 'nullable|string',
                'followup_type_id' => 'nullable|exists:followup_types,id',
                'sort_order' => 'nullable|integer|min:0',
            ]);

                        $validated['created_by'] = auth()->id();
            $validated['admin_id'] = auth()->id();
            
            $followupStatus = FollowupStatus::create($validated);
            
            return response()->json($followupStatus, 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create followup status',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified followup status.
     */
    public function show(FollowupStatus $followupStatus): JsonResponse
    {
        try {
            $followupStatus->load(['followupType', 'admin:id,name,email', 'createdBy:id,name,email']);
            return response()->json($followupStatus);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch followup status',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified followup status.
     */
    public function update(Request $request, FollowupStatus $followupStatus): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:100',
                'color' => 'required|string|max:7',
                'description' => 'nullable|string',
                'followup_type_id' => 'nullable|exists:followup_types,id',
                'sort_order' => 'nullable|integer|min:0',
                'is_active' => 'boolean',
            ]);

            $followupStatus->update($validated);
            
            return response()->json($followupStatus);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update followup status',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified followup status.
     */
    public function destroy(FollowupStatus $followupStatus): JsonResponse
    {
        try {
            $followupStatus->deleted_by = auth()->id();
            $followupStatus->save();
            $followupStatus->delete();
            
            return response()->json(['message' => 'Followup status deleted successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete followup status',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
