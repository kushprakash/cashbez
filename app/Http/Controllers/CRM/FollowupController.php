<?php
namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Followup;
use App\Models\Lead;
use App\Services\LeadActivityService;
use Illuminate\Http\Request;

class FollowupController extends Controller
{
   

    public function index(Request $request) {
        $query = Followup::with(['lead', 'user', 'createdBy']);

        if($request->get('isAdmin')) {
            $query->where('admin_id', $request->get('admin')->id);
        } else {
            $query->where('created_by', $request->get('user')->id);
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by followup_type if provided
        if ($request->has('followup_type')) {
            $query->where('followup_type', $request->followup_type);
        }

        // Filter by followup_status if provided
        if ($request->has('followup_status')) {
            $query->where('followup_status', $request->followup_status);
        }

        // Filter by completion status
        if ($request->has('is_completed')) {
            $query->where('is_completed', $request->boolean('is_completed'));
        }

        return $query->orderBy('followup_date', 'desc')->get();
    }

    
    public function store(Request $request) {
        $data = $request->validate([
            'lead_id' => 'required|integer',
            'followup_date' => 'required|date',
            'followup_time' => 'nullable|string',
            'followup_type' => 'nullable|exists:followup_types,id',
            'followup_status' => 'nullable|exists:followup_statuses,id',
            'lead_status' => 'nullable|exists:lead_status,id',
            'notes' => 'nullable|string',
            'is_completed' => 'nullable|boolean',
        ]);
        
        // Map the new field names to the database column names
        if (isset($data['followup_type'])) {
            $data['followup_type_id'] = $data['followup_type'];
            unset($data['followup_type']);
        }
        
        if (isset($data['followup_status'])) {
            $data['followup_status_id'] = $data['followup_status'];
            unset($data['followup_status']);
        }

        if (isset($data['lead_status'])) {
            $data['lead_status_id'] = $data['lead_status'];
            unset($data['lead_status']);
        }
        
        $data['user_id'] = $request->get('user')->id;
        $data['created_by'] = $request->get('user')->id;
        $data['admin_id'] = $request->get('admin')->id;
        $data['is_completed'] = $data['is_completed'] ?? false;
        
        $followup = Followup::create($data);

        // Update lead status if provided
        if ($request->lead_status) {
            Lead::findOrFail($request->lead_id)->update(['status_id' => $request->lead_status]);
        }
        
        // Auto-log followup creation activity (this will also update the lead's followup_date)
        LeadActivityService::logFollowupCreated(
            $data['lead_id'], 
            $data, 
            $request->get('user')->id, 
            $request->get('admin')->id
        );
        
        return $followup;
    }
    public function show($id) { 
        return Followup::with(['lead', 'user', 'createdBy'])->findOrFail($id); 
    }
    public function update(Request $request, $id) {
        $followup = Followup::findOrFail($id);
        $oldStatus = $followup->status;
        
        $data = $request->validate([
            'lead_id' => 'sometimes|integer',
            'followup_date' => 'sometimes|date',
            'followup_time' => 'nullable|string',
            'followup_type' => 'sometimes|exists:followup_types,id',
            'followup_status' => 'nullable|exists:followup_statuses,id',
            'lead_status' => 'nullable|exists:lead_status,id',
            'notes' => 'nullable|string',
            'status' => 'sometimes|in:pending,done',
            'is_completed' => 'nullable|boolean',
        ]);
        
        // Map the new field names to the database column names
        if (isset($data['followup_type'])) {
            $data['followup_type_id'] = $data['followup_type'];
            unset($data['followup_type']);
        }
        
        if (isset($data['followup_status'])) {
            $data['followup_status_id'] = $data['followup_status'];
            unset($data['followup_status']);
        }

        if (isset($data['lead_status'])) {
            $data['lead_status_id'] = $data['lead_status'];
            unset($data['lead_status']);
        }
        
        $followup->update($data);

        // Update lead status if provided
        if ($request->lead_status) {
            Lead::findOrFail($followup->lead_id)->update(['status_id' => $request->lead_status]);
        }
        
        // Update the lead's followup_date if the followup date was changed
        if (isset($data['followup_date'])) {
            $lead = \App\Models\Lead::find($followup->lead_id);
            if ($lead) {
                $lead->update(['followup_date' => $data['followup_date']]);
            }
        }
        
        // Auto-log followup status change (particularly when marked as done)
        if (isset($data['status']) && $data['status'] === 'done' && $oldStatus !== 'done') {
            LeadActivityService::logFollowupCompleted(
                $followup->lead_id, 
                $data, 
                $request->get('user')->id, 
                $request->get('admin')->id
            );
        }
        
        return $followup;
    }
    public function destroy(Request $request, $id) {
        $followup = Followup::findOrFail($id);
        $followup->update(['deleted_by' => $request->get('user')->id]);
        $followup->delete(); // This will soft delete

        return response()->json(['success' => true]);
    }

    /**
     * Get available followup types
     */
    public function getFollowupTypes() {
        return response()->json([
            'followup_types' => Followup::FOLLOWUP_TYPES
        ]);
    }

    /**
     * Get available followup statuses
     */
    public function getFollowupStatuses() {
        return response()->json([
            'followup_statuses' => Followup::FOLLOWUP_STATUSES
        ]);
    }

    /**
     * Get followup statistics
     */
    public function getFollowupStats(Request $request) {
        $query = Followup::query();
        
        if($request->get('isAdmin')) {
            $query->where('admin_id', $request->get('admin')->id);
        } else {
            $query->where('created_by', $request->get('user')->id);
        }

        $stats = [
            'total' => $query->count(),
            'completed' => $query->where('is_completed', true)->count(),
            'pending' => $query->where('is_completed', false)->count(),
            'by_type' => $query->selectRaw('followup_type, COUNT(*) as count')
                              ->groupBy('followup_type')
                              ->pluck('count', 'followup_type'),
            'by_status' => $query->selectRaw('followup_status, COUNT(*) as count')
                                ->whereNotNull('followup_status')
                                ->groupBy('followup_status')
                                ->pluck('count', 'followup_status'),
        ];

        return response()->json(['stats' => $stats]);
    }
}
