<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\BunnyStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;

/**
 * Banner CRUD Controller
 * Only accessible by role=1 and user_id=21
 */
class BannerController extends Controller
{
    private BunnyStorageService $storageService;

    public function __construct(BunnyStorageService $storageService)
    {
        $this->storageService = $storageService;
    }

    /**
     * Check if user has admin access to banners
     */
    private function hasAccess(Request $request): bool
    {
        $user = $request->user();
        return $user && ($user->role == 1 || $user->id == 21);
    }

    /**
     * List all banners
     */
    public function index(Request $request)
    {
        if (!$this->hasAccess($request)) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 403);
        }

        try {
            $banners = DB::table('banners')
                ->orderByDesc('id')
                ->get();

            return response()->json([
                'status' => 1,
                'data' => $banners,
            ]);
        } catch (\Exception $e) {
            Log::error('BannerController: Error fetching banners', ['error' => $e->getMessage()]);
            return response()->json(['status' => 0, 'message' => 'Failed to fetch banners', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get single banner
     */
    public function show(Request $request, $id)
    {
        if (!$this->hasAccess($request)) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 403);
        }

        try {
            $banner = DB::table('banners')->where('id', $id)->first();

            if (!$banner) {
                return response()->json(['status' => 0, 'message' => 'Banner not found'], 404);
            }

            return response()->json([
                'status' => 1,
                'data' => $banner,
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => 'Failed to fetch banner', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Create a new banner
     * Accepts image_url from frontend BunnyCDN upload
     */
    public function store(Request $request)
    {
        if (!$this->hasAccess($request)) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'type' => 'required|string|max:50',
            'image_url' => 'required|string', // URL from frontend CDN upload
            'redirect_url' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $insertData = [];

            // Set user/admin ID if column exists
            if (Schema::hasColumn('banners', 'admin_id')) {
                $insertData['admin_id'] = $request->user()->id;
            } elseif (Schema::hasColumn('banners', 'user_id')) {
                $insertData['user_id'] = $request->user()->id;
            }

            if (Schema::hasColumn('banners', 'type')) {
                $insertData['type'] = $request->type;
            }

            if (Schema::hasColumn('banners', 'image')) {
                $insertData['image'] = $request->image_url;
            }
            if (Schema::hasColumn('banners', 'image_url')) {
                $insertData['image_url'] = $request->image_url;
            }

            if (Schema::hasColumn('banners', 'redirect_url')) {
                $insertData['redirect_url'] = $request->redirect_url;
            }

            if (Schema::hasColumn('banners', 'start_date')) {
                $insertData['start_date'] = $request->start_date;
            }

            if (Schema::hasColumn('banners', 'end_date')) {
                $insertData['end_date'] = $request->end_date;
            }

            if (Schema::hasColumn('banners', 'status')) {
                $insertData['status'] = $request->status == 1 ? 1 : 0;
            }

            if (Schema::hasColumn('banners', 'created_at')) {
                $insertData['created_at'] = now();
            }

            if (Schema::hasColumn('banners', 'updated_at')) {
                $insertData['updated_at'] = now();
            }

            $id = DB::table('banners')->insertGetId($insertData);

            $banner = DB::table('banners')->where('id', $id)->first();

            return response()->json([
                'status' => 1,
                'message' => 'Banner created successfully',
                'data' => $banner,
            ], 201);
        } catch (\Exception $e) {
            Log::error('BannerController: Error creating banner', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to create banner',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a banner
     */
    public function update(Request $request, $id)
    {
        if (!$this->hasAccess($request)) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'type' => 'sometimes|required|string|max:50',
            'image_url' => 'nullable|string',
            'redirect_url' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $banner = DB::table('banners')->where('id', $id)->first();

            if (!$banner) {
                return response()->json(['status' => 0, 'message' => 'Banner not found'], 404);
            }

            $data = [];
            if (Schema::hasColumn('banners', 'updated_at')) {
                $data['updated_at'] = now();
            }

            if ($request->has('type') && Schema::hasColumn('banners', 'type')) {
                $data['type'] = $request->type;
            }
            
            if ($request->has('redirect_url') && Schema::hasColumn('banners', 'redirect_url')) {
                $data['redirect_url'] = $request->redirect_url;
            }

            if ($request->has('start_date') && Schema::hasColumn('banners', 'start_date')) {
                $data['start_date'] = $request->start_date;
            }

            if ($request->has('end_date') && Schema::hasColumn('banners', 'end_date')) {
                $data['end_date'] = $request->end_date;
            }

            if ($request->has('status') && Schema::hasColumn('banners', 'status')) {
                $data['status'] = $request->status == 1 ? 1 : 0;
            }
            
            if ($request->image_url) {
                // Delete old image from CDN if it exists
                $oldImg = $banner->image ?? $banner->image_url ?? null;
                if ($oldImg) {
                    $oldPath = $this->storageService->extractPath($oldImg);
                    if ($oldPath) {
                        $this->storageService->delete($oldPath);
                    }
                }
                if (Schema::hasColumn('banners', 'image')) {
                    $data['image'] = $request->image_url;
                }
                if (Schema::hasColumn('banners', 'image_url')) {
                    $data['image_url'] = $request->image_url;
                }
            }

            DB::table('banners')->where('id', $id)->update($data);

            return response()->json([
                'status' => 1,
                'message' => 'Banner updated successfully',
                'data' => DB::table('banners')->where('id', $id)->first(),
            ]);
        } catch (\Exception $e) {
            Log::error('BannerController: Error updating banner', ['error' => $e->getMessage()]);
            return response()->json(['status' => 0, 'message' => 'Failed to update banner', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a banner
     */
    public function destroy(Request $request, $id)
    {
        if (!$this->hasAccess($request)) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 403);
        }

        try {
            $banner = DB::table('banners')->where('id', $id)->first();

            if (!$banner) {
                return response()->json(['status' => 0, 'message' => 'Banner not found'], 404);
            }

            // Delete image from CDN
            if ($banner->image) {
                $path = $this->storageService->extractPath($banner->image);
                if ($path) {
                    $this->storageService->delete($path);
                }
            }

            DB::table('banners')->where('id', $id)->delete();

            return response()->json([
                'status' => 1,
                'message' => 'Banner deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('BannerController: Error deleting banner', ['error' => $e->getMessage()]);
            return response()->json(['status' => 0, 'message' => 'Failed to delete banner'], 500);
        }
    }

    /**
     * Toggle banner status
     */
    public function toggleStatus(Request $request, $id)
    {
        if (!$this->hasAccess($request)) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 403);
        }

        try {
            $banner = DB::table('banners')->where('id', $id)->first();

            if (!$banner) {
                return response()->json(['status' => 0, 'message' => 'Banner not found'], 404);
            }

            $newStatus = $banner->status ? 0 : 1;
            DB::table('banners')->where('id', $id)->update([
                'status' => $newStatus,
                'updated_at' => now(),
            ]);

            return response()->json([
                'status' => 1,
                'message' => $newStatus ? 'Banner activated' : 'Banner deactivated',
                'data' => ['status' => $newStatus],
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'message' => 'Failed to toggle status'], 500);
        }
    }

    /**
     * Public endpoint - Get active banners by type (no auth required)
     */
    public function getActive(Request $request)
    {
        try {
            $type = $request->get('type', 'home');
            $now = now()->toDateTimeString();

            $query = DB::table('banners')
                ->where('status', 1);

            if (Schema::hasColumn('banners', 'type')) {
                $query->where(function($q) use ($type) {
                    $q->where('type', $type)->orWhereNull('type')->orWhere('type', '');
                });
            }

            if (Schema::hasColumn('banners', 'start_date')) {
                $query->where(function($q) use ($now) {
                    $q->whereNull('start_date')
                      ->orWhere('start_date', '')
                      ->orWhere('start_date', '0000-00-00 00:00:00')
                      ->orWhere('start_date', '<=', $now);
                });
            }

            if (Schema::hasColumn('banners', 'end_date')) {
                $query->where(function($q) use ($now) {
                    $q->whereNull('end_date')
                      ->orWhere('end_date', '')
                      ->orWhere('end_date', '0000-00-00 00:00:00')
                      ->orWhere('end_date', '>=', $now);
                });
            }

            $banners = $query->orderByDesc('id')->get();

            return response()->json([
                'status' => 1,
                'data' => $banners,
            ]);
        } catch (\Exception $e) {
            Log::error('BannerController: Error fetching active banners', ['error' => $e->getMessage()]);
            return response()->json(['status' => 0, 'message' => 'Failed to fetch banners', 'error' => $e->getMessage()], 500);
        }
    }
}
