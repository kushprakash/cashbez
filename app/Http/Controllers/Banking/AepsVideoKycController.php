<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\AepsDraft;
use App\Models\User;
use App\Services\BunnyStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AepsVideoKycController extends Controller
{
    protected BunnyStorageService $bunnyStorage;

    public function __construct(BunnyStorageService $bunnyStorage)
    {
        $this->bunnyStorage = $bunnyStorage;
    }

    /**
     * Get pending list - video_kyc_status = 0 AND aeps_status = 0
     */
    public function pendingList(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 50);
            $search = $request->get('search', '');
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            $query = AepsDraft::whereNotNull('video_url')
                ->where('video_url', '!=', '')
                ->where(function ($q) {
                    $q->where('video_kyc_status', 0)
                      ->orWhereNull('video_kyc_status');
                })
                ->with([
                    'createdBy:id,name,email',
                    'createdBy.setting:id,user_id,company_name',
                    'admin:id,name,email'
                ]);

            // Search functionality
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('mid', 'like', "%{$search}%")
                        ->orWhere('shop_name', 'like', "%{$search}%")
                        ->orWhere('full_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('pan_no', 'like', "%{$search}%")
                        ->orWhere('aadhaar_number', 'like', "%{$search}%");
                });
            }

            // Sorting
            $query->orderBy($sortBy, $sortOrder);

            $drafts = $query->paginate($perPage);

            return response()->json([
                'status' => 1,
                'message' => 'Pending list fetched successfully',
                'data' => $drafts
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch pending list',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get verified list - video_kyc_status = 1 AND aeps_status = 0
     */
    public function verifiedList(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 50);
            $search = $request->get('search', '');
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            $query = AepsDraft::where('video_kyc_status', 1)
                ->with([
                    'createdBy:id,name,email',
                    'createdBy.setting:id,user_id,company_name',
                    'admin:id,name,email'
                ]);

            // Search functionality
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('mid', 'like', "%{$search}%")
                        ->orWhere('shop_name', 'like', "%{$search}%")
                        ->orWhere('full_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('pan_no', 'like', "%{$search}%")
                        ->orWhere('aadhaar_number', 'like', "%{$search}%");
                });
            }

            // Sorting
            $query->orderBy($sortBy, $sortOrder);

            $drafts = $query->paginate($perPage);

            return response()->json([
                'status' => 1,
                'message' => 'Verified list fetched successfully',
                'data' => $drafts
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch verified list',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get old list - video_kyc_status = 0 AND aeps_status > 0
     */
    public function oldList(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 50);
            $search = $request->get('search', '');
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            $query = AepsDraft::where('video_kyc_status', 0)
                ->where('aeps_status', '>', 0)
                ->with([
                    'createdBy:id,name,email',
                    'createdBy.setting:id,user_id,company_name',
                    'admin:id,name,email'
                ]);

            // Search functionality
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('mid', 'like', "%{$search}%")
                        ->orWhere('shop_name', 'like', "%{$search}%")
                        ->orWhere('full_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('pan_no', 'like', "%{$search}%")
                        ->orWhere('aadhaar_number', 'like', "%{$search}%");
                });
            }

            // Sorting
            $query->orderBy($sortBy, $sortOrder);

            $drafts = $query->paginate($perPage);

            return response()->json([
                'status' => 1,
                'message' => 'Old list fetched successfully',
                'data' => $drafts
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch old list',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get rejected list - drafts with remarks (rejected applications)
     */
    public function rejectedList(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 50);
            $search = $request->get('search', '');
            $sortBy = $request->get('sort_by', 'updated_at');
            $sortOrder = $request->get('sort_order', 'desc');

            $query = AepsDraft::query()
                ->whereNotNull('remarks')
                ->where('remarks', '!=', '')
                ->with([
                    'createdBy:id,name,email',
                    'createdBy.setting:id,user_id,company_name',
                    'admin:id,name,email'
                ]);

            // Search functionality
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('mid', 'like', "%{$search}%")
                        ->orWhere('shop_name', 'like', "%{$search}%")
                        ->orWhere('full_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('remarks', 'like', "%{$search}%");
                });
            }

            // Sorting
            $query->orderBy($sortBy, $sortOrder);

            $drafts = $query->paginate($perPage);

            return response()->json([
                'status' => 1,
                'message' => 'Rejected list fetched successfully',
                'data' => $drafts
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch rejected list',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle video_kyc_status for a draft
     */
    public function toggleVideoKycStatus(Request $request, $id)
    {
        try {
            $validator = Validator::make(['id' => $id], [
                'id' => 'required|integer|exists:aeps_drafts,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 400);
            }

            $draft = AepsDraft::find($id);

            if (!$draft) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Draft not found'
                ], 404);
            }

            // Toggle the status (0 -> 1, 1 -> 0)
            $draft->video_kyc_status = $draft->video_kyc_status == 1 ? 0 : 1;
            $draft->save();

            return response()->json([
                'status' => 1,
                'message' => 'Video KYC status updated successfully',
                'data' => [
                    'id' => $draft->id,
                    'video_kyc_status' => $draft->video_kyc_status
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to toggle status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get draft details by ID
     */
    public function getDraftDetails(Request $request, $id)
    {
        try {
            $draft = AepsDraft::with([
                    'createdBy:id,name,email',
                    'createdBy.setting:id,user_id,company_name',
                    'admin:id,name,email'
                ])
                ->find($id);

            if (!$draft) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Draft not found'
                ], 404);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Draft details retrieved successfully',
                'data' => $draft
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching draft details: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject Video KYC - Delete selected files from CDN and null DB columns
     * Only admin (role=1) or user_id=21 can access
     */
    public function rejectVideoKyc(Request $request, $id)
    {
        try {
            $user = Auth::user();
            
            // Authorization check: only admin (role=1)
            if (!$user || ($user->role != 1)) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Unauthorized. Only admins can reject Video KYC.'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'fields' => 'required|array|min:1',
                'fields.*' => 'in:shop_inner,shop_outer,video_url',
                'remarks' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 400);
            }

            $draft = AepsDraft::find($id);

            if (!$draft) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Draft not found'
                ], 404);
            }

            $fields = $request->input('fields');
            $deletedFiles = [];
            $failedFiles = [];

            // Process each selected field
            foreach ($fields as $field) {
                $cdnUrl = $draft->$field;
                
                if (!empty($cdnUrl)) {
                    // Extract path from CDN URL
                    $path = $this->bunnyStorage->extractPath($cdnUrl);
                    
                    if ($path) {
                        // Delete from Bunny CDN
                        $deleted = $this->bunnyStorage->delete($path);
                        
                        if ($deleted) {
                            $deletedFiles[] = $field;
                            // Set DB column to null
                            $draft->$field = null;
                        } else {
                            $failedFiles[] = $field;
                        }
                    } else {
                        // URL doesn't match CDN pattern, just null the column
                        $draft->$field = null;
                        $deletedFiles[] = $field;
                    }
                } else {
                    // Already empty, count as success
                    $deletedFiles[] = $field;
                }
            }

            // Update remarks if provided
            if ($request->has('remarks')) {
                $draft->remarks = $request->input('remarks');
            }

            // Set video_kyc_status to 0 (rejected)
            $draft->video_kyc_status = 0;
            $draft->save();

            return response()->json([
                'status' => 1,
                'message' => 'Video KYC rejected successfully',
                'data' => [
                    'id' => $draft->id,
                    'deleted_files' => $deletedFiles,
                    'failed_files' => $failedFiles,
                    'video_kyc_status' => $draft->video_kyc_status
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to reject Video KYC',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update media URL directly (when frontend uploads to Bunny CDN)
     * This reduces server load by not handling file uploads
     * Only admin (role=1) or user_id=21 can access
     */
    public function updateMediaUrl(Request $request, $id)
    {
        try {
            $user = Auth::user();
            
            // Authorization check: only admin (role=1) OR user_id=21
            if (!$user || ($user->role != 1)) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Unauthorized. Only admins can update media.'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'field' => 'required|in:shop_inner,shop_outer,video_url',
                'url' => 'required|url|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 400);
            }

            $draft = AepsDraft::find($id);

            if (!$draft) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Draft not found'
                ], 404);
            }

            $field = $request->input('field');
            $newUrl = $request->input('url');

            // Delete existing file from CDN if exists
            $existingUrl = $draft->$field;
            if (!empty($existingUrl) && $this->bunnyStorage->isConfigured()) {
                $existingPath = $this->bunnyStorage->extractPath($existingUrl);
                if ($existingPath) {
                    $this->bunnyStorage->delete($existingPath);
                }
            }

            // Update database with new URL
            $draft->$field = $newUrl;
            $draft->save();

            return response()->json([
                'status' => 1,
                'message' => 'Media URL updated successfully',
                'data' => [
                    'id' => $draft->id,
                    'field' => $field,
                    'url' => $newUrl
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update media URL',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update editable fields (shop_name, shop_address, email)
     * Only admin (role=1) can access
     * Only when aeps_status = 0
     */
    public function updateEditableFields(Request $request, $id)
    {
        try {
            $user = Auth::user();
            
            // Authorization check: only admin (role=1) 
            if (!$user || ($user->role != 1)) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Unauthorized. Only admins can edit these fields.'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'shop_name' => 'nullable|string|max:255',
                'shop_address' => 'nullable|string|max:500',
                'email' => 'nullable|email|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 400);
            }

            $draft = AepsDraft::find($id);

            if (!$draft) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Draft not found'
                ], 404);
            }

            // Check if aeps_status is 0 (editing only allowed when pending)
            if ($draft->aeps_status != 0) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Editing is not allowed. AEPS status must be pending (0).'
                ], 403);
            }

            // Start DB transaction for atomicity
            DB::beginTransaction();

            try {
                $updatedFields = [];
                $emailSynced = false;

                // Update shop_name if provided
                if ($request->has('shop_name') && $request->shop_name !== null) {
                    $draft->shop_name = $request->shop_name;
                    $updatedFields[] = 'shop_name';
                }

                // Update shop_address if provided
                if ($request->has('shop_address') && $request->shop_address !== null) {
                    $draft->shop_address = $request->shop_address;
                    $updatedFields[] = 'shop_address';
                }

                // Update email if provided
                if ($request->has('email') && $request->email !== null) {
                    $newEmail = $request->email;
                    $draft->email = $newEmail;
                    $updatedFields[] = 'email';

                    // Sync email to users table if user exists with matching mid
                    if ($draft->mid) {
                        $linkedUser = User::where('mid', $draft->mid)->first();
                        if ($linkedUser) {
                            $linkedUser->email = $newEmail;
                            $linkedUser->save();
                            $emailSynced = true;
                        }
                    }
                }

                $draft->save();
                DB::commit();

                return response()->json([
                    'status' => 1,
                    'message' => 'Fields updated successfully',
                    'data' => [
                        'id' => $draft->id,
                        'updated_fields' => $updatedFields,
                        'email_synced_to_user' => $emailSynced,
                        'shop_name' => $draft->shop_name,
                        'shop_address' => $draft->shop_address,
                        'email' => $draft->email
                    ]
                ], 200);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update fields',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
