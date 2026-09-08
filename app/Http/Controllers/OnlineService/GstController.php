<?php

namespace App\Http\Controllers\OnlineService;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\GstApplication;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use App\Services\BunnyStorageService;
use DB;

class GstController extends Controller
{
    protected BunnyStorageService $bunnyStorage;

    public function __construct(BunnyStorageService $bunnyStorage)
    {
        $this->bunnyStorage = $bunnyStorage;
    }

    public function index()
    {
        $applications = GstApplication::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 1,
            'data' => $applications
        ]);
    }

    public function store(Request $request)
    {
        // Base validation rules
        $rules = [
            'bussiness_name' => 'required|string|max:255',
            'bussiness_owner_name' => 'required|string|max:255',
            'mobile_number' => 'required|string|max:20',
            'email_id' => 'required|email|max:255',
            'pancard_number' => 'required|string|max:50',
            'aadharcard_number' => 'required|string|max:50',
            'bussiness_address_type_name' => 'required|string|max:255',
            'pancard_file' => 'required|string|max:255',
            'aadharcard_front' => 'required|string|max:255',
            'aadharcard_back' => 'required|string|max:255',
            'bussiness_address_file' => 'required|string|max:255',
            'shop_banner' => 'required|string|max:255',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        try {


            $user = User::find(Auth::id());
            $account = DB::table('accounts')->where('user_id', $user->id)->where('primary_status', true)->first();
            $requestData=[
                'account_id' => $account->id,
                'type' => 'DR',
                'amount' => 499,
                'description' => 'GST Application',
                'transaction_id' => 'GST' . rand(111111, 999999),
                'created_by' => $user->id,
                'admin_id' => $account->admin_id,
                'user_id' => $user->id,
                'category_code' => 'GST'
            ];
            
            $transactionData=createTransaction($requestData);


            if($transactionData['status'] == 0) {
                return response()->json(['status' => 0, 'message' => $transactionData['message'], 'data' => NULL], 200);
            }

            
            $data = $request->except([
                'pancard_file', 'aadharcard_front', 'aadharcard_back', 
                'bussiness_address_file', 'shop_banner', 'aplication_reciept'
            ]);

            $data['user_id'] = Auth::id();
            $data['status'] = 0; // 0: pending
            $data['admin_id'] = $request->get('admin')->id;
            
            // File Uploads - Accept either file uploads OR URL strings (from frontend direct CDN upload)
            $files = ['pancard_file', 'aadharcard_front', 'aadharcard_back', 'bussiness_address_file', 'shop_banner'];
            
            foreach ($files as $fileKey) {
                // First check if URL string was passed (frontend direct upload to BunnyCDN)
                if ($request->has($fileKey) && is_string($request->input($fileKey)) && filter_var($request->input($fileKey), FILTER_VALIDATE_URL)) {
                    $data[$fileKey] = $request->input($fileKey);
                }
                // Fallback: handle file upload through server (legacy/admin uploads)
                elseif ($request->hasFile($fileKey)) {
                    $result = $this->bunnyStorage->upload($request->file($fileKey), 'gst_documents');
                    if (!$result['success']) {
                        throw new \Exception("Upload failed for {$fileKey}: " . $result['error']);
                    }
                    $data[$fileKey] = $result['url'];
                }
            }

            $application = GstApplication::create($data);

            return response()->json([
                'status' => 1,
                'message' => 'GST Application submitted successfully.',
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
        $application = GstApplication::with('user')->find($id);

        if (!$application) {
            return response()->json(['status' => 0, 'message' => 'Application not found'], 404);
        }

        // Optional permission check here

        return response()->json(['status' => 1, 'data' => $application]);
    }

    // Admin Methods
    public function adminList()
    {
        $applications = GstApplication::with('user')->orderBy('created_at', 'desc')->get();
        return response()->json(['status' => 1, 'data' => $applications]);
    }

    public function adminDashboard()
    {
         $total = GstApplication::count();
         $pending = GstApplication::where('status', 0)->count();
         $approved = GstApplication::where('status', 1)->count();
         $rejected = GstApplication::where('status', 2)->count();

         return response()->json(['status' => 1, 'data' => compact('total', 'pending', 'approved', 'rejected')]);
    }
    
    public function dashboard()
     {
         $user_id = Auth::id();
         $total = GstApplication::where('user_id', $user_id)->count();
         $pending = GstApplication::where('user_id', $user_id)->where('status', 0)->count();
         $approved = GstApplication::where('user_id', $user_id)->where('status', 1)->count();
         $rejected = GstApplication::where('user_id', $user_id)->where('status', 2)->count();

         return response()->json(['status' => 1, 'data' => compact('total', 'pending', 'approved', 'rejected')]);
    }

    public function updateStatus(Request $request, $id)
    {
        $application = GstApplication::find($id);
        if (!$application) {
            return response()->json(['status' => 0, 'message' => 'Application not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,approved,rejected,error',
            'message' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 422);
        }

        $statusMap = [
            'pending' => 0,
            'approved' => 1,
            'rejected' => 2,
            'error' => 3
        ];

        $application->status = $statusMap[$request->status] ?? 0;
        if ($request->has('message')) {
            $application->message = $request->message;
        }
        $application->updated_by = Auth::id(); 
        $application->save();

           if($request->status == 'approved') {
            $user = User::find(Auth::id());
            $account = DB::table('accounts')->where('user_id', $user->id)->where('primary_status', true)->first();
            $requestData=[
                'account_id' => $account->id,
                'type' => 'CR',
                'amount' => 300,
                'description' => 'GST Application',
                'transaction_id' => 'GST' . rand(111111, 999999),
                'created_by' => $user->id,
                'admin_id' => $account->admin_id,
                'user_id' => $user->id,
                'category_code' => 'GST'
            ];
            
            $transactionData=createTransaction($requestData);
        }

        return response()->json(['status' => 1, 'message' => 'Status updated successfully']);
    }

    public function uploadReceipt(Request $request, $id)
    {
        $application = GstApplication::find($id);
        if (!$application) {
            return response()->json(['status' => 0, 'message' => 'Application not found'], 404);
        }

        // File validation - PDF and images only, max 500KB
        $validator = Validator::make($request->all(), [
            'aplication_reciept' => 'required|file|mimes:jpeg,jpg,png,gif,webp,pdf|mimetypes:image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf|max:512', 
        ]);

        if ($validator->fails()) {
             return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 422);
        }

        if ($request->hasFile('aplication_reciept')) {
            $result = $this->bunnyStorage->upload($request->file('aplication_reciept'), 'gst_receipts');
            if (!$result['success']) {
                return response()->json(['status' => 0, 'message' => 'Upload failed: ' . $result['error']], 500);
            }
            $application->aplication_reciept = $result['url'];
            $application->save();
        }

        return response()->json(['status' => 1, 'message' => 'Receipt uploaded successfully', 'path' => $application->aplication_reciept]);
    }

}

