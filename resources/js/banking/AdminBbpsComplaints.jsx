import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminBbpsComplaints = () => {
    const navigate = useNavigate();
    const apiService = ApiService();

    // Data states
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('PENDING'); // Default to PENDING
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Modal States
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showTrackModal, setShowTrackModal] = useState(false);
    const [showSolveModal, setShowSolveModal] = useState(false);

    // Solve Form State
    const [solveStatus, setSolveStatus] = useState('RESOLVED');
    const [adminRemark, setAdminRemark] = useState('');
    const [submittingSolve, setSubmittingSolve] = useState(false);

    // Fetch Complaints on mount
    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const response = await apiService.vGet('/api/get-bbps-complaints');
            if (response.data && response.data.status === 1 && Array.isArray(response.data.data)) {
                setComplaints(response.data.data);
            } else {
                toast.error(response.data?.message || 'Failed to fetch complaints list');
            }
        } catch (error) {
            toast.error('Error connecting to complaints API');
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredComplaints = complaints.filter(item => {
        const itemStatus = (item.status || '').toUpperCase();
        const searchLower = searchQuery.toLowerCase().trim();

        // 1. Status Filter
        if (statusFilter === 'PENDING') {
            // Show only pending/unresolved unless user searches or selects another status
            if (searchLower === '' && !fromDate && !toDate) {
                if (itemStatus !== 'UNRESOLVED' && itemStatus !== 'PENDING') return false;
            } else if (itemStatus !== 'UNRESOLVED' && itemStatus !== 'PENDING' && statusFilter !== 'ALL') {
                // If specific PENDING filter is active
                if (statusFilter === 'PENDING' && itemStatus !== 'UNRESOLVED' && itemStatus !== 'PENDING') return false;
            }
        } else if (statusFilter !== 'ALL') {
            if (itemStatus !== statusFilter) return false;
        }

        // 2. Search Query Filter (Complaint ID, Txn ID, Mobile, Name, Remarks)
        if (searchLower !== '') {
            const matchesId = (item.complaint_id || '').toLowerCase().includes(searchLower) || String(item.id).includes(searchLower);
            const matchesTxn = (item.transaction_id || '').toLowerCase().includes(searchLower);
            const matchesMobile = (item.mobile || '').toLowerCase().includes(searchLower) || (item.user_mobile || '').toLowerCase().includes(searchLower);
            const matchesName = (item.user_name || '').toLowerCase().includes(searchLower);
            const matchesRemark = (item.customer_remark || '').toLowerCase().includes(searchLower);

            if (!matchesId && !matchesTxn && !matchesMobile && !matchesName && !matchesRemark) {
                return false;
            }
        }

        // 3. Date Range Filter
        if (fromDate) {
            const itemDate = new Date(item.created_at || item.creation_date);
            const from = new Date(fromDate + 'T00:00:00');
            if (itemDate < from) return false;
        }
        if (toDate) {
            const itemDate = new Date(item.created_at || item.creation_date);
            const to = new Date(toDate + 'T23:59:59');
            if (itemDate > to) return false;
        }

        return true;
    });

    // Summary Counts
    const totalCount = complaints.length;
    const pendingCount = complaints.filter(c => (c.status || '').toUpperCase() === 'UNRESOLVED' || (c.status || '').toUpperCase() === 'PENDING').length;
    const processingCount = complaints.filter(c => (c.status || '').toUpperCase() === 'PROCESSING').length;
    const resolvedCount = complaints.filter(c => (c.status || '').toUpperCase() === 'RESOLVED').length;
    const rejectedCount = complaints.filter(c => (c.status || '').toUpperCase() === 'REJECTED').length;

    // Pagination Calculation
    const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage) || 1;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredComplaints.slice(indexOfFirstItem, indexOfLastItem);

    // Handlers for Modals
    const handleOpenTrackModal = (item) => {
        setSelectedComplaint(item);
        setShowTrackModal(true);
        setShowSolveModal(false);
    };

    const handleOpenSolveModal = () => {
        setShowTrackModal(false);
        if (selectedComplaint) {
            setSolveStatus(selectedComplaint.status === 'UNRESOLVED' ? 'RESOLVED' : selectedComplaint.status);
            setAdminRemark(selectedComplaint.admin_remark !== 'Under review by support team' ? (selectedComplaint.admin_remark || '') : '');
        }
        setShowSolveModal(true);
    };

    const handleCloseSolveModal = () => {
        setShowSolveModal(false);
        setShowTrackModal(true); // Re-open Track Modal
    };

    const handleSolveSubmit = async (e) => {
        e.preventDefault();
        if (!selectedComplaint) return;

        setSubmittingSolve(true);
        try {
            const payload = {
                complaint_id: selectedComplaint.complaint_id || selectedComplaint.id,
                status: solveStatus,
                admin_remark: adminRemark
            };

            const response = await apiService.vPost('/api/update-bbps-complain-status', payload);
            if (response.data && response.data.status === 1) {
                toast.success('Complaint Ticket updated successfully!');
                setShowSolveModal(false);
                setSelectedComplaint(null);
                fetchComplaints(); // Refresh list
            } else {
                toast.error(response.data?.message || 'Failed to update complaint ticket');
            }
        } catch (error) {
            toast.error('Error updating complaint status');
        } finally {
            setSubmittingSolve(false);
        }
    };

    const getStatusBadgeClass = (statusStr) => {
        const st = (statusStr || '').toUpperCase();
        if (st === 'RESOLVED') return 'bg-success text-white';
        if (st === 'REJECTED') return 'bg-danger text-white';
        if (st === 'PROCESSING') return 'bg-info text-dark';
        return 'bg-warning text-dark'; // UNRESOLVED / PENDING
    };

    return (
        <div className="container-fluid py-4 px-3">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-dark mb-1">
                        <i className="fas fa-headset text-primary me-2"></i> Dispute & Complaint Management
                    </h4>
                    <p className="text-muted small mb-0">Super Admin Portal - Review, Track & Resolve BBPS & Utility Complaints</p>
                </div>
                <div>
                    <button className="btn btn-outline-primary btn-sm px-3 me-2" onClick={fetchComplaints} disabled={loading}>
                        <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''} me-1`}></i> Refresh List
                    </button>
                    <button className="btn btn-primary btn-sm px-3" onClick={() => navigate('/dashboard')}>
                        <i className="fas fa-arrow-left me-1"></i> Dashboard
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row g-3 mb-4">
                <div className="col-md-3 col-sm-6">
                    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-warning">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <small className="text-muted fw-semibold d-block">Pending Complaints</small>
                                <h3 className="fw-bold text-warning mb-0">{pendingCount}</h3>
                            </div>
                            <div className="p-3 bg-warning bg-opacity-10 rounded-circle text-warning fs-4">
                                <i className="fas fa-clock"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 col-sm-6">
                    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-info">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <small className="text-muted fw-semibold d-block">In Processing</small>
                                <h3 className="fw-bold text-info mb-0">{processingCount}</h3>
                            </div>
                            <div className="p-3 bg-info bg-opacity-10 rounded-circle text-info fs-4">
                                <i className="fas fa-spinner"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 col-sm-6">
                    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-success">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <small className="text-muted fw-semibold d-block">Resolved Cases</small>
                                <h3 className="fw-bold text-success mb-0">{resolvedCount}</h3>
                            </div>
                            <div className="p-3 bg-success bg-opacity-10 rounded-circle text-success fs-4">
                                <i className="fas fa-check-circle"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 col-sm-6">
                    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-danger">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <small className="text-muted fw-semibold d-block">Rejected Cases</small>
                                <h3 className="fw-bold text-danger mb-0">{rejectedCount}</h3>
                            </div>
                            <div className="p-3 bg-danger bg-opacity-10 rounded-circle text-danger fs-4">
                                <i className="fas fa-times-circle"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="card border-0 shadow-sm rounded-4 bg-white">
                {/* Filter Section */}
                <div className="card-header bg-white border-bottom p-3">
                    <div className="row g-3 align-items-center">
                        {/* Search Input */}
                        <div className="col-md-4">
                            <label className="form-label text-secondary small fw-medium mb-1">Search Complaint ID / Txn ID / Mobile</label>
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-light"><i className="fas fa-search"></i></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter Complaint ID, Txn ID, Mobile..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                />
                                {searchQuery && (
                                    <button className="btn btn-outline-secondary" type="button" onClick={() => setSearchQuery('')}>✕</button>
                                )}
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="col-md-3">
                            <label className="form-label text-secondary small fw-medium mb-1">Status Filter</label>
                            <select
                                className="form-select form-select-sm"
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="PENDING">Pending / Unresolved Cases</option>
                                <option value="PROCESSING">Processing Cases</option>
                                <option value="RESOLVED">Resolved Cases</option>
                                <option value="REJECTED">Rejected Cases</option>
                                <option value="ALL">Show All Complaints</option>
                            </select>
                        </div>

                        {/* From Date */}
                        <div className="col-md-2">
                            <label className="form-label text-secondary small fw-medium mb-1">From Date</label>
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                value={fromDate}
                                onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
                            />
                        </div>

                        {/* To Date */}
                        <div className="col-md-2">
                            <label className="form-label text-secondary small fw-medium mb-1">To Date</label>
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                value={toDate}
                                onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
                            />
                        </div>

                        {/* Clear Filters Button */}
                        <div className="col-md-1 text-end pt-4">
                            <button
                                className="btn btn-light btn-sm text-secondary w-100"
                                title="Reset Filters"
                                onClick={() => { setSearchQuery(''); setStatusFilter('PENDING'); setFromDate(''); setToDate(''); setCurrentPage(1); }}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table align-middle table-hover mb-0" style={{ fontSize: '0.875rem' }}>
                            <thead className="table-light">
                                <tr className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                                    <th className="px-3">SR NO</th>
                                    <th>COMPLAINT ID</th>
                                    <th>TXN ID / MOBILE</th>
                                    <th>USER / RETAILER</th>
                                    <th>SUBJECT / REMARK</th>
                                    <th>DATE</th>
                                    <th>STATUS</th>
                                    <th className="text-center">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                            <p className="text-muted small mt-2 mb-0">Loading complaints list...</p>
                                        </td>
                                    </tr>
                                ) : currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5">
                                            <i className="fas fa-inbox fs-1 text-muted mb-3 d-block"></i>
                                            <h6 className="fw-semibold text-secondary">No Complaints Found</h6>
                                            <p className="text-muted small mb-0">
                                                {statusFilter === 'PENDING' && !searchQuery
                                                    ? 'Great! There are no pending complaint cases at the moment.'
                                                    : 'No records match your selected filters.'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((item, idx) => (
                                        <tr key={item.id || idx}>
                                            <td className="px-3 text-muted">{indexOfFirstItem + idx + 1}</td>
                                            <td>
                                                <span className="fw-bold text-primary">{item.complaint_id || `CC${item.id}`}</span>
                                            </td>
                                            <td>
                                                <div className="fw-medium text-dark">{item.transaction_id || 'N/A'}</div>
                                                <small className="text-muted">{item.mobile || item.user_mobile}</small>
                                            </td>
                                            <td>
                                                <div className="fw-semibold text-dark">{item.user_name || 'Retailer'}</div>
                                                <small className="text-muted">{item.user_mid ? `MID: ${item.user_mid}` : ''}</small>
                                            </td>
                                            <td style={{ maxWidth: '240px' }}>
                                                <div className="text-truncate" title={item.customer_remark || item.subject}>
                                                    {item.customer_remark || item.subject || 'No customer remark'}
                                                </div>
                                            </td>
                                            <td>
                                                <small className="text-muted">{item.created_at}</small>
                                            </td>
                                            <td>
                                                <span className={`badge px-2 py-1 ${getStatusBadgeClass(item.status)}`}>
                                                    {item.status || 'UNRESOLVED'}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary px-3 fw-semibold d-inline-flex align-items-center gap-1"
                                                    onClick={() => handleOpenTrackModal(item)}
                                                >
                                                    <i className="fas fa-search-location"></i> Track
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer & Pagination */}
                <div className="card-footer bg-white border-top p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div className="text-muted small">
                        Showing {filteredComplaints.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredComplaints.length)} of {filteredComplaints.length} complaints
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <select
                            className="form-select form-select-sm"
                            style={{ width: '80px' }}
                            value={itemsPerPage}
                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>

                        <nav>
                            <ul className="pagination pagination-sm mb-0">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</button>
                                </li>
                                {[...Array(totalPages)].map((_, i) => (
                                    <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                    </li>
                                )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Next</button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* POPUP MODAL 1: TRACK COMPLAINT MODAL */}
            {/* ========================================================================= */}
            {showTrackModal && selectedComplaint && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header bg-light border-bottom px-4 py-3">
                                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                                    <i className="fas fa-ticket-alt text-primary"></i> Track Complaint #{selectedComplaint.complaint_id || `CC${selectedComplaint.id}`}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowTrackModal(false)}></button>
                            </div>

                            <div className="modal-body p-4">
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <div className="p-3 bg-light rounded-3">
                                            <small className="text-muted d-block mb-1">Complaint ID</small>
                                            <span className="fw-bold text-primary fs-6">{selectedComplaint.complaint_id || `CC${selectedComplaint.id}`}</span>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="p-3 bg-light rounded-3">
                                            <small className="text-muted d-block mb-1">Transaction ID</small>
                                            <span className="fw-bold text-dark fs-6">{selectedComplaint.transaction_id || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <small className="text-muted d-block">Retailer Name</small>
                                        <span className="fw-semibold text-dark">{selectedComplaint.user_name || 'N/A'}</span>
                                    </div>

                                    <div className="col-md-4">
                                        <small className="text-muted d-block">Retailer MID / Mobile</small>
                                        <span className="fw-semibold text-dark">{selectedComplaint.user_mid || selectedComplaint.mobile || 'N/A'}</span>
                                    </div>

                                    <div className="col-md-4">
                                        <small className="text-muted d-block">Creation Date</small>
                                        <span className="fw-semibold text-dark">{selectedComplaint.created_at}</span>
                                    </div>

                                    <div className="col-md-12 border-top pt-3">
                                        <small className="text-muted d-block mb-1">Customer / Retailer Description</small>
                                        <div className="p-3 rounded border bg-white text-dark">
                                            {selectedComplaint.customer_remark || selectedComplaint.subject || 'No customer remark available.'}
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <small className="text-muted d-block mb-1">Current Ticket Status</small>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className={`badge px-3 py-2 fs-6 ${getStatusBadgeClass(selectedComplaint.status)}`}>
                                                {selectedComplaint.status || 'UNRESOLVED'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <small className="text-muted d-block mb-1">Admin Remark / Resolution Reply</small>
                                        <div className="p-3 rounded border bg-light text-secondary">
                                            {selectedComplaint.admin_remark || 'No admin remark entered yet.'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer bg-light border-top px-4 py-3 d-flex justify-content-between">
                                <button type="button" className="btn btn-secondary px-4" onClick={() => setShowTrackModal(false)}>
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success px-4 fw-bold d-inline-flex align-items-center gap-2"
                                    onClick={handleOpenSolveModal}
                                >
                                    <i className="fas fa-check-circle"></i> Solve Ticket
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* POPUP MODAL 2: SOLVE TICKET MODAL */}
            {/* ========================================================================= */}
            {showSolveModal && selectedComplaint && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header bg-success text-white border-bottom px-4 py-3">
                                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                                    <i className="fas fa-edit"></i> Solve Ticket #{selectedComplaint.complaint_id || `CC${selectedComplaint.id}`}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={handleCloseSolveModal}></button>
                            </div>

                            <form onSubmit={handleSolveSubmit}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label text-secondary small fw-bold">
                                            Select Ticket Status <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className="form-select form-select-lg"
                                            value={solveStatus}
                                            onChange={(e) => setSolveStatus(e.target.value)}
                                            required
                                        >
                                            <option value="RESOLVED">RESOLVED (Problem Solved)</option>
                                            <option value="PROCESSING">PROCESSING (Under Investigation)</option>
                                            <option value="REJECTED">REJECTED (Invalid / Declined)</option>
                                            <option value="UNRESOLVED">UNRESOLVED (Pending)</option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label text-secondary small fw-bold">
                                            Admin Resolution Remark / Reply
                                        </label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            placeholder="Enter detailed resolution note, refund details or reason for rejection..."
                                            value={adminRemark}
                                            onChange={(e) => setAdminRemark(e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="modal-footer bg-light border-top px-4 py-3 d-flex justify-content-between">
                                    <button type="button" className="btn btn-outline-secondary px-3" onClick={handleCloseSolveModal}>
                                        <i className="fas fa-arrow-left me-1"></i> Back to Track
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-success px-4 fw-bold"
                                        disabled={submittingSolve}
                                    >
                                        {submittingSolve ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span> Updating...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save me-1"></i> Update & Save Ticket
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBbpsComplaints;
