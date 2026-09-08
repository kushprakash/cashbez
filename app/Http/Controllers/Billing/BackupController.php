<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BackupController extends Controller
{
    /**
     * Store a new backup.
     */
    public function store(Request $request)
    {
        $request->validate([
            'version'       => 'required|string',
            'source'        => 'required|in:manual,auto,drive',
            'payload'       => 'required|string',
            'drive_file_id' => 'nullable|string|max:255',
            'size_bytes'    => 'nullable|integer|min:0',
        ]);

        // Decode to verify it is valid JSON
        $decoded = json_decode($request->payload, true);
        if (!$decoded || !isset($decoded['merchantId'])) {
            return response()->json([
                'status'  => false,
                'message' => 'Invalid backup payload',
            ], 422);
        }

        // Security: merchantId in payload must match auth user
        if ((string) $decoded['merchantId'] !== (string) auth()->id()) {
            return response()->json([
                'status'  => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Keep only last 3 backups per merchant — delete oldest
        $existing = DB::table('bill_backups')
            ->where('merchant_id', auth()->id())
            ->orderBy('created_at', 'asc')
            ->get(['id']);

        if ($existing->count() >= 3) {
            $toDelete = $existing->take($existing->count() - 2)->pluck('id');
            DB::table('bill_backups')
                ->whereIn('id', $toDelete)
                ->delete();
        }

        $backup = DB::table('bill_backups')->insertGetId([
            'merchant_id'   => auth()->id(),
            'source'        => $request->source,
            'version'       => $request->version,
            'size_bytes'    => $request->input('size_bytes', 0),
            'drive_file_id' => $request->input('drive_file_id'),
            'payload'       => $request->payload,
            'status'        => 'success',
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Backup stored',
            'data'    => ['id' => $backup],
        ]);
    }

    /**
     * List backups for this merchant (metadata only — no payload).
     */
    public function index(Request $request)
    {
        $backups = DB::table('bill_backups')
            ->where('merchant_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get([
                'id', 'source', 'version',
                'size_bytes', 'drive_file_id',
                'status', 'created_at',
            ]);

        return response()->json([
            'status' => true,
            'data'   => $backups,
        ]);
    }

    /**
     * Return single backup WITH payload for restore.
     */
    public function show(Request $request, $id)
    {
        $backup = DB::table('bill_backups')
            ->where('id', $id)
            ->where('merchant_id', auth()->id()) // scoped — never expose others
            ->first();

        if (!$backup) {
            return response()->json([
                'status'  => false,
                'message' => 'Backup not found',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data'   => $backup,
        ]);
    }
}
