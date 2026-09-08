<?php
namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\CustomField;
use Illuminate\Http\Request;

class CustomFieldController extends Controller
{


    public function index(Request $request) {

        if($request->get('isAdmin')) {
            return CustomField::where('admin_id', $request->get('admin')->id)
            ->get(); 
        } else {
            return CustomField::where('created_by', $request->get('user')->id)
            ->get();
        }
    }

    public function store(Request $request) {
        $data = $request->validate([
            'lead_type_id' => 'required|integer',
            'field_name' => 'required|string|max:100',
            'field_type' => 'required|in:text,number,date,dropdown',
            'options' => 'nullable|array',
            'required' => 'required|boolean',
        ]);
        $data['created_by'] = $request->get('user')->id;
        $data['admin_id'] = $request->get('admin')->id;
        return CustomField::create($data);
    }
    public function show($id) { return CustomField::findOrFail($id); }
    public function update(Request $request, $id) {
        $field = CustomField::findOrFail($id);
        $field->update($request->all());
        return $field;
    }
    public function destroy(Request $request, $id) {
        $field = CustomField::findOrFail($id);
        $field->update(['deleted_by' => $request->get('user')->id]);
        $field->delete(); // This will soft delete

        return response()->json(['success' => true]);
    }
}
