<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\Billing\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * index() — Return all customers for the authenticated merchant.
     */
    public function index(Request $request)
    {
        $customers = Customer::where('merchant_id', auth()->id())
            ->select('id', 'name', 'phone')
            ->orderBy('name')
            ->get();

        return response()->json($customers);
    }

    /**
     * store() — Create or return existing customer by merchant_id + phone.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'phone' => 'required|digits:10',
        ]);

        $customer = Customer::firstOrCreate(
            [
                'merchant_id' => auth()->id(),
                'phone'       => $request->phone,
            ],
            [
                'name' => $request->name,
            ]
        );

        return response()->json($customer, $customer->wasRecentlyCreated ? 201 : 200);
    }
}
