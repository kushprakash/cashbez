<?php
defined('BASEPATH') or exit('No direct script access allowed');

class ComplaintManager extends CI_Controller
{
    private $admin;
    private $helpdesk_user_id = '21'; // HELP DESK user_id for chatting

    /*************** Start Session Authoriesed *************************/
    public function __construct()
    {
        parent::__construct();
        date_default_timezone_set('Asia/Kolkata');

        $this->load->database();
        $this->load->helper(['url', 'form', 'string']);
        $this->load->library(['session', 'form_validation', 'upload']);
        $this->load->model('Common_model');

        $this->admin = $this->session->userdata('admin');
        if (empty($this->admin)) {
            $this->session->set_flashdata('msg', 'Your Session Has Been Expired');
            redirect(base_url(''). 'Login/Main/index');
        }

  
        // Set form validation error delimiters
        $this->form_validation->set_error_delimiters('<p class="invalid-feedback">', '</p>');
    }
    /*************** End Session Authoriesed *************************/

    /**
     * Apply role-based filtering to complaint queries
     */
    private function applyRoleBasedFilter()
    {
        $role = $this->admin['user_role'];
        $user_code = $this->admin['user_code'];

        switch ($role) {
            case 'SuperAdmin':
                // SuperAdmin can see all complaints
                break;
            case 'CoreCommittee':
                $this->db->group_start();
                $this->db->where('complaints.assigned_to', $user_code);
                $this->db->or_where('complaints.created_by', $user_code);
                $this->db->or_where('complaints.category IN ("BILLING", "TRANSACTION")');
                $this->db->group_end();
                break;
            case 'HelpDesk':
                $this->db->group_start();
                $this->db->where('complaints.assigned_to', $user_code);
                $this->db->or_where('complaints.created_by', $user_code);
                $this->db->or_where('complaints.status', 'NEW');
                $this->db->group_end();
                break;
            case 'Branch':
                // Get users under this branch
                $this->db->group_start();
                $this->db->where('complaints.assigned_to', $user_code);
                $this->db->or_where('complaints.created_by', $user_code);
                $this->db->or_join('users', 'users.user_id = complaints.user_id');
                $this->db->or_where('users.BC', $user_code);
                $this->db->group_end();
                break;
            case 'Agent':
                // Get users under this agent
                $this->db->group_start();
                $this->db->where('complaints.assigned_to', $user_code);
                $this->db->or_where('complaints.created_by', $user_code);
                $this->db->or_join('users', 'users.user_id = complaints.user_id');
                $this->db->or_where('users.AC', $user_code);
                $this->db->group_end();
                break;
            default:
                $this->db->where('complaints.created_by', $user_code);
                break;
        }
    }

    /**
     * Main Complaint Dashboard
     */
    public function index()
    {
        $data['MainMenu'] = "ComplaintManager";
        $data['SubMenu'] = "Dashboard";
        $data['title'] = "Complaint Management Dashboard";
        $data['role'] = $this->admin['user_role'];
        $data['admin'] = $this->admin;

        // Get complaint statistics
        $data['stats'] = $this->getComplaintStats();

        // Get recent complaints (last 10)
        $this->db->select('complaints.*, users.name as users_name');
        $this->db->from('complaints');
        $this->db->join('users', 'users.user_id = complaints.user_id', 'left');
        $this->db->where('complaints.deleted_at IS NULL');
        $this->applyRoleBasedFilter();
        $this->db->order_by('complaints.created_on', 'DESC');
        $this->db->limit(10);
        $data['recent_complaints'] = $this->db->get()->result_array();

        // Get pending actions count
        $data['pending_actions'] = $this->getPendingActionsCount();

        // Get workload statistics for display
        $data['workload_stats'] = $this->getWorkloadStats();

        $this->load->view('ComplaintManagement/Dashboard', $data);
    }

    /**
     * List all complaints with filters
     */
    public function ComplaintsList()
    {
        $data['MainMenu'] = "ComplaintManager";
        $data['SubMenu'] = "ComplaintsList";
        $data['title'] = "All Complaints";
        $data['role'] = $this->admin['user_role'];
        $data['admin'] = $this->admin;

        // Handle filters
        $status_filter = $this->input->get('status');
        $category_filter = $this->input->get('category');
        $priority_filter = $this->input->get('priority');
        $assigned_filter = $this->input->get('assigned_to');
        $date_from = $this->input->get('date_from');
        $date_to = $this->input->get('date_to');

        $this->db->select('complaints.*, users.name as users_name, users.mobile_no');
        $this->db->from('complaints');
        $this->db->join('users', 'users.user_id = complaints.user_id', 'left');
        $this->db->where('complaints.deleted_at IS NULL');

        // Apply filters
        if (!empty($status_filter)) {
            $this->db->where('complaints.status', $status_filter);
        }
        if (!empty($category_filter)) {
            $this->db->where('complaints.category', $category_filter);
        }
        if (!empty($priority_filter)) {
            $this->db->where('complaints.priority', $priority_filter);
        }
        if (!empty($assigned_filter)) {
            $this->db->where('complaints.assigned_to', $assigned_filter);
        }
        if (!empty($date_from)) {
            $this->db->where('DATE(complaints.created_on) >=', $date_from);
        }
        if (!empty($date_to)) {
            $this->db->where('DATE(complaints.created_on) <=', $date_to);
        }

        $this->applyRoleBasedFilter();
        $this->db->order_by('complaints.created_on', 'DESC');

        $data['complaints'] = $this->db->get()->result_array();
        $data['complaint_count'] = count($data['complaints']);

        // Get filter options
        $data['categories'] = $this->getComplaintCategories();
        $data['assignees'] = $this->getAssignees();
        $data['filters'] = [
            'status' => $status_filter,
            'category' => $category_filter,
            'priority' => $priority_filter,
            'assigned_to' => $assigned_filter,
            'date_from' => $date_from,
            'date_to' => $date_to
        ];

        $this->load->view('ComplaintManagement/ComplaintsList', $data);
    }

    /**
     * Create new complaint
     */
    public function CreateComplaint()
    {
        $data['MainMenu'] = "ComplaintManager";
        $data['SubMenu'] = "CreateComplaint";
        $data['title'] = "Create New Complaint";
        $data['role'] = $this->admin['user_role'];
        $data['admin'] = $this->admin;

        if ($this->input->post()) {
            $this->form_validation->set_rules('user_id', 'users ID', 'required|trim');
            $this->form_validation->set_rules('title', 'Title', 'required|trim|max_length[255]');
            $this->form_validation->set_rules('description', 'Description', 'required|trim');
            $this->form_validation->set_rules('category', 'Category', 'required|trim');
            $this->form_validation->set_rules('priority', 'Priority', 'required|trim');

            if ($this->form_validation->run() == TRUE) {
                // Generate unique complaint ID
                $complaint_id = $this->generateComplaintId();

                // Prepare complaint data
                $complaint_data = [
                    'complaint_id' => $complaint_id,
                    'user_id' => $this->input->post('user_id'),
                    'title' => $this->input->post('title'),
                    'description' => $this->input->post('description'),
                    'category' => $this->input->post('category'),
                    'priority' => $this->input->post('priority'),
                    'status' => 'NEW',
                    'txn_ac_number' => $this->input->post('txn_ac_number'),
                    'typeofac' => $this->input->post('typeofac'),
                    'created_by' => $this->admin['user_code'],
                    'created_on' => date('Y-m-d H:i:s')
                ];

                // Auto-assign based on rules
                $assigned_to = $this->getAutoAssignee($complaint_data['category'], $complaint_data['priority']);
                if ($assigned_to) {
                    $complaint_data['assigned_to'] = $assigned_to;
                    $complaint_data['assigned_by'] = $this->admin['user_code'];
                    $complaint_data['assigned_at'] = date('Y-m-d H:i:s');
                    $complaint_data['status'] = 'ASSIGNED';
                }

                // Insert complaint
                $this->db->insert('complaints', $complaint_data);

                // Log the creation action
                $this->logComplaintAction($complaint_id, 'CREATE', null, $complaint_data['status'], null, $assigned_to, 'Complaint created');

                // If assigned, log assignment action
                if ($assigned_to) {
                    $this->logComplaintAction($complaint_id, 'ASSIGN', 'NEW', 'ASSIGNED', null, $assigned_to, 'Auto-assigned based on category and priority');
                }

                // Handle file uploads
                $this->handleFileUploads($complaint_id);

                // Create or link chat thread
                $thread_id = $this->createOrLinkChatThread($complaint_id, $complaint_data['user_id']);

                // Send initial complaint registration notification
                $this->sendComplaintNotification($complaint_id, 'CREATED', $complaint_data['user_id']);

                $this->session->set_flashdata('success', 'Complaint created successfully with ID: ' . $complaint_id);
                redirect(base_url(''). 'ComplaintManagement/ComplaintManager/ViewComplaint/' . $complaint_id);
            }
        }

        // Get form data
        $data['categories'] = $this->getComplaintCategories();
        $data['assignees'] = $this->getAssignees();

        $this->load->view('ComplaintManagement/CreateComplaint', $data);
    }

    /**
     * View complaint details
     */
    public function ViewComplaint($complaint_id = null)
    {
        if (empty($complaint_id)) {
            $this->session->set_flashdata('error', 'Invalid complaint ID');
            redirect(base_url(''). 'ComplaintManagement/ComplaintManager');
        }

        $data['MainMenu'] = "ComplaintManager";
        $data['SubMenu'] = "ViewComplaint";
        $data['title'] = "Complaint Details";
        $data['role'] = $this->admin['user_role'];
        $data['admin'] = $this->admin;

        // Get complaint details
        $this->db->select('complaints.*, users.id as m_id, users.name as users_name, users.mobile_no, users.email');
        $this->db->from('complaints');
        $this->db->join('users', 'users.user_id = complaints.user_id', 'left');
        $this->db->where('complaints.complaint_id', $complaint_id);
        $this->db->where('complaints.deleted_at IS NULL');
        $this->applyRoleBasedFilter();

        $complaint_query = $this->db->get();

        if ($complaint_query->num_rows() == 0) {
            $this->session->set_flashdata('error', 'Complaint not found or access denied');
            redirect(base_url(''). 'ComplaintManagement/ComplaintManager');
        }

        $data['complaint'] = $complaint_query->row_array();

        // Get complaint actions/timeline
        $this->db->select('*');
        $this->db->from('complaint_actions');
        $this->db->where('complaint_id', $complaint_id);
        $this->db->order_by('timestamp', 'ASC');
        $data['actions'] = $this->db->get()->result_array();

        // Get complaint attachments
        $this->db->select('*');
        $this->db->from('complaint_attachments');
        $this->db->where('complaint_id', $complaint_id);
        $this->db->where('deleted_at IS NULL');
        $this->db->order_by('uploaded_at', 'ASC');
        $data['attachments'] = $this->db->get()->result_array();

        // Get chat messages if chat thread exists
        if (!empty($data['complaint']['chat_thread_id'])) {
            $data['chat_messages'] = $this->getChatMessages($data['complaint']['chat_thread_id']);

            // Get linked chat messages for this complaint
            $this->db->select('ccl.*, cm.content, cm.message_type, cm.created_at as message_created_at, cm.sender_id, m.name as sender_name');
            $this->db->from('complaint_chat_links ccl');
            $this->db->join('chat_messages cm', 'cm.message_id = ccl.message_id');
            $this->db->join('users m', 'm.user_id = cm.sender_id', 'left');
            $this->db->where('ccl.complaint_id', $complaint_id);
            $this->db->order_by('cm.created_at', 'ASC');
            $data['linked_chat_messages'] = $this->db->get()->result_array();

            // Get chat attachments for linked messages
            foreach ($data['linked_chat_messages'] as &$linked_msg) {
                $this->db->select('*');
                $this->db->from('chat_attachments');
                $this->db->where('message_id', $linked_msg['message_id']);
                $linked_msg['attachments'] = $this->db->get()->result_array();
            }
        } else {
            $data['chat_messages'] = [];
            $data['linked_chat_messages'] = [];
        }

        // Check permissions
        $data['can_edit'] = $this->canEditComplaint($data['complaint']);
        $data['can_assign'] = $this->canAssignComplaint($data['complaint']);
        $data['can_resolve'] = $this->canResolveComplaint($data['complaint']);

        // Get form data for actions
        $data['assignees'] = $this->getAssignees();
        $data['categories'] = $this->getComplaintCategories();

        $this->load->view('ComplaintManagement/ViewComplaint', $data);
    }

    /**
     * Update complaint status
     */
    public function UpdateStatus()
    {
        if ($this->input->post()) {
            $complaint_id = $this->input->post('complaint_id');
            $new_status = $this->input->post('new_status');
            $remarks = $this->input->post('remarks');
            $resolution_summary = $this->input->post('resolution_summary');

            // Get current complaint data
            $current_complaint = $this->db->get_where('complaints', ['complaint_id' => $complaint_id])->row_array();

            if (!$current_complaint) {
                echo json_encode(['success' => false, 'message' => 'Complaint not found']);
                return;
            }

            // Check permissions
            if (!$this->canEditComplaint($current_complaint)) {
                echo json_encode(['success' => false, 'message' => 'Access denied']);
                return;
            }

            $old_status = $current_complaint['status'];

            // Prepare update data
            $update_data = ['status' => $new_status];

            if ($new_status == 'RESOLVED') {
                $update_data['resolved_at'] = date('Y-m-d H:i:s');
                if (!empty($resolution_summary)) {
                    $update_data['resolution_summary'] = $resolution_summary;
                }
            } elseif ($new_status == 'CLOSED') {
                $update_data['closed_at'] = date('Y-m-d H:i:s');
                if (!empty($resolution_summary)) {
                    $update_data['resolution_summary'] = $resolution_summary;
                }
            }

            // Update complaint
            $this->db->where('complaint_id', $complaint_id);
            $success = $this->db->update('complaints', $update_data);

            if ($success) {
                // Log action
                $this->logComplaintAction($complaint_id, 'STATUS_UPDATE', $old_status, $new_status, null, null, $remarks);

                // Send appropriate chat notification for status update
                if ($new_status == 'RESOLVED') {
                    $this->sendComplaintNotification($complaint_id, 'RESOLVED', $current_complaint['user_id']);
                } elseif ($new_status == 'CLOSED') {
                    $this->sendComplaintNotification($complaint_id, 'CLOSED', $current_complaint['user_id']);
                } else {
                    $this->sendComplaintNotification($complaint_id, 'STATUS_UPDATE', $current_complaint['user_id'], $new_status);
                }

                echo json_encode(['success' => true, 'message' => 'Status updated successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to update status']);
            }
        }
    }

    /**
     * Assign complaint to user
     */
    public function AssignComplaint()
    {
        if ($this->input->post()) {
            $complaint_id = $this->input->post('complaint_id');
            $assign_to = $this->input->post('assign_to');
            $remarks = $this->input->post('remarks');

            // Get current complaint data
            $current_complaint = $this->db->get_where('complaints', ['complaint_id' => $complaint_id])->row_array();

            if (!$current_complaint) {
                echo json_encode(['success' => false, 'message' => 'Complaint not found']);
                return;
            }

            // Check permissions
            if (!$this->canAssignComplaint($current_complaint)) {
                echo json_encode(['success' => false, 'message' => 'Access denied']);
                return;
            }

            $old_assigned_to = $current_complaint['assigned_to'];
            $old_status = $current_complaint['status'];
            $new_status = ($old_status == 'NEW') ? 'ASSIGNED' : $old_status;

            // Update complaint
            $update_data = [
                'assigned_to' => $assign_to,
                'assigned_by' => $this->admin['user_code'],
                'assigned_at' => date('Y-m-d H:i:s'),
                'status' => $new_status
            ];

            $this->db->where('complaint_id', $complaint_id);
            $success = $this->db->update('complaints', $update_data);

            if ($success) {
                // Log action
                $this->logComplaintAction($complaint_id, 'ASSIGN', $old_status, $new_status, $old_assigned_to, $assign_to, $remarks);

                // Send chat notification for assignment
                $this->sendComplaintNotification($complaint_id, 'ASSIGNED', $current_complaint['user_id'], null, $assign_to);

                echo json_encode(['success' => true, 'message' => 'Complaint assigned successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to assign complaint']);
            }
        }
    }

    /**
     * Add comment to complaint
     */
    public function AddComment()
    {
        if ($this->input->post()) {
            $complaint_id = $this->input->post('complaint_id');
            $comment = $this->input->post('comment');

            // Get current complaint data
            $current_complaint = $this->db->get_where('complaints', ['complaint_id' => $complaint_id])->row_array();

            if (!$current_complaint) {
                echo json_encode(['success' => false, 'message' => 'Complaint not found']);
                return;
            }

            // Check permissions
            if (!$this->canEditComplaint($current_complaint)) {
                echo json_encode(['success' => false, 'message' => 'Access denied']);
                return;
            }

            // Log action
            $this->logComplaintAction(
                $complaint_id,
                'ADD_COMMENT',
                $current_complaint['status'],
                $current_complaint['status'],
                null,
                null,
                $comment
            );

            echo json_encode(['success' => true, 'message' => 'Comment added successfully']);
        }
    }

    /**
     * Handle file uploads for complaint
     */
    private function handleFileUploads($complaint_id)
    {
        if (!empty($_FILES['attachments']['name'][0])) {
            $config['upload_path'] = './uploads/complaints/';
            $config['allowed_types'] = 'gif|jpg|jpeg|png|pdf|doc|docx';
            $config['max_size'] = 5120; // 5MB
            $config['encrypt_name'] = TRUE;

            if (!is_dir($config['upload_path'])) {
                mkdir($config['upload_path'], 0755, true);
            }

            $this->upload->initialize($config);

            foreach ($_FILES['attachments']['name'] as $key => $filename) {
                if (!empty($filename)) {
                    $_FILES['file']['name'] = $_FILES['attachments']['name'][$key];
                    $_FILES['file']['type'] = $_FILES['attachments']['type'][$key];
                    $_FILES['file']['tmp_name'] = $_FILES['attachments']['tmp_name'][$key];
                    $_FILES['file']['error'] = $_FILES['attachments']['error'][$key];
                    $_FILES['file']['size'] = $_FILES['attachments']['size'][$key];

                    if ($this->upload->do_upload('file')) {
                        $upload_data = $this->upload->data();

                        // Save attachment record
                        $attachment_data = [
                            'complaint_id' => $complaint_id,
                            'attachment_type' => 'DOCUMENT',
                            'file_url' => base_url('uploads/complaints/' . $upload_data['file_name']),
                            'original_filename' => $upload_data['orig_name'],
                            'mime_type' => $upload_data['file_type'],
                            'file_size' => $upload_data['file_size'],
                            'uploaded_by' => $this->admin['user_code']
                        ];

                        $this->db->insert('complaint_attachments', $attachment_data);
                    }
                }
            }
        }
    }

    /**
     * Generate unique complaint ID
     */
    private function generateComplaintId()
    {
        do {
            $complaint_id = 'CMP' . date('Ymd') . mt_rand(1000, 9999);
            $exists = $this->db->get_where('complaints', ['complaint_id' => $complaint_id])->num_rows();
        } while ($exists > 0);

        return $complaint_id;
    }

    /**
     * Log complaint action
     */
    private function logComplaintAction($complaint_id, $action_type, $old_status, $new_status, $old_assigned_to, $new_assigned_to, $remarks)
    {
        $action_data = [
            'complaint_id' => $complaint_id,
            'action_type' => $action_type,
            'old_status' => $old_status,
            'new_status' => $new_status,
            'old_assigned_to' => $old_assigned_to,
            'new_assigned_to' => $new_assigned_to,
            'action_by' => $this->admin['user_code'],
            'action_by_role' => $this->admin['user_role'],
            'remarks' => $remarks,
            'ip_address' => $this->input->ip_address(),
            'user_agent' => $this->input->user_agent()
        ];

        $this->db->insert('complaint_actions', $action_data);
    }

    /**
     * Create or link chat thread for complaint
     */
    private function createOrLinkChatThread($complaint_id, $user_id)
    {
        // Check if thread already exists between users and helpdesk
        $this->db->select('ct.thread_id');
        $this->db->from('chat_threads ct');
        $this->db->join('chat_thread_participants ctp1', 'ct.thread_id = ctp1.thread_id');
        $this->db->join('chat_thread_participants ctp2', 'ct.thread_id = ctp2.thread_id');
        $this->db->where('ctp1.user_id', $user_id);
        $this->db->where('ctp2.user_id', $this->helpdesk_user_id);
        $this->db->where('ct.thread_type', 'support');
        $existing_thread = $this->db->get()->row_array();

        if ($existing_thread) {
            $thread_id = $existing_thread['thread_id'];
        } else {
            // Create new thread
            $thread_id = uniqid('thread_');
            $thread_data = [
                'thread_id' => $thread_id,
                'thread_type' => 'support',
                'title' => 'Support Chat - Complaint #' . $complaint_id,
                'topic' => 'complaint',
                'description' => 'Support chat for complaint resolution',
                'owner_id' => $this->helpdesk_user_id,
                'created_at' => date('Y-m-d H:i:s')
            ];
            $this->db->insert('chat_threads', $thread_data);

            // Add participants
            $participants = [
                [
                    'thread_id' => $thread_id,
                    'user_id' => $user_id,
                    'role' => 'users',
                    'invited_by' => $this->helpdesk_user_id,
                    'invited_at' => date('Y-m-d H:i:s'),
                    'joined_at' => date('Y-m-d H:i:s')
                ],
                [
                    'thread_id' => $thread_id,
                    'user_id' => $this->helpdesk_user_id,
                    'role' => 'support',
                    'invited_by' => $this->helpdesk_user_id,
                    'invited_at' => date('Y-m-d H:i:s'),
                    'joined_at' => date('Y-m-d H:i:s')
                ]
            ];
            $this->db->insert_batch('chat_thread_participants', $participants);
        }

        // Link thread to complaint
        $this->db->where('complaint_id', $complaint_id);
        $this->db->update('complaints', ['chat_thread_id' => $thread_id]);

        // Send initial message
        $this->sendChatNotification($complaint_id, "Your complaint #{$complaint_id} has been registered. Our support team will assist you shortly.");

        return $thread_id;
    }

    /**
     * Send complaint-specific chat notification with automatic linking
     */
    private function sendComplaintNotification($complaint_id, $notification_type, $user_id, $status = null, $assigned_to = null)
    {
        $complaint = $this->db->get_where('complaints', ['complaint_id' => $complaint_id])->row_array();

        if (!$complaint) {
            return false;
        }

        // Generate appropriate message based on notification type
        $message = '';
        $link_type = 'CONTEXT';

        switch ($notification_type) {
            case 'CREATED':
                $message = "Your complaint has been successfully registered.\nComplaint ID: #{$complaint_id}\nWe'll keep you updated on the progress.";
                $link_type = 'TRIGGER';
                break;
            case 'STATUS_UPDATE':
                $status_display = ucwords(strtolower(str_replace('_', ' ', $status)));
                $message = "Your complaint #{$complaint_id} status has changed to: {$status_display}.";
                break;
            case 'ASSIGNED':
                if ($assigned_to) {
                    // Get assignee name
                    $assignee = $this->db->get_where('admins', ['username' => $assigned_to])->row_array();
                    $assignee_name = $assignee ? $assignee['name'] : $assigned_to;
                    $message = "Your complaint #{$complaint_id} has been assigned to {$assignee_name} for resolution.";
                } else {
                    $message = "Your complaint #{$complaint_id} has been assigned for resolution.";
                }
                break;
            case 'RESOLVED':
                $message = "Your complaint #{$complaint_id} has been resolved. Thank you for your patience.";
                $link_type = 'RESOLUTION';
                break;
            case 'CLOSED':
                $message = "Your complaint #{$complaint_id} has been closed. If you need further assistance, please create a new complaint.";
                $link_type = 'RESOLUTION';
                break;
        }

        if (empty($message)) {
            return false;
        }

        // Get or create chat thread
        $thread_id = $complaint['chat_thread_id'];
        if (empty($thread_id)) {
            $thread_id = $this->createOrLinkChatThread($complaint_id, $user_id);
        }

        if ($thread_id) {
            // Send message
            $message_id = $this->insertChatMessage($thread_id, $this->helpdesk_user_id, $message);

            if ($message_id) {
                // Link message to complaint
                $this->linkChatMessageToComplaint($complaint_id, $message_id, $link_type, 'SYSTEM', 'Auto-linked system notification');

                // Log as complaint action for audit trail
                $this->logComplaintAction(
                    $complaint_id,
                    'CHAT_MESSAGE',
                    $complaint['status'],
                    $complaint['status'],
                    null,
                    null,
                    $message
                );

                return true;
            }
        }

        return false;
    }

    /**
     * Insert chat message and update thread
     */
    private function insertChatMessage($thread_id, $sender_id, $content, $message_type = 'text')
    {
        $localmsgid = uniqid('msg_' . time() . '_');
        $message_data = [
            'metadata' => json_encode(['localmsgid' => $localmsgid]),
            'thread_id' => $thread_id,
            'sender_id' => $sender_id,
            'message_type' => $message_type,
            'content' => $content,
            'status' => 'sent',
            'created_at' => date('Y-m-d H:i:s')
        ];

        $success = $this->db->insert('chat_messages', $message_data);

        if ($success) {
            // find last message_id
            $message_id = $this->db->insert_id();

            // Update thread last message
            $this->db->where('thread_id', $thread_id);
            $this->db->update('chat_threads', [
                'last_message_id' => $message_id,
                'updated_at' => date('Y-m-d H:i:s')
            ]);

            return $message_id;
        }

        return false;
    }

    /**
     * Link chat message to complaint
     */
    private function linkChatMessageToComplaint($complaint_id, $message_id, $link_type, $linked_by, $notes = null)
    {
        $link_data = [
            'complaint_id' => $complaint_id,
            'message_id' => $message_id,
            'link_type' => $link_type,
            'linked_by' => $linked_by,
            'notes' => $notes
        ];

        return $this->db->insert('complaint_chat_links', $link_data);
    }

    /**
     * Send help desk message from complaint interface or chat
     */
    public function SendHelpDeskMessage()
    {
        if ($this->input->post()) {
            $complaint_id = $this->input->post('complaint_id');
            $message = $this->input->post('message');
            $attach_to_complaint = $this->input->post('attach_to_complaint', true);

            // Get complaint details
            $complaint = $this->db->get_where('complaints', ['complaint_id' => $complaint_id])->row_array();

            if (!$complaint) {
                echo json_encode(['success' => false, 'message' => 'Complaint not found']);
                return;
            }

            // Check permissions
            if (!$this->canEditComplaint($complaint)) {
                echo json_encode(['success' => false, 'message' => 'Access denied']);
                return;
            }

            $thread_id = $complaint['chat_thread_id'];
            if (empty($thread_id)) {
                $thread_id = $this->createOrLinkChatThread($complaint_id, $complaint['user_id']);
            }

            if ($thread_id) {
                // Send message as help desk
                $message_id = $this->insertChatMessage($thread_id, $this->helpdesk_user_id, $message);

                if ($message_id) {
                    // If requested, link message to complaint
                    if ($attach_to_complaint) {
                        $this->linkChatMessageToComplaint(
                            $complaint_id,
                            $message_id,
                            'CONTEXT',
                            $this->admin['user_code'],
                            'Help desk response message'
                        );

                        // Log as complaint action
                        $this->logComplaintAction(
                            $complaint_id,
                            'CHAT_MESSAGE',
                            $complaint['status'],
                            $complaint['status'],
                            null,
                            null,
                            "Help desk message: " . substr($message, 0, 100) . (strlen($message) > 100 ? '...' : '')
                        );
                    }

                    echo json_encode(['success' => true, 'message' => 'Message sent successfully']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Failed to send message']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Chat thread not available']);
            }
        }
    }

    /**
     * Send chat notification (legacy - kept for backward compatibility)
     */
    private function sendChatNotification($complaint_id, $message)
    {
        $complaint = $this->db->get_where('complaints', ['complaint_id' => $complaint_id])->row_array();

        if ($complaint && !empty($complaint['chat_thread_id'])) {
            $message_id = $this->insertChatMessage($complaint['chat_thread_id'], $this->helpdesk_user_id, $message);
            return $message_id !== false;
        }

        return false;
    }

    /**
     * Get complaint statistics
     */
    private function getComplaintStats()
    {
        $stats = [];

        $this->db->select('status, COUNT(*) as count');
        $this->db->from('complaints');
        $this->db->where('deleted_at IS NULL');
        $this->applyRoleBasedFilter();
        $this->db->group_by('status');
        $status_stats = $this->db->get()->result_array();

        foreach ($status_stats as $stat) {
            $stats[$stat['status']] = $stat['count'];
        }

        // Fill in missing statuses with 0
        $all_statuses = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED'];
        foreach ($all_statuses as $status) {
            if (!isset($stats[$status])) {
                $stats[$status] = 0;
            }
        }

        return $stats;
    }

    /**
     * Get pending actions count
     */
    private function getPendingActionsCount()
    {
        $this->db->select('COUNT(*) as count');
        $this->db->from('complaints');
        $this->db->where('deleted_at IS NULL');
        $this->db->where('assigned_to', $this->admin['user_code']);
        $this->db->where_in('status', ['ASSIGNED', 'IN_PROGRESS']);
        $result = $this->db->get()->row_array();

        return $result['count'];
    }

    /**
     * Get complaint categories
     */
    private function getComplaintCategories()
    {
        $this->db->select('category_code, category_name');
        $this->db->from('complaint_categories');
        $this->db->where('is_active', 1);
        $this->db->order_by('sort_order', 'ASC');
        return $this->db->get()->result_array();
    }

    /**
     * Get assignees based on role
     */
    private function getAssignees()
    {
        $this->db->select('id, name, username as user_code');
        $this->db->from('admins');
        $this->db->where('user_role', 'HelpDesk');
        $this->db->where('status', 1);
        $this->db->order_by('name', 'ASC');
        return $this->db->get()->result_array();
    }

    /**
     * Get auto assignee based on rules and workload balancing
     */
    private function getAutoAssignee($category, $priority)
    {
        // First, check if there's a specific assignment rule
        $this->db->select('assign_to_user, assign_to_role');
        $this->db->from('complaint_assignment_rules');
        $this->db->where('category', $category);
        $this->db->where('priority', $priority);
        $this->db->where('is_active', 1);
        $rule = $this->db->get()->row_array();

        if ($rule) {
            // If specific user is defined, use them
            if (!empty($rule['assign_to_user'])) {
                return $rule['assign_to_user'];
            }

            // Otherwise, get the least loaded user from the specified role
            return $this->getLeastLoadedUserByRole($rule['assign_to_role']);
        }

        // Default fallback: assign to least loaded HelpDesk user
        return $this->getLeastLoadedUserByRole('HelpDesk');
    }

    /**
     * Get the user with the least workload from a specific role
     */
    private function getLeastLoadedUserByRole($role)
    {
        // Get all active users of the specified role
        $this->db->select('username, name');
        $this->db->from('admins');
        $this->db->where('user_role', $role);
        $this->db->where('status', 1);
        $users = $this->db->get()->result_array();

        if (empty($users)) {
            return null;
        }

        $workload_data = [];

        // Calculate current workload for each user
        foreach ($users as $user) {
            $username = $user['username'];

            // Count active complaints assigned to this user
            $this->db->select('COUNT(*) as complaint_count');
            $this->db->from('complaints');
            $this->db->where('assigned_to', $username);
            $this->db->where('deleted_at IS NULL');
            $this->db->where_in('status', ['NEW', 'ASSIGNED', 'IN_PROGRESS']); // Only active complaints
            $result = $this->db->get()->row_array();

            $complaint_count = (int)$result['complaint_count'];

            // Get user's last assignment time for tie-breaking
            $this->db->select('MAX(assigned_at) as last_assigned');
            $this->db->from('complaints');
            $this->db->where('assigned_to', $username);
            $this->db->where('deleted_at IS NULL');
            $last_assigned_result = $this->db->get()->row_array();
            $last_assigned = $last_assigned_result['last_assigned'] ?: '1970-01-01 00:00:00';

            $workload_data[] = [
                'username' => $username,
                'name' => $user['name'],
                'complaint_count' => $complaint_count,
                'last_assigned' => $last_assigned,
                'last_assigned_timestamp' => strtotime($last_assigned)
            ];
        }

        // Sort by workload (ascending), then by last assigned time (ascending for fairness)
        usort($workload_data, function ($a, $b) {
            // Primary sort: by complaint count (least loaded first)
            if ($a['complaint_count'] !== $b['complaint_count']) {
                return $a['complaint_count'] <=> $b['complaint_count'];
            }

            // Tie-breaker 1: by last assigned time (earliest gets next assignment)
            if ($a['last_assigned_timestamp'] !== $b['last_assigned_timestamp']) {
                return $a['last_assigned_timestamp'] <=> $b['last_assigned_timestamp'];
            }

            // Tie-breaker 2: alphabetical by name for consistency
            return strcmp($a['name'], $b['name']);
        });

        // Log the assignment decision for transparency
        $selected_user = $workload_data[0];
        $this->logWorkloadAssignment($role, $workload_data, $selected_user);

        return $selected_user['username'];
    }

    /**
     * Log workload-based assignment decision for audit purposes
     */
    private function logWorkloadAssignment($role, $workload_data, $selected_user)
    {
        $log_message = "Auto-assignment to {$role} role:\n";
        $log_message .= "Selected: {$selected_user['name']} ({$selected_user['username']}) with {$selected_user['complaint_count']} active complaints\n";
        $log_message .= "Workload summary:\n";

        foreach ($workload_data as $user) {
            $log_message .= "- {$user['name']}: {$user['complaint_count']} complaints (last assigned: {$user['last_assigned']})\n";
        }

        // You can log this to a file or database table for monitoring
        // For now, we'll use CI's log_message function
        log_message('info', $log_message);
    }

    /**
     * Get workload statistics for dashboard/reporting
     */
    public function getWorkloadStats($role = null)
    {
        $roles = $role ? [$role] : ['SuperAdmin', 'CoreCommittee', 'HelpDesk'];
        $stats = [];

        foreach ($roles as $user_role) {
            // Get all active users of this role
            $this->db->select('username, name');
            $this->db->from('admins');
            $this->db->where('user_role', $user_role);
            $this->db->where('status', 1);
            $users = $this->db->get()->result_array();

            $role_stats = [];
            foreach ($users as $user) {
                // Count active complaints
                $this->db->select('COUNT(*) as active_count');
                $this->db->from('complaints');
                $this->db->where('assigned_to', $user['username']);
                $this->db->where('deleted_at IS NULL');
                $this->db->where_in('status', ['NEW', 'ASSIGNED', 'IN_PROGRESS']);
                $active_result = $this->db->get()->row_array();

                // Count total complaints (all time)
                $this->db->select('COUNT(*) as total_count');
                $this->db->from('complaints');
                $this->db->where('assigned_to', $user['username']);
                $this->db->where('deleted_at IS NULL');
                $total_result = $this->db->get()->row_array();

                // Count resolved complaints
                $this->db->select('COUNT(*) as resolved_count');
                $this->db->from('complaints');
                $this->db->where('assigned_to', $user['username']);
                $this->db->where('deleted_at IS NULL');
                $this->db->where_in('status', ['RESOLVED', 'CLOSED']);
                $resolved_result = $this->db->get()->row_array();

                $role_stats[] = [
                    'username' => $user['username'],
                    'name' => $user['name'],
                    'active_complaints' => (int)$active_result['active_count'],
                    'total_complaints' => (int)$total_result['total_count'],
                    'resolved_complaints' => (int)$resolved_result['resolved_count'],
                    'resolution_rate' => $total_result['total_count'] > 0 ?
                        round(($resolved_result['resolved_count'] / $total_result['total_count']) * 100, 2) : 0
                ];
            }

            $stats[$user_role] = $role_stats;
        }

        return $stats;
    }

    /**
     * Get random user by role for auto-assignment (now uses workload balancing)
     */
    private function getRandomUserByRole($role)
    {
        // Use the new workload-based assignment instead of random
        return $this->getLeastLoadedUserByRole($role);
    }

    /**
     * Check if user can edit complaint
     */
    private function canEditComplaint($complaint)
    {
        if ($this->admin['user_role'] == 'SuperAdmin') return true;
        if ($complaint['assigned_to'] == $this->admin['user_code']) return true;
        if ($complaint['created_by'] == $this->admin['user_code']) return true;

        return false;
    }

    /**
     * Check if user can assign complaint
     */
    private function canAssignComplaint($complaint)
    {
        if (in_array($this->admin['user_role'], ['SuperAdmin', 'CoreCommittee', 'HelpDesk'])) return true;

        return false;
    }

    /**
     * Check if user can resolve complaint
     */
    private function canResolveComplaint($complaint)
    {
        if ($this->admin['user_role'] == 'SuperAdmin') return true;
        if ($complaint['assigned_to'] == $this->admin['user_code']) return true;

        return false;
    }

    /**
     * Get chat messages for thread with enhanced details
     */
    private function getChatMessages($thread_id, $limit = 50)
    {
        $this->db->select('cm.message_id, cm.thread_id, cm.sender_id, cm.message_type, cm.content, cm.metadata, cm.status, cm.created_at, cm.updated_at, m.name as sender_name, m.mobile_no as sender_mobile');
        $this->db->from('chat_messages cm');
        $this->db->join('users m', 'm.user_id = cm.sender_id', 'left');
        $this->db->where('cm.thread_id', $thread_id);
        $this->db->order_by('cm.created_at', 'ASC');
        $this->db->limit($limit);

        $messages = $this->db->get()->result_array();

        // Get attachments for each message
        foreach ($messages as &$message) {
            $this->db->select('*');
            $this->db->from('chat_attachments');
            $this->db->where('message_id', $message['message_id']);
            $message['attachments'] = $this->db->get()->result_array();

            // Check if this message is linked to current complaint
            $message['is_linked'] = $this->isMessageLinkedToComplaint($message['message_id']);
        }

        return $messages;
    }

    /**
     * Get all chat messages involving HELP DESK (user_id = 11122233)
     */
    public function getHelpDeskChatMessages($user_id = null, $limit = 100)
    {
        $helpdesk_id = $this->helpdesk_user_id;

        $this->db->select('cm.message_id, cm.thread_id, cm.sender_id, cm.message_type, cm.content, cm.metadata, cm.status, cm.created_at, cm.updated_at, 
                          sender.name as sender_name, sender.mobile_no as sender_mobile,
                          ct.thread_type, ct.title as thread_title');
        $this->db->from('chat_messages cm');
        $this->db->join('chat_threads ct', 'ct.thread_id = cm.thread_id', 'left');
        $this->db->join('users sender', 'sender.user_id = cm.sender_id', 'left');

        // Filter for helpdesk involvement
        $this->db->where('(cm.sender_id = "' . $helpdesk_id . '" OR EXISTS (
            SELECT 1 FROM chat_thread_participants ctp 
            WHERE ctp.thread_id = cm.thread_id AND ctp.user_id = "' . $helpdesk_id . '"
        ))');

        // If specific users provided, filter for that conversation
        if ($user_id) {
            $this->db->where('(cm.sender_id = "' . $user_id . '" OR EXISTS (
                SELECT 1 FROM chat_thread_participants ctp2 
                WHERE ctp2.thread_id = cm.thread_id AND ctp2.user_id = "' . $user_id . '"
            ))');
        }

        $this->db->order_by('cm.created_at', 'DESC');
        $this->db->limit($limit);

        $messages = $this->db->get()->result_array();

        // Get attachments for each message
        foreach ($messages as &$message) {
            $this->db->select('*');
            $this->db->from('chat_attachments');
            $this->db->where('message_id', $message['message_id']);
            $message['attachments'] = $this->db->get()->result_array();

            $message['is_linked'] = $this->isMessageLinkedToComplaint($message['message_id']);
        }

        return $messages;
    }

    /**
     * Check if a chat message is linked to any complaint
     */
    private function isMessageLinkedToComplaint($message_id, $complaint_id = null)
    {
        $this->db->select('ccl.*, c.title as complaint_title');
        $this->db->from('complaint_chat_links ccl');
        $this->db->join('complaints c', 'c.complaint_id = ccl.complaint_id', 'left');
        $this->db->where('ccl.message_id', $message_id);

        if ($complaint_id) {
            $this->db->where('ccl.complaint_id', $complaint_id);
            return $this->db->get()->row_array() !== null;
        }

        return $this->db->get()->result_array();
    }

    /**
     * Link chat message to complaint
     */
    public function LinkChatMessage()
    {
        if ($this->input->post()) {
            $complaint_id = $this->input->post('complaint_id');
            $message_id = $this->input->post('message_id');
            $link_type = $this->input->post('link_type', true) ?: 'CONTEXT';
            $notes = $this->input->post('notes', true);

            // Validate inputs
            if (empty($complaint_id) || empty($message_id)) {
                echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
                return;
            }

            // Check if link already exists
            $existing = $this->db->get_where('complaint_chat_links', [
                'complaint_id' => $complaint_id,
                'message_id' => $message_id
            ])->row_array();

            if ($existing) {
                echo json_encode(['success' => false, 'message' => 'Message already linked to this complaint']);
                return;
            }

            // Insert link
            $link_data = [
                'complaint_id' => $complaint_id,
                'message_id' => $message_id,
                'link_type' => $link_type,
                'linked_by' => $this->admin['user_code'],
                'notes' => $notes,
                'linked_at' => date('Y-m-d H:i:s')
            ];

            $success = $this->db->insert('complaint_chat_links', $link_data);

            if ($success) {
                // If this is the first linked message and complaint doesn't have a chat thread, link the thread
                $complaint = $this->db->get_where('complaints', ['complaint_id' => $complaint_id])->row_array();
                if (empty($complaint['chat_thread_id'])) {
                    $message = $this->db->get_where('chat_messages', ['message_id' => $message_id])->row_array();
                    if ($message) {
                        $this->db->where('complaint_id', $complaint_id);
                        $this->db->update('complaints', ['chat_thread_id' => $message['thread_id']]);
                    }
                }

                // Log action
                $this->logComplaintAction(
                    $complaint_id,
                    'ADD_CHAT_LINK',
                    null,
                    null,
                    null,
                    null,
                    "Linked chat message ID: {$message_id} as {$link_type}" . ($notes ? " - {$notes}" : "")
                );

                echo json_encode(['success' => true, 'message' => 'Chat message linked successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to link chat message']);
            }
        }
    }

    /**
     * Unlink chat message from complaint
     */
    public function UnlinkChatMessage()
    {
        if ($this->input->post()) {
            $complaint_id = $this->input->post('complaint_id');
            $message_id = $this->input->post('message_id');

            if (empty($complaint_id) || empty($message_id)) {
                echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
                return;
            }

            $success = $this->db->delete('complaint_chat_links', [
                'complaint_id' => $complaint_id,
                'message_id' => $message_id
            ]);

            if ($success) {
                $this->logComplaintAction(
                    $complaint_id,
                    'REMOVE_CHAT_LINK',
                    null,
                    null,
                    null,
                    null,
                    "Unlinked chat message ID: {$message_id}"
                );

                echo json_encode(['success' => true, 'message' => 'Chat message unlinked successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to unlink chat message']);
            }
        }
    }

    /**
     * Create complaint from chat message
     */
    public function CreateComplaintFromChat()
    {
        if ($this->input->post()) {
            $message_id = $this->input->post('message_id');
            $title = $this->input->post('title');
            $description = $this->input->post('description');
            $category = $this->input->post('category');
            $priority = $this->input->post('priority');

            // Get the original message
            $this->db->select('cm.*, ct.thread_id');
            $this->db->from('chat_messages cm');
            $this->db->join('chat_threads ct', 'ct.thread_id = cm.thread_id');
            $this->db->where('cm.message_id', $message_id);
            $message = $this->db->get()->row_array();

            if (!$message) {
                echo json_encode(['success' => false, 'message' => 'Chat message not found']);
                return;
            }

            // Get sender users details
            $users = $this->db->get_where('users', ['user_id' => $message['sender_id']])->row_array();
            if (!$users) {
                echo json_encode(['success' => false, 'message' => 'users not found']);
                return;
            }

            // Generate complaint ID
            $complaint_id = $this->generateComplaintId();

            // Create complaint
            $complaint_data = [
                'complaint_id' => $complaint_id,
                'user_id' => $message['sender_id'],
                'title' => $title,
                'description' => $description,
                'category' => $category,
                'priority' => $priority,
                'status' => 'NEW',
                'chat_thread_id' => $message['thread_id'],
                'source_chat_message_id' => $message_id,
                'created_by' => $this->admin['user_code'],
                'created_on' => date('Y-m-d H:i:s')
            ];

            // Auto-assign if rules exist
            $assignee = $this->getAutoAssignee($category, $priority);
            if ($assignee) {
                $complaint_data['assigned_to'] = $assignee;
                $complaint_data['assigned_by'] = $this->admin['user_code'];
                $complaint_data['assigned_at'] = date('Y-m-d H:i:s');
                $complaint_data['status'] = 'ASSIGNED';
            }

            $success = $this->db->insert('complaints', $complaint_data);

            if ($success) {
                // Link the trigger message
                $this->db->insert('complaint_chat_links', [
                    'complaint_id' => $complaint_id,
                    'message_id' => $message_id,
                    'link_type' => 'TRIGGER',
                    'linked_by' => $this->admin['user_code'],
                    'notes' => 'Original message that triggered complaint creation'
                ]);

                // Copy chat attachments to complaint attachments
                $this->copyChatAttachmentsToComplaint($message_id, $complaint_id);

                // Log creation action
                $this->logComplaintAction(
                    $complaint_id,
                    'CREATE',
                    null,
                    'NEW',
                    null,
                    $assignee,
                    "Created from chat message ID: {$message_id}"
                );

                echo json_encode([
                    'success' => true,
                    'message' => 'Complaint created successfully',
                    'complaint_id' => $complaint_id,
                    'redirect_url' => base_url('ComplaintManagement/ComplaintManager/ViewComplaint/' . $complaint_id)
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to create complaint']);
            }
        }
    }

    /**
     * Copy chat attachments to complaint attachments
     */
    private function copyChatAttachmentsToComplaint($message_id, $complaint_id)
    {
        $this->db->select('*');
        $this->db->from('chat_attachments');
        $this->db->where('message_id', $message_id);
        $chat_attachments = $this->db->get()->result_array();

        foreach ($chat_attachments as $attachment) {
            $complaint_attachment = [
                'complaint_id' => $complaint_id,
                'attachment_type' => 'CHAT_ATTACHMENT',
                'file_url' => $attachment['file_url'],
                'original_filename' => basename($attachment['file_url']),
                'mime_type' => $attachment['mime_type'] ?: 'application/octet-stream',
                'file_size' => $attachment['file_size'] ?: 0,
                'thumbnail_url' => $attachment['thumbnail_url'],
                'width' => $attachment['width'],
                'height' => $attachment['height'],
                'duration_sec' => $attachment['duration_sec'],
                'chat_message_id' => $message_id,
                'chat_attachment_id' => $attachment['attachment_id'],
                'uploaded_by' => $this->admin['user_code'],
                'uploaded_at' => date('Y-m-d H:i:s')
            ];

            $this->db->insert('complaint_attachments', $complaint_attachment);
        }
    }

    /**
     * Search users for complaint creation
     */
    public function Searchusers()
    {
        if ($this->input->post()) {
            $search_term = $this->input->post('search_term');

            $this->db->select('user_id, name, mobile_no, email');
            $this->db->from('users');
            $this->db->group_start();
            $this->db->like('name', $search_term);
            $this->db->or_like('mobile_no', $search_term);
            $this->db->or_like('user_id', $search_term);
            $this->db->or_like('email', $search_term);
            $this->db->group_end();
            $this->db->where('status', 1); // Active users only
            $this->db->limit(20);
            $users = $this->db->get()->result_array();

            if (count($users) > 0) {
                $html = '';
                foreach ($users as $users) {
                    $html .= '<tr style="cursor: pointer;" onclick="selectusers(\'' . $users['user_id'] . '\', \'' . htmlspecialchars($users['name']) . '\', \'' . $users['mobile_no'] . '\')">';
                    $html .= '<td>' . $users['user_id'] . '</td>';
                    $html .= '<td>' . htmlspecialchars($users['name']) . '</td>';
                    $html .= '<td>' . $users['mobile_no'] . '</td>';
                    $html .= '<td>' . ($users['email'] ?: 'N/A') . '</td>';
                    $html .= '</tr>';
                }
                echo json_encode(['success' => true, 'html' => $html]);
            } else {
                echo json_encode(['success' => false, 'message' => 'No users found']);
            }
        }
    }

    /**
     * View helpdesk chat messages
     */
    public function HelpDeskChat($user_id = null)
    {
        $data['MainMenu'] = "ComplaintManager";
        $data['SubMenu'] = "HelpDeskChat";
        $data['title'] = "Help Desk Chat Messages";
        $data['role'] = $this->admin['user_role'];
        $data['admin'] = $this->admin;

        // Get chat messages
        $data['chat_messages'] = $this->getHelpDeskChatMessages($user_id);

        // Get filter options
        $data['categories'] = $this->getComplaintCategories();
        $data['user_id'] = $user_id;

        // Get users details if user_id provided
        if ($user_id) {
            $data['users'] = $this->db->get_where('users', ['user_id' => $user_id])->row_array();
        }

        $this->load->view('ComplaintManagement/HelpDeskChat', $data);
    }

    /**
     * Manual workload balancing - redistributes complaints to balance workload
     */
    public function BalanceWorkload()
    {
        if ($this->admin['user_role'] !== 'SuperAdmin') {
            echo json_encode(['success' => false, 'message' => 'Access denied - SuperAdmin only']);
            return;
        }

        $role = $this->input->post('role') ?: 'HelpDesk';
        $max_difference = (int)($this->input->post('max_difference') ?: 3); // Maximum complaint difference between users

        // Get current workload
        $workload_stats = $this->getWorkloadStats($role)[$role];

        if (count($workload_stats) < 2) {
            echo json_encode(['success' => false, 'message' => 'Need at least 2 users to balance workload']);
            return;
        }

        // Sort by active complaints (descending)
        usort($workload_stats, function ($a, $b) {
            return $b['active_complaints'] <=> $a['active_complaints'];
        });

        $max_complaints = $workload_stats[0]['active_complaints'];
        $min_complaints = $workload_stats[count($workload_stats) - 1]['active_complaints'];
        $difference = $max_complaints - $min_complaints;

        if ($difference <= $max_difference) {
            echo json_encode([
                'success' => true,
                'message' => "Workload is already balanced (max difference: {$difference})",
                'rebalanced' => 0
            ]);
            return;
        }

        $rebalanced_count = 0;
        $rebalancing_log = [];

        // Redistribute complaints from overloaded to underloaded users
        for ($i = 0; $i < count($workload_stats) - 1; $i++) {
            $overloaded_user = $workload_stats[$i];
            $underloaded_user = $workload_stats[count($workload_stats) - 1 - $i];

            if ($overloaded_user['active_complaints'] - $underloaded_user['active_complaints'] > $max_difference) {
                $complaints_to_move = intval(($overloaded_user['active_complaints'] - $underloaded_user['active_complaints']) / 2);

                // Get oldest complaints from overloaded user
                $this->db->select('complaint_id, title');
                $this->db->from('complaints');
                $this->db->where('assigned_to', $overloaded_user['username']);
                $this->db->where('deleted_at IS NULL');
                $this->db->where_in('status', ['NEW', 'ASSIGNED']);
                $this->db->order_by('assigned_at', 'ASC');
                $this->db->limit($complaints_to_move);
                $complaints_to_reassign = $this->db->get()->result_array();

                foreach ($complaints_to_reassign as $complaint) {
                    // Reassign complaint
                    $this->db->where('complaint_id', $complaint['complaint_id']);
                    $this->db->update('complaints', [
                        'assigned_to' => $underloaded_user['username'],
                        'assigned_by' => $this->admin['user_code'],
                        'assigned_at' => date('Y-m-d H:i:s')
                    ]);

                    // Log the reassignment
                    $this->logComplaintAction(
                        $complaint['complaint_id'],
                        'ASSIGN',
                        null,
                        null,
                        $overloaded_user['username'],
                        $underloaded_user['username'],
                        "Workload balancing: Reassigned from {$overloaded_user['name']} to {$underloaded_user['name']}"
                    );

                    $rebalanced_count++;
                    $rebalancing_log[] = "Moved '{$complaint['title']}' from {$overloaded_user['name']} to {$underloaded_user['name']}";
                }
            }
        }

        echo json_encode([
            'success' => true,
            'message' => "Workload balanced successfully. Redistributed {$rebalanced_count} complaints.",
            'rebalanced' => $rebalanced_count,
            'log' => $rebalancing_log,
            'original_difference' => $difference,
            'max_allowed_difference' => $max_difference
        ]);
    }

    /**
     * Get detailed workload report for a specific role
     */
    public function WorkloadReport($role = 'HelpDesk')
    {
        if (!in_array($this->admin['user_role'], ['SuperAdmin', 'CoreCommittee'])) {
            $this->session->set_flashdata('error', 'Access denied');
            redirect(base_url(''). 'ComplaintManagement/ComplaintManager');
        }

        $data['MainMenu'] = "ComplaintManager";
        $data['SubMenu'] = "WorkloadReport";
        $data['title'] = "Workload Report - " . $role;
        $data['role'] = $this->admin['user_role'];
        $data['admin'] = $this->admin;
        $data['target_role'] = $role;

        // Get detailed workload statistics
        $data['workload_stats'] = $this->getWorkloadStats($role);

        // Get recent assignments for the role
        $this->db->select('c.complaint_id, c.title, c.assigned_to, c.assigned_at, c.status, a.name as assignee_name');
        $this->db->from('complaints c');
        $this->db->join('admins a', 'a.username = c.assigned_to', 'left');
        $this->db->where('a.user_role', $role);
        $this->db->where('c.deleted_at IS NULL');
        $this->db->order_by('c.assigned_at', 'DESC');
        $this->db->limit(50);
        $data['recent_assignments'] = $this->db->get()->result_array();

        $this->load->view('ComplaintManagement/WorkloadReport', $data);
    }
}

/* End of file ComplaintManager.php */
/* Location: ./application/controllers/ComplaintManagement/ComplaintManager.php */
