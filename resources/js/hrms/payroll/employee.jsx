import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { Link } from 'react-router-dom';
import Pageheader from '../../layouts/Pageheader';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import { toast, ToastContainer } from 'react-toastify';

const EmployeePayrollList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkForm, setBulkForm] = useState({ month: '', year: new Date().getFullYear() });
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const apiService = ApiService();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await apiService.vGet('/api/payroll/employees', true, true);
      if (res.data && Array.isArray(res.data.employees)) {
        setEmployees(res.data.employees);
        
        // Fetch KYC details for all employees
        const kycPromises = res.data.employees.map(async (emp) => {
          try {
            const kycRes = await apiService.vGet(`/api/kyc/details/${emp.user_id}`, true, true);
            return {
              userId: emp.user_id,
              kyc: kycRes.data && kycRes.data.status === 1 ? kycRes.data.kyc : null
            };
          } catch (err) {
            return { userId: emp.user_id, kyc: null };
          }
        });
        
        const kycResults = await Promise.all(kycPromises);
        const kycMap = {};
        kycResults.forEach(result => {
          kycMap[result.userId] = result.kyc;
        });
        setEmployeesKyc(kycMap);
      } else {
        toast.error(res.data.message || 'Failed to fetch employees');
      }
    } catch (err) {
      toast.error('Failed to fetch employees');
    }
    setLoading(false);
  };

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [form, setForm] = useState({ month: '', year: new Date().getFullYear() });
  const [paymentForm, setPaymentForm] = useState({
    companyBank: '',
    transactionMode: '',
    chequeNo: '',
    utr: ''
  });
  const [salaryDetails, setSalaryDetails] = useState(null);
  const [userKycDetails, setUserKycDetails] = useState(null);
  const [employeesKyc, setEmployeesKyc] = useState({});
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Payment status tracking
  const [paymentStatus, setPaymentStatus] = useState({});
  const [currentMonth, setCurrentMonth] = useState('');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Payment status filter
  const [showPaymentFilter, setShowPaymentFilter] = useState(true);
  const [paymentFilter, setPaymentFilter] = useState({ month: '', year: new Date().getFullYear() });
  const [checkingPaymentStatus, setCheckingPaymentStatus] = useState(false);

  // Only show employees with status==1 and KYC completed
  const filteredEmployees = employees.filter(emp => {
    const empKyc = employeesKyc[emp.user_id];
    return emp.status === 1 && empKyc && empKyc.kyc_completed == 1;
  });

  // Check payment status for employees
  const checkPaymentStatus = async (userIds, month, year) => {
    if (!userIds.length || !month || !year) return;
    
    console.log('Checking payment status for:', { userIds, month, year });
    
    try {
      const response = await apiService.vPost('/api/salary/check-payment-status', {
        user_ids: userIds,
        month: parseInt(month),
        year: parseInt(year)
      }, true, true);
      
      console.log('Payment status response:', response.data);
      
      if (response.data && response.data.status === 1) {
        const paymentStatusData = response.data.payment_status;
        
        // Check for employees with "not_generated" status and auto-generate their salary
        const notGeneratedUsers = [];
        Object.keys(paymentStatusData).forEach(userId => {
          if (paymentStatusData[userId] === 'not_generated') {
            notGeneratedUsers.push(parseInt(userId));
          }
        });
        
        // Auto-generate salary for users with "not_generated" status
        if (notGeneratedUsers.length > 0) {
          console.log('Auto-generating salary for users:', notGeneratedUsers);
          
          for (const userId of notGeneratedUsers) {
            try {
              const generateRes = await apiService.vPost('/api/salary/generate', {
                user_id: userId,
                month: parseInt(month),
                year: parseInt(year)
              }, true, true);
              
              console.log(`Salary generation for user ${userId}:`, generateRes.data);
              
              if (generateRes.data && generateRes.data.status === 1) {
                // Update status to pending after successful generation
                paymentStatusData[userId] = 'pending';
              }
            } catch (genError) {
              console.error(`Failed to generate salary for user ${userId}:`, genError);
            }
          }
          
          if (notGeneratedUsers.length > 0) {
            const monthName = months[parseInt(month) - 1];
            toast.success(`Auto-generated salary for ${notGeneratedUsers.length} employee(s) for ${monthName} ${year}`);
          }
        }
        
        setPaymentStatus(paymentStatusData);
        console.log('Updated payment status:', paymentStatusData);
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
    }
  };

  // Function to check if employee can be selected for given month/year
  const canSelectEmployee = (userId, month, year) => {
    if (!month || !year) return true;
    const status = paymentStatus[userId];
    return status !== 'paid';
  };

  // Function to check if employee salary can be released
  const canReleaseSalary = (userId, month, year) => {
    if (!month || !year) return true;
    const status = paymentStatus[userId];
    console.log(`canReleaseSalary check for user ${userId}, month ${month}, year ${year}: status = ${status}, can release = ${status !== 'paid'}`);
    return status !== 'paid';
  };

  // Handle payment filter form change
  const handlePaymentFilterChange = async (e) => {
    const { name, value } = e.target;
    setPaymentFilter(prev => ({ ...prev, [name]: value }));
    
    // Clear selected employees when filter changes
    setSelectedEmployees([]);
    
    // Auto check payment status when both month and year are available
    const newFilter = { ...paymentFilter, [name]: value };
    if (newFilter.month && newFilter.year && filteredEmployees.length > 0) {
      setCheckingPaymentStatus(true);
      
      // Update current month/year for payment status checks
      setCurrentMonth(newFilter.month);
      setCurrentYear(newFilter.year);
      
      // Auto check payment status for all employees
      const userIds = filteredEmployees.map(emp => emp.user_id);
      await checkPaymentStatus(userIds, newFilter.month, newFilter.year);
      
      const monthName = months[newFilter.month - 1];
      toast.success(`Payment status checked for ${monthName} ${newFilter.year}`);
      setCheckingPaymentStatus(false);
    } else {
      // Clear status when incomplete selection
      setCurrentMonth('');
      setCurrentYear(new Date().getFullYear());
      setPaymentStatus({});
      setSelectedEmployees([]);
    }
  };

  // Checkbox handlers
  const handleSelectAll = (e) => {
    if (!currentMonth || !currentYear) {
      toast.warning('Please select month and year first to check payment status');
      return;
    }
    
    if (e.target.checked) {
      const availableIds = filteredEmployees
        .filter(emp => emp.payroll && canSelectEmployee(emp.user_id, currentMonth, currentYear))
        .map(emp => emp.user_id);
      setSelectedEmployees(availableIds);
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (userId) => {
    if (!currentMonth || !currentYear) {
      toast.warning('Please select month and year first to check payment status');
      return;
    }
    
    if (!canSelectEmployee(userId, currentMonth, currentYear)) {
      const monthName = currentMonth ? months[currentMonth - 1] : '';
      const periodText = currentMonth && currentYear ? ` for ${monthName} ${currentYear}` : ' for this period';
      toast.warning(`Cannot select employee with already paid salary${periodText}`);
      return;
    }
    
    setSelectedEmployees(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Bulk pay handlers
  const handleBulkPay = () => {
    if (selectedEmployees.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }
    
    // Check if payment filter month and year are selected
    if (!paymentFilter.month || !paymentFilter.year) {
      toast.error('Please select month and year in the payment status section first');
      return;
    }
    
    // Auto-set the month and year from payment filter
    setBulkForm({ month: paymentFilter.month, year: paymentFilter.year });
    setShowBulkModal(true);
  };

  const handleBulkFormChange = (e) => {
    const { name, value } = e.target;
    setBulkForm({ ...bulkForm, [name]: value });
    
    // Update current month/year for payment status checks
    if (name === 'month') {
      setCurrentMonth(value);
    } else if (name === 'year') {
      setCurrentYear(value);
    }
    
    // Check payment status when both month and year are available
    const newForm = { ...bulkForm, [name]: value };
    if (newForm.month && newForm.year && filteredEmployees.length > 0) {
      const userIds = filteredEmployees.map(emp => emp.user_id);
      checkPaymentStatus(userIds, newForm.month, newForm.year);
    }
  };

  const handleBulkProcess = async () => {
    if (!bulkForm.month || !bulkForm.year) {
      toast.error('Please select month and year');
      return;
    }

    // Filter out employees with already paid salaries
    const eligibleEmployees = selectedEmployees.filter(userId => 
      canSelectEmployee(userId, bulkForm.month, bulkForm.year)
    );
    
    if (eligibleEmployees.length === 0) {
      const monthName = bulkForm.month ? months[bulkForm.month - 1] : '';
      const periodText = bulkForm.month && bulkForm.year ? ` for ${monthName} ${bulkForm.year}` : ' for this period';
      toast.error(`No eligible employees found. All selected employees already have paid salary${periodText}.`);
      return;
    }
    
    if (eligibleEmployees.length < selectedEmployees.length) {
      const skippedCount = selectedEmployees.length - eligibleEmployees.length;
      const monthName = bulkForm.month ? months[bulkForm.month - 1] : '';
      const periodText = bulkForm.month && bulkForm.year ? ` for ${monthName} ${bulkForm.year}` : ' for this period';
      toast.warning(`${skippedCount} employees skipped as they already have paid salary${periodText}.`);
    }

    setBulkProcessing(true);
    const paymentData = eligibleEmployees.map(userId => ({ user_id: userId }));
    
    try {
      const res = await apiService.vPost('/api/salary/bulk-generate', {
        employees: paymentData,
        month: bulkForm.month,
        year: bulkForm.year
      }, true, true);
      
      if (res.data && res.data.status === 1) {
        const summary = res.data.summary;
        const results = res.data.results || [];
        
        // Categorize skipped employees by reason
        const skippedEmployees = results.filter(r => r.status === 'skipped');
        const alreadyGenerated = skippedEmployees.filter(r => r.message && r.message.includes('already generated'));
        const zeroAttendance = skippedEmployees.filter(r => r.message && r.message.includes('0 attendance'));
        const otherSkipped = skippedEmployees.filter(r => !r.message || (!r.message.includes('already generated') && !r.message.includes('0 attendance')));
        
        if (summary.successful > 0) {
          let message = `Bulk processing completed successfully! ${summary.successful} salaries generated`;
          
          if (summary.failed > 0) {
            message += `, ${summary.failed} failed`;
          }
          
          if (summary.skipped > 0) {
            message += `, ${summary.skipped} skipped`;
            
            // Add detailed skip reasons
            let skipDetails = [];
            if (alreadyGenerated.length > 0) {
              skipDetails.push(`${alreadyGenerated.length} already have salary generated`);
            }
            if (zeroAttendance.length > 0) {
              skipDetails.push(`${zeroAttendance.length} have no attendance records`);
            }
            if (otherSkipped.length > 0) {
              skipDetails.push(`${otherSkipped.length} other reasons`);
            }
            
            if (skipDetails.length > 0) {
              message += ` (${skipDetails.join(', ')})`;
            }
          }
          
          message += '.';
          toast.success(message);
          
        } else if (summary.failed > 0) {
          toast.error(`Bulk processing failed: ${summary.failed} employees failed to process`);
        } else if (summary.skipped > 0) {
          // More detailed message for all skipped scenario
          let skipMessage = '';
          const monthName = bulkForm.month ? months[bulkForm.month - 1] : '';
          const periodText = bulkForm.month && bulkForm.year ? ` for ${monthName} ${bulkForm.year}` : '';
          
          if (alreadyGenerated.length > 0 && zeroAttendance.length > 0) {
            skipMessage = `Processing skipped: ${alreadyGenerated.length} employees already have salary generated and ${zeroAttendance.length} employees have no attendance records${periodText}.`;
          } else if (alreadyGenerated.length > 0) {
            skipMessage = `All selected employees already have salary generated${periodText}.`;
          } else if (zeroAttendance.length > 0) {
            skipMessage = `Processing skipped: Selected employees have no attendance records${periodText}. Please ensure attendance is marked before generating salary.`;
          } else {
            skipMessage = `All selected employees were skipped during processing${periodText}.`;
          }
          
          toast.warning(skipMessage);
        }
        
        setShowBulkModal(false);
        setSelectedEmployees([]);
        fetchEmployees();
        // Refresh payment status
        const userIds = filteredEmployees.map(emp => emp.user_id);
        checkPaymentStatus(userIds, bulkForm.month, bulkForm.year);
      } else {
        toast.error(res.data.message || 'Bulk processing failed');
      }
      
    } catch (err) {
      console.error('Bulk processing error:', err);
      toast.error('Bulk processing failed');
    }
    setBulkProcessing(false);
  };

  // Open modal and set selected employee
  const handleReleaseSalary = async (emp) => {
    setSelectedEmp(emp);
    setForm({ month: '', year: new Date().getFullYear() });
    setSalaryDetails(null);
    setUserKycDetails(null);
    
    // Check if employee has paid salary for current selected period
    if (currentMonth && currentYear) {
      const isPaid = paymentStatus[emp.user_id] === 'paid';
      if (isPaid) {
        const monthName = months[currentMonth - 1];
        toast.info(`Note: Employee already has paid salary for ${monthName} ${currentYear}. You can select a different month/year.`);
      }
    }
    
    // Fetch user KYC details for bank account information
    try {
      const kycRes = await apiService.vGet(`/api/kyc/details/${emp.user_id}`, true, true);
      if (kycRes.data && kycRes.data.status === 1) {
        setUserKycDetails(kycRes.data.kyc);
      }
    } catch (err) {
      console.error('Failed to fetch KYC details:', err);
    }
    
    setShowModal(true);
  };

  // Add attendance summary API call and calculation for present days
  const fetchAttendanceSummary = async (userId, month, year) => {
    try {
      const res = await apiService.vGet(`/api/attendance/summary/${userId}/${month}/${year}`, true, true);
      if (res.data) {
        return res.data;
      }
    } catch (err) {}
    return null;
  };

  // Handle form change
  const handleFormChange = async (e) => {
    const updatedForm = { ...form, [e.target.name]: e.target.value };
    setForm(updatedForm);
    
    // When both month and year are selected, call salary generate API directly
    if ((e.target.name === 'month' || e.target.name === 'year') && updatedForm.month && updatedForm.year && selectedEmp) {
      setCalculating(true);
      setSalaryDetails(null);
      
      try {
        const res = await apiService.vPost('/api/salary/generate', {
          user_id: selectedEmp.user_id,
          month: updatedForm.month,
          year: updatedForm.year
        }, true, true);
        
        if (res.data && res.data.status === 0 && res.data.payment_status === 'paid') {
          const monthName = res.data.month ? months[res.data.month - 1] : '';
          const errorMessage = res.data.month && res.data.year 
            ? `Salary already paid for ${monthName} ${res.data.year}`
            : res.data.message;
          setSalaryDetails({ 
            error: errorMessage,
            payment_status: 'paid',
            month: res.data.month,
            year: res.data.year
          });
        } else if (res.data && res.data.status === 0) {
          // Handle other error cases (like pending status)
          setSalaryDetails({ 
            error: res.data.message || 'Failed to calculate salary',
            payment_status: res.data.payment_status || 'error',
            month: res.data.month,
            year: res.data.year
          });
        } else {
          let salaryData = res.data && res.data.status === 1 ? res.data.salary : { error: res.data.message || 'Failed to calculate salary' };
          // Fetch attendance summary and merge
          const attSummary = await fetchAttendanceSummary(selectedEmp.user_id, updatedForm.month, updatedForm.year);
          if (attSummary) {
            salaryData = { ...salaryData, ...attSummary };
          }
          setSalaryDetails(salaryData);
        }
      } catch (err) {
        setSalaryDetails({ error: 'Failed to calculate salary' });
      }
      setCalculating(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!salaryDetails || !salaryDetails.id) return;
    
    // Show payment confirmation modal instead of simple confirm
    setShowConfirmModal(true);
  };

  // Handle Mark as Paid button click
  const handleMarkAsPaidClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Mark as Paid clicked');
    console.log('salaryDetails:', salaryDetails);
    console.log('showConfirmModal before:', showConfirmModal);
    
    if (!salaryDetails) {
      console.log('No salary details');
      toast.error('Please calculate salary first by selecting month and year');
      return;
    }
    
    if (!salaryDetails.id) {
      console.log('No salary ID');
      toast.error('Salary calculation is incomplete. Please try again.');
      return;
    }
    
    // Show payment confirmation modal
    console.log('Setting showConfirmModal to true');
    setShowConfirmModal(true);
    
    // Force a small delay to ensure state update
    setTimeout(() => {
      console.log('showConfirmModal after timeout:', showConfirmModal);
    }, 100);
  };

  // Handle payment form change
  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({
      ...prev,
      [name]: value,
      // Clear other fields when transaction mode changes
      ...(name === 'transactionMode' && { chequeNo: '', utr: '' })
    }));
  };

  // Handle final payment confirmation
  const handlePaymentConfirmation = async () => {
    // Validate required fields
    if (!paymentForm.companyBank || !paymentForm.transactionMode) {
      toast.error('Please fill all required fields');
      return;
    }

    if (paymentForm.transactionMode === 'cheque' && !paymentForm.chequeNo) {
      toast.error('Cheque number is required for cheque payment');
      return;
    }

    if (paymentForm.transactionMode === 'online' && !paymentForm.utr) {
      toast.error('UTR number is required for online payment');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        salary_payment_id: salaryDetails.id,
        user_id: selectedEmp.user_id,
        month: form.month,
        year: form.year,
        company_bank: paymentForm.companyBank,
        transaction_mode: paymentForm.transactionMode,
        ...(paymentForm.transactionMode === 'cheque' && { cheque_no: paymentForm.chequeNo }),
        ...(paymentForm.transactionMode === 'online' && { utr: paymentForm.utr })
      };

      const res = await apiService.vPost('/api/salary/pay', payload, true, true);
      if (res.data && res.data.status === 1) {
        toast.success('Salary marked as paid successfully');
        setShowModal(false);
        setShowConfirmModal(false);
        // Reset payment form
        setPaymentForm({
          companyBank: '',
          transactionMode: '',
          chequeNo: '',
          utr: ''
        });
        fetchEmployees();
      } else {
        toast.error(res.data.message || 'Failed to mark as paid');
      }
    } catch (err) {
      toast.error('Failed to mark as paid');
    }
    setSubmitting(false);
  };

  // Month options
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fix: Calculate payable_days in frontend if not provided by API
  const getPayableDays = (details) => {
    if (typeof details.payable_days === 'number' && !isNaN(details.payable_days)) return details.payable_days;
    const present = parseFloat(details.present_days) || 0;
    const paid = parseFloat(details.paid_leaves) || 0;
    return present + paid;
  };

  return (
    <>
      <ToastContainer />
      <Pageheader mainheading="Payroll Management" parentfolder="Payroll" activepage="Employee Payroll List" />
      <div className="page-content-box">
        <div className="page-content-box-inner">
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">Employee Payroll List</h5>
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Only showing employees with completed KYC
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    {selectedEmployees.length > 0 && (
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={handleBulkPay}
                      >
                        <i className="bi bi-cash-stack me-1"></i>
                        Bulk Pay ({selectedEmployees.length})
                      </button>
                    )}
                    <Link to="/payroll/setup" className="btn btn-primary btn-sm">Setup Salary Structure</Link>
                  </div>
                </div>
                <div className="card-body">
                  {/* Payment Status Filter - Always Visible */}
                  <div className="card mb-4 border-info">
                    <div className="card-header bg-info text-white">
                      <h6 className="mb-0">
                        <i className="bi bi-calendar-check me-2"></i>
                        Check Payment Status
                        {checkingPaymentStatus && (
                          <span className="ms-2">
                            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                            Checking...
                          </span>
                        )}
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row g-3 align-items-end">
                        <div className="col-md-6">
                          <label className="form-label">Month</label>
                          <select 
                            className="form-select" 
                            name="month" 
                            value={paymentFilter.month} 
                            onChange={handlePaymentFilterChange}
                          >
                            <option value="">Select Month</option>
                            {months.map((m, idx) => (
                              <option key={m} value={idx + 1}>{m}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Year</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            name="year" 
                            value={paymentFilter.year} 
                            onChange={handlePaymentFilterChange}
                            min="2020"
                            max="2030"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {loading ? (
                    <TableShimmerLoader columns={8} rows={8} />
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-bordered table-hover">
                        <thead>
                          <tr>
                            <th style={{width: '50px'}}>
                              <input 
                                type="checkbox" 
                                className="form-check-input"
                                checked={selectedEmployees.length === filteredEmployees.filter(emp => emp.payroll).length && filteredEmployees.filter(emp => emp.payroll).length > 0}
                                onChange={handleSelectAll}
                                disabled={!currentMonth || !currentYear}
                                title={!currentMonth || !currentYear ? 'Please select month and year first' : ''}
                              />
                            </th>
                            <th>Employee ID</th>
                            <th>Name</th>
                            <th>Basic</th>
                            <th>Allowances</th>
                            <th>Deductions</th>
                            <th>Net Salary</th>
                            <th>KYC Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEmployees.length === 0 ? (
                            <tr><td colSpan="9" className="text-center">
                              <div className="py-4">
                                <i className="bi bi-exclamation-circle text-warning fs-2"></i>
                                <div className="mt-2">
                                  <strong>No employees with completed KYC found</strong>
                                </div>
                                <div className="text-muted">
                                  Employees must complete their KYC process to appear in the payroll list
                                </div>
                              </div>
                            </td></tr>
                          ) : (
                            filteredEmployees.map(emp => {
                              const payroll = emp.payroll;
                              const empKyc = employeesKyc[emp.user_id];
                              const basic = payroll?.basic ? parseFloat(payroll.basic) : 0;
                              const allowances = payroll?.allowances ? parseFloat(payroll.allowances) : 0;
                              const deductions = payroll?.deductions ? parseFloat(payroll.deductions) : 0;
                              const netSalary = payroll ? (basic + allowances - deductions).toFixed(2) : '-';
                              const isPaid = paymentStatus[emp.user_id] === 'paid';
                              const canSelect = canSelectEmployee(emp.user_id, currentMonth, currentYear);
                              const canRelease = canReleaseSalary(emp.user_id, currentMonth, currentYear);
                              const monthName = currentMonth ? months[currentMonth - 1] : '';
                              const periodText = currentMonth && currentYear ? ` for ${monthName} ${currentYear}` : ' for selected period';
                              
                              return (
                                <tr key={emp.id}>
                                  <td>
                                    <input 
                                      type="checkbox" 
                                      className="form-check-input"
                                      checked={selectedEmployees.includes(emp.user_id)}
                                      onChange={() => handleSelectEmployee(emp.user_id)}
                                      disabled={!currentMonth || !currentYear || !payroll || isPaid || !canSelect}
                                      title={
                                        !currentMonth || !currentYear ? 'Please select month and year first' :
                                        isPaid ? `Salary already paid${periodText}` : 
                                        !payroll ? 'No payroll setup for this employee' : ''
                                      }
                                    />
                                  </td>
                                  <td>{emp.emp_code || emp.id}</td>
                                  <td>
                                    {emp.user?.name || '-'}
                                    {isPaid && (
                                      <span className="badge bg-success ms-2" title={`Salary paid${periodText}`}>
                                        <i className="bi bi-check-circle me-1"></i>
                                        Paid
                                      </span>
                                    )}
                                  </td>
                                  <td>{payroll?.basic || '-'}</td>
                                  <td>{payroll?.allowances || '-'}</td>
                                  <td>{payroll?.deductions || '-'}</td>
                                  <td>{netSalary}</td>
                                  <td>
                                    <span className="badge bg-success">
                                      <i className="bi bi-check-circle me-1"></i>
                                      Completed
                                    </span>
                                  </td>
                                  <td>
                                    <button 
                                      className={`btn btn-sm me-2 btn-success`}
                                      disabled={!payroll}
                                      onClick={() => handleReleaseSalary(emp)}
                                      title={isPaid ? `Salary already paid${periodText}` : ''}
                                    >
                                      {isPaid ? 'Already Paid' : 'Release Salary'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Release Salary Modal */}
      {showModal && selectedEmp && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <div className="w-100">
                  <h5 className="modal-title fw-bold">Salary Payment</h5>
                  <div className="small mt-1"><h2>Salary payment</h2> </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-3 align-items-center border-bottom pb-2">
                  <div className="col-md-2 text-center">
                    <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center" style={{width: 60, height: 60, fontSize: 28, color: '#0d6efd'}}>
                      <i className="bi bi-person-circle"></i>
                    </div>
                  </div>
                  <div className="col-md-10">
                    <h5 className="mb-1">{selectedEmp.user?.name} <span className="badge bg-secondary ms-2">{selectedEmp.emp_code}</span></h5>
                    <div className="text-muted mb-1">Department: {selectedEmp.department?.name || '-'}</div>
                    <div className="row g-1 small ">
                      <div className="col-md-6">Mobile: <span className="fw-semibold">{selectedEmp.user?.mobile || '-'}</span></div>
                      <div className="col-md-6">Email: <span className="fw-semibold">{selectedEmp.user?.email || '-'}</span></div>
                      <div className="col-md-12">Address: <span className="fw-semibold">{selectedEmp.address || '-'}</span></div>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="">
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Month</label>
                      <select className="form-select" name="month" value={form.month} onChange={handleFormChange} required>
                        <option value="">Select Month</option>
                        {months.map((m, idx) => (
                          <option key={m} value={idx + 1}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Year</label>
                      <input type="number" className="form-control" name="year" value={form.year} onChange={handleFormChange} required />
                    </div>
                  </div>
                  {calculating && <div className="alert alert-info py-2">Calculating salary...</div>}
                  {salaryDetails && salaryDetails.error && <div className="alert alert-danger py-2">{salaryDetails.error}</div>}
                  {salaryDetails && !salaryDetails.error && (
                    <>
                     {/* Payroll Setup Details Card */}
                      <div className="card border-0 shadow-sm mb-3">
                        <div className="card-header bg-light fw-bold">
                          Payroll Details
                        </div>
                        <div className="card-body">
                          <div className="row g-3">
                            <div className="col-md-4">
                              <div className="small text-muted">Basic</div>
                              <div className="fw-bold">₹ {selectedEmp.payroll?.basic != null ? parseFloat(selectedEmp.payroll.basic).toFixed(2) : '0.00'}</div>
                            </div>
                            <div className="col-md-4">
                              <div className="small text-muted">HRA</div>
                              <div className="fw-bold">₹ {selectedEmp.payroll?.hra != null ? parseFloat(selectedEmp.payroll.hra).toFixed(2) : '0.00'}</div>
                            </div>
                            <div className="col-md-4">
                              <div className="small text-muted">Travel</div>
                              <div className="fw-bold">₹ {selectedEmp.payroll?.travel != null ? parseFloat(selectedEmp.payroll.travel).toFixed(2) : '0.00'}</div>
                            </div>
                            <div className="col-md-4">
                              <div className="small text-muted">Bonus</div>
                              <div className="fw-bold">₹ {selectedEmp.payroll?.bonus != null ? parseFloat(selectedEmp.payroll.bonus).toFixed(2) : '0.00'}</div>
                            </div>
                            <div className="col-md-4">
                              <div className="small text-muted">Allowances</div>
                              <div className="fw-bold">₹ {selectedEmp.payroll?.allowances != null ? parseFloat(selectedEmp.payroll.allowances).toFixed(2) : '0.00'}</div>
                            </div>
                            <div className="col-md-4">
                              <div className="small text-muted">Deductions</div>
                              <div className="fw-bold text-danger">₹ {selectedEmp.payroll?.deductions != null ? parseFloat(selectedEmp.payroll.deductions).toFixed(2) : '0.00'}</div>
                            </div>
                            <div className="col-md-4">
                              <div className="small text-muted">PF</div>
                              <div className="fw-bold text-danger">₹ {selectedEmp.payroll?.pf != null ? parseFloat(selectedEmp.payroll.pf).toFixed(2) : '0.00'}</div>
                            </div>
                            <div className="col-md-4">
                              <div className="small text-muted">Tax</div>
                              <div className="fw-bold text-danger">₹ {selectedEmp.payroll?.tax != null ? parseFloat(selectedEmp.payroll.tax).toFixed(2) : '0.00'}</div>
                            </div>
                            <div className="col-md-4">
                              <div className="small text-muted">Gross Salary (Payroll)</div>
                              <div className="fw-bold fs-5">
                                ₹ {selectedEmp.payroll ? (
                                  [
                                    'basic',
                                    'hra',
                                    'travel',
                                    'bonus',
                                    'allowances'
                                  ].reduce((sum, key) => sum + (parseFloat(selectedEmp.payroll[key]) || 0), 0).toFixed(2)
                                ) : '0.00'}
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="small text-muted">Net Salary (Payroll)</div>
                              <div className="fw-bold fs-5 text-success">
                                ₹ {selectedEmp.payroll ? (
                                  ( [
                                    'basic',
                                    'hra',
                                    'travel',
                                    'bonus',
                                    'allowances'
                                  ].reduce((sum, key) => sum + (parseFloat(selectedEmp.payroll[key]) || 0), 0)
                                    - ((parseFloat(selectedEmp.payroll.deductions) || 0)
                                    + (parseFloat(selectedEmp.payroll.pf) || 0)
                                    + (parseFloat(selectedEmp.payroll.tax) || 0))
                                ).toFixed(2)
                                ) : '0.00'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card border-0 shadow-sm mb-3">
                        <div className="card-body">
                          <div className="row g-3">
                            <div className="col-md-4">
                              <div className="small text-muted">Total Days</div>
                              <div className="fw-bold fs-5">{salaryDetails.total_days ?? 0}</div>
                            </div>
                            <div className="col-md-4">
                              <div className="small text-muted">Present Days</div>
                              <div className="fw-bold fs-5 text-success">{salaryDetails.present_days ?? 0}</div>
                            </div>
                            <div className="col-md-4">
                              <div className="small text-muted">Paid Leaves</div>
                              <div className="fw-bold fs-5 text-info">{salaryDetails.paid_leaves ?? 0}</div>
                            </div>
                            <div className="col-md-4">
                              <div className="small text-muted">Payable Days</div>
                              <div className="fw-bold fs-5 text-primary">{getPayableDays(salaryDetails)}</div>
                            </div>
                            <div className="col-md-4">
                              <div className="small text-muted">Gross Salary</div>
                              <div className="fw-bold fs-5">₹ {salaryDetails.gross != null ? parseFloat(salaryDetails.gross).toFixed(2) : '0.00'}</div>
                            </div>
                            <div className="col-md-4">
                              <div className="small text-muted">Deductions</div>
                              <div className="fw-bold fs-5 text-danger">₹ {salaryDetails.deductions != null ? parseFloat(salaryDetails.deductions).toFixed(2) : '0.00'}</div>
                            </div>
                            <div className="col-md-12 mt-2">
                              <div className="small text-muted">Net Salary</div>
                              <div className="fw-bold fs-3 text-success">₹ {salaryDetails.net != null ? parseFloat(salaryDetails.net).toFixed(2) : '0.00'}</div>
                            </div>
                            
                          </div>
                        </div>
                      </div>
                     
                    </>
                  )}
                </form>
                <div className="d-flex justify-content-end p-1">
                  <button type="button" className="btn btn-danger mr-1" onClick={() => setShowModal(false)}>Close</button>&nbsp;
                  <button 
                    type="button" 
                    className="btn btn-success px-4" 
                    onClick={() => {
                      console.log('Test button clicked');
                      setShowConfirmModal(true);
                    }}
                    disabled={submitting || (salaryDetails && salaryDetails.payment_status === 'paid')}
                    title={salaryDetails && salaryDetails.payment_status === 'paid' ? 
                      (salaryDetails.month && salaryDetails.year ? 
                        `Salary already paid for ${months[salaryDetails.month - 1]} ${salaryDetails.year}` : 
                        'Salary already paid for this period') : ''}
                  >
                    {submitting ? 'Processing...' : 
                     (salaryDetails && salaryDetails.payment_status === 'paid') ? 'Already Paid' : 'Mark as Paid'}
                  </button>
                 
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {console.log('Rendering payment modal check:', { showConfirmModal, selectedEmp: !!selectedEmp, salaryDetails: !!salaryDetails })}
      {showConfirmModal && selectedEmp && salaryDetails && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.7)', zIndex: 1060 }} tabIndex="-1">
          {console.log('Payment modal is rendering!')}
          <div className="modal-dialog modal-md">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-success text-white">
                <div className="w-100">
                  <h5 className="modal-title fw-bold">Confirm Payment</h5>
                  <div className="small mt-1">Complete payment details for salary disbursement</div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowConfirmModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                {/* Payment Summary */}
                <div className="alert alert-info mb-4">
                  <div className="row">
                    <div className="col-md-6">
                      <strong>Employee:</strong> {selectedEmp.user?.name}
                    </div>
                    <div className="col-md-6">
                      <strong>Period:</strong> {months[form.month - 1]} {form.year}
                    </div>
                    <div className="col-md-12 mt-2">
                      <strong>Net Salary:</strong> <span className="text-success fs-5">₹{salaryDetails.net != null ? parseFloat(salaryDetails.net).toFixed(2) : '0.00'}</span>
                    </div>
                  </div>
                </div>

                {/* Employee Bank Account Details */}
                {userKycDetails && userKycDetails.kyc_completed == 1 && (userKycDetails.account_number || userKycDetails.bank_name) && (
                  <div className="card border-success mb-4">
                    <div className="card-header bg-success text-white">
                      <h6 className="mb-0">
                        <i className="bi bi-bank me-2"></i>
                        Employee Bank Account Details
                        <span className="badge bg-light text-success ms-2">
                          <i className="bi bi-check-circle me-1"></i>
                          KYC Completed
                        </span>
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="small text-muted">Bank Name</div>
                          <div className="fw-bold">{userKycDetails.bank_name || 'N/A'}</div>
                        </div>
                        <div className="col-md-6">
                          <div className="small text-muted">Branch</div>
                          <div className="fw-bold">{userKycDetails.branch || 'N/A'}</div>
                        </div>
                        <div className="col-md-6">
                          <div className="small text-muted">Account Number</div>
                          <div className="fw-bold">
                            {userKycDetails.account_number ? 
                              `${userKycDetails.account_number}` : 'N/A'
                            }
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="small text-muted">IFSC Code</div>
                          <div className="fw-bold">{userKycDetails.ifsc_code || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* KYC Not Complete Warning */}
                {userKycDetails && userKycDetails.kyc_completed != 1 && (
                  <div className="alert alert-danger mb-4">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    <strong>KYC Incomplete:</strong> Employee's KYC is not completed. Please complete the full KYC process before processing salary payment.
                  </div>
                )}

                {/* No KYC Data Warning */}
                {!userKycDetails && (
                  <div className="alert alert-danger mb-4">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    <strong>No KYC Data:</strong> Employee KYC information not found. Please complete KYC process before processing salary payment.
                  </div>
                )}

                {/* Payment Form */}
                <form>
                  <div className="row g-3">
                    {/* Company Bank */}
                    <div className="col-md-12 d-none">
                      <label className="form-label">Company Bank <span className="text-danger">*</span></label>
                      <select 
                        className="form-select" 
                        name="companyBank" 
                        value={paymentForm.companyBank} 
                        onChange={handlePaymentFormChange}
                        required
                      >
                        <option value="">Select Company Bank</option>
                        <option value="hdfc" selected>HDFC Bank</option>
                        <option value="icici">ICICI Bank</option>
                        <option value="sbi">State Bank of India</option>
                        <option value="axis">Axis Bank</option>
                        <option value="kotak">Kotak Mahindra Bank</option>
                        <option value="pnb">Punjab National Bank</option>
                        <option value="canara">Canara Bank</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Transaction Mode */}
                    <div className="col-md-12">
                      <label className="form-label">Transaction Mode <span className="text-danger">*</span></label>
                      <select 
                        className="form-select" 
                        name="transactionMode" 
                        value={paymentForm.transactionMode} 
                        onChange={handlePaymentFormChange}
                        required
                      >
                        <option value="">Select Transaction Mode</option>
                        <option value="cash">Cash</option>
                        <option value="cheque">Cheque</option>
                        <option value="online">Online Transfer</option>
                      </select>
                    </div>

                    {/* Conditional Fields */}
                    {paymentForm.transactionMode === 'cheque' && (
                      <div className="col-md-12">
                        <label className="form-label">Cheque Number <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="chequeNo" 
                          value={paymentForm.chequeNo} 
                          onChange={handlePaymentFormChange}
                          placeholder="Enter cheque number"
                          required
                        />
                      </div>
                    )}

                    {paymentForm.transactionMode === 'online' && (
                      <div className="col-md-12">
                        <label className="form-label">UTR Number <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="utr" 
                          value={paymentForm.utr} 
                          onChange={handlePaymentFormChange}
                          placeholder="Enter UTR/Transaction reference number"
                          required
                        />
                      </div>
                    )}

                    {paymentForm.transactionMode === 'cash' && (
                      <div className="col-md-12">
                        <div className="alert alert-warning">
                          <i className="bi bi-info-circle me-2"></i>
                          Cash payment selected. No additional reference number required.
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowConfirmModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-success px-4" 
                  onClick={handlePaymentConfirmation}
                  disabled={submitting || !paymentForm.companyBank || !paymentForm.transactionMode}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Confirm Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Pay Modal */}
      {showBulkModal && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-success text-white">
                <div className="w-100">
                  <h5 className="modal-title fw-bold">
                    <i className="bi bi-cash-stack me-2"></i>
                    Bulk Salary Processing
                  </h5>
                  <div className="small mt-1">Process salary for {selectedEmployees.length} selected employees</div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowBulkModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                {/* Selected Employees Summary */}
                <div className="alert alert-info mb-4">
                  <h6 className="mb-2">
                    <i className="bi bi-people me-2"></i>
                    Selected Employees ({selectedEmployees.length})
                  </h6>
                  <div className="row">
                    {selectedEmployees.map(userId => {
                      const emp = filteredEmployees.find(e => e.user_id === userId);
                      const isPaid = paymentStatus[userId] === 'paid';
                      const canProcess = canSelectEmployee(userId, bulkForm.month, bulkForm.year);
                      
                      return emp ? (
                        <div key={userId} className="col-md-6 mb-1">
                          <span className={`badge ${isPaid ? 'bg-warning' : 'bg-primary'} me-1`}>
                            {emp.emp_code || emp.id}
                          </span>
                          {emp.user?.name || 'Unknown'}
                          {isPaid && bulkForm.month && bulkForm.year && (
                            <span className="badge bg-danger ms-2" title="Already paid for selected period">
                              <i className="bi bi-exclamation-triangle me-1"></i>
                              Paid
                            </span>
                          )}
                        </div>
                      ) : null;
                    })}
                  </div>
                  
                  {/* Show warning if some employees will be skipped */}
                  {bulkForm.month && bulkForm.year && selectedEmployees.some(userId => !canSelectEmployee(userId, bulkForm.month, bulkForm.year)) && (
                    <div className="mt-3">
                      <div className="alert alert-warning mb-0">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        <strong>Warning:</strong> Some selected employees already have paid salary for {months[bulkForm.month - 1]} {bulkForm.year} and will be skipped.
                      </div>
                    </div>
                  )}
                </div>

                {/* Month and Year Display (Auto-populated from Payment Filter) */}
                <div className="card border-primary mb-4">
                  <div className="card-header bg-primary text-white">
                    <h6 className="mb-0">
                      <i className="bi bi-calendar-check me-2"></i>
                      Processing Period
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">
                          <i className="bi bi-calendar me-1"></i>
                          Month
                        </label>
                        <div className="form-control-plaintext bg-light border rounded p-2">
                          <strong>{bulkForm.month ? months[bulkForm.month - 1] : 'Not Selected'}</strong>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">
                          <i className="bi bi-calendar-year me-1"></i>
                          Year
                        </label>
                        <div className="form-control-plaintext bg-light border rounded p-2">
                          <strong>{bulkForm.year || 'Not Selected'}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="alert alert-info mb-0">
                        <i className="bi bi-info-circle me-2"></i>
                        <small>
                          Month and Year are automatically taken from the Payment Status filter section above.
                          To change the period, please update the Payment Status filter and reopen this modal.
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Process Information */}
                <div className="mt-4">
                  <div className="card border-warning">
                    <div className="card-body">
                      <h6 className="text-warning">
                        <i className="bi bi-info-circle me-2"></i>
                        Bulk Processing Information
                      </h6>
                      <ul className="mb-0 small">
                        <li>This will generate salary calculations for all selected employees</li>
                        <li>Each employee's attendance and leave data will be processed</li>
                        <li>Payslips will be automatically generated</li>
                        <li>You can review and approve individual payments later</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Processing Status */}
                {bulkProcessing && (
                  <div className="mt-4">
                    <div className="alert alert-info">
                      <div className="d-flex align-items-center">
                        <div className="spinner-border spinner-border-sm me-3" role="status"></div>
                        <div>
                          <strong>Processing bulk salary calculations...</strong>
                          <div className="small">Please wait while we process {selectedEmployees.length} employees</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowBulkModal(false)}
                  disabled={bulkProcessing}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-success px-4" 
                  onClick={handleBulkProcess}
                  disabled={bulkProcessing || !bulkForm.month || !bulkForm.year}
                >
                  {bulkProcessing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-play-circle me-2"></i>
                      Process {selectedEmployees.length} Employees
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeePayrollList;
