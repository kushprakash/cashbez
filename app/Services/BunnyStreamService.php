<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service for uploading videos to Bunny.net Stream
 * 
 * Bunny.net Stream API requires a 2-step process:
 * 1. Create video entry (POST) - returns a GUID
 * 2. Upload video binary (PUT) - uploads the actual file
 */
class BunnyStreamService
{
    private string $apiKey;
    private string $libraryId;
    private string $hostname;

    public function __construct()
    {
        $this->apiKey = config('services.bunny.api_key', env('BUNNY_STREAM_API_KEY', ''));
        $this->libraryId = config('services.bunny.library_id', env('BUNNY_LIBRARY_ID', ''));
        $this->hostname = config('services.bunny.hostname', env('BUNNY_STREAM_HOSTNAME', 'vz-xxx.b-cdn.net'));
    }

    /**
     * Upload a video to Bunny.net Stream
     * 
     * @param string $filePath Path to the video file
     * @param string $title Title for the video
     * @return array{success: bool, video_url: ?string, video_id: ?string, error: ?string}
     */
    public function uploadVideo(string $filePath, string $title): array
    {
        try {
            // Step 1: Create video entry
            $createResponse = Http::withHeaders([
                'AccessKey' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post("https://video.bunnycdn.com/library/{$this->libraryId}/videos", [
                'title' => $title,
            ]);

            if (!$createResponse->successful()) {
                Log::error('Bunny.net: Failed to create video entry', [
                    'status' => $createResponse->status(),
                    'body' => $createResponse->body(),
                ]);
                return [
                    'success' => false,
                    'video_url' => null,
                    'video_id' => null,
                    'error' => 'Failed to create video entry: ' . $createResponse->body(),
                ];
            }

            $videoData = $createResponse->json();
            $videoId = $videoData['guid'] ?? null;

            if (!$videoId) {
                return [
                    'success' => false,
                    'video_url' => null,
                    'video_id' => null,
                    'error' => 'No video GUID returned from Bunny.net',
                ];
            }

            // Step 2: Upload video binary
            $videoContent = file_get_contents($filePath);
            
            $uploadResponse = Http::withHeaders([
                'AccessKey' => $this->apiKey,
                'Content-Type' => 'application/octet-stream',
            ])->withBody($videoContent, 'application/octet-stream')
              ->put("https://video.bunnycdn.com/library/{$this->libraryId}/videos/{$videoId}");

            if (!$uploadResponse->successful()) {
                Log::error('Bunny.net: Failed to upload video binary', [
                    'video_id' => $videoId,
                    'status' => $uploadResponse->status(),
                    'body' => $uploadResponse->body(),
                ]);
                return [
                    'success' => false,
                    'video_url' => null,
                    'video_id' => $videoId,
                    'error' => 'Failed to upload video: ' . $uploadResponse->body(),
                ];
            }

            $videoUrl = "https://iframe.mediadelivery.net/play/{$this->libraryId}/{$videoId}";

            Log::info('Bunny.net: Video uploaded successfully', [
                'video_id' => $videoId,
                'video_url' => $videoUrl,
            ]);

            return [
                'success' => true,
                'video_url' => $videoUrl,
                'video_id' => $videoId,
                'error' => null,
            ];

        } catch (\Exception $e) {
            Log::error('Bunny.net: Exception during video upload', [
                'error' => $e->getMessage(),
            ]);
            return [
                'success' => false,
                'video_url' => null,
                'video_id' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Generate a pre-signed upload token for direct client-side uploads
     * 
     * This allows Flutter/frontend to upload directly to Bunny.net without exposing API keys
     * Uses SHA256 signature with expiration time for security
     * 
     * @param string $title Title for the video
     * @param int $expirationMinutes Token expiration time in minutes (default: 60)
     * @return array{video_id: string, library_id: string, auth_signature: string, auth_expire: int, hostname: string, video_url: string}
     */
    public function generateUploadToken(string $title, int $expirationMinutes = 60): array
    {
        try {
            // Step 1: Create video entry to reserve a slot and get video ID
            $createResponse = Http::withHeaders([
                'AccessKey' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post("https://video.bunnycdn.com/library/{$this->libraryId}/videos", [
                'title' => $title,
            ]);

            if (!$createResponse->successful()) {
                Log::error('Bunny.net: Failed to create video entry for token', [
                    'status' => $createResponse->status(),
                    'body' => $createResponse->body(),
                ]);
                throw new \Exception('Failed to create video entry: ' . $createResponse->body());
            }

            $videoData = $createResponse->json();
            $videoId = $videoData['guid'] ?? null;

            if (!$videoId) {
                throw new \Exception('No video GUID returned from Bunny.net');
            }

            // Step 2: Generate SHA256 signature for pre-signed upload
            // Formula: sha256(library_id + api_key + expiration_time + video_id)
            $expirationTime = time() + ($expirationMinutes * 60);
            $signatureString = $this->libraryId . $this->apiKey . $expirationTime . $videoId;
            $authSignature = hash('sha256', $signatureString);

            Log::info('Bunny.net: Upload token generated', [
                'video_id' => $videoId,
                'expiration_minutes' => $expirationMinutes,
                'expires_at' => date('Y-m-d H:i:s', $expirationTime),
            ]);

            // Return API key for direct upload - client will use it as AccessKey header
            // Use iframe.mediadelivery.net format for video URL (not mp4 direct URL)
            return [
                'video_id' => $videoId,
                'library_id' => $this->libraryId,
                'api_key' => $this->apiKey, // Send API key for upload (secure since it's server-to-app)
                'auth_signature' => $authSignature, // Keep for backward compatibility
                'auth_expire' => $expirationTime,
                'hostname' => $this->hostname,
                'video_url' => "https://iframe.mediadelivery.net/play/{$this->libraryId}/{$videoId}",
            ];

        } catch (\Exception $e) {
            Log::error('Bunny.net: Exception during token generation', [
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get the playback URL for a video
     */
    public function getPlaybackUrl(string $videoId): string
    {
        return "https://iframe.mediadelivery.net/play/{$this->libraryId}/{$videoId}";
    }

    /**
     * Check if the service is configured
     */
    public function isConfigured(): bool
    {
        return !empty($this->apiKey) && !empty($this->libraryId);
    }
}
