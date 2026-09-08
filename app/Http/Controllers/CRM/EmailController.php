<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Email;
use App\Models\EmailRecipient;
use App\Models\EmailAttachment;
use App\Models\EmailThread;
use App\Models\User;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class EmailController extends Controller
{
    /**
     * Display sent emails
     */
    public function sent(Request $request)
    {
        $user = Auth::user();
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');

        $query = Email::with(['recipients.user:id,name,email', 'attachments'])
            ->sent($user->id)
            ->latest('sent_at');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                  ->orWhere('body', 'like', "%{$search}%");
            });
        }

        $emails = $query->paginate($perPage);

        return response()->json($emails);
    }

    /**
     * Display trashed emails (both received and sent)
     */
    public function trash(Request $request)
    {
        $user = Auth::user();
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');

        // Get received emails in trash
        $receivedTrashEmails = Email::with(['sender:id,name,email', 'attachments'])
            ->trash($user->id)
            ->get();

        // Get sent emails in trash
        $sentTrashEmails = Email::with(['recipients.user:id,name,email', 'attachments'])
            ->sentTrash($user->id)
            ->get();

        // Combine both collections
        $allTrashEmails = $receivedTrashEmails->concat($sentTrashEmails);

        // Apply search filter if needed
        if ($search) {
            $allTrashEmails = $allTrashEmails->filter(function ($email) use ($search) {
                return stripos($email->subject, $search) !== false || 
                       stripos($email->body, $search) !== false;
            });
        }

        // Sort by created_at descending
        $allTrashEmails = $allTrashEmails->sortByDesc('created_at');

        // Manual pagination
        $currentPage = $request->get('page', 1);
        $total = $allTrashEmails->count();
        $offset = ($currentPage - 1) * $perPage;
        $items = $allTrashEmails->slice($offset, $perPage)->values();

        $paginated = new \Illuminate\Pagination\LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $currentPage,
            [
                'path' => $request->url(),
                'pageName' => 'page',
            ]
        );

        return response()->json($paginated);
    }

    /**
     * Display a specific email
     */
    public function show($id)
    {
        $user = Auth::user();
        
        $email = Email::with([
            'sender:id,name,email',
            'recipients.user:id,name,email',
            'attachments',
            'replyTo.sender:id,name,email',
            'replies.sender:id,name,email'
        ])->findOrFail($id);

        // Check if user has access to this email
        $hasAccess = $email->sender_id === $user->id || 
                    $email->recipients()->where('user_id', $user->id)->exists();

        if (!$hasAccess) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Mark as read if it's in user's inbox
        if ($email->sender_id !== $user->id) {
            $email->markAsRead($user->id);
        }

        // Add recipient data
        $recipient = $email->recipients()->where('user_id', $user->id)->first();
        $email->is_read = $recipient ? $recipient->is_read : true;
        $email->is_starred = $recipient ? $recipient->is_starred : false;

        return response()->json($email);
    }

    /**
     * Compose and send/save email
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            // Support both old format (to[]) and new format (to_users[], to_leads[])
            'to' => 'array|min:1|required_without_all:to_users,to_leads',
            'to.*' => 'exists:users,id',
            'to_users' => 'array|required_without_all:to,to_leads',
            'to_users.*' => 'exists:users,id',
            'to_leads' => 'array|required_without_all:to,to_users',
            'to_leads.*' => 'exists:leads,id',
            'cc' => 'nullable|array',
            'cc.*' => 'exists:users,id',
            'cc_users' => 'nullable|array',
            'cc_users.*' => 'exists:users,id',
            'cc_leads' => 'nullable|array',
            'cc_leads.*' => 'exists:leads,id',
            'bcc' => 'nullable|array',
            'bcc.*' => 'exists:users,id',
            'bcc_users' => 'nullable|array',
            'bcc_users.*' => 'exists:users,id',
            'bcc_leads' => 'nullable|array',
            'bcc_leads.*' => 'exists:leads,id',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'is_draft' => 'boolean',
            'priority' => 'in:low,normal,high',
            'reply_to_id' => 'nullable|exists:emails,id',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240' // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();
        $isDraft = $request->get('is_draft', false);

        DB::beginTransaction();
        try {
            // Handle thread
            $threadId = null;
            if ($request->reply_to_id) {
                $originalEmail = Email::findOrFail($request->reply_to_id);
                $threadId = $originalEmail->thread_id;
                
                if (!$threadId) {
                    // Create thread for original email
                    $thread = EmailThread::create([
                        'subject' => $originalEmail->subject,
                        'participants' => [$originalEmail->sender_id],
                        'last_activity_at' => now()
                    ]);
                    $threadId = $thread->id;
                    $originalEmail->update(['thread_id' => $threadId]);
                }
            } else if (!$isDraft) {
                // Get all user recipients to determine if we need a thread
                $allToRecipients = $this->getUserRecipients($request, 'to');
                
                if (count($allToRecipients) > 1) {
                    // Create new thread for multi-recipient emails
                    $participants = array_merge([$user->id], $allToRecipients);
                    
                    $ccRecipients = $this->getUserRecipients($request, 'cc');
                    if (!empty($ccRecipients)) {
                        $participants = array_merge($participants, $ccRecipients);
                    }
                    
                    $bccRecipients = $this->getUserRecipients($request, 'bcc');
                    if (!empty($bccRecipients)) {
                        $participants = array_merge($participants, $bccRecipients);
                    }
                
                    $thread = EmailThread::create([
                        'subject' => $request->subject,
                        'participants' => array_unique($participants),
                        'last_activity_at' => now()
                    ]);
                    $threadId = $thread->id;
                }
            }

            // Create email
            $email = Email::create([
                'sender_id' => $user->id,
                'subject' => $request->subject,
                'body' => $request->body,
                'is_draft' => $isDraft,
                'sent_at' => $isDraft ? null : now(),
                'reply_to_id' => $request->reply_to_id,
                'thread_id' => $threadId,
                'priority' => $request->get('priority', 'normal'),
                'cc' => $this->getEmailsFromRecipients($request, 'cc'),
                'bcc' => $this->getEmailsFromRecipients($request, 'bcc'),
                'has_attachments' => $request->hasFile('attachments'),
                'created_by' => $user->id,
                'admin_id' => $request->get('admin_id')
            ]);

            // Create recipients (only for sent emails)
            if (!$isDraft) {
                $recipients = [];
                
                // Get all recipients for all types (to, cc, bcc)
                foreach (['to', 'cc', 'bcc'] as $type) {
                    $userRecipients = $this->getUserRecipients($request, $type);
                    $leadRecipients = $this->getLeadRecipients($request, $type);
                    
                    // Add user recipients
                    foreach ($userRecipients as $userId) {
                        $recipients[] = [
                            'email_id' => $email->id,
                            'user_id' => $userId,
                            'recipient_type' => $type,
                            'folder_type' => 'inbox',
                            'created_at' => now(),
                            'updated_at' => now()
                        ];
                    }
                    
                    // Note: Lead recipients would need a separate table or different handling
                    // For now, we'll log them but not store in email_recipients table
                    if (!empty($leadRecipients)) {
                        \Log::info("Email sent to leads", [
                            'email_id' => $email->id,
                            'lead_ids' => $leadRecipients,
                            'type' => $type
                        ]);
                    }
                }
                
                if (!empty($recipients)) {
                    EmailRecipient::insert($recipients);
                }

                // Update thread
                if ($threadId) {
                    $thread = EmailThread::find($threadId);
                    $thread->updateLastActivity($email->id);
                    
                    // Add new user participants to thread (only users, not leads)
                    $allUserParticipants = [$user->id];
                    foreach (['to', 'cc', 'bcc'] as $type) {
                        $userRecipients = $this->getUserRecipients($request, $type);
                        $allUserParticipants = array_merge($allUserParticipants, $userRecipients);
                    }
                    
                    foreach ($allUserParticipants as $participantId) {
                        $thread->addParticipant($participantId);
                    }
                }
            }

            // Handle attachments
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $originalName = $file->getClientOriginalName();
                    $storedName = time() . '_' . $originalName;
                    $path = $file->storeAs('email_attachments', $storedName, 'public');

                    EmailAttachment::create([
                        'email_id' => $email->id,
                        'original_name' => $originalName,
                        'stored_name' => $storedName,
                        'file_path' => $path,
                        'mime_type' => $file->getMimeType(),
                        'file_size' => $file->getSize()
                    ]);
                }
            }

            DB::commit();

            $email->load(['recipients.user:id,name,email', 'attachments']);
            
            return response()->json([
                'message' => $isDraft ? 'Draft saved successfully' : 'Email sent successfully',
                'email' => $email
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to send email: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update email (for drafts)
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $email = Email::where('sender_id', $user->id)
                     ->where('is_draft', true)
                     ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            // Support both old format (to[]) and new format (to_users[], to_leads[])
            'to' => 'array|min:1|required_without_all:to_users,to_leads',
            'to.*' => 'exists:users,id',
            'to_users' => 'array|required_without_all:to,to_leads',
            'to_users.*' => 'exists:users,id',
            'to_leads' => 'array|required_without_all:to,to_users',
            'to_leads.*' => 'exists:leads,id',
            'cc' => 'nullable|array',
            'cc.*' => 'exists:users,id',
            'cc_users' => 'nullable|array',
            'cc_users.*' => 'exists:users,id',
            'cc_leads' => 'nullable|array',
            'cc_leads.*' => 'exists:leads,id',
            'bcc' => 'nullable|array',
            'bcc.*' => 'exists:users,id',
            'bcc_users' => 'nullable|array',
            'bcc_users.*' => 'exists:users,id',
            'bcc_leads' => 'nullable|array',
            'bcc_leads.*' => 'exists:leads,id',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'priority' => 'in:low,normal,high'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $email->update([
            'subject' => $request->subject,
            'body' => $request->body,
            'priority' => $request->get('priority', 'normal'),
            'cc' => $this->getEmailsFromRecipients($request, 'cc'),
            'bcc' => $this->getEmailsFromRecipients($request, 'bcc'),
        ]);

        return response()->json(['message' => 'Draft updated successfully', 'email' => $email]);
    }

    /**
     * Delete email (move to trash or permanent delete)
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $email = Email::findOrFail($id);

        // Check if user has access
        $recipient = $email->recipients()->where('user_id', $user->id)->first();
        $isOwner = $email->sender_id === $user->id;

        if (!$recipient && !$isOwner) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($recipient) {
            // Move to trash for recipient
            $recipient->update(['is_deleted' => true, 'deleted_at' => now()]);
        } else if ($isOwner) {
            if ($email->is_draft) {
                // Permanently delete draft
                $email->delete();
            } else {
                // Soft delete sent email using Laravel's built-in soft delete
                $email->delete();
            }
        }

        return response()->json(['message' => 'Email deleted successfully']);
    }

    /**
     * Restore email from trash
     */
    public function restore($id)
    {
        $user = Auth::user();
        
        // Try to find the email including trashed ones
        $email = Email::withTrashed()->findOrFail($id);

        // Check if user has access
        $recipient = $email->recipients()->where('user_id', $user->id)->first();
        $isOwner = $email->sender_id === $user->id;

        if (!$recipient && !$isOwner) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($recipient && $recipient->is_deleted) {
            // Restore for recipient
            $recipient->update(['is_deleted' => false, 'deleted_at' => null]);
        } else if ($isOwner && $email->trashed()) {
            // Restore soft-deleted email for sender
            $email->restore();
        }

        return response()->json(['message' => 'Email restored successfully']);
    }

    /**
     * Mark email as read/unread
     */
    public function markAsRead(Request $request, $id)
    {
        $user = Auth::user();
        $email = Email::findOrFail($id);
        $isRead = $request->get('is_read', true);

        if ($isRead) {
            $email->markAsRead($user->id);
        } else {
            $email->markAsUnread($user->id);
        }

        return response()->json(['message' => 'Email marked as ' . ($isRead ? 'read' : 'unread')]);
    }

    /**
     * Get email statistics
     */
    public function getStats()
    {
        $user = Auth::user();

        $stats = [
            'sent_count' => Email::sent($user->id)->count()
        ];

        return response()->json($stats);
    }

    /**
     * Get users for compose autocomplete
     */
    public function getUsers(Request $request)
    {
        $search = $request->get('search', '');
        $users = User::where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->select('id', 'name', 'email')
                    ->limit(10)
                    ->get();

        return response()->json($users);
    }

    /**
     * Get both users and leads for compose autocomplete
     */
    public function getContacts(Request $request)
    {
        $search = $request->get('search', '');
        
        // Get users with email addresses including role and designation
        $usersQuery = User::select([
                'users.id',
                'users.name',
                'users.email',
                'users.role',
                'roles.name as role_name',
                'designations.title as designation_title'
            ])
            ->leftJoin('employees', 'users.id', '=', 'employees.user_id')
            ->leftJoin('designations', 'employees.designation_id', '=', 'designations.id')
            ->leftJoin('roles', 'users.role', '=', 'roles.id')
            ->whereNotNull('users.email')
            ->where('users.email', '!=', '');
        
        // Get leads with email addresses
        $leadsQuery = Lead::select('id', 'name', 'email', 'created_at')
                         ->whereNotNull('email')
                         ->where('email', '!=', '');
        
        // Apply search if provided
        if ($search) {
            $usersQuery->where(function($q) use ($search) {
                $q->where('users.name', 'like', "%{$search}%")
                  ->orWhere('users.email', 'like', "%{$search}%")
                  ->orWhere('roles.name', 'like', "%{$search}%")
                  ->orWhere('designations.title', 'like', "%{$search}%");
            });
            
            $leadsQuery->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        $users = $usersQuery->limit(100)->get();
        $leads = $leadsQuery->limit(100)->get();
        
        // Add unique prefixes to avoid ID conflicts
        $users = $users->map(function($user) {
            $user->unique_id = 'user_' . $user->id;
            return $user;
        });
        
        $leads = $leads->map(function($lead) {
            $lead->unique_id = 'lead_' . $lead->id;
            return $lead;
        });
        
        return response()->json([
            'users' => $users,
            'leads' => $leads
        ]);
    }

    /**
     * Download attachment
     */
    public function downloadAttachment($attachmentId)
    {
        $attachment = EmailAttachment::findOrFail($attachmentId);
        
        // Check if user has access to the email
        $user = Auth::user();
        $email = $attachment->email;
        $hasAccess = $email->sender_id === $user->id || 
                    $email->recipients()->where('user_id', $user->id)->exists();

        if (!$hasAccess) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $filePath = storage_path('app/public/' . $attachment->file_path);
        
        if (!file_exists($filePath)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return response()->download($filePath, $attachment->original_name);
    }

    /**
     * Get user recipients for a specific type (to, cc, bcc)
     */
    private function getUserRecipients(Request $request, $type)
    {
        // Support both old format (to[]) and new format (to_users[])
        $oldFormat = $request->get($type, []);
        $newFormat = $request->get($type . '_users', []);
        
        return array_merge($oldFormat, $newFormat);
    }

    /**
     * Get lead recipients for a specific type (to, cc, bcc)
     */
    private function getLeadRecipients(Request $request, $type)
    {
        return $request->get($type . '_leads', []);
    }

    /**
     * Get email addresses from recipients (both users and leads)
     */
    private function getEmailsFromRecipients(Request $request, $type)
    {
        $emails = [];
        
        // Get user emails
        $userIds = $this->getUserRecipients($request, $type);
        if (!empty($userIds)) {
            $userEmails = User::whereIn('id', $userIds)->pluck('email')->toArray();
            $emails = array_merge($emails, $userEmails);
        }
        
        // Get lead emails
        $leadIds = $this->getLeadRecipients($request, $type);
        if (!empty($leadIds)) {
            $leadEmails = Lead::whereIn('id', $leadIds)->pluck('email')->toArray();
            $emails = array_merge($emails, $leadEmails);
        }
        
        return !empty($emails) ? $emails : null;
    }
}
