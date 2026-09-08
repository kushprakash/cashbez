import React, { useContext, useEffect, useState } from 'react';
// Clear all filters and reload payouts
const handleClearAll = () => {
  setSearchTerm('');
  setVerificationFilter('');
  setStatusFilter('');
  setDateFrom('');
  setDateTo('');
  setCurrentPage(1);
};
import ApiService from '../../core/services/ApiService';
import { Link } from 'react-router-dom';
import DataTable from '../../pages/components/DataTable';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';
import { toast } from 'react-toastify';
import { AuthContext } from '../../core/hooks/context';

const BeneficiaryList = () => {
  const { userData: user, logout } = useContext(AuthContext);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteOtp, setDeleteOtp] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingBeneficiary, setDeletingBeneficiary] = useState(null);
  // View modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingBeneficiary, setViewingBeneficiary] = useState(null);

  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('1');
  const [mpin, setMpin] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [accounts, setAccounts] = useState([]);

  // Create account states
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountMpin, setNewAccountMpin] = useState('');
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [createAccountErrors, setCreateAccountErrors] = useState({});


  const isSuperAdmin = user && user.role === "1";

  useEffect(() => {
    fetchBeneficiaries();
    fetchAccounts();
  }, [currentPage, searchTerm, verificationFilter, statusFilter, dateFrom, dateTo]);

  const fetchAccounts = async () => {

    try {
      const apiService = ApiService();
      const response = await apiService.vGet('/api/payouts', { per_page: 100 });

      if (response.data && response.data.status === 1) {

        const accountsData = response.data.data;
        if (Array.isArray(accountsData)) {
          setAccounts(accountsData);
        } else if (accountsData && Array.isArray(accountsData.accounts)) {
          setAccounts(accountsData.accounts);
        } else {
          setAccounts([]);
        }
      } else {
        setAccounts([]);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      setAccounts([]);
    }
  };

  const fetchBeneficiaries = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiService = ApiService();
      const params = {
        page: currentPage,
        per_page: 15,
        search: searchTerm,
        verified: verificationFilter,
        status: statusFilter,
        date_from: dateFrom,
        date_to: dateTo
      };

      const response = await apiService.vGet('/api/v2/payouts', params);
      const { data } = response;

      if (data.status !== 1) {
        throw new Error(data.message || 'Failed to fetch beneficiaries');
      }
      // Map user_name and company_name if not present
      let beneficiaries = (data.data.data || []).map(b => {
        const user_name = b.user_name || (b.user ? b.user.name : '');
        const user_mid = b.user_mid || (b.user ? b.user.mid : '');
        let company_name = '';
        if (isSuperAdmin) {
          company_name = b.company_name || (b.setting ? b.setting.company_name : '');
        }
        return {
          ...b,
          user_name,
          user_mid,
          company_name,
        };
      });
      setBeneficiaries(beneficiaries);
      setTotalPages(data.data.last_page || 1);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleVerificationFilter = (e) => {
    setVerificationFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleDateFrom = (e) => {
    setDateFrom(e.target.value);
    setCurrentPage(1);
  };

  const handleDateTo = (e) => {
    setDateTo(e.target.value);
    setCurrentPage(1);
  };

  const sendDeleteOtp = async () => {
    try {
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/beneficiaries/send-otp', {});

      if (response.data.status === 1) {
        toast.success('OTP sent successfully');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to send OTP');
    }
  };

  const handleDelete = async (beneficiary) => {
    setDeletingBeneficiary(beneficiary);
    setShowDeleteModal(true);
    await sendDeleteOtp();
  };

  const confirmDelete = async () => {
    if (!deleteOtp || deleteOtp.length !== 6) {
      toast.error('Please enter valid 6-digit OTP');
      return;
    }

    try {
      const apiService = ApiService();
      const response = await apiService.vDelete(`/api/v2/beneficiaries/${deletingBeneficiary.id}`, {
        otp: deleteOtp
      });

      if (response.data.status === 1) {
        toast.success('Beneficiary deleted successfully');
        setShowDeleteModal(false);
        setDeleteOtp('');
        setDeletingBeneficiary(null);
        fetchBeneficiaries();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to delete beneficiary');
    }
  };

  // Payment related functions
  const handlePay = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);

    // Check if user has any accounts
    if (accounts.length === 0) {
      setShowCreateAccountModal(true);
    } else {
      setShowPaymentModal(true);
    }
  };

  // View related functions
  const handleView = (beneficiary) => {
    setViewingBeneficiary(beneficiary);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingBeneficiary(null);
  };

  const handleAmountChange = (e) => {
    const value = (e.target.value || '').replace(/\D/g, ''); // Remove non-digits
    setPaymentAmount(value);
  };

  const handleMpinChange = (e) => {
    const value = (e.target.value || '').replace(/\D/g, ''); // Only digits
    if (value.length <= 4) {
      setMpin(value);
    }
  };

  const handleFinalPayment = async () => {
    if (!selectedAccount) {
      toast.error('Please select an account');
      return;
    }
    if (!mpin || mpin.length !== 4) {
      toast.error('Please enter 4-digit MPIN');
      return;
    }
    if (!paymentAmount || parseInt(paymentAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (parseInt(paymentAmount) < 1) {
      toast.error('Minimum payment amount is ₹1');
      return;
    }

    setProcessingPayment(true);
    try {
      const apiService = ApiService();

      // Create payment transaction to beneficiary
      const transactionResponse = await apiService.vPost('/api/v2/beneficiary-payment', {
        account_id: selectedAccount,
        beneficiary_id: selectedBeneficiary.id,
        amount: parseInt(paymentAmount),
        channel: parseInt(selectedChannel),
        details: `Payment to ${selectedBeneficiary.name} - ${selectedBeneficiary.account}`,
        mpin: mpin,
        transaction_id: parseInt(Date.now() / 1000), // Unique transaction ID
      });



      if (transactionResponse.data && transactionResponse.data.status === 1) {
        toast.success('Payment successful!');
        setShowPaymentModal(false);
        setSelectedAccount('');
        setSelectedChannel('1');
        setMpin('');
        setPaymentAmount('');
        setSelectedBeneficiary(null);

        // Refresh accounts to show updated balance
        await fetchAccounts();
      } else {
        toast.error(transactionResponse.data?.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  const closePaymentModals = () => {
    setShowPaymentModal(false);
    setShowCreateAccountModal(false);
    setSelectedAccount('');
    setSelectedChannel('1');
    setMpin('');
    setPaymentAmount('');
    setSelectedBeneficiary(null);
    setNewAccountName('');
    setNewAccountMpin('');
    setCreateAccountErrors({});
  };

  // Create account functions
  const handleNewAccountNameChange = (e) => {
    setNewAccountName(e.target.value);
    if (createAccountErrors.name) {
      setCreateAccountErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const handleNewAccountMpinChange = (e) => {
    const value = (e.target.value || '').replace(/\D/g, ''); // Only digits
    if (value.length <= 4) {
      setNewAccountMpin(value);
      if (createAccountErrors.mpin) {
        setCreateAccountErrors(prev => ({ ...prev, mpin: '' }));
      }
    }
  };

  const handleCreateAccount = async () => {
    // Validate inputs
    const errors = {};
    if (!newAccountName.trim()) {
      errors.name = 'Account name is required';
    }
    if (!newAccountMpin || newAccountMpin.length !== 4) {
      errors.mpin = 'MPIN must be 4 digits';
    }
    if (!/^[0-9]{4}$/.test(newAccountMpin)) {
      errors.mpin = 'MPIN must contain only numbers';
    }

    if (Object.keys(errors).length > 0) {
      setCreateAccountErrors(errors);
      return;
    }

    setCreatingAccount(true);
    try {
      const apiService = ApiService();

      // Generate unique account number
      const accountNumber = Date.now().toString();

      // Get current user data from auth
      const { token, user } = retrieveTokenAndUserData() || {};

      const response = await apiService.vPost('/api/accounts', {
        name: newAccountName.trim(),
        number: accountNumber,
        mpin: newAccountMpin,
        user_id: user?.id || 1, // Fallback to 1 if user id not found
        initial_balance: 0
      });

      if (response.data && response.data.status === 1) {
        toast.success('Account created successfully!');

        // Refresh accounts list
        await fetchAccounts();

        // Close create account modal and open payment modal
        setShowCreateAccountModal(false);
        setNewAccountName('');
        setNewAccountMpin('');
        setCreateAccountErrors({});

        // Open payment modal
        setShowPaymentModal(true);
      } else {
        toast.error(response.data?.message || 'Failed to create account');
      }
    } catch (error) {
      console.error('Account creation error:', error);
      if (error.response?.data?.error) {
        // Handle validation errors from server
        setCreateAccountErrors(error.response.data.error);
      } else {
        toast.error(error.response?.data?.message || 'Failed to create account');
      }
    } finally {
      setCreatingAccount(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const columns = [
    {
      Header: 'ID',
      accessor: 'id',
      Cell: ({ value }) => (
        <span className="badge bg-light text-dark">{value}</span>
      ),
    },
    {
      Header: 'User Name',
      accessor: 'user_name',
      Cell: ({ value, row }) => (
        <div>
          <div className="fw-semibold">{value || '-'}</div>
          <div className="small text-muted">{row.original.user_mid || '-'}</div>
        </div>
      ),
    },
    // Conditionally add Company Name column for super admin
    ...(isSuperAdmin ? [
      {
        Header: 'Company Name',
        accessor: 'company_name',
        Cell: ({ value }) => (
          <span>{value || '-'}</span>
        ),
      }
    ] : []),
    {
      Header: 'Beneficiary',
      accessor: 'beneficiary',
      Cell: ({ value }) => (
        <div>
          <div className="fw-semibold">{value?.name || '-'}</div>
          <div className="small text-muted">{value?.account || '-'} &middot; {value?.ifsc || '-'}</div>
        </div>
      ),
    },
    {
      Header: 'Mobile',
      accessor: 'beneficiary.mobile',
      Cell: ({ row }) => (
        <span className="text-muted">{row.original.beneficiary?.mobile || '-'}</span>
      ),
    },
    {
      Header: 'Amount',
      accessor: 'amount',
      Cell: ({ value }) => (
        <span className="fw-semibold">{formatCurrency(parseFloat(value) || 0)}</span>
      ),
    },
    {
      Header: 'Charge',
      accessor: 'charge',
      Cell: ({ value }) => (
        <span className="text-muted">{formatCurrency(parseFloat(value) || 0)}</span>
      ),
    },
    {
      Header: 'Type',
      accessor: 'type',
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ value }) => {
        const v = (value || "").toLowerCase();

        const color =
          v === "success" ? "bg-success" :
            v === "failed" ? "bg-danger" :
              "bg-warning";

        const label =
          v === "success" ? "Success" :
            v === "failed" ? "Failed" :
              "Pending";

        return (
          <span className={`badge ${color}`}>
            {label}
          </span>
        );
      }
    },
    {
      Header: 'UTR',
      accessor: 'utr',
    },
    {
      Header: 'Created At',
      accessor: 'created_at',
      Cell: ({ value }) => (
        <span className="text-muted">{value ? new Date(value).toLocaleString() : '-'}</span>
      ),
    }
  ];

  return (
    <>
      <Pageheader
        mainheading="Payout History"
        parentfolder="Banking"
        activepage="Payout History"
      />
      <div className="page-content-box">
        <div className="page-content-box-inner">
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className='card-header d-flex justify-content-between align-items-center rounded-top'>
                  <h3 className="mb-0 fw-bold">Payout History</h3>
                </div>
                <div className="card-body">
                  {/* Filters */}
                  <div className="row mb-3 align-items-end">
                    <div className="col-md-3 mb-2 mb-md-0">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name, account, IFSC, or branch..."
                        value={searchTerm}
                        onChange={handleSearch}
                      />
                    </div>
                    <div className="col-md-2 mb-2 mb-md-0 d-none">
                      <select
                        className="form-select"
                        value={verificationFilter}
                        onChange={handleVerificationFilter}
                      >
                        <option value="">All Beneficiaries</option>
                        <option value="true">Verified Only</option>
                        <option value="false">Unverified Only</option>
                      </select>
                    </div>
                    <div className="col-md-2 mb-2 mb-md-0">
                      <select
                        className="form-select"
                        value={statusFilter}
                        onChange={handleStatusFilter}
                      >
                        <option value="">All Statuses</option>
                        <option value="1">Success</option>
                        <option value="2">Failed</option>
                        <option value="0">Pending</option>
                      </select>
                    </div>
                    <div className="col-md-2 mb-2 mb-md-0">
                      <input
                        type="date"
                        className="form-control"
                        value={dateFrom}
                        onChange={handleDateFrom}
                        placeholder="From"
                        max={dateTo || undefined}
                      />
                    </div>
                    <div className="col-md-2 mb-2 mb-md-0">
                      <input
                        type="date"
                        className="form-control"
                        value={dateTo}
                        onChange={handleDateTo}
                        placeholder="To"
                        min={dateFrom || undefined}
                      />
                    </div>
                    <div className="col-md-1 text-end">
                      <button className="btn btn-primary" onClick={handleClearAll}>
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card-body p-0">
                  {loading ? (
                    <TableShimmerLoader />
                  ) : error ? (
                    <div className="alert alert-danger m-3">{error}</div>
                  ) : (
                    <DataTable
                      columns={columns}
                      data={Array.isArray(beneficiaries) ? beneficiaries : []}
                      title="Payout History"
                      noDataText="No payouts found."
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Beneficiary</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteOtp('');
                    setDeletingBeneficiary(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete <strong>{deletingBeneficiary?.name}</strong>?</p>
                <p className="text-muted">An OTP has been sent to your registered mobile number.</p>
                <div className="mb-3">
                  <label className="form-label">Enter OTP</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter 6-digit OTP"
                    value={deleteOtp}
                    onChange={(e) => setDeleteOtp(e.target.value)}
                    maxLength={6}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteOtp('');
                    setDeletingBeneficiary(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Beneficiary Modal */}
      {showViewModal && viewingBeneficiary && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1055 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-primary">
                  <i className="fas fa-eye me-2"></i>
                  Beneficiary Details
                </h5>
                <button type="button" className="btn-close" onClick={closeViewModal}></button>
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  {/* Basic Information */}
                  <div className="col-12">
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <h6 className="card-title text-primary mb-3">
                          <i className="fas fa-user me-2"></i>
                          Basic Information
                        </h6>
                        <div className="row g-3">

                          <div className="col-md-6">
                            <label className="text-muted small">Beneficiary Name</label>
                            <div className="fw-semibold">{viewingBeneficiary.name || '-'} ({viewingBeneficiary.id})</div>
                          </div>
                          <div className="col-md-6">
                            <label className="text-muted small">Mobile Number</label>
                            <div className="fw-semibold">
                              {viewingBeneficiary.mobile ? (
                                <div className="d-flex align-items-center">
                                  <span className="badge bg-primary me-2">
                                    <i className="fa fa-mobile me-1"></i>
                                    {viewingBeneficiary.mobile}
                                  </span>
                                  <div className="btn-group" role="group">
                                    <button
                                      className="btn btn-sm btn-outline-success"
                                      onClick={() => window.open(`tel:${viewingBeneficiary.mobile}`, '_self')}
                                      title="Call"
                                    >
                                      <i className="fa fa-phone"></i>
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-info"
                                      onClick={() => window.open(`sms:${viewingBeneficiary.mobile}`, '_self')}
                                      title="SMS"
                                    >
                                      <i className="fa fa-comment-sms"></i>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="col-12">
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <h6 className="card-title text-success mb-3">
                          <i className="fas fa-university me-2"></i>
                          Bank Details
                        </h6>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="text-muted small">Account Number</label>
                            <div className="fw-semibold">
                              <span className="badge bg-secondary text-white font-monospace">
                                {viewingBeneficiary.account || '-'}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="text-muted small">IFSC Code</label>
                            <div className="fw-semibold">
                              <span className="badge bg-info text-white font-monospace">
                                {viewingBeneficiary.ifsc || '-'}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="text-muted small">Bank Name</label>
                            <div className="fw-semibold">{viewingBeneficiary.bank_name || '-'}</div>
                          </div>
                          <div className="col-md-6">
                            <label className="text-muted small">Branch</label>
                            <div className="fw-semibold">{viewingBeneficiary.branch || '-'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="col-12">
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <h6 className="card-title text-warning mb-3">
                          <i className="fas fa-shield-check me-2"></i>
                          Verification Status
                        </h6>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="text-muted small">Account Verification</label>
                            <div>
                              <span className={`badge ${viewingBeneficiary.account_verified ? 'bg-success' : 'bg-warning'}`}>
                                <i className={`fas ${viewingBeneficiary.account_verified ? 'fa-check-circle' : 'fa-clock'} me-1`}></i>
                                {viewingBeneficiary.account_verified ? 'Verified' : 'Pending'}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="text-muted small">IFSC Verification</label>
                            <div>
                              <span className={`badge ${viewingBeneficiary.ifsc_verified ? 'bg-success' : 'bg-warning'}`}>
                                <i className={`fas ${viewingBeneficiary.ifsc_verified ? 'fa-check-circle' : 'fa-clock'} me-1`}></i>
                                {viewingBeneficiary.ifsc_verified ? 'Verified' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="col-12">
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <h6 className="card-title text-info mb-3">
                          <i className="fas fa-info-circle me-2"></i>
                          Additional Information
                        </h6>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="text-muted small">Added On</label>
                            <div className="fw-semibold">
                              {viewingBeneficiary.created_at
                                ? new Date(viewingBeneficiary.created_at).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                                : '-'
                              }
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="text-muted small">Last Updated</label>
                            <div className="fw-semibold">
                              {viewingBeneficiary.updated_at
                                ? new Date(viewingBeneficiary.updated_at).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                                : '-'
                              }
                            </div>
                          </div>
                          {viewingBeneficiary.description && (
                            <div className="col-12">
                              <label className="text-muted small">Description</label>
                              <div className="fw-semibold">{viewingBeneficiary.description}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  {viewingBeneficiary.mobile && (
                    <div className="col-12">
                      <div className="card border-0 bg-light">
                        <div className="card-body">
                          <h6 className="card-title text-primary mb-3">
                            <i className="fa fa-mobile me-2"></i>
                            Mobile Actions
                          </h6>
                          <div className="d-flex flex-wrap gap-2">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => window.open(`tel:${viewingBeneficiary.mobile}`, '_self')}
                            >
                              <i className="fa fa-phone me-1"></i>
                              Call {viewingBeneficiary.mobile}
                            </button>
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() => window.open(`sms:${viewingBeneficiary.mobile}`, '_self')}
                            >
                              <i className="fa fa-comment-sms me-1"></i>
                              Send SMS
                            </button>
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => {
                                navigator.clipboard.writeText(viewingBeneficiary.mobile);
                                toast.success('Mobile number copied to clipboard!');
                              }}
                            >
                              <i className="fa fa-copy me-1"></i>
                              Copy Number
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-outline-secondary" onClick={closeViewModal}>
                  <i className="fas fa-times me-2"></i>
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    closeViewModal();
                    handlePay(viewingBeneficiary);
                  }}
                >
                  <i className="fas fa-paper-plane me-2"></i>
                  Send Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-success">
                  <i className="fas fa-money-bill-transfer me-2"></i>
                  Send Payment
                </h5>
                <button type="button" className="btn-close" onClick={closePaymentModals}></button>
              </div>
              <div className="modal-body">
                <div className="card bg-light border-0 mb-4">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-2">Payment Details:</h6>
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <small className="text-muted">Beneficiary Name</small>
                        <div className="fw-semibold">{selectedBeneficiary?.name || '-'}</div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Account Number</small>
                        <div className="fw-semibold font-monospace">{selectedBeneficiary?.account || '-'}</div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">IFSC Code</small>
                        <div className="fw-semibold font-monospace">{selectedBeneficiary?.ifsc || '-'}</div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Bank Branch</small>
                        <div className="fw-semibold">{selectedBeneficiary?.branch || '-'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Payment Amount <span className="text-danger">*</span></label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text">
                      <i className="fas fa-rupee-sign text-primary"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter amount"
                      value={paymentAmount}
                      onChange={handleAmountChange}
                    />
                  </div>
                  <small className="form-text text-muted">
                    <i className="fas fa-info-circle me-1"></i>
                    Minimum payment amount is ₹1
                  </small>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Select Payment Channel <span className="text-danger">*</span></label>
                  <div className="row g-1">
                    {[1, 2, 3].map((channel) => (
                      <div key={channel} className="col-4">
                        <div
                          className={`card border-2 cursor-pointer ${selectedChannel === channel.toString()
                            ? 'border-primary bg-primary text-white'
                            : 'border-light bg-light'
                            }`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedChannel(channel.toString())}
                        >
                          <div className={`card-body text-center  ${selectedChannel === channel.toString() ? 'text-white' : 'text-primary'
                            }`}>
                            <i className={`${selectedChannel === channel.toString() ? 'text-white' : 'text-primary'
                              }`}></i>
                            <div className="fw-semibold">Channel {channel}</div>

                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <small className="form-text text-muted">
                    <i className="fas fa-info-circle me-1"></i>
                    Select the payment channel for this transaction
                  </small>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Select Account <span className="text-danger">*</span></label>
                  {!Array.isArray(accounts) || accounts.length === 0 ? (
                    <div className="text-center p-4 border rounded bg-light">
                      <i className="fas fa-wallet fa-2x text-muted mb-3"></i>
                      <p className="text-muted mb-3">No accounts available</p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          setShowPaymentModal(false);
                          setShowCreateAccountModal(true);
                        }}
                      >
                        <i className="fas fa-plus me-2"></i>
                        Create Account
                      </button>
                    </div>
                  ) : (
                    <div className="list-group">
                      {accounts.map((account) => (
                        <div
                          key={account.id}
                          className={`list-group-item list-group-item-action border rounded mb-2 ${selectedAccount === account.id ? 'active' : ''
                            }`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedAccount(account.id)}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{account.name || 'Unnamed Account'}</h6>
                              <small className="text-muted">{account.number || '-'}</small>
                            </div>
                            <div className="text-end">
                              <div className="fw-semibold">{account.balance || 0}</div>
                              {selectedAccount === account.id && (
                                <i className="fas fa-check-circle text-success"></i>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Enter MPIN <span className="text-danger">*</span></label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text">
                      <i className="fas fa-lock text-primary"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control text-center"
                      placeholder="••••"
                      value={mpin}
                      onChange={handleMpinChange}
                      maxLength="4"
                      style={{ letterSpacing: '8px', fontSize: '1.2rem' }}
                    />
                  </div>
                  <small className="form-text text-muted">
                    <i className="fas fa-info-circle me-1"></i>
                    Enter your 4-digit MPIN
                  </small>
                </div>

                <div className="alert alert-info d-flex align-items-center">
                  <i className="fas fa-shield-alt me-2"></i>
                  <small>Your transaction is secured with 256-bit SSL encryption</small>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-outline-secondary" onClick={closePaymentModals}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success px-4"
                  onClick={handleFinalPayment}
                  disabled={!selectedAccount || mpin.length !== 4 || processingPayment || !paymentAmount || parseInt(paymentAmount) <= 0}
                >
                  {processingPayment ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-2"></i>
                      Send Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {showCreateAccountModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-primary">
                  <i className="fas fa-plus-circle me-2"></i>
                  Create New Account
                </h5>
                <button type="button" className="btn-close" onClick={closePaymentModals}></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info d-flex align-items-center mb-4">
                  <i className="fas fa-info-circle me-2"></i>
                  <small>You need an account to proceed with the payment. Please create one below.</small>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Account Name <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-user text-primary"></i>
                    </span>
                    <input
                      type="text"
                      className={`form-control ${createAccountErrors.name ? 'is-invalid' : ''}`}
                      placeholder="Enter account name"
                      value={newAccountName}
                      onChange={handleNewAccountNameChange}
                      maxLength="255"
                    />
                    {createAccountErrors.name && (
                      <div className="invalid-feedback">{createAccountErrors.name}</div>
                    )}
                  </div>
                  <small className="form-text text-muted mt-1">
                    <i className="fas fa-info-circle me-1"></i>
                    Choose a name for your account (e.g., "Main Account", "Savings")
                  </small>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Set MPIN <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-lock text-primary"></i>
                    </span>
                    <input
                      type="password"
                      className={`form-control text-center ${createAccountErrors.mpin ? 'is-invalid' : ''}`}
                      placeholder="••••"
                      value={newAccountMpin}
                      onChange={handleNewAccountMpinChange}
                      maxLength="4"
                      style={{ letterSpacing: '8px', fontSize: '1.2rem' }}
                    />
                    {createAccountErrors.mpin && (
                      <div className="invalid-feedback">{createAccountErrors.mpin}</div>
                    )}
                  </div>
                  <small className="form-text text-muted mt-1">
                    <i className="fas fa-shield-alt me-1"></i>
                    Set a 4-digit PIN for secure transactions
                  </small>
                </div>

                <div className="alert alert-warning d-flex align-items-center">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <small>Remember your MPIN. It will be required for all transactions.</small>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-outline-secondary" onClick={closePaymentModals}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-4"
                  onClick={handleCreateAccount}
                  disabled={creatingAccount}
                >
                  {creatingAccount ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus me-2"></i>
                      Create Account
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

export default BeneficiaryList;
