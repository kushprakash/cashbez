<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class DigiLockerService
{
    protected string $baseUrl;
    protected string $clientId;
    protected string $clientSecret;
    protected string $redirectUri;

    public function __construct()
    {
        $this->baseUrl = config('digilocker.base_url');
        $this->clientId = config('digilocker.client_id');
        $this->clientSecret = config('digilocker.client_secret');
        $this->redirectUri = config('digilocker.redirect_uri');
    }

    /**
     * Generate a cryptographically secure code verifier for PKCE
     * Must be 43-128 characters using [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
     */
    public function generateCodeVerifier(): string
    {
        // Generate 64 random bytes, then base64url encode for ~86 characters
        $randomBytes = random_bytes(64);
        return $this->base64UrlEncode($randomBytes);
    }

    /**
     * Generate code challenge from code verifier using SHA256
     * code_challenge = base64url_encode(sha256(code_verifier))
     */
    public function generateCodeChallenge(string $codeVerifier): string
    {
        $hash = hash('sha256', $codeVerifier, true);
        return $this->base64UrlEncode($hash);
    }

    /**
     * Base64 URL encode without padding (as per DigiLocker spec)
     */
    protected function base64UrlEncode(string $data): string
    {
        $base64 = base64_encode($data);
        $base64Url = strtr($base64, '+/', '-_');
        return rtrim($base64Url, '=');
    }

    /**
     * Build the authorization URL for OAuth flow
     * 
     * @param string $codeChallenge The PKCE code challenge
     * @param string $state Unique state for CSRF protection
     * @param string $flow 'signin' or 'signup'
     * @param array $options Additional options (acr, amr, scopes, etc.)
     */
    public function buildAuthorizationUrl(
        string $codeChallenge,
        string $state,
        string $flow = 'signin',
        array $options = []
    ): string {
        $scopes = $options['scopes'] ?? config('digilocker.scopes', ['openid', 'userdetails']);
        $acr = $options['acr'] ?? config('digilocker.acr', ['aadhaar', 'mobile', 'pan', 'email']);
        $amr = $options['amr'] ?? config('digilocker.amr', ['aadhaar', 'pan', 'exists_ac_pin']);

        $params = [
            'response_type' => 'code',
            'client_id' => $this->clientId,
            'redirect_uri' => $this->redirectUri,
            'state' => $state,
            'code_challenge' => $codeChallenge,
            'code_challenge_method' => 'S256',
            'scope' => implode(' ', $scopes),
        ];

        // Add ACR (Authentication Context Reference)
        if (!empty($acr)) {
            $params['acr'] = implode('+', $acr);
        }

        // Add flow-specific parameters
        if ($flow === 'signup') {
            $params['dl_flow'] = 'signup';
            if (!empty($amr)) {
                $params['amr'] = implode('+', $amr);
            }
        }

        // Optional: verified mobile number to skip OTP during signup
        if (!empty($options['verified_mobile'])) {
            $params['verified_mobile'] = $options['verified_mobile'];
        }

        // Optional: purpose of consent
        if (!empty($options['purpose'])) {
            $params['purpose'] = $options['purpose'];
        }

        $endpoint = config('digilocker.endpoints.authorize');
        return $this->baseUrl . $endpoint . '?' . http_build_query($params);
    }

    /**
     * Exchange authorization code for access token (OpenID Connect - v2)
     * Returns access_token, id_token, and user details
     */
    public function exchangeCodeForToken(string $code, string $codeVerifier): array
    {
        $endpoint = config('digilocker.endpoints.token');
        $url = $this->baseUrl . $endpoint;

        try {
            $response = Http::asForm()
                ->timeout(30)
                ->post($url, [
                    'code' => $code,
                    'grant_type' => 'authorization_code',
                    'client_id' => $this->clientId,
                    'client_secret' => $this->clientSecret,
                    'redirect_uri' => $this->redirectUri,
                    'code_verifier' => $codeVerifier,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                Log::info('DigiLocker token exchange successful', [
                    'has_access_token' => !empty($data['access_token']),
                    'has_id_token' => !empty($data['id_token']),
                    'scope' => $data['scope'] ?? null,
                ]);
                return [
                    'success' => true,
                    'data' => $data,
                ];
            }

            Log::error('DigiLocker token exchange failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'success' => false,
                'error' => $response->json()['error'] ?? 'token_exchange_failed',
                'error_description' => $response->json()['error_description'] ?? 'Failed to exchange code for token',
            ];
        } catch (\Exception $e) {
            Log::error('DigiLocker token exchange exception', [
                'message' => $e->getMessage(),
            ]);
            return [
                'success' => false,
                'error' => 'exception',
                'error_description' => $e->getMessage(),
            ];
        }
    }

    /**
     * Exchange authorization code for access token (v1 - returns user details directly)
     */
    public function exchangeCodeForTokenV1(string $code, string $codeVerifier): array
    {
        $endpoint = config('digilocker.endpoints.token_v1');
        $url = $this->baseUrl . $endpoint;

        try {
            $response = Http::asForm()
                ->timeout(30)
                ->post($url, [
                    'code' => $code,
                    'grant_type' => 'authorization_code',
                    'client_id' => $this->clientId,
                    'client_secret' => $this->clientSecret,
                    'redirect_uri' => $this->redirectUri,
                    'code_verifier' => $codeVerifier,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                Log::info('DigiLocker v1 token exchange successful', [
                    'digilockerid' => $data['digilockerid'] ?? null,
                    'name' => $data['name'] ?? null,
                    'new_account' => $data['new_account'] ?? null,
                ]);
                return [
                    'success' => true,
                    'data' => $data,
                ];
            }

            return [
                'success' => false,
                'error' => $response->json()['error'] ?? 'token_exchange_failed',
                'error_description' => $response->json()['error_description'] ?? 'Failed to exchange code for token',
            ];
        } catch (\Exception $e) {
            Log::error('DigiLocker v1 token exchange exception', ['message' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => 'exception',
                'error_description' => $e->getMessage(),
            ];
        }
    }

    /**
     * Refresh an expired access token
     */
    public function refreshAccessToken(string $refreshToken): array
    {
        $endpoint = config('digilocker.endpoints.refresh');
        $url = $this->baseUrl . $endpoint;

        try {
            $response = Http::asForm()
                ->withBasicAuth($this->clientId, $this->clientSecret)
                ->timeout(30)
                ->post($url, [
                    'refresh_token' => $refreshToken,
                    'grant_type' => 'refresh_token',
                ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'error' => $response->json()['error'] ?? 'refresh_failed',
                'error_description' => $response->json()['error_description'] ?? 'Failed to refresh token',
            ];
        } catch (\Exception $e) {
            Log::error('DigiLocker token refresh exception', ['message' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => 'exception',
                'error_description' => $e->getMessage(),
            ];
        }
    }

    /**
     * Revoke an access or refresh token
     */
    public function revokeToken(string $token, string $tokenType = 'access_token'): bool
    {
        $endpoint = config('digilocker.endpoints.revoke');
        $url = $this->baseUrl . $endpoint;

        try {
            $response = Http::asForm()
                ->withBasicAuth($this->clientId, $this->clientSecret)
                ->timeout(30)
                ->post($url, [
                    'token' => $token,
                    'token_type_hint' => $tokenType,
                ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('DigiLocker token revoke exception', ['message' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Get user details using access token
     */
    public function getUserDetails(string $accessToken): array
    {
        $endpoint = config('digilocker.endpoints.user');
        $url = $this->baseUrl . $endpoint;

        try {
            $response = Http::withToken($accessToken)
                ->timeout(30)
                ->get($url);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'error' => $response->json()['error'] ?? 'user_details_failed',
                'error_description' => $response->json()['error_description'] ?? 'Failed to get user details',
            ];
        } catch (\Exception $e) {
            Log::error('DigiLocker get user details exception', ['message' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => 'exception',
                'error_description' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get e-Aadhaar data in XML format
     */
    public function getEAadhaarData(string $accessToken): array
    {
        $endpoint = config('digilocker.endpoints.eaadhaar');
        $url = $this->baseUrl . $endpoint;

        try {
            $response = Http::withToken($accessToken)
                ->timeout(30)
                ->get($url);

            if ($response->successful()) {
                $xmlContent = $response->body();
                $hmac = $response->header('hmac');
                
                // Verify HMAC if needed
                if ($hmac) {
                    $calculatedHmac = base64_encode(hash_hmac('sha256', $xmlContent, $this->clientSecret, true));
                    if ($hmac !== $calculatedHmac) {
                        Log::warning('DigiLocker eAadhaar HMAC mismatch');
                    }
                }

                // Parse XML to array
                $parsedData = $this->parseEAadhaarXml($xmlContent);

                return [
                    'success' => true,
                    'data' => $parsedData,
                    'raw_xml' => $xmlContent,
                ];
            }

            return [
                'success' => false,
                'error' => $response->json()['error'] ?? 'eaadhaar_failed',
                'error_description' => $response->json()['error_description'] ?? 'Failed to get eAadhaar data',
            ];
        } catch (\Exception $e) {
            Log::error('DigiLocker get eAadhaar exception', ['message' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => 'exception',
                'error_description' => $e->getMessage(),
            ];
        }
    }

    /**
     * Parse e-Aadhaar XML data into an array
     */
    protected function parseEAadhaarXml(string $xmlContent): array
    {
        try {
            $xml = simplexml_load_string($xmlContent);
            if ($xml === false) {
                return [];
            }

            // Extract POI (Proof of Identity)
            $poi = $xml->UidData->Poi ?? null;
            $poa = $xml->UidData->Poa ?? null;
            $photo = $xml->UidData->Pht ?? null;
            $uidData = $xml->UidData ?? null;

            $data = [
                'uid' => $uidData ? (string)$uidData['uid'] : null, // Full Aadhaar Number
                'name' => $poi ? (string)$poi['name'] : null,
                'dob' => $poi ? (string)$poi['dob'] : null,
                'gender' => $poi ? (string)$poi['gender'] : null,
                'phone' => $poi ? (string)$poi['phone'] : null,
                'email' => $poi ? (string)$poi['email'] : null,
            ];

            // Address from POA
            if ($poa) {
                $data['address'] = [
                    'house' => (string)$poa['house'],
                    'street' => (string)$poa['street'],
                    'landmark' => (string)$poa['lm'],
                    'locality' => (string)$poa['loc'],
                    'vtc' => (string)$poa['vtc'],
                    'subdist' => (string)$poa['subdist'],
                    'dist' => (string)$poa['dist'],
                    'state' => (string)$poa['state'],
                    'country' => (string)$poa['country'],
                    'pincode' => (string)$poa['pc'],
                    'po' => (string)$poa['po'],
                ];
            }

            // Photo (base64)
            if ($photo) {
                $data['photo'] = (string)$photo;
            }

            return $data;
        } catch (\Exception $e) {
            Log::error('Failed to parse eAadhaar XML', ['message' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Decode JWT id_token to extract claims
     */
    public function decodeIdToken(string $idToken): array
    {
        try {
            $parts = explode('.', $idToken);
            if (count($parts) !== 3) {
                return [];
            }

            // Decode payload (middle part)
            $payload = $parts[1];
            // Add padding if needed
            $payload = str_pad($payload, strlen($payload) + (4 - strlen($payload) % 4) % 4, '=');
            $payload = strtr($payload, '-_', '+/');
            $decoded = base64_decode($payload);

            return json_decode($decoded, true) ?? [];
        } catch (\Exception $e) {
            Log::error('Failed to decode id_token', ['message' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Store PKCE code verifier in cache for later retrieval
     */
    public function storeCodeVerifier(string $state, string $codeVerifier, int $ttlMinutes = 10): void
    {
        Cache::put("digilocker_cv_{$state}", $codeVerifier, now()->addMinutes($ttlMinutes));
    }

    /**
     * Retrieve PKCE code verifier from cache
     */
    public function getCodeVerifier(string $state): ?string
    {
        return Cache::pull("digilocker_cv_{$state}");
    }

    /**
     * Store temporary context data (refer_by, email, mobile) in cache
     */
    public function storeContext(string $state, array $context, int $ttlMinutes = 10): void
    {
        Cache::put("digilocker_ctx_{$state}", $context, now()->addMinutes($ttlMinutes));
    }

    /**
     * Retrieve temporary context data from cache
     */
    public function getContext(string $state): ?array
    {
        return Cache::pull("digilocker_ctx_{$state}");
    }

    /**
     * Generate unique state for CSRF protection
     */
    public function generateState(string $prefix = 'oidc'): string
    {
        return $prefix . '_' . Str::random(32);
    }
}
