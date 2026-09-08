# Chat API Quick Reference

## 🔐 Authentication
All endpoints require authentication via `api.token.auth` middleware.
Include token in request header: `Authorization: Bearer {token}`

---

## 📋 Thread Management

### GET `/api/chat/threads`
Get all chat threads for authenticated user.

**Response:**
```json
{
  "status": 1,
  "message": "Threads fetched successfully",
  "data": [
    {
      "thread_id": 1,
      "thread_type": "direct",
      "title": "John Doe",
      "avatar_url": "...",
      "last_message": {...},
      "unread_count": 5
    }
  ]
}
```

### POST `/api/chat/threads`
Create a 1-to-1 chat thread.

**Request:**
```json
{
  "recipient_id": "user123"
}
```

### POST `/api/chat/groups`
Create a group chat.

**Request:**
```json
{
  "group_name": "My Group",
  "member_ids": ["user1", "user2", "user3"]
}
```

---

## 💬 Messages

### GET `/api/chat/threads/{id}/messages`
Get messages for a thread.

**Query Params:**
- `page`: Page number (pagination)
- `after`: Get messages after this message_id (for real-time updates)

### POST `/api/chat/messages`
Send a text message.

**Request:**
```json
{
  "thread_id": 1,
  "recipient_id": "user123",
  "content": "Hello!",
  "message_type": "text",
  "localmsgid": "unique-client-id",
  "reply_to_message_id": 123
}
```

### POST `/api/chat/messages/{id}/read`
Mark message as read.

---

## 📎 File Upload

### POST `/api/chat/upload-media`
Upload a single media file with advanced processing.

**Request (multipart/form-data):**
```
file: [binary]
message_type: image|video|audio|document|file
message_id: 123 (optional - update existing message)
localmsgid: unique-client-id (optional)
filename: custom-name.jpg (optional)
```

**Response:**
```json
{
  "status": 1,
  "message": "File uploaded",
  "data": {
    "attachment": {
      "url": "https://...",
      "name": "upload_xyz.jpg",
      "originalName": "photo.jpg",
      "size": 12345,
      "mime": "image/jpeg",
      "width": 1920,
      "height": 1080,
      "thumb": "https://..."
    }
  }
}
```

### POST `/api/chat/send-attachment`
Send a message with attachment.

**Request:**
```json
{
  "recipient_id": "user123",
  "thread_id": 1,
  "message_type": "image",
  "attachment": {
    "url": "https://...",
    "mime": "image/jpeg",
    "size": 12345,
    "width": 1920,
    "height": 1080,
    "localmsgid": "unique-client-id"
  }
}
```

---

## 📦 Chunked Upload (Large Files)

### 1. POST `/api/chat/upload-chunk`
Upload file chunk by chunk.

**Request (multipart/form-data):**
```
chunk: [binary data]
fileName: video.mp4
chunkIndex: 0
totalChunks: 10
localmsgid: unique-upload-id
```

**Response:**
```json
{
  "status": 1,
  "message": "Chunk received successfully",
  "data": {
    "uploadId": "abc123",
    "chunkIndex": 0,
    "totalChunks": 10,
    "receivedChunks": 1,
    "isComplete": false,
    "progress": 10.00
  }
}
```

### 2. POST `/api/chat/finalize-upload`
Combine chunks into final file.

**Request:**
```json
{
  "fileName": "video.mp4",
  "localmsgid": "unique-upload-id"
}
```

**Response:**
```json
{
  "status": 1,
  "message": "File upload finalized",
  "data": {
    "attachment": {
      "url": "https://...",
      "size": 50000000,
      "mime": "video/mp4",
      ...
    },
    "message_type": "video"
  }
}
```

---

## 👤 User Status

### GET `/api/chat/user-status`
Get user's online/offline status.

**Query Params:**
- `user_id`: User ID to check

**Response:**
```json
{
  "status": 1,
  "message": "User status fetched",
  "data": {
    "is_online": true,
    "last_seen": "5 mins ago"
  }
}
```

### GET `/api/chat/user-profile`
Get user profile for chat.

**Query Params:**
- `user_id`: User ID

**Response:**
```json
{
  "status": 1,
  "message": "User profile fetched",
  "data": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar_url": "...",
    "is_online": true,
    "last_seen": "Online",
    "about": "Hey there!"
  }
}
```

### POST `/api/chat/offline`
Set current user as offline.

**Response:**
```json
{
  "status": 1,
  "message": "You are now offline"
}
```

---

## 📁 Supported File Types

| Type | Extensions | Max Size | Auto-Processing |
|------|-----------|----------|-----------------|
| **Image** | jpg, jpeg, png, gif, webp, heif, heic | 50MB | ✅ Auto-resize, thumbnail |
| **Video** | mp4, avi, mov, mkv, webm, 3gp, flv, wmv, m4v | 50MB | ✅ Thumbnail generation |
| **Audio** | mp3, wav, m4a, aac, ogg, flac, wma, opus | 50MB | ✅ Waveform thumbnail |
| **Voice** | aac, m4a, mp3, wav, ogg, opus, 3gp | 50MB | ✅ Waveform thumbnail |
| **Document** | pdf, doc, docx, xls, xlsx, txt, csv, ppt, pptx, rtf | 50MB | ✅ Metadata extraction |
| **File** | Any of the above | 50MB | Basic metadata |

---

## 🔄 Message Flow

### Sending a Message with File

#### Option 1: Single Request (Small Files)
1. Upload file: `POST /api/chat/upload-media`
2. Send attachment: `POST /api/chat/send-attachment` with attachment blob

#### Option 2: Chunked Upload (Large Files)
1. Split file into chunks on client
2. Upload each chunk: `POST /api/chat/upload-chunk`
3. Finalize upload: `POST /api/chat/finalize-upload`
4. Send attachment: `POST /api/chat/send-attachment` with attachment blob

#### Option 3: Async Pattern
1. Create placeholder message: `POST /api/chat/messages` with `status: 'uploading'`
2. Upload file: `POST /api/chat/upload-media` with `message_id`
3. Message automatically updated when upload completes

---

## 🚨 Error Responses

All errors follow this format:
```json
{
  "status": 0,
  "message": "Error description"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation error, missing params)
- `403` - Forbidden (no access to thread)
- `404` - Not Found (user/thread/message not found)
- `422` - Unprocessable Entity (validation failed)
- `500` - Server Error

---

## 💡 Best Practices

1. **Use `localmsgid`** - Always include unique client-generated ID to prevent duplicates
2. **Chunked uploads for large files** - Use chunk upload for files > 10MB
3. **Poll for new messages** - Use `after` param with last message_id
4. **Handle offline status** - Call `/offline` when app goes to background
5. **Validate file types** - Client-side validation before upload
6. **Show upload progress** - Track chunk upload progress for UX

---

## 🔍 Testing with cURL

### Create Thread
```bash
curl -X POST http://localhost/api/chat/threads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipient_id": "user123"}'
```

### Upload File
```bash
curl -X POST http://localhost/api/chat/upload-media \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "message_type=image"
```

### Send Message
```bash
curl -X POST http://localhost/api/chat/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": "user123",
    "content": "Hello World",
    "message_type": "text",
    "localmsgid": "abc123"
  }'
```

---

## 📊 Response Structure

All successful responses follow this structure:
```json
{
  "status": 1,           // 1 = success, 0 = error
  "message": "...",      // Human-readable message
  "data": {...}          // Response data (optional)
}
```
