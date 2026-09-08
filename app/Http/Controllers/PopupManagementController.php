<?php

namespace App\Http\Controllers;

use App\Models\AppPopup;
use App\Models\AppPopupDismissal;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Services\BunnyStorageService;

class PopupManagementController extends Controller
{
    protected BunnyStorageService $bunnyStorage;

    public function __construct(BunnyStorageService $bunnyStorage)
    {
        $this->bunnyStorage = $bunnyStorage;
    }

    /**
     * Get list of all popups with pagination
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 25);
            $search = $request->input('search');
            $status = $request->input('status');
            $screen = $request->input('screen');

            $query = AppPopup::query()
                ->orderBy('priority', 'asc')
                ->orderBy('created_at', 'desc');

            // Apply filters
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('message', 'like', "%{$search}%");
                });
            }

            if ($status) {
                $query->where('status', $status);
            }

            if ($screen) {
                $query->where(function ($q) use ($screen) {
                    $q->where('show_on_screen', $screen)
                      ->orWhere('show_on_screen', 'both');
                });
            }

            $popups = $query->paginate($perPage);

            return response()->json([
                'status' => 1,
                'message' => 'Popups fetched successfully',
                'data' => $popups
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching popups: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new popup
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'nullable|string|max:255',
                'message' => 'nullable|string',
                'image_url' => 'nullable|string|max:500',
                'image_position' => 'nullable|in:top,center,background',
                'button_text' => 'nullable|string|max:100',
                'button_link' => 'nullable|string|max:500',
                'popup_type' => 'nullable|in:general,offer,announcement,custom',
                'show_on_screen' => 'nullable|in:home,login,both,dashboard,custom',
                'priority' => 'nullable|integer|min:1',
                'display_start' => 'nullable|date',
                'display_end' => 'nullable|date',
                'show_after_seconds' => 'nullable|integer|min:0',
                'auto_close_seconds' => 'nullable|integer|min:1',
                'display_frequency' => 'nullable|in:always,once,once_per_day',
                'is_repeatable' => 'nullable|boolean',
                'is_dismissible' => 'nullable|boolean',
                'status' => 'nullable|in:active,inactive',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Handle target users array
            $targetUsers = null;
            if ($request->has('target_users') && is_array($request->target_users)) {
                $targetUsers = implode(',', $request->target_users);
            } elseif ($request->has('target_users') && is_string($request->target_users)) {
                $targetUsers = $request->target_users;
            }

            // Handle target roles array
            $targetRoles = null;
            if ($request->has('target_roles') && is_array($request->target_roles)) {
                $targetRoles = implode(',', $request->target_roles);
            } elseif ($request->has('target_roles') && is_string($request->target_roles)) {
                $targetRoles = $request->target_roles;
            }

            // Handle image upload if file is present
            $imageUrl = $request->image_url;
            if ($request->hasFile('image')) {
                $result = $this->bunnyStorage->upload($request->file('image'), 'popups');
                if (!$result['success']) {
                    return response()->json([
                        'status' => 0,
                        'message' => 'Image upload failed: ' . $result['error']
                    ], 500);
                }
                $imageUrl = $result['url'];
            }

            $popup = AppPopup::create([
                'title' => $request->title,
                'message' => $request->message,
                'image_url' => $imageUrl,
                'image_position' => $request->image_position ?? 'center',
                'button_text' => $request->button_text,
                'button_link' => $request->button_link,
                'target_users' => $targetUsers,
                'target_roles' => $targetRoles,
                'popup_type' => $request->popup_type ?? 'general',
                'show_on_screen' => $request->show_on_screen ?? 'both',
                'custom_routes' => $request->custom_routes,
                'display_start' => $request->display_start,
                'display_end' => $request->display_end,
                'show_after_seconds' => $request->show_after_seconds ?? 0,
                'auto_close_seconds' => $request->auto_close_seconds ?? 5,
                'is_repeatable' => $request->is_repeatable ?? true,
                'priority' => $request->priority ?? 10,
                'display_frequency' => $request->display_frequency ?? 'always',
                'is_dismissible' => $request->is_dismissible ?? true,
                'status' => $request->status ?? 'active',
                'created_by' => $request->user->id ?? null,
            ]);

            return response()->json([
                'status' => 1,
                'message' => 'Popup created successfully',
                'data' => $popup
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error creating popup: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific popup
     */
    public function show($id)
    {
        try {
            $popup = AppPopup::find($id);

            if (!$popup) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Popup not found'
                ], 404);
            }

            // Parse target users and roles for frontend
            $popup->target_users_array = $popup->target_users 
                ? array_map('intval', explode(',', $popup->target_users)) 
                : [];
            $popup->target_roles_array = $popup->target_roles 
                ? array_map('intval', explode(',', $popup->target_roles)) 
                : [];

            return response()->json([
                'status' => 1,
                'message' => 'Popup fetched successfully',
                'data' => $popup
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching popup: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a popup
     */
    public function update(Request $request, $id)
    {
        try {
            $popup = AppPopup::find($id);

            if (!$popup) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Popup not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'nullable|string|max:255',
                'message' => 'nullable|string',
                'image_url' => 'nullable|string|max:500',
                'image_position' => 'nullable|in:top,center,background',
                'button_text' => 'nullable|string|max:100',
                'button_link' => 'nullable|string|max:500',
                'popup_type' => 'nullable|in:general,offer,announcement,custom',
                'show_on_screen' => 'nullable|in:home,login,both,dashboard,custom',
                'priority' => 'nullable|integer|min:1',
                'display_start' => 'nullable|date',
                'display_end' => 'nullable|date',
                'show_after_seconds' => 'nullable|integer|min:0',
                'auto_close_seconds' => 'nullable|integer|min:1',
                'display_frequency' => 'nullable|in:always,once,once_per_day',
                'is_repeatable' => 'nullable|boolean',
                'is_dismissible' => 'nullable|boolean',
                'status' => 'nullable|in:active,inactive',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Handle target users array
            $targetUsers = $popup->target_users;
            if ($request->has('target_users')) {
                if (is_array($request->target_users)) {
                    $targetUsers = !empty($request->target_users) ? implode(',', $request->target_users) : null;
                } else {
                    $targetUsers = $request->target_users ?: null;
                }
            }

            // Handle target roles array
            $targetRoles = $popup->target_roles;
            if ($request->has('target_roles')) {
                if (is_array($request->target_roles)) {
                    $targetRoles = !empty($request->target_roles) ? implode(',', $request->target_roles) : null;
                } else {
                    $targetRoles = $request->target_roles ?: null;
                }
            }

            // Handle image upload if file is present
            $imageUrl = $request->image_url ?? $popup->image_url;
            if ($request->hasFile('image')) {
                // Delete old image from BunnyCDN if exists
                if ($popup->image_url) {
                    $oldPath = $this->bunnyStorage->extractPath($popup->image_url);
                    if ($oldPath) {
                        $this->bunnyStorage->delete($oldPath);
                    }
                }
                $result = $this->bunnyStorage->upload($request->file('image'), 'popups');
                if (!$result['success']) {
                    return response()->json([
                        'status' => 0,
                        'message' => 'Image upload failed: ' . $result['error']
                    ], 500);
                }
                $imageUrl = $result['url'];
            }

            $popup->update([
                'title' => $request->title ?? $popup->title,
                'message' => $request->message ?? $popup->message,
                'image_url' => $imageUrl,
                'image_position' => $request->image_position ?? $popup->image_position,
                'button_text' => $request->button_text ?? $popup->button_text,
                'button_link' => $request->button_link ?? $popup->button_link,
                'target_users' => $targetUsers,
                'target_roles' => $targetRoles,
                'popup_type' => $request->popup_type ?? $popup->popup_type,
                'show_on_screen' => $request->show_on_screen ?? $popup->show_on_screen,
                'custom_routes' => $request->custom_routes ?? $popup->custom_routes,
                'display_start' => $request->display_start ?? $popup->display_start,
                'display_end' => $request->display_end ?? $popup->display_end,
                'show_after_seconds' => $request->show_after_seconds ?? $popup->show_after_seconds,
                'auto_close_seconds' => $request->auto_close_seconds ?? $popup->auto_close_seconds,
                'is_repeatable' => $request->is_repeatable ?? $popup->is_repeatable,
                'priority' => $request->priority ?? $popup->priority,
                'display_frequency' => $request->display_frequency ?? $popup->display_frequency,
                'is_dismissible' => $request->is_dismissible ?? $popup->is_dismissible,
                'status' => $request->status ?? $popup->status,
            ]);

            return response()->json([
                'status' => 1,
                'message' => 'Popup updated successfully',
                'data' => $popup->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error updating popup: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a popup
     */
    public function destroy($id)
    {
        try {
            $popup = AppPopup::find($id);

            if (!$popup) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Popup not found'
                ], 404);
            }

            // Delete associated dismissals
            AppPopupDismissal::where('popup_id', $id)->delete();

            // Delete popup
            $popup->delete();

            return response()->json([
                'status' => 1,
                'message' => 'Popup deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error deleting popup: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle popup status (active/inactive)
     */
    public function toggleStatus($id)
    {
        try {
            $popup = AppPopup::find($id);

            if (!$popup) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Popup not found'
                ], 404);
            }

            $newStatus = $popup->status === 'active' ? 'inactive' : 'active';
            $popup->update(['status' => $newStatus]);

            return response()->json([
                'status' => 1,
                'message' => 'Popup status updated successfully',
                'data' => [
                    'id' => $popup->id,
                    'status' => $newStatus
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error toggling status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload popup image
     */
    public function uploadImage(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'image' => 'required|image|mimes:jpeg,png,gif,webp|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $result = $this->bunnyStorage->upload($request->file('image'), 'popups');
            if (!$result['success']) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Image upload failed: ' . $result['error']
                ], 500);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Image uploaded successfully',
                'data' => [
                    'url' => $result['url'],
                    'path' => $result['path']
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error uploading image: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get members list for targeting dropdown
     */
    public function getMembersList(Request $request)
    {
        try {
            $search = $request->input('search');
            $limit = $request->input('limit', 50);

            $query = User::select('id', 'name', 'mobile_no')
                ->orderBy('name');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('mobile_no', 'like', "%{$search}%");
                });
            }

            $members = $query->limit($limit)->get();

            return response()->json([
                'status' => 1,
                'data' => $members
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching members: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get roles list for targeting dropdown
     */
    public function getRolesList(Request $request)
    {
        try {
            $roles = Role::select('id', 'name')
                ->orderBy('name')
                ->get();

            return response()->json([
                'status' => 1,
                'data' => $roles
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching roles: ' . $e->getMessage()
            ], 500);
        }
    }
}
