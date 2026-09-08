<?php

namespace App\Services;

use Google\Auth\Credentials\ServiceAccountCredentials;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\FcmToken;

class FcmService
{
    private $projectId;
    private $credentialsPath;

    public function __construct()
    {
        $this->projectId = config('services.firebase.project_id', 'enexa-erp-cashbez');
        $this->credentialsPath = storage_path('app/firebase-service-account.json');
    }

    /**
     * Get OAuth2 access token for FCM HTTP v1 API
     */
    private function getAccessToken()
    {
        if (!file_exists($this->credentialsPath)) {
            Log::error('Firebase service account file not found at: ' . $this->credentialsPath);
            throw new \Exception('Firebase service account file not found');
        }

        $credentials = new ServiceAccountCredentials(
            'https://www.googleapis.com/auth/firebase.messaging',
            json_decode(file_get_contents($this->credentialsPath), true)
        );

        $token = $credentials->fetchAuthToken();
        return $token['access_token'];
    }

    /**
     * Send notification to a single device token
     */
    public function sendToDevice($token, $title, $body, $data = [], $type = 'system')
    {
        try {
            $accessToken = $this->getAccessToken();

            $message = [
                'message' => [
                    'token' => $token,
                    'notification' => [
                        'title' => $title,
                        'body' => $body,
                    ],
                    'data' => array_merge($data, [
                        'type' => $type,
                        'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                    ]),
                    'android' => [
                        'priority' => 'high',
                        'notification' => [
                            'sound' => 'default',
                            'channel_id' => 'high_importance_channel',
                        ],
                    ],
                    'apns' => [
                        'payload' => [
                            'aps' => [
                                'sound' => 'default',
                                'badge' => 1,
                            ],
                        ],
                    ],
                ],
            ];

            $response = Http::withToken($accessToken)
                ->post("https://fcm.googleapis.com/v1/projects/{$this->projectId}/messages:send", $message);

            if ($response->successful()) {
                Log::info('FCM notification sent successfully', ['token' => substr($token, 0, 20) . '...']);
                return [
                    'success' => true,
                    'message' => 'Notification sent successfully',
                    'response' => $response->json(),
                ];
            } else {
                Log::error('FCM notification failed', [
                    'status' => $response->status(),
                    'error' => $response->json(),
                ]);
                return [
                    'success' => false,
                    'message' => 'Failed to send notification',
                    'error' => $response->json(),
                ];
            }
        } catch (\Exception $e) {
            Log::error('FCM Service Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Send notification to a user (all their active devices)
     */
    public function sendToUser($userId, $title, $body, $data = [], $type = 'system')
    {
        $tokens = FcmToken::where('user_id', $userId)
            ->active()
            ->pluck('token')
            ->toArray();

        if (empty($tokens)) {
            return [
                'success' => false,
                'message' => 'No active FCM tokens found for user',
                'tokens_sent' => 0,
                'tokens_delivered' => 0,
                'tokens_failed' => 0,
                'results' => [],
            ];
        }

        $results = [];
        foreach ($tokens as $token) {
            $results[] = $this->sendToDevice($token, $title, $body, $data, $type);
        }

        $successCount = collect($results)->where('success', true)->count();
        $failCount = collect($results)->where('success', false)->count();
        
        return [
            'success' => $successCount > 0,
            'message' => "Sent to {$successCount} of " . count($tokens) . " devices",
            'tokens_sent' => count($tokens),
            'tokens_delivered' => $successCount,
            'tokens_failed' => $failCount,
            'results' => $results,
        ];
    }

    /**
     * Send notification to multiple users (campaign)
     */
    public function sendCampaign($title, $body, $data = [], $type = 'promotional', $userIds = null)
    {
        $query = FcmToken::active();
        
        if ($userIds) {
            $query->whereIn('user_id', $userIds);
        }

        $tokens = $query->pluck('token')->unique()->toArray();

        if (empty($tokens)) {
            return [
                'success' => false,
                'message' => 'No active FCM tokens found',
                'tokens_sent' => 0,
                'tokens_delivered' => 0,
                'tokens_failed' => 0,
                'results' => [],
            ];
        }

        $successCount = 0;
        $failCount = 0;
        $results = [];

        foreach ($tokens as $token) {
            $result = $this->sendToDevice($token, $title, $body, $data, $type);
            $results[] = $result;
            if ($result['success']) {
                $successCount++;
            } else {
                $failCount++;
            }
        }

        return [
            'success' => $successCount > 0,
            'message' => "Campaign sent: {$successCount} succeeded, {$failCount} failed",
            'tokens_sent' => count($tokens),
            'tokens_delivered' => $successCount,
            'tokens_failed' => $failCount,
            'results' => $results,
        ];
    }

    /**
     * Send notification to a topic
     */
    public function sendToTopic($topic, $title, $body, $data = [], $type = 'system')
    {
        try {
            $accessToken = $this->getAccessToken();

            $message = [
                'message' => [
                    'topic' => $topic,
                    'notification' => [
                        'title' => $title,
                        'body' => $body,
                    ],
                    'data' => array_merge($data, [
                        'type' => $type,
                        'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                    ]),
                ],
            ];

            $response = Http::withToken($accessToken)
                ->post("https://fcm.googleapis.com/v1/projects/{$this->projectId}/messages:send", $message);

            return [
                'success' => $response->successful(),
                'message' => $response->successful() ? 'Topic notification sent' : 'Failed',
                'response' => $response->json(),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
