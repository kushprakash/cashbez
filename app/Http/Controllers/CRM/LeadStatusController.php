<?php
namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\LeadStatus;
use Illuminate\Http\Request;

class LeadStatusController extends Controller
{
    public function index(Request $request) {
        $query = LeadStatus::with(['followupType']);
        $query->where('admin_id', $request->get('admin')->id);

        // Filter by followup type if provided
        if ($request->has('followup_type_id')) {
            $query->where('followup_type_id', $request->followup_type_id);
        }

        return $query->get();
    }
    
    public function store(Request $request) {
        $data = $request->validate([
            'name' => 'required|string|max:50',
            'color' => 'nullable|string|max:20',
            'followup_type_id' => 'nullable|exists:followup_types,id',
        ]);

        $data['created_by'] = $request->get('user')->id;
        $data['admin_id'] = $request->get('admin')->id;
        return LeadStatus::create($data);
    }
    
    public function show($id) { 
        return LeadStatus::with(['followupType'])->findOrFail($id); 
    }
    
    public function update(Request $request, $id) {
        $leadStatus = LeadStatus::findOrFail($id);
        
        $data = $request->validate([
            'name' => 'sometimes|string|max:50',
            'color' => 'nullable|string|max:20',
            'followup_type_id' => 'nullable|exists:followup_types,id',
        ]);
        
        $leadStatus->update($data);
        return $leadStatus;
    }
    
    public function destroy(Request $request, $id) {
        $leadStatus = LeadStatus::findOrFail($id);
        $leadStatus->update(['deleted_by' => $request->get('user')->id]);
        $leadStatus->delete(); // This will soft delete

       
        return response()->json(['success' => true, 'message' => 'Lead status deleted successfully']);
    }
}
