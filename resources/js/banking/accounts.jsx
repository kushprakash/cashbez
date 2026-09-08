import React, { useContext, useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ApiService from '../core/services/ApiService';
import DataTable from '../pages/components/DataTable';
import TableShimmerLoader from '../pages/components/TableShimmerLoader';
import Pageheader from '../layouts/Pageheader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../core/hooks/context';
import { retrieveTokenAndUserData } from '../core/auth/tokenManager';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ApiOutlined } from '@mui/icons-material';

const ListAccounts = () => {
    const { userData: user, logout } = useContext(AuthContext);
    // Helper to determine if user is super admin
    const isSuperAdmin = user && user.role === "1";
    const [accounts, setAccounts] = useState([]);
    const [account, setAccount] = useState({}); // Initialize as object

    // Filter states for accounts list
    const [midFilter, setMidFilter] = useState('');
    const [mobileFilter, setMobileFilter] = useState('');

    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showMpinModal, setShowMpinModal] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [accountDetails, setAccountDetails] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [mpinStep, setMpinStep] = useState(1); // 1: Mobile verification, 2: OTP verification, 3: Set new MPIN
    const [userMobile, setUserMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [newMpin, setNewMpin] = useState('');
    const [confirmMpin, setConfirmMpin] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [mpinLoading, setMpinLoading] = useState(false);
    const [fetchingMobile, setFetchingMobile] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // Create account modal states
    const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountMpin, setNewAccountMpin] = useState('');
    const [creatingAccount, setCreatingAccount] = useState(false);
    const [createAccountErrors, setCreateAccountErrors] = useState({});

    // Primary account confirmation modal states
    const [showPrimaryModal, setShowPrimaryModal] = useState(false);
    const [primaryAccountToSet, setPrimaryAccountToSet] = useState(null);
    const [settingPrimary, setSettingPrimary] = useState(false);

    // Remove primary confirmation modal states
    const [showRemovePrimaryModal, setShowRemovePrimaryModal] = useState(false);
    const [primaryAccountToRemove, setPrimaryAccountToRemove] = useState(null);
    const [removingPrimary, setRemovingPrimary] = useState(false);

    // Self Transfer modal states
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [selectedTargetAccountId, setSelectedTargetAccountId] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [transferMpin, setTransferMpin] = useState('');
    const [transferDetails, setTransferDetails] = useState('');
    const [transferLoading, setTransferLoading] = useState(false);
    const [transferErrors, setTransferErrors] = useState({});

    const apiService = ApiService();

    const handleOpenTransferModalFromPrimary = (primaryAcc) => {
        const nonPrimaryAccounts = accounts.filter(a => !a.is_primary);
        if (nonPrimaryAccounts.length === 0) {
            toast.warning('No secondary/non-primary account available for self transfer.');
            return;
        }
        setSelectedTargetAccountId(nonPrimaryAccounts[0].id);
        setTransferAmount('');
        setTransferMpin('');
        setTransferDetails('');
        setTransferErrors({});
        setShowTransferModal(true);
    };

    const handleCloseTransferModal = () => {
        setShowTransferModal(false);
        setSelectedTargetAccountId('');
        setTransferAmount('');
        setTransferMpin('');
        setTransferDetails('');
        setTransferErrors({});
    };

    // User ID 1 check helper
    const isUserOne = user?.id == 1 || user?.id === "1";

    const handleSelfTransferSubmit = async (e) => {
        if (e) e.preventDefault();
        const errors = {};
        if (!selectedTargetAccountId) {
            errors.target = 'Please select a target account';
        }
        if (!transferAmount || parseFloat(transferAmount) <= 0) {
            errors.amount = 'Please enter a valid amount';
        }
        if (!isUserOne && (!transferMpin || transferMpin.length !== 4)) {
            errors.mpin = 'Please enter valid 4-digit MPIN';
        }
        if (Object.keys(errors).length > 0) {
            setTransferErrors(errors);
            return;
        }

        setTransferLoading(true);
        try {
            const response = await apiService.vPost('/api/accounts/self-transfer', {
                target_account_id: selectedTargetAccountId,
                amount: parseFloat(transferAmount),
                mpin: isUserOne ? (transferMpin || '') : transferMpin,
                details: transferDetails || `Self Transfer from Primary Account`
            });

            if (response.data && response.data.status === 1) {
                toast.success(response.data.message || 'Transfer completed successfully!');
                handleCloseTransferModal();
                fetchAccounts();
                if (account && account.id) {
                    fetchAccountDetails(account, startDate, endDate);
                }
            } else {
                toast.error(response.data?.message || 'Transfer failed');
            }
        } catch (error) {
            console.error('Self transfer error:', error);
            toast.error(error.response?.data?.message || 'Transfer failed');
        } finally {
            setTransferLoading(false);
        }
    };

    // Filter accounts by MID and Mobile Number
    const filteredAccounts = useMemo(() => {
        return accounts.filter(acc => {
            const midMatch = !midFilter || String(acc.mid || '').toLowerCase().includes(midFilter.toLowerCase());
            const mobileMatch = !mobileFilter || String(acc.mobile || '').toLowerCase().includes(mobileFilter.toLowerCase());
            return midMatch && mobileMatch;
        });
    }, [accounts, midFilter, mobileFilter]);

    // DataTable columns definition
    const accountColumns = useMemo(() => [
        {
            Header: 'MID',
            accessor: 'mid',
            Cell: ({ value }) => <code>{value || '-'}</code>,
        },
        {
            Header: 'Mobile',
            accessor: 'mobile',
            Cell: ({ value }) => <span>{value || '-'}</span>,
        },
        {
            Header: 'Account Name',
            accessor: 'name',
            Cell: ({ row }) => (
                <div className="fw-semibold">
                    {row.original.name}
                    {row.original.user_name && row.original.user_name !== user?.name && (
                        <span className="d-block small text-muted">({row.original.user_name})</span>
                    )}
                </div>
            ),
        },
        {
            Header: 'Account Number',
            accessor: 'number',
            Cell: ({ value }) => <code>{value}</code>,
        },
        {
            Header: 'Total Balance',
            accessor: 'balance',
            Cell: ({ value }) => <span className="fw-bold text-dark">{value}</span>,
        },
        {
            Header: 'Hold Balance',
            accessor: 'hold_amount',
            Cell: ({ value }) => <span className="text-muted">{value}</span>,
        },
        {
            Header: 'Available Balance',
            accessor: 'available_balance',
            Cell: ({ value }) => <span className="fw-bold text-success">{value}</span>,
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ value }) => (
                <span className={`badge ${value === 1 ? 'bg-success-transparent text-success' : 'bg-secondary-transparent text-secondary'}`}>
                    {value === 1 ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            Header: 'Actions',
            accessor: 'action',
            disableSortBy: true,
            Cell: ({ row }) => {
                const acc = row.original;
                const isSelected = account && account.id === acc.id;
                return (
                    <div className="text-end">
                        <div className="btn-group btn-group-sm" role="group">
                            {acc.is_primary && (
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => handleOpenTransferModalFromPrimary(acc)}
                                    title="Transfer funds from Primary Account"
                                >
                                    <i className="fa fa-paper-plane me-1"></i>Transfer
                                </button>
                            )}
                            <button
                                className={`btn ${isSelected ? 'btn-success' : 'btn-outline-success'}`}
                                onClick={() => {
                                    setAccount(acc);
                                    fetchAccountDetails(acc, startDate, endDate);
                                }}
                            >
                                <i className="fa fa-book me-1"></i>Passbook
                            </button>
                            <button className="btn btn-outline-secondary" onClick={() => handleChangeMpin(acc)}>
                                <i className="fa fa-key me-1"></i>PIN
                            </button>
                        </div>
                    </div>
                );
            },
        },
    ], [account, user, startDate, endDate]);

    // Transaction states
    const [transactions, setTransactions] = useState([]);
    const [transLoading, setTransLoading] = useState(false);
    const [filters, setFilters] = useState({
        from_date: '',
        to_date: '',
        type: ''
    });


    const fetchAccountDetails = async (targetAccount, filterStart, filterEnd) => {
        try {
            setTransLoading(true);
            const { token } = retrieveTokenAndUserData() || {};

            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                navigate('/signin');
                return;
            }

            const currentAcc = targetAccount || (account && account.id ? account : (accounts.find(acc => acc.is_primary) || accounts[0]));
            if (!currentAcc || !currentAcc.id) {
                setTransLoading(false);
                return;
            }
            setAccount(currentAcc);

            let url = `/api/accounts/${currentAcc.id}`;
            let params = {};
            if (filterStart && filterEnd) {
                params.start_date = filterStart.toISOString().slice(0, 10);
                params.end_date = filterEnd.toISOString().slice(0, 10);
            }

            const response = await apiService.vGet(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params
            });

            if (response.data && response.data.status === 1) {
                setTransactions(response.data.data.recent_transactions || []);
            } else {
                toast.error(response.data?.message || 'Failed to fetch account details');
            }

        } catch (error) {
            console.error('Error fetching account details:', error);
            toast.error('Failed to fetch account details');
        } finally {
            setTransLoading(false);
        }
    };


    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const navigate = useNavigate();
    useEffect(() => {
        fetchAccounts();
    }, []);

    useEffect(() => {
        if (accounts.length > 0) {
            const currentAcc = account && account.id ? account : (accounts.find(acc => acc.is_primary) || accounts[0]);
            if (currentAcc) {
                setAccount(currentAcc);
                fetchAccountDetails(currentAcc, startDate, endDate);
            }
        }
    }, [accounts, startDate, endDate]);


    const fetchAccounts = () => {
        setLoading(true);
        apiService.vGet(`/api/accounts/root-accounts`).then(res => {
            const accountsData = res?.data?.data?.accounts;
            if (Array.isArray(accountsData)) {
                setAccounts(accountsData);
            } else {
                console.error('Accounts data is not an array:', accountsData);
                setAccounts([]);
            }
            setLoading(false);
        }).catch(err => {
            console.error('Failed to fetch accounts:', err);
            toast.error('Failed to fetch accounts');
            setAccounts([]); // Ensure accounts is always an array
            setLoading(false);
        });
    };

    const handleViewAccount = async (account) => {
        // Navigate to the dedicated view account page
        navigate(`/banking/accounts/view/${account.id}`);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedAccount(null);
        setAccountDetails(null);
    };

    const handleChangeMpin = async (account) => {
        setSelectedAccount(account);
        setShowMpinModal(true);
        setMpinStep(1);
        setUserMobile(user.mobile || '');
        setOtp('');
        setNewMpin('');
        setConfirmMpin('');

    };


    const handleSendOtp = async () => {
        if (!userMobile) {
            toast.error('Mobile number not found');
            return;
        }

        setOtpLoading(true);
        try {
            const response = await apiService.vPost('/api/banking-send-otp');

            if (response.data && response.data.status === 1) {
                toast.success('OTP sent successfully');
                setMpinStep(2);
            } else {
                toast.error(response.data.message || 'Failed to send OTP');
            }
        } catch (error) {
            toast.error('Failed to send OTP');
            console.error('Error sending OTP:', error);
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            toast.error('Please enter valid 6-digit OTP');
            return;
        }

        setOtpLoading(true);
        try {
            const response = await apiService.vPost('/api/banking-verify-otp', {
                mobile: userMobile,
                otp: otp,
                account_id: selectedAccount.id
            });

            if (response.data && response.data.status === 1) {
                toast.success('OTP verified successfully');
                setMpinStep(3);
            } else {
                toast.error(response.data.message || 'Invalid OTP');
            }
        } catch (error) {
            toast.error('OTP verification failed');
            console.error('Error verifying OTP:', error);
        } finally {
            setOtpLoading(false);
        }
    };

    const handleUpdateMpin = async () => {
        if (!newMpin || !confirmMpin || newMpin !== confirmMpin || newMpin.length !== 4) {
            toast.error('Please enter valid MPIN');
            return;
        }

        setMpinLoading(true);
        try {
            const response = await apiService.vPost('/api/accounts/update-mpin', {
                account_id: selectedAccount.id,
                newMpin: newMpin,
                confirmMpin: confirmMpin
            });

            if (response.data && response.data.status === 1) {
                toast.success('MPIN updated successfully');
                closeMpinModal();
            } else {
                toast.error(response.data.message || 'Failed to update MPIN');
            }
        } catch (error) {
            toast.error('Failed to update MPIN');
            console.error('Error updating MPIN:', error);
        } finally {
            setMpinLoading(false);
        }
    };

    const closeMpinModal = () => {
        setShowMpinModal(false);
        setSelectedAccount(null);
        setMpinStep(1);
        setUserMobile('');
        setOtp('');
        setNewMpin('');
        setConfirmMpin('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this account?')) {
            return;
        }

        try {
            const res = await apiService.vPost(`/api/accounts/${id}`, {}, true, true, 'delete');
            if (res.data && res.data.status === 1) {
                toast.success('Account deleted successfully');
                fetchAccounts(); // Refresh the list
            } else {
                toast.error(res.data.message || 'Failed to delete account');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to delete account');
        }
    };

    // Create account modal functions
    const handleShowCreateModal = () => {
        setShowCreateAccountModal(true);
        setNewAccountName('');
        setNewAccountMpin('');
        setCreateAccountErrors({});
    };

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
                initial_balance: 0,
                primary_status: accounts.length === 0 // Make primary if it's the first account
            });

            if (response.data && response.data.status === 1) {
                toast.success('Account created successfully!');

                // Refresh accounts list
                fetchAccounts();

                // Close create account modal
                setShowCreateAccountModal(false);
                setNewAccountName('');
                setNewAccountMpin('');
                setCreateAccountErrors({});
            } else {
                toast.error(response.data?.message || 'Failed to create account');
            }
        } catch (error) {
            console.error('Create account error:', error);
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

    const handleMakePrimary = async (account) => {
        if (account.is_primary) {
            toast.info('This account is already your primary account');
            return;
        }

        // Show modal for confirmation
        setPrimaryAccountToSet(account);
        setShowPrimaryModal(true);
    };

    const confirmMakePrimary = async () => {
        if (!primaryAccountToSet) return;

        setSettingPrimary(true);
        try {
            const response = await apiService.vPut(`/api/accounts/${primaryAccountToSet.id}/set-primary`, {});

            if (response.data && response.data.status === 1) {
                toast.success('Account set as primary successfully!');
                fetchAccounts(); // Refresh the list to update primary status
                closePrimaryModal();
            } else {
                toast.error(response.data?.message || 'Failed to set account as primary');
            }
        } catch (error) {
            console.error('Set primary error:', error);
            toast.error(error?.response?.data?.message || 'Failed to set account as primary');
        } finally {
            setSettingPrimary(false);
        }
    };

    const closePrimaryModal = () => {
        setShowPrimaryModal(false);
        setPrimaryAccountToSet(null);
        setSettingPrimary(false);
    };

    const handleRemovePrimary = async (account) => {
        // Check if this is the only account
        const activeAccounts = accounts.filter(acc => acc.status === 1);
        if (activeAccounts.length === 1) {
            toast.warning('Cannot remove primary status. You must have at least one primary account.');
            return;
        }

        // Show modal for confirmation
        setPrimaryAccountToRemove(account);
        setShowRemovePrimaryModal(true);
    };

    const confirmRemovePrimary = async () => {
        if (!primaryAccountToRemove) return;

        setRemovingPrimary(true);
        try {
            const response = await apiService.vPut(`/api/accounts/${primaryAccountToRemove.id}/remove-primary`, {});

            if (response.data && response.data.status === 1) {
                toast.success('Primary status removed successfully!');
                fetchAccounts(); // Refresh the list to update primary status
                closeRemovePrimaryModal();
            } else {
                toast.error(response.data?.message || 'Failed to remove primary status');
            }
        } catch (error) {
            console.error('Remove primary error:', error);
            toast.error(error?.response?.data?.message || 'Failed to remove primary status');
        } finally {
            setRemovingPrimary(false);
        }
    };

    const closeRemovePrimaryModal = () => {
        setShowRemovePrimaryModal(false);
        setPrimaryAccountToRemove(null);
        setRemovingPrimary(false);
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

    const closeCreateAccountModal = () => {
        setShowCreateAccountModal(false);
        setNewAccountName('');
        setNewAccountMpin('');
        setCreateAccountErrors({});
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
            <Pageheader mainheading="Accounts" parentfolder="Banking" activepage="Accounts List"
                buttons={(user.role === "2" && user.is_api_partner === true) && (
                    <>
                        <Link to="/banking/api-merchant/list" className='btn btn-primary'> <ApiOutlined /> All Merchant Report </Link>
                    </>
                )}
            />

            <div className="page-content-box">
                <div className="page-content-box-inner ">
                    {/* Primary Account Section */}
                    {loading ? (
                        <TableShimmerLoader />
                    ) : (
                        <>
                            <div className="row">
                                <div className="col-md-12">
                                    {/* Accounts List Section */}
                                    <div className="card custom-card border-0 shadow-sm mb-4">
                                        <div className="card-header d-flex justify-content-between align-items-center bg-transparent border-bottom">
                                            <div>
                                                <h5 className="mb-0 fw-semibold text-dark">Accounts List</h5>
                                                <small className="text-muted">All accounts associated with your profile</small>
                                            </div>
                                        </div>
                                        <div className="card-body p-3">
                                            {/* MID and Mobile Filters Bar */}
                                            <div className="row g-2 mb-3 align-items-center bg-light p-2 rounded">
                                                <div className="col-md-4">
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text bg-white"><i className="fa fa-id-card text-muted me-1"></i>MID</span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Filter by MID..."
                                                            value={midFilter}
                                                            onChange={(e) => setMidFilter(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text bg-white"><i className="fa fa-phone text-muted me-1"></i>Mobile</span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Filter by Mobile Number..."
                                                            value={mobileFilter}
                                                            onChange={(e) => setMobileFilter(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-4 text-end">
                                                    {(midFilter || mobileFilter) && (
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => { setMidFilter(''); setMobileFilter(''); }}
                                                        >
                                                            <i className="fa fa-refresh me-1"></i>Clear Filters
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {accounts.length === 0 ? (
                                                <div className="p-4 text-center text-muted">No accounts available</div>
                                            ) : (
                                                <DataTable
                                                    columns={accountColumns}
                                                    data={filteredAccounts}
                                                    title="Accounts List"
                                                    showPagination={true}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Passbook / Recent Transactions Section */}
                                    <div className="card custom-card border-0 shadow-sm">
                                        <div className="card-header border-0 bg-transparent">
                                            <div className="row align-items-center mb-2">
                                                <div className="col-auto">
                                                    <label className="text-muted small me-2">Filter by Date:</label>
                                                </div>
                                                <div className="col-auto">
                                                    <DatePicker
                                                        selected={startDate}
                                                        onChange={date => setStartDate(date)}
                                                        selectsStart
                                                        startDate={startDate}
                                                        endDate={endDate}
                                                        placeholderText="Start Date"
                                                        className="form-control form-control-sm"
                                                        maxDate={endDate || new Date()}
                                                    />
                                                </div>
                                                <div className="col-auto">
                                                    <span className="mx-2">to</span>
                                                </div>
                                                <div className="col-auto">
                                                    <DatePicker
                                                        selected={endDate}
                                                        onChange={date => setEndDate(date)}
                                                        selectsEnd
                                                        startDate={startDate}
                                                        endDate={endDate}
                                                        minDate={startDate}
                                                        maxDate={new Date()}
                                                        placeholderText="End Date"
                                                        className="form-control form-control-sm"
                                                    />
                                                </div>
                                                <div className="col-auto">
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary ms-2"
                                                        onClick={() => { setStartDate(null); setEndDate(null); }}
                                                        disabled={!startDate && !endDate}
                                                    >
                                                        Clear
                                                    </button>
                                                </div>

                                                <div className="col-auto ms-auto">
                                                    <button
                                                        className="btn btn-outline-primary btn-sm float-right"
                                                        onClick={() => handleChangeMpin(account)}
                                                        disabled={!account || !account.id}
                                                    >
                                                        <span>Change PIN</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="row mt-2">
                                                <div className="col-md-3">
                                                    <h5 className="card-title mb-1 text-dark fw-semibold">Passbook Transactions</h5>
                                                    <p className="text-muted mb-0 small">Account: <strong>{account?.name || '-'}</strong></p>
                                                </div>
                                                <div className="col-md-2">
                                                    <label className="text-muted small">Account Number</label>
                                                    <h6 className="mb-0 fw-bold">{account?.number || '-'}</h6>
                                                </div>
                                                <div className="col-md-2">
                                                    <label className="text-muted small">Current Balance</label>
                                                    <h5 className="mb-0 fw-bold text-success">{account?.balance || '₹0'}</h5>
                                                </div>
                                                <div className="col-md-2">
                                                    <label className="text-muted small">Hold Amount</label>
                                                    <h6 className="mb-0 fw-bold">{account?.hold_amount || '₹0.00'}</h6>
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="text-muted small">Available Balance</label>
                                                    <h5 className="mb-0 fw-bold text-primary">{account?.available_balance || '₹0'}</h5>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card-body pt-0">
                                            {transLoading ? (
                                                <div className="text-center py-4">
                                                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                                                    <span>Loading Passbook Transactions...</span>
                                                </div>
                                            ) : transactions.length > 0 ? (
                                                <div className="table-responsive">
                                                    <table className="table table-hover">
                                                        <thead>
                                                            <tr>
                                                                <th>Date</th>
                                                                <th>Type</th>
                                                                <th>Details</th>
                                                                <th>Pre</th>
                                                                <th>Amount</th>
                                                                <th>Balance</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {transactions.map((transaction, index) => (
                                                                <tr key={index}>
                                                                    <td>{transaction.date}</td>
                                                                    <td>
                                                                        <span className={`badge ${transaction.type === 'CR' ? 'bg-success-transparent text-success' : 'bg-danger-transparent text-danger'}`}>
                                                                            {transaction.type === 'CR' ? 'Credit' : 'Debit'}
                                                                        </span>
                                                                    </td>
                                                                    <td>{transaction.details || '-'}</td>
                                                                    <td>{transaction.pre_balance || '-'}</td>
                                                                    <td>
                                                                        <span className={transaction.type === 'CR' ? 'text-success' : 'text-danger'}>
                                                                            {transaction.amount}
                                                                        </span>
                                                                    </td>
                                                                    <td>{transaction.balance || '-'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4">
                                                    <div className="mb-3">
                                                        <iconify-icon icon="material-symbols:receipt-long-off" width="48" height="48" className="text-muted"></iconify-icon>
                                                    </div>
                                                    <h6 className="text-muted">No Transactions Found</h6>
                                                    <p className="text-muted small">No recent transactions available for this account.</p>
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

            {/* Account Details Modal */}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeModal}>
                    <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">

                            <div className="modal-body">
                                {modalLoading ? (
                                    <div className="d-flex justify-content-center p-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : accountDetails ? (
                                    <div className="row">
                                        <div className="col-12">
                                            {/* Account Summary Card */}
                                            <div className="card bg-gradient-danger text-white mb-4" style={{ background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' }}>
                                                <div className="card-body p-4">
                                                    <div className="row">
                                                        <div className="col-md-8">
                                                            <h4 className="mb-1">{accountDetails.name}</h4>
                                                            <p className="mb-2 opacity-75">Account Number: {accountDetails.number}</p>
                                                            <div className="d-flex align-items-center mb-3">
                                                                <span className="me-2">A/c balance</span>
                                                                <i className="fa fa-question-circle opacity-75"></i>
                                                            </div>
                                                            <h2 className="mb-0 fw-bold">{accountDetails.balance}</h2>
                                                        </div>
                                                        <div className="col-md-4 text-end">
                                                            <span className={`badge ${accountDetails.status === 1 ? 'bg-success' : 'bg-warning'} fs-6`}>
                                                                {accountDetails.status === 1 ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Account Details */}
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="card border-0 shadow-sm mb-3">
                                                        <div className="card-body">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div className="d-flex align-items-center">
                                                                    <span className="text-muted">Net withdrawal balance</span>
                                                                    <i className="fa fa-question-circle text-muted ms-2"></i>
                                                                </div>
                                                                <span className="fw-bold">{accountDetails.available_balance}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card border-0 shadow-sm mb-3">
                                                        <div className="card-body">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div className="d-flex align-items-center">
                                                                    <span className="text-muted">Overdraft limit (+)</span>
                                                                </div>
                                                                <span className="fw-bold">₹0.00</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card border-0 shadow-sm mb-3">
                                                        <div className="card-body">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div className="d-flex align-items-center">
                                                                    <span className="text-muted">Sweep in balance (+)</span>
                                                                    <i className="fa fa-question-circle text-muted ms-2"></i>
                                                                </div>
                                                                <span className="fw-bold">₹0.00</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card border-0 shadow-sm mb-3">
                                                        <div className="card-body">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div className="d-flex align-items-center">
                                                                    <span className="text-muted">Uncleared funds</span>
                                                                </div>
                                                                <span className="fw-bold">₹0.00</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card border-0 shadow-sm mb-3">
                                                        <div className="card-body">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div className="d-flex align-items-center">
                                                                    <span className="text-muted">Hold funds (-)</span>
                                                                </div>
                                                                <span className="fw-bold">{accountDetails.hold_amount || '₹0.00'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Account Information */}
                                            <div className="card border-0 shadow-sm">
                                                <div className="card-header bg-light">
                                                    <h6 className="mb-0 fw-bold">Account Information</h6>
                                                </div>
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <p className="mb-2"><strong>Full Account Number:</strong> {selectedAccount?.full_number || 'N/A'}</p>
                                                            <p className="mb-2"><strong>Created Date:</strong> {accountDetails.created_at ? new Date(accountDetails.created_at).toLocaleDateString('en-IN') : 'N/A'}</p>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <p className="mb-2"><strong>Raw Balance:</strong> ₹{selectedAccount?.raw_balance?.toFixed(2) || '0.00'}</p>
                                                            <p className="mb-2"><strong>Raw Available Balance:</strong> ₹{selectedAccount?.raw_available_balance?.toFixed(2) || '0.00'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-4">
                                        <p className="text-muted">Failed to load account details</p>
                                    </div>
                                )}

                                <center><button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button></center>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Change MPIN Modal */}
            {showMpinModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeMpinModal}>
                    <div className="modal-dialog modal-sm modal-dialog-scrollable" style={{ marginTop: '20px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header  text-dark">
                                <h6 className="">
                                    <i className="fa fa-key me-2"></i>
                                    Change MPIN
                                </h6>
                                <button type="button" className="btn-close btn-close-sm" onClick={closeMpinModal}></button>
                            </div>
                            <div className="modal-body p-3">
                                {selectedAccount && (
                                    <div className="mb-3">
                                        <div className="alert alert-info py-2">
                                            <strong>Account:</strong><br />
                                            <small>{selectedAccount.name} ({selectedAccount.number})</small>
                                        </div>
                                    </div>
                                )}

                                {mpinStep === 1 && (
                                    <div>
                                        <h6 className="mb-3">Step 1: Mobile Verification</h6>
                                        {fetchingMobile ? (
                                            <div className="d-flex justify-content-center p-3">
                                                <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="mb-3">
                                                    <label className="form-label small">Mobile Number</label>
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text">+91</span>
                                                        <input
                                                            type="tel"
                                                            className="form-control"
                                                            value={userMobile}
                                                            disabled
                                                            style={{ backgroundColor: '#f8f9fa' }}
                                                        />
                                                    </div>
                                                    {!userMobile && (
                                                        <small className="text-danger">Mobile not found</small>
                                                    )}
                                                </div>
                                                <div className="d-grid">
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={handleSendOtp}
                                                        disabled={!userMobile || otpLoading}
                                                    >
                                                        {otpLoading ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-1"></span>
                                                                Sending...
                                                            </>
                                                        ) : (
                                                            'Send OTP'
                                                        )}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {mpinStep === 2 && (
                                    <div>
                                        <h6 className="mb-3">Step 2: OTP Verification</h6>
                                        <div className="alert alert-success py-2">
                                            <small>OTP sent to +91 {userMobile}</small>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small">Enter OTP</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm text-center"
                                                placeholder="6-digit OTP"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                maxLength="6"
                                            />
                                        </div>
                                        <div className="row g-2">
                                            <div className="col-4">
                                                <button
                                                    className="btn btn-outline-secondary btn-sm w-100"
                                                    onClick={() => setMpinStep(1)}
                                                >
                                                    Back
                                                </button>
                                            </div>
                                            <div className="col-8">
                                                <button
                                                    className="btn btn-primary btn-sm w-100"
                                                    onClick={handleVerifyOtp}
                                                    disabled={!otp || otp.length !== 6 || otpLoading}
                                                >
                                                    {otpLoading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-1"></span>
                                                            Verifying...
                                                        </>
                                                    ) : (
                                                        'Verify'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-center mt-2">
                                            <small className="text-muted">
                                                <a href="#" className="text-primary" onClick={handleSendOtp}>Resend OTP</a>
                                            </small>
                                        </div>
                                    </div>
                                )}

                                {mpinStep === 3 && (
                                    <div>
                                        <h6 className="mb-3">Step 3: Set New MPIN</h6>
                                        <div className="alert alert-success py-2">
                                            <small>Mobile verified successfully!</small>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small">New MPIN</label>
                                            <input
                                                type="password"
                                                className="form-control form-control-sm text-center"
                                                placeholder="4-digit MPIN"
                                                value={newMpin}
                                                onChange={(e) => setNewMpin(e.target.value)}
                                                maxLength="4"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small">Confirm MPIN</label>
                                            <input
                                                type="password"
                                                className="form-control form-control-sm text-center"
                                                placeholder="Re-enter MPIN"
                                                value={confirmMpin}
                                                onChange={(e) => setConfirmMpin(e.target.value)}
                                                maxLength="4"
                                            />
                                        </div>
                                        {newMpin && confirmMpin && newMpin !== confirmMpin && (
                                            <div className="alert alert-danger py-2">
                                                <small>MPIN does not match</small>
                                            </div>
                                        )}
                                        <div className="row g-2">
                                            <div className="col-4">
                                                <button
                                                    className="btn btn-outline-secondary btn-sm w-100"
                                                    onClick={() => setMpinStep(2)}
                                                >
                                                    Back
                                                </button>
                                            </div>
                                            <div className="col-8">
                                                <button
                                                    className="btn btn-success btn-sm w-100"
                                                    onClick={handleUpdateMpin}
                                                    disabled={!newMpin || !confirmMpin || newMpin !== confirmMpin || newMpin.length !== 4 || mpinLoading}
                                                >
                                                    {mpinLoading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-1"></span>
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        'Update'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer py-2">
                                <button type="button" className="btn btn-secondary btn-sm" onClick={closeMpinModal}>
                                    Cancel
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
                                <button type="button" className="btn-close" onClick={closeCreateAccountModal}></button>
                            </div>
                            <div className="modal-body">
                                {/* Info Message */}
                                <div className="alert alert-info d-flex align-items-center mb-4">
                                    <i className="fas fa-info-circle me-2"></i>
                                    <small>Create a new banking account to manage your transactions.</small>
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
                                <button type="button" className="btn btn-outline-secondary" onClick={closeCreateAccountModal}>
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

            {/* Primary Account Confirmation Modal */}
            {showPrimaryModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1055 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title d-flex align-items-center">
                                    <i className="fa fa-star me-2"></i>
                                    Set Primary Account
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={closePrimaryModal}
                                    disabled={settingPrimary}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="text-center py-3">
                                    <div className="mb-4">
                                        <i className="fa fa-star text-warning" style={{ fontSize: '3rem' }}></i>
                                    </div>
                                    <h5 className="mb-3">Make Primary Account</h5>
                                    <p className="mb-3">
                                        Are you sure you want to make <strong>"{primaryAccountToSet?.name}"</strong> your primary account?
                                    </p>
                                    <div className="alert alert-info">
                                        <i className="fa fa-info-circle me-2"></i>
                                        This will automatically remove primary status from your current primary account.
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closePrimaryModal}
                                    disabled={settingPrimary}
                                >
                                    <i className="fa fa-times me-1"></i>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={confirmMakePrimary}
                                    disabled={settingPrimary}
                                >
                                    {settingPrimary ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Setting Primary...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa fa-star me-1"></i>
                                            Yes, Make Primary
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove Primary Account Confirmation Modal */}
            {showRemovePrimaryModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1055 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-warning text-dark">
                                <h5 className="modal-title d-flex align-items-center">
                                    <i className="fa fa-star-o me-2"></i>
                                    Remove Primary Status
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeRemovePrimaryModal}
                                    disabled={removingPrimary}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="text-center py-3">
                                    <div className="mb-4">
                                        <i className="fa fa-exclamation-triangle text-warning" style={{ fontSize: '3rem' }}></i>
                                    </div>
                                    <h5 className="mb-3">Remove Primary Status</h5>
                                    <p className="mb-3">
                                        Are you sure you want to remove primary status from <strong>"{primaryAccountToRemove?.name}"</strong>?
                                    </p>
                                    <div className="alert alert-warning">
                                        <i className="fa fa-warning me-2"></i>
                                        You will need to set another account as primary manually.
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeRemovePrimaryModal}
                                    disabled={removingPrimary}
                                >
                                    <i className="fa fa-times me-1"></i>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-warning"
                                    onClick={confirmRemovePrimary}
                                    disabled={removingPrimary}
                                >
                                    {removingPrimary ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Removing...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa fa-star-o me-1"></i>
                                            Yes, Remove Primary
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Self Transfer Modal */}
            {showTransferModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1055 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title d-flex align-items-center">
                                    <i className="fa fa-paper-plane me-2"></i>
                                    Self Transfer Funds
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={handleCloseTransferModal}
                                    disabled={transferLoading}
                                ></button>
                            </div>
                            <form onSubmit={handleSelfTransferSubmit}>
                                <div className="modal-body">
                                    {/* Source Account Info */}
                                    <div className="card bg-light border-0 mb-3">
                                        <div className="card-body p-3">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <span className="text-muted small">From Primary Account:</span>
                                                <span className="badge bg-warning text-dark"><i className="fa fa-star me-1"></i>Primary</span>
                                            </div>
                                            <div className="fw-bold text-dark fs-6">
                                                {accounts.find(a => a.is_primary)?.name || 'Primary Wallet'} ({accounts.find(a => a.is_primary)?.number})
                                            </div>
                                            <div className="small text-success fw-bold mt-1">
                                                Available Balance: {accounts.find(a => a.is_primary)?.balance || '₹0'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Select Target Account */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small">
                                            Transfer To Account <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className={`form-select ${transferErrors.target ? 'is-invalid' : ''}`}
                                            value={selectedTargetAccountId}
                                            onChange={(e) => {
                                                setSelectedTargetAccountId(e.target.value);
                                                if (transferErrors.target) setTransferErrors(prev => ({ ...prev, target: '' }));
                                            }}
                                            required
                                        >
                                            <option value="" disabled>Select Target Account</option>
                                            {accounts.filter(a => !a.is_primary).map(targetAcc => (
                                                <option key={targetAcc.id} value={targetAcc.id}>
                                                    {targetAcc.name} ({targetAcc.number}) - Bal: {targetAcc.balance}
                                                </option>
                                            ))}
                                        </select>
                                        {transferErrors.target && (
                                            <div className="invalid-feedback">{transferErrors.target}</div>
                                        )}
                                    </div>

                                    {/* Amount Input */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small">
                                            Transfer Amount (₹) <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">₹</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                className={`form-control ${transferErrors.amount ? 'is-invalid' : ''}`}
                                                placeholder="Enter amount"
                                                value={transferAmount}
                                                onChange={(e) => {
                                                    setTransferAmount(e.target.value);
                                                    if (transferErrors.amount) setTransferErrors(prev => ({ ...prev, amount: '' }));
                                                }}
                                                required
                                            />
                                            {transferErrors.amount && (
                                                <div className="invalid-feedback">{transferErrors.amount}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* MPIN Input */}
                                    <div className="mb-3" style={{ display: isUserOne ? 'none' : 'block' }}>
                                        <label className="form-label fw-semibold small">
                                            4-Digit MPIN <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text"><i className="fa fa-lock"></i></span>
                                            <input
                                                type="password"
                                                maxLength="4"
                                                className={`form-control text-center ${transferErrors.mpin ? 'is-invalid' : ''}`}
                                                placeholder="••••"
                                                value={transferMpin}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val.length <= 4) {
                                                        setTransferMpin(val);
                                                        if (transferErrors.mpin) setTransferErrors(prev => ({ ...prev, mpin: '' }));
                                                    }
                                                }}
                                                style={{ letterSpacing: '6px', fontSize: '1.1rem' }}
                                                required={!isUserOne}
                                            />
                                            {transferErrors.mpin && (
                                                <div className="invalid-feedback">{transferErrors.mpin}</div>
                                            )}
                                        </div>
                                        <small className="form-text text-muted">
                                            {isUserOne ? 'User ID 1 can transfer without MPIN' : 'Enter your 4-digit security PIN to confirm transfer'}
                                        </small>
                                    </div>

                                    {/* Details / Remarks */}
                                    <div className="mb-2">
                                        <label className="form-label fw-semibold small">Remarks / Details (Optional)</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="e.g. Self transfer from primary"
                                            value={transferDetails}
                                            onChange={(e) => setTransferDetails(e.target.value)}
                                            maxLength="255"
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={handleCloseTransferModal}
                                        disabled={transferLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-sm px-4"
                                        disabled={!transferAmount || (!isUserOne && transferMpin.length !== 4) || !selectedTargetAccountId || transferLoading}
                                    >
                                        {transferLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Transferring...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa fa-paper-plane me-1"></i> Confirm Transfer
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ListAccounts;
