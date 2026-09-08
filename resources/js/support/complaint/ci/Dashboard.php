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
              <i class="fas fa-headset text-primary"></i>
            </div>
            <div>
              <h1 class="page-title mb-0"><?= $title ?></h1>
              <p class="page-subtitle mb-0">
                Manage customer complaints and support requests
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
            <li class="breadcrumb-item active"><i class="fas fa-headset mr-1"></i>Complaint Manager</li>
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
                   class="btn btn-primary btn-sm mr-2 mb-2 active">
                  <i class="fas fa-tachometer-alt mr-1"></i>Dashboard
                </a>
                <a href="<?= base_url('ComplaintManagement/ComplaintManager/ComplaintsList'); ?>" 
                   class="btn btn-outline-primary btn-sm mr-2 mb-2">
                  <i class="fas fa-list mr-1"></i>All Complaints
                </a>
                <a href="<?= base_url('ComplaintManagement/ComplaintManager/CreateComplaint'); ?>" 
                   class="btn btn-outline-success btn-sm mr-2 mb-2">
                  <i class="fas fa-plus mr-1"></i>Create Complaint
                </a>
                <a href="<?= base_url('ComplaintManagement/ComplaintManager/ComplaintsList?status=NEW'); ?>" 
                   class="btn btn-outline-warning btn-sm mr-2 mb-2">
                  <i class="fas fa-clock mr-1"></i>Pending
                  <?php if (isset($stats['NEW']) && $stats['NEW'] > 0) { ?>
                    <span class="badge badge-warning ml-1"><?= $stats['NEW'] ?></span>
                  <?php } ?>
                </a>
                <a href="<?= base_url('ComplaintManagement/ComplaintManager/ComplaintsList?assigned_to=' . $admin['user_code']); ?>" 
                   class="btn btn-outline-info btn-sm mb-2">
                  <i class="fas fa-user mr-1"></i>My Assignments
                  <?php if ($pending_actions > 0) { ?>
                    <span class="badge badge-info ml-1"><?= $pending_actions ?></span>
                  <?php } ?>
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
      
      <!-- Statistics Cards -->
      <div class="row mb-4">
        <div class="col-lg-3 col-6">
          <div class="card border-0 bg-gradient-primary text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="mr-3">
                  <i class="fas fa-exclamation-triangle fa-2x opacity-75"></i>
                </div>
                <div>
                  <h4 class="mb-0 text-white"><?= number_format($stats['NEW'] + $stats['ASSIGNED']) ?></h4>
                  <p class="mb-0 opacity-75">Active Complaints</p>
                  <small class="opacity-75">New + Assigned</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-6">
          <div class="card border-0 bg-gradient-warning text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="mr-3">
                  <i class="fas fa-clock fa-2x opacity-75"></i>
                </div>
                <div>
                  <h4 class="mb-0 text-white"><?= number_format($stats['IN_PROGRESS']) ?></h4>
                  <p class="mb-0 opacity-75">In Progress</p>
                  <small class="opacity-75">Being resolved</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-6">
          <div class="card border-0 bg-gradient-success text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="mr-3">
                  <i class="fas fa-check-circle fa-2x opacity-75"></i>
                </div>
                <div>
                  <h4 class="mb-0 text-white"><?= number_format($stats['RESOLVED']) ?></h4>
                  <p class="mb-0 opacity-75">Resolved</p>
                  <small class="opacity-75">Awaiting closure</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-6">
          <div class="card border-0 bg-gradient-secondary text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="mr-3">
                  <i class="fas fa-archive fa-2x opacity-75"></i>
                </div>
                <div>
                  <h4 class="mb-0 text-white"><?= number_format($stats['CLOSED']) ?></h4>
                  <p class="mb-0 opacity-75">Closed</p>
                  <small class="opacity-75">Completed</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Breakdown Chart -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <h6 class="card-title mb-0">
                <i class="fas fa-chart-pie mr-2"></i>Complaint Status Distribution
              </h6>
            </div>
            <div class="card-body">
              <canvas id="statusChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-header bg-info text-white">
              <h6 class="card-title mb-0">
                <i class="fas fa-tasks mr-2"></i>Quick Actions
              </h6>
            </div>
            <div class="card-body">
              <div class="list-group list-group-flush">
                <a href="<?= base_url('ComplaintManagement/ComplaintManager/CreateComplaint'); ?>" 
                   class="list-group-item list-group-item-action d-flex align-items-center">
                  <i class="fas fa-plus-circle text-success mr-3"></i>
                  <div>
                    <strong>Create New Complaint</strong>
                    <small class="d-block text-muted">Register a new customer complaint</small>
                  </div>
                </a>
                
                <a href="<?= base_url('ComplaintManagement/ComplaintManager/ComplaintsList?status=NEW'); ?>" 
                   class="list-group-item list-group-item-action d-flex align-items-center">
                  <i class="fas fa-clock text-warning mr-3"></i>
                  <div>
                    <strong>Review New Complaints</strong>
                    <small class="d-block text-muted"><?= $stats['NEW'] ?> complaints awaiting review</small>
                  </div>
                </a>
                
                <a href="<?= base_url('ComplaintManagement/ComplaintManager/ComplaintsList?assigned_to=' . $admin['user_code']); ?>" 
                   class="list-group-item list-group-item-action d-flex align-items-center">
                  <i class="fas fa-user-circle text-primary mr-3"></i>
                  <div>
                    <strong>My Assigned Complaints</strong>
                    <small class="d-block text-muted"><?= $pending_actions ?> complaints assigned to you</small>
                  </div>
                </a>
                
                <a href="<?= base_url('ComplaintManagement/ComplaintManager/ComplaintsList?status=RESOLVED'); ?>" 
                   class="list-group-item list-group-item-action d-flex align-items-center">
                  <i class="fas fa-check-circle text-success mr-3"></i>
                  <div>
                    <strong>Close Resolved Complaints</strong>
                    <small class="d-block text-muted"><?= $stats['RESOLVED'] ?> complaints ready for closure</small>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Complaints -->
      <div class="row">
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header bg-dark text-white">
              <div class="d-flex justify-content-between align-items-center">
                <h6 class="card-title mb-0">
                  <i class="fas fa-history mr-2"></i>Recent Complaints
                </h6>
                <a href="<?= base_url('ComplaintManagement/ComplaintManager/ComplaintsList'); ?>" 
                   class="btn btn-light btn-sm">
                  <i class="fas fa-list mr-1"></i>View All
                </a>
              </div>
            </div>
            <div class="card-body p-0">
              <?php if (!empty($recent_complaints)) { ?>
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>Complaint ID</th>
                        <th>Member</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <?php foreach ($recent_complaints as $complaint) { ?>
                        <tr>
                          <td>
                            <a href="<?= base_url('ComplaintManagement/ComplaintManager/ViewComplaint/' . $complaint['complaint_id']); ?>" 
                               class="font-weight-bold text-primary">
                              <?= $complaint['complaint_id'] ?>
                            </a>
                          </td>
                          <td>
                            <div>
                              <strong><?= $complaint['member_name'] ?: 'N/A' ?></strong>
                              <small class="d-block text-muted"><?= $complaint['member_id'] ?></small>
                            </div>
                          </td>
                          <td>
                            <div class="complaint-title" title="<?= htmlspecialchars($complaint['title']) ?>">
                              <?= substr($complaint['title'], 0, 40) ?>
                            </div>
                          </td>
                          <td>
                            <span class="badge badge-<?= getBadgeClass($complaint['category']) ?>">
                              <?= $complaint['category'] ?>
                            </span>
                          </td>
                          <td>
                            <span class="badge badge-<?= getPriorityBadgeClass($complaint['priority']) ?>">
                              <?= $complaint['priority'] ?>
                            </span>
                          </td>
                          <td>
                            <span class="badge badge-<?= getStatusBadgeClass($complaint['status']) ?>">
                              <?= $complaint['status'] ?>
                            </span>
                          </td>
                          <td>
                            <small><?= date('M j, Y H:i', strtotime($complaint['created_on'])) ?></small>
                          </td>
                          <td>
                            <div class="btn-group" role="group">
                              <a href="<?= base_url('ComplaintManagement/ComplaintManager/ViewComplaint/' . $complaint['complaint_id']); ?>" 
                                 class="btn btn-sm btn-outline-primary" title="View Details">
                                <i class="fas fa-eye"></i>
                              </a>
                              <?php if (in_array($complaint['status'], ['NEW', 'ASSIGNED', 'IN_PROGRESS'])) { ?>
                                <button type="button" class="btn btn-sm btn-outline-success" 
                                        onclick="quickStatusUpdate('<?= $complaint['complaint_id'] ?>', 'IN_PROGRESS')"
                                        title="Mark In Progress">
                                  <i class="fas fa-play"></i>
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
                  <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">No Recent Complaints</h5>
                  <p class="text-muted">No complaints found in your access scope.</p>
                  <a href="<?= base_url('ComplaintManagement/ComplaintManager/CreateComplaint'); ?>" 
                     class="btn btn-primary">
                    <i class="fas fa-plus mr-1"></i>Create First Complaint
                  </a>
                </div>
              <?php } ?>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</div>

<?php include(APPPATH . 'views/' . $role . '/footer.php'); ?>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
$(document).ready(function() {
  // Status Distribution Chart
  var ctx = document.getElementById('statusChart').getContext('2d');
  var statusChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['New', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Cancelled'],
      datasets: [{
        data: [
          <?= $stats['NEW'] ?>,
          <?= $stats['ASSIGNED'] ?>,
          <?= $stats['IN_PROGRESS'] ?>,
          <?= $stats['RESOLVED'] ?>,
          <?= $stats['CLOSED'] ?>,
          <?= $stats['CANCELLED'] ?>
        ],
        backgroundColor: [
          '#ffc107',
          '#17a2b8',
          '#fd7e14',
          '#28a745',
          '#6c757d',
          '#dc3545'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        position: 'bottom'
      },
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            var label = data.labels[tooltipItem.index];
            var value = data.datasets[0].data[tooltipItem.index];
            var total = data.datasets[0].data.reduce((a, b) => a + b, 0);
            var percentage = Math.round((value / total) * 100);
            return label + ': ' + value + ' (' + percentage + '%)';
          }
        }
      }
    }
  });
});

// Quick status update function
function quickStatusUpdate(complaintId, newStatus) {
  if (confirm('Are you sure you want to update the status to ' + newStatus + '?')) {
    $.ajax({
      url: '<?= base_url('ComplaintManagement/ComplaintManager/UpdateStatus') ?>',
      type: 'POST',
      data: {
        complaint_id: complaintId,
        new_status: newStatus,
        remarks: 'Quick status update from dashboard'
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
</script>

<style>
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

.bg-gradient-primary {
  background: linear-gradient(45deg, #007bff, #0056b3) !important;
}

.bg-gradient-warning {
  background: linear-gradient(45deg, #ffc107, #e0a800) !important;
}

.bg-gradient-success {
  background: linear-gradient(45deg, #28a745, #1e7e34) !important;
}

.bg-gradient-secondary {
  background: linear-gradient(45deg, #6c757d, #545b62) !important;
}

.complaint-title {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-group .btn {
  border-radius: 0.25rem !important;
}

.btn-group .btn:not(:last-child) {
  margin-right: 2px;
}

.table td {
  vertical-align: middle;
}

.card {
  border-radius: 0.5rem;
}

.card-header {
  border-radius: 0.5rem 0.5rem 0 0 !important;
}

.list-group-item {
  border: none;
  border-bottom: 1px solid #dee2e6;
}

.list-group-item:last-child {
  border-bottom: none;
}

.opacity-75 {
  opacity: 0.75;
}
</style>

<?php
// Helper functions for badge classes
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
