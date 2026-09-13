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

const FdAccountView = () => {
    const api = ApiService();
    const [accounts, setAccounts] = useState([]);
    const [members, setMembers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [showOpenModal, setShowOpenModal] = useState(false);
    const [showCertModal, setShowCertModal] = useState(false);
    const [selectedCert, setSelectedCert] = useState(null);

    // MPIN Modal States
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
        interest_rate: '8.5',
    });

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const res = await api.vGet(`/api/agent/financial/accounts/FD?search=${encodeURIComponent(search)}`);
            if (res.data && res.data.status === 1) {
                setAccounts(res.data.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch FD accounts', err);
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

    const fetchFdPlans = async () => {
        try {
            const res = await api.vGet('/api/financial/plans?service_type=FD&status=ACTIVE');
            if (res.data && res.data.status === 1) {
                setPlans(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch FD plans', err);
        }
    };

    useEffect(() => {
        fetchAccounts();
        fetchMembersList();
        fetchFdPlans();
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
                service_type: 'FD',
                mpin: mpinCode
            });
            if (res.data && res.data.status === 1) {
                toast.success(res.data.message);
                setShowOpenModal(false);
                setShowMpinModal(false);
                fetchAccounts();
            } else {
                toast.error(res.data?.message || 'FD Account opening failed.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Transaction failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewCertificate = async (fdId) => {
        try {
            const res = await api.vGet(`/api/agent/financial/fd-certificate/${fdId}`);
            if (res.data && res.data.status === 1) {
                setSelectedCert(res.data.data);
                setShowCertModal(true);
            }
        } catch (err) {
            toast.error('Failed to load FD Certificate.');
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom">
                <div>
                    <h3 className="fw-bold text-dark mb-1">
                        <i className="bx bx-vault text-danger me-2"></i> Fixed Deposit (FD) Management
                    </h3>
                    <p className="text-muted mb-0">Open FD accounts, view printable certificates & track maturity schedules</p>
                </div>
                <div className="d-flex gap-2">
                    <Link to="/agent/financial-dashboard" className="btn btn-secondary fw-bold shadow-sm me-2">
                        <i className="bx bx-arrow-back me-1"></i> Back to Financial Dashboard
                    </Link>
                    <button className="btn btn-danger fw-bold shadow-sm" onClick={() => setShowOpenModal(true)}>
                        <i className="bx bx-plus-circle me-1"></i> Open FD Account
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
                                placeholder="Search by FD Account Number, Member Name, Mobile..."
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
                                <th>FD Account No</th>
                                <th>Member Name</th>
                                <th>Principal Deposit</th>
                                <th>Interest Rate</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-4">Loading FD accounts...</td></tr>
                            ) : accounts.length > 0 ? (
                                accounts.map((acc) => (
                                    <tr key={acc.id}>
                                        <td className="fw-bold text-primary">{acc.account_number}</td>
                                        <td className="fw-semibold">{acc.member?.name || 'N/A'}</td>
                                        <td className="fw-bold text-dark">₹{parseFloat(acc.opening_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        <td><span className="badge bg-info">{acc.interest_rate}% p.a.</span></td>
                                        <td>{acc.duration_months} Months</td>
                                        <td><span className="badge bg-success">{acc.status}</span></td>
                                        <td className="text-end">
                                            <button className="btn btn-sm btn-outline-danger fw-bold" onClick={() => handleViewCertificate(acc.id)}>
                                                <i className="bx bx-certification me-1"></i> Certificate
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7" className="text-center py-4 text-muted">No Fixed Deposit accounts found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Open FD Modal */}
            {showOpenModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header bg-danger text-white border-0 py-3 rounded-top-4">
                                <h5 className="modal-title fw-bold"><i className="bx bx-vault me-2"></i> Open FD Account</h5>
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
                                                        {p.plan_name} ({p.plan_code || 'PLAN'}) {minAmt > 0 ? `- Min Principal: ₹${minAmt}` : ''}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">FD Deposit Principal (₹) <span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            className="form-control form-control-lg fw-bold"
                                            value={openForm.amount}
                                            onChange={(e) => setOpenForm({ ...openForm, amount: e.target.value })}
                                            min={openForm.min_amount || 1}
                                            max={openForm.max_amount || undefined}
                                            placeholder={openForm.min_amount ? `Min Principal ₹${openForm.min_amount}` : 'Enter Principal Amount'}
                                            required
                                        />
                                        {openForm.plan_id ? (
                                            <small className="text-primary d-block mt-1 font-semibold">
                                                <i className="bx bx-info-circle me-1"></i>
                                                Min Principal: <strong>₹{openForm.min_amount}</strong>
                                                {openForm.max_amount ? ` | Max: ₹${openForm.max_amount}` : ''}
                                            </small>
                                        ) : (
                                            <small className="text-muted d-block mt-1">Select an account plan above to view min/max limit</small>
                                        )}
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
                                    <button type="submit" className="btn btn-danger px-4 fw-bold">Proceed to MPIN & Open</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Printable FD Certificate Modal */}
            {showCertModal && selectedCert && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header bg-dark text-white border-0 py-3 rounded-top-4">
                                <h5 className="modal-title fw-bold"><i className="bx bx-certification me-2"></i> Fixed Deposit Certificate</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCertModal(false)}></button>
                            </div>
                            <div className="modal-body p-4 text-dark" id="printable-fd-cert">
                                <div className="border border-3 border-danger p-4 rounded-3 text-center bg-light">
                                    <h2 className="fw-bold text-danger mb-1">FIXED DEPOSIT CERTIFICATE</h2>
                                    <p className="text-muted small mb-4">CashBez Financial Services</p>

                                    <div className="row g-3 text-start mb-4">
                                        <div className="col-6">
                                            <span className="text-muted small d-block">Certificate / FD No:</span>
                                            <h5 className="fw-bold text-primary">{selectedCert.account_number}</h5>
                                        </div>
                                        <div className="col-6 text-end">
                                            <span className="text-muted small d-block">Status:</span>
                                            <span className="badge bg-success fs-6">{selectedCert.status}</span>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-muted small d-block">Member Name:</span>
                                            <h6 className="fw-bold">{selectedCert.member_name} ({selectedCert.member_id})</h6>
                                        </div>
                                        <div className="col-6 text-end">
                                            <span className="text-muted small d-block">Mobile:</span>
                                            <h6 className="fw-bold">{selectedCert.mobile}</h6>
                                        </div>
                                    </div>

                                    <div className="bg-white p-3 rounded-3 border mb-4">
                                        <div className="row g-2 text-center">
                                            <div className="col-3">
                                                <span className="text-muted small d-block">Principal Amount</span>
                                                <h4 className="fw-bold text-dark">₹{parseFloat(selectedCert.principal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
                                            </div>
                                            <div className="col-3">
                                                <span className="text-muted small d-block">Interest Rate</span>
                                                <h4 className="fw-bold text-primary">{selectedCert.interest_rate}% p.a.</h4>
                                            </div>
                                            <div className="col-3">
                                                <span className="text-muted small d-block">Term</span>
                                                <h4 className="fw-bold text-dark">{selectedCert.duration_months} Mos</h4>
                                            </div>
                                            <div className="col-3">
                                                <span className="text-muted small d-block">Maturity Amount</span>
                                                <h4 className="fw-bold text-success">₹{parseFloat(selectedCert.maturity_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between text-start small text-muted">
                                        <div>Issue Date: <strong>{selectedCert.opening_date}</strong></div>
                                        <div>Maturity Date: <strong>{selectedCert.maturity_date}</strong></div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer bg-light border-0 py-3 px-4">
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowCertModal(false)}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={() => window.print()}>
                                    <i className="bx bx-printer me-1"></i> Print Certificate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <MpinModal
                isOpen={showMpinModal}
                onClose={() => setShowMpinModal(false)}
                onConfirm={handleMpinConfirm}
                title="Confirm & Open Fixed Deposit (FD)"
                serviceTitle="Fixed Deposit (FD) Opening"
                planName={openForm.plan_name || "Fixed Deposit Plan"}
                amount={mpinAmount}
                memberInfo={members.find(m => m.id == openForm.member_id)}
                walletName="Utility Wallet"
                loading={submitting}
            />
        </div>
    );
};

export default FdAccountView;
