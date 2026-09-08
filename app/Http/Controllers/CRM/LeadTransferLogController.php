<?php
namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\LeadTransferLog;
use App\Services\LeadActivityService;
use Illuminate\Http\Request;

class LeadTransferLogController extends Controller
{
    public function index(Request $request) {

        if($request->get('isAdmin')) {
            return LeadTransferLog::where('admin_id', $request->get('admin')->id)
            ->get(); 
        } else {
            return LeadTransferLog::where('created_by', $request->get('user')->id)
            ->get();
        }
    }

    public function store(Request $request) {
        $data = $request->validate([
            'lead_id' => 'required|integer',
            'from_user_id' => 'required|integer',
            'to_user_id' => 'required|integer',
            'reason' => 'nullable|string',
        ]);
        $data['created_by'] = $request->get('user')->id;
        $data['admin_id'] = $request->get('admin')->id;
        
        $transferLog = LeadTransferLog::create($data);
        
        // Auto-log lead assignment activity
        LeadActivityService::logLeadAssigned(
            $data['lead_id'], 
            $data['from_user_id'], 
            $data['to_user_id'], 
            $data['reason'] ?? null, 
            $request->get('user')->id, 
            $request->get('admin')->id
        );
        
        return $transferLog;
    }
    public function show($id) { return LeadTransferLog::findOrFail($id); }
    public function update(Request $request, $id) {
        $log = LeadTransferLog::findOrFail($id);
        $log->update($request->all());
        return $log;
    }
    public function destroy(Request $request, $id) {
        $leadTransferLog = LeadTransferLog::findOrFail($id);
        $leadTransferLog->update(['deleted_by' => $request->get('user')->id]);
        $leadTransferLog->delete(); // This will soft delete
        return response()->json(['success' => true]);
    }
}
