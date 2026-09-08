<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class RemarkPresetController extends Controller
{
    /**
     * Cache key for the remark presets list.
     * Version is derived from the max updated_at unix timestamp.
     */
    private const CACHE_KEY     = 'remark_presets_list';
    private const CACHE_MINUTES = 60; // Re-read DB every 60 min max

    /**
     * GET /api/admin/remark-presets
     *
     * Returns { version: int, presets: [{id, label, tag, sort_order}] }
     * The frontend compares `version` to its localStorage copy and only
     * re-renders when the version changes.
     */
    public function index(): JsonResponse
    {
        $payload = Cache::remember(self::CACHE_KEY, self::CACHE_MINUTES * 60, function () {
            $rows = DB::table('remark_presets')
                ->where('is_active', true)
                ->orderBy('tag')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->select('id', 'label', 'tag', 'sort_order')
                ->get();

            // Version = unix timestamp of the newest row's updated_at
            $version = (int) DB::table('remark_presets')
                ->where('is_active', true)
                ->max(DB::raw('UNIX_TIMESTAMP(updated_at)'));

            return [
                'version' => $version,
                'presets' => $rows,
            ];
        });

        return response()->json($payload);
    }

    /**
     * GET /api/admin/remark-presets/version
     *
     * Lightweight endpoint — returns only the current version integer.
     * Frontend polls this cheaply before deciding to fetch the full list.
     */
    public function version(): JsonResponse
    {
        $version = Cache::remember(self::CACHE_KEY . '_version', self::CACHE_MINUTES * 60, function () {
            return (int) DB::table('remark_presets')
                ->where('is_active', true)
                ->max(DB::raw('UNIX_TIMESTAMP(updated_at)'));
        });

        return response()->json(['version' => $version]);
    }

    /**
     * Call this whenever a preset is created/updated/deleted to bust the cache.
     * You can call it from an Eloquent observer or a dedicated admin CRUD controller.
     */
    public static function bustCache(): void
    {
        Cache::forget(self::CACHE_KEY);
        Cache::forget(self::CACHE_KEY . '_version');
    }
}
