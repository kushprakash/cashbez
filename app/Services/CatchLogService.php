<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CatchLogService
{
    /**
     * Sensitive fields to sanitize from request logging
     */
    private const SENSITIVE_FIELDS = [
        'password', 'pin', 'otp', 'mpin', 'cvv', 
        'secret', 'token', 'sessionKey', 'eskey'
    ];

    /**
     * Log an exception with full context
     * 
     * @param Request $request The HTTP request
     * @param string $endpoint Name of the endpoint/method
     * @param \Throwable $e The exception to log
     * @param array $extra Additional context (api, context)
     * @return string The generated reference ID
     */
    public static function logException(
        Request $request,
        string $endpoint,
        \Throwable $e,
        array $extra = []
    ): string {
        $refId = self::generateRefId();
        
        try {
            DB::table('catch_logs')->insert([
                'ref_id'      => $refId,
                'user_id'     => auth()->id() ?? $request->header('user_id'),
                'mid'         => $request->header('mid'),
                'request'     => json_encode(self::sanitizeRequest($request)),
                'endpoint'    => $endpoint,
                'api'         => $extra['api'] ?? null,
                'message'     => $extra['context'] ?? $e->getMessage(),
                'error'       => json_encode(self::serializeException($e)),
                'ip_address'  => $request->ip(),
                'user_agent'  => $request->userAgent(),
                'created_at'  => now(),
            ]);
        } catch (\Throwable $logException) {
            // Fallback to file logging if DB fails
            Log::critical('CATCH_LOG_INSERT_FAILED', [
                'ref_id'         => $refId,
                'original_error' => $e->getMessage(),
                'log_error'      => $logException->getMessage(),
                'endpoint'       => $endpoint,
            ]);
        }
        
        return $refId;
    }

    /**
     * Generate unique reference ID for error tracking
     */
    private static function generateRefId(): string
    {
        return 'ERR_' . now()->format('YmdHis') . '_' . strtoupper(substr(uniqid(), -6));
    }

    /**
     * Properly serialize exception to array
     */
    private static function serializeException(\Throwable $e): array
    {
        return [
            'message' => $e->getMessage(),
            'code'    => $e->getCode(),
            'file'    => $e->getFile(),
            'line'    => $e->getLine(),
            'trace'   => $e->getTraceAsString(),
        ];
    }

    /**
     * Remove sensitive data from request before logging
     */
    private static function sanitizeRequest(Request $request): array
    {
        $data = $request->except(self::SENSITIVE_FIELDS);
        
        // Also mask any nested sensitive fields
        array_walk_recursive($data, function (&$value, $key) {
            if (in_array(strtolower($key), self::SENSITIVE_FIELDS)) {
                $value = '***REDACTED***';
            }
        });
        
        return $data;
    }
}
