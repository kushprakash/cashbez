# Quick Start Guide - Complaint & Chat Module

## 🚀 Getting Started (5 Minutes)

### Step 1: Add API Routes
Open `routes/api.php` and add:
```php
// Copy from ROUTES_TO_ADD.php
```

### Step 2: Run Database Migrations (if needed)
```bash
php artisan migrate
```

### Step 3: Test Backend
```bash
# Start Laravel server
php artisan serve

# Test complaint dashboard endpoint
curl -H "Token: YOUR_TOKEN" http://localhost:8000/api/complaints/dashboard
```

### Step 4: Install Frontend Dependencies
```bash
npm install chart.js react-chartjs-2 date-fns
```

### Step 5: Update React Router
Add these routes to your router:
```javascript
<Route path="/complaints/dashboard" element={<ComplaintDashboard />} />
<Route path="/complaints/list" element={<ComplaintsList />} />
```

### Step 6: Start Vite Dev Server
```bash
npm run dev
```

### Step 7: Access the Application
Navigate to:
- http://localhost:3000/complaints/dashboard
- http://localhost:3000/complaints/list

---

## 📁 File Locations

### Backend Files
```
app/
├── Http/Controllers/Api/
│   ├── ComplaintController.php ✅
│   └── ChatController.php ✅
└── Models/
    ├── Complaint.php ✅
    ├── ComplaintComment.php ✅
    ├── ComplaintAttachment.php ✅
    ├── ComplaintAction.php ✅
    ├── ComplaintChatLink.php ✅
    ├── ChatThread.php ✅
    ├── ChatThreadParticipant.php ✅
    ├── ChatMessage.php ✅
    ├── ChatMessageReceipt.php ✅
    └── ChatAttachment.php ✅
```

### Frontend Files
```
resources/js/
├── services/
│   ├── complaintService.js ✅
│   └── chatService.js ✅
├── pages/complaints/
│   ├── ComplaintDashboard.jsx ✅ (was chat_analytics.jsx)
│   └── ComplaintsList.jsx ✅
└── support/chat/
    └── chat_analytics.jsx ✅ (now ComplaintDashboard)
```

---

## 🔑 API Endpoints Reference

### Complaints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/complaints/dashboard` | Dashboard data |
| GET | `/api/complaints` | List all complaints |
| POST | `/api/complaints` | Create complaint |
| GET | `/api/complaints/{id}` | View complaint |
| PUT | `/api/complaints/{id}/status` | Update status |
| PUT | `/api/complaints/{id}/assign` | Assign complaint |
| POST | `/api/complaints/{id}/comments` | Add comment |
| POST | `/api/complaints/{id}/send-message` | Send message |
| POST | `/api/complaints/{id}/link-message` | Link message |
| GET | `/api/complaints/workload-report` | Workload stats |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/threads` | List threads |
| POST | `/api/chat/threads` | Create thread |
| GET | `/api/chat/threads/{id}/messages` | Get messages |
| POST | `/api/chat/messages` | Send message |
| POST | `/api/chat/messages/{id}/read` | Mark as read |
| POST | `/api/chat/upload` | Upload file |

---

## 💡 Usage Examples

### Create a Complaint
```javascript
import complaintService from '@/services/complaintService';

const createComplaint = async () => {
    try {
        const response = await complaintService.createComplaint({
            user_id: '123',
            title: 'Transaction Issue',
            description: 'Payment not received',
            category: 'TRANSACTION',
            priority: 'HIGH',
        });
        
        if (response.status === 1) {
            console.log('Complaint created:', response.data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
```

### Send Chat Message
```javascript
import chatService from '@/services/chatService';

const sendMessage = async () => {
    try {
        const response = await chatService.sendMessage({
            thread_id: 'thread_123',
            content: 'Hello, how can I help?',
            message_type: 'text'
        });
        
        if (response.status === 1) {
            console.log('Message sent:', response.data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
```

### Update Complaint Status
```javascript
import complaintService from '@/services/complaintService';

const updateStatus = async (complaintId) => {
    try {
        const response = await complaintService.updateStatus(
            complaintId,
            'RESOLVED',
            'Issue resolved successfully'
        );
        
        if (response.status === 1) {
            console.log('Status updated:', response.data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
```

---

## 🎨 Component Usage

### Dashboard Component
```javascript
import ComplaintDashboard from '@/pages/complaints/ComplaintDashboard';

<Route path="/complaints/dashboard" element={<ComplaintDashboard />} />
```

### List Component
```javascript
import ComplaintsList from '@/pages/complaints/ComplaintsList';

<Route path="/complaints/list" element={<ComplaintsList />} />
```

---

## 🐛 Troubleshooting

### Issue: "Invalid Token" Error
**Solution:** Make sure Token header is set in ApiService
```javascript
headers: {
    'Token': 'YOUR_TOKEN_HERE'
}
```

### Issue: CORS Error
**Solution:** Add CORS middleware in Laravel
```php
// config/cors.php
'paths' => ['api/*'],
'allowed_methods' => ['*'],
'allowed_origins' => ['*'],
```

### Issue: File Upload Fails
**Solution:** Check max upload size in php.ini
```ini
upload_max_filesize = 50M
post_max_size = 50M
```

### Issue: Database Error
**Solution:** Run migrations
```bash
php artisan migrate:fresh
```

---

## 📊 Database Tables

Required tables:
- `complaints`
- `complaint_comments`
- `complaint_attachments`
- `complaint_actions`
- `complaint_chat_links`
- `chat_threads`
- `chat_thread_participants`
- `chat_messages`
- `chat_message_receipts`
- `chat_attachments`
- `users`

---

## 🔐 Authentication

All API endpoints require authentication via Token header:
```javascript
headers: {
    'Token': user.remember_token
}
```

Roles supported:
- SuperAdmin (role = 1)
- Admin/CoreCommittee (role = 2)
- HelpDesk (role = 3)
- Others (role > 3)

---

## 📝 Next Steps

1. **Complete remaining components:**
   - CreateComplaint.jsx
   - ViewComplaint.jsx
   - HelpDeskChat.jsx
   - WorkloadReport.jsx

2. **Add real-time features:**
   - WebSocket integration
   - Push notifications
   - Live updates

3. **Testing:**
   - Unit tests
   - Integration tests
   - End-to-end tests

4. **Optimization:**
   - Code splitting
   - Lazy loading
   - Caching

5. **Documentation:**
   - API documentation
   - Component documentation
   - User guide

---

## 🎯 Key Features

✅ Complete RESTful API
✅ Role-based access control
✅ Auto-assignment
✅ File uploads
✅ Chat integration
✅ Audit trail
✅ Real-time notifications (ready)
✅ Responsive UI
✅ Data tables with filters
✅ Dashboard with charts

---

## 📞 Support

For questions or issues:
1. Check CONVERSION_SUMMARY.md
2. Review inline code comments
3. Check Laravel/React documentation
4. Review similar components (users module)

---

**Last Updated:** October 30, 2025
**Status:** 75% Complete
**Estimated Time to Complete:** 2-3 days
