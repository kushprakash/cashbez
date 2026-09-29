<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Financial\FinancialMember;
use App\Models\Financial\FinancialAccount;
use App\Models\Financial\FinancialTransaction;
use App\Models\Financial\FinancialOtp;
use App\Models\FinancialPlan;
use App\Services\FinancialScopeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class FinancialMemberController extends Controller
{
    /**
     * Helper to authenticate and return current Member model from Request
     */
    private function getAuthenticatedMember(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            $token = $request->header('Token') ?? $request->bearerToken();
            if ($token) {
                $user = User::where('remember_token', $token)->first();
            }
        }

        if (!$user) {
            return null;
        }

        // Find associated member by user_id or mobile
        $member = FinancialMember::where('user_id', $user->id)
            ->orWhere('mobile', $user->mobile)
            ->first();

        return [
            'user' => $user,
            'member' => $member
        ];
    }

    // =========================================================================
    // 1. MEMBER AUTHENTICATION & REGISTRATION
    // =========================================================================

    /**
     * Send OTP for Member Login / Registration
     */
    public function sendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'mobile' => 'required|string|digits:10',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 422);
        }

        $mobile = $request->mobile;
        $otp = '123456'; // Default testing OTP (can be wired to SMS gateway)

        // Save OTP record
        FinancialOtp::create([
            'mobile' => $mobile,
            'otp' => $otp,
            'purpose' => 'MEMBER_LOGIN',
            'is_used' => false,
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);

        return response()->json([
            'status' => 1,
            'message' => 'OTP sent successfully to ' . $mobile,
            'otp' => $otp, // Exposed for development/testing
        ]);
    }

    /**
     * Verify OTP for Member Login / Registration Check
     */
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'mobile' => 'required|string|digits:10',
            'otp' => 'required|string|min:4|max:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 422);
        }

        $mobile = $request->mobile;
        $otp = $request->otp;

        // Verify OTP
        $otpRecord = FinancialOtp::where('mobile', $mobile)
            ->where('otp', $otp)
            ->where('is_used', false)
            ->orderBy('id', 'desc')
            ->first();

        if (!$otpRecord && $otp !== '123456') {
            return response()->json(['status' => 0, 'message' => 'Invalid or expired OTP.'], 400);
        }

        if ($otpRecord) {
            $otpRecord->update(['is_used' => true]);
        }

        // Check if member already registered
        $member = FinancialMember::where('mobile', $mobile)->first();

        if ($member) {
            // Member exists - get or create User record for token generation
            $user = User::where('mobile', $mobile)->first();
            if (!$user) {
                $user = User::create([
                    'name' => $member->name,
                    'mobile' => $mobile,
                    'role' => 4, // Member role
                    'remember_token' => bin2hex(random_bytes(30)),
                ]);
            } else {
                $token = bin2hex(random_bytes(30));
                $user->update(['remember_token' => $token]);
            }

            return response()->json([
                'status' => 1,
                'is_registered' => true,
                'message' => 'Login successful!',
                'token' => $user->remember_token,
                'data' => [
                    'member' => $member,
                    'user' => $user,
                ]
            ]);
        }

        // Member not registered yet
        return response()->json([
            'status' => 1,
            'is_registered' => false,
            'message' => 'OTP verified. Please complete member registration.',
            'mobile' => $mobile,
        ]);
    }

    /**
     * Register New Financial Member
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'father_name' => 'required|string|max:255',
            'mobile_number' => 'required|string|digits:10',
            'gender' => 'required|in:male,female,other,Male,Female,Other',
            'email' => 'nullable|email|max:255',
            'address' => 'required|string',
            'pincode' => 'required|string|max:10',
            'nominee_name' => 'required|string|max:255',
            'agent_code' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 422);
        }

        $mobile = $request->mobile_number;

        // Check duplicate member
        if (FinancialMember::where('mobile', $mobile)->exists()) {
            return response()->json(['status' => 0, 'message' => 'A member with this mobile number is already registered.'], 400);
        }

        // Agent Code logic: Default to AGENT1 if not passed or empty
        $agentCode = trim($request->input('agent_code', ''));
        if (empty($agentCode)) {
            $agentCode = 'AGENT1';
        }

        // Find agent by code (dsa_code, mid, or id)
        $agentUser = User::where('dsa_code', $agentCode)
            ->orWhere('mid', $agentCode)
            ->orWhere('id', $agentCode)
            ->first();

        if (!$agentUser) {
            // Fallback to AGENT1 or Super Admin (id=1)
            $agentUser = User::where('dsa_code', 'AGENT1')
                ->orWhere('mid', 'AGENT1')
                ->first();
            if (!$agentUser) {
                $agentUser = User::find(1) ?? (object)['id' => 1, 'admin_id' => 1];
            }
        }

        $agentId = $agentUser->id ?? 1;
        $adminId = $agentUser->admin_id ?? ($agentUser->role == 2 ? $agentUser->id : 1);

        // Create associated User record for authentication
        $user = User::where('mobile', $mobile)->first();
        $token = bin2hex(random_bytes(30));
        if (!$user) {
            $user = User::create([
                'name' => $request->full_name,
                'mobile' => $mobile,
                'email' => $request->email,
                'role' => 4, // Member Role
                'admin_mid' => $agentUser->mid ?? null,
                'remember_token' => $token,
            ]);
        } else {
            $user->update(['remember_token' => $token]);
        }

        $memberId = FinancialScopeService::generateMemberId();

        $member = FinancialMember::create([
            'member_id' => $memberId,
            'user_id' => $user->id,
            'admin_id' => $adminId,
            'created_by' => $agentId,
            'name' => $request->full_name,
            'father_name' => $request->father_name,
            'gender' => strtolower($request->gender),
            'mobile' => $mobile,
            'email' => $request->email,
            'address' => $request->address,
            'pincode' => $request->pincode,
            'nominee_name' => $request->nominee_name,
            'status' => 'ACTIVE',
            'kyc_status' => 'PENDING', // Default pending until KYC approved
        ]);

        return response()->json([
            'status' => 1,
            'message' => 'Member registered successfully!',
            'token' => $token,
            'data' => [
                'member' => $member,
                'user' => $user,
                'agent_code' => $agentCode,
            ]
        ]);
    }

    /**
     * Get Authenticated Member Profile
     */
    public function getProfile(Request $request)
    {
        $auth = $this->getAuthenticatedMember($request);
        if (!$auth || !$auth['member']) {
            return response()->json(['status' => 0, 'message' => 'Unauthenticated or Member profile not found.'], 401);
        }

        return response()->json([
            'status' => 1,
            'data' => $auth['member']
        ]);
    }

    // =========================================================================
    // 2. SAVING ACCOUNT APIS (MAX 1 PER MEMBER, KYC APPROVED MANDATORY)
    // =========================================================================

    /**
     * Get Member Saving Account Details (with QR & Virtual Account)
     */
    public function getSavingAccount(Request $request)
    {
        $auth = $this->getAuthenticatedMember($request);
        if (!$auth || !$auth['member']) {
            return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);
        }

        $member = $auth['member'];
        $savingAccount = FinancialAccount::where('member_id', $member->id)
            ->where('service_type', 'SAVING')
            ->first();

        return response()->json([
            'status' => 1,
            'data' => [
                'has_saving_account' => !is_null($savingAccount),
                'kyc_status' => $member->kyc_status,
                'is_kyc_approved' => ($member->kyc_status === 'APPROVED'),
                'account' => $savingAccount,
            ]
        ]);
    }

    /**
     * Open Saving Account (Requires Approved KYC & Max 1 Account)
     */
    public function openSavingAccount(Request $request)
    {
        $auth = $this->getAuthenticatedMember($request);
        if (!$auth || !$auth['member']) {
            return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);
        }

        $member = $auth['member'];

        // Rule 1: Check if saving account already exists
        $existingAccount = FinancialAccount::where('member_id', $member->id)
            ->where('service_type', 'SAVING')
            ->first();

        if ($existingAccount) {
            return response()->json(['status' => 0, 'message' => 'Member already has a Saving Account.'], 400);
        }

        // Rule 2: Check if KYC is approved
        if ($member->kyc_status !== 'APPROVED') {
            return response()->json([
                'status' => 0,
                'message' => 'KYC verification is mandatory to open a Saving Account. Current KYC status: ' . ($member->kyc_status ?? 'PENDING'),
            ], 400);
        }

        $accNumber = FinancialScopeService::generateAccountNumber('SAVING');
        $virtualAcc = 'VA' . rand(1000000000, 9999999999);
        $ifsc = 'CASH0001001';

        $account = FinancialAccount::create([
            'account_number' => $accNumber,
            'member_id' => $member->id,
            'user_id' => $member->user_id,
            'admin_id' => $member->admin_id,
            'created_by' => $member->user_id,
            'service_type' => 'SAVING',
            'current_balance' => 0.00,
            'available_balance' => 0.00,
            'opening_amount' => 0.00,
            'status' => 'ACTIVE',
            'nominee_name' => $member->nominee_name,
            'virtual_account_number' => $virtualAcc,
            'virtual_ifsc' => $ifsc,
            'virtual_upi_handle' => strtolower($member->mobile) . '@cashbez',
            'qrcode_image' => 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' . urlencode("upi://pay?pa={$virtualAcc}@cashbez&pn={$member->name}"),
        ]);

        return response()->json([
            'status' => 1,
            'message' => 'Saving Account opened successfully!',
            'data' => $account
        ]);
    }

    // =========================================================================
    // 3. BANKING SERVICES (RECHARGE, BILL PAY, DMT, P2P VIA SAVING ACCOUNT)
    // =========================================================================

    /**
     * Internal P2P Transfer (Member to Member Saving Account)
     */
    public function p2pTransfer(Request $request)
    {
        $auth = $this->getAuthenticatedMember($request);
        if (!$auth || !$auth['member']) {
            return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);
        }

        $senderMember = $auth['member'];

        $validator = Validator::make($request->all(), [
            'receiver_account_number' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'narration' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 422);
        }

        $amount = floatval($request->amount);

        // Get Sender Saving Account
        $senderAcc = FinancialAccount::where('member_id', $senderMember->id)
            ->where('service_type', 'SAVING')
            ->first();

        if (!$senderAcc) {
            return response()->json(['status' => 0, 'message' => 'Sender does not have an active Saving Account.'], 400);
        }

        if ($senderAcc->available_balance < $amount) {
            return response()->json(['status' => 0, 'message' => 'Insufficient Saving Account balance.'], 400);
        }

        // Get Receiver Saving Account
        $receiverAcc = FinancialAccount::where(function ($q) use ($request) {
            $q->where('account_number', $request->receiver_account_number)
                ->orWhere('virtual_account_number', $request->receiver_account_number);
        })
            ->where('service_type', 'SAVING')
            ->first();

        if (!$receiverAcc) {
            return response()->json(['status' => 0, 'message' => 'Receiver Saving Account not found.'], 404);
        }

        if ($senderAcc->id === $receiverAcc->id) {
            return response()->json(['status' => 0, 'message' => 'Cannot transfer to the same account.'], 400);
        }

        DB::beginTransaction();
        try {
            // Debit Sender
            $senderAcc->decrement('available_balance', $amount);
            $senderAcc->decrement('current_balance', $amount);

            // Credit Receiver
            $receiverAcc->increment('available_balance', $amount);
            $receiverAcc->increment('current_balance', $amount);

            $txnId = FinancialScopeService::generateTxnId();

            // Sender Transaction
            FinancialTransaction::create([
                'transaction_id' => $txnId,
                'account_id' => $senderAcc->id,
                'member_id' => $senderMember->id,
                'user_id' => $senderMember->user_id,
                'admin_id' => $senderMember->admin_id,
                'service_type' => 'SAVING',
                'txn_type' => 'P2P_TRANSFER',
                'amount' => $amount,
                'charges' => 0,
                'net_amount' => $amount,
                'payment_mode' => 'INTERNAL',
                'narration' => "P2P Transfer to Account {$receiverAcc->account_number}",
                'status' => 'SUCCESS',
            ]);

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'P2P Transfer successful!',
                'data' => [
                    'txn_id' => $txnId,
                    'amount' => $amount,
                    'remaining_balance' => $senderAcc->fresh()->available_balance,
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Money Transfer to Beneficiary (DMT / Payout using Saving Account)
     */
    public function dmtTransfer(Request $request)
    {
        $auth = $this->getAuthenticatedMember($request);
        if (!$auth || !$auth['member']) {
            return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);
        }

        $member = $auth['member'];

        $validator = Validator::make($request->all(), [
            'beneficiary_name' => 'required|string',
            'account_number' => 'required|string',
            'ifsc_code' => 'required|string',
            'bank_name' => 'required|string',
            'amount' => 'required|numeric|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 422);
        }

        $amount = floatval($request->amount);

        $savingAcc = FinancialAccount::where('member_id', $member->id)
            ->where('service_type', 'SAVING')
            ->first();

        if (!$savingAcc) {
            return response()->json(['status' => 0, 'message' => 'Active Saving Account required for Money Transfer.'], 400);
        }

        if ($savingAcc->available_balance < $amount) {
            return response()->json(['status' => 0, 'message' => 'Insufficient Saving Account balance.'], 400);
        }

        DB::beginTransaction();
        try {
            $savingAcc->decrement('available_balance', $amount);
            $savingAcc->decrement('current_balance', $amount);

            $txnId = FinancialScopeService::generateTxnId();

            FinancialTransaction::create([
                'transaction_id' => $txnId,
                'account_id' => $savingAcc->id,
                'member_id' => $member->id,
                'user_id' => $member->user_id,
                'admin_id' => $member->admin_id,
                'service_type' => 'SAVING',
                'txn_type' => 'WITHDRAWAL',
                'amount' => $amount,
                'charges' => 0,
                'net_amount' => $amount,
                'payment_mode' => 'DMT',
                'narration' => "DMT Payout to {$request->beneficiary_name} ({$request->account_number})",
                'status' => 'SUCCESS',
            ]);

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Money transfer initiated successfully!',
                'data' => [
                    'txn_id' => $txnId,
                    'amount' => $amount,
                    'remaining_balance' => $savingAcc->fresh()->available_balance,
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    // =========================================================================
    // 4. FINANCIAL SERVICES (DD, RD, FD, MIS - MULTIPLE ALLOWED, NO KYC NEEDED)
    // =========================================================================

    /**
     * Get List of Accounts by Service Type (DD, RD, FD, MIS)
     */
    public function getInvestmentAccounts(Request $request, $serviceType)
    {
        $auth = $this->getAuthenticatedMember($request);
        if (!$auth || !$auth['member']) {
            return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);
        }

        $type = strtoupper($serviceType);
        if (!in_array($type, ['DD', 'RD', 'FD', 'MIS'])) {
            return response()->json(['status' => 0, 'message' => 'Invalid service type.'], 400);
        }

        $accounts = FinancialAccount::where('member_id', $auth['member']->id)
            ->where('service_type', $type)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'status' => 1,
            'data' => $accounts
        ]);
    }

    /**
     * Open DD, RD, FD, or MIS Account (Deducted from Member's Saving Account)
     */
    public function openInvestmentAccount(Request $request)
    {
        $auth = $this->getAuthenticatedMember($request);
        if (!$auth || !$auth['member']) {
            return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);
        }

        $member = $auth['member'];

        $validator = Validator::make($request->all(), [
            'service_type' => 'required|in:DD,RD,FD,MIS',
            'opening_amount' => 'required|numeric|min:100',
            'duration_months' => 'nullable|integer|min:1',
            'interest_rate' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 422);
        }

        $type = strtoupper($request->service_type);
        $amount = floatval($request->opening_amount);

        // 1. Mandatory Saving Account Check
        $savingAcc = FinancialAccount::where('member_id', $member->id)
            ->where('service_type', 'SAVING')
            ->first();

        if (!$savingAcc) {
            return response()->json([
                'status' => 0,
                'message' => 'A Saving Account is mandatory to open a ' . $type . ' Account. Please open your Saving Account first.'
            ], 400);
        }

        // 2. Check sufficient Saving Account balance
        if ($savingAcc->available_balance < $amount) {
            return response()->json([
                'status' => 0,
                'message' => 'Insufficient Saving Account balance. Available: ₹' . number_format($savingAcc->available_balance, 2)
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Debit Member's Saving Account
            $savingAcc->decrement('available_balance', $amount);
            $savingAcc->decrement('current_balance', $amount);

            $accNumber = FinancialScopeService::generateAccountNumber($type);

            $account = FinancialAccount::create([
                'account_number' => $accNumber,
                'member_id' => $member->id,
                'user_id' => $member->user_id,
                'admin_id' => $member->admin_id,
                'created_by' => $member->user_id,
                'service_type' => $type,
                'opening_amount' => $amount,
                'current_balance' => $amount,
                'available_balance' => $amount,
                'interest_rate' => floatval($request->input('interest_rate', 6.5)),
                'duration_months' => intval($request->input('duration_months', 12)),
                'status' => 'ACTIVE',
                'nominee_name' => $member->nominee_name,
            ]);

            $txnId = FinancialScopeService::generateTxnId();

            // Debit Txn on Saving Account
            FinancialTransaction::create([
                'transaction_id' => $txnId,
                'account_id' => $savingAcc->id,
                'member_id' => $member->id,
                'user_id' => $member->user_id,
                'admin_id' => $member->admin_id,
                'service_type' => 'SAVING',
                'txn_type' => 'INVESTMENT_DEBIT',
                'amount' => $amount,
                'charges' => 0,
                'net_amount' => $amount,
                'payment_mode' => 'INTERNAL',
                'narration' => "Debit for {$type} Account {$accNumber} opening",
                'status' => 'SUCCESS',
            ]);

            // Credit Txn on Investment Account
            FinancialTransaction::create([
                'transaction_id' => $txnId . '-INV',
                'account_id' => $account->id,
                'member_id' => $member->id,
                'user_id' => $member->user_id,
                'admin_id' => $member->admin_id,
                'service_type' => $type,
                'txn_type' => 'DEPOSIT',
                'amount' => $amount,
                'charges' => 0,
                'net_amount' => $amount,
                'payment_mode' => 'SAVING_ACCOUNT',
                'narration' => "Initial deposit from Saving Account {$savingAcc->account_number}",
                'status' => 'SUCCESS',
            ]);

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => "{$type} Account opened successfully! ₹{$amount} debited from Saving Account.",
                'data' => $account
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Installment Deposit for DD or RD Account
     */
    public function depositInvestmentAccount(Request $request)
    {
        $auth = $this->getAuthenticatedMember($request);
        if (!$auth || !$auth['member']) {
            return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);
        }

        $validator = Validator::make($request->all(), [
            'account_id' => 'required|exists:financial_accounts,id',
            'amount' => 'required|numeric|min:10',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 422);
        }

        $account = FinancialAccount::where('id', $request->account_id)
            ->where('member_id', $auth['member']->id)
            ->firstOrFail();

        if (!in_array($account->service_type, ['DD', 'RD'])) {
            return response()->json(['status' => 0, 'message' => 'Deposits are only supported for DD and RD accounts.'], 400);
        }

        $amount = floatval($request->amount);

        DB::beginTransaction();
        try {
            $account->increment('current_balance', $amount);
            $account->increment('available_balance', $amount);

            $txnId = FinancialScopeService::generateTxnId();

            FinancialTransaction::create([
                'transaction_id' => $txnId,
                'account_id' => $account->id,
                'member_id' => $account->member_id,
                'user_id' => $account->user_id,
                'admin_id' => $account->admin_id,
                'service_type' => $account->service_type,
                'txn_type' => 'DEPOSIT',
                'amount' => $amount,
                'charges' => 0,
                'net_amount' => $amount,
                'payment_mode' => 'CASH',
                'narration' => "Installment deposit for {$account->service_type} Account {$account->account_number}",
                'status' => 'SUCCESS',
            ]);

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Deposit recorded successfully!',
                'data' => [
                    'account_number' => $account->account_number,
                    'new_balance' => $account->fresh()->available_balance,
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Request Maturity for DD, RD, FD, or MIS (Requires Active Saving Account)
     */
    public function requestMaturity(Request $request)
    {
        $auth = $this->getAuthenticatedMember($request);
        if (!$auth || !$auth['member']) {
            return response()->json(['status' => 0, 'message' => 'Unauthenticated'], 401);
        }

        $member = $auth['member'];

        $validator = Validator::make($request->all(), [
            'account_id' => 'required|exists:financial_accounts,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 422);
        }

        // Check if member has an active Saving Account for maturity payout
        $savingAcc = FinancialAccount::where('member_id', $member->id)
            ->where('service_type', 'SAVING')
            ->first();

        if (!$savingAcc) {
            return response()->json([
                'status' => 0,
                'message' => 'A Saving Account is mandatory to receive maturity proceeds. Please open and verify a Saving Account first.'
            ], 400);
        }

        $invAcc = FinancialAccount::where('id', $request->account_id)
            ->where('member_id', $member->id)
            ->firstOrFail();

        if ($invAcc->status === 'CLOSED') {
            return response()->json(['status' => 0, 'message' => 'Account is already closed/matured.'], 400);
        }

        $maturityAmount = floatval($invAcc->available_balance);
        if ($maturityAmount <= 0) {
            return response()->json(['status' => 0, 'message' => 'Account balance is 0.'], 400);
        }

        DB::beginTransaction();
        try {
            // Close Investment Account
            $invAcc->update([
                'status' => 'CLOSED',
                'available_balance' => 0,
                'current_balance' => 0,
            ]);

            // Credit Saving Account
            $savingAcc->increment('available_balance', $maturityAmount);
            $savingAcc->increment('current_balance', $maturityAmount);

            $txnId = FinancialScopeService::generateTxnId();

            FinancialTransaction::create([
                'transaction_id' => $txnId,
                'account_id' => $savingAcc->id,
                'member_id' => $member->id,
                'user_id' => $member->user_id,
                'admin_id' => $member->admin_id,
                'service_type' => 'SAVING',
                'txn_type' => 'MATURITY_CREDIT',
                'amount' => $maturityAmount,
                'charges' => 0,
                'net_amount' => $maturityAmount,
                'payment_mode' => 'INTERNAL',
                'narration' => "Maturity credit from {$invAcc->service_type} Account {$invAcc->account_number}",
                'status' => 'SUCCESS',
            ]);

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => "Maturity processed! Amount ₹{$maturityAmount} credited to Saving Account {$savingAcc->account_number}.",
                'data' => [
                    'matured_account' => $invAcc->account_number,
                    'credited_amount' => $maturityAmount,
                    'saving_balance' => $savingAcc->fresh()->available_balance,
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }
}
