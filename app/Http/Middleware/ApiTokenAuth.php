<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Account;
use Symfony\Component\HttpFoundation\Response;

class ApiTokenAuth
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {

        $currentUrl = "$_SERVER[REQUEST_URI]";
        
        if($currentUrl=='/api/payoutCallback'){
            return $next($request);
        }
        if($currentUrl=='/api/autoPermissionCommission/{userId}'){
            return $next($request);
        }
        if($currentUrl=='/api/kycManual/{userId}'){
            return $next($request);
        }

        if($currentUrl=='/api/v2/aeps/state-list'){
            return $next($request);
        }

        if($currentUrl=='/api/matm-callback'){
            return $next($request);
        }

        if($currentUrl=='/api/utility-pending-cron'){
            return $next($request);
        }

        if($currentUrl=='/api/pg-pending-cron'){
            return $next($request);
        }

        if($currentUrl=='/api/pg-pending/{txnid}'){
            return $next($request);
        }

        

        if($currentUrl=='/api/pg/transaction' || str_starts_with($currentUrl, '/api/pg/transaction') || $request->is('api/pg/transaction')){
            return $next($request);
        }

        if($currentUrl=='/api/add-money/verify' || str_starts_with($currentUrl, '/api/add-money/verify') || $request->is('api/add-money/verify')){
            return $next($request);
        }

        if($currentUrl=='/api/vaCallback'){
            return $next($request);
        }

        if($currentUrl=='/api/va-check'){
            return $next($request);
        }

        if($currentUrl=='/api/auto-lead-generate'){
            return $next($request);
        }
        if($currentUrl=='/api/telecalling/auto-kyc-lead-generate'){
            return $next($request);
        }
        if($currentUrl=='/api/telecalling/auto-business-lead-generate'){
            return $next($request);
        }

        if($currentUrl=='/api/dumypassbook'){
            return $next($request);
        }
        if($currentUrl=='/api/sankram-goter'){
            return $next($request);
        }
        
        
        if($currentUrl=='/api/payoutCallbackAnvineo'){
            return $next($request);
        }
        
        if($currentUrl=='/api/reffralProgramCron'){
            return $next($request);
        }

        if($currentUrl=='/api/sankramUtilityCallback'){
            return $next($request);
        }

        

        if($currentUrl=='/api/payoutStatus'){
            return $next($request);
        }
        
        if($currentUrl=='/api/change2fa'){
            return $next($request);
        }

        if($currentUrl=='/api/qr-generate-v4'){
            return $next($request);
        }
        if($currentUrl=='/api/getAdminWithUrl'){
            return $next($request);
        }
        if($currentUrl=='/api/getUserData/{mid}'){
            return $next($request);
        }
        if($currentUrl=='/api/getaepshistory'){
            return $next($request);
        }
        if($currentUrl=='/api/beneaccount'){
            return $next($request);
        }
        if($currentUrl=='/api/add-money/history'){
            return $next($request);
        }
        if($currentUrl=='/api/goterwebhook'){
            return $next($request);
        }
        if($currentUrl=='/api/utility-pending-cron'){
            return $next($request);
        }


        // DIGILOCKER AUTHENTICATION
        if($currentUrl=='/api/digilocker-webhook'){
            return $next($request);
        }
        if($currentUrl=='/api/digilocker/auth'){
            return $next($request);
        }



        if($currentUrl=='/api/check_aeps_commission'){
            return $next($request);
        }

        if($currentUrl=='/api/check3way'){
            return $next($request);
        }
        if($currentUrl=='/api/add-money/verify'){
            return $next($request);
        }
        if($currentUrl=='/api/checks3way/{mtid}'){
            return $next($request);
        }
        
        
        // Allow QR code generation without authentication (pattern match for any UPI ID)
        if(strpos($currentUrl, '/api/qr-generate/') === 0){
            return $next($request);
        }
        
        // Allow public popup fetch without authentication
        if($currentUrl=='/api/popup/public'){
            return $next($request);
        }
        
         
        $user = null;

        // 1. Check for 'Token' header
        if ($request->hasHeader('Token') || $request->hasHeader('platform')) {
            $token = $request->header('Token');
            
            $user=null;
            if($token){
                $user = User::where('remember_token', $token)->first();
            }

            if (!$user) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Invalid token',
                    'data' => $request->hasHeader('Token') ? $request->header('Token') : 'No Token Header'
                ], 401);
            }

            if($user->status==0){
                return response()->json([
                    'status' => 0,
                    'message' => 'User is inactive',
                ], 401);
            }
        }

        // 2. If no token, check for 'mid' and 'mkey' (in headers, body, or query)
        else {
            // Get from header or request
            $mid = $request->header('mid') ?? $request->input('mid');
            $mkey = $request->header('mkey') ?? $request->input('mkey');

            if ($mid && $mkey) {
                $user = User::where('mid', $mid)
                            ->where('mkey', $mkey)
                            ->first();

                if (!$user) {
                    //auth()->logout(); // Clear any existing auth session
                    return response()->json([
                        'status' => 0,
                        'message' => 'Invalid MID or MKEY',
                    ], 401);
                } 

                // If API partner & AEPS routes
                // Outlet ID NOT required for:
                // 1. /api/v2/aeps/draft
                // 2. /api/v2/aeps/state-list
                if (
                    $user->is_api_partner == 1 &&
                    str_starts_with($currentUrl, '/api/v2/aeps/') &&
                    !in_array($currentUrl, [
                        '/api/v2/aeps/draft',
                        '/api/v2/aeps/state-list'
                    ])
                ) {
                    $outletIds = $request->header('outletId') ?? $request->input('outletId');

                    if (empty($outletIds)) {
                        return response()->json([
                            'status'  => 0,
                            'message' => 'Outlet ID is required for API partner. ',
                        ], 200);
                    }
                }

                
            } else {
                return response()->json([
                    'status' => 0,
                    'message' => 'No token or MID/MKEY provided',
                ], 400);
            }

            //Token could not be parsed from the request.
        }



        // Load admin and attach both user and admin to request
        $admin = User::where('mid', $user->admin_mid)->first();
        
        $isadmin = false;
        if($admin && $user->id == $admin->id) {
            $isadmin = true; // If user is admin, set admin to user
        }

        $isSuper = false;
        if($user->id == 1) {
            $isSuper = true; // If user is super admin, set super admin to user
        }


        if($user->role==2 && $user->id != 4){

            if ($request->route() && isset($request->route()->defaults['smodule'])) {

                $subscription = Subscription::where('user_id', $user->id)
                ->where('module_id', $request->route()->defaults['smodule'])
                ->orderBy('id', 'desc')->first();

                if($subscription && $subscription->end_at < Carbon::now()){
                    return response()->json([
                        'status' => 0,
                        'message' => 'Subscription is expired',
                    ], 401);
                }
            }
            
        }

        $request->merge(['user' => $user]);
        $request->merge(['admin' => $admin]);
        $request->merge(['isAdmin' => $isadmin]);
        $request->merge(['isSuper' => $isSuper]);


        auth()->setUser($user);
        

        return $next($request);
    }

    /**
     * Helper method to get account balance
     */
    private function getAccountBalanceHelper(Request $request, $user, $accountId = null)
    {
        try {
            // Get account ID from parameter or request
            $accountId = $accountId ?? $request->input('account_id');
            
            if (!$accountId) {
                return [
                    'status' => 0,
                    'message' => 'Account ID is required',
                    'balance' => 0,
                    'available_balance' => 0,
                    'hold_amount' => 0
                ];
            }

            // Find account belonging to the authenticated user
            $account = Account::where('id', $accountId)
                            ->where('user_id', $user->id)
                            ->where('status', 1)
                            ->first();

            if (!$account) {
                return [
                    'status' => 0,
                    'message' => 'Account not found or inactive',
                    'balance' => 0,
                    'available_balance' => 0,
                    'hold_amount' => 0
                ];
            }

            // Get current balance from account
            $currentBalance = $account->balance;
            $holdAmount = $account->hold_amount ?? 0;
            
            // Calculate available balance (current balance - hold amount)
            $availableBalance = $currentBalance - $holdAmount;
            
            // Ensure available balance is not negative
            $availableBalance = max(0, $availableBalance);

            return [
                'status' => 1,
                'message' => 'Balance fetched successfully',
                'balance' => $currentBalance,
                'available_balance' => $availableBalance,
                'hold_amount' => $holdAmount,
                'account_id' => $account->id,
                'account_name' => $account->name,
                'account_number' => $account->number
            ];

        } catch (\Exception $e) {
            return [
                'status' => 0,
                'message' => 'Error fetching balance: ' . $e->getMessage(),
                'balance' => 0,
                'available_balance' => 0,
                'hold_amount' => 0
            ];
        }
    }
}
