import React, { useContext, useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../pages/components/DataTable';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';
import { AuthContext } from '../../core/hooks/context';
import { Drawer } from 'antd';
import TransactionReceipt from '../../pages/aeps/TransactionReceipt';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UpiHistory = ({ isHeader = true }) => {
  const { userData: user } = useContext(AuthContext);
  const navigate = useNavigate();
  const apiService = ApiService();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logo, setLogo] = useState('');
  const [userRole, setUserRole] = useState(user?.role || 0);

  // Super Admin check (role 1)
  const isSuperAdmin = userRole == 1 || user?.role == 1;

  // 3-Way JSON Modal State (for Super Admin)
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [activeJsonData, setActiveJsonData] = useState(null);
  const [activeJsonRow, setActiveJsonRow] = useState(null);
  const [copiedJson, setCopiedJson] = useState(false);

  // Safely format JSON string or object
  const formatJsonString = (val) => {
    if (!val) return '';
    if (typeof val === 'object') {
      try {
        return JSON.stringify(val, null, 2);
      } catch (e) {
        return String(val);
      }
    }
    try {
      const parsed = JSON.parse(val);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return String(val);
    }
  };

  const handleOpen3WayJson = (jsonVal, rowData) => {
    setActiveJsonData(jsonVal);
    setActiveJsonRow(rowData);
    setCopiedJson(false);
    setJsonModalOpen(true);
  };

  const handleCopyJson = () => {
    if (!activeJsonData) return;
    try {
      navigator.clipboard.writeText(formatJsonString(activeJsonData));
      setCopiedJson(true);
      toast.info('JSON copied to clipboard!');
      setTimeout(() => setCopiedJson(false), 2000);
    } catch (err) {
      toast.error('Failed to copy JSON.');
    }
  };

  // Filter states
  const [selectedShop, setSelectedShop] = useState('all');
  const [selectedAdmin, setSelectedAdmin] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [uniqueAdmins, setUniqueAdmins] = useState([]);
  const [dynamicFilters, setDynamicFilters] = useState([]);

  // Checking status of pending transaction
  const [checkingTxnId, setCheckingTxnId] = useState(null);

  // Receipt Drawer State
  const [receiptDrawerOpen, setReceiptDrawerOpen] = useState(false);
  const [selectedReceiptData, setSelectedReceiptData] = useState(null);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 50,
    total: 0,
    from: 0,
    to: 0
  });

  // KPI Summary stats
  const [summaryStats, setSummaryStats] = useState({
    totalCount: 0,
    totalAmount: 0,
    successCount: 0,
    successAmount: 0,
    failedCount: 0
  });

  // Fetch Child Roles for recursive hierarchy filtering
  const fetchChildRoles = async (parentId, level) => {
    try {
      const response = await apiService.vPost('/api/v2/aeps/roles-by-user', { admin_id: parentId });
      if (response.data.status === 1 && response.data.data && response.data.data.users && response.data.data.users.length > 0) {
        setDynamicFilters(prev => {
          const newFilters = prev.filter(f => f.level < level);
          return [...newFilters, { level, data: response.data.data, selectedValue: null }];
        });
      } else {
        setDynamicFilters(prev => prev.filter(f => f.level < level));
      }
    } catch (err) {
      console.error('Failed to fetch child roles:', err);
    }
  };

  const handleDynamicChange = (e, level) => {
    const value = e.target.value;
    setDynamicFilters(prev => prev.map(f => {
      if (f.level === level) {
        return { ...f, selectedValue: value };
      }
      return f;
    }));

    if (value && value !== 'all') {
      fetchChildRoles(value, level + 1);
    } else {
      setDynamicFilters(prev => prev.filter(f => f.level <= level));
    }
  };

  // Fetch unique admins for Super Admin (role 1)
  const fetchAdmins = async () => {
    try {
      const response = await apiService.vGet('/api/v2/aeps/get-all-admins');
      if (response.data.status === 1) {
        setUniqueAdmins(response.data.admins || []);
      }
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    }
  };

  const getEffectiveFilters = () => {
    let effectiveAdminId = selectedAdmin;
    if (dynamicFilters && dynamicFilters.length > 0) {
      dynamicFilters.forEach(level => {
        if (level.selectedValue && level.selectedValue !== 'all') {
          effectiveAdminId = level.selectedValue;
        }
      });
    }

    return {
      from_date: fromDate,
      to_date: toDate,
      status: statusFilter,
      search: searchTerm,
      outlet_id: selectedShop,
      selected_admin_id: effectiveAdminId
    };
  };

  const fetchTransactions = async (page = 1, perPage = 50, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        page: page,
        per_page: perPage,
        type: 'upicw',
        outletId: user?.mid,
        ...(filters.from_date && { from_date: filters.from_date }),
        ...(filters.to_date && { to_date: filters.to_date }),
        ...(filters.status && filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.outlet_id && filters.outlet_id !== 'all' && { outlet_id: filters.outlet_id }),
        ...(filters.selected_admin_id && filters.selected_admin_id !== 'all' && { selected_admin_id: filters.selected_admin_id })
      };

      const response = await apiService.vPost('/api/v2/aeps/aeps-history', payload);

      if (response.data.status !== 1) {
        setTransactions([]);
        setPagination({
          current_page: 1,
          last_page: 1,
          per_page: perPage,
          total: 0,
          from: 0,
          to: 0
        });
        setSummaryStats({
          totalCount: 0,
          totalAmount: 0,
          successCount: 0,
          successAmount: 0,
          failedCount: 0
        });
        return;
      }

      setLogo(response.data.logo || '');
      if (response.data.user_role !== undefined) {
        setUserRole(response.data.user_role);
      }
      const txnsList = response.data.data?.data || [];
      setTransactions(txnsList);

      const pag = response.data.data || {};
      setPagination({
        current_page: pag.current_page || 1,
        last_page: pag.last_page || 1,
        per_page: pag.per_page || perPage,
        total: pag.total || 0,
        from: pag.from || (txnsList.length > 0 ? 1 : 0),
        to: pag.to || txnsList.length
      });

      // Calculate summary for current view/page
      let totAmt = 0;
      let succCnt = 0;
      let succAmt = 0;
      let failCnt = 0;

      txnsList.forEach(t => {
        const amt = parseFloat(t.amount || 0);
        totAmt += amt;
        if (t.response_status === 1 || t.response_status === true) {
          succCnt += 1;
          succAmt += amt;
        } else {
          failCnt += 1;
        }
      });

      setSummaryStats({
        totalCount: pag.total || txnsList.length,
        totalAmount: totAmt,
        successCount: succCnt,
        successAmount: succAmt,
        failedCount: failCnt
      });

    } catch (err) {
      console.error('Failed to fetch UPI transactions:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to fetch UPI transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1, 50, {});

    if (user?.role == 1) {
      fetchAdmins();
    } else if (user?.id) {
      setSelectedAdmin(user.id);
    }
  }, []);

  useEffect(() => {
    setDynamicFilters([]);
    if (selectedAdmin && selectedAdmin !== 'all') {
      fetchChildRoles(selectedAdmin, 0);
    }
  }, [selectedAdmin]);

  const handlePageChange = (page) => {
    const filters = getEffectiveFilters();
    fetchTransactions(page, pagination.per_page, filters);
  };

  const handlePerPageChange = (perPage) => {
    const filters = getEffectiveFilters();
    fetchTransactions(1, perPage, filters);
  };

  const applyFilters = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const filters = getEffectiveFilters();
    fetchTransactions(1, pagination.per_page, filters);
  };

  const handleResetFilters = () => {
    setFromDate('');
    setToDate('');
    setStatusFilter('all');
    setSearchTerm('');
    setSelectedShop('all');
    if (user?.role == 1) {
      setSelectedAdmin('all');
    }
    setDynamicFilters([]);
    fetchTransactions(1, pagination.per_page, {});
  };

  // Re-check status of pending transaction
  const handleCheckStatus = async (item) => {
    setCheckingTxnId(item.id);
    try {
      let fpTxnId = item.fp_txn_id;
      if (!fpTxnId && item.response) {
        try {
          const resp = typeof item.response === 'string' ? JSON.parse(item.response) : item.response;
          fpTxnId = resp?.data?.fpTransactionId || resp?.data?.fingpayTxnId || resp?.fpTransactionId;
        } catch (e) {}
      }

      const res = await apiService.vPost('/api/v2/upicw/check-status', {
        partnerRequestId: item.merchant_txn_id,
        fingpayTxnId: fpTxnId || item.merchant_txn_id
      });

      if (res.data?.status) {
        toast.success(res.data.message || 'Status updated successfully!');
      } else {
        toast.info(res.data?.message || 'Transaction is still pending or not completed.');
      }
      // Refresh current page
      const filters = getEffectiveFilters();
      fetchTransactions(pagination.current_page, pagination.per_page, filters);
    } catch (err) {
      console.error('Check status error:', err);
      toast.error(err?.response?.data?.message || 'Failed to check status');
    } finally {
      setCheckingTxnId(null);
    }
  };

  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getStatusBadge = (status, responseMessage) => {
    if (status === true || status === 1) {
      return (
        <span className="badge bg-success-subtle text-success border border-success px-2.5 py-1 rounded-pill fw-semibold">
          <i className="fa fa-check-circle me-1"></i> Success
        </span>
      );
    } else if (status === false || status === 0) {
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger px-2.5 py-1 rounded-pill fw-semibold" title={responseMessage || ''}>
          <i className="fa fa-times-circle me-1"></i> Failed
        </span>
      );
    }
    return (
      <span className="badge bg-warning-subtle text-warning border border-warning px-2.5 py-1 rounded-pill fw-semibold">
        <i className="fa fa-clock me-1"></i> Pending
      </span>
    );
  };

  const handleViewReceipt = (transaction) => {
    let parsedResponse = {};
    try {
      if (typeof transaction.response === 'string') {
        parsedResponse = JSON.parse(transaction.response);
      } else if (transaction.response && typeof transaction.response === 'object') {
        parsedResponse = transaction.response;
      }
    } catch (e) {
      console.error('Error parsing transaction response:', e);
    }

    const payerVpa = transaction.payer_vpa || transaction.aadhaar_number || parsedResponse?.data?.payerVpa || 'N/A';

    const receiptData = {
      transactionData: parsedResponse,
      transactionType: 'UPICW',
      aadhaarNumber: payerVpa,
      bankName: transaction.bank_name || 'UPI QR',
      customerMobile: transaction.customer_mobile,
      agentName: transaction.shop_name || transaction.full_name || user?.name || 'Authorized Merchant',
      agentMobile: transaction.shop_phone || user?.mobile || 'N/A',
      merchantName: 'UPI Cash Withdrawal Services',
      retailerLocation: transaction.location || transaction.city || transaction.address || user?.address || 'India',
      commission: transaction.commission || 0,
      charges: transaction.charges || 0,
      amount: transaction.amount,
      rrn: transaction.rrn || parsedResponse?.data?.bankRRN || parsedResponse?.data?.rrn || 'N/A',
      status: transaction.response_status,
      createdAt: transaction.created_at,
      logo: logo || '',
    };
    setSelectedReceiptData(receiptData);
    setReceiptDrawerOpen(true);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      {isHeader && (
        <Pageheader
          mainheading="UPI Cash Withdrawal History"
          parentfolder="Banking"
          activepage="UPI Transaction List"
        />
      )}

      <div className="page-content-box p-3">
        <div className="container-fluid p-0">

          {/* TOP KPI CARDS */}
          <div className="row g-3 mb-4">
            <div className="col-xl-3 col-sm-6">
              <div className="card border-0 shadow-sm rounded-4 h-100" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
                <div className="card-body p-3.5 text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-1 text-white-50 text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
                        Total UPI Transactions
                      </p>
                      <h3 className="mb-0 fw-bold">{pagination.total || summaryStats.totalCount}</h3>
                    </div>
                    <div className="rounded-circle p-2.5 bg-white bg-opacity-25 d-flex align-items-center justify-content-center" style={{ width: '46px', height: '46px' }}>
                      <i className="fa fa-qrcode fs-4 text-white"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-sm-6">
              <div className="card border-0 shadow-sm rounded-4 h-100" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}>
                <div className="card-body p-3.5 text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-1 text-white-50 text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
                        Successful Withdrawals
                      </p>
                      <h3 className="mb-0 fw-bold">₹{formatAmount(summaryStats.successAmount)}</h3>
                      <small className="text-white-50">{summaryStats.successCount} txns successful</small>
                    </div>
                    <div className="rounded-circle p-2.5 bg-white bg-opacity-25 d-flex align-items-center justify-content-center" style={{ width: '46px', height: '46px' }}>
                      <i className="fa fa-check-double fs-4 text-white"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-sm-6">
              <div className="card border-0 shadow-sm rounded-4 h-100" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)' }}>
                <div className="card-body p-3.5 text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-1 text-white-50 text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
                        Current Page Volume
                      </p>
                      <h3 className="mb-0 fw-bold">₹{formatAmount(summaryStats.totalAmount)}</h3>
                      <small className="text-white-50">{transactions.length} displayed on page</small>
                    </div>
                    <div className="rounded-circle p-2.5 bg-white bg-opacity-25 d-flex align-items-center justify-content-center" style={{ width: '46px', height: '46px' }}>
                      <i className="fa fa-money-bill-wave fs-4 text-white"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-sm-6">
              <div className="card border-0 shadow-sm rounded-4 h-100" style={{ background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)' }}>
                <div className="card-body p-3.5 text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-1 text-white-50 text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
                        Failed / Pending
                      </p>
                      <h3 className="mb-0 fw-bold">{summaryStats.failedCount}</h3>
                      <small className="text-white-50">Requires check / refunded</small>
                    </div>
                    <div className="rounded-circle p-2.5 bg-white bg-opacity-25 d-flex align-items-center justify-content-center" style={{ width: '46px', height: '46px' }}>
                      <i className="fa fa-exclamation-triangle fs-4 text-white"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CARD CONTAINER */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            
            {/* FILTER BAR HEADER */}
            <div className="card-header bg-white border-bottom p-3">
              <form onSubmit={applyFilters}>
                <div className="row g-2 align-items-center">

                  {/* Super Admin selector */}
                  {userRole == 1 && (
                    <div className="col-auto">
                      <select
                        className="form-select form-select-sm"
                        value={selectedAdmin}
                        onChange={(e) => setSelectedAdmin(e.target.value)}
                        style={{ minWidth: '150px' }}
                      >
                        <option value="all">All Admins</option>
                        {uniqueAdmins.map((admin) => (
                          <option key={admin.id} value={admin.id}>
                            {admin.name} ({admin.id})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Recursive Child Role Filters */}
                  {dynamicFilters.map((levelFilter) => (
                    <div className="col-auto" key={levelFilter.level}>
                      <select
                        className="form-select form-select-sm"
                        value={levelFilter.selectedValue || ''}
                        onChange={(e) => handleDynamicChange(e, levelFilter.level)}
                        style={{ minWidth: '150px' }}
                      >
                        <option value="">Select {levelFilter.data.role_name}</option>
                        <option value="all">All {levelFilter.data.role_name}s</option>
                        {levelFilter.data.users && levelFilter.data.users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.id})
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}

                  {/* Date Range Filters */}
                  <div className="col-auto">
                    <div className="input-group input-group-sm">
                      <input
                        type="date"
                        className="form-control"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        title="From Date"
                      />
                      <span className="input-group-text bg-white text-muted">to</span>
                      <input
                        type="date"
                        className="form-control"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        title="To Date"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="col-auto">
                    <select
                      className="form-select form-select-sm"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="1">Success</option>
                      <option value="0">Failed</option>
                    </select>
                  </div>

                  {/* Search Term Input */}
                  <div className="col-auto" style={{ minWidth: '220px' }}>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="fa fa-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Txn ID, Mobile, VPA..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="col-auto d-flex gap-1.5">
                    <button type="submit" className="btn btn-primary btn-sm px-3 rounded-pill fw-semibold">
                      <i className="fa fa-filter me-1"></i> Search
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm px-3 rounded-pill"
                      onClick={handleResetFilters}
                      title="Reset filters"
                    >
                      <i className="fa fa-refresh me-1"></i> Reset
                    </button>
                  </div>

                  {/* Per Page Selector */}
                  <div className="col-auto ms-auto">
                    <select
                      className="form-select form-select-sm"
                      value={pagination.per_page}
                      onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
                    >
                      <option value={25}>25 / page</option>
                      <option value={50}>50 / page</option>
                      <option value={100}>100 / page</option>
                      <option value={200}>200 / page</option>
                    </select>
                  </div>

                </div>
              </form>
            </div>

            {/* TABLE CONTENT */}
            {loading ? (
              <div className="p-4">
                <TableShimmerLoader />
              </div>
            ) : error ? (
              <div className="alert alert-danger m-3 rounded-3">{error}</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <div className="mb-3">
                  <div className="d-inline-flex p-3 rounded-circle bg-light">
                    <i className="fa fa-qrcode text-muted" style={{ fontSize: '38px' }}></i>
                  </div>
                </div>
                <h5 className="fw-bold text-dark">No UPI Transactions Found</h5>
                <p className="small mb-3">No UPI Cash Withdrawal records matched your selected criteria.</p>
                <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={handleResetFilters}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <DataTable
                      columns={[
                        {
                          Header: '#',
                          accessor: 'sn',
                          Cell: ({ row }) => (
                            <span className="text-muted small fw-semibold">
                              {(pagination.from - 1) + row.index + 1}
                            </span>
                          ),
                          disableSortBy: true,
                          width: 45,
                        },
                        {
                          Header: 'Shop Details',
                          accessor: 'shop_name',
                          Cell: ({ row }) => (
                            <div className="d-flex flex-column py-1">
                              <span className="fw-bold text-dark text-truncate" style={{ maxWidth: '170px' }} title={row.original.shop_name}>
                                {row.original.shop_name || 'Retailer Shop'}
                              </span>
                              <small className="text-muted">
                                {row.original.full_name || 'Merchant'}
                              </small>
                              <span className="badge bg-light text-dark font-monospace border mt-1 align-self-start" style={{ fontSize: '11px' }}>
                                MID: {row.original.outletId || row.original.mid || 'N/A'}
                              </span>
                            </div>
                          ),
                          exportFormatter: (row) => `${row.shop_name || 'N/A'} | ${row.outletId || ''}`,
                        },
                        {
                          Header: 'TXN Info',
                          accessor: 'merchant_txn_id',
                          Cell: ({ row }) => (
                            <div className="d-flex flex-column py-1">
                              <div className="mb-0.5">
                                <span className="text-muted small me-1">Ref:</span>
                                <span className="font-monospace text-primary fw-bold">
                                  {row.original.merchant_txn_id}
                                </span>
                              </div>
                              <div className="text-muted small text-truncate" style={{ maxWidth: '180px' }}>
                                Bank: <span className="fw-semibold text-dark">{row.original.bank_name || 'UPI'}</span>
                              </div>
                              {row.original.rrn && (
                                <div className="text-muted small">
                                  RRN: <span className="font-monospace fw-semibold text-secondary">{row.original.rrn}</span>
                                </div>
                              )}
                            </div>
                          ),
                          exportFormatter: (row) => `${row.merchant_txn_id || 'N/A'} | ${row.rrn || 'N/A'}`,
                        },
                        {
                          Header: 'Customer / VPA',
                          accessor: 'customer_mobile',
                          Cell: ({ row }) => {
                            const vpa = row.original.payer_vpa || row.original.aadhaar_number;
                            return (
                              <div className="d-flex flex-column py-1">
                                <div className="mb-1 text-dark fw-semibold">
                                  <i className="fa fa-mobile-alt text-muted me-1.5"></i>
                                  {row.original.customer_mobile || 'N/A'}
                                </div>
                                {vpa ? (
                                  <div className="text-truncate font-monospace small text-muted" style={{ maxWidth: '180px' }} title={vpa}>
                                    <i className="fa fa-at text-info me-1"></i>
                                    {vpa}
                                  </div>
                                ) : (
                                  <span className="text-muted small">VPA: N/A</span>
                                )}
                              </div>
                            );
                          },
                          exportFormatter: (row) => `${row.customer_mobile || 'N/A'} | ${row.payer_vpa || row.aadhaar_number || ''}`,
                        },
                        {
                          Header: 'Type',
                          accessor: 'aeps_type',
                          Cell: ({ value }) => (
                            <span className="badge bg-purple-subtle text-purple border border-purple-subtle px-2.5 py-1 rounded-pill fw-semibold" style={{ backgroundColor: '#ede9fe', color: '#6d28d9', borderColor: '#ddd6fe' }}>
                              {value || 'UPICW'}
                            </span>
                          ),
                          exportFormatter: (row) => row.aeps_type || 'UPICW',
                        },
                        {
                          Header: 'Amount',
                          accessor: 'amount',
                          Cell: ({ value }) => (
                            <span className="fw-bold text-success fs-6">
                              ₹{formatAmount(value)}
                            </span>
                          ),
                          exportFormatter: (row) => formatAmount(row.amount),
                        },
                        {
                          Header: 'Status',
                          accessor: 'response_status',
                          Cell: ({ value, row }) => (
                            <div className="d-flex flex-column py-1">
                              <div>{getStatusBadge(value, row.original.response_message)}</div>
                              {row.original.response_message && (
                                <small className="text-muted mt-1 text-truncate" style={{ maxWidth: '150px' }} title={row.original.response_message}>
                                  {row.original.response_message}
                                </small>
                              )}
                            </div>
                          ),
                          disableSortBy: true,
                          exportFormatter: (row) => (row.response_status === 1 || row.response_status === true ? 'Success' : 'Failed'),
                        },
                        ...(isSuperAdmin ? [
                          {
                            Header: '3-Way Status',
                            accessor: 'auth3way',
                            Cell: ({ value, row }) => {
                              const val = Number(value);
                              if (val === 1) {
                                return (
                                  <span
                                    className="badge rounded-pill fw-semibold px-2.5 py-1.5 text-white shadow-sm"
                                    style={{
                                      backgroundColor: '#10b981',
                                      cursor: row.original.response_3way ? 'pointer' : 'default',
                                    }}
                                    onClick={() => row.original.response_3way && handleOpen3WayJson(row.original.response_3way, row.original)}
                                    title={row.original.response_3way ? '3-Way Success. Click to view response JSON' : '3-Way Success'}
                                  >
                                    <i className="fa fa-check-circle me-1"></i>3-Way Success
                                  </span>
                                );
                              }
                              if (val === 2) {
                                return (
                                  <span
                                    className="badge rounded-pill fw-semibold px-2.5 py-1.5 text-white shadow-sm"
                                    style={{
                                      backgroundColor: '#ef4444',
                                      cursor: row.original.response_3way ? 'pointer' : 'default',
                                    }}
                                    onClick={() => row.original.response_3way && handleOpen3WayJson(row.original.response_3way, row.original)}
                                    title={row.original.response_3way ? '3-Way Failed. Click to view response JSON' : '3-Way Failed'}
                                  >
                                    <i className="fa fa-times-circle me-1"></i>3-Way Failed
                                  </span>
                                );
                              }
                              return (
                                <span
                                  className="badge rounded-pill fw-semibold px-2.5 py-1.5 text-secondary border shadow-sm"
                                  style={{ backgroundColor: '#f1f5f9', color: '#64748b', borderColor: '#cbd5e1' }}
                                >
                                  <i className="fa fa-clock-o me-1"></i>3-Way Not Run
                                </span>
                              );
                            },
                            disableSortBy: true,
                            exportFormatter: (row) => {
                              const val = Number(row.auth3way);
                              if (val === 1) return '3-Way Success';
                              if (val === 2) return '3-Way Failed';
                              return '3-Way Not Run';
                            },
                          },
                          {
                            Header: '3-Way Response',
                            accessor: 'response_3way',
                            Cell: ({ value, row }) => {
                              if (!value) {
                                return <span className="text-muted small">No Response</span>;
                              }
                              return (
                                <button
                                  type="button"
                                  className="btn btn-sm rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1.5 shadow-sm fw-medium"
                                  style={{
                                    backgroundColor: '#0f172a',
                                    color: '#38bdf8',
                                    border: '1px solid #334155',
                                    fontSize: '11.5px',
                                  }}
                                  onClick={() => handleOpen3WayJson(value, row.original)}
                                  title="Click to view 3-Way response in JSON format"
                                >
                                  <i className="fa fa-code text-warning"></i>
                                  <span>View JSON</span>
                                </button>
                              );
                            },
                            disableSortBy: true,
                            exportFormatter: (row) => (typeof row.response_3way === 'string' ? row.response_3way : JSON.stringify(row.response_3way || '')),
                          },
                        ] : []),
                        {
                          Header: 'Date & Time',
                          accessor: 'created_at',
                          Cell: ({ value }) => {
                            if (!value) return 'N/A';
                            const dateObj = new Date(value);
                            return (
                              <div className="d-flex flex-column py-1">
                                <span className="fw-medium text-dark">
                                  {dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                                <small className="text-muted">
                                  {dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </small>
                              </div>
                            );
                          },
                          exportFormatter: (row) => row.created_at ? new Date(row.created_at).toLocaleString() : 'N/A',
                        },
                        {
                          Header: 'Action',
                          accessor: 'actions',
                          id: 'actions',
                          disableSortBy: true,
                          Cell: ({ row }) => (
                            <div className="d-flex align-items-center gap-1.5">
                              <button
                                className="btn btn-outline-primary btn-sm rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1 shadow-sm"
                                onClick={() => handleViewReceipt(row.original)}
                                title="View & Print Receipt"
                              >
                                <i className="fa fa-receipt"></i>
                                <span>Receipt</span>
                              </button>

                              {/* If status is pending or failed with partnerRequestId, allow instant status check */}
                              {(row.original.response_status === false || row.original.response_status === 0 || row.original.response_status === null) && (
                                <button
                                  className="btn btn-outline-warning btn-sm rounded-pill px-2 py-1"
                                  onClick={() => handleCheckStatus(row.original)}
                                  disabled={checkingTxnId === row.original.id}
                                  title="Re-verify Status with Fingpay"
                                >
                                  {checkingTxnId === row.original.id ? (
                                    <span className="spinner-border spinner-border-sm" role="status"></span>
                                  ) : (
                                    <i className="fa fa-refresh"></i>
                                  )}
                                </button>
                              )}
                            </div>
                          ),
                        },
                      ]}
                      data={transactions}
                      title=""
                      noDataText="No transaction history found."
                      showPagination={false}
                      customTableClass="table table-hover align-middle mb-0"
                      headerClass="bg-light text-muted small text-uppercase fw-bold border-bottom"
                    />
                  </div>
                </div>

                {/* PAGINATION FOOTER */}
                {transactions.length > 0 && (
                  <div className="card-footer bg-white border-top py-3">
                    <div className="row align-items-center">
                      <div className="col-md-6 text-center text-md-start mb-2 mb-md-0">
                        <span className="text-muted small">
                          Showing <span className="fw-bold text-dark">{pagination.from}</span> to <span className="fw-bold text-dark">{pagination.to}</span> of <span className="fw-bold text-dark">{pagination.total}</span> entries
                        </span>
                      </div>
                      <div className="col-md-6">
                        <nav aria-label="Page navigation">
                          <ul className="pagination pagination-sm justify-content-center justify-content-md-end mb-0">
                            <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
                              <button
                                className="page-link border-0"
                                onClick={() => handlePageChange(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                              >
                                <i className="fa fa-chevron-left small"></i>
                              </button>
                            </li>
                            <li className="page-item disabled">
                              <span className="page-link border-0 fw-bold text-dark px-3">
                                Page {pagination.current_page} of {pagination.last_page || 1}
                              </span>
                            </li>
                            <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
                              <button
                                className="page-link border-0"
                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                              >
                                <i className="fa fa-chevron-right small"></i>
                              </button>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

        </div>
      </div>

      {/* RECEIPT DRAWER */}
      <Drawer
        title="UPI Cash Withdrawal Receipt"
        placement="right"
        width={850}
        onClose={() => setReceiptDrawerOpen(false)}
        open={receiptDrawerOpen}
        styles={{ body: { padding: 0 } }}
      >
        {selectedReceiptData && (
          <TransactionReceipt data={selectedReceiptData} />
        )}
      </Drawer>

      {/* 3-WAY RESPONSE JSON MODAL (SUPER ADMIN ONLY) */}
      {jsonModalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 1060 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="modal-header bg-dark text-white py-3 px-4 border-0">
                <div className="d-flex align-items-center gap-2">
                  <div className="p-2 rounded-circle bg-white bg-opacity-10 text-info">
                    <i className="fa fa-code fs-5"></i>
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-white mb-0">3-Way Check Response (JSON)</h5>
                    <small className="text-white-50">
                      Txn Ref: <span className="font-monospace text-info fw-semibold">{activeJsonRow?.merchant_txn_id}</span>
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setJsonModalOpen(false)}
                ></button>
              </div>

              <div className="modal-body p-4 bg-light">
                {/* Status Bar */}
                <div className="card border-0 shadow-sm rounded-3 mb-3 p-3 bg-white">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div>
                      <span className="text-muted small me-2">3-Way Status:</span>
                      {Number(activeJsonRow?.auth3way) === 1 ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill fw-semibold">
                          <i className="fa fa-check-circle me-1"></i> 3-Way Success
                        </span>
                      ) : Number(activeJsonRow?.auth3way) === 2 ? (
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1 rounded-pill fw-semibold">
                          <i className="fa fa-times-circle me-1"></i> 3-Way Failed
                        </span>
                      ) : (
                        <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2.5 py-1 rounded-pill fw-semibold">
                          <i className="fa fa-clock-o me-1"></i> 3-Way Not Run
                        </span>
                      )}
                    </div>

                    {activeJsonRow?.amount && (
                      <div>
                        <span className="text-muted small me-2">Amount:</span>
                        <span className="fw-bold text-success">₹{formatAmount(activeJsonRow.amount)}</span>
                      </div>
                    )}

                    {activeJsonRow?.customer_mobile && (
                      <div>
                        <span className="text-muted small me-2">Customer:</span>
                        <span className="fw-medium text-dark">{activeJsonRow.customer_mobile}</span>
                      </div>
                    )}

                    {activeJsonRow?.merchant_txn_id && (
                      <div>
                        <span className="text-muted small me-2">Txn ID:</span>
                        <span className="font-monospace text-primary fw-semibold">{activeJsonRow.merchant_txn_id}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* JSON Display Box */}
                <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                  <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-2 px-3">
                    <span className="small text-light font-monospace">
                      <i className="fa fa-file-code-o me-1.5 text-warning"></i>
                      response_3way (JSON)
                    </span>
                    {activeJsonData && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-light rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1"
                        style={{ fontSize: '12px' }}
                        onClick={handleCopyJson}
                      >
                        <i className={`fa ${copiedJson ? 'fa-check text-success' : 'fa-copy'}`}></i>
                        <span>{copiedJson ? 'Copied!' : 'Copy JSON'}</span>
                      </button>
                    )}
                  </div>
                  <div className="card-body p-0" style={{ backgroundColor: '#0f172a' }}>
                    <pre
                      className="m-0 p-3 text-start"
                      style={{
                        maxHeight: '420px',
                        overflowY: 'auto',
                        color: '#38bdf8',
                        fontSize: '12.5px',
                        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                        lineHeight: '1.55',
                      }}
                    >
                      <code>{formatJsonString(activeJsonData) || 'No response data found'}</code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-white py-2.5 px-4 d-flex justify-content-between align-items-center">
                <span className="text-muted small">
                  Press Esc or Close to return to transaction list
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm rounded-pill px-4"
                  onClick={() => setJsonModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UpiHistory;
