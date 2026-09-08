<?php
namespace App\Http\Controllers;

use App\Models\ModuleCommission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class ModuleCommissionController extends Controller
{
    public function index(Request $request)
    {

        $user=$request->get('user');

        if($request->get('isSuper')==true){
            // Admin: return all permissions
            $commissions = ModuleCommission::all();
        } else {
            // Non-admin: return only permissions assigned to this user
            $permissionIds = \DB::table('user_role_commissions')
                ->where('user_id', $user->id)
                ->pluck('commission_id');
            $commissions = ModuleCommission::where('user_id', $user->id)->get();
        }

        return response()->json(['status' => 1, 'commissions' => $commissions]);
        
       
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'main_module_id' => 'required|exists:main_modules,id',
            'module_id' => 'required|exists:modules,id',
            'sub_module_id' => 'nullable|exists:sub_modules,id',
            'mode' => 'nullable|string',
            'from_amt' => 'nullable|numeric',
            'to_amt' => 'nullable|numeric',
            'commission_type' => 'nullable|string',
            'commission' => 'required|numeric',
            'txn_type' => 'required|in:Commission,Charge',
            'status' => 'required|in:0,1',
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()]);
        }

        $user=$request->get('user');

        $request->merge(['user_id' => $user->id]);
        $commission = ModuleCommission::create($request->all());
        return response()->json(['status' => 1, 'commission' => $commission]);
    }

    public function show($id)
    {
        $commission = ModuleCommission::with(['mainModule', 'module', 'subModule'])->find($id);
        if (!$commission) {
            return response()->json(['status' => 0, 'message' => 'Not found']);
        }
        return response()->json(['status' => 1, 'commission' => $commission]);
    }

    public function update(Request $request, $id)
    {
        $commission = ModuleCommission::find($id);
        if (!$commission) {
            return response()->json(['status' => 0, 'message' => 'Not found']);
        }
        $validator = Validator::make($request->all(), [
            'main_module_id' => 'required|exists:main_modules,id',
            'module_id' => 'required|exists:modules,id',
            'sub_module_id' => 'nullable|exists:sub_modules,id',
            'mode' => 'nullable|string',
            'from_amt' => 'nullable|numeric',
            'to_amt' => 'nullable|numeric',
            'commission_type' => 'nullable|string',
            'commission' => 'required|numeric',
            'txn_type' => 'required|in:Commission,Charge',
            'status' => 'required|in:0,1',
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 0, 'message' => $validator->errors()->first()]);
        }
        $commission->update($request->all());
        return response()->json(['status' => 1, 'commission' => $commission]);
    }

    public function destroy($id)
    {
        $commission = ModuleCommission::find($id);
        if (!$commission) {
            return response()->json(['status' => 0, 'message' => 'Not found']);
        }
        $commission->delete();
        return response()->json(['status' => 1, 'message' => 'Deleted successfully']);
    }
}


