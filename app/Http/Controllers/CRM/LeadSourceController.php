<?php
namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\LeadSource;
use Illuminate\Http\Request;

class LeadSourceController extends Controller
{
    public function index(Request $request) {

        $query = LeadSource::query();

        if($request->get('isAdmin')) {
            $query->where('admin_id', $request->get('admin')->id);
        }

        // Filter by lead type if provided
        if ($request->has('lead_type_id') && $request->lead_type_id) {
            $query->where('lead_type_id', $request->lead_type_id);
        }

        return $query->get();
    }

    public function store(Request $request) {
        $data = $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $data['created_by'] = $request->get('user')->id;
        $data['admin_id'] = $request->get('admin')->id;
        return LeadSource::create($data);
    }
    
    public function show($id) { return LeadSource::findOrFail($id); }
    
    public function update(Request $request, $id) {
        $leadSource = LeadSource::findOrFail($id);
        $leadSource->update($request->all());
        return $leadSource;
    }
    
    public function destroy(Request $request, $id) {

        $leadSource = LeadSource::findOrFail($id);
        $leadSource->update(['deleted_by' => $request->get('user')->id]);
        $leadSource->delete(); // This will soft delete

        return response()->json(['success' => true, 'message' => 'Lead source deleted successfully']);
    }
}
