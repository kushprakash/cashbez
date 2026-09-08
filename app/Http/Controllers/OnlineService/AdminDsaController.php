<?php

namespace App\Http\Controllers\OnlineService;

use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;
use App\Models\ServiceItem;
use App\Services\BunnyStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Models\UtmLead;
use App\Services\CatchLogService;
use DB;

class AdminDsaController extends Controller
{
    private BunnyStorageService $storageService;

    public function __construct(BunnyStorageService $storageService)
    {
        // Only used for delete operations
        $this->storageService = $storageService;
    }

    // ========================================
    // CATEGORY CRUD
    // ========================================

    /**
     * List all categories
     */
    public function listCategories(Request $request)
    {
        try {
            $categories = ServiceCategory::withCount('items')
                ->ordered()
                ->get();

            return response()->json([
                'status' => 1,
                'message' => 'Categories fetched successfully',
                'data' => $categories,
            ]);
        } catch (\Exception $e) {
            Log::error('AdminDsaController: Error fetching categories', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch categories',
            ], 500);
        }
    }

    /**
     * Get single category with items
     */
    public function showCategory($id)
    {
        try {
            $category = ServiceCategory::with('items')->findOrFail($id);

            return response()->json([
                'status' => 1,
                'data' => $category,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Category not found',
            ], 404);
        }
    }

    /**
     * Create a new category
     * Frontend uploads to BunnyCDN, sends icon_url here
     */
    public function storeCategory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'icon_url' => 'nullable|string',
            'icon_type' => 'required|in:upload,url',
            'display_order' => 'nullable|integer',
            'is_active' => 'nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = [
                'name' => $request->name,
                'icon_type' => $request->icon_type,
                'icon' => $request->icon_url, // Direct URL from frontend
                'display_order' => $request->display_order ?? 0,
                'is_active' => filter_var($request->is_active ?? true, FILTER_VALIDATE_BOOLEAN),
            ];

            $category = ServiceCategory::create($data);

            return response()->json([
                'status' => 1,
                'message' => 'Category created successfully',
                'data' => $category,
            ], 201);
        } catch (\Exception $e) {
            Log::error('AdminDsaController: Error creating category', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to create category',
            ], 500);
        }
    }

    /**
     * Update a category
     * Frontend uploads to BunnyCDN, sends icon_url here
     */
    public function updateCategory(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:100',
            'icon_url' => 'nullable|string',
            'icon_type' => 'sometimes|required|in:upload,url',
            'display_order' => 'nullable|integer',
            'is_active' => 'nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $category = ServiceCategory::findOrFail($id);

            $data = [];
            if ($request->has('name')) $data['name'] = $request->name;
            if ($request->has('display_order')) $data['display_order'] = $request->display_order;
            if ($request->has('is_active')) $data['is_active'] = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
            if ($request->has('icon_type')) $data['icon_type'] = $request->icon_type;
            if ($request->icon_url) $data['icon'] = $request->icon_url;

            $category->update($data);

            return response()->json([
                'status' => 1,
                'message' => 'Category updated successfully',
                'data' => $category->fresh(),
            ]);
        } catch (\Exception $e) {
            Log::error('AdminDsaController: Error updating category', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update category',
            ], 500);
        }
    }

    /**
     * Delete a category
     */
    public function destroyCategory($id)
    {
        try {
            $category = ServiceCategory::findOrFail($id);

            // Delete icon from BunnyCDN storage
            if ($category->icon && $category->icon_type === 'upload') {
                $path = $this->storageService->extractPath($category->icon);
                if ($path) {
                    $this->storageService->delete($path);
                }
            }

            // Delete all items' icons in this category
            foreach ($category->items as $item) {
                if ($item->icon && $item->icon_type === 'upload') {
                    $path = $this->storageService->extractPath($item->icon);
                    if ($path) {
                        $this->storageService->delete($path);
                    }
                }
            }

            // Delete all items in this category
            $category->items()->delete();
            $category->delete();

            return response()->json([
                'status' => 1,
                'message' => 'Category deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('AdminDsaController: Error deleting category', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to delete category',
            ], 500);
        }
    }

    // ========================================
    // SERVICE ITEM CRUD
    // ========================================

    /**
     * List all items (optionally filter by category)
     */
    public function listItems(Request $request)
    {
        try {
            $query = ServiceItem::with('category')->ordered();

            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            $items = $query->get();

            return response()->json([
                'status' => 1,
                'message' => 'Items fetched successfully',
                'data' => $items,
            ]);
        } catch (\Exception $e) {
            Log::error('AdminDsaController: Error fetching items', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch items',
            ], 500);
        }
    }

    /**
     * Get single item
     */
    public function showItem($id)
    {
        try {
            $item = ServiceItem::with('category')->findOrFail($id);

            return response()->json([
                'status' => 1,
                'data' => $item,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Item not found',
            ], 404);
        }
    }

    /**
     * Create a new item
     * Frontend uploads to BunnyCDN, sends icon_url here
     */
    public function storeItem(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|integer|exists:app_service_categories,id',
            'title' => 'required|string|max:100',
            'icon_url' => 'nullable|string',
            'icon_type' => 'required|in:upload,url',
            'link' => 'required|string|max:500',
            'link_type' => 'required|in:url,path,dsa',
            'other_url' => 'nullable|string|max:500',
            'target_audience' => 'nullable|array',
            'target_audience.*' => 'nullable|string|max:500',
            'terms_conditions' => 'nullable|array',
            'terms_conditions.*' => 'nullable|string|max:500',
            'instructions' => 'nullable|array',
            'instructions.*' => 'nullable|string|max:500',
            'display_order' => 'nullable|integer',
            'is_active' => 'nullable',
            'android' => 'nullable',
            'web' => 'nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Filter out empty values
            $filterEmpty = fn($arr) => array_values(array_filter($arr ?? [], fn($item) => !empty(trim($item))));

            $data = [
                'category_id' => $request->category_id,
                'title' => $request->title,
                'icon_type' => $request->icon_type,
                'icon' => $request->icon_url,
                'link' => $request->link,
                'link_type' => $request->link_type,
                'other_url' => $request->other_url,
                'target_audience' => $filterEmpty($request->target_audience),
                'terms_conditions' => $filterEmpty($request->terms_conditions),
                'instructions' => $filterEmpty($request->instructions),
                'display_order' => $request->display_order ?? 0,
                'is_active' => filter_var($request->is_active ?? true, FILTER_VALIDATE_BOOLEAN),
                'android' => filter_var($request->android ?? true, FILTER_VALIDATE_BOOLEAN),
                'web' => filter_var($request->web ?? false, FILTER_VALIDATE_BOOLEAN),
            ];

            $item = ServiceItem::create($data);

            return response()->json([
                'status' => 1,
                'message' => 'Item created successfully',
                'data' => $item->load('category'),
            ], 201);
        } catch (\Exception $e) {
            Log::error('AdminDsaController: Error creating item', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to create item',
            ], 500);
        }
    }

    /**
     * Update an item
     * Frontend uploads to BunnyCDN, sends icon_url here
     */
    public function updateItem(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|required|integer|exists:app_service_categories,id',
            'title' => 'sometimes|required|string|max:100',
            'icon_url' => 'nullable|string',
            'icon_type' => 'sometimes|required|in:upload,url',
            'link' => 'sometimes|required|string|max:500',
            'link_type' => 'sometimes|required|in:url,path,dsa',
            'other_url' => 'nullable|string|max:500',
            'target_audience' => 'nullable|array',
            'target_audience.*' => 'nullable|string|max:500',
            'terms_conditions' => 'nullable|array',
            'terms_conditions.*' => 'nullable|string|max:500',
            'instructions' => 'nullable|array',
            'instructions.*' => 'nullable|string|max:500',
            'display_order' => 'nullable|integer',
            'is_active' => 'nullable',
            'android' => 'nullable',
            'web' => 'nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $item = ServiceItem::findOrFail($id);
            $filterEmpty = fn($arr) => array_values(array_filter($arr ?? [], fn($item) => !empty(trim($item))));

            $data = [];
            if ($request->has('category_id')) $data['category_id'] = $request->category_id;
            if ($request->has('title')) $data['title'] = $request->title;
            if ($request->has('link')) $data['link'] = $request->link;
            if ($request->has('link_type')) $data['link_type'] = $request->link_type;
            if ($request->has('display_order')) $data['display_order'] = $request->display_order;
            if ($request->has('is_active')) $data['is_active'] = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
            if ($request->has('android')) $data['android'] = filter_var($request->android, FILTER_VALIDATE_BOOLEAN);
            if ($request->has('web')) $data['web'] = filter_var($request->web, FILTER_VALIDATE_BOOLEAN);
            if ($request->has('icon_type')) $data['icon_type'] = $request->icon_type;
            if ($request->icon_url) $data['icon'] = $request->icon_url;
            if ($request->has('other_url')) $data['other_url'] = $request->other_url;
            if ($request->has('target_audience')) $data['target_audience'] = $filterEmpty($request->target_audience);
            if ($request->has('terms_conditions')) $data['terms_conditions'] = $filterEmpty($request->terms_conditions);
            if ($request->has('instructions')) $data['instructions'] = $filterEmpty($request->instructions);

            $item->update($data);

            return response()->json([
                'status' => 1,
                'message' => 'Item updated successfully',
                'data' => $item->fresh()->load('category'),
            ]);
        } catch (\Exception $e) {
            Log::error('AdminDsaController: Error updating item', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update item',
            ], 500);
        }
    }

    /**
     * Delete an item
     */
    public function destroyItem($id)
    {
        try {
            $item = ServiceItem::findOrFail($id);

            // Delete icon from BunnyCDN storage
            if ($item->icon && $item->icon_type === 'upload') {
                $path = $this->storageService->extractPath($item->icon);
                if ($path) {
                    $this->storageService->delete($path);
                }
            }

            $item->delete();

            return response()->json([
                'status' => 1,
                'message' => 'Item deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('AdminDsaController: Error deleting item', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to delete item',
            ], 500);
        }
    }

    // ========================================
    // PUBLIC API FOR APP/WEB
    // ========================================

    /**
     * Get all active categories with their active items
     * For public consumption (Android app / Web)
     * DSA links are built dynamically using user's dsa_code
     */
    public function getServices(Request $request)
    {
        try {
            $platform = $request->header('platform', 'web');
            $platform = $platform == 'app' || $platform == 'flutter' ? 'android' : $platform;
            $user = $request->user;
            $userDsaCode = $user?->dsa_code;

            $categories = ServiceCategory::active()
                ->ordered()
                ->with(['items' => function ($query) use ($platform) {
                    $query->active()->ordered();
                    if ($platform === 'android') {
                        $query->forAndroid();
                    } else {
                        $query->forWeb();
                    }
                }])
                ->get()
                ->filter(function ($category) {
                    return $category->items->isNotEmpty();
                })
                ->values();

            // Transform items to build DSA URLs
            $categories->transform(function ($category) use ($userDsaCode) {
                $category->items->transform(function ($item) use ($userDsaCode) {
                    if ($item->isDsaLink()) {
                        $item->link = $item->buildDsaUrl($userDsaCode);
                    }
                    return $item;
                });
                return $category;
            });

            return response()->json([
                'status' => 1,
                'data' => $categories,
                'platform' => $platform,
            ]);
        } catch (\Exception $e) {
            Log::error('AdminDsaController: Error fetching services', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch services',
            ], 500);
        }
    }

    // ========================================
    // USER MANAGEMENT FOR DSA
    // ========================================

    /**
     * List users with pagination for DSA management
     */
    public function listUsers(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search');

            $query = \App\Models\User::query()
                ->select(['id', 'mid', 'name', 'mobile', 'email', 'dsa_code', 'status', 'created_at']);

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('mobile', 'like', "%{$search}%")
                      ->orWhere('mid', 'like', "%{$search}%")
                      ->orWhere('dsa_code', 'like', "%{$search}%");
                });
            }

            $users = $query->orderBy('id', 'desc')->paginate($perPage);

            return response()->json([
                'status' => 1,
                'message' => 'Users fetched successfully',
                'data' => $users,
            ]);
        } catch (\Exception $e) {
            Log::error('AdminDsaController: Error fetching users', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch users',
            ], 500);
        }
    }

    /**
     * Update user's DSA code
     */
    public function updateUserDsaCode(Request $request, $userId)
    {
        $validator = Validator::make($request->all(), [
            'dsa_code' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $user = \App\Models\User::findOrFail($userId);
            $user->dsa_code = $request->dsa_code;
            $user->save();

            return response()->json([
                'status' => 1,
                'message' => 'DSA code updated successfully',
                'data' => [
                    'id' => $user->id,
                    'dsa_code' => $user->dsa_code,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('AdminDsaController: Error updating DSA code', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update DSA code',
            ], 500);
        }
    }

    /**
     * Get DSA login URL for a specific user (admin proxy)
     */
    public function getUserDsaLoginUrl($userId)
    {
        try {
            $user = \App\Models\User::findOrFail($userId);
            
            $dsaService = app(\App\Services\IndiaSalesDsaService::class);
            $result = $dsaService->getLoginUrl($user);

            if ($result['success']) {
                return response()->json([
                    'status' => 1,
                    'message' => 'DSA login URL generated successfully',
                    'data' => [
                        'login_url' => $result['login_url'],
                        'dashboard_url' => $result['dashboard_url'] ?? null,
                    ],
                ]);
            }

            return response()->json([
                'status' => 0,
                'message' => $result['message'] ?? 'Failed to generate DSA login URL',
            ], 400);
        } catch (\Exception $e) {
            Log::error('AdminDsaController: Error getting DSA login URL', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to generate DSA login URL',
            ], 500);
        }
    }

    // ========================================
    // UTM LEAD CRUD
    // ========================================

    /**
     * List all Leads with pagination and search
     */
    public function utmList(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 25);
            $search = $request->get('search');
            $status = $request->get('status');
            $payoutStatus = $request->get('payout_status');
            $itemId = $request->get('item_id');
            $catId = $request->get('cat_id');
            $user = $request->get('user');

            if($user->role==1){
                $query = UtmLead::with(['category', 'item', 'admin'])
                ->orderBy('id', 'desc');
            }else if($user->role==2){
                $query = UtmLead::with(['category', 'item', 'admin'])
                ->orderBy('id', 'desc')
                ->where('admin_id', $user->id);
            } else {
                $query = UtmLead::with(['category', 'item', 'admin'])
                ->orderBy('id', 'desc')
                ->where('mid', $user->mid);
            }

            if ($search) {
                $query->search($search);
            }

            if ($status !== null) {
                $query->status($status);
            }

            if ($payoutStatus !== null) {
                $query->payoutStatus($payoutStatus);
            }

            if ($itemId) {
                $query->where('item_id', $itemId);
            }

            if ($catId) {
                $query->where('cat_id', $catId);
            }

            $leads = $query->paginate($perPage);

            return response()->json([
                'status' => 1,
                'message' => 'Leads fetched successfully',
                'data' => $leads,
            ]);
        } catch (\Exception $e) {
            Log::error('AdminDsaController: Error fetching Leads', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch Leads',
            ], 500);
        }
    }

    /**
     * Get single UTM lead
     */
    public function utm($id)
    {
        try {
            $lead = UtmLead::with(['category', 'item', 'admin'])->findOrFail($id);

            return response()->json([
                'status' => 1,
                'data' => $lead,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Lead not found',
            ], 404);
        }
    }

    /**
     * Create a new Lead
     */
    public function utmStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'mid' => 'nullable|string|max:50',
            'cat_id' => 'nullable|integer|exists:app_service_categories,id',
            'item_id' => 'nullable|integer|exists:app_service_items,id',
            'name' => 'required|string|max:100',
            'mobile' => 'required|string|max:15',
            'email' => 'nullable|email|max:100',
            'status' => 'nullable|string|max:50',
            'amount' => 'nullable|numeric|min:0',
            'payout_status' => 'nullable|string|max:50',
            'remarks' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $admin = $request->get('admin');
        $user = $request->get('user');
        try {
            $data = [
                'mid' => $request->mid ?? $user->mid,
                'cat_id' => $request->cat_id,
                'item_id' => $request->item_id,
                'name' => $request->name,
                'mobile' => $request->mobile,
                'email' => $request->email,
                'status' => $request->status ?? 0,
                'amount' => $request->amount ?? 0,
                'payout_status' => $request->payout_status ?? 0,
                'remarks' => $request->remarks,
                'admin_id' => $admin->id,
            ];

            $lead = UtmLead::create($data);

            // Send notification if item has link_type='path' and other_url
            if ($request->item_id) {
                $item = ServiceItem::find($request->item_id);
                if ($item && $item->link_type === 'path' && !empty($item->other_url)) {
                    $this->sendLeadNotification($lead, $item, $admin);
                }
            }

            return response()->json([
                'status' => 1,
                'message' => 'Lead created successfully',
                'data' => $lead->load(['category', 'item', 'admin']),
            ], 201);
        } catch (\Exception $e) {
            $refId = CatchLogService::logException($request, 'utmStore', $e, [
                'context' => 'UTM Lead creation error',
            ]);

            return response()->json([
                'status'  => 0,
                'message' => $e->getMessage().' Internal Server Error',
                'ref_id'  => $refId,
            ], 500);
        }
    }

    /**
     * Update a UTM lead
     */
    public function utmUpdate(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'mid' => 'nullable|string|max:50',
            'cat_id' => 'nullable|integer|exists:app_service_categories,id',
            'item_id' => 'nullable|integer|exists:app_service_items,id',
            'name' => 'sometimes|required|string|max:100',
            'mobile' => 'sometimes|required|string|max:15',
            'email' => 'nullable|email|max:100',
            'status' => 'nullable|string|max:50',
            'amount' => 'nullable|numeric|min:0',
            'payout_status' => 'nullable|string|max:50',
            'remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

       
        try {
            $lead = UtmLead::findOrFail($id);
            $admin = $request->get('admin');
            $user = $request->get('user');
            $data = [];
            if ($request->has('mid')) $data['mid'] = $user->mid;
            if ($request->has('cat_id')) $data['cat_id'] = $request->cat_id;
            if ($request->has('item_id')) $data['item_id'] = $request->item_id;
            if ($request->has('name')) $data['name'] = $request->name;
            if ($request->has('mobile')) $data['mobile'] = $request->mobile;
            if ($request->has('email')) $data['email'] = $request->email;
            if ($request->has('status')) $data['status'] = $request->status;
            if ($request->has('amount')) $data['amount'] = $request->amount;
            if ($request->has('payout_status')) $data['payout_status'] = $request->payout_status;
            if ($request->has('remarks')) $data['remarks'] = $request->remarks;
            if ($request->has('admin_id')) $data['admin_id'] = $admin->id;

            $lead->update($data);

            return response()->json([
                'status' => 1,
                'message' => 'Lead updated successfully',
                'data' => $lead->fresh()->load(['category', 'item', 'admin']),
            ]);
        } catch (\Exception $e) {
            Log::error('AdminDsaController: Error updating Lead', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update Lead',
            ], 500);
        }
    }

    /**
     * Delete a UTM lead
     */
    public function utmDestroy($id)
    {
        try {
            $lead = UtmLead::findOrFail($id);
            $lead->delete();

            return response()->json([
                'status' => 1,
                'message' => 'Lead deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('AdminDsaController: Error deleting Lead', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to delete Lead',
            ], 500);
        }
    }

    // ========================================
    // USER LEAD METHODS
    // ========================================

    /**
     * Get lead stats for user by item
     */
    public function userLeadStats(Request $request)
    {
        try {
            $user = $request->get('user');
            $itemId = $request->get('item_id');

            $query = UtmLead::where('mid', $user->mid);
            
            if ($itemId) {
                $query->where('item_id', $itemId);
            }

            $total = (clone $query)->count();
            $pending = (clone $query)->where('status', 0)->count();
            $approved = (clone $query)->where('status', 1)->count();
            $rejected = (clone $query)->where('status', 2)->count();

            return response()->json([
                'status' => 1,
                'data' => [
                    'total' => $total,
                    'pending' => $pending,
                    'approved' => $approved,
                    'rejected' => $rejected,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('AdminDsaController: Error fetching user lead stats', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch stats',
            ], 500);
        }
    }

    /**
     * List leads for user by item
     */
    public function userLeadList(Request $request)
    {
        try {
            $user = $request->get('user');
            $itemId = $request->get('item_id');
            $perPage = $request->get('per_page', 15);

            $query = UtmLead::where('mid', $user->mid)
                ->with(['category', 'item'])
                ->orderBy('created_at', 'desc');
            
            if ($itemId) {
                $query->where('item_id', $itemId);
            }

            $leads = $query->paginate($perPage);

            return response()->json([
                'status' => 1,
                'data' => $leads,
            ]);
        } catch (\Exception $e) {
            Log::error('AdminDsaController: Error fetching user leads', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch leads',
            ], 500);
        }
    }

    /**
     * User apply for lead
     */
    public function userLeadApply(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cat_id' => 'nullable|integer|exists:app_service_categories,id',
            'item_id' => 'required|integer|exists:app_service_items,id',
            'name' => 'required|string|max:100',
            'mobile' => 'required|string|max:15',
            'email' => 'nullable|email|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $user = $request->get('user');
            $admin = $request->get('admin');
            // Get item to check for link_type and other_url
            $item = ServiceItem::findOrFail($request->item_id);

            $lead = UtmLead::create([
                'mid' => $user->mid,
                'cat_id' => $request->cat_id ?? $item->category_id,
                'item_id' => $request->item_id,
                'name' => $request->name,
                'mobile' => $request->mobile,
                'email' => $request->email,
                'admin_id' => $admin->id,
                'status' => 0,
                'payout_status' => 0,
            ]);

            // Send notification if link_type is 'path' and has other_url
            if ($item->link_type === 'path' && !empty($item->other_url)) {
                $this->sendLeadNotification($lead, $item , $admin);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Application submitted successfully',
                'data' => $lead->load(['category', 'item']),
            ], 201);
        } catch (\Exception $e) {
            Log::error('AdminDsaController: Error creating user lead', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 0,
                'message' => 'Failed to submit application',
            ], 500);
        }
    }

    /**
     * Send email and SMS notification to customer
     */
    private function sendLeadNotification($lead, $item , $admin)
    {
        try {

            $name = $lead->name;
            $itemTitle = $item->title;
            $itemUrl = $item->other_url;
            $number = $lead->mobile;
            $toEmail = $lead->email;
            $subject = 'Complete your '.$item->title.' Application';    
            if ($admin) {
                $adminId = $admin->id;
                $messageRow = getMessageRow("utm_lead", $adminId);
                if (!$messageRow) {
                    return [
                        'status' => 0,
                        'message' => 'Message not sent due to Technical issue. Please contact the administrator.'
                    ];
                }

                $messageTemplate = $messageRow->message;
                eval("\$message = \"$messageTemplate\";");

                sendSms($message, $adminId, $number,$messageRow->template_id);
                sentMail($toEmail, $subject, $adminId, $message);
            } 

        } catch (\Exception $e) {
            Log::error('AdminDsaController: Error sending lead notification', ['error' => $e->getMessage()]);
        }
    }
}
