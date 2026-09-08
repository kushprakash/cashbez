<?php include(APPPATH . 'views/' . $role . '/header.php'); ?>

<!-- Content Wrapper. Contains page content -->
<div class="content-wrapper">
  <!-- Content Header (Page header) -->
  <section class="content-header">
    <div class="container-fluid">
      <div class="row align-items-center mb-3">
        <div class="col-sm-8">
          <div class="d-flex align-items-center">
            <div class="page-icon mr-3">
              <i class="fas fa-eye text-primary"></i>
            </div>
            <div>
              <h1 class="page-title mb-0">Complaint #<?= $complaint['complaint_id'] ?></h1>
              <p class="page-subtitle mb-0">
                <span class="badge badge-<?= getStatusBadgeClass($complaint['status']) ?> mr-2">
                  <?= $complaint['status'] ?>
                </span>
                <span class="badge badge-<?= getPriorityBadgeClass($complaint['priority']) ?> mr-2">
                  <?= $complaint['priority'] ?> Priority
                </span>
                <span class="badge badge-<?= getBadgeClass($complaint['category']) ?>">
                  <?= $complaint['category'] ?>
                </span>
              </p>
            </div>
          </div>
        </div>
        <div class="col-sm-4">
          <ol class="breadcrumb float-sm-right modern-breadcrumb">
            <li class="breadcrumb-item"><a href="<?= base_url($role . '/Home'); ?>"><i class="fas fa-home mr-1"></i>Home</a></li>
            <li class="breadcrumb-item"><a href="<?= base_url('ComplaintManagement/ComplaintManager'); ?>"><i class="fas fa-headset mr-1"></i>Complaint Manager</a></li>
            <li class="breadcrumb-item"><a href="<?= base_url('ComplaintManagement/ComplaintManager/ComplaintsList'); ?>"><i class="fas fa-list mr-1"></i>Complaints</a></li>
            <li class="breadcrumb-item active"><i class="fas fa-eye mr-1"></i><?= $complaint['complaint_id'] ?></li>
          </ol>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm action-toolbar">
            <div class="card-body p-3">
              <div class="row">
                <!-- Primary Actions -->
                <div class="col-lg-8 col-md-12 mb-2 mb-lg-0">
                  <div class="btn-toolbar" role="toolbar" aria-label="Complaint actions">
                    <div class="btn-group mr-2 mb-2" role="group" aria-label="Navigation">
                      <a href="<?= base_url('ComplaintManagement/ComplaintManager/ComplaintsList'); ?>"
                        class="btn btn-outline-secondary"
                        aria-label="Back to complaints list">
                        <i class="fas fa-arrow-left mr-1"></i>
                        <span class="d-none d-sm-inline">Back to List</span>
                      </a>
                    </div>

                    <?php if ($can_edit || $can_assign) { ?>
                      <div class="btn-group mr-2 mb-2" role="group" aria-label="Management actions">
                        <?php if ($can_edit && in_array($complaint['status'], ['NEW', 'ASSIGNED', 'IN_PROGRESS'])) { ?>
                          <button type="button" class="btn btn-primary"
                            onclick="showUpdateStatusModal()"
                            aria-label="Update complaint status">
                            <i class="fas fa-edit mr-1"></i>
                            <span class="d-none d-md-inline">Update Status</span>
                          </button>
                        <?php } ?>

                        <?php if ($can_assign) { ?>
                          <button type="button" class="btn btn-warning"
                            onclick="showAssignModal()"
                            aria-label="Assign or reassign complaint">
                            <i class="fas fa-user-plus mr-1"></i>
                            <span class="d-none d-md-inline">Assign</span>
                          </button>
                        <?php } ?>
                      </div>
                    <?php } ?>

                    <div class="btn-group mr-2 mb-2" role="group" aria-label="Communication actions">
                      <button type="button" class="btn btn-outline-info"
                        onclick="showAddCommentModal()"
                        aria-label="Add comment to complaint">
                        <i class="fas fa-comment mr-1"></i>
                        <span class="d-none d-lg-inline">Add Comment</span>
                      </button>

                      <?php if (!empty($complaint['chat_thread_id'])) { ?>
                        <button type="button" class="btn btn-outline-success"
                          onclick="openChatWindow('<?= $complaint['chat_thread_id'] ?>')"
                          aria-label="Open chat conversation">
                          <i class="fas fa-comments mr-1"></i>
                          <span class="d-none d-lg-inline">Open Chat</span>
                        </button>
                      <?php } ?>
                    </div>
                  </div>
                </div>

                <!-- Secondary Actions -->
                <div class="col-lg-4 col-md-12">
                  <div class="btn-toolbar justify-content-lg-end" role="toolbar" aria-label="Export actions">
                    <div class="btn-group mb-2" role="group" aria-label="Export options">
                      <button type="button" class="btn btn-outline-secondary"
                        onclick="printComplaint()"
                        aria-label="Print complaint details">
                        <i class="fas fa-print mr-1"></i>
                        <span class="d-none d-sm-inline">Print</span>
                      </button>
                      <button type="button" class="btn btn-outline-dark"
                        onclick="exportComplaint()"
                        aria-label="Export complaint to file">
                        <i class="fas fa-download mr-1"></i>
                        <span class="d-none d-sm-inline">Export</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Main content -->
  <section class="content">
    <div class="container-fluid">

      <div class="row">
        <!-- Left Column - Complaint Details -->
        <div class="col-md-8">

          <!-- Complaint Information -->
          <div class="card shadow-sm mb-4 complaint-details-card">
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h6 class="card-title mb-0">
                <i class="fas fa-info-circle mr-2"></i>Complaint Information
              </h6>
              <div class="complaint-status-indicators">
                <span class="badge badge-light badge-pill px-3 py-2">
                  ID: <?= $complaint['complaint_id'] ?>
                </span>
              </div>
            </div>
            <div class="card-body p-4">
              <!-- Status Summary Row -->
              <div class="row mb-4">
                <div class="col-12">
                  <div class="status-summary-grid">
                    <div class="status-item">
                      <div class="status-label">Status</div>
                      <div class="status-value">
                        <span class="badge badge-<?= getStatusBadgeClass($complaint['status']) ?> badge-lg">
                          <i class="fas fa-circle mr-1"></i><?= $complaint['status'] ?>
                        </span>
                      </div>
                    </div>
                    <div class="status-item">
                      <div class="status-label">Priority</div>
                      <div class="status-value">
                        <span class="badge badge-<?= getPriorityBadgeClass($complaint['priority']) ?> badge-lg">
                          <i class="fas fa-exclamation mr-1"></i><?= $complaint['priority'] ?>
                        </span>
                      </div>
                    </div>
                    <div class="status-item">
                      <div class="status-label">Category</div>
                      <div class="status-value">
                        <span class="badge badge-<?= getBadgeClass($complaint['category']) ?> badge-lg">
                          <i class="fas fa-tag mr-1"></i><?= $complaint['category'] ?>
                        </span>
                      </div>
                    </div>
                    <div class="status-item">
                      <div class="status-label">Created</div>
                      <div class="status-value">
                        <span class="text-muted">
                          <i class="fas fa-calendar mr-1"></i>
                          <?= date('M j, Y H:i', strtotime($complaint['created_on'])) ?>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Details Grid -->
              <div class="row">
                <div class="col-lg-6">
                  <div class="detail-group">
                    <h6 class="detail-group-title">
                      <i class="fas fa-file-alt text-primary mr-2"></i>Basic Information
                    </h6>
                    <div class="detail-table">
                      <div class="detail-row">
                        <div class="detail-label">Title</div>
                        <div class="detail-value"><?= htmlspecialchars($complaint['title']) ?></div>
                      </div>
                      <div class="detail-row">
                        <div class="detail-label">Created By</div>
                        <div class="detail-value">
                          <strong><?= $complaint['created_by'] ?></strong>
                        </div>
                      </div>
                      <?php if (!empty($complaint['txn_ac_number'])) { ?>
                        <div class="detail-row">
                          <div class="detail-label">Transaction/Account</div>
                          <div class="detail-value">
                            <code class="text-primary"><?= $complaint['txn_ac_number'] ?></code>
                          </div>
                        </div>
                      <?php } ?>
                    </div>
                  </div>
                </div>

                <div class="col-lg-6">
                  <div class="detail-group">
                    <h6 class="detail-group-title">
                      <i class="fas fa-user-cog text-warning mr-2"></i>Assignment Information
                    </h6>
                    <div class="detail-table">
                      <?php if (!empty($complaint['assigned_to'])) { ?>
                        <div class="detail-row">
                          <div class="detail-label">Assigned To</div>
                          <div class="detail-value">
                            <strong class="text-warning"><?= $complaint['assigned_to'] ?></strong>
                          </div>
                        </div>
                        <div class="detail-row">
                          <div class="detail-label">Assigned On</div>
                          <div class="detail-value">
                            <i class="fas fa-clock mr-1"></i>
                            <?= date('M j, Y H:i', strtotime($complaint['assigned_at'])) ?>
                          </div>
                        </div>
                      <?php } else { ?>
                        <div class="detail-row">
                          <div class="detail-label">Assignment Status</div>
                          <div class="detail-value">
                            <span class="badge badge-secondary">
                              <i class="fas fa-minus mr-1"></i>Unassigned
                            </span>
                          </div>
                        </div>
                      <?php } ?>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Description Section -->
              <div class="row mt-4">
                <div class="col-12">
                  <div class="detail-group">
                    <h6 class="detail-group-title">
                      <i class="fas fa-align-left text-info mr-2"></i>Description
                    </h6>
                    <div class="description-content">
                      <?= nl2br(htmlspecialchars($complaint['description'])) ?>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Resolution Summary (if available) -->
              <?php if (!empty($complaint['resolution_summary'])) { ?>
                <div class="row mt-4">
                  <div class="col-12">
                    <div class="detail-group">
                      <h6 class="detail-group-title">
                        <i class="fas fa-check-circle text-success mr-2"></i>Resolution Summary
                      </h6>
                      <div class="resolution-content">
                        <?= nl2br(htmlspecialchars($complaint['resolution_summary'])) ?>
                      </div>
                    </div>
                  </div>
                </div>
              <?php } ?>
            </div>
          </div>

          <!-- Member Information -->
          <div class="card shadow-sm mb-4 member-info-card">
            <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
              <h6 class="card-title mb-0">
                <i class="fas fa-user mr-2"></i>Member Information
              </h6>
              <div class="member-actions">
                <a href="<?= base_url($role . '/AccountMaster/ViewMember/' . $complaint['m_id']) ?>"
                  class="btn btn-light btn-sm" target="_blank"
                  aria-label="View detailed member profile">
                  <i class="fas fa-external-link-alt mr-1"></i>
                  <span class="d-none d-sm-inline">View Profile</span>
                </a>
              </div>
            </div>
            <div class="card-body p-4">
              <div class="row align-items-center">
                <div class="col-lg-8">
                  <div class="member-details-grid">
                    <div class="member-detail">
                      <div class="detail-label">
                        <i class="fas fa-id-card text-primary mr-2"></i>Member ID
                      </div>
                      <div class="detail-value">
                        <strong class="text-primary"><?= $complaint['member_id'] ?></strong>
                      </div>
                    </div>

                    <div class="member-detail">
                      <div class="detail-label">
                        <i class="fas fa-user text-success mr-2"></i>Full Name
                      </div>
                      <div class="detail-value">
                        <?= $complaint['member_name'] ? htmlspecialchars($complaint['member_name']) : '<span class="text-muted">Not Available</span>' ?>
                      </div>
                    </div>

                    <div class="member-detail">
                      <div class="detail-label">
                        <i class="fas fa-mobile-alt text-warning mr-2"></i>Mobile Number
                      </div>
                      <div class="detail-value">
                        <?php if ($complaint['mobile_no']) { ?>
                          <a href="tel:<?= $complaint['mobile_no'] ?>" class="text-decoration-none">
                            <i class="fas fa-phone mr-1"></i><?= $complaint['mobile_no'] ?>
                          </a>
                        <?php } else { ?>
                          <span class="text-muted">Not Available</span>
                        <?php } ?>
                      </div>
                    </div>

                    <div class="member-detail">
                      <div class="detail-label">
                        <i class="fas fa-envelope text-info mr-2"></i>Email Address
                      </div>
                      <div class="detail-value">
                        <?php if ($complaint['email']) { ?>
                          <a href="mailto:<?= $complaint['email'] ?>" class="text-decoration-none">
                            <i class="fas fa-envelope mr-1"></i><?= htmlspecialchars($complaint['email']) ?>
                          </a>
                        <?php } else { ?>
                          <span class="text-muted">Not Available</span>
                        <?php } ?>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-lg-4">
                  <div class="member-actions-panel">
                    <h6 class="mb-3">
                      <i class="fas fa-tools mr-2"></i>Quick Actions
                    </h6>
                    <div class="action-buttons">
                      <a href="<?= base_url($role . '/AccountMaster/ViewMember/' . $complaint['m_id']) ?>"
                        class="btn btn-outline-primary btn-block mb-2" target="_blank">
                        <i class="fas fa-user-circle mr-2"></i>View Full Profile
                      </a>

                      <?php if ($complaint['mobile_no']) { ?>
                        <a href="<?= base_url('ComplaintManagement/ComplaintManager/HelpDeskChat/' . $complaint['member_id']) ?>"
                          class="btn btn-outline-success btn-block mb-2" target="_blank">
                          <i class="fas fa-comments mr-2"></i>Chat History
                        </a>
                      <?php } ?>

                      <button type="button" class="btn btn-outline-info btn-block"
                        onclick="viewMemberComplaints('<?= $complaint['member_id'] ?>')">
                        <i class="fas fa-list mr-2"></i>Other Complaints
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Attachments -->
          <?php if (!empty($attachments)) { ?>
            <div class="card shadow-sm mb-4 attachments-card">
              <div class="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
                <h6 class="card-title mb-0">
                  <i class="fas fa-paperclip mr-2"></i>Attachments
                </h6>
                <span class="badge badge-light badge-pill">
                  <?= count($attachments) ?> file<?= count($attachments) > 1 ? 's' : '' ?>
                </span>
              </div>
              <div class="card-body p-4">
                <div class="attachments-grid">
                  <?php foreach ($attachments as $index => $attachment) { ?>
                    <div class="attachment-item" data-index="<?= $index ?>">
                      <div class="attachment-preview">
                        <?php if (strpos($attachment['mime_type'], 'image/') === 0) { ?>
                          <div class="image-preview" onclick="viewImage('<?= $attachment['file_url'] ?>')">
                            <img src="<?= $attachment['file_url'] ?>"
                              alt="<?= htmlspecialchars($attachment['original_filename']) ?>"
                              class="attachment-thumbnail"
                              loading="lazy">
                            <div class="image-overlay">
                              <i class="fas fa-search-plus"></i>
                            </div>
                          </div>
                        <?php } else { ?>
                          <div class="file-preview">
                            <div class="file-icon">
                              <?php
                              $extension = strtolower(pathinfo($attachment['original_filename'], PATHINFO_EXTENSION));
                              switch ($extension) {
                                case 'pdf':
                                  echo '<i class="fas fa-file-pdf text-danger"></i>';
                                  break;
                                case 'doc':
                                case 'docx':
                                  echo '<i class="fas fa-file-word text-primary"></i>';
                                  break;
                                case 'xls':
                                case 'xlsx':
                                  echo '<i class="fas fa-file-excel text-success"></i>';
                                  break;
                                case 'zip':
                                case 'rar':
                                  echo '<i class="fas fa-file-archive text-warning"></i>';
                                  break;
                                default:
                                  echo '<i class="fas fa-file text-secondary"></i>';
                              }
                              ?>
                            </div>
                          </div>
                        <?php } ?>
                      </div>

                      <div class="attachment-info">
                        <div class="attachment-name" title="<?= htmlspecialchars($attachment['original_filename']) ?>">
                          <?= htmlspecialchars(strlen($attachment['original_filename']) > 25 ?
                            substr($attachment['original_filename'], 0, 22) . '...' :
                            $attachment['original_filename']) ?>
                        </div>

                        <div class="attachment-meta">
                          <span class="attachment-type badge badge-outline-secondary">
                            <?= strtoupper($attachment['attachment_type']) ?>
                          </span>
                          <span class="attachment-date text-muted">
                            <i class="fas fa-calendar-alt mr-1"></i>
                            <?= date('M j, Y', strtotime($attachment['uploaded_at'])) ?>
                          </span>
                        </div>

                        <div class="attachment-actions">
                          <a href="<?= $attachment['file_url'] ?>"
                            class="btn btn-sm btn-primary btn-block"
                            target="_blank"
                            download="<?= htmlspecialchars($attachment['original_filename']) ?>">
                            <i class="fas fa-download mr-1"></i>Download
                          </a>
                        </div>
                      </div>
                    </div>
                  <?php } ?>
                </div>
              </div>
            </div>
          <?php } ?>

        </div>

        <!-- Right Column - Timeline & Chat -->
        <div class="col-md-4">

          <!-- Action Timeline -->
          <div class="card shadow-sm mb-4 timeline-card">
            <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
              <h6 class="card-title mb-0">
                <i class="fas fa-history mr-2"></i>Action Timeline
              </h6>
              <?php if (!empty($actions)) { ?>
                <span class="badge badge-light badge-pill">
                  <?= count($actions) ?> action<?= count($actions) > 1 ? 's' : '' ?>
                </span>
              <?php } ?>
            </div>
            <div class="card-body p-0">
              <?php if (!empty($actions)) { ?>
                <div class="timeline-container">
                  <div class="timeline">
                    <?php foreach ($actions as $index => $action) { ?>
                      <div class="timeline-item <?= $index === 0 ? 'latest' : '' ?>">
                        <div class="timeline-marker bg-<?= getActionBadgeClass($action['action_type']) ?>">
                          <i class="fas <?= getActionIcon($action['action_type']) ?>"></i>
                        </div>
                        <div class="timeline-content">
                          <div class="timeline-header">
                            <h6 class="timeline-title">
                              <?= ucwords(str_replace('_', ' ', $action['action_type'])) ?>
                              <?php if ($index === 0) { ?>
                                <span class="badge badge-primary badge-sm ml-2">Latest</span>
                              <?php } ?>
                            </h6>
                            <div class="timeline-meta">
                              <span class="timeline-time">
                                <i class="fas fa-clock mr-1"></i>
                                <?= date('M j, Y H:i', strtotime($action['timestamp'])) ?>
                              </span>
                            </div>
                          </div>

                          <div class="timeline-body">
                            <?php if (!empty($action['remarks'])) { ?>
                              <p class="timeline-description mb-2">
                                <?= htmlspecialchars($action['remarks']) ?>
                              </p>
                            <?php } else { ?>
                              <p class="timeline-description mb-2">
                                <?= getActionDescription($action) ?>
                              </p>
                            <?php } ?>

                            <div class="timeline-footer">
                              <div class="action-by">
                                <i class="fas fa-user mr-1"></i>
                                <strong><?= htmlspecialchars($action['action_by']) ?></strong>
                                <span class="role-badge badge badge-outline-secondary ml-2">
                                  <?= htmlspecialchars($action['action_by_role']) ?>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    <?php } ?>
                  </div>
                </div>
              <?php } else { ?>
                <div class="empty-timeline">
                  <div class="empty-icon">
                    <i class="fas fa-history"></i>
                  </div>
                  <h6>No Actions Recorded</h6>
                  <p class="text-muted">No timeline actions have been recorded for this complaint yet.</p>
                </div>
              <?php } ?>
            </div>
          </div>

          <!-- Chat Messages -->
          <?php if (!empty($chat_messages) || !empty($linked_chat_messages)) { ?>
            <div class="card shadow-sm">
              <div class="card-header bg-success text-white">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="card-title mb-0">
                    <i class="fas fa-comments mr-2"></i> Chat Conversation
                    <?php if (!empty($complaint['chat_thread_id'])) { ?>
                      <span class="badge badge-light ml-2">Thread: <?= $complaint['chat_thread_id'] ?></span>
                    <?php } ?>
                  </h6>
                  <div>
                    <?php if (!empty($linked_chat_messages)) { ?>
                      <span class="badge badge-info mr-2"><?= count($linked_chat_messages) ?> Linked</span>
                    <?php } ?>
                    <?php if (!empty($chat_messages)) { ?>
                      <span class="badge badge-light mr-2"><?= count($chat_messages) ?> Total</span>
                    <?php } ?>
                    <button type="button" class="btn btn-sm btn-light"
                      onclick="openChatWindow('<?= $complaint['chat_thread_id'] ?>')">
                      <i class="fas fa-external-link-alt"></i> Open Chat
                    </button>
                  </div>
                </div>
              </div>

              <!-- Chat Tabs -->
              <div class="card-body p-0">
                <ul class="nav nav-tabs" id="chatTabs" role="tablist">
                  <li class="nav-item">
                    <a class="nav-link active" id="linked-tab" data-toggle="tab" href="#linked-messages" role="tab">
                      <i class="fas fa-link mr-1"></i>Linked Messages (<?= count($linked_chat_messages) ?>)
                    </a>
                  </li>
                  <?php if (!empty($chat_messages)) { ?>
                    <li class="nav-item">
                      <a class="nav-link" id="all-tab" data-toggle="tab" href="#all-messages" role="tab">
                        <i class="fas fa-comments mr-1"></i>Full Conversation (<?= count($chat_messages) ?>)
                      </a>
                    </li>
                  <?php } ?>
                </ul>

                <div class="tab-content" id="chatTabContent">
                  <!-- Linked Messages Tab -->
                  <div class="tab-pane fade show active" id="linked-messages" role="tabpanel">
                    <div class="chat-container" style="max-height: 400px; overflow-y: auto;">
                      <?php if (!empty($linked_chat_messages)) { ?>
                        <?php foreach ($linked_chat_messages as $message) {
                          $is_helpdesk = ($message['sender_id'] == '11122233');
                        ?>
                          <div class="chat-message <?= $is_helpdesk ? 'helpdesk-message' : 'member-message' ?> linked-message"
                            data-message-id="<?= $message['message_id'] ?>"
                            data-link-type="<?= $message['link_type'] ?>">

                            <div class="message-header">
                              <div class="sender-info">
                                <strong><?= htmlspecialchars($message['sender_name'] ?: $message['sender_id']) ?></strong>
                                <small class="text-muted">(<?= $message['sender_id'] ?>)</small>
                                <span class="badge badge-<?= getLinkTypeBadgeClass($message['link_type']) ?> badge-sm ml-2">
                                  <?= $message['link_type'] ?>
                                </span>
                              </div>
                              <div class="message-actions">
                                <small class="text-muted"><?= date('M j, H:i', strtotime($message['message_created_at'])) ?></small>
                                <button class="btn btn-sm btn-link text-danger ml-2"
                                  onclick="unlinkMessage(<?= $message['message_id'] ?>)"
                                  title="Unlink this message">
                                  <i class="fas fa-unlink"></i>
                                </button>
                              </div>
                            </div>

                            <div class="message-content">
                              <?php if ($message['message_type'] == 'text') { ?>
                                <div class="message-text">
                                  <?= nl2br(htmlspecialchars($message['content'])) ?>
                                </div>
                              <?php } elseif ($message['message_type'] == 'image') { ?>
                                <div class="message-image">
                                  <i class="fas fa-image text-info mr-1"></i>
                                  <span class="text-muted">Image message</span>
                                  <?php if (!empty($message['content'])) { ?>
                                    <div class="caption mt-1"><?= nl2br(htmlspecialchars($message['content'])) ?></div>
                                  <?php } ?>
                                </div>
                              <?php } else { ?>
                                <div class="message-other">
                                  <i class="fas fa-paperclip text-secondary mr-1"></i>
                                  <span class="text-muted"><?= ucfirst($message['message_type']) ?> message</span>
                                  <?php if (!empty($message['content'])) { ?>
                                    <div class="caption mt-1"><?= nl2br(htmlspecialchars($message['content'])) ?></div>
                                  <?php } ?>
                                </div>
                              <?php } ?>

                              <!-- Show attachments -->
                              <?php if (!empty($message['attachments'])) { ?>
                                <div class="attachments mt-2">
                                  <?php foreach ($message['attachments'] as $attachment) { ?>
                                    <a href="<?= $attachment['file_url'] ?>" target="_blank"
                                      class="btn btn-sm btn-outline-secondary mr-1 mb-1">
                                      <i class="fas fa-paperclip mr-1"></i>Attachment
                                    </a>
                                  <?php } ?>
                                </div>
                              <?php } ?>

                              <!-- Link notes -->
                              <?php if (!empty($message['notes'])) { ?>
                                <div class="link-notes mt-2 p-2 bg-light rounded">
                                  <small class="text-muted">
                                    <i class="fas fa-sticky-note mr-1"></i>
                                    <strong>Link Notes:</strong> <?= htmlspecialchars($message['notes']) ?>
                                  </small>
                                </div>
                              <?php } ?>
                            </div>
                          </div>
                        <?php } ?>
                      <?php } else { ?>
                        <div class="text-center py-4">
                          <i class="fas fa-link fa-2x text-muted mb-2"></i>
                          <p class="text-muted">No chat messages linked to this complaint</p>
                          <?php if (!empty($chat_messages)) { ?>
                            <button class="btn btn-sm btn-outline-primary" data-toggle="tab" data-target="#all-messages">
                              View Full Conversation
                            </button>
                          <?php } ?>
                        </div>
                      <?php } ?>
                    </div>
                  </div>

                  <!-- All Messages Tab -->
                  <?php if (!empty($chat_messages)) { ?>
                    <div class="tab-pane fade" id="all-messages" role="tabpanel">
                      <div class="chat-container" style="max-height: 400px; overflow-y: auto;">
                        <div class="p-2 bg-light border-bottom">
                          <small class="text-muted">
                            <i class="fas fa-info-circle mr-1"></i>
                            Full conversation thread. Click on messages to link them to this complaint.
                          </small>
                        </div>

                        <?php
                        $helpdesk_id = '11122233';
                        foreach ($chat_messages as $message) {
                          $is_helpdesk = ($message['sender_id'] == $helpdesk_id);
                          $is_linked = !empty($message['is_linked']);
                        ?>
                          <div class="chat-message <?= $is_helpdesk ? 'helpdesk-message' : 'member-message' ?> <?= $is_linked ? 'already-linked' : 'linkable' ?>"
                            data-message-id="<?= $message['message_id'] ?>"
                            onclick="<?= $is_linked ? '' : 'linkMessage(' . $message['message_id'] . ')' ?>">

                            <div class="message-header">
                              <div class="sender-info">
                                <strong><?= htmlspecialchars($message['sender_name'] ?: $message['sender_id']) ?></strong>
                                <small class="text-muted">(<?= $message['sender_id'] ?>)</small>
                                <?php if ($is_linked) { ?>
                                  <span class="badge badge-success badge-sm ml-2">
                                    <i class="fas fa-check"></i> Linked
                                  </span>
                                <?php } ?>
                              </div>
                              <div class="message-actions">
                                <small class="text-muted"><?= date('M j, H:i', strtotime($message['created_at'])) ?></small>
                                <?php if (!$is_linked) { ?>
                                  <button class="btn btn-sm btn-link text-primary ml-2"
                                    onclick="event.stopPropagation(); linkMessage(<?= $message['message_id'] ?>)"
                                    title="Link to complaint">
                                    <i class="fas fa-link"></i>
                                  </button>
                                <?php } ?>
                              </div>
                            </div>

                            <div class="message-content">
                              <?php if ($message['message_type'] == 'text') { ?>
                                <div class="message-text">
                                  <?= nl2br(htmlspecialchars($message['content'])) ?>
                                </div>
                              <?php } elseif ($message['message_type'] == 'image') { ?>
                                <div class="message-image">
                                  <i class="fas fa-image text-info mr-1"></i>
                                  <span class="text-muted">Image message</span>
                                  <?php if (!empty($message['content'])) { ?>
                                    <div class="caption mt-1"><?= nl2br(htmlspecialchars($message['content'])) ?></div>
                                  <?php } ?>
                                </div>
                              <?php } else { ?>
                                <div class="message-other">
                                  <i class="fas fa-paperclip text-secondary mr-1"></i>
                                  <span class="text-muted"><?= ucfirst($message['message_type']) ?> message</span>
                                  <?php if (!empty($message['content'])) { ?>
                                    <div class="caption mt-1"><?= nl2br(htmlspecialchars($message['content'])) ?></div>
                                  <?php } ?>
                                </div>
                              <?php } ?>

                              <!-- Show attachments -->
                              <?php if (!empty($message['attachments'])) { ?>
                                <div class="attachments mt-2">
                                  <?php foreach ($message['attachments'] as $attachment) { ?>
                                    <a href="<?= $attachment['file_url'] ?>" target="_blank"
                                      class="btn btn-sm btn-outline-secondary mr-1 mb-1">
                                      <i class="fas fa-paperclip mr-1"></i>Attachment
                                    </a>
                                  <?php } ?>
                                </div>
                              <?php } ?>
                            </div>
                          </div>
                        <?php } ?>
                      </div>
                    </div>
                  <?php } ?>
                </div>
              </div>
            </div>
          <?php } elseif (!empty($complaint['member_id'])) { ?>
            <!-- No Chat Messages but Member Available -->
            <div class="card shadow-sm">
              <div class="card-header bg-warning text-dark">
                <h6 class="card-title mb-0">
                  <i class="fas fa-comments mr-2"></i>Chat Messages
                </h6>
              </div>
              <div class="card-body text-center py-4">
                <i class="fas fa-comments fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No Chat Conversation</h5>
                <p class="text-muted">No chat messages found for this complaint.</p>
                <a href="<?= base_url('ComplaintManagement/ComplaintManager/HelpDeskChat/' . $complaint['member_id']) ?>"
                  class="btn btn-outline-primary btn-sm" target="_blank">
                  <i class="fas fa-search mr-1"></i>Search Member's Chat History
                </a>
              </div>
            </div>
          <?php } elseif (!empty($chat_messages)) { ?>
            <div class="card shadow-sm">
              <div class="card-header bg-warning text-dark">
                <h6 class="card-title mb-0">
                  <i class="fas fa-comments mr-2"></i>Chat Messages
                </h6>
              </div>
              <div class="card-body">
                <?php foreach ($chat_messages as $message) { ?>
                  <div class="chat-message <?= ($message['sender_id'] == '11122233') ? 'support' : 'member' ?>">
                    <div class="message-header">
                      <strong><?= $message['sender_name'] ?: 'Unknown' ?></strong>
                      <small class="text-muted ml-2">
                        <?= date('M j, H:i', strtotime($message['created_at'])) ?>
                      </small>
                    </div>
                    <div class="message-content">
                      <?= nl2br(htmlspecialchars($message['content'])) ?>
                    </div>
                  </div>
                <?php } ?>
              </div>
            </div>
        </div>
      <?php } ?>

      <!-- Send Help Desk Message -->
      <?php if ($can_edit) { ?>
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white">
            <h6 class="card-title mb-0">
              <i class="fas fa-paper-plane mr-2"></i>Send Help Desk Message
            </h6>
          </div>
          <div class="card-body">
            <form id="helpDeskMessageForm">
              <input type="hidden" name="complaint_id" value="<?= $complaint['complaint_id'] ?>">

              <div class="form-group">
                <label for="help_desk_message">Message to Member</label>
                <textarea class="form-control" id="help_desk_message" name="message" rows="3"
                  placeholder="Type your message to the member..." required></textarea>
              </div>

              <div class="form-group form-check">
                <input type="checkbox" class="form-check-input" id="attach_to_complaint" name="attach_to_complaint" checked>
                <label class="form-check-label" for="attach_to_complaint">
                  <small>Link this message to the complaint for audit trail</small>
                </label>
              </div>

              <div class="form-group mb-0">
                <button type="submit" class="btn btn-primary">
                  <i class="fas fa-paper-plane mr-1"></i>Send Message
                </button>
                <button type="button" class="btn btn-outline-secondary ml-2" onclick="$('#help_desk_message').val('')">
                  <i class="fas fa-times mr-1"></i>Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      <?php } ?>

      </div>
    </div>

</div>
</section>
</div>

<!-- Modals -->

<!-- Update Status Modal -->
<div class="modal fade" id="updateStatusModal" tabindex="-1" role="dialog" aria-labelledby="updateStatusModalLabel">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header bg-primary text-white">
        <h5 class="modal-title" id="updateStatusModalLabel">
          <i class="fas fa-edit mr-2"></i>Update Complaint Status
        </h5>
        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <form id="updateStatusForm">
        <div class="modal-body p-4">
          <input type="hidden" name="complaint_id" value="<?= $complaint['complaint_id'] ?>">

          <!-- Current Status Display -->
          <div class="alert alert-info d-flex align-items-center mb-4">
            <i class="fas fa-info-circle fa-2x mr-3"></i>
            <div>
              <strong>Current Status:</strong>
              <span class="badge badge-<?= getStatusBadgeClass($complaint['status']) ?> ml-2">
                <?= $complaint['status'] ?>
              </span>
              <br>
              <small class="text-muted">Select a new status from the available transitions below.</small>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label for="new_status" class="font-weight-bold">
                  <i class="fas fa-exchange-alt mr-1"></i>New Status *
                </label>
                <select name="new_status" id="new_status" class="form-control form-control-lg" required>
                  <option value="">-- Select New Status --</option>
                  <?php
                  $current_status = $complaint['status'];
                  $allowed_transitions = [
                    'NEW' => ['ASSIGNED', 'IN_PROGRESS', 'CANCELLED'],
                    'ASSIGNED' => ['IN_PROGRESS', 'CANCELLED'],
                    'IN_PROGRESS' => ['RESOLVED', 'CANCELLED'],
                    'RESOLVED' => ['CLOSED', 'IN_PROGRESS'],
                    'CLOSED' => ['IN_PROGRESS'],
                    'CANCELLED' => ['NEW']
                  ];

                  if (isset($allowed_transitions[$current_status])) {
                    foreach ($allowed_transitions[$current_status] as $status) {
                      echo "<option value='$status'>$status</option>";
                    }
                  }
                  ?>
                </select>
                <small class="form-text text-muted">Only valid status transitions are shown</small>
              </div>
            </div>

            <div class="col-md-6">
              <div class="status-preview" id="statusPreview" style="display: none;">
                <label class="font-weight-bold">
                  <i class="fas fa-eye mr-1"></i>Preview
                </label>
                <div class="p-3 border rounded bg-light">
                  <div class="d-flex align-items-center">
                    <span class="badge badge-secondary mr-2" id="currentStatusBadge">
                      <?= $complaint['status'] ?>
                    </span>
                    <i class="fas fa-arrow-right mx-2"></i>
                    <span class="badge" id="newStatusBadge"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="remarks" class="font-weight-bold">
              <i class="fas fa-comment mr-1"></i>Remarks
            </label>
            <textarea name="remarks" id="remarks" class="form-control" rows="4"
              placeholder="Enter detailed remarks about this status change (optional)"></textarea>
            <small class="form-text text-muted">Provide context or reasoning for this status change</small>
          </div>

          <div class="form-group" id="resolutionGroup" style="display: none;">
            <label for="resolution_summary" class="font-weight-bold text-success">
              <i class="fas fa-check-circle mr-1"></i>Resolution Summary *
            </label>
            <textarea name="resolution_summary" id="resolution_summary" class="form-control" rows="4"
              placeholder="Provide a detailed summary of how the complaint was resolved"></textarea>
            <small class="form-text text-muted">This will be visible to the customer</small>
          </div>
        </div>
        <div class="modal-footer bg-light">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">
            <i class="fas fa-times mr-1"></i>Cancel
          </button>
          <button type="submit" class="btn btn-primary" id="updateStatusBtn">
            <i class="fas fa-save mr-1"></i>Update Status
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Assign Modal -->
<div class="modal fade" id="assignModal" tabindex="-1" role="dialog" aria-labelledby="assignModalLabel">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header bg-warning text-dark">
        <h5 class="modal-title" id="assignModalLabel">
          <i class="fas fa-user-plus mr-2"></i>Assign Complaint
        </h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <form id="assignForm">
        <div class="modal-body p-4">
          <input type="hidden" name="complaint_id" value="<?= $complaint['complaint_id'] ?>">

          <!-- Current Assignment Display -->
          <div class="alert alert-info d-flex align-items-center mb-4">
            <i class="fas fa-user fa-2x mr-3"></i>
            <div>
              <strong>Current Assignment:</strong>
              <?php if (!empty($complaint['assigned_to'])) { ?>
                <span class="badge badge-warning ml-2"><?= $complaint['assigned_to'] ?></span>
                <br><small class="text-muted">Assigned on <?= date('M j, Y H:i', strtotime($complaint['assigned_at'])) ?></small>
              <?php } else { ?>
                <span class="badge badge-secondary ml-2">Unassigned</span>
                <br><small class="text-muted">No one is currently assigned to this complaint</small>
              <?php } ?>
            </div>
          </div>

          <div class="form-group">
            <label for="assign_to" class="font-weight-bold">
              <i class="fas fa-users mr-1"></i>Assign To *
            </label>
            <select name="assign_to" id="assign_to" class="form-control form-control-lg" required>
              <option value="">-- Select Assignee --</option>
              <?php foreach ($assignees as $assignee) { ?>
                <option value="<?= $assignee['user_code'] ?>"
                  <?= ($assignee['user_code'] == $complaint['assigned_to']) ? 'selected' : '' ?>
                  data-name="<?= htmlspecialchars($assignee['name']) ?>">
                  <?= $assignee['name'] ?> (<?= $assignee['user_code'] ?>)
                </option>
              <?php } ?>
            </select>
            <small class="form-text text-muted">Select the team member to handle this complaint</small>
          </div>

          <div class="form-group">
            <label for="assign_remarks" class="font-weight-bold">
              <i class="fas fa-sticky-note mr-1"></i>Assignment Notes
            </label>
            <textarea name="remarks" id="assign_remarks" class="form-control" rows="4"
              placeholder="Add notes about this assignment (optional)"></textarea>
            <small class="form-text text-muted">Provide context or special instructions for the assignee</small>
          </div>
        </div>
        <div class="modal-footer bg-light">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">
            <i class="fas fa-times mr-1"></i>Cancel
          </button>
          <button type="submit" class="btn btn-warning" id="assignBtn">
            <i class="fas fa-user-check mr-1"></i>Assign Complaint
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Add Comment Modal -->
<div class="modal fade" id="addCommentModal" tabindex="-1" role="dialog" aria-labelledby="addCommentModalLabel">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header bg-info text-white">
        <h5 class="modal-title" id="addCommentModalLabel">
          <i class="fas fa-comment mr-2"></i>Add Comment
        </h5>
        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <form id="addCommentForm">
        <div class="modal-body p-4">
          <input type="hidden" name="complaint_id" value="<?= $complaint['complaint_id'] ?>">

          <div class="alert alert-info">
            <i class="fas fa-info-circle mr-2"></i>
            <strong>Note:</strong> Comments are internal and will be visible to all team members with access to this complaint.
          </div>

          <div class="form-group">
            <label for="comment" class="font-weight-bold">
              <i class="fas fa-edit mr-1"></i>Comment *
            </label>
            <textarea name="comment" id="comment" class="form-control" rows="6"
              placeholder="Enter your detailed comment here..." required></textarea>
            <small class="form-text text-muted">
              <i class="fas fa-clock mr-1"></i>
              This comment will be timestamped and attributed to you.
            </small>
          </div>
        </div>
        <div class="modal-footer bg-light">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">
            <i class="fas fa-times mr-1"></i>Cancel
          </button>
          <button type="submit" class="btn btn-info" id="addCommentBtn">
            <i class="fas fa-plus mr-1"></i>Add Comment
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Image View Modal -->
<div class="modal fade" id="imageViewModal" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Image Preview</h5>
        <button type="button" class="close" data-dismiss="modal">
          <span>&times;</span>
        </button>
      </div>
      <div class="modal-body text-center">
        <img id="modalImage" src="" class="img-fluid">
      </div>
    </div>
  </div>
</div>

<!-- Link Chat Message Modal -->
<div class="modal fade" id="linkChatMessageModal" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Link Chat Message to Complaint</h5>
        <button type="button" class="close" data-dismiss="modal">
          <span>&times;</span>
        </button>
      </div>
      <form id="linkChatMessageForm">
        <div class="modal-body">
          <input type="hidden" id="link_message_id" name="message_id">
          <input type="hidden" id="link_complaint_id" name="complaint_id">

          <div class="form-group">
            <label for="link_type">Link Type *</label>
            <select class="form-control" id="link_type" name="link_type" required>
              <option value="CONTEXT">Context - General conversation context</option>
              <option value="EVIDENCE">Evidence - Screenshot or proof</option>
              <option value="TRIGGER">Trigger - Message that initiated complaint</option>
              <option value="RESOLUTION">Resolution - Message related to solution</option>
            </select>
            <small class="form-text text-muted">
              Select how this message relates to the complaint
            </small>
          </div>

          <div class="form-group">
            <label for="link_notes">Notes</label>
            <textarea class="form-control" id="link_notes" name="notes" rows="3"
              placeholder="Optional notes about why this message is linked"></textarea>
          </div>

          <div class="alert alert-info">
            <i class="fas fa-info-circle mr-1"></i>
            <strong>Note:</strong> This will link the selected chat message to this complaint for better context and tracking.
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-link mr-1"></i>Link Message
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

<?php include(APPPATH . 'views/' . $role . '/footer.php'); ?>

<script>
  $(document).ready(function() {
    // Initialize tooltips
    $('[data-toggle="tooltip"]').tooltip();

    // Status preview functionality
    $('#new_status').change(function() {
      var status = $(this).val();
      if (status) {
        $('#statusPreview').show();
        var badgeClass = getStatusBadgeClass(status);
        $('#newStatusBadge').removeClass().addClass('badge badge-' + badgeClass).text(status);

        // Show/hide resolution group
        if (status === 'RESOLVED' || status === 'CLOSED') {
          $('#resolutionGroup').slideDown();
          $('#resolution_summary').prop('required', true);
        } else {
          $('#resolutionGroup').slideUp();
          $('#resolution_summary').prop('required', false);
        }
      } else {
        $('#statusPreview').hide();
        $('#resolutionGroup').slideUp();
        $('#resolution_summary').prop('required', false);
      }
    });

    // Enhanced form validation and submission
    $('#updateStatusForm').submit(function(e) {
      e.preventDefault();

      var $submitBtn = $('#updateStatusBtn');
      var originalText = $submitBtn.html();

      // Show loading state
      $submitBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i>Updating...');

      $.ajax({
        url: '<?= base_url('ComplaintManagement/ComplaintManager/UpdateStatus') ?>',
        type: 'POST',
        data: $(this).serialize(),
        dataType: 'json',
        success: function(response) {
          if (response.success) {
            // Show success message with better styling
            toastr.success(response.message, 'Status Updated!', {
              timeOut: 3000,
              progressBar: true
            });

            // Close modal with fade effect
            $('#updateStatusModal').modal('hide');

            // Reload page after delay
            setTimeout(function() {
              location.reload();
            }, 1500);
          } else {
            toastr.error(response.message, 'Update Failed');
          }
        },
        error: function(xhr, status, error) {
          console.error('Update Status Error:', error);
          toastr.error('An error occurred while updating status. Please try again.', 'System Error');
        },
        complete: function() {
          // Restore button state
          $submitBtn.prop('disabled', false).html(originalText);
        }
      });
    });

    // Enhanced assign form
    $('#assignForm').submit(function(e) {
      e.preventDefault();

      var $submitBtn = $('#assignBtn');
      var originalText = $submitBtn.html();
      var assigneeName = $('#assign_to option:selected').data('name');

      // Show loading state
      $submitBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i>Assigning...');

      $.ajax({
        url: '<?= base_url('ComplaintManagement/ComplaintManager/AssignComplaint') ?>',
        type: 'POST',
        data: $(this).serialize(),
        dataType: 'json',
        success: function(response) {
          if (response.success) {
            toastr.success(response.message, 'Assignment Successful!', {
              timeOut: 3000,
              progressBar: true
            });

            $('#assignModal').modal('hide');

            setTimeout(function() {
              location.reload();
            }, 1500);
          } else {
            toastr.error(response.message, 'Assignment Failed');
          }
        },
        error: function(xhr, status, error) {
          console.error('Assignment Error:', error);
          toastr.error('An error occurred while assigning complaint. Please try again.', 'System Error');
        },
        complete: function() {
          $submitBtn.prop('disabled', false).html(originalText);
        }
      });
    });

    // Enhanced comment form
    $('#addCommentForm').submit(function(e) {
      e.preventDefault();

      var $submitBtn = $('#addCommentBtn');
      var originalText = $submitBtn.html();

      // Show loading state
      $submitBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i>Adding...');

      $.ajax({
        url: '<?= base_url('ComplaintManagement/ComplaintManager/AddComment') ?>',
        type: 'POST',
        data: $(this).serialize(),
        dataType: 'json',
        success: function(response) {
          if (response.success) {
            toastr.success(response.message, 'Comment Added!', {
              timeOut: 3000,
              progressBar: true
            });

            $('#addCommentModal').modal('hide');

            setTimeout(function() {
              location.reload();
            }, 1500);
          } else {
            toastr.error(response.message, 'Failed to Add Comment');
          }
        },
        error: function(xhr, status, error) {
          console.error('Add Comment Error:', error);
          toastr.error('An error occurred while adding comment. Please try again.', 'System Error');
        },
        complete: function() {
          $submitBtn.prop('disabled', false).html(originalText);
        }
      });
    });

    // Enhanced help desk message form
    $('#helpDeskMessageForm').submit(function(e) {
      e.preventDefault();

      var $submitBtn = $(this).find('button[type="submit"]');
      var originalText = $submitBtn.html();

      // Validate message content
      var message = $('#help_desk_message').val().trim();
      if (message.length < 10) {
        toastr.warning('Please enter a more detailed message (at least 10 characters).', 'Message Too Short');
        return;
      }

      $submitBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i>Sending...');

      $.ajax({
        url: '<?= base_url('ComplaintManagement/ComplaintManager/SendHelpDeskMessage') ?>',
        type: 'POST',
        data: $(this).serialize(),
        dataType: 'json',
        success: function(response) {
          if (response.success) {
            toastr.success(response.message, 'Message Sent!', {
              timeOut: 3000,
              progressBar: true
            });

            $('#help_desk_message').val('');

            setTimeout(function() {
              location.reload();
            }, 1500);
          } else {
            toastr.error(response.message, 'Failed to Send Message');
          }
        },
        error: function(xhr, status, error) {
          console.error('Send Message Error:', error);
          toastr.error('An error occurred while sending message. Please try again.', 'System Error');
        },
        complete: function() {
          $submitBtn.prop('disabled', false).html(originalText);
        }
      });
    });

    // Reset forms when modals are hidden
    $('.modal').on('hidden.bs.modal', function() {
      $(this).find('form')[0].reset();
      $(this).find('.is-invalid').removeClass('is-invalid');
      $(this).find('.invalid-feedback').remove();
      $('#statusPreview').hide();
      $('#resolutionGroup').hide();
    });

    // Auto-resize textareas
    $('textarea').on('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });
  });

  // Helper function for status badge classes
  function getStatusBadgeClass(status) {
    switch (status) {
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

  // Modal functions
  function showUpdateStatusModal() {
    $('#updateStatusModal').modal('show');
  }

  function showAssignModal() {
    $('#assignModal').modal('show');
  }

  function showAddCommentModal() {
    $('#addCommentModal').modal('show');
  }

  function viewImage(imageUrl) {
    $('#modalImage').attr('src', imageUrl);
    $('#imageViewModal').modal('show');
  }

  function openChatWindow(threadId) {
    // Open chat window in new tab
    if (threadId) {
      var chatUrl = '<?= base_url('ComplaintManagement/ComplaintManager/HelpDeskChat/') ?>';
      window.open(chatUrl, '_blank');
    } else {
      toastr.info('No chat thread linked to this complaint');
    }
  }

  // Chat integration functions
  function linkMessage(messageId) {
    $('#link_message_id').val(messageId);
    $('#link_complaint_id').val('<?= $complaint['complaint_id'] ?>');
    $('#linkChatMessageModal').modal('show');
  }

  function unlinkMessage(messageId) {
    if (confirm('Are you sure you want to unlink this message from the complaint?')) {
      $.ajax({
        url: '<?= base_url('ComplaintManagement/ComplaintManager/UnlinkChatMessage') ?>',
        type: 'POST',
        data: {
          complaint_id: '<?= $complaint['complaint_id'] ?>',
          message_id: messageId
        },
        dataType: 'json',
        success: function(response) {
          if (response.success) {
            toastr.success(response.message);
            setTimeout(function() {
              location.reload();
            }, 1500);
          } else {
            toastr.error(response.message);
          }
        },
        error: function() {
          toastr.error('An error occurred while unlinking message');
        }
      });
    }
  }

  // Submit link chat message form
  $(document).ready(function() {
    $('#linkChatMessageForm').on('submit', function(e) {
      e.preventDefault();

      $.ajax({
        url: '<?= base_url('ComplaintManagement/ComplaintManager/LinkChatMessage') ?>',
        type: 'POST',
        data: $(this).serialize(),
        dataType: 'json',
        success: function(response) {
          if (response.success) {
            toastr.success(response.message);
            $('#linkChatMessageModal').modal('hide');
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
  });

  function printComplaint() {
    window.print();
  }

  function exportComplaint() {
    var complaintId = '<?= $complaint['complaint_id'] ?>';
    var exportUrl = '<?= base_url('ComplaintManagement/ComplaintManager/ExportComplaint/') ?>' + complaintId;
    window.open(exportUrl, '_blank');
  }

  // New function for viewing member complaints
  function viewMemberComplaints(memberId) {
    var url = '<?= base_url('ComplaintManagement/ComplaintManager/ComplaintsList?member_id=') ?>' + memberId;
    window.open(url, '_blank');
  }
</script>

<style>
  /* Enhanced Action Toolbar */
  .action-toolbar .btn-toolbar {
    gap: 0.5rem;
  }

  .action-toolbar .btn-group {
    flex-wrap: wrap;
  }

  /* Enhanced Page Header */
  .page-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(0, 123, 255, 0.1), rgba(0, 123, 255, 0.2));
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(0, 123, 255, 0.3);
  }

  .page-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: #2c3e50;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .page-subtitle {
    color: #6c757d;
    font-size: 0.9rem;
  }

  .modern-breadcrumb {
    background: none;
    padding: 0;
    font-size: 0.85rem;
  }

  .modern-breadcrumb .breadcrumb-item+.breadcrumb-item::before {
    content: ">";
    color: #6c757d;
  }

  /* Enhanced Complaint Details Card */
  .complaint-details-card .status-summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 0.5rem;
    border: 1px solid #e9ecef;
  }

  .status-item {
    text-align: center;
  }

  .status-label {
    font-size: 0.8rem;
    color: #6c757d;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .status-value {
    font-size: 0.9rem;
  }

  .badge-lg {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }

  .detail-group {
    margin-bottom: 1.5rem;
  }

  .detail-group-title {
    color: #495057;
    font-weight: 600;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e9ecef;
  }

  .detail-table {
    background: #ffffff;
  }

  .detail-row {
    display: flex;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f8f9fa;
  }

  .detail-row:last-child {
    border-bottom: none;
  }

  .detail-label {
    flex: 0 0 40%;
    font-weight: 600;
    color: #6c757d;
    font-size: 0.9rem;
  }

  .detail-value {
    flex: 1;
    color: #495057;
    font-size: 0.9rem;
  }

  .description-content,
  .resolution-content {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border-left: 4px solid #007bff;
    line-height: 1.6;
    color: #495057;
  }

  .resolution-content {
    background: #d4edda;
    border-left-color: #28a745;
  }

  /* Enhanced Member Info Card */
  .member-info-card .member-details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .member-detail {
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 0.5rem;
    border-left: 4px solid #17a2b8;
  }

  .member-detail .detail-label {
    font-size: 0.8rem;
    color: #6c757d;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    font-weight: 600;
  }

  .member-detail .detail-value {
    font-size: 0.95rem;
    color: #495057;
  }

  .member-actions-panel {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e9ecef;
  }

  .member-actions-panel h6 {
    color: #495057;
    font-weight: 600;
  }

  /* Enhanced Attachments */
  .attachments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .attachment-item {
    background: #ffffff;
    border: 1px solid #e9ecef;
    border-radius: 0.5rem;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .attachment-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .attachment-preview {
    position: relative;
    height: 120px;
    overflow: hidden;
  }

  .image-preview {
    position: relative;
    cursor: pointer;
    height: 100%;
  }

  .attachment-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    color: white;
    font-size: 1.5rem;
  }

  .image-preview:hover .image-overlay {
    opacity: 1;
  }

  .file-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: #f8f9fa;
  }

  .file-icon {
    font-size: 3rem;
  }

  .attachment-info {
    padding: 1rem;
  }

  .attachment-name {
    font-weight: 600;
    color: #495057;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .attachment-meta {
    margin-bottom: 1rem;
  }

  .attachment-type {
    font-size: 0.7rem;
    margin-right: 0.5rem;
  }

  .attachment-date {
    font-size: 0.8rem;
    display: block;
    margin-top: 0.25rem;
  }

  /* Enhanced Timeline */
  .timeline-container {
    padding: 1.5rem;
    max-height: 500px;
    overflow-y: auto;
  }

  .timeline {
    position: relative;
    padding: 0;
  }

  .timeline::before {
    content: '';
    position: absolute;
    left: 25px;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(to bottom, #007bff, #e9ecef);
    border-radius: 1.5px;
  }

  .timeline-item {
    position: relative;
    padding-left: 70px;
    margin-bottom: 2rem;
  }

  .timeline-item.latest .timeline-content {
    background: linear-gradient(135deg, #e3f2fd, #f8f9fa);
    border-left-color: #007bff;
    border-left-width: 4px;
  }

  .timeline-marker {
    position: absolute;
    left: 15px;
    top: 0;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 11px;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 2;
  }

  .timeline-content {
    background: #ffffff;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border-left: 3px solid #e9ecef;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }

  .timeline-content:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .timeline-header {
    display: flex;
    justify-content: between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .timeline-title {
    margin-bottom: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: #495057;
    flex: 1;
  }

  .timeline-meta {
    flex-shrink: 0;
  }

  .timeline-time {
    font-size: 0.8rem;
    color: #6c757d;
  }

  .timeline-description {
    font-size: 0.9rem;
    color: #6c757d;
    line-height: 1.5;
    margin-bottom: 0.75rem;
  }

  .timeline-footer {
    border-top: 1px solid #f8f9fa;
    padding-top: 0.75rem;
  }

  .action-by {
    font-size: 0.85rem;
    color: #6c757d;
  }

  .role-badge {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }

  .empty-timeline {
    text-align: center;
    padding: 3rem 1.5rem;
  }

  .empty-icon {
    font-size: 3rem;
    color: #dee2e6;
    margin-bottom: 1rem;
  }

  .empty-timeline h6 {
    color: #6c757d;
    margin-bottom: 0.5rem;
  }

  /* Enhanced Card Styling */
  .card {
    border-radius: 0.75rem;
    border: none;
    overflow: hidden;
  }

  .card-header {
    border-radius: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    font-weight: 600;
  }

  .card-header h6 {
    font-size: 0.95rem;
  }

  /* Enhanced Badge Colors */
  .badge-outline-secondary {
    color: #6c757d;
    border: 1px solid #6c757d;
    background: transparent;
  }

  /* Responsive Design Improvements */
  @media (max-width: 768px) {
    .page-title {
      font-size: 1.4rem;
    }

    .status-summary-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .member-details-grid {
      grid-template-columns: 1fr;
    }

    .attachments-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }

    .timeline-container {
      padding: 1rem;
    }

    .timeline-item {
      padding-left: 50px;
    }

    .timeline::before {
      left: 20px;
    }

    .timeline-marker {
      left: 10px;
      width: 20px;
      height: 20px;
      font-size: 10px;
    }
  }

  @media (max-width: 576px) {
    .status-summary-grid {
      grid-template-columns: 1fr;
    }

    .detail-row {
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-label {
      flex: none;
      font-size: 0.8rem;
    }
  }

  /* Print styles */
  @media print {

    .content-header,
    .card-header .btn,
    .btn,
    .modal,
    .action-toolbar,
    .member-actions,
    .member-actions-panel {
      display: none !important;
    }

    .card {
      border: 1px solid #dee2e6 !important;
      box-shadow: none !important;
      break-inside: avoid;
    }

    .timeline-container {
      max-height: none;
      overflow: visible;
    }
  }

  /* Chat Message Styles */
  .chat-container {
    background: #f8f9fa;
    padding: 15px;
  }

  .chat-message {
    margin: 0;
    margin-bottom: 15px;
    padding: 12px;
    border-radius: 8px;
    position: relative;
    transition: all 0.2s ease;
    max-width: 80%;
  }

  .chat-message:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  .member-message {
    background: white;
    border-left: 4px solid #007bff;
    margin-right: 50px;
  }

  .helpdesk-message {
    background: #e3f2fd;
    border-left: 4px solid #2196f3;
    float: right;
  }

  .linked-message {
    border: 2px solid #28a745 !important;
    background: #f8fff9 !important;
  }

  .already-linked {
    opacity: 0.7;
    border: 1px solid #6c757d !important;
  }

  .linkable {
    cursor: pointer;
  }

  .linkable:hover {
    background: #fff3cd !important;
    border-color: #ffc107 !important;
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .sender-info {
    flex: 1;
  }

  .sender-info strong {
    color: #495057;
    font-size: 0.9rem;
  }

  .message-actions {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .message-content {
    line-height: 1.4;
  }

  .message-text {
    color: #495057;
  }

  .message-image,
  .message-other {
    color: #6c757d;
  }

  .caption {
    font-size: 0.9rem;
    color: #6c757d;
    font-style: italic;
  }

  .attachments .btn {
    font-size: 0.8rem;
  }

  .link-notes {
    font-size: 0.85rem;
  }

  .nav-tabs .nav-link {
    border-radius: 0;
    border: none;
    border-bottom: 2px solid transparent;
  }

  .nav-tabs .nav-link.active {
    border-bottom-color: #007bff;
  }

  #chatTabContent {
    border-top: 1px solid #dee2e6;
  }

  /* Enhanced Modal Styles */
  .modal-content {
    border-radius: 0.75rem;
    border: none;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    border-radius: 0.75rem 0.75rem 0 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .modal-footer {
    border-radius: 0 0 0.75rem 0.75rem;
    border-top: 1px solid #e9ecef;
  }

  .modal-body {
    position: relative;
  }

  .modal-backdrop {
    background-color: rgba(0, 0, 0, 0.6);
  }

  /* Form Enhancements */
  .form-control:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }

  .form-control-lg {
    border-radius: 0.5rem;
  }

  .form-group label {
    font-size: 0.9rem;
  }

  .form-text {
    font-size: 0.8rem;
  }

  /* Button Enhancements */
  .btn {
    border-radius: 0.5rem;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .btn-group .btn:hover {
    transform: none;
  }

  /* Loading States */
  .btn:disabled {
    opacity: 0.7;
    transform: none !important;
    box-shadow: none !important;
  }

  /* Toast Notifications Enhancement */
  .toast-success {
    background-color: #28a745 !important;
  }

  .toast-error {
    background-color: #dc3545 !important;
  }

  .toast-warning {
    background-color: #ffc107 !important;
    color: #212529 !important;
  }

  /* Enhanced Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  /* Animation Classes */
  @keyframes slideInUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }

    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  .slide-in-up {
    animation: slideInUp 0.4s ease-out;
  }

  .fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  /* Accessibility Improvements */
  .btn:focus,
  .form-control:focus,
  .modal:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }

  /* Dark mode friendly */
  @media (prefers-color-scheme: dark) {
    .card {
      background-color: #2d3748;
      color: #e2e8f0;
    }

    .text-muted {
      color: #a0aec0 !important;
    }
  }
</style>

<?php
// Helper functions for timeline and actions
function getActionBadgeClass($action_type)
{
  switch ($action_type) {
    case 'CREATE':
      return 'success';
    case 'ASSIGN':
      return 'warning';
    case 'STATUS_UPDATE':
      return 'info';
    case 'ADD_COMMENT':
      return 'secondary';
    case 'RESOLVE':
      return 'success';
    case 'CLOSE':
      return 'dark';
    case 'CANCEL':
      return 'danger';
    default:
      return 'primary';
  }
}

function getActionIcon($action_type)
{
  switch ($action_type) {
    case 'CREATE':
      return 'fa-plus';
    case 'ASSIGN':
      return 'fa-user';
    case 'STATUS_UPDATE':
      return 'fa-edit';
    case 'ADD_COMMENT':
      return 'fa-comment';
    case 'RESOLVE':
      return 'fa-check';
    case 'CLOSE':
      return 'fa-archive';
    case 'CANCEL':
      return 'fa-times';
    default:
      return 'fa-circle';
  }
}

// Helper function for link type badge classes
function getLinkTypeBadgeClass($link_type)
{
  switch ($link_type) {
    case 'TRIGGER':
      return 'danger';
    case 'EVIDENCE':
      return 'warning';
    case 'CONTEXT':
      return 'info';
    case 'RESOLUTION':
      return 'success';
    default:
      return 'secondary';
  }
}

function getActionDescription($action)
{
  $desc = '';
  if (!empty($action['old_status']) && !empty($action['new_status'])) {
    $desc .= "Status changed from {$action['old_status']} to {$action['new_status']}";
  }
  if (!empty($action['old_assigned_to']) && !empty($action['new_assigned_to'])) {
    if ($desc) $desc .= '. ';
    $desc .= "Reassigned from {$action['old_assigned_to']} to {$action['new_assigned_to']}";
  } elseif (!empty($action['new_assigned_to'])) {
    if ($desc) $desc .= '. ';
    $desc .= "Assigned to {$action['new_assigned_to']}";
  }
  return $desc ?: 'Action performed';
}

// Badge class functions (same as other views)
function getBadgeClass($category)
{
  switch ($category) {
    case 'TRANSACTION':
      return 'danger';
    case 'ACCOUNT':
      return 'warning';
    case 'TECHNICAL':
      return 'info';
    case 'BILLING':
      return 'secondary';
    case 'KYC':
      return 'primary';
    default:
      return 'light';
  }
}

function getPriorityBadgeClass($priority)
{
  switch ($priority) {
    case 'URGENT':
      return 'danger';
    case 'HIGH':
      return 'warning';
    case 'MEDIUM':
      return 'info';
    case 'LOW':
      return 'secondary';
    default:
      return 'light';
  }
}

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
?>