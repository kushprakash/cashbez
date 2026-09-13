import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApiService from '../../core/services/ApiService';
import MpinModal from '../../components/MpinModal';
import MemberSelectSearch from '../../components/MemberSelectSearch';

const getPlanMinAmount = (p) => {
    if (!p) return 0;
    return parseFloat(p.minimum_opening_amount || p.minimum_investment || p.min_amount || 0);
};

const getPlanMaxAmount = (p) => {
    if (!p) return null;
    const max = p.maximum_opening_amount || p.maximum_investment || p.max_amount;
    return max ? parseFloat(max) : null;
};

const MisAccountView = () => {
    const api = ApiService();
    const [accounts, setAccounts] = useState([]);
    const [members, setMembers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [showOpenModal, setShowOpenModal] = useState(false);
    const [showMpinModal, setShowMpinModal] = useState(false);
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
        interest_rate: '9.0',
    });

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const res = await api.vGet(`/api/agent/financial/accounts/MIS?search=${encodeURIComponent(search)}`);
            if (res.data && res.data.status === 1) {
                setAccounts(res.data.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch MIS accounts', err);
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

    const fetchMisPlans = async () => {
        try {
            const res = await api.vGet('/api/financial/plans?service_type=MIS&status=ACTIVE');
            if (res.data && res.data.status === 1) {
                setPlans(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch MIS plans', err);
        }
    };

    useEffect(() => {
        fetchAccounts();
        fetchMembersList();
        fetchMisPlans();
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
        setShowMpinModal(true);
    };

    const handleMpinConfirm = async (mpinCode) => {
        setSubmitting(true);
        try {
            const res = await api.vPost('/api/agent/financial/accounts/open', {
                ...openForm,
                service_type: 'MIS',
                mpin: mpinCode
            });
            if (res.data && res.data.status === 1) {
                toast.success(res.data.message);
                setShowOpenModal(false);
                setShowMpinModal(false);
                fetchAccounts();
            } else {
                toast.error(res.data?.message || 'MIS Account opening failed.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Transaction failed.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom">
                <div>
                    <h3 className="fw-bold text-dark mb-1">
                        <i className="bx bx-line-chart text-info me-2"></i> MIS (Monthly Income Scheme) Management
                    </h3>
                    <p className="text-muted mb-0">Open MIS investment accounts & track monthly interest payouts</p>
                </div>
                <div className="d-flex gap-2">
                    <Link to="/agent/financial-dashboard" className="btn btn-secondary fw-bold shadow-sm me-2">
                        <i className="bx bx-arrow-back me-1"></i> Back to Financial Dashboard
                    </Link>
                    <button className="btn btn-info text-white fw-bold shadow-sm" onClick={() => setShowOpenModal(true)}>
                        <i className="bx bx-plus-circle me-1"></i> Open MIS Account
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
                                placeholder="Search by MIS Account Number, Member Name, Mobile..."
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
                                <th>MIS Account No</th>
                                <th>Member Name</th>
                                <th>Investment Amount</th>
                                <th>Interest Rate</th>
                                <th>Monthly Payout</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4">Loading MIS accounts...</td></tr>
                            ) : accounts.length > 0 ? (
                                accounts.map((acc) => {
                                    const principal = parseFloat(acc.opening_amount);
                                    const rate = parseFloat(acc.interest_rate || 9.0);
                                    const monthlyPayout = (principal * rate / 100) / 12;

                                    return (
                                        <tr key={acc.id}>
                                            <td className="fw-bold text-primary">{acc.account_number}</td>
                                            <td className="fw-semibold">{acc.member?.name || 'N/A'}</td>
                                            <td className="fw-bold text-dark">₹{principal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                            <td><span className="badge bg-info">{rate}% p.a.</span></td>
                                            <td className="fw-bold text-success">₹{monthlyPayout.toFixed(2)} / mo</td>
                                            <td><span className="badge bg-success">{acc.status}</span></td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="6" className="text-center py-4 text-muted">No MIS accounts found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Open MIS Modal */}
            {showOpenModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header bg-info text-white border-0 py-3 rounded-top-4">
                                <h5 className="modal-title fw-bold"><i className="bx bx-line-chart me-2"></i> Open MIS Account</h5>
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
                                            {plans.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.plan_name} ({p.plan_code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Investment Amount (₹) <span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            className="form-control form-control-lg fw-bold"
                                            value={openForm.amount}
                                            onChange={(e) => setOpenForm({ ...openForm, amount: e.target.value })}
                                            min={openForm.min_amount || 1}
                                            max={openForm.max_amount || undefined}
                                            required
                                        />
                                        <small className="text-muted d-block">
                                            Auto-debited from Utility Wallet.
                                            {openForm.min_amount > 0 && ` Min: ₹${openForm.min_amount}`}
                                            {openForm.max_amount && ` | Max: ₹${openForm.max_amount}`}
                                        </small>
                                    </div>
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <label className="form-label fw-semibold">Duration (Months)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={openForm.duration_months}
                                                onChange={(e) => setOpenForm({ ...openForm, duration_months: e.target.value })}
                                                min="1"
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label fw-semibold">Interest Rate (% p.a.)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={openForm.interest_rate}
                                                onChange={(e) => setOpenForm({ ...openForm, interest_rate: e.target.value })}
                                                step="0.1"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light border-0 py-3 px-4">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowOpenModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-info text-white px-4 fw-bold">Proceed to MPIN & Open</button>
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
                title="Confirm & Open MIS Account"
                serviceTitle="Monthly Income Scheme (MIS) Opening"
                planName={openForm.plan_name || "MIS Investment Plan"}
                amount={mpinAmount}
                memberInfo={members.find(m => m.id == openForm.member_id)}
                walletName="Utility Wallet"
                loading={submitting}
            />
        </div>
    );
};

export default MisAccountView;
