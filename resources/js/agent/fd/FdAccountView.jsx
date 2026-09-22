import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import BankAccountBondModal from '../../components/BankAccountBondModal';
import OpenDepositAccountModal, { calculateMaturity } from '../../components/OpenDepositAccountModal';
import { AuthContext } from '../../core/hooks/context';

/* Account Details & Member Profile Modal */
const AccountDetailsModal = ({ isOpen, account, onClose }) => {
    if (!isOpen || !account) return null;

    const {
        account_number,
        opening_amount,
        interest_rate = 8.5,
        duration_months = 12,
        status = 'ACTIVE',
        created_at,
        member,
        nominee_name,
        nominee_relation,
    } = account;

    const openingDate = created_at ? new Date(created_at).toLocaleDateString('en-IN') : 'N/A';
    const matRes = calculateMaturity('FD', opening_amount, duration_months, interest_rate);

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div className="modal-header bg-danger text-white py-3 px-4">
                        <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                            <i className="bx bx-id-card fs-4"></i>
                            <span>FD Account Details & Member Profile</span>
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4 bg-light">

                        <div className="card border-0 shadow-sm rounded-3 p-3 mb-3 bg-white">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <div>
                                    <span className="text-muted small d-block">Fixed Deposit Account No</span>
                                    <h4 className="fw-bold text-danger mb-0">{account_number}</h4>
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
                            <div className="col-md-6">
                                <div className="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white">
                                    <h6 className="fw-bold text-danger border-bottom pb-2 mb-3">
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

                            <div className="col-md-6">
                                <div className="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white">
                                    <h6 className="fw-bold text-success border-bottom pb-2 mb-3">
                                        <i className="bx bx-money me-2"></i>FD Deposit & Maturity Rules
                                    </h6>
                                    <div className="mb-2">
                                        <small className="text-muted d-block">Principal Deposit Amount</small>
                                        <strong className="text-dark fs-5">₹{parseFloat(opening_amount || 0).toLocaleString('en-IN')}</strong>
                                    </div>
                                    <div className="mb-2">
                                        <small className="text-muted d-block">Interest Rate</small>
                                        <strong className="text-primary">{interest_rate}% p.a.</strong>
                                    </div>
                                    <div className="mb-2">
                                        <small className="text-muted d-block">Tenor Duration</small>
                                        <strong className="text-dark">{duration_months} Months</strong>
                                    </div>
                                    <div className="mb-2">
                                        <small className="text-muted d-block">Estimated Maturity Amount</small>
                                        <strong className="text-success fs-5">₹{matRes.maturity.toLocaleString('en-IN')}</strong>
                                    </div>
                                </div>
                            </div>

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

/* Account Passbook Statement Modal */
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
            service_type: account.service_type || 'FD',
            amount: t.amount,
            balance_before: t.balance_before ?? t.pre_balance ?? (isCredit ? (parseFloat(t.balance_after || t.post_balance || 0) - parseFloat(t.amount || 0)) : (parseFloat(t.balance_after || t.post_balance || 0) + parseFloat(t.amount || 0))),
            balance_after: t.balance_after ?? t.post_balance ?? account.current_balance,
            narration: t.narration || t.description || (isWithdrawal ? 'Withdrawal Transaction' : 'FD Deposit Transaction'),
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
                                <span className="fw-bold fs-5 text-white">FD Passbook Statement ({account.account_number})</span>
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
                                <p className="text-muted small mb-0">Fixed Deposit Passbook Transaction Statement</p>
                                <div className="mt-2 text-start p-2 bg-light rounded border d-flex justify-content-between text-dark small fw-bold flex-wrap gap-2">
                                    <span>Account No: {account.account_number}</span>
                                    <span>Member: {account.member?.name || 'N/A'}</span>
                                    <span>Principal: ₹{parseFloat(account.opening_amount || 0).toLocaleString('en-IN')}</span>
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
                                                    <td className="text-muted">{t.narration || 'FD Deposit'}</td>
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

const FdAccountView = () => {
    const api = ApiService();
    const [accounts, setAccounts] = useState([]);
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

    useEffect(() => {
        fetchAccounts();
    }, [search]);

    return (
        <div className="container-fluid py-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom">
                <div>
                    <h3 className="fw-bold text-dark mb-1">
                        <i className="bx bx-vault text-danger me-2"></i> Fixed Deposit (FD) Accounts
                    </h3>
                    <p className="text-muted mb-0">View FD accounts, check passbook statements, member details, and print deposit bonds</p>
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
                                <th>Est. Total (with Interest)</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4">Loading FD accounts...</td></tr>
                            ) : accounts.length > 0 ? (
                                accounts.map((acc) => {
                                    const principal = parseFloat(acc.opening_amount || 0);
                                    const rate = parseFloat(acc.interest_rate || 8.5);
                                    const months = parseInt(acc.duration_months || 12, 10);
                                    const matRes = calculateMaturity('FD', principal, months, rate);

                                    return (
                                        <tr key={acc.id}>
                                            <td className="fw-bold text-primary">{acc.account_number}</td>
                                            <td className="fw-semibold">{acc.member?.name || 'N/A'}</td>
                                            <td className="fw-bold text-dark">₹{principal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                            <td>
                                                <div>
                                                    <strong className="text-primary fs-6">
                                                        ₹{matRes.maturity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </strong>
                                                    <span className="text-muted d-block small" style={{ fontSize: '0.75rem' }}>
                                                        +₹{matRes.interest.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Interest ({rate}%)
                                                    </span>
                                                    <span className="text-success d-block small fw-semibold" style={{ fontSize: '0.72rem' }}>
                                                        Term: {months} Months
                                                    </span>
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
                                                            setBondData({ ...acc, service_type: 'FD' });
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
                                <tr><td colSpan="6" className="text-center py-4 text-muted">No Fixed Deposit accounts found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Open FD Modal (Exact same as Dashboard) */}
            <OpenDepositAccountModal
                serviceType="FD"
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

export default FdAccountView;
