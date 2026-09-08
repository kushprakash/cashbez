<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\Billing\UdharEntry;
use App\Models\Billing\UdharPayment;
use Illuminate\Http\Request;

class UdharController extends Controller
{
    /**
     * Return all non-cleared udhar entries for the authenticated merchant.
     */
    public function index()
    {
        $entries = UdharEntry::where('merchant_id', auth()->id())
            ->where('status', '!=', 'cleared')
            ->with('udharPayments')
            ->get()
            ->map(function ($entry) {
                $entry->outstanding = (float) $entry->amount - (float) $entry->paid_amount;
                return $entry;
            });

        return response()->json($entries);
    }

    /**
     * Create a new udhar entry for the authenticated merchant.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name'    => 'required|string',
            'customer_phone'   => 'required|string|digits:10',
            'customer_address' => 'nullable|string',
            'amount'           => 'required|numeric|min:1',
            'due_date'         => 'required|date|after:today',
            'local_id'         => 'required|string',
        ]);

        $entry = UdharEntry::create([
            'merchant_id'      => auth()->id(),
            'customer_name'    => $validated['customer_name'],
            'customer_phone'   => $validated['customer_phone'],
            'customer_address' => $validated['customer_address'] ?? null,
            'amount'           => $validated['amount'],
            'due_date'         => $validated['due_date'],
            'local_id'         => $validated['local_id'],
        ]);

        return response()->json([
            'id'         => $entry->id,
            'local_id'   => $entry->local_id,
            'status'     => $entry->status,
            'created_at' => $entry->created_at,
        ], 201);
    }

    /**
     * Record a payment against an udhar entry identified by local_id.
     */
    public function recordPayment(Request $request, $localId)
    {
        $entry = UdharEntry::where('local_id', $localId)
            ->where('merchant_id', auth()->id())
            ->first();

        if (! $entry) {
            return response()->json(['message' => 'Udhar entry not found.'], 404);
        }

        $validated = $request->validate([
            'amount'   => 'required|numeric|min:0.01',
            'local_id' => 'nullable|string',
            'note'     => 'nullable|string',
        ]);

        UdharPayment::create([
            'udhar_entry_id' => $entry->id,
            'local_id'       => $validated['local_id'] ?? null,
            'amount'         => $validated['amount'],
            'note'           => $validated['note'] ?? null,
            'paid_at'        => now(),
        ]);

        $entry->paid_amount = (float) $entry->paid_amount + (float) $validated['amount'];

        if ($entry->paid_amount >= (float) $entry->amount) {
            $entry->status = 'cleared';
        } elseif ($entry->paid_amount > 0) {
            $entry->status = 'partial';
        }

        $entry->save();

        return response()->json($entry->load('udharPayments'));
    }
}
