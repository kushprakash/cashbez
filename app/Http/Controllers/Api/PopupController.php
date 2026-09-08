<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppPopup;
use App\Models\AppPopupDismissal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PopupController extends Controller
{
    /**
     * Fetch applicable popup for the current user and screen
     */
    public function fetch(Request $request)
    {
        try {
            $user = $request->get('user') ?? $request->user();
            if (!$user && $request->has('user_id')) {
                $user = \App\Models\User::find($request->input('user_id'));
            }
            $screen = $request->input('screen', 'home');

            if (!$user) {
                return response()->json([
                    'status' => 0,
                    'message' => 'User not authenticated',
                    'data' => null
                ], 401);
            }

            $userId = $user->id;
            $userRoleId = $user->role ?? null;

            // Get all active popups for this screen within date range
            $popups = AppPopup::active()
                ->forScreen($screen)
                ->withinDateRange()
                ->orderBy('priority', 'asc')
                ->orderBy('created_at', 'desc')
                ->get();

            // Find the first popup that should be shown to this user
            $applicablePopup = null;

            foreach ($popups as $popup) {
               

                // Check if popup targets this user
                if (!$popup->targetsUser($userId, $userRoleId)) {
                    continue;
                }

               
                // Get user's dismissal record for this popup
                $dismissal = AppPopupDismissal::where('popup_id', $popup->id)
                    ->where('user_id', $userId)
                    ->first();

                

                // Check if popup should be shown based on frequency
                if ($popup->shouldShowToUser($userId, $dismissal)) {
                    $applicablePopup = $popup;
                    break;
                }
            }

            if (!$applicablePopup) {
                return response()->json([
                    'status' => 0,
                    'message' => 'No popup available',
                    'data' => null
                ]);
            }

            // Format popup data for mobile app
            $popupData = [
                'id' => $applicablePopup->id,
                'title' => $applicablePopup->title,
                'message' => $applicablePopup->message,
                'image_url' => $applicablePopup->image_url,
                'image_position' => $applicablePopup->image_position ?? 'center',
                'button_text' => $applicablePopup->button_text,
                'button_link' => $applicablePopup->button_link,
                'popup_type' => $applicablePopup->popup_type ?? 'general',
                'show_on_screen' => $applicablePopup->show_on_screen ?? 'both',
                'show_after_seconds' => (int)($applicablePopup->show_after_seconds ?? 0),
                'auto_close_seconds' => (int)($applicablePopup->auto_close_seconds ?? 5),
                'is_repeatable' => (bool)$applicablePopup->is_repeatable,
                'is_dismissible' => (bool)($applicablePopup->is_dismissible ?? true),
                'priority' => (int)($applicablePopup->priority ?? 10),
            ];

            return response()->json([
                'status' => 1,
                'message' => 'Popup fetched successfully',
                'data' => [
                    'popup' => $popupData
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Popup fetch error: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching popup',
                'data' => $e
            ], 500);
        }
    }

    /**
     * Dismiss a popup for the current user
     */
    public function dismiss(Request $request)
    {
        try {
            $user = $request->get('user') ?? $request->user();
            if (!$user && $request->has('user_id')) {
                $user = \App\Models\User::find($request->input('user_id'));
            }
            $popupId = $request->input('popup_id');

            if (!$user) {
                return response()->json([
                    'status' => 0,
                    'message' => 'User not authenticated'
                ], 401);
            }

            if (!$popupId) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Popup ID is required'
                ], 400);
            }

            $userId = $user->id;

            // Check if popup exists
            $popup = AppPopup::find($popupId);
            if (!$popup) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Popup not found'
                ], 404);
            }

            // Update or create dismissal record
            AppPopupDismissal::updateOrCreate(
                [
                    'user_id' => $userId,
                    'popup_id' => $popupId
                ],
                [
                    'dismissed_at' => now()
                ]
            );

            return response()->json([
                'status' => 1,
                'message' => 'Popup dismissed successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Popup dismiss error: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Error dismissing popup'
            ], 500);
        }
    }

    /**
     * Fetch public popup for guest users (using mid)
     */
    public function fetchPublic(Request $request)
    {
        try {
            $userId = $request->input('user_id');
            $screen = $request->input('screen', 'login');

            if (!$userId) {
                return response()->json([
                    'status' => 0,
                    'message' => 'User ID is required',
                    'data' => null
                ], 400);
            }

            // Find user by user_id
            $user = \App\Models\User::find($userId);
            
            if (!$user) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Invalid User ID',
                    'data' => null
                ], 404);
            }

            // Get admin_mid from this user
            $adminMid = $user->admin_mid;
            
            if (!$adminMid) {
                return response()->json([
                    'status' => 0,
                    'message' => 'User has no admin assigned',
                    'data' => null
                ], 404);
            }

            // Find admin user by admin_mid
            $admin = \App\Models\User::where('mid', $adminMid)->first();
            
            if (!$admin) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Admin not found',
                    'data' => null
                ], 404);
            }

            $adminId = $admin->id;

            // Get all active popups for this screen within date range
            // For public/guest popups, we target by admin/creator
            $popups = AppPopup::active()
                ->forScreen($screen)
                ->withinDateRange()
                ->where(function($q) use ($adminId) {
                    // Show popups created by this admin or general ones
                    $q->where('created_by', $adminId)
                      ->orWhereNull('created_by');
                })
                ->orderBy('priority', 'asc')
                ->orderBy('created_at', 'desc')
                ->get();

            // For public access, just return the first applicable popup
            // We skip dismissal tracking for guests
            $applicablePopup = $popups->first();

            if (!$applicablePopup) {
                return response()->json([
                    'status' => 0,
                    'message' => 'No popup available',
                    'data' => null
                ]);
            }

            // Format popup data
            $popupData = [
                'id' => $applicablePopup->id,
                'title' => $applicablePopup->title,
                'message' => $applicablePopup->message,
                'image_url' => $applicablePopup->image_url,
                'image_position' => $applicablePopup->image_position ?? 'center',
                'button_text' => $applicablePopup->button_text,
                'button_link' => $applicablePopup->button_link,
                'popup_type' => $applicablePopup->popup_type ?? 'general',
                'show_on_screen' => $applicablePopup->show_on_screen ?? 'both',
                'show_after_seconds' => (int)($applicablePopup->show_after_seconds ?? 0),
                'auto_close_seconds' => (int)($applicablePopup->auto_close_seconds ?? 5),
                'is_repeatable' => (bool)$applicablePopup->is_repeatable,
                'is_dismissible' => (bool)($applicablePopup->is_dismissible ?? true),
                'priority' => (int)($applicablePopup->priority ?? 10),
            ];

            return response()->json([
                'status' => 1,
                'message' => 'Popup fetched successfully',
                'data' => [
                    'popup' => $popupData
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Public popup fetch error: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching popup',
                'data' => null
            ], 500);
        }
    }
}
