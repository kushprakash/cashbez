import React, { useState, useEffect, useCallback } from 'react';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminFundRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

    // User Role State
    const [currentUser, setCurrentUser] = useState(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    // Modal States
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [approveModal, setApproveModal] = useState(false);
    const [rejectModal, setRejectModal] = useState(false);
    const [adminRemarkInput, setAdminRemarkInput] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const apiService = ApiService();

    // Fetch Current User & Role Info
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await apiService.vGet('/api/dashboard');
                const user = res?.data?.data?.user || res?.data?.user;
                if (user) {
                    setCurrentUser(user);
                    const isSA = user.role === 1 || user.role_id === 1 || user.role === '1' || user.role_id === '1' || (user.role_info && user.role_info.name === 'Super Admin');
                    setIsSuperAdmin(isSA);
                }
            } catch (err) {
                console.error('Error fetching user info:', err);
            }
        };
        fetchUser();
    }, []);

    // Fetch Admin Fund Requests List
    const fetchRequests = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            let url = `/api/pan-card/admin/fund-requests?page=${page}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (statusFilter !== '') url += `&status=${statusFilter}`;

            const res = await apiService.vGet(url);
            if (res?.data?.status === 1) {
                const pagData = res.data.data;
                setRequests(pagData.data || []);
                setPagination({
                    current_page: pagData.current_page || 1,
                    last_page: pagData.last_page || 1,
                    total: pagData.total || 0
                });
            }
        } catch (err) {
            console.error('Error fetching fund requests:', err);
            toast.error('Failed to load fund requests');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => {
        fetchRequests(1);
    }, [fetchRequests]);

    // Open Approve Modal
    const handleOpenApprove = (item) => {
        setSelectedRequest(item);
        setAdminRemarkInput('');
        setApproveModal(true);
    };

    // Submit Approve (Super Admin Only)
    const handleApproveSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRequest) return;

        setActionLoading(true);
        try {
            const payload = {
                id: selectedRequest.id,
                status: 1, // Approved
                admin_remark: adminRemarkInput
            };

            const res = await apiService.vPost('/api/pan-card/admin/fund-request-status', payload);
            if (res?.data?.status === 1) {
                toast.success(res.data.message || 'Fund Request Approved Successfully!');
                setApproveModal(false);
                fetchRequests(pagination.current_page);
            } else {
                toast.error(res?.data?.message || 'Failed to approve fund request');
            }
        } catch (err) {
            console.error('Approval Error:', err);
            toast.error(err?.response?.data?.message || 'Failed to approve fund request');
        } finally {
            setActionLoading(false);
        }
    };

    // Open Reject Modal
    const handleOpenReject = (item) => {
        setSelectedRequest(item);
        setAdminRemarkInput('');
        setRejectModal(true);
    };

    // Submit Reject (Super Admin Only - Triggers Auto Refund)
    const handleRejectSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRequest) return;

        setActionLoading(true);
        try {
            const payload = {
                id: selectedRequest.id,
                status: 2, // Rejected
                admin_remark: adminRemarkInput
            };

            const res = await apiService.vPost('/api/pan-card/admin/fund-request-status', payload);
            if (res?.data?.status === 1) {
                toast.success(res.data.message || 'Fund Request Rejected and Refunded to Utility Wallet!');
                setRejectModal(false);
                fetchRequests(pagination.current_page);
            } else {
                toast.error(res?.data?.message || 'Failed to reject request');
            }
        } catch (err) {
            console.error('Rejection Error:', err);
            toast.error(err?.response?.data?.message || 'Failed to reject request');
        } finally {
            setActionLoading(false);
        }
    };

    const formatCurrency = (val) => {
        const num = parseFloat(val || 0);
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(num);
    };

    return (
        <>
            <Pageheader
                mainheading="PAN CARD Service"
                parentfolder="Admin Panel"
                activepage="Pan Fund Requests"
            />

            <ToastContainer position="top-right" autoClose={3000} />

            <div className="page-content-box p-3">
                <div className="container-fluid">

                    {/* SEARCH & FILTER BAR */}
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-body p-3">
                            <div className="row g-3 align-items-center">

                                <div className="col-md-5">
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0">
                                            <i className="fa fa-search text-muted"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control border-start-0 ps-0"
                                            placeholder="Search by TXN ID, User Name, Mobile, Email..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <select
                                        className="form-select"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="">All Status</option>
                                        <option value="0">Pending</option>
                                        <option value="1">Approved</option>
                                        <option value="2">Rejected</option>
                                    </select>
                                </div>

                                <div className="col-md-4 text-end">
                                    <button
                                        className="btn btn-outline-primary btn-sm rounded-pill px-3"
                                        onClick={() => fetchRequests(1)}
                                    >
                                        <i className="fa fa-refresh me-1"></i> Refresh List
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* FUND REQUESTS TABLE */}
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.05rem' }}>
                                PAN Card Fund Requests Management
                            </h5>
                            <div>
                                {isSuperAdmin ? (
                                    <span className="badge bg-success-subtle text-success border border-success px-2.5 py-1">
                                        <i className="fa fa-shield me-1"></i> Super Admin (Approve / Reject Allowed)
                                    </span>
                                ) : (
                                    <span className="badge bg-secondary-subtle text-secondary border px-2.5 py-1">
                                        <i className="fa fa-eye me-1"></i> Admin Role 2 (View Only Mode)
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="card-body p-0 table-responsive">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-2 text-muted">Loading fund requests...</p>
                                </div>
                            ) : requests.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <i className="fa fa-folder-open fs-2 mb-2"></i>
                                    <p className="mb-0">No fund requests found.</p>
                                </div>
                            ) : (
                                <table className="table align-middle table-hover mb-0" style={{ fontSize: '13px' }}>
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="py-3 px-3">TXN ID</th>
                                            <th className="py-3 px-3">User Details</th>
                                            <th className="py-3 px-3">Qty</th>
                                            <th className="py-3 px-3">Amount</th>
                                            <th className="py-3 px-3">Debited Wallet</th>
                                            <th className="py-3 px-3">Status</th>
                                            <th className="py-3 px-3">Date</th>
                                            <th className="py-3 px-3 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-3">
                                                    <span className="fw-bold font-monospace text-dark d-block">
                                                        {item.txn_id}
                                                    </span>
                                                    {item.remark && (
                                                        <small className="text-muted d-block">{item.remark}</small>
                                                    )}
                                                </td>

                                                <td className="px-3">
                                                    <div className="fw-bold text-dark">{item.user?.mid || 'N/A'} | {item.user?.name || 'N/A'} | {item.agent_id || 'N/A'}</div>
                                                    <small className="text-muted">{item.user?.mobile} | {item.user?.email}</small>
                                                </td>

                                                <td className="px-3 fw-bold">{item.coupon_qty}</td>

                                                <td className="px-3 fw-bold text-primary">
                                                    {formatCurrency(item.amount)}
                                                </td>

                                                <td className="px-3">
                                                    <span className="badge bg-light text-dark font-monospace border">
                                                        {item.account?.number || 'Utility Wallet'}
                                                    </span>
                                                </td>

                                                <td className="px-3">
                                                    {item.status === 0 && (
                                                        <span className="badge bg-warning text-dark px-2.5 py-1.5 fw-bold">
                                                            Pending
                                                        </span>
                                                    )}
                                                    {item.status === 1 && (
                                                        <span className="badge bg-success px-2.5 py-1.5 fw-bold">
                                                            Approved
                                                        </span>
                                                    )}
                                                    {item.status === 2 && (
                                                        <span className="badge bg-danger px-2.5 py-1.5 fw-bold" title={item.admin_remark || ''}>
                                                            Rejected (Refunded)
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-3 text-muted" style={{ fontSize: '11.5px' }}>
                                                    {new Date(item.created_at).toLocaleString('en-IN')}
                                                </td>

                                                <td className="px-3 text-center">
                                                    {isSuperAdmin && item.status === 0 ? (
                                                        <div className="d-flex justify-content-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-success rounded-pill px-2.5 py-1 fw-bold"
                                                                onClick={() => handleOpenApprove(item)}
                                                                title="Approve Fund Request (Credited on UTI)"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-danger rounded-pill px-2.5 py-1 fw-bold"
                                                                onClick={() => handleOpenReject(item)}
                                                                title="Reject & Refund to Utility Wallet"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted" style={{ fontSize: '11px' }}>
                                                            {item.status === 0 ? 'View Only' : 'Completed'}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* PAGINATION FOOTER */}
                        {pagination.last_page > 1 && (
                            <div className="card-footer bg-white border-top p-3 d-flex justify-content-between align-items-center">
                                <button
                                    className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                                    disabled={pagination.current_page === 1}
                                    onClick={() => fetchRequests(pagination.current_page - 1)}
                                >
                                    Previous
                                </button>
                                <span className="text-muted" style={{ fontSize: '13px' }}>
                                    Page {pagination.current_page} of {pagination.last_page} (Total {pagination.total} requests)
                                </span>
                                <button
                                    className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                                    disabled={pagination.current_page === pagination.last_page}
                                    onClick={() => fetchRequests(pagination.current_page + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* APPROVAL MODAL (SUPER ADMIN ONLY) */}
            {approveModal && selectedRequest && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow">
                            <form onSubmit={handleApproveSubmit}>
                                <div className="modal-header bg-success text-white">
                                    <h5 className="modal-header-title fw-bold mb-0 text-white">Approve PAN Fund Request</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setApproveModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="alert alert-success-subtle border border-success p-3 rounded-3 mb-3">
                                        <span className="fw-bold d-block">TXN ID: {selectedRequest.txn_id}</span>
                                        <span>User: {selectedRequest.user?.name} | Amount: <strong>{formatCurrency(selectedRequest.amount)}</strong></span>
                                    </div>
                                    <p className="text-muted mb-3" style={{ fontSize: '12px' }}>
                                        Confirming approval indicates that you have credited this user on the UTI PSA portal.
                                    </p>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Admin Remark (Optional)</label>
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            value={adminRemarkInput}
                                            onChange={(e) => setAdminRemarkInput(e.target.value)}
                                            placeholder="Enter credit reference or note..."
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-top-0 p-3">
                                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setApproveModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-success rounded-pill px-4 fw-bold" disabled={actionLoading}>
                                        {actionLoading ? 'Approving...' : 'Confirm Approval'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* REJECT & AUTO REFUND MODAL (SUPER ADMIN ONLY) */}
            {rejectModal && selectedRequest && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow">
                            <form onSubmit={handleRejectSubmit}>
                                <div className="modal-header bg-danger text-white">
                                    <h5 className="modal-header-title fw-bold mb-0 text-white">Reject Fund Request (Auto Refund)</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setRejectModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="alert alert-danger-subtle border border-danger p-3 rounded-3 mb-3">
                                        <span className="fw-bold d-block text-danger">TXN ID: {selectedRequest.txn_id}</span>
                                        <span>User: {selectedRequest.user?.name} | Refund Amount: <strong>{formatCurrency(selectedRequest.amount)}</strong></span>
                                    </div>
                                    <p className="text-danger fw-bold mb-3" style={{ fontSize: '12.5px' }}>
                                        <i className="fa fa-info-circle me-1"></i> Warning: Rejecting this request will automatically credit {formatCurrency(selectedRequest.amount)} back to the user's Utility Wallet!
                                    </p>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Rejection Reason / Remark <span className="text-danger">*</span></label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={adminRemarkInput}
                                            onChange={(e) => setAdminRemarkInput(e.target.value)}
                                            placeholder="Enter reason for rejecting fund request..."
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-top-0 p-3">
                                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setRejectModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-danger rounded-pill px-4 fw-bold" disabled={actionLoading}>
                                        {actionLoading ? 'Rejecting & Refunding...' : 'Confirm Rejection & Refund'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminFundRequests;
