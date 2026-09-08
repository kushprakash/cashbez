# CodeIgniter to Laravel Function Mapping

## Authentication & User Management

| CodeIgniter | Laravel | Notes |
|-------------|---------|-------|
| `$this->_auth()` | `$user = Auth::user()` | Built-in Laravel auth |
| `$this->validateToken($token)` | Removed | Handled by middleware |
| `$this->getUserFromToken()` | `Auth::user()` | Direct access |
| `$this->me` | `Auth::user()->id` | Current user ID |
| `member` table | `users` table | Database table |
| `member_id` column | `id` or `user_id` | Column naming |

## Request Handling

| CodeIgniter | Laravel | Notes |
|-------------|---------|-------|
| `$this->inputData` | `$request->all()` | Get all input |
| `$this->input->post('key')` | `$request->input('key')` | Get single input |
| `$this->input->get('key')` | `$request->query('key')` | Query params |
| `$_FILES['file']` | `$request->file('file')` | File uploads |
| `file_get_contents('php://input')` | `$request->getContent()` | Raw input |
| `json_decode($raw, true)` | `$request->json()->all()` | JSON input |

## Validation

| CodeIgniter | Laravel | Notes |
|-------------|---------|-------|
| `$this->validateInputs([...])` | `Validator::make($request->all(), [...])` | Built-in validation |
| Custom validation | `$validator->fails()` | Error checking |
| `throw new Exception('msg', 400)` | Same or validation exceptions | Error handling |

## Response

| CodeIgniter | Laravel | Notes |
|-------------|---------|-------|
| `$this->sendResponse(1, 'msg', $data)` | `$this->sendResponse(1, 'msg', $data)` | Kept same (trait) |
| `echo json_encode($response); exit;` | `return response()->json($response)` | Laravel way |
| `$this->respond(0, 'error')` | `$this->sendResponse(0, 'error')` | Standardized |
| `$this->handleError($e)` | `$this->handleError($e)` | Kept same (trait) |

## Database - Query Builder

| CodeIgniter | Laravel | Notes |
|-------------|---------|-------|
| `$this->db->insert('table', $data)` | `DB::table('table')->insert($data)` | Query builder |
| `$this->db->insert_id()` | `DB::table('table')->insertGetId($data)` | Get last insert ID |
| `$this->db->where('key', $val)` | `->where('key', $val)` | Where clause |
| `$this->db->get('table')` | `DB::table('table')->get()` | Get results |
| `$this->db->get()->row_array()` | `->first()` | Single row |
| `$this->db->get()->result_array()` | `->get()` | Multiple rows |
| `$this->db->update('table', $data)` | `DB::table('table')->update($data)` | Update |
| `$this->db->count_all_results()` | `->count()` | Count |
| `$this->db->join(...)` | `->join(...)` | Joins |
| `$this->db->order_by('field', 'DESC')` | `->orderBy('field', 'DESC')` | Ordering |
| `$this->db->limit(10)` | `->limit(10)` or `->take(10)` | Limit |

## Database - Eloquent Models

| CodeIgniter | Laravel Eloquent | Notes |
|-------------|------------------|-------|
| `$this->db->get_where('chat_messages', ['id' => $id])` | `ChatMessage::where('id', $id)->first()` | Find by condition |
| `$this->db->insert('chat_messages', $data)` | `ChatMessage::create($data)` | Insert |
| `$this->db->update('chat_messages', $data)` | `$message->update($data)` | Update |
| Manual joins | `->with(['sender', 'thread'])` | Eager loading |
| Complex queries | Model scopes and relationships | Cleaner code |

## Transactions

| CodeIgniter | Laravel | Notes |
|-------------|---------|-------|
| `$this->db->trans_start()` | `DB::beginTransaction()` | Start transaction |
| `$this->db->trans_complete()` | `DB::commit()` | Commit |
| `$this->db->trans_status()` | Try-catch block | Check status |
| N/A | `DB::rollBack()` | Rollback |

## File Operations

| CodeIgniter | Laravel | Notes |
|-------------|---------|-------|
| `FCPATH` | `public_path()` | Public directory |
| `APPPATH` | `app_path()` | App directory |
| `move_uploaded_file($tmp, $dest)` | `$file->storeAs($path, $name)` | Store file |
| Manual path building | `Storage::path()` | Storage paths |
| `base_url('uploads/...')` | `asset('storage/...')` | Public URLs |
| `mkdir($path, 0775, true)` | `Storage::makeDirectory($path)` | Create directory |
| `file_exists($path)` | `Storage::exists($path)` | Check existence |
| `unlink($file)` | `Storage::delete($file)` | Delete file |

## Date/Time

| CodeIgniter | Laravel | Notes |
|-------------|---------|-------|
| `date('Y-m-d H:i:s')` | `now()` or `Carbon::now()` | Current timestamp |
| `date('Y-m-d H:i:s', strtotime('-5 minutes'))` | `now()->subMinutes(5)` | Date manipulation |
| `strtotime($date)` | `Carbon::parse($date)` | Parse dates |

## Configuration

| CodeIgniter | Laravel | Notes |
|-------------|---------|-------|
| `$this->config->item('key')` | `config('app.key')` | Get config |
| `$this->load->model('Model_name')` | Model auto-loaded | No need to load |
| `$this->load->library('Library')` | Use service container | Dependency injection |

## Headers & CORS

| CodeIgniter | Laravel | Notes |
|-------------|---------|-------|
| `header('Access-Control-Allow-Origin: *')` | CORS middleware | Configured in middleware |
| `header('Content-Type: application/json')` | Automatic for JSON responses | Laravel handles |
| `$this->setHeaders()` | Middleware handles | No manual headers |

## Specific Chat Functions

### Thread Management

| CodeIgniter Method | Laravel Method | Location |
|-------------------|----------------|----------|
| `createChatThread()` | `createThread()` | ChatController |
| `createGroupChat()` | `createGroupChat()` | ChatController ✨ NEW |
| `threads()` | `threads()` | ChatController |
| `_directThread($a, $b)` | `getOrCreateDirectThread($a, $b)` | ChatController (private) |

### Messages

| CodeIgniter Method | Laravel Method | Location |
|-------------------|----------------|----------|
| `messages()` | `messages()` | ChatController |
| `sendMessage()` | `sendMessage()` | ChatController |
| `markRead()` | `markRead()` | ChatController |
| `sendAttachment()` | `sendAttachment()` | ChatController ✨ NEW |

### File Uploads

| CodeIgniter Method | Laravel Method | Location |
|-------------------|----------------|----------|
| `uploadMedia()` | `uploadMediaAdvanced()` | ChatController ✨ NEW |
| `uploadChunk()` | `uploadChunk()` | ChatController ✨ NEW |
| `finalizeUpload()` | `finalizeUpload()` | ChatController ✨ NEW |
| `uploadFileAdvanced()` | `uploadFileAdvanced()` | FileUploadTrait ✨ NEW |
| `_manageChunk()` | `_manageChunk()` | FileUploadTrait ✨ NEW |
| `_combineChunks()` | `_combineChunks()` | FileUploadTrait ✨ NEW |
| `_cleanupChunks()` | `_cleanupChunks()` | FileUploadTrait ✨ NEW |
| `_probeFile()` | `_probeFile()` | FileUploadTrait ✨ NEW |
| `_determineMessageType()` | `_determineMessageType()` | FileUploadTrait ✨ NEW |
| `_checkChunkStatus()` | `_checkChunkStatus()` | FileUploadTrait ✨ NEW |

### Image Processing

| CodeIgniter Method | Laravel Method | Location |
|-------------------|----------------|----------|
| `_sanitizeImageUpload()` | `_resizeImage()` | FileUploadTrait ✨ NEW |
| `_createDefaultVideoThumb()` | `_createDefaultVideoThumb()` | FileUploadTrait ✨ NEW |
| `_createAudioWaveformThumb()` | `_createAudioWaveformThumb()` | FileUploadTrait ✨ NEW |
| `_addGradientOverlay()` | `_addGradientOverlay()` | FileUploadTrait ✨ NEW |
| `_createFallbackThumbnail()` | `_createFallbackThumbnail()` | FileUploadTrait ✨ NEW |
| `_createFallbackWaveform()` | `_createFallbackWaveform()` | FileUploadTrait ✨ NEW |

### User Status

| CodeIgniter Method | Laravel Method | Location |
|-------------------|----------------|----------|
| `getUserStatus()` | `getUserStatus()` | ChatController ✨ NEW |
| `getUserProfile()` | `getUserProfile()` | ChatController ✨ NEW |
| `beOffline()` | `beOffline()` | ChatController ✨ NEW |

### Helpers

| CodeIgniter Method | Laravel Method | Location |
|-------------------|----------------|----------|
| `validateThreadAccess()` | `validateThreadAccess()` | ChatController (private) ✨ NEW |
| `_otherParticipant()` | Inline query in `threads()` | ChatController |
| `_hasRole()` | Check with participants relationship | Use Eloquent |

## Trait Organization

### ApiTrait (CodeIgniter) → ApiResponseTrait (Laravel)
```php
// CodeIgniter
trait ApiTrait {
    sendResponse()
    handleError()
    validateEncryptionKey()  // Removed - handled by middleware
    validateToken()          // Removed - handled by Auth
    getUserFromToken()       // Removed - use Auth::user()
}

// Laravel
trait ApiResponseTrait {
    sendResponse()           // ✅ Kept
    handleError()           // ✅ Kept
}
```

### UploadTraits (CodeIgniter) → FileUploadTrait (Laravel)
```php
// CodeIgniter
trait UploadTraits {
    uploadFileAdvanced()
    _probeFile()
    _createDefaultVideoThumb()
    _createAudioWaveformThumb()
    _sanitizeImageUpload()
    _manageChunk()
    _combineChunks()
    _cleanupChunks()
    _determineMessageType()
    _checkChunkStatus()
}

// Laravel  
trait FileUploadTrait {
    uploadFileAdvanced()        // ✅ Migrated
    _probeFile()               // ✅ Migrated
    _createDefaultVideoThumb()  // ✅ Migrated
    _createAudioWaveformThumb() // ✅ Migrated
    _resizeImage()             // ✅ New (replaces _sanitizeImageUpload)
    _manageChunk()             // ✅ Migrated
    _combineChunks()           // ✅ Migrated
    _cleanupChunks()           // ✅ Migrated
    _determineMessageType()    // ✅ Migrated
    _checkChunkStatus()        // ✅ Migrated
    _addGradientOverlay()      // ✅ Migrated
    _createFallbackThumbnail() // ✅ Migrated
    _createFallbackWaveform()  // ✅ Migrated
}
```

## Quick Migration Checklist

When migrating a CodeIgniter function to Laravel:

- [ ] Replace `$this->me` with `Auth::user()->id`
- [ ] Replace `$this->inputData` with `$request->all()`
- [ ] Replace `$this->db->...` with `DB::table()` or Eloquent
- [ ] Replace `member` with `users` table
- [ ] Replace `member_id` with `id` or `user_id`
- [ ] Replace `$this->sendResponse()` - already available via trait
- [ ] Replace file paths with Laravel storage helpers
- [ ] Remove manual token validation
- [ ] Use Laravel validation instead of custom validation
- [ ] Wrap DB operations in transactions when needed
- [ ] Return responses instead of echoing JSON

## Notes

✨ = New function added in Laravel migration
✅ = Successfully migrated
🔄 = Modified/adapted
❌ = Removed (no longer needed)
