import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../core/services/ApiService';
import DataTable from '../pages/components/DataTable';
import TableShimmerLoader from '../pages/components/TableShimmerLoader';
import Pageheader from '../layouts/Pageheader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../core/hooks/context';
import RechargeInvoice from './RechargeInvoice';

const MobileRechargeReport = () => {
    const [recharges, setRecharges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRecharge, setSelectedRecharge] = useState(null);
    const [summary, setSummary] = useState({});
    const [pagination, setPagination] = useState({});

    // Invoice states
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);

    // Filter states
    const [filters, setFilters] = useState({
        status: '',
        mobile_number: '',
        operator: '',
        amount_from: '',
        amount_to: '',
        date_from: '',
        date_to: '',
        transaction_id: '',
        type: '' // 1 for Mobile Recharge, 2 for DTH
    });

    const [operators, setOperators] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    const apiService = ApiService();
    const { userData: user } = useContext(AuthContext);

    // Status options
    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'Success', label: 'SUCCESS' },
        { value: 'Failed', label: 'FAILED' },
        { value: 'Pending', label: 'PENDING' }
    ];

    // Type options
    const typeOptions = [
        { value: '', label: 'All Types' },
        { value: '1', label: 'Mobile Recharge' },
        { value: '2', label: 'DTH Recharge' }
    ];

    useEffect(() => {
        fetchRecharges();
    }, []);

    useEffect(() => {
        // Debounce the filter changes to avoid too many API calls
        const timeoutId = setTimeout(() => {
            fetchRecharges();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [filters]);

    const fetchRecharges = async () => {
        setLoading(true);
        try {
            // Build query parameters
            const params = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    params.append(key, filters[key]);
                }
            });

            const response = await apiService.vPost(`/api/mobile-recharge-report`, { type: '2' });
            console.log('Recharge Report API Response:', response);

            if (response?.data?.status === 1) {
                const rechargeData = response.data.data || [];
                const summaryData = response.data.summary || {};
                const paginationData = response.data.pagination || {};

                setRecharges(Array.isArray(rechargeData) ? rechargeData : []);
                setSummary(summaryData);
                setPagination(paginationData);

                // Update operators list based on fetched data
                const uniqueOperators = [...new Set(rechargeData.map(r => r.oprator).filter(Boolean))];
                const operatorList = uniqueOperators.map(op => ({ value: op, label: op }));
                setOperators([{ value: '', label: 'All Operators' }, ...operatorList]);
            } else {
                console.error('Failed to fetch recharges:', response?.data?.message);
                setRecharges([]);
                setSummary({});
                setPagination({});
                toast.error(response?.data?.message || 'Failed to load recharge reports');
            }
        } catch (error) {
            console.error('Error fetching recharges:', error);
            setRecharges([]);
            setSummary({});
            setPagination({});
            toast.error('Failed to load recharge reports');
        } finally {
            setLoading(false);
        }
    };

    const fetchOperators = async () => {
        // This is now handled in fetchRecharges
    };



    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            status: '',
            mobile_number: '',
            operator: '',
            amount_from: '',
            amount_to: '',
            date_from: '',
            date_to: '',
            transaction_id: '',
            type: ''
        });
    };

    const viewRechargeDetails = async (recharge) => {
        setSelectedRecharge(recharge);
        setShowDetailsModal(true);
    };

    const viewInvoice = (recharge) => {
        // Prepare invoice data in the format expected by RechargeInvoice component
        const invoicePayload = {
            transaction: {
                transaction_id: recharge.txnid || recharge.oid,
                amount: recharge.amount,
                status: recharge.status,
                timestamp: recharge.created_at
            },
            validation: {
                mobile_number: recharge.number,
                operator: recharge.oprator,
                amount: recharge.amount
            },
            rechargeDetails: {
                mobile_number: recharge.number,
                operator: recharge.oprator,
                amount: recharge.amount,
                type: recharge.type === 2 || recharge.type === '2' ? 'DTH Recharge' : 'Mobile Recharge'
            },
            operatorDetails: {
                name: recharge.oprator,
                type: recharge.type === 2 || recharge.type === '2' ? 'DTH' : 'Mobile'
            },
            timestamp: recharge.created_at,
            user: recharge.user
        };

        setInvoiceData(invoicePayload);
        setShowInvoiceModal(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatAmount = (amount) => {
        if (!amount) return '₹0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        const statusClass = {
            'Success': 'bg-success',
            'Failed': 'bg-danger',
            'Pending': 'bg-warning'
        };
        return (
            <span className={`badge ${statusClass[status] || 'bg-secondary'}`}>
                {status?.toUpperCase()}
            </span>
        );
    };

    const getTypeBadge = (type) => {
        const typeText = type === 1 || type === '1' ? 'Mobile' : 'DTH';
        const typeClass = type === 1 || type === '1' ? 'bg-primary' : 'bg-info';
        return (
            <span className={`badge ${typeClass}`}>
                {typeText}
            </span>
        );
    };

    const columns = [
        {
            Header: 'S.No',
            accessor: 'sn',
            Cell: ({ row }) => row.index + 1,
            disableSortBy: true,
            width: 60
        },
        {
            Header: 'Date & Time',
            accessor: 'created_at',
            Cell: ({ value }) => formatDate(value),
            width: 150,
            exportFormatter: (row) => formatDate(row.created_at)
        },
        {
            Header: 'Transaction ID',
            accessor: 'oid',
            Cell: ({ row }) => (
                <div>
                    <small className="text-muted d-block">OID: {row.original.oid || 'N/A'}</small>
                    <small className="text-muted">TXN: {row.original.txnid || 'N/A'}</small>
                </div>
            ),
            width: 150,
            exportFormatter: (row) => `${row.txnid || 'N/A'}`
        },
        {
            Header: 'DTH Number',
            accessor: 'number',
            Cell: ({ row }) => (
                <div>
                    <strong>{row.original.number}</strong>
                    <br />
                    <small className="text-muted">{row.original.oprator}</small>
                </div>
            ),
            width: 140,
            exportFormatter: (row) => `${row.number} (${row.oprator})`
        },
        {
            Header: 'Type',
            accessor: 'type',
            Cell: ({ value }) => getTypeBadge(value),
            width: 80,
            exportFormatter: (row) => row.type === 1 || row.type === '1' ? 'Mobile' : 'DTH'
        },
        {
            Header: 'Amount',
            accessor: 'amount',
            Cell: ({ value }) => formatAmount(value),
            width: 100,
            exportFormatter: (row) => row.amount
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ value }) => getStatusBadge(value),
            width: 100,
            exportFormatter: (row) => row.status
        },
        {
            Header: 'User',
            accessor: 'user',
            Cell: ({ row }) => row.original.user?.name || 'N/A',
            width: 120,
            exportFormatter: (row) => row.user?.name || 'N/A'
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            id: 'actions',
            Cell: ({ row }) => (
                <div className="d-flex gap-1">
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => viewRechargeDetails(row.original)}
                        title="View Details"
                    >
                        <i className="fas fa-eye"></i>
                    </button>
                    <button
                        className="btn btn-success btn-sm"
                        onClick={() => viewInvoice(row.original)}
                        title="View Invoice"
                    >
                        <i className="fas fa-file-invoice"></i>
                    </button>
                </div>
            ),
            disableSortBy: true,
            width: 120
        }
    ];

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
            <Pageheader
                mainheading="DTH Recharge Report"
                parentfolder="Banking"
                activepage="DTH Recharge Report"
            />

            <div className="page-content-box">
                <div className="page-content-box-inner">
                    {/* Summary Dashboard */}
                    {/* Optimized & Premium Summary Dashboard */}
                    {!loading && summary && Object.keys(summary).length > 0 && (
                        <div className="row g-3 mb-4">
                            {[
                                {
                                    label: 'Total Recharges',
                                    value: summary.total_recharges || 0,
                                    icon: 'fa-clipboard-list',
                                    color: 'primary',
                                    bgClass: 'bg-primary bg-opacity-10 text-primary'
                                },
                                {
                                    label: 'Successful',
                                    value: summary.successful_recharges || 0,
                                    icon: 'fa-check-circle',
                                    color: 'success',
                                    bgClass: 'bg-success bg-opacity-10 text-success'
                                },
                                {
                                    label: 'Failed',
                                    value: summary.failed_recharges || 0,
                                    icon: 'fa-times-circle',
                                    color: 'danger',
                                    bgClass: 'bg-danger bg-opacity-10 text-danger'
                                },
                                {
                                    label: 'Pending',
                                    value: summary.pending_recharges || 0,
                                    icon: 'fa-clock',
                                    color: 'warning',
                                    bgClass: 'bg-warning bg-opacity-10 text-warning'
                                },
                                {
                                    label: 'Total Amount',
                                    value: formatAmount(summary.total_amount || 0),
                                    icon: 'fa-wallet',
                                    color: 'info',
                                    bgClass: 'bg-info bg-opacity-10 text-info'
                                },
                                {
                                    label: 'Success Rate',
                                    value: `${summary.success_rate || 0}%`,
                                    icon: 'fa-percentage',
                                    color: 'indigo', // indigo is a standard variable often, or primary
                                    bgClass: 'bg-primary bg-opacity-10 text-primary'
                                }
                            ].map((item, index) => (
                                <div key={index} className="col-xl-2 col-md-4 col-6">
                                    <div className="card h-100 border-0 shadow-sm overflow-hidden position-relative">
                                        <div className={`position-absolute top-0 start-0 bottom-0 ms-0 bg-${item.color}`} style={{ width: '4px' }}></div>
                                        <div className="card-body d-flex align-items-center justify-content-between py-3 ps-4">
                                            <div>
                                                <p className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                                                    {item.label}
                                                </p>
                                                <h4 className="mb-0 fw-bold text-dark">{item.value}</h4>
                                            </div>
                                            <div className={`d-flex align-items-center justify-content-center rounded-3 ${item.bgClass}`} style={{ width: '40px', height: '40px' }}>
                                                <i className={`fas ${item.icon} fs-5`}></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="row">
                        <div className="col-md-12">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <i className="fas fa-chart-line me-2" style={{ fontSize: '1.3rem' }}></i>
                                        <h5 className="mb-0 fw-semibold">Mobile Recharge Reports</h5>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => setShowFilters(!showFilters)}
                                        >
                                            <i className="fas fa-filter me-1"></i>
                                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                                        </button>
                                        <Link to="/banking/mobile/recharge" className="btn btn-success btn-sm">
                                            <i className="fas fa-plus me-1"></i>
                                            New Recharge
                                        </Link>
                                    </div>
                                </div>

                                {/* Filters Section */}
                                {showFilters && (
                                    <div className="card-body border-bottom">
                                        <div className="row g-3">
                                            <div className="col-md-3">
                                                <label className="form-label">Status</label>
                                                <select
                                                    className="form-select"
                                                    value={filters.status}
                                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                                >
                                                    {statusOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label">DTH Number</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Enter mobile number"
                                                    value={filters.mobile_number}
                                                    onChange={(e) => handleFilterChange('mobile_number', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label">Operator</label>
                                                <select
                                                    className="form-select"
                                                    value={filters.operator}
                                                    onChange={(e) => handleFilterChange('operator', e.target.value)}
                                                >
                                                    {operators.map(operator => (
                                                        <option key={operator.value} value={operator.value}>
                                                            {operator.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label">Type</label>
                                                <select
                                                    className="form-select"
                                                    value={filters.type}
                                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                                >
                                                    {typeOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label">Amount From</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Min amount"
                                                    value={filters.amount_from}
                                                    onChange={(e) => handleFilterChange('amount_from', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label">Amount To</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Max amount"
                                                    value={filters.amount_to}
                                                    onChange={(e) => handleFilterChange('amount_to', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label">Date From</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={filters.date_from}
                                                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label">Date To</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={filters.date_to}
                                                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Transaction ID</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Enter transaction ID"
                                                    value={filters.transaction_id}
                                                    onChange={(e) => handleFilterChange('transaction_id', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-6 d-flex align-items-end">
                                                <button
                                                    className="btn btn-secondary me-2"
                                                    onClick={clearFilters}
                                                >
                                                    <i className="fas fa-times me-1"></i>
                                                    Clear Filters
                                                </button>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={fetchRecharges}
                                                >
                                                    <i className="fas fa-sync me-1"></i>
                                                    Refresh
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="card-body p-0">
                                    {loading ? (
                                        <TableShimmerLoader />
                                    ) : (
                                        <>
                                            <div className="p-3 border-bottom bg-light">
                                                <div className="row align-items-center">
                                                    <div className="col-md-6">
                                                        <h6 className="mb-0">
                                                            Total Records: {recharges.length}
                                                        </h6>
                                                    </div>
                                                    <div className="col-md-6 text-end">
                                                        <small className="text-muted">
                                                            Page {pagination.current_page || 1} of {pagination.last_page || 1}
                                                            {pagination.total && ` (${pagination.total} total records)`}
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                            <DataTable
                                                columns={columns}
                                                data={recharges}
                                                title="DTH Recharge Report"
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recharge Details Modal */}
            {showDetailsModal && selectedRecharge && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-info-circle me-2"></i>
                                    Recharge Details
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDetailsModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="card border-primary mb-3">
                                            <div className="card-header bg-primary text-white">
                                                <h6 className="mb-0">Transaction Information</h6>
                                            </div>
                                            <div className="card-body">
                                                <table className="table table-sm">
                                                    <tbody>
                                                        <tr>
                                                            <td><strong>Order ID:</strong></td>
                                                            <td>{selectedRecharge.oid || 'N/A'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong>Transaction ID:</strong></td>
                                                            <td>{selectedRecharge.txnid || 'N/A'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong>Status:</strong></td>
                                                            <td>{getStatusBadge(selectedRecharge.status)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong>Type:</strong></td>
                                                            <td>{getTypeBadge(selectedRecharge.type)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong>Date & Time:</strong></td>
                                                            <td>{formatDate(selectedRecharge.created_at)}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="card border-success mb-3">
                                            <div className="card-header bg-success text-white">
                                                <h6 className="mb-0">Recharge Information</h6>
                                            </div>
                                            <div className="card-body">
                                                <table className="table table-sm">
                                                    <tbody>
                                                        <tr>
                                                            <td><strong>Mobile Number:</strong></td>
                                                            <td>{selectedRecharge.number}</td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong>Operator:</strong></td>
                                                            <td>{selectedRecharge.oprator}</td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong>Amount:</strong></td>
                                                            <td className="fw-bold text-success">
                                                                {formatAmount(selectedRecharge.amount)}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong>User:</strong></td>
                                                            <td>{selectedRecharge.user?.name || 'N/A'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong>Remarks:</strong></td>
                                                            <td>{selectedRecharge.rrmarks || 'N/A'}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {selectedRecharge.request_data && (
                                    <div className="row mt-3 d-none">
                                        <div className="col-12">
                                            <div className="card border-info">
                                                <div className="card-header bg-info text-white">
                                                    <h6 className="mb-0">Technical Details</h6>
                                                </div>
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <h6>Request Data:</h6>
                                                            <pre className="bg-light p-2 rounded text-sm">
                                                                {JSON.stringify(JSON.parse(selectedRecharge.request_data || '{}'), null, 2)}
                                                            </pre>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <h6>Response Data:</h6>
                                                            <pre className="bg-light p-2 rounded text-sm">
                                                                {JSON.stringify(JSON.parse(selectedRecharge.response_data || '{}'), null, 2)}
                                                            </pre>
                                                        </div>
                                                    </div>
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
                                    onClick={() => setShowDetailsModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showDetailsModal && <div className="modal-backdrop fade show"></div>}

            {/* Recharge Invoice Modal */}
            <RechargeInvoice
                invoiceData={invoiceData}
                show={showInvoiceModal}
                onClose={() => setShowInvoiceModal(false)}
            />
        </>
    );
};

export default MobileRechargeReport;
