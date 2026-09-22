import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApiService from '../../core/services/ApiService';
import MpinModal from '../../components/MpinModal';

// Dedicated Memoized Register Member Modal Component
const RegisterMemberModal = memo(({ isOpen, onClose, onProceed }) => {
    // Memoize ApiService call so Axios instances & localStorage reads do NOT execute on every keystroke
    const api = useMemo(() => ApiService(), []);
    const [plans, setPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(false);

    const [form, setForm] = useState({
        name: '',
        father_name: '',
        husband_name: '',
        dob: '',
        gender: 'male',
        mobile: '',
        email: '',
        address: '',
        state: '',
        district: '',
        pincode: '',
        occupation: '',
        membership_plan_id: '',
        membership_fee: 0,
        nominee_name: '',
        nominee_relation: '',
        nominee_mobile: '',
    });

    useEffect(() => {
        if (isOpen) {
            fetchMembershipPlans();
        }
    }, [isOpen]);

    const fetchMembershipPlans = async () => {
        try {
            setLoadingPlans(true);
            const res = await api.vGet('/api/financial/membership-plans?status=ACTIVE');
            if (res.data && res.data.status === 1) {
                const planList = res.data.data || [];
                setPlans(planList);
                if (planList.length > 0) {
                    const firstPlan = planList[0];
                    setForm(prev => ({
                        ...prev,
                        membership_plan_id: firstPlan.id,
                        membership_fee: firstPlan.total_fee || firstPlan.membership_fee || 0
                    }));
                }
            }
        } catch (err) {
            console.error('Failed to load membership plans', err);
        } finally {
            setLoadingPlans(false);
        }
    };

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePlanChange = (e) => {
        const planId = e.target.value;
        const selected = plans.find(p => p.id == planId);
        setForm(prev => ({
            ...prev,
            membership_plan_id: planId,
            membership_fee: selected ? (selected.total_fee || selected.membership_fee || 0) : 0
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onProceed(form);
    };

    const selectedPlan = plans.find(p => p.id == form.membership_plan_id);

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4">
                    <div className="modal-header bg-primary text-white border-0 py-3 rounded-top-4">
                        <div className="w-100 d-flex justify-content-between align-items-center">
                            <h5 className="modal-title fw-bold mb-0">
                                <i className="bx bx-user-plus me-2"></i> Register New Member
                            </h5>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>

                            {/* Select Plan Dropdown if multiple plans exist */}
                            {plans.length > 0 && (
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-dark">Choose Membership Plan <span className="text-danger">*</span></label>
                                    <select
                                        className="form-select form-select-lg fw-semibold text-primary"
                                        name="membership_plan_id"
                                        value={form.membership_plan_id}
                                        onChange={handlePlanChange}
                                        required
                                    >
                                        {plans.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.membership_name} ({p.membership_code}) — Fee: ₹{parseFloat(p.total_fee || p.membership_fee).toFixed(2)} ({p.validity} {p.validity_unit})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <h6 className="fw-bold text-primary mb-3"><i className="bx bx-id-card me-1"></i> Personal Details</h6>
                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Full Name <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" name="name" value={form.name} onChange={handleInputChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Father's Name</label>
                                    <input type="text" className="form-control" name="father_name" value={form.father_name} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">Mobile Number <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" name="mobile" value={form.mobile} onChange={handleInputChange} required maxLength="10" />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">Gender</label>
                                    <select className="form-select" name="gender" value={form.gender} onChange={handleInputChange}>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">Date of Birth</label>
                                    <input type="date" className="form-control" name="dob" value={form.dob} onChange={handleInputChange} />
                                </div>
                            </div>

                            <h6 className="fw-bold text-primary mb-3"><i className="bx bx-map me-1"></i> Address & Contact</h6>
                            <div className="row g-3 mb-4">
                                <div className="col-md-8">
                                    <label className="form-label fw-semibold">Address</label>
                                    <input type="text" className="form-control" name="address" value={form.address} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">Pincode</label>
                                    <input type="text" className="form-control" name="pincode" value={form.pincode} onChange={handleInputChange} />
                                </div>
                            </div>

                            <h6 className="fw-bold text-primary mb-3"><i className="bx bx-user-check me-1"></i> Nominee Details</h6>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Nominee Name</label>
                                    <input type="text" className="form-control" name="nominee_name" value={form.nominee_name} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Nominee Relation</label>
                                    <input type="text" className="form-control" name="nominee_relation" value={form.nominee_relation} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer bg-light border-0 py-3 px-4 rounded-bottom-4">
                            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-4 fw-bold shadow-sm">
                                Proceed to Register Member
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
});

const MemberManagementView = () => {
    // Memoize ApiService call so Axios instances & localStorage reads do NOT execute on every keystroke
    const api = useMemo(() => ApiService(), []);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [kycFilter, setKycFilter] = useState('');

    // Modal & Form States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showMpinModal, setShowMpinModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [pendingFormData, setPendingFormData] = useState(null);

    // Debounce search box input
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 350);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            let url = `/api/agent/financial/members?search=${encodeURIComponent(debouncedSearch)}&status=${statusFilter}&kyc_status=${kycFilter}`;
            const res = await api.vGet(url);
            if (res.data && res.data.status === 1) {
                setMembers(res.data.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch members', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [debouncedSearch, statusFilter, kycFilter]);

    const handleFormProceed = useCallback((formData) => {
        setPendingFormData(formData);
        const fee = parseFloat(formData.membership_fee || 0);
        if (fee > 0) {
            setShowMpinModal(true);
        } else {
            submitCreateMember(formData, '');
        }
    }, []);

    const submitCreateMember = async (formData, mpinCode) => {
        const targetData = formData || pendingFormData;
        if (!targetData) return;

        try {
            setSubmitting(true);
            const payload = { ...targetData, mpin: mpinCode };
            const res = await api.vPost('/api/agent/financial/members', payload);
            if (res.data && res.data.status === 1) {
                toast.success(res.data.message);
                setShowCreateModal(false);
                setShowMpinModal(false);
                setPendingFormData(null);
                fetchMembers();
            } else {
                toast.error(res.data?.message || 'Failed to register member.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error occurred during member creation.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewMember = async (memberId) => {
        try {
            const res = await api.vGet(`/api/agent/financial/members/${memberId}`);
            if (res.data && res.data.status === 1) {
                setSelectedMember(res.data.data);
                setShowDetailModal(true);
            }
        } catch (err) {
            toast.error('Failed to load member details.');
        }
    };

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom">
                <div>
                    <h3 className="fw-bold text-dark mb-1">
                        <i className="bx bx-group text-primary me-2"></i> Member Management
                    </h3>
                    <p className="text-muted mb-0">Register new members, view scoped member list & inspect Member 360 profile</p>
                </div>
                <div className="d-flex gap-2">
                    <Link to="/agent/financial-dashboard" className="btn btn-secondary fw-bold shadow-sm me-2">
                        <i className="bx bx-arrow-back me-1"></i> Back to Financial Dashboard
                    </Link>
                    <button className="btn btn-primary fw-bold shadow-sm" onClick={() => setShowCreateModal(true)}>
                        <i className="bx bx-plus-circle me-1"></i> Register New Member
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="card border-0 shadow-sm rounded-3 mb-4">
                <div className="card-body p-3">
                    <div className="row g-3">
                        <div className="col-md-5">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bx bx-search text-muted"></i></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Search by Member ID, Name, Mobile, Email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="">All Member Statuses</option>
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                                <option value="BLOCKED">BLOCKED</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" value={kycFilter} onChange={(e) => setKycFilter(e.target.value)}>
                                <option value="">All KYC Statuses</option>
                                <option value="PENDING">PENDING</option>
                                <option value="SUBMITTED">SUBMITTED</option>
                                <option value="APPROVED">APPROVED</option>
                                <option value="REJECTED">REJECTED</option>
                            </select>
                        </div>
                        <div className="col-md-1">
                            <button className="btn btn-outline-secondary w-100" onClick={fetchMembers}>
                                <i className="bx bx-refresh"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Member Table */}
            <div className="card border-0 shadow-sm rounded-3">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Member ID</th>
                                <th>Name</th>
                                <th>Mobile</th>
                                <th>Gender</th>
                                <th>Membership Fee</th>
                                <th>KYC Status</th>
                                <th>Status</th>
                                <th>Date Joined</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="9" className="text-center py-4">Loading members...</td></tr>
                            ) : members.length > 0 ? (
                                members.map((m) => (
                                    <tr key={m.id}>
                                        <td className="fw-bold text-primary">{m.member_id}</td>
                                        <td className="fw-semibold">{m.name}</td>
                                        <td>{m.mobile}</td>
                                        <td><span className="text-capitalize">{m.gender}</span></td>
                                        <td className="fw-bold">₹{parseFloat(m.membership_fee || 0).toFixed(2)}</td>
                                        <td>
                                            <span className={`badge ${m.kyc_status === 'APPROVED' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                {m.kyc_status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${m.status === 'ACTIVE' ? 'bg-primary' : 'bg-secondary'}`}>
                                                {m.status}
                                            </span>
                                        </td>
                                        <td className="small text-muted">{new Date(m.created_at).toLocaleDateString()}</td>
                                        <td className="text-end">
                                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleViewMember(m.id)}>
                                                <i className="bx bx-show me-1"></i> Member 360
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="9" className="text-center py-4 text-muted">No members found matching your scope/filter.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Register New Member Modal (Isolated State & Memoized ApiService for Instant Typing) */}
            <RegisterMemberModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onProceed={handleFormProceed}
            />

            {/* MPIN Verification Modal */}
            <MpinModal
                isOpen={showMpinModal}
                onClose={() => setShowMpinModal(false)}
                onConfirm={(mpinCode) => submitCreateMember(null, mpinCode)}
                title="Confirm Member Registration Charge"
                amount={pendingFormData?.membership_fee || '0'}
                memberInfo={pendingFormData ? { name: pendingFormData.name, mobile: pendingFormData.mobile } : null}
                walletName="Utility Wallet"
                loading={submitting}
            />

            {/* Member 360 Detail Modal */}
            {showDetailModal && selectedMember && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header bg-gradient bg-primary text-white border-0 py-3 rounded-top-4">
                                <h5 className="modal-title fw-bold">
                                    <i className="bx bx-user me-2"></i> Member 360 Profile ({selectedMember.member_id})
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDetailModal(false)}></button>
                            </div>
                            <div className="modal-body p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <span className="text-muted small d-block">Member Name</span>
                                        <h5 className="fw-bold text-dark">{selectedMember.name}</h5>
                                    </div>
                                    <div className="col-md-3">
                                        <span className="text-muted small d-block">Mobile</span>
                                        <h6 className="fw-bold">{selectedMember.mobile}</h6>
                                    </div>
                                    <div className="col-md-3">
                                        <span className="text-muted small d-block">KYC Status</span>
                                        <span className={`badge ${selectedMember.kyc_status === 'APPROVED' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                            {selectedMember.kyc_status}
                                        </span>
                                    </div>
                                </div>

                                {/* Verified Aadhaar Details Section */}
                                {selectedMember.kyc_status === 'APPROVED' ? (
                                    <div className="card border shadow-sm rounded-3 mb-4 overflow-hidden" style={{ backgroundColor: '#ffffff', borderColor: '#198754' }}>
                                        {/* Card Header Bar */}
                                        <div className="d-flex align-items-center justify-content-between p-3 border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="bx bxs-check-circle text-success fs-4"></i>
                                                <div>
                                                    <h6 className="fw-bold text-dark mb-0">Verified Aadhaar Details</h6>
                                                    <small className="text-muted">Aadhaar OTP Verified Member Profile</small>
                                                </div>
                                            </div>
                                            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-semibold">
                                                <i className="bx bx-check me-1"></i> AADHAAR VERIFIED
                                            </span>
                                        </div>

                                        {/* Card Body Content */}
                                        <div className="p-3" style={{ backgroundColor: '#ffffff' }}>
                                            <div className="row g-3">
                                                {selectedMember.photo && (
                                                    <div className="col-md-3 text-center border-end pe-md-3">
                                                        <div className="position-relative d-inline-block">
                                                            <img
                                                                src={selectedMember.photo}
                                                                alt="Aadhaar Photo"
                                                                className="img-thumbnail rounded-3 shadow-sm mb-2"
                                                                style={{ width: '110px', height: '130px', objectFit: 'cover', border: '2px solid #198754' }}
                                                            />
                                                        </div>
                                                        <small className="d-block text-muted fw-medium">Aadhaar Photo</small>
                                                    </div>
                                                )}

                                                <div className={selectedMember.photo ? "col-md-9 ps-md-3" : "col-md-12"}>
                                                    <div className="row g-2">
                                                        <div className="col-md-6">
                                                            <div className="p-2 rounded bg-light border">
                                                                <span className="text-muted small d-block text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Aadhaar Name</span>
                                                                <strong className="text-dark fs-6">{selectedMember.name || 'N/A'}</strong>
                                                            </div>
                                                        </div>

                                                        <div className="col-md-6">
                                                            <div className="p-2 rounded bg-light border">
                                                                <span className="text-muted small d-block text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Date of Birth</span>
                                                                <strong className="text-dark fs-6">{selectedMember.dob || 'N/A'}</strong>
                                                            </div>
                                                        </div>

                                                        {selectedMember.father_name && (
                                                            <div className="col-md-12">
                                                                <div className="p-2 rounded bg-light border">
                                                                    <span className="text-muted small d-block text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Care Of / Father Name</span>
                                                                    <strong className="text-dark">{selectedMember.father_name}</strong>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="col-md-6">
                                                            <div className="p-2 rounded bg-light border">
                                                                <span className="text-muted small d-block text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Gender</span>
                                                                <strong className="text-dark text-capitalize">{selectedMember.gender || 'N/A'}</strong>
                                                            </div>
                                                        </div>

                                                        <div className="col-md-6">
                                                            <div className="p-2 rounded bg-light border">
                                                                <span className="text-muted small d-block text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Aadhaar Number</span>
                                                                <strong className="text-primary fs-6">{selectedMember.aadhar_number || 'N/A'}</strong>
                                                            </div>
                                                        </div>

                                                        <div className="col-md-12">
                                                            <div className="p-2 rounded bg-light border">
                                                                <span className="text-muted small d-block text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Full Address</span>
                                                                <span className="fw-medium text-dark small d-block">{selectedMember.address || `${selectedMember.state || ''} ${selectedMember.pincode || ''}`}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="alert alert-warning d-flex align-items-center py-2 px-3 mb-4 rounded-3">
                                        <i className="bx bx-error-circle fs-4 me-2"></i>
                                        <div>
                                            <strong>Aadhaar Verification Pending</strong> — Complete Aadhaar OTP verification in KYC Queue to view verified Aadhaar data.
                                        </div>
                                    </div>
                                )}

                                {/* Verified Bank Account Details Section */}
                                {selectedMember.account_verified || selectedMember.account_number ? (
                                    <div className="card border shadow-sm rounded-3 mb-4 overflow-hidden" style={{ backgroundColor: '#ffffff', borderColor: '#0d6efd' }}>
                                        <div className="d-flex align-items-center justify-content-between p-3 border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="bx bxs-check-circle text-primary fs-4"></i>
                                                <div>
                                                    <h6 className="fw-bold text-dark mb-0">Verified Bank Account Details</h6>
                                                    <small className="text-muted">Penny Drop Verified Bank Account Profile</small>
                                                </div>
                                            </div>
                                            <span className={`badge ${selectedMember.account_verified ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning border border-warning-subtle'} px-3 py-2 fw-semibold`}>
                                                <i className={`bx ${selectedMember.account_verified ? 'bx-check' : 'bx-time'} me-1`}></i>
                                                {selectedMember.account_verified ? 'ACCOUNT VERIFIED' : 'ACCOUNT PENDING'}
                                            </span>
                                        </div>
                                        <div className="p-3" style={{ backgroundColor: '#ffffff' }}>
                                            <div className="row g-2">
                                                <div className="col-md-6">
                                                    <div className="p-2 rounded bg-light border">
                                                        <span className="text-muted small d-block text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Account Holder Name (From Bank)</span>
                                                        <strong className="text-dark fs-6">{selectedMember.account_holder_name || selectedMember.name || 'N/A'}</strong>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="p-2 rounded bg-light border">
                                                        <span className="text-muted small d-block text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Bank Name</span>
                                                        <strong className="text-primary fs-6">{selectedMember.bank_name || 'N/A'}</strong>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="p-2 rounded bg-light border">
                                                        <span className="text-muted small d-block text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Bank Account Number</span>
                                                        <strong className="text-dark font-monospace fs-6">{selectedMember.account_number || 'N/A'}</strong>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="p-2 rounded bg-light border">
                                                        <span className="text-muted small d-block text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>IFSC Code & Branch</span>
                                                        <strong className="text-dark font-monospace fs-6">
                                                            {selectedMember.ifsc_code || 'N/A'} {selectedMember.bank_branch ? `(${selectedMember.bank_branch})` : ''}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">Linked Accounts</h6>
                                {selectedMember.accounts?.length > 0 ? (
                                    <div className="table-responsive mb-4">
                                        <table className="table table-sm table-bordered align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Account No</th>
                                                    <th>Service</th>
                                                    <th>Balance</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedMember.accounts.map(acc => (
                                                    <tr key={acc.id}>
                                                        <td className="fw-bold">{acc.account_number}</td>
                                                        <td><span className="badge bg-info">{acc.service_type}</span></td>
                                                        <td className="fw-bold">₹{parseFloat(acc.current_balance).toFixed(2)}</td>
                                                        <td><span className="badge bg-success">{acc.status}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-muted small mb-4">No active financial accounts opened for this member yet.</p>
                                )}

                                <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">Recent Transactions</h6>
                                {selectedMember.transactions?.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-sm table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Txn ID</th>
                                                    <th>Type</th>
                                                    <th>Amount</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedMember.transactions.map(t => (
                                                    <tr key={t.id}>
                                                        <td>{t.transaction_id}</td>
                                                        <td><span className={`badge ${t.txn_type === 'DEPOSIT' ? 'bg-success' : 'bg-danger'}`}>{t.txn_type}</span></td>
                                                        <td>₹{parseFloat(t.amount).toFixed(2)}</td>
                                                        <td>{new Date(t.created_at).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-muted small">No recent transactions logged.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberManagementView;
