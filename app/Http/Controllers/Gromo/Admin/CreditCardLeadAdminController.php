<?php

namespace App\Http\Controllers\Gromo\Admin;

use App\Http\Controllers\Controller;
use App\Models\CreditCardLead;
use App\Models\CreditCardLeadHistory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class CreditCardLeadAdminController extends Controller
{
    /**
     * Get admin dashboard for credit card leads
     * GET /api/admin/credit-card-leads/dashboard
     */
    public function dashboard(Request $request)
    {
        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 401);
        }

        if (!in_array($user->role, [1, 2])) { // SuperAdmin or Admin only
            return response()->json([
                'status' => 0,
                'message' => 'Access denied. Admin privileges required.',
            ], 403);
        }

        // Get comprehensive statistics
        $stats = $this->getAdminStats($user);

        // Get recent leads
        $recentLeads = $this->applyAdminFilter(
            CreditCardLead::with(['user:id,name,mobile', 'assignedTo:id,name'])
                ->whereNull('deleted_at')
                ->orderBy('created_at', 'DESC')
                ->limit(10),
            $user
        )->get();

        // Get leads requiring attention
        $requiresAttention = $this->applyAdminFilter(
            CreditCardLead::with(['user:id,name,mobile'])
                ->whereNull('deleted_at')
                ->whereIn('status', ['new', 'document_pending'])
                ->orderBy('created_at', 'ASC')
                ->limit(10),
            $user
        )->get();

        return response()->json([
            'status' => 1,
            'message' => 'Admin dashboard data fetched successfully',
            'data' => [
                'stats' => $stats,
                'recent_leads' => $recentLeads,
                'requires_attention' => $requiresAttention
            ]
        ]);
    }

    /**
     * Get all leads with admin filters
     * GET /api/admin/credit-card-leads
     */
    public function index(Request $request)
    {
        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 401);
        }

        if (!in_array($user->role, [1, 2])) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied. Admin privileges required.',
            ], 403);
        }

        $query = CreditCardLead::with([
            'user:id,name,mobile,email',
            'assignedTo:id,name',
            'admin:id,name',
            'createdBy:id,name',
            'commissionReleasedBy:id,name'
        ])->whereNull('deleted_at');

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('commission_status')) {
            $query->where('commission_status', $request->commission_status);
        }
        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('lead_id', 'LIKE', "%{$search}%")
                  ->orWhere('full_name', 'LIKE', "%{$search}%")
                  ->orWhere('mobile', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        // Apply admin-based filtering
        $query = $this->applyAdminFilter($query, $user);

        $leads = $query->orderBy('created_at', 'DESC')->get();

        // Get assignees for filter
        $assignees = $this->getAssignees($user);

        return response()->json([
            'status' => 1,
            'message' => 'Leads fetched successfully',
            'data' => [
                'leads' => $leads,
                'lead_count' => $leads->count(),
                'assignees' => $assignees
            ]
        ]);
    }

    /**
     * Update lead status
     * PUT /api/admin/credit-card-leads/{id}/status
     */
    public function updateStatus(Request $request, $id)
    {
        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 401);
        }

        if (!in_array($user->role, [1, 2])) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied. Admin privileges required.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:new,contacted,document_pending,under_review,approved,rejected,cancelled',
            'status_message' => 'nullable|string|max:255',
            'admin_notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $lead = CreditCardLead::where('lead_id', $id)->first();

        if (!$lead) {
            return response()->json([
                'status' => 0,
                'message' => 'Lead not found'
            ], 404);
        }

        // Check if admin has access to this lead
        if (!$this->canManageLead($lead, $user)) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied'
            ], 403);
        }

        try {
            DB::beginTransaction();

            $oldStatus = $lead->status;
            $updateData = [
                'status' => $request->status,
                'updated_at' => now()
            ];

            if ($request->filled('status_message')) {
                $updateData['status_message'] = $request->status_message;
            }

            if ($request->filled('admin_notes')) {
                $updateData['admin_notes'] = $request->admin_notes;
            }

            $lead->update($updateData);

            // Log history
            $this->logLeadHistory(
                $id,
                $oldStatus,
                $request->status,
                $request->admin_notes ?? "Status updated from {$oldStatus} to {$request->status}",
                $user->id,
                $user->role,
                $request->ip()
            );

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Status updated successfully',
                'data' => $lead->fresh()->load(['user', 'assignedTo', 'admin'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Error updating status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign lead to user
     * PUT /api/admin/credit-card-leads/{id}/assign
     */
    public function assign(Request $request, $id)
    {
        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 401);
        }

        if (!in_array($user->role, [1, 2])) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied. Admin privileges required.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'assigned_to' => 'required|integer|exists:users,id',
            'remarks' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $lead = CreditCardLead::where('lead_id', $id)->first();

        if (!$lead) {
            return response()->json([
                'status' => 0,
                'message' => 'Lead not found'
            ], 404);
        }

        if (!$this->canManageLead($lead, $user)) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied'
            ], 403);
        }

        try {
            DB::beginTransaction();

            $oldAssignedTo = $lead->assigned_to;
            $lead->update([
                'assigned_to' => $request->assigned_to,
                'updated_at' => now()
            ]);

            // Log history
            $assignedToUser = User::find($request->assigned_to);
            $remarks = $request->remarks ?? "Lead assigned to {$assignedToUser->name}";
            
            $this->logLeadHistory(
                $id,
                $lead->status,
                $lead->status,
                $remarks,
                $user->id,
                $user->role,
                $request->ip()
            );

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Lead assigned successfully',
                'data' => $lead->fresh()->load('assignedTo')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Error assigning lead: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update admin notes and message
     * PUT /api/admin/credit-card-leads/{id}/notes
     */
    public function updateNotes(Request $request, $id)
    {
        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 401);
        }

        if (!in_array($user->role, [1, 2])) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied. Admin privileges required.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'admin_notes' => 'nullable|string',
            'status_message' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $lead = CreditCardLead::where('lead_id', $id)->first();

        if (!$lead) {
            return response()->json([
                'status' => 0,
                'message' => 'Lead not found'
            ], 404);
        }

        if (!$this->canManageLead($lead, $user)) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied'
            ], 403);
        }

        try {
            $updateData = ['updated_at' => now()];

            if ($request->filled('admin_notes')) {
                $updateData['admin_notes'] = $request->admin_notes;
            }

            if ($request->filled('status_message')) {
                $updateData['status_message'] = $request->status_message;
            }

            $lead->update($updateData);

            // Log history
            $this->logLeadHistory(
                $id,
                $lead->status,
                $lead->status,
                'Admin notes/message updated',
                $user->id,
                $user->role,
                $request->ip()
            );

            return response()->json([
                'status' => 1,
                'message' => 'Notes updated successfully',
                'data' => $lead->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error updating notes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Set commission for approved lead
     * PUT /api/admin/credit-card-leads/{id}/commission
     */
    public function setCommission(Request $request, $id)
    {
        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 401);
        }

        if (!in_array($user->role, [1, 2])) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied. Admin privileges required.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'commission_amount' => 'required|numeric|min:0',
            'commission_status' => 'required|in:pending,approved',
            'remarks' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $lead = CreditCardLead::where('lead_id', $id)->first();

        if (!$lead) {
            return response()->json([
                'status' => 0,
                'message' => 'Lead not found'
            ], 404);
        }

        if ($lead->status !== 'approved') {
            return response()->json([
                'status' => 0,
                'message' => 'Commission can only be set for approved leads'
            ], 400);
        }

        if (!$this->canManageLead($lead, $user)) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied'
            ], 403);
        }

        try {
            DB::beginTransaction();

            $lead->update([
                'commission_amount' => $request->commission_amount,
                'commission_status' => $request->commission_status,
                'updated_at' => now()
            ]);

            // Log history
            $remarks = $request->remarks ?? "Commission set: ₹{$request->commission_amount}, Status: {$request->commission_status}";
            $this->logLeadHistory(
                $id,
                $lead->status,
                $lead->status,
                $remarks,
                $user->id,
                $user->role,
                $request->ip()
            );

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Commission set successfully',
                'data' => $lead->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Error setting commission: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Release commission
     * POST /api/admin/credit-card-leads/{id}/release-commission
     */
    public function releaseCommission(Request $request, $id)
    {
        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 401);
        }

        if (!in_array($user->role, [1, 2])) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied. Admin privileges required.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'remarks' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $lead = CreditCardLead::where('lead_id', $id)->first();

        if (!$lead) {
            return response()->json([
                'status' => 0,
                'message' => 'Lead not found'
            ], 404);
        }

        if (!$lead->canReleaseCommission()) {
            return response()->json([
                'status' => 0,
                'message' => 'Commission cannot be released. Requirements: Lead must be approved, commission must be approved, and commission amount must be set.'
            ], 400);
        }

        if (!$this->canManageLead($lead, $user)) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied'
            ], 403);
        }

        try {
            DB::beginTransaction();

            $lead->update([
                'commission_status' => 'released',
                'commission_released_at' => now(),
                'commission_released_by' => $user->id,
                'updated_at' => now()
            ]);

            // Log history
            $remarks = $request->remarks ?? "Commission released: ₹{$lead->commission_amount}";
            $this->logLeadHistory(
                $id,
                $lead->status,
                $lead->status,
                $remarks,
                $user->id,
                $user->role,
                $request->ip()
            );

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Commission released successfully',
                'data' => $lead->fresh()->load('commissionReleasedBy')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Error releasing commission: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get commission report
     * GET /api/admin/credit-card-leads/commission-report
     */
    public function commissionReport(Request $request)
    {
        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 401);
        }

        if (!in_array($user->role, [1, 2])) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied. Admin privileges required.',
            ], 403);
        }

        $query = CreditCardLead::whereNull('deleted_at')
            ->whereNotNull('commission_amount');

        // Apply admin filter
        $query = $this->applyAdminFilter($query, $user);

        // Apply date filters
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $commissionData = [
            'pending' => [
                'count' => (clone $query)->where('commission_status', 'pending')->count(),
                'amount' => (clone $query)->where('commission_status', 'pending')->sum('commission_amount')
            ],
            'approved' => [
                'count' => (clone $query)->where('commission_status', 'approved')->count(),
                'amount' => (clone $query)->where('commission_status', 'approved')->sum('commission_amount')
            ],
            'released' => [
                'count' => (clone $query)->where('commission_status', 'released')->count(),
                'amount' => (clone $query)->where('commission_status', 'released')->sum('commission_amount')
            ],
        ];

        // Get detailed commission list
        $commissions = $query->with(['user:id,name,mobile', 'commissionReleasedBy:id,name'])
            ->orderBy('commission_released_at', 'DESC')
            ->get();

        return response()->json([
            'status' => 1,
            'message' => 'Commission report fetched successfully',
            'data' => [
                'summary' => $commissionData,
                'commissions' => $commissions
            ]
        ]);
    }

    // ==================== PRIVATE HELPER METHODS ====================

    /**
     * Apply admin-based filtering
     */
    private function applyAdminFilter($query, $user)
    {
        // if ($user->role == 1) { // SuperAdmin
            return $query; // Can see all
        // }

        // if ($user->role == 2) { // Admin
        //     return $query->where('admin_id', $user->id);
        // }

        // return $query->where('1', '0'); // No access for others
    }

    /**
     * Get admin statistics
     */
    private function getAdminStats($user)
    {
        $query = $this->applyAdminFilter(
            CreditCardLead::whereNull('deleted_at'),
            $user
        );

        $stats = [
            'total' => (clone $query)->count(),
            'new' => (clone $query)->where('status', 'new')->count(),
            'contacted' => (clone $query)->where('status', 'contacted')->count(),
            'document_pending' => (clone $query)->where('status', 'document_pending')->count(),
            'under_review' => (clone $query)->where('status', 'under_review')->count(),
            'approved' => (clone $query)->where('status', 'approved')->count(),
            'rejected' => (clone $query)->where('status', 'rejected')->count(),
        ];

        // Commission stats
        $commissionQuery = $this->applyAdminFilter(
            CreditCardLead::whereNull('deleted_at')
                ->whereNotNull('commission_amount'),
            $user
        );

        $stats['commission'] = [
            'total_pending' => (clone $commissionQuery)->where('commission_status', 'pending')->sum('commission_amount'),
            'total_approved' => (clone $commissionQuery)->where('commission_status', 'approved')->sum('commission_amount'),
            'total_released' => (clone $commissionQuery)->where('commission_status', 'released')->sum('commission_amount'),
            'pending_count' => (clone $commissionQuery)->where('commission_status', 'pending')->count(),
            'approved_count' => (clone $commissionQuery)->where('commission_status', 'approved')->count(),
            'released_count' => (clone $commissionQuery)->where('commission_status', 'released')->count(),
        ];

        return $stats;
    }

    /**
     * Log lead history
     */
    private function logLeadHistory(
        $leadId,
        $oldStatus,
        $newStatus,
        $remarks,
        $changedBy,
        $changedByRole,
        $ipAddress
    ) {
        CreditCardLeadHistory::create([
            'lead_id' => $leadId,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'changed_by' => $changedBy,
            'changed_by_role' => $changedByRole,
            'remarks' => $remarks,
            'ip_address' => $ipAddress,
            'user_agent' => request()->userAgent(),
            'created_at' => now()
        ]);
    }

    /**
     * Get assignees
     */
    private function getAssignees($user)
    {
        if ($user->role == 1) { // SuperAdmin
            return User::where('status', 1)
                ->select('id as value', 'name as label')
                ->get();
        }

        // Admin can see their team
        return User::where('admin_id', $user->id)
            ->orWhere('id', $user->id)
            ->where('status', 1)
            ->select('id as value', 'name as label')
            ->get();
    }

    /**
     * Check if admin can manage lead
     */
    private function canManageLead($lead, $user)
    {
        // if ($user->role == 1) { // SuperAdmin
            return true;
        // }

        // if ($user->role == 2) { // Admin
        //     return $lead->admin_id == $user->id;
        // }

        // return false;
    }
}
