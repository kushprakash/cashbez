<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatThread;
use App\Models\ChatMessage;
use App\Models\ChatThreadParticipant;
use App\Models\ChatMessageReceipt;
use App\Models\ChatAttachment;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\UserKyc;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use App\Http\Traits\ApiResponseTrait;
use App\Http\Traits\FileUploadTrait;

class ChatController extends Controller
{
    use ApiResponseTrait, FileUploadTrait;
    
    const PAGE_SIZE = 30;

    /**
     * Get all threads for authenticated user
     * GET /api/chat/threads
     */
    public function threads(Request $request)
    {
        $user = Auth::user();

        $userId = $user->id;

        // Get all threads the user belongs to
        $threads = ChatThread::with(['lastMessage', 'participants.user'])
            ->whereHas('participants', function ($query) use ($userId) {
                $query->where('user_id', $userId)->whereNull('left_at');
            })
            ->whereNull('deleted_at')
            ->orderBy('updated_at', 'DESC')
            ->get();

        $result = [];
        foreach ($threads as $thread) {
            $threadData = [
                'thread_id' => $thread->thread_id,
                'name' => $thread->title,
                'avatarUrl' => $thread->avatar_url,
                'lastMessageTime' => $thread->updated_at ? $thread->updated_at->toIso8601String() : null,
                'lastMessage' => null,
                'unreadCount' => 0,
                'isOnline' => false,
                'isPinned' => false,
                'isPremium' => false,
                'other_user_id' => null,
            ];

            // Last message preview
            if ($thread->lastMessage) {
                $threadData['lastMessage'] = $thread->lastMessage->message_type === 'text' 
                    ? $thread->lastMessage->content 
                    : '[' . ucfirst($thread->lastMessage->message_type) . ']';
                $threadData['lastMessageTime'] = $thread->lastMessage->created_at->toIso8601String();
            }

            // Unread count
            $threadData['unreadCount'] = ChatMessage::where('thread_id', $thread->thread_id)
                ->where('sender_id', '!=', $userId)
                ->whereDoesntHave('receipts', function ($q) use ($userId) {
                    $q->where('user_id', $userId)->where('status', 'read');
                })
                ->count();

            // For direct chats, get the other participant's info
            if ($thread->thread_type === 'direct') {
                $otherParticipant = $thread->participants->where('user_id', '!=', $userId)->first();
                if ($otherParticipant && $otherParticipant->user) {
                    $threadData['name'] = $otherParticipant->user->name ?? 'Unknown User';
                    $threadData['avatarUrl'] = $otherParticipant->user->kyc->photo ?? null;
                    $threadData['other_user_id'] = (string) $otherParticipant->user->id;
                    // Check if user is online (you can add your own logic here)
                    $threadData['isOnline'] = false; // Implement your online status logic
                    // Check if user is premium (add your own logic)
                    $threadData['isPremium'] = $otherParticipant->user->is_premium ?? false;
                }
            }

            $result[] = $threadData;
        }

        return response()->json([
            'status' => 1,
            'message' => 'Threads fetched successfully',
            'data' => $result
        ]);
    }

    /**
     * Get messages for a thread
     * GET /api/chat/threads/{id}/messages
     * Query params:
     * - page: Page number for pagination
     * - after: Get messages created after this message_id (for real-time updates)
     */
    public function messages(Request $request, $id)
    {
        $user = Auth::user();

        $userId = $user->id;
        $page = $request->get('page', 1);
        $beforeMessageId = $request->get('before'); // For fetching old messages
        $afterMessageId = $request->get('after'); // For fetching new messages

        // Verify user has access to this thread
        $participant = ChatThreadParticipant::where('thread_id', $id)
            ->where('user_id', $userId)
            ->whereNull('left_at')
            ->first();

        if (!$participant) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied'
            ], 403);
        }

        // Build query for messages
        $query = ChatMessage::with(['sender', 'attachments', 'replyTo.sender'])
            ->where('thread_id', $id)
            ->whereNull('deleted_at');

        // If 'after' parameter provided, fetch only newer messages
        if ($beforeMessageId) {
            $query->where('message_id', '<', $beforeMessageId)
                ->orderBy('created_at', 'DESC');

            $messages = $query->get();
        } else if ($afterMessageId) {
            $query->where('message_id', '>', $afterMessageId)
                ->orderBy('created_at', 'ASC');
            
            $messages = $query->get();
        } else {
            // Regular pagination
            $query->orderBy('created_at', 'ASC')
                ->skip(($page - 1) * self::PAGE_SIZE)
                ->take(self::PAGE_SIZE);
            
            $messages = $query->get();
        }

        // Get receipts for messages
        $messageIds = $messages->pluck('message_id')->toArray();
        $receipts = ChatMessageReceipt::whereIn('message_id', $messageIds)
            ->get()
            ->groupBy('message_id');

        $result = $messages->map(function ($msg) use ($receipts, $userId) {
            $msgData = [
                'message_id' => $msg->message_id,
                'thread_id' => $msg->thread_id,
                'sender_id' => $msg->sender_id,
                'sender_name' => $msg->sender->name ?? 'Unknown',
                'message_type' => $msg->message_type,
                'content' => $msg->content,
                'metadata' => $msg->metadata,
                'status' => $msg->status,
                'created_at' => $msg->created_at,
                'is_own' => $msg->sender_id == $userId,
                'attachments' => $msg->attachments,
            ];

            if ($msg->replyTo) {
                $msgData['reply_to'] = [
                    'message_id' => $msg->replyTo->message_id,
                    'sender_name' => $msg->replyTo->sender->name ?? 'Unknown',
                    'content' => $msg->replyTo->content
                ];
            }

            // Add receipt info
            if (isset($receipts[$msg->message_id])) {
                $msgData['receipts'] = $receipts[$msg->message_id]->map(function ($receipt) {
                    return [
                        'user_id' => $receipt->user_id,
                        'status' => $receipt->status,
                        'read_at' => $receipt->read_at
                    ];
                });
            }

            return $msgData;
        });

        return response()->json([
            'status' => 1,
            'message' => 'Messages fetched successfully',
            'data' => [
                'messages' => $result,
                'page' => $page,
                'has_more' => !$afterMessageId && $messages->count() === self::PAGE_SIZE,
                'new_messages_count' => $afterMessageId ? $messages->count() : null
            ]
        ]);
    }

    /**
     * Send a message
     * POST /api/chat/messages
     */
    public function sendMessage(Request $request)
    {
        $user = Auth::user();
        
        $validator = Validator::make($request->all(), [
            'thread_id' => 'nullable|string',
            'recipient_id' => 'nullable|string',
            'content' => 'required|string',
            'message_type' => 'nullable|in:text,image,video,audio,file,location,contact',
            'reply_to_message_id' => 'nullable|integer',
            'localmsgid' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();
            $executionLogs = [];
            $executionLogs[] = "Started processing sendMessage request.";

            $threadId = $request->thread_id;
            $userId = $user->id;

            // If no thread_id but recipient_id provided, find or create direct thread
            if (!$threadId && $request->recipient_id) {
                $threadId = $this->getOrCreateDirectThread($userId, $request->recipient_id);
                $executionLogs[] = "Created/Found direct thread from recipient_id.";
            }

            if (!$threadId) {
                return response()->json([
                    'status' => 0,
                    'message' => 'thread_id or recipient_id required'
                ], 400);
            }
            $executionLogs[] = "Thread resolved. Thread ID: " . $threadId;

            // Verify user has access to thread
            $participant = ChatThreadParticipant::where('thread_id', $threadId)
                ->where('user_id', $userId)
                ->whereNull('left_at')
                ->first();

            if (!$participant) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Access denied'
                ], 403);
            }

            // Check thread to route message appropriately
            $thread = ChatThread::where('thread_id', $threadId)->first();
            
            // Only route support threads through AI logic
            $isSupportThread = $thread && $thread->thread_type === 'support';
            $executionLogs[] = "Thread Type: " . ($thread ? $thread->thread_type : 'unknown') . ". isSupportThread: " . ($isSupportThread ? 'true' : 'false') . ". Thread Status: " . ($thread ? $thread->status : 'unknown');
            
            $admin = $request->get('admin');
            $message = ChatMessage::create([
                'thread_id' => $threadId,
                'sender_id' => $userId,
                'admin_id' => $admin ? $admin->id : null,
                'reply_to_message_id' => $request->reply_to_message_id,
                'message_type' => $request->message_type ?? 'text',
                'content' => $request->content,
                'metadata' => json_encode(['localmsgid' => $request->localmsgid]),
                'status' => 'sent',
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $executionLogs[] = "User message created. Message ID: " . $message->message_id;

            // Update thread's last message
            ChatThread::where('thread_id', $threadId)->update([
                'last_message_id' => $message->message_id,
                'updated_at' => now()
            ]);

            // Create receipts for all other participants (humans)
            $otherParticipants = ChatThreadParticipant::where('thread_id', $threadId)
                ->where('user_id', '!=', $userId)
                ->whereNull('left_at')
                ->pluck('user_id');

            foreach ($otherParticipants as $participantId) {
                // If the other participant is the bot (recipientId=1), skip creating receipts unless they are meant to be a real user
                if ($isSupportThread && $participantId == 1 && $thread->status === 'bot') {
                    continue; 
                }
                ChatMessageReceipt::create([
                    'message_id' => $message->message_id,
                    'user_id' => $participantId,
                    'status' => 'delivered',
                    'delivered_at' => now()
                ]);
            }

            // AI Routing Logic
            $botResponseData = null;
            if ($isSupportThread && $thread->status === 'bot') {
                $executionLogs[] = "Entered Bot Logic block. Preparing to fetch context.";
                // Fetch context (last 5 messages)
                $history = ChatMessage::where('thread_id', $threadId)
                    ->orderBy('created_at', 'desc')
                    ->take(5)
                    ->get()
                    ->map(function ($msg) use ($userId) {
                        return [
                            'role' => ($msg->sender_id == $userId) ? 'user' : 'bot',
                            'content' => $msg->content
                        ];
                    })
                    ->reverse()
                    ->values()
                    ->toArray();

                try {
                    $executionLogs[] = "Sending request to AI at ai.enexa.in/chat...";
                    $aiResponse = Http::timeout(5)->withHeaders([
                        'X-API-Key' => 'Rest@ha@t1952'
                    ])->post('https://ai.enexa.in/chat', [
                        'message' => $request->content,
                        'history' => $history
                    ]);

                    if ($aiResponse->successful()) {
                        $executionLogs[] = "Received successful response from AI API.";
                        $aiData = $aiResponse->json();
                        
                        $actionCode = $aiData['action_code'] ?? null;
                        $confidence = floatval($aiData['confidence'] ?? 0);
                        $executionLogs[] = "AI Action Code: " . $actionCode . ", Confidence: " . $confidence;
                        
                        // Check if Escalation is required
                        if ($actionCode === 'ESCALATION_REQUIRED' || $confidence < 0.45) {
                            $executionLogs[] = "Bot determined escalation is required based on action code or low confidence. Escalating to human.";
                            $ticketId = 'FIN-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));
                            
                            $thread->status = 'human';
                            $thread->assigned_to = 1; // Support user ID
                            $thread->escalated_at = now();
                            $thread->ticket_id = $ticketId;
                            $thread->save();
                            
                            $botResponseData = [
                                'content' => ["Sir, main ye issue theek se samajh nahi pa rahi hu. Main aapki case apne senior executive ko forward kar rahi hu. Aapka ticket ID hai: " . $ticketId],
                                'action_code' => 'ESCALATION_REQUIRED'
                            ];
                        } else {
                            // Valid response
                            $executionLogs[] = "Bot generated a valid response.";
                            $botResponseData = [
                                'content' => $aiData['response'] ?? ["Main samajh nhi pai."],
                                'action_code' => $actionCode
                            ];
                        }
                    } else {
                        // AI Endpoint failed (500 etc)
                        $executionLogs[] = "AI Endpoint failed with status " . $aiResponse->status() . ". Escalating to human.";
                        $ticketId = 'FIN-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));
                        $thread->status = 'human';
                        $thread->assigned_to = 1; // Support user ID
                        $thread->escalated_at = now();
                        $thread->ticket_id = $ticketId;
                        $thread->save();

                        $botResponseData = [
                            'content' => ["Our assistant is currently unavailable. Your case has been automatically escalated. Ticket ID: " . $ticketId],
                            'action_code' => 'SYSTEM_ERROR'
                        ];
                    }
                } catch (\Exception $e) {
                    $executionLogs[] = "Exception while contacting AI: " . $e->getMessage() . ". Escalating to human.";
                    // Timeout or connection error
                    $ticketId = 'FIN-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));
                    $thread->status = 'human';
                    $thread->assigned_to = 1; // Support user ID
                    $thread->escalated_at = now();
                    $thread->ticket_id = $ticketId;
                    $thread->save();

                    $botResponseData = [
                        'content' => ["Connecting you to senior agent. Ticket ID: " . $ticketId],
                        'action_code' => 'SYSTEM_ERROR'
                    ];
                }

                // Save bot response
                if ($botResponseData) {
                    $executionLogs[] = "Building and saving bot response messages. Action Code: " . $botResponseData['action_code'];
                    
                    $aiResponseContent = $botResponseData['content'];
                    if (is_string($aiResponseContent)) {
                        $aiResponseContent = [$aiResponseContent];
                    }
                    
                    foreach ($aiResponseContent as $index => $msgText) {
                        if (empty(trim($msgText))) continue;
                        
                        // Human-like delay logic (e.g. 20ms per character, 500ms min, 2000ms max)
                        if ($index > 0) {
                            $delayMs = min(2000, max(500, strlen($msgText) * 20));
                            usleep($delayMs * 1000); // argument is in microseconds
                        }
                        
                        $botMessage = ChatMessage::create([
                            'thread_id' => $threadId,
                            'sender_id' => '1', // The Bot / Support User
                            'message_type' => 'text',
                            'content' => $msgText,
                            'metadata' => json_encode(['action_code' => $botResponseData['action_code']]),
                            'status' => 'sent',
                            'created_at' => now(),
                            'updated_at' => now()
                        ]);

                        ChatThread::where('thread_id', $threadId)->update([
                            'last_message_id' => $botMessage->message_id,
                            'updated_at' => now()
                        ]);
                    }
                } else {
                    $executionLogs[] = "Bot response data was not set.";
                }
            } else {
                $executionLogs[] = "Skipped Bot Logic block. Either not a support thread or thread status is not 'bot'.";
            }

            DB::commit();
            $executionLogs[] = "Message processing completed successfully. DB committed.";

            return response()->json([
                'status' => 1,
                'message' => 'Message sent successfully',
                'data' => [
                    'message_id' => $message->message_id,
                    'thread_id' => $threadId,
                    'timestamp' => $message->created_at,
                    'status' => 'sent',
                    'bot_responded' => $botResponseData !== null,
                    'execution_logs' => $executionLogs
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Error sending message: ' . $e->getMessage(),
                'data' => [
                    'execution_logs' => $executionLogs ?? ["Failed before logs could be properly initialized."]
                ]
            ], 500);
        }
    }

    /**
     * Mark messages as read
     * POST /api/chat/messages/{id}/read
     */
    public function markRead($id)
    {
        $user = Auth::user();

        try {
            $message = ChatMessage::where('message_id', $id)->first();

            if (!$message) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Message not found'
                ], 404);
            }

            // Check if receipt exists
            $receipt = ChatMessageReceipt::where('message_id', $id)
                ->where('user_id', $user->id)
                ->first();

            if ($receipt) {
                // Update existing receipt using DB query builder
                DB::table('chat_message_receipts')
                    ->where('message_id', $id)
                    ->where('user_id', $user->id)
                    ->update([
                        'status' => 'read',
                        'read_at' => now(),
                        'delivered_at' => $receipt->delivered_at ?? now()
                    ]);
            } else {
                // Create new receipt
                ChatMessageReceipt::create([
                    'message_id' => $id,
                    'user_id' => $user->id,
                    'status' => 'read',
                    'read_at' => now(),
                    'delivered_at' => now()
                ]);
            }

            // Update message status to 'read'
            $message->status = 'read';
            $message->save();

            return response()->json([
                'status' => 1,
                'message' => 'Message marked as read'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error marking message as read: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new thread
     * POST /api/chat/threads
     */
    public function createThread(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'recipient_id' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 200);
        }

        try {
            $userId = $user->id;
            $recipientId = $request->recipient_id;

            // Prevent creating chat with yourself
            if ($recipientId == $userId) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Cannot start a chat with yourself'
                ], 200);
            }

            // Check if recipient exists
            $recipient = User::find($recipientId);
            if (!$recipient) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Recipient not found'
                ], 200);
            }

            // Get or create direct thread
            $threadId = $this->getOrCreateDirectThread($userId, $recipientId);

            return response()->json([
                'status' => 1,
                'message' => 'Thread ready',
                'data' => [
                    'thread_id' => $threadId
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error creating thread: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a support thread
     * POST /api/chat/support-threads
     */
    public function createSupportThread()
    {
        $user = Auth::user();

        try {
            DB::beginTransaction();

            $userId = $user->id;
            $recipientId = 1; // Manual support user ID
            
             // Prevent creating chat with yourself
            if ($recipientId == $userId) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Cannot start a chat with yourself'
                ], 200);
            }

            // Check if recipient exists
            $recipient = User::find($recipientId);
            if (!$recipient) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Recipient not found'
                ], 200);
            }

            // Get or create direct thread
            $threadId = $this->getOrCreateDirectThread($userId, $recipientId);

             // Fetch KYC data safely
            $recipientKyc = UserKyc::where('user_id', $recipientId)
            ->select('photo')
            ->first();

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Support chat thread is ready.',
                'data' => [
                    'thread_id' => $threadId,
                    'recipient_id' => $recipientId,
                    'name' => $recipient->name,
                    'image' => $recipientKyc->photo ?? null
                ]
            ]);

        } catch (\Illuminate\Database\QueryException $qe) {
            DB::rollBack();
            \Log::error('DB Error creating support thread', [
                'error' => $qe->getMessage(),
                'user_id' => $user->id ?? null
            ]);

            return response()->json([
                'status' => 0,
                'message' => 'A database error occurred while creating the support thread.'
            ], 500);

        } catch (\Throwable $e) {
            DB::rollBack();
            \Log::error('Error creating support thread', [
                'error' => $e->getMessage(),
                'user_id' => $user->id ?? null
            ]);

            return response()->json([
                'status' => 0,
                'message' => 'An unexpected error occurred while creating the support thread.'
            ], 500);
        }

    }

    /**
     * Upload media/file with advanced processing
     * POST /api/chat/upload
     */
    public function uploadMedia(Request $request)
    {
        try {
            $user = Auth::user();

            $validator = Validator::make($request->all(), [
                'file' => 'required|file|max:51200', // 50MB max
                'message_id' => 'nullable|integer',
                'message_type' => 'nullable|string|in:image,video,audio,voice,document,file',
                'localmsgid' => 'nullable|string',
                'filename' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            if (!$request->hasFile('file') || !$request->file('file')->isValid()) {
                throw new \Exception('No valid file uploaded', 400);
            }

            $message_type = $request->input('message_type', 'file');
            $message_id = $request->input('message_id');
            $localmsgid = $request->input('localmsgid');

            // Define type mapping for different media types
            $type_map = [
                'image'    => ['ext' => ['gif', 'jpg', 'jpeg', 'png', 'webp', 'heif', 'heic'], 'dir' => 'images/'],
                'video'    => ['ext' => ['mp4', 'avi', 'mov', 'mkv', 'webm', '3gp', 'flv', 'wmv', 'm4v'], 'dir' => 'videos/'],
                'audio'    => ['ext' => ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'wma', 'opus'], 'dir' => 'audio/'],
                'voice'    => ['ext' => ['aac', 'm4a', 'mp3', 'wav', 'ogg', 'opus', '3gp'], 'dir' => 'audio/'],
                'document' => ['ext' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv', 'ppt', 'pptx', 'rtf'], 'dir' => 'docs/'],
                'file'     => ['ext' => ['gif', 'jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx', 'mp4', 'mp3', 'aac', 'txt'], 'dir' => 'misc/']
            ];

            if (!isset($type_map[$message_type])) {
                $message_type = 'file';
            }

            // Additional options for uploadFileAdvanced
            $options = [
                'validateMime' => true
            ];

            // Add resize options for images
            if ($message_type === 'image') {
                $options['resize'] = [
                    'keepAspectRatio' => true,
                    'width' => 1200,
                    'height' => 1200
                ];
            }

            // Generate a unique filename if provided
            if ($request->input('filename')) {
                $options['rename'] = $request->input('filename');
            }

            // Use the uploadFileAdvanced method from FileUploadTrait
            $blob = $this->uploadFileAdvanced(
                $request->file('file'),
                $message_type,
                $type_map,
                $options
            );

            // If localmsgid was provided, store it in the blob for tracking
            if ($localmsgid) {
                $blob['localmsgid'] = $localmsgid;
            }

            // If message_id is provided, update the existing message with the new media URL and details
            if ($message_id) {
                DB::beginTransaction();

                try {
                    // First check if the message exists and belongs to the current user
                    $message = ChatMessage::where('message_id', $message_id)
                        ->where('sender_id', $user->id)
                        ->first();

                    if ($message) {
                        // Parse existing metadata
                        $existingMeta = json_decode($message->metadata ?? '{}', true);

                        // Update the message content with the URL
                        $message->update([
                            'content' => $blob['url'],
                            'status' => 'sent',
                            'metadata' => json_encode(array_merge($existingMeta, $blob))
                        ]);

                        // Create or update attachment record
                        ChatAttachment::updateOrCreate(
                            ['message_id' => $message_id],
                            [
                                'file_url' => $blob['url'],
                                'file_name' => $blob['originalName'],
                                'mime_type' => $blob['mime'],
                                'file_size' => $blob['size'],
                                'width' => $blob['width'],
                                'height' => $blob['height'],
                                'duration_sec' => $blob['duration'],
                                'thumbnail_url' => $this->getValidThumbnailUrl($blob),
                                'uploaded_at' => now()
                            ]
                        );

                        DB::commit();

                        // Return the updated message along with the attachment blob
                        $updatedMessage = ChatMessage::with(['sender', 'attachments'])
                            ->where('message_id', $message_id)
                            ->first();

                        return response()->json([
                            'status' => 1,
                            'message' => 'File uploaded and message updated.',
                            'data' => [
                                'attachment' => $blob,
                                'message' => $updatedMessage,
                                'message_id' => $message_id,
                                'thread_id' => $message->thread_id
                            ]
                        ]);
                    } else {
                        DB::rollBack();
                        return response()->json([
                            'status' => 0,
                            'message' => 'Message not found or access denied'
                        ], 404);
                    }
                } catch (\Exception $e) {
                    DB::rollBack();
                    throw $e;
                }
            }

            // Just return the attachment blob if no message_id provided
            return response()->json([
                'status' => 1,
                'message' => 'File uploaded successfully.',
                'data' => ['attachment' => $blob]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error uploading file: ' . $e->getMessage()
            ], 500);
        }
    }

    // ==================== PRIVATE HELPER METHODS ====================

    /**
     * Get or create direct thread between two users
     * Returns existing thread_id or creates one atomically
     */
    private function getOrCreateDirectThread($userIdA, $userIdB)
    {
        // Look for an existing direct thread with exactly these two participants
        $existingThreadId = DB::table('chat_threads as ct')
            ->select('ct.thread_id')
            ->where('ct.thread_type', 'direct')
            ->whereNull('ct.deleted_at')
            ->whereExists(function ($query) use ($userIdA, $userIdB) {
                $query->select(DB::raw(1))
                    ->from('chat_thread_participants as ctp')
                    ->whereRaw('ctp.thread_id = ct.thread_id')
                    ->whereIn('ctp.user_id', [$userIdA, $userIdB])
                    ->whereNull('ctp.left_at')
                    ->groupBy('ctp.thread_id')
                    ->havingRaw('COUNT(DISTINCT ctp.user_id) = 2');
            })
            ->value('thread_id');

        if ($existingThreadId) {
            return $existingThreadId;
        }

        // Create new thread with participants atomically
        DB::beginTransaction();
        try {
            $threadType = 'direct';
            if ($userIdA == 1 || $userIdB == 1) {
                $threadType = 'support';
            }

            // Create thread
            $threadId = DB::table('chat_threads')->insertGetId([
                'thread_type' => $threadType,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Add both participants
            DB::table('chat_thread_participants')->insert([
                [
                    'thread_id' => $threadId,
                    'user_id' => $userIdA,
                    'role' => 'member',
                    'joined_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'thread_id' => $threadId,
                    'user_id' => $userIdB,
                    'role' => 'member',
                    'joined_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            ]);

            DB::commit();
            return $threadId;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    // ==================== NEW ENDPOINTS FROM CODEIGNITER ====================

    /**
     * Create a group chat
     * POST /api/chat/groups
     */
    public function createGroupChat(Request $request)
    {
        try {
            $user = Auth::user();
            
            $validator = Validator::make($request->all(), [
                'group_name' => 'required|string',
                'member_ids' => 'required|array|min:2'
            ]);

            if ($validator->fails()) {
                return $this->sendResponse(0, 'Validation error', $validator->errors(), 422);
            }

            $title = trim($request->group_name);
            $members = array_unique($request->member_ids);

            if (count($members) < 2) {
                throw new \Exception('Select at least two members', 400);
            }

            // Ensure the creator is also a participant
            if (!in_array($user->id, $members, true)) {
                $members[] = $user->id;
            }

            DB::beginTransaction();

            // Create thread
            $threadId = DB::table('chat_threads')->insertGetId([
                'thread_type' => 'group',
                'title' => $title,
                'owner_id' => $user->id,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Add participants
            $batch = [];
            foreach ($members as $uid) {
                $batch[] = [
                    'thread_id' => $threadId,
                    'user_id' => $uid,
                    'role' => ($uid === $user->id ? 'owner' : 'member'),
                    'joined_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now()
                ];
            }
            DB::table('chat_thread_participants')->insert($batch);

            DB::commit();

            return $this->sendResponse(1, 'Group created.', ['thread_id' => $threadId]);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->handleError($e);
        }
    }

    /**
     * Upload media file with advanced processing
     * POST /api/chat/upload-media
     */
    public function uploadMediaAdvanced(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$request->hasFile('file') || !$request->file('file')->isValid()) {
                throw new \Exception('No valid file uploaded', 400);
            }

            $message_type = $request->input('message_type', 'file');
            $message_id = $request->input('message_id');
            $localmsgid = $request->input('localmsgid');

            // Define type mapping
            $type_map = [
                'image' => ['ext' => ['gif', 'jpg', 'jpeg', 'png', 'webp', 'heif', 'heic'], 'dir' => 'images/'],
                'video' => ['ext' => ['mp4', 'avi', 'mov', 'mkv', 'webm', '3gp', 'flv', 'wmv', 'm4v'], 'dir' => 'videos/'],
                'audio' => ['ext' => ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'wma', 'opus'], 'dir' => 'audio/'],
                'voice' => ['ext' => ['aac', 'm4a', 'mp3', 'wav', 'ogg', 'opus', '3gp'], 'dir' => 'audio/'],
                'document' => ['ext' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv', 'ppt', 'pptx', 'rtf'], 'dir' => 'docs/'],
                'file' => ['ext' => ['gif', 'jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx', 'mp4', 'mp3', 'aac', 'txt'], 'dir' => 'misc/']
            ];

            if (!isset($type_map[$message_type])) {
                $message_type = 'file';
            }

            // Upload options
            $options = ['validateMime' => true];

            // Resize images
            if ($message_type === 'image') {
                $options['resize'] = [
                    'keepAspectRatio' => true,
                    'width' => 1200,
                    'height' => 1200
                ];
            }

            if ($request->input('filename')) {
                $options['rename'] = $request->input('filename');
            }

            // Upload file
            $blob = $this->uploadFileAdvanced($request->file('file'), $message_type, $type_map, $options);

            if ($localmsgid) {
                $blob['localmsgid'] = $localmsgid;
            }

            // If message_id provided, update existing message
            if ($message_id) {
                DB::beginTransaction();

                $message = ChatMessage::where('message_id', $message_id)
                    ->where('sender_id', $user->id)
                    ->first();

                if ($message) {
                    $existingMeta = $message->metadata ?? [];

                    $message->update([
                        'content' => $blob['url'],
                        'status' => 'sent',
                        'metadata' => array_merge($existingMeta, $blob)
                    ]);

                    // Update or create attachment
                    ChatAttachment::updateOrCreate(
                        ['message_id' => $message_id],
                        [
                            'file_url' => $blob['url'],
                            'mime_type' => $blob['mime'],
                            'file_size' => $blob['size'],
                            'width' => $blob['width'],
                            'height' => $blob['height'],
                            'duration_sec' => $blob['duration'],
                            'thumbnail_url' => $this->getValidThumbnailUrl($blob)
                        ]
                    );

                    DB::commit();

                    $updated_message = ChatMessage::find($message_id);

                    return $this->sendResponse(1, 'File uploaded and message updated.', [
                        'attachment' => $blob,
                        'message' => $updated_message,
                        'message_id' => $message_id,
                        'thread_id' => $message->thread_id
                    ]);
                }
            }

            return $this->sendResponse(1, 'File uploaded.', ['attachment' => $blob]);

        } catch (\Exception $e) {
            return $this->handleError($e);
        }
    }

    /**
     * Send attachment with message
     * POST /api/chat/send-attachment
     */
    public function sendAttachment(Request $request)
    {
        DB::beginTransaction();
        try {
            $user = Auth::user();
            
            $validator = Validator::make($request->all(), [
                'recipient_id' => 'required|string',
                'attachment' => 'required|array',
                'message_type' => 'required|string'
            ]);

            if ($validator->fails()) {
                return $this->sendResponse(0, 'Validation error', $validator->errors(), 422);
            }

            $recipientId = $request->recipient_id;
            $message_type = $request->message_type;
            $att = $request->attachment;
            $localmsgid = $att['localmsgid'] ?? null;
            $status = $request->input('status', 'sent');

            if ($recipientId === $user->id) {
                throw new \Exception('Cannot message yourself', 400);
            }

            // Check for duplicate
            if ($localmsgid) {
                $existingMsg = ChatMessage::whereRaw("JSON_EXTRACT(metadata, '$.localmsgid') = ?", [$localmsgid])
                    ->first();

                if ($existingMsg) {
                    return $this->sendResponse(1, 'Message already exists.', [
                        'thread_id' => $existingMsg->thread_id,
                        'message_id' => $existingMsg->message_id,
                        'message' => $existingMsg
                    ]);
                }
            }

            // Get or create thread
            $threadId = $request->input('thread_id') 
                ? $request->input('thread_id') 
                : $this->getOrCreateDirectThread($user->id, $recipientId);

            if ($request->has('thread_id')) {
                $this->validateThreadAccess($threadId, $user->id);
            }

            $thumbnailUrl = $this->getValidThumbnailUrl($att);
            $metadata = $att;

            // Create message
            $message = ChatMessage::create([
                'thread_id' => $threadId,
                'sender_id' => $user->id,
                'message_type' => $message_type,
                'content' => $att['url'],
                'metadata' => $metadata,
                'status' => $status,
                'created_at' => now()
            ]);

            // Create attachment
            ChatAttachment::create([
                'message_id' => $message->message_id,
                'file_url' => $att['url'],
                'mime_type' => $att['mime'] ?? '',
                'file_size' => $att['size'] ?? 0,
                'width' => $att['width'] ?? null,
                'height' => $att['height'] ?? null,
                'duration_sec' => $att['duration'] ?? null,
                'thumbnail_url' => $thumbnailUrl
            ]);

            // Update thread
            ChatThread::where('thread_id', $threadId)->update([
                'last_message_id' => $message->message_id,
                'updated_at' => now()
            ]);

            DB::commit();

            $chat_message = ChatMessage::find($message->message_id);

            return $this->sendResponse(1, 'Attachment sent.', [
                'thread_id' => $threadId,
                'message_id' => $message->message_id,
                'message' => $chat_message
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->handleError($e);
        }
    }

    /**
     * Upload a chunk of a large file
     * POST /api/chat/upload-chunk
     */
    public function uploadChunk(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$request->hasFile('chunk') || !$request->file('chunk')->isValid()) {
                throw new \Exception('No valid file chunk uploaded', 400);
            }

            $validator = Validator::make($request->all(), [
                'fileName' => 'required|string',
                'chunkIndex' => 'required|integer|min:0',
                'totalChunks' => 'required|integer|min:1',
                'localmsgid' => 'required|string'
            ]);

            if ($validator->fails()) {
                return $this->sendResponse(0, 'Validation error', $validator->errors(), 422);
            }

            $fileName = $request->input('fileName');
            $chunkIndex = (int)$request->input('chunkIndex');
            $totalChunks = (int)$request->input('totalChunks');
            $localmsgid = $request->input('localmsgid');

            // Create unique upload ID
            $uploadId = md5($localmsgid . $fileName);

            // Get chunk data
            $chunkData = file_get_contents($request->file('chunk')->getRealPath());

            // Use helper to manage chunk
            $result = $this->_manageChunk(
                $chunkData,
                $uploadId,
                $chunkIndex,
                $totalChunks,
                $fileName
            );

            return $this->sendResponse(1, 'Chunk received successfully', $result);

        } catch (\Exception $e) {
            return $this->handleError($e);
        }
    }

    /**
     * Finalize chunked upload
     * POST /api/chat/finalize-upload
     */
    public function finalizeUpload(Request $request)
    {
        try {
            $user = Auth::user();
            
            $validator = Validator::make($request->all(), [
                'fileName' => 'required|string',
                'localmsgid' => 'required|string'
            ]);

            if ($validator->fails()) {
                return $this->sendResponse(0, 'Validation error', $validator->errors(), 422);
            }

            $fileName = $request->input('fileName');
            $localmsgid = $request->input('localmsgid');

            $uploadId = md5($localmsgid . $fileName);

            // Check chunk status
            $status = $this->_checkChunkStatus($uploadId);

            if (!$status['exists']) {
                throw new \Exception('Upload not found or expired', 400);
            }

            if (!$status['isComplete']) {
                throw new \Exception("Incomplete upload: {$status['receivedChunks']}/{$status['totalChunks']} chunks received", 400);
            }

            // Determine file type
            $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            $message_type = $this->_determineMessageType($ext);

            // Define type mapping
            $type_map = [
                'image' => ['dir' => 'images/'],
                'video' => ['dir' => 'videos/'],
                'audio' => ['dir' => 'audio/'],
                'voice' => ['dir' => 'audio/'],
                'document' => ['dir' => 'docs/'],
                'file' => ['dir' => 'misc/']
            ];

            // Build final file path
            $finalFileName = uniqid('upload_') . ".{$ext}";
            $dirName = trim($type_map[$message_type]['dir'], '/\\');
            $uploadDir = storage_path('app/public/chat/' . $dirName);

            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0775, true);
            }

            $finalFilePath = $uploadDir . '/' . $finalFileName;

            // Combine chunks
            $result = $this->_combineChunks($uploadId, $finalFilePath);

            // Generate metadata blob
            $rel_url = 'storage/chat/' . $dirName . '/' . $finalFileName;
            $blob = [
                'url' => asset($rel_url),
                'name' => $finalFileName,
                'originalName' => $fileName,
                'size' => $result['size'],
                'mime' => $result['mime'],
                'width' => null,
                'height' => null,
                'duration' => null,
                'thumb' => null,
                'localmsgid' => $localmsgid
            ];

            // Probe for metadata
            if (in_array($message_type, ['image', 'video', 'audio', 'voice', 'document'], true)) {
                $probe = $this->_probeFile($finalFilePath, $message_type);
                $blob = array_merge($blob, $probe);
            }

            // Cleanup chunks
            $this->_cleanupChunks($uploadId);

            return $this->sendResponse(1, 'File upload finalized', [
                'attachment' => $blob,
                'message_type' => $message_type
            ]);

        } catch (\Exception $e) {
            return $this->handleError($e);
        }
    }

    /**
     * Get user online status
     * GET /api/chat/user-status
     */
    public function getUserStatus(Request $request)
    {
        try {
            $user = Auth::user();
            
            $userId = $request->input('user_id');
            if (!$userId) {
                throw new \Exception('user_id required', 400);
            }

            $onlineThreshold = now()->subMinutes(5);

            $targetUser = User::where('id', $userId)->first();

            if (!$targetUser) {
                throw new \Exception('User not found', 404);
            }

            $isOnline = ($targetUser->id == 1) ? true : ($targetUser->is_online == 1 && $targetUser->last_active >= $onlineThreshold);

            $lastSeen = null;
            if (!$isOnline && !empty($targetUser->last_active)) {
                $lastActive = strtotime($targetUser->last_active);
                $now = time();
                $diff = $now - $lastActive;

                if ($diff < 60) {
                    $lastSeen = "just now";
                } elseif ($diff < 3600) {
                    $mins = floor($diff / 60);
                    $lastSeen = $mins . " " . ($mins == 1 ? "min" : "mins") . " ago";
                } elseif ($diff < 86400) {
                    $hours = floor($diff / 3600);
                    $lastSeen = $hours . " " . ($hours == 1 ? "hour" : "hours") . " ago";
                } elseif ($diff < 172800) {
                    $lastSeen = "yesterday";
                } else {
                    $lastSeen = date('d M', $lastActive);
                }
            }

            return $this->sendResponse(1, 'User status fetched', [
                'is_online' => $isOnline,
                'last_seen' => $lastSeen
            ]);

        } catch (\Exception $e) {
            return $this->handleError($e);
        }
    }

    /**
     * Get user profile for chat
     * GET /api/chat/user-profile
     */
    public function getUserProfile(Request $request)
    {
        try {
            $user = Auth::user();
            
            $userId = $request->input('user_id');
            if (!$userId) {
                throw new \Exception('user_id required', 400);
            }

            $targetUser = User::where('id', $userId)->first();

            if (!$targetUser) {
                throw new \Exception('User not found', 404);
            }

            $onlineThreshold = now()->subMinutes(5);
            $isOnline = ($targetUser->id == 1) ? true : ($targetUser->is_online == 1 && $targetUser->last_active >= $onlineThreshold);

            $profile = [
                'id' => $targetUser->id,
                'name' => $targetUser->name,
                'email' => $targetUser->email,
                'mobile' => $targetUser->mobile ?? null,
                'avatar_url' => $targetUser->avatar_url ?? null,
                'is_online' => $isOnline,
                'about' => $targetUser->about_me ?? null
            ];

            if (!$isOnline && !empty($targetUser->last_active)) {
                $lastActive = strtotime($targetUser->last_active);
                $now = time();
                $diff = $now - $lastActive;

                if ($diff < 60) {
                    $profile['last_seen'] = "just now";
                } elseif ($diff < 3600) {
                    $mins = floor($diff / 60);
                    $profile['last_seen'] = $mins . " " . ($mins == 1 ? "min" : "mins") . " ago";
                } elseif ($diff < 86400) {
                    $hours = floor($diff / 3600);
                    $profile['last_seen'] = $hours . " " . ($hours == 1 ? "hour" : "hours") . " ago";
                } elseif ($diff < 172800) {
                    $profile['last_seen'] = "yesterday";
                } else {
                    $profile['last_seen'] = date('d M Y', $lastActive);
                }
            } else {
                $profile['last_seen'] = $isOnline ? "Online" : "Unknown";
            }

            return $this->sendResponse(1, 'User profile fetched', $profile);

        } catch (\Exception $e) {
            return $this->handleError($e);
        }
    }

    /**
     * Set user offline status
     * POST /api/chat/offline
     */
    public function beOffline(Request $request)
    {
        try {
            $user = Auth::user();
            
            User::where('id', $user->id)->update([
                'is_online' => 0,
                'last_active' => now()
            ]);

            return $this->sendResponse(1, 'You are now offline');

        } catch (\Exception $e) {
            return $this->handleError($e);
        }
    }

    /**
     * Validate thread access for user
     */
    private function validateThreadAccess($threadId, $userId)
    {
        $thread = ChatThread::where('thread_id', $threadId)
            ->whereNull('deleted_at')
            ->whereHas('participants', function ($q) use ($userId) {
                $q->where('user_id', $userId)->whereNull('left_at');
            })
            ->first();

        if (!$thread) {
            throw new \Exception('Thread not found or no access', 403);
        }

        return $thread;
    }

    /**
     * Get a valid thumbnail URL, handling base64 data properly
     */
    private function getValidThumbnailUrl(array $data)
    {
        // Check different possible keys for thumbnail data
        $thumb = $data['thumb'] ?? $data['thumbnail_data'] ?? $data['thumbnail'] ?? null;
        
        if (!is_string($thumb) || empty($thumb)) {
            return null;
        }
        
        // If it's a valid URL or asset path, use it
        if (filter_var($thumb, FILTER_VALIDATE_URL) || 
            strpos($thumb, 'storage/') === 0 || 
            strpos($thumb, '/storage/') !== false) {
            return $thumb;
        }
        
        // If it's base64 data (starts with data: or is very long), convert to file
        if (strpos($thumb, 'data:') === 0 || strlen($thumb) > 500) {
            return $this->saveBase64Thumbnail($thumb, $data);
        }
        
        // Return null if no valid thumbnail
        return null;
    }

    /**
     * Save base64 thumbnail data as a file and return URL
     */
    private function saveBase64Thumbnail(string $base64Data, array $blob)
    {
        try {
            // Remove data:image/jpeg;base64, prefix if present
            if (strpos($base64Data, 'data:') === 0) {
                $base64Data = substr($base64Data, strpos($base64Data, ',') + 1);
            }
            
            // Decode base64
            $imageData = base64_decode($base64Data);
            if ($imageData === false) {
                return null;
            }
            
            // Create thumbnails directory
            $thumbDir = storage_path('app/public/chat/thumbnails/');
            if (!is_dir($thumbDir)) {
                mkdir($thumbDir, 0775, true);
            }
            
            // Generate unique filename
            $filename = 'thumb_' . uniqid() . '.jpg';
            $filePath = $thumbDir . $filename;
            
            // Save the file
            if (file_put_contents($filePath, $imageData)) {
                return asset('storage/chat/thumbnails/' . $filename);
            }
            
        } catch (\Exception $e) {
            \Log::warning('Failed to save base64 thumbnail: ' . $e->getMessage());
        }
        
        return null;
    }
}
