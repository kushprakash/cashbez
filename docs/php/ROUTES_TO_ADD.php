// ✅ ROUTES ALREADY ADDED TO routes/api.php
// This file serves as documentation for the API endpoints

// ==============================================================================
// COMPLAINT & CHAT API ROUTES - DOCUMENTATION
// ==============================================================================
// These routes have been added to routes/api.php inside the auth:api middleware
//
// Base URL: /api (with auth:api middleware protection)
// All routes require authentication token in header: 'Token: YOUR_TOKEN'
// ==============================================================================

// COMPLAINT MANAGEMENT ROUTES
// Prefix: /api/complaints

Route::prefix('complaints')->group(function () {
    // Dashboard - Get complaint statistics and summary
    Route::get('/dashboard', [ComplaintController::class, 'dashboard']);
    // Returns: {total, new, in_progress, resolved, closed, recent_complaints}
    
    // Workload Report - Get staff workload analytics
    Route::get('/workload-report', [ComplaintController::class, 'workloadReport']);
    // Query: ?role=HelpDesk (optional)
    // Returns: {summary, staff_workload[]}
    
    // List Complaints - Get all complaints with filters
    Route::get('/', [ComplaintController::class, 'index']);
    // Query: ?status=NEW&category=TECHNICAL&priority=HIGH&date_from=2024-01-01
    // Returns: {complaints[], pagination}
    
    // Create Complaint - Submit new complaint
    Route::post('/', [ComplaintController::class, 'store']);
    // Body: {user_id, title, description, category, priority, attachments[]}
    // Returns: {complaint_id, message}
    
    // Get Complaint Details - View single complaint
    Route::get('/{id}', [ComplaintController::class, 'show']);
    // Returns: {complaint, comments[], attachments[], actions[], permissions}
    
    // Update Status - Change complaint status
    Route::put('/{id}/status', [ComplaintController::class, 'updateStatus']);
    // Body: {status, remarks}
    // Returns: {message, complaint}
    
    // Assign Complaint - Assign to staff member
    Route::put('/{id}/assign', [ComplaintController::class, 'assign']);
    // Body: {assigned_to, remarks}
    // Returns: {message, complaint}
    
    // Add Comment - Add internal or external comment
    Route::post('/{id}/comments', [ComplaintController::class, 'addComment']);
    // Body: {comment_text, is_internal}
    // Returns: {message, comment}
    
    // Send Help Desk Message - Send message from complaint context
    Route::post('/{id}/send-message', [ComplaintController::class, 'sendHelpDeskMessage']);
    // Body: {message, attach_to_complaint}
    // Returns: {message, chat_thread_id}
    
    // Link Chat Message - Link existing chat message to complaint
    Route::post('/{id}/link-message', [ComplaintController::class, 'linkChatMessage']);
    // Body: {message_id, link_type, notes}
    // Returns: {message, link}
});

// CHAT SYSTEM ROUTES
// Prefix: /api/chat

Route::prefix('chat')->group(function () {
    // List Threads - Get all chat threads for user
    Route::get('/threads', [ChatController::class, 'threads']);
    // Returns: {threads[], each with: last_message, unread_count, participants}
    
    // Create Thread - Start new conversation
    Route::post('/threads', [ChatController::class, 'createThread']);
    // Body: {thread_type, title, participant_ids[]}
    // Returns: {thread_id, message}
    
    // Get Messages - Fetch messages from thread (paginated)
    Route::get('/threads/{id}/messages', [ChatController::class, 'messages']);
    // Query: ?page=1
    // Returns: {messages[], thread, has_more, pagination}
    
    // Send Message - Send new message
    Route::post('/messages', [ChatController::class, 'sendMessage']);
    // Body: {thread_id, message_type, message_content, attachment, reply_to_message_id}
    // Returns: {message_id, message}
    
    // Mark as Read - Update read status
    Route::post('/messages/{id}/read', [ChatController::class, 'markRead']);
    // Returns: {message}
    
    // Upload Media - Upload file/image for chat
    Route::post('/upload', [ChatController::class, 'uploadMedia']);
    // Body: multipart/form-data with 'file' field
    // Returns: {file_path, file_name, file_size}
});
