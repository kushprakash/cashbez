<?php
defined('BASEPATH') or exit('No direct script access allowed');
require_once(APPPATH . 'controllers/Message/Message_Controller.php');
require_once(APPPATH . 'controllers/AndroidApplicationApi/PapagApp/traits/ApiTrait.php');
require_once(APPPATH . 'controllers/AndroidApplicationApi/PapagApp/traits/UploadTraits.php');

/**
 * Chat API  –  CodeIgniter 3.x
 *
 *  GET    /Chat/threads
 *  GET    /Chat/messages            ?thread_id=&page=
 *  POST   /Chat/sendMessage
 *  POST   /Chat/markRead
 *  POST   /Chat/requestPayment
 *  POST   /Chat/sendPayment
 *  POST   /Chat/uploadMedia
 *
 *  Group-chat extras (v2 schema)
 *  POST   /Chat/updateGroupMeta
 *  POST   /Chat/changeRole
 *  POST   /Chat/addMembers
 *  POST   /Chat/kickMember
 *
 *  Soft-delete
 *  POST   /Chat/softDeleteMessage
 *  POST   /Chat/softDeleteThread
 */
class Chat extends Message_Controller
{
    use ApiTrait;
    use UploadTraits;

    /** @var string */
    private $me;          // current user_id (set in _auth)

    const PAGE_SIZE = 30;

    public function __construct()
    {
        parent::__construct();
        $this->initializeApi();
        $this->_auth();                 // validates token + EncryptionKey
    }

    /*────────────────────────── CREATE 1-TO-1 THREAD ─────────────────────────*/

    /** POST /Chat/createChatThread
     *  Body: { recipient_id : "<other user_id>" }
     *  – Returns an existing direct-chat thread if it already exists, otherwise
     *    creates one atomically and returns the new thread_id.
     */
    public function createChatThread()
    {
        try {
            $in = $this->inputData;

            $this->validateInputs([
                'recipient_id' => $in['recipient_id'] ?? null
            ]);

            $recipientId = (string) $in['recipient_id'];
            if ($recipientId === $this->me)
                throw new Exception('Cannot start a chat with yourself', 400);

            // helper already used by sendMessage() – safe & idempotent
            $threadId = $this->_directThread($this->me, $recipientId);

            $this->sendResponse(1, 'Thread ready.', [
                'thread_id' => $threadId
            ]);

        } catch (Exception $e) { $this->handleError($e); }
    }

    /*────────────────────────── CREATE GROUP CHAT ───────────────────────────*/

    /** POST /Chat/createGroupChat
     *  Body: { group_name : "My Friends", user_ids : ["23","42","57"] }
     *  – Creates a brand-new group room, adds every supplied member **plus**
     *    the current user (as owner), and returns the new thread_id.
     */
    public function createGroupChat()
    {
        try {
            $in = $this->inputData;
            $this->validateInputs([
                'group_name' => $in['group_name'] ?? null,
                'user_ids' => $in['user_ids'] ?? null
            ]);

            $title = trim($in['group_name']);
            $members = is_array($in['user_ids']) ? array_unique($in['user_ids']) : [];

            if ($title === '')
                throw new Exception('group_name required', 400);
            if (count($members) < 2)
                throw new Exception('Select at least two members', 400);

            // ensure the creator is also a participant
            if (!in_array($this->me, $members, true)) {
                $members[] = $this->me;
            }

            $now = date('Y-m-d H:i:s');

            /* ---------- create thread + participants in one transaction ---------- */
            $this->db->trans_start();

            $this->db->insert('chat_threads', [
                'thread_type' => 'group',
                'title'       => $title,
                'owner_id'    => $this->me,
                'created_at'  => $now,
                'updated_at'  => $now
            ]);
            $threadId = $this->db->insert_id();

            $batch = [];
            foreach ($members as $uid) {
                $batch[] = [
                    'thread_id'  => $threadId,
                    'user_id'  => $uid,
                    'role'       => ($uid === $this->me ? 'owner' : 'users'),
                    'joined_at'  => $now
                ];
            }
            $this->db->insert_batch('chat_thread_participants', $batch);

            $this->db->trans_complete();
            if (!$this->db->trans_status())
                throw new Exception('Database error while creating group', 500);

            $this->sendResponse(1, 'Group created.', [
                'thread_id' => $threadId
            ]);

        } catch (Exception $e) { $this->handleError($e); }
    }


/*────────────────────────── THREAD LIST ──────────────────────────*/

    /** GET /Chat/threads */
    public function threads()
    {
        try {
            $userId = $this->me;

            /* all threads the user belongs to, newest first */
            $threads = $this->db
                ->select('ct.thread_id,
                          ct.thread_type,
                          ct.title,
                          ct.avatar_url,
                          ct.updated_at,
                          ct.last_message_id')
                ->from('chat_threads ct')
                ->join('chat_thread_participants p',
                       'p.thread_id = ct.thread_id')
                ->where('p.user_id', $userId)
                ->where('ct.deleted_at IS NULL')
                ->order_by('ct.updated_at', 'DESC')
                ->get()->result_array();

            $result = [];
            foreach ($threads as $t) {

                // last message preview & time (may be NULL if empty room)
                $preview  = '';
                $previewT = $t['updated_at'];
                if ($t['last_message_id']) {
                    $last = $this->db
                            ->select('message_type, content, created_at')
                            ->where('message_id', $t['last_message_id'])
                            ->get('chat_messages')->row_array();
                    if ($last) {
                        $previewT = $last['created_at'];
                        $preview  = $last['message_type'] === 'text'
                            ? $last['content']
                            : '[' . ucfirst($last['message_type']) . ']';
                    }
                }

                // unread count for current user
                $unread = $this->db
                    ->from('chat_messages m')
                    ->join('chat_message_receipts r',
                           "r.message_id = m.message_id
                            AND r.user_id = ".$this->db->escape($userId), 'left')
                    ->where('m.thread_id', $t['thread_id'])
                    ->where('m.sender_id !=', $userId)
                    ->group_start()
                        ->where('r.status IS NULL')
                        ->or_where('r.status !=','read')
                    ->group_end()
                    ->count_all_results();

                /* name / avatar depends on room message_type */
                if ($t['thread_type'] === 'direct') {
                    $other = $this->_otherParticipant($t['thread_id'], $userId);
                    $displayName = $other['name'] ?? 'User '.$other['user_id'];
                    $avatarUrl   = $other['avatar_url'] ? base_url("Uploads/MemberDocument/" .$other['avatar_url']) : '';
                    $isOnline    = (bool)($other['is_online'] ?? false);
                    $otherId     = $other['user_id'];
                } else { // group / support / broadcast
                    $displayName = $t['title'] ?: 'Group '.$t['thread_id'];
                    $avatarUrl   = $t['avatar_url'] ? base_url("Uploads/MemberDocument/" .$t['avatar_url']) : '';
                    $isOnline    = false;
                    $otherId     = null;
                }

                $result[] = [
                    'thread_id'       => $t['thread_id'],
                    'name'            => $displayName,
                    'avatarUrl'       => $avatarUrl,
                    'lastMessage'     => $preview,
                    'lastMessageTime' => $previewT,
                    'unreadCount'     => (int)$unread,
                    'isOnline'        => $isOnline,
                    'thread_type'     => $t['thread_type'],
                    'other_user_id'   => $otherId
                ];
            }

            $this->sendResponse(1,'Recent chats fetched.',$result);

        } catch (Exception $e) {
            $this->handleError($e);
        }
    }

/*────────────────────────── MESSAGE LIST ─────────────────────────*/

    /** GET /Chat/messages */
    public function messages() {
        try {
            $threadId = (int) $this->input->get('thread_id');
            if (!$threadId) throw new Exception('thread_id required', 400);

            $after = (int) $this->input->get('after');
            $before = (int) $this->input->get('before');
            $limit = (int) $this->input->get('limit') ?: self::PAGE_SIZE;
            $page = max(1, (int) $this->input->get('page'));
            
            $this->validateThreadAccess($threadId, $this->me);

            $query = $this->db->from('chat_messages')
                ->where('thread_id', $threadId)
                ->where('deleted_at IS NULL');

            if ($after) {
                // Get messages newer than $after (for real-time updates)
                $query->where('message_id >', $after)
                      ->order_by('message_id', 'ASC');
                
                $msgs = $query->get()->result_array();
            } 
            else if ($before) {
                // Get messages older than $before (for pagination when scrolling up)
                $query->where('message_id <', $before)
                      ->order_by('message_id', 'DESC')
                      ->limit($limit);
                
                $msgs = $query->get()->result_array();
                
                // Reverse to maintain chronological order (oldest first)
                $msgs = array_reverse($msgs);
            } 
            else {
                // Default behavior: get latest messages (first page)
                // Display newest messages at the bottom like WhatsApp
                $query->order_by('message_id', 'DESC')
                      ->limit($limit);
                
                $msgs = $query->get()->result_array();
                
                // Reverse to get newest at the end (bottom of chat)
                $msgs = array_reverse($msgs);
            }

            if (empty($msgs)) {
                return $this->sendResponse(1, 'OK', []); // empty list
            }

            // Process statuses, mark as delivered
            foreach ($msgs as &$m) {
                $m['status'] = 'sent';

                if ($m['sender_id'] != $this->me) {
                    $rec = $this->db->get_where('chat_message_receipts', [
                        'message_id' => $m['message_id'],
                        'user_id' => $this->me
                    ])->row_array();

                    if (!$rec) {
                        // Mark as delivered when messages are fetched
                        $this->db->insert('chat_message_receipts', [
                            'message_id' => $m['message_id'],
                            'user_id' => $this->me,
                            'status' => 'delivered',
                            'updated_at' => date('Y-m-d H:i:s')
                        ]);
                        $m['status'] = 'delivered';
                    } else {
                        $m['status'] = $rec['status'];
                    }
                } else {
                    // For messages sent by current user, check if they were read by others
                    $notRead = $this->db
                        ->from('chat_thread_participants p')
                        ->join('chat_message_receipts r',
                            "r.message_id = " . $m['message_id'] . "
                            AND r.user_id = p.user_id
                            AND r.status = 'read'", 'left')
                        ->where('p.thread_id', $threadId)
                        ->where('p.user_id !=', $this->me)
                        ->where('r.status IS NULL')
                        ->count_all_results();
                    
                    // If all participants have read the message, show as read
                    $m['status'] = $notRead ? 'delivered' : 'read';
                }
            }
            unset($m);

            $this->sendResponse(1, 'Messages fetched.', $msgs);

        } catch (Exception $e) {
            $this->handleError($e);
        }
    }

/*────────────────────────── SEND MESSAGE ─────────────────────────*/

    /** POST /Chat/sendMessage */
    public function sendMessage()
    {
        try {
            $in = $this->inputData;
            $this->validateInputs([
                'recipient_id' => $in['recipient_id'] ?? null,
                'message_type' => $in['message_type'] ?? null,
                'content'      => $in['content'] ?? '',
                'thread_id'    => $in['thread_id'] ?? 0,
                'localmsgid'   => $in['localmsgid'] ?? null
            ]);

            $recipientId = (string) $in['recipient_id'];
            $message_type = $in['message_type'];
            $content     = $in['content'] ?? '';
            $localmsgid  = $in['localmsgid'];

            if (!$localmsgid) {
                throw new Exception('localmsgid is required', 400);
            }

            if ($recipientId === $this->me)
                throw new Exception('Cannot message yourself', 400);

            // Check for duplicate message using localmsgid
            $existingMsg = $this->db
                ->select('message_id, thread_id, created_at')
                ->where("JSON_EXTRACT(metadata, '$.localmsgid') = ", $localmsgid)
                ->get('chat_messages')
                ->row_array();

            // If message already exists with this localmsgid, return it instead of creating a duplicate
            if ($existingMsg) {
                return $this->sendResponse(1, 'Message already sent.', [
                    'message_id' => $existingMsg['message_id'],
                    'thread_id'  => $existingMsg['thread_id'],
                    'timestamp'  => $existingMsg['created_at'],
                    'status'     => 'sent'
                ]);
            }

            // Validate thread access if thread_id is provided
            $threadId = $in['thread_id'] ?? $this->_directThread($this->me, $recipientId);
            if (isset($in['thread_id'])) {
                $this->validateThreadAccess($threadId, $this->me);
            }

            $now = date('Y-m-d H:i:s');
            
            $this->db->trans_start();
            $this->db->insert('chat_messages', [
                'thread_id'    => $threadId,
                'sender_id'    => $this->me,
                'message_type' => $message_type,
                'content'      => $content,
                'metadata'     => json_encode(['localmsgid' => $localmsgid]),
                'created_at'   => $now
            ]);
            $msgId = $this->db->insert_id();
            // bump thread
            $this->db->where('thread_id', $threadId)
                     ->update('chat_threads', [
                         'last_message_id' => $msgId,
                         'updated_at'      => $now
                     ]);
            $this->db->trans_complete();
            if (!$this->db->trans_status())
                throw new Exception('DB error', 500);

            $this->sendResponse(1, 'Message sent.', [
                'message_id' => $msgId,
                'thread_id'  => $threadId,
                'timestamp'  => $now,
                'status'     => 'sent'
            ]);

        } catch (Exception $e) { $this->handleError($e); }
    }

/*────────────────────────── MARK READ ───────────────────────────*/

    /** POST /Chat/markRead */
    public function markRead()
    {
        try {
            $threadId = (int)$this->inputData['thread_id'] ?? 0;
            if (!$threadId) throw new Exception('thread_id required',400);
            $this->validateThreadAccess($threadId,$this->me);

            // unread messages by others
            $ids = $this->db->select('m.message_id')
                    ->from('chat_messages m')
                    ->where('m.thread_id',$threadId)
                    ->where('m.sender_id !=',$this->me)
                    ->join('chat_message_receipts r',
                           "r.message_id = m.message_id
                            AND r.user_id = ".$this->db->escape($this->me)
                           ,'left',false)
                    ->where("(r.status IS NULL OR r.status!='read')",null,false)
                    ->get()->result_array();

            if ($ids) {
                foreach ($ids as $row) {
                    $this->db->replace('chat_message_receipts',[
                        'message_id'=>$row['message_id'],
                        'user_id' =>$this->me,
                        'status'    =>'read',
                        'updated_at'=>date('Y-m-d H:i:s')
                    ]);
                }
            }
            
            // Get the updated unread count
            $unread = $this->db
                ->from('chat_messages m')
                ->join('chat_message_receipts r',
                       "r.message_id = m.message_id
                        AND r.user_id = ".$this->db->escape($this->me), 'left')
                ->where('m.thread_id', $threadId)
                ->where('m.sender_id !=', $this->me)
                ->group_start()
                    ->where('r.status IS NULL')
                    ->or_where('r.status !=','read')
                ->group_end()
                ->count_all_results();
            
            $this->sendResponse(1, 'Marked as read.', [
                'unread_count' => (int)$unread,
                'thread_id' => $threadId
            ]);
        } catch (Exception $e) { $this->handleError($e); }
    }

/*────────────────────────── PAYMENT REQUEST ─────────────────────*/

    /** POST /Chat/requestPayment */
    public function requestPayment()
    {
        try {
            $in = $this->inputData;
            $this->validateInputs([
                'recipient_id'=>$in['recipient_id']??null,
                'amount'      =>$in['amount']??null
            ]);

            $recipientId = (string)$in['recipient_id'];
            $amount      = (float)$in['amount'];
            $threadId    = $this->_directThread($this->me,$recipientId);

            $reqId   = $this->db->insert('chat_payment_requests',[
                'message_id'   =>0,      // temp
                'sender_id'    =>$this->me,
                'recipient_id' =>$recipientId,
                'amount'       =>$amount
            ])->insert_id();

            $now = date('Y-m-d H:i:s');
            $content = number_format($amount,2,'.','').'|'.$reqId.'|pending';
            $meta = json_encode([
                'amount'=>$amount,
                'requestId'=>$reqId,
                'senderName'=>$this->me,
                'recipientId'=>$recipientId,
                'status'=>'pending'
            ]);

            $this->db->insert('chat_messages',[
                'thread_id'=>$threadId,
                'sender_id'=>$this->me,
                'message_type'=>'paymentRequest',
                'content'=>$content,
                'metadata'=>$meta,
                'created_at'=>$now
            ]);
            $msgId = $this->db->insert_id();

            $this->db->where('request_id',$reqId)
                     ->update('chat_payment_requests',['message_id'=>$msgId]);

            $this->db->where('thread_id',$threadId)
                     ->update('chat_threads',[
                         'last_message_id'=>$msgId,
                         'updated_at'=>$now
                     ]);

            $this->sendResponse(1,'Request sent.',[
                'thread_id'=>$threadId,
                'message_id'=>$msgId,
                'request_id'=>$reqId,
                'amount'=>$amount
            ]);

        } catch (Exception $e) { $this->handleError($e); }
    }

/*────────────────────────── SEND PAYMENT ────────────────────────*/

    /** POST /Chat/sendPayment */
    public function sendPayment()
    {
        try {
            $in = $this->inputData;
            $this->validateInputs([
                'thread_id'  =>$in['thread_id']??null,
                'request_id' =>$in['request_id']??null,
                'amount'     =>$in['amount']??null
            ]);
            $threadId = (int)$in['thread_id'];
            $reqId    = (int)$in['request_id'];
            $amount   = (float)$in['amount'];

            $this->validateThreadAccess($threadId,$this->me);

            // check request exists & pending
            $req = $this->db->get_where('chat_payment_requests',[
                'request_id'=>$reqId,
                'status'    =>'pending'
            ])->row_array();
            if (!$req) throw new Exception('Request not pending',400);

            /* do wallet / gateway logic here … */

            // mark request
            $this->db->update('chat_payment_requests',[
                'status'      =>'accepted',
                'responded_at'=>date('Y-m-d H:i:s')
            ],['request_id'=>$reqId]);

            // confirmation message
            $now = date('Y-m-d H:i:s');
            $txnId = $this->db->insert('chat_payments',[
                'request_id'  =>$reqId,
                'message_id'  =>0,
                'sender_id'   =>$this->me,
                'recipient_id'=>$req['sender_id'],
                'amount'      =>$amount,
                'status'      =>'completed'
            ])->insert_id();

            $meta = json_encode([
                'amount'=>$amount,
                'transactionId'=>$txnId,
                'senderName'=>$this->me,
                'recipientId'=>$req['sender_id']
            ]);

            $this->db->insert('chat_messages',[
                'thread_id'=>$threadId,
                'sender_id'=>$this->me,
                'message_type'=>'payment',
                'content'=>'Payment of ₹'.number_format($amount,2).' sent.',
                'metadata'=>$meta,
                'created_at'=>$now
            ]);
            $msgId = $this->db->insert_id();

            $this->db->where('txn_id',$txnId)
                     ->update('chat_payments',['message_id'=>$msgId]);

            $this->db->where('thread_id',$threadId)
                     ->update('chat_threads',[
                         'last_message_id'=>$msgId,
                         'updated_at'=>$now
                     ]);

            $this->sendResponse(1,'Payment complete.',[
                'transaction_id'=>$txnId,
                'message_id'    =>$msgId
            ]);

        } catch (Exception $e) { $this->handleError($e); }
    }

/*────────────────────────── GROUP-CHAT HELPERS ──────────────────*/
  /* =========================================================
       Group-chat meta & role management
       =======================================================*/

    public function updateGroupMeta_post()
    {
        $in = json_decode($this->input->raw_input_stream, true);
        $tid = (int)$in['thread_id'];
        unset($in['thread_id']);

        // only owners / admins
        if (!$this->_hasRole($tid,['admin','owner']))
            $this->respond(0,'not allowed');

        $allowed = ['title','topic','description','avatar_url'];
        $set = array_intersect_key($in, array_flip($allowed));
        if (!$set) $this->respond(0,'nothing to update');

        $this->db->where('thread_id',$tid)->update('chat_threads',$set);
        $this->respond(1,'updated');
    }

    public function changeRole_post()
    {
        $tid  = (int)$this->input->post('thread_id');
        $uid  = $this->input->post('user_id');
        $role = $this->input->post('role'); // member/moderator/admin

        if (!$this->_hasRole($tid,['owner']))
            $this->respond(0,'only owner can change roles');

        $this->db->where(['thread_id'=>$tid,'user_id'=>$uid])
                 ->update('chat_thread_participants',['role'=>$role]);
        $this->respond(1,'role updated');
    }

    public function addMembers_post()
    {
        $tid = (int)$this->input->post('thread_id');
        $ids = $this->input->post('users');         // array of user_id

        if (!$this->_hasRole($tid,['admin','owner','moderator']))
            $this->respond(0,'not allowed');

        foreach ($ids as $uid)
            $this->db->replace('chat_thread_participants', [
                'thread_id'  => $tid,
                'user_id'  => $uid,
                'role'       => 'users',
                'invited_by' => $this->me,
                'invited_at' => date('Y-m-d H:i:s')
            ]);
        $this->respond(1,'users added');
    }

    public function kickMember_post()
    {
        $tid = (int)$this->input->post('thread_id');
        $uid = $this->input->post('user_id');

        if (!$this->_hasRole($tid,['admin','owner']))
            $this->respond(0,'not allowed');

        $this->db->where(['thread_id'=>$tid,'user_id'=>$uid])
                 ->update('chat_thread_participants',[
                     'removed_by'=>$this->me,
                     'left_at'   => date('Y-m-d H:i:s')
                 ]);
        $this->respond(1,'users removed');
    }

    /* =========================================================
       Soft-delete
       =======================================================*/

    public function softDeleteMessage_post()
    {
        $msgId = $this->input->post('message_id');
        if (!$msgId) $this->respond(0,'message_id required');

        $this->db->set('deleted_at','NOW()',false)
                 ->where(['message_id'=>$msgId,'sender_id'=>$this->me])
                 ->update('chat_messages');
        $this->respond(1,'message hidden');
    }

    public function softDeleteThread_post()
    {
        $tid = $this->input->post('thread_id');
        if (!$tid) $this->respond(0,'thread_id required');

        // only owner/admin
        if (!$this->_hasRole($tid,['admin','owner']))
            $this->respond(0,'not allowed');

        $this->db->set('deleted_at','NOW()',false)
                 ->where('thread_id',$tid)->update('chat_threads');
        $this->respond(1,'thread archived');
    }

      /* *****************************************************************
       SECTION 1 – FILE UPLOAD + ATTACHMENT PIPELINE
    *******************************************************************/

    /** POST /Chat/uploadMedia  (multipart)
     *  – Uploads raw file only, returns uniform "blob" with metadata.
     *  – Enhanced to support async upload pattern with message_id
     */
    public function uploadMedia()
    {
        try {
            if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
                throw new Exception('No valid file uploaded', 400);
            }

            $message_type = $this->input->post('message_type') ?: 'file';
            $message_id = $this->input->post('message_id') ?: null;
            $localmsgid = $this->input->post('localmsgid') ?: null;

            // Define type mapping for different media types with allowed extensions and directories
            $type_map = [
                'image'    => ['ext' => ['gif', 'jpg', 'jpeg', 'png', 'webp', 'heif', 'heic'], 'dir' => 'images/'],
                'video'    => ['ext' => ['mp4', 'avi', 'mov', 'mkv', 'webm', '3gp', 'flv', 'wmv', 'm4v'], 'dir' => 'videos/'],
                'audio'    => ['ext' => ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'wma', 'opus'], 'dir' => 'audio/'],
                'voice'    => ['ext' => ['aac', 'm4a', 'mp3', 'wav', 'ogg', 'opus', '3gp'], 'dir' => 'audio/'],
                'document' => ['ext' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv', 'ppt', 'pptx', 'rtf'], 'dir' => 'docs/'],
                'file'     => ['ext' => ['gif', 'jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx', 'mp4', 'mp3', 'aac', 'txt'], 'dir' => 'misc/']
            ];
            
            if (!isset($type_map[$message_type])) $message_type = 'file';
            
            // Additional options for uploadFileAdvanced
            $options = [
                'validateMime' => true
            ];
            
            // Add resize options for images
            if ($message_type === 'image') {
                $options['resize'] = [
                    'keepAspectRatio'   => true, // Maintain aspect ratio
                    'width' => 1200,     // Max width to scale down large images
                    'height' => 1200     // Max height to scale down large images
                ];
            }
            
            // Generate a unique filename if none provided
            if ($this->input->post('filename')) {
                $options['rename'] = $this->input->post('filename');
            }
            
            // Use the uploadFileAdvanced method from UploadTraits
            $blob = $this->uploadFileAdvanced('file', $message_type, $type_map, $options);
            
            // If localmsgid was provided, store it in the blob for tracking
            if ($localmsgid) {
                $blob['localmsgid'] = $localmsgid;
            }
            
            // If message_id is provided, update the existing message with the new media URL and details
            if ($message_id) {
                $this->db->trans_start();
                
                // First check if the message exists and belongs to the current user
                $message = $this->db
                    ->select('thread_id, message_type, metadata')
                    ->where('message_id', $message_id)
                    ->where('sender_id', $this->me)
                    ->get('chat_messages')
                    ->row_array();
                
                if ($message) {
                    // Parse existing metadata
                    $existingMeta = json_decode($message['metadata'] ?? '{}', true);
                    
                    // Update the message content with the URL
                    $this->db->where('message_id', $message_id)
                        ->update('chat_messages', [
                            'content' => $blob['url'],
                            'status' => 'sent',
                            'metadata' => json_encode(array_merge($existingMeta, $blob))
                        ]);
                    
                    // Also add/update attachment record
                    $this->db->replace('chat_attachments', [
                        'message_id' => $message_id,
                        'file_url' => $blob['url'],
                        'mime_type' => $blob['mime'],
                        'file_size' => $blob['size'],
                        'width' => $blob['width'],
                        'height' => $blob['height'],
                        'duration_sec' => $blob['duration'],
                        'thumbnail_url' => $blob['thumb']
                    ]);
                    
                    $this->db->trans_complete();
                    
                    // Return the updated message along with the attachment blob
                    if ($this->db->trans_status()) {
                        // Get the updated message
                        $updated_message = $this->db
                            ->where('message_id', $message_id)
                            ->get('chat_messages')
                            ->row_array();
                        
                        return $this->sendResponse(1, 'File uploaded and message updated.', [
                            'attachment' => $blob,
                            'message' => $updated_message,
                            'message_id' => $message_id,
                            'thread_id' => $message['thread_id']
                        ]);
                    }
                }
            }

            return $this->sendResponse(1, 'File uploaded.', ['attachment' => $blob]);

        } catch (Exception $e) { $this->handleError($e); }
    }

    /** POST /Chat/sendAttachment
     *  Body: { thread_id, recipient_id, attachment: {url,mime, …}, message_type }
     *  Enhanced to support async media upload pattern with thumbnails and status updates
     */
    public function sendAttachment()
    {
        $this->db->trans_start();
        try {
            $in = json_decode($this->input->raw_input_stream, true);

            /* ---- validate ---- */
            $this->validateInputs([
                'recipient_id'   => $in['recipient_id'] ?? null,
                'attachment'     => $in['attachment']  ?? null,
                'message_type'   => $in['message_type'] ?? null
            ]);

            $recipientId = (string)$in['recipient_id'];
            $message_type = $in['message_type'];                     // image / video …
            $att = $in['attachment'];                                // associative array
            $localmsgid = $att['localmsgid'] ?? null;                // Client-generated ID for tracking
            $status = $in['status'] ?? 'sent';                       // Default to 'sent', can be 'uploading'
            
            if ($recipientId === $this->me)
                throw new Exception('Cannot message yourself', 400);
                
            // If localmsgid is provided, check for duplicate messages to prevent double-sending
            if ($localmsgid) {
                $existingMsg = $this->db
                    ->select('message_id, thread_id, created_at')
                    ->where("JSON_EXTRACT(metadata, '$.localmsgid') = ", $localmsgid)
                    ->get('chat_messages')
                    ->row_array();
                    
                // If message already exists with this localmsgid, return it instead of creating a duplicate
                if ($existingMsg) {
                    // Get the complete message data to return
                    $chat_message = $this->db
                        ->where('message_id', $existingMsg['message_id'])
                        ->get('chat_messages')
                        ->row_array();
                        
                    return $this->sendResponse(1, 'Message already exists.', [
                        'thread_id'  => $existingMsg['thread_id'],
                        'message_id' => $existingMsg['message_id'],
                        'message'    => $chat_message
                    ]);
                }
            }

            // either direct thread OR supplied thread_id must be accessible
            $threadId = isset($in['thread_id'])
                      ? (int)$in['thread_id']
                      : $this->_directThread($this->me, $recipientId);

            if (isset($in['thread_id']))
                $this->validateThreadAccess($threadId, $this->me);

            $now = date('Y-m-d H:i:s');

            // Process thumbnail data if present
            $thumbnailUrl = null;
            if (isset($att['thumbnail_data']) && !empty($att['thumbnail_data'])) {
                // Store the base64 image data in the metadata to be sent back to client
                // but don't save it separately as a file (to save space)
                $thumbnailUrl = $att['thumb'] ?? null;
            }

            // Create metadata including all attachment properties
            $metadata = $att;
            
            /** 1️⃣ insert into chat_messages */
            $this->db->insert('chat_messages', [
                'thread_id'     => $threadId,
                'sender_id'     => $this->me,
                'message_type'  => $message_type,
                'content'       => $att['url'],      // preview uses this
                'metadata'      => json_encode($metadata),
                'status'        => $status,
                'created_at'    => $now
            ]);
            $msgId = $this->db->insert_id();

            /** 2️⃣ insert into chat_attachments */
            $this->db->insert('chat_attachments', [
                'message_id'    => $msgId,
                'file_url'      => $att['url'],
                'mime_type'     => $att['mime'] ?? '',
                'file_size'     => $att['size'] ?? 0,
                'width'         => $att['width'] ?? null,
                'height'        => $att['height'] ?? null,
                'duration_sec'  => $att['duration'] ?? null,
                'thumbnail_url' => $thumbnailUrl
            ]);

            /** 3️⃣ bump thread */
            $this->db->where('thread_id', $threadId)
                     ->update('chat_threads', [
                         'last_message_id' => $msgId,
                         'updated_at'      => $now
                     ]);

            $this->db->trans_complete();
            if (!$this->db->trans_status())
                throw new Exception('DB error', 500);

            // get complete message row to return to client
            $chat_message = $this->db
                ->where('message_id', $msgId)
                ->get('chat_messages')
                ->row_array();

            return $this->sendResponse(1, 'Attachment sent.', [
                'thread_id'  => $threadId,
                'message_id' => $msgId,
                'message'    => $chat_message
            ]);

        } catch (Exception $e) {
            $this->db->trans_rollback();
            $this->handleError($e);
        }
    }

    /** POST /Chat/uploadChunk (multipart)
     *  Handle an individual chunk of a large file upload.
     *  Stores the chunk temporarily and keeps track of progress.
     */
    public function uploadChunk()
    {
        try {
            if (!isset($_FILES['chunk']) || $_FILES['chunk']['error'] !== UPLOAD_ERR_OK) {
                throw new Exception('No valid file chunk uploaded', 400);
            }

            // Required parameters
            $fileName = $this->input->post('fileName');
            $chunkIndex = (int)$this->input->post('chunkIndex');
            $totalChunks = (int)$this->input->post('totalChunks');
            $localmsgid = $this->input->post('localmsgid');

            if (!$fileName || !$localmsgid || $chunkIndex < 0 || $totalChunks <= 0) {
                throw new Exception('Missing required parameters', 400);
            }

            // Create a unique upload identifier for this file
            $uploadId = md5($localmsgid . $fileName);
            
            // Get chunk data
            $chunkData = file_get_contents($_FILES['chunk']['tmp_name']);
            if ($chunkData === false) {
                throw new Exception('Failed to read chunk data', 500);
            }
            
            // Use the helper method to handle the chunk
            $result = $this->_manageChunk(
                $chunkData,
                $uploadId,
                $chunkIndex,
                $totalChunks,
                $fileName
            );
            
            // Respond with success and progress info
            $this->sendResponse(1, 'Chunk received successfully', $result);

        } catch (Exception $e) {
            $this->handleError($e);
        }
    }

    /** POST /Chat/finalizeUpload
     *  Combines all chunks into a final file after upload is complete.
     *  Takes the file type into consideration and processes accordingly.
     */
    public function finalizeUpload()
    {
        try {
            $in = $this->inputData;
            $this->validateInputs([
                'fileName' => $in['fileName'] ?? null,
                'localmsgid' => $in['localmsgid'] ?? null
            ]);

            $fileName = $in['fileName'];
            $localmsgid = $in['localmsgid'];
            
            // Create upload ID consistent with uploadChunk
            $uploadId = md5($localmsgid . $fileName);
            
            // Check chunk status to verify upload is complete
            $status = $this->_checkChunkStatus($uploadId);
            
            if (!$status['exists']) {
                throw new Exception('Upload not found or expired', 400);
            }
            
            if (!$status['isComplete']) {
                throw new Exception("Incomplete upload: {$status['receivedChunks']}/{$status['totalChunks']} chunks received", 400);
            }
            
            // Determine file type based on extension
            $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            $message_type = $this->_determineMessageType($ext);
            
            // Define type mapping for different media types with directories
            $type_map = [
                'image'    => ['ext' => ['gif', 'jpg', 'jpeg', 'png', 'webp', 'heif', 'heic'], 'dir' => 'images/'],
                'video'    => ['ext' => ['mp4', 'avi', 'mov', 'mkv', 'webm', '3gp', 'flv', 'wmv', 'm4v'], 'dir' => 'videos/'],
                'audio'    => ['ext' => ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'wma', 'opus'], 'dir' => 'audio/'],
                'voice'    => ['ext' => ['aac', 'm4a', 'mp3', 'wav', 'ogg', 'opus', '3gp'], 'dir' => 'audio/'],
                'document' => ['ext' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv', 'ppt', 'pptx', 'rtf'], 'dir' => 'docs/'],
                'file'     => ['ext' => ['gif', 'jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx', 'mp4', 'mp3', 'aac', 'txt'], 'dir' => 'misc/']
            ];
            
            // Build final file path
            $finalFileName = uniqid('upload_') . ".{$ext}";
            $dirName = trim($type_map[$message_type]['dir'], '/\\');
            $uploadDir = rtrim(FCPATH, '/\\') . "/uploads/chat/{$dirName}/";
            $relDir = "uploads/chat/{$dirName}/";
            
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0775, true);
            }
            
            $finalFilePath = $uploadDir . $finalFileName;
            
            // Use the helper method to combine chunks
            $result = $this->_combineChunks($uploadId, $finalFilePath);
            
            // Generate the file metadata blob
            $rel_url = $relDir . $finalFileName;
            $blob = [
                'url'      => base_url(''). $rel_url,
                'name'     => $finalFileName,
                'originalName' => $fileName,
                'size'     => $result['size'],
                'mime'     => $result['mime'],
                'width'    => null,
                'height'   => null,
                'duration' => null,
                'thumb'    => null,
                'localmsgid' => $localmsgid
            ];
            
            // Probe for more metadata based on file type
            if (in_array($message_type, ['image','video','audio','voice','document'], true)) {
                $probe = $this->_probeFile($finalFilePath, $message_type);
                $blob = array_merge($blob, $probe);
            }
            
            // Clean up chunks after successful processing
            $this->_cleanupChunks($uploadId);
            
            // Return the attachment blob
            $this->sendResponse(1, 'File upload finalized', [
                'attachment' => $blob,
                'message_type' => $message_type
            ]);
            
        } catch (Exception $e) {
            $this->handleError($e);
        }
    }
    
    /** 
     * Helper to determine message_type from file extension 
     */
    private function _determineMessageType($extension) {
        $extension = strtolower($extension);
        
        // Image formats
        if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heif', 'heic'])) {
            return 'image';
        }
        
        // Video formats
        if (in_array($extension, ['mp4', 'avi', 'mov', 'mkv', 'webm', '3gp', 'flv', 'wmv', 'm4v'])) {
            return 'video';
        }
        
        // Audio formats
        if (in_array($extension, ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'wma', 'opus'])) {
            return 'audio';
        }
        
        // Document formats
        if (in_array($extension, ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv', 'ppt', 'pptx', 'rtf'])) {
            return 'document';
        }
        
        // Default type for unknown extensions
        return 'file';
    }
    
    /**
     * Clean up temporary chunks after successful upload
     */
    private function _cleanupChunks($chunksDir) {
        if (!is_dir($chunksDir)) {
            return;
        }
        
        // Read all files in directory
        $files = scandir($chunksDir);
        foreach ($files as $file) {
            if ($file != '.' && $file != '..') {
                unlink($chunksDir . $file);
            }
        }
        
        // Try to remove the directory
        rmdir($chunksDir);
    }

    /** GET /Chat/getUserStatus */
    public function getUserStatus() {
        try {
            $userId = $this->input->get('user_id');
            if (!$userId) throw new Exception('user_id required', 400);

            // Define the threshold for considering a user online (5 minutes)
            $onlineThreshold = date('Y-m-d H:i:s', strtotime('-5 minutes'));
            
            // Get user data including online status and last active time
            $user = $this->db
                ->select('user_id, name, is_online, last_active')
                ->where('user_id', $userId)
                ->get('users')
                ->row_array();
                
            if (!$user) {
                throw new Exception('User not found', 404);
            }
            
            // User is considered online if:
            // 1. Their is_online flag is set to 1 (manually set when they login)
            // 2. Their last_active timestamp is within the threshold
            $isOnline = ($user['is_online'] == 1 && $user['last_active'] >= $onlineThreshold);
            
            // Format last seen time for display
            $lastSeen = null;
            if (!$isOnline && !empty($user['last_active'])) {
                $lastActive = strtotime($user['last_active']);
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
            
            $this->sendResponse(1, 'User status fetched', [
                'is_online' => $isOnline,
                'last_seen' => $lastSeen
            ]);
            
        } catch (Exception $e) {
            $this->handleError($e);
        }
    }

    /** GET /Chat/getUserProfile
     * Get user profile information for display in profile screen
     */
    public function getUserProfile()
    {
        try {
            $userId = $this->input->get('user_id');
            if (!$userId) throw new Exception('user_id required', 400);

            // Get detailed profile information
            $user = $this->db
                ->select('m.user_id, m.name, m.email, m.mobile, m.member_image AS avatar_url, 
                          m.is_online, m.last_active, m.about_me AS about')
                ->from('users m')
                ->where('m.user_id', $userId)
                ->get()
                ->row_array();
                
            if (!$user) {
                throw new Exception('User not found', 404);
            }

            // Format profile image URL if exists
            if (!empty($user['avatar_url'])) {
                $user['avatar_url'] = base_url("Uploads/MemberDocument/" . $user['avatar_url']);
            }
            
            // Calculate online status
            $onlineThreshold = date('Y-m-d H:i:s', strtotime('-5 minutes'));
            $user['is_online'] = ($user['is_online'] == 1 && $user['last_active'] >= $onlineThreshold) ? true : false;
            
            // Format last seen time
            if (!$user['is_online'] && !empty($user['last_active'])) {
                $lastActive = strtotime($user['last_active']);
                $now = time();
                $diff = $now - $lastActive;
                
                if ($diff < 60) {
                    $user['last_seen'] = "just now";
                } elseif ($diff < 3600) {
                    $mins = floor($diff / 60);
                    $user['last_seen'] = $mins . " " . ($mins == 1 ? "min" : "mins") . " ago";
                } elseif ($diff < 86400) {
                    $hours = floor($diff / 3600);
                    $user['last_seen'] = $hours . " " . ($hours == 1 ? "hour" : "hours") . " ago";
                } elseif ($diff < 172800) {
                    $user['last_seen'] = "yesterday";
                } else {
                    $user['last_seen'] = date('d M Y', $lastActive);
                }
            } else {
                $user['last_seen'] = $user['is_online'] ? "Online" : "Unknown";
            }
            
            $this->sendResponse(1, 'User profile fetched', $user);
            
        } catch (Exception $e) {
            $this->handleError($e);
        }
    }

    /** POST /Chat/blockUser
     * Block a user to prevent them from sending messages
     */
    public function blockUser()
    {
        try {
            $in = $this->inputData;
            $this->validateInputs([
                'user_id' => $in['user_id'] ?? null
            ]);
            
            $blockedUserId = $in['user_id'];
            
            if ($blockedUserId === $this->me) {
                throw new Exception('Cannot block yourself', 400);
            }

            // Check if already blocked
            $existing = $this->db
                ->where('blocker_id', $this->me)
                ->where('blocked_id', $blockedUserId)
                ->get('chat_blocked_users')
                ->row_array();
                
            if ($existing) {
                // Already blocked, just confirm
                return $this->sendResponse(1, 'User is already blocked');
            }
            
            // Add to blocked users table
            $now = date('Y-m-d H:i:s');
            $this->db->insert('chat_blocked_users', [
                'blocker_id' => $this->me,
                'blocked_id' => $blockedUserId,
                'created_at' => $now,
            ]);
            
            // Optional: Find and close any direct thread between these users
            $thread = $this->db
                ->select('ct.thread_id')
                ->from('chat_threads ct')
                ->where('ct.thread_type', 'direct')
                ->join('chat_thread_participants p1', 'p1.thread_id = ct.thread_id')
                ->join('chat_thread_participants p2', 'p2.thread_id = ct.thread_id')
                ->where('p1.user_id', $this->me)
                ->where('p2.user_id', $blockedUserId)
                ->get()
                ->row_array();
                
            if ($thread) {
                $threadId = $thread['thread_id'];
                
                // Add a system message about blocking
                $this->db->insert('chat_messages', [
                    'thread_id' => $threadId,
                    'sender_id' => 'system',
                    'message_type' => 'system',
                    'content' => 'You blocked this user',
                    'created_at' => $now
                ]);
                
                // Update the thread with the system message
                $msgId = $this->db->insert_id();
                $this->db->where('thread_id', $threadId)
                    ->update('chat_threads', [
                        'last_message_id' => $msgId,
                        'updated_at' => $now
                    ]);
            }
            
            $this->sendResponse(1, 'User blocked successfully');
            
        } catch (Exception $e) {
            $this->handleError($e);
        }
    }

    /* =========================================================
       Helpers
       =======================================================*/
/*────────────────────────── INTERNAL HELPERS ───────────────────*/

    private function _auth()
    {
        $this->validateEncryptionKey(
            $this->input->get_request_header('EncryptionKey', true)
        );
        $user = $this->getUserFromToken();
        if (!$user) $this->respond(0,'invalid token');
        $this->me = $user['user_id'];
    }

    public function beOffline()
    {
        try {
            $memberId = $this->me;

            if (!$memberId) {
                return $this->sendError('Authentication failed');
            }

            $this->db->where('user_id', $memberId)
                    ->update('users', [
                        'is_online' => 0,
                        'last_active' => date('Y-m-d H:i:s') // Update exit time too
                    ]);

            return $this->sendResponse(1, 'You are now offline');
        } catch (Exception $e) {
            return $this->handleError($e);
        }
    }


    /** direct chat – returns existing thread_id or creates one */
    private function _directThread(string $uidA, string $uidB): int
    {
        // look-up: a thread of message_type 'direct' that has exactly these two members
        $sub = $this->db->select('thread_id')
            ->from('chat_thread_participants')
            ->where_in('user_id', [$uidA,$uidB])
            ->group_by('thread_id')
            ->having('COUNT(*)',2)
            ->get_compiled_select();

        $row = $this->db->query(
                "SELECT ct.thread_id
                   FROM chat_threads ct
                  WHERE ct.thread_type = 'direct'
                    AND ct.thread_id IN ($sub)
                  LIMIT 1")->row_array();
        if ($row) return (int)$row['thread_id'];

        // create new thread + participants
        $this->db->trans_start();
        $this->db->insert('chat_threads',[
            'thread_type'=>'direct',
            'updated_at'=>date('Y-m-d H:i:s')
        ]);
        $tid = $this->db->insert_id();
        $this->db->insert_batch('chat_thread_participants',[
            ['thread_id'=>$tid,'user_id'=>$uidA,'role'=>'users','joined_at'=>date('Y-m-d H:i:s')],
            ['thread_id'=>$tid,'user_id'=>$uidB,'role'=>'users','joined_at'=>date('Y-m-d H:i:s')]
        ]);
        $this->db->trans_complete();
        return $tid;
    }

    /** ensure current user is in thread, return thread record as array */
    private function validateThreadAccess(int $threadId, string $memberId): array
    {
        $thread = $this->db
            ->select('ct.*')
            ->from('chat_threads ct')
            ->join('chat_thread_participants p','p.thread_id = ct.thread_id')
            ->where('ct.thread_id',$threadId)
            ->where('p.user_id',$memberId)
            ->where('ct.deleted_at IS NULL')
            ->get()->row_array();
        if (!$thread)
            throw new Exception('Thread not found or no access',403);
        return $thread;
    }

    /** fetch the "other user" row for a direct chat */
    private function _otherParticipant(int $threadId, string $me)
    {
        $onlineThreshold = date('Y-m-d H:i:s', strtotime('-5 minutes'));

        $this->db->select('m.user_id, m.name, m.member_image AS avatar_url, m.last_active, m.is_online')
                ->from('chat_thread_participants p')
                ->join('users m', 'm.user_id = p.user_id')
                ->where('p.thread_id', $threadId)
                ->where('p.user_id !=', $me)
                ->limit(1);

        $user = $this->db->get()->row_array();

        if (!$user) return null;

        // Final decision: user is online if (manual is_online == 1) AND (last_active within threshold)
        $user['is_online'] = ($user['is_online'] == 1 && $user['last_active'] >= $onlineThreshold) ? 1 : 0;

        return $user;
    }

    /** check role */
    private function _hasRole(int $threadId,array $roles): bool
    {
        return $this->db
            ->where('thread_id',$threadId)
            ->where('user_id',$this->me)
            ->where_in('role',$roles)
            ->count_all_results('chat_thread_participants')>0;
    }
}