<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FcmToken;
use App\Models\NotificationLog;
use App\Services\FcmService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PushNotificationController extends Controller
{
    protected $fcmService;

    public function __construct(FcmService $fcmService)
    {
        $this->fcmService = $fcmService;
    }

    /**
     * Register or update FCM token for the authenticated user
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function registerToken(Request $request)
    {
        $request->validate([
            'token' => 'required|string|max:500',
            'device_type' => 'nullable|in:android,ios,web',
            'device_id' => 'nullable|string|max:255',
        ]);

        $user = $request->user();

        // Upsert the token - update if exists, create if not
        $fcmToken = FcmToken::updateOrCreate(
            [
                'user_id' => $user->id,
                'token' => $request->input('token'),
            ],
            [
                'device_type' => $request->input('device_type', 'android'),
                'device_id' => $request->input('device_id'),
                'is_active' => true,
            ]
        );

        return response()->json([
            'status' => true,
            'message' => 'FCM token registered successfully',
            'data' => [
                'id' => $fcmToken->id,
                'device_type' => $fcmToken->device_type,
            ],
        ]);
    }

    /**
     * Deactivate FCM token (e.g., on logout)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deactivateToken(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $user = $request->user();

        $updated = FcmToken::where('user_id', $user->id)
            ->where('token', $request->input('token'))
            ->update(['is_active' => false]);

        return response()->json([
            'status' => $updated > 0,
            'message' => $updated > 0 ? 'Token deactivated' : 'Token not found',
        ]);
    }

    /**
     * Send a campaign notification to all users or specific users
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendCampaign(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:100',
            'body' => 'required|string|max:500',
            'type' => 'nullable|in:transaction,account,system,promotional,security,service',
            'data' => 'nullable|array',
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'integer',
        ]);

        $campaignId = 'camp_' . Str::random(12);
        $user = $request->user();

        $result = $this->fcmService->sendCampaign(
            $request->input('title'),
            $request->input('body'),
            $request->input('data', []),
            $request->input('type', 'promotional'),
            $request->input('user_ids')
        );

        // Create notification log
        $log = NotificationLog::create([
            'user_id' => null, // Campaign to multiple users
            'sent_by' => $user->id,
            'title' => $request->input('title'),
            'body' => $request->input('body'),
            'type' => $request->input('type', 'promotional'),
            'data' => $request->input('data', []),
            'status' => $result['success'] ? ($result['tokens_failed'] > 0 ? 'partial' : 'sent') : 'failed',
            'tokens_sent' => $result['tokens_sent'] ?? 0,
            'tokens_delivered' => $result['tokens_delivered'] ?? 0,
            'tokens_failed' => $result['tokens_failed'] ?? 0,
            'fcm_response' => $result,
            'campaign_id' => $campaignId,
            'sent_at' => now(),
        ]);

        return response()->json([
            'status' => $result['success'],
            'message' => $result['message'],
            'data' => array_merge($result, ['log_id' => $log->id, 'campaign_id' => $campaignId]),
        ]);
    }

    /**
     * Send notification to a specific user
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendToUser(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'title' => 'required|string|max:100',
            'body' => 'required|string|max:500',
            'type' => 'nullable|in:transaction,account,system,promotional,security,service',
            'data' => 'nullable|array',
        ]);

        $user = $request->user();

        $result = $this->fcmService->sendToUser(
            $request->input('user_id'),
            $request->input('title'),
            $request->input('body'),
            $request->input('data', []),
            $request->input('type', 'system')
        );

        // Create notification log
        $log = NotificationLog::create([
            'user_id' => $request->input('user_id'),
            'sent_by' => $user->id,
            'title' => $request->input('title'),
            'body' => $request->input('body'),
            'type' => $request->input('type', 'system'),
            'data' => $request->input('data', []),
            'status' => $result['success'] ? ($result['tokens_failed'] > 0 ? 'partial' : 'sent') : 'failed',
            'tokens_sent' => $result['tokens_sent'] ?? 0,
            'tokens_delivered' => $result['tokens_delivered'] ?? 0,
            'tokens_failed' => $result['tokens_failed'] ?? 0,
            'fcm_response' => $result,
            'sent_at' => now(),
        ]);

        return response()->json([
            'status' => $result['success'],
            'message' => $result['message'],
            'data' => array_merge($result, ['log_id' => $log->id]),
        ]);
    }

    /**
     * Send notification to a topic
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendToTopic(Request $request)
    {
        $request->validate([
            'topic' => 'required|string|max:100',
            'title' => 'required|string|max:100',
            'body' => 'required|string|max:500',
            'type' => 'nullable|in:transaction,account,system,promotional,security,service',
            'data' => 'nullable|array',
        ]);

        $result = $this->fcmService->sendToTopic(
            $request->input('topic'),
            $request->input('title'),
            $request->input('body'),
            $request->input('data', []),
            $request->input('type', 'system')
        );

        return response()->json([
            'status' => $result['success'],
            'message' => $result['message'],
            'data' => $result,
        ]);
    }

    /**
     * Get all active tokens for the authenticated user
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMyTokens(Request $request)
    {
        $user = $request->user();

        $tokens = FcmToken::where('user_id', $user->id)
            ->active()
            ->get(['id', 'device_type', 'device_id', 'created_at', 'updated_at']);

        return response()->json([
            'status' => true,
            'message' => 'Tokens retrieved successfully',
            'data' => $tokens,
        ]);
    }

    /**
     * Get notification logs with pagination and filters
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getLogs(Request $request)
    {
        $perPage = $request->input('per_page', 20);
        $query = NotificationLog::with(['user:id,name,email', 'sender:id,name'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status')) {
            $query->byStatus($request->input('status'));
        }

        // Filter by type
        if ($request->has('type')) {
            $query->byType($request->input('type'));
        }

        // Filter by campaign
        if ($request->has('campaign_id')) {
            $query->byCampaign($request->input('campaign_id'));
        }

        // Search by title or body
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('body', 'like', "%{$search}%");
            });
        }

        // Date range filter
        if ($request->has('from_date')) {
            $query->where('created_at', '>=', $request->input('from_date'));
        }
        if ($request->has('to_date')) {
            $query->where('created_at', '<=', $request->input('to_date'));
        }

        $logs = $query->paginate($perPage);

        return response()->json([
            'status' => true,
            'message' => 'Logs retrieved successfully',
            'data' => $logs->items(),
            'current_page' => $logs->currentPage(),
            'last_page' => $logs->lastPage(),
            'per_page' => $logs->perPage(),
            'total' => $logs->total(),
        ]);
    }

    /**
     * Get single notification log details
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getLog($id)
    {
        $log = NotificationLog::with(['user', 'sender:id,name'])
            ->findOrFail($id);

        return response()->json([
            'status' => true,
            'message' => 'Log retrieved successfully',
            'data' => $log,
        ]);
    }

    /**
     * Get dashboard statistics
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDashboardStats(Request $request)
    {
        $period = $request->input('period', '7days'); // 7days, 30days, 3months, 1year

        // Calculate date range
        $fromDate = match($period) {
            '7days' => now()->subDays(7),
            '30days' => now()->subDays(30),
            '3months' => now()->subMonths(3),
            '1year' => now()->subYear(),
            default => now()->subDays(7),
        };

        $query = NotificationLog::where('created_at', '>=', $fromDate);

        $stats = [
            'total_notifications' => $query->count(),
            'total_sent' => $query->where('status', 'sent')->count(),
            'total_failed' => $query->where('status', 'failed')->count(),
            'total_partial' => $query->where('status', 'partial')->count(),
            'total_tokens_sent' => $query->sum('tokens_sent'),
            'total_tokens_delivered' => $query->sum('tokens_delivered'),
            'total_tokens_failed' => $query->sum('tokens_failed'),
        ];

        // Calculate delivery rate
        $stats['delivery_rate'] = $stats['total_tokens_sent'] > 0
            ? round(($stats['total_tokens_delivered'] / $stats['total_tokens_sent']) * 100, 2)
            : 0;

        // Get recent notifications
        $stats['recent_notifications'] = NotificationLog::with(['user:id,name', 'sender:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Group by type
        $stats['by_type'] = NotificationLog::where('created_at', '>=', $fromDate)
            ->selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->get();

        // Group by status
        $stats['by_status'] = NotificationLog::where('created_at', '>=', $fromDate)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Stats retrieved successfully',
            'data' => $stats,
        ]);
    }

    /**
     * Retry failed notification
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function retryFailed($id)
    {
        $log = NotificationLog::findOrFail($id);

        if (!$log->isFailed() && !$log->isPartial()) {
            return response()->json([
                'status' => false,
                'message' => 'Only failed or partial notifications can be retried',
            ], 400);
        }

        // Retry the notification
        if ($log->user_id) {
            // Single user notification
            $result = $this->fcmService->sendToUser(
                $log->user_id,
                $log->title,
                $log->body,
                $log->data ?? [],
                $log->type
            );
        } else {
            // Campaign notification - would need user_ids from original request
            return response()->json([
                'status' => false,
                'message' => 'Campaign retry not supported yet',
            ], 400);
        }

        // Update log with retry info
        $log->update([
            'status' => $result['success'] ? ($result['tokens_failed'] > 0 ? 'partial' : 'sent') : 'failed',
            'tokens_sent' => $result['tokens_sent'] ?? 0,
            'tokens_delivered' => $result['tokens_delivered'] ?? 0,
            'tokens_failed' => $result['tokens_failed'] ?? 0,
            'fcm_response' => $result,
            'sent_at' => now(),
        ]);

        return response()->json([
            'status' => $result['success'],
            'message' => $result['message'],
            'data' => $log->fresh(),
        ]);
    }

    /**
     * Delete notification log
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteLog($id)
    {
        $log = NotificationLog::findOrFail($id);
        $log->delete();

        return response()->json([
            'status' => true,
            'message' => 'Notification log deleted successfully',
        ]);
    }

    /**
     * Get users with active FCM tokens
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFcmUsers(Request $request)
    {
        $search = $request->input('search', '');
        
        $query = \App\Models\User::whereHas('fcmTokens', function ($q) {
            $q->where('is_active', true);
        })->with(['fcmTokens' => function ($q) {
            $q->where('is_active', true);
        }]);

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('mobile', 'like', "%{$search}%");
            });
        }

        $users = $query->select('id', 'name', 'email', 'mobile')
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'mobile' => $user->mobile,
                    'token_count' => $user->fcmTokens->count(),
                ];
            });

        return response()->json([
            'status' => true,
            'message' => 'FCM users retrieved successfully',
            'data' => $users,
        ]);
    }
}
