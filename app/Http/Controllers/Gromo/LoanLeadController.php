<?php

namespace App\Http\Controllers\Gromo;

use App\Http\Controllers\Controller;
use App\Models\LoanLead;
use App\Models\LoanLeadHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class LoanLeadController extends Controller
{
    /**
     * Display dashboard with statistics
     */
    public function dashboard(Request $request)
    {
        try {
            $period = $request->get('period', 'today');
            $userId = Auth::id();

            $stats = LoanLead::getStatsByPeriod($period, $userId);
            
            // Get recent leads
            $recentLeads = LoanLead::where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            return response()->json([
                'status' => 1,
                'message' => 'Dashboard data retrieved successfully',
                'data' => [
                    'stats' => $stats,
                    'recent_leads' => $recentLeads
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to load dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display a listing of loan leads
     */
    public function index(Request $request)
    {
        try {
            $query = LoanLead::with(['user', 'assignedTo']);

            // Filter by user if not admin
            if (!$this->isAdmin()) {
                $query->where('user_id', Auth::id());
            }

            // Apply filters
            if ($request->filled('loan_type')) {
                $query->where('loan_type', $request->loan_type);
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('lead_source')) {
                $query->where('lead_source', $request->lead_source);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('lead_id', 'like', "%{$search}%")
                      ->orWhere('full_name', 'like', "%{$search}%")
                      ->orWhere('mobile', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($request->filled('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $leads = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'status' => 1,
                'message' => 'Loan leads retrieved successfully',
                'data' => [
                    'leads' => $leads
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to load loan leads',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created loan lead
     */
    public function store(Request $request)
    {
        try {
            $validator = $this->validateLoanLead($request);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'error' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $data = $request->all();
            $data['user_id'] = Auth::id();
            $data['created_by'] = Auth::id();
            $data['status'] = 'new';

            if ($data['consent']) {
                $data['consent_timestamp'] = now();
            }

            $loanLead = LoanLead::create($data);

            // Log the creation
            $loanLead->logStatusChange(null, 'new', Auth::id(), 'Lead created');

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Loan lead created successfully',
                'data' => [
                    'lead' => $loanLead,
                    'lead_id' => $loanLead->lead_id
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Failed to create loan lead',
                'error' => $e->getMessage()
            ], 500);
        }
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
     * Display the specified loan lead
     */
    public function show($id)
    {
        try {
            $loanLead = LoanLead::with(['user', 'assignedTo', 'admin', 'createdBy', 'history.changedBy'])
                ->findOrFail($id);

            // // Check permission
            // if (!$this->isAdmin() && $loanLead->user_id !== Auth::id()) {
            //     return response()->json([
            //         'status' => 0,
            //         'message' => 'Unauthorized access'
            //     ], 403);
            // }

            $token = $request->header('Token');
            $user = User::where('remember_token', $token)->first();
            
            // Check permissions
            if (!$this->canViewLead($loanLead, $user)) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Access denied'
                ], 403);
            }
            

            return response()->json([
                'status' => 1,
                'message' => 'Loan lead retrieved successfully',
                'data' => [
                    'lead' => $loanLead
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Loan lead not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified loan lead
     */
    public function update(Request $request, $id)
    {
        try {
            $loanLead = LoanLead::findOrFail($id);

            // Check permission
            if (!$this->isAdmin() && $loanLead->user_id !== Auth::id()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            $validator = $this->validateLoanLead($request, $id);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'error' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $oldStatus = $loanLead->status;
            $data = $request->all();

            $loanLead->update($data);

            // Log status change if status was updated
            if (isset($data['status']) && $data['status'] !== $oldStatus) {
                $loanLead->logStatusChange($oldStatus, $data['status'], Auth::id(), $request->get('remarks'));
            }

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Loan lead updated successfully',
                'data' => [
                    'lead' => $loanLead->fresh()
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update loan lead',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update loan lead status (Admin only)
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            if (!$this->isAdmin()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:new,contacted,document_pending,under_review,approved,rejected,cancelled,processing,disbursed',
                'remarks' => 'nullable|string|max:1000',
                'commission_amount' => 'nullable|numeric|min:0',
                'commission_status' => 'nullable|in:pending,approved,released,cancelled'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation failed',
                    'error' => $validator->errors()
                ], 422);
            }

            $loanLead = LoanLead::findOrFail($id);
            $oldStatus = $loanLead->status;

            DB::beginTransaction();

            $updateData = [
                'status' => $request->status,
                'admin_id' => Auth::id()
            ];

            if ($request->filled('remarks')) {
                $updateData['admin_notes'] = $request->remarks;
            }

            if ($request->filled('commission_amount')) {
                $updateData['commission_amount'] = $request->commission_amount;
                $updateData['commission_status'] = $request->get('commission_status', 'pending');
            }

            $loanLead->update($updateData);

            // Log status change
            $loanLead->logStatusChange($oldStatus, $request->status, Auth::id(), $request->remarks);

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Status updated successfully',
                'data' => [
                    'lead' => $loanLead->fresh()
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Release commission (Admin only)
     */
    public function releaseCommission(Request $request, $id)
    {
        try {
            if (!$this->isAdmin()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            $loanLead = LoanLead::findOrFail($id);

            if (!$loanLead->commission_amount || $loanLead->commission_status === 'released') {
                return response()->json([
                    'status' => 0,
                    'message' => 'Commission not available for release'
                ], 400);
            }

            DB::beginTransaction();

            $loanLead->update([
                'commission_status' => 'released',
                'commission_released_at' => now(),
                'commission_released_by' => Auth::id()
            ]);

            // Log commission release
            $loanLead->logStatusChange(
                $loanLead->status,
                $loanLead->status,
                Auth::id(),
                "Commission of ₹{$loanLead->commission_amount} released"
            );

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Commission released successfully',
                'data' => [
                    'lead' => $loanLead->fresh()
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Failed to release commission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get loan lead history
     */
    public function history($id)
    {
        try {
            $loanLead = LoanLead::findOrFail($id);

            // Check permission
            if (!$this->isAdmin() && $loanLead->user_id !== Auth::id()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            $history = LoanLeadHistory::with('changedBy')
                ->where('lead_id', $loanLead->lead_id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'status' => 1,
                'message' => 'History retrieved successfully',
                'data' => [
                    'history' => $history
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to load history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate loan lead data
     */
    private function validateLoanLead(Request $request, $id = null)
    {
        $rules = [
            'loan_type' => 'required|in:personal,business',
            'full_name' => 'required|string|max:255',
            'mobile' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'dob' => 'required|date|before:today',
            'pan' => 'required|string|size:10|regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/',
            'loan_amount' => 'required|numeric|min:10000',
            'loan_tenure' => 'required|integer|min:6|max:360',
            'consent' => 'required|boolean|accepted',
            'lead_source' => 'nullable|string|max:100',
            'preferred_contact_time' => 'nullable|in:morning,afternoon,evening,anytime',
            'notes' => 'nullable|string|max:1000'
        ];

        // Personal loan specific rules
        if ($request->loan_type === 'personal') {
            $rules = array_merge($rules, [
                'employment_type' => 'required|in:salaried,self_employed,business,unemployed',
                'monthly_income' => 'required|numeric|min:10000',
                'company_name' => 'nullable|string|max:255',
                'job_title' => 'nullable|string|max:255',
                'work_experience' => 'nullable|integer|min:0',
                'loan_purpose' => 'nullable|in:debt_consolidation,home_improvement,medical,education,wedding,travel,other'
            ]);
        }

        // Business loan specific rules
        if ($request->loan_type === 'business') {
            $rules = array_merge($rules, [
                'business_name' => 'required|string|max:255',
                'business_type' => 'required|in:proprietorship,partnership,private_limited,public_limited,llp,other',
                'business_vintage' => 'required|integer|min:6',
                'annual_turnover' => 'required|numeric|min:100000',
                'business_category' => 'nullable|string|max:255',
                'gst_number' => 'nullable|string|max:20',
                'loan_purpose' => 'nullable|in:working_capital,equipment_purchase,business_expansion,inventory,debt_consolidation,other'
            ]);
        }

        return Validator::make($request->all(), $rules);
    }

    /**
     * Check if user is admin
     */
    private function isAdmin()
    {
        // Add your admin role check logic here
        return Auth::user() && (Auth::user()->role === 'admin' || Auth::user()->role === 'super_admin');
    }
}