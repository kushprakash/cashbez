<?php
namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\LeadType;
use Illuminate\Http\Request;

class LeadTypeController extends Controller
{

    public function index(Request $request) {
        return LeadType::where('admin_id', $request->get('admin')->id)
        ->get(); 
    }
    
    public function store(Request $request) {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
        ]);

        $data['created_by'] = $request->get('user')->id;
        $data['admin_id'] = $request->get('admin')->id;
        return LeadType::create($data);
    }
    
    public function show($id) { return LeadType::findOrFail($id); }
    
    public function update(Request $request, $id) {
        $leadType = LeadType::findOrFail($id);
        $leadType->update($request->all());
        return $leadType;
    }
    
    public function destroy(Request $request, $id) {
        $leadType = LeadType::findOrFail($id);
        $leadType->update(['deleted_by' => $request->get('user')->id]);
        $leadType->delete(); // This will soft delete
        return response()->json(['success' => true, 'message' => 'Lead type deleted successfully']);
    }
}
