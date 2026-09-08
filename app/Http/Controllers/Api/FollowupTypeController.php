<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FollowupType;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FollowupTypeController extends Controller
{
    /**
     * Display a listing of followup types.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = FollowupType::with(['admin:id,name,email', 'createdBy:id,name,email', 'leadType:id,name', 'leadSource:id,name'])
                ->active()
                ->ordered();

            // Filter by lead type if provided
            if ($request->has('lead_type_id') && $request->lead_type_id) {
                $query->where('lead_type_id', $request->lead_type_id);
            }

            // Filter by lead source if provided
            if ($request->has('lead_source_id') && $request->lead_source_id) {
                $query->where('lead_source_id', $request->lead_source_id);
            }

            $followupTypes = $query->get(['id', 'name', 'color', 'description', 'lead_type_id', 'lead_source_id', 'admin_id', 'created_by', 'created_at', 'updated_at']);
            
           return response()->json($followupTypes);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch followup types',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created followup type.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:100|unique:followup_types,name',
                'color' => 'required|string|max:7',
                'description' => 'nullable|string',
                'sort_order' => 'nullable|integer|min:0',
            ]);

            $validated['created_by'] = auth()->id();
            $validated['admin_id'] = auth()->id();

            $followupType = FollowupType::create($validated);
            
            return response()->json($followupType, 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create followup type',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified followup type.
     */
    public function show(FollowupType $followupType): JsonResponse
    {
        try {
            $followupType->load(['followupStatuses', 'admin:id,name,email', 'createdBy:id,name,email']);
            return response()->json($followupType);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch followup type',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified followup type.
     */
    public function update(Request $request, FollowupType $followupType): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:100|unique:followup_types,name,' . $followupType->id,
                'color' => 'required|string|max:7',
                'description' => 'nullable|string',
                'sort_order' => 'nullable|integer|min:0',
                'is_active' => 'boolean',
            ]);

            $followupType->update($validated);
            
            return response()->json($followupType);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update followup type',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified followup type.
     */
    public function destroy(FollowupType $followupType): JsonResponse
    {
        try {
            $followupType->deleted_by = auth()->id();
            $followupType->save();
            $followupType->delete();
            
            return response()->json(['message' => 'Followup type deleted successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete followup type',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
