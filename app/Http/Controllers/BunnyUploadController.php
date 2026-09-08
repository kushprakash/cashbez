<?php

namespace App\Http\Controllers;

use App\Services\BunnyStorageService;
use Illuminate\Http\Request;

/**
 * Provides BunnyCDN upload configuration for frontend direct uploads
 * and secure delete operations (delete only through backend)
 */
class BunnyUploadController extends Controller
{
    private BunnyStorageService $storageService;

    public function __construct(BunnyStorageService $storageService)
    {
        $this->storageService = $storageService;
    }

    /**
     * Get upload configuration for frontend
     * Frontend will use this to upload directly to BunnyCDN
     */
    public function getConfig(Request $request)
    {
        $region = trim(config('services.bunny_storage.region') ?? '');
        $regionPrefix = !empty($region) ? rtrim($region, '.') . '.' : '';
        $storageZone = trim(config('services.bunny_storage.storage_zone') ?? '');

        return response()->json([
            'status' => 1,
            'data' => [
                'api_key'      => config('services.bunny_storage.api_key'),
                'storage_zone' => $storageZone,
                'region'       => $region,
                'cdn_hostname' => config('services.bunny_storage.cdn_hostname'),
                'upload_url'   => "https://{$regionPrefix}storage.bunnycdn.com/{$storageZone}",
            ]
        ]);
    }

    /**
     * Delete a file from BunnyCDN storage
     * This is the only way to delete files - keeps API key secure on server
     * 
     * @param Request $request Contains 'url' (CDN URL) or 'path' (storage path)
     */
    public function delete(Request $request)
    {
        $url = $request->input('url');
        $path = $request->input('path');

        // If URL provided, extract path from it
        if ($url && !$path) {
            $path = $this->storageService->extractPath($url);
        }

        if (!$path) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid URL or path provided',
            ], 400);
        }

        $success = $this->storageService->delete($path);

        return response()->json([
            'status' => $success ? 1 : 0,
            'message' => $success ? 'File deleted successfully' : 'Failed to delete file',
        ]);
    }
}
