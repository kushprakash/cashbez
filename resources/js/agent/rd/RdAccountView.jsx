import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApiService from '../../core/services/ApiService';
import MpinModal from '../../components/MpinModal';
import MemberSelectSearch from '../../components/MemberSelectSearch';

const getPlanMinAmount = (p) => {
    if (!p) return 0;
    return parseFloat(p.minimum_opening_amount || p.minimum_installment || p.minimum_investment || p.min_amount || 0);
};

const getPlanMaxAmount = (p) => {
    if (!p) return null;
    const max = p.maximum_opening_amount || p.maximum_installment || p.maximum_investment || p.max_amount;
    return max ? parseFloat(max) : null;
};

const RdAccountView = () => {
    const api = ApiService();
    const [accounts, setAccounts] = useState([]);
    const [members, setMembers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [showOpenModal, setShowOpenModal] = useState(false);
    const [showCollectModal, setShowCollectModal] = useState(false);

    // MPIN Modal States
    const [showMpinModal, setShowMpinModal] = useState(false);
    const [mpinActionType, setMpinActionType] = useState(null); // 'OPEN_RD' | 'COLLECT_RD'
    const [mpinAmount, setMpinAmount] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const [openForm, setOpenForm] = useState({
        member_id: '',
        plan_id: '',
        plan_name: '',
        amount: '',
        min_amount: 0,
        max_amount: null,
        duration_months: '12',
        interest_rate: '7.5',
    });

    const [collectForm, setCollectForm] = useState({
        account_id: '',
        account_number: '',
        member_name: '',
        amount: '',
        narration: ''
    });

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const res = await api.vGet(`/api/agent/financial/accounts/RD?search=${encodeURIComponent(search)}`);
            if (res.data && res.data.status === 1) {
                setAccounts(res.data.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch RD accounts', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMembersList = async () => {
        try {
            const res = await api.vGet('/api/agent/financial/members?per_page=100');
            if (res.data && res.data.status === 1) {
                setMembers(res.data.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch members dropdown', err);
        }
    };

    const fetchRdPlans = async () => {
        try {
            const res = await api.vGet('/api/financial/plans?service_type=RD&status=ACTIVE');
            if (res.data && res.data.status === 1) {
                setPlans(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch RD plans', err);
        }
    };

    useEffect(() => {
        fetchAccounts();
        fetchMembersList();
        fetchRdPlans();
    }, [search]);

    const handlePlanChange = (e) => {
        const planId = e.target.value;
        if (!planId) {
            setOpenForm(prev => ({
                ...prev,
                plan_id: '',
                plan_name: '',
                amount: '',
                min_amount: 0,
                max_amount: null,
            }));
            return;
        }

        const selected = plans.find(p => p.id == planId);
        if (selected) {
            const minAmt = getPlanMinAmount(selected);
            const maxAmt = getPlanMaxAmount(selected);
            setOpenForm(prev => ({
                ...prev,
                plan_id: selected.id,
                plan_name: selected.plan_name,
                amount: minAmt > 0 ? String(minAmt) : '',
                min_amount: minAmt,
                max_amount: maxAmt,
                duration_months: selected.minimum_duration ? String(selected.minimum_duration) : prev.duration_months,
                interest_rate: selected.interest_rate ? String(selected.interest_rate) : prev.interest_rate
            }));
        }
    };

    const handleOpenClick = (e) => {
        e.preventDefault();
        if (!openForm.member_id) return toast.error('Please select a member.');
        const amt = parseFloat(openForm.amount || 0);
        setMpinAmount(amt);
        setMpinActionType('OPEN_RD');
        setShowMpinModal(true);
    };

    const handleCollectClick = (e) => {
        e.preventDefault();
        const amt = parseFloat(collectForm.amount || 0);
        if (amt <= 0) return toast.error('Please enter installment amount.');
        setMpinAmount(amt);
        setMpinActionType('COLLECT_RD');
        setShowMpinModal(true);
    };

    const handleMpinConfirm = async (mpinCode) => {
        setSubmitting(true);
        try {
            if (mpinActionType === 'OPEN_RD') {
                const res = await api.vPost('/api/agent/financial/accounts/open', {
                    ...openForm,
                    service_type: 'RD',
                    mpin: mpinCode
                });
                if (res.data && res.data.status === 1) {
                    toast.success(res.data.message);
                    setShowOpenModal(false);
                    setShowMpinModal(false);
                    fetchAccounts();
                } else {
                    toast.error(res.data?.message || 'Opening failed.');
                }
            } else if (mpinActionType === 'COLLECT_RD') {
                const res = await api.vPost('/api/agent/financial/accounts/collect', {
                    account_id: collectForm.account_id,
                    amount: collectForm.amount,
                    narration: collectForm.narration,
                    mpin: mpinCode
                });
                if (res.data && res.data.status === 1) {
                    toast.success(res.data.message);
                    setShowCollectModal(false);
                    setShowMpinModal(false);
                    fetchAccounts();
                } else {
                    toast.error(res.data?.message || 'Collection failed.');
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Transaction failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const openCollectModalForAccount = (acc) => {
        setCollectForm({
            account_id: acc.id,
            account_number: acc.account_number,
            member_name: acc.member?.name || 'N/A',
            amount: acc.opening_amount || '',
            narration: ''
        });
        setShowCollectModal(true);
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom">
                <div>
                    <h3 className="fw-bold text-dark mb-1">
                        <i className="bx bx-refresh text-purple me-2"></i> Recurring Deposit (RD) Management
                    </h3>
                    <p className="text-muted mb-0">Open RD accounts & collect monthly installments via Utility Wallet</p>
                </div>
                <div className="d-flex gap-2">
                    <Link to="/agent/financial-dashboard" className="btn btn-secondary fw-bold shadow-sm me-2">
                        <i className="bx bx-arrow-back me-1"></i> Back to Financial Dashboard
                    </Link>
                    <button className="btn btn-primary fw-bold shadow-sm" style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1' }} onClick={() => setShowOpenModal(true)}>
                        <i className="bx bx-plus-circle me-1"></i> Open RD Account
                    </button>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-3 mb-4">
                <div className="card-body p-3">
                    <div className="row g-3">
                        <div className="col-md-10">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by RD Account Number, Member Name, Mobile..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="col-md-2">
                            <button className="btn btn-outline-secondary w-100" onClick={fetchAccounts}>
                                <i className="bx bx-refresh"></i> Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-3">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>RD Account No</th>
                                <th>Member Name</th>
                                <th>Monthly Installment</th>
                                <th>Total Deposited</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4">Loading RD accounts...</td></tr>
                            ) : accounts.length > 0 ? (
                                accounts.map((acc) => (
                                    <tr key={acc.id}>
                                        <td className="fw-bold text-primary">{acc.account_number}</td>
                                        <td className="fw-semibold">{acc.member?.name || 'N/A'}</td>
                                        <td className="fw-bold">₹{parseFloat(acc.opening_amount).toFixed(2)} / mo</td>
                                        <td className="fw-bold text-success">₹{parseFloat(acc.current_balance).toFixed(2)}</td>
                                        <td><span className="badge bg-success">{acc.status}</span></td>
                                        <td className="text-end">
                                            <button className="btn btn-sm text-white fw-bold" style={{ backgroundColor: '#6f42c1' }} onClick={() => openCollectModalForAccount(acc)}>
                                                <i className="bx bx-plus-circle me-1"></i> RD Installment
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center py-4 text-muted">No Recurring Deposit accounts found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Open RD Modal */}
            {showOpenModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header text-white border-0 py-3 rounded-top-4" style={{ backgroundColor: '#6f42c1' }}>
                                <h5 className="modal-title fw-bold"><i className="bx bx-refresh me-2"></i> Open RD Account</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowOpenModal(false)}></button>
                            </div>
                            <form onSubmit={handleOpenClick}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Select Member <span className="text-danger">*</span></label>
                                        <MemberSelectSearch
                                            members={members}
                                            value={openForm.member_id}
                                            onChange={(memberId) => setOpenForm(prev => ({ ...prev, member_id: memberId }))}
                                            placeholder="Search Member by Name, ID, Mobile..."
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Select Account Plan / Type <span className="text-danger">*</span></label>
                                        <select
                                            className="form-select"
                                            value={openForm.plan_id}
                                            onChange={handlePlanChange}
                                            required
                                        >
                                            <option value="">-- Select Account Type / Plan --</option>
                                            {plans.map((p) => {
                                                const minAmt = getPlanMinAmount(p);
                                                return (
                                                    <option key={p.id} value={p.id}>
                                                        {p.plan_name} ({p.plan_code || 'PLAN'}) {minAmt > 0 ? `- Min Installment: ₹${minAmt}` : ''}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Monthly Installment Amount (₹) <span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            className="form-control form-control-lg fw-bold"
                                            value={openForm.amount}
                                            onChange={(e) => setOpenForm({ ...openForm, amount: e.target.value })}
                                            min={openForm.min_amount || 1}
                                            max={openForm.max_amount || undefined}
                                            placeholder={openForm.min_amount ? `Min Amount ₹${openForm.min_amount}` : 'Enter Monthly Installment'}
                                            required
                                        />
                                        {openForm.plan_id ? (
                                            <small className="text-primary d-block mt-1 font-semibold">
                                                <i className="bx bx-info-circle me-1"></i>
                                                Min Monthly Installment: <strong>₹{openForm.min_amount}</strong>
                                                {openForm.max_amount ? ` | Max: ₹${openForm.max_amount}` : ''}
                                            </small>
                                        ) : (
                                            <small className="text-muted d-block mt-1">Select an account plan above to view min/max limit</small>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Duration (Months)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={openForm.duration_months}
                                            onChange={(e) => setOpenForm({ ...openForm, duration_months: e.target.value })}
                                            min="1"
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer bg-light border-0 py-3 px-4">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowOpenModal(false)}>Cancel</button>
                                    <button type="submit" className="btn text-white px-4 fw-bold" style={{ backgroundColor: '#6f42c1' }}>Proceed to MPIN & Open</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Collect RD Modal */}
            {showCollectModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header text-white border-0 py-3 rounded-top-4" style={{ backgroundColor: '#6f42c1' }}>
                                <h5 className="modal-title fw-bold"><i className="bx bx-plus-circle me-2"></i> Collect RD Installment</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCollectModal(false)}></button>
                            </div>
                            <form onSubmit={handleCollectClick}>
                                <div className="modal-body p-4">
                                    <div className="bg-light rounded-3 p-3 mb-3">
                                        <div className="d-flex justify-content-between">
                                            <span className="text-muted small">Account No:</span>
                                            <span className="fw-bold text-primary">{collectForm.account_number}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mt-1">
                                            <span className="text-muted small">Member Name:</span>
                                            <span className="fw-bold text-dark">{collectForm.member_name}</span>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Installment Amount (₹) <span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            className="form-control form-control-lg fw-bold"
                                            value={collectForm.amount}
                                            onChange={(e) => setCollectForm({ ...collectForm, amount: e.target.value })}
                                            min="1"
                                            required
                                        />
                                        <small className="text-muted">Auto-debited from Utility Wallet</small>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light border-0 py-3 px-4">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowCollectModal(false)}>Cancel</button>
                                    <button type="submit" className="btn text-white px-4 fw-bold" style={{ backgroundColor: '#6f42c1' }}>Proceed to MPIN & Collect</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <MpinModal
                isOpen={showMpinModal}
                onClose={() => setShowMpinModal(false)}
                onConfirm={handleMpinConfirm}
                title={mpinActionType === 'OPEN_RD' ? "Confirm & Open RD Account" : "Confirm RD Installment Collection"}
                serviceTitle={mpinActionType === 'OPEN_RD' ? "Recurring Deposit (RD) Opening" : "RD Installment Collection"}
                planName={mpinActionType === 'OPEN_RD' ? (openForm.plan_name || "Recurring Deposit Plan") : null}
                amount={mpinAmount}
                memberInfo={mpinActionType === 'OPEN_RD' ? members.find(m => m.id == openForm.member_id) : collectForm.member_name}
                accountInfo={mpinActionType === 'COLLECT_RD' ? collectForm.account_number : null}
                walletName="Utility Wallet"
                loading={submitting}
            />
        </div>
    );
};

export default RdAccountView;
