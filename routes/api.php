<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\MainModuleController;
use App\Http\Controllers\ModulePermissionController;
use App\Http\Controllers\RoleModulePermissionController;
use App\Http\Controllers\SubModuleController;
use App\Http\Controllers\RoleModuleCommissionController;
use App\Http\Controllers\UserRoleCommissionController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\RoleSubscriptionController;
use App\Http\Controllers\Api\CardDownloadController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DesignationController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\SalaryController;
use App\Http\Controllers\PayslipController;
use App\Http\Controllers\Api\KycController;
use App\Http\Controllers\CRM\LeadTypeController;
use App\Http\Controllers\CRM\LeadSourceController;
use App\Http\Controllers\CRM\LeadStatusController;
use App\Http\Controllers\CRM\LeadController;
use App\Http\Controllers\CRM\LeadTransferLogController;
use App\Http\Controllers\CRM\LeadActivityController;
use App\Http\Controllers\CRM\FollowupController;
use App\Http\Controllers\CRM\CustomFieldController;
use App\Http\Controllers\CRM\LeadCustomValueController;
use App\Http\Controllers\CRM\EmailController;
use App\Http\Controllers\Api\FollowupTypeController;
use App\Http\Controllers\Api\FollowupStatusController;
use App\Http\Controllers\Banking\UtilityController;
use App\Http\Controllers\Banking\CallbackController;
use App\Http\Controllers\Banking\BeneficiaryController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\PassbookController;
use App\Http\Controllers\Api\BalanceController;
use App\Http\Controllers\Banking\MobileRechargeController;
use App\Http\Controllers\Banking\RechargeOperatorController;
use App\Http\Controllers\Banking\BbpsCategoryController;
use App\Http\Controllers\Banking\UtilityCircleController;
use App\Http\Controllers\Banking\ApiSettingController;
use App\Http\Controllers\Banking\ApiPendingSettingController;
use App\Http\Controllers\Banking\ApiServiceSettingController;
use App\Http\Controllers\Banking\OperatorMappingController;
use App\Http\Controllers\Banking\MerchantController;
use App\Http\Controllers\Banking\CMSController;
use App\Http\Controllers\Banking\AepsVideoKycController;
use App\Http\Controllers\Banking\VerificationController;
use App\Http\Controllers\Banking\CashDepositController;
use App\Http\Controllers\Banking\P2pController;
use App\Http\Controllers\Banking\TeleCallingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\PushNotificationController;
use App\Http\Controllers\Api\DigiLockerOnboarding;
use App\Http\Controllers\VaController;


// ==========================================
// DigiLocker OAuth Routes
// ==========================================
// Public DigiLocker endpoints (no user auth required, only merchant credentials)
Route::middleware('digilocker.public')->prefix('digilocker')->group(function () {
    Route::get('auth', [DigiLockerOnboarding::class, 'initiateAuth']);
});

// DigiLocker webhook (completely public - called by DigiLocker servers)
Route::get('/digilocker-webhook', [DigiLockerOnboarding::class, 'handleCallback']);
Route::get('/autoPermissionCommission/{userId}', [AuthController::class, 'autoPermissionCommission']);
Route::get('/kycManual/{userId}', [AuthController::class, 'kycManual']);
Route::get('/create-missing-wallets', [AccountController::class, 'createMissingWallets']);
Route::get('/sync-aeps-drafts-to-users', [AccountController::class, 'syncAepsDraftsToUsers']);




// Authenticated DigiLocker endpoints (require user token)
Route::middleware('api.token.auth')->prefix('digilocker')->group(function () {
    Route::get('profile', [DigiLockerOnboarding::class, 'getProfile']);
    Route::get('kyc-status', [DigiLockerOnboarding::class, 'checkKycStatus']);
    Route::post('refresh', [DigiLockerOnboarding::class, 'refreshToken']);
    Route::post('complete-onboarding', [DigiLockerOnboarding::class, 'completeOnboarding']);
    Route::post('send-email-otp', [DigiLockerOnboarding::class, 'sendEmailOtp']);
    Route::post('verify-email-otp', [DigiLockerOnboarding::class, 'verifyEmailOtp']);
});

Route::post('/aeps-draft', [AuthController::class, 'aepsDraft']);
Route::post('/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/sent-mail', [AuthController::class, 'sentMail']);
Route::get('/payoutStatus', [BeneficiaryController::class, 'payoutStatus']);
Route::get('/payoutCallback', [BeneficiaryController::class, 'payoutCallback']);
Route::post('/payoutCallback', [BeneficiaryController::class, 'payoutCallback']);
Route::get('/payoutCallbackAnvineo', [BeneficiaryController::class, 'payoutCallbackAnvineo']);
Route::post('/payoutCallbackAnvineo', [BeneficiaryController::class, 'payoutCallbackAnvineo']);
Route::get('/check3way', [MerchantController::class, 'check3way']);
Route::get('/checks3way/{mtid}', [MerchantController::class, 'checks3way']);
Route::get('/checkToken', [AuthController::class, 'checkToken']);
Route::post('/get-roles', [AuthController::class, 'getAppRoles']);
Route::get('/get-roles', [AuthController::class, 'getAppRoles']);
Route::get('/getLogo', [AuthController::class, 'getLogo']);
Route::post('/check-refer', [AuthController::class, 'verifyReferBy']);
Route::post('/check-refers', [AuthController::class, 'verifyRefersBy']);
Route::post('/save-contact', [AuthController::class, 'saveContact']);
Route::post('/contact-us', [AuthController::class, 'submitContactUs']);
Route::get('qr-generate-v27', [AccountController::class, 'qrGenerate12']);
Route::get('getAdminWithUrl', [AccountController::class, 'getAdminWithUrl']);
Route::get('getUserData/{mid}', [AccountController::class, 'getUserData']);
Route::get('test-admin-settings', [AccountController::class, 'testAdminSettings']);
Route::get('utility-pending-cron', [UtilityController::class, 'cronCheckStatus']);
Route::get('pg-pending-cron', [AccountController::class, 'pgCronCheckStatus']);
Route::get('pg-pending/{txnid}', [AccountController::class, 'CheckStatus']);
Route::get('goterwebhook', [UtilityController::class, 'goterwebhook']);
Route::post('goterwebhook', [UtilityController::class, 'goterwebhook']);
Route::get('visitor-log', [AuthController::class, 'logVisitors']);
Route::post('visitor-log', [AuthController::class, 'logVisitors']);
// Route::get('dumypassbook', [AccountController::class, 'dumypassbook']);
Route::get('auto-lead-generate', [CallbackController::class, 'autoLeadGenerate']);
Route::any('matm-callback', [CallbackController::class, 'matmCallback']);
Route::any('vaCallback', [VaController::class, 'vaCallback']);
Route::any('vaCheck', [VaController::class, 'vaCheck']);
Route::any('sankram-goter', [UtilityController::class, 'sankramGoter']);
Route::any('submodulebyCommission/{id}', [UserRoleCommissionController::class, 'submodulebyCommission']);

Route::any('/sankramUtilityCallback', [CallbackController::class, 'sankramUtilityCallback']);
Route::any('/reffralProgramCron', [CallbackController::class, 'reffralProgramCron']);
Route::any('/reffral-link', [AccountController::class, 'reffralLink']);
// ==========================================
// CMS FingPay Webhook Endpoints (No Auth - Called by FingPay)
// These URLs must be provided to FingPay for integration
// ==========================================
Route::post('/cms/bc-wallet-debit', [CMSController::class, 'bcWalletDebit']);
Route::post('/cms/bc-wallet-check', [CMSController::class, 'bcWalletCheck']);
Route::post('/cms/callback', [CMSController::class, 'cmsCallback']);
Route::get('/cms/debug', [CMSController::class, 'cmsDebug']); // DEBUG - Remove in production

// ==========================================
// Health Check Endpoint (Observability)
// - No auth, no Blade, no heavy queries
// - Used by: CI, load balancers, uptime monitors
// ==========================================
Route::get('/health', \App\Http\Controllers\HealthController::class);

// Public Banners - No auth required
Route::get('/banners/active', [\App\Http\Controllers\Admin\BannerController::class, 'getActive']);


// QR Login Routes
Route::get('/login/qr/init', [AuthController::class, 'initQrLogin']);
Route::get('/login/qr/stream/{challengeId}', [AuthController::class, 'streamQrLogin']);
Route::get('/login/qr/image/{challengeId}', [AuthController::class, 'getLoginQrImage']);
Route::post('/login/qr/approve', [AuthController::class, 'approveQrLogin']);

// Public test route for message types (no auth) — useful for dev/testing only
Route::get('/public-message-types', [\App\Http\Controllers\MessageTypeController::class, 'index']);

// Direct URL route to clear all Laravel caches (route, config, cache, view)
Route::match(['get', 'post'], '/clear-all-cache', function (Request $request) {
    if ($request->get('token') !== 'cashbez_secure_token_9835') {
        return response()->json(['status' => 0, 'message' => 'Unauthorized token'], 403);
    }
    Artisan::call('route:clear');
    Artisan::call('config:clear');
    Artisan::call('cache:clear');
    Artisan::call('view:clear');
    return response()->json([
        'status' => 1,
        'message' => 'All caches (route, config, cache, view) cleared successfully!'
    ]);
});

// Menu routes
Route::post('/menu-structure', [MenuController::class, 'getMenuStructure']);
Route::get('/menu-from-db', [MenuController::class, 'getMenuFromDatabase']);

Route::get('/users', [AuthController::class, 'users']);
Route::get('/users-paginated', [AuthController::class, 'usersPaginated']);
Route::post('/users', [AuthController::class, 'storeUser']);
Route::get('/users/{id}', [AuthController::class, 'getUser']);
Route::post('/users/{id}', [AuthController::class, 'updateUser']);
Route::delete('/users/{id}', [AuthController::class, 'deleteUser']);





// Public / Flexible PAN Card import route
Route::match(['get', 'post'], '/pan-card/import-agents', [\App\Http\Controllers\OnlineService\PanCardController::class, 'importAgentsFromExcel']);
Route::match(['get', 'post'], '/pancard/import-agents', [\App\Http\Controllers\OnlineService\PanCardController::class, 'importAgentsFromExcel']);

// Routes that require authentication
Route::middleware('api.token.auth')->group(function () {
   Route::get('getUserBeneficiaryAccounts/{mid}', [AccountController::class, 'getUserBeneficiaryAccounts']);

    Route::post('/userdata', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::match(['get', 'post'], '/agent/commission-report', [\App\Http\Controllers\Admin\CommissionReportController::class, 'index']);
    
    Route::post('/createMpin', [AuthController::class, 'createMpin']);
    Route::post('/forgetMpin', [AuthController::class, 'forgetMpin']);
    Route::post('/verifyMpin', [AuthController::class, 'verifyMpin']);

    // Role CRUD API
    Route::get('/roles', [RoleController::class, 'index']);
    Route::post('/roles', [RoleController::class, 'store']);
    Route::get('/roles/{id}', [RoleController::class, 'show']);
    Route::put('/roles/{id}', [RoleController::class, 'update']);
    Route::delete('/roles/{id}', [RoleController::class, 'destroy']);
    Route::post('/roles/update-order', [RoleController::class, 'updateOrder']);
    Route::get('/admin-roles', [RoleController::class, 'AdminRoles']);
    Route::match(['get', 'post'], '/rolePosition', [RoleController::class, 'rolePosition']);
    Route::match(['get', 'post'], '/role-position', [RoleController::class, 'rolePosition']);

    // Department CRUD API
    Route::get('/departments', [DepartmentController::class, 'index']);
    Route::post('/departments', [DepartmentController::class, 'store']);
    Route::get('/departments/{id}', [DepartmentController::class, 'show']);
    Route::put('/departments/{id}', [DepartmentController::class, 'update']);
    Route::delete('/departments/{id}', [DepartmentController::class, 'destroy']);
    Route::post('/departments/{id}/toggle-status', [DepartmentController::class, 'toggleStatus']);
    Route::get('/departments/active/list', [DepartmentController::class, 'getActiveDepartments']);
    Route::get('/departments/test/{id?}', [DepartmentController::class, 'testDepartment']);

    // Designation CRUD API
    Route::get('/designations', [DesignationController::class, 'index']);
    Route::post('/designations', [DesignationController::class, 'store']);
    Route::get('/designations/{id}', [DesignationController::class, 'show']);
    Route::put('/designations/{id}', [DesignationController::class, 'update']);
    Route::delete('/designations/{id}', [DesignationController::class, 'destroy']);
    
    // Messages (SMS templates) CRUD API
    Route::get('/messages', [\App\Http\Controllers\MessageController::class, 'index']);
    Route::post('/messages', [\App\Http\Controllers\MessageController::class, 'store']);
    Route::get('/messages/{id}', [\App\Http\Controllers\MessageController::class, 'show']);
    Route::put('/messages/{id}', [\App\Http\Controllers\MessageController::class, 'update']);
    Route::delete('/messages/{id}', [\App\Http\Controllers\MessageController::class, 'destroy']);
    
    // Message Types CRUD API (message_type table)
    Route::get('/message-types-data', [\App\Http\Controllers\MessageTypeController::class, 'index']);
    Route::post('/message-types', [\App\Http\Controllers\MessageTypeController::class, 'store']);
    Route::get('/message-types/{id}', [\App\Http\Controllers\MessageTypeController::class, 'show']);
    Route::put('/message-types/{id}', [\App\Http\Controllers\MessageTypeController::class, 'update']);
    Route::delete('/message-types/{id}', [\App\Http\Controllers\MessageTypeController::class, 'destroy']);

    // Employee CRUD API
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::get('/employees/{employee}', [EmployeeController::class, 'show']);
    Route::put('/employees/{employee}', [EmployeeController::class, 'update']);
    Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy']);
    Route::post('/employees/{employee}/status', [EmployeeController::class, 'updateStatus']);
    Route::get('/employees/dropdown/data', [EmployeeController::class, 'getDropdownData']);
    Route::get('/employees/search/query', [EmployeeController::class, 'search']);

    // MAIN Module CRUD API
    Route::get('/main-modules', [MainModuleController::class, 'index']);
    Route::post('/main-modules', [MainModuleController::class, 'store']);
    Route::get('/main-modules/{id}', [MainModuleController::class, 'show']);
    Route::put('/main-modules/{id}', [MainModuleController::class, 'update']);
    Route::delete('/main-modules/{id}', [MainModuleController::class, 'destroy']);

    // Module CRUD API
    Route::get('/modules', [ModuleController::class, 'index']);
    Route::post('/modules', [ModuleController::class, 'store']);
    Route::get('/modules/{id}', [ModuleController::class, 'show']);
    Route::put('/modules/{id}', [ModuleController::class, 'update']);
    Route::delete('/modules/{id}', [ModuleController::class, 'destroy']);
    Route::post('/modules/update-order', [ModuleController::class, 'updateOrder']);
    Route::get('/modules/by-main-module/{mainModuleId}', [ModuleController::class, 'getByMainModule']);

    // Module Permission CRUD API
    Route::get('/module-permissions', [ModulePermissionController::class, 'index']);
    Route::post('/module-permissions', [ModulePermissionController::class, 'store']);
    Route::get('/module-permissions/{id}', [ModulePermissionController::class, 'show']);
    Route::put('/module-permissions/{id}', [ModulePermissionController::class, 'update']);
    Route::delete('/module-permissions/{id}', [ModulePermissionController::class, 'destroy']);

    // Role Module Permission CRUD API
    Route::get('/role-module-permissions', [RoleModulePermissionController::class, 'index']);
    Route::post('/role-module-permissions', [RoleModulePermissionController::class, 'store']);
    Route::get('/role-module-permissions/{id}', [RoleModulePermissionController::class, 'show']);
    Route::put('/role-module-permissions/{id}', [RoleModulePermissionController::class, 'update']);
    Route::delete('/role-module-permissions/{id}', [RoleModulePermissionController::class, 'destroy']);
    Route::post('/role-module-permissions/delete-all', [RoleModulePermissionController::class, 'deleteAll']);

    // Role Module Commission CRUD API
    Route::get('/role-module-commissions', [RoleModuleCommissionController::class, 'index']);
    Route::post('/role-module-commissions', [RoleModuleCommissionController::class, 'store']);
    Route::post('/role-module-commissions/delete-all', [RoleModuleCommissionController::class, 'deleteAll']);
    Route::get('/role-module-commissions/{id}', [RoleModuleCommissionController::class, 'show']);
    Route::put('/role-module-commissions/{id}', [RoleModuleCommissionController::class, 'update']);
    Route::delete('/role-module-commissions/{id}', [RoleModuleCommissionController::class, 'destroy']);

    // Sub Module CRUD API
    Route::get('/sub_modules', [SubModuleController::class, 'index']);
    Route::post('/sub_modules', [SubModuleController::class, 'store']);
    Route::get('/sub_modules/{id}', [SubModuleController::class, 'show']);
    Route::put('/sub_modules/{id}', [SubModuleController::class, 'update']);
    Route::delete('/sub_modules/{id}', [SubModuleController::class, 'destroy']);
    Route::get('/sub-modules', [SubModuleController::class, 'allSubModules']);
    Route::get('/sub_modules_by_id', [SubModuleController::class, 'getByModule']);
    Route::get('/modules/{moduleId}/sub-modules', [SubModuleController::class, 'getByModuleId']);

    // Get permissions by sub module id (RESTful style)
    Route::get('/sub-modules/{subModuleId}/permissions', [ModulePermissionController::class, 'getBySubModuleId']);

    // User Role Permission API Resource
    Route::apiResource('user-role-permissions', App\Http\Controllers\UserRolePermissionController::class);
    Route::post('/user-role-permissions/delete-all', [App\Http\Controllers\UserRolePermissionController::class, 'deleteAll']);
    Route::post('/user-role-permissions/assign-to-all', [App\Http\Controllers\UserRolePermissionController::class, 'assignToAllUsers']);
    Route::post('/user-role-permissions/permissions', [\App\Http\Controllers\UserRolePermissionController::class, 'userPermissions']);
    
    // User Role Commission API Resource
    Route::apiResource('user-role-commissions', App\Http\Controllers\UserRoleCommissionController::class);
    Route::get('user-role-commissions-delete-all', [App\Http\Controllers\UserRoleCommissionController::class, 'deleteAll']);
    Route::post('/user-role-commissions/assign-to-all', [App\Http\Controllers\UserRoleCommissionController::class, 'assignToAllUsers']);
    Route::post('/user-role-commissions/commissions', [App\Http\Controllers\UserRoleCommissionController::class, 'commissions']);

    // UserRolePermission custom API
    Route::get('/user-modules', [\App\Http\Controllers\UserRolePermissionController::class, 'userModules']);

    // Module tree API for all modules, submodules, permissions
    Route::get('/module-tree', [\App\Http\Controllers\UserRolePermissionController::class, 'moduleTree']);
    Route::get('/module-tree-commissions', [\App\Http\Controllers\UserRoleCommissionController::class, 'moduleTree']);

    // Module Commission API Resource
    Route::apiResource('module-commissions', App\Http\Controllers\ModuleCommissionController::class);

    // Role Module Commission API Resource
    Route::apiResource('role-module-commission', RoleModuleCommissionController::class);

    Route::get('/user_role_commissions', [UserRoleCommissionController::class, 'index']);
    Route::post('/user_role_commissions', [UserRoleCommissionController::class, 'store']);
    Route::get('/user_role_commissions/{id}', [UserRoleCommissionController::class, 'show']);
    Route::put('/user_role_commissions/{id}', [UserRoleCommissionController::class, 'update']);
    Route::delete('/user_role_commissions/{id}', [UserRoleCommissionController::class, 'destroy']);

    Route::get('/subscriptions', [SubscriptionController::class, 'index']);

    // Subscription Master CRUD
    Route::get('/subscription-masters', [App\Http\Controllers\Api\SubscriptionController::class, 'indexMaster']);
    Route::post('/subscription-masters', [App\Http\Controllers\Api\SubscriptionController::class, 'storeMaster']);
    Route::post('/user-subscribe', [App\Http\Controllers\Api\SubscriptionController::class, 'userSubscribe']);
    Route::post('/subscription/set-mpin', [App\Http\Controllers\Api\SubscriptionController::class, 'setWalletMpin']);
    Route::get('/subscription-masters/{id}', [App\Http\Controllers\Api\SubscriptionController::class, 'showMaster']);
    Route::put('/subscription-masters/{id}', [App\Http\Controllers\Api\SubscriptionController::class, 'updateMaster']);
    Route::delete('/subscription-masters/{id}', [App\Http\Controllers\Api\SubscriptionController::class, 'destroyMaster']);

    // Role Subscription CRUD
    Route::get('/role-subscription', [RoleSubscriptionController::class, 'index']);
    Route::post('/role-subscription', [RoleSubscriptionController::class, 'store']);
    Route::get('/role-subscription/{roleId}', [RoleSubscriptionController::class, 'getRoleSubscriptions']);
    Route::put('/role-subscription/{id}', [RoleSubscriptionController::class, 'update']);
    Route::delete('/role-subscription/{id}', [RoleSubscriptionController::class, 'destroy']);

    // Settings CRUD API
    Route::get('/settings', [SettingController::class, 'index']);
    Route::post('/settings', [SettingController::class, 'store']);
    Route::get('/settings/{setting}', [SettingController::class, 'show']);
    Route::put('/settings/{setting}', [SettingController::class, 'update']);
    Route::post('/settings/{setting}', [SettingController::class, 'update']); // For method spoofing with file uploads
    Route::delete('/settings/{setting}', [SettingController::class, 'destroy']);
    Route::get('/public-settings', [SettingController::class, 'getPublicSettings']);

    // Attendance CRUD API
    Route::get('/attendance', [AttendanceController::class, 'index']);
    Route::get('/attendance/{id}', [AttendanceController::class, 'show']);
    Route::put('/attendance/{id}', [AttendanceController::class, 'update']);
    Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);
    Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']);
    Route::get('/attendance/today-status', [AttendanceController::class, 'todayStatus']);
    Route::get('/attendance/employees', [AttendanceController::class, 'getEmployees']);

    // Leave Management CRUD API
    Route::get('/leaves', [LeaveController::class, 'index']);
    Route::post('/leaves', [LeaveController::class, 'store']);
    Route::get('/leaves/{id}', [LeaveController::class, 'show']);
    Route::put('/leaves/{id}', [LeaveController::class, 'update']);
    Route::delete('/leaves/{id}', [LeaveController::class, 'destroy']);
    // Employee's own leaves
    Route::get('/my-leaves', [LeaveController::class, 'myLeaves']);

    // Payroll System
    Route::post('/payroll/setup', [PayrollController::class, 'setup']);
    Route::get('/payroll/list', [PayrollController::class, 'list']);
    Route::get('/payroll/view/{id}', [PayrollController::class, 'view']);
    Route::post('/payroll/update/{id}', [PayrollController::class, 'update']);
    Route::get('/payroll/employees', [PayrollController::class, 'employees']);
    Route::post('/salary/generate', [SalaryController::class, 'generate']);
    Route::post('/salary/bulk-generate', [SalaryController::class, 'bulkGenerate']);
    Route::post('/salary/pay', [SalaryController::class, 'pay']);
    Route::get('/salary/list', [SalaryController::class, 'list']);
    Route::post('/salary/check-payment-status', [SalaryController::class, 'checkPaymentStatus']);
    Route::get('/payslip/list', [PayslipController::class, 'index']);
    Route::get('/payslip/view/{id}', [PayslipController::class, 'view']);
    Route::get('/payslip/download/{id}', [PayslipController::class, 'download']);

    // KYC Routes
    Route::get('/kyc/status', [KycController::class, 'getKycStatus']);
    Route::post('/kyc/aadhaar/send-otp', [KycController::class, 'sendAadhaarOtp']);
    Route::post('/kyc/aadhaar/verify-otp', [KycController::class, 'verifyAadhaarOtp']);
    Route::post('/kyc/pan/verify', [KycController::class, 'verifyPan']);
    Route::post('/kyc/bank/verify', [KycController::class, 'verifyBankAccount']);
    Route::post('/kyc/corporate', [KycController::class, 'updateCorporateKyc']);
    Route::get('/kyc/details/{userId}', [KycController::class, 'getKycDetails']);

    // Manual KYC - Gorter API helpers (Mode 2: fetch without saving)
    Route::post('/kyc/helper/aadhaar/send-otp', [KycController::class, 'helperVerifyAadhaar']);
    Route::post('/kyc/helper/aadhaar/verify-otp', [KycController::class, 'helperVerifyAadhaarOtp']);
    Route::post('/kyc/helper/pan', [KycController::class, 'helperVerifyPan']);
    Route::post('/kyc/helper/bank', [KycController::class, 'helperVerifyBankAccount']);

    // Manual KYC - Save (Mode 2 & 3: save form data with auto-generated JSON)
    Route::post('/kyc/manual/aadhaar', [KycController::class, 'manualSaveAadhaar']);
    Route::post('/kyc/manual/pan', [KycController::class, 'manualSavePan']);
    Route::post('/kyc/manual/bank', [KycController::class, 'manualSaveBank']);

    // Note: DigiLocker routes moved outside this group (see top of file)

    
    // Account Management Routes
    Route::prefix('accounts')->group(function () {
        Route::get('/root-accounts', [AccountController::class, 'rootWiseAccounts']);

        Route::post('/self-transfer', [AccountController::class, 'selfTransfer']);
        
        Route::post('/passbook/transaction', [AccountController::class, 'transaction']);
        
        // Primary account management routes (Must be before /{id})
        Route::get('/primary', [AccountController::class, 'getPrimary']);
        
        Route::put('/{id}/set-primary', [AccountController::class, 'setPrimary']);
        Route::put('/{id}/remove-primary', [AccountController::class, 'removePrimary']);
        Route::put('/{id}/toggle-primary', [AccountController::class, 'togglePrimary']);

        Route::get('/', [AccountController::class, 'index']);
        Route::post('/', [AccountController::class, 'store']);
        Route::get('/{id}', [AccountController::class, 'show']);
        Route::put('/{id}/status', [AccountController::class, 'updateStatus']);
        Route::post('/update-mpin', [AccountController::class, 'updateMpin']);
        

        // Balance related routes
        Route::get('/balance', [BalanceController::class, 'getBalance']);
        Route::get('/balance/all', [BalanceController::class, 'getAllBalances']);
        Route::get('/balance/middleware', [BalanceController::class, 'getBalanceViaMiddleware']);
        Route::post('/balance/check', [BalanceController::class, 'checkSufficientBalance']);
        
        // MPIN validation routes
        Route::post('/mpin/validate', [BalanceController::class, 'validateMpin']);
        Route::post('/transaction/validate', [BalanceController::class, 'validateTransaction']);
        Route::post('/global/validate', [BalanceController::class, 'globalValidateTransaction']);
        
    });

    // VA (Virtual Account) Routes
    Route::post('/va/generate-qr', [VaController::class, 'generateQr']);
    
    
    Route::get('/qr-details', [VaController::class, 'index']);
    Route::apiResource('va', VaController::class);

    // Passbook Management Routes
    Route::prefix('passbook')->group(function () {
        Route::post('/transaction', [PassbookController::class, 'createTransaction']);
        Route::get('/transactions', [PassbookController::class, 'transactions']);
        Route::get('/account/{accountId}/transactions', [PassbookController::class, 'getTransactions']);
        Route::get('/account/{accountId}/last-transaction', [PassbookController::class, 'getLastTransaction']);
        Route::get('/account/{accountId}/statement', [PassbookController::class, 'getStatement']);
    });

    Route::get('/check_aeps_commission', [MerchantController::class, 'checkAepsCommission']);
    Route::post('/getaepshistory', [MerchantController::class, 'getaepshistory']);
    Route::get('/beneaccount', [BeneficiaryController::class, 'beneaccount']);
    Route::get('/movetoaccounts', [BeneficiaryController::class, 'movetoaccounts']);

    Route::get('/banking/reports', [AccountController::class, 'reports']);
    Route::get('/banking/{id}/passbook', [AccountController::class, 'userPassbook']);
    Route::get('/banking/{id}/beneficiaries', [AccountController::class, 'userBeneficiaries']);
    Route::get('/banking/payout-request', [AccountController::class, 'payoutRequest']);
    Route::put('/banking/payout/{id}/status', [AccountController::class, 'updatePayoutStatus']);
    Route::get('/banking/download-aeps-cw-txns', [AccountController::class, 'downloadAepsCwTxns']);
    Route::get('/banking/summary', [AccountController::class, 'summary']);
    Route::get('/banking/summary/export', [AccountController::class, 'exportSummary']);
    Route::get('/banking/payouts/export', [AccountController::class, 'exportPayouts']);
    // Banking and Utility Routes
    Route::prefix('v2')->group(function () {
        

        Route::post('/banking-send-otp', [AccountController::class, 'sendOtp']);
        Route::post('/banking-verify-otp', [AccountController::class, 'verifyOtp']);
       
        Route::post('/mobile-plan', [UtilityController::class, 'mobilePlan'])->defaults('smodule', 2);
        Route::post('/mobile-recharge', [UtilityController::class, 'processRecharge'])->defaults('smodule', 2);
        Route::post('/getOperator', [UtilityController::class, 'getOperator']);
        Route::post('/getCircles', [UtilityController::class, 'getCircles']);
        Route::get('/getCircles', [UtilityController::class, 'getCircles']);

        Route::post('/generate-qr', [VaController::class, 'generateQr']);

        Route::post('/cmsLogin', [CMSController::class, 'cmsLogin']);
        Route::get('/cmsHistory', [CMSController::class, 'cmsHistory']);
        // Bill payment routes
        Route::get('/bill-categories', [UtilityController::class, 'getBillCategories'])->defaults('smodule', 3);
        Route::post('/billers-by-category', [UtilityController::class, 'getBillersByCategory'])->defaults('smodule', 3);
        Route::post('/fetch-bill', [UtilityController::class, 'fetchBill'])->defaults('smodule', 3);
        Route::post('/bill-payment', [UtilityController::class, 'processRecharge'])->defaults('smodule', 3);
        Route::post('/bill-status', [UtilityController::class, 'checkStatus']);
        Route::get('/payouts', [BeneficiaryController::class, 'payouts']);
        Route::get('/money-transfer', [BeneficiaryController::class, 'MoneyTransfer']);
        Route::post('/cibil-check', [UtilityController::class, 'cibilCheck']);
        Route::get('/cibil-check-list', [UtilityController::class, 'cibilCheckList']);

        Route::prefix('beneficiaries')->group(function () {
            Route::get('/', [BeneficiaryController::class, 'index']);
            Route::post('/', [BeneficiaryController::class, 'store']);
            Route::post('/create', [BeneficiaryController::class, 'createBeneficiary']);
            Route::post('/get-beneficiary-otp', [BeneficiaryController::class, 'getBeneficiaryOtp']);
            Route::post('/otp-verify-beneficiary', [BeneficiaryController::class, 'verifyBeneficiary']);
            Route::post('/beneficiary-payout', [BeneficiaryController::class, 'beneficiaryPayment1']);
            Route::post('/merchant-payout', [BeneficiaryController::class, 'merchantPayment']);
            Route::post('/move-to', [BeneficiaryController::class, 'MoveTo']);
            Route::get('/{id}', [BeneficiaryController::class, 'show']);
            Route::delete('/{id}', [BeneficiaryController::class, 'destroy']);
            Route::post('/send-otp', [BeneficiaryController::class, 'sendOtp']);
            Route::post('/beneficiary-payment', [BeneficiaryController::class, 'beneficiaryPayment']);
            Route::get('/beneficiary-transactions/{id}', [BeneficiaryController::class, 'beneficiaryTransaction']);
            Route::get('/user-payout-history/{userId}', [BeneficiaryController::class, 'userPayoutHistory']);
        });

        Route::post('/matm-config', [CallbackController::class, 'matmConfig']);
        Route::post('/matm-request', [CallbackController::class, 'matmRequest']);
        
        
        Route::post('/manualPerform3WayMATM', [MerchantController::class, 'manualPerform3WayMATM']);

        Route::prefix('aeps')->group(function () {
            Route::get('/state-list', [MerchantController::class, 'aepsStateList'])->defaults('smodule', 1);
            Route::post('/draft', [MerchantController::class, 'aepsDraft'])->defaults('smodule', 1);
            Route::post('/draft-data', [MerchantController::class, 'aepsDraftData']);
            Route::post('/send-mobile-otp', [MerchantController::class, 'sendMobileOtp']);
            Route::post('/verify-mobile-otp', [MerchantController::class, 'verifyMobileOtp']);
            Route::post('/send-email-otp', [MerchantController::class, 'sendEmailOtp']);
            Route::post('/verify-email-otp', [MerchantController::class, 'verifyEmailOtp']);
            Route::post('/send-aadhaar-otp', [MerchantController::class, 'sendAadhaarOtp']);
            Route::post('/verify-aadhaar-otp', [MerchantController::class, 'verifyAadhaarOtp']);
            Route::post('/verify-pan', [MerchantController::class, 'verifyPan']);
            Route::post('/verify-bank-account', [MerchantController::class, 'verifyBankAccount']);
            Route::post('/onboard', [MerchantController::class, 'aepsOnboard']);
            Route::post('/get-otp', [MerchantController::class, 'doKyc']);
            Route::post('/verify-otp', [MerchantController::class, 'verifyOtp']);
            Route::post('/biometric-ekyc', [MerchantController::class, 'biometricEkyc']);
            Route::post('/change-device', [MerchantController::class, 'changeDevice']);
            Route::post('/2fa', [MerchantController::class, 'twoFA'])->defaults('smodule', 1);
            Route::post('/doAeps', [MerchantController::class, 'doAeps']);
            Route::post('/send-aeps-otp', [MerchantController::class, 'sendAepsOtp']);

            Route::post('/aeps-history', [MerchantController::class, 'aepsHistory']);
            Route::get('/aeps-history', [MerchantController::class, 'aepsHistory']);
            Route::post('/aeps-shop-list', [MerchantController::class, 'aepsShopList']);
            Route::get('/aeps-shop-list', [MerchantController::class, 'aepsShopList']);
            Route::get('/cmsKeys', [MerchantController::class, 'cmsKeys']);
            
            // Hierarchical filter APIs
            Route::get('/filter-hierarchy', [MerchantController::class, 'aepsFilterHierarchy']);
            Route::post('/filter-hierarchy', [MerchantController::class, 'aepsFilterHierarchy']);
            Route::post('/roles-by-user', [MerchantController::class, 'aepsRolesByUser']);
            Route::post('/users-by-role', [MerchantController::class, 'aepsUsersByRole']);
            Route::post('/shops-by-hierarchy', [MerchantController::class, 'aepsShopsByHierarchy']);
            Route::post('/bank-list', [MerchantController::class, 'bankList']);
            Route::get('/kyc', [MerchantController::class, 'userKyc']);
            Route::get('/get-all-admins', [MerchantController::class, 'getAllAdmins']);
            Route::get('/create-missing-wallets', [AccountController::class, 'createMissingWallets']);

           
            
            // Video KYC Upload Routes
            Route::post('/generate-upload-token', [MerchantController::class, 'generateVideoUploadToken']);
            Route::post('/upload-shop-image', [MerchantController::class, 'uploadShopImage']);
            Route::post('/upload-video-kyc', [MerchantController::class, 'uploadVideoKyc']);
            
            // Device Evidence Logging (silent, background)
            Route::post('/save-device-used', [MerchantController::class, 'saveDeviceUsed']);
            
            // Video KYC Management Routes (Admin)
            Route::prefix('video-kyc')->group(function () {
                Route::get('/pending-list', [AepsVideoKycController::class, 'pendingList']);
                Route::get('/verified-list', [AepsVideoKycController::class, 'verifiedList']);
                Route::get('/old-list', [AepsVideoKycController::class, 'oldList']);
                Route::get('/details/{id}', [AepsVideoKycController::class, 'getDraftDetails']);
                Route::post('/toggle-status/{id}', [AepsVideoKycController::class, 'toggleVideoKycStatus']);
                Route::post('/reject/{id}', [AepsVideoKycController::class, 'rejectVideoKyc']);
                Route::get('/rejected-list', [AepsVideoKycController::class, 'rejectedList']);
                Route::post('/update-url/{id}', [AepsVideoKycController::class, 'updateMediaUrl']); // Direct Bunny upload from frontend
                Route::post('/update-details/{id}', [AepsVideoKycController::class, 'updateEditableFields']); // Edit shop_name, shop_address, email
            });
        });

        Route::prefix('verify')->group(function () {
            Route::post('/aadhar-send-otp', [VerificationController::class, 'sendAadhaarOtp']);
            Route::post('/aadhaar-verify-otp', [VerificationController::class, 'verifyAadhaarOtp']);
            Route::post('/pan', [VerificationController::class, 'verifyPan']);
            Route::post('/bank-account', [VerificationController::class, 'verifyBankAccount']);
            Route::post('/ifsc', [VerificationController::class, 'verifyIfscCode']);
        });

        Route::prefix('cash-deposit')->group(function () {
            Route::post('/bank-list', [CashDepositController::class, 'bankList']);
            Route::post('/process', [CashDepositController::class, 'doDeposit']);
            Route::post('/history', [CashDepositController::class, 'cashDepositHistory']);
        });

        Route::prefix('card-download')->group(function () {
            Route::post('/download', [CardDownloadController::class, 'downloadCard']);
            Route::post('/aadhaar-send-otp', [CardDownloadController::class, 'aadhaarSendOtp']);
            Route::post('/aadhaar-verify', [CardDownloadController::class, 'aadhaarVerifyAndDownload']);
            Route::get('/my-downloads', [CardDownloadController::class, 'myDownloads']);
            Route::get('/receipt/{id}', [CardDownloadController::class, 'receipt']);
        });


    });

    Route::prefix('p2p')->group(function () {
        Route::post('/find-contact', [P2pController::class, 'findContact']);
        Route::post('/save-contact', [P2pController::class, 'saveContact']);
        Route::post('/mobile-transfer', [P2pController::class, 'mobileTransfer']);
        Route::get('/recent-txn-contact', [P2pController::class, 'recentTxnContact']);
        Route::post('/mobile-transfer-history', [P2pController::class, 'mobileTransferHistory']);
    });

    Route::post('/mobile-recharge-report', [UtilityController::class, 'mobileRechargeReport']);
    Route::post('/recharge/status', [UtilityController::class, 'checkStatus']);
    Route::get('/recharge/status', [UtilityController::class, 'checkStatus']);
    Route::post('/recharge-status', [UtilityController::class, 'checkStatus']);

    // BBPS Category Management CRUD Routes
    Route::prefix('bbps-categories')->group(function () {
        Route::get('/', [BbpsCategoryController::class, 'index']);
        Route::post('/', [BbpsCategoryController::class, 'store']);
        Route::get('/{id}', [BbpsCategoryController::class, 'show']);
        Route::put('/{id}', [BbpsCategoryController::class, 'update']);
        Route::post('/{id}', [BbpsCategoryController::class, 'update']);
        Route::delete('/{id}', [BbpsCategoryController::class, 'destroy']);
    });

    // Utility Circle Management CRUD Routes
    Route::prefix('utility-circles')->group(function () {
        Route::get('/', [UtilityCircleController::class, 'index']);
        Route::post('/', [UtilityCircleController::class, 'store']);
        Route::get('/{id}', [UtilityCircleController::class, 'show']);
        Route::put('/{id}', [UtilityCircleController::class, 'update']);
        Route::post('/{id}', [UtilityCircleController::class, 'update']);
        Route::delete('/{id}', [UtilityCircleController::class, 'destroy']);
        Route::post('/{id}/toggle-status', [UtilityCircleController::class, 'toggleStatus']);
    });

    // Recharge / Utility Operator Management CRUD Routes (connected to utility_operators table)
    Route::prefix('recharge/operators')->group(function () {
        Route::get('/', [RechargeOperatorController::class, 'index']);
        Route::post('/', [RechargeOperatorController::class, 'store']);
        Route::get('/{id}', [RechargeOperatorController::class, 'show']);
        Route::post('/{id}', [RechargeOperatorController::class, 'update']);
        Route::put('/{id}', [RechargeOperatorController::class, 'update']);
        Route::delete('/{id}', [RechargeOperatorController::class, 'destroy']);
        Route::post('/{id}/toggle-status', [RechargeOperatorController::class, 'toggleStatus']);
    });

    Route::prefix('utility-operators')->group(function () {
        Route::get('/', [RechargeOperatorController::class, 'index']);
        Route::post('/', [RechargeOperatorController::class, 'store']);
        Route::get('/{id}', [RechargeOperatorController::class, 'show']);
        Route::post('/{id}', [RechargeOperatorController::class, 'update']);
        Route::put('/{id}', [RechargeOperatorController::class, 'update']);
        Route::delete('/{id}', [RechargeOperatorController::class, 'destroy']);
        Route::post('/{id}/toggle-status', [RechargeOperatorController::class, 'toggleStatus']);
    });

    // API Setting Master Routes
    Route::prefix('api-settings')->group(function () {
        Route::get('/', [ApiSettingController::class, 'index']);
        Route::post('/', [ApiSettingController::class, 'store']);
        Route::post('/fetch-test-response', [ApiSettingController::class, 'fetchTestResponse']);
        Route::get('/{id}', [ApiSettingController::class, 'show']);
        Route::post('/{id}', [ApiSettingController::class, 'update']);
        Route::put('/{id}', [ApiSettingController::class, 'update']);
        Route::delete('/{id}', [ApiSettingController::class, 'destroy']);
    });

    // Service Wise API Settings Routes
    Route::get('/api-service-settings', [ApiServiceSettingController::class, 'index']);
    Route::post('/api-service-settings', [ApiServiceSettingController::class, 'store']);

    // Pending API Settings Routes
    Route::get('/service-categories', [ApiPendingSettingController::class, 'getServiceCategories']);
    Route::get('/utility-circles', [ApiPendingSettingController::class, 'getUtilityCircles']);
    Route::post('/api-settings/{id}/circle', [ApiPendingSettingController::class, 'updateApiCircle']);
    Route::get('/api-pending-settings', [ApiPendingSettingController::class, 'getPendingSettings']);
    Route::post('/api-pending-settings', [ApiPendingSettingController::class, 'savePendingSettings']);
    Route::post('/api-pending-settings/reset', [ApiPendingSettingController::class, 'resetPendingSettings']);

    // Special API Settings Routes
    Route::prefix('api-special-settings')->group(function () {
        Route::get('/', [ApiPendingSettingController::class, 'getSpecialSettings']);
        Route::post('/', [ApiPendingSettingController::class, 'storeSpecialSetting']);
        Route::put('/{id}', [ApiPendingSettingController::class, 'updateSpecialSetting']);
        Route::delete('/{id}', [ApiPendingSettingController::class, 'destroySpecialSetting']);
        Route::post('/{id}/toggle-status', [ApiPendingSettingController::class, 'toggleSpecialSettingStatus']);
    });

    // Operator Mapping Routes
    Route::prefix('operator-mappings')->group(function () {
        Route::get('/options', [OperatorMappingController::class, 'getOptions']);
        Route::get('/operators', [OperatorMappingController::class, 'getOperators']);
        Route::post('/save', [OperatorMappingController::class, 'saveMappings']);
    });

    // Commission Master Routes
    Route::prefix('commission-master')->group(function () {
        // Packages
        Route::get('/packages', [\App\Http\Controllers\Banking\CommissionMasterController::class, 'getPackages']);
        Route::get('/category-operators', [\App\Http\Controllers\Banking\CommissionMasterController::class, 'getCategoryOperators']);
        Route::post('/packages', [\App\Http\Controllers\Banking\CommissionMasterController::class, 'storePackage']);
        Route::get('/packages/{id}', [\App\Http\Controllers\Banking\CommissionMasterController::class, 'showPackage']);
        Route::put('/packages/{id}', [\App\Http\Controllers\Banking\CommissionMasterController::class, 'updatePackage']);
        Route::delete('/packages/{id}', [\App\Http\Controllers\Banking\CommissionMasterController::class, 'destroyPackage']);
        Route::post('/packages/{id}/toggle-status', [\App\Http\Controllers\Banking\CommissionMasterController::class, 'togglePackageStatus']);

        // Assignments
        Route::get('/assignments', [\App\Http\Controllers\Banking\CommissionMasterController::class, 'getAssignments']);
        Route::post('/assignments/role', [\App\Http\Controllers\Banking\CommissionMasterController::class, 'assignPackageToRole']);
        Route::post('/assignments/user', [\App\Http\Controllers\Banking\CommissionMasterController::class, 'assignPackageToUser']);
        Route::delete('/assignments/{id}', [\App\Http\Controllers\Banking\CommissionMasterController::class, 'destroyAssignment']);
        Route::get('/roles', [\App\Http\Controllers\Banking\CommissionMasterController::class, 'getRoles']);
        Route::get('/users/search', [\App\Http\Controllers\Banking\CommissionMasterController::class, 'searchUsers']);

        // Special Offers
        Route::get('/special-offers', [\App\Http\Controllers\Banking\CommissionMasterController::class, 'getSpecialOffers']);
        Route::post('/special-offers', [\App\Http\Controllers\Banking\CommissionMasterController::class, 'storeSpecialOffer']);
        Route::put('/special-offers/{id}', [\App\Http\Controllers\Banking\CommissionMasterController::class, 'updateSpecialOffer']);
        Route::delete('/special-offers/{id}', [\App\Http\Controllers\Banking\CommissionMasterController::class, 'destroySpecialOffer']);
        Route::post('/special-offers/{id}/toggle-status', [\App\Http\Controllers\Banking\CommissionMasterController::class, 'toggleSpecialOfferStatus']);
        
        // User My Commission Structure Report API
        Route::get('/my-structure', [\App\Http\Controllers\Banking\CommissionMasterController::class, 'getMyCommissionStructure']);
    });
    Route::get('/my-commission-structure', [\App\Http\Controllers\Banking\CommissionMasterController::class, 'getMyCommissionStructure']);
    Route::get('/user/my-commission-structure', [\App\Http\Controllers\Banking\CommissionMasterController::class, 'getMyCommissionStructure']);
    Route::post('/mobile-recharge-report-app', [UtilityController::class, 'mobileRechargeReportApp']);
    Route::post('/recent-recharge', [UtilityController::class, 'recentRecharge']);
    Route::get('/bill-payment-report', [UtilityController::class, 'billPaymentReport']);
    Route::post('/register-bbps-complain', [UtilityController::class, 'registerBbpsComplain']);
    Route::post('/track-bbps-complain', [UtilityController::class, 'trackBbpsComplain']);
    Route::get('/get-bbps-complaints', [UtilityController::class, 'getBbpsComplaints']);
    Route::post('/get-bbps-complaints', [UtilityController::class, 'getBbpsComplaints']);
    Route::post('/update-bbps-complain-status', [UtilityController::class, 'updateBbpsComplainStatus']);

    // BunnyCDN Config Route for direct client uploads
    Route::get('/bunny/config', function () {
        $region = trim(config('services.bunny_storage.region') ?? '');
        $regionPrefix = !empty($region) ? rtrim($region, '.') . '.' : '';
        $storageZone = trim(config('services.bunny_storage.storage_zone') ?? '');

        return response()->json([
            'status' => 1,
            'message' => 'Bunny config retrieved successfully',
            'data' => [
                'storage_zone' => $storageZone,
                'api_key'      => config('services.bunny_storage.api_key'),
                'cdn_hostname' => config('services.bunny_storage.cdn_hostname'),
                'region'       => $region,
                'upload_url'   => "https://{$regionPrefix}storage.bunnycdn.com/{$storageZone}"
            ]
        ]);
    });
    
    Route::get('/change2fa', [MerchantController::class, 'changeTwoFa']);
    Route::get('/banners', [MerchantController::class, 'banners']);
    Route::get('/referrals', [MerchantController::class, 'referrals']);
    Route::get('/referral-user-dashboard', [MerchantController::class, 'referralUserDashboard']);

    // Beneficiary Management Routes
   
    Route::post('/banking-send-otp', [AccountController::class, 'sendOtp']);
    Route::post('/banking-verify-otp', [AccountController::class, 'verifyOtp']);
    Route::match(['get', 'post'],'/add-money/request', [AccountController::class, 'upiRequest']);
    Route::post('/pg/request', [AccountController::class, 'upiRequests']);
    Route::match(['get', 'post'], '/pg/transaction', [AccountController::class, 'getPGTransaction']);
    Route::post('/pg/verify', [AccountController::class, 'pgVerify']);
    
    Route::post('/add-money/verify', [AccountController::class, 'addFundReceipt']);
    Route::post('/add-money/history', [AccountController::class, 'addFundHistory']);
    Route::post('/upi/verify', [AccountController::class, 'upiVerify']);
    Route::post('/upi/transfer', [P2pController::class, 'upiTransfer']);

    Route::get('/upi-list', [AccountController::class, 'upiList']);
    Route::get('/qr-generate/{upiId}', [AccountController::class, 'qrGenerate12']);
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Complaint Management Routes
    Route::prefix('complaints')->group(function () {
        Route::get('/dashboard', [ComplaintController::class, 'dashboard']);
        Route::get('/workload-report', [ComplaintController::class, 'workloadReport']);
        Route::get('/', [ComplaintController::class, 'index']);
        Route::post('/', [ComplaintController::class, 'store']);
        Route::get('/{id}', [ComplaintController::class, 'show']);
        Route::put('/{id}/status', [ComplaintController::class, 'updateStatus']);
        Route::put('/{id}/assign', [ComplaintController::class, 'assign']);
        Route::post('/{id}/comments', [ComplaintController::class, 'addComment']);
        Route::post('/{id}/send-message', [ComplaintController::class, 'sendHelpDeskMessage']);
        Route::post('/{id}/link-message', [ComplaintController::class, 'linkChatMessage']);
    });

    // Chat System Routes
    Route::prefix('chat')->group(function () {
        // Thread management
        Route::get('/threads', [ChatController::class, 'threads']);
        Route::post('/threads', [ChatController::class, 'createThread']);
        Route::post('/support-threads', [ChatController::class, 'createSupportThread']);
        Route::post('/groups', [ChatController::class, 'createGroupChat']);
        Route::get('/threads/{id}/messages', [ChatController::class, 'messages']);
        
        // Message operations
        Route::post('/messages', [ChatController::class, 'sendMessage']);
        Route::post('/messages/{id}/read', [ChatController::class, 'markRead']);
        Route::post('/send-attachment', [ChatController::class, 'sendAttachment']);
        
        // File upload operations
        Route::post('/upload', [ChatController::class, 'uploadMedia']);
        Route::post('/upload-media', [ChatController::class, 'uploadMediaAdvanced']);
        Route::post('/upload-chunk', [ChatController::class, 'uploadChunk']);
        Route::post('/finalize-upload', [ChatController::class, 'finalizeUpload']);
        
        // User status and profile
        Route::get('/user-status', [ChatController::class, 'getUserStatus']);
        Route::get('/user-profile', [ChatController::class, 'getUserProfile']);
        Route::post('/offline', [ChatController::class, 'beOffline']);
    });

    // Credit Card Lead Routes (User Side)
    Route::prefix('credit-card-leads')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Gromo\CreditCardLeadController::class, 'dashboard']);
        Route::get('/', [\App\Http\Controllers\Gromo\CreditCardLeadController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\Gromo\CreditCardLeadController::class, 'store']);
        Route::get('/{id}', [\App\Http\Controllers\Gromo\CreditCardLeadController::class, 'show']);
        Route::delete('/{id}', [\App\Http\Controllers\Gromo\CreditCardLeadController::class, 'destroy']);
    });

    // Credit Card Lead Admin Routes
    Route::prefix('admin/credit-card-leads')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Gromo\Admin\CreditCardLeadAdminController::class, 'dashboard']);
        Route::get('/', [\App\Http\Controllers\Gromo\Admin\CreditCardLeadAdminController::class, 'index']);
        Route::put('/{id}/status', [\App\Http\Controllers\Gromo\Admin\CreditCardLeadAdminController::class, 'updateStatus']);
        Route::put('/{id}/assign', [\App\Http\Controllers\Gromo\Admin\CreditCardLeadAdminController::class, 'assign']);
        Route::put('/{id}/notes', [\App\Http\Controllers\Gromo\Admin\CreditCardLeadAdminController::class, 'updateNotes']);
        Route::put('/{id}/commission', [\App\Http\Controllers\Gromo\Admin\CreditCardLeadAdminController::class, 'setCommission']);
        Route::post('/{id}/release-commission', [\App\Http\Controllers\Gromo\Admin\CreditCardLeadAdminController::class, 'releaseCommission']);
        Route::get('/commission-report', [\App\Http\Controllers\Gromo\Admin\CreditCardLeadAdminController::class, 'commissionReport']);
    });

    // Loan Lead Routes (User Side)
    Route::prefix('loan-leads')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Gromo\LoanLeadController::class, 'dashboard']);
        Route::get('/', [\App\Http\Controllers\Gromo\LoanLeadController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\Gromo\LoanLeadController::class, 'store']);
        Route::get('/{id}', [\App\Http\Controllers\Gromo\LoanLeadController::class, 'show']);
        Route::put('/{id}', [\App\Http\Controllers\Gromo\LoanLeadController::class, 'update']);
        Route::delete('/{id}', [\App\Http\Controllers\Gromo\LoanLeadController::class, 'destroy']);
        Route::get('/{id}/history', [\App\Http\Controllers\Gromo\LoanLeadController::class, 'history']);
    });

    // Loan Lead Admin Routes
    Route::prefix('admin/loan-leads')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Gromo\Admin\LoanLeadAdminController::class, 'dashboard']);
        Route::get('/commission-report', [\App\Http\Controllers\Gromo\Admin\LoanLeadAdminController::class, 'commissionReport']);
        Route::get('/', [\App\Http\Controllers\Gromo\Admin\LoanLeadAdminController::class, 'index']);
        Route::get('/{id}', [\App\Http\Controllers\Gromo\Admin\LoanLeadAdminController::class, 'show']);
        Route::put('/{id}/status', [\App\Http\Controllers\Gromo\Admin\LoanLeadAdminController::class, 'updateStatus']);
        Route::put('/{id}/assign', [\App\Http\Controllers\Gromo\Admin\LoanLeadAdminController::class, 'assign']);
        Route::put('/{id}/notes', [\App\Http\Controllers\Gromo\Admin\LoanLeadAdminController::class, 'updateNotes']);
        Route::put('/{id}/commission', [\App\Http\Controllers\Gromo\Admin\LoanLeadAdminController::class, 'setCommission']);
        Route::post('/{id}/release-commission', [\App\Http\Controllers\Gromo\Admin\LoanLeadAdminController::class, 'releaseCommission']);
    });

    // Admin User Management
    Route::prefix('admin/users')->group(function () {
        Route::get('/export', [\App\Http\Controllers\Admin\UserController::class, 'export']);
        Route::get('/', [\App\Http\Controllers\Admin\UserController::class, 'index']);
        Route::get('/api', [\App\Http\Controllers\Admin\UserController::class, 'api']);
        Route::get('/{id}', [\App\Http\Controllers\Admin\UserController::class, 'show']);
        Route::get('/{id}/kyc', [\App\Http\Controllers\Admin\UserController::class, 'kyc']);
        Route::get('/{id}/aeps-kyc', [\App\Http\Controllers\Admin\UserController::class, 'aeps_kyc']);
        Route::get('/{id}/passbook', [\App\Http\Controllers\Admin\UserController::class, 'passbook']);
        Route::get('/{id}/referrals', [\App\Http\Controllers\Admin\UserController::class, 'referrals']);
        Route::get('/{id}/transactions', [\App\Http\Controllers\Admin\UserController::class, 'transactions']);
    });

    // Admin Manage User & Report Routes
    Route::prefix('admin/manage-user-report')->group(function () {
        Route::get('/search', [\App\Http\Controllers\Admin\ManageUserReportController::class, 'search']);
        Route::post('/update-user/{id}', [\App\Http\Controllers\Admin\ManageUserReportController::class, 'updateUser']);
        Route::post('/update-merchant/{draftId}', [\App\Http\Controllers\Admin\ManageUserReportController::class, 'updateMerchant']);
        Route::post('/wallet-action', [\App\Http\Controllers\Admin\ManageUserReportController::class, 'walletAction']);
        Route::post('/set-primary-account/{accountId}', [\App\Http\Controllers\Admin\ManageUserReportController::class, 'setPrimaryAccount']);
        Route::post('/create-wallets/{userId}', [\App\Http\Controllers\Admin\ManageUserReportController::class, 'createWallets']);
        Route::get('/passbook/{userId}', [\App\Http\Controllers\Admin\ManageUserReportController::class, 'getPassbook']);
        Route::get('/user-logs/{userId}', [\App\Http\Controllers\Admin\ManageUserReportController::class, 'getUserLogs']);
        Route::get('/aeps-transactions/{mid}', [\App\Http\Controllers\Admin\ManageUserReportController::class, 'getAepsTransactions']);
        Route::get('/recharge-logs/{userId}', [\App\Http\Controllers\Admin\ManageUserReportController::class, 'getRechargeLogs']);
        Route::get('/payout-logs/{userId}', [\App\Http\Controllers\Admin\ManageUserReportController::class, 'getPayoutLogs']);
        Route::get('/users-by-role/{roleId}', [\App\Http\Controllers\Admin\ManageUserReportController::class, 'getUsersByRole']);
        Route::post('/impersonate', [\App\Http\Controllers\Admin\ManageUserReportController::class, 'impersonate']);
        Route::post('/revert-impersonate', [\App\Http\Controllers\Admin\ManageUserReportController::class, 'revertImpersonate']);
    });

    // Remark Presets (for WhatsApp Share modal — cached, version-aware)
    Route::prefix('admin/remark-presets')->group(function () {
        Route::get('/version', [\App\Http\Controllers\Admin\RemarkPresetController::class, 'version']);
        Route::get('/',        [\App\Http\Controllers\Admin\RemarkPresetController::class, 'index']);
    });

    // GST Online Service Routes
    Route::prefix('online-service/gst')->group(function () {
        Route::get('/', [\App\Http\Controllers\OnlineService\GstController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\OnlineService\GstController::class, 'store']);
        Route::get('/dashboard', [\App\Http\Controllers\OnlineService\GstController::class, 'dashboard']); // User Dashboard
        Route::get('/admin-dashboard', [\App\Http\Controllers\OnlineService\GstController::class, 'adminDashboard']); // Admin Dashboard stats
        Route::get('/admin/list', [\App\Http\Controllers\OnlineService\GstController::class, 'adminList']);
        Route::get('/{id}', [\App\Http\Controllers\OnlineService\GstController::class, 'show']);
        Route::put('/{id}/status', [\App\Http\Controllers\OnlineService\GstController::class, 'updateStatus']);
        Route::post('/{id}/receipt', [\App\Http\Controllers\OnlineService\GstController::class, 'uploadReceipt']);
    });

    // Income Tax Online Service Routes
    Route::prefix('online-service/income-tax')->group(function () {
        Route::get('/', [\App\Http\Controllers\OnlineService\IncomeTaxController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\OnlineService\IncomeTaxController::class, 'store']);
        Route::get('/dashboard', [\App\Http\Controllers\OnlineService\IncomeTaxController::class, 'dashboard']); // User Dashboard
        Route::get('/admin-dashboard', [\App\Http\Controllers\OnlineService\IncomeTaxController::class, 'adminDashboard']); // Admin Dashboard stats
        Route::get('/admin/list', [\App\Http\Controllers\OnlineService\IncomeTaxController::class, 'adminList']);
        Route::get('/{id}', [\App\Http\Controllers\OnlineService\IncomeTaxController::class, 'show']);
        Route::put('/{id}/status', [\App\Http\Controllers\OnlineService\IncomeTaxController::class, 'updateStatus']);
        Route::post('/{id}/receipt', [\App\Http\Controllers\OnlineService\IncomeTaxController::class, 'uploadReceipt']);
    });

    // MSME Online Service Routes
    Route::prefix('online-service/msme')->group(function () {
        Route::get('/', [\App\Http\Controllers\OnlineService\MsmeController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\OnlineService\MsmeController::class, 'store']);
        Route::get('/dashboard', [\App\Http\Controllers\OnlineService\MsmeController::class, 'dashboard']); // User Dashboard
        Route::get('/admin-dashboard', [\App\Http\Controllers\OnlineService\MsmeController::class, 'adminDashboard']); // Admin Dashboard stats
        Route::get('/admin/list', [\App\Http\Controllers\OnlineService\MsmeController::class, 'adminList']);
        Route::get('/{id}', [\App\Http\Controllers\OnlineService\MsmeController::class, 'show']);
        Route::put('/{id}/status', [\App\Http\Controllers\OnlineService\MsmeController::class, 'updateStatus']);
        Route::post('/{id}/receipt', [\App\Http\Controllers\OnlineService\MsmeController::class, 'uploadReceipt']);
    });

    // Saving Account Online Service Routes
    Route::prefix('online-service/saving-account')->group(function () {
        Route::get('/', [\App\Http\Controllers\OnlineService\SavingAccountController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\OnlineService\SavingAccountController::class, 'store']);
        Route::get('/dashboard', [\App\Http\Controllers\OnlineService\SavingAccountController::class, 'dashboard']); 
        Route::get('/admin-dashboard', [\App\Http\Controllers\OnlineService\SavingAccountController::class, 'adminDashboard']); 
        Route::get('/admin/list', [\App\Http\Controllers\OnlineService\SavingAccountController::class, 'adminList']);
        Route::get('/{id}', [\App\Http\Controllers\OnlineService\SavingAccountController::class, 'show']);
        Route::put('/{id}/status', [\App\Http\Controllers\OnlineService\SavingAccountController::class, 'updateStatus']);
    });

    // DSA Service Routes (IndiaSales Integration)
    Route::prefix('dsa')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\OnlineService\DsaController::class, 'dashboard']);
        Route::get('/app-dashboard', [\App\Http\Controllers\OnlineService\DsaController::class, 'appDashboard']);
        
        // Public API for fetching service categories (Android/Web)
        Route::get('/services', [\App\Http\Controllers\OnlineService\AdminDsaController::class, 'getServices']);


        Route::prefix('utm')->group(function () {
            Route::get('/list', [\App\Http\Controllers\OnlineService\AdminDsaController::class, 'utmList']);
            Route::get('/{id}', [\App\Http\Controllers\OnlineService\AdminDsaController::class, 'utm']);
            Route::post('/utm', [\App\Http\Controllers\OnlineService\AdminDsaController::class, 'utmStore']);
            Route::post('/{id}', [\App\Http\Controllers\OnlineService\AdminDsaController::class, 'utmUpdate']); // POST for FormData
            Route::delete('/{id}', [\App\Http\Controllers\OnlineService\AdminDsaController::class, 'utmDestroy']);
        });
        
        // Admin CRUD - Categories
        Route::prefix('admin/categories')->group(function () {
            Route::get('/', [\App\Http\Controllers\OnlineService\AdminDsaController::class, 'listCategories']);
            Route::get('/{id}', [\App\Http\Controllers\OnlineService\AdminDsaController::class, 'showCategory']);
            Route::post('/', [\App\Http\Controllers\OnlineService\AdminDsaController::class, 'storeCategory']);
            Route::post('/{id}', [\App\Http\Controllers\OnlineService\AdminDsaController::class, 'updateCategory']); // POST for FormData
            Route::delete('/{id}', [\App\Http\Controllers\OnlineService\AdminDsaController::class, 'destroyCategory']);
        });
        
        // Admin CRUD - Items
        Route::prefix('admin/items')->group(function () {
            Route::get('/', [\App\Http\Controllers\OnlineService\AdminDsaController::class, 'listItems']);
            Route::get('/{id}', [\App\Http\Controllers\OnlineService\AdminDsaController::class, 'showItem']);
            Route::post('/', [\App\Http\Controllers\OnlineService\AdminDsaController::class, 'storeItem']);
            Route::post('/{id}', [\App\Http\Controllers\OnlineService\AdminDsaController::class, 'updateItem']); // POST for FormData
            Route::delete('/{id}', [\App\Http\Controllers\OnlineService\AdminDsaController::class, 'destroyItem']);
        });
        
        // Admin - User Management for DSA
        Route::prefix('admin/users')->group(function () {
            Route::get('/', [\App\Http\Controllers\OnlineService\AdminDsaController::class, 'listUsers']);
            Route::post('/{id}/dsa-code', [\App\Http\Controllers\OnlineService\AdminDsaController::class, 'updateUserDsaCode']);
            Route::get('/{id}/dsa-login-url', [\App\Http\Controllers\OnlineService\AdminDsaController::class, 'getUserDsaLoginUrl']);
        });
    });


    // Earnings Report Routes
    Route::prefix('earnings')->group(function () {
        Route::get('/categories', [\App\Http\Controllers\Api\EarningReportController::class, 'categories']);
        Route::get('/summary', [\App\Http\Controllers\Api\EarningReportController::class, 'summary']);
    });

    // Push Notification (FCM) Routes
    Route::prefix('fcm')->group(function () {
        Route::post('/register-token', [PushNotificationController::class, 'registerToken']);
        Route::post('/deactivate-token', [PushNotificationController::class, 'deactivateToken']);
        Route::get('/my-tokens', [PushNotificationController::class, 'getMyTokens']);
        Route::post('/send-campaign', [PushNotificationController::class, 'sendCampaign']);
        Route::post('/send-to-user', [PushNotificationController::class, 'sendToUser']);
        Route::post('/send-to-topic', [PushNotificationController::class, 'sendToTopic']);
        
        // Notification Logs & Management
        Route::get('/users', [PushNotificationController::class, 'getFcmUsers']);
        Route::get('/logs', [PushNotificationController::class, 'getLogs']);
        Route::get('/logs/{id}', [PushNotificationController::class, 'getLog']);
        Route::get('/dashboard-stats', [PushNotificationController::class, 'getDashboardStats']);
        Route::post('/retry-failed/{id}', [PushNotificationController::class, 'retryFailed']);
        Route::delete('/logs/{id}', [PushNotificationController::class, 'deleteLog']);
    });

    // BunnyCDN Upload Config & Delete Routes
    Route::get('/bunny/config', [\App\Http\Controllers\BunnyUploadController::class, 'getConfig']);
    Route::post('/bunny/delete', [\App\Http\Controllers\BunnyUploadController::class, 'delete']);

    // Banner Admin CRUD (role=1, user_id=21 only)
    Route::prefix('admin/banners')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\BannerController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\Admin\BannerController::class, 'store']);
        Route::get('/{id}', [\App\Http\Controllers\Admin\BannerController::class, 'show']);
        Route::put('/{id}', [\App\Http\Controllers\Admin\BannerController::class, 'update']);
        Route::delete('/{id}', [\App\Http\Controllers\Admin\BannerController::class, 'destroy']);
        Route::post('/{id}/toggle-status', [\App\Http\Controllers\Admin\BannerController::class, 'toggleStatus']);
    });

    // Popup API for Mobile App and Vite
    Route::prefix('popup')->group(function () {
        Route::post('/fetch', [\App\Http\Controllers\Api\PopupController::class, 'fetch']);
        Route::post('/dismiss', [\App\Http\Controllers\Api\PopupController::class, 'dismiss']);
        Route::post('/public', [\App\Http\Controllers\Api\PopupController::class, 'fetchPublic']);
    });

    // Popup Admin CRUD
    Route::prefix('popups')->group(function () {
        Route::get('/', [\App\Http\Controllers\PopupManagementController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\PopupManagementController::class, 'store']);
        Route::get('/members/list', [\App\Http\Controllers\PopupManagementController::class, 'getMembersList']);
        Route::get('/roles/list', [\App\Http\Controllers\PopupManagementController::class, 'getRolesList']);
        Route::post('/upload-image', [\App\Http\Controllers\PopupManagementController::class, 'uploadImage']);
        Route::get('/{id}', [\App\Http\Controllers\PopupManagementController::class, 'show']);
        Route::put('/{id}', [\App\Http\Controllers\PopupManagementController::class, 'update']);
        Route::delete('/{id}', [\App\Http\Controllers\PopupManagementController::class, 'destroy']);
        Route::post('/{id}/toggle-status', [\App\Http\Controllers\PopupManagementController::class, 'toggleStatus']);
    });



    /************************************************************************************************
     *  CRM Routes
    ************************************************************************************************/
    Route::prefix('crm')->group(function () {
        Route::apiResource('lead-types', LeadTypeController::class);
        Route::apiResource('lead-sources', LeadSourceController::class);
        Route::apiResource('lead-status', LeadStatusController::class);
        Route::apiResource('leads', LeadController::class);
        
        // Special lead activity routes
        Route::patch('leads/{id}/status', [LeadController::class, 'updateStatus']);
        Route::post('leads/{id}/close', [LeadController::class, 'closeLead']);
        Route::post('leads/{id}/mark-lost', [LeadController::class, 'markAsLost']);
        Route::post('leads/{id}/log-communication', [LeadController::class, 'logCommunication']);
        Route::get('leads/{id}/timeline', [LeadController::class, 'getTimeline']);
        
        Route::apiResource('lead-transfer-logs', LeadTransferLogController::class);
        Route::apiResource('lead-activities', LeadActivityController::class);
        Route::get('leads/{leadId}/activities', [LeadActivityController::class, 'getByLead']);
        Route::apiResource('followups', FollowupController::class);
        Route::apiResource('followup-types', FollowupTypeController::class);
        Route::apiResource('followup-statuses', FollowupStatusController::class);
        Route::get('followups-types', [FollowupController::class, 'getFollowupTypes']);
        Route::get('followups-statuses', [FollowupController::class, 'getFollowupStatuses']);
        Route::get('followups-stats', [FollowupController::class, 'getFollowupStats']);
        Route::apiResource('custom-fields', CustomFieldController::class);
        Route::apiResource('lead-custom-values', LeadCustomValueController::class);
        
        // Email Management Routes
        Route::prefix('emails')->group(function () {
            Route::get('sent', [EmailController::class, 'sent']);
            Route::get('stats', [EmailController::class, 'getStats']);
            Route::get('users', [EmailController::class, 'getUsers']);
            Route::get('contacts', [EmailController::class, 'getContacts']);
            Route::post('compose', [EmailController::class, 'store']);
            Route::get('{id}', [EmailController::class, 'show']);
            Route::put('{id}', [EmailController::class, 'update']);
            Route::delete('{id}', [EmailController::class, 'destroy']);
            Route::patch('{id}/read', [EmailController::class, 'markAsRead']);
            Route::get('attachments/{attachmentId}/download', [EmailController::class, 'downloadAttachment'])->name('api.emails.attachments.download');
        });
    });

   
    // Secure Add Fund Routes (Throttled)
    Route::middleware('throttle:6,1')->group(function () {
        // Secure UPI Add Fund Routes
        Route::prefix('add-fund')->group(function () {
            Route::post('/upi-intent', [\App\Http\Controllers\Banking\AddFundController::class, 'initiateUpiIntent']);
            Route::post('/verify', [\App\Http\Controllers\Banking\AddFundController::class, 'verifyPayment']);
            Route::post('/history', [\App\Http\Controllers\Banking\AddFundController::class, 'getHistory']);
        });
        
    });


    Route::prefix('telecalling')->group(function () {
        Route::post('/leads', [TeleCallingController::class, 'leads']);
        Route::get('/auto-business-lead-generate', [TeleCallingController::class, 'autoBusinessLeadGenerate']);
        Route::get('/auto-kyc-lead-generate', [TeleCallingController::class, 'autoKycLeadGenerate']);
        Route::post('/datewise-lead-breakdown', [TeleCallingController::class, 'datewiseLeadBreakdown']);
        Route::post('/update-status', [TeleCallingController::class, 'updateStatus']);

    });

    // Billing Routes
    require __DIR__ . '/api_billing.php';

    // PAN Card Service Routes
    Route::prefix('pan-card')->group(function () {
        Route::get('/agent-status', [\App\Http\Controllers\OnlineService\PanCardController::class, 'getAgentStatus']);
        Route::post('/agent-register', [\App\Http\Controllers\OnlineService\PanCardController::class, 'registerAgent']);
        Route::post('/import-agents', [\App\Http\Controllers\OnlineService\PanCardController::class, 'importAgentsFromExcel']);
        Route::get('/admin/agents', [\App\Http\Controllers\OnlineService\PanCardController::class, 'getAdminAgents']);
        Route::post('/admin/agent-status', [\App\Http\Controllers\OnlineService\PanCardController::class, 'updateAgentStatus']);

        Route::post('/fund-request/create', [\App\Http\Controllers\OnlineService\PanCardController::class, 'createFundRequest']);
        Route::get('/fund-requests', [\App\Http\Controllers\OnlineService\PanCardController::class, 'getUserFundRequests']);
        Route::get('/admin/fund-requests', [\App\Http\Controllers\OnlineService\PanCardController::class, 'getAdminFundRequests']);
        Route::post('/admin/fund-request-status', [\App\Http\Controllers\OnlineService\PanCardController::class, 'updateFundRequestStatus']);
        Route::post('/fund-request-status', [\App\Http\Controllers\OnlineService\PanCardController::class, 'FundRequestStatus']);

        // PAN Application Report (Excel Import + List)
        Route::post('/import-application-report', [\App\Http\Controllers\OnlineService\PanCardController::class, 'importApplicationReport']);
        Route::get('/application-reports', [\App\Http\Controllers\OnlineService\PanCardController::class, 'getApplicationReports']);
        Route::get('/application-report-filter-lists', [\App\Http\Controllers\OnlineService\PanCardController::class, 'getPanFilterLists']);
    });

});

