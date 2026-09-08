import React, { useContext, useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import TableShimmerLoader from '../components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';
import { AuthContext } from '../../core/hooks/context';
import Select from 'react-select';
import { Drawer } from 'antd';
import TransactionReceipt from './TransactionReceipt';

const AepsHistory = () => {
  const { userData: user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logo, setLogo] = useState('');
  const [userRole, setUserRole] = useState(user.role);

  // Filter states
  const [selectedShop, setSelectedShop] = useState('all');
  const [selectedAepsType, setSelectedAepsType] = useState('all');
  const [selectedAdmin, setSelectedAdmin] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [uniqueAdmins, setUniqueAdmins] = useState([]);
  const [dynamicFilters, setDynamicFilters] = useState([]);

  // Receipt Drawer State
  const [receiptDrawerOpen, setReceiptDrawerOpen] = useState(false);
  const [selectedReceiptData, setSelectedReceiptData] = useState(null);

  const fetchChildRoles = async (parentId, level) => {
    try {
      const apiService = ApiService();
      // Using 'admin_id' parameter as per backend implementation
      const response = await apiService.vPost('/api/v2/aeps/roles-by-user', { admin_id: parentId });

      if (response.data.status === 1 && response.data.data && response.data.data.users && response.data.data.users.length > 0) {
        setDynamicFilters(prev => {
          // Remove any levels deeper than or equal to current level
          const newFilters = prev.filter(f => f.level < level);
          // Store the single object response as data for this level
          return [...newFilters, { level, data: response.data.data, selectedValue: null }];
        });
      } else {
        // No children found or empty data, shorten the list
        setDynamicFilters(prev => prev.filter(f => f.level < level));
      }
    } catch (err) {
      console.error('Failed to fetch child roles:', err);
    }
  };

  const handleDynamicChange = (e, level) => {
    const value = e.target.value;

    // Update the selected value for this level
    setDynamicFilters(prev => prev.map(f => {
      if (f.level === level) {
        return { ...f, selectedValue: value };
      }
      return f;
    }));

    if (value && value !== 'all') {
      fetchChildRoles(value, level + 1);
    } else {
      // If cleared or 'all', remove subsequent levels
      setDynamicFilters(prev => prev.filter(f => f.level <= level));
    }
  };

  const fetchAdmins = async () => {
    try {
      const apiService = ApiService();
      const response = await apiService.vGet('/api/v2/aeps/get-all-admins');
      if (response.data.status === 1) {
        setUniqueAdmins(response.data.admins || []);
      }
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    }
  };

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 50,
    total: 0,
    from: 0,
    to: 0
  });



  const fetchTransactions = async (page = 1, perPage = 50, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const apiService = ApiService();

      // Build request payload with filters
      const payload = {
        page: page,
        per_page: perPage,
        outletId: user.mid,
        ...(filters.from_date && { from_date: filters.from_date }),
        ...(filters.to_date && { to_date: filters.to_date }),
        ...(filters.aeps_type && filters.aeps_type !== 'all' && { aeps_type: filters.aeps_type }),
        ...(filters.outlet_id && filters.outlet_id !== 'all' && { outlet_id: filters.outlet_id }),
        ...(filters.selected_admin_id && filters.selected_admin_id !== 'all' && { selected_admin_id: filters.selected_admin_id })
      };

      const response = await apiService.vPost('/api/v2/aeps/aeps-history', payload);

      if (response.data.status !== 1) {
        throw new Error(response.data.message || 'Failed to fetch transaction history');
      }

      setLogo(response.data.logo || '');

      setTransactions(response.data.data.data || []);

      const paginationData = {
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page,
        per_page: response.data.data.per_page,
        total: response.data.data.total,
        from: response.data.data.from,
        to: response.data.data.to
      };

      setPagination(paginationData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1, 50, {});

    // Fetch admins if user is super admin (role = 1)
    if (userRole == 1) {
      fetchAdmins();
    } else {
      setSelectedAdmin(user.id);
    }
  }, []);

  useEffect(() => {
    setDynamicFilters([]); // Reset dynamic filters when admin changes
    if (selectedAdmin && selectedAdmin !== 'all') {
      fetchChildRoles(selectedAdmin, 0);
    }
  }, [selectedAdmin]);

  const getEffectiveFilters = () => {
    let effectiveAdminId = selectedAdmin;

    // Iterate dynamic filters to find the deepest selected value
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
      aeps_type: selectedAepsType,
      outlet_id: selectedShop,
      selected_admin_id: effectiveAdminId
    };
  };

  const handlePageChange = (page) => {
    const filters = getEffectiveFilters();
    fetchTransactions(page, pagination.per_page, filters);
  };

  const handlePerPageChange = (perPage) => {
    const filters = getEffectiveFilters();
    fetchTransactions(1, perPage, filters);
  };

  const applyFilters = () => {
    const filters = getEffectiveFilters();
    fetchTransactions(1, pagination.per_page, filters);
  };

  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  const formatAepsType = (type) => {
    const types = {
      'BE': 'BE',
      'CW': 'CW',
      'MS': 'MS',
      'M': 'AP'
    };
    return types[type] || type || 'N/A';
  };

  const getStatusBadge = (status) => {
    if (status === true || status === 1) {
      return <span className="text-success">Success</span>;
    } else if (status === false || status === 0) {
      return <span className="text-danger">Failed</span>;
    }
    return <span className="text-warning">Pending</span>;
  };

  const maskAadhaar = (aadhaar) => {
    if (!aadhaar) return 'N/A';
    return aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '****-****-$3');
  };

  const maskMobile = (mobile) => {
    if (!mobile) return 'N/A';
    return mobile.replace(/(\d{6})(\d{4})/, '******$2');
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

    const receiptData = {
      transactionData: parsedResponse,
      transactionType: transaction.aeps_type,
      aadhaarNumber: transaction.aadhaar_number,
      bankName: transaction.bank_name,
      customerMobile: transaction.customer_mobile,
      agentName: transaction.shop_name || transaction.full_name || user?.name || 'Retailer Store',
      agentMobile: transaction.shop_phone || user?.mobile || 'N/A',
      merchantName: 'BharatPay Banking Services',
      retailerLocation: transaction.location || transaction.city || transaction.address || user?.address || 'India',
      commission: transaction.commission || transaction.retailer_commission || 0,
      charges: transaction.charge || transaction.charges || 0,
      amount: transaction.amount,
      rrn: transaction.rrn,
      status: transaction.response_status,
      createdAt: transaction.created_at,
      logo: logo || '',
    };
    setSelectedReceiptData(receiptData);
    setReceiptDrawerOpen(true);
  };

  return (
    <>
      <Pageheader
        mainheading="AEPS Transaction History"
        parentfolder="AEPS"
        activepage="Transaction History"
      />
      <div className="page-content-box">
        <div className="page-content-box-inner">
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className='card-header p-3 bg-white border-bottom rounded-top'>
                  <div className="row g-2 align-items-center">

                    {userRole && (userRole == 1) && (
                      <div className="col-auto">
                        <select
                          className="form-select form-select-sm"
                          value={selectedAdmin}
                          onChange={(e) => setSelectedAdmin(e.target.value)}
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

                    {/* Dynamic User Filters (Recursive) */}
                    {dynamicFilters.map((levelFilter, index) => (
                      <div className="col-auto" key={levelFilter.level}>
                        <select
                          className="form-select form-select-sm"
                          value={levelFilter.selectedValue || ''}
                          onChange={(e) => handleDynamicChange(e, levelFilter.level)}
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

                    {/* Date Range Filter */}
                    <div className="col-auto">
                      <div className="input-group input-group-sm">
                        <input
                          type="date"
                          className="form-control"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          placeholder="From Date"
                        />
                        <span className="input-group-text bg-white text-muted">to</span>
                        <input
                          type="date"
                          className="form-control"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          placeholder="To Date"
                        />
                      </div>
                    </div>

                    {/* AEPS Type Filter */}
                    <div className="col-auto">
                      <select
                        className="form-select form-select-sm"
                        value={selectedAepsType}
                        onChange={(e) => setSelectedAepsType(e.target.value)}
                      >
                        <option value="all">All Types</option>
                        <option value="BE">Balance Enquiry</option>
                        <option value="CW">Cash Withdrawal</option>
                        <option value="MS">Mini Statement</option>
                        <option value="M">Aadhaar Pay</option>
                      </select>
                    </div>

                    {/* Apply Filters Button */}
                    <div className="col-auto">
                      <button
                        className="btn btn-primary btn-sm px-3"
                        onClick={applyFilters}
                      >
                        <i className="fa fa-search me-1"></i>
                        Search
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
                </div>

                {loading && <div className="p-4"><TableShimmerLoader /></div>}
                {error && <div className="alert alert-danger m-3 rounded-0">{error}</div>}

                {!loading && !error && (
                  <>
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <DataTable
                          columns={[
                            {
                              Header: '#',
                              accessor: 'sn',
                              Cell: ({ row }) => <span className="text-muted small">{(pagination.from - 1) + row.index + 1}</span>,
                              disableSortBy: true,
                              width: 50,
                            },
                            {
                              Header: 'Shop Details',
                              accessor: 'shop_name',
                              Cell: ({ row }) => (
                                <div className="d-flex flex-column">
                                  <span className="fw-bold text-dark text-truncate" style={{ maxWidth: '150px' }} title={row.original.shop_name}>
                                    {row.original.shop_name || 'N/A'}
                                  </span>
                                  <small className="text-muted error-text">
                                    {row.original.full_name}
                                  </small>
                                  <span className="badge bg-light text-dark border mt-1 w-auto align-self-start">
                                    ID: {row.original.outletId}
                                  </span>
                                </div>
                              ),
                              exportFormatter: (row) => `${row.shop_name || 'N/A'} | ${row.outletId || ''}`,
                            },
                            {
                              Header: 'TXN Info',
                              accessor: 'merchant_txn_id',
                              Cell: ({ row }) => (
                                <div className="d-flex flex-column">
                                  <div className="mb-1">
                                    <span className="text-muted small me-1">Txn:</span>
                                    <span className="font-monospace text-dark fw-bold">
                                      {row.original.merchant_txn_id ? row.original.merchant_txn_id.slice(-8) : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="text-muted text-truncate " style={{ maxWidth: '170px' }} title={row.original.bank_name}>
                                    Bank: {row.original.bank_name || 'N/A'}
                                  </div>
                                  {row.original.rrn && (
                                    <div>
                                      <span className="text-muted small me-1">RRN:</span>
                                      <span className="small">{row.original.rrn}</span>
                                    </div>
                                  )}
                                </div>
                              ),
                              exportFormatter: (row) => `${row.merchant_txn_id || 'N/A'} | ${row.bank_name || 'N/A'} | ${row.rrn || 'N/A'}`,
                            },
                            {
                              Header: 'Customer',
                              accessor: 'customer_mobile',
                              Cell: ({ row }) => (
                                <div className="d-flex flex-column">
                                  <div className="mb-1">
                                    <i className="fa fa-mobile-alt text-muted me-1" style={{ width: '12px' }}></i>
                                    {maskMobile(row.original.customer_mobile)}
                                  </div>
                                  <div>
                                    <i className="fa fa-id-card text-muted me-1" style={{ width: '12px' }}></i>
                                    {maskAadhaar(row.original.aadhaar_number)}
                                  </div>
                                </div>
                              ),
                              exportFormatter: (row) => `${row.customer_mobile || "N/A"} | ${maskAadhaar(row.aadhaar_number)}`,
                            },
                            {
                              Header: 'Type',
                              accessor: 'aeps_type',
                              Cell: ({ value }) => {
                                const typeMap = {
                                  'BE': { label: 'BE', class: 'text-info' },
                                  'CW': { label: 'CW', class: 'text-danger' },
                                  'MS': { label: 'MS', class: ' text-warning' },
                                  'M': { label: 'AP', class: '  text-primary' },
                                };
                                const type = typeMap[value] || { label: value, class: '  text-secondary' };
                                return (
                                  <span className={`${type.class} `}>
                                    {type.label}
                                  </span>
                                );
                              },
                              exportFormatter: (row) => row.aeps_type
                            },
                            {
                              Header: 'TXN AMT',
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
                                <div className="d-flex flex-column">
                                  {getStatusBadge(value)}
                                  {row.original.response_message && (
                                    <small className="text-muted mt-1" style={{ maxWidth: '120px' }} title={row.original.response_message}>
                                      {row.original.response_message}
                                    </small>
                                  )}
                                </div>
                              ),
                              disableSortBy: true,
                              exportFormatter: (row) => {
                                let status = 'Pending';
                                if (row.response_status === true || row.response_status === 1) status = 'Success';
                                else if (row.response_status === false || row.response_status === 0) status = 'Failed';
                                return `${status}`;
                              }
                            },
                            {
                              Header: 'Date',
                              accessor: 'created_at',
                              Cell: ({ value }) => {
                                if (!value) return 'N/A';
                                const dateObj = new Date(value);
                                return (
                                  <div className="d-flex flex-column">
                                    <span className="fw-medium text-dark">
                                      {dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                    <small className="text-muted">
                                      {dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </small>
                                  </div>
                                );
                              },
                              exportFormatter: (row) => row.created_at ? new Date(row.created_at).toLocaleString() : 'N/A'
                            },
                            {
                              Header: 'Action',
                              accessor: 'actions',
                              id: 'actions',
                              disableSortBy: true,
                              Cell: ({ row }) => (
                                <button
                                  className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2 rounded-pill px-3 shadow-sm"
                                  onClick={() => handleViewReceipt(row.original, logo)}
                                  title="View Receipt"
                                >
                                  <i className="fa fa-receipt"></i>
                                  <span>View</span>
                                </button>
                              ),
                            },
                          ]}
                          data={transactions}
                          title="" // Title removed as it's repetitive
                          noDataText="No transaction history found."
                          showPagination={false}
                          customTableClass="table table-hover table-borderless align-middle mb-0"
                          headerClass="bg-light text-muted small text-uppercase fw-bold border-bottom"
                        />
                      </div>
                    </div>

                    {/* Pagination Footer */}
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
                                    Page {pagination.current_page}
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
        </div>
      </div>

      <Drawer
        title="Transaction Receipt"
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
    </>
  );
};

export default AepsHistory;