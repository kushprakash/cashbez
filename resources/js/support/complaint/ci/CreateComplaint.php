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
              <i class="fas fa-plus-circle text-success"></i>
            </div>
            <div>
              <h1 class="page-title mb-0"><?= $title ?></h1>
              <p class="page-subtitle mb-0">
                Register a new customer complaint
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
            <li class="breadcrumb-item active"><i class="fas fa-plus-circle mr-1"></i>Create Complaint</li>
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
                   class="btn btn-outline-primary btn-sm mr-2 mb-2">
                  <i class="fas fa-list mr-1"></i>All Complaints
                </a>
                <a href="<?= base_url('ComplaintManagement/ComplaintManager/CreateComplaint'); ?>" 
                   class="btn btn-success btn-sm mr-2 mb-2 active">
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
      
      <form method="POST" enctype="multipart/form-data" id="complaintForm">
        <div class="row">
          <!-- Left Column - Main Form -->
          <div class="col-md-8">
            
            <!-- Basic Information -->
            <div class="card shadow-sm mb-4">
              <div class="card-header bg-primary text-white">
                <h6 class="card-title mb-0">
                  <i class="fas fa-info-circle mr-2"></i>Basic Information
                </h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="member_id">Member ID <span class="text-danger">*</span></label>
                      <div class="input-group">
                        <input type="text" class="form-control" id="member_id" name="member_id" 
                               value="<?= set_value('member_id') ?>" placeholder="Enter Member ID" required>
                        <div class="input-group-append">
                          <button type="button" class="btn btn-outline-secondary" id="searchMember">
                            <i class="fas fa-search"></i>
                          </button>
                        </div>
                      </div>
                      <?= form_error('member_id') ?>
                      <div id="memberInfo" class="mt-2" style="display: none;">
                        <small class="text-info">
                          <i class="fas fa-user mr-1"></i>
                          <span id="memberName"></span> - <span id="memberMobile"></span>
                        </small>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="title">Complaint Title <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" id="title" name="title" 
                             value="<?= set_value('title') ?>" placeholder="Brief title of the complaint" 
                             maxlength="255" required>
                      <?= form_error('title') ?>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-4">
                    <div class="form-group">
                      <label for="category">Category <span class="text-danger">*</span></label>
                      <select class="form-control" id="category" name="category" required>
                        <option value="">Select Category</option>
                        <?php foreach ($categories as $cat) { ?>
                          <option value="<?= $cat['category_code'] ?>" 
                                  <?= set_select('category', $cat['category_code']) ?>>
                            <?= $cat['category_name'] ?>
                          </option>
                        <?php } ?>
                      </select>
                      <?= form_error('category') ?>
                    </div>
                  </div>
                  
                  <div class="col-md-4">
                    <div class="form-group">
                      <label for="priority">Priority <span class="text-danger">*</span></label>
                      <select class="form-control" id="priority" name="priority" required>
                        <option value="">Select Priority</option>
                        <option value="LOW" <?= set_select('priority', 'LOW') ?>>Low</option>
                        <option value="MEDIUM" <?= set_select('priority', 'MEDIUM', true) ?>>Medium</option>
                        <option value="HIGH" <?= set_select('priority', 'HIGH') ?>>High</option>
                        <option value="URGENT" <?= set_select('priority', 'URGENT') ?>>Urgent</option>
                      </select>
                      <?= form_error('priority') ?>
                    </div>
                  </div>
                  
                  <div class="col-md-4">
                    <div class="form-group">
                      <label for="typeofac">Account Type</label>
                      <select class="form-control" id="typeofac" name="typeofac">
                        <option value="">Select Account Type</option>
                        <option value="1" <?= set_select('typeofac', '1') ?>>Saving Account</option>
                        <option value="2" <?= set_select('typeofac', '2') ?>>RD Account</option>
                        <option value="3" <?= set_select('typeofac', '3') ?>>DD Account</option>
                        <option value="4" <?= set_select('typeofac', '4') ?>>FD Account</option>
                        <option value="5" <?= set_select('typeofac', '5') ?>>Loan Account</option>
                        <option value="6" <?= set_select('typeofac', '6') ?>>Fund Transfer</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-12">
                    <div class="form-group">
                      <label for="txn_ac_number">Transaction/Account Number</label>
                      <input type="text" class="form-control" id="txn_ac_number" name="txn_ac_number" 
                             value="<?= set_value('txn_ac_number') ?>" 
                             placeholder="Enter transaction ID or account number">
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-12">
                    <div class="form-group">
                      <label for="description">Complaint Description <span class="text-danger">*</span></label>
                      <textarea class="form-control" id="description" name="description" rows="5" 
                                placeholder="Provide detailed description of the complaint" required><?= set_value('description') ?></textarea>
                      <?= form_error('description') ?>
                      <small class="form-text text-muted">
                        <i class="fas fa-info-circle mr-1"></i>
                        Please provide as much detail as possible to help us resolve your complaint quickly.
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Attachments -->
            <div class="card shadow-sm mb-4">
              <div class="card-header bg-secondary text-white">
                <h6 class="card-title mb-0">
                  <i class="fas fa-paperclip mr-2"></i>Attachments (Optional)
                </h6>
              </div>
              <div class="card-body">
                <div class="form-group">
                  <label for="attachments">Upload Files</label>
                  <div class="custom-file">
                    <input type="file" class="custom-file-input" id="attachments" name="attachments[]" 
                           multiple accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx">
                    <label class="custom-file-label" for="attachments">Choose files...</label>
                  </div>
                  <small class="form-text text-muted">
                    <i class="fas fa-info-circle mr-1"></i>
                    Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX. Max size: 5MB per file.
                  </small>
                </div>
                
                <div id="filePreview" class="mt-3" style="display: none;">
                  <h6>Selected Files:</h6>
                  <div id="fileList" class="row"></div>
                </div>
              </div>
            </div>

          </div>

          <!-- Right Column - Quick Actions & Preview -->
          <div class="col-md-4">
            
            <!-- Form Actions -->
            <div class="card shadow-sm mb-4">
              <div class="card-header bg-success text-white">
                <h6 class="card-title mb-0">
                  <i class="fas fa-check-circle mr-2"></i>Submit Complaint
                </h6>
              </div>
              <div class="card-body">
                <div class="form-group">
                  <button type="submit" class="btn btn-success btn-block">
                    <i class="fas fa-paper-plane mr-2"></i>Submit Complaint
                  </button>
                </div>
                
                <div class="form-group">
                  <button type="button" class="btn btn-outline-secondary btn-block" onclick="resetForm()">
                    <i class="fas fa-undo mr-2"></i>Reset Form
                  </button>
                </div>
                
                <div class="form-group mb-0">
                  <a href="<?= base_url('ComplaintManagement/ComplaintManager/ComplaintsList'); ?>" 
                     class="btn btn-outline-primary btn-block">
                    <i class="fas fa-list mr-2"></i>View All Complaints
                  </a>
                </div>
              </div>
            </div>

            <!-- Guidelines -->
            <div class="card shadow-sm mb-4">
              <div class="card-header bg-info text-white">
                <h6 class="card-title mb-0">
                  <i class="fas fa-lightbulb mr-2"></i>Submission Guidelines
                </h6>
              </div>
              <div class="card-body">
                <ul class="list-unstyled mb-0">
                  <li class="mb-2">
                    <i class="fas fa-check text-success mr-2"></i>
                    <small>Provide accurate member information</small>
                  </li>
                  <li class="mb-2">
                    <i class="fas fa-check text-success mr-2"></i>
                    <small>Use clear and descriptive titles</small>
                  </li>
                  <li class="mb-2">
                    <i class="fas fa-check text-success mr-2"></i>
                    <small>Include relevant transaction details</small>
                  </li>
                  <li class="mb-2">
                    <i class="fas fa-check text-success mr-2"></i>
                    <small>Attach supporting documents if available</small>
                  </li>
                  <li class="mb-2">
                    <i class="fas fa-check text-success mr-2"></i>
                    <small>Select appropriate priority level</small>
                  </li>
                  <li class="mb-0">
                    <i class="fas fa-check text-success mr-2"></i>
                    <small>Review information before submitting</small>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Category Information -->
            <div class="card shadow-sm">
              <div class="card-header bg-warning text-dark">
                <h6 class="card-title mb-0">
                  <i class="fas fa-tags mr-2"></i>Category Guide
                </h6>
              </div>
              <div class="card-body">
                <div class="category-info">
                  <div class="category-item mb-2" data-category="TRANSACTION">
                    <strong class="text-danger">Transaction Issues</strong>
                    <small class="d-block text-muted">Failed, pending, or incorrect transactions</small>
                  </div>
                  <div class="category-item mb-2" data-category="ACCOUNT">
                    <strong class="text-warning">Account Issues</strong>
                    <small class="d-block text-muted">Account access, balance, statements</small>
                  </div>
                  <div class="category-item mb-2" data-category="TECHNICAL">
                    <strong class="text-info">Technical Issues</strong>
                    <small class="d-block text-muted">App issues, login problems, system errors</small>
                  </div>
                  <div class="category-item mb-2" data-category="BILLING">
                    <strong class="text-secondary">Billing & Charges</strong>
                    <small class="d-block text-muted">Charges, fees, refunds</small>
                  </div>
                  <div class="category-item mb-2" data-category="KYC">
                    <strong class="text-primary">KYC & Verification</strong>
                    <small class="d-block text-muted">KYC verification, document upload</small>
                  </div>
                  <div class="category-item mb-0" data-category="OTHER">
                    <strong class="text-dark">Other Issues</strong>
                    <small class="d-block text-muted">General queries and other issues</small>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </form>

    </div>
  </section>
</div>

<!-- Member Search Modal -->
<div class="modal fade" id="memberSearchModal" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Search Member</h5>
        <button type="button" class="close" data-dismiss="modal">
          <span>&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="memberSearch">Search by Member ID, Name, or Mobile Number</label>
          <input type="text" class="form-control" id="memberSearch" 
                 placeholder="Enter member ID, name, or mobile number">
        </div>
        
        <div id="searchResults">
          <div class="text-center py-4">
            <i class="fas fa-search fa-2x text-muted mb-2"></i>
            <p class="text-muted">Enter search term to find members</p>
          </div>
          <div class="table-responsive" style="display: none;">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Member ID</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody id="searchResultsTable"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<?php include(APPPATH . 'views/' . $role . '/footer.php'); ?>

<script>
$(document).ready(function() {
  // File input change handler
  $('#attachments').on('change', function() {
    var files = this.files;
    var fileList = $('#fileList');
    var filePreview = $('#filePreview');
    
    if (files.length > 0) {
      fileList.empty();
      filePreview.show();
      
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var fileSize = (file.size / 1024 / 1024).toFixed(2) + ' MB';
        var fileIcon = getFileIcon(file.type);
        
        var fileItem = `
          <div class="col-md-6 mb-2">
            <div class="card border">
              <div class="card-body p-2 text-center">
                <i class="${fileIcon} fa-2x text-muted mb-1"></i>
                <h6 class="card-title text-truncate mb-1" title="${file.name}">${file.name}</h6>
                <small class="text-muted">${fileSize}</small>
              </div>
            </div>
          </div>
        `;
        fileList.append(fileItem);
      }
      
      // Update label
      var label = files.length === 1 ? files[0].name : files.length + ' files selected';
      $('.custom-file-label').text(label);
    } else {
      filePreview.hide();
      $('.custom-file-label').text('Choose files...');
    }
  });

  // Member search
  $('#searchMember').click(function() {
    $('#memberSearchModal').modal('show');
  });

  // Member search input
  var searchTimeout;
  $('#memberSearch').on('input', function() {
    var searchTerm = $(this).val().trim();
    
    clearTimeout(searchTimeout);
    
    if (searchTerm.length >= 3) {
      searchTimeout = setTimeout(function() {
        searchMembers(searchTerm);
      }, 500);
    } else {
      $('#searchResults').html(`
        <div class="text-center py-4">
          <i class="fas fa-search fa-2x text-muted mb-2"></i>
          <p class="text-muted">Enter at least 3 characters to search</p>
        </div>
      `);
    }
  });

  // Category selection highlight
  $('#category').change(function() {
    var selectedCategory = $(this).val();
    $('.category-item').removeClass('bg-light border-left border-primary');
    
    if (selectedCategory) {
      $(`.category-item[data-category="${selectedCategory}"]`)
        .addClass('bg-light border-left border-primary pl-2');
    }
  });

  // Form validation
  $('#complaintForm').submit(function(e) {
    var isValid = true;
    var errors = [];

    // Basic validation
    if (!$('#member_id').val().trim()) {
      errors.push('Member ID is required');
      isValid = false;
    }

    if (!$('#title').val().trim()) {
      errors.push('Complaint title is required');
      isValid = false;
    }

    if (!$('#category').val()) {
      errors.push('Category is required');
      isValid = false;
    }

    if (!$('#priority').val()) {
      errors.push('Priority is required');
      isValid = false;
    }

    if (!$('#description').val().trim()) {
      errors.push('Description is required');
      isValid = false;
    }

    if (!isValid) {
      e.preventDefault();
      toastr.error('Please fix the following errors:\n' + errors.join('\n'));
      return false;
    }

    // Show loading
    $(this).find('button[type="submit"]').prop('disabled', true)
      .html('<i class="fas fa-spinner fa-spin mr-2"></i>Submitting...');
  });
});

// Helper functions
function getFileIcon(mimeType) {
  if (mimeType.startsWith('image/')) return 'fas fa-image';
  if (mimeType.includes('pdf')) return 'fas fa-file-pdf';
  if (mimeType.includes('word')) return 'fas fa-file-word';
  if (mimeType.includes('excel')) return 'fas fa-file-excel';
  return 'fas fa-file';
}

function searchMembers(searchTerm) {
  $('#searchResults .text-center').html(`
    <i class="fas fa-spinner fa-spin fa-2x text-primary mb-2"></i>
    <p class="text-muted">Searching members...</p>
  `);

  $.ajax({
    url: '<?= base_url('ComplaintManagement/ComplaintManager/SearchMembers') ?>',
    type: 'POST',
    data: { search_term: searchTerm },
    dataType: 'json',
    success: function(response) {
      if (response.success) {
        $('#searchResults .text-center').hide();
        $('#searchResults .table-responsive').show();
        $('#searchResultsTable').html(response.html);
      } else {
        $('#searchResults .table-responsive').hide();
        $('#searchResults .text-center').html(`
          <i class="fas fa-search fa-2x text-muted mb-2"></i>
          <p class="text-muted">${response.message || 'No members found'}</p>
        `).show();
      }
    },
    error: function() {
      $('#searchResults .table-responsive').hide();
      $('#searchResults .text-center').html(`
        <i class="fas fa-exclamation-triangle fa-2x text-danger mb-2"></i>
        <p class="text-danger">Error occurred while searching. Please try again.</p>
      `).show();
    }
  });
}

function selectMember(memberId, memberName, memberMobile) {
  $('#member_id').val(memberId);
  $('#memberName').text(memberName);
  $('#memberMobile').text(memberMobile);
  $('#memberInfo').show();
  $('#memberSearchModal').modal('hide');
  
  toastr.success('Member selected: ' + memberName);
}

function resetForm() {
  if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
    $('#complaintForm')[0].reset();
    $('#memberInfo').hide();
    $('#filePreview').hide();
    $('.custom-file-label').text('Choose files...');
    $('.category-item').removeClass('bg-light border-left border-primary');
  }
}
</script>

<style>
.page-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(40,167,69,0.1);
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

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
}

.custom-file-input:focus ~ .custom-file-label {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
}

.category-item {
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.category-item:hover {
  background-color: #f8f9fa !important;
}

.input-group .btn {
  border-color: #ced4da;
}

.input-group .btn:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

/* File preview styling */
#filePreview .card {
  border: 1px solid #dee2e6;
  transition: transform 0.2s ease;
}

#filePreview .card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

/* Modal styling */
.modal-content {
  border-radius: 0.5rem;
  border: none;
  box-shadow: 0 1rem 3rem rgba(0,0,0,0.175);
}

.modal-header {
  border-bottom: 1px solid #dee2e6;
  border-radius: 0.5rem 0.5rem 0 0;
}

/* Search results table */
#searchResults .table td {
  vertical-align: middle;
  border-top: 1px solid #dee2e6;
}

#searchResults .table tbody tr:hover {
  background-color: #f8f9fa;
}

/* Form validation */
.form-control.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Loading states */
.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* Priority badges for visual reference */
.priority-visual {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.priority-urgent { background-color: #dc3545; }
.priority-high { background-color: #ffc107; }
.priority-medium { background-color: #17a2b8; }
.priority-low { background-color: #6c757d; }

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .btn-block {
    margin-bottom: 0.5rem;
  }
  
  .card-body {
    padding: 1rem;
  }
}
</style>
