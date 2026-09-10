<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\AepsDraft;
use App\Models\Passbook;
use App\Models\Account;
use App\Models\AepsTransaction;
use App\Models\Recharge;
use App\Models\NotificationLog;
use App\Models\UserKyc;
use App\Models\Role;
use App\Models\Payout;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Services\CatchLogService;

class ManageUserReportController extends Controller
{
    /**
     * Search User by MID, Mobile Number, or PAN Card
     */
    public function search(Request $request)
    {
        try {
            $query = trim($request->get('q', ''));

            if (empty($query)) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Please enter a MID, Mobile Number, or PAN Card to search.'
                ], 400);
            }

            // Search user by MID, Mobile, PAN Card (via UserKyc / AepsDraft), Email, or ID
            $user = User::with(['role_info', 'account', 'kyc', 'aepsDraft'])
                ->where(function ($sub) use ($query) {
                    $sub->where('mid', $query)
                        ->orWhere('mobile', $query)
                        ->orWhere('email', $query)
                        ->orWhere('id', $query)
                        ->orWhere('aadhar_number', $query)
                        ->orWhereHas('kyc', function ($kQ) use ($query) {
                            $kQ->where('pan_number', $query)
                                ->orWhere('aadhar_number', $query)
                                ->orWhere('account_number', $query);
                        })
                        ->orWhereHas('aepsDraft', function ($aQ) use ($query) {
                            $aQ->where('pan_no', $query)
                                ->orWhere('phone', $query)
                                ->orWhere('aadhaar_number', $query);
                        });
                })->first();

            // If not found directly, attempt partial/like search
            if (!$user) {
                $user = User::with(['role_info', 'account', 'kyc', 'aepsDraft'])
                    ->where('mid', 'LIKE', "%{$query}%")
                    ->orWhere('mobile', 'LIKE', "%{$query}%")
                    ->orWhere('email', 'LIKE', "%{$query}%")
                    ->orWhere('name', 'LIKE', "%{$query}%")
                    ->orWhereHas('kyc', function ($kQ) use ($query) {
                        $kQ->where('pan_number', 'LIKE', "%{$query}%");
                    })
                    ->orWhereHas('aepsDraft', function ($aQ) use ($query) {
                        $aQ->where('pan_no', 'LIKE', "%{$query}%")
                            ->orWhere('full_name', 'LIKE', "%{$query}%")
                            ->orWhere('shop_name', 'LIKE', "%{$query}%");
                    })
                    ->first();
            }

            if (!$user) {
                return response()->json([
                    'status' => 0,
                    'message' => 'No user found matching "' . $query . '".'
                ], 404);
            }

            // Search for associated AEPS Draft / Merchant record
            $aepsDraft = $user->aepsDraft ?? AepsDraft::where('mid', $user->mid)
                ->orWhere('phone', $user->mobile)
                ->orWhere('created_by', $user->id)
                ->orWhere('admin_id', $user->id)
                ->first();

            // Fetch accounts directly from database table
            $accounts = Account::where('user_id', $user->id)->orderBy('primary_status', 'desc')->get();

            $accountsList = $accounts->map(function ($acc) use ($user) {
                $latestPassbook = Passbook::where('user_id', $user->id)
                    ->where(function ($q) use ($acc) {
                        $q->where('account_id', $acc->id);
                        if ($acc->primary_status) {
                            $q->orWhereNull('account_id');
                        }
                    })
                    ->orderBy('id', 'desc')
                    ->first();

                $totalBalance = (float) ($latestPassbook ? $latestPassbook->balance : ($acc->balance ?? 0));
                $holdAmount = (float) ($acc->hold_amount ?? 0);
                $availableBalance = max(0, $totalBalance - $holdAmount);

                return [
                    'id' => $acc->id,
                    'user_id' => $acc->user_id,
                    'name' => $acc->name ?: ('Account #' . $acc->id),
                    'number' => $acc->number ?: 'N/A',
                    'upi' => $acc->upi ?: 'N/A',
                    'primary_status' => (int) $acc->primary_status,
                    'status' => (int) $acc->status,
                    'total' => $totalBalance,
                    'hold' => $holdAmount,
                    'available' => $availableBalance
                ];
            });

            // Overall primary wallet calculation
            $primaryAcc = $accountsList->firstWhere('primary_status', 1) ?? $accountsList->first();

            $roleName = Role::where('id', $user->role)->value('name')
                ?? $user->role_info?->name
                ?? 'User';

            // Fetch roles created by this user's admin (or all available roles)
            $adminUser = User::where('mid', $user->admin_mid)->first() ?? User::find($user->admin_id ?? 1);
            $adminId = $adminUser ? $adminUser->id : null;
            
            $rolesList = Role::where('user_id', $adminId)->select('id','name')->get();

            // Parse Root Hierarchy Chain (e.g. "4,36,1155")
            $rootChain = [];
            $rootIds = array_values(array_filter(array_map('trim', explode(',', $user->root ?? ''))));
            if (!empty($rootIds)) {
                $chainUsers = User::whereIn('id', $rootIds)->get()->keyBy('id');
                foreach ($rootIds as $rId) {
                    if (isset($chainUsers[$rId])) {
                        $cu = $chainUsers[$rId];
                        $rIdValue = (int) ($cu->role ?: 0);
                        $rName = Role::where('id', $rIdValue)->value('name')
                            ?? ('Role #' . $rIdValue);
                        $rootChain[] = [
                            'id' => (int) $cu->id,
                            'mid' => $cu->mid,
                            'name' => $cu->name,
                            'role' => $rIdValue,
                            'role_name' => $rName
                        ];
                    }
                }
            }

            return response()->json([
                'status' => 1,
                'message' => 'User data retrieved successfully',
                'user' => [
                    'id' => $user->id,
                    'mid' => $user->mid,
                    'name' => $user->name,
                    'email' => $user->email,
                    'mobile' => $user->mobile,
                    'role' => $user->role,
                    'role_name' => $roleName,
                    'status' => $user->status,
                    'status_label' => $user->status == 1 ? 'Active' : 'Inactive',
                    'refer_by' => $user->refer_by,
                    'admin_mid' => $user->admin_mid,
                    'root' => $user->root,
                    'root_chain' => $rootChain,
                    'aadhar_number' => $user->aadhar_number ?? $user->kyc?->aadhar_number ?? $user->aepsDraft?->aadhaar_number,
                    'pan_card' => $user->kyc?->pan_number ?? $user->aepsDraft?->pan_no,
                    'created_at' => $user->created_at ? $user->created_at->format('Y-m-d H:i:s') : null,
                ],
                'has_aeps_draft' => !is_null($aepsDraft),
                'aeps_draft' => $aepsDraft,
                'verification_json' => [
                    'aadhar_data' => $aepsDraft?->aadharData ?? null,
                    'pan_data' => $aepsDraft?->panData ?? null,
                    'account_data' => $aepsDraft?->accountData ?? null,
                ],
                'accounts' => $accountsList,
                'roles' => $rolesList,
                'wallet' => [
                    'total' => $primaryAcc ? (float) ($primaryAcc['total'] ?? 0) : 0,
                    'hold' => $primaryAcc ? (float) ($primaryAcc['hold'] ?? 0) : 0,
                    'available' => $primaryAcc ? (float) ($primaryAcc['available'] ?? 0) : 0
                ]
            ]);

        } catch (\Throwable $e) {
            $refId = CatchLogService::logException($request, 'ManageUserReportController@search', $e);
            return response()->json([
                'status' => 0,
                'message' => 'Search failed: ' . $e->getMessage(),
                'error' => $e->getMessage(),
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => explode("\n", $e->getTraceAsString()),
                'refId' => $refId
            ], 500);
        }
    }

    /**
     * Update User Data (Center Modal Form)
     */
    public function updateUser(Request $request, $id)
    {
        try {
            $user = User::find($id);
            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'User not found'], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'mobile' => 'required|digits:10|unique:users,mobile,' . $id,
                'email' => 'nullable|email|max:255',
                'role' => 'required|integer',
                'status' => 'required|integer',
                'aadhar_number' => 'nullable|string|max:20',
                'pan_card' => 'nullable|string|max:20',
                'shop_name' => 'nullable|string|max:255',
                'root' => 'nullable|string',
                'root_ids' => 'nullable|array'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $oldRole = $user->role;
            $newRole = $request->role;

            $user->name = $request->name;
            $user->mobile = $request->mobile;
            $user->email = $request->email;
            $user->role = $request->role;
            $user->status = $request->status;
            if ($request->has('aadhar_number')) {
                $user->aadhar_number = $request->aadhar_number;
            }

            // Sync Shop Name to AepsDraft if present or provided
            if ($request->has('shop_name')) {
                $draft = AepsDraft::where('mid', $user->mid)
                    ->orWhere('phone', $user->mobile)
                    ->orWhere('created_by', $user->id)
                    ->first();

                if (!$draft && !empty($request->shop_name)) {
                    $draft = new AepsDraft();
                    $draft->mid = $user->mid;
                    $draft->phone = $user->mobile;
                    $draft->created_by = $user->id;
                    $draft->full_name = $user->name;
                }

                if ($draft) {
                    $draft->shop_name = $request->shop_name;
                    $draft->save();
                }
            }

            // Update Root Hierarchy Path
            if ($request->has('root_ids') && is_array($request->root_ids)) {
                $parentIds = array_values(array_filter(array_map('intval', $request->root_ids)));
                
                // Immediate parent for refer_by (last ancestor in chain)
                $ancestorIds = array_values(array_filter($parentIds, function($pid) use ($user) {
                    return $pid != $user->id;
                }));

                if (!empty($ancestorIds)) {
                    $lastParentId = end($ancestorIds);
                    $parentUser = User::find($lastParentId);
                    if ($parentUser) {
                        $user->refer_by = $parentUser->mid;
                        if (!empty($parentUser->admin_mid)) {
                            $user->admin_mid = $parentUser->admin_mid;
                        }
                    }
                }
                
           
                $user->root = implode(',', array_unique($parentIds));
            } elseif ($request->filled('root')) {
                $user->root = trim($request->root);
            }

            $user->save();

            // Sync or Create UserKyc record for PAN and Aadhaar
            if ($request->filled('pan_card') || $request->filled('aadhar_number')) {
                $kyc = UserKyc::firstOrNew(['user_id' => $user->id]);
                if ($request->filled('pan_card')) {
                    $kyc->pan_number = strtoupper($request->pan_card);
                }
                if ($request->filled('aadhar_number')) {
                    $kyc->aadhar_number = $request->aadhar_number;
                }
                $kyc->save();
            }

            if($oldRole!=$newRole){
                $this->assignRolePermissionsAndCommissions($user->id, $newRole);
            }

            // Re-fetch updated root_chain
            $rootChain = [];
            $rootIds = array_values(array_filter(array_map('trim', explode(',', $user->root ?? ''))));
            if (!empty($rootIds)) {
                $chainUsers = User::whereIn('id', $rootIds)->get()->keyBy('id');
                foreach ($rootIds as $rId) {
                    if (isset($chainUsers[$rId])) {
                        $cu = $chainUsers[$rId];
                        $rIdValue = (int) ($cu->role ?: $cu->role_id ?: 0);
                        $rName = Role::where('id', $rIdValue)->value('name')
                            ?? ('Role #' . $rIdValue);
                        $rootChain[] = [
                            'id' => (int) $cu->id,
                            'mid' => $cu->mid,
                            'name' => $cu->name,
                            'role' => $rIdValue,
                            'role_name' => $rName
                        ];
                    }
                }
            }

            $roleName = Role::where('id', $user->role)->value('name')
                ?? 'User';

            $userData = array_merge($user->toArray(), [
                'role_name' => $roleName,
                'root_chain' => $rootChain
            ]);

            return response()->json([
                'status' => 1,
                'message' => 'User details & hierarchy updated successfully!',
                'user' => $userData
            ]);

        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'ManageUserReportController@updateUser', $e);
            return response()->json(['status' => 0, 'message' => $e->getMessage(), 'refId' => $refId], 500);
        }
    }

    /**
     * Get list of users by Role ID (for dynamic hierarchy dropdowns)
     */
    public function getUsersByRole(Request $request, $roleId)
    {
        try {
            $query = User::where('role', $roleId);

            if ($request->filled('parent_id')) {
                $parentId = $request->parent_id;
                $parentUser = User::find($parentId);
                if ($parentUser) {
                    $parentFilteredQuery = (clone $query)->where(function ($q) use ($parentUser) {
                        $q->where('refer_by', $parentUser->mid)
                          ->orWhere('admin_mid', $parentUser->mid)
                          ->orWhere('root', 'LIKE', "%{$parentUser->id}%");
                    });

                    if ($parentFilteredQuery->count() > 0) {
                        $query = $parentFilteredQuery;
                    }
                }
            }

            $users = $query->select('id', 'name', 'mid', 'mobile', 'role')
                           ->orderBy('id', 'asc')
                           ->get();

            return response()->json([
                'status' => 1,
                'users' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Update Merchant Data (AepsDraft Center Modal Form)
     */
    public function updateMerchant(Request $request, $draftId)
    {
        try {
            $draft = AepsDraft::find($draftId);
            if (!$draft) {
                return response()->json(['status' => 0, 'message' => 'Merchant AEPS Draft record not found'], 404);
            }

            // Explicitly allow all 17 required columns + verification statuses
            $fillableFields = [
                'latitude',
                'longitude',
                'shop_city',
                'shop_address',
                'video_url',
                'video_kyc_status',
                'pan_no',
                'aadhaar_number',
                'phone',
                'email',
                'account_number',
                'ifsc_code',
                'bank_name',
                'bank_branch',
                'deviceName',
                'deviceIMEI',
                'mposSerialNumber',
                'full_name',
                'shop_name',
                'shop_district',
                'shop_pin_code',
                'status',
                'aeps_status',
                'remarks'
            ];

            foreach ($fillableFields as $field) {
                if ($request->has($field)) {
                    $draft->$field = $request->input($field);
                }
            }

            // Sync request_data JSON column if present
            if ($request->has('shop_name') || $request->has('full_name')) {
                $reqData = is_array($draft->request_data) ? $draft->request_data : (json_decode($draft->request_data, true) ?: []);
                if (!empty($reqData) || $request->has('shop_name')) {
                    if ($request->has('shop_name')) {
                        $reqData['shop_name'] = $request->input('shop_name');
                        $reqData['company_name'] = $request->input('shop_name');
                        $reqData['shopName'] = $request->input('shop_name');
                    }
                    if ($request->has('full_name')) {
                        $reqData['full_name'] = $request->input('full_name');
                        $reqData['merchant_name'] = $request->input('full_name');
                    }
                    $draft->request_data = $reqData;
                }
            }

            // Handle dropdown verified flag (verified = 1 / Not Verified = 0)
            if ($request->has('verified')) {
                $isVerified = (int) $request->verified;
                $draft->status = $isVerified == 1 ? 'approved' : 'draft';
                if ($isVerified == 1 && $draft->aeps_status < 4) {
                    $draft->aeps_status = 4; // Working status
                }
            }

            // Verification status dropdowns (1 = Verified, 0 = Not Verified)
            $verificationDates = [
                'phone_verified_at',
                'email_verified_at',
                'aadhaar_verified_at',
                'pan_verified_at',
                'bank_verified_at'
            ];

            foreach ($verificationDates as $dateField) {
                if ($request->has($dateField)) {
                    $val = (int) $request->input($dateField);
                    if ($val === 1) {
                        if (empty($draft->$dateField)) {
                            $draft->$dateField = now();
                        }
                    } else {
                        $draft->$dateField = null;
                    }
                }
            }

            $draft->save();

            // Sync Shop Name to associated UserKyc business details
            if ($request->has('shop_name')) {
                $user = User::where('mid', $draft->mid)
                    ->orWhere('mobile', $draft->phone)
                    ->orWhere('id', $draft->created_by)
                    ->first();

                if ($user) {
                    $kyc = UserKyc::firstOrNew(['user_id' => $user->id]);
                    $bizDetails = is_array($kyc->business_details) ? $kyc->business_details : (json_decode($kyc->business_details, true) ?: []);
                    $bizDetails['shop_name'] = $request->input('shop_name');
                    $bizDetails['company_name'] = $request->input('shop_name');
                    $kyc->business_details = $bizDetails;
                    $kyc->save();
                }
            }

            return response()->json([
                'status' => 1,
                'message' => 'Merchant details updated successfully!',
                'aeps_draft' => $draft
            ]);

        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'ManageUserReportController@updateMerchant', $e);
            return response()->json(['status' => 0, 'message' => $e->getMessage(), 'refId' => $refId], 500);
        }
    }

    /**
     * Set Primary Account for User
     */
    public function setPrimaryAccount(Request $request, $accountId)
    {
        try {
            $account = Account::find($accountId);
            if (!$account) {
                return response()->json(['status' => 0, 'message' => 'Account not found'], 404);
            }

            // Set all other accounts for this user as non-primary (0)
            Account::where('user_id', $account->user_id)
                ->where('id', '!=', $account->id)
                ->update(['primary_status' => 0]);

            // Set target account as primary (1)
            $account->primary_status = 1;
            $account->save();

            // Refresh accounts list
            $accounts = Account::where('user_id', $account->user_id)->orderBy('primary_status', 'desc')->get();
            $accountsList = $accounts->map(function ($acc) {
                $latestPassbook = Passbook::where('user_id', $acc->user_id)
                    ->where(function ($q) use ($acc) {
                        $q->where('account_id', $acc->id);
                        if ($acc->primary_status) {
                            $q->orWhereNull('account_id');
                        }
                    })
                    ->orderBy('id', 'desc')
                    ->first();

                $totalBalance = (float) ($latestPassbook ? $latestPassbook->balance : ($acc->balance ?? 0));
                $holdAmount = (float) ($acc->hold_amount ?? 0);
                $availableBalance = max(0, $totalBalance - $holdAmount);

                return [
                    'id' => $acc->id,
                    'user_id' => $acc->user_id,
                    'name' => $acc->name ?: ('Account #' . $acc->id),
                    'number' => $acc->number ?: 'N/A',
                    'upi' => $acc->upi ?: 'N/A',
                    'primary_status' => (int) $acc->primary_status,
                    'status' => (int) $acc->status,
                    'total' => $totalBalance,
                    'hold' => $holdAmount,
                    'available' => $availableBalance
                ];
            });

            return response()->json([
                'status' => 1,
                'message' => 'Account "' . ($account->name ?: 'Account #' . $account->id) . '" set as Primary Wallet successfully!',
                'accounts' => $accountsList
            ]);

        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'ManageUserReportController@setPrimaryAccount', $e);
            return response()->json(['status' => 0, 'message' => $e->getMessage(), 'refId' => $refId], 500);
        }
    }

    /**
     * Create Default Wallets (Trade Wallet as Primary, Utility Wallet as Non-Primary)
     */
    public function createWallets(Request $request, $userId)
    {
        try {
            $user = User::find($userId);
            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'User not found'], 404);
            }

            // Check if accounts already exist
            $existing = Account::where('user_id', $userId)->count();
            if ($existing > 0) {
                return response()->json(['status' => 0, 'message' => 'User already has active account wallets.'], 400);
            }

            $creatorId = auth()->id() ?? $user->id;

            $admin = User::where('mid', $user->admin_mid)->first();
            $adminId = $admin->id ?? auth()->id() ?? 1;



            // 1. Create Trade Wallet (as Primary = 1)
            Account::create([
                'user_id' => $user->id,
                'name' => 'Trade Wallet',
                'number' => $user->mobile ?: ('TW' . $user->id),
                'upi' => ($user->mobile ?: $user->id) . '@trade.enexa',
                'status' => 1,
                'primary_status' => 1,
                'hold_amount' => 0,
                'created_by' => $creatorId,
                'admin_id' => $adminId
            ]);

            // 2. Create Utility Wallet (as Non-Primary = 0)
            Account::create([
                'user_id' => $user->id,
                'name' => 'Utility Wallet',
                'number' => ($user->mobile ?: $user->id) . '2',
                'upi' => ($user->mobile ?: $user->id) . '@utility.enexa',
                'status' => 1,
                'primary_status' => 0,
                'hold_amount' => 0,
                'created_by' => $creatorId,
                'admin_id' => $adminId
            ]);

            // Refresh accounts list
            $accounts = Account::where('user_id', $user->id)->orderBy('primary_status', 'desc')->get();
            $accountsList = $accounts->map(function ($acc) use ($user) {
                $latestPassbook = Passbook::where('user_id', $user->id)
                    ->where(function ($q) use ($acc) {
                        $q->where('account_id', $acc->id);
                        if ($acc->primary_status) {
                            $q->orWhereNull('account_id');
                        }
                    })
                    ->orderBy('id', 'desc')
                    ->first();

                $totalBalance = (float) ($latestPassbook ? $latestPassbook->balance : ($acc->balance ?? 0));
                $holdAmount = (float) ($acc->hold_amount ?? 0);
                $availableBalance = max(0, $totalBalance - $holdAmount);

                return [
                    'id' => $acc->id,
                    'user_id' => $acc->user_id,
                    'name' => $acc->name,
                    'number' => $acc->number,
                    'upi' => $acc->upi,
                    'primary_status' => (int) $acc->primary_status,
                    'status' => (int) $acc->status,
                    'total' => $totalBalance,
                    'hold' => $holdAmount,
                    'available' => $availableBalance
                ];
            });

            return response()->json([
                'status' => 1,
                'message' => 'Trade Wallet (Primary) and Utility Wallet (Non-Primary) created successfully!',
                'accounts' => $accountsList
            ]);

        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'ManageUserReportController@createWallets', $e);
            return response()->json(['status' => 0, 'message' => $e->getMessage(), 'refId' => $refId], 500);
        }
    }

    /**
     * Wallet Credit / Debit Action
     */
    public function walletAction(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'account_id' => 'nullable|exists:accounts,id',
                'action' => 'required|in:credit,debit',
                'amount' => 'required|numeric|min:1',
                'description' => 'required|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $userId = $request->user_id;
            $action = strtolower($request->action);
            $amount = (float) $request->amount;
            $desc = trim($request->description);

            $user = User::find($userId);
            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'User not found'], 404);
            }

            $accountId = $request->account_id ?? null;
            $account = null;
            if ($accountId) {
                $account = Account::where('user_id', $userId)->find($accountId);
            }
            if (!$account) {
                $account = Account::where('user_id', $userId)->where('primary_status', 1)->first()
                           ?? Account::where('user_id', $userId)->first();
            }

            $accId = $account ? $account->id : null;

            // Fetch current balance for this account
            $latestTxn = Passbook::where('user_id', $userId)
                ->where(function ($q) use ($accId, $account) {
                    if ($accId) {
                        $q->where('account_id', $accId);
                        if ($account && $account->primary_status) {
                            $q->orWhereNull('account_id');
                        }
                    }
                })
                ->orderBy('id', 'DESC')
                ->first();

            $currentBalance = (float) ($latestTxn ? $latestTxn->balance : ($account->balance ?? 0));

            if ($action === 'debit' && $currentBalance < $amount) {
                return response()->json([
                    'status' => 0,
                    'message' => "Insufficient wallet balance (Available: ₹" . number_format($currentBalance, 2) . ") in " . ($account->name ?? 'Wallet') . " to perform debit action."
                ], 400);
            }

            $newBalance = $action === 'credit' ? ($currentBalance + $amount) : ($currentBalance - $amount);
            $type = $action === 'credit' ? 'CR' : 'DR';
            $txnId = 'ADM' . date('YmdHis') . Str::random(4);

            $admin = User::where('mid', $user->admin_mid)->first();
            $adminId = $admin->id ?? auth()->id() ?? 1;

            $passbook = Passbook::create([
                'user_id' => $userId,
                'account_id' => $accId,
                'transaction_id' => $txnId,
                'type' => $type,
                'amount' => $amount,
                'balance' => $newBalance,
                'pre_balance' => $currentBalance,
                'description' => "Admin " . ucfirst($action) . " (" . ($account->name ?? 'Wallet') . "): " . $desc,
                'status' => 1,
                'created_by' => auth()->id() ?? 1,
                'admin_id' => $adminId,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Re-fetch all accounts list with updated balances
            $accounts = Account::where('user_id', $userId)->orderBy('primary_status', 'desc')->get();
            $accountsList = $accounts->map(function ($acc) use ($userId) {
                $latestP = Passbook::where('user_id', $userId)
                    ->where(function ($q) use ($acc) {
                        $q->where('account_id', $acc->id);
                        if ($acc->primary_status) {
                            $q->orWhereNull('account_id');
                        }
                    })
                    ->orderBy('id', 'desc')
                    ->first();

                $totalBalance = (float) ($latestP ? $latestP->balance : ($acc->balance ?? 0));
                $holdAmount = (float) ($acc->hold_amount ?? 0);
                $availableBalance = max(0, $totalBalance - $holdAmount);

                return [
                    'id' => $acc->id,
                    'user_id' => $acc->user_id,
                    'name' => $acc->name ?: ('Account #' . $acc->id),
                    'number' => $acc->number ?: 'N/A',
                    'upi' => $acc->upi ?: 'N/A',
                    'primary_status' => (int) $acc->primary_status,
                    'status' => (int) $acc->status,
                    'total' => $totalBalance,
                    'hold' => $holdAmount,
                    'available' => $availableBalance
                ];
            });

            return response()->json([
                'status' => 1,
                'message' => "Successfully " . ($action === 'credit' ? 'credited' : 'debited') . " ₹" . number_format($amount, 2) . " to " . ($account->name ?? 'wallet') . ".",
                'accounts' => $accountsList,
                'passbook' => $passbook
            ]);

        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'ManageUserReportController@walletAction', $e);
            return response()->json(['status' => 0, 'message' => $e->getMessage(), 'refId' => $refId], 500);
        }
    }

    /**
     * Get User Passbook Entries (Paginated, Offcanvas Drawer / Modal)
     */
    public function getPassbook(Request $request, $userId)
    {
        try {
            $query = Passbook::where('user_id', $userId);

            if ($request->filled('account_id')) {
                $accId = (int) $request->account_id;
                $isPrimary = Account::where('id', $accId)->value('primary_status');
                $query->where(function ($q) use ($accId, $isPrimary) {
                    $q->where('account_id', $accId);
                    if ($isPrimary) {
                        $q->orWhereNull('account_id');
                    }
                });
            }

            if ($request->filled('type') && $request->type !== 'all') {
                $query->where('type', strtoupper($request->type));
            }

            if ($request->filled('start_date') && $request->filled('end_date')) {
                $query->whereBetween('created_at', [
                    $request->start_date . ' 00:00:00',
                    $request->end_date . ' 23:59:59'
                ]);
            }

            if ($request->filled('search')) {
                $s = $request->search;
                $query->where(function ($q) use ($s) {
                    $q->where('description', 'LIKE', "%{$s}%")
                        ->orWhere('transaction_id', 'LIKE', "%{$s}%");
                });
            }

            $perPage = min((int) ($request->per_page ?? 25), 100);
            $passbooks = $query->orderBy('id', 'desc')->paginate($perPage);

            return response()->json([
                'status' => 1,
                'data' => $passbooks->items(),
                'total' => $passbooks->total(),
                'current_page' => $passbooks->currentPage(),
                'last_page' => $passbooks->lastPage(),
                'per_page' => $passbooks->perPage()
            ]);

        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get User Activity / Request Logs from `logs` table (Paginated, 25/page)
     */
    public function getUserLogs(Request $request, $userId)
    {
        try {
            $user = User::find($userId);
            $mid = $user ? $user->mid : $userId;

            $query = DB::table('logs')
                ->where(function ($q) use ($mid, $userId) {
                    if ($mid) {
                        $q->where('mid', $mid);
                    }
                    $q->orWhere('mid', $userId);
                });

            if ($request->filled('start_date') && $request->filled('end_date')) {
                $query->whereBetween('created_at', [
                    $request->start_date . ' 00:00:00',
                    $request->end_date . ' 23:59:59'
                ]);
            }

            if ($request->filled('type') && $request->type !== 'all') {
                $query->where('type', $request->type);
            }

            $perPage = min((int) ($request->per_page ?? 25), 100);
            $logs = $query->orderBy('id', 'desc')->paginate($perPage);

            return response()->json([
                'status' => 1,
                'data' => $logs->items(),
                'total' => $logs->total(),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch logs: ' . $e->getMessage(),
                'data' => [],
                'total' => 0,
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 25
            ]);
        }
    }

    /**
     * Get User AEPS Transactions (Paginated 25/page, Date Filter)
     */
    public function getAepsTransactions(Request $request, $mid)
    {
        try {
            $query = AepsTransaction::where('mid', $mid);

            if ($request->filled('start_date') && $request->filled('end_date')) {
                $query->whereBetween('created_at', [
                    $request->start_date . ' 00:00:00',
                    $request->end_date . ' 23:59:59'
                ]);
            }

            if ($request->filled('aeps_type') && $request->aeps_type !== 'all') {
                $query->where('aeps_type', $request->aeps_type);
            }

            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('response_status', (int) $request->status);
            }

            $perPage = min((int) ($request->per_page ?? 25), 100);
            $txns = $query->orderBy('id', 'desc')->paginate($perPage);

            // Calculate summary totals
            $totalAmount = (clone $query)->where('response_status', 1)->sum('amount');
            $successCount = (clone $query)->where('response_status', 1)->count();
            $failedCount = (clone $query)->where('response_status', 0)->count();

            return response()->json([
                'status' => 1,
                'data' => $txns->items(),
                'total' => $txns->total(),
                'current_page' => $txns->currentPage(),
                'last_page' => $txns->lastPage(),
                'per_page' => $txns->perPage(),
                'summary' => [
                    'total_amount' => (float) $totalAmount,
                    'success_count' => $successCount,
                    'failed_count' => $failedCount
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get Recharge Data with Log (Paginated 25/page, Date Filter)
     */
    public function getRechargeLogs(Request $request, $userId)
    {
        try {
            $query = Recharge::where('user_id', $userId);

            if ($request->filled('start_date') && $request->filled('end_date')) {
                $query->whereBetween('created_at', [
                    $request->start_date . ' 00:00:00',
                    $request->end_date . ' 23:59:59'
                ]);
            }

            if ($request->filled('operator') && $request->operator !== 'all') {
                $query->where('oprator', $request->operator);
            }

            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            $perPage = min((int) ($request->per_page ?? 25), 100);
            $recharges = $query->orderBy('id', 'desc')->paginate($perPage);

            $totalAmount = (clone $query)->whereIn('status', ['Success', 'SUCCESS', 'success'])->sum('amount');
            $successCount = (clone $query)->whereIn('status', ['Success', 'SUCCESS', 'success'])->count();
            $failedCount = (clone $query)->whereIn('status', ['Failed', 'FAILED', 'failed'])->count();

            return response()->json([
                'status' => 1,
                'data' => $recharges->items(),
                'total' => $recharges->total(),
                'current_page' => $recharges->currentPage(),
                'last_page' => $recharges->lastPage(),
                'per_page' => $recharges->perPage(),
                'summary' => [
                    'total_amount' => (float) $totalAmount,
                    'success_count' => $successCount,
                    'failed_count' => $failedCount
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get Payout Data & Logs for User (Paginated)
     */
    public function getPayoutLogs(Request $request, $userId)
    {
        try {
            $query = Payout::where('user_id', $userId);

            if ($request->filled('start_date') && $request->filled('end_date')) {
                $query->whereBetween('created_at', [
                    $request->start_date . ' 00:00:00',
                    $request->end_date . ' 23:59:59'
                ]);
            }

            if ($request->filled('search')) {
                $s = $request->search;
                $query->where(function ($q) use ($s) {
                    $q->where('transaction_id', 'LIKE', "%{$s}%")
                        ->orWhere('utr', 'LIKE', "%{$s}%")
                        ->orWhere('account', 'LIKE', "%{$s}%")
                        ->orWhere('name', 'LIKE', "%{$s}%")
                        ->orWhere('mobile', 'LIKE', "%{$s}%");
                });
            }

            $perPage = min((int) ($request->per_page ?? 25), 100);
            $payouts = $query->orderBy('id', 'DESC')->paginate($perPage);

            return response()->json([
                'status' => 1,
                'data' => $payouts->items(),
                'current_page' => $payouts->currentPage(),
                'last_page' => $payouts->lastPage(),
                'total' => $payouts->total()
            ]);

        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'ManageUserReportController@getPayoutLogs', $e);
            return response()->json(['status' => 0, 'message' => $e->getMessage(), 'refId' => $refId], 500);
        }
    }

    // Helper: Assign user_role_permission and user_role_commission from role templates
    protected function assignRolePermissionsAndCommissions($userId, $roleId)
    {
        // Delete existing user role permissions and commissions
        DB::table('user_role_permissions')->where('user_id', $userId)->delete();
        DB::table('user_role_commissions')->where('user_id', $userId)->delete();
        
        // Assign Permissions
        $rolePermissions = DB::table('role_module_permissions')->where('role_id', $roleId)->get();
        foreach ($rolePermissions as $perm) {
            DB::table('user_role_permissions')->insert([
                'user_id' => $userId,
                'role_id' => $roleId,
                'main_module_id' => $perm->main_module_id,
                'module_id' => $perm->module_id,
                'sub_module_id' => $perm->sub_module_id,
                'permission_id' => $perm->permission_id,
            ]);
        }
        // Assign Commissions
        $roleCommissions = DB::table('role_module_commission')->where('role_id', $roleId)->get();
        foreach ($roleCommissions as $comm) {
            DB::table('user_role_commissions')->insert([
                'user_id' => $userId,
                'role_id' => $roleId,
                'main_module_id' => $comm->main_module_id,
                'module_id' => $comm->module_id,
                'sub_module_id' => $comm->sub_module_id,
                'commission_id' => $comm->commission_id,
            ]);
        }
    }

    /**
     * Direct Login (Impersonate User) - Super Admin only
     */
    public function impersonate(Request $request)
    {
        try {
            $authUser = $request->get('user');
            if (!$authUser) {
                $token = $request->header('Token') ?? $request->header('token') ?? $request->header('Authorization');
                if ($token && strpos($token, 'Bearer ') === 0) {
                    $token = substr($token, 7);
                }
                if ($token) {
                    $authUser = User::where('remember_token', $token)->first();
                }
            }

            if (!$authUser) {
                $authUser = User::find(1);
            }

            if (!$authUser || ($authUser->role != 1 && $authUser->id != 1)) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Unauthorized. Only Super Admin can use direct login.'
                ], 403);
            }

            $targetUserId = $request->input('user_id');
            $targetUser = User::find($targetUserId);
            if (!$targetUser) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Target user not found.'
                ], 404);
            }

            // Generate/assign token to target user's remember_token so all backend APIs resolve to targetUser
            $impersonateToken = 'IMP_' . Str::random(40) . '_' . time();
            $targetUser->remember_token = $impersonateToken;
            $targetUser->save();

            // Attach role_name, logo, and photo for frontend complete user profile
            $role = DB::table('roles')->where('id', $targetUser->role)->first();
            $targetUser->role_name = $role->name ?? 'Unknown';

            $adminUser = User::where('mid', $targetUser->admin_mid)->first();
            $sett = DB::table('settings')->where('user_id', $adminUser ? $adminUser->id : 1)->select('logo')->first();
            $targetUser->logo = $sett->logo ?? 'https://enexa.in/images/enexa-logo-mix-white.png?id=83e17363ed5f59867f1cb9c59b3c5f56';

            $userKyc = DB::table('user_kyc')->where('user_id', $targetUser->id)->first();
            $targetUser->kyc = $userKyc;
            $targetUser->photo = $userKyc->photo ?? url('') . '/assets/images/users/avatar-1.jpg';

            return response()->json([
                'status' => 1,
                'message' => 'Direct login successful as ' . $targetUser->name,
                'token' => $impersonateToken,
                'user' => $targetUser,
                'impersonator' => [
                    'id' => $authUser->id,
                    'token' => $authUser->remember_token,
                    'name' => $authUser->name
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error in direct login: ' . $e->getMessage(),
                'error' => $e->getMessage(),
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => explode("\n", $e->getTraceAsString())
            ], 500);
        }
    }

    /**
     * Revert Impersonation (Return to Super Admin)
     */
    public function revertImpersonate(Request $request)
    {
        try {
            $adminId = $request->input('admin_id', 1);
            $adminToken = $request->input('admin_token');

            $admin = User::find($adminId);
            if (!$admin) {
                $admin = User::where('role', 1)->first();
            }

            if ($admin) {
                if (!empty($adminToken)) {
                    $admin->remember_token = $adminToken;
                } else if (empty($admin->remember_token)) {
                    $admin->remember_token = 'ADM_' . Str::random(40) . '_' . time();
                }
                $admin->save();

                $role = DB::table('roles')->where('id', $admin->role)->first();
                $admin->role_name = $role->name ?? 'Admin';
                $sett = DB::table('settings')->where('user_id', $admin->id)->select('logo')->first();
                $admin->logo = $sett->logo ?? 'https://enexa.in/images/enexa-logo-mix-white.png?id=83e17363ed5f59867f1cb9c59b3c5f56';

                $userKyc = DB::table('user_kyc')->where('user_id', $admin->id)->first();
                $admin->kyc = $userKyc;
                $admin->photo = $userKyc->photo ?? url('') . '/assets/images/users/avatar-1.jpg';

                return response()->json([
                    'status' => 1,
                    'message' => 'Returned to Super Admin session successfully',
                    'token' => $admin->remember_token,
                    'user' => $admin
                ]);
            }

            return response()->json([
                'status' => 0,
                'message' => 'Super Admin user not found.'
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error reverting impersonation: ' . $e->getMessage(),
                'error' => $e->getMessage(),
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => explode("\n", $e->getTraceAsString())
            ], 500);
        }
    }
}
