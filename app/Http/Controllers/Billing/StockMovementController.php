<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StockMovementController extends Controller
{
    /**
     * store() — Upsert stock movements and update bill_products.stock_qty.
     */
    public function store(Request $request)
    {
        $merchantId = $request->user()->id;
        
        $validated = $request->validate([
            'local_id' => 'required|string',
            'product_id' => 'required|numeric',
            'type' => 'required|string',
            'qty' => 'required|numeric',
            'stock_before' => 'required|numeric',
            'stock_after' => 'required|numeric',
            'note' => 'nullable|string',
            'reference_bill_local_id' => 'nullable|string',
            'is_ghost' => 'nullable|boolean',
            'created_at' => 'required|date'
        ]);

        DB::beginTransaction();
        try {
            // Insert the movement log
            DB::table('bill_stock_movements')->updateOrInsert(
                [
                    'local_id' => $validated['local_id'],
                    'merchant_id' => $merchantId
                ],
                [
                    'product_id' => $validated['product_id'],
                    'type' => $validated['type'],
                    'qty' => $validated['qty'],
                    'stock_before' => $validated['stock_before'],
                    'stock_after' => $validated['stock_after'],
                    'note' => $validated['note'],
                    'reference_bill_local_id' => $validated['reference_bill_local_id'],
                    'is_ghost' => $validated['is_ghost'] ?? false,
                    'created_at' => $validated['created_at']
                ]
            );

            // Update the product's actual stock qty to match stock_after
            DB::table('bill_products')
                ->where('merchant_id', $merchantId)
                ->where('id', $validated['product_id'])
                ->update(['stock_qty' => $validated['stock_after'], 'updated_at' => now()]);

            DB::commit();

            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Stock Movement Sync Error: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'Sync failed'], 500);
        }
    }

    /**
     * index() — Get recent stock movements for a product.
     */
    public function index(Request $request)
    {
        $merchantId = $request->user()->id;
        $productId = $request->query('product_id');

        $query = DB::table('bill_stock_movements')
            ->where('merchant_id', $merchantId);

        if ($productId) {
            $query->where('product_id', $productId);
        }

        $movements = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $movements
        ]);
    }
}
