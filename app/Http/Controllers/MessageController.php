<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use DB;

class MessageController extends Controller
{
    // List messages for authenticated user
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            $messages = DB::table('messages')
                ->where('user_id', $user->id)
                ->select('id', 'user_id', 'name', 'template_id', 'message')
                ->get();

            return response()->json([ 'status' => 1, 'message' => 'Messages retrieved', 'messages' => $messages ]);
        } catch (\Exception $e) {
            return response()->json([ 'status' => 0, 'message' => 'Failed to retrieve messages', 'error' => $e->getMessage() ], 500);
        }
    }

    // Store new message
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'template_id' => 'nullable|string|max:255',
            'message' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([ 'status' => 0, 'message' => 'Validation failed', 'error' => $validator->errors() ], 422);
        }

        try {
            $user = Auth::user();
            $id = DB::table('messages')->insertGetId([
                'user_id' => $user->id,
                'name' => $request->name,
                'template_id' => $request->template_id,
                'message' => $request->message
            ]);

            $message = DB::table('messages')->where('id', $id)->first();

            return response()->json([ 'status' => 1, 'message' => 'Message created', 'data' => $message ]);
        } catch (\Exception $e) {
            return response()->json([ 'status' => 0, 'message' => 'Failed to create message', 'error' => $e->getMessage() ], 500);
        }
    }

    // Show single message
    public function show($id)
    {
        try {
            $user = Auth::user();
            $message = DB::table('messages')->where('id', $id)->where('user_id', $user->id)->first();
            if (!$message) return response()->json([ 'status' => 0, 'message' => 'Message not found' ], 404);
            return response()->json([ 'status' => 1, 'message' => 'Message retrieved', 'message' => $message ]);
        } catch (\Exception $e) {
            return response()->json([ 'status' => 0, 'message' => 'Failed to retrieve message', 'error' => $e->getMessage() ], 500);
        }
    }

    // Update message
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'template_id' => 'nullable|string|max:255',
            'message' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([ 'status' => 0, 'message' => 'Validation failed', 'error' => $validator->errors() ], 422);
        }

        try {
            $user = Auth::user();
            $updated = DB::table('messages')->where('id', $id)->where('user_id', $user->id)->update([
                'name' => $request->name,
                'template_id' => $request->template_id,
                'message' => $request->message
            ]);

            if (!$updated) return response()->json([ 'status' => 0, 'message' => 'Message not found or no changes made' ], 404);

            $message = DB::table('messages')->where('id', $id)->first();
            return response()->json([ 'status' => 1, 'message' => 'Message updated', 'data' => $message ]);
        } catch (\Exception $e) {
            return response()->json([ 'status' => 0, 'message' => 'Failed to update message', 'error' => $e->getMessage() ], 500);
        }
    }

    // Delete message
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            $deleted = DB::table('messages')->where('id', $id)->where('user_id', $user->id)->delete();
            if (!$deleted) return response()->json([ 'status' => 0, 'message' => 'Message not found' ], 404);
            return response()->json([ 'status' => 1, 'message' => 'Message deleted' ]);
        } catch (\Exception $e) {
            return response()->json([ 'status' => 0, 'message' => 'Failed to delete message', 'error' => $e->getMessage() ], 500);
        }
    }
}
