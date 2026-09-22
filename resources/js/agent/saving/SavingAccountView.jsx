import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApiService from '../../core/services/ApiService';
import MpinModal from '../../components/MpinModal';
import MemberSelectSearch from '../../components/MemberSelectSearch';
import BankAccountBondModal from '../../components/BankAccountBondModal';

const getPlanMinAmount = (p) => {
    if (!p) return 0;
    return parseFloat(p.minimum_opening_amount || p.minimum_installment || p.minimum_investment || p.min_amount || 0);
};

const getPlanMaxAmount = (p) => {
    if (!p) return null;
    const max = p.maximum_opening_amount || p.maximum_installment || p.maximum_investment || p.max_amount;
    return max ? parseFloat(max) : null;
};

/* ─────────────────────────────────────────────────────────────
   Saving Account Details & Member Profile Modal
───────────────────────────────────────────────────────────── */
const AccountDetailsModal = ({ isOpen, account, onClose }) => {
    if (!isOpen || !account) return null;

    const {
        account_number,
        opening_amount,
        current_balance,
        interest_rate = 4.0,
        status = 'ACTIVE',
        created_at,
        member,
        nominee_name,
        nominee_relation,
        virtual_account_number,
        virtual_ifsc,
        virtual_upi_handle,
        qrcode_image,
        qrcode_pdf,
    } = account;

    const openingDate = created_at ? new Date(created_at).toLocaleDateString('en-IN') : 'N/A';

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div className="modal-header bg-primary text-white py-3 px-4">
                        <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                            <i className="bx bx-id-card fs-4"></i>
                            <span>Saving Account Details & Member Profile</span>
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4 bg-light">

                        {/* Account Overview Header */}
                        <div className="card border-0 shadow-sm rounded-3 p-3 mb-3 bg-white">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <div>
                                    <span className="text-muted small d-block">Saving Account No</span>
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

                        {/* UPI QR & Digital Banking Section */}
                        {(qrcode_image || virtual_upi_handle || virtual_account_number) && (
                            <div className="card border-0 shadow-sm rounded-3 p-3 mb-3" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)', border: '1.5px solid #0284c7' }}>
                                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                                    <h6 className="fw-bold text-primary mb-0 d-flex align-items-center gap-2">
                                        <i className="bx bx-qr-scan fs-5"></i>
                                        <span>UPI QR & Digital Banking Deposit Details</span>
                                    </h6>
                                    <span className="badge bg-primary text-white px-2.5 py-1">Real-Time Deposit</span>
                                </div>
                                <div className="row align-items-center g-3">
                                    <div className="col-auto text-center">
                                        <div className="bg-white p-2 rounded-3 border shadow-sm d-inline-block">
                                            {qrcode_image ? (
                                                <img
                                                    src={qrcode_image.startsWith('data:') || qrcode_image.startsWith('http') ? qrcode_image : `data:image/png;base64,${qrcode_image}`}
                                                    alt="Saving UPI QR"
                                                    style={{ width: '120px', height: '120px', objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <div style={{ width: '120px', height: '120px' }} className="d-flex align-items-center justify-content-center text-muted small">
                                                    QR Code
                                                </div>
                                            )}
                                        </div>
                                        <div className="small text-primary fw-bold mt-1" style={{ fontSize: '11px' }}>SCAN & PAY</div>
                                    </div>
                                    <div className="col">
                                        <div className="row g-2">
                                            {virtual_account_number && (
                                                <div className="col-sm-6">
                                                    <small className="text-muted d-block">Virtual Account No</small>
                                                    <strong className="text-dark font-monospace">{virtual_account_number}</strong>
                                                </div>
                                            )}
                                            <div className="col-sm-6">
                                                <small className="text-muted d-block">Virtual IFSC Code</small>
                                                <strong className="text-dark font-monospace">{virtual_ifsc || 'ICCH0000001'}</strong>
                                            </div>
                                            <div className="col-12">
                                                <small className="text-muted d-block">UPI VPA Handle</small>
                                                <strong className="text-success font-monospace fs-6">{virtual_upi_handle || `${account_number}@cashbez`}</strong>
                                            </div>
                                        </div>
                                        {qrcode_pdf && (
                                            <div className="mt-2">
                                                <a
                                                    href={qrcode_pdf}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-outline-primary fw-bold"
                                                >
                                                    <i className="bx bx-file me-1"></i> View Official QR PDF
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

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
                                        <i className="bx bx-money me-2"></i>Saving Account Details
                                    </h6>
                                    <div className="mb-2">
                                        <small className="text-muted d-block">Opening Deposit Amount</small>
                                        <strong className="text-dark fs-6">₹{parseFloat(opening_amount || 0).toLocaleString('en-IN')}</strong>
                                    </div>
                                    <div className="mb-2">
                                        <small className="text-muted d-block">Current Available Balance</small>
                                        <strong className="text-success fs-5">₹{parseFloat(current_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                                    </div>
                                    <div className="mb-2">
                                        <small className="text-muted d-block">Interest Rate</small>
                                        <strong className="text-primary">{interest_rate}% p.a.</strong>
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

/* ─────────────────────────────────────────────────────────────
   Saving Account Statement Modal
───────────────────────────────────────────────────────────── */
const AccountStatementModal = ({ isOpen, account, onClose }) => {
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
            service_type: account.service_type || 'SAVING',
            amount: t.amount,
            balance_before: t.balance_before ?? t.pre_balance ?? (isCredit ? (parseFloat(t.balance_after || t.post_balance || 0) - parseFloat(t.amount || 0)) : (parseFloat(t.balance_after || t.post_balance || 0) + parseFloat(t.amount || 0))),
            balance_after: t.balance_after ?? t.post_balance ?? account.current_balance,
            narration: t.narration || t.description || (isWithdrawal ? 'Withdrawal Transaction' : 'Deposit Transaction'),
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
                                <span className="fw-bold fs-5 text-white">Saving Account Statement ({account.account_number})</span>
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
                                        <button type="button" className="btn btn-sm btn-outline-secondary fw-bold" onClick={handleReset}>
                                            Reset
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Statement Header Card */}
                            <div className="border rounded-3 p-3 mb-3 bg-light">
                                <div className="row g-2">
                                    <div className="col-6">
                                        <small className="text-muted d-block">Member Name</small>
                                        <strong className="text-dark">{account.member?.name || 'N/A'}</strong>
                                    </div>
                                    <div className="col-6 text-end">
                                        <small className="text-muted d-block">Current Balance</small>
                                        <strong className="text-success fs-5">₹{parseFloat(account.current_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Statement Table */}
                            {loading ? (
                                <div className="text-center py-4 text-muted">
                                    <i className="bx bx-loader-alt bx-spin fs-3"></i>
                                    <p className="mt-2 mb-0">Loading account statement...</p>
                                </div>
                            ) : txns.length > 0 ? (
                                <div className="table-responsive border rounded-3">
                                    <table className="table table-striped table-hover align-middle mb-0 text-sm">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Date & Time</th>
                                                <th>Transaction ID / Ref</th>
                                                <th>Type</th>
                                                <th>Narration / Details</th>
                                                <th className="text-end">Amount</th>
                                                <th className="text-end">Balance After</th>
                                                <th className="text-center no-print">Receipt</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {txns.map((t, i) => (
                                                <tr key={t.id || i}>
                                                    <td>{t.created_at ? new Date(t.created_at).toLocaleString('en-IN') : 'N/A'}</td>
                                                    <td className="fw-mono text-muted small">{t.transaction_id || t.reference_no || `#${t.id}`}</td>
                                                    <td>
                                                        <span className={`badge ${t.type === 'CREDIT' || t.transaction_type === 'CREDIT' || t.txn_type === 'DEPOSIT' ? 'bg-success' : 'bg-danger'}`}>
                                                            {t.type || t.transaction_type || t.txn_type || 'TXN'}
                                                        </span>
                                                    </td>
                                                    <td className="small">{t.narration || t.description || 'Deposit / Transaction'}</td>
                                                    <td className={`text-end fw-bold ${t.type === 'CREDIT' || t.transaction_type === 'CREDIT' || t.txn_type === 'DEPOSIT' ? 'text-success' : 'text-danger'}`}>
                                                        {t.type === 'CREDIT' || t.transaction_type === 'CREDIT' || t.txn_type === 'DEPOSIT' ? '+' : '-'}₹{parseFloat(t.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="text-end fw-semibold">
                                                        ₹{parseFloat(t.balance_after || t.post_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </td>
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
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-muted border rounded-3 bg-light">
                                    <i className="bx bx-info-circle fs-3 d-block mb-1"></i>
                                    No transactions found for this account.
                                </div>
                            )}
                        </div>

                        <div className="modal-footer bg-light border-0 py-3 px-4 no-print">
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

/* ─────────────────────────────────────────────────────────────
   Saving Account View Component
───────────────────────────────────────────────────────────── */
const SavingAccountView = () => {
    const api = ApiService();
    const [accounts, setAccounts] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modals
    const [showOpenModal, setShowOpenModal] = useState(false);
    const [selectedDetailsAccount, setSelectedDetailsAccount] = useState(null);
    const [selectedStatementAccount, setSelectedStatementAccount] = useState(null);
    const [selectedBondAccount, setSelectedBondAccount] = useState(null);
    const [showMpinModal, setShowMpinModal] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [plans, setPlans] = useState([]);

    // Form State
    const [openForm, setOpenForm] = useState({
        member_id: '',
        plan_id: '',
        plan_name: '',
        opening_amount: '',
        min_amount: 0,
        max_amount: null,
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

    const selectedOpenMember = members.find(m => m.id == openForm.member_id);
    const isOpenKycApproved = selectedOpenMember && String(selectedOpenMember.kyc_status || '').toUpperCase() === 'APPROVED';

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

        const selectedMember = members.find(m => m.id == openForm.member_id);
        if (!selectedMember || String(selectedMember.kyc_status || '').toUpperCase() !== 'APPROVED') {
            return toast.error(`Member KYC is not approved (${selectedMember?.kyc_status || 'PENDING'}). Saving account requires approved KYC with verified bank details.`);
        }

        if (!openForm.plan_id && plans.length > 0) return toast.error('Please select an Account Plan / Type.');

        const amount = parseFloat(openForm.opening_amount || 0);
        if (openForm.min_amount > 0 && amount < openForm.min_amount) {
            return toast.error(`Opening deposit amount must be at least ₹${openForm.min_amount}.`);
        }
        if (openForm.max_amount && amount > openForm.max_amount) {
            return toast.error(`Opening deposit amount cannot exceed ₹${openForm.max_amount}.`);
        }

        setShowMpinModal(true);
    };

    // Open Account MPIN Callback
    const handleMpinConfirm = async (mpinCode) => {
        setSubmitting(true);
        try {
            const res = await api.vPost('/api/agent/financial/saving/open', { ...openForm, mpin: mpinCode });
            if (res.data && res.data.status === 1) {
                toast.success(res.data.message);
                setShowOpenModal(false);
                setShowMpinModal(false);
                fetchSavingAccounts();
                if (res.data.data) {
                    const accData = res.data.data;
                    const selectedMember = members.find(m => m.id == openForm.member_id);
                    setSelectedBondAccount({
                        ...accData,
                        member: selectedMember || accData.member,
                        service_type: 'SAVING'
                    });
                }
            } else {
                toast.error(res.data?.message || 'Account opening failed.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Transaction failed.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom">
                <div>
                    <h3 className="fw-bold text-dark mb-1">
                        <i className="bx bx-wallet-alt text-success me-2"></i> Saving Account Management
                    </h3>
                    <p className="text-muted mb-0">View saving accounts, account statements, details, and print bond certificates</p>
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
                                        <td className="fw-bold text-dark fs-6">₹{parseFloat(acc.current_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        <td><span className="badge bg-success">{acc.status}</span></td>
                                        <td className="text-end">
                                            <button
                                                className="btn btn-sm btn-outline-info me-1 fw-semibold"
                                                onClick={() => setSelectedStatementAccount(acc)}
                                                title="Account Statement"
                                            >
                                                <i className="bx bx-book-open me-1"></i> Statement
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-primary me-1 fw-semibold"
                                                onClick={() => setSelectedDetailsAccount(acc)}
                                                title="Account Details"
                                            >
                                                <i className="bx bx-info-circle me-1"></i> Account Details
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-success fw-semibold"
                                                onClick={() => setSelectedBondAccount({
                                                    service_type: 'SAVING',
                                                    account_number: acc.account_number,
                                                    opening_amount: acc.opening_amount || acc.current_balance,
                                                    current_balance: acc.current_balance,
                                                    interest_rate: acc.interest_rate || 4.0,
                                                    duration_months: acc.duration_months || 0,
                                                    status: acc.status || 'ACTIVE',
                                                    created_at: acc.created_at,
                                                    member: acc.member,
                                                    nominee_name: acc.nominee_name || acc.member?.nominee_name,
                                                    nominee_relation: acc.nominee_relation || acc.member?.nominee_relation
                                                })}
                                                title="Print Saving Account Bond"
                                            >
                                                <i className="bx bx-file me-1"></i> Saving Account Bond
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

            {/* Account Details & Member Profile Modal */}
            <AccountDetailsModal
                isOpen={Boolean(selectedDetailsAccount)}
                account={selectedDetailsAccount}
                onClose={() => setSelectedDetailsAccount(null)}
            />

            {/* Account Statement Modal */}
            <AccountStatementModal
                isOpen={Boolean(selectedStatementAccount)}
                account={selectedStatementAccount}
                onClose={() => setSelectedStatementAccount(null)}
            />

            {/* Saving Account Bond Certificate Modal */}
            <BankAccountBondModal
                isOpen={Boolean(selectedBondAccount)}
                bondData={selectedBondAccount}
                onClose={() => setSelectedBondAccount(null)}
            />

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

                                    {openForm.member_id && selectedOpenMember && (
                                        !isOpenKycApproved ? (
                                            <div className="alert alert-warning border border-warning rounded-3 p-3 mb-3 d-flex align-items-start gap-2 shadow-sm">
                                                <i className="bx bx-error-circle text-warning fs-4 flex-shrink-0 mt-0.5"></i>
                                                <div className="flex-grow-1">
                                                    <div className="fw-bold text-dark">Member KYC Not Approved ({selectedOpenMember.kyc_status || 'PENDING'})</div>
                                                    <div className="small text-secondary mt-1">
                                                        Saving account opening and UPI QR generation require <strong>APPROVED KYC</strong> with verified Aadhaar and Bank Account details.
                                                    </div>
                                                    <Link
                                                        to="/agent/financial/kyc"
                                                        className="btn btn-warning btn-sm fw-bold px-3 mt-2 d-inline-flex align-items-center gap-1 shadow-xs"
                                                    >
                                                        <i className="bx bx-shield-quarter"></i> Complete Member KYC Verification
                                                    </Link>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="alert alert-success border border-success rounded-3 p-2.5 mb-3 d-flex align-items-center gap-2 shadow-sm">
                                                <i className="bx bx-check-shield text-success fs-4 flex-shrink-0"></i>
                                                <div className="small">
                                                    <strong className="text-success d-block">✓ Member KYC Approved</strong>
                                                    <span className="text-muted">Aadhaar & Bank ({selectedOpenMember.bank_name ? `${selectedOpenMember.bank_name} - ` : ''}...{String(selectedOpenMember.account_number || '').slice(-4)}) verified. Official QR will be auto-generated.</span>
                                                </div>
                                            </div>
                                        )
                                    )}

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
                                    <button
                                        type="submit"
                                        className="btn btn-success px-4 fw-bold"
                                        disabled={Boolean(openForm.member_id && !isOpenKycApproved)}
                                    >
                                        OPEN ACCOUNT
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* MPIN Verification Modal */}
            <MpinModal
                isOpen={showMpinModal}
                onClose={() => setShowMpinModal(false)}
                onConfirm={handleMpinConfirm}
                title="Confirm & Open Saving Account"
                serviceTitle="Saving Account Opening"
                planName={openForm.plan_name || "Sugam Bachat"}
                amount={parseFloat(openForm.opening_amount || 0)}
                memberInfo={members.find(m => m.id == openForm.member_id)}
                walletName="Utility Wallet"
                loading={submitting}
            />
        </div>
    );
};

export default SavingAccountView;
