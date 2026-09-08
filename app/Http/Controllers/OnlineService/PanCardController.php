<?php

namespace App\Http\Controllers\OnlineService;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UtiPsaAgent;
use App\Models\PanFundRequest;
use App\Models\PanApplicationReport;
use App\Models\Account;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PanCardController extends Controller
{
    /**
     * Get next suggested Agent ID (e.g. ANNECHM-816 -> ANNECHM-817)
     */
    private function getNextAgentId()
    {
        $latestAgent = UtiPsaAgent::whereNotNull('agent_id')
            ->where('agent_id', '!=', '')
            ->orderBy('id', 'desc')
            ->first();

        if (!$latestAgent || !$latestAgent->agent_id) {
            return 'ANNECHM-816';
        }

        $agentId = trim($latestAgent->agent_id);
        
        // Extract prefix and number using regex
        if (preg_match('/^(.*?)(\d+)$/', $agentId, $matches)) {
            $prefix = $matches[1];
            $num = (int)$matches[2];
            $nextNum = $num + 1;
            // Retain leading zeroes if any
            $paddedNum = str_pad($nextNum, strlen($matches[2]), '0', STR_PAD_LEFT);
            return $prefix . $paddedNum;
        }

        return $agentId . '-1';
    }

    /**
     * Get current user's agent registration status
     */
    public function getAgentStatus(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);
            }

            $agent = UtiPsaAgent::where('user_id', $user->id)->first();

            return response()->json([
                'status' => 1,
                'suggested_agent_id' => $this->getNextAgentId(),
                'data' => $agent
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Register or update agent application (User Side)
     */
    public function registerAgent(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);
            }

            $validator = Validator::make($request->all(), [
                'agent_id' => 'nullable|string|max:100',
                'name' => 'required|string|max:255',
                'contact_person' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'mobile_no' => 'required|string|max:20',
                'pin' => 'required|string|max:10',
                'location' => 'required|string|max:255',
                'state' => 'required|string|max:100',
                'district' => 'required|string|max:100',
                'pan_no' => 'required|string|max:20',
                'address_1' => 'required|string|max:500',
                'address_2' => 'nullable|string|max:500',
                'address_3' => 'nullable|string|max:500',
                'address_4' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => $validator->errors()->first(),
                    'errors' => $validator->errors()
                ], 422);
            }

            $admin = User::where('mid', $user->admin_mid)->first();
            $agent = UtiPsaAgent::where('user_id', $user->id)->first();

            if ($agent && $user->is_api_partner == 0) {
                if ($agent->status == 1) {
                    return response()->json([
                        'status' => 0,
                        'message' => 'Your PSA Agent Registration is already APPROVED.'
                    ], 400);
                } elseif ($agent->status == 0) {
                    return response()->json([
                        'status' => 0,
                        'message' => 'Your registration is currently PENDING admin review.'
                    ], 400);
                }

                // If status was rejected (2), update fields and re-submit as pending (0)
                $assignedAgentId = $request->agent_id ? trim($request->agent_id) : ($agent->agent_id ?: $this->getNextAgentId());
                $agent->update(array_merge($request->only([
                    'name', 'contact_person', 'email', 'mobile_no', 'pin',
                    'location', 'state', 'district', 'pan_no',
                    'address_1', 'address_2', 'address_3', 'address_4'
                ]), [
                    'agent_id' => $assignedAgentId,
                    'status' => 0,
                    'admin_remark' => null,
                    'approved_by' => null,
                    'approved_at' => null,
                ]));

                return response()->json([
                    'status' => 1,
                    'message' => 'Agent registration re-submitted successfully!',
                    'data' => $agent
                ]);
            }

            // Create new agent registration
            $assignedAgentId = $request->agent_id ? trim($request->agent_id) : $this->getNextAgentId();

            $agent = UtiPsaAgent::create(array_merge($request->only([
                'name', 'contact_person', 'email', 'mobile_no', 'pin',
                'location', 'state', 'district', 'pan_no',
                'address_1', 'address_2', 'address_3', 'address_4'
            ]), [
                'user_id' => $user->id,
                'admin_id' => $admin->id,
                'agent_id' => $assignedAgentId,
                'status' => 0, // Pending
            ]));

            return response()->json([
                'status' => 1,
                'message' => 'PSA Agent Registration submitted successfully!',
                'data' => $agent
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }


    /**
     * Get Admin Agent list (Super Admin & Admin Role 2)
     */
    public function getAdminAgents(Request $request)
    {
        try {
            $query = UtiPsaAgent::with(['user:id,mid,name,email,mobile']);

            if ($request->has('search') && !empty($request->search)) {
                $s = $request->search;
                $query->where(function($q) use ($s) {
                    $q->where('name', 'like', "%{$s}%")
                      ->orWhere('agent_id', 'like', "%{$s}%")
                      ->orWhere('email', 'like', "%{$s}%")
                      ->orWhere('mobile_no', 'like', "%{$s}%")
                      ->orWhere('pan_no', 'like', "%{$s}%");
                });
            }

            if ($request->has('status') && $request->status !== '' && $request->status !== null) {
                $query->where('status', $request->status);
            }

            $perPage = $request->input('per_page', 15);
            $agents = $query->orderBy('id', 'desc')->paginate($perPage);

            return response()->json([
                'status' => 1,
                'suggested_agent_id' => $this->getNextAgentId(),
                'data' => $agents
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Update Agent registration status (Super Admin ONLY)
     */
    public function updateAgentStatus(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);
            }

            // Check Super Admin Permission (role == 1 or role_id == 1)
            $isSuperAdmin = ($user->role == 1 || $user->role_id == 1 || (isset($user->role_info) && $user->role_info->name === 'Super Admin'));
            if (!$isSuperAdmin) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Unauthorized: Only Super Admin can approve or reject agent registrations.'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'id' => 'required|exists:uti_psa_agents,id',
                'status' => 'required|in:1,2', // 1=Approved, 2=Rejected
                'agent_id' => 'nullable|string|max:100',
                'admin_remark' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => $validator->errors()->first()
                ], 422);
            }

            $agent = UtiPsaAgent::findOrFail($request->id);
            $newStatus = (int)$request->status;

            if ($newStatus == 1) { // Approved
                $assignedAgentId = $request->agent_id ? trim($request->agent_id) : $this->getNextAgentId();

                $agent->update([
                    'status' => 1,
                    'agent_id' => $assignedAgentId,
                    'admin_remark' => $request->admin_remark,
                    'approved_by' => $user->id,
                    'approved_at' => now(),
                ]);

                return response()->json([
                    'status' => 1,
                    'message' => "Agent registration APPROVED successfully with Agent ID: {$assignedAgentId}",
                    'data' => $agent
                ]);
            } else { // Rejected
                $agent->update([
                    'status' => 2,
                    'admin_remark' => $request->admin_remark,
                    'approved_by' => $user->id,
                    'approved_at' => now(),
                ]);

                return response()->json([
                    'status' => 1,
                    'message' => 'Agent registration REJECTED.',
                    'data' => $agent
                ]);
            }
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * User creates Add Fund Request (Wallet Debit + MPIN)
     */
    public function createFundRequest(Request $request)
    {
        try {
            $user = $request->user();
     
            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);
            }

       

            $validator = Validator::make($request->all(), [
                'amount' => 'required|numeric|min:1',
                'mpin' => 'nullable|string|size:4',
                'agent_id' => 'required|exists:uti_psa_agents,agent_id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => $validator->errors()->first()
                ], 422);
            }

            $agent = DB::table('uti_psa_agents')->where('user_id', $user->id)->first();

            if (!$agent) {
                return response()->json([
                    'status' => 0,
                    'message' => 'You are not authorized to create add fund request.'
                ], 400);
            }


            // Auto-select Utility Wallet (primary_status == false or 0)
            $utilityWallet = Account::where('user_id', $user->id)
                ->where('primary_status', false)
                ->first();


            if (!$utilityWallet) {
                return response()->json([
                    'status' => 0,
                    'message' => 'No wallet account found for your profile.'
                ], 400);
            }

            $amount = floatval($request->amount);
            $txnId = 'PANFR' . date('YmdHis') . rand(100, 999);

            if($user->role > 2){

                if(empty($request->mpin)){
                    return response()->json([
                        'status' => 0,
                        'message' => 'MPIN is Required'
                    ], 400);

                }

                $mpin = $request->mpin;

                // Step 1: Validate transaction & MPIN via Helper
                if (!function_exists('validateTransaction') || !function_exists('processTransaction')) {
                    require_once app_path('Helpers/TransactionHelper.php');
                }

                $validation = validateTransaction($request, $utilityWallet->id, $mpin, $amount, 'DR');
                if (isset($validation['status']) && $validation['status'] == 0) {
                    return response()->json([
                        'status' => 0,
                        'message' => $validation['message'] ?? 'Transaction validation failed'
                    ], 400);
                }

                
                // Step 2: Debit Utility Wallet
                
                $txnData = [
                    'account_id' => $utilityWallet->id,
                    'mpin' => $mpin,
                    'type' => 'DR',
                    'amount' => $amount,
                    'description' => "PAN Card Fund Request Debit ({$txnId})",
                    'transaction_id' => $txnId
                ];

                $processRes = processTransaction($request, $txnData, true);
                
                if (isset($processRes['status']) && $processRes['status'] == 0) {
                    return response()->json([
                        'status' => 0,
                        'message' => $processRes['message'] ?? 'Wallet debit failed'
                    ], 400);
                }

            } else {
                // Step 1: Prepare transaction data
                $transactionData1 = [
                    'account_id' => $utilityWallet->id,
                    'type' => 'DR',
                    'amount' =>  $amount,
                    'description' => "PAN Card Fund Request Debit ({$txnId})",
                    'transaction_id' => $txnId,
                    'created_by' => $user->id,
                    'admin_id' => $utilityWallet->admin_id,
                    'user_id' => $user->id,
                    'category_code' => 'CHARGE'
                ];

                
                // Step 2: Create the transaction
                $transactionData = createTransaction($transactionData1);

          
                if (isset($transactionData['status']) && $transactionData['status'] == 0) {
                    return response()->json([
                        'status' => 0,
                        'message' => $transactionData['message'] ?? 'Transaction failed'
                    ], 400);
                }


            }


            
                
            // Step 3: Record Pan Fund Request
            $fundReq = PanFundRequest::create([
                'user_id' => $user->id,
                'admin_id' => $utilityWallet->admin_id,
                'agent_id' => $agent->agent_id,
                'account_id' => $utilityWallet->id,
                'txn_id' => $txnId,
                'coupon_qty' => 0,
                'amount' => $amount,
                'status' => 0, // Pending
                'remark' => 'PAN Fund Request submitted successfully. Wallet debited.',
            ]);


            //remove keys user_id, admin_id, account_id, txn_id

            unset($fundReq['user_id']);
            unset($fundReq['admin_id']);
            unset($fundReq['account_id']);
            unset($fundReq['txn_id']);
            unset($fundReq['remark']);
            unset($fundReq['updated_at']);


            return response()->json([
                'status' => 1,
                'message' => 'Pan Fund Request submitted successfully. Wallet debited.',
                'data' => $fundReq
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

      /**
     * User creates Add Fund Request (Wallet Debit + MPIN)
     */
    public function FundRequestStatus(Request $request)
    {
        try {
            $user = $request->user();
     
            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);
            }

            $validator = Validator::make($request->all(), [
                'id' => 'required|numeric|exists:pan_fund_requests,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => $validator->errors()->first()
                ], 422);
            }

            // Auto-select Utility Wallet (primary_status == false or 0)
            $check = PanFundRequest::where('user_id', $user->id)
                ->where('id',$request->id)
                ->first();


            if (!$check) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Invalid provided details'
                ], 400);
            }


            return response()->json([
                'status' => 1,
                'message' => 'Pan Fund Request status fetched successfully.',
                'data' => [
                    'id' => $check->id,
                    'status' => $check->status == 1 ? 'SUCCESS' : ($check->status == 2 ? 'REJECTED' : 'PENDING'),
                    'created_at' => $check->created_at,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get user's fund requests history
     */
    public function getUserFundRequests(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);
            }

            $perPage = $request->input('per_page', 15);
            $requests = PanFundRequest::where('user_id', $user->id)
                ->with(['account:id,number,name'])
                ->orderBy('id', 'desc')
                ->paginate($perPage);

            return response()->json([
                'status' => 1,
                'data' => $requests
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get Admin Fund requests list (Super Admin & Admin Role 2)
     */
    public function getAdminFundRequests(Request $request)
    {
        try {
            $query = PanFundRequest::with(['user:id,mid,name,email,mobile', 'account:id,number,name']);

            if ($request->has('search') && !empty($request->search)) {
                $s = $request->search;
                $query->where(function($q) use ($s) {
                    $q->where('txn_id', 'like', "%{$s}%")
                      ->orWhereHas('user', function($uq) use ($s) {
                          $uq->where('name', 'like', "%{$s}%")
                             ->orWhere('mobile', 'like', "%{$s}%")
                             ->orWhere('email', 'like', "%{$s}%");
                      });
                });
            }

            if ($request->has('status') && $request->status !== '' && $request->status !== null) {
                $query->where('status', $request->status);
            }

            $perPage = $request->input('per_page', 15);
            $requests = $query->orderBy('id', 'desc')->paginate($perPage);

            return response()->json([
                'status' => 1,
                'data' => $requests
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Update Fund request status (Super Admin ONLY)
     */
    public function updateFundRequestStatus(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);
            }

            // Check Super Admin Permission (role == 1 or role_id == 1)
            $isSuperAdmin = ($user->role == 1 || $user->role_id == 1 || (isset($user->role_info) && $user->role_info->name === 'Super Admin'));
            if (!$isSuperAdmin) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Unauthorized: Only Super Admin can approve or reject fund requests.'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'id' => 'required|exists:pan_fund_requests,id',
                'status' => 'required|in:1,2', // 1=Approved, 2=Rejected
                'admin_remark' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => $validator->errors()->first()
                ], 422);
            }

            $fundReq = PanFundRequest::findOrFail($request->id);
            if ($fundReq->status != 0) {
                return response()->json([
                    'status' => 0,
                    'message' => 'This request has already been processed.'
                ], 400);
            }

            $newStatus = (int)$request->status;

            if ($newStatus == 1) { // Approved (Success)
                $fundReq->update([
                    'status' => 1,
                    'admin_remark' => $request->admin_remark,
                    'approved_by' => $user->id,
                    'approved_at' => now(),
                ]);

                return response()->json([
                    'status' => 1,
                    'message' => 'Fund Request APPROVED successfully.',
                    'data' => $fundReq
                ]);
            } else { // Rejected -> Auto Refund to Utility Wallet!
                if (!function_exists('createTransaction')) {
                    require_once app_path('Helpers/TransactionHelper.php');
                }

                $refundData = [
                    'account_id' => $fundReq->account_id,
                    'type' => 'CR',
                    'amount' => $fundReq->amount,
                    'description' => "PAN Fund Request Rejection Refund ({$fundReq->txn_id})",
                    'user_id' => $fundReq->user_id,
                    'admin_id' => $user->id,
                    'transaction_id' => 'RFD' . date('YmdHis') . rand(100, 999)
                ];

                $refundRes = createTransaction($refundData);

                if (isset($refundRes['status']) && $refundRes['status'] == 0) {
                    return response()->json([
                        'status' => 0,
                        'message' => 'Refund failed: ' . ($refundRes['message'] ?? 'Error creating credit transaction')
                    ], 500);
                }

                $fundReq->update([
                    'status' => 2,
                    'admin_remark' => $request->admin_remark,
                    'approved_by' => $user->id,
                    'approved_at' => now(),
                ]);

                return response()->json([
                    'status' => 1,
                    'message' => 'Fund Request REJECTED. Amount has been refunded back to user Utility Wallet.',
                    'data' => $fundReq
                ]);
            }
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Import PAN Application Report rows from Excel (parsed client-side as JSON)
     * Dedup by application_no — already-existing records are skipped.
     */
    public function importApplicationReport(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);
            }

            $rows = $request->input('rows', []);
            if (empty($rows) || !is_array($rows)) {
                return response()->json(['status' => 0, 'message' => 'No rows provided'], 422);
            }

            $inserted = 0;
            $skipped  = 0;
            $total    = count($rows);

            foreach ($rows as $row) {
                $applicationNo = trim($row['ApplicationNo'] ?? '');
                if (empty($applicationNo)) {
                    $skipped++;
                    continue;
                }

                // Dedup check — skip if already exists
                if (PanApplicationReport::where('application_no', $applicationNo)->exists()) {
                    $skipped++;
                    continue;
                }

                // Parse dates safely
                $lotDate = null;
                $doa     = null;
                try {
                    $rawLot = $row['LotDate'] ?? '';
                    if ($rawLot) $lotDate = Carbon::parse($rawLot)->toDateString();
                } catch (\Exception $e) { }

                try {
                    $rawDoa = $row['DOA'] ?? '';
                    if ($rawDoa) $doa = Carbon::parse($rawDoa)->toDateString();
                } catch (\Exception $e) { }

                $agent = UtiPsaAgent::where('agent_id', $row['UserId'])->first();


                PanApplicationReport::create([
                    'user_id'            => $agent->user_id ?? 1,
                    'vle_id'             => trim($row['VleId'] ?? ''),
                    'form_type'          => trim($row['FormType'] ?? ''),
                    'application_no'     => $applicationNo,
                    'pan_card_mode'      => trim($row['PanCardMode'] ?? ''),
                    'pan_app_mode'       => trim($row['PanAppMode'] ?? ''),
                    'dispatch_address'   => trim($row['Dispatch Address'] ?? ''),
                    'pan_name'           => trim($row['pan Name'] ?? ''),
                    'lot_no'             => trim($row['LotNo'] ?? ''),
                    'lot_date'           => $lotDate,
                    'doa'                => $doa,
                    'application_status' => trim($row['ApplicationStatus'] ?? ''),
                    'objection_code'     => trim($row['ObjectionCode'] ?? ''),
                    'objection_code1'    => trim($row['ObjectionCode1'] ?? ''),
                    'objection_code2'    => trim($row['ObjectionCode2'] ?? ''),
                    'imported_by'        => $user->id,
                    'admin_id'           => $agent->admin_id ?? 1,
                ]);

                if(isset($agent->user_id)){

                    $account = DB::table('accounts')->where('user_id', $agent->user_id)->where('primary_status', false)->first();

                    $commissionTransactionData = [
                        'user_id' => $agent->user_id,
                        'account_id' => $account->id,
                        'amount' => 0,
                        'sub_module_id' => 84,
                        'category_code' => 'PAN',
                        'description' => 'PAN Card Commission - '.$applicationNo,
                        'admin_id' => $agent->admin_id ?? 1
                    ];

                    processCommissionCharge($commissionTransactionData);

                }

                $inserted++;
            }

            return response()->json([
                'status'  => 1,
                'message' => "Import complete.",
                'summary' => [
                    'total'    => $total,
                    'inserted' => $inserted,
                    'skipped'  => $skipped,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * List PAN Application Reports with role-based filtering
     * role=1  → all records (super admin) | filter_admin_id optional
     * role=2  → records where admin_id = session user id | filter_user_id optional
     * role>2  → records where user_id = session user id (team/agent view)
     */

 
    public function getApplicationReports(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);
            }

            $fromDate      = $request->input('from_date');
            $toDate        = $request->input('to_date');
            $limit         = (int) $request->input('limit', 500);
            $filterAdminId = $request->input('filter_admin_id'); // role=1 can filter by admin
            $filterUserId  = $request->input('filter_user_id');  // role=2 can filter by user

            $query = PanApplicationReport::with([
                'user:users.id,users.mid,users.name',
                'agent:id,agent_id,name,mobile_no,user_id',
                'admin:id,name,email',
            ]);

            // ── Role-based scope ──────────────────────────────────────────
            $role = (int) $user->role;

            if ($role === 1) {
                // Super admin — see everything; optionally filter by admin
                if ($filterAdminId) {
                    $query->where('admin_id', $filterAdminId);
                }
            } elseif ($role === 2) {
                // Admin — see own records; optionally filter by specific user
                $query->where('admin_id', $user->id);
                if ($filterUserId) {
                    $filterAgentIds = UtiPsaAgent::where('user_id', $filterUserId)->pluck('agent_id')->toArray();
                    $query->where(function($q) use ($filterUserId, $filterAgentIds) {
                        $q->where('user_id', $filterUserId);
                        if (!empty($filterAgentIds)) {
                            $q->orWhereIn('user_id', $filterAgentIds);
                        }
                    });
                }
            } else {
                // role > 2 — see only own records
                $userAgentIds = UtiPsaAgent::where('user_id', $user->id)->pluck('agent_id')->toArray();
                $query->where(function($q) use ($user, $userAgentIds) {
                    $q->where('user_id', $user->id);
                    if (!empty($userAgentIds)) {
                        $q->orWhereIn('user_id', $userAgentIds);
                    }
                });
            }

            // ── Optional date filter on lot_date ─────────────────────────
            if ($fromDate) {
                $query->whereDate('lot_date', '>=', $fromDate);
            }
            if ($toDate) {
                $query->whereDate('lot_date', '<=', $toDate);
            }

            if($user->is_api_partner == 1){
                $records = $query->orderBy('id', 'desc')->limit($limit)->get();
            } else {
                $records = $query->orderBy('id', 'desc')->select('id','user_id','admin_id','vle_id','application_no','pan_card_mode','pan_app_mode','dispatch_address','pan_name','lot_no','lot_date','doa','application_status','objection_code','objection_code1','objection_code2')->limit($limit)->get();
            }

            return response()->json([
                'status' => 1,
                'data'   => $records,
                'count'  => $records->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }


    /**
     * Get admin/user dropdown lists for PAN report filter
     * role=1 (super admin) → returns all admins (role=2)
     * role=2 (admin)       → returns users under this admin (admin_mid = current user mid)
     * role>2               → returns empty (no sub-filter needed)
     */
    public function getPanFilterLists(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);
            }

            $role = (int) $user->role;

            if ($role === 1) {
                // Super admin: get all admins (role=2)
                $admins = User::where('role', 2)
                    ->select('id', 'name', 'mid', 'email')
                    ->orderBy('name')
                    ->get();

                return response()->json([
                    'status' => 1,
                    'type'   => 'admin_list',
                    'list'   => $admins,
                ]);
            } elseif ($role === 2) {
                // Admin: get users whose admin_mid = current user's mid
                $users = User::where('admin_mid', $user->mid)
                    ->select('id', 'name', 'mid')
                    ->orderBy('name')
                    ->get();

                return response()->json([
                    'status' => 1,
                    'type'   => 'user_list',
                    'list'   => $users,
                ]);
            }

            return response()->json(['status' => 1, 'type' => 'none', 'list' => []]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

   
}


