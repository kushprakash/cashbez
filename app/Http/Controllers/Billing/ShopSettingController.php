<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\Billing\BillMerchantSetting;
use Illuminate\Http\Request;

class ShopSettingController extends Controller
{
    public function index(Request $request)
    {
        $settings = BillMerchantSetting::where('user_id', $request->user()->id)->first();

        // If no settings exist yet, return empty object or default
        if (!$settings) {
            return response()->json([
                'status' => 1,
                'data' => null
            ]);
        }

        return response()->json([
            'status' => 1,
            'data' => $settings
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'shop_name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'gst_number' => 'nullable|string|max:50',
            'logo_path' => 'nullable|string|max:255',
            'units' => 'nullable|array',
        ]);

        $settings = BillMerchantSetting::updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return response()->json([
            'status' => 1,
            'message' => 'Settings saved successfully',
            'data' => $settings
        ]);
    }
}
