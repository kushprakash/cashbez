<?php

namespace App\Http\Controllers\Gromo;

use App\Http\Controllers\Controller;
use App\Models\CreditCardLead;
use App\Models\CreditCardLeadHistory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class CreditCardLeadController extends Controller
{
    /**
     * Get credit card lead dashboard data
     * GET /api/credit-card-leads/dashboard
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

        // Get lead statistics
        $stats = $this->getLeadStats($user);

        // Get recent leads (last 10)
        $recentLeads = $this->applyRoleBasedFilter(
            CreditCardLead::with(['user:id,name,mobile', 'assignedTo:id,name', 'admin:id,name'])
                ->whereNull('deleted_at')
                ->orderBy('created_at', 'DESC')
                ->limit(10),
            $user
        )->get();

        // Get pending leads count
        $pendingCount = $this->applyRoleBasedFilter(
            CreditCardLead::whereNull('deleted_at')
                ->whereIn('status', ['new', 'contacted', 'document_pending', 'under_review']),
            $user
        )->count();

        return response()->json([
            'status' => 1,
            'message' => 'Dashboard data fetched successfully',
            'data' => [
                'stats' => $stats,
                'recent_leads' => $recentLeads,
                'pending_count' => $pendingCount
            ]
        ]);
    }

    /**
     * Display a listing of credit card leads with filters
     * GET /api/credit-card-leads
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

        $query = CreditCardLead::with([
            'user:id,name,mobile,email',
            'assignedTo:id,name',
            'admin:id,name',
            'createdBy:id,name'
        ])->whereNull('deleted_at');

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('desired_card')) {
            $query->where('desired_card', $request->desired_card);
        }
        if ($request->filled('lead_source')) {
            $query->where('lead_source', $request->lead_source);
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
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('pan', 'LIKE', "%{$search}%");
            });
        }

        // Apply role-based filtering
        $query = $this->applyRoleBasedFilter($query, $user);

        $leads = $query->orderBy('created_at', 'DESC')->get();

        // Get filter options
        $cardTypes = $this->getCardTypes();
        $leadSources = $this->getLeadSources();

        return response()->json([
            'status' => 1,
            'message' => 'Leads fetched successfully',
            'data' => [
                'leads' => $leads,
                'lead_count' => $leads->count(),
                'card_types' => $cardTypes,
                'lead_sources' => $leadSources
            ]
        ]);
    }

    /**
     * Store a newly created credit card lead
     * POST /api/credit-card-leads
     */
    public function store(Request $request)
    {
        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:100',
            'mobile' => 'required|string|max:15',
            'email' => 'required|email|max:100',
            'dob' => 'required|date|before:today',
            'pan' => 'required|string|size:10|regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/',
            'monthly_income' => 'required|numeric|min:0',
            'desired_card' => 'required|string|max:50',
            'lead_source' => 'nullable|string|max:50',
            'preferred_contact_time' => 'required|in:morning,afternoon,evening,anytime',
            'consent' => 'required|boolean',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!$request->consent) {
            return response()->json([
                'status' => 0,
                'message' => 'Consent is required to submit the lead',
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Generate unique lead ID
            $leadId = CreditCardLead::generateLeadId();

            // Get admin_id from user
            $adminId = $user->role == 1 ? $user->id : ($user->admin_id ?? null);

            // Create credit card lead
            $lead = CreditCardLead::create([
                'user_id' => $user->id,
                'lead_id' => $leadId,
                'full_name' => $request->full_name,
                'mobile' => $request->mobile,
                'email' => $request->email,
                'dob' => $request->dob,
                'pan' => strtoupper($request->pan),
                'monthly_income' => $request->monthly_income,
                'desired_card' => $request->desired_card,
                'lead_source' => $request->lead_source ?? 'Website',
                'preferred_contact_time' => $request->preferred_contact_time,
                'consent' => $request->consent,
                'consent_timestamp' => now(),
                'status' => 'new',
                'admin_id' => $adminId,
                'created_by' => $user->id,
                'notes' => $request->notes,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Log history
            $this->logLeadHistory(
                $leadId,
                null,
                'new',
                'Lead created',
                $user->id,
                $user->role,
                $request->ip()
            );

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Credit card lead created successfully',
                'data' => $lead
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Error creating lead: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified credit card lead
     * GET /api/credit-card-leads/{id}
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

        $lead = CreditCardLead::with([
            'user',
            'assignedTo',
            'admin',
            'createdBy',
            'commissionReleasedBy',
            'history.changedBy'
        ])->where('lead_id', $id)->first();

        if (!$lead) {
            return response()->json([
                'status' => 0,
                'message' => 'Lead not found'
            ], 404);
        }

        // Check permissions
        if (!$this->canViewLead($lead, $user)) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied'
            ], 403);
        }

        return response()->json([
            'status' => 1,
            'message' => 'Lead fetched successfully',
            'data' => [
                'lead' => $lead,
                'can_edit' => $this->canEditLead($lead, $user),
                'permissions' => [
                    'can_view' => true,
                    'can_edit' => $this->canEditLead($lead, $user),
                    'can_delete' => $this->canDeleteLead($lead, $user)
                ]
            ]
        ]);
    }

    /**
     * Delete the specified lead (soft delete)
     * DELETE /api/credit-card-leads/{id}
     */
    public function destroy(Request $request, $id)
    {
        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 401);
        }

        $lead = CreditCardLead::where('lead_id', $id)->first();

        if (!$lead) {
            return response()->json([
                'status' => 0,
                'message' => 'Lead not found'
            ], 404);
        }

        if (!$this->canDeleteLead($lead, $user)) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied'
            ], 403);
        }

        try {
            DB::beginTransaction();

            $oldStatus = $lead->status;
            $lead->update([
                'status' => 'cancelled',
                'deleted_at' => now()
            ]);

            // Log history
            $this->logLeadHistory(
                $id,
                $oldStatus,
                'cancelled',
                'Lead cancelled/deleted',
                $user->id,
                $user->role,
                $request->ip()
            );

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Lead deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Error deleting lead: ' . $e->getMessage()
            ], 500);
        }
    }

    // ==================== PRIVATE HELPER METHODS ====================

    /**
     * Apply role-based filtering to query
     */
    private function applyRoleBasedFilter($query, $user)
    {
        $role = $user->role;
        $userId = $user->id;

        switch ($role) {
            case 1: // SuperAdmin
                // Can see all leads
                break;

            case 2: // Admin
                $query->where('admin_id', $userId);
                break;

            default: // Regular users
                $query->where(function ($q) use ($userId) {
                    $q->where('user_id', $userId)
                      ->orWhere('created_by', $userId);
                });
                break;
        }

        return $query;
    }

    /**
     * Get lead statistics
     */
    private function getLeadStats($user)
    {
        $query = $this->applyRoleBasedFilter(
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
        $commissionQuery = $this->applyRoleBasedFilter(
            CreditCardLead::whereNull('deleted_at')
                ->whereNotNull('commission_amount'),
            $user
        );

        $stats['commission'] = [
            'pending' => (clone $commissionQuery)->where('commission_status', 'pending')->sum('commission_amount'),
            'approved' => (clone $commissionQuery)->where('commission_status', 'approved')->sum('commission_amount'),
            'released' => (clone $commissionQuery)->where('commission_status', 'released')->sum('commission_amount'),
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
     * Get card types
     */
    private function getCardTypes()
    {
        return [
            'Cashback' => 'Cashback Card',
            'Rewards' => 'Rewards Card',
            'Travel' => 'Travel Card',
            'Fuel' => 'Fuel Card',
            'Shopping' => 'Shopping Card',
            'Premium' => 'Premium Card',
            'Basic' => 'Basic Card'
        ];
    }

    /**
     * Get lead sources
     */
    private function getLeadSources()
    {
        return [
            'Website' => 'Website',
            'Mobile App' => 'Mobile App',
            'Referral' => 'Referral',
            'Partner' => 'Partner',
            'Direct' => 'Direct'
        ];
    }

    /**
     * Check if user can view lead
     */
    private function canViewLead($lead, $user)
    {
        if ($user->role == 1) { // SuperAdmin
            return true;
        }

        if ($user->role == 2) { // Admin
            // return $lead->admin_id == $user->id;
            return true;
        }

        return $lead->user_id == $user->id || $lead->created_by == $user->id;
    }

    /**
     * Check if user can edit lead
     */
    private function canEditLead($lead, $user)
    {
        if ($user->role == 1) { // SuperAdmin
            return true;
        }

        if (!$lead->canBeEdited()) {
            return false;
        }

        return $lead->created_by == $user->id;
    }

    /**
     * Check if user can delete lead
     */
    private function canDeleteLead($lead, $user)
    {
        if ($user->role == 1) { // SuperAdmin
            return true;
        }

        if (in_array($lead->status, ['approved', 'rejected'])) {
            return false;
        }

        return $lead->created_by == $user->id;
    }
}
