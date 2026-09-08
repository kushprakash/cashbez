<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class IndiaSalesDsaService
{
    private CryptoService $cryptoService;
    
    // API Configuration
    private string $baseUrl;
    private string $loginUrl;
    private string $apiKey;
    private string $secretKey;
    private string $reportingPhoneNumber;

    public function __construct(CryptoService $cryptoService)
    {
        $this->cryptoService = $cryptoService;
        
        // Configuration - can be moved to .env for production
        $this->baseUrl = config('services.indiasales.base_url', 'https://api.indiasales.club');
        $this->loginUrl = config('services.indiasales.login_url', 'https://www.indiasales.club/link/');
        $this->apiKey = config('services.indiasales.api_key', 'acc0c9eb-762a-429c-8a44-e908d43dcec8');
        $this->secretKey = config('services.indiasales.secret_key', '96d5b0a8f2923743283748bf5904b615');
        $this->reportingPhoneNumber = config('services.indiasales.reporting_phone', '9835153380');
    }

    /**
     * Get the login URL for showing DSA dashboard in iframe
     *
     * @param User $user
     * @return array - Contains 'success', 'login_url', 'dashboard_url', or 'message' on error
     */
    public function getLoginUrl(User $user): array
    {
        try {
            // Encrypt the phone number
            $encryptedData = $this->cryptoService->encryptDataForAPI(
                $user->mobile,
                $this->secretKey
            );

            // First, try to get transfer token (existing user)
            $response = $this->getTransferToken($encryptedData);

            if ($response['success'] && isset($response['data']['data']['accessToken'])) {
                $token = $response['data']['data']['accessToken'];
                return [
                    'success' => true,
                    'login_url' => $this->loginUrl . $token,
                    'dashboard_url' => 'https://www.indiasales.club/dashboard',
                ];
            }

            // User doesn't exist, create and login
            return $this->createAndLogin($user, $encryptedData);
        } catch (Exception $e) {
            Log::error('IndiaSalesDsaService: Error getting login URL', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'message' => 'An error occurred. Please try again.',
            ];
        }
    }

    /**
     * Request transfer token for existing user
     *
     * @param array $encryptedData
     * @return array
     */
    private function getTransferToken(array $encryptedData): array
    {
        $payload = [
            'phoneNumber' => $encryptedData['encryptedData'],
            'iv' => $encryptedData['iv'],
        ];

        return $this->makeApiRequest('/api/v1/agency/auth/transfer-token', $payload);
    }

    /**
     * Create new user on IndiaSales and get login token
     *
     * @param User $user
     * @param array $encryptedPhoneData
     * @return array
     */
    private function createAndLogin(User $user, array $encryptedPhoneData): array
    {
        try {
            // Encrypt reporting phone number using the same IV
            $encryptedReporting = $this->cryptoService->encryptDataForAPI(
                $this->reportingPhoneNumber,
                $this->secretKey,
                $encryptedPhoneData['iv']
            );

            $payload = [
                'phoneNumber' => $encryptedPhoneData['encryptedData'],
                'iv' => $encryptedPhoneData['iv'],
                'personalDetails' => [
                    'name' => $user->name,
                ],
                'reportingTo' => $encryptedReporting['encryptedData'],
                'designation' => 'Member',
            ];

            $response = $this->makeApiRequest('/api/v1/agency/user/createAndLogin', $payload);

            if ($response['success'] && isset($response['data']['data']['accessToken'])) {
                $token = $response['data']['data']['accessToken'];
                return [
                    'success' => true,
                    'login_url' => $this->loginUrl . $token,
                    'dashboard_url' => 'https://www.indiasales.club/dashboard',
                ];
            }

            // Check if error is "user already exists" - retry transfer-token with new IV
            $errorMessage = $response['message'] ?? '';
            if (stripos($errorMessage, 'already exists') !== false) {
                Log::info('IndiaSalesDsaService: User exists, retrying transfer-token with new IV', [
                    'user_id' => $user->id
                ]);
                
                // Generate new encrypted data with fresh IV and retry transfer-token
                $newEncryptedData = $this->cryptoService->encryptDataForAPI(
                    $user->mobile,
                    $this->secretKey
                );
                
                $retryResponse = $this->getTransferToken($newEncryptedData);
                
                if ($retryResponse['success'] && isset($retryResponse['data']['data']['accessToken'])) {
                    $token = $retryResponse['data']['data']['accessToken'];
                    return [
                        'success' => true,
                        'login_url' => $this->loginUrl . $token,
                        'dashboard_url' => 'https://www.indiasales.club/dashboard',
                    ];
                }
            }

            return [
                'success' => false,
                'message' => $response['message'] ?? 'Failed to create user on DSA platform.',
            ];
        } catch (Exception $e) {
            Log::error('IndiaSalesDsaService: Error creating user', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'message' => 'Please try again...',
            ];
        }
    }


    /**
     * Make an API request to IndiaSales
     *
     * @param string $endpoint
     * @param array $data
     * @return array
     */
    private function makeApiRequest(string $endpoint, array $data): array
    {
        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . $endpoint, $data);

            $httpCode = $response->status();
            $responseData = $response->json();

            if ($response->successful() && $responseData) {
                return [
                    'success' => true,
                    'status' => $httpCode,
                    'data' => $responseData,
                ];
            }

            return [
                'success' => false,
                'status' => $httpCode,
                'data' => $responseData,
                'message' => $responseData['message'] ?? $responseData['msg'] ?? 'Request failed.',
            ];
        } catch (Exception $e) {
            Log::error('IndiaSalesDsaService: API request failed', [
                'endpoint' => $endpoint,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'status' => 500,
                'message' => 'Request failed.',
            ];
        }
    }
}
