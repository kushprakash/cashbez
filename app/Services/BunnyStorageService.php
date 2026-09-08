<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service for uploading files to Bunny.net Edge Storage
 * 
 * Uses the Bunny.net Storage API to upload files and returns CDN URLs
 * Files are accessed via a linked Pull Zone for public delivery
 */
class BunnyStorageService
{
    private ?string $apiKey;
    private ?string $storageZone;
    private ?string $region;
    private ?string $cdnHostname;
    private ?string $storageHostname;

    public function __construct()
    {
        $this->apiKey = config('services.bunny_storage.api_key') ?? env('BUNNY_STORAGE_API_KEY') ?? '';
        $this->storageZone = config('services.bunny_storage.storage_zone') ?? env('BUNNY_STORAGE_ZONE') ?? '';
        $this->region = config('services.bunny_storage.region') ?? env('BUNNY_STORAGE_REGION') ?? 'sg';
        $this->cdnHostname = config('services.bunny_storage.cdn_hostname') ?? env('BUNNY_CDN_HOSTNAME') ?? '';
        
        // Build storage hostname based on region
        // Frankfurt (default) = storage.bunnycdn.com, Others = {region}.storage.bunnycdn.com
        $this->storageHostname = $this->region 
            ? "{$this->region}.storage.bunnycdn.com" 
            : "storage.bunnycdn.com";
    }

    /**
     * Upload a file to Bunny.net Edge Storage
     * 
     * @param UploadedFile $file The file to upload
     * @param string $folder Folder path within storage zone (e.g., 'gst_documents')
     * @return array{success: bool, url: ?string, path: ?string, error: ?string}
     */
    public function upload(UploadedFile $file, string $folder): array
    {
        try {
            if (!$this->isConfigured()) {
                throw new \Exception('BunnyStorageService is not configured. Check environment variables.');
            }

            // Generate unique filename
            $extension = $file->getClientOriginalExtension();
            $filename = md5(uniqid()) . '.' . $extension;
            $storagePath = trim($folder, '/') . '/' . $filename;

            // Read file content
            $fileContent = file_get_contents($file->getRealPath());

            // Upload to Bunny Storage via PUT request
            $uploadUrl = "https://{$this->storageHostname}/{$this->storageZone}/{$storagePath}";
            
            $response = Http::withoutVerifying()->withHeaders([
                'AccessKey' => $this->apiKey,
                'Content-Type' => 'application/octet-stream',
            ])->withBody($fileContent, 'application/octet-stream')
              ->put($uploadUrl);

            // If regional endpoint returned 401, retry with primary default endpoint (storage.bunnycdn.com)
            if ($response->status() === 401 && $this->storageHostname !== 'storage.bunnycdn.com') {
                $primaryUrl = "https://storage.bunnycdn.com/{$this->storageZone}/{$storagePath}";
                $response = Http::withoutVerifying()->withHeaders([
                    'AccessKey' => $this->apiKey,
                    'Content-Type' => 'application/octet-stream',
                ])->withBody($fileContent, 'application/octet-stream')
                  ->put($primaryUrl);
            }

            if (!$response->successful()) {
                Log::error('BunnyStorage: Upload failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'path' => $storagePath,
                ]);
                return [
                    'success' => false,
                    'url' => null,
                    'path' => null,
                    'error' => 'Upload failed: ' . $response->body(),
                ];
            }

            // Generate CDN URL for public access
            $cdnUrl = $this->getPublicUrl($storagePath);

            Log::info('BunnyStorage: File uploaded successfully', [
                'path' => $storagePath,
                'cdn_url' => $cdnUrl,
            ]);

            return [
                'success' => true,
                'url' => $cdnUrl,
                'path' => $storagePath,
                'error' => null,
            ];

        } catch (\Exception $e) {
            Log::error('BunnyStorage: Exception during upload', [
                'error' => $e->getMessage(),
                'folder' => $folder,
            ]);
            return [
                'success' => false,
                'url' => null,
                'path' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Delete a file from Bunny.net Edge Storage
     * 
     * @param string $path Path to the file within storage zone
     * @return bool Success status
     */
    public function delete(string $path): bool
    {
        try {
            if (!$this->isConfigured()) {
                return false;
            }

            $deleteUrl = "https://{$this->storageHostname}/{$this->storageZone}/{$path}";
            
            $response = Http::withoutVerifying()->withHeaders([
                'AccessKey' => $this->apiKey,
            ])->delete($deleteUrl);

            if ($response->successful()) {
                Log::info('BunnyStorage: File deleted', ['path' => $path]);
                return true;
            }

            Log::warning('BunnyStorage: Delete failed', [
                'path' => $path,
                'status' => $response->status(),
            ]);
            return false;

        } catch (\Exception $e) {
            Log::error('BunnyStorage: Exception during delete', [
                'error' => $e->getMessage(),
                'path' => $path,
            ]);
            return false;
        }
    }

    /**
     * Get the public CDN URL for a file
     * 
     * @param string $path Path to the file within storage zone
     * @return string Public CDN URL
     */
    public function getPublicUrl(string $path): string
    {
        $path = ltrim($path, '/');
        return "https://{$this->cdnHostname}/{$path}";
    }

    /**
     * Extract storage path from a CDN URL
     * Useful for delete operations when you only have the CDN URL
     * 
     * @param string $cdnUrl Full CDN URL
     * @return string|null Storage path or null if not a valid CDN URL
     */
    public function extractPath(string $cdnUrl): ?string
    {
        if (!$this->cdnHostname) {
            return null;
        }
        
        $pattern = preg_quote("https://{$this->cdnHostname}/", '/');
        if (preg_match("/^{$pattern}(.+)$/", $cdnUrl, $matches)) {
            return $matches[1];
        }
        
        return null;
    }

    /**
     * Check if the service is properly configured
     * 
     * @return bool
     */
    public function isConfigured(): bool
    {
        return !empty($this->apiKey) 
            && !empty($this->storageZone) 
            && !empty($this->cdnHostname);
    }
}
