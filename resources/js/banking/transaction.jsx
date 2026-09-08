import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../core/services/ApiService';
import Pageheader from '../layouts/Pageheader';
import { AuthContext } from '../core/hooks/context';

const Transaction = () => {
    const navigate = useNavigate();
    const apiService = ApiService();
    const { userData: user } = useContext(AuthContext);

    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    // Transaction Form States
    const [transactionType, setTransactionType] = useState('CR');
    const [amount, setAmount] = useState('');
    const [narration, setNarration] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    // Summary / History
    const [summary, setSummary] = useState({
        total_credit: '₹0.00',
        total_debit: '₹0.00',
        net_balance: '₹0.00',
        transaction_count: 0,
    });
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const response = await apiService.vGet('/api/accounts/root-accounts');
            if (response?.data?.status === 1) {
                const fetchedAccounts = response.data.data.accounts || [];
                setAccounts(fetchedAccounts);

                const primary = fetchedAccounts.find(acc => acc.is_primary === 1);
                setSelectedAccount(primary ? primary.id : fetchedAccounts[0]?.id || '');
            }
        } catch {
            toast.error('Failed to fetch accounts');
        } finally {
            setPageLoading(false);
        }
    };

    const fetchAccountStatement = async (account_id) => {
        try {
            const response = await apiService.vGet(`/api/accounts/passbook/${account_id}`);
            if (response?.data?.status === 1) {
                setTransactions(response.data.data.transactions || []);
                setSummary(response.data.data.summary);
            }
        } catch {
            toast.error('Failed to fetch account statement');
        }
    };

    /** VALIDATION (Runs only on submit — fast typing) */
    const validateForm = () => {
        const errors = {};
        if (!selectedAccount) errors.account = 'Please select an account';
        if (!amount || parseFloat(amount) <= 0) errors.amount = 'Please enter a valid amount';
        if (!narration.trim()) errors.narration = 'Please enter narration';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /** HANDLE SUBMIT */
    const handleTransaction = async (e) => {
        e.preventDefault();

        // sanitize amount before submit
        const cleanAmount = amount.replace(/[^0-9.]/g, '');
        setAmount(cleanAmount);

        if (!validateForm()) return;

        setLoading(true);
        try {
            const payload = {
                account_id: selectedAccount,
                type: transactionType,
                amount: parseFloat(cleanAmount),
                details: narration,
            };

            const response = await apiService.vPost('/api/accounts/passbook/transaction', payload);

            if (response?.data?.status === 1) {
                toast.success('Transaction successful!');
                setAmount('');
                setNarration('');
                setValidationErrors({});
                fetchAccountStatement(selectedAccount);
                fetchAccounts();
            } else {
                toast.error(response?.data?.message || 'Transaction failed');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Transaction failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <Pageheader
                mainheading="Transaction Manager"
                parentfolder="Banking"
                activepage="Transaction"
            />

            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row g-4">

                        {/* Left Column: Transaction Form */}
                        <div className="col-xl-4 col-lg-5">
                            <div className="card h-100 shadow-sm border-0">

                                <div className="card-header bg-white py-3 border-bottom-0">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="fw-bold text-primary mb-0">
                                            <i className="fas fa-exchange-alt me-2"></i>New Transaction
                                        </h5>

                                        <div>
                                            {user?.role == 1 && <span className="badge bg-danger">Super Admin Mode</span>}
                                            {user?.role == 2 && <span className="badge bg-primary">Admin Mode</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body">
                                    <form onSubmit={handleTransaction}>

                                        {/* Account Selection */}
                                        <div className="mb-4">
                                            <label className="form-label text-muted fw-semibold small">SELECT ACCOUNT</label>
                                            <select
                                                className={`form-select form-select-lg ${validationErrors.account ? 'is-invalid' : ''}`}
                                                value={selectedAccount}
                                                onChange={(e) => setSelectedAccount(e.target.value)}
                                            >
                                                <option value="">Select Account...</option>
                                                {accounts.map(acc => (
                                                    <option key={acc.id} value={acc.id}>
                                                        {acc.company_name} - {acc.user_name} - {acc.available_balance} {acc.is_primary === 1 ? '(Primary)' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            {validationErrors.account && <div className="invalid-feedback">{validationErrors.account}</div>}
                                        </div>

                                        {(user?.role == 1 || user?.role == 2) && (
                                            <div className="mb-4">
                                                <label className="form-label text-muted fw-semibold small">TRANSACTION TYPE</label>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        type="button"
                                                        className={`btn flex-grow-1 py-2 ${transactionType === 'CR' ? 'btn-success text-white' : 'btn-outline-secondary'}`}
                                                        onClick={() => setTransactionType('CR')}
                                                    >
                                                        CREDIT
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`btn flex-grow-1 py-2 ${transactionType === 'DR' ? 'btn-danger text-white' : 'btn-outline-secondary'}`}
                                                        onClick={() => setTransactionType('DR')}
                                                    >
                                                        DEBIT
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Amount (FAST NOW) */}
                                        <div className="mb-4">
                                            <label className="form-label text-muted fw-semibold small">AMOUNT</label>
                                            <div className="input-group input-group-lg">
                                                <span className="input-group-text bg-light border-end-0">₹</span>
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    className={`form-control border-start-0 ps-0 ${validationErrors.amount ? 'is-invalid' : ''}`}
                                                    placeholder="0.00"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}            // FAST — no validation here
                                                    onBlur={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} // sanitize only on blur
                                                />
                                            </div>
                                            {validationErrors.amount && <div className="text-danger small mt-1">{validationErrors.amount}</div>}
                                        </div>

                                        {/* Narration */}
                                        <div className="mb-4">
                                            <label className="form-label text-muted fw-semibold small">NARRATION</label>
                                            <textarea
                                                className={`form-control ${validationErrors.narration ? 'is-invalid' : ''}`}
                                                rows="3"
                                                placeholder="Enter transaction details..."
                                                value={narration}
                                                onChange={(e) => setNarration(e.target.value)}
                                            ></textarea>
                                            {validationErrors.narration && <div className="invalid-feedback">{validationErrors.narration}</div>}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`btn btn-lg w-100 fw-bold ${transactionType === 'CR' ? 'btn-success' : 'btn-danger'}`}
                                        >
                                            {loading ? (
                                                <span><i className="fas fa-spinner fa-spin me-2"></i>Processing...</span>
                                            ) : (
                                                <span>
                                                    <i className="fas fa-paper-plane me-2"></i>
                                                    Process {transactionType === 'CR' ? 'Credit' : 'Debit'}
                                                </span>
                                            )}
                                        </button>
                                    </form>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default Transaction;
