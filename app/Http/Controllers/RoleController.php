<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\User;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user=$request->get('user');

        $roles = Role::where('user_id', $user->id)->where('id','!=' ,$user->role)->orderBy('guest', 'asc')->get();
        return response()->json(['status' => 1, 'roles' => $roles]);
    }

    public function AdminRoles(Request $request)
    {
        $user = $request->get('user');

        $roles = Role::where('user_id', $user->id)->where('id', '!=', $user->role)->where('name', 'Admin')->get();
        return response()->json(['status' => 1, 'roles' => $roles]);
    }




    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user=$request->get('user');

        $request->validate([
            'name' => 'required|string',
            'status' => 'required|integer|in:0,1',
        ]);

        // Assuming you want to set the user_id to the authenticated user's ID
        $request->merge(['user_id' => $user->id]); // Add user_id
        $role = Role::create($request->only(['user_id', 'name','status']));
        return response()->json(['status' => 1, 'message' => 'Role created', 'role' => $role]);
    }


    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $role = Role::find($id);
        if (!$role) {
            return response()->json(['status' => 0, 'message' => 'Role not found'], 404);
        }
        return response()->json(['status' => 1, 'role' => $role]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $role = Role::find($id);
        if (!$role) {
            return response()->json(['status' => 0, 'message' => 'Role not found'], 404);
        }
        $request->validate([
            'name' => 'required|string',
            'status' => 'required|integer|in:0,1',
        ]);
        $role->update($request->only(['name','status']));
        return response()->json(['status' => 1, 'message' => 'Role updated', 'role' => $role]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $role = Role::find($id);
        if (!$role) {
            return response()->json(['status' => 0, 'message' => 'Role not found'], 404);
        }
        $role->delete();
        return response()->json(['status' => 1, 'message' => 'Role deleted']);
    }

    public function updateOrder(Request $request)
    {
        $request->validate([
            'roles' => 'required|array',
            'roles.*.id' => 'required|exists:roles,id',
        ]);

        $roles = $request->input('roles');

        foreach ($roles as $index => $roleData) {
            Role::where('id', $roleData['id'])->update(['guest' => $index + 1]);
        }

        return response()->json(['status' => 1, 'message' => 'Role order updated successfully']);
    }

    /**
     * Get user's role position among roles created by their admin using guest column
     */
    public function rolePosition(Request $request)
    {
        try {
            // Retrieve target user (from request user_id/mid or authenticated user)
            $user = null;
            if ($request->has('user_id') && !empty($request->user_id)) {
                $user = User::find($request->user_id);
            } elseif ($request->has('mid') && !empty($request->mid)) {
                $user = User::where('mid', $request->mid)->first();
            }

            if (!$user) {
                $user = $request->get('user') ?? auth()->user();
            }

            if (!$user) {
                return response()->json([
                    'status' => 0,
                    'message' => 'User not found or unauthenticated'
                ], 401);
            }

            $roleId = $user->role_id ?? $user->role;
            $userRole = Role::find($roleId);

            // Determine admin ID who created the role or admin user of the current user
            $adminId = null;
            if ($userRole && !empty($userRole->user_id)) {
                $adminId = $userRole->user_id;
            } elseif (!empty($user->admin_mid)) {
                $adminUser = User::where('mid', $user->admin_mid)->first();
                $adminId = $adminUser ? $adminUser->id : null;
            } elseif (!empty($user->refer_by)) {
                $adminUser = User::where('mid', $user->refer_by)->first();
                $adminId = $adminUser ? $adminUser->id : null;
            }

            if (!$adminId) {
                $adminId = $user->id;
            }

            // Fetch all roles created by the admin ordered by guest column
            $roles = Role::where('user_id', $adminId)
                ->orderBy('guest', 'asc')
                ->get();

            $totalRoles = $roles->count();

            // Find user's role position (1-based index based on guest ordering)
            $userPosition = 0;
            $userGuestValue = $userRole ? $userRole->guest : null;

            foreach ($roles as $index => $role) {
                $pos = $index + 1;
                if ($userRole && $role->id == $userRole->id) {
                    $userPosition = $pos;
                }
            }

            return response()->json([
                'status' => 1,
                'message' => 'Role position retrieved successfully',
                'position' => $userPosition,
                'total_roles' => $totalRoles




                
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error retrieving role position: ' . $e->getMessage()
            ], 500);
        }
    }
}
