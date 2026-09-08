<?php

namespace App\Http\Controllers\OnlineService;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\SavingAccountApplication;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class SavingAccountController extends Controller
{
    public function index()
    {
        $applications = SavingAccountApplication::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 1,
            'data' => $applications
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bank_name' => 'required|string|max:255',
            'customer_name' => 'required|string|max:255',
            'mobile_number' => 'required|string|max:20',
            'account_number' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->all();
            $data['user_id'] = Auth::id();
            $data['status'] = 0; // 0: pending
            if($request->has('admin')) {
                 $data['admin_id'] = $request->get('admin')->id;
            }


            $application = SavingAccountApplication::create($data);

            return response()->json([
                'status' => 1,
                'message' => 'Saving Account Application submitted successfully.',
                'data' => $application
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Something went wrong: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $application = SavingAccountApplication::with('user')->find($id);

        if (!$application) {
            return response()->json(['status' => 0, 'message' => 'Application not found'], 404);
        }

        return response()->json(['status' => 1, 'data' => $application]);
    }

    // Admin Methods
    public function adminList()
    {
        $applications = SavingAccountApplication::with('user')->orderBy('created_at', 'desc')->get();
        return response()->json(['status' => 1, 'data' => $applications]);
    }

    public function adminDashboard()
    {
         $total = SavingAccountApplication::count();
         $pending = SavingAccountApplication::where('status', 0)->count();
         $approved = SavingAccountApplication::where('status', 1)->count();
         $rejected = SavingAccountApplication::where('status', 2)->count();

         return response()->json(['status' => 1, 'data' => compact('total', 'pending', 'approved', 'rejected')]);
    }
    
    public function dashboard()
     {
         $user_id = Auth::id();
         $total = SavingAccountApplication::where('user_id', $user_id)->count();
         $pending = SavingAccountApplication::where('user_id', $user_id)->where('status', 0)->count();
         $approved = SavingAccountApplication::where('user_id', $user_id)->where('status', 1)->count();
         $rejected = SavingAccountApplication::where('user_id', $user_id)->where('status', 2)->count();

         return response()->json(['status' => 1, 'data' => compact('total', 'pending', 'approved', 'rejected')]);
    }

    public function updateStatus(Request $request, $id)
    {
        $application = SavingAccountApplication::find($id);
        if (!$application) {
            return response()->json(['status' => 0, 'message' => 'Application not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required',
            'remarks' => 'nullable|string',
            'payout_amount' => 'nullable|numeric'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 422);
        }

        $statusMap = [
            'pending' => 0,
            'approved' => 1,
            'rejected' => 2,
        ];

        $application->status = $statusMap[$request->status] ?? 0;
        if ($request->has('remarks')) {
            $application->remarks = $request->remarks;
        }
        if ($request->has('payout_amount')) {
            $application->payout_amount = $request->payout_amount;
        }
        // $application->admin_id = Auth::id(); // If using admin auth 
        $application->save();

        return response()->json(['status' => 1, 'message' => 'Status updated successfully']);
    }
}
