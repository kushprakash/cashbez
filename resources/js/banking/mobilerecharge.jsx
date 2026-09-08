import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../core/services/ApiService';
import Pageheader from '../layouts/Pageheader';
import { retrieveTokenAndUserData } from '../core/auth/tokenManager';
import RechargeInvoice from './RechargeInvoice';
import BbpsTopNav from './BbpsTopNav';
import StepHeader from './StepHeader';
import { getBbpsCache, setBbpsCache } from './bbpsCache';

const MobileRecharge = ({ hideNav = false }) => {
    const [mobileNumber, setMobileNumber] = useState('');
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [operatorDetails, setOperatorDetails] = useState(null);
    const [operatorLogo, setOperatorLogo] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPlans, setShowPlans] = useState(false);
    const [planLoading, setPlanLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchReadOnly, setIsSearchReadOnly] = useState(true);
    const [selectedPlanType, setSelectedPlanType] = useState('all');

    // Manual Recharge states
    const [isManualMode, setIsManualMode] = useState(false);
    const [manualOperator, setManualOperator] = useState('2');
    const [manualCircle, setManualCircle] = useState('5');
    const [manualAmount, setManualAmount] = useState('');

    const [operatorsList, setOperatorsList] = useState([
        { code: '2', name: 'Airtel' },
        { code: '11', name: 'JIO' },
        { code: '23', name: 'Vodafone Idea' },
        { code: '5', name: 'BSNL SPECIAL' },
        { code: '4', name: 'BSNL' }
    ]);

    const [circlesList, setCirclesList] = useState([
        { code: '5', name: 'Bihar & Jharkhand' },
        { code: '1', name: 'Delhi NCR' },
        { code: '2', name: 'Mumbai' },
        { code: '3', name: 'Kolkata' },
        { code: '4', name: 'Maharashtra & Goa' },
        { code: '6', name: 'West Bengal' },
        { code: '7', name: 'Uttar Pradesh (East)' },
        { code: '8', name: 'Uttar Pradesh (West)' },
        { code: '9', name: 'Gujarat' },
        { code: '10', name: 'Punjab' },
        { code: '11', name: 'Rajasthan' },
        { code: '12', name: 'Madhya Pradesh & CG' },
        { code: '13', name: 'Karnataka' },
        { code: '14', name: 'Tamil Nadu' },
        { code: '15', name: 'Andhra Pradesh & Telangana' },
        { code: '16', name: 'Kerala' },
        { code: '17', name: 'Haryana' },
        { code: '18', name: 'Himachal Pradesh' },
        { code: '19', name: 'Assam' },
        { code: '20', name: 'North East' },
        { code: '21', name: 'Odisha' },
        { code: '22', name: 'Jammu & Kashmir' }
    ]);

    // Modal states
    const [showPlanConfirmModal, setShowPlanConfirmModal] = useState(false);
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

    // Account state - will be populated from API
    const [accounts, setAccounts] = useState(() => getBbpsCache('user_accounts') || []);
    const navigate = useNavigate();
    const apiService = ApiService();

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

    const fetchOperatorsAndCircles = async () => {
        try {
            const opRes = await apiService.vPost('/api/v2/getOperator', { category: 'MobilePrepaid' });
            if (opRes.data && opRes.data.status === 1 && Array.isArray(opRes.data.operators) && opRes.data.operators.length > 0) {
                const ops = opRes.data.operators.map(o => ({
                    code: String(o.code),
                    name: o.name,
                    icon: o.icon || o.biller_icon
                }));
                setOperatorsList(ops);
            }
        } catch (e) { }

        try {
            const cirRes = await apiService.vGet('/api/v2/getCircles');
            if (cirRes.data && cirRes.data.status === 1 && Array.isArray(cirRes.data.circles) && cirRes.data.circles.length > 0) {
                const cirs = cirRes.data.circles.map(c => ({
                    code: String(c.code),
                    name: c.name
                }));
                setCirclesList(cirs);
            }
        } catch (e) { }
    };

    // Fetch accounts, operators, and circles on component mount
    useEffect(() => {
        fetchAccounts();
        fetchOperatorsAndCircles();
    }, []);

    // Ensure plans is always an array
    const safePlans = Array.isArray(plans) ? plans : [];

    // Group plans by type
    const groupedPlans = safePlans.reduce((acc, plan) => {
        const type = plan?.type || 'Other';
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(plan);
        return acc;
    }, {});

    // Filter plans based on search and type
    const filteredPlans = safePlans.filter(plan => {
        if (!plan) return false;
        const detailsStr = String(plan.details || '').toLowerCase();
        const amountStr = String(plan.amount || '');
        const matchesSearch = detailsStr.includes(searchQuery.toLowerCase()) ||
            amountStr.includes(searchQuery);

        let matchesType = true;
        if (selectedPlanType !== 'all') {
            if (selectedPlanType === null) {
                // Filter for plans with null type (Other category)
                matchesType = plan.type === null;
            } else {
                // Exact match for specific plan type
                matchesType = plan.type === selectedPlanType;
            }
        }

        return matchesSearch && matchesType;
    });

    const handleMobileNumberChange = (e) => {
        const value = (e.target.value || '').replace(/\D/g, ''); // Remove non-digits
        if (value.length <= 10) {
            setMobileNumber(value);
            if (errors.mobileNumber) {
                setErrors(prev => ({ ...prev, mobileNumber: '' }));
            }
        }
    };

    const validateMobileNumber = () => {
        if (!mobileNumber) {
            setErrors(prev => ({ ...prev, mobileNumber: 'Mobile number is required' }));
            return false;
        }
        if (mobileNumber.length !== 10) {
            setErrors(prev => ({ ...prev, mobileNumber: 'Mobile number must be 10 digits' }));
            return false;
        }
        if (!/^[6-9]/.test(mobileNumber)) {
            setErrors(prev => ({ ...prev, mobileNumber: 'Invalid mobile number format' }));
            return false;
        }
        return true;
    };

    const fetchMobilePlans = async () => {
        if (!validateMobileNumber()) {
            toast.error('Please enter a valid mobile number');
            return;
        }

        setPlanLoading(true);
        try {
            const response = await apiService.vPost('/api/v2/mobile-plan', {
                number: mobileNumber
            });

            if (response.data && response.data.status === 1) {
                const rawPlanData = response.data.data?.plan || {};
                let parsedPlans = [];

                if (Array.isArray(rawPlanData)) {
                    parsedPlans = rawPlanData.map(p => ({
                        amount: p.rs !== undefined ? p.rs : (p.amount || 0),
                        validity: p.validity || 'NA',
                        details: p.desc || p.details || '',
                        talktime: p.talktime || '0.00',
                        type: p.type || 'Other',
                        planstatus: p.planstatus || 'Active',
                        raw: p
                    }));
                } else if (typeof rawPlanData === 'object' && rawPlanData !== null) {
                    Object.entries(rawPlanData).forEach(([category, categoryPlans]) => {
                        if (Array.isArray(categoryPlans)) {
                            categoryPlans.forEach(p => {
                                parsedPlans.push({
                                    amount: p.rs !== undefined ? p.rs : (p.amount || 0),
                                    validity: p.validity || 'NA',
                                    details: p.desc || p.details || '',
                                    talktime: p.talktime || '0.00',
                                    type: category,
                                    planstatus: p.planstatus || 'Active',
                                    raw: p
                                });
                            });
                        }
                    });
                }

                setPlans(parsedPlans);

                const opName = response.data.data?.operatorname || 'Airtel';
                const opCode = String(response.data.data?.operator || '2');
                const cirName = response.data.data?.circalname || 'Bihar & Jharkhand';
                const cirCode = String(response.data.data?.circal || '5');

                setOperatorDetails({
                    operatorname: opName,
                    operator: opCode,
                    circalname: cirName,
                    circal: cirCode
                });

                if (opCode) setManualOperator(opCode);
                if (cirCode) setManualCircle(cirCode);

                setOperatorLogo(response.data.data?.logo || 'https://cdn.bitrefill.com/content/cn/b_rgb%3AFFFFFF%2Cc_pad%2Ch_720%2Cw_1280/v1557745925/airtel.webp');
                await fetchAccounts();
                setSearchQuery('');
                setIsSearchReadOnly(true);
                setShowPlans(true);

                if (parsedPlans.length === 0) {
                    toast.info('Plans API returned no plans. Please enter recharge amount manually below.');
                } else {
                    toast.success('Plans loaded successfully');
                }
            } else {
                setPlans([]);
                setOperatorDetails({
                    operatorname: 'Airtel',
                    operator: manualOperator || '2',
                    circalname: 'Bihar & Jharkhand',
                    circal: manualCircle || '5'
                });
                setShowPlans(true);
                toast.info('Plans API unavailable. Please select operator, circle & amount manually below.');
            }
        } catch (error) {
            setPlans([]);
            setOperatorDetails({
                operatorname: 'Airtel',
                operator: manualOperator || '2',
                circalname: 'Bihar & Jharkhand',
                circal: manualCircle || '5'
            });
            setShowPlans(true);
            toast.info('Plans API error. Please select operator, circle & amount manually below.');
        } finally {
            setPlanLoading(false);
        }
    };

    const handleManualProceed = () => {
        if (!validateMobileNumber()) {
            toast.error('Please enter a valid 10-digit mobile number');
            return;
        }
        if (!manualAmount || parseInt(manualAmount) <= 0) {
            toast.error('Please enter a valid recharge amount');
            return;
        }

        const selectedOpObj = operatorsList.find(o => o.code === manualOperator) || { code: manualOperator, name: manualOperator };
        const selectedCirObj = circlesList.find(c => c.code === manualCircle) || { code: manualCircle, name: manualCircle };

        setSelectedPlan({
            amount: parseInt(manualAmount),
            details: `Manual Mobile Recharge (₹${manualAmount})`,
            type: 'Topup',
            validity: 'As per operator',
            talktime: manualAmount
        });

        setOperatorDetails({
            operator: selectedOpObj.code,
            operatorname: selectedOpObj.name,
            circal: selectedCirObj.code,
            circalname: selectedCirObj.name
        });

        if (utilityAccount && utilityAccount.id) {
            setSelectedAccount(utilityAccount.id);
        }
        setShowPaymentModal(true);
    };



    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
        if (utilityAccount && utilityAccount.id) {
            setSelectedAccount(utilityAccount.id);
        }
        setShowPaymentModal(true);
    };

    const handleChangeNumber = () => {
        setShowPlans(false);
        setPlans([]);
        setSelectedPlan(null);
        setOperatorDetails(null);
        setOperatorLogo('');
        setMobileNumber('');
        setSearchQuery('');
        setIsSearchReadOnly(true);
        setSelectedPlanType('all');
    };

    const handleProceedToRecharge = () => {
        if (!selectedPlan) {
            toast.error('Please select a plan to proceed');
            return;
        }
        setShowPlanConfirmModal(true);
    };

    const handleConfirmPlan = () => {
        // Check if user has any accounts before proceeding to payment
        if (accounts.length === 0) {
            setShowPlanConfirmModal(false);
            setShowCreateAccountModal(true);
            return;
        }

        setShowPlanConfirmModal(false);
        setShowPaymentModal(true);
        // Clear search query when opening payment modal
        setSearchQuery('');
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

            // total 26 digit txnid
            const prefix = "ECW"; // 3 chars
            const ts = Date.now().toString(); // 13
            const rand = Math.random().toString(36).substring(2, 12); // 10

            const txnid = (prefix + ts + rand).slice(0, 26);
            // Create debit transaction for recharge amount
            const transactionResponse = await apiService.vPost('/api/v2/mobile-recharge', {
                account_id: accountToUse,
                details: `Mobile recharge for ${mobileNumber} - ${selectedPlan.details}`,
                number: mobileNumber,
                operator: operatorDetails.operator,
                circal: operatorDetails.circal,
                transaction_id: txnid, // Unique transaction ID
                type: 1,    //Mobile recharge && 2 for DTH Recharge
                amount: selectedPlan.amount,
                mpin: mpin
            });

            const respStatus = transactionResponse.data?.status;
            if (transactionResponse.data && (respStatus === 1 || respStatus === 2)) {
                const resData = transactionResponse.data.data || {};

                // Fallback transaction data
                const transaction = {
                    transaction_id: resData.transaction?.transaction_id || resData.orderId || resData.txnId || 'N/A',
                    passbook_id: resData.transaction?.passbook_id || 'N/A',
                    previous_balance: resData.transaction?.previous_balance || resData.validation?.balance || '0.00',
                    new_balance: resData.transaction?.new_balance || resData.validation?.remaining_balance || '0.00',
                    status: respStatus,
                    message: transactionResponse.data.message || resData.transaction?.message || resData.resText || '',
                };

                // Fallback validation data
                const validation = {
                    account_id: resData.validation?.account_id || '',
                    account_name: resData.validation?.account_name || 'Wallet',
                    account_number: resData.validation?.account_number || 'N/A',
                    balance: resData.validation?.balance || '0.00',
                    available_balance: resData.validation?.available_balance || 0,
                    transaction_amount: resData.validation?.transaction_amount || selectedPlan.amount || 0,
                    remaining_balance: resData.validation?.remaining_balance || 0,
                    validated_at: resData.validation?.validated_at || new Date().toISOString(),
                };

                // Prepare invoice data
                const invoiceData = {
                    transaction,
                    validation,
                    rechargeDetails: {
                        number: mobileNumber,
                        details: selectedPlan.details,
                        planType: selectedPlan.type,
                        validity: selectedPlan.validity,
                        amount: selectedPlan.amount,
                        talktime: selectedPlan.talktime
                    },
                    operatorDetails: operatorDetails,
                    timestamp: new Date().toISOString()
                };

                // Set invoice data and show invoice
                setInvoiceData(invoiceData);
                setLastSuccessfulRecharge(invoiceData);
                setShowInvoice(true);

                if (respStatus === 2) {
                    toast.warning(transactionResponse.data.message || 'Recharge is pending');
                } else {
                    toast.success(transactionResponse.data.message || 'Recharge successful!');
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
        setShowPlanConfirmModal(false);
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
        // Reset to initial state after closing invoice
        handleChangeNumber();
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

                // Open payment modal if we were coming from plan confirmation
                if (selectedPlan) {
                    setShowPaymentModal(true);
                }
            } else {
                toast.error(response.data?.message || 'Failed to create account');
            }
        } catch (error) {

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

    // Get unique plan types for filter - properly handle null values
    const planTypes = ['all', ...new Set(safePlans.map(plan => plan?.type))];



    const getAccountBalanceNum = (acc) => {
        if (!acc) return 0;
        if (typeof acc.raw_balance === 'number') return acc.raw_balance;
        if (typeof acc.raw_available_balance === 'number') return acc.raw_available_balance;
        if (typeof acc.balance === 'number') return acc.balance;
        const cleanStr = String(acc.balance || acc.available_balance || '0').replace(/[^0-9.-]+/g, '');
        return parseFloat(cleanStr) || 0;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (!showPlans) {
        return (
            <>
                {!hideNav && <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />}
                {!hideNav && <BbpsTopNav activeTab="recharge" />}

                <div className={hideNav ? "page-content-box p-0 mt-0 pt-0 bg-transparent shadow-none" : "page-content-box mt-0 pt-0"}>
                    <div className="page-content-box-inner p-0">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="card">
                                    <StepHeader title="Mobile Recharge" subtitle="Prepaid Mobile Recharge Services" icon={<i className="fas fa-mobile-alt fa-2x text-primary"></i>} />
                                    <div className="card-body p-4">
                                        <div className="row">
                                            <div className="col-lg-8 col-md-10 mx-auto">
                                                <div className="row">
                                                    {/* Mobile Number Field */}
                                                    <div className="mb-4 col-md-12">
                                                        <label htmlFor="mobileNumber" className="form-label fw-semibold">
                                                            Mobile Number <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="input-group input-group-lg">
                                                            <span className="input-group-text">
                                                                <i className="fas fa-phone text-primary"></i>
                                                            </span>
                                                            <input
                                                                type="tel"
                                                                id="mobileNumber"
                                                                value={mobileNumber}
                                                                onChange={handleMobileNumberChange}
                                                                className={`form-control ${errors.mobileNumber ? 'is-invalid' : ''}`}
                                                                placeholder="Enter 10-digit mobile number"
                                                                maxLength="10"
                                                            />
                                                            {errors.mobileNumber && (
                                                                <div className="invalid-feedback">{errors.mobileNumber}</div>
                                                            )}
                                                        </div>
                                                        <small className="form-text text-muted mt-2">
                                                            <i className="fas fa-info-circle me-1"></i>
                                                            Enter a valid 10-digit Indian mobile number
                                                        </small>
                                                    </div>

                                                    <div className="col-12 mt-2">
                                                        <div className="d-flex justify-content-center gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={fetchMobilePlans}
                                                                disabled={planLoading || !mobileNumber}
                                                                className="btn btn-primary btn-lg px-4"
                                                            >
                                                                {planLoading ? (
                                                                    <>
                                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                        Loading Plans...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <i className="fas fa-search me-2"></i>
                                                                        View Available Plans
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
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {!hideNav && <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />}
            {!hideNav && <BbpsTopNav activeTab="recharge" />}
            <div className={hideNav ? "page-content-box p-0 mt-0 pt-0 bg-transparent shadow-none" : "page-content-box mt-0 pt-0"}>
                <div className="page-content-box-inner">
                    <div className="row">
                        {/* Mobile Number and Operator Details */}
                        <div className="col-12">
                            <div className="card mb-4">
                                <div className="card-body p-4">
                                    <div className="row align-items-center">
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center">
                                                <div className="me-3">
                                                    <div className="bg-primary rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                                        <i className="fas fa-mobile-alt fa-lg text-white"></i>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h5 className="mb-1 fw-bold text-primary">{mobileNumber}</h5>
                                                    <button
                                                        onClick={handleChangeNumber}
                                                        className="btn btn-sm btn-outline-primary"
                                                    >
                                                        <i className="fas fa-edit me-1"></i>
                                                        Change Number
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            {operatorDetails && (
                                                <div className="d-flex align-items-center justify-content-md-end">
                                                    {operatorLogo && (
                                                        <img
                                                            src={operatorLogo}
                                                            alt={operatorDetails.operatorname}
                                                            className="me-3"
                                                            style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                                                        />
                                                    )}
                                                    <div>
                                                        <h6 className="mb-1 fw-bold text-primary">{operatorDetails.operatorname}</h6>
                                                        <small className="text-muted">
                                                            <i className="fas fa-map-marker-alt me-1"></i>
                                                            {operatorDetails.circalname}
                                                        </small>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Conditional View: Manual Form when plans are empty vs Plans List */}
                        {safePlans.length === 0 ? (
                            <div className="col-12">
                                <div className="card shadow-sm border-0 mb-4">
                                    <div className="card-header bg-light py-3 border-bottom">
                                        <h5 className="mb-0 fw-semibold text-primary">
                                            <i className="fas fa-edit me-2"></i>
                                            Manual Recharge Entry
                                        </h5>
                                    </div>
                                    <div className="card-body p-4">
                                        <div className="alert alert-info d-flex align-items-center mb-4">
                                            <i className="fas fa-info-circle fa-lg me-3 text-info"></i>
                                            <div>
                                                Plans are currently unavailable for this operator. Please select operator, circle, enter recharge amount and proceed.
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="mb-4 col-md-6">
                                                <label className="form-label fw-semibold">
                                                    Select Operator <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    className="form-select form-select-lg"
                                                    value={manualOperator}
                                                    onChange={(e) => setManualOperator(e.target.value)}
                                                >
                                                    {operatorsList.map(op => (
                                                        <option key={op.code} value={op.code}>{op.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="mb-4 col-md-6">
                                                <label className="form-label fw-semibold">
                                                    Select Circle <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    className="form-select form-select-lg"
                                                    value={manualCircle}
                                                    onChange={(e) => setManualCircle(e.target.value)}
                                                >
                                                    {circlesList.map(cir => (
                                                        <option key={cir.code} value={cir.code}>{cir.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="mb-4 col-md-12">
                                                <label className="form-label fw-semibold">
                                                    Recharge Amount <span className="text-danger">*</span>
                                                </label>
                                                <div className="input-group input-group-lg">
                                                    <span className="input-group-text fw-bold">
                                                        Rs
                                                    </span>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        placeholder="Enter amount (e.g. 299)"
                                                        value={manualAmount}
                                                        onChange={(e) => setManualAmount(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-12 text-end">
                                                <button
                                                    type="button"
                                                    onClick={handleManualProceed}
                                                    disabled={!manualAmount || parseInt(manualAmount) <= 0}
                                                    className="btn btn-success btn-lg px-4 fw-semibold shadow-sm"
                                                >
                                                    <i className="fas fa-credit-card me-2"></i>
                                                    Proceed to Recharge
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Search Bar */}
                                <div className="col-12">
                                    <div className="card mb-3">
                                        <div className="card-body py-3">
                                            <div className="input-group">
                                                <span className="input-group-text">
                                                    <i className="fas fa-search text-muted"></i>
                                                </span>
                                                <input
                                                    type="search"
                                                    name="search_plan_no_autofill"
                                                    id="search_plan_no_autofill"
                                                    className="form-control"
                                                    placeholder="Search for a plan, eg 349 or 28..."
                                                    value={searchQuery}
                                                    readOnly={isSearchReadOnly}
                                                    onFocus={() => setIsSearchReadOnly(false)}
                                                    onBlur={() => {
                                                        if (!searchQuery) setIsSearchReadOnly(true);
                                                    }}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    autoComplete="new-password"
                                                    autoCorrect="off"
                                                    autoCapitalize="off"
                                                    spellCheck="false"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Plans List - Full Width */}
                                <div className="col-md-12">
                                    <div className="card">
                                        <div className="card-header d-flex justify-content-between align-items-center rounded-top">
                                            <span className="d-flex align-items-center">
                                                <i className="fas fa-list me-2" style={{ fontSize: '1.3rem' }}></i>
                                                <h5 className="mb-0 fw-semibold">Available Plans</h5>
                                            </span>
                                            <span className="badge bg-primary fs-6">
                                                {filteredPlans.length} Plans
                                            </span>
                                        </div>
                                        <div className="card-body p-4">
                                            {/* Dynamic Plan Categories - Auto Generated from API Response */}
                                            <div className="plan-categories-container mb-4">
                                                <div className="plan-categories-scroll" style={{
                                                    overflowX: 'auto',
                                                    scrollbarWidth: 'none',
                                                    msOverflowStyle: 'none',
                                                    WebkitOverflowScrolling: 'touch',
                                                    paddingBottom: '8px'
                                                }}>
                                                    <div className="d-flex gap-3 pb-2" style={{ minWidth: 'max-content', paddingLeft: '4px', paddingRight: '4px' }}>
                                                        {/* Always show "All Plans" button first */}
                                                        <button
                                                            className={`btn ${selectedPlanType === 'all' ? 'btn-primary' : 'btn-outline-primary'} rounded-pill flex-shrink-0 plan-category-btn`}
                                                            onClick={() => setSelectedPlanType('all')}
                                                            style={{
                                                                fontWeight: '600',
                                                                fontSize: '0.875rem',
                                                                padding: '8px 20px',
                                                                whiteSpace: 'nowrap',
                                                                transition: 'all 0.3s ease',
                                                                minWidth: '80px'
                                                            }}
                                                        >
                                                            <i className="fas fa-list me-1"></i>
                                                            All Plans
                                                        </button>

                                                        {/* Dynamic buttons based on actual plan types from API */}
                                                        {planTypes.length > 1 ? (
                                                            planTypes.filter(type => type !== 'all').map((type) => {
                                                                // Get plan count for this type
                                                                const planCount = safePlans.filter(plan =>
                                                                    type === null ? plan?.type === null : plan?.type === type
                                                                ).length;



                                                                if (planCount === 0) return null; // Don't show button if no plans

                                                                // Configure button appearance based on type
                                                                const getTypeConfig = (planType) => {
                                                                    switch (planType) {
                                                                        case 'SpecialOffer':
                                                                        case 'All-rounder packs':
                                                                            return {
                                                                                label: planType,
                                                                                icon: 'fas fa-star',
                                                                                colorClass: 'success',
                                                                                borderColor: '#e8f5e8'
                                                                            };
                                                                        case 'Data':
                                                                            return {
                                                                                label: 'Data',
                                                                                icon: 'fas fa-wifi',
                                                                                colorClass: 'info',
                                                                                borderColor: '#e3f2fd'
                                                                            };
                                                                        case 'Topup':
                                                                        case 'Talktime':
                                                                            return {
                                                                                label: planType,
                                                                                icon: 'fas fa-phone-alt',
                                                                                colorClass: 'warning',
                                                                                borderColor: '#fff3cd'
                                                                            };
                                                                        case 'Unlimited':
                                                                            return {
                                                                                label: 'Unlimited',
                                                                                icon: 'fas fa-infinity',
                                                                                colorClass: 'primary',
                                                                                borderColor: '#e3f2fd'
                                                                            };
                                                                        case 'Roaming':
                                                                            return {
                                                                                label: 'Roaming',
                                                                                icon: 'fas fa-globe',
                                                                                colorClass: 'secondary',
                                                                                borderColor: '#e2e3e5'
                                                                            };
                                                                        case 'Plan Voucher':
                                                                            return {
                                                                                label: 'Plan Voucher',
                                                                                icon: 'fas fa-ticket-alt',
                                                                                colorClass: 'dark',
                                                                                borderColor: '#e2e3e5'
                                                                            };
                                                                        case 'Voice':
                                                                            return {
                                                                                label: 'Voice',
                                                                                icon: 'fas fa-headset',
                                                                                colorClass: 'danger',
                                                                                borderColor: '#f8d7da'
                                                                            };
                                                                        case null:
                                                                            return {
                                                                                label: 'Other',
                                                                                icon: 'fas fa-question-circle',
                                                                                colorClass: 'secondary',
                                                                                borderColor: '#e2e3e5'
                                                                            };
                                                                        default:
                                                                            return {
                                                                                label: planType || 'Unknown',
                                                                                icon: 'fas fa-mobile-alt',
                                                                                colorClass: 'primary',
                                                                                borderColor: '#e3f2fd'
                                                                            };
                                                                    }
                                                                };

                                                                const config = getTypeConfig(type);
                                                                const isSelected = selectedPlanType === type;

                                                                return (
                                                                    <button
                                                                        key={type || 'null'}
                                                                        className={`btn ${isSelected ? `btn-${config.colorClass}` : `btn-outline-${config.colorClass}`} rounded-pill flex-shrink-0 plan-category-btn`}
                                                                        onClick={() => setSelectedPlanType(type)}
                                                                        style={{
                                                                            fontWeight: '600',
                                                                            fontSize: '0.875rem',
                                                                            padding: '8px 20px',
                                                                            whiteSpace: 'nowrap',
                                                                            transition: 'all 0.3s ease',
                                                                            minWidth: '90px'
                                                                        }}
                                                                    >
                                                                        <i className={`${config.icon} me-1`}></i>
                                                                        {config.label}
                                                                        <span className="badge bg-light text-dark ms-2" style={{ fontSize: '0.7rem' }}>
                                                                            {planCount}
                                                                        </span>
                                                                    </button>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className="text-muted small">
                                                                <i className="fas fa-info-circle me-1"></i>
                                                                Loading categories...
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <style jsx>{`
                                            .plan-categories-scroll::-webkit-scrollbar {
                                                display: none;
                                            }
                                            .plan-category-btn:hover {
                                                transform: translateY(-1px);
                                            }
                                            .plan-category-btn:active {
                                                transform: translateY(0);
                                            }
                                        `}</style>
                                            </div>

                                            {/* Grid Layout for Plans */}
                                            <div className="row g-3" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                                {filteredPlans.map((plan, index) => (
                                                    <div key={index} className="col-md-3 col-sm-6" >
                                                        <div
                                                            className={`card h-100 ${selectedPlan?.amount === plan.amount && selectedPlan?.details === plan.details
                                                                ? 'border-primary' : ''
                                                                }`}
                                                            onClick={() => handlePlanSelect(plan)}
                                                            style={{
                                                                cursor: 'pointer',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                        >
                                                            <div className="card-body p-3" style={{ border: '1px solid #eee' }}>
                                                                {/* Plan Type Badge */}
                                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                                    <span className={`badge ${plan.type === 'SpecialOffer' ? 'bg-success' :
                                                                        plan.type === 'Data' ? 'bg-info' :
                                                                            plan.type === 'Topup' ? 'bg-warning text-dark' :
                                                                                'bg-secondary'
                                                                        }`}>
                                                                        {plan.type || 'Other'}
                                                                    </span>
                                                                    {plan.validity !== 'NA days' && (
                                                                        <small className="text-muted">
                                                                            <i className="fas fa-clock me-1"></i>
                                                                            {plan.validity}
                                                                        </small>
                                                                    )}
                                                                </div>

                                                                {/* Plan Amount */}
                                                                <div className="text-center mb-3">
                                                                    <h4 className="fw-bold text-primary mb-0">
                                                                        {formatCurrency(plan.amount)}
                                                                    </h4>
                                                                    {plan.talktime !== '0.00' && (
                                                                        <small className="text-success">
                                                                            <i className="fas fa-phone me-1"></i>
                                                                            Talktime: ₹{plan.talktime}
                                                                        </small>
                                                                    )}
                                                                </div>

                                                                {/* Plan Details */}
                                                                <p className="card-text small text-muted" style={{
                                                                    fontSize: '0.85rem',
                                                                    lineHeight: '1.4',
                                                                    height: '60px',
                                                                    overflow: 'hidden',
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 3,
                                                                    WebkitBoxOrient: 'vertical'
                                                                }}>
                                                                    {plan.details}
                                                                </p>

                                                                {/* Select Button */}
                                                                <div className="d-grid mt-auto">
                                                                    <button className="btn btn-outline-primary btn-sm">
                                                                        <i className="fas fa-check me-1"></i>
                                                                        Select Plan
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {filteredPlans.length === 0 && (
                                                    <div className="col-12">
                                                        <div className="text-center py-5">
                                                            <i className="fas fa-search fa-2x text-muted mb-3"></i>
                                                            <h6 className="text-muted">No plans found</h6>
                                                            <small className="text-muted">Try adjusting your search or filter criteria</small>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Plan Confirmation Modal */}
            {showPlanConfirmModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-primary">
                                    <i className="fas fa-check-circle me-2"></i>
                                    Confirm Recharge Plan
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModals}></button>
                            </div>
                            <div className="modal-body">
                                {selectedPlan && (
                                    <>
                                        <div className="text-center mb-4">
                                            <div className="bg-light rounded-circle p-3 d-inline-flex mb-3">
                                                <i className="fas fa-mobile-alt fa-2x text-primary"></i>
                                            </div>
                                            <h4 className="fw-bold text-primary">{formatCurrency(selectedPlan.amount)}</h4>
                                            <span className={`badge ${selectedPlan.type === 'SpecialOffer' ? 'bg-success' :
                                                selectedPlan.type === 'Data' ? 'bg-info' :
                                                    selectedPlan.type === 'Topup' ? 'bg-warning' :
                                                        'bg-secondary'
                                                }`}>
                                                {selectedPlan.type || 'Other'}
                                            </span>
                                        </div>

                                        <div className="card bg-light border-0 mb-4">
                                            <div className="card-body">
                                                <h6 className="fw-semibold mb-2">Recharge Details:</h6>
                                                <div className="row g-3 mb-3">
                                                    <div className="col-6">
                                                        <small className="text-muted">Mobile Number</small>
                                                        <div className="fw-semibold">{mobileNumber}</div>
                                                    </div>
                                                    <div className="col-6">
                                                        <small className="text-muted">Operator</small>
                                                        <div className="fw-semibold">{operatorDetails?.operatorname}</div>
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <small className="text-muted">Plan Description</small>
                                                    <div className="fw-medium">{selectedPlan.details}</div>
                                                </div>
                                                <div className="row g-3">
                                                    {selectedPlan.validity !== 'NA days' && (
                                                        <div className="col-6">
                                                            <small className="text-muted">Validity</small>
                                                            <div className="fw-semibold text-success">{selectedPlan.validity}</div>
                                                        </div>
                                                    )}
                                                    {selectedPlan.talktime !== '0.00' && (
                                                        <div className="col-6">
                                                            <small className="text-muted">Talktime</small>
                                                            <div className="fw-semibold text-success">₹{selectedPlan.talktime}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button type="button" className="btn btn-outline-secondary" onClick={closeModals}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary px-4" onClick={handleConfirmPlan}>
                                    <i className="fas fa-arrow-right me-2"></i>
                                    Continue to Payment
                                </button>
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
                                {/* Amount Summary */}
                                <div className="text-center mb-4">
                                    <h3 className="fw-bold text-success mb-1">{formatCurrency(selectedPlan?.amount)}</h3>
                                    <small className="text-muted">Recharge Amount</small>
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
                                                {formatCurrency(getAccountBalanceNum(utilityAccount))}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* MPIN Input */}
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

                                {/* Security Note */}
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
                                {/* Info Message */}
                                <div className="alert alert-info d-flex align-items-center mb-4">
                                    <i className="fas fa-info-circle me-2"></i>
                                    <small>You need an account to proceed with the recharge. Please create one below.</small>
                                </div>

                                {/* Account Name Input */}
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

                                {/* MPIN Input */}
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

                                {/* Security Note */}
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

            <ToastContainer position="top-right" />
        </>
    );
};

export default MobileRecharge;
