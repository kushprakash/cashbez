<?php include(APPPATH . 'views/' . $role . '/header.php'); ?>

<!-- Content Wrapper. Contains page content -->
<div class="content-wrapper">
  <!-- Content Header (Page header) -->
  <section class="content-header">
    <div class="container-fluid">
      <div class="row align-items-center mb-3">
        <div class="col-sm-6">
          <div class="d-flex align-items-center">
            <div class="page-icon mr-3">
              <i class="fas fa-list text-primary"></i>
            </div>
            <div>
              <h1 class="page-title mb-0"><?= $title ?></h1>
              <p class="page-subtitle mb-0">
                Manage and track all customer complaints
                <?php if ($role != 'SuperAdmin') { ?>
                  <small class="text-info d-block">Your role: <?= $role ?></small>
                <?php } ?>
              </p>
            </div>
          </div>
        </div>
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right modern-breadcrumb">
            <li class="breadcrumb-item"><a href="<?= base_url($role . '/Home'); ?>"><i class="fas fa-home mr-1"></i>Home</a></li>
            <li class="breadcrumb-item"><a href="<?= base_url('ComplaintManagement/ComplaintManager'); ?>"><i class="fas fa-headset mr-1"></i>Complaint Manager</a></li>
            <li class="breadcrumb-item active"><i class="fas fa-list mr-1"></i>Complaints List</li>
          </ol>
        </div>
      </div>

      <!-- Quick Navigation -->
      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body py-2">
              <div class="d-flex justify-content-between flex-wrap">
                <a href="<?= base_url('ComplaintManagement/ComplaintManager'); ?>" 
                   class="btn btn-outline-primary btn-sm mr-2 mb-2">
                  <i class="fas fa-tachometer-alt mr-1"></i>Dashboard
                </a>
                <a href="<?= base_url('ComplaintManagement/ComplaintManager/ComplaintsList'); ?>" 
                   class="btn btn-primary btn-sm mr-2 mb-2 active">
                  <i class="fas fa-list mr-1"></i>All Complaints
                </a>
                <a href="<?= base_url('ComplaintManagement/ComplaintManager/HelpDeskChat'); ?>" 
                   class="btn btn-outline-info btn-sm mr-2 mb-2">
                  <i class="fas fa-comments mr-1"></i>Help Desk Chat
                </a>
                <a href="<?= base_url('ComplaintManagement/ComplaintManager/CreateComplaint'); ?>" 
                   class="btn btn-outline-success btn-sm mr-2 mb-2">
                  <i class="fas fa-plus mr-1"></i>Create Complaint
                </a>
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
      
      <!-- Statistics Summary -->
      <div class="row mb-4">
        <div class="col-md-12">
          <div class="card border-0 bg-gradient-info text-white">
            <div class="card-body py-3">
              <div class="d-flex align-items-center">
                <div class="mr-3">
                  <i class="fas fa-chart-bar fa-2x opacity-75"></i>
                </div>
                <div>
                  <h4 class="mb-0 text-white"><?= number_format($complaint_count) ?></h4>
                  <p class="mb-0 opacity-75">Total Complaints Found</p>
                  <?php if (!empty(array_filter($filters))) { ?>
                    <small class="opacity-75">Filtered results</small>
                  <?php } ?>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-light">
          <h6 class="card-title mb-0">
            <i class="fas fa-filter mr-2"></i>Filters
            <button type="button" class="btn btn-sm btn-outline-secondary ml-2" id="clearFilters">
              <i class="fas fa-times mr-1"></i>Clear All
            </button>
          </h6>
        </div>
        <div class="card-body">
          <form method="GET" id="filterForm">
            <div class="row">
              <div class="col-md-2">
                <div class="form-group">
                  <label for="status">Status</label>
                  <select name="status" id="status" class="form-control form-control-sm">
                    <option value="">All Status</option>
                    <option value="NEW" <?= ($filters['status'] == 'NEW') ? 'selected' : '' ?>>New</option>
                    <option value="ASSIGNED" <?= ($filters['status'] == 'ASSIGNED') ? 'selected' : '' ?>>Assigned</option>
                    <option value="IN_PROGRESS" <?= ($filters['status'] == 'IN_PROGRESS') ? 'selected' : '' ?>>In Progress</option>
                    <option value="RESOLVED" <?= ($filters['status'] == 'RESOLVED') ? 'selected' : '' ?>>Resolved</option>
                    <option value="CLOSED" <?= ($filters['status'] == 'CLOSED') ? 'selected' : '' ?>>Closed</option>
                    <option value="CANCELLED" <?= ($filters['status'] == 'CANCELLED') ? 'selected' : '' ?>>Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div class="col-md-2">
                <div class="form-group">
                  <label for="category">Category</label>
                  <select name="category" id="category" class="form-control form-control-sm">
                    <option value="">All Categories</option>
                    <?php foreach ($categories as $cat) { ?>
                      <option value="<?= $cat['category_code'] ?>" <?= ($filters['category'] == $cat['category_code']) ? 'selected' : '' ?>>
                        <?= $cat['category_name'] ?>
                      </option>
                    <?php } ?>
                  </select>
                </div>
              </div>
              
              <div class="col-md-2">
                <div class="form-group">
                  <label for="priority">Priority</label>
                  <select name="priority" id="priority" class="form-control form-control-sm">
                    <option value="">All Priorities</option>
                    <option value="LOW" <?= ($filters['priority'] == 'LOW') ? 'selected' : '' ?>>Low</option>
                    <option value="MEDIUM" <?= ($filters['priority'] == 'MEDIUM') ? 'selected' : '' ?>>Medium</option>
                    <option value="HIGH" <?= ($filters['priority'] == 'HIGH') ? 'selected' : '' ?>>High</option>
                    <option value="URGENT" <?= ($filters['priority'] == 'URGENT') ? 'selected' : '' ?>>Urgent</option>
                  </select>
                </div>
              </div>
              
              <div class="col-md-2">
                <div class="form-group">
                  <label for="assigned_to">Assigned To</label>
                  <select name="assigned_to" id="assigned_to" class="form-control form-control-sm">
                    <option value="">All Assignees</option>
                    <option value="<?= $admin['user_code'] ?>" <?= ($filters['assigned_to'] == $admin['user_code']) ? 'selected' : '' ?>>Me</option>
                    <?php foreach ($assignees as $assignee) { ?>
                      <option value="<?= $assignee['user_code'] ?>" <?= ($filters['assigned_to'] == $assignee['user_code']) ? 'selected' : '' ?>>
                        <?= $assignee['name'] ?>
                      </option>
                    <?php } ?>
                  </select>
                </div>
              </div>
              
              <div class="col-md-2">
                <div class="form-group">
                  <label for="date_from">Date From</label>
                  <input type="date" name="date_from" id="date_from" class="form-control form-control-sm" 
                         value="<?= $filters['date_from'] ?>">
                </div>
              </div>
              
              <div class="col-md-2">
                <div class="form-group">
                  <label for="date_to">Date To</label>
                  <input type="date" name="date_to" id="date_to" class="form-control form-control-sm" 
                         value="<?= $filters['date_to'] ?>">
                </div>
              </div>
            </div>
            
            <div class="row">
              <div class="col-12">
                <button type="submit" class="btn btn-primary btn-sm">
                  <i class="fas fa-search mr-1"></i>Apply Filters
                </button>
                <button type="button" class="btn btn-outline-secondary btn-sm ml-2" onclick="exportData()">
                  <i class="fas fa-download mr-1"></i>Export
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Complaints Table -->
      <div class="card shadow-sm">
        <div class="card-header bg-primary text-white">
          <div class="d-flex justify-content-between align-items-center">
            <h6 class="card-title mb-0">
              <i class="fas fa-table mr-2"></i>Complaints Directory
            </h6>
            <span class="badge badge-light">
              <?= number_format($complaint_count) ?> Complaints
            </span>
          </div>
        </div>
        <div class="card-body p-0">
          <?php if (!empty($complaints)) { ?>
            <div class="table-responsive">
              <table class="table w-100 table-hover table-striped mb-0" id="complaintsTable">
                <thead class="table-light">
                  <tr>
                    <th class="text-center">#</th>
                    <th>Complaint ID</th>
                    <th>Member Details</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Created</th>
                    <th class="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <?php
                  $i = 1;
                  foreach ($complaints as $complaint) { ?>
                    <tr class="complaint-row">
                      <td class="text-center">
                        <span class="row-number"><?= $i++ ?></span>
                      </td>
                      <td>
                        <a href="<?= base_url('ComplaintManagement/ComplaintManager/ViewComplaint/' . $complaint['complaint_id']); ?>" 
                           class="font-weight-bold text-primary complaint-id">
                          <?= $complaint['complaint_id'] ?>
                        </a>
                        <?php if (!empty($complaint['chat_thread_id'])) { ?>
                          <span class="badge badge-info badge-sm ml-1" title="Has chat thread">
                            <i class="fas fa-comments"></i>
                          </span>
                        <?php } ?>
                      </td>
                      <td>
                        <div class="member-info">
                          <strong class="member-name"><?= $complaint['member_name'] ?: 'N/A' ?></strong>
                          <small class="d-block text-muted"><?= $complaint['member_id'] ?></small>
                          <?php if (!empty($complaint['mobile_no'])) { ?>
                            <small class="d-block text-muted">
                              <i class="fas fa-phone text-xs"></i> <?= $complaint['mobile_no'] ?>
                            </small>
                          <?php } ?>
                        </div>
                      </td>
                      <td>
                        <div class="complaint-title" title="<?= htmlspecialchars($complaint['title']) ?>">
                          <?= substr($complaint['title'], 0, 50) ?>
                        </div>
                        <?php if (!empty($complaint['txn_ac_number'])) { ?>
                          <small class="d-block text-muted">
                            <i class="fas fa-hashtag text-xs"></i> <?= $complaint['txn_ac_number'] ?>
                          </small>
                        <?php } ?>
                      </td>
                      <td class="text-center">
                        <span class="badge badge-<?= getBadgeClass($complaint['category']) ?>">
                          <?= $complaint['category'] ?>
                        </span>
                      </td>
                      <td class="text-center">
                        <span class="badge badge-<?= getPriorityBadgeClass($complaint['priority']) ?>">
                          <?= $complaint['priority'] ?>
                        </span>
                      </td>
                      <td class="text-center">
                        <span class="badge badge-<?= getStatusBadgeClass($complaint['status']) ?>">
                          <?= $complaint['status'] ?>
                        </span>
                      </td>
                      <td>
                        <?php if (!empty($complaint['assigned_to'])) { ?>
                          <span class="user-code-badge"><?= $complaint['assigned_to'] ?></span>
                          <?php if (!empty($complaint['assigned_at'])) { ?>
                            <small class="d-block text-muted">
                              <?= date('M j, H:i', strtotime($complaint['assigned_at'])) ?>
                            </small>
                          <?php } ?>
                        <?php } else { ?>
                          <span class="text-muted">Unassigned</span>
                        <?php } ?>
                      </td>
                      <td>
                        <span class="font-weight-bold"><?= date('M j, Y', strtotime($complaint['created_on'])) ?></span>
                        <small class="d-block text-muted"><?= date('H:i', strtotime($complaint['created_on'])) ?></small>
                      </td>
                      <td class="text-center">
                        <div class="btn-group action-buttons" role="group">
                          <a href="<?= base_url('ComplaintManagement/ComplaintManager/ViewComplaint/' . $complaint['complaint_id']); ?>" 
                             class="btn btn-sm btn-outline-primary" title="View Details">
                            <i class="fas fa-eye"></i>
                          </a>
                          
                          <?php if (in_array($complaint['status'], ['NEW', 'ASSIGNED'])) { ?>
                            <button type="button" class="btn btn-sm btn-outline-warning" 
                                    onclick="quickAction('<?= $complaint['complaint_id'] ?>', 'IN_PROGRESS')"
                                    title="Start Progress">
                              <i class="fas fa-play"></i>
                            </button>
                          <?php } ?>
                          
                          <?php if ($complaint['status'] == 'IN_PROGRESS') { ?>
                            <button type="button" class="btn btn-sm btn-outline-success" 
                                    onclick="quickAction('<?= $complaint['complaint_id'] ?>', 'RESOLVED')"
                                    title="Mark Resolved">
                              <i class="fas fa-check"></i>
                            </button>
                          <?php } ?>
                          
                          <?php if (!empty($complaint['chat_thread_id'])) { ?>
                            <button type="button" class="btn btn-sm btn-outline-info" 
                                    onclick="openChat('<?= $complaint['chat_thread_id'] ?>')"
                                    title="Open Chat">
                              <i class="fas fa-comments"></i>
                            </button>
                          <?php } ?>
                        </div>
                      </td>
                    </tr>
                  <?php } ?>
                </tbody>
              </table>
            </div>
          <?php } else { ?>
            <div class="text-center py-5">
              <div class="no-data-message">
                <i class="fas fa-search fa-4x text-muted mb-3"></i>
                <h4 class="text-muted">No Complaints Found</h4>
                <p class="text-muted">
                  <?php if (!empty(array_filter($filters))) { ?>
                    No complaints match your current filter criteria.
                  <?php } else { ?>
                    There are currently no complaints in your access scope.
                  <?php } ?>
                </p>
                <div class="mt-3">
                  <?php if (!empty(array_filter($filters))) { ?>
                    <button type="button" class="btn btn-secondary mr-2" onclick="clearAllFilters()">
                      <i class="fas fa-times mr-1"></i>Clear Filters
                    </button>
                  <?php } ?>
                  <a href="<?= base_url('ComplaintManagement/ComplaintManager/CreateComplaint'); ?>" 
                     class="btn btn-primary">
                    <i class="fas fa-plus mr-1"></i>Create New Complaint
                  </a>
                </div>
              </div>
            </div>
          <?php } ?>
        </div>
      </div>

    </div>
  </section>
</div>

<?php include(APPPATH . 'views/' . $role . '/footer.php'); ?>

<script>
$(document).ready(function() {

  // Clear filters button
  $('#clearFilters').click(function() {
    clearAllFilters();
  });

  // Auto-submit form on filter change
  $('#filterForm select, #filterForm input').change(function() {
    $('#filterForm').submit();
  });
});

// Quick action function
function quickAction(complaintId, newStatus) {
  var actionText = newStatus.replace('_', ' ').toLowerCase();
  if (confirm('Are you sure you want to ' + actionText + ' this complaint?')) {
    $.ajax({
      url: '<?= base_url('ComplaintManagement/ComplaintManager/UpdateStatus') ?>',
      type: 'POST',
      data: {
        complaint_id: complaintId,
        new_status: newStatus,
        remarks: 'Quick action from complaints list'
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
        toastr.error('An error occurred while updating status');
      }
    });
  }
}

// Clear all filters
function clearAllFilters() {
  var url = '<?= base_url('ComplaintManagement/ComplaintManager/ComplaintsList') ?>';
  window.location.href = url;
}

// Export data function
function exportData() {
  var currentUrl = window.location.href;
  var exportUrl = currentUrl + (currentUrl.includes('?') ? '&' : '?') + 'export=1';
  window.open(exportUrl, '_blank');
}

// Open chat function
function openChat(threadId) {
  // This would open the chat interface
  // Implementation depends on your chat system
  alert('Chat feature - Thread ID: ' + threadId);
}
</script>

<style>
.complaint-row:hover {
  background-color: #f8f9fa !important;
}

.action-buttons .btn {
  margin: 0 1px;
  border-radius: 0.25rem;
}

.complaint-id {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.member-info {
  min-width: 150px;
}

.member-name {
  color: #495057;
  font-weight: 600;
}

.complaint-title {
  max-width: 200px;
  line-height: 1.2;
}

.user-code-badge {
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: #495057;
}

.row-number {
  font-weight: 600;
  color: #6c757d;
}

.text-xs {
  font-size: 0.7rem;
}

.badge-sm {
  font-size: 0.6rem;
  padding: 0.1rem 0.3rem;
}

.page-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(0,123,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c3e50;
}

.page-subtitle {
  color: #6c757d;
  font-size: 0.9rem;
}

.modern-breadcrumb {
  background: none;
  padding: 0;
}

.modern-breadcrumb .breadcrumb-item + .breadcrumb-item::before {
  content: ">";
  color: #6c757d;
}

.bg-gradient-info {
  background: linear-gradient(45deg, #17a2b8, #138496) !important;
}

.card {
  border-radius: 0.5rem;
}

.card-header {
  border-radius: 0.5rem 0.5rem 0 0 !important;
}

.opacity-75 {
  opacity: 0.75;
}

/* DataTable styling */
.dataTables_wrapper .dataTables_filter input {
  border-radius: 0.25rem;
  border: 1px solid #ced4da;
}

.dataTables_wrapper .dataTables_length select {
  border-radius: 0.25rem;
  border: 1px solid #ced4da;
}

.dataTables_wrapper .dataTables_paginate .paginate_button {
  border-radius: 0.25rem !important;
  margin: 0 2px;
}

.dataTables_wrapper .dataTables_paginate .paginate_button.current {
  background: #007bff !important;
  border-color: #007bff !important;
  color: white !important;
}
</style>

<?php
// Helper functions for badge classes (same as dashboard)
function getBadgeClass($category) {
  switch ($category) {
    case 'TRANSACTION': return 'danger';
    case 'ACCOUNT': return 'warning';
    case 'TECHNICAL': return 'info';
    case 'BILLING': return 'secondary';
    case 'KYC': return 'primary';
    default: return 'light';
  }
}

function getPriorityBadgeClass($priority) {
  switch ($priority) {
    case 'URGENT': return 'danger';
    case 'HIGH': return 'warning';
    case 'MEDIUM': return 'info';
    case 'LOW': return 'secondary';
    default: return 'light';
  }
}

function getStatusBadgeClass($status) {
  switch ($status) {
    case 'NEW': return 'warning';
    case 'ASSIGNED': return 'info';
    case 'IN_PROGRESS': return 'primary';
    case 'RESOLVED': return 'success';
    case 'CLOSED': return 'secondary';
    case 'CANCELLED': return 'danger';
    default: return 'light';
  }
}
?>
