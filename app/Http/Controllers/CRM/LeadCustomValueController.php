<?php
namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\LeadCustomValue;
use Illuminate\Http\Request;

class LeadCustomValueController extends Controller
{
    public function index(Request $request) {

        if($request->get('isAdmin')) {
            return LeadCustomValue::where('admin_id', $request->get('admin')->id)
            ->get(); 
        } else {
            return LeadCustomValue::where('created_by', $request->get('user')->id)
            ->get();
        }
    }
    
    public function store(Request $request) {
        $data = $request->validate([
            'lead_id' => 'required|integer',
            'custom_field_id' => 'required|integer',
            'value' => 'nullable|string',
        ]);
        $data['created_by'] = $request->get('user')->id;
        $data['admin_id'] = $request->get('admin')->id;
        return LeadCustomValue::create($data);
    }
    public function show($id) { return LeadCustomValue::findOrFail($id); }
    public function update(Request $request, $id) {
        $val = LeadCustomValue::findOrFail($id);
        $val->update($request->all());
        return $val;
    }
    public function destroy(Request $request, $id) {
        $leadCustomValue = LeadCustomValue::findOrFail($id);
        $leadCustomValue->update(['deleted_by' => $request->get('user')->id]);
        $leadCustomValue->delete(); // This will soft delete

        return response()->json(['success' => true]);
    }
}
