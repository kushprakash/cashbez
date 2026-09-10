import React, { useContext, useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import TableShimmerLoader from '../components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';
import { AuthContext } from '../../core/hooks/context';

const AepsHistory = () => {
  const { userData: user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logo, setLogo] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 100,
    total: 0,
    from: 0,
    to: 0
  });

  const fetchTransactions = async (page = 1, perPage = 50) => {
    setLoading(true);
    setError(null);
    try {
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/aeps-history-all', { page: page, per_page: perPage });

      if (response.data.status !== 1) {
        throw new Error(response.data.message || 'Failed to fetch transaction history');
      }
      setLogo(response.data.logo || '');
      setTransactions(response.data.data.data || []);
      setPagination({
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page,
        per_page: response.data.data.per_page,
        total: response.data.data.total,
        from: response.data.data.from,
        to: response.data.data.to
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handlePageChange = (page) => {
    fetchTransactions(page, pagination.per_page);
  };

  const handlePerPageChange = (perPage) => {
    fetchTransactions(1, perPage);
  };

  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  const formatAepsType = (type) => {
    const types = {
      'BE': 'Balance Enquiry',
      'CW': 'Cash Withdrawal',
      'MS': 'Mini Statement',
      'M': 'Aadhaar Pay'
    };
    return types[type] || type || 'N/A';
  };

  const getStatusBadge = (status) => {
    if (status === true || status === 1) {
      return <span className="badge bg-success">Success</span>;
    } else if (status === false || status === 0) {
      return <span className="badge bg-danger">Failed</span>;
    }
    return <span className="badge bg-warning">Pending</span>;
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
      state: {
        transactionData: parsedResponse,
        transactionType: transaction.aeps_type,
        aadhaarNumber: transaction.aadhaar_number,
        bankName: transaction.bank_name,
        customerMobile: transaction.customer_mobile,
        agentName: transaction.shop_name || transaction.full_name || user?.name || 'Retailer Store',
        agentMobile: transaction.shop_phone || user?.mobile || 'N/A',
        merchantName: 'Banking Services',
        retailerLocation: transaction.location || transaction.city || transaction.address || user?.address || 'India',
        commission: transaction.commission || transaction.retailer_commission || 0,
        charges: transaction.charge || transaction.charges || 0,
        amount: transaction.amount,
        rrn: transaction.rrn,
        status: transaction.response_status,
        createdAt: transaction.created_at,
        logo: logo || '',
      }
    };

    navigate('/aeps-receipt', receiptData);
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
                <div className='card-header d-flex justify-content-between align-items-center rounded-top'>
                  <h3 className="mb-0 fw-bold">AEPS Transaction History</h3>
                  <div className="d-flex align-items-center gap-2">
                    <select
                      className="form-select form-select-sm"
                      value={pagination.per_page}
                      onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
                      style={{ width: 'auto' }}
                    >
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                      <option value={200}>200 per page</option>
                    </select>
                  </div>
                </div>

                {loading && <TableShimmerLoader />}
                {error && <div className="alert alert-danger m-3">{error}</div>}

                {!loading && !error && (
                  <div className="card border-0">
                    <div className="card-body p-0">
                      <DataTable
                        columns={[
                          {
                            Header: 'SN',
                            accessor: 'sn',
                            Cell: ({ row }) => (pagination.from - 1) + row.index + 1,
                            disableSortBy: true,
                          },
                          {
                            Header: 'Transaction ID',
                            accessor: 'merchant_txn_id',
                            Cell: ({ value }) => (
                              <span className="text-primary fw-bold">
                                {value ? value.slice(-6) : 'N/A'}
                              </span>
                            ),
                          },
                          {
                            Header: 'Customer Mobile',
                            accessor: 'customer_mobile',
                            Cell: ({ value }) => maskMobile(value),
                          },
                          {
                            Header: 'Aadhaar Number',
                            accessor: 'aadhaar_number',
                            Cell: ({ value }) => maskAadhaar(value),
                          },
                          {
                            Header: 'Bank Name',
                            accessor: 'bank_name',
                            Cell: ({ value }) => value || 'N/A',
                          },

                          {
                            Header: 'Transaction Type',
                            accessor: 'aeps_type',
                            Cell: ({ value }) => (
                              <span className="badge bg-info text-dark">
                                {formatAepsType(value)}
                              </span>
                            ),
                          },
                          {
                            Header: 'Amount (₹)',
                            accessor: 'amount',
                            Cell: ({ value }) => (
                              <span className="fw-bold text-success">
                                ₹{formatAmount(value)}
                              </span>
                            ),
                          },
                          {
                            Header: 'Status',
                            accessor: 'response_status',
                            Cell: ({ value }) => getStatusBadge(value),
                            disableSortBy: true,
                          },
                          {
                            Header: 'Response Message',
                            accessor: 'response_message',
                            Cell: ({ value }) => (
                              <span className="text-muted">
                                {value || 'No message'}
                              </span>
                            ),
                          },
                          {
                            Header: 'Date & Time',
                            accessor: 'created_at',
                            Cell: ({ value }) => {
                              return value ? new Date(value).toLocaleString('en-US', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              }) : 'N/A'
                            }
                          },
                          {
                            Header: 'Actions',
                            accessor: 'actions',
                            disableSortBy: true,
                            Cell: ({ row }) => (
                              <div className="d-flex gap-1">
                                <button
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => handleViewReceipt(row.original)}
                                  title="View Receipt"
                                >
                                  <i className="fa fa-receipt me-1"></i>
                                  Receipt
                                </button>
                              </div>
                            ),
                          },
                        ]}
                        data={transactions}
                        title="AEPS Transactions"
                        noDataText="No transaction history found."
                        pagination={{
                          ...pagination,
                          onPageChange: handlePageChange,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Pagination Summary */}
                {!loading && !error && transactions.length > 0 && (
                  <div className="card-footer d-flex justify-content-between align-items-center">
                    <div className="text-muted">
                      Showing {pagination.from} to {pagination.to} of {pagination.total} entries
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        disabled={pagination.current_page === 1}
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                      >
                        <i className="fa fa-chevron-left"></i> Previous
                      </button>

                      <span className="mx-2">
                        Page {pagination.current_page} of {pagination.last_page}
                      </span>

                      <button
                        className="btn btn-outline-primary btn-sm"
                        disabled={pagination.current_page === pagination.last_page}
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                      >
                        Next <i className="fa fa-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AepsHistory;