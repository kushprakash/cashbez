<?php

namespace App\Http\Traits;

trait ApiResponseTrait
{
    /**
     * Send a JSON response to the client.
     */
    protected function sendResponse($status, $message, $data = null, $httpCode = 200)
    {
        $response = [
            'status' => $status,
            'message' => $message,
        ];

        if (!is_null($data)) {
            $response['data'] = $data;
        }

        return response()->json($response, $httpCode);
    }

    /**
     * Handle errors and send error response.
     */
    protected function handleError(\Exception $e)
    {
        \Log::error('API Error: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString()
        ]);
        
        $code = $e->getCode();
        $httpCode = ($code >= 200 && $code < 600) ? $code : 500;
        
        return $this->sendResponse(0, $e->getMessage(), null, $httpCode);
    }
}
