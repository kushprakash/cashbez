<?php

namespace App\Http\Controllers;

use App\Models\Payout;
use App\Models\Recharge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DebugController extends Controller
{
    public function checkAggregation(Request $request)
    {
        // Only allow in development
        if (!config('app.debug')) {
            return response()->json(['error' => 'Debug endpoints disabled in production'], 403);
        }

        $userId = $request->input('user_id');
        if (!$userId) {
            return response()->json(['error' => 'user_id parameter required'], 400);
        }

        // Raw payout aggregates
        $payoutRawAgg = DB::table('payouts')
            ->where('user_id', $userId)
            ->selectRaw('status, COUNT(*) as count, COALESCE(SUM(amount), 0) as total_amount')
            ->groupBy('status')
            ->get();

        // Raw recharge aggregates
        $rechargeRawAgg = DB::table('recharges')
            ->where('user_id', $userId)
            ->selectRaw('status, COUNT(*) as count, COALESCE(SUM(amount), 0) as total_amount')
            ->groupBy('status')
            ->get();

        // Sample rows for each status
        $payoutSamples = DB::table('payouts')
            ->where('user_id', $userId)
            ->select('id', 'status', 'status_number', 'amount', 'created_at')
            ->limit(5)
            ->get();

        $rechargeSamples = DB::table('recharges')
            ->where('user_id', $userId)
            ->select('id', 'status', 'amount', 'created_at')
            ->limit(5)
            ->get();

        return response()->json([
            'payouts' => [
                'raw_aggregates' => $payoutRawAgg,
                'sample_rows' => $payoutSamples,
                'status_constants' => [
                    'STATUS_PENDING' => Payout::STATUS_PENDING,
                    'STATUS_SUCCESS' => Payout::STATUS_SUCCESS,
                    'STATUS_FAILED' => Payout::STATUS_FAILED,
                    'STATUS_PROCESSING' => Payout::STATUS_PROCESSING
                ]
            ],
            'recharges' => [
                'raw_aggregates' => $rechargeRawAgg,
                'sample_rows' => $rechargeSamples
            ]
        ]);
    }
}