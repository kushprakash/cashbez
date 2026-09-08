<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\QueryException;
use DB;

class MessageTypeController extends Controller
{
    public function index()
    {
        try {
          
            $types = DB::table('message_type')->select('id', 'name', 'message', 'status')->get();
            return response()->json(['status' => 1, 'message' => 'Message types retrieved', 'data' => $types]);
            
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => 'Failed to retrieve message types', 'error' => $e->getMessage()], 200);
        }
    }

    public function show($id)
    {
        try {
            $user = Auth::user();
            try {
                $type = DB::table('message_type')->where('id', $id)->where('user_id', $user->id)->first();
            } catch (QueryException $qe) {
                $type = DB::table('message_type')->where('id', $id)->first();
            }
            if (!$type) return response()->json(['status' => 0, 'message' => 'Not found'], 404);
            return response()->json(['status' => 1, 'message' => 'Message type retrieved', 'data' => $type]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => 'Failed to retrieve message type', 'error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'message' => 'required|string',
            'status' => 'nullable|in:0,1'
        ]);
        if ($validator->fails()) return response()->json(['status' => 0, 'message' => 'Validation failed', 'error' => $validator->errors()], 422);

        try {
            $user = Auth::user();
            try {
                $id = DB::table('message_type')->insertGetId([
                    'user_id' => $user->id,
                    'name' => $request->name,
                    'message' => $request->message,
                    'status' => $request->status ?? 1
                ]);
            } catch (QueryException $qe) {
                // fallback if user_id column missing
                $id = DB::table('message_type')->insertGetId([
                    'name' => $request->name,
                    'message' => $request->message,
                    'status' => $request->status ?? 1
                ]);
            }
            $type = DB::table('message_type')->where('id', $id)->first();
            return response()->json(['status' => 1, 'message' => 'Message type created', 'data' => $type]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => 'Failed to create message type', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'message' => 'required|string',
            'status' => 'nullable|in:0,1'
        ]);
        if ($validator->fails()) return response()->json(['status' => 0, 'message' => 'Validation failed', 'error' => $validator->errors()], 422);

        try {
            $user = Auth::user();
            try {
                $updated = DB::table('message_type')->where('id', $id)->where('user_id', $user->id)->update([
                    'name' => $request->name,
                    'message' => $request->message,
                    'status' => $request->status ?? 1
                ]);
            } catch (QueryException $qe) {
                $updated = DB::table('message_type')->where('id', $id)->update([
                    'name' => $request->name,
                    'message' => $request->message,
                    'status' => $request->status ?? 1
                ]);
            }
            if (!$updated) return response()->json(['status' => 0, 'message' => 'Not found or no change'], 404);
            $type = DB::table('message_type')->where('id', $id)->first();
            return response()->json(['status' => 1, 'message' => 'Message type updated', 'data' => $type]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => 'Failed to update message type', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $user = Auth::user();
            try {
                $deleted = DB::table('message_type')->where('id', $id)->where('user_id', $user->id)->delete();
            } catch (QueryException $qe) {
                $deleted = DB::table('message_type')->where('id', $id)->delete();
            }
            if (!$deleted) return response()->json(['status' => 0, 'message' => 'Not found'], 404);
            return response()->json(['status' => 1, 'message' => 'Deleted']);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => 'Failed to delete', 'error' => $e->getMessage()], 500);
        }
    }
}
