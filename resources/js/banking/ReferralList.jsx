import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../core/services/ApiService';
import Pageheader from '../layouts/Pageheader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../core/hooks/context';
import { retrieveTokenAndUserData } from '../core/auth/tokenManager';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './ReferralList.css';

const ReferralList = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [referralData, setReferralData] = useState({});
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedLevelUsers, setSelectedLevelUsers] = useState([]);
    const [period, setPeriod] = useState('all');
    const [businessDataLoading, setBusinessDataLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDashboardData, setUserDashboardData] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(false);
    const apiService = ApiService();
    const { user } = useContext(AuthContext);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    useEffect(() => {
        fetchReferralData();
        // eslint-disable-next-line
    }, [period]);

    
    const fetchReferralData = async () => {
        try {
            setLoading(true);
            const { token } = retrieveTokenAndUserData() || {};

            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                navigate('/signin');
                return;
            }

            const response = await apiService.vGet('/api/referrals', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    period: period,
                    business_data: true
                }
            });

            if (response.data && response.data.status === 1) {
                setReferralData(response.data.data || {});
            } else {
                toast.error(response.data?.message || 'Failed to fetch referral data');
            }

        } catch (error) {
            console.error('Error fetching referral data:', error);
            toast.error('Failed to fetch referral data');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDashboard = async (userMid) => {
        try {
            setDashboardLoading(true);
            const { token } = retrieveTokenAndUserData() || {};

            const response = await apiService.vGet('/api/referral-user-dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    user_mid: userMid,
                    period: period
                }
            });

            if (response.data && response.data.status === 1) {
                setUserDashboardData(response.data.data);
                setSelectedUser(userMid);
            } else {
                toast.error(response.data?.message || 'Failed to fetch user dashboard');
            }

        } catch (error) {
            console.error('Error fetching user dashboard:', error);
            toast.error('Failed to load user dashboard');
        } finally {
            setDashboardLoading(false);
        }
    };

    const handleLevelClick = (level) => {
        if (selectedLevel === level) {
            setSelectedLevel(null);
            setSelectedLevelUsers([]);
        } else {
            setSelectedLevel(level);
            setSelectedLevelUsers(referralData.levels && referralData.levels[level] ? referralData.levels[level] : []);
        }
    };

    const periodButtons = [
        { key: 'day', label: 'Today', icon: 'material-symbols:today' },
        { key: 'month', label: 'This Month', icon: 'material-symbols:calendar-month' },
        { key: 'year', label: 'This Year', icon: 'material-symbols:calendar-view-year' },
        { key: 'all', label: 'All Time', icon: 'material-symbols:history' }
    ];

    const getStatusColor = (successCount, totalCount) => {
        if (totalCount === 0) return 'secondary';
        const successRate = (successCount / totalCount) * 100;
        if (successRate >= 95) return 'success';
        if (successRate >= 80) return 'info';
        if (successRate >= 60) return 'warning';
        return 'danger';
    };

    const renderBusinessMetrics = (businessData) => {
        if (!businessData || businessData.error) {
            return (
                <div className="alert alert-warning">
                    <iconify-icon icon="material-symbols:warning" className="me-2"></iconify-icon>
                    Business data not available
                </div>
            );
        }

        return (
            <div className="row g-3">
                {/* AEPS Services */}
                <div className="col-lg-6">
                    <div className="card h-100">
                        <div className="card-header bg-primary text-white">
                            <h6 className="mb-0">
                                <iconify-icon icon="material-symbols:credit-card" className="me-2"></iconify-icon>
                                AEPS Services
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-6">
                                    <div className="text-center">
                                        <div className="h5 text-success mb-1">
                                            {businessData.aeps?.cash_withdrawal?.success_count || 0}
                                        </div>
                                        <div className="small text-muted">Cash Withdrawal</div>
                                        <div className="small text-success">
                                            {formatCurrency(businessData.aeps?.cash_withdrawal?.success_amount || 0)}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="text-center">
                                        <div className="h5 text-info mb-1">
                                            {businessData.aeps?.aadhaar_pay?.success_count || 0}
                                        </div>
                                        <div className="small text-muted">Aadhaar Pay</div>
                                        <div className="small text-info">
                                            {formatCurrency(businessData.aeps?.aadhaar_pay?.success_amount || 0)}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="text-center">
                                        <div className="h6 text-primary mb-1">
                                            {businessData.aeps?.balance_enquiry?.success_count || 0}
                                        </div>
                                        <div className="small text-muted">Balance Enquiry</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="text-center">
                                        <div className="h6 text-secondary mb-1">
                                            {businessData.aeps?.mini_statement?.success_count || 0}
                                        </div>
                                        <div className="small text-muted">Mini Statement</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Utility Services */}
                <div className="col-lg-6">
                    <div className="card h-100">
                        <div className="card-header bg-info text-white">
                            <h6 className="mb-0">
                                <iconify-icon icon="material-symbols:phone-android" className="me-2"></iconify-icon>
                                Utility Services
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-4">
                                    <div className="text-center">
                                        <div className="h6 text-success mb-1">
                                            {businessData.utility_services?.mobile_recharge?.success_count || 0}
                                        </div>
                                        <div className="small text-muted">Mobile</div>
                                        <div className="small text-success">
                                            {formatCurrency(businessData.utility_services?.mobile_recharge?.success_amount || 0)}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="text-center">
                                        <div className="h6 text-info mb-1">
                                            {businessData.utility_services?.dth_recharge?.success_count || 0}
                                        </div>
                                        <div className="small text-muted">DTH</div>
                                        <div className="small text-info">
                                            {formatCurrency(businessData.utility_services?.dth_recharge?.success_amount || 0)}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="text-center">
                                        <div className="h6 text-warning mb-1">
                                            {businessData.utility_services?.bill_payment?.success_count || 0}
                                        </div>
                                        <div className="small text-muted">Bills</div>
                                        <div className="small text-warning">
                                            {formatCurrency(businessData.utility_services?.bill_payment?.success_amount || 0)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Services Summary */}
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-success text-white">
                            <h6 className="mb-0">
                                <iconify-icon icon="material-symbols:account-balance-wallet" className="me-2"></iconify-icon>
                                Financial Summary
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-2 col-6">
                                    <div className="text-center">
                                        <div className="h6 text-primary mb-1">
                                            {businessData.payouts?.success_count || 0}
                                        </div>
                                        <div className="small text-muted">Payouts</div>
                                        <div className="small text-primary">
                                            {formatCurrency(businessData.payouts?.success_amount || 0)}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-2 col-6">
                                    <div className="text-center">
                                        <div className="h6 text-success mb-1">
                                            {businessData.add_fund?.success_count || 0}
                                        </div>
                                        <div className="small text-muted">Add Fund</div>
                                        <div className="small text-success">
                                            {formatCurrency(businessData.add_fund?.success_amount || 0)}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-2 col-6">
                                    <div className="text-center">
                                        <div className="h6 text-info mb-1">
                                            {businessData.cash_deposit?.success_count || 0}
                                        </div>
                                        <div className="small text-muted">Cash Deposit</div>
                                        <div className="small text-info">
                                            {formatCurrency(businessData.cash_deposit?.success_amount || 0)}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-2 col-6">
                                    <div className="text-center">
                                        <div className="h6 text-success mb-1">
                                            {formatCurrency(businessData.account_balance?.total_balance || 0)}
                                        </div>
                                        <div className="small text-muted">Total Balance</div>
                                    </div>
                                </div>
                                <div className="col-md-2 col-6">
                                    <div className="text-center">
                                        <div className="h6 text-warning mb-1">
                                            {formatCurrency(businessData.account_balance?.hold_balance || 0)}
                                        </div>
                                        <div className="small text-muted">Hold Balance</div>
                                    </div>
                                </div>
                                <div className="col-md-2 col-6">
                                    <div className="text-center">
                                        <div className="h6 text-primary mb-1">
                                            {formatCurrency(businessData.account_balance?.available_balance || 0)}
                                        </div>
                                        <div className="small text-muted">Available</div>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="text-center">
                                <div className="h4 text-success mb-1">
                                    {formatCurrency(businessData.summary?.total_success_volume || 0)}
                                </div>
                                <div className="text-muted">Total Business Volume ({period})</div>
                                <div className="small text-muted">
                                    Last Updated: {businessData.summary?.last_updated ? 
                                        formatDate(businessData.summary.last_updated) : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

   

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <>
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
                <Pageheader mainheading="Referral System" parentfolder="Banking" activepage="Referral List" />
                
                <div className="page-content-box">
                    <div className="page-content-box-inner">
                        <div className="row">
                            <div className="col-12">
                                <div className="card custom-card border-0 shadow-sm">
                                    <div className="card-body text-center py-5">
                                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-3 text-muted">Loading referral data...</p>
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
        <div className="referral-list-container">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
            <Pageheader mainheading="Referral System" parentfolder="Banking" activepage="Referral List" />

            <div className="page-content-box">
                <div className="page-content-box-inner">
                    
                    {/* Period Filter Buttons */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card custom-card border-0 shadow-sm">
                                <div className="card-body">
                                    <div className="d-flex flex-wrap justify-content-between align-items-center">
                                        <div>
                                            <h6 className="text-dark fw-semibold mb-2">Filter by Period</h6>
                                            <p className="text-muted small mb-0">Select time period to view referral analytics</p>
                                        </div>
                                        <div className="btn-group" role="group">
                                            {periodButtons.map(btn => (
                                                <button
                                                    key={btn.key}
                                                    type="button"
                                                    className={`btn ${period === btn.key ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                                                    onClick={() => setPeriod(btn.key)}
                                                >
                                                    <iconify-icon icon={btn.icon} className="me-1"></iconify-icon>
                                                    {btn.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Level Cards Grid */}
                    <div className="row mb-4">
                        {Array.from({ length: 3 }, (_, index) => {
                            const level = index + 1;
                            const levelData = referralData.levels && referralData.levels[level] ? referralData.levels[level] : [];
                            const userCount = levelData.length;
                            const isActive = selectedLevel === level;
                            
                            // Calculate total volume for this level
                            const totalVolume = levelData.reduce((sum, user) => {
                                return sum + (user.business_data?.summary?.total_success_volume || 0);
                            }, 0);
                            
                            return (
                                <div key={level} className="col-md-4 col-sm-6 mb-3">
                                    <div 
                                        className={`card custom-card border-0 shadow-sm h-100 cursor-pointer ${isActive ? 'bg-primary text-white' : 'bg-light'}`}
                                        onClick={() => handleLevelClick(level)}
                                        style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                    >
                                        <div className="card-body text-center py-4">
                                            <div className="mb-3">
                                                <iconify-icon 
                                                    icon="material-symbols:group" 
                                                    width="40" 
                                                    height="40" 
                                                    className={isActive ? 'text-white' : 'text-primary'}
                                                ></iconify-icon>
                                            </div>
                                            <h5 className={`fw-bold mb-2 ${isActive ? 'text-white' : 'text-dark'}`}>
                                                Level {level}
                                            </h5>
                                            <div className={`badge ${isActive ? 'bg-white text-primary' : 'bg-primary text-white'} fs-6 px-3 py-2 mb-2`}>
                                                {userCount} {userCount === 1 ? 'User' : 'Users'}
                                            </div>
                                            {totalVolume > 0 && (
                                                <div className={`small ${isActive ? 'text-white-75' : 'text-success'} fw-medium`}>
                                                    Volume: {formatCurrency(totalVolume)}
                                                </div>
                                            )}
                                            <p className={`small mt-2 mb-0 ${isActive ? 'text-white-50' : 'text-muted'}`}>
                                                Click to {isActive ? 'hide' : 'view'} users
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Selected Level Users Table */}
                    {selectedLevel && (
                        <div className="row">
                            <div className="col-12">
                                <div className="card custom-card border-0 shadow-sm">
                                    <div className="card-header border-0 bg-transparent">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h5 className="card-title mb-1 text-dark fw-semibold">
                                                    Level {selectedLevel} Users - {period.charAt(0).toUpperCase() + period.slice(1)} Data
                                                </h5>
                                                <p className="text-muted mb-0 small">
                                                    {selectedLevelUsers.length} {selectedLevelUsers.length === 1 ? 'user' : 'users'} in this level
                                                </p>
                                            </div>
                                            <button 
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => {
                                                    setSelectedLevel(null);
                                                    setSelectedLevelUsers([]);
                                                    setSelectedUser(null);
                                                    setUserDashboardData(null);
                                                }}
                                            >
                                                <iconify-icon icon="material-symbols:close" width="16" height="16"></iconify-icon>
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body pt-0">
                                        {selectedLevelUsers.length > 0 ? (
                                            <div className="table-responsive">
                                                <table className="table table-hover">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>#</th>
                                                            <th>User Details</th>
                                                            <th>Refrral Details</th>
                                                            <th>Status</th>
                                                            <th>Business Volume</th>
                                                            <th>AEPS Success</th>
                                                            <th>Utility Success</th>
                                                            <th>Account Balance</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedLevelUsers.map((user, index) => (
                                                            <tr key={user.mid || index}>
                                                                <td>{index + 1}</td>
                                                                <td>
                                                                    <div>
                                                                        <div className="fw-medium text-dark">{user.name || 'N/A'}</div>
                                                                        <div className="small text-muted">{user.mobile || 'N/A'}</div>
                                                                        <div className="small text-info">{user.mid || 'N/A'}</div>
                                                                        <div className="small text-muted">Email: {user.email || 'N/A'}</div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div>
                                                                        <div className="fw-medium text-dark">{user.refer_by_data?.name || 'N/A'}</div>
                                                                        <div className="small text-muted">{user.refer_by_data?.mobile || 'N/A'}</div>
                                                                        <div className="small text-info">{user.refer_by_data?.mid || 'N/A'}</div>
                                                                        <div className="small text-muted">Email: {user.refer_by_data?.email || 'N/A'}</div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <span className={`badge bg-${user.status === 1 ? 'success' : 'danger'}`}>
                                                                        {user.status === 1 ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                    <div className="small text-muted mt-1">
                                                                        Joined: {formatDate(user.created_at)}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="fw-bold text-success">
                                                                        {formatCurrency(user.business_data?.summary?.total_success_volume || 0)}
                                                                    </div>
                                                                    <div className="small text-muted">Total Volume</div>
                                                                </td>
                                                                <td>
                                                                    <div className="small">
                                                                        <div>CW: <span className="text-success">{user.business_data?.aeps?.cash_withdrawal?.success_count || 0}</span></div>
                                                                        <div>AP: <span className="text-info">{user.business_data?.aeps?.aadhaar_pay?.success_count || 0}</span></div>
                                                                        <div>BE: <span className="text-primary">{user.business_data?.aeps?.balance_enquiry?.success_count || 0}</span></div>
                                                                        <div>MS: <span className="text-secondary">{user.business_data?.aeps?.mini_statement?.success_count || 0}</span></div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="small">
                                                                        <div>Mobile: <span className="text-success">{user.business_data?.utility_services?.mobile_recharge?.success_count || 0}</span></div>
                                                                        <div>DTH: <span className="text-info">{user.business_data?.utility_services?.dth_recharge?.success_count || 0}</span></div>
                                                                        <div>Bill: <span className="text-warning">{user.business_data?.utility_services?.bill_payment?.success_count || 0}</span></div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="small">
                                                                        <div className="text-success">
                                                                            Total: {formatCurrency(user.business_data?.account_balance?.total_balance || 0)}
                                                                        </div>
                                                                        <div className="text-primary">
                                                                            Available: {formatCurrency(user.business_data?.account_balance?.available_balance || 0)}
                                                                        </div>
                                                                        <div className="text-warning">
                                                                            Hold: {formatCurrency(user.business_data?.account_balance?.hold_balance || 0)}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <button 
                                                                        className="btn btn-primary btn-sm"
                                                                        onClick={() => fetchUserDashboard(user.mid)}
                                                                        disabled={dashboardLoading && selectedUser === user.mid}
                                                                    >
                                                                        {dashboardLoading && selectedUser === user.mid ? (
                                                                            <>
                                                                                <span className="spinner-border spinner-border-sm me-1"></span>
                                                                                Loading...
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <iconify-icon icon="material-symbols:dashboard" className="me-1"></iconify-icon>
                                                                                View Details
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <div className="mb-3">
                                                    <iconify-icon icon="material-symbols:person-off" width="48" height="48" className="text-muted"></iconify-icon>
                                                </div>
                                                <h6 className="text-muted">No Users Found</h6>
                                                <p className="text-muted small">No users available in Level {selectedLevel} for the selected period.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Individual User Dashboard */}
                    {userDashboardData && selectedUser && (
                        <div className="row mt-4">
                            <div className="col-12">
                                <div className="card custom-card border-0 shadow-sm">
                                    <div className="card-header bg-gradient-primary text-white">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h5 className="mb-1 text-white fw-semibold">
                                                    <iconify-icon icon="material-symbols:dashboard" className="me-2"></iconify-icon>
                                                    Dashboard - {userDashboardData.user_info?.name}
                                                </h5>
                                                <p className="mb-0 text-white-75 small">
                                                    MID: {userDashboardData.user_info?.mid} | Period: {period.charAt(0).toUpperCase() + period.slice(1)}
                                                </p>
                                            </div>
                                            <button 
                                                className="btn btn-light btn-sm"
                                                onClick={() => {
                                                    setUserDashboardData(null);
                                                    setSelectedUser(null);
                                                }}
                                            >
                                                <iconify-icon icon="material-symbols:close" className="me-1"></iconify-icon>
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        {dashboardLoading ? (
                                            <div className="text-center py-4">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                <p className="mt-3 text-muted">Loading user dashboard...</p>
                                            </div>
                                        ) : (
                                            renderBusinessMetrics(userDashboardData.business_data)
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Summary Card */}
                    <div className="row mt-4">
                        <div className="col-12">
                            <div className="card custom-card border-0 shadow-sm bg-gradient-primary text-white">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col-md-8">
                                            <h5 className="text-white fw-bold mb-2">
                                                <iconify-icon icon="material-symbols:groups" className="me-2"></iconify-icon>
                                                Referral Network Summary
                                            </h5>
                                            <div className="row g-3">
                                                <div className="col-md-4">
                                                    <div className="text-white-75 small">Total Users</div>
                                                    <div className="h4 text-white fw-bold">
                                                        {referralData.levels ? 
                                                            Object.values(referralData.levels).reduce((total, level) => total + level.length, 0) : 0
                                                        }
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="text-white-75 small">Total Volume ({period})</div>
                                                    <div className="h5 text-white fw-bold">
                                                        {referralData.levels ? 
                                                            formatCurrency(
                                                                Object.values(referralData.levels)
                                                                    .flat()
                                                                    .reduce((total, user) => total + (user.business_data?.summary?.total_success_volume || 0), 0)
                                                            ) : formatCurrency(0)
                                                        }
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="text-white-75 small">Period Filter</div>
                                                    <div className="h6 text-white fw-bold text-capitalize">
                                                        {period === 'all' ? 'All Time' : period}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-white-50 mb-0 mt-2 small">
                                                Business analytics included for comprehensive tracking
                                            </p>
                                        </div>
                                        <div className="col-md-4 text-end">
                                            <iconify-icon icon="material-symbols:analytics" width="60" height="60" className="text-white-50"></iconify-icon>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ReferralList;
