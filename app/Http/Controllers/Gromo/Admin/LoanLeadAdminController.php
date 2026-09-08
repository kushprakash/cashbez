<?php

namespace App\Http\Controllers\Gromo\Admin;

use App\Http\Controllers\Controller;
use App\Models\LoanLead;
use App\Models\LoanLeadHistory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class LoanLeadAdminController extends Controller
{
    /**
     * Admin dashboard
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

        if (!in_array($user->role, [1, 2])) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied'
            ], 403);
        }

        // Get comprehensive statistics
        $stats = $this->getAdminStats($user);

        // Get recent leads
        $recentLeads = $this->applyAdminFilter(
            LoanLead::with(['user:id,name,mobile', 'assignedTo:id,name'])
                ->whereNull('deleted_at')
                ->orderBy('created_at', 'DESC')
                ->limit(10),
            $user
        )->get();

        // Get leads requiring attention
        $requiresAttention = $this->applyAdminFilter(
            LoanLead::with(['user:id,name,mobile'])
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
     * List all leads (Admin)
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
                'message' => 'Access denied'
            ], 403);
        }

        $query = LoanLead::with(['user:id,name,mobile,email', 'assignedTo:id,name'])
            ->whereNull('deleted_at')
            ->orderBy('created_at', 'DESC');

        // Apply admin-specific filters
        $query = $this->applyAdminFilter($query, $user);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('loan_type')) {
            $query->where('loan_type', $request->loan_type);
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
            $query->where(function ($q) use ($search) {
                $q->where('lead_id', 'LIKE', "%{$search}%")
                  ->orWhere('full_name', 'LIKE', "%{$search}%")
                  ->orWhere('mobile', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('business_name', 'LIKE', "%{$search}%");
            });
        }

        $leads = $query->paginate(50);

        return response()->json([
            'status' => 1,
            'message' => 'Leads fetched successfully',
            'data' => [
                'leads' => $leads->items(),
                'pagination' => [
                    'current_page' => $leads->currentPage(),
                    'last_page' => $leads->lastPage(),
                    'per_page' => $leads->perPage(),
                    'total' => $leads->total()
                ]
            ]
        ]);
    }

    /**
     * Get single lead details (Admin)
     */
    public function show(Request $request, $id)
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
                'message' => 'Access denied'
            ], 403);
        }

        $lead = LoanLead::with([
            'user:id,name,mobile,email',
            'assignedTo:id,name',
            'commissionReleasedBy:id,name',
            'history.changedBy:id,name'
        ])->find($id);

        if (!$lead) {
            return response()->json([
                'status' => 0,
                'message' => 'Lead not found'
            ], 200);
        }

        if (!$this->canManageLead($lead, $user)) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied'
            ], 403);
        }

        return response()->json([
            'status' => 1,
            'message' => 'Lead details fetched successfully',
            'data' => [
                'lead' => $lead,
                'assignees' => $this->getAssignees($user)
            ]
        ]);
    }

    /**
     * Update lead status
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
                'message' => 'Access denied'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:new,contacted,document_pending,under_review,processing,approved,disbursed,rejected,cancelled',
            'status_message' => 'nullable|string|max:500',
            'admin_notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $lead = LoanLead::find($id);
        if (!$lead) {
            return response()->json([
                'status' => 0,
                'message' => 'Lead not found'
            ], 200);
        }

        if (!$this->canManageLead($lead, $user)) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied'
            ], 403);
        }

        try {
            DB::beginTransaction();

            $oldStatus = $lead->status;
            $newStatus = $request->status;

            $lead->update([
                'status' => $newStatus,
                'status_message' => $request->status_message,
                'admin_notes' => $request->admin_notes,
                'updated_at' => now()
            ]);

            // Log status change
            $lead->logStatusChange(
                $oldStatus,
                $newStatus,
                $user->id,
                $request->status_message ?: "Status updated to {$newStatus}"
            );

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Status updated successfully',
                'data' => $lead->fresh()->load(['user', 'assignedTo'])
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
     * Assign lead to team member
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
                'message' => 'Access denied'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'assigned_to' => 'required|exists:users,id',
            'remarks' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $lead = LoanLead::find($id);
        if (!$lead) {
            return response()->json([
                'status' => 0,
                'message' => 'Lead not found'
            ], 200);
        }

        try {
            DB::beginTransaction();

            $assignee = User::find($request->assigned_to);
            $lead->update([
                'assigned_to' => $request->assigned_to,
                'updated_at' => now()
            ]);

            // Log assignment
            $lead->logStatusChange(
                $lead->status,
                $lead->status,
                $user->id,
                $request->remarks ?: "Lead assigned to {$assignee->name}"
            );

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Lead assigned successfully',
                'data' => $lead->fresh()->load(['user', 'assignedTo'])
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
     * Update notes only
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
                'message' => 'Access denied'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'admin_notes' => 'nullable|string|max:1000',
            'status_message' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $lead = LoanLead::find($id);
        if (!$lead) {
            return response()->json([
                'status' => 0,
                'message' => 'Lead not found'
            ], 200);
        }

        if (!$this->canManageLead($lead, $user)) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied'
            ], 403);
        }

        try {
            $lead->update([
                'admin_notes' => $request->admin_notes,
                'status_message' => $request->status_message,
                'updated_at' => now()
            ]);

            // Log notes update
            $lead->logStatusChange(
                $lead->status,
                $lead->status,
                $user->id,
                "Notes updated"
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
     * Set commission
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
                'message' => 'Access denied'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'commission_amount' => 'required|numeric|min:0',
            'commission_status' => 'required|in:pending,approved,released,cancelled',
            'remarks' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $lead = LoanLead::find($id);
        if (!$lead) {
            return response()->json([
                'status' => 0,
                'message' => 'Lead not found'
            ], 200);
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
                'commission_set_at' => now(),
                'commission_set_by' => $user->id,
                'updated_at' => now()
            ]);

            // Log commission set
            $lead->logStatusChange(
                $lead->status,
                $lead->status,
                $user->id,
                $request->remarks ?: "Commission set to ₹{$request->commission_amount} with status {$request->commission_status}"
            );

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Commission set successfully',
                'data' => $lead->fresh()->load('commissionSetBy')
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
                'message' => 'Access denied'
            ], 403);
        }

        $lead = LoanLead::find($id);
        if (!$lead) {
            return response()->json([
                'status' => 0,
                'message' => 'Lead not found'
            ], 200);
        }

        // Check if commission can be released
        if ($lead->status !== 'disbursed' || 
            $lead->commission_status !== 'approved' || 
            !$lead->commission_amount) {
            return response()->json([
                'status' => 0,
                'message' => 'Commission cannot be released. Requirements: Lead must be disbursed, commission must be approved, and commission amount must be set.'
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

            // Log commission release
            $remarks = $request->remarks ?? "Commission released: ₹{$lead->commission_amount}";
            $lead->logStatusChange(
                $lead->status,
                $lead->status,
                $user->id,
                $remarks
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
                'message' => 'Access denied'
            ], 403);
        }

        $query = LoanLead::with(['user:id,name,mobile', 'commissionReleasedBy:id,name'])
            ->whereNotNull('commission_amount')
            ->whereNull('deleted_at');

        // Apply admin-specific filters
        $query = $this->applyAdminFilter($query, $user);

        // Apply date filters
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Apply commission status filter
        if ($request->filled('commission_status')) {
            $query->where('commission_status', $request->commission_status);
        }

        // Apply loan type filter
        if ($request->filled('loan_type')) {
            $query->where('loan_type', $request->loan_type);
        }

        $commissions = $query->orderBy('created_at', 'DESC')->get();

        // Calculate summary
        $summary = [
            'pending' => [
                'amount' => $commissions->where('commission_status', 'pending')->sum('commission_amount'),
                'count' => $commissions->where('commission_status', 'pending')->count()
            ],
            'approved' => [
                'amount' => $commissions->where('commission_status', 'approved')->sum('commission_amount'),
                'count' => $commissions->where('commission_status', 'approved')->count()
            ],
            'released' => [
                'amount' => $commissions->where('commission_status', 'released')->sum('commission_amount'),
                'count' => $commissions->where('commission_status', 'released')->count()
            ],
            'total' => [
                'amount' => $commissions->sum('commission_amount'),
                'count' => $commissions->count()
            ]
        ];

        return response()->json([
            'status' => 1,
            'message' => 'Commission report fetched successfully',
            'data' => [
                'commissions' => $commissions,
                'summary' => $summary
            ]
        ]);
    }

    /**
     * Apply admin-specific filters based on role
     */
    private function applyAdminFilter($query, $user)
    {
        // if ($user->role == 1) {
        //     // SuperAdmin - can see all leads
            return $query;
        // } elseif ($user->role == 2) {
        //     // Admin - can see leads assigned to them or created by users under them
        //     return $query->where(function ($q) use ($user) {
        //         $q->where('assigned_to', $user->id)
        //           ->orWhereHas('user', function ($subQ) use ($user) {
        //               $subQ->where('created_by', $user->id);
        //           });
        //     });
        // }

        // return $query->whereRaw('1 = 0'); // No access for other roles
    }

    /**
     * Check if user can manage specific lead
     */
    private function canManageLead($lead, $user)
    {
        // if ($user->role == 1) {
            return true; // SuperAdmin can manage all leads
        // }

        // if ($user->role == 2) {
        //     // Admin can manage leads assigned to them or created by users under them
        //     return $lead->assigned_to == $user->id || 
        //            $lead->user->created_by == $user->id;
        // }

        // return false;
    }

    /**
     * Get admin statistics
     */
    private function getAdminStats($user)
    {
        $query = $this->applyAdminFilter(
            LoanLead::whereNull('deleted_at'),
            $user
        );

        // Status stats
        $stats['status'] = [
            'total' => (clone $query)->count(),
            'new' => (clone $query)->where('status', 'new')->count(),
            'contacted' => (clone $query)->where('status', 'contacted')->count(),
            'document_pending' => (clone $query)->where('status', 'document_pending')->count(),
            'under_review' => (clone $query)->where('status', 'under_review')->count(),
            'processing' => (clone $query)->where('status', 'processing')->count(),
            'approved' => (clone $query)->where('status', 'approved')->count(),
            'disbursed' => (clone $query)->where('status', 'disbursed')->count(),
            'rejected' => (clone $query)->where('status', 'rejected')->count(),
            'cancelled' => (clone $query)->where('status', 'cancelled')->count(),
        ];

        // Loan type stats
        $stats['loan_type'] = [
            'personal' => (clone $query)->where('loan_type', 'personal')->count(),
            'business' => (clone $query)->where('loan_type', 'business')->count(),
        ];

        // Commission stats
        $commissionQuery = $this->applyAdminFilter(
            LoanLead::whereNull('deleted_at')
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
     * Get assignees
     */
    private function getAssignees($user)
    {
        if ($user->role == 1) { // SuperAdmin
            return User::whereIn('role', [1, 2])
                ->where('status', 1)
                ->select('id', 'name', 'role')
                ->get();
        } elseif ($user->role == 2) { // Admin
            return User::where('created_by', $user->id)
                ->where('status', 1)
                ->select('id', 'name', 'role')
                ->get();
        }

        return collect();
    }
}