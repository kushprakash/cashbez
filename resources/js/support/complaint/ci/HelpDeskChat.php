<?php include(APPPATH . 'views/' . $role . '/header.php'); ?>

</div>
<!-- Content Wrapper. Contains page content -->
<div class="content-wrapper">
  <!-- Content Header (Page header) -->
  <section class="content-header p-0">
    <div class="container-fluid">
      <!-- WhatsApp-style Chat Header -->
      <div class="chat-header">
        <div class="d-flex align-items-center">
          <button class="btn btn-link text-white mr-3" onclick="window.history.back()">
            <i class="fas fa-arrow-left"></i>
          </button>
          <div class="chat-avatar mr-3">
            <i class="fas fa-headset"></i>
          </div>
          <div class="chat-info flex-grow-1">
            <h6 class="chat-title mb-0">Help Desk Support</h6>
            <small class="chat-status" id="onlineStatus">
              <i class="fas fa-circle text-success"></i> Online
            </small>
          </div>
          <div class="chat-actions">
            <button class="btn btn-link text-white" onclick="refreshChat()">
              <i class="fas fa-sync-alt"></i>
            </button>
            <div class="dropdown">
              <button class="btn btn-link text-white" data-toggle="dropdown">
                <i class="fas fa-ellipsis-v"></i>
              </button>
              <div class="dropdown-menu dropdown-menu-right">
                <a class="dropdown-item" href="<?= base_url('ComplaintManagement/ComplaintManager'); ?>">
                  <i class="fas fa-tachometer-alt mr-2"></i>Dashboard
                </a>
                <a class="dropdown-item" href="<?= base_url('ComplaintManagement/ComplaintManager/ComplaintsList'); ?>">
                  <i class="fas fa-list mr-2"></i>All Complaints
                </a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="<?= base_url('ComplaintManagement/ComplaintManager/CreateComplaint'); ?>">
                  <i class="fas fa-plus mr-2"></i>Create Complaint
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Main Chat Container -->
  <section class="chat-container">
    <div class="chat-body" id="chatBody">
      <?php if (!empty($chat_messages)) { ?>

        <!-- Chat Messages -->
        <div class="messages-container" id="messagesContainer">
          <?php
          $current_date = '';
          $current_user = $this->session->userdata('username');
          $helpdesk_id = '11122233';

          // Sort messages by creation time to ensure chronological order (oldest first)
          if (!empty($chat_messages)) {
            usort($chat_messages, function ($a, $b) {
              return strtotime($a['created_at']) - strtotime($b['created_at']);
            });
          }

          foreach ($chat_messages as $message) {
            $message_date = date('Y-m-d', strtotime($message['created_at']));
            $is_helpdesk = ($message['sender_id'] == $helpdesk_id);
            $is_member_message = !$is_helpdesk; // Member messages go on the right
            $is_linked = !empty($message['is_linked']);

            // Show date separator
            if ($current_date != $message_date) {
              $current_date = $message_date;
          ?>
              <div class="date-separator">
                <span class="date-badge"><?= date('M j, Y', strtotime($message_date)) ?></span>
              </div>
            <?php
            }
            ?>

            <!-- WhatsApp-style Message Bubble -->
            <div class="message-wrapper <?= $is_member_message ? 'member-message' : 'helpdesk-message' ?>"
              data-message-id="<?= $message['message_id'] ?>"
              data-thread-id="<?= $message['thread_id'] ?>"
              data-sender="<?= $is_helpdesk ? 'helpdesk' : 'member' ?>">

              <div class="message-bubble <?= $is_linked ? 'linked-message' : '' ?>">

                <!-- Message Header (show sender name for all messages) -->
                <div class="message-sender">
                  <strong><?= htmlspecialchars($message['sender_name'] ?: ($is_helpdesk ? 'Help Desk Support' : $message['sender_id'])) ?></strong>
                  <?php if ($is_linked) { ?>
                    <span class="linked-badge">
                      <i class="fas fa-link"></i>
                    </span>
                  <?php } ?>
                </div>

                <!-- Message Content -->
                <div class="message-content">
                  <?php if ($message['message_type'] == 'text') { ?>
                    <div class="message-text">
                      <?= nl2br(htmlspecialchars($message['content'])) ?>
                    </div>
                  <?php } elseif ($message['message_type'] == 'image') { ?>
                    <div class="message-media">
                      <?php if (!empty($message['attachments'])) {
                        foreach ($message['attachments'] as $attachment) { ?>
                          <div class="media-item">
                            <img src="<?= $attachment['file_url'] ?>" class="chat-image" alt="Image" onclick="openImageModal('<?= $attachment['file_url'] ?>')">
                            <?php if (!empty($message['content'])) { ?>
                              <div class="media-caption"><?= nl2br(htmlspecialchars($message['content'])) ?></div>
                            <?php } ?>
                          </div>
                      <?php }
                      } ?>
                    </div>
                  <?php } elseif ($message['message_type'] == 'document') { ?>
                    <div class="message-document">
                      <?php if (!empty($message['attachments'])) {
                        foreach ($message['attachments'] as $attachment) { ?>
                          <div class="document-item">
                            <div class="document-icon">
                              <i class="fas fa-file-alt"></i>
                            </div>
                            <div class="document-details">
                              <div class="document-name"><?= basename($attachment['file_url']) ?></div>
                              <div class="document-size"><?= formatFileSize($attachment['file_size']) ?></div>
                            </div>
                            <a href="<?= $attachment['file_url'] ?>" target="_blank" class="download-btn">
                              <i class="fas fa-download"></i>
                            </a>
                          </div>
                          <?php if (!empty($message['content'])) { ?>
                            <div class="document-caption"><?= nl2br(htmlspecialchars($message['content'])) ?></div>
                          <?php } ?>
                      <?php }
                      } ?>
                    </div>
                  <?php } else { ?>
                    <div class="message-special">
                      <div class="special-type">
                        <i class="fas fa-info-circle"></i>
                        <?= ucfirst($message['message_type']) ?> Message
                      </div>
                      <?php if (!empty($message['content'])) { ?>
                        <div class="special-content"><?= nl2br(htmlspecialchars($message['content'])) ?></div>
                      <?php } ?>
                    </div>
                  <?php } ?>
                </div>

                <!-- Message Footer -->
                <div class="message-footer">
                  <div class="message-time">
                    <?= date('H:i', strtotime($message['created_at'])) ?>
                  </div>
                  <?php if ($is_member_message) { ?>
                    <div class="message-status">
                      <i class="fas fa-check-double text-primary"></i>
                    </div>
                  <?php } ?>
                  <div class="message-actions">
                    <div class="dropdown">
                      <button class="btn btn-sm btn-link message-menu" data-toggle="dropdown">
                        <i class="fas fa-chevron-down"></i>
                      </button>
                      <div class="dropdown-menu dropdown-menu-right">
                        <?php if (!$is_linked) { ?>
                          <a class="dropdown-item" href="#" onclick="createComplaintFromMessage(<?= $message['message_id'] ?>)">
                            <i class="fas fa-plus mr-2"></i>Create Complaint
                          </a>
                          <a class="dropdown-item" href="#" onclick="linkToExistingComplaint(<?= $message['message_id'] ?>)">
                            <i class="fas fa-link mr-2"></i>Link to Complaint
                          </a>
                        <?php } else { ?>
                          <a class="dropdown-item" href="#" onclick="viewLinkedComplaints(<?= $message['message_id'] ?>)">
                            <i class="fas fa-eye mr-2"></i>View Linked Complaints
                          </a>
                        <?php } ?>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item" href="#" onclick="copyMessage('<?= htmlspecialchars($message['content']) ?>')">
                          <i class="fas fa-copy mr-2"></i>Copy Message
                        </a>
                        <a class="dropdown-item" href="#" onclick="replyToMessage(<?= $message['message_id'] ?>)">
                          <i class="fas fa-reply mr-2"></i>Reply
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Linked Complaints Info -->
                <?php if ($is_linked && !empty($message['is_linked'])) { ?>
                  <div class="linked-info">
                    <small class="linked-text">
                      <i class="fas fa-link mr-1"></i>
                      Linked to:
                      <?php foreach ($message['is_linked'] as $link) { ?>
                        <a href="<?= base_url('ComplaintManagement/ComplaintManager/ViewComplaint/' . $link['complaint_id']) ?>"
                          class="complaint-link" target="_blank">
                          <?= $link['complaint_id'] ?>
                        </a>
                      <?php } ?>
                    </small>
                  </div>
                <?php } ?>
              </div>
            </div>

          <?php } ?>
        </div>

      <?php } else { ?>
        <!-- Empty State -->
        <div class="empty-chat">
          <div class="empty-icon">
            <i class="fas fa-comments"></i>
          </div>
          <h4>No messages yet</h4>
          <p>Start a conversation with the Help Desk support team</p>
        </div>
      <?php } ?>
    </div>

    <!-- Chat Input Area -->
    <div class="chat-input-container">
      <!-- Reply Preview (hidden by default) -->
      <div class="reply-preview" id="replyPreview" style="display: none;">
        <div class="reply-content">
          <div class="reply-header">
            <span class="reply-label">Replying to:</span>
            <button class="close-reply" onclick="closeReply()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="reply-text" id="replyText"></div>
        </div>
      </div>

      <!-- File Upload Preview -->
      <div class="file-preview" id="filePreview" style="display: none;">
        <div class="preview-content">
          <div class="preview-header">
            <span class="preview-label">File to send:</span>
            <button class="close-preview" onclick="closeFilePreview()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="preview-item" id="previewItem"></div>
        </div>
      </div>

      <!-- Main Input Area -->
      <div class="input-area">
        <form id="chatForm" enctype="multipart/form-data">
          <input type="hidden" id="replyToId" name="reply_to_id">
          <input type="hidden" id="threadId" name="thread_id" value="<?= !empty($thread_id) ? $thread_id : 'helpdesk_general' ?>">

          <div class="input-wrapper">
            <!-- Attachment Button -->
            <div class="attachment-menu">
              <button type="button" class="btn btn-link attachment-btn" data-toggle="dropdown">
                <i class="fas fa-paperclip"></i>
              </button>
              <div class="dropdown-menu dropdown-menu-right">
                <a class="dropdown-item" href="#" onclick="triggerFileInput('image')">
                  <i class="fas fa-image text-primary mr-2"></i>Photo
                </a>
                <a class="dropdown-item" href="#" onclick="triggerFileInput('document')">
                  <i class="fas fa-file-alt text-success mr-2"></i>Document
                </a>
                <a class="dropdown-item" href="#" onclick="triggerFileInput('any')">
                  <i class="fas fa-paperclip text-info mr-2"></i>File
                </a>
              </div>
            </div>

            <!-- Hidden File Inputs -->
            <input type="file" id="imageInput" accept="image/*" style="display: none;" onchange="handleFileSelect(this)">
            <input type="file" id="documentInput" accept=".pdf,.doc,.docx,.txt,.xlsx,.xls" style="display: none;" onchange="handleFileSelect(this)">
            <input type="file" id="fileInput" style="display: none;" onchange="handleFileSelect(this)">

            <!-- Text Input -->
            <div class="text-input-wrapper">
              <textarea id="messageInput" name="message" class="message-input"
                placeholder="Type a message..."
                rows="1"
                onkeydown="handleKeyDown(event)"
                oninput="autoResize(this)"></textarea>
            </div>

            <!-- Send Button -->
            <button type="submit" class="send-btn" id="sendBtn" disabled>
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</div>

<!-- Image Modal -->
<div class="modal fade" id="imageModal" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
    <div class="modal-content bg-transparent border-0">
      <div class="modal-header border-0 text-white">
        <button type="button" class="close text-white" data-dismiss="modal">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body text-center p-0">
        <img id="modalImage" src="" class="img-fluid rounded" alt="Image">
      </div>
    </div>
  </div>
</div>

<!-- Create Complaint Modal -->
<div class="modal fade" id="createComplaintModal" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Create Complaint from Chat Message</h5>
        <button type="button" class="close" data-dismiss="modal">
          <span>&times;</span>
        </button>
      </div>
      <form id="createComplaintForm">
        <div class="modal-body">
          <input type="hidden" id="source_message_id" name="message_id">

          <div class="form-group">
            <label for="complaint_title">Complaint Title *</label>
            <input type="text" class="form-control" id="complaint_title" name="title" required maxlength="255">
          </div>

          <div class="form-group">
            <label for="complaint_description">Description *</label>
            <textarea class="form-control" id="complaint_description" name="description" rows="4" required></textarea>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label for="complaint_category">Category *</label>
                <select class="form-control" id="complaint_category" name="category" required>
                  <option value="">Select Category</option>
                  <?php foreach ($categories as $cat) { ?>
                    <option value="<?= $cat['category_code'] ?>"><?= $cat['category_name'] ?></option>
                  <?php } ?>
                </select>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label for="complaint_priority">Priority *</label>
                <select class="form-control" id="complaint_priority" name="priority" required>
                  <option value="">Select Priority</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          <div class="message-preview" id="messagePreview" style="display: none;">
            <h6>Original Message:</h6>
            <div class="border rounded p-3 bg-light">
              <div id="previewContent"></div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Create Complaint</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Link to Existing Complaint Modal -->
<div class="modal fade" id="linkComplaintModal" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Link Message to Existing Complaint</h5>
        <button type="button" class="close" data-dismiss="modal">
          <span>&times;</span>
        </button>
      </div>
      <form id="linkComplaintForm">
        <div class="modal-body">
          <input type="hidden" id="link_message_id" name="message_id">

          <div class="form-group">
            <label for="link_complaint_id">Complaint ID *</label>
            <input type="text" class="form-control" id="link_complaint_id" name="complaint_id" required placeholder="Enter complaint ID">
          </div>

          <div class="form-group">
            <label for="link_type">Link Type *</label>
            <select class="form-control" id="link_type" name="link_type" required>
              <option value="CONTEXT">Context</option>
              <option value="EVIDENCE">Evidence</option>
              <option value="TRIGGER">Trigger</option>
              <option value="RESOLUTION">Resolution</option>
            </select>
          </div>

          <div class="form-group">
            <label for="link_notes">Notes</label>
            <textarea class="form-control" id="link_notes" name="notes" rows="3" placeholder="Optional notes about this link"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Link Message</button>
        </div>
      </form>
    </div>
  </div>
</div>

<?php include(APPPATH . 'views/' . $role . '/footer.php'); ?>

<script>
  $(document).ready(function() {
    // Auto-scroll to bottom of chat after page load with smooth animation
    setTimeout(function() {
      scrollToBottom(true); // Force scroll with animation
    }, 200);

    // Additional scroll after a bit more delay to ensure all content is loaded
    setTimeout(function() {
      scrollToBottom(false); // Instant scroll to ensure we're at bottom
    }, 500);

    // Enable/disable send button based on input
    $('#messageInput').on('input', function() {
      var hasText = $(this).val().trim().length > 0;
      var hasFile = $('#filePreview').is(':visible');
      $('#sendBtn').prop('disabled', !hasText && !hasFile);
    });

    // Auto-resize textarea
    autoResize(document.getElementById('messageInput'));

    // Chat form submission
    $('#chatForm').on('submit', function(e) {
      e.preventDefault();
      sendMessage();
    });

    // Create complaint form submission
    $('#createComplaintForm').on('submit', function(e) {
      e.preventDefault();

      $.ajax({
        url: '<?= base_url('ComplaintManagement/ComplaintManager/CreateComplaintFromChat') ?>',
        type: 'POST',
        data: $(this).serialize(),
        dataType: 'json',
        success: function(response) {
          if (response.success) {
            toastr.success(response.message);
            $('#createComplaintModal').modal('hide');
            if (response.redirect_url) {
              setTimeout(function() {
                window.open(response.redirect_url, '_blank');
                location.reload();
              }, 1500);
            }
          } else {
            toastr.error(response.message);
          }
        },
        error: function() {
          toastr.error('An error occurred while creating complaint');
        }
      });
    });

    // Link complaint form submission
    $('#linkComplaintForm').on('submit', function(e) {
      e.preventDefault();

      $.ajax({
        url: '<?= base_url('ComplaintManagement/ComplaintManager/LinkChatMessage') ?>',
        type: 'POST',
        data: $(this).serialize(),
        dataType: 'json',
        success: function(response) {
          if (response.success) {
            toastr.success(response.message);
            $('#linkComplaintModal').modal('hide');
            setTimeout(function() {
              location.reload();
            }, 1500);
          } else {
            toastr.error(response.message);
          }
        },
        error: function() {
          toastr.error('An error occurred while linking message');
        }
      });
    });

    // Auto-refresh chat every 5 seconds
    setInterval(function() {
      loadNewMessages();
    }, 5000);
  });

  // Send message function
  function sendMessage() {
    var messageText = $('#messageInput').val().trim();
    var hasFile = $('#filePreview').is(':visible');

    if (!messageText && !hasFile) {
      return;
    }

    var formData = new FormData();
    formData.append('message', messageText);
    formData.append('thread_id', $('#threadId').val());
    formData.append('reply_to_id', $('#replyToId').val());

    // Add file if selected
    var fileInput = document.querySelector('input[type="file"]:not([style*="display: none"])');
    if (fileInput && fileInput.files[0]) {
      formData.append('file', fileInput.files[0]);
    }

    // Disable send button and show sending state
    var sendBtn = $('#sendBtn');
    var originalIcon = sendBtn.html();
    sendBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');

    $.ajax({
      url: '<?= base_url('ComplaintManagement/ComplaintManager/SendHelpDeskMessage') ?>',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      dataType: 'json',
      success: function(response) {
        if (response.success) {
          // Clear input
          $('#messageInput').val('');
          closeReply();
          closeFilePreview();

          // Add message to chat immediately
          addMessageToChat(response.message);

          // Scroll to bottom with a slight delay to ensure content is rendered
          setTimeout(function() {
            scrollToBottom(true);
          }, 150);

          // Show success briefly
          toastr.success('Message sent', '', {
            timeOut: 1500,
            showMethod: 'fadeIn',
            hideMethod: 'fadeOut'
          });
        } else {
          toastr.error(response.message || 'Failed to send message');
        }
      },
      error: function() {
        toastr.error('Connection error. Please try again.');
      },
      complete: function() {
        // Re-enable send button
        sendBtn.prop('disabled', false).html(originalIcon);
        autoResize(document.getElementById('messageInput'));
      }
    });
  }

  // Handle keyboard shortcuts
  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!$('#sendBtn').prop('disabled')) {
        sendMessage();
      }
    }
  }

  // Auto-resize textarea
  function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';

    // Enable/disable send button
    var hasText = textarea.value.trim().length > 0;
    var hasFile = $('#filePreview').is(':visible');
    $('#sendBtn').prop('disabled', !hasText && !hasFile);
  }

  // Scroll to bottom of chat
  function scrollToBottom(smooth = true) {
    var chatBody = document.getElementById('chatBody');
    if (chatBody) {
      if (smooth) {
        // Use smooth scroll for better UX
        chatBody.scrollTo({
          top: chatBody.scrollHeight,
          behavior: 'smooth'
        });
      } else {
        // Instant scroll
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    }
  }

  // Enhanced scroll function that waits for content to load
  function scrollToBottomDelayed() {
    setTimeout(function() {
      scrollToBottom(true);
    }, 100);
  }

  // File handling functions
  function triggerFileInput(type) {
    if (type === 'image') {
      $('#imageInput').click();
    } else if (type === 'document') {
      $('#documentInput').click();
    } else {
      $('#fileInput').click();
    }
  }

  function handleFileSelect(input) {
    var file = input.files[0];
    if (!file) return;

    var preview = $('#filePreview');
    var previewItem = $('#previewItem');

    // Create preview based on file type
    if (file.type.startsWith('image/')) {
      var reader = new FileReader();
      reader.onload = function(e) {
        previewItem.html(`
        <div class="image-preview">
          <img src="${e.target.result}" alt="Preview" style="max-width: 100px; max-height: 100px; border-radius: 8px;">
          <div class="file-info">
            <div class="file-name">${file.name}</div>
            <div class="file-size">${formatFileSize(file.size)}</div>
          </div>
        </div>
      `);
      };
      reader.readAsDataURL(file);
    } else {
      previewItem.html(`
      <div class="file-preview-item">
        <div class="file-icon">
          <i class="fas fa-file-alt"></i>
        </div>
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-size">${formatFileSize(file.size)}</div>
        </div>
      </div>
    `);
    }

    preview.show();
    $('#sendBtn').prop('disabled', false);
  }

  function closeFilePreview() {
    $('#filePreview').hide();
    $('input[type="file"]').val('');
    var hasText = $('#messageInput').val().trim().length > 0;
    $('#sendBtn').prop('disabled', !hasText);
  }

  // Reply functions
  function replyToMessage(messageId) {
    var messageElement = $('[data-message-id="' + messageId + '"]');
    var messageText = messageElement.find('.message-text').text() ||
      messageElement.find('.media-caption').text() ||
      messageElement.find('.document-caption').text() ||
      'Media message';

    $('#replyToId').val(messageId);
    $('#replyText').text(messageText.substring(0, 100) + (messageText.length > 100 ? '...' : ''));
    $('#replyPreview').show();
    $('#messageInput').focus();
  }

  function closeReply() {
    $('#replyPreview').hide();
    $('#replyToId').val('');
  }

  // Image modal
  function openImageModal(imageSrc) {
    $('#modalImage').attr('src', imageSrc);
    $('#imageModal').modal('show');
  }

  // Utility functions
  function copyMessage(text) {
    navigator.clipboard.writeText(text).then(function() {
      toastr.success('Message copied to clipboard');
    });
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Load new messages
  function loadNewMessages() {
    var lastMessageId = $('.message-wrapper:last').data('message-id');

    $.ajax({
      url: '<?= base_url('ComplaintManagement/ComplaintManager/GetNewMessages') ?>',
      type: 'GET',
      data: {
        thread_id: $('#threadId').val(),
        last_message_id: lastMessageId
      },
      dataType: 'json',
      success: function(response) {
        if (response.success && response.messages.length > 0) {
          var isUserAtBottom = isScrolledToBottom();

          response.messages.forEach(function(message) {
            addMessageToChat(message);
          });

          // Only auto-scroll if user was already at bottom (to not interrupt their reading)
          if (isUserAtBottom) {
            setTimeout(function() {
              scrollToBottom(true);
            }, 100);
          } else {
            // Show a subtle notification that new messages arrived
            showNewMessageNotification(response.messages.length);
          }
        }
      }
    });
  }

  // Check if user is scrolled to bottom
  function isScrolledToBottom() {
    var chatBody = document.getElementById('chatBody');
    if (!chatBody) return true;

    var threshold = 100; // 100px from bottom
    return (chatBody.scrollTop + chatBody.clientHeight + threshold) >= chatBody.scrollHeight;
  }

  // Show notification for new messages when user is not at bottom
  function showNewMessageNotification(count) {
    var notification = $('<div class="new-message-notification">' +
      '<i class="fas fa-arrow-down mr-1"></i> ' + count + ' new message' + (count > 1 ? 's' : '') +
      '</div>');

    notification.appendTo('#chatBody').fadeIn().delay(3000).fadeOut(function() {
      $(this).remove();
    });

    notification.click(function() {
      scrollToBottom(true);
      $(this).fadeOut(function() {
        $(this).remove();
      });
    });
  }

  // Add message to chat dynamically
  function addMessageToChat(message) {
    var helpdesk_id = '11122233';
    var isHelpdesk = (message.sender_id === helpdesk_id);
    var isMemberMessage = !isHelpdesk;
    var messageTime = new Date(message.created_at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    var messageHtml = `
    <div class="message-wrapper ${isMemberMessage ? 'member-message' : 'helpdesk-message'}" 
         data-message-id="${message.message_id}"
         data-thread-id="${message.thread_id}"
         data-sender="${isHelpdesk ? 'helpdesk' : 'member'}">
      
      <div class="message-bubble">
        <div class="message-sender">
          <strong>${message.sender_name || (isHelpdesk ? 'Help Desk Support' : message.sender_id)}</strong>
        </div>
        
        <div class="message-content">
          <div class="message-text">
            ${message.content.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <div class="message-footer">
          <div class="message-time">${messageTime}</div>
          ${isMemberMessage ? `
            <div class="message-status">
              <i class="fas fa-check-double text-primary"></i>
            </div>
          ` : ''}
          <div class="message-actions">
            <div class="dropdown">
              <button class="btn btn-sm btn-link message-menu" data-toggle="dropdown">
                <i class="fas fa-chevron-down"></i>
              </button>
              <div class="dropdown-menu dropdown-menu-right">
                <a class="dropdown-item" href="#" onclick="createComplaintFromMessage(${message.message_id})">
                  <i class="fas fa-plus mr-2"></i>Create Complaint
                </a>
                <a class="dropdown-item" href="#" onclick="linkToExistingComplaint(${message.message_id})">
                  <i class="fas fa-link mr-2"></i>Link to Complaint
                </a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#" onclick="copyMessage('${message.content.replace(/'/g, "\\'")}')">
                  <i class="fas fa-copy mr-2"></i>Copy Message
                </a>
                <a class="dropdown-item" href="#" onclick="replyToMessage(${message.message_id})">
                  <i class="fas fa-reply mr-2"></i>Reply
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

    $('#messagesContainer').append(messageHtml);
  }

  // Create complaint from message
  function createComplaintFromMessage(messageId) {
    var messageElement = $('[data-message-id="' + messageId + '"]');
    var messageText = messageElement.find('.message-text').text() ||
      messageElement.find('.media-caption').text() ||
      messageElement.find('.document-caption').text() ||
      'Media message';

    $('#source_message_id').val(messageId);
    $('#complaint_title').val('Issue reported via chat');
    $('#complaint_description').val(messageText);
    $('#previewContent').text(messageText);
    $('#messagePreview').show();

    $('#createComplaintModal').modal('show');
  }

  // Link to existing complaint
  function linkToExistingComplaint(messageId) {
    $('#link_message_id').val(messageId);
    $('#linkComplaintModal').modal('show');
  }

  // View linked complaints
  function viewLinkedComplaints(messageId) {
    alert('Viewing linked complaints for message ID: ' + messageId);
  }

  // Refresh chat
  function refreshChat() {
    location.reload();
  }
</script>

<style>
  /* Reset content-wrapper for full-screen chat */
  .content-wrapper {
    margin-left: 0 !important;
    padding: 0 !important;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* WhatsApp-style Chat Header */
  .chat-header {
    background: #075e54;
    color: white;
    padding: 12px 20px;
    position: sticky;
    top: 0;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .chat-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #128c7e;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .chat-title {
    color: white;
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }

  .chat-status {
    color: #d1f2a5;
    font-size: 13px;
  }

  .chat-actions .btn-link {
    color: white !important;
    padding: 8px;
    font-size: 18px;
  }

  .chat-actions .btn-link:hover {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  /* Main Chat Container */
  .chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 60px);
  }

  .chat-body {
    flex: 1;
    overflow-y: auto;
    background: #e5ddd5;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><pattern id="a" patternUnits="userSpaceOnUse" width="20" height="20"><circle cx="10" cy="10" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23a)"/></svg>');
    position: relative;
    display: flex;
    flex-direction: column;
  }

  /* Messages Container */
  .messages-container {
    padding: 20px;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  /* Ensure message wrappers don't interfere with each other */
  .message-wrapper {
    width: 100%;
    display: flex;
    margin-bottom: 6px;
  }

  .message-wrapper::after {
    content: "";
    display: table;
    clear: both;
  }

  /* Date Separator */
  .date-separator {
    text-align: center;
    margin: 20px 0;
  }

  .date-badge {
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 6px 12px;
    border-radius: 7.5px;
    font-size: 12px;
    font-weight: 500;
  }

  /* Message Wrappers */
  .message-wrapper {
    margin-bottom: 8px;
    display: flex;
    position: relative;
    width: 100%;
    clear: both;
    animation: fadeInUp 0.3s ease-out;
  }

  /* Member messages (from customers) go on the RIGHT */
  .member-message {
    justify-content: flex-end;
    margin-right: auto;
    margin-left: 0;
  }

  /* Helpdesk messages go on the LEFT */
  .helpdesk-message {
    justify-content: flex-start;
    margin-left: auto;
    margin-right: 0;
  }

  /* Message Bubbles */
  .message-bubble {
    max-width: 65%;
    position: relative;
    word-wrap: break-word;
    border-radius: 12px;
    padding: 8px 12px 8px 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    margin: 2px 0;
    position: relative;
  }

  /* Member message bubbles (RIGHT side - customer messages) */
  .member-message .message-bubble {
    background: #dcf8c6;
    border-bottom-right-radius: 4px;
    margin-left: auto;
    position: relative;
  }

  .member-message .message-bubble::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: -8px;
    width: 0;
    height: 0;
    border: 8px solid transparent;
    border-bottom-color: #dcf8c6;
    border-right: 0;
    border-bottom-right-radius: 0;
    transform: rotate(45deg);
  }

  /* Helpdesk message bubbles (LEFT side - support messages) */
  .helpdesk-message .message-bubble {
    background: white;
    border-bottom-left-radius: 4px;
    margin-right: auto;
    position: relative;
  }

  .helpdesk-message .message-bubble::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: -8px;
    width: 0;
    height: 0;
    border: 8px solid transparent;
    border-bottom-color: white;
    border-left: 0;
    border-bottom-left-radius: 0;
    transform: rotate(-45deg);
  }

  .linked-message {
    border-left: 3px solid #25d366 !important;
  }

  /* Message Content */
  .message-sender {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* Different colors for different senders */
  .helpdesk-message .message-sender {
    color: #00bfa5;
  }

  .member-message .message-sender {
    color: #128c7e;
  }

  .linked-badge {
    color: #25d366;
    font-size: 10px;
  }

  .message-content {
    margin-bottom: 4px;
  }

  .message-text {
    font-size: 14px;
    color: #303030;
    line-height: 1.4;
    word-wrap: break-word;
    white-space: pre-wrap;
  }

  /* Message Footer */
  .message-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 5px;
    margin-top: 2px;
  }

  .message-time {
    font-size: 11px;
    color: rgba(0, 0, 0, 0.45);
    font-weight: 400;
  }

  .message-status {
    color: #4fc3f7;
    font-size: 16px;
    line-height: 1;
  }

  .message-actions {
    opacity: 0;
    transition: opacity 0.2s;
  }

  .message-wrapper:hover .message-actions {
    opacity: 1;
  }

  .message-menu {
    color: rgba(0, 0, 0, 0.45) !important;
    font-size: 12px;
    padding: 2px 4px;
  }

  /* Media Messages */
  .message-media,
  .message-document {
    margin-bottom: 5px;
  }

  .chat-image {
    max-width: 250px;
    max-height: 200px;
    border-radius: 7.5px;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .chat-image:hover {
    opacity: 0.9;
  }

  .media-caption,
  .document-caption {
    margin-top: 5px;
    font-size: 14.2px;
    color: #303030;
  }

  .document-item {
    display: flex;
    align-items: center;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 7.5px;
    padding: 8px;
    gap: 10px;
  }

  .document-icon {
    color: #8696a0;
    font-size: 24px;
  }

  .document-details {
    flex: 1;
  }

  .document-name {
    font-size: 14px;
    color: #303030;
    font-weight: 500;
  }

  .document-size {
    font-size: 12px;
    color: #8696a0;
  }

  .download-btn {
    color: #8696a0;
    padding: 4px;
    border-radius: 50%;
    transition: background 0.2s;
  }

  .download-btn:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #303030;
  }

  /* Special Messages */
  .message-special {
    text-align: center;
    color: #8696a0;
    font-size: 13px;
  }

  .special-type {
    background: rgba(0, 0, 0, 0.1);
    padding: 4px 8px;
    border-radius: 12px;
    display: inline-block;
    margin-bottom: 5px;
  }

  /* Linked Info */
  .linked-info {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    padding-top: 5px;
    margin-top: 5px;
  }

  .linked-text {
    font-size: 11px;
    color: #8696a0;
  }

  .complaint-link {
    color: #25d366;
    text-decoration: none;
    font-weight: 500;
  }

  .complaint-link:hover {
    text-decoration: underline;
  }

  /* Empty State */
  .empty-chat {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #8696a0;
    text-align: center;
  }

  .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.5;
  }

  /* Chat Input Container */
  .chat-input-container {
    background: #f0f0f0;
    border-top: 1px solid #e0e0e0;
    position: sticky;
    bottom: 0;
  }

  /* Reply and File Preview */
  .reply-preview,
  .file-preview {
    background: white;
    border-bottom: 1px solid #e0e0e0;
    padding: 10px 20px;
  }

  .reply-content,
  .preview-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .reply-header,
  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .reply-label,
  .preview-label {
    color: #00bfa5;
    font-size: 13px;
    font-weight: 500;
    flex: 1;
  }

  .close-reply,
  .close-preview {
    background: none;
    border: none;
    color: #8696a0;
    cursor: pointer;
    padding: 2px;
  }

  .reply-text {
    color: #8696a0;
    font-size: 13px;
    margin-top: 2px;
    border-left: 3px solid #00bfa5;
    padding-left: 8px;
  }

  .preview-item {
    margin-top: 5px;
  }

  .image-preview,
  .file-preview-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .file-icon {
    color: #8696a0;
    font-size: 24px;
  }

  .file-info {
    flex: 1;
  }

  .file-name {
    font-size: 13px;
    color: #303030;
    font-weight: 500;
  }

  .file-size {
    font-size: 11px;
    color: #8696a0;
  }

  /* Input Area */
  .input-area {
    padding: 8px 16px;
  }

  .input-wrapper {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    background: white;
    border-radius: 21px;
    padding: 5px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .attachment-menu {
    position: relative;
  }

  .attachment-btn {
    color: #8696a0 !important;
    font-size: 20px;
    padding: 8px;
    border-radius: 50%;
    transition: background 0.2s;
  }

  .attachment-btn:hover {
    background: #f5f5f5;
  }

  .text-input-wrapper {
    flex: 1;
    max-height: 120px;
    overflow-y: auto;
  }

  .message-input {
    width: 100%;
    border: none;
    outline: none;
    resize: none;
    background: transparent;
    font-size: 15px;
    color: #303030;
    line-height: 20px;
    padding: 9px 12px;
    min-height: 20px;
    max-height: 100px;
  }

  .message-input::placeholder {
    color: #8696a0;
  }

  .send-btn {
    background: #00bfa5;
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .send-btn:hover:not(:disabled) {
    background: #00a693;
  }

  .send-btn:disabled {
    background: #8696a0;
    cursor: not-allowed;
  }

  /* Scrollbar Styling */
  .chat-body::-webkit-scrollbar {
    width: 6px;
  }

  .chat-body::-webkit-scrollbar-track {
    background: transparent;
  }

  .chat-body::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  .chat-body::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }

  /* Image Modal */
  #imageModal .modal-content {
    background: rgba(0, 0, 0, 0.9);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .message-bubble {
      max-width: 85%;
      padding: 8px 10px;
    }

    .chat-header {
      padding: 10px 15px;
    }

    .messages-container {
      padding: 15px;
    }

    .input-area {
      padding: 6px 12px;
    }

    .message-text {
      font-size: 14px;
    }

    .message-sender {
      font-size: 11px;
    }

    .message-time {
      font-size: 10px;
    }

    /* Better spacing on mobile */
    .member-message .message-bubble::after,
    .helpdesk-message .message-bubble::after {
      border-width: 6px;
    }

    .member-message .message-bubble::after {
      right: -6px;
    }

    .helpdesk-message .message-bubble::after {
      left: -6px;
    }
  }

  @media (max-width: 480px) {
    .message-bubble {
      max-width: 90%;
      border-radius: 10px;
      padding: 6px 8px;
    }

    .message-text {
      font-size: 13px;
      line-height: 1.3;
    }

    .messages-container {
      padding: 10px;
      gap: 2px;
    }

    .date-separator {
      margin: 15px 0;
    }

    .date-badge {
      padding: 4px 8px;
      font-size: 11px;
    }
  }

  /* Animation for new messages */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }

    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideInLeft {
    from {
      transform: translateX(-100%);
      opacity: 0;
    }

    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .member-message .message-bubble {
    animation: slideInRight 0.3s ease-out;
  }

  .helpdesk-message .message-bubble {
    animation: slideInLeft 0.3s ease-out;
  }

  /* Ensure proper clearing of floats - no longer needed with flexbox but kept for compatibility */
  .message-wrapper::after {
    content: "";
    display: table;
    clear: both;
  }

  /* Better message spacing */
  .message-wrapper+.message-wrapper {
    margin-top: 4px;
  }

  /* Date separator improvements */
  .date-separator {
    clear: both;
    margin: 20px 0;
  }

  /* New message notification */
  .new-message-notification {
    position: fixed;
    bottom: 120px;
    left: 50%;
    transform: translateX(-50%);
    background: #128c7e;
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 13px;
    cursor: pointer;
    z-index: 1000;
    display: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
  }

  .new-message-notification:hover {
    background: #075e54;
    transform: translateX(-50%) translateY(-2px);
  }
</style>

<?php
// Helper function for status badge classes
function getStatusBadgeClass($status)
{
  switch ($status) {
    case 'NEW':
      return 'warning';
    case 'ASSIGNED':
      return 'info';
    case 'IN_PROGRESS':
      return 'primary';
    case 'RESOLVED':
      return 'success';
    case 'CLOSED':
      return 'secondary';
    case 'CANCELLED':
      return 'danger';
    default:
      return 'light';
  }
}

// Format file size helper
function formatFileSize($bytes)
{
  if ($bytes >= 1073741824) {
    return number_format($bytes / 1073741824, 2) . ' GB';
  } elseif ($bytes >= 1048576) {
    return number_format($bytes / 1048576, 2) . ' MB';
  } elseif ($bytes >= 1024) {
    return number_format($bytes / 1024, 2) . ' KB';
  } else {
    return $bytes . ' bytes';
  }
}
?>