import React, { useState, useEffect, useCallback, useRef } from 'react';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';

const AdminAgentList = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [suggestedAgentId, setSuggestedAgentId] = useState('');
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

    // User Role State
    const [currentUser, setCurrentUser] = useState(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    // Modal States
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [approveModal, setApproveModal] = useState(false);
    const [rejectModal, setRejectModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);

    const [agentIdInput, setAgentIdInput] = useState('');
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

    // Fetch Agents List
    const fetchAgents = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            let url = `/api/pan-card/admin/agents?page=${page}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (statusFilter !== '') url += `&status=${statusFilter}`;

            const res = await apiService.vGet(url);
            if (res?.data?.status === 1) {
                const pagData = res.data.data;
                setAgents(pagData.data || []);
                setSuggestedAgentId(res.data.suggested_agent_id || 'ANNECHM-816');
                setPagination({
                    current_page: pagData.current_page || 1,
                    last_page: pagData.last_page || 1,
                    total: pagData.total || 0
                });
            }
        } catch (err) {
            console.error('Error fetching agents list:', err);
            toast.error('Failed to load agent registrations');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => {
        fetchAgents(1);
    }, [fetchAgents]);

    // Copy Helper
    const copyToClipboard = (text, label) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success(`Copied ${label}!`);
    };

    // Copy All Agent Details as formatted block
    const copyAllDetails = (agent) => {
        const text = `BIO PSA AGENT REGISTRATION DATA:
---------------------------------
Name: ${agent.name}
Contact Person: ${agent.contact_person}
Email: ${agent.email}
Mobile No: ${agent.mobile_no}
PIN: ${agent.pin}
Location: ${agent.location}
State: ${agent.state}
District: ${agent.district}
PAN No: ${agent.pan_no}
Address Line 1: ${agent.address_1}
Address Line 2: ${agent.address_2 || ''}
Address Line 3: ${agent.address_3 || ''}
Address Line 4: ${agent.address_4 || ''}`;

        navigator.clipboard.writeText(text);
        toast.success('All agent details copied to clipboard!');
    };

    // Open Approval Modal
    const handleOpenApprove = (agent) => {
        setSelectedAgent(agent);
        setAgentIdInput(suggestedAgentId || 'ANNECHM-816');
        setAdminRemarkInput('');
        setApproveModal(true);
    };

    // Submit Approval (Super Admin Only)
    const handleApproveSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAgent) return;

        setActionLoading(true);
        try {
            const payload = {
                id: selectedAgent.id,
                status: 1, // Approved
                agent_id: agentIdInput,
                admin_remark: adminRemarkInput
            };

            const res = await apiService.vPost('/api/pan-card/admin/agent-status', payload);
            if (res?.data?.status === 1) {
                toast.success(res.data.message || 'Agent Approved Successfully!');
                setApproveModal(false);
                fetchAgents(pagination.current_page);
            } else {
                toast.error(res?.data?.message || 'Failed to approve agent');
            }
        } catch (err) {
            console.error('Approval Error:', err);
            toast.error(err?.response?.data?.message || 'Failed to approve agent');
        } finally {
            setActionLoading(false);
        }
    };

    // Open Reject Modal
    const handleOpenReject = (agent) => {
        setSelectedAgent(agent);
        setAdminRemarkInput('');
        setRejectModal(true);
    };

    // Submit Rejection (Super Admin Only)
    const handleRejectSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAgent) return;

        setActionLoading(true);
        try {
            const payload = {
                id: selectedAgent.id,
                status: 2, // Rejected
                admin_remark: adminRemarkInput
            };

            const res = await apiService.vPost('/api/pan-card/admin/agent-status', payload);
            if (res?.data?.status === 1) {
                toast.success(res.data.message || 'Agent Registration Rejected.');
                setRejectModal(false);
                fetchAgents(pagination.current_page);
            } else {
                toast.error(res?.data?.message || 'Failed to reject agent');
            }
        } catch (err) {
            console.error('Rejection Error:', err);
            toast.error(err?.response?.data?.message || 'Failed to reject agent');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle Excel Import for Agents
    const handleAgentExcelImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const ext = file.name.split('.').pop().toLowerCase();
        if (!['xls', 'xlsx'].includes(ext)) {
            toast.error('Only .xls or .xlsx files are supported');
            e.target.value = ''; return;
        }
        setImporting(true);
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array', cellDates: true });
            const ws = workbook.Sheets[workbook.SheetNames[0]];
            const rawRows = XLSX.utils.sheet_to_json(ws, { raw: false, defval: '' });
            if (!rawRows.length) {
                toast.warning('Excel file is empty');
                setImporting(false);
                e.target.value = '';
                return;
            }

            // Standardize field names for API
            const rows = rawRows.map(r => ({
                agent_id: r['agent_id'] || r['Agent ID'] || r['agentid'] || '',
                name: r['name'] || r['Name'] || '',
                contact_person: r['contact_person'] || r['Contact Person'] || '',
                mobile_no: r['mobile_no'] || r['Mobile No'] || r['mobile'] || '',
                email: r['email'] || r['Email'] || '',
                location: r['location'] || r['Location'] || '',
                district: r['district'] || r['District'] || '',
                state: r['state'] || r['State'] || '',
                pin: r['pin'] || r['PIN'] || r['pin_code'] || '',
                pan_no: r['pan_no'] || r['PAN No'] || r['pan'] || ''
            }));

            const res = await apiService.vPost('/api/pan-card/import-agents', { rows });
            if (res?.data?.status === 1) {
                toast.success(`Import complete! Inserted: ${res.data.inserted || 0}, Updated: ${res.data.updated || 0}`);
                fetchAgents(1);
            } else {
                toast.error(res?.data?.message || 'Import failed');
            }
        } catch (err) {
            console.error('Import error:', err);
            toast.error('Failed to parse or import Excel file');
        } finally {
            setImporting(false);
            e.target.value = '';
        }
    };

    return (
        <>
            <Pageheader
                mainheading="PAN CARD Service"
                parentfolder="Admin Panel"
                activepage="Agent Registrations"
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
                                            placeholder="Search by Name, Agent ID, Email, Mobile, PAN..."
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

                                    <span className="badge bg-light text-dark border p-2 me-2">
                                        Suggested Next ID: <strong className="text-primary">{suggestedAgentId}</strong>
                                    </span>

                                    <button
                                        className="btn btn-outline-primary btn-sm rounded-pill px-3"
                                        onClick={() => fetchAgents(1)}
                                    >
                                        <i className="fa fa-refresh me-1"></i> Refresh
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* AGENT REGISTRATIONS TABLE */}
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.05rem' }}>
                                BIO PSA Agent Registration Requests
                            </h5>
                            <div>
                                {isSuperAdmin ? (
                                    <span className="badge bg-success-subtle text-success border border-success px-2 py-1">
                                        <i className="fa fa-shield me-1"></i> Super Admin Mode (Full Access)
                                    </span>
                                ) : (
                                    <span className="badge bg-secondary-subtle text-secondary border px-2 py-1">
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
                                    <p className="mt-2 text-muted">Loading registrations...</p>
                                </div>
                            ) : agents.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <i className="fa fa-user-times fs-2 mb-2"></i>
                                    <p className="mb-0">No agent registrations found.</p>
                                </div>
                            ) : (
                                <table className="table align-middle table-hover mb-0" style={{ fontSize: '13px' }}>
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="py-3 px-3">MID</th>
                                            <th className="py-3 px-3">PSA Agent ID</th>
                                            <th className="py-3 px-3">Name</th>
                                            <th className="py-3 px-3">Contact Person</th>
                                            <th className="py-3 px-3">Email & Mobile</th>
                                            <th className="py-3 px-3">PAN & Location</th>
                                            <th className="py-3 px-3">State & District</th>
                                            <th className="py-3 px-3">Status</th>
                                            <th className="py-3 px-3 text-center">Copy & Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {agents.map((agent) => (
                                            <tr key={agent.id}>
                                                <td className="px-3">
                                                    <div className="fw-bold text-dark text-uppercase">{agent.user.mid}</div>
                                                </td>
                                                <td className="px-3">
                                                    {agent.agent_id ? (
                                                        <div className="d-flex align-items-center gap-1">
                                                            <span className="badge bg-primary-subtle text-primary font-monospace fw-bold px-2 py-1" style={{ fontSize: '12px' }}>
                                                                {agent.agent_id}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-white border p-0 rounded-circle shadow-xs"
                                                                style={{ width: '22px', height: '22px' }}
                                                                onClick={() => copyToClipboard(agent.agent_id, 'Agent ID')}
                                                                title="Copy Agent ID"
                                                            >
                                                                <i className="fa fa-copy text-primary" style={{ fontSize: '10px' }}></i>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="badge bg-light text-muted">Unassigned</span>
                                                    )}
                                                </td>

                                                <td className="px-3">
                                                    <div className="fw-bold text-dark text-uppercase">{agent.name}</div>
                                                </td>


                                                <td className="px-3 text-uppercase fw-semibold">{agent.contact_person}</td>

                                                <td className="px-3">
                                                    <div className="text-lowercase fw-semibold">{agent.email}</div>
                                                    <small className="text-muted">{agent.mobile_no}</small>
                                                </td>

                                                <td className="px-3">
                                                    <span className="fw-bold font-monospace text-uppercase text-dark d-block">{agent.pan_no}</span>
                                                    <small className="text-muted">{agent.location} ({agent.pin})</small>
                                                </td>

                                                <td className="px-3">
                                                    <span className="fw-bold text-dark d-block">{agent.state}</span>
                                                    <small className="text-muted">{agent.district}</small>
                                                </td>

                                                <td className="px-3">
                                                    {agent.status === 0 && (
                                                        <span className="badge bg-warning text-dark px-2.5 py-1.5 fw-bold">
                                                            Pending
                                                        </span>
                                                    )}
                                                    {agent.status === 1 && (
                                                        <span className="badge bg-success px-2.5 py-1.5 fw-bold">
                                                            Approved
                                                        </span>
                                                    )}
                                                    {agent.status === 2 && (
                                                        <span className="badge bg-danger px-2.5 py-1.5 fw-bold" title={agent.admin_remark || ''}>
                                                            Rejected
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-3 text-center">
                                                    <div className="d-flex justify-content-center align-items-center gap-1.5">

                                                        {/* COPY ALL DATA BUTTON */}
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-info rounded-pill px-2.5 py-1"
                                                            onClick={() => copyAllDetails(agent)}
                                                            title="Copy All Details to Clipboard for UTI Portal"
                                                        >
                                                            <i className="fa fa-copy me-1"></i> Copy All
                                                        </button>

                                                        {/* VIEW FULL DETAILS BUTTON */}
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-secondary rounded-circle p-0"
                                                            style={{ width: '28px', height: '28px' }}
                                                            onClick={() => { setSelectedAgent(agent); setViewModal(true); }}
                                                            title="View Details"
                                                        >
                                                            <i className="fa fa-eye"></i>
                                                        </button>

                                                        {/* SUPER ADMIN APPROVE & REJECT ACTIONS */}
                                                        {isSuperAdmin && agent.status === 0 && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-success rounded-pill px-2.5 py-1 fw-bold"
                                                                    onClick={() => handleOpenApprove(agent)}
                                                                    title="Approve Agent Registration"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-danger rounded-pill px-2.5 py-1 fw-bold"
                                                                    onClick={() => handleOpenReject(agent)}
                                                                    title="Reject Registration"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}

                                                    </div>
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
                                    onClick={() => fetchAgents(pagination.current_page - 1)}
                                >
                                    Previous
                                </button>
                                <span className="text-muted" style={{ fontSize: '13px' }}>
                                    Page {pagination.current_page} of {pagination.last_page} (Total {pagination.total} agents)
                                </span>
                                <button
                                    className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                                    disabled={pagination.current_page === pagination.last_page}
                                    onClick={() => fetchAgents(pagination.current_page + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* APPROVAL MODAL (SUPER ADMIN ONLY) */}
            {approveModal && selectedAgent && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow">
                            <form onSubmit={handleApproveSubmit}>
                                <div className="modal-header bg-success text-white">
                                    <h5 className="modal-header-title fw-bold mb-0 text-white">Approve PSA Agent Registration</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setApproveModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <p className="text-muted mb-3">
                                        Approving agent <strong>{selectedAgent.name}</strong> ({selectedAgent.email}).
                                    </p>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Agent ID (Auto-Incremented)</label>
                                        <input
                                            type="text"
                                            className="form-control font-monospace fw-bold"
                                            value={agentIdInput}
                                            onChange={(e) => setAgentIdInput(e.target.value)}
                                            placeholder="e.g. ANNECHM-816"
                                            required
                                        />
                                        <small className="text-muted">Auto-suggested next sequential ID (+1). You can edit if required.</small>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Admin Remark (Optional)</label>
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            value={adminRemarkInput}
                                            onChange={(e) => setAdminRemarkInput(e.target.value)}
                                            placeholder="Enter approval note or UTI portal registration reference..."
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

            {/* REJECT MODAL (SUPER ADMIN ONLY) */}
            {rejectModal && selectedAgent && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow">
                            <form onSubmit={handleRejectSubmit}>
                                <div className="modal-header bg-danger text-white">
                                    <h5 className="modal-header-title fw-bold mb-0 text-white">Reject Agent Registration</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setRejectModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <p className="text-muted mb-3">
                                        Rejecting agent registration for <strong>{selectedAgent.name}</strong>.
                                    </p>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Rejection Reason / Remark <span className="text-danger">*</span></label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={adminRemarkInput}
                                            onChange={(e) => setAdminRemarkInput(e.target.value)}
                                            placeholder="Enter exact reason for rejection..."
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-top-0 p-3">
                                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setRejectModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-danger rounded-pill px-4 fw-bold" disabled={actionLoading}>
                                        {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW AGENT FULL DETAILS MODAL WITH 1-CLICK COPY BUTTONS */}
            {viewModal && selectedAgent && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow">
                            <div className="modal-header bg-light border-bottom p-3">
                                <h5 className="modal-header-title fw-bold mb-0 text-dark">Agent Details - {selectedAgent.name}</h5>
                                <button type="button" className="btn-close" onClick={() => setViewModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row g-3">

                                    {/* Agent ID */}
                                    <div className="col-md-6">
                                        <div className="p-2 border rounded-3 bg-primary-subtle d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-primary d-block fw-bold text-uppercase" style={{ fontSize: '10px' }}>Agent ID</small>
                                                <span className="fw-bold font-monospace text-primary" style={{ fontSize: '14px' }}>{selectedAgent.agent_id || 'N/A'}</span>
                                            </div>
                                            {selectedAgent.agent_id && (
                                                <button className="btn btn-sm btn-white border rounded-circle p-0" style={{ width: '26px', height: '26px' }} onClick={() => copyToClipboard(selectedAgent.agent_id, 'Agent ID')}>
                                                    <i className="fa fa-copy text-primary" style={{ fontSize: '11px' }}></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <div className="col-md-6">
                                        <div className="p-2 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '10px' }}>Name</small>
                                                <span className="fw-bold text-dark">{selectedAgent.name}</span>
                                            </div>
                                            <button className="btn btn-sm btn-white border rounded-circle p-0" style={{ width: '26px', height: '26px' }} onClick={() => copyToClipboard(selectedAgent.name, 'Name')}>
                                                <i className="fa fa-copy text-primary" style={{ fontSize: '11px' }}></i>
                                            </button>
                                        </div>
                                    </div>


                                    {/* Contact Person */}
                                    <div className="col-md-6">
                                        <div className="p-2 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '10px' }}>Contact Person</small>
                                                <span className="fw-bold text-dark">{selectedAgent.contact_person}</span>
                                            </div>
                                            <button className="btn btn-sm btn-white border rounded-circle p-0" style={{ width: '26px', height: '26px' }} onClick={() => copyToClipboard(selectedAgent.contact_person, 'Contact Person')}>
                                                <i className="fa fa-copy text-primary" style={{ fontSize: '11px' }}></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="col-md-6">
                                        <div className="p-2 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '10px' }}>Email</small>
                                                <span className="fw-bold text-dark">{selectedAgent.email}</span>
                                            </div>
                                            <button className="btn btn-sm btn-white border rounded-circle p-0" style={{ width: '26px', height: '26px' }} onClick={() => copyToClipboard(selectedAgent.email, 'Email')}>
                                                <i className="fa fa-copy text-primary" style={{ fontSize: '11px' }}></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mobile */}
                                    <div className="col-md-6">
                                        <div className="p-2 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '10px' }}>Mobile No</small>
                                                <span className="fw-bold text-dark">{selectedAgent.mobile_no}</span>
                                            </div>
                                            <button className="btn btn-sm btn-white border rounded-circle p-0" style={{ width: '26px', height: '26px' }} onClick={() => copyToClipboard(selectedAgent.mobile_no, 'Mobile No')}>
                                                <i className="fa fa-copy text-primary" style={{ fontSize: '11px' }}></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* PAN No */}
                                    <div className="col-md-4">
                                        <div className="p-2 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '10px' }}>PAN No</small>
                                                <span className="fw-bold font-monospace text-dark">{selectedAgent.pan_no}</span>
                                            </div>
                                            <button className="btn btn-sm btn-white border rounded-circle p-0" style={{ width: '26px', height: '26px' }} onClick={() => copyToClipboard(selectedAgent.pan_no, 'PAN No')}>
                                                <i className="fa fa-copy text-primary" style={{ fontSize: '11px' }}></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* PIN */}
                                    <div className="col-md-4">
                                        <div className="p-2 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '10px' }}>Pincode</small>
                                                <span className="fw-bold text-dark">{selectedAgent.pin}</span>
                                            </div>
                                            <button className="btn btn-sm btn-white border rounded-circle p-0" style={{ width: '26px', height: '26px' }} onClick={() => copyToClipboard(selectedAgent.pin, 'PIN')}>
                                                <i className="fa fa-copy text-primary" style={{ fontSize: '11px' }}></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="col-md-4">
                                        <div className="p-2 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '10px' }}>Location</small>
                                                <span className="fw-bold text-dark">{selectedAgent.location}</span>
                                            </div>
                                            <button className="btn btn-sm btn-white border rounded-circle p-0" style={{ width: '26px', height: '26px' }} onClick={() => copyToClipboard(selectedAgent.location, 'Location')}>
                                                <i className="fa fa-copy text-primary" style={{ fontSize: '11px' }}></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* State */}
                                    <div className="col-md-6">
                                        <div className="p-2 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '10px' }}>State</small>
                                                <span className="fw-bold text-dark">{selectedAgent.state}</span>
                                            </div>
                                            <button className="btn btn-sm btn-white border rounded-circle p-0" style={{ width: '26px', height: '26px' }} onClick={() => copyToClipboard(selectedAgent.state, 'State')}>
                                                <i className="fa fa-copy text-primary" style={{ fontSize: '11px' }}></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* District */}
                                    <div className="col-md-6">
                                        <div className="p-2 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '10px' }}>District</small>
                                                <span className="fw-bold text-dark">{selectedAgent.district}</span>
                                            </div>
                                            <button className="btn btn-sm btn-white border rounded-circle p-0" style={{ width: '26px', height: '26px' }} onClick={() => copyToClipboard(selectedAgent.district, 'District')}>
                                                <i className="fa fa-copy text-primary" style={{ fontSize: '11px' }}></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Full Address */}
                                    <div className="col-md-12">
                                        <div className="p-2 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '10px' }}>Address</small>
                                                <span className="fw-semibold text-dark">
                                                    {[selectedAgent.address_1, selectedAgent.address_2, selectedAgent.address_3, selectedAgent.address_4].filter(Boolean).join(', ')}
                                                </span>
                                            </div>
                                            <button className="btn btn-sm btn-white border rounded-circle p-0" style={{ width: '26px', height: '26px' }} onClick={() => copyToClipboard([selectedAgent.address_1, selectedAgent.address_2, selectedAgent.address_3, selectedAgent.address_4].filter(Boolean).join(', '), 'Address')}>
                                                <i className="fa fa-copy text-primary" style={{ fontSize: '11px' }}></i>
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div className="modal-footer border-top-0 p-3">
                                <button type="button" className="btn btn-primary rounded-pill px-4" onClick={() => copyAllDetails(selectedAgent)}>
                                    <i className="fa fa-copy me-1"></i> Copy All Fields
                                </button>
                                <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setViewModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminAgentList;
