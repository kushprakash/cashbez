<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\ComplaintComment;
use App\Models\ComplaintAttachment;
use App\Models\ComplaintAction;
use App\Models\User;
use App\Models\ChatThread;
use App\Models\ChatMessage;
use App\Models\ChatThreadParticipant;
use App\Models\ComplaintChatLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ComplaintController extends Controller
{
    const HELPDESK_USER_ID = '1'; // Help Desk user_id for chatting

    /**
     * Get complaint dashboard data
     * GET /api/complaints/dashboard
     */
    public function dashboard(Request $request)
    {
        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 401);
        }

        // Get complaint statistics
        $stats = $this->getComplaintStats($user);

        // Get recent complaints (last 10)
        $recentComplaints = $this->applyRoleBasedFilter(
            Complaint::with(['user:id,name,mobile', 'assignedTo:id,name', 'chatThread'])
                ->whereNull('deleted_at')
                ->orderBy('created_on', 'DESC')
                ->limit(10),
            $user
        )->get();

        // Get pending actions count
        $pendingActions = $this->getPendingActionsCount($user);

        return response()->json([
            'status' => 1,
            'message' => 'Dashboard data fetched successfully',
            'data' => [
                'stats' => $stats,
                'recent_complaints' => $recentComplaints,
                'pending_actions' => $pendingActions
            ]
        ]);
    }

    /**
     * Display a listing of complaints with filters
     * GET /api/complaints
     */
    public function index(Request $request)
    {
        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();
        $admin = $request->get('admin');
        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 401);
        }

        $query = Complaint::with([
            'user:id,name,mobile',
            'assignedTo:id,name',
            'createdBy:id,name',
            'chatThread'
        ])->whereNull('deleted_at');

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_on', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_on', '<=', $request->date_to);
        }

        // Apply role-based filtering
        $query = $this->applyRoleBasedFilter($query, $user);

        $complaints = $query->orderBy('created_on', 'DESC')->get();

        // Transform complaints to include proper relationship naming for frontend
        $complaintsData = $complaints->map(function ($complaint) {
            $data = $complaint->toArray();
            // Add assigned_to_user key with the assignedTo relationship data
            $data['assigned_to_user'] = $complaint->assignedTo;
            return $data;
        });

        // Get filter options
        $categories = $this->getComplaintCategories();
        $assignees = $this->getAssignees($admin->id);

        return response()->json([
            'status' => 1,
            'message' => 'Complaints fetched successfully',
            'data' => [
                'complaints' => $complaintsData,
                'complaint_count' => $complaints->count(),
                'categories' => $categories,
                'assignees' => $assignees
            ]
        ]);
    }

    /**
     * Store a newly created complaint
     * POST /api/complaints
     */
    public function store(Request $request)
    {
        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|string',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'priority' => 'required|string',
            'attachments.*' => 'nullable|file|max:10240' // 10MB max per file
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

            // Generate unique complaint ID
            $complaintId = $this->generateComplaintId();

            // Auto-assign based on category and priority
            $assignedTo = $this->getAutoAssignee($request->category, $request->priority);

            // Create complaint
            $complaint = Complaint::create([
                'complaint_id' => $complaintId,
                'user_id' => $request->user_id,
                'title' => $request->title,
                'description' => $request->description,
                'category' => $request->category,
                'priority' => $request->priority,
                'status' => 'NEW',
                'assigned_to' => $assignedTo,
                'created_by' => $user->id,
                'created_on' => now(),
                'updated_on' => now()
            ]);

            // Handle file uploads
            if ($request->hasFile('attachments')) {
                $this->handleFileUploads($complaintId, $request->file('attachments'), $user->id);
            }

            // Create or link chat thread
            $threadId = $this->createOrLinkChatThread($complaintId, $request->user_id);
            $complaint->update(['chat_thread_id' => $threadId]);

            // Log action
            $this->logComplaintAction(
                $complaintId,
                'CREATED',
                null,
                'NEW',
                null,
                $assignedTo,
                'Complaint created',
                $user->id,
                $user->role,
                $request->ip()
            );

            // Send notification
            $this->sendComplaintNotification($complaintId, 'CREATED', $request->user_id);

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Complaint created successfully',
                'data' => $complaint->load(['user', 'assignedTo', 'chatThread'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Error creating complaint: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified complaint
     * GET /api/complaints/{id}
     */
    public function show(Request $request, $id)
    {
        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 401);
        }


        $complaint = Complaint::with([
            'user',
            'assignedTo',
            'createdBy',
            'comments.commentedBy',
            'attachments',
            'actions.actionBy',
            'chatThread.messages.sender',
            'linkedChatMessages'
        ])->where('complaint_id', $id)->first();

        if (!$complaint) {
            return response()->json([
                'status' => 0,
                'message' => 'Complaint not found'
            ], 404);
        }

        // Check permissions
        if (!$this->canViewComplaint($complaint, $user, $request->get('admin'))) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied'
            ], 403);
        }

        return response()->json([
            'status' => 1,
            'message' => 'Complaint fetched successfully',
            'data' => [
                'complaint' => $complaint,
                'can_edit' => $this->canEditComplaint($complaint, $user),
                'can_assign' => $this->canAssignComplaint($complaint, $user),
                'can_resolve' => $this->canResolveComplaint($complaint, $user)
            ]
        ]);
    }

    /**
     * Update complaint status
     * PUT /api/complaints/{id}/status
     */
    public function updateStatus(Request $request, $id)
    {
        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:NEW,ASSIGNED,IN_PROGRESS,RESOLVED,CLOSED,CANCELLED',
            'remarks' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $complaint = Complaint::where('complaint_id', $id)->first();

        if (!$complaint) {
            return response()->json([
                'status' => 0,
                'message' => 'Complaint not found'
            ], 404);
        }

        if (!$this->canEditComplaint($complaint, $user)) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied'
            ], 403);
        }

        try {
            DB::beginTransaction();

            $oldStatus = $complaint->status;
            $complaint->update([
                'status' => $request->status,
                'updated_on' => now(),
                'resolved_at' => $request->status === 'RESOLVED' ? now() : $complaint->resolved_at,
                'closed_at' => $request->status === 'CLOSED' ? now() : $complaint->closed_at,
                'resolution_notes' => $request->has('resolution_notes') ? $request->resolution_notes : $complaint->resolution_notes
            ]);

            // Log action
            $this->logComplaintAction(
                $id,
                'STATUS_UPDATE',
                $oldStatus,
                $request->status,
                null,
                null,
                $request->remarks ?? "Status updated from {$oldStatus} to {$request->status}",
                $user->id,
                $user->role,
                $request->ip()
            );

            // Send notification
            $this->sendComplaintNotification($id, 'STATUS_UPDATE', $complaint->user_id, $request->status);

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Status updated successfully',
                'data' => $complaint->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Error updating status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign complaint to user
     * PUT /api/complaints/{id}/assign
     */
    public function assign(Request $request, $id)
    {
        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'assigned_to' => 'required|string',
            'remarks' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $complaint = Complaint::where('complaint_id', $id)->first();

        if (!$complaint) {
            return response()->json([
                'status' => 0,
                'message' => 'Complaint not found'
            ], 404);
        }

        if (!$this->canAssignComplaint($complaint, $user)) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied'
            ], 403);
        }

        try {
            DB::beginTransaction();

            $oldAssignedTo = $complaint->assigned_to;
            $complaint->update([
                'assigned_to' => $request->assigned_to,
                'status' => 'ASSIGNED',
                'updated_on' => now()
            ]);

            // Log action
            $this->logComplaintAction(
                $id,
                'ASSIGNED',
                $complaint->status,
                'ASSIGNED',
                $oldAssignedTo,
                $request->assigned_to,
                $request->remarks ?? "Complaint assigned",
                $user->id,
                $user->role,
                $request->ip()
            );

            // Send notification
            $this->sendComplaintNotification($id, 'ASSIGNED', $complaint->user_id, null, $request->assigned_to);

            DB::commit();

            return response()->json([
                'status' => 1,
                'message' => 'Complaint assigned successfully',
                'data' => $complaint->fresh()->load('assignedTo')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Error assigning complaint: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add comment to complaint
     * POST /api/complaints/{id}/comments
     */
    public function addComment(Request $request, $id)
    {
        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'comment_text' => 'required|string',
            'is_internal' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $complaint = Complaint::where('complaint_id', $id)->first();

        if (!$complaint) {
            return response()->json([
                'status' => 0,
                'message' => 'Complaint not found'
            ], 404);
        }

        try {
            $comment = ComplaintComment::create([
                'complaint_id' => $id,
                'comment_text' => $request->comment_text,
                'commented_by' => $user->id,
                'is_internal' => $request->is_internal ?? false,
                'created_at' => now()
            ]);

            // Log action
            $this->logComplaintAction(
                $id,
                'COMMENT_ADDED',
                $complaint->status,
                $complaint->status,
                null,
                null,
                substr($request->comment_text, 0, 100),
                $user->id,
                $user->role,
                $request->ip()
            );

            return response()->json([
                'status' => 1,
                'message' => 'Comment added successfully',
                'data' => $comment->load('commentedBy')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error adding comment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send help desk message
     * POST /api/complaints/{id}/send-message
     */
    public function sendHelpDeskMessage(Request $request, $id)
    {
        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'message' => 'required|string',
            'attach_to_complaint' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $complaint = Complaint::where('complaint_id', $id)->first();

        if (!$complaint) {
            return response()->json([
                'status' => 0,
                'message' => 'Complaint not found'
            ], 404);
        }

        if (!$this->canEditComplaint($complaint, $user)) {
            return response()->json([
                'status' => 0,
                'message' => 'Access denied'
            ], 403);
        }

        try {
            $threadId = $complaint->chat_thread_id;
            if (empty($threadId)) {
                $threadId = $this->createOrLinkChatThread($id, $complaint->user_id);
                $complaint->update(['chat_thread_id' => $threadId]);
            }

            // Send message
            $messageId = $this->insertChatMessage($threadId, self::HELPDESK_USER_ID, $request->message);

            if ($messageId) {
                // Link message to complaint if requested
                if ($request->attach_to_complaint) {
                    ComplaintChatLink::create([
                        'complaint_id' => $id,
                        'message_id' => $messageId,
                        'link_type' => 'CONTEXT',
                        'linked_by' => $user->id,
                        'notes' => 'Help desk response message',
                        'linked_at' => now()
                    ]);

                    // Log action
                    $this->logComplaintAction(
                        $id,
                        'CHAT_MESSAGE',
                        $complaint->status,
                        $complaint->status,
                        null,
                        null,
                        "Help desk message: " . substr($request->message, 0, 100),
                        $user->id,
                        $user->role,
                        $request->ip()
                    );
                }

                return response()->json([
                    'status' => 1,
                    'message' => 'Message sent successfully',
                    'data' => ['message_id' => $messageId]
                ]);
            }

            return response()->json([
                'status' => 0,
                'message' => 'Failed to send message'
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error sending message: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Link chat message to complaint
     * POST /api/complaints/{id}/link-message
     */
    public function linkChatMessage(Request $request, $id)
    {
        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'message_id' => 'required|integer',
            'link_type' => 'nullable|in:TRIGGER,CONTEXT,RESOLUTION,UPDATE',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if link already exists
        $existing = ComplaintChatLink::where('complaint_id', $id)
            ->where('message_id', $request->message_id)
            ->first();

        if ($existing) {
            return response()->json([
                'status' => 0,
                'message' => 'Message already linked to this complaint'
            ], 400);
        }

        try {
            $link = ComplaintChatLink::create([
                'complaint_id' => $id,
                'message_id' => $request->message_id,
                'link_type' => $request->link_type ?? 'CONTEXT',
                'linked_by' => $user->id,
                'notes' => $request->notes,
                'linked_at' => now()
            ]);

            // If this is the first linked message, update complaint thread
            $complaint = Complaint::where('complaint_id', $id)->first();
            if (empty($complaint->chat_thread_id)) {
                $message = ChatMessage::where('message_id', $request->message_id)->first();
                if ($message) {
                    $complaint->update(['chat_thread_id' => $message->thread_id]);
                }
            }

            // Log action
            $this->logComplaintAction(
                $id,
                'ADD_CHAT_LINK',
                $complaint->status,
                $complaint->status,
                null,
                null,
                "Linked chat message ID: {$request->message_id}",
                $user->id,
                $user->role,
                $request->ip()
            );

            return response()->json([
                'status' => 1,
                'message' => 'Chat message linked successfully',
                'data' => $link
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Error linking message: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get workload report
     * GET /api/complaints/workload-report
     */
    public function workloadReport(Request $request)
    {
        $token = $request->header('Token');
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json([
                'status' => 0,
                'message' => 'Invalid token',
            ], 401);
        }

        $targetRole = $request->get('role', 'HelpDesk');

        // Get workload statistics
        $workloadStats = DB::table('complaints')
            ->join('users', 'users.id', '=', 'complaints.assigned_to')
            ->select(
                'users.id',
                'users.name',
                DB::raw('COUNT(*) as total_assigned'),
                DB::raw('SUM(CASE WHEN complaints.status = "NEW" THEN 1 ELSE 0 END) as new_count'),
                DB::raw('SUM(CASE WHEN complaints.status = "IN_PROGRESS" THEN 1 ELSE 0 END) as in_progress_count'),
                DB::raw('SUM(CASE WHEN complaints.status = "RESOLVED" THEN 1 ELSE 0 END) as resolved_count')
            )
            ->whereNull('complaints.deleted_at')
            ->groupBy('users.id', 'users.name')
            ->get();

        return response()->json([
            'status' => 1,
            'message' => 'Workload report fetched successfully',
            'data' => [
                'workload_stats' => $workloadStats
            ]
        ]);
    }

    // ==================== PRIVATE HELPER METHODS ====================

    /**
     * Apply role-based filtering to query
     */
    private function applyRoleBasedFilter($query, $user)
    {
        $role = $user->role;
        $userCode = $user->id;

        switch ($role) {
            case 1: // SuperAdmin
                // Can see all complaints
                break;

            case 2: // Admin/CoreCommittee
                $query->where(function ($q) use ($userCode) {
                    $q->where('complaints.assigned_to', $userCode)
                      ->orWhere('complaints.created_by', $userCode)
                      ->orWhereIn('complaints.category', ['BILLING', 'TRANSACTION']);
                });
                break;

            case 3: // HelpDesk
                $query->where(function ($q) use ($userCode) {
                    $q->where('complaints.assigned_to', $userCode)
                      ->orWhere('complaints.created_by', $userCode)
                      ->orWhere('complaints.status', 'NEW');
                });
                break;

            default:
                $query->where('complaints.created_by', $userCode);
                break;
        }

        return $query;
    }

    /**
     * Generate unique complaint ID
     */
    private function generateComplaintId()
    {
        $prefix = 'CMP';
        $year = date('Y');
        $lastComplaint = Complaint::where('complaint_id', 'LIKE', "{$prefix}{$year}%")
            ->orderBy('complaint_id', 'DESC')
            ->first();

        if ($lastComplaint) {
            $lastNumber = (int) substr($lastComplaint->complaint_id, -6);
            $newNumber = str_pad($lastNumber + 1, 6, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '000001';
        }

        return "{$prefix}{$year}{$newNumber}";
    }

    /**
     * Handle file uploads
     */
    private function handleFileUploads($complaintId, $files, $uploadedBy)
    {
        foreach ($files as $file) {
            $originalName = $file->getClientOriginalName();
            $mimeType = $file->getMimeType();
            $fileSize = $file->getSize();
            
            $path = $file->store('complaints/' . $complaintId, 'public');
            $fileUrl = Storage::url($path);

            ComplaintAttachment::create([
                'complaint_id' => $complaintId,
                'attachment_type' => 'USER_UPLOAD',
                'file_url' => $fileUrl,
                'original_filename' => $originalName,
                'mime_type' => $mimeType,
                'file_size' => $fileSize,
                'uploaded_by' => $uploadedBy,
                'uploaded_at' => now()
            ]);
        }
    }

    /**
     * Log complaint action
     */
    private function logComplaintAction(
        $complaintId,
        $actionType,
        $oldStatus,
        $newStatus,
        $oldAssignedTo,
        $newAssignedTo,
        $remarks,
        $actionBy,
        $actionByRole,
        $ipAddress
    ) {
        ComplaintAction::create([
            'complaint_id' => $complaintId,
            'action_type' => $actionType,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'old_assigned_to' => $oldAssignedTo,
            'new_assigned_to' => $newAssignedTo,
            'remarks' => $remarks,
            'action_by' => $actionBy,
            'action_by_role' => $actionByRole,
            'ip_address' => $ipAddress,
            'user_agent' => request()->userAgent(),
            'created_at' => now()
        ]);
    }

    /**
     * Create or link chat thread for complaint
     */
    private function createOrLinkChatThread($complaintId, $userId)
    {
        // Check if thread already exists between user and helpdesk
        $existingThread = ChatThread::where('thread_type', 'support')
            ->whereHas('participants', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->whereHas('participants', function ($q) {
                $q->where('user_id', self::HELPDESK_USER_ID);
            })
            ->first();

        if ($existingThread) {
            return $existingThread->thread_id;
        }

        // Create new thread
        $threadId = uniqid('thread_');
        $thread = ChatThread::create([
            'thread_id' => $threadId,
            'thread_type' => 'support',
            'title' => 'Support Chat - Complaint #' . $complaintId,
            'topic' => 'complaint',
            'description' => 'Support chat for complaint resolution',
            'owner_id' => self::HELPDESK_USER_ID,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Add participants
        ChatThreadParticipant::insert([
            [
                'thread_id' => $threadId,
                'user_id' => $userId,
                'role' => 'member',
                'invited_by' => self::HELPDESK_USER_ID,
                'invited_at' => now(),
                'joined_at' => now()
            ],
            [
                'thread_id' => $threadId,
                'user_id' => self::HELPDESK_USER_ID,
                'role' => 'support',
                'invited_by' => self::HELPDESK_USER_ID,
                'invited_at' => now(),
                'joined_at' => now()
            ]
        ]);

        // Send initial message
        $this->insertChatMessage(
            $threadId,
            self::HELPDESK_USER_ID,
            "Your complaint #{$complaintId} has been registered. Our support team will assist you shortly."
        );

        return $threadId;
    }

    /**
     * Send complaint notification
     */
    private function sendComplaintNotification($complaintId, $notificationType, $userId, $status = null, $assignedTo = null)
    {
        $complaint = Complaint::where('complaint_id', $complaintId)->first();

        if (!$complaint) {
            return false;
        }

        $message = '';
        $linkType = 'CONTEXT';

        switch ($notificationType) {
            case 'CREATED':
                $message = "Your complaint has been successfully registered.\nComplaint ID: #{$complaintId}\nWe'll keep you updated on the progress.";
                $linkType = 'TRIGGER';
                break;
            case 'STATUS_UPDATE':
                $message = "Your complaint #{$complaintId} status has been updated to: {$status}";
                $linkType = 'UPDATE';
                break;
            case 'ASSIGNED':
                $assignee = User::where('id', $assignedTo)->first();
                $assigneeName = $assignee ? $assignee->name : 'support team';
                $message = "Your complaint #{$complaintId} has been assigned to {$assigneeName}";
                $linkType = 'UPDATE';
                break;
            case 'RESOLVED':
                $message = "Your complaint #{$complaintId} has been marked as resolved. Please review and confirm.";
                $linkType = 'RESOLUTION';
                break;
            case 'CLOSED':
                $message = "Your complaint #{$complaintId} has been closed. If you need further assistance, please create a new complaint.";
                $linkType = 'RESOLUTION';
                break;
        }

        if (empty($message)) {
            return false;
        }

        // Get or create chat thread
        $threadId = $complaint->chat_thread_id;
        if (empty($threadId)) {
            $threadId = $this->createOrLinkChatThread($complaintId, $userId);
        }

        if ($threadId) {
            // Send message
            $messageId = $this->insertChatMessage($threadId, self::HELPDESK_USER_ID, $message);

            if ($messageId) {
                // Link message to complaint
                ComplaintChatLink::create([
                    'complaint_id' => $complaintId,
                    'message_id' => $messageId,
                    'link_type' => $linkType,
                    'linked_by' => 'SYSTEM',
                    'notes' => 'Auto-linked system notification',
                    'linked_at' => now()
                ]);

                return true;
            }
        }

        return false;
    }

    /**
     * Insert chat message
     */
    private function insertChatMessage($threadId, $senderId, $content, $messageType = 'text')
    {
        $localMsgId = uniqid('msg_' . time() . '_');
        
        $message = ChatMessage::create([
            'thread_id' => $threadId,
            'sender_id' => $senderId,
            'message_type' => $messageType,
            'content' => $content,
            'metadata' => json_encode(['localmsgid' => $localMsgId]),
            'status' => 'sent',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Update thread last message
        ChatThread::where('thread_id', $threadId)->update([
            'last_message_id' => $message->message_id,
            'updated_at' => now()
        ]);

        return $message->message_id;
    }

    /**
     * Get complaint statistics
     */
    private function getComplaintStats($user)
    {
        $query = $this->applyRoleBasedFilter(
            Complaint::whereNull('deleted_at'),
            $user
        );

        $stats = [
            'total' => (clone $query)->count(),
            'new' => (clone $query)->where('status', 'NEW')->count(),
            'in_progress' => (clone $query)->where('status', 'IN_PROGRESS')->count(),
            'resolved' => (clone $query)->where('status', 'RESOLVED')->count(),
            'closed' => (clone $query)->where('status', 'CLOSED')->count()
        ];

        return $stats;
    }

    /**
     * Get pending actions count
     */
    private function getPendingActionsCount($user)
    {
        return $this->applyRoleBasedFilter(
            Complaint::whereNull('deleted_at')
                ->whereIn('status', ['NEW', 'ASSIGNED', 'IN_PROGRESS']),
            $user
        )->count();
    }

    /**
     * Get complaint categories
     */
    private function getComplaintCategories()
    {
        return [
            'TRANSACTION' => 'Transaction Issues',
            'ACCOUNT' => 'Account Issues',
            'TECHNICAL' => 'Technical Support',
            'BILLING' => 'Billing & Payments',
            'KYC' => 'KYC & Verification',
            'OTHER' => 'Other'
        ];
    }

    /**
     * Get assignees
     */
    private function getAssignees($adminId)
    {
        return User::leftJoin('employees', 'users.id', '=', 'employees.user_id')
            ->where('employees.admin_id', $adminId)
            ->orWhere('users.id', $adminId)
            ->select('users.id as value', 'users.name as label')
            ->get();

    }

    /**
     * Get auto-assignee based on category and priority
     */
    private function getAutoAssignee($category, $priority)
    {
        // Simple round-robin assignment to HelpDesk users
        $helpdeskUsers = User::where('role', 3)
            ->where('status', 1)
            ->get();

        if ($helpdeskUsers->isEmpty()) {
            return null;
        }

        // Get user with least active complaints
        $userWithLeastLoad = null;
        $minLoad = PHP_INT_MAX;

        foreach ($helpdeskUsers as $helpdeskUser) {
            $load = Complaint::where('assigned_to', $helpdeskUser->id)
                ->whereIn('status', ['NEW', 'ASSIGNED', 'IN_PROGRESS'])
                ->count();

            if ($load < $minLoad) {
                $minLoad = $load;
                $userWithLeastLoad = $helpdeskUser;
            }
        }

        return $userWithLeastLoad ? $userWithLeastLoad->id : null;
    }

    /**
     * Check if user can view complaint
     */
    private function canViewComplaint($complaint, $user, $admin)
    {
        if ($user->role == 1) { // SuperAdmin
            return true;
        }

        dd($complaint->created_by == $user->id,
            $complaint->assigned_to == $user->id,
            $complaint->user_id == $user->id,
            $complaint->user_id == $admin->id);
        
        return $complaint->created_by == $user->id
            || $complaint->assigned_to == $user->id
            || $complaint->user_id == $user->id
            || $complaint->user_id == $admin->id;
    }

    /**
     * Check if user can edit complaint
     */
    private function canEditComplaint($complaint, $user)
    {
        if ($user->role == 1) { // SuperAdmin
            return true;
        }

        return $complaint->assigned_to == $user->id
            || $complaint->created_by == $user->id;
    }

    /**
     * Check if user can assign complaint
     */
    private function canAssignComplaint($complaint, $user)
    {
        return in_array($user->role, [1, 2, 3]); // SuperAdmin, Admin, HelpDesk
    }

    /**
     * Check if user can resolve complaint
     */
    private function canResolveComplaint($complaint, $user)
    {
        if ($user->role == 1) { // SuperAdmin
            return true;
        }

        return $complaint->assigned_to == $user->id;
    }
}
