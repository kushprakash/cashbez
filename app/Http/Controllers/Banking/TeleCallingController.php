<?php

namespace App\Http\Controllers\Banking;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use App\Models\Setting;
use App\Models\Passbook;
use App\Models\User;
use App\Models\UserKyc;
use App\Models\Account;
use DB; 
use Illuminate\Support\Facades\Cache;
use Exception;
use App\Services\CatchLogService;

class TeleCallingController extends Controller
{

    public function leads(Request $request)
    {
        try {
            
            $userId = $request->get('user')->id;
            $adminID = $request->get('admin')->id;

            $tx='';
            $query = DB::table('calling_datas')->where('user_id', $userId);
            
            //from: "2026-03-01", to: "2026-03-04"
            if($request->input('from') && $request->input('to')) {
                $query->whereDate('created_at', '>=', $request->input('from'))
                      ->whereDate('created_at', '<=', $request->input('to'));
                $tx='Date Filter';
            } else {
                $tx='All Data';
            }

            // Get summary counts
            $summaryCounts = (clone $query)
                ->select('status_id', DB::raw('count(*) as total'))
                ->groupBy('status_id')
                ->pluck('total', 'status_id')
                ->toArray();
                
            $summary = [
                0 => $summaryCounts[0] ?? 0,
                1 => $summaryCounts[1] ?? 0,
                2 => $summaryCounts[2] ?? 0,
                3 => $summaryCounts[3] ?? 0,
            ];

            if ($request->has('status_id') && $request->input('status_id') !== null && $request->input('status_id') !== 'all') {
                $query->where('status_id', $request->input('status_id'));
            }

            $limit = $request->input('limit', 20);
            $data = $query->orderBy('id', 'desc')->paginate($limit);

            if($data->count() > 0){
                return response()->json(['status' => 1, 'message' => 'Get ' . $tx . ' success', 'data' => $data, 'summary' => $summary], 200);
            } else {
                return response()->json(['status' => 0, 'message' => 'Leads Get ' . $tx . ' not found', 'data' => $data, 'summary' => $summary], 200);
            }
        } catch (Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'An error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function autoBusinessLeadGenerate(Request $request)
    {
        try {

            $sevenDaysAgo = now()->subDays(7);

           $employees = User::where('role', 19)
                ->orderBy('created_at', 'asc')
                ->get();

            if ($employees->isEmpty()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'No employees found',
                ]);
            }

            $employeeIndex = 0;
            $employeeCount = $employees->count();

          $users = User::join('aeps_drafts', 'users.mid', '=', 'aeps_drafts.mid')
            ->where('users.status', 1)
            ->where('users.role', 10)
            ->where('aeps_drafts.aeps_status', '>', 2)
            ->whereNotIn('users.mid', function ($query) use ($sevenDaysAgo) {
                $query->select('mid')
                    ->from('aeps_transactions')
                    ->where('aeps_type', 'CW')
                    ->where('created_at', '>=', $sevenDaysAgo);
            })
            ->select('users.*')
            ->get();

            foreach ($users as $user) {

                // ❌ Skip if lead generated in last 7 days
                $recentLead = DB::table('calling_datas')
                    ->where('phone', $user->mobile)
                    ->where('created_at', '>=', $sevenDaysAgo)
                    ->exists();

                if ($recentLead) {
                    continue;
                }

                // Get latest lead

                $existingLead = DB::table('calling_datas')
                    ->where('phone', $user->mobile)
                    ->orderBy('id', 'desc')
                    ->first();

                // ❌ Skip Not Interested & Rejected
                if ($existingLead && in_array($existingLead->status, [3])) {
                    continue;
                }


                // ✅ New lead → Round Robin assign
                $employee = $employees[$employeeIndex];
                $assignedUserId = $employee->id ?? null;

                if (!$assignedUserId) {
                    continue;
                }

                DB::table('calling_datas')->insert([
                    'user_id' => $assignedUserId,
                    'name' => $user->name,
                    'phone' => $user->mobile,
                    'type'  => 'Bussiness',
                    'status_id' => 0,
                    'created_by' => 21,
                    'admin_id'   => 21
                ]);

                // Move to next employee
                $employeeIndex++;
                if ($employeeIndex >= $employeeCount) {
                    $employeeIndex = 0;
                }
            }

            return response()->json([
                'status' => 1,
                'message' => 'Auto lead generation completed successfully',
            ]);

        } catch (\Throwable $th) {

            $refId = CatchLogService::logException($request, 'Auto Lead Generate', $th, [
                'context' => 'Auto Lead Generate error',
            ]);

            return response()->json([
                'status' => 0,
                'message' => 'Something went wrong',
                'ref_id' => $refId
            ], 500);
        }
    }


    public function autoKycLeadGenerate(Request $request)
    {
        try {

            $sevenDaysAgo = now()->subDays(7);

            $employees = User::where('role', 19)
                ->orderBy('created_at', 'asc')
                ->get();

            if ($employees->isEmpty()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'No employees found',
                ]);
            }

            $employeeIndex = 0;
            $employeeCount = $employees->count();

           $users = User::leftJoin('aeps_drafts', 'users.mid', '=', 'aeps_drafts.mid')
            ->where('users.status', 1)
            ->where('users.role', 10)
            ->where(function ($query) {
                $query->whereNull('aeps_drafts.mid')
                    ->orWhere('aeps_drafts.aeps_status', '<', 3);
            })
            ->select('users.*')
            ->get();

            foreach ($users as $user) {

                // ❌ Skip if lead generated in last 7 days
                $recentLead = DB::table('calling_datas')
                    ->where('phone', $user->mobile)
                    ->where('created_at', '>=', $sevenDaysAgo)
                    ->exists();

                if ($recentLead) {
                    continue;
                }

                // Get latest lead

                $existingLead = DB::table('calling_datas')
                    ->where('phone', $user->mobile)
                    ->orderBy('id', 'desc')
                    ->first();

                // ❌ Skip Not Interested & Rejected
                if ($existingLead && in_array($existingLead->status, [3])) {
                    continue;
                }


                // ✅ New lead → Round Robin assign
                $employee = $employees[$employeeIndex];
                $assignedUserId = $employee->id ?? null;

                if (!$assignedUserId) {
                    continue;
                }

                DB::table('calling_datas')->insert([
                    'user_id' => $assignedUserId,
                    'name' => $user->name,
                    'phone' => $user->mobile,
                    'type'  => 'KYC Pending',
                    'status_id' => 0,
                    'created_by' => 21,
                    'admin_id'   => 21
                ]);

                // Move to next employee
                $employeeIndex++;
                if ($employeeIndex >= $employeeCount) {
                    $employeeIndex = 0;
                }
            }

            return response()->json([
                'status' => 1,
                'message' => 'Auto lead generation completed successfully',
            ]);

        } catch (\Throwable $th) {

            $refId = CatchLogService::logException($request, 'Auto Lead Generate', $th, [
                'context' => 'Auto Lead Generate error',
            ]);

            return response()->json([
                'status' => 0,
                'message' => 'Something went wrong',
                'ref_id' => $refId
            ], 500);
        }
    }

    public function updateStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:calling_datas,id',
            'status' => 'required|in:0,1,2,3'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 400);
        }

        try {
            DB::table('calling_datas')
                ->where('id', $request->input('id'))
                ->update(['status_id' => $request->input('status')]);

            return response()->json(['status' => 1, 'message' => 'Status updated successfully'], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'An error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function datewiseLeadBreakdown(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 400);
        }

        try {
           $data = DB::table('calling_datas')
        ->where('status_id', 1)
        ->whereDate('created_at', '>=', $request->input('from'))
        ->whereDate('created_at', '<=', $request->input('to'))
        ->select(
            'created_by',
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as total_leads')
        )
        ->groupBy('created_by', DB::raw('DATE(created_at)'))
        ->get();

            return response()->json(['status' => 1, 'message' => 'Leads fetched successfully', 'data' => $data], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'An error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }


}