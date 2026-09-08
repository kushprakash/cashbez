<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\BbpsCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class BbpsCategoryController extends Controller
{
    /**
     * Display a listing of BBPS Categories.
     */
    public function index(Request $request)
    {
        try {
            $query = BbpsCategory::query();

            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('category', 'like', "%{$search}%")
                      ->orWhere('label', 'like', "%{$search}%");
                });
            }

            $perPage = $request->get('per_page', 10);
            if ($perPage == -1 || $perPage == 'all') {
                $categories = $query->orderBy('id', 'asc')->get();
                return response()->json([
                    'status' => 1,
                    'message' => 'Categories retrieved successfully',
                    'data' => $categories
                ]);
            }

            $categories = $query->orderBy('id', 'asc')->paginate($perPage);

            return response()->json([
                'status' => 1,
                'message' => 'Categories retrieved successfully',
                'data' => $categories->items(),
                'pagination' => [
                    'total' => $categories->total(),
                    'per_page' => $categories->perPage(),
                    'current_page' => $categories->currentPage(),
                    'last_page' => $categories->lastPage(),
                    'from' => $categories->firstItem(),
                    'to' => $categories->lastItem(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching BBPS categories: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch categories: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created category.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:150',
                'category' => 'required|string|max:150',
                'label' => 'nullable|string|max:200',
                'image' => 'nullable|string|max:500',
                'popular' => 'nullable|boolean',
                'mobile_required' => 'nullable|boolean',
                'is_mobile_required' => 'nullable|boolean',
                'show_mobile' => 'nullable|boolean',
                'has_mobile' => 'nullable|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();
            if (empty($data['label'])) {
                $data['label'] = $data['name'];
            }

            $category = BbpsCategory::create($data);

            return response()->json([
                'status' => 1,
                'message' => 'BBPS Category created successfully',
                'data' => $category
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating BBPS Category: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to create category: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified category.
     */
    public function show($id)
    {
        try {
            $category = BbpsCategory::find($id);

            if (!$category) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Category not found'
                ], 404);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Category details retrieved',
                'data' => $category
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error fetching category: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified category.
     */
    public function update(Request $request, $id)
    {
        try {
            $category = BbpsCategory::find($id);

            if (!$category) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Category not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:150',
                'category' => 'required|string|max:150',
                'label' => 'nullable|string|max:200',
                'image' => 'nullable|string|max:500',
                'popular' => 'nullable|boolean',
                'mobile_required' => 'nullable|boolean',
                'is_mobile_required' => 'nullable|boolean',
                'show_mobile' => 'nullable|boolean',
                'has_mobile' => 'nullable|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $category->update($request->all());

            return response()->json([
                'status' => 1,
                'message' => 'BBPS Category updated successfully',
                'data' => $category
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating BBPS Category: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update category: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified category.
     */
    public function destroy($id)
    {
        try {
            $category = BbpsCategory::find($id);

            if (!$category) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Category not found'
                ], 404);
            }

            $category->delete();

            return response()->json([
                'status' => 1,
                'message' => 'Category deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to delete category: ' . $e->getMessage()
            ], 500);
        }
    }
}
