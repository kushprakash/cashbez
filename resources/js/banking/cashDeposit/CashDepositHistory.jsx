import React, { useContext, useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../pages/components/DataTable';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';
import { AuthContext } from '../../core/hooks/context';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CashDepositHistory = () => {
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

  const [filters, setFilters] = useState({
    from_date: '',
    to_date: '',
    status: '',
    transaction_id: ''
  });

  const fetchTransactions = async (page = 1, perPage = 50) => {
    setLoading(true);
    setError(null);
    try {
      const apiService = ApiService();
      
      const params = { 
        page: page, 
        per_page: perPage, 
        outletId: user.mid,
        ...filters
      };

      const response = await apiService.vPost('/api/v2/cash-deposit/history', params);
      
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
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handlePageChange = (page) => {
    fetchTransactions(page);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    fetchTransactions(1);
  };

  const clearFilters = () => {
    setFilters({
      from_date: '',
      to_date: '',
      status: '',
      transaction_id: ''
    });
    setTimeout(() => {
      fetchTransactions(1);
    }, 100);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return <span className="badge bg-success">Success</span>;
      case 'failed':
        return <span className="badge bg-danger">Failed</span>;
      case 'pending':
        return <span className="badge bg-warning">Pending</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    {
      header: 'Transaction ID',
      accessor: 'transaction_id',
      sortable: true,
      cell: (row) => (
        <div className="fw-bold text-primary">
          {row.transaction_id || row.id}
        </div>
      )
    },
    {
      header: 'Date & Time',
      accessor: 'created_at',
      sortable: true,
      cell: (row) => (
        <div>
          {formatDate(row.created_at)}
        </div>
      )
    },
    {
      header: 'Customer Mobile',
      accessor: 'customer_mobile',
      cell: (row) => (
        <div className="fw-medium">
          {row.customer_mobile || '-'}
        </div>
      )
    },
    {
      header: 'Bank Name',
      accessor: 'bank_name',
      cell: (row) => (
        <div>
          {row.bank_name || '-'}
        </div>
      )
    },
    {
      header: 'Amount',
      accessor: 'amount',
      sortable: true,
      cell: (row) => (
        <div className="fw-bold text-success">
          {formatAmount(row.amount)}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (row) => getStatusBadge(row.status)
    },
    {
      header: 'Reference ID',
      accessor: 'reference_id',
      cell: (row) => (
        <div className="text-muted">
          {row.reference_id || '-'}
        </div>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="d-flex gap-2">
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={() => viewTransactionDetails(row)}
          >
            <i className="fas fa-eye"></i> View
          </button>
          {row.status === 'success' && (
            <button 
              className="btn btn-sm btn-outline-success"
              onClick={() => downloadReceipt(row)}
            >
              <i className="fas fa-download"></i> Receipt
            </button>
          )}
        </div>
      )
    }
  ];

  const viewTransactionDetails = (transaction) => {
    // Implement transaction details modal or navigation
    console.log('View transaction details:', transaction);
  };

  const downloadReceipt = (transaction) => {
    // Implement receipt download functionality
    console.log('Download receipt:', transaction);
    toast.info('Receipt download functionality coming soon');
  };

  if (loading && transactions.length === 0) {
    return <TableShimmerLoader />;
  }

  return (
    <div className="container-fluid">
      <Pageheader
        title="Cash Deposit History"
        breadcrumbs={[
          { label: 'Banking', path: '/banking' },
          { label: 'Cash Deposit History', active: true }
        ]}
      />

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-money-bill-wave me-2"></i>
                Cash Deposit Transactions
              </h5>
            </div>
            
            {/* Filters */}
            <div className="card-body border-bottom">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">From Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.from_date}
                    onChange={(e) => handleFilterChange('from_date', e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">To Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.to_date}
                    onChange={(e) => handleFilterChange('to_date', e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Transaction ID</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Transaction ID"
                    value={filters.transaction_id}
                    onChange={(e) => handleFilterChange('transaction_id', e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <button 
                    className="btn btn-primary me-2"
                    onClick={applyFilters}
                  >
                    <i className="fas fa-filter me-1"></i>
                    Apply Filters
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={clearFilters}
                  >
                    <i className="fas fa-times me-1"></i>
                    Clear Filters
                  </button>
                  <button 
                    className="btn btn-outline-success ms-2"
                    onClick={() => fetchTransactions(pagination.current_page)}
                  >
                    <i className="fas fa-sync-alt me-1"></i>
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {transactions.length === 0 && !loading ? (
                <div className="text-center py-5">
                  <i className="fas fa-receipt fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No Transactions Found</h5>
                  <p className="text-muted">
                    No cash deposit transactions found for the selected criteria.
                  </p>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={transactions}
                  loading={loading}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  searchable={false}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default CashDepositHistory;