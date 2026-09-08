<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;

class CryptoService
{
    /**
     * Generate a random 16-byte IV for encryption
     * Matches the CodeIgniter implementation format
     */
    public function generateIV(): string
    {
        return "ab" . rand(1111111111, 9999999999) . "ccdd";
    }

    /**
     * Encrypt data for API transmission using AES-256-CBC
     *
     * @param mixed $data - Data to encrypt (string or array)
     * @param string $secretKey - 32-byte secret key
     * @param string|null $encodedIV - Optional IV (will generate if not provided)
     * @return array - Contains 'encryptedData' and 'iv'
     * @throws Exception
     */
    public function encryptDataForAPI($data, string $secretKey, ?string $encodedIV = null): array
    {
        try {
            $jsonData = is_array($data) ? json_encode($data) : $data;
            $encodedIV = $encodedIV ?? $this->generateIV();

            $encryptedData = openssl_encrypt(
                $jsonData,
                'aes-256-cbc',
                $secretKey,
                0,
                $encodedIV
            );

            if ($encryptedData === false) {
                throw new Exception('Encryption failed: ' . openssl_error_string());
            }

            return [
                'encryptedData' => $encryptedData,
                'iv' => $encodedIV,
            ];
        } catch (Exception $e) {
            Log::error('CryptoService: Error encrypting data for API: ' . $e->getMessage());
            throw new Exception('Encryption failed');
        }
    }

    /**
     * Decrypt data received from API using AES-256-CBC
     *
     * @param string $encryptedData - Encrypted data string
     * @param string $secretKey - 32-byte secret key
     * @param string $iv - Initialization vector used for encryption
     * @return mixed - Decrypted data (array if JSON, string otherwise)
     * @throws Exception
     */
    public function decryptDataFromAPI(string $encryptedData, string $secretKey, string $iv)
    {
        try {
            $decryptedData = openssl_decrypt(
                $encryptedData,
                'aes-256-cbc',
                $secretKey,
                0,
                $iv
            );

            if ($decryptedData === false) {
                throw new Exception('Decryption failed: ' . openssl_error_string());
            }

            // Try to decode as JSON, return string if not valid JSON
            $decodedData = json_decode($decryptedData, true);
            return $decodedData !== null ? $decodedData : $decryptedData;
        } catch (Exception $e) {
            Log::error('CryptoService: Error decrypting data from API: ' . $e->getMessage());
            throw new Exception('Decryption failed');
        }
    }
}
