import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { Link } from 'react-router-dom';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';
import { toast } from 'react-toastify';
import { retrieveTokenAndUserData } from '../../core/auth/tokenManager';
import AddMoveToAccount from './AddMoveToAccount';

const BeneficiaryList = () => {
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [distributors, setDistributors] = useState([]); // State for distributors
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [verificationFilter, setVerificationFilter] = useState('');
    const [activeTab, setActiveTab] = useState('beneficiary'); // 'beneficiary' or 'distributor'
    const { token, user } = retrieveTokenAndUserData() || {};

    // Payment modal states
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null); // Can be beneficiary or distributor
    const [paymentAmount, setPaymentAmount] = useState('');
    const [selectedAccount, setSelectedAccount] = useState('');
    const [selectedChannel, setSelectedChannel] = useState('1');
    const [selectedTxnType, setSelectedTxnType] = useState('NEFT'); // Default to NEFT
    const [mpin, setMpin] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);
    const [accounts, setAccounts] = useState([]);

    // Create account states
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountMpin, setNewAccountMpin] = useState('');
    const [creatingAccount, setCreatingAccount] = useState(false);
    const [createAccountErrors, setCreateAccountErrors] = useState({});

    // Delete related states
    const [deleteOtp, setDeleteOtp] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingBeneficiary, setDeletingBeneficiary] = useState(null);

    // Off-hours timing state
    const [isOffHours, setIsOffHours] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState('');

    useEffect(() => {
        fetchData();
        fetchAccounts();
    }, [searchTerm, verificationFilter]);

    // Off-hours countdown timer
    useEffect(() => {
        const checkOffHours = () => {
            const now = new Date();
            const hour = now.getHours();
            const isOff = hour >= 21 || hour < 9; // 9 PM (21) to 9 AM (9)
            setIsOffHours(isOff);

            if (isOff) {
                // Calculate time until 9 AM
                let target = new Date(now);
                if (hour >= 21) {
                    // After 9 PM, target is 9 AM next day
                    target.setDate(target.getDate() + 1);
                }
                target.setHours(9, 0, 0, 0);

                const diff = target - now;
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
            }
        };

        checkOffHours();
        const interval = setInterval(checkOffHours, 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchAccounts = async () => {
        try {
            const apiService = ApiService();
            const response = await apiService.vGet('/api/accounts');

            if (response.data && response.data.status === 1) {
                const accountsData = response.data.data;
                if (Array.isArray(accountsData)) {
                    setAccounts(accountsData);
                } else if (accountsData && Array.isArray(accountsData.accounts)) {
                    setAccounts(accountsData.accounts);
                } else {
                    setAccounts([]);
                }
            } else {
                setAccounts([]);
            }
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
            setAccounts([]);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const apiService = ApiService();
            // Assuming the API supports search params, though the provided JSON example was static.
            // We'll pass them anyway if the backend supports filtering.
            const params = {
                search: searchTerm,
                // type: 3, // Removed as per new requirement or kept if backend needs it? 
                // The user didn't specify backend changes, so I'll keep generic call or remove if it conflicts.
                // But since the endpoint is specific '/api/movetoaccounts', it might not need 'type: 3'.
                verified: verificationFilter
            };

            const response = await apiService.vGet('/api/movetoaccounts', params);
            const { data } = response;

            if (data.status !== 1) {
                throw new Error(data.message || 'Failed to fetch data');
            }

            // Process Beneficiaries
            let beneficiaryList = (data.data || []).map(b => {
                const user_name = b.user ? b.user.name : '';
                const user_mid = b.user_mid || (b.user ? b.user.mid : '');
                let company_name = '';
                if (user && user.role === "1") {
                    company_name = b.company_name || (b.setting ? b.setting.company_name : '');
                }
                return {
                    ...b,
                    user_name,
                    user_mid,
                    company_name,
                };
            });

            // Filter locally if API doesn't support it (as backup)
            if (searchTerm) {
                const lowerTerm = searchTerm.toLowerCase();
                beneficiaryList = beneficiaryList.filter(b =>
                    (b.name && b.name.toLowerCase().includes(lowerTerm)) ||
                    (b.account && b.account.includes(lowerTerm)) ||
                    (b.bank && b.bank.toLowerCase().includes(lowerTerm))
                );
            }

            setBeneficiaries(beneficiaryList);

            // Process Distributors
            const distributorList = data.distributerData || [];
            // Filter distributors locally
            const filteredDistributors = searchTerm
                ? distributorList.filter(d =>
                    (d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (d.mobile && d.mobile.includes(searchTerm))
                )
                : distributorList;

            setDistributors(filteredDistributors);

        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Payment Logic
    const handlePay = (item, type) => {
        setSelectedItem({ ...item, type }); // type: 'beneficiary' or 'distributor'

        if (accounts.length === 0) {
            setShowCreateAccountModal(true);
        } else {
            setShowPaymentModal(true);
        }
    };

    const handleAmountChange = (e) => {
        const value = (e.target.value || '').replace(/\D/g, '');
        setPaymentAmount(value);
    };

    const handleMpinChange = (e) => {
        const value = (e.target.value || '').replace(/\D/g, '');
        if (value.length <= 4) {
            setMpin(value);
        }
    };

    const handleFinalPayment = async () => {
        if (!selectedAccount) {
            toast.error('Please select an account');
            return;
        }
        if (!mpin || mpin.length !== 4) {
            toast.error('Please enter 4-digit MPIN');
            return;
        }
        if (!paymentAmount || parseInt(paymentAmount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        if (parseInt(paymentAmount) < 1) {
            toast.error('Minimum payment amount is ₹1');
            return;
        }

        // For beneficiary payment, validate transaction type
        if (selectedItem.type === 'beneficiary' && !selectedTxnType) {
            toast.error('Please select a transaction type');
            return;
        }

        // For Distributor Transfer, we need FROM mobile
        if (selectedItem.type === 'distributor' && !user?.mobile) {
            toast.error('User mobile number not found. Cannot proceed with P2P transfer.');
            return;
        }

        setProcessingPayment(true);
        try {
            const apiService = ApiService();
            let response;

            if (selectedItem.type === 'beneficiary') {
                // Beneficiary Payment
                response = await apiService.vPost('/api/v2/beneficiaries/beneficiary-payment', {
                    account_id: selectedAccount,
                    beneficiary_id: selectedItem.id,
                    amount: parseInt(paymentAmount),
                    channel: parseInt(selectedChannel),
                    details: `Payment to ${selectedItem.name} - ${selectedItem.account}`,
                    mpin: mpin,
                    txn_type: selectedTxnType,
                    transaction_id: `BPTXN${selectedItem.id}${Date.now()}`,
                });
            } else {
                // Distributor Payment (P2P)
                // Payload: account_id, mpin, to_user_id, from_mobile, to_mobile, amount
                response = await apiService.vPost('/api/p2p/mobile-transfer', {
                    account_id: parseInt(selectedAccount),
                    mpin: mpin,
                    to_user_id: selectedItem.id,
                    from_mobile: user.mobile,
                    to_mobile: selectedItem.mobile,
                    amount: parseFloat(paymentAmount),
                });
            }

            if (response.data && response.data.status === 1) {
                toast.success('Transfer successful!');
                closePaymentModals();
                fetchAccounts(); // Refresh balance
            } else {
                toast.error(response.data?.message || 'Transfer failed');
            }

        } catch (error) {
            console.error('Payment error:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Payment failed. Please try again.');
            }
        } finally {
            setProcessingPayment(false);
        }
    };

    const closePaymentModals = () => {
        setShowPaymentModal(false);
        setShowCreateAccountModal(false);
        setSelectedAccount('');
        setSelectedChannel('1');
        setSelectedTxnType('NEFT'); // Reset to default NEFT
        setMpin('');
        setPaymentAmount('');
        setSelectedItem(null);
        setNewAccountName('');
        setNewAccountMpin('');
        setCreateAccountErrors({});
    };

    // Account Creation Functions
    const handleNewAccountNameChange = (e) => {
        setNewAccountName(e.target.value);
        if (createAccountErrors.name) setCreateAccountErrors(prev => ({ ...prev, name: '' }));
    };

    const handleNewAccountMpinChange = (e) => {
        const value = (e.target.value || '').replace(/\D/g, '');
        if (value.length <= 4) {
            setNewAccountMpin(value);
            if (createAccountErrors.mpin) setCreateAccountErrors(prev => ({ ...prev, mpin: '' }));
        }
    };

    const handleCreateAccount = async () => {
        const errors = {};
        if (!newAccountName.trim()) errors.name = 'Account name is required';
        if (!newAccountMpin || newAccountMpin.length !== 4) errors.mpin = 'MPIN must be 4 digits';

        if (Object.keys(errors).length > 0) {
            setCreateAccountErrors(errors);
            return;
        }

        setCreatingAccount(true);
        try {
            const apiService = ApiService();
            const response = await apiService.vPost('/api/accounts', {
                name: newAccountName.trim(),
                number: Date.now().toString(),
                mpin: newAccountMpin,
                user_id: user?.id || 1,
                initial_balance: 0
            });

            if (response.data && response.data.status === 1) {
                toast.success('Account created successfully!');
                await fetchAccounts();
                setShowCreateAccountModal(false);
                setNewAccountName('');
                setNewAccountMpin('');
                setCreateAccountErrors({});
                setShowPaymentModal(true);
            } else {
                toast.error(response.data?.message || 'Failed to create account');
            }
        } catch (error) {
            console.error('Account creation error:', error);
            toast.error(error.response?.data?.message || 'Failed to create account');
        } finally {
            setCreatingAccount(false);
        }
    };

    // Delete Logic
    const sendDeleteOtp = async () => {
        try {
            const apiService = ApiService();
            const response = await apiService.vPost('/api/v2/beneficiaries/send-otp', {});
            if (response.data.status === 1) {
                toast.success('OTP sent successfully');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('Failed to send OTP');
        }
    };

    const handleDelete = async (beneficiary) => {
        setDeletingBeneficiary(beneficiary);
        setShowDeleteModal(true);
        await sendDeleteOtp();
    };

    const confirmDelete = async () => {
        if (!deleteOtp || deleteOtp.length !== 6) {
            toast.error('Please enter valid 6-digit OTP');
            return;
        }

        try {
            const apiService = ApiService();
            const response = await apiService.vDelete(`/api/v2/beneficiaries/${deletingBeneficiary.id}`, {
                otp: deleteOtp
            });

            if (response.data.status === 1) {
                toast.success('Beneficiary deleted successfully');
                setShowDeleteModal(false);
                setDeleteOtp('');
                setDeletingBeneficiary(null);
                fetchData();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('Failed to delete beneficiary');
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
            <Pageheader
                mainheading="Move To Bank Account"
                parentfolder="Banking"
                activepage="Move To"
            />

            <div className="page-content-box">
                <div className="page-content-box-inner">



                    <div className="card shadow-sm border-0">
                        {/* Custom Tabs Header */}
                        <div className="d-flex align-items-end px-3 pt-3 border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
                            <button
                                className={`btn fw-bold px-4 py-2 me-n2 ${activeTab === 'beneficiary' ? 'text-white shadow-sm' : 'text-muted'}`}
                                onClick={() => setActiveTab('beneficiary')}
                                style={{
                                    backgroundColor: activeTab === 'beneficiary' ? '#2E8B57' : '#e9ecef', // SeaGreen
                                    borderTopLeftRadius: '10px',
                                    borderTopRightRadius: '25px',
                                    clipPath: activeTab === 'beneficiary' ? 'polygon(0 0, 90% 0, 100% 100%, 0% 100%)' : 'none',
                                    paddingRight: '30px',
                                    zIndex: activeTab === 'beneficiary' ? 3 : 1,
                                    position: 'relative'
                                }}
                            >
                                <i className="fa fa-users me-2"></i> Move To Account
                            </button>
                            <button
                                className={`btn fw-bold px-4 py-2 me-n2 ${activeTab === 'distributor' ? 'text-white shadow-sm' : 'text-muted'}`}
                                onClick={() => setActiveTab('distributor')}
                                style={{
                                    backgroundColor: activeTab === 'distributor' ? '#2E8B57' : '#e9ecef',
                                    borderTopLeftRadius: '10px',
                                    borderTopRightRadius: '25px',
                                    clipPath: activeTab === 'distributor' ? 'polygon(0 0, 90% 0, 100% 100%, 0% 100%)' : 'none',
                                    paddingRight: '30px',
                                    zIndex: activeTab === 'distributor' ? 3 : 1,
                                    position: 'relative',
                                    marginLeft: '-15px'
                                }}
                            >
                                <i className="fa fa-handshake me-2"></i> Transfer To Distributer
                            </button>
                            <button
                                className={`btn fw-bold px-4 py-2 ${activeTab === 'add_account' ? 'text-white shadow-sm' : 'text-muted'}`}
                                onClick={() => setActiveTab('add_account')}
                                style={{
                                    backgroundColor: activeTab === 'add_account' ? '#2E8B57' : '#e9ecef',
                                    borderTopLeftRadius: '10px',
                                    borderTopRightRadius: '25px',
                                    clipPath: activeTab === 'add_account' ? 'polygon(0 0, 90% 0, 100% 100%, 0% 100%)' : 'none',
                                    paddingRight: '30px',
                                    zIndex: activeTab === 'add_account' ? 3 : 1,
                                    position: 'relative',
                                    marginLeft: '-15px'
                                }}
                            >
                                <i className="fa fa-plus me-2"></i> Add Move To Account
                            </button>
                        </div>

                        <div className="card-body bg-light p-3">
                            {activeTab === 'add_account' ? (
                                <AddMoveToAccount
                                    isEmbedded={true}
                                    onSuccess={() => {
                                        setActiveTab('beneficiary');
                                        fetchData();
                                    }}
                                />
                            ) : (
                                loading ? (
                                    <TableShimmerLoader />
                                ) : error ? (
                                    <div className="alert alert-danger">{error}</div>
                                ) : (
                                    <div className="row g-3">
                                        {activeTab === 'beneficiary' ? (
                                            beneficiaries.length > 0 ? (
                                                beneficiaries.map((item, index) => (
                                                    <div key={index} className="col-lg-4 col-md-6">
                                                        <div className="card border-0 shadow-sm h-100 overflow-hidden">
                                                            <div className="card-header bg-primary text-white py-2 px-3 d-flex justify-content-between align-items-center">
                                                                <div className="d-flex align-items-center gap-2 text-truncate">
                                                                    <i className="fa fa-user-circle"></i>
                                                                    <span className="fw-bold text-truncate" title={item.name}>{item.name}</span>
                                                                </div>
                                                                <span className="badge bg-success border border-white text-white d-flex align-items-center gap-1">
                                                                    <i className="fa fa-check-circle"></i> Verified
                                                                </span>

                                                                {/* Delete button hidden for future use
                                                                <button
                                                                    className='btn btn-sm btn-link text-white p-0 ms-2'
                                                                    onClick={() => handleDelete(item)}
                                                                    title="Delete Beneficiary"
                                                                >
                                                                    <i className='fa fa-trash'></i>
                                                                </button>
                                                                */}
                                                            </div>
                                                            <div className="card-body p-3">
                                                                <div className="mb-2">
                                                                    <small className="text-muted d-block">Account Number</small>
                                                                    <span className="fs-5 fw-bold font-monospace text-dark">{item.account}</span>
                                                                </div>
                                                                <div className="mb-2">
                                                                    <small className="text-muted d-block">IFSC Code</small>
                                                                    <span className="fw-semibold text-dark">{item.ifsc}</span>
                                                                </div>
                                                                <div className="mb-2">
                                                                    <small className="text-muted d-block">Bank Name</small>
                                                                    <span className="fw-semibold text-dark">{item.bank || item.bank_name}</span>
                                                                </div>
                                                                <div className="mb-0">
                                                                    <small className="text-muted d-block">Branch</small>
                                                                    <span className="fw-semibold text-dark">{item.branch}</span>
                                                                </div>
                                                            </div>
                                                            <div className="card-footer p-0 border-0">
                                                                <button
                                                                    onClick={() => handlePay(item, 'beneficiary')}
                                                                    className="btn btn-success w-100 rounded-0 py-2 fw-semibold text-uppercase"
                                                                >
                                                                    <i className="fa fa-paper-plane me-2"></i> Transfer
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-12 text-center py-5 text-muted">No beneficiaries found.</div>
                                            )
                                        ) : (
                                            distributors.length > 0 ? (
                                                distributors.map((item, index) => (
                                                    <div key={index} className="col-lg-4 col-md-6">
                                                        <div className="card border-0 shadow-sm h-100 overflow-hidden">
                                                            <div className="card-header bg-info text-white py-2 px-3 d-flex justify-content-between align-items-center">
                                                                <div className="d-flex align-items-center gap-2 text-truncate">
                                                                    <i className="fa fa-user-tie"></i>
                                                                    <span className="fw-bold text-truncate" title={item.name}>{item.name}</span>
                                                                </div>
                                                                <span className="badge bg-light text-dark">Distributor</span>
                                                            </div>
                                                            <div className="card-body p-3">
                                                                <div className="mb-3">
                                                                    <small className="text-muted d-block">Mobile Number</small>
                                                                    <span className="fs-5 fw-bold font-monospace text-dark">
                                                                        {item.mobile}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="card-footer p-0 border-0">
                                                                <button
                                                                    onClick={() => handlePay(item, 'distributor')}
                                                                    className="btn btn-success w-100 rounded-0 py-2 fw-semibold text-uppercase"
                                                                >
                                                                    <i className="fa fa-paper-plane me-2"></i> Transfer
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-12 text-center py-5 text-muted">No distributors found.</div>
                                            )
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1055 }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
                        <div className="modal-content border-0 shadow" style={{ borderRadius: '12px' }}>
                            {/* Header */}
                            <div className="modal-header p-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <div className="d-flex align-items-center">
                                    <div className="d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f0fdf4' }}>
                                        <i className="fas fa-arrow-right-arrow-left" style={{ fontSize: '14px', color: '#16a34a' }}></i>
                                    </div>
                                    <h6 className="mb-0 fw-semibold" style={{ color: '#1e293b', fontSize: '15px' }}>Send Payment</h6>
                                </div>
                                <button type="button" className="btn-close" onClick={closePaymentModals} style={{ fontSize: '12px' }}></button>
                            </div>

                            <div className="modal-body p-3">
                                {/* Beneficiary Details Card */}
                                <div className="mb-3 p-3" style={{ backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div className="d-flex align-items-center mb-2">
                                        <div className="d-flex align-items-center justify-content-center me-2" style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#1e293b' }}>
                                            <i className="fas fa-user" style={{ fontSize: '11px', color: '#fff' }}></i>
                                        </div>
                                        <div className="flex-grow-1 text-truncate">
                                            <div className="fw-semibold text-truncate" style={{ fontSize: '13px', color: '#1e293b' }} title={selectedItem?.name}>{selectedItem?.name || '-'}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>{selectedItem?.type === 'distributor' ? 'Distributor' : 'Beneficiary'}</div>
                                        </div>
                                    </div>
                                    <div className="row g-2" style={{ fontSize: '12px' }}>
                                        {selectedItem?.type === 'distributor' ? (
                                            <div className="col-12">
                                                <span className="text-muted">Mobile:</span>
                                                <span className="fw-bold ms-1 font-monospace" style={{ color: '#1e293b' }}>{selectedItem?.mobile || '-'}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="col-6">
                                                    <span className="text-muted">A/C:</span>
                                                    <span className="fw-bold ms-1 font-monospace" style={{ color: '#1e293b' }}>{selectedItem?.account || '-'}</span>
                                                </div>
                                                <div className="col-6">
                                                    <span className="text-muted">IFSC:</span>
                                                    <span className="fw-bold ms-1 font-monospace" style={{ color: '#1e293b' }}>{selectedItem?.ifsc || '-'}</span>
                                                </div>
                                                <div className="col-6">
                                                    <span className="text-muted">Bank:</span>
                                                    <span className="fw-medium ms-1" style={{ color: '#334155' }}>{selectedItem?.bank || selectedItem?.bank_name || '-'}</span>
                                                </div>
                                                <div className="col-6">
                                                    <span className="text-muted">Branch:</span>
                                                    <span className="fw-medium ms-1" style={{ color: '#334155' }}>{selectedItem?.branch || '-'}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Amount Input */}
                                <div className="mb-3">
                                    <label className="form-label mb-1" style={{ fontSize: '12px', fontWeight: 500, color: '#475569' }}>Amount</label>
                                    <div className="input-group" style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                        <span className="input-group-text border-0 bg-white px-3" style={{ color: '#64748b' }}>₹</span>
                                        <input
                                            type="text"
                                            className="form-control border-0 ps-0"
                                            placeholder="0.00"
                                            value={paymentAmount}
                                            onChange={handleAmountChange}
                                            style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}
                                        />
                                    </div>
                                </div>

                                {selectedItem?.type !== 'distributor' && (
                                    <>
                                        {/* Transaction Type */}
                                        <div className="mb-3">
                                            <label className="form-label mb-2" style={{ fontSize: '12px', fontWeight: 500, color: '#475569' }}>Transfer Mode</label>
                                            <div className="d-flex gap-2">
                                                {['NEFT', 'IMPS', 'RTGS'].map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        className={`btn btn-sm flex-fill py-2 ${selectedTxnType === type ? '' : ''}`}
                                                        style={{
                                                            borderRadius: '6px',
                                                            fontSize: '12px',
                                                            fontWeight: 500,
                                                            border: selectedTxnType === type ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                                                            backgroundColor: selectedTxnType === type ? '#f0fdf4' : '#fff',
                                                            color: selectedTxnType === type ? '#16a34a' : '#64748b'
                                                        }}
                                                        onClick={() => setSelectedTxnType(type)}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Channel */}
                                        <div className="mb-3">
                                            <label className="form-label mb-2" style={{ fontSize: '12px', fontWeight: 500, color: '#475569' }}>Channel</label>
                                            <div className="d-flex gap-2">
                                                {[1, 2, 3].map((channel) => (
                                                    <button
                                                        key={channel}
                                                        type="button"
                                                        className="btn btn-sm flex-fill py-2"
                                                        style={{
                                                            borderRadius: '6px',
                                                            fontSize: '12px',
                                                            fontWeight: 500,
                                                            border: selectedChannel === channel.toString() ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                                                            backgroundColor: selectedChannel === channel.toString() ? '#eff6ff' : '#fff',
                                                            color: selectedChannel === channel.toString() ? '#2563eb' : '#64748b'
                                                        }}
                                                        onClick={() => setSelectedChannel(channel.toString())}
                                                    >
                                                        Ch {channel}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Account Selection */}
                                <div className="mb-3">
                                    <label className="form-label mb-2" style={{ fontSize: '12px', fontWeight: 500, color: '#475569' }}>From Account</label>
                                    {!Array.isArray(accounts) || accounts.length === 0 ? (
                                        <div className="text-center py-4" style={{ backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                                            <i className="fas fa-wallet mb-2" style={{ fontSize: '20px', color: '#94a3b8' }}></i>
                                            <p className="mb-2" style={{ fontSize: '12px', color: '#64748b' }}>No accounts available</p>
                                            <button
                                                type="button"
                                                className="btn btn-sm"
                                                style={{ fontSize: '12px', backgroundColor: '#1e293b', color: '#fff', borderRadius: '6px' }}
                                                onClick={() => { setShowPaymentModal(false); setShowCreateAccountModal(true); }}
                                            >
                                                <i className="fas fa-plus me-1"></i> Add Account
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                                            {accounts.map((account) => (
                                                <div
                                                    key={account.id}
                                                    className="d-flex align-items-center justify-content-between p-2 mb-1"
                                                    style={{
                                                        cursor: 'pointer',
                                                        borderRadius: '6px',
                                                        border: selectedAccount === account.id ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                                                        backgroundColor: selectedAccount === account.id ? '#f0fdf4' : '#fff'
                                                    }}
                                                    onClick={() => setSelectedAccount(account.id)}
                                                >
                                                    <div>
                                                        <div className="fw-medium" style={{ fontSize: '13px', color: '#1e293b' }}>{account.name || 'Account'}</div>
                                                        <div className="font-monospace" style={{ fontSize: '11px', color: '#64748b' }}>{account.number || '-'}</div>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <span className="fw-semibold me-2" style={{ fontSize: '13px', color: '#1e293b' }}>{account.balance || 0}</span>
                                                        {selectedAccount === account.id && (
                                                            <i className="fas fa-check-circle" style={{ fontSize: '14px', color: '#16a34a' }}></i>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* MPIN */}
                                <div className="mb-3">
                                    <label className="form-label mb-1" style={{ fontSize: '12px', fontWeight: 500, color: '#475569' }}>MPIN</label>
                                    <input
                                        type="password"
                                        className="form-control text-center"
                                        placeholder="• • • •"
                                        value={mpin}
                                        onChange={handleMpinChange}
                                        maxLength="4"
                                        style={{ borderRadius: '8px', border: '1px solid #e2e8f0', letterSpacing: '12px', fontSize: '18px', fontWeight: 600, padding: '10px' }}
                                    />
                                </div>

                                {/* Settlement Timing Warning - Only show during off-hours */}
                                {isOffHours && (
                                    <div className="mb-3 p-2" style={{ backgroundColor: '#fffbeb', borderRadius: '6px', border: '1px solid #fde68a' }}>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-start">
                                                <i className="fas fa-clock me-2 mt-1" style={{ fontSize: '12px', color: '#d97706' }}></i>
                                                <div style={{ fontSize: '11px', color: '#92400e', lineHeight: '1.4' }}>
                                                    Transfer will be processed at or after <strong>9 AM</strong>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center" style={{ backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: '4px' }}>
                                                <i className="fas fa-hourglass-half me-1" style={{ fontSize: '10px', color: '#d97706' }}></i>
                                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#b45309', fontFamily: 'monospace' }}>{timeRemaining}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Security Note */}
                                <div className="d-flex align-items-center" style={{ fontSize: '11px', color: '#64748b' }}>
                                    <i className="fas fa-shield-alt me-2" style={{ color: '#16a34a' }}></i>
                                    256-bit SSL encrypted transaction
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="modal-footer px-3" style={{ borderTop: '1px solid #e2e8f0' }}>
                                <button
                                    type="button"
                                    className="btn btn-sm px-3 py-2"
                                    onClick={closePaymentModals}
                                    style={{ fontSize: '13px', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm px-4 py-2"
                                    onClick={handleFinalPayment}
                                    disabled={!selectedAccount || mpin.length !== 4 || processingPayment || !paymentAmount || parseInt(paymentAmount) <= 0}
                                    style={{
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        backgroundColor: '#16a34a',
                                        color: '#fff',
                                        borderRadius: '6px',
                                        border: 'none',
                                        opacity: (!selectedAccount || mpin.length !== 4 || processingPayment || !paymentAmount || parseInt(paymentAmount) <= 0) ? 0.5 : 1
                                    }}
                                >
                                    {processingPayment ? (
                                        <><span className="spinner-border spinner-border-sm me-1" role="status"></span> Processing</>
                                    ) : (
                                        <><i className="fas fa-arrow-right me-1"></i> Send ₹{paymentAmount || '0'}</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Account Modal */}
            {showCreateAccountModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create Wallet Account</h5>
                                <button type="button" className="btn-close" onClick={closePaymentModals}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Account Name</label>
                                    <input
                                        type="text"
                                        className={`form-control ${createAccountErrors.name ? 'is-invalid' : ''}`}
                                        placeholder="e.g. Main Wallet"
                                        value={newAccountName}
                                        onChange={handleNewAccountNameChange}
                                    />
                                    {createAccountErrors.name && <div className="invalid-feedback">{createAccountErrors.name}</div>}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Set MPIN (4 digits)</label>
                                    <input
                                        type="password"
                                        className={`form-control ${createAccountErrors.mpin ? 'is-invalid' : ''}`}
                                        placeholder="Enter 4-digit MPIN"
                                        maxLength={4}
                                        value={newAccountMpin}
                                        onChange={handleNewAccountMpinChange}
                                    />
                                    {createAccountErrors.mpin && <div className="invalid-feedback">{createAccountErrors.mpin}</div>}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closePaymentModals}>Cancel</button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    disabled={creatingAccount}
                                    onClick={handleCreateAccount}
                                >
                                    {creatingAccount ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Delete Beneficiary</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteOtp('');
                                        setDeletingBeneficiary(null);
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete <strong>{deletingBeneficiary?.name}</strong>?</p>
                                <p className="text-muted">An OTP has been sent to your registered mobile number.</p>
                                <div className="mb-3">
                                    <label className="form-label">Enter OTP</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter 6-digit OTP"
                                        value={deleteOtp}
                                        onChange={(e) => setDeleteOtp(e.target.value)}
                                        maxLength={6}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteOtp('');
                                        setDeletingBeneficiary(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={confirmDelete}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BeneficiaryList;
