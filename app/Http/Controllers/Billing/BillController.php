<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\Billing\Bill;
use App\Models\Billing\BillItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BillController extends Controller
{
    /**
     * index() — List bills for the authenticated merchant.
     * Optional filters: payment_mode, date_from, date_to
     * Paginated 20 per page with billItems + customer eager loaded.
     */
    public function index(Request $request)
    {
        $query = Bill::with(['billItems', 'customer'])
            ->where('merchant_id', auth()->id())
            ->orderByDesc('created_at');

        if ($request->filled('payment_mode')) {
            $query->where('payment_mode', $request->payment_mode);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        return response()->json($query->paginate(20));
    }

    /**
     * store() — Create a new bill with its items inside a DB transaction.
     * Returns the created bill including local_id so Flutter can match + mark synced.
     */
    public function store(Request $request)
    {
        $request->validate([
            'local_id'     => 'required|string',
            'payment_mode' => 'required|in:cash,upi,udhar',
            'items'        => 'required|array|min:1',
            'items.*.name' => 'required|string',
            'items.*.qty'  => 'required|numeric|min:0',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.gst_rate'   => 'nullable|numeric',
            'items.*.line_total' => 'required|numeric|min:0',
        ]);

        $bill = DB::transaction(function () use ($request) {
            $bill = Bill::create([
                'merchant_id'  => auth()->id(),
                'local_id'     => $request->local_id,
                'bill_number'  => $request->bill_number,
                'customer_id'  => $request->customer_id,
                'payment_mode' => $request->payment_mode,
                'subtotal'     => $request->subtotal ?? 0,
                'gst_amount'   => $request->gst_amount ?? 0,
                'total'        => $request->total ?? 0,
                'gst_enabled'  => $request->gst_enabled ?? false,
                'notes'        => $request->notes,
                'status'       => 'draft',
            ]);

            foreach ($request->items as $item) {
                BillItem::create([
                    'bill_id'    => $bill->id,
                    'product_id' => $item['product_id'] ?? null,
                    'name'       => $item['name'],
                    'qty'        => $item['qty'],
                    'unit_price' => $item['unit_price'],
                    'gst_rate'   => $item['gst_rate'] ?? 0,
                    'line_total'  => $item['line_total'],
                ]);
            }

            return $bill;
        });

        return response()->json([
            'id'          => $bill->id,
            'local_id'    => $bill->local_id,
            'bill_number' => $bill->bill_number,
            'created_at'  => $bill->created_at,
        ], 201);
    }
}
