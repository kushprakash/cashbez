import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApiService from '../../core/services/ApiService';
import MemberSelectSearch from '../../components/MemberSelectSearch';
import BankAccountBondModal from '../../components/BankAccountBondModal';
import OpenDepositAccountModal from '../../components/OpenDepositAccountModal';
import { AuthContext } from '../../core/hooks/context';

const getPlanMinAmount = (p) => {
    if (!p) return 0;
    const val = p.minimum_daily_deposit ?? p.minimum_installment ?? p.minimum_opening_amount ?? p.minimum_investment ?? p.min_amount ?? 0;
    return parseFloat(val);
};

const getPlanMaxAmount = (p) => {
    if (!p) return null;
    const max = p.maximum_daily_deposit ?? p.maximum_installment ?? p.maximum_opening_amount ?? p.maximum_investment ?? p.max_amount;
    return max ? parseFloat(max) : null;
};

const calculateEstimatedBalance = (acc) => {
    if (!acc) return { currentBal: 0, currentWithInterest: 0, accruedInterest: 0, maturityTotal: 0, rate: 6.5 };

    const currentBal = parseFloat(acc.current_balance || 0);
    const dailyAmt = parseFloat(acc.opening_amount || 0);
    const rate = parseFloat(acc.interest_rate || 6.5);
    const days = parseInt(acc.duration_months || 365, 10);

    // Accrued interest on current balance collected so far
    const accruedInterest = currentBal * (rate / 100) * (days / 365);
    const currentWithInterest = currentBal + accruedInterest;

    // Full plan maturity estimate
    const fullDeposit = dailyAmt * days;
    const totalInterest = fullDeposit * (rate / 100) * (days / 365);
    const maturityTotal = fullDeposit + totalInterest;

    return {
        currentBal,
        currentWithInterest: Math.round(currentWithInterest * 100) / 100,
        accruedInterest: Math.round(accruedInterest * 100) / 100,
        fullDeposit,
        maturityTotal: Math.round(maturityTotal * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        rate
    };
};

/* Account Details & Member Profile Modal */
const AccountDetailsModal = ({ isOpen, account, onClose }) => {
    if (!isOpen || !account) return null;

    const {
        account_number,
        service_type = 'DD',
        opening_amount,
        current_balance,
        interest_rate = 6.5,
        duration_months = 365,
        status = 'ACTIVE',
        created_at,
        member,
        nominee_name,
        nominee_relation,
    } = account;

    const openingDate = created_at ? new Date(created_at).toLocaleDateString('en-IN') : 'N/A';

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div className="modal-header bg-primary text-white py-3 px-4">
                        <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                            <i className="bx bx-id-card fs-4"></i>
                            <span>Account Details & Member Profile</span>
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4 bg-light">

                        {/* Account Overview Header */}
                        <div className="card border-0 shadow-sm rounded-3 p-3 mb-3 bg-white">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <div>
                                    <span className="text-muted small d-block">Daily Deposit Account No</span>
                                    <h4 className="fw-bold text-primary mb-0">{account_number}</h4>
                                </div>
                                <div className="text-end">
                                    <span className="badge bg-success-subtle text-success border border-success-subtle fs-6 px-3 py-1">
                                        <i className="bx bx-check-circle me-1"></i>{status}
                                    </span>
                                    <small className="text-muted d-block mt-1">Opened on: {openingDate}</small>
                                </div>
                            </div>
                        </div>

                        <div className="row g-3">
                            {/* Member Details */}
                            <div className="col-md-6">
                                <div className="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white">
                                    <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">
                                        <i className="bx bx-user me-2"></i>Member Profile
                                    </h6>
                                    <div className="mb-2">
                                        <small className="text-muted d-block">Full Name</small>
                                        <strong className="text-dark fs-6">{member?.name || 'N/A'}</strong>
                                    </div>
                                    <div className="mb-2">
                                        <small className="text-muted d-block">Member Code / ID</small>
                                        <strong className="text-dark">{member?.member_code || member?.id || 'N/A'}</strong>
                                    </div>
                                    <div className="mb-2">
                                        <small className="text-muted d-block">Mobile Contact</small>
                                        <strong className="text-dark">{member?.mobile || member?.phone || 'N/A'}</strong>
                                    </div>
                                    <div className="mb-2">
                                        <small className="text-muted d-block">Address</small>
                                        <span className="text-dark small">{member?.address || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Details */}
                            <div className="col-md-6">
                                <div className="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white">
                                    <h6 className="fw-bold text-success border-bottom pb-2 mb-3">
                                        <i className="bx bx-money me-2"></i>Account & Deposit Rules
                                    </h6>
                                    <div className="mb-2">
                                        <small className="text-muted d-block">Daily Deposit Amount</small>
                                        <strong className="text-dark fs-6">₹{parseFloat(opening_amount || 0).toLocaleString('en-IN')} / day</strong>
                                    </div>
                                    <div className="mb-2">
                                        <small className="text-muted d-block">Total Balance Collected</small>
                                        <strong className="text-success fs-5">₹{parseFloat(current_balance || 0).toLocaleString('en-IN')}</strong>
                                    </div>
                                    <div className="mb-2">
                                        <small className="text-muted d-block">Interest Rate</small>
                                        <strong className="text-primary">{interest_rate}% p.a.</strong>
                                    </div>
                                    <div className="mb-2">
                                        <small className="text-muted d-block">Tenor Duration</small>
                                        <strong className="text-dark">{duration_months} Days</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Nominee Details */}
                            <div className="col-12">
                                <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
                                    <h6 className="fw-bold text-secondary border-bottom pb-2 mb-2">
                                        <i className="bx bx-group me-2"></i>Nominee Details
                                    </h6>
                                    <div className="row">
                                        <div className="col-6">
                                            <small className="text-muted d-block">Nominee Name</small>
                                            <strong className="text-dark">{nominee_name || member?.nominee_name || 'N/A'}</strong>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block">Relationship</small>
                                            <strong className="text-dark">{nominee_relation || member?.nominee_relation || 'N/A'}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="modal-footer bg-white border-0 py-3 px-4">
                        <button type="button" className="btn btn-secondary px-4 fw-bold" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

import DepositReceiptModal from '../../components/DepositReceiptModal';

/* Account Statement Modal */
const AccountStatementModal = ({ isOpen, account, onClose }) => {
    const { userData } = useContext(AuthContext) || {};
    const companyName = userData?.company_name ||
                        userData?.setting?.company_name ||
                        localStorage.getItem('company_name') ||
                        'CASHBEZ FINANCIAL SERVICES NIDHI LIMITED';
    const api = ApiService();
    const [loading, setLoading] = useState(true);
    const [txns, setTxns] = useState([]);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [receiptData, setReceiptData] = useState(null);

    useEffect(() => {
        if (isOpen && account) {
            setFromDate('');
            setToDate('');
            fetchStatement('', '');
        }
    }, [isOpen, account]);

    const fetchStatement = async (fDate = fromDate, tDate = toDate) => {
        try {
            setLoading(true);
            let url = `/api/agent/financial/passbook?account_number=${encodeURIComponent(account.account_number)}&account_id=${account.id}`;
            if (fDate) url += `&from_date=${fDate}`;
            if (tDate) url += `&to_date=${tDate}`;

            const res = await api.vGet(url);
            if (res.data && res.data.status === 1) {
                setTxns(res.data.data?.data || res.data.data || []);
            }
        } catch (e) {
            console.error('Failed to fetch statement', e);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (e) => {
        e.preventDefault();
        fetchStatement(fromDate, toDate);
    };

    const handleReset = () => {
        setFromDate('');
        setToDate('');
        fetchStatement('', '');
    };

    const handlePrintPassbook = () => {
        window.print();
    };

    const handlePrintTxnReceipt = (t) => {
        const typeStr = String(t.type || t.transaction_type || t.txn_type || '').toUpperCase();
        const narrationStr = String(t.narration || t.description || '').toLowerCase();
        
        const isWithdrawal = typeStr.includes('DEBIT') || typeStr.includes('WITHDRAW') || typeStr === 'DR' || narrationStr.includes('withdraw') || narrationStr.includes('debit');
        const isCredit = !isWithdrawal;

        const receiptObj = {
            transaction_id: t.transaction_id || t.reference_no || `TXN#${t.id}`,
            created_at: t.created_at || new Date().toISOString(),
            member_name: account.member?.name || 'N/A',
            member_id: account.member?.member_code || account.member?.id || 'N/A',
            account_number: account.account_number,
            service_type: account.service_type || 'DD',
            amount: t.amount,
            balance_before: t.balance_before ?? t.pre_balance ?? (isCredit ? (parseFloat(t.balance_after || t.post_balance || 0) - parseFloat(t.amount || 0)) : (parseFloat(t.balance_after || t.post_balance || 0) + parseFloat(t.amount || 0))),
            balance_after: t.balance_after ?? t.post_balance ?? account.current_balance,
            narration: t.narration || t.description || (isWithdrawal ? 'Withdrawal Transaction' : 'Daily Deposit Transaction'),
            txn_type: isWithdrawal ? 'WITHDRAWAL' : 'DEPOSIT',
            type: isWithdrawal ? 'DEBIT' : 'CREDIT',
            receipt_type: isWithdrawal ? 'WITHDRAWAL' : 'DEPOSIT',
            isWithdrawal: isWithdrawal,
            status: 'SUCCESS'
        };
        setReceiptData(receiptObj);
    };

    if (!isOpen || !account) return null;

    return (
        <>
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
                <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                        <div className="modal-header bg-info text-white py-3 px-4 no-print d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <i className="bx bx-book-open fs-4"></i>
                                <span className="fw-bold fs-5 text-white">Account Passbook Statement ({account.account_number})</span>
                            </div>
                            <div className="d-flex gap-2">
                                <button type="button" className="btn btn-light btn-sm fw-bold text-dark" onClick={handlePrintPassbook}>
                                    <i className="bx bx-printer me-1"></i> Print Passbook
                                </button>
                                <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                            </div>
                        </div>

                        <div className="modal-body p-4 bg-white" id="printable-passbook-statement">
                            <style>{`
                                @media print {
                                    body * { visibility: hidden !important; }
                                    #printable-passbook-statement, #printable-passbook-statement * { visibility: visible !important; }
                                    #printable-passbook-statement { position: fixed !important; left: 0 !important; top: 0 !important; width: 100% !important; height: 100% !important; padding: 20px !important; margin: 0 !important; background: white !important; }
                                    .no-print { display: none !important; }
                                }
                            `}</style>

                            {/* Date Range Filter Bar */}
                            <div className="no-print card border-0 bg-light p-3 mb-3 rounded-3 border">
                                <form onSubmit={handleFilter} className="row g-2 align-items-end">
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold text-muted mb-1">From Date</label>
                                        <input
                                            type="date"
                                            className="form-control form-control-sm"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold text-muted mb-1">To Date</label>
                                        <input
                                            type="date"
                                            className="form-control form-control-sm"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-4 d-flex gap-2">
                                        <button type="submit" className="btn btn-sm btn-primary fw-bold flex-fill">
                                            <i className="bx bx-filter-alt me-1"></i> Filter
                                        </button>
                                        <button type="button" className="btn btn-sm btn-outline-secondary fw-semibold flex-fill" onClick={handleReset}>
                                            <i className="bx bx-reset me-1"></i> Reset
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="border-bottom pb-3 mb-3 text-center">
                                <h4 className="fw-bold text-dark mb-1">{companyName}</h4>
                                <p className="text-muted small mb-0">Daily Deposit Passbook Transaction Statement</p>
                                <div className="mt-2 text-start p-2 bg-light rounded border d-flex justify-content-between text-dark small fw-bold flex-wrap gap-2">
                                    <span>Account No: {account.account_number}</span>
                                    <span>Member: {account.member?.name || 'N/A'}</span>
                                    <span>Current Balance: ₹{parseFloat(account.current_balance || 0).toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-bordered table-striped align-middle small">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Date & Time</th>
                                            <th>Txn ID</th>
                                            <th>Type</th>
                                            <th>Amount (₹)</th>
                                            <th>Balance (₹)</th>
                                            <th>Narration</th>
                                            <th className="text-center no-print">Receipt</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="7" className="text-center py-3">Loading transactions...</td></tr>
                                        ) : txns.length > 0 ? (
                                            txns.map((t, idx) => (
                                                <tr key={t.id || idx}>
                                                    <td>{t.created_at ? new Date(t.created_at).toLocaleString('en-IN') : 'N/A'}</td>
                                                    <td className="fw-bold text-secondary">{t.transaction_id || `TXN${t.id}`}</td>
                                                    <td>
                                                        <span className={`badge ${t.txn_type === 'DEPOSIT' || t.type === 'CREDIT' ? 'bg-success' : 'bg-danger'}`}>
                                                            {t.txn_type || t.type || 'TXN'}
                                                        </span>
                                                    </td>
                                                    <td className="fw-bold text-success">₹{parseFloat(t.amount || 0).toLocaleString('en-IN')}</td>
                                                    <td className="fw-bold text-dark">₹{parseFloat(t.balance_after || 0).toLocaleString('en-IN')}</td>
                                                    <td className="text-muted">{t.narration || 'Daily Deposit'}</td>
                                                    <td className="text-center no-print">
                                                        <button
                                                            type="button"
                                                            className="btn btn-xs btn-sm btn-outline-primary fw-bold py-1 px-2"
                                                            onClick={() => handlePrintTxnReceipt(t)}
                                                            title="Print Transaction Receipt"
                                                        >
                                                            <i className="bx bx-printer me-1"></i> Receipt
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="7" className="text-center py-3 text-muted">No transactions found for this account.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                        <div className="modal-footer bg-light border-0 py-3 px-4 no-print d-flex justify-content-between">
                            <small className="text-muted"><i className="bx bx-check-shield text-success me-1"></i> Verified Account Statement</small>
                            <button type="button" className="btn btn-secondary px-4 fw-bold" onClick={onClose}>Close</button>
                        </div>
                    </div>
                </div>
            </div>

            <DepositReceiptModal
                isOpen={Boolean(receiptData)}
                onClose={() => setReceiptData(null)}
                data={receiptData}
            />
        </>
    );
};

const DdAccountView = () => {
    const api = ApiService();
    const [accounts, setAccounts] = useState([]);
    const [members, setMembers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [showOpenModal, setShowOpenModal] = useState(false);

    // Modal action states
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [detailsAccount, setDetailsAccount] = useState(null);

    const [showStatementModal, setShowStatementModal] = useState(false);
    const [statementAccount, setStatementAccount] = useState(null);

    const [showBondModal, setShowBondModal] = useState(false);
    const [bondData, setBondData] = useState(null);

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
        duration_months: '365',
    });

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const res = await api.vGet(`/api/agent/financial/accounts/DD?search=${encodeURIComponent(search)}`);
            if (res.data && res.data.status === 1) {
                setAccounts(res.data.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch DD accounts', err);
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

    const fetchDdPlans = async () => {
        try {
            const res = await api.vGet('/api/financial/plans?service_type=DD&status=ACTIVE');
            if (res.data && res.data.status === 1) {
                setPlans(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch DD plans', err);
        }
    };

    useEffect(() => {
        fetchAccounts();
        fetchMembersList();
        fetchDdPlans();
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
                duration_months: '365',
            }));
            return;
        }

        const selected = plans.find(p => p.id == planId);
        if (selected) {
            const minAmt = getPlanMinAmount(selected);
            const maxAmt = getPlanMaxAmount(selected);
            const minDuration = selected.minimum_duration || selected.duration || 365;
            setOpenForm(prev => ({
                ...prev,
                plan_id: selected.id,
                plan_name: selected.plan_name,
                amount: minAmt > 0 ? String(minAmt) : '',
                min_amount: minAmt,
                max_amount: maxAmt,
                duration_months: String(minDuration)
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
                service_type: 'DD',
                mpin: mpinCode
            });
            if (res.data && res.data.status === 1) {
                toast.success(res.data.message);
                setShowOpenModal(false);
                setShowMpinModal(false);
                fetchAccounts();

                // Open Bond Certificate Modal
                const createdAcc = res.data.data || {};
                const selectedMember = members.find(m => m.id == openForm.member_id);
                setBondData({
                    ...createdAcc,
                    service_type: 'DD',
                    plan_name: openForm.plan_name,
                    opening_amount: parseFloat(openForm.amount || 0),
                    duration_months: openForm.duration_months || 365,
                    min_tenor_months: 300,
                    member: selectedMember || createdAcc.member
                });
                setShowBondModal(true);
            } else {
                toast.error(res.data?.message || 'Opening failed.');
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
                        <i className="bx bx-calendar-event text-warning me-2"></i> Daily Deposit (DD) Accounts
                    </h3>
                    <p className="text-muted mb-0">View DD accounts, check statements, member details, and print official account bonds</p>
                </div>
                <div className="d-flex gap-2">
                    <Link to="/agent/financial-dashboard" className="btn btn-secondary fw-bold shadow-sm me-2">
                        <i className="bx bx-arrow-back me-1"></i> Back to Financial Dashboard
                    </Link>
                    <button className="btn btn-warning text-dark fw-bold shadow-sm" onClick={() => {
                        setOpenForm({
                            member_id: '',
                            plan_id: '',
                            plan_name: '',
                            amount: '',
                            min_amount: 0,
                            max_amount: null,
                            duration_months: '365',
                        });
                        setShowOpenModal(true);
                    }}>
                        <i className="bx bx-plus-circle me-1"></i> Open DD Account
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
                                placeholder="Search by DD Account Number, Member Name, Mobile..."
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
                                <th>DD Account No</th>
                                <th>Member Name</th>
                                <th>Daily Amount</th>
                                <th>Total Collected</th>
                                <th>Est. Total (with Interest)</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-4">Loading DD accounts...</td></tr>
                            ) : accounts.length > 0 ? (
                                accounts.map((acc) => {
                                    const est = calculateEstimatedBalance(acc);
                                    return (
                                        <tr key={acc.id}>
                                            <td className="fw-bold text-primary">{acc.account_number}</td>
                                            <td className="fw-semibold">{acc.member?.name || 'N/A'}</td>
                                            <td className="fw-bold">₹{parseFloat(acc.opening_amount).toFixed(2)} / day</td>
                                            <td className="fw-bold text-success">₹{parseFloat(acc.current_balance).toFixed(2)}</td>
                                            <td>
                                                <div>
                                                    <strong className="text-primary fs-6">
                                                        ₹{est.currentWithInterest.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </strong>

                                                </div>
                                            </td>
                                            <td><span className="badge bg-success">{acc.status}</span></td>
                                            <td className="text-end">
                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        className="btn btn-outline-info fw-semibold me-1"
                                                        onClick={() => {
                                                            setStatementAccount(acc);
                                                            setShowStatementModal(true);
                                                        }}
                                                        title="Account Passbook Statement"
                                                    >
                                                        <i className="bx bx-book-open me-1"></i> Statement
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-primary fw-semibold me-1"
                                                        onClick={() => {
                                                            setDetailsAccount(acc);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        title="Account Details with Member"
                                                    >
                                                        <i className="bx bx-id-card me-1"></i> Details
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-warning text-dark fw-bold"
                                                        onClick={() => {
                                                            setBondData({ ...acc, service_type: 'DD' });
                                                            setShowBondModal(true);
                                                        }}
                                                        title="Print Deposit Bond Certificate"
                                                    >
                                                        <i className="bx bx-printer me-1"></i> Print Bond
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="7" className="text-center py-4 text-muted">No Daily Deposit accounts found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Open DD Modal */}
            <OpenDepositAccountModal
                serviceType="DD"
                isOpen={showOpenModal}
                onClose={() => setShowOpenModal(false)}
                onSuccess={fetchAccounts}
                onOpenBond={(bData) => {
                    setBondData(bData);
                    setShowBondModal(true);
                }}
            />

            {/* Account Details & Member Modal */}
            <AccountDetailsModal
                isOpen={showDetailsModal}
                account={detailsAccount}
                onClose={() => { setShowDetailsModal(false); setDetailsAccount(null); }}
            />

            {/* Account Passbook Statement Modal */}
            <AccountStatementModal
                isOpen={showStatementModal}
                account={statementAccount}
                onClose={() => { setShowStatementModal(false); setStatementAccount(null); }}
            />

            {/* Bank Account Bond Certificate Modal */}
            <BankAccountBondModal
                isOpen={showBondModal}
                bondData={bondData}
                onClose={() => { setShowBondModal(false); setBondData(null); }}
            />
        </div>
    );
};

export default DdAccountView;
