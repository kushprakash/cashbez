import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApiService from '../../../core/services/ApiService';
import DataTable from '../../components/DataTable';
import TableShimmerLoader from '../../components/TableShimmerLoader';

const VideoKycList = ({ apiEndpoint, listTitle, listType }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Pagination & Filter States
    const [search, setSearch] = useState('');
    const [perPage, setPerPage] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchInput, setSearchInput] = useState('');

    const apiService = ApiService();

    useEffect(() => {
        fetchData();
    }, [apiEndpoint, refreshTrigger, search, perPage, currentPage]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('per_page', perPage);
            params.append('page', currentPage);
            if (search) {
                params.append('search', search);
            }

            const url = `${apiEndpoint}?${params.toString()}`;
            const response = await apiService.vGet(url);

            if (response.data.status === 1) {
                const paginationData = response.data.data;
                setData(paginationData.data || []);
                setTotalPages(paginationData.last_page || 1);
                setTotalRecords(paginationData.total || 0);
                setCurrentPage(paginationData.current_page || 1);
            } else {
                toast.error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error fetching data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = useCallback(() => {
        setCurrentPage(1);
        setSearch(searchInput);
    }, [searchInput]);

    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handlePerPageChange = (e) => {
        setPerPage(parseInt(e.target.value));
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setSearch('');
        setCurrentPage(1);
    };

    const columns = [
        {
            Header: 'S.No.',
            id: 'serial',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="text-center fw-bold text-dark">
                    {(currentPage - 1) * perPage + row.index + 1}
                </div>
            ),
        },
        {
            Header: 'Company Name',
            accessor: 'created_by',
            Cell: ({ row }) => (
                <div className="text-muted small">
                    {row.original.created_by?.setting?.company_name || 'N/A'}
                </div>
            ),
        },

        {
            Header: 'Shop Name',
            accessor: 'shop_name',
            Cell: ({ row }) => (
                <div className="fw-semibold text-dark">{row.original.shop_name}</div>
            ),
        },
        {
            Header: 'MID',
            accessor: 'mid',
            Cell: ({ row }) => (
                <span className="badge bg-dark px-3 py-2" style={{ fontSize: '0.85rem' }}>
                    {row.original.mid}
                </span>
            ),
        },
        {
            Header: 'Full Name',
            accessor: 'full_name',
            Cell: ({ row }) => (
                <div className="fw-semibold text-dark">{row.original.full_name}</div>
            ),
        },
        {
            Header: 'Phone',
            accessor: 'phone',
            Cell: ({ row }) => (
                <div className="text-dark">
                    <i className="fa fa-phone me-1 text-primary"></i>
                    {row.original.phone}
                </div>
            ),
        },
        {
            Header: 'Email',
            accessor: 'email',
            Cell: ({ row }) => (
                <div className="small text-muted">{row.original.email}</div>
            ),
        },
        {
            Header: 'PAN',
            accessor: 'pan_no',
            Cell: ({ row }) => (
                <code className="bg-light px-2 py-1 rounded">{row.original.pan_no || 'N/A'}</code>
            ),
        },
        {
            Header: 'Created At',
            accessor: 'created_at',
            Cell: ({ row }) => {
                if (!row.original.created_at) return 'N/A';
                const date = new Date(row.original.created_at);
                return (
                    <div className="small">
                        <div className="fw-semibold text-dark">
                            {date.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </div>
                        <div className="text-muted">
                            {date.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                );
            },
        },
        {
            Header: 'Action',
            id: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <Link
                    to={`/aeps/video-kyc/details/${row.original.id}`}
                    className="btn btn-sm btn-dark px-3"
                    style={{ fontWeight: '500' }}
                >
                    <i className="fa fa-eye me-1"></i>
                    View
                </Link>
            ),
        },
    ];

    // Generate pagination numbers
    const getPaginationNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header border-0 py-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <h5 className="mb-0 fw-bold">
                        <i className="fa fa-list me-2"></i>
                        {listTitle}
                        {totalRecords > 0 && (
                            <span className="badge bg-secondary ms-2" style={{ fontSize: '0.75rem' }}>
                                {totalRecords} records
                            </span>
                        )}
                    </h5>
                    <button
                        className="btn btn-light btn-sm px-3"
                        onClick={() => setRefreshTrigger(prev => prev + 1)}
                        style={{ fontWeight: '500' }}
                    >
                        <i className="fa fa-refresh me-1"></i>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="card-body border-bottom py-3">
                <div className="row g-3 align-items-end">
                    {/* Search Input */}
                    <div className="col-12 col-md-6 col-lg-4">
                        <label className="form-label small fw-semibold text-muted mb-1">Search</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by name, phone, email, MID, PAN..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyPress={handleSearchKeyPress}
                            />
                            {searchInput && (
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={handleClearSearch}
                                    title="Clear search"
                                >
                                    <i className="fa fa-times"></i>
                                </button>
                            )}
                            <button
                                className="btn btn-dark"
                                type="button"
                                onClick={handleSearch}
                            >
                                <i className="fa fa-search"></i>
                            </button>
                        </div>
                    </div>

                    {/* Per Page Dropdown */}
                    <div className="col-6 col-md-3 col-lg-2">
                        <label className="form-label small fw-semibold text-muted mb-1">Per Page</label>
                        <select
                            className="form-select"
                            value={perPage}
                            onChange={handlePerPageChange}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={200}>200</option>
                        </select>
                    </div>

                    {/* Page Info */}
                    <div className="col-6 col-md-3 col-lg-2">
                        <div className="text-muted small">
                            Showing {data.length > 0 ? (currentPage - 1) * perPage + 1 : 0} - {Math.min(currentPage * perPage, totalRecords)} of {totalRecords}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-body p-0">
                {loading && <TableShimmerLoader />}
                <div className="table-responsive">
                    <DataTable
                        columns={columns}
                        data={data}
                        title={listTitle}
                        noDataText={`No ${listType} records found.`}
                    />
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="card-footer bg-white border-top py-3">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div className="text-muted small">
                            Page {currentPage} of {totalPages}
                        </div>
                        <nav>
                            <ul className="pagination pagination-sm mb-0">
                                {/* First Page */}
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(1)}
                                        disabled={currentPage === 1}
                                    >
                                        <i className="fa fa-angle-double-left"></i>
                                    </button>
                                </li>
                                {/* Previous Page */}
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <i className="fa fa-angle-left"></i>
                                    </button>
                                </li>

                                {/* Page Numbers */}
                                {getPaginationNumbers().map(page => (
                                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange(page)}
                                        >
                                            {page}
                                        </button>
                                    </li>
                                ))}

                                {/* Next Page */}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <i className="fa fa-angle-right"></i>
                                    </button>
                                </li>
                                {/* Last Page */}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <i className="fa fa-angle-double-right"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoKycList;