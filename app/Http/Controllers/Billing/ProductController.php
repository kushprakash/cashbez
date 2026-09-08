<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    /**
     * index() — Return all products for the authenticated merchant.
     */
    public function index(Request $request)
    {
        $products = Product::where('merchant_id', $request->user()->id)
            ->select('id', 'name', 'selling_price', 'purchase_price', 'gst_rate', 'unit', 'stock_qty', 'low_stock_threshold')
            ->orderBy('name')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    /**
     * store() — Add a new product or update existing.
     */
    public function store(Request $request)
    {
        $merchantId = $request->user()->id;

        $validated = $request->validate([
            'id' => 'required|numeric',
            'name' => 'required|string',
            'sellingPrice' => 'required|numeric',
            'purchasePrice' => 'nullable|numeric',
            'gstRate' => 'nullable|numeric',
            'unit' => 'nullable|string',
            'stockQty' => 'nullable|numeric',
            'lowStockThreshold' => 'nullable|numeric'
        ]);

        DB::table('bill_products')->updateOrInsert(
            [
                'id' => $validated['id'],
                'merchant_id' => $merchantId,
            ],
            [
                'name' => $validated['name'],
                'selling_price' => $validated['sellingPrice'],
                'purchase_price' => $validated['purchasePrice'] ?? 0,
                'gst_rate' => $validated['gstRate'] ?? 0,
                'unit' => $validated['unit'],
                'stock_qty' => $validated['stockQty'] ?? 0,
                'low_stock_threshold' => $validated['lowStockThreshold'],
                'updated_at' => now(),
            ]
        );

        return response()->json(['status' => 'success', 'message' => 'Product saved']);
    }

    /**
     * update() — Update product details (excluding stock_qty).
     */
    public function update(Request $request, $id)
    {
        $merchantId = $request->user()->id;

        $validated = $request->validate([
            'name' => 'required|string',
            'sellingPrice' => 'required|numeric',
            'purchasePrice' => 'nullable|numeric',
            'gstRate' => 'nullable|numeric',
            'unit' => 'nullable|string',
            'lowStockThreshold' => 'nullable|numeric'
        ]);

        DB::table('bill_products')
            ->where('id', $id)
            ->where('merchant_id', $merchantId)
            ->update([
                'name' => $validated['name'],
                'selling_price' => $validated['sellingPrice'],
                'purchase_price' => $validated['purchasePrice'] ?? 0,
                'gst_rate' => $validated['gstRate'] ?? 0,
                'unit' => $validated['unit'],
                'low_stock_threshold' => $validated['lowStockThreshold'],
                'updated_at' => now(),
            ]);

        return response()->json(['status' => 'success', 'message' => 'Product updated']);
    }

    /**
     * adjustStock() — Adjust stock_qty based on movement type.
     */
    public function adjustStock(Request $request, $id)
    {
        $merchantId = $request->user()->id;

        $validated = $request->validate([
            'type' => 'required|string|in:sale,manual_in,manual_out,adjustment',
            'qty' => 'required|numeric',
            'stock_after' => 'required|numeric'
        ]);

        // Directly updating stock to match stock_after
        DB::table('bill_products')
            ->where('id', $id)
            ->where('merchant_id', $merchantId)
            ->update([
                'stock_qty' => $validated['stock_after'],
                'updated_at' => now(),
            ]);

        return response()->json(['status' => 'success', 'message' => 'Stock adjusted']);
    }
}
