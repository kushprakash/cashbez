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

const SavingAccountView = () => {
    const api = ApiService();
    const [accounts, setAccounts] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modals
    const [showOpenModal, setShowOpenModal] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showMpinModal, setShowMpinModal] = useState(false);

    // MPIN action type tracker ('OPEN_ACCOUNT', 'DEPOSIT', 'WITHDRAW')
    const [mpinActionType, setMpinActionType] = useState(null);
    const [mpinAmount, setMpinAmount] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const [plans, setPlans] = useState([]);

    // Form States
    const [openForm, setOpenForm] = useState({
        member_id: '',
        plan_id: '',
        plan_name: '',
        opening_amount: '',
        min_amount: 0,
        max_amount: null,
    });

    const [depositForm, setDepositForm] = useState({
        account_id: '',
        account_number: '',
        member_name: '',
        amount: '',
        narration: ''
    });

    const [withdrawForm, setWithdrawForm] = useState({
        account_id: '',
        account_number: '',
        member_name: '',
        member_mobile: '',
        member_kyc: '',
        amount: '',
        otp: '',
        otpSent: false,
        sendingOtp: false,
        narration: ''
    });

    const fetchSavingAccounts = async () => {
        try {
            setLoading(true);
            const res = await api.vGet(`/api/agent/financial/saving/accounts?search=${encodeURIComponent(search)}`);
            if (res.data && res.data.status === 1) {
                setAccounts(res.data.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch saving accounts', err);
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

    const fetchSavingPlans = async () => {
        try {
            const res = await api.vGet('/api/financial/plans?service_type=SAVING&status=ACTIVE');
            if (res.data && res.data.status === 1) {
                setPlans(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch saving plans', err);
        }
    };

    useEffect(() => {
        fetchSavingAccounts();
        fetchMembersList();
        fetchSavingPlans();
    }, [search]);

    const handlePlanChange = (e) => {
        const planId = e.target.value;
        if (!planId) {
            setOpenForm(prev => ({
                ...prev,
                plan_id: '',
                plan_name: '',
                opening_amount: '',
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
                opening_amount: minAmt > 0 ? String(minAmt) : '',
                min_amount: minAmt,
                max_amount: maxAmt,
            }));
        }
    };

    // Open Account MPIN Trigger
    const handleOpenAccountClick = (e) => {
        e.preventDefault();
        if (!openForm.member_id) return toast.error('Please select a member.');
        if (!openForm.plan_id && plans.length > 0) return toast.error('Please select an Account Plan / Type.');

        const amount = parseFloat(openForm.opening_amount || 0);
        if (openForm.min_amount > 0 && amount < openForm.min_amount) {
            return toast.error(`Opening deposit amount must be at least ₹${openForm.min_amount}.`);
        }
        if (openForm.max_amount && amount > openForm.max_amount) {
            return toast.error(`Opening deposit amount cannot exceed ₹${openForm.max_amount}.`);
        }

        setMpinAmount(amount);
        setMpinActionType('OPEN_ACCOUNT');
        setShowMpinModal(true);
    };

    // Deposit MPIN Trigger
    const handleDepositClick = (e) => {
        e.preventDefault();
        const amount = parseFloat(depositForm.amount || 0);
        if (amount <= 0) return toast.error('Please enter a valid deposit amount.');
        setMpinAmount(amount);
        setMpinActionType('DEPOSIT');
        setShowMpinModal(true);
    };

    // Withdrawal Step 1: Send OTP to Member's Mobile
    const handleSendWithdrawalOtp = async () => {
        const amount = parseFloat(withdrawForm.amount || 0);
        if (amount <= 0) return toast.error('Please enter a valid withdrawal amount.');

        try {
            setWithdrawForm(prev => ({ ...prev, sendingOtp: true }));
            const res = await api.vPost('/api/agent/financial/saving/send-withdrawal-otp', {
                account_id: withdrawForm.account_id,
                amount: amount
            });

            if (res.data && res.data.status === 1) {
                toast.success(res.data.message);
                setWithdrawForm(prev => ({ ...prev, otpSent: true, sendingOtp: false }));
            } else {
                toast.error(res.data?.message || 'Failed to send OTP.');
                setWithdrawForm(prev => ({ ...prev, sendingOtp: false }));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP.');
            setWithdrawForm(prev => ({ ...prev, sendingOtp: false }));
        }
    };

    // Withdrawal Step 2: Member OTP Entered -> Trigger MPIN Modal
    const handleWithdrawWithOtpClick = (e) => {
        e.preventDefault();
        if (!withdrawForm.otp || withdrawForm.otp.length !== 6) {
            return toast.error('Please enter the 6-digit OTP sent to member mobile.');
        }
        setMpinAmount(parseFloat(withdrawForm.amount));
        setMpinActionType('WITHDRAW');
        setShowMpinModal(true);
    };

    // Consolidated MPIN Callback
    const handleMpinConfirm = async (mpinCode) => {
        setSubmitting(true);
        try {
            if (mpinActionType === 'OPEN_ACCOUNT') {
                const res = await api.vPost('/api/agent/financial/saving/open', { ...openForm, mpin: mpinCode });
                if (res.data && res.data.status === 1) {
                    toast.success(res.data.message);
                    setShowOpenModal(false);
                    setShowMpinModal(false);
                    fetchSavingAccounts();
                } else {
                    toast.error(res.data?.message || 'Account opening failed.');
                }
            } else if (mpinActionType === 'DEPOSIT') {
                const res = await api.vPost('/api/agent/financial/saving/deposit', {
                    account_id: depositForm.account_id,
                    amount: depositForm.amount,
                    narration: depositForm.narration,
                    mpin: mpinCode
                });
                if (res.data && res.data.status === 1) {
                    toast.success(res.data.message);
                    setShowDepositModal(false);
                    setShowMpinModal(false);
                    fetchSavingAccounts();
                } else {
                    toast.error(res.data?.message || 'Deposit failed.');
                }
            } else if (mpinActionType === 'WITHDRAW') {
                const res = await api.vPost('/api/agent/financial/saving/withdraw', {
                    account_id: withdrawForm.account_id,
                    amount: withdrawForm.amount,
                    otp: withdrawForm.otp,
                    narration: withdrawForm.narration,
                    mpin: mpinCode
                });
                if (res.data && res.data.status === 1) {
                    toast.success(res.data.message);
                    setShowWithdrawModal(false);
                    setShowMpinModal(false);
                    fetchSavingAccounts();
                } else {
                    toast.error(res.data?.message || 'Withdrawal failed.');
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Transaction failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const openDepositModalForAccount = (acc) => {
        setDepositForm({
            account_id: acc.id,
            account_number: acc.account_number,
            member_name: acc.member?.name || 'N/A',
            amount: '',
            narration: ''
        });
        setShowDepositModal(true);
    };

    const openWithdrawModalForAccount = (acc) => {
        setWithdrawForm({
            account_id: acc.id,
            account_number: acc.account_number,
            member_name: acc.member?.name || 'N/A',
            member_mobile: acc.member?.mobile || '',
            member_kyc: acc.member?.kyc_status || 'PENDING',
            amount: '',
            otp: '',
            otpSent: false,
            sendingOtp: false,
            narration: ''
        });
        setShowWithdrawModal(true);
    };

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom">
                <div>
                    <h3 className="fw-bold text-dark mb-1">
                        <i className="bx bx-wallet-alt text-success me-2"></i> Saving Account Management
                    </h3>
                    <p className="text-muted mb-0">Open saving accounts, process deposits & perform mobile OTP withdrawals</p>
                </div>
                <div className="d-flex gap-2">
                    <Link to="/agent/financial-dashboard" className="btn btn-secondary fw-bold shadow-sm me-2">
                        <i className="bx bx-arrow-back me-1"></i> Back to Financial Dashboard
                    </Link>
                    <button className="btn btn-success fw-bold shadow-sm" onClick={() => setShowOpenModal(true)}>
                        <i className="bx bx-plus-circle me-1"></i> Open Saving Account
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="card border-0 shadow-sm rounded-3 mb-4">
                <div className="card-body p-3">
                    <div className="row g-3">
                        <div className="col-md-10">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bx bx-search text-muted"></i></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Search by Account Number, Member Name, Mobile, Member ID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-2">
                            <button className="btn btn-outline-secondary w-100" onClick={fetchSavingAccounts}>
                                <i className="bx bx-refresh"></i> Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Accounts Table */}
            <div className="card border-0 shadow-sm rounded-3">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Account No</th>
                                <th>Member Name</th>
                                <th>Mobile</th>
                                <th>KYC Status</th>
                                <th>Current Balance</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-4">Loading saving accounts...</td></tr>
                            ) : accounts.length > 0 ? (
                                accounts.map((acc) => (
                                    <tr key={acc.id}>
                                        <td className="fw-bold text-primary">{acc.account_number}</td>
                                        <td className="fw-semibold">{acc.member?.name || 'N/A'}</td>
                                        <td>{acc.member?.mobile || 'N/A'}</td>
                                        <td>
                                            <span className={`badge ${acc.member?.kyc_status === 'APPROVED' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                KYC: {acc.member?.kyc_status || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="fw-bold text-dark fs-6">₹{parseFloat(acc.current_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        <td><span className="badge bg-success">{acc.status}</span></td>
                                        <td className="text-end">
                                            <button className="btn btn-sm btn-primary me-2 fw-bold" onClick={() => openDepositModalForAccount(acc)}>
                                                <i className="bx bx-down-arrow-circle me-1"></i> Deposit
                                            </button>
                                            <button className="btn btn-sm btn-danger fw-bold" onClick={() => openWithdrawModalForAccount(acc)}>
                                                <i className="bx bx-up-arrow-circle me-1"></i> Mobile OTP Withdraw
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7" className="text-center py-4 text-muted">No saving accounts found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Open Saving Account Modal */}
            {showOpenModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header bg-success text-white border-0 py-3 rounded-top-4">
                                <h5 className="modal-title fw-bold"><i className="bx bx-wallet-alt me-2"></i> Open New Saving Account</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowOpenModal(false)}></button>
                            </div>
                            <form onSubmit={handleOpenAccountClick}>
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
                                                        {p.plan_name} ({p.plan_code || 'PLAN'}) {minAmt > 0 ? `- Min Deposit: ₹${minAmt}` : ''}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Opening Deposit Amount (₹) <span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            className="form-control form-control-lg fw-bold"
                                            value={openForm.opening_amount}
                                            onChange={(e) => setOpenForm({ ...openForm, opening_amount: e.target.value })}
                                            min={openForm.min_amount || 0}
                                            max={openForm.max_amount || undefined}
                                            placeholder={openForm.min_amount ? `Min Amount ₹${openForm.min_amount}` : 'Enter Deposit Amount'}
                                            required
                                        />
                                        {openForm.plan_id ? (
                                            <small className="text-primary d-block mt-1 font-semibold">
                                                <i className="bx bx-info-circle me-1"></i>
                                                Min Opening Amount: <strong>₹{openForm.min_amount}</strong>
                                                {openForm.max_amount ? ` | Max: ₹${openForm.max_amount}` : ''}
                                            </small>
                                        ) : (
                                            <small className="text-muted d-block mt-1">Select an account plan above to view min/max limit</small>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer bg-light border-0 py-3 px-4">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowOpenModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-success px-4 fw-bold">
                                        OPEN ACCOUNT
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header bg-primary text-white border-0 py-3 rounded-top-4">
                                <h5 className="modal-title fw-bold"><i className="bx bx-down-arrow-circle me-2"></i> Saving Deposit</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDepositModal(false)}></button>
                            </div>
                            <form onSubmit={handleDepositClick}>
                                <div className="modal-body p-4">
                                    <div className="bg-light rounded-3 p-3 mb-3">
                                        <div className="d-flex justify-content-between">
                                            <span className="text-muted small">Account No:</span>
                                            <span className="fw-bold text-primary">{depositForm.account_number}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mt-1">
                                            <span className="text-muted small">Member Name:</span>
                                            <span className="fw-bold text-dark">{depositForm.member_name}</span>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Deposit Amount (₹) <span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            className="form-control form-control-lg fw-bold"
                                            placeholder="Enter deposit amount"
                                            value={depositForm.amount}
                                            onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                                            min="1"
                                            required
                                        />
                                        <small className="text-muted">Auto-debited from Agent Utility Wallet</small>
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label fw-semibold">Narration / Remark</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. Monthly cash deposit"
                                            value={depositForm.narration}
                                            onChange={(e) => setDepositForm({ ...depositForm, narration: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer bg-light border-0 py-3 px-4">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowDepositModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary px-4 fw-bold">
                                        Proceed to MPIN & Deposit
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Registered Mobile OTP Withdrawal Modal */}
            {showWithdrawModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header bg-danger text-white border-0 py-3 rounded-top-4">
                                <h5 className="modal-title fw-bold">
                                    <i className="bx bx-up-arrow-circle me-2"></i> Saving Withdrawal (Registered Mobile OTP)
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowWithdrawModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="bg-light rounded-3 p-3 mb-3">
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted small">Account No:</span>
                                        <span className="fw-bold text-danger">{withdrawForm.account_number}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mt-1">
                                        <span className="text-muted small">Member Name:</span>
                                        <span className="fw-bold text-dark">{withdrawForm.member_name}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mt-1">
                                        <span className="text-muted small">Member Mobile:</span>
                                        <span className="fw-bold">{withdrawForm.member_mobile}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mt-1">
                                        <span className="text-muted small">KYC Status:</span>
                                        <span className={`badge ${withdrawForm.member_kyc === 'APPROVED' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                            {withdrawForm.member_kyc}
                                        </span>
                                    </div>
                                </div>

                                {withdrawForm.member_kyc !== 'APPROVED' && (
                                    <div className="alert alert-danger py-2 small mb-3">
                                        <i className="bx bx-error-circle me-1"></i> Warning: Member KYC is NOT Completed.
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Withdrawal Amount (₹) <span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        className="form-control form-control-lg fw-bold"
                                        placeholder="Enter withdrawal amount"
                                        value={withdrawForm.amount}
                                        onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                                        min="1"
                                        disabled={withdrawForm.otpSent}
                                        required
                                    />
                                </div>

                                {!withdrawForm.otpSent ? (
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger w-100 py-2 fw-bold mt-2"
                                        onClick={handleSendWithdrawalOtp}
                                        disabled={withdrawForm.sendingOtp || !withdrawForm.amount}
                                    >
                                        {withdrawForm.sendingOtp ? 'Sending OTP to Member Mobile...' : 'Send OTP to Member Registered Mobile'}
                                    </button>
                                ) : (
                                    <form onSubmit={handleWithdrawWithOtpClick}>
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold text-danger">Enter 6-Digit Mobile OTP <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg text-center fw-bold fs-3 tracking-wider"
                                                placeholder="••••••"
                                                maxLength="6"
                                                value={withdrawForm.otp}
                                                onChange={(e) => setWithdrawForm({ ...withdrawForm, otp: e.target.value.replace(/\D/g, '') })}
                                                autoFocus
                                                required
                                            />
                                            <small className="text-muted">OTP sent to member mobile: {withdrawForm.member_mobile}</small>
                                        </div>
                                        <button type="submit" className="btn btn-danger w-100 py-2 fw-bold" disabled={withdrawForm.otp.length !== 6}>
                                            Confirm OTP & Proceed to MPIN
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MPIN Verification Modal */}
            <MpinModal
                isOpen={showMpinModal}
                onClose={() => setShowMpinModal(false)}
                onConfirm={handleMpinConfirm}
                title={
                    mpinActionType === 'OPEN_ACCOUNT' ? "Confirm & Open Saving Account" :
                        mpinActionType === 'DEPOSIT' ? "Confirm Saving Account Deposit" : "Confirm Saving Account Withdrawal"
                }
                serviceTitle={
                    mpinActionType === 'OPEN_ACCOUNT' ? "Saving Account Opening" :
                        mpinActionType === 'DEPOSIT' ? "Saving Account Deposit" : "Saving Account Withdrawal"
                }
                planName={mpinActionType === 'OPEN_ACCOUNT' ? (openForm.plan_name || "Sugam Bachat") : null}
                amount={mpinAmount}
                memberInfo={
                    mpinActionType === 'OPEN_ACCOUNT'
                        ? members.find(m => m.id == openForm.member_id)
                        : (mpinActionType === 'DEPOSIT' ? depositForm.member_name : withdrawForm.member_name)
                }
                accountInfo={
                    mpinActionType === 'DEPOSIT' ? depositForm.account_number :
                        mpinActionType === 'WITHDRAW' ? withdrawForm.account_number : null
                }
                walletName="Utility Wallet"
                loading={submitting}
            />
        </div>
    );
};

export default SavingAccountView;
