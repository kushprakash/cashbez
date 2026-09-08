import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import DataTable from '../../pages/components/DataTable';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../../core/hooks/context';


const AddFundHistory = () => {
    const { userData: user, logout } = useContext(AuthContext);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        total: 0,
        per_page: 15,
        current_page: 1,
        last_page: 1
    });

    // Filter states
    const [filters, setFilters] = useState({
        status: '',
        start_date: '',
        end_date: '',
        page: 1,
        per_page: 15
    });

    const apiService = ApiService();

    useEffect(() => {
        fetchHistory();
    }, [filters.page, filters.per_page]);

    useEffect(() => {
        // Debounce the filter changes to avoid too many API calls
        const timeoutId = setTimeout(() => {
            if (filters.page === 1) {
                fetchHistory();
            } else {
                setFilters(prev => ({ ...prev, page: 1 }));
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [filters.status, filters.start_date, filters.end_date]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            if (filters.status) formData.append('status', filters.status);
            if (filters.start_date) formData.append('start_date', filters.start_date);
            if (filters.end_date) formData.append('end_date', filters.end_date);
            formData.append('page', filters.page);
            formData.append('per_page', filters.per_page);
            formData.append('id', user.id);

            const response = await apiService.vPost('/api/add-money/history', formData, true, true);

            if (response?.data?.status === 1) {
                const resData = response.data.data || [];
                setHistory(resData);
                setPagination(response.data.pagination || pagination);
            } else {
                toast.error(response?.data?.message || 'Failed to load history');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handlePerPageChange = (newPerPage) => {
        setFilters(prev => ({ ...prev, per_page: newPerPage, page: 1 }));
    };

    const resetFilters = () => {
        setFilters({
            status: '',
            start_date: '',
            end_date: '',
            page: 1,
            per_page: 15
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            success: 'bg-success',
            pending: 'bg-warning',
            failed: 'bg-danger'
        };
        return (
            <span className={`badge ${badges[status] || 'bg-secondary'} text-white`}>
                {status ? status.toUpperCase() : 'N/A'}
            </span>
        );
    };

    const columns = [
        {
            Header: 'S.No',
            accessor: 'sn',
            Cell: ({ row }) => ((filters.page - 1) * filters.per_page) + row.index + 1,
            disableSortBy: true,
            width: 60
        },
        {
            Header: 'Date & Time',
            accessor: 'formatted_date',
            width: 150
        },
        {
            Header: 'Transaction ID',
            accessor: 'txnid',
            Cell: ({ row }) => (
                <div>
                    <small className="text-primary fw-bold">{row.original.txnid}</small>
                    {row.original.utr && row.original.utr !== 'N/A' && (
                        <><br /><small className="text-muted">UTR: {row.original.utr}</small></>
                    )}
                </div>
            ),
            width: 180
        },
        {
            Header: 'Account',
            accessor: 'account_name',
            Cell: ({ row }) => (
                <div>
                    <strong>{row.original.account_name || 'N/A'}</strong>
                    <br />
                    <small className="text-muted">{row.original.formatted_account_number}</small>
                </div>
            ),
            width: 150
        },
        {
            Header: 'Amount',
            accessor: 'amount',
            Cell: ({ row }) => (
                <strong className="text-success">{row.original.amount}</strong>
            ),
            width: 100
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ value }) => getStatusBadge(value),
            width: 100
        },
        {
            Header: 'Message',
            accessor: 'message',
            Cell: ({ value }) => (
                <small className="text-muted">{value || 'N/A'}</small>
            ),
            width: 200
        }
    ];

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <Pageheader
                mainheading="Add Fund History"
                parentfolder="Banking"
                activepage="Add Fund History"
            />

            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center rounded-top">
                                    <span className="d-flex align-items-center">
                                        <i className="bi bi-clock-history me-2" style={{ fontSize: '1.3rem' }}></i>
                                        <h5 className="mb-0 fw-semibold">Add Fund History</h5>
                                    </span>
                                    <Link to="/banking/add-fund-request" className="btn btn-primary text-white">
                                        <i className="bi bi-plus-circle me-1"></i> Add Fund Request
                                    </Link>
                                </div>

                                <div className="card-body">
                                    {/* Filters - Always Visible */}
                                    <div className="row mb-4 align-items-end">
                                        <div className="col-md-3">
                                            <label className="form-label fw-semibold">Status</label>
                                            <select
                                                className="form-control"
                                                value={filters.status}
                                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                            >
                                                <option value="">All Status</option>
                                                <option value="pending">Pending</option>
                                                <option value="success">Success</option>
                                                <option value="failed">Failed</option>
                                            </select>
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label fw-semibold">Start Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={filters.start_date}
                                                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                            />
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label fw-semibold">End Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={filters.end_date}
                                                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                            />
                                        </div>

                                        <div className="col-md-3">
                                            <button
                                                className="btn btn-secondary w-100"
                                                onClick={resetFilters}
                                            >
                                                <i className="bi bi-arrow-clockwise me-1"></i> Reset Filters
                                            </button>
                                        </div>
                                    </div>

                                    {/* Summary Stats */}
                                    <div className="row mb-3">
                                        <div className="col-12">
                                            <div className="alert alert-info mb-0">
                                                <i className="bi bi-info-circle me-2"></i>
                                                Showing <strong>{pagination.from || 0}</strong> to <strong>{pagination.to || 0}</strong> of <strong>{pagination.total || 0}</strong> fund requests
                                            </div>
                                        </div>
                                    </div>

                                    {/* Data Table */}
                                    {loading ? (
                                        <TableShimmerLoader />
                                    ) : history.length > 0 ? (
                                        <>
                                            <div className="table-responsive">
                                                <DataTable
                                                    columns={columns}
                                                    data={history}
                                                    pagination={false}
                                                />
                                            </div>

                                            {/* Custom Pagination */}
                                            <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
                                                <div>
                                                    <select
                                                        className="form-select form-select-sm"
                                                        style={{ width: '80px' }}
                                                        value={filters.per_page}
                                                        onChange={(e) => handlePerPageChange(Number(e.target.value))}
                                                    >
                                                        <option value="10">10</option>
                                                        <option value="15">15</option>
                                                        <option value="25">25</option>
                                                        <option value="50">50</option>
                                                        <option value="100">100</option>
                                                    </select>
                                                    <small className="text-muted ms-2">per page</small>
                                                </div>

                                                <nav>
                                                    <ul className="pagination pagination-sm mb-0">
                                                        <li className={`page-item ${filters.page === 1 ? 'disabled' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => handlePageChange(filters.page - 1)}
                                                                disabled={filters.page === 1}
                                                            >
                                                                <i className="bi bi-chevron-left"></i>
                                                            </button>
                                                        </li>

                                                        {[...Array(pagination.last_page)].map((_, index) => {
                                                            const pageNum = index + 1;
                                                            // Show only nearby pages
                                                            if (
                                                                pageNum === 1 ||
                                                                pageNum === pagination.last_page ||
                                                                (pageNum >= filters.page - 1 && pageNum <= filters.page + 1)
                                                            ) {
                                                                return (
                                                                    <li
                                                                        key={pageNum}
                                                                        className={`page-item ${filters.page === pageNum ? 'active' : ''}`}
                                                                    >
                                                                        <button
                                                                            className="page-link"
                                                                            onClick={() => handlePageChange(pageNum)}
                                                                        >
                                                                            {pageNum}
                                                                        </button>
                                                                    </li>
                                                                );
                                                            } else if (
                                                                pageNum === filters.page - 2 ||
                                                                pageNum === filters.page + 2
                                                            ) {
                                                                return <li key={pageNum} className="page-item disabled"><span className="page-link">...</span></li>;
                                                            }
                                                            return null;
                                                        })}

                                                        <li className={`page-item ${filters.page === pagination.last_page ? 'disabled' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => handlePageChange(filters.page + 1)}
                                                                disabled={filters.page === pagination.last_page}
                                                            >
                                                                <i className="bi bi-chevron-right"></i>
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                                            <p className="text-muted mt-2">No fund requests found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddFundHistory;
