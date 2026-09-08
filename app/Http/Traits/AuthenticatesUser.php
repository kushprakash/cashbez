<?php

namespace App\Http\Traits;

use App\Models\User;
use Illuminate\Http\Request;

trait AuthenticatesUser
{
    /**
     * Get authenticated user from token
     */
    protected function getAuthenticatedUser(Request $request)
    {
        // Get token from header
        if ($request->hasHeader('Token')) {
            $authHeader = $request->header('Token');
        } else {
            return [
                'user' => null,
                'error' => response()->json([
                    'status' => 0,
                    'message' => 'No token provided',
                ], 400)
            ];
        }

        // Find user by token
        $user = User::where('remember_token', $authHeader)->first();
        if (!$user) {
            return [
                'user' => null,
                'error' => response()->json([
                    'status' => 0,
                    'message' => 'Invalid token',
                ], 401)
            ];
        }

        return [
            'user' => $user,
            'error' => null
        ];
    }
}
