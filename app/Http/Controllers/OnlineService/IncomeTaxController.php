<?php

namespace App\Http\Controllers\OnlineService;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\IncomeTaxApplication;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use App\Services\BunnyStorageService;
use DB;

class IncomeTaxController extends Controller
{
    protected BunnyStorageService $bunnyStorage;

    public function __construct(BunnyStorageService $bunnyStorage)
    {
        $this->bunnyStorage = $bunnyStorage;
    }

    public function index()
    {
        $applications = IncomeTaxApplication::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 1,
            'data' => $applications
        ]);
    }

    public function store(Request $request)
    {
        // Common rules
        $rules = [
            'application_type' => 'required|in:individual,business',
            'mobile_number' => 'required|string|max:20',
            'email_id' => 'required|email|max:255',
            'pan_number' => 'required|string|max:50',
            'aadhar_number' => 'required|string|max:50',
            'bank_account_no' => 'required|string|max:50',
            'ifsc_code' => 'required|string|max:20',
            'pan_file' => 'required|string|max:255',
            'aadhar_front_file' => 'required|string|max:255',
            'aadhar_back_file' => 'required|string|max:255',
            'id_proof_file' => 'required|string|max:255',
            'bank_statement_file' => 'required|string|max:255',
            'form_16_file' => 'required|string|max:255',
        ];

        // Conditional rules
        if ($request->application_type === 'individual') {
             // Specific to individual/salaried
             // Form 16 or Salary Slip
        } elseif ($request->application_type === 'business') {
            $rules['bussiness_name'] = 'required|string|max:255';
            $rules['nature_of_business'] = 'required|string|max:255';
            $rules['total_sales'] = 'required|numeric';
            // Form 16A is requested in image for business
        }

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
                'description' => 'Income Tax Application',
                'transaction_id' => 'IncomeTax' . rand(111111, 999999),
                'created_by' => $user->id,
                'admin_id' => $account->admin_id,
                'user_id' => $user->id,
                'category_code' => 'IncomeTax'
            ];
            
            $transactionData=createTransaction($requestData);


            if($transactionData['status'] == 0) {
                return response()->json(['status' => 0, 'message' => $transactionData['message'], 'data' => NULL], 200);
            }

          
            $data = $request->except([
                'pan_file', 'aadharcard_front', 'aadharcard_back', 'id_proof_file',
                'bussiness_address_file', 'shop_banner', 'application_reciept', 
                'form_16_file', 'bank_statement_file',
                'aadhar_front_file', 'aadhar_back_file'
            ]);
            
            $data['user_id'] = Auth::id();
            $data['status'] = 0; // 0: pending
            
            // Handle Admin Assignment if present in request (mimicking GST logic)
            if ($request->has('admin')) {
                $data['admin_id'] = $request->get('admin')->id ?? null;
            }

            // File Uploads - Accept either file uploads OR URL strings (from frontend direct CDN upload)
            $filesToUpload = [
                'pan_file', 
                'aadhar_front_file', 
                'aadhar_back_file', 
                'id_proof_file', 
                'bank_statement_file', 
                'form_16_file'
            ];
            
            foreach ($filesToUpload as $fileKey) {
                // First check if URL string was passed (frontend direct upload to BunnyCDN)
                if ($request->has($fileKey) && is_string($request->input($fileKey)) && filter_var($request->input($fileKey), FILTER_VALIDATE_URL)) {
                    $data[$fileKey] = $request->input($fileKey);
                }
                // Fallback: handle file upload through server (legacy/admin uploads)
                elseif ($request->hasFile($fileKey)) {
                    $result = $this->bunnyStorage->upload($request->file($fileKey), 'income_tax_documents');
                    if (!$result['success']) {
                        throw new \Exception("Upload failed for {$fileKey}: " . $result['error']);
                    }
                    $data[$fileKey] = $result['url'];
                }
            }

            $application = IncomeTaxApplication::create($data);

            return response()->json([
                'status' => 1,
                'message' => 'Income Tax Application submitted successfully.',
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
        $application = IncomeTaxApplication::with('user')->find($id);

        if (!$application) {
            return response()->json(['status' => 0, 'message' => 'Application not found'], 404);
        }

        return response()->json(['status' => 1, 'data' => $application]);
    }

    // Admin Methods
    public function adminList()
    {
        $applications = IncomeTaxApplication::with('user')->orderBy('created_at', 'desc')->get();
        return response()->json(['status' => 1, 'data' => $applications]);
    }

    public function adminDashboard()
    {
         $total = IncomeTaxApplication::count();
         $pending = IncomeTaxApplication::where('status', 0)->count();
         $approved = IncomeTaxApplication::where('status', 1)->count();
         $rejected = IncomeTaxApplication::where('status', 2)->count();

         return response()->json(['status' => 1, 'data' => compact('total', 'pending', 'approved', 'rejected')]);
    }
    
    public function dashboard()
     {
         $user_id = Auth::id();
         $total = IncomeTaxApplication::where('user_id', $user_id)->count();
         $pending = IncomeTaxApplication::where('user_id', $user_id)->where('status', 0)->count();
         $approved = IncomeTaxApplication::where('user_id', $user_id)->where('status', 1)->count();
         $rejected = IncomeTaxApplication::where('user_id', $user_id)->where('status', 2)->count();

         return response()->json(['status' => 1, 'data' => compact('total', 'pending', 'approved', 'rejected')]);
    }

    public function updateStatus(Request $request, $id)
    {
        $application = IncomeTaxApplication::find($id);
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
                'description' => 'Income Tax Application',
                'transaction_id' => 'IncomeTax' . rand(111111, 999999),
                'created_by' => $user->id,
                'admin_id' => $account->admin_id,
                'user_id' => $user->id,
                'category_code' => 'IncomeTax'
            ];
            
            $transactionData=createTransaction($requestData);
        }

        return response()->json(['status' => 1, 'message' => 'Status updated successfully']);
    }

    public function uploadReceipt(Request $request, $id)
    {
        $application = IncomeTaxApplication::find($id);
        if (!$application) {
            return response()->json(['status' => 0, 'message' => 'Application not found'], 404);
        }

        // File validation - PDF and images only, max 500KB
        $validator = Validator::make($request->all(), [
            'application_reciept' => 'required|file|mimes:jpeg,jpg,png,gif,webp,pdf|mimetypes:image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf|max:512', 
        ]);

        if ($validator->fails()) {
             return response()->json(['status' => 0, 'message' => $validator->errors()->first()], 422);
        }

        if ($request->hasFile('application_reciept')) {
            $result = $this->bunnyStorage->upload($request->file('application_reciept'), 'income_tax_receipts');
            if (!$result['success']) {
                return response()->json(['status' => 0, 'message' => 'Upload failed: ' . $result['error']], 500);
            }
            $application->application_reciept = $result['url'];
            $application->save();
        }

        return response()->json(['status' => 1, 'message' => 'Receipt uploaded successfully', 'path' => $application->application_reciept]);
    }


}
