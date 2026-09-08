import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../core/services/ApiService';
import Pageheader from '../layouts/Pageheader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../core/hooks/context';
import { retrieveTokenAndUserData } from '../core/auth/tokenManager';
import RechargeInvoice from './RechargeInvoice';
import BbpsTopNav from './BbpsTopNav';
import StepHeader from './StepHeader';
import { getBbpsCache, setBbpsCache, preloadIcons } from './bbpsCache';

const DTHRecharge = ({ hideNav = false }) => {
    const [dthAccount, setDthAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedOperator, setSelectedOperator] = useState('');
    const [operators, setOperators] = useState(() => getBbpsCache('dth_operators') || []);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Modal states
    const [showOperatorModal, setShowOperatorModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [mpin, setMpin] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);

    // Create account states
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountMpin, setNewAccountMpin] = useState('');
    const [creatingAccount, setCreatingAccount] = useState(false);
    const [createAccountErrors, setCreateAccountErrors] = useState({});

    // Invoice states
    const [showInvoice, setShowInvoice] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);
    const [lastSuccessfulRecharge, setLastSuccessfulRecharge] = useState(null);

    // Account state
    const [accounts, setAccounts] = useState(() => getBbpsCache('user_accounts') || []);
    const navigate = useNavigate();
    const apiService = ApiService();
    const { userData: user } = useContext(AuthContext);

    // Utility Wallet Account (primary_status == false/0)
    const utilityAccount = accounts.find(acc =>
        acc.primary_status === 0 ||
        acc.primary_status === false ||
        acc.primary_status === '0' ||
        acc.primary_status === 'false' ||
        acc.is_primary === false
    ) || accounts[0];

    useEffect(() => {
        if (utilityAccount && utilityAccount.id) {
            setSelectedAccount(utilityAccount.id);
        }
    }, [accounts]);

    // Fetch accounts from API
    const fetchAccounts = async () => {
        const cached = getBbpsCache('user_accounts');
        if (cached && Array.isArray(cached) && cached.length > 0) {
            setAccounts(cached);
        }
        try {
            const response = await apiService.vGet('/api/accounts');
            if (response.data && response.data.status === 1) {
                const accs = response.data.data.accounts || [];
                setAccounts(accs);
                setBbpsCache('user_accounts', accs);
                const util = accs.find(acc =>
                    acc.primary_status === 0 ||
                    acc.primary_status === false ||
                    acc.primary_status === '0' ||
                    acc.primary_status === 'false' ||
                    acc.is_primary === false
                ) || accs[0];
                if (util) setSelectedAccount(util.id);
            }
        } catch (error) {
            if (!cached) setAccounts([]);
        }
    };

    // Fetch operators from API
    const fetchOperators = async () => {
        const cached = getBbpsCache('dth_operators');
        if (cached && Array.isArray(cached) && cached.length > 0) {
            setOperators(cached);
            return;
        }
        try {
            const response = await apiService.vPost('/api/v2/getOperator', {
                category: 'DTH'
            });

            if (response.data && response.data.status === 1) {
                const ops = response.data.operators || [];
                setOperators(ops);
                setBbpsCache('dth_operators', ops);
                preloadIcons(ops.map(o => o.icon).filter(Boolean));
            } else {
                toast.error(response.data?.message || 'Failed to fetch operators');
            }
        } catch (error) {
            toast.error('Error fetching operators. Please try again.');
        }
    };

    // Fetch accounts and operators on component mount
    useEffect(() => {
        fetchAccounts();
        fetchOperators();
    }, []);

    const handleDthAccountChange = (e) => {
        const value = e.target.value;
        setDthAccount(value);
        if (errors.dthAccount) {
            setErrors(prev => ({ ...prev, dthAccount: '' }));
        }
    };

    const handleAmountChange = (e) => {
        const value = (e.target.value || '').replace(/\D/g, ''); // Remove non-digits
        setAmount(value);
        if (errors.amount) {
            setErrors(prev => ({ ...prev, amount: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!dthAccount.trim()) {
            newErrors.dthAccount = 'DTH account number is required';
        }

        if (!amount || parseInt(amount) <= 0) {
            newErrors.amount = 'Please enter a valid amount';
        } else if (parseInt(amount) < 10) {
            newErrors.amount = 'Minimum recharge amount is ₹10';
        }

        if (!selectedOperator) {
            newErrors.operator = 'Please select an operator';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleProceedToRecharge = () => {
        if (!validateForm()) {
            toast.error('Please fill all required fields');
            return;
        }

        // Check if user has any accounts
        if (accounts.length === 0) {
            setShowCreateAccountModal(true);
        } else {
            setShowPaymentModal(true);
        }
    };

    const handleOperatorSelect = (operator) => {
        setSelectedOperator(operator);
        setShowOperatorModal(false);
        if (errors.operator) {
            setErrors(prev => ({ ...prev, operator: '' }));
        }
    };

    const handleMpinChange = (e) => {
        const value = (e.target.value || '').replace(/\D/g, ''); // Only digits
        if (value.length <= 4) {
            setMpin(value);
        }
    };

    const handleFinalRecharge = async () => {
        const accountToUse = selectedAccount || utilityAccount?.id;
        if (!mpin || mpin.length !== 4) {
            toast.error('Please enter 4-digit MPIN');
            return;
        }

        setProcessingPayment(true);
        try {
            // Create DTH recharge transaction
            const transactionResponse = await apiService.vPost('/api/v2/mobile-recharge', {
                account_id: accountToUse,
                details: `DTH recharge for ${dthAccount} - ${selectedOperator.name}`,
                number: dthAccount,
                operator: selectedOperator.code,
                // circal not passed for DTH as mentioned in requirements
                transaction_id: parseInt(Date.now() / 1000), // Unique transaction ID
                type: 2, // DTH recharge type
                amount: parseInt(amount),
                mpin: mpin
            });

            const respStatus = transactionResponse.data?.status;
            if (transactionResponse.data && (respStatus === 1 || respStatus === 2)) {
                // Prepare invoice data
                const invoiceData = {
                    transaction: transactionResponse.data.transaction || transactionResponse.data.data?.transaction,
                    validation: transactionResponse.data.validation || transactionResponse.data.data?.validation,
                    rechargeDetails: {
                        number: dthAccount,
                        details: `DTH Recharge - ₹${amount}`,
                        planType: 'DTH',
                        validity: 'As per operator',
                        amount: parseInt(amount),
                        talktime: '0.00'
                    },
                    operatorDetails: {
                        operatorname: selectedOperator.name,
                        operator: selectedOperator.code,
                        circalname: 'DTH Service',
                        circal: 'DTH'
                    },
                    timestamp: new Date().toISOString()
                };

                // Set invoice data and show invoice
                setInvoiceData(invoiceData);
                setLastSuccessfulRecharge(invoiceData);
                setShowInvoice(true);

                if (respStatus === 2) {
                    toast.warning(transactionResponse.data.message || 'DTH recharge is pending');
                } else {
                    toast.success(transactionResponse.data.message || 'DTH recharge successful!');
                }
                setShowPaymentModal(false);
                setSelectedAccount('');
                setMpin('');

                // Refresh accounts to show updated balance
                await fetchAccounts();

            } else {
                toast.error(transactionResponse.data?.message || 'Transaction failed');
            }

        } catch (error) {
            console.error('Recharge error:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Recharge failed. Please try again.');
            }
        } finally {
            setProcessingPayment(false);
        }
    };

    const closeModals = () => {
        setShowOperatorModal(false);
        setShowPaymentModal(false);
        setShowCreateAccountModal(false);
        setShowInvoice(false);
        setSelectedAccount('');
        setMpin('');
        setNewAccountName('');
        setNewAccountMpin('');
        setCreateAccountErrors({});
        setInvoiceData(null);
    };

    const handleInvoiceClose = () => {
        setShowInvoice(false);
        setInvoiceData(null);
        // Reset form after closing invoice
        setDthAccount('');
        setAmount('');
        setSelectedOperator('');
    };

    const showLastInvoice = () => {
        if (lastSuccessfulRecharge) {
            setInvoiceData(lastSuccessfulRecharge);
            setShowInvoice(true);
        }
    };

    // Create account functions
    const handleCreateAccount = async () => {
        // Validate inputs
        const errors = {};
        if (!newAccountName.trim()) {
            errors.name = 'Account name is required';
        }
        if (!newAccountMpin || newAccountMpin.length !== 4) {
            errors.mpin = 'MPIN must be 4 digits';
        }
        if (!/^[0-9]{4}$/.test(newAccountMpin)) {
            errors.mpin = 'MPIN must contain only numbers';
        }

        if (Object.keys(errors).length > 0) {
            setCreateAccountErrors(errors);
            return;
        }

        setCreatingAccount(true);
        try {
            // Generate unique account number
            const accountNumber = Date.now().toString();

            // Get current user data from auth
            const { token, user } = retrieveTokenAndUserData() || {};

            const response = await apiService.vPost('/api/accounts', {
                name: newAccountName.trim(),
                number: accountNumber,
                mpin: newAccountMpin,
                user_id: user?.id || 1, // Fallback to 1 if user id not found
                initial_balance: 0
            });

            if (response.data && response.data.status === 1) {
                toast.success('Account created successfully!');

                // Refresh accounts list
                await fetchAccounts();

                // Close create account modal and open payment modal
                setShowCreateAccountModal(false);
                setNewAccountName('');
                setNewAccountMpin('');
                setCreateAccountErrors({});

                // Open payment modal
                setShowPaymentModal(true);
            } else {
                toast.error(response.data?.message || 'Failed to create account');
            }
        } catch (error) {
            console.error('Account creation error:', error);
            if (error.response?.data?.error) {
                // Handle validation errors from server
                setCreateAccountErrors(error.response.data.error);
            } else {
                toast.error(error.response?.data?.message || 'Failed to create account');
            }
        } finally {
            setCreatingAccount(false);
        }
    };

    const handleNewAccountNameChange = (e) => {
        setNewAccountName(e.target.value);
        if (createAccountErrors.name) {
            setCreateAccountErrors(prev => ({ ...prev, name: '' }));
        }
    };

    const handleNewAccountMpinChange = (e) => {
        const value = (e.target.value || '').replace(/\D/g, ''); // Only digits
        if (value.length <= 4) {
            setNewAccountMpin(value);
            if (createAccountErrors.mpin) {
                setCreateAccountErrors(prev => ({ ...prev, mpin: '' }));
            }
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <>
            {!hideNav && <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />}
            {!hideNav && <BbpsTopNav activeTab="dth" />}
            <div className={hideNav ? "page-content-box p-0 mt-0 pt-0 bg-transparent shadow-none" : "page-content-box mt-0 pt-0"}>
                <div className="page-content-box-inner">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card">
                                <StepHeader title="DTH Recharge" subtitle="DTH Recharge Services" icon={<i className="fas fa-satellite-dish fa-2x text-primary"></i>} />
                                <div className="card-body p-4">
                                    <div className="row">
                                        <div className="col-lg-8 col-md-10 mx-auto">


                                            <form className="row">
                                                <div className="mb-4 col-md-12">
                                                    <label htmlFor="dthAccount" className="form-label">
                                                        DTH Account Number <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="input-group input-group-lg">
                                                        <span className="input-group-text">
                                                            <i className="fas fa-satellite-dish text-primary"></i>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            id="dthAccount"
                                                            value={dthAccount}
                                                            onChange={handleDthAccountChange}
                                                            className={`form-control ${errors.dthAccount ? 'is-invalid' : ''}`}
                                                            placeholder="Enter DTH account number"
                                                        />
                                                        {errors.dthAccount && (
                                                            <div className="invalid-feedback">{errors.dthAccount}</div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mb-4 col-md-12">
                                                    <label htmlFor="amount" className="form-label">
                                                        Recharge Amount <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="input-group input-group-lg">
                                                        <span className="input-group-text">
                                                            <i className="fas fa-rupee-sign text-primary"></i>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            id="amount"
                                                            value={amount}
                                                            onChange={handleAmountChange}
                                                            className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                                                            placeholder="Enter amount"
                                                        />
                                                        {errors.amount && (
                                                            <div className="invalid-feedback">{errors.amount}</div>
                                                        )}
                                                    </div>
                                                    <small className="form-text text-muted mt-2">
                                                        <i className="fas fa-info-circle me-1"></i>
                                                        Minimum recharge amount is ₹10
                                                    </small>
                                                </div>

                                                <div className="mb-4 col-md-12">
                                                    <label className="form-label">
                                                        Select Operator <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="input-group input-group-lg">
                                                        <span className="input-group-text">
                                                            <i className="fas fa-broadcast-tower text-primary"></i>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            value={selectedOperator ? selectedOperator.name : ''}
                                                            className={`form-control ${errors.operator ? 'is-invalid' : ''}`}
                                                            placeholder="Click to select operator"
                                                            readOnly
                                                            onClick={() => setShowOperatorModal(true)}
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-primary"
                                                            onClick={() => setShowOperatorModal(true)}
                                                        >
                                                            <i className="fas fa-search"></i>
                                                        </button>
                                                        {errors.operator && (
                                                            <div className="invalid-feedback">{errors.operator}</div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="col-12">
                                                    <div className="d-flex justify-content-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={handleProceedToRecharge}
                                                            disabled={loading}
                                                            className="btn btn-primary btn-lg"
                                                        >
                                                            {loading ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                    Processing...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="fas fa-credit-card me-2"></i>
                                                                    Proceed to Recharge
                                                                </>
                                                            )}
                                                        </button>

                                                        {lastSuccessfulRecharge && (
                                                            <button
                                                                type="button"
                                                                onClick={showLastInvoice}
                                                                className="btn btn-outline-success btn-lg"
                                                            >
                                                                <i className="fas fa-receipt me-1"></i>
                                                                View Last Invoice
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Operator Selection Modal */}
            {showOperatorModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-primary">
                                    <i className="fas fa-broadcast-tower me-2"></i>
                                    Select DTH Operator
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModals}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row g-3">
                                    {operators.map((operator) => (
                                        <div key={operator.id} className="col-md-4 col-sm-6">
                                            <div
                                                className="card h-100 operator-card"
                                                onClick={() => handleOperatorSelect(operator)}
                                                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                            >
                                                <div className="card-body text-center p-3">
                                                    {operator.icon && (
                                                        <img
                                                            src={operator.icon}
                                                            alt={operator.name}
                                                            className="mb-2"
                                                            style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                                                        />
                                                    )}
                                                    <h6 className="fw-bold mb-1">{operator.name}</h6>
                                                    <small className="text-muted">{operator.label || operator.code}</small>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {operators.length === 0 && (
                                        <div className="col-12">
                                            <div className="text-center py-4">
                                                <i className="fas fa-broadcast-tower fa-2x text-muted mb-3"></i>
                                                <h6 className="text-muted">No operators available</h6>
                                                <small className="text-muted">Please try again later</small>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1055 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-success">
                                    <i className="fas fa-credit-card me-2"></i>
                                    Complete Payment
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModals}></button>
                            </div>
                            <div className="modal-body">
                                <div className="text-center mb-4">
                                    <h3 className="fw-bold text-success mb-1">{formatCurrency(amount)}</h3>
                                    <small className="text-muted">DTH Recharge Amount</small>
                                </div>

                                <div className="card bg-light border-0 mb-4">
                                    <div className="card-body">
                                        <h6 className="fw-semibold mb-2">Recharge Details:</h6>
                                        <div className="row g-3 mb-3">
                                            <div className="col-6">
                                                <small className="text-muted">DTH Account</small>
                                                <div className="fw-semibold">{dthAccount}</div>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted">Operator</small>
                                                <div className="fw-semibold">{selectedOperator?.name}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Utility Wallet Summary Card (Auto-selected non-primary wallet) */}
                                <div className="card border border-primary-subtle rounded-3 bg-light p-3 mb-4 shadow-sm">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="rounded-circle p-2 bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                                <i className="fas fa-wallet fa-lg"></i>
                                            </div>
                                            <div>
                                                <h6 className="mb-0 fw-bold text-dark">{utilityAccount?.name || 'Utility Wallet'}</h6>
                                                <small className="text-muted font-monospace">{utilityAccount?.number || 'Utility Account'}</small>
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Available Balance</small>
                                            <span className="fw-bold text-success" style={{ fontSize: '1.15rem' }}>
                                                {formatCurrency(utilityAccount?.balance ?? utilityAccount?.available_balance ?? 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Enter MPIN <span className="text-danger">*</span></label>
                                    <div className="input-group input-group-lg">
                                        <span className="input-group-text">
                                            <i className="fas fa-lock text-primary"></i>
                                        </span>
                                        <input
                                            type="password"
                                            className="form-control text-center"
                                            placeholder="••••"
                                            value={mpin}
                                            onChange={handleMpinChange}
                                            maxLength="4"
                                            style={{ letterSpacing: '8px', fontSize: '1.2rem' }}
                                        />
                                    </div>
                                    <small className="form-text text-muted">
                                        <i className="fas fa-info-circle me-1"></i>
                                        Enter your 4-digit Mobile PIN
                                    </small>
                                </div>

                                <div className="alert alert-info d-flex align-items-center">
                                    <i className="fas fa-shield-alt me-2"></i>
                                    <small>Your transaction is secured with 256-bit SSL encryption</small>
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button type="button" className="btn btn-outline-secondary" onClick={closeModals}>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success px-4"
                                    onClick={handleFinalRecharge}
                                    disabled={!selectedAccount || mpin.length !== 4 || processingPayment}
                                >
                                    {processingPayment ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-check me-2"></i>
                                            Confirm Recharge
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Account Modal */}
            {showCreateAccountModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1055 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-primary">
                                    <i className="fas fa-plus-circle me-2"></i>
                                    Create New Account
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModals}></button>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-info d-flex align-items-center mb-4">
                                    <i className="fas fa-info-circle me-2"></i>
                                    <small>You need an account to proceed with the recharge. Please create one below.</small>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Account Name <span className="text-danger">*</span></label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="fas fa-user text-primary"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className={`form-control ${createAccountErrors.name ? 'is-invalid' : ''}`}
                                            placeholder="Enter account name"
                                            value={newAccountName}
                                            onChange={handleNewAccountNameChange}
                                            maxLength="255"
                                        />
                                        {createAccountErrors.name && (
                                            <div className="invalid-feedback">{createAccountErrors.name}</div>
                                        )}
                                    </div>
                                    <small className="form-text text-muted mt-1">
                                        <i className="fas fa-info-circle me-1"></i>
                                        Choose a name for your account (e.g., "Main Account", "Savings")
                                    </small>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Set MPIN <span className="text-danger">*</span></label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="fas fa-lock text-primary"></i>
                                        </span>
                                        <input
                                            type="password"
                                            className={`form-control text-center ${createAccountErrors.mpin ? 'is-invalid' : ''}`}
                                            placeholder="••••"
                                            value={newAccountMpin}
                                            onChange={handleNewAccountMpinChange}
                                            maxLength="4"
                                            style={{ letterSpacing: '8px', fontSize: '1.2rem' }}
                                        />
                                        {createAccountErrors.mpin && (
                                            <div className="invalid-feedback">{createAccountErrors.mpin}</div>
                                        )}
                                    </div>
                                    <small className="form-text text-muted mt-1">
                                        <i className="fas fa-shield-alt me-1"></i>
                                        Set a 4-digit PIN for secure transactions
                                    </small>
                                </div>

                                <div className="alert alert-warning d-flex align-items-center">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    <small>Remember your MPIN. It will be required for all transactions.</small>
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button type="button" className="btn btn-outline-secondary" onClick={closeModals}>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary px-4"
                                    onClick={handleCreateAccount}
                                    disabled={!newAccountName.trim() || newAccountMpin.length !== 4 || creatingAccount}
                                >
                                    {creatingAccount ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-plus me-2"></i>
                                            Create Account
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Modal */}
            <RechargeInvoice
                invoiceData={invoiceData}
                show={showInvoice}
                onClose={handleInvoiceClose}
            />

            <style jsx>{`
                .operator-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
            `}</style>
        </>
    );
};

export default DTHRecharge;
