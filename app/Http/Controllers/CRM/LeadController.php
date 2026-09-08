<?php
namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Services\LeadActivityService;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function index(Request $request) {

        if($request->get('isAdmin')) {
            return Lead::with([
                'leadType', 
                'source', 
                'status', 
                'assignedUser',
                'latestFollowup.followupType',
                'latestFollowup.followupStatus',
                'activities' => function($query) {
                    $query->orderBy('created_at', 'desc')->limit(15);
                }
            ])
            ->where('admin_id', $request->get('admin')->id)
            ->get(); 
        } else {
            return Lead::with([
                'leadType', 
                'source', 
                'status', 
                'assignedUser',
                'latestFollowup.followupType',
                'latestFollowup.followupStatus',
                'activities' => function($query) {
                    $query->orderBy('created_at', 'desc')->limit(15);
                }
            ])
            ->where('admin_id', $request->get('admin')->id)
            ->where(function ($query) use ($request) {
                $query->where('created_by', $request->get('user')->id)
                    ->orWhere('assigned_user_id', $request->get('user')->id);
            })
            ->get();
            }
    }
    
    public function store(Request $request) {
        $data = $request->validate([
            'lead_type_id' => 'required|integer',
            'name' => 'required|string|max:150',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|string|max:150',
            'source_id' => 'nullable|integer',
            'assigned_user_id' => 'nullable|integer',
            'followup_type_id' => 'nullable|integer',
            'status_id' => 'nullable|integer',
            'lead_status_id' => 'nullable|integer',
            'priority' => 'required|in:low,medium,high',
            'details' => 'nullable|string',
            'followup_date' => 'nullable|date'
        ]);

        $data['created_by'] = $request->get('user')->id;
        $data['admin_id'] = $request->get('admin')->id;
        
        // Map frontend fields to Lead model
        // Frontend: 'status_id' is Follow-up Status, 'lead_status_id' is Lead Status
        $leadData = $data;
        $leadData['status_id'] = $data['lead_status_id'] ?? null;
        
        $lead = Lead::create($leadData);
        
        // Auto-log lead creation activity
        LeadActivityService::logLeadCreated(
            $lead->id, 
            $data, 
            $request->get('user')->id, 
            $request->get('admin')->id
        );

        // If Follow-up Type is selected, create the initial Follow-up record
        if (!empty($data['followup_type_id'])) {
            $followupData = [
                'user_id' => $request->get('user')->id,
                'lead_id' => $lead->id,
                'followup_date' => $data['followup_date'] ?? now()->toDateString(),
                'followup_time' => now()->toTimeString(),
                'followup_type_id' => $data['followup_type_id'],
                'followup_status_id' => $data['status_id'] ?? null,
                'lead_status_id' => $data['lead_status_id'] ?? null,
                'notes' => 'Initial Follow-up configured during lead creation.',
                'is_completed' => false,
                'created_by' => $request->get('user')->id,
                'admin_id' => $request->get('admin')->id,
            ];
            
            \App\Models\Followup::create($followupData);
            LeadActivityService::logFollowupCreated($lead->id, $followupData, $request->get('user')->id, $request->get('admin')->id);
        }
        
        return $lead;
    }
    
    public function show($id) { 
        return Lead::with([
            'leadType', 
            'source', 
            'status', 
            'assignedUser', 
            'activities', 
            'followups.followupType',
            'followups.followupStatus',
            'latestFollowup.followupType',
            'latestFollowup.followupStatus'
        ])->findOrFail($id); 
    }
    
    public function update(Request $request, $id) {
        $lead = Lead::findOrFail($id);
        $oldData = $lead->toArray();
        
        $lead->update($request->all());
        
        // Auto-log lead update activity
        LeadActivityService::logLeadUpdated(
            $lead->id, 
            $oldData, 
            $request->all(), 
            $request->get('user')->id, 
            $request->get('admin')->id
        );
        
        return $lead;
    }
    
    public function destroy(Request $request, $id) {
        $lead = Lead::findOrFail($id);
        
        // Auto-log lead deletion activity
        LeadActivityService::logActivity(
            $lead->id, 
            'lead_deleted', 
            "Lead '{$lead->name}' was deleted", 
            $request->get('user')->id, 
            $request->get('admin')->id
        );
        
        $lead->update(['deleted_by' => $request->get('user')->id]);
        $lead->delete(); // This will soft delete

       
        return response()->json(['success' => true, 'message' => 'Lead deleted successfully']);
    }
    
    /**
     * Update lead status with automatic activity logging
     */
    public function updateStatus(Request $request, $id) {
        try {
            $request->validate([
                'status_id' => 'required|integer|exists:lead_statuses,id',
                'reason' => 'nullable|string'
            ]);
            
            $lead = Lead::findOrFail($id);
            $oldStatusId = $lead->status_id;
            
            $lead->update(['status_id' => $request->status_id]);
            
            // Auto-log status change activity with safe user/admin access
            $userId = $request->get('user')->id ?? auth()->id() ?? null;
            $adminId = $request->get('admin')->id ?? $userId ?? null;
            
            LeadActivityService::logStatusChanged(
                $lead->id, 
                "Status ID: {$oldStatusId}", 
                "Status ID: {$request->status_id}", 
                $userId,
                $adminId
            );
            
            return response()->json(['success' => true, 'lead' => $lead]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Lead status update failed: ' . $e->getMessage());
            return response()->json([
                'success' => false, 
                'message' => 'Failed to update lead status: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Close/win a lead
     */
    public function closeLead(Request $request, $id) {
        $request->validate([
            'reason' => 'nullable|string'
        ]);
        
        $lead = Lead::findOrFail($id);
        
        // Auto-log lead closed activity
        LeadActivityService::logLeadClosed(
            $lead->id, 
            $request->reason, 
            $request->get('user')->id, 
            $request->get('admin')->id
        );
        
        return response()->json(['success' => true, 'message' => 'Lead marked as closed/won']);
    }
    
    /**
     * Mark lead as lost
     */
    public function markAsLost(Request $request, $id) {
        $request->validate([
            'reason' => 'nullable|string'
        ]);
        
        $lead = Lead::findOrFail($id);
        
        // Auto-log lead lost activity
        LeadActivityService::logLeadLost(
            $lead->id, 
            $request->reason, 
            $request->get('user')->id, 
            $request->get('admin')->id
        );
        
        return response()->json(['success' => true, 'message' => 'Lead marked as lost']);
    }
    
    /**
     * Log communication/call
     */
    public function logCommunication(Request $request, $id) {
        $request->validate([
            'type' => 'required|in:call,email,meeting,sms,whatsapp',
            'details' => 'required|string'
        ]);
        
        $lead = Lead::findOrFail($id);
        
        // Auto-log communication activity
        LeadActivityService::logCommunication(
            $lead->id, 
            $request->type, 
            $request->details, 
            $request->get('user')->id, 
            $request->get('admin')->id
        );
        
        return response()->json(['success' => true, 'message' => 'Communication logged successfully']);
    }
    
    /**
     * Get lead activity timeline
     */
    public function getTimeline($id) {
        $activities = LeadActivityService::getLeadTimeline($id);
        return response()->json(['activities' => $activities]);
    }
}
