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
              <i class="fas fa-chart-bar text-info"></i>
            </div>
            <div>
              <h1 class="page-title mb-0"><?= $title ?></h1>
              <p class="page-subtitle mb-0">
                Monitor and balance complaint workloads across team members
              </p>
            </div>
          </div>
        </div>
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right modern-breadcrumb">
            <li class="breadcrumb-item"><a href="<?= base_url($role . '/Home'); ?>"><i class="fas fa-home mr-1"></i>Home</a></li>
            <li class="breadcrumb-item"><a href="<?= base_url('ComplaintManagement/ComplaintManager'); ?>"><i class="fas fa-headset mr-1"></i>Complaint Manager</a></li>
            <li class="breadcrumb-item active"><i class="fas fa-chart-bar mr-1"></i>Workload Report</li>
          </ol>
        </div>
      </div>
    </div>
  </section>

  <!-- Main content -->
  <section class="content">
    <div class="container-fluid">
      
      <!-- Workload Balance Actions -->
      <?php if ($role == 'SuperAdmin') { ?>
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-warning text-dark">
              <h6 class="card-title mb-0">
                <i class="fas fa-balance-scale mr-2"></i>Workload Balancing
              </h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <form id="balanceWorkloadForm">
                    <div class="form-group">
                      <label for="role">Role to Balance</label>
                      <select class="form-control" id="role" name="role">
                        <option value="HelpDesk" <?= $target_role == 'HelpDesk' ? 'selected' : '' ?>>Help Desk</option>
                        <option value="CoreCommittee" <?= $target_role == 'CoreCommittee' ? 'selected' : '' ?>>Core Committee</option>
                        <option value="SuperAdmin" <?= $target_role == 'SuperAdmin' ? 'selected' : '' ?>>Super Admin</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label for="max_difference">Max Complaint Difference</label>
                      <input type="number" class="form-control" id="max_difference" name="max_difference" value="3" min="1" max="10">
                      <small class="form-text text-muted">Maximum allowed difference in active complaints between users</small>
                    </div>
                    <button type="submit" class="btn btn-warning">
                      <i class="fas fa-balance-scale mr-1"></i>Balance Workload
                    </button>
                  </form>
                </div>
                <div class="col-md-6">
                  <div class="alert alert-info">
                    <i class="fas fa-info-circle mr-2"></i>
                    <strong>How it works:</strong>
                    <ul class="mb-0 mt-2">
                      <li>Calculates current active complaints per user</li>
                      <li>Redistributes complaints from overloaded to underloaded users</li>
                      <li>Only moves NEW or ASSIGNED complaints (not in progress)</li>
                      <li>Maintains audit trail of all reassignments</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <?php } ?>

      <!-- Workload Statistics -->
      <?php if (!empty($workload_stats[$target_role])) { ?>
      <div class="row">
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <div class="d-flex justify-content-between align-items-center">
                <h6 class="card-title mb-0">
                  <i class="fas fa-users mr-2"></i><?= $target_role ?> Workload Statistics
                </h6>
                <span class="badge badge-light"><?= count($workload_stats[$target_role]) ?> Active Users</span>
              </div>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Active Complaints</th>
                      <th>Total Assigned</th>
                      <th>Resolved</th>
                      <th>Resolution Rate</th>
                      <th>Workload Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <?php 
                    $stats = $workload_stats[$target_role];
                    usort($stats, function($a, $b) { return $b['active_complaints'] <=> $a['active_complaints']; });
                    $max_active = !empty($stats) ? $stats[0]['active_complaints'] : 0;
                    $min_active = !empty($stats) ? $stats[count($stats)-1]['active_complaints'] : 0;
                    $avg_active = !empty($stats) ? array_sum(array_column($stats, 'active_complaints')) / count($stats) : 0;
                    
                    foreach ($stats as $user) {
                      $workload_level = 'normal';
                      $workload_text = 'Normal';
                      $workload_class = 'success';
                      
                      if ($user['active_complaints'] > ($avg_active * 1.5)) {
                        $workload_level = 'high';
                        $workload_text = 'High Load';
                        $workload_class = 'danger';
                      } elseif ($user['active_complaints'] < ($avg_active * 0.5) && $avg_active > 0) {
                        $workload_level = 'low';
                        $workload_text = 'Light Load';
                        $workload_class = 'info';
                      }
                    ?>
                    <tr>
                      <td>
                        <strong><?= htmlspecialchars($user['name']) ?></strong><br>
                        <small class="text-muted"><?= $user['username'] ?></small>
                      </td>
                      <td>
                        <span class="badge badge-primary badge-lg"><?= $user['active_complaints'] ?></span>
                        <div class="progress mt-1" style="height: 5px;">
                          <div class="progress-bar bg-primary" style="width: <?= $max_active > 0 ? ($user['active_complaints'] / $max_active * 100) : 0 ?>%"></div>
                        </div>
                      </td>
                      <td><span class="badge badge-secondary"><?= $user['total_complaints'] ?></span></td>
                      <td><span class="badge badge-success"><?= $user['resolved_complaints'] ?></span></td>
                      <td>
                        <span class="badge badge-<?= $user['resolution_rate'] >= 80 ? 'success' : ($user['resolution_rate'] >= 60 ? 'warning' : 'danger') ?>">
                          <?= $user['resolution_rate'] ?>%
                        </span>
                      </td>
                      <td>
                        <span class="badge badge-<?= $workload_class ?>"><?= $workload_text ?></span>
                      </td>
                    </tr>
                    <?php } ?>
                  </tbody>
                </table>
              </div>
              
              <!-- Summary Statistics -->
              <div class="row mt-4">
                <div class="col-md-3">
                  <div class="text-center">
                    <h4 class="text-primary"><?= number_format($avg_active, 1) ?></h4>
                    <small class="text-muted">Average Active</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <h4 class="text-danger"><?= $max_active ?></h4>
                    <small class="text-muted">Highest Load</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <h4 class="text-info"><?= $min_active ?></h4>
                    <small class="text-muted">Lowest Load</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <h4 class="text-warning"><?= $max_active - $min_active ?></h4>
                    <small class="text-muted">Load Difference</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <?php } ?>

      <!-- Recent Assignments -->
      <?php if (!empty($recent_assignments)) { ?>
      <div class="row mt-4">
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header bg-secondary text-white">
              <h6 class="card-title mb-0">
                <i class="fas fa-clock mr-2"></i>Recent Assignments (Last 50)
              </h6>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm table-hover">
                  <thead>
                    <tr>
                      <th>Complaint ID</th>
                      <th>Title</th>
                      <th>Assigned To</th>
                      <th>Assigned At</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <?php foreach ($recent_assignments as $assignment) { ?>
                    <tr>
                      <td>
                        <a href="<?= base_url('ComplaintManagement/ComplaintManager/ViewComplaint/' . $assignment['complaint_id']) ?>" 
                           class="font-weight-bold">
                          <?= $assignment['complaint_id'] ?>
                        </a>
                      </td>
                      <td><?= htmlspecialchars(substr($assignment['title'], 0, 50)) ?><?= strlen($assignment['title']) > 50 ? '...' : '' ?></td>
                      <td><?= htmlspecialchars($assignment['assignee_name'] ?: $assignment['assigned_to']) ?></td>
                      <td><?= date('M j, Y H:i', strtotime($assignment['assigned_at'])) ?></td>
                      <td>
                        <span class="badge badge-<?= getStatusBadgeClass($assignment['status']) ?>">
                          <?= $assignment['status'] ?>
                        </span>
                      </td>
                    </tr>
                    <?php } ?>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <?php } ?>

    </div>
  </section>
</div>

<?php include(APPPATH . 'views/' . $role . '/footer.php'); ?>

<script>
$(document).ready(function() {
  // Balance Workload Form
  $('#balanceWorkloadForm').submit(function(e) {
    e.preventDefault();
    
    var submitBtn = $(this).find('button[type="submit"]');
    var originalText = submitBtn.html();
    submitBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-1"></i>Balancing...');
    
    $.ajax({
      url: '<?= base_url('ComplaintManagement/ComplaintManager/BalanceWorkload') ?>',
      type: 'POST',
      data: $(this).serialize(),
      dataType: 'json',
      success: function(response) {
        if (response.success) {
          toastr.success(response.message);
          if (response.rebalanced > 0) {
            // Show rebalancing log
            var logHtml = '<div class="alert alert-success mt-3"><h6>Rebalancing Details:</h6><ul>';
            response.log.forEach(function(entry) {
              logHtml += '<li>' + entry + '</li>';
            });
            logHtml += '</ul></div>';
            $('#balanceWorkloadForm').after(logHtml);
            
            // Reload page after 3 seconds to show updated stats
            setTimeout(function() {
              location.reload();
            }, 3000);
          }
        } else {
          toastr.error(response.message);
        }
      },
      error: function() {
        toastr.error('An error occurred while balancing workload');
      },
      complete: function() {
        submitBtn.prop('disabled', false).html(originalText);
      }
    });
  });
});
</script>

<style>
.page-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(23,162,184,0.1);
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

.card {
  border-radius: 0.5rem;
  border: none;
}

.card-header {
  border-radius: 0.5rem 0.5rem 0 0 !important;
  border-bottom: 1px solid rgba(0,0,0,0.125);
}

.badge-lg {
  font-size: 1.1em;
  padding: 0.5em 0.8em;
}

.progress {
  background-color: #e9ecef;
}

.table td {
  vertical-align: middle;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
}
</style>

<?php
// Helper function for status badge classes
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
