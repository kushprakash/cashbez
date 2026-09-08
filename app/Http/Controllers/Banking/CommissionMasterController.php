<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CommissionPackage;
use App\Models\CommissionPackageItem;
use App\Models\CommissionPackageAssignment;
use App\Models\SpecialOfferCommission;
use App\Models\Role;
use App\Models\User;
use App\Models\ApiSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CommissionMasterController extends Controller
{
    // ==========================================
    // 1. COMMISSION PACKAGES CRUD & MATRIX
    // ==========================================

    public function getPackages(Request $request)
    {
        try {
            $query = CommissionPackage::with(['items', 'api:id,api_name,api_short_name', 'assignments.roleInfo', 'assignments.userInfo']);

            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where('name', 'like', "%{$search}%");
            }

            $packages = $query->orderBy('id', 'desc')->get();

            return response()->json([
                'status' => 1,
                'message' => 'Commission packages retrieved',
                'data' => $packages
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch packages: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getCategoryOperators(Request $request)
    {
        try {
            $categories = ['Prepaid', 'Postpaid', 'DTH', 'Electricity', 'Water', 'Gas', 'Landline', 'Broadband', 'Insurance', 'FASTag'];
            $result = [];

            foreach ($categories as $cat) {
                $catUpper = strtoupper(trim($cat));
                $isOperatorWise = (
                    str_contains($catUpper, 'PREPAID') ||
                    str_contains($catUpper, 'POSTPAID') ||
                    str_contains($catUpper, 'DTH') ||
                    str_contains($catUpper, 'INSURANCE')
                );

                if (!$isOperatorWise) {
                    $result[$cat] = [
                        ['code' => 'ALL', 'name' => 'ALL']
                    ];
                    continue;
                }

                $query = \App\Models\UtilityOperator::where('is_active', true);

                if (str_contains($catUpper, 'PREPAID')) {
                    $query->where(function($q) {
                        $q->where('category', 'MobilePrepaid')
                          ->orWhere('category', 'Prepaid')
                          ->orWhere('type', 'Prepaid')
                          ->orWhereIn('code', ['JIO', 'AIRTEL', 'VI', 'BSNL']);
                    });
                } else if (str_contains($catUpper, 'POSTPAID')) {
                    $query->where(function($q) {
                        $q->where('category', 'MobilePostpaid')
                          ->orWhere('category', 'Postpaid')
                          ->orWhere('type', 'Postpaid');
                    });
                } else if (str_contains($catUpper, 'DTH')) {
                    $query->where(function($q) {
                        $q->where('category', 'DTH')->orWhere('type', 'DTH');
                    });
                } else if (str_contains($catUpper, 'INSURANCE')) {
                    $query->where(function($q) {
                        $q->where('category', 'Insurance')->orWhere('type', 'Insurance');
                    });
                }

                $dbOps = $query->select('code', 'name')->get();
                $ops = $dbOps->unique('code')->values()->map(function($op) {
                    return [
                        'code' => $op->code,
                        'name' => !empty($op->name) ? $op->name : $op->code
                    ];
                })->toArray();

                if (empty($ops)) {
                    if (str_contains($catUpper, 'DTH')) {
                        $ops = [
                            ['code' => 'TATA_PLAY', 'name' => 'TATA PLAY'],
                            ['code' => 'AIRTEL_DTH', 'name' => 'AIRTEL DTH'],
                            ['code' => 'DISH_TV', 'name' => 'DISH TV'],
                            ['code' => 'SUN_DIRECT', 'name' => 'SUN DIRECT'],
                            ['code' => 'D2H', 'name' => 'D2H'],
                        ];
                    } else if (str_contains($catUpper, 'PREPAID') || str_contains($catUpper, 'POSTPAID')) {
                        $ops = [
                            ['code' => 'JIO', 'name' => 'JIO'],
                            ['code' => 'AIRTEL', 'name' => 'AIRTEL'],
                            ['code' => 'VI', 'name' => 'VI'],
                            ['code' => 'BSNL', 'name' => 'BSNL'],
                        ];
                    }
                }

                // Add 'ALL' option at start if not present
                if (!collect($ops)->pluck('code')->contains('ALL')) {
                    array_unshift($ops, ['code' => 'ALL', 'name' => 'ALL']);
                }
                $result[$cat] = $ops;
            }

            return response()->json([
                'status' => 1,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    public function showPackage($id)
    {
        try {
            $package = CommissionPackage::with(['items', 'api:id,api_name,api_short_name'])->find($id);

            if (!$package) {
                return response()->json(['status' => 0, 'message' => 'Package not found'], 404);
            }

            return response()->json([
                'status' => 1,
                'data' => $package
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    public function storePackage(Request $request)
    {
        DB::beginTransaction();
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'api_id' => 'nullable|exists:api_settings,id',
                'description' => 'nullable|string',
                'items' => 'required|array',
                'items.*.category' => 'required|string',
                'items.*.operator_code' => 'required|string',
                'items.*.commission_type' => 'required|in:percentage,flat',
                'items.*.commission_val' => 'required|numeric|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $package = CommissionPackage::create([
                'name' => $request->name,
                'api_id' => $request->api_id ?: null,
                'description' => $request->description ?: null,
                'is_active' => true
            ]);

            foreach ($request->items as $item) {
                CommissionPackageItem::create([
                    'package_id' => $package->id,
                    'api_id' => $request->api_id ?: null,
                    'category' => $item['category'],
                    'operator_code' => strtoupper($item['operator_code']),
                    'commission_type' => $item['commission_type'],
                    'commission_val' => (float)$item['commission_val']
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Commission package created successfully',
                'data' => $package->load('items')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 0, 'message' => 'Failed to create package: ' . $e->getMessage()], 500);
        }
    }

    public function updatePackage(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $package = CommissionPackage::find($id);
            if (!$package) {
                return response()->json(['status' => 0, 'message' => 'Package not found'], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'api_id' => 'nullable|exists:api_settings,id',
                'description' => 'nullable|string',
                'items' => 'required|array'
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 0, 'errors' => $validator->errors()], 422);
            }

            $package->update([
                'name' => $request->name,
                'api_id' => $request->api_id ?: null,
                'description' => $request->description ?: null
            ]);

            // Replace items
            CommissionPackageItem::where('package_id', $package->id)->delete();

            foreach ($request->items as $item) {
                CommissionPackageItem::create([
                    'package_id' => $package->id,
                    'api_id' => $request->api_id ?: null,
                    'category' => $item['category'],
                    'operator_code' => strtoupper($item['operator_code']),
                    'commission_type' => $item['commission_type'],
                    'commission_val' => (float)$item['commission_val']
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Commission package updated successfully',
                'data' => $package->load('items')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 0, 'message' => 'Failed to update package: ' . $e->getMessage()], 500);
        }
    }

    public function destroyPackage($id)
    {
        try {
            $package = CommissionPackage::find($id);
            if (!$package) {
                return response()->json(['status' => 0, 'message' => 'Package not found'], 404);
            }

            $package->delete();

            return response()->json([
                'status' => 1,
                'message' => 'Commission package deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    public function togglePackageStatus($id)
    {
        try {
            $package = CommissionPackage::find($id);
            if (!$package) return response()->json(['status' => 0, 'message' => 'Not found'], 404);

            $package->is_active = !$package->is_active;
            $package->save();

            return response()->json([
                'status' => 1,
                'message' => 'Package status updated',
                'data' => $package
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 2. PACKAGE ASSIGNMENTS (ROLE & USER OVERRIDE)
    // ==========================================

    public function getAssignments(Request $request)
    {
        try {
            $assignments = CommissionPackageAssignment::with(['package:id,name,api_id', 'roleInfo:id,name', 'userInfo:id,name,mobile,email,mid'])
                ->orderBy('id', 'desc')
                ->get();

            return response()->json([
                'status' => 1,
                'data' => $assignments
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    public function assignPackageToRole(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'role_id' => 'required|exists:roles,id',
                'package_ids' => 'nullable|array',
                'package_ids.*' => 'exists:commission_packages,id',
                'package_id' => 'nullable|exists:commission_packages,id'
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 0, 'errors' => $validator->errors()], 422);
            }

            $packageIds = $request->input('package_ids', []);
            if (empty($packageIds) && $request->has('package_id') && !empty($request->package_id)) {
                $packageIds = [$request->package_id];
            }

            // Remove existing role assignments for this role
            CommissionPackageAssignment::where('assign_type', 'role')
                ->where('role_id', $request->role_id)
                ->delete();

            $created = [];
            foreach (array_unique($packageIds) as $pkgId) {
                $created[] = CommissionPackageAssignment::create([
                    'assign_type' => 'role',
                    'role_id' => $request->role_id,
                    'package_id' => $pkgId,
                    'user_id' => null,
                    'is_active' => true
                ]);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Packages assigned to role successfully',
                'data' => $created
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    public function assignPackageToUser(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'package_ids' => 'nullable|array',
                'package_ids.*' => 'exists:commission_packages,id',
                'package_id' => 'nullable|exists:commission_packages,id'
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 0, 'errors' => $validator->errors()], 422);
            }

            $packageIds = $request->input('package_ids', []);
            if (empty($packageIds) && $request->has('package_id') && !empty($request->package_id)) {
                $packageIds = [$request->package_id];
            }

            // Remove existing user assignments for this user
            CommissionPackageAssignment::where('assign_type', 'user')
                ->where('user_id', $request->user_id)
                ->delete();

            $created = [];
            foreach (array_unique($packageIds) as $pkgId) {
                $created[] = CommissionPackageAssignment::create([
                    'assign_type' => 'user',
                    'user_id' => $request->user_id,
                    'package_id' => $pkgId,
                    'role_id' => null,
                    'is_active' => true
                ]);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Direct user override packages assigned successfully',
                'data' => $created
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroyAssignment($id)
    {
        try {
            $assignment = CommissionPackageAssignment::find($id);
            if (!$assignment) return response()->json(['status' => 0, 'message' => 'Not found'], 404);

            $assignment->delete();

            return response()->json(['status' => 1, 'message' => 'Assignment deleted']);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    public function getRoles()
    {
        try {
            $roles = Role::select('id', 'name')->get();
            return response()->json(['status' => 1, 'data' => $roles]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    public function searchUsers(Request $request)
    {
        try {
            $query = $request->input('q', '');
            $roleId = $request->input('role_id', '');

            $usersQuery = User::query();

            if (!empty($roleId)) {
                $usersQuery->where('role', $roleId);
            }

            if (!empty($query)) {
                $usersQuery->where(function($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                      ->orWhere('mobile', 'like', "%{$query}%")
                      ->orWhere('email', 'like', "%{$query}%")
                      ->orWhere('mid', 'like', "%{$query}%");
                });
            }

            $users = $usersQuery->select('id', 'name', 'mobile', 'email', 'mid', 'role as role_id')
                ->limit(50)
                ->get();

            return response()->json(['status' => 1, 'data' => $users]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 3. SPECIAL OFFER COMMISSIONS
    // ==========================================

    public function getSpecialOffers(Request $request)
    {
        try {
            $offers = SpecialOfferCommission::with(['api:id,api_name', 'roleInfo:id,name', 'userInfo:id,name,mobile,mid'])
                ->orderBy('id', 'desc')
                ->get();

            return response()->json(['status' => 1, 'data' => $offers]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    public function storeSpecialOffer(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'api_id' => 'nullable|exists:api_settings,id',
                'operator_code' => 'required|string',
                'circle' => 'nullable|string',
                'amount' => 'required|numeric|min:0',
                'commission_type' => 'required|in:percentage,flat',
                'commission_val' => 'required|numeric|min:0',
                'assign_type' => 'required|in:all,role,user',
                'role_id' => 'required_if:assign_type,role|nullable|exists:roles,id',
                'user_id' => 'required_if:assign_type,user|nullable|exists:users,id'
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 0, 'errors' => $validator->errors()], 422);
            }

            $offer = SpecialOfferCommission::create([
                'title' => $request->title,
                'api_id' => $request->api_id ?: null,
                'operator_code' => strtoupper($request->operator_code),
                'circle' => strtoupper($request->circle ?: 'ALL'),
                'amount' => (float)$request->amount,
                'commission_type' => $request->commission_type,
                'commission_val' => (float)$request->commission_val,
                'assign_type' => $request->assign_type,
                'role_id' => $request->assign_type === 'role' ? $request->role_id : null,
                'user_id' => $request->assign_type === 'user' ? $request->user_id : null,
                'is_active' => true
            ]);

            return response()->json([
                'status' => 1,
                'message' => 'Special offer commission rule created',
                'data' => $offer->load(['api', 'roleInfo', 'userInfo'])
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    public function updateSpecialOffer(Request $request, $id)
    {
        try {
            $offer = SpecialOfferCommission::find($id);
            if (!$offer) return response()->json(['status' => 0, 'message' => 'Offer rule not found'], 404);

            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'api_id' => 'nullable|exists:api_settings,id',
                'operator_code' => 'required|string',
                'circle' => 'nullable|string',
                'amount' => 'required|numeric|min:0',
                'commission_type' => 'required|in:percentage,flat',
                'commission_val' => 'required|numeric|min:0',
                'assign_type' => 'required|in:all,role,user'
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => 0, 'errors' => $validator->errors()], 422);
            }

            $offer->update([
                'title' => $request->title,
                'api_id' => $request->api_id ?: null,
                'operator_code' => strtoupper($request->operator_code),
                'circle' => strtoupper($request->circle ?: 'ALL'),
                'amount' => (float)$request->amount,
                'commission_type' => $request->commission_type,
                'commission_val' => (float)$request->commission_val,
                'assign_type' => $request->assign_type,
                'role_id' => $request->assign_type === 'role' ? $request->role_id : null,
                'user_id' => $request->assign_type === 'user' ? $request->user_id : null
            ]);

            return response()->json([
                'status' => 1,
                'message' => 'Special offer updated',
                'data' => $offer->load(['api', 'roleInfo', 'userInfo'])
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroySpecialOffer($id)
    {
        try {
            $offer = SpecialOfferCommission::find($id);
            if (!$offer) return response()->json(['status' => 0, 'message' => 'Not found'], 404);

            $offer->delete();

            return response()->json(['status' => 1, 'message' => 'Special offer rule deleted']);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    public function toggleSpecialOfferStatus($id)
    {
        try {
            $offer = SpecialOfferCommission::find($id);
            if (!$offer) return response()->json(['status' => 0, 'message' => 'Not found'], 404);

            $offer->is_active = !$offer->is_active;
            $offer->save();

            return response()->json(['status' => 1, 'message' => 'Special offer status updated', 'data' => $offer]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 4. COMMISSION CALCULATION ENGINE
    // ==========================================

    /**
     * Calculate commission for a user recharge
     */
    public static function calculateUserCommission($user, $apiId, $category, $operatorCode, $circle, $amount)
    {
        $amount = (float)$amount;
        $operatorCode = strtoupper($operatorCode);
        $circle = strtoupper($circle ?: 'ALL');
        $userId = (int)($user->id ?? 0);
        $roleId = (int)($user->role ?? 0);

        // Priority 1: Check Special Offer Commissions for User or User's Role or ALL
        $specialOffer = SpecialOfferCommission::where('is_active', true)
            ->where(function($q) use ($apiId) {
                $q->where('api_id', $apiId)->orWhereNull('api_id');
            })
            ->where(function($q) use ($operatorCode) {
                $q->where('operator_code', $operatorCode)->orWhere('operator_code', 'ALL');
            })
            ->where(function($q) use ($circle) {
                $q->where('circle', $circle)->orWhere('circle', 'ALL');
            })
            ->where(function($q) use ($amount) {
                $q->where('amount', $amount)->orWhere('amount', 0);
            })
            ->where(function($q) use ($userId, $roleId) {
                $q->where('assign_type', 'all')
                  ->orWhere(function($q2) use ($userId) {
                      $q2->where('assign_type', 'user')->where('user_id', $userId);
                  });
                if ($roleId > 0) {
                    $q->orWhere(function($q2) use ($roleId) {
                        $q2->where('assign_type', 'role')->where('role_id', $roleId);
                    });
                }
            })
            ->orderByRaw("
                (CASE WHEN user_id = {$userId} THEN 8 ELSE 0 END) +
                (CASE WHEN role_id = {$roleId} THEN 4 ELSE 0 END) +
                (CASE WHEN amount > 0 THEN 2 ELSE 0 END) +
                (CASE WHEN circle != 'ALL' THEN 1 ELSE 0 END) DESC
            ")
            ->first();

        if ($specialOffer) {
            $commAmount = $specialOffer->commission_type === 'percentage'
                ? ($amount * ($specialOffer->commission_val / 100))
                : $specialOffer->commission_val;

            return [
                'type' => $specialOffer->commission_type,
                'value' => $specialOffer->commission_val,
                'calculated_commission' => round($commAmount, 2),
                'source' => 'special_offer',
                'title' => $specialOffer->title
            ];
        }

        // Priority 2: Check Direct User Package Assignment (user_id)
        $assignments = CommissionPackageAssignment::where('is_active', true)
            ->where('assign_type', 'user')
            ->where('user_id', $userId)
            ->get();

        // Priority 3: Fallback to Role Package Assignment (role_id)
        if ($assignments->isEmpty() && $roleId > 0) {
            $assignments = CommissionPackageAssignment::where('is_active', true)
                ->where('assign_type', 'role')
                ->where('role_id', $roleId)
                ->get();
        }

        if ($assignments->isNotEmpty()) {
            $packageIds = $assignments->pluck('package_id')->filter()->toArray();

            // Find package item matching API, Category, Operator across all assigned packages
            $item = CommissionPackageItem::whereIn('package_id', $packageIds)
                ->where(function($q) use ($apiId) {
                    $q->where('api_id', $apiId)->orWhereNull('api_id');
                })
                ->where(function($q) use ($category) {
                    $q->where('category', $category)->orWhere('category', 'ALL');
                })
                ->where(function($q) use ($operatorCode) {
                    $q->where('operator_code', $operatorCode)->orWhere('operator_code', 'ALL');
                })
                ->orderByRaw("
                    (CASE WHEN api_id = {$apiId} THEN 4 ELSE 0 END) +
                    (CASE WHEN operator_code = '{$operatorCode}' THEN 2 ELSE 0 END) +
                    (CASE WHEN category = '{$category}' THEN 1 ELSE 0 END) DESC
                ")
                ->first();

            if ($item) {
                $commAmount = $item->commission_type === 'percentage'
                    ? ($amount * ($item->commission_val / 100))
                    : $item->commission_val;

                return [
                    'type' => $item->commission_type,
                    'value' => $item->commission_val,
                    'calculated_commission' => $commAmount,
                    'source' => $assignments->first()->assign_type === 'user' ? 'user_package' : 'role_package',
                    'package_id' => $item->package_id
                ];
            }
        }

        return [
            'type' => 'percentage',
            'value' => 0,
            'calculated_commission' => 0,
            'source' => 'default'
        ];
    }

    /**
     * Get logged-in user's assigned commission slabs & payout charges report (UserRoleCommission & Module Type Wise)
     */
    public function getMyCommissionStructure(Request $request)
    {
        try {
            $user = $request->get('user');
            if (!$user) {
                return response()->json(['status' => 0, 'message' => 'User unauthenticated'], 401);
            }

            $userId = $user->id;
            $roleId = $user->role ?? 0;
            $roleInfo = Role::find($roleId);

            // 1. Fetch UserRoleCommission entries for logged-in user
            $userRoleComms = \App\Models\UserRoleCommission::with(['module', 'subModule', 'commission'])
                ->where('user_id', $userId)
                ->where('status', 1)
                ->get();

            $isUserRoleCommissionActive = $userRoleComms->isNotEmpty();

            // 2. If no direct UserRoleCommission, fallback to RoleModuleCommission
            if ($userRoleComms->isEmpty() && $roleId > 0) {
                $userRoleComms = \App\Models\RoleModuleCommission::with(['module', 'subModule', 'commission'])
                    ->where('role_id', $roleId)
                    ->where('status', 1)
                    ->get();
            }

            // 3. Get assigned Packages & Items
            $userAssignments = CommissionPackageAssignment::with('package.items')
                ->where('is_active', true)
                ->where('assign_type', 'user')
                ->where('user_id', $userId)
                ->get();

            $isUserOverride = $userAssignments->isNotEmpty();
            $assignments = $isUserOverride 
                ? $userAssignments 
                : CommissionPackageAssignment::with('package.items')
                    ->where('is_active', true)
                    ->where('assign_type', 'role')
                    ->where('role_id', $roleId)
                    ->get();

            $assignedPackageNames = $assignments->pluck('package.name')->filter()->unique()->values()->toArray();
            $packageIds = $assignments->pluck('package_id')->filter()->toArray();

            $packageItems = CommissionPackageItem::with('package:id,name')
                ->whereIn('package_id', $packageIds)
                ->get();

            // 4. Get Special Offers
            $specialOffers = SpecialOfferCommission::where('is_active', true)
                ->where(function($q) use ($userId, $roleId) {
                    $q->where('user_id', $userId)
                      ->orWhere('role_id', $roleId);
                })
                ->get();

            // 5. Fetch Operator Code to Operator Name mapping
            $opMap = [];
            $dbOperators = \App\Models\UtilityOperator::select('code', 'name')->get();
            foreach ($dbOperators as $op) {
                if (!empty($op->code) && !empty($op->name)) {
                    $opMap[strtoupper(trim($op->code))] = trim($op->name);
                }
            }

            // Grouping structure by Module Type Name
            $moduleGroups = [];

            // A) Group UserRoleCommission / RoleModuleCommission items by Module Name
            foreach ($userRoleComms as $urc) {
                $comm = $urc->commission;
                if (!$comm) continue;

                $moduleName = $urc->module->name ?? 'General Module';
                if (!isset($moduleGroups[$moduleName])) {
                    $moduleGroups[$moduleName] = [];
                }

                $subName = $urc->subModule->name ?? $urc->module->name ?? 'General Service';
                $modeCode = strtoupper(trim($comm->mode ?? ''));
                $modeName = isset($opMap[$modeCode]) ? $opMap[$modeCode] : '';
                $displayTitle = !empty($modeName) ? $modeName : $subName;
                $commType = in_array(strtolower($comm->commission_type ?? 'flat'), ['percent', 'percentage', '%']) ? '%' : 'Flat (₹)';

                $moduleGroups[$moduleName][] = [
                    'id' => $urc->id,
                    'module_name' => $moduleName,
                    'title' => $displayTitle,
                    'operator' => $modeName ?: ($comm->mode ?? 'ALL'),
                    'operator_code' => $modeCode ?: 'ALL',
                    'from_amt' => number_format($comm->from_amt ?? 0, 2),
                    'to_amt' => number_format($comm->to_amt ?? 999999, 2),
                    'comm_type' => $commType,
                    'comm_val' => number_format($comm->commission ?? 0, 2),
                    'txn_type' => strtolower($comm->txn_type ?? 'commission') === 'charge' ? 'charge' : 'commission',
                    'source' => $isUserRoleCommissionActive ? 'User Role Commission' : 'Role Commission',
                    'badge' => 'Module Standard'
                ];
            }

            // B) Add Package Items grouped by Module / Category
            foreach ($packageItems as $item) {
                $catKey = strtoupper($item->category ?? 'OTHERS');
                if (str_contains($catKey, 'RECHARGE') || in_array($catKey, ['PREPAID', 'POSTPAID', 'DTH'])) {
                    $moduleName = 'Recharge & Utility Module';
                } else if (str_contains($catKey, 'AEPS')) {
                    $moduleName = 'AEPS Service Module';
                } else if (str_contains($catKey, 'MATM') || str_contains($catKey, 'ATM')) {
                    $moduleName = 'MATM Service Module';
                } else if (str_contains($catKey, 'CASH') || str_contains($catKey, 'DEPOSIT')) {
                    $moduleName = 'Cash Deposit Module';
                } else if (str_contains($catKey, 'BILL') || str_contains($catKey, 'BBPS') || in_array($catKey, ['ELECTRICITY', 'WATER', 'GAS', 'FASTAG'])) {
                    $moduleName = 'Bill Payment (BBPS) Module';
                } else if (str_contains($catKey, 'PAYOUT')) {
                    $moduleName = 'Payout & Settlement Module';
                } else if (str_contains($catKey, 'DMT') || str_contains($catKey, 'MONEY')) {
                    $moduleName = 'Money Transfer (DMT) Module';
                } else {
                    $moduleName = 'General Package Module';
                }

                if (!isset($moduleGroups[$moduleName])) {
                    $moduleGroups[$moduleName] = [];
                }

                $opCode = strtoupper(trim($item->operator_code ?? ''));
                $opName = isset($opMap[$opCode]) ? $opMap[$opCode] : ($opCode !== 'ALL' && !empty($opCode) ? $opCode : '');
                $displayTitle = !empty($opName) ? $opName : ($item->operator_code && $item->operator_code !== 'ALL' ? $item->operator_code : ($item->category ?? 'General'));
                $commType = in_array(strtolower($item->commission_type ?? 'flat'), ['percentage', 'percent', '%']) ? '%' : 'Flat (₹)';

                $moduleGroups[$moduleName][] = [
                    'id' => 'pkg_' . $item->id,
                    'module_name' => $moduleName,
                    'title' => $displayTitle,
                    'operator' => $opName ?: ($item->operator_code ?? 'ALL'),
                    'operator_code' => $opCode ?: 'ALL',
                    'from_amt' => number_format($item->min_amount ?? 0, 2),
                    'to_amt' => number_format($item->max_amount ?? 999999, 2),
                    'comm_type' => $commType,
                    'comm_val' => number_format($item->commission_val ?? 0, 2),
                    'txn_type' => strtolower($item->txn_type ?? 'commission') === 'charge' ? 'charge' : 'commission',
                    'source' => $item->package->name ?? 'Package',
                    'badge' => $isUserOverride ? 'User Override Package' : 'Role Package'
                ];
            }

            // C) Add Special Offers if active
            if ($specialOffers->isNotEmpty()) {
                $moduleName = 'Special Offers & Promotions';
                if (!isset($moduleGroups[$moduleName])) {
                    $moduleGroups[$moduleName] = [];
                }

                foreach ($specialOffers as $offer) {
                    $commType = $offer->commission_type === 'percentage' ? '%' : 'Flat (₹)';
                    $moduleGroups[$moduleName][] = [
                        'id' => 'offer_' . $offer->id,
                        'module_name' => $moduleName,
                        'title' => $offer->title,
                        'operator' => strtoupper($offer->operator_code ?? 'ALL'),
                        'from_amt' => number_format($offer->amount ?? 0, 2),
                        'to_amt' => number_format($offer->amount ?? 999999, 2),
                        'comm_type' => $commType,
                        'comm_val' => number_format($offer->commission_val ?? 0, 2),
                        'txn_type' => 'commission',
                        'source' => 'Special Offer',
                        'badge' => 'Special Offer'
                    ];
                }
            }

            return response()->json([
                'status' => 1,
                'message' => 'User Role Commission structure loaded successfully',
                'user_info' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'mobile' => $user->mobile,
                    'role_name' => $roleInfo->name ?? 'User',
                    'assigned_packages' => $assignedPackageNames,
                    'is_user_override' => $isUserOverride
                ],
                'module_groups' => $moduleGroups
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => 'Error loading commission structure: ' . $e->getMessage()], 500);
        }
    }
}
