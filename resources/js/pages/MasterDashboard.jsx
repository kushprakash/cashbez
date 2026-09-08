import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Pageheader from '../layouts/Pageheader';
import { AuthContext } from '../core/hooks/context';
import ApiService from '../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Chart Component with error boundary
const MiniChart = ({ type = 'area', height = 60, color = '#3b82f6', data = [10, 25, 15, 30, 45, 35, 50] }) => {
    const [ChartComp, setChartComp] = useState(null);

    useEffect(() => {
        let isMounted = true;
        import('react-apexcharts').then(mod => {
            if (isMounted) setChartComp(() => mod.default);
        }).catch(err => console.warn('ApexChart load error:', err));
        return () => { isMounted = false; };
    }, []);

    if (!ChartComp) return <div style={{ height }} className="d-flex align-items-center justify-content-center text-muted smallest">Chart loading...</div>;

    const options = {
        chart: { sparkline: { enabled: true }, animations: { enabled: true, speed: 300 } },
        colors: [color],
        stroke: { curve: 'smooth', width: 2 },
        fill: { opacity: 0.15 },
        tooltip: { enabled: false }
    };

    const series = [{ name: 'Volume', data: data && data.length > 0 ? data : [0, 0, 0, 0] }];

    return <ChartComp options={options} series={series} type={type} height={height} width="100%" />;
};

const MasterDashboard = ({ dashboardData: initialData }) => {
    const navigate = useNavigate();
    const apiService = ApiService();
    const { userData: user } = useContext(AuthContext) || {};

    const [data, setData] = useState(initialData || null);
    const [loading, setLoading] = useState(!initialData);
    const [timeframe, setTimeframe] = useState('today'); // 'today', 'this_month', 'total'

    useEffect(() => {
        if (initialData) {
            setData(initialData);
            setLoading(false);
        } else {
            fetchDashboardData();
        }
    }, [initialData]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await apiService.vGet('/api/dashboard');
            if (response?.data?.status === 1) {
                setData(response.data.data);
            } else {
                toast.error(response?.data?.message || 'Failed to fetch dashboard data');
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            toast.error('Error loading dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const getTimeBasedGreeting = (name = 'Admin') => {
        const cleanName = capitalizeText((name || '').split(' ')[0] || 'Admin');
        const hours = new Date().getHours();
        if (hours < 12) return `🌞 Good Morning, ${cleanName}!`;
        if (hours < 18) return `☀️ Good Afternoon, ${cleanName}!`;
        return `🌙 Good Evening, ${cleanName}!`;
    };

    function capitalizeText(text) {
        if (!text) return '';
        return text
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    const formatCurrency = (val) => {
        const num = Number(val) || 0;
        return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    };

    const getStatObj = (category, field = 'total') => {
        if (!data) return { count: 0, amount: 0 };
        let source = data[category];
        if (category.includes('.')) {
            const parts = category.split('.');
            source = data[parts[0]]?.[parts[1]];
        }
        if (!source) return { count: 0, amount: 0 };
        const periodObj = source[timeframe] || source['total'];
        if (!periodObj) return { count: 0, amount: 0 };

        const statusObj = periodObj[field] || periodObj['success'];
        return {
            count: statusObj?.count || 0,
            amount: statusObj?.amount || 0
        };
    };

    // Calculate Grand Total Volume across services
    const calculateTotalVolume = () => {
        if (!data) return { totalAmount: 0, totalTxns: 0, successCount: 0, failedCount: 0, pendingCount: 0 };

        let totalAmount = 0;
        let totalTxns = 0;
        let successCount = 0;
        let failedCount = 0;
        let pendingCount = 0;

        const serviceKeys = ['aeps.cw', 'aeps.ap', 'cash_deposit', 'utility.mobile', 'utility.dth', 'utility.bill', 'payouts', 'add_fund', 'va_txns'];

        serviceKeys.forEach(key => {
            const parts = key.split('.');
            const source = parts.length > 1 ? data[parts[0]]?.[parts[1]] : data[parts[0]];
            if (source) {
                const period = source[timeframe] || source['total'];
                if (period) {
                    ['success', 'failed', 'pending'].forEach(st => {
                        if (period[st]) {
                            const count = period[st].count || 0;
                            const amt = period[st].amount || 0;
                            totalTxns += count;
                            totalAmount += amt;

                            if (st === 'success') successCount += count;
                            if (st === 'failed') failedCount += count;
                            if (st === 'pending') pendingCount += count;
                        }
                    });
                }
            }
        });

        return { totalAmount, totalTxns, successCount, failedCount, pendingCount };
    };

    const overallStats = calculateTotalVolume();

    // Fallback Trade & Utility Wallet computation
    const getWalletData = (isTrade = true) => {
        if (isTrade && data?.accounts?.trade_wallet) return data.accounts.trade_wallet;
        if (!isTrade && data?.accounts?.utility_wallet) return data.accounts.utility_wallet;

        const wallets = data?.user_wallets || [];
        const filtered = wallets.filter(w => isTrade ? (w.is_primary || w.primary_status == 1) : (!w.is_primary && w.primary_status != 1));
        const count = filtered.length;
        const total_balance = filtered.reduce((acc, curr) => acc + (Number(curr.balance) || 0), 0);
        const hold_balance = filtered.reduce((acc, curr) => acc + (Number(curr.hold_amount) || 0), 0);
        const available_balance = total_balance - hold_balance;

        return { count, total_balance, hold_balance, available_balance };
    };

    const tradeWallet = getWalletData(true);
    const utilityWallet = getWalletData(false);

    // Get VA Stats
    const vaStats = {
        total: getStatObj('va_txns', 'success'),
        pending: getStatObj('va_txns', 'pending'),
        failed: getStatObj('va_txns', 'failed'),
    };

    // Get Add Fund Stats
    const addFundStats = {
        total: getStatObj('add_fund', 'success'),
        pending: getStatObj('add_fund', 'pending'),
        failed: getStatObj('add_fund', 'failed'),
    };

    const isAdminOnly = (user?.role == 2 || user?.role === '2');

    const handleCardClick = (path) => {
        if (isAdminOnly) {
            return;
        }
        if (path) {
            navigate(path);
        }
    };

    const cardCursor = isAdminOnly ? 'default' : 'pointer';
    const cardHoverClass = isAdminOnly ? '' : 'hover-card';

    return (
        <div className="container-fluid py-2 px-2" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <ToastContainer position="top-right" autoClose={3000} />
            <Pageheader mainheading={user?.role == 1 ? "Super Admin Dashboard" : "Admin Dashboard"} parentfolder="Master" activepage="System Overview" />

            {/* Header Control Banner - Ultra Compact */}
            <div className="card border-0 shadow-sm rounded-3 bg-white mb-2 overflow-hidden">
                <div className="card-body py-2 px-3 position-relative" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff' }}>
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-primary px-2 py-1 rounded-pill">{user?.role == 1 ? 'SUPER ADMIN' : 'ADMIN'}</span>
                                <h6 className="fw-bold mb-0 text-white">{getTimeBasedGreeting(user?.name)}</h6>
                            </div>
                        </div>
                        <div className="col-md-6 text-md-end mt-2 mt-md-0 d-flex align-items-center justify-content-md-end gap-2">
                            <div className="btn-group btn-group-sm bg-white bg-opacity-10 p-1 rounded-pill">
                                <button
                                    type="button"
                                    className={`btn btn-sm rounded-pill px-3 py-0 fw-semibold ${timeframe === 'today' ? 'btn-primary text-white shadow-sm' : 'text-white-50'}`}
                                    onClick={() => setTimeframe('today')}
                                >
                                    Today
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-sm rounded-pill px-3 py-0 fw-semibold ${timeframe === 'this_month' ? 'btn-primary text-white shadow-sm' : 'text-white-50'}`}
                                    onClick={() => setTimeframe('this_month')}
                                >
                                    This Month
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-sm rounded-pill px-3 py-0 fw-semibold ${timeframe === 'total' ? 'btn-primary text-white shadow-sm' : 'text-white-50'}`}
                                    onClick={() => setTimeframe('total')}
                                >
                                    All Time
                                </button>
                            </div>

                            <button
                                type="button"
                                className="btn btn-light btn-sm rounded-pill px-3 py-1 fw-bold shadow-sm"
                                onClick={fetchDashboardData}
                                disabled={loading}
                            >
                                <i className={`fas fa-sync-alt me-1 ${loading ? 'fa-spin' : ''}`}></i> Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="card border-0 shadow-sm rounded-3 p-4 text-center bg-white my-2">
                    <div className="spinner-border spinner-border-sm text-primary mx-auto mb-2" role="status"></div>
                    <small className="fw-semibold text-secondary">Loading Complete System Analytics...</small>
                </div>
            ) : (
                <>
                    {/* ========================================================================= */}
                    {/* TOP ROW: EXACT 4 EQUAL CARDS IN 1 ROW (25% EACH) */}
                    {/* ========================================================================= */}
                    <div className="row g-2 mb-2">
                        {/* BOX 1: Trade Wallet (Primary Status = 1) */}
                        <div className="col-lg-3 col-md-6" onClick={() => handleCardClick('/banking/accounts')} style={{ cursor: cardCursor }}>
                            <div className={`card border-0 shadow-sm rounded-3 bg-white border-top border-4 border-success h-100 p-2 ${cardHoverClass}`}>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="p-1 rounded bg-success text-white d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                                            <i className="fas fa-wallet fs-6"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '13px' }}>Trade Wallet</h6>
                                            <span className="text-muted" style={{ fontSize: '10px' }}>Primary Status = 1</span>
                                        </div>
                                    </div>
                                    <span className="badge bg-success text-white px-2 py-1" style={{ fontSize: '10px' }}>
                                        {tradeWallet.count} Acc
                                    </span>
                                </div>

                                <div className="bg-light p-2 rounded-2 mt-1">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="text-secondary" style={{ fontSize: '11px' }}>Total Balance:</span>
                                        <strong className="text-dark" style={{ fontSize: '13px' }}>{formatCurrency(tradeWallet.total_balance)}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center text-muted" style={{ fontSize: '10px' }}>
                                        <span>Hold: <strong className="text-warning">{formatCurrency(tradeWallet.hold_balance)}</strong></span>
                                        <span>Avail: <strong className="text-success">{formatCurrency(tradeWallet.available_balance)}</strong></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BOX 2: Utility Wallet (Primary Status = 0) */}
                        <div className="col-lg-3 col-md-6" onClick={() => handleCardClick('/banking/accounts')} style={{ cursor: cardCursor }}>
                            <div className={`card border-0 shadow-sm rounded-3 bg-white border-top border-4 border-indigo h-100 p-2 ${cardHoverClass}`} style={{ borderTopColor: '#6366f1' }}>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="p-1 rounded text-white d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', backgroundColor: '#6366f1' }}>
                                            <i className="fas fa-receipt fs-6"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '13px' }}>Utility Wallet</h6>
                                            <span className="text-muted" style={{ fontSize: '10px' }}>Primary Status = 0</span>
                                        </div>
                                    </div>
                                    <span className="badge text-white px-2 py-1" style={{ fontSize: '10px', backgroundColor: '#6366f1' }}>
                                        {utilityWallet.count} Acc
                                    </span>
                                </div>

                                <div className="bg-light p-2 rounded-2 mt-1">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="text-secondary" style={{ fontSize: '11px' }}>Total Balance:</span>
                                        <strong className="text-dark" style={{ fontSize: '13px' }}>{formatCurrency(utilityWallet.total_balance)}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center text-muted" style={{ fontSize: '10px' }}>
                                        <span>Hold: <strong className="text-warning">{formatCurrency(utilityWallet.hold_balance)}</strong></span>
                                        <span>Avail: <strong style={{ color: '#6366f1' }}>{formatCurrency(utilityWallet.available_balance)}</strong></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BOX 3: Total VA Transactions & Value */}
                        <div className="col-lg-3 col-md-6" onClick={() => handleCardClick('/banking/reports')} style={{ cursor: cardCursor }}>
                            <div className={`card border-0 shadow-sm rounded-3 bg-white border-top border-4 border-purple h-100 p-2 ${cardHoverClass}`} style={{ borderTopColor: '#8b5cf6' }}>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="p-1 rounded text-white d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', backgroundColor: '#8b5cf6' }}>
                                            <i className="fas fa-building fs-6"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '13px' }}>QR Code</h6>
                                            <span className="text-muted" style={{ fontSize: '10px' }}>Credit Transactions</span>
                                        </div>
                                    </div>
                                    <span className="badge text-white px-2 py-1" style={{ fontSize: '10px', backgroundColor: '#8b5cf6' }}>
                                        {vaStats.total.count} Txns
                                    </span>
                                </div>

                                <div className="bg-light p-2 rounded-2 mt-1">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="text-secondary" style={{ fontSize: '11px' }}>Total Value:</span>
                                        <strong className="text-dark" style={{ fontSize: '13px' }}>{formatCurrency(vaStats.total.amount)}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center text-muted" style={{ fontSize: '10px' }}>
                                        <span>Pending: <strong className="text-warning">{vaStats.pending.count}</strong></span>
                                        <span>Failed: <strong className="text-danger">{vaStats.failed.count}</strong></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BOX 4: Total Add Fund & Value */}
                        <div className="col-lg-3 col-md-6" onClick={() => handleCardClick('/banking/reports')} style={{ cursor: cardCursor }}>
                            <div className={`card border-0 shadow-sm rounded-3 bg-white border-top border-4 border-warning h-100 p-2 ${cardHoverClass}`}>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="p-1 rounded bg-warning text-dark d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                                            <i className="fas fa-plus-circle fs-6"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '13px' }}>Add Fund / Topup</h6>
                                            <span className="text-muted" style={{ fontSize: '10px' }}>Wallet Topups</span>
                                        </div>
                                    </div>
                                    <span className="badge bg-warning text-dark px-2 py-1" style={{ fontSize: '10px' }}>
                                        {addFundStats.total.count} Requests
                                    </span>
                                </div>

                                <div className="bg-light p-2 rounded-2 mt-1">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="text-secondary" style={{ fontSize: '11px' }}>Total Value:</span>
                                        <strong className="text-dark" style={{ fontSize: '13px' }}>{formatCurrency(addFundStats.total.amount)}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center text-muted" style={{ fontSize: '10px' }}>
                                        <span>Pending: <strong className="text-warning">{addFundStats.pending.count}</strong></span>
                                        <span>Failed: <strong className="text-danger">{addFundStats.failed.count}</strong></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* SECOND ROW: OVERALL TRANSACTION STATUS STATS & CHARTS */}
                    {/* ========================================================================= */}
                    <div className="row g-2 mb-2">
                        <div className="col-md-3" onClick={() => handleCardClick('/banking/reports')} style={{ cursor: cardCursor }}>
                            <div className={`card border-0 shadow-sm rounded-3 bg-white p-2 h-100 ${cardHoverClass}`}>
                                <div className="d-flex align-items-center justify-content-between mb-1">
                                    <span className="text-secondary fw-semibold" style={{ fontSize: '11px' }}>Total System Txn Volume</span>
                                    <span className="badge bg-primary bg-opacity-10 text-primary">{timeframe}</span>
                                </div>
                                <h5 className="fw-bold text-dark mb-0">{formatCurrency(overallStats.totalAmount)}</h5>
                                <div className="d-flex justify-content-between align-items-center text-muted mt-1" style={{ fontSize: '11px' }}>
                                    <span>Total Count: <strong>{overallStats.totalTxns.toLocaleString()}</strong></span>
                                    <i className="fas fa-chart-line text-primary"></i>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3" onClick={() => handleCardClick('/banking/reports')} style={{ cursor: cardCursor }}>
                            <div className={`card border-0 shadow-sm rounded-3 bg-white p-2 h-100 ${cardHoverClass}`}>
                                <div className="d-flex align-items-center justify-content-between mb-1">
                                    <span className="text-secondary fw-semibold" style={{ fontSize: '11px' }}>Success Transactions</span>
                                    <span className="badge bg-success text-white">Completed</span>
                                </div>
                                <h5 className="fw-bold text-success mb-0">{overallStats.successCount.toLocaleString()}</h5>
                                <div className="d-flex justify-content-between align-items-center text-muted mt-1" style={{ fontSize: '11px' }}>
                                    <span>Success Rate: <strong>{overallStats.totalTxns > 0 ? Math.round((overallStats.successCount / overallStats.totalTxns) * 100) : 0}%</strong></span>
                                    <i className="fas fa-check-circle text-success"></i>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3" onClick={() => handleCardClick('/banking/reports')} style={{ cursor: cardCursor }}>
                            <div className={`card border-0 shadow-sm rounded-3 bg-white p-2 h-100 border-start border-3 border-warning ${cardHoverClass}`}>
                                <div className="d-flex align-items-center justify-content-between mb-1">
                                    <span className="text-secondary fw-semibold" style={{ fontSize: '11px' }}>Pending Transactions</span>
                                    <span className="badge bg-warning text-dark">Action Needed</span>
                                </div>
                                <h5 className="fw-bold text-warning mb-0">{overallStats.pendingCount.toLocaleString()}</h5>
                                <div className="d-flex justify-content-between align-items-center text-muted mt-1" style={{ fontSize: '11px' }}>
                                    <span>Review & Process</span>
                                    <i className="fas fa-clock text-warning"></i>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3" onClick={() => handleCardClick('/users/list')} style={{ cursor: cardCursor }}>
                            <div className={`card border-0 shadow-sm rounded-3 bg-white p-2 h-100 ${cardHoverClass}`}>
                                <div className="d-flex align-items-center justify-content-between mb-1">
                                    <span className="text-secondary fw-semibold" style={{ fontSize: '11px' }}>Users & Retailers</span>
                                    <span className="badge bg-info text-white">System</span>
                                </div>
                                <h5 className="fw-bold text-dark mb-0">{data?.users?.total?.active || 0} / {(data?.users?.total?.active || 0) + (data?.users?.total?.inactive || 0)}</h5>
                                <div className="d-flex justify-content-between align-items-center text-muted mt-1" style={{ fontSize: '11px' }}>
                                    <span>Active Merchants: <strong>{data?.merchants?.total?.total_active || 0}</strong></span>
                                    <i className="fas fa-users text-info"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* THIRD ROW: SERVICE-WISE ANALYTICS & APEXCHARTS GRAPHS */}
                    {/* ========================================================================= */}
                    <div className="card border-0 shadow-sm rounded-3 bg-white mb-2">
                        <div className="card-header bg-white border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold text-dark mb-0 style-sm">
                                <i className="fas fa-chart-pie text-primary me-2"></i> All System Services & Transaction Analytics
                            </h6>
                            <span className="text-muted small">{isAdminOnly ? 'Read-only analytics view' : 'Click any service box to open reports'}</span>
                        </div>

                        <div className="card-body p-2">
                            <div className="row g-2">
                                {/* 1. AEPS Cash Withdrawal (CW) */}
                                <div className="col-md-4" onClick={() => handleCardClick('/banking/reports')} style={{ cursor: cardCursor }}>
                                    <div className={`p-2 border rounded-3 bg-white h-100 ${cardHoverClass}`}>
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="fw-bold text-dark small"><i className="fas fa-fingerprint text-primary me-1"></i> AEPS Cash Withdrawal</span>
                                            <span className="badge bg-primary text-white">AEPS CW</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-baseline">
                                            <h6 className="fw-bold text-success mb-0">{formatCurrency(getStatObj('aeps.cw', 'success').amount)}</h6>
                                            <small className="text-muted">{getStatObj('aeps.cw', 'success').count} Success</small>
                                        </div>
                                        <div className="mt-2">
                                            <MiniChart type="area" color="#10b981" data={[15, 25, 20, 35, 30, 45, 60]} />
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Aadhaar Pay (AP) */}
                                <div className="col-md-4" onClick={() => handleCardClick('/banking/reports')} style={{ cursor: cardCursor }}>
                                    <div className={`p-2 border rounded-3 bg-white h-100 ${cardHoverClass}`}>
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="fw-bold text-dark small"><i className="fas fa-id-card text-success me-1"></i> Aadhaar Pay (AP)</span>
                                            <span className="badge bg-success text-white">AEPS AP</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-baseline">
                                            <h6 className="fw-bold text-success mb-0">{formatCurrency(getStatObj('aeps.ap', 'success').amount)}</h6>
                                            <small className="text-muted">{getStatObj('aeps.ap', 'success').count} Success</small>
                                        </div>
                                        <div className="mt-2">
                                            <MiniChart type="area" color="#6366f1" data={[10, 18, 14, 28, 22, 38, 50]} />
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Balance Enquiry (BE) & Mini Statement (MS) */}
                                <div className="col-md-4" onClick={() => handleCardClick('/banking/reports')} style={{ cursor: cardCursor }}>
                                    <div className={`p-2 border rounded-3 bg-white h-100 ${cardHoverClass}`}>
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="fw-bold text-dark small"><i className="fas fa-search text-warning me-1"></i> Balance Enquiry & Mini Stmt</span>
                                            <span className="badge bg-warning text-dark">BE / MS</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-baseline">
                                            <h6 className="fw-bold text-dark mb-0">{(getStatObj('aeps.be', 'success').count + getStatObj('aeps.ms', 'success').count).toLocaleString()} Hits</h6>
                                            <small className="text-muted">BE: {getStatObj('aeps.be', 'success').count} | MS: {getStatObj('aeps.ms', 'success').count}</small>
                                        </div>
                                        <div className="mt-2">
                                            <MiniChart type="bar" color="#f59e0b" data={[40, 55, 35, 60, 45, 70, 85]} />
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Utility & Mobile Recharges */}
                                <div className="col-md-4" onClick={() => handleCardClick('/banking/dth-recharge')} style={{ cursor: cardCursor }}>
                                    <div className={`p-2 border rounded-3 bg-white h-100 ${cardHoverClass}`}>
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="fw-bold text-dark small"><i className="fas fa-mobile-alt text-info me-1"></i> Mobile & DTH Recharge</span>
                                            <span className="badge bg-info text-white">Utility</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-baseline">
                                            <h6 className="fw-bold text-success mb-0">{formatCurrency(getStatObj('utility.mobile', 'success').amount + getStatObj('utility.dth', 'success').amount)}</h6>
                                            <small className="text-muted">{(getStatObj('utility.mobile', 'success').count + getStatObj('utility.dth', 'success').count).toLocaleString()} Txns</small>
                                        </div>
                                        <div className="mt-2">
                                            <MiniChart type="area" color="#3b82f6" data={[20, 30, 25, 40, 35, 55, 70]} />
                                        </div>
                                    </div>
                                </div>

                                {/* 5. Move to Bank (Payouts) */}
                                <div className="col-md-4" onClick={() => handleCardClick('/banking/reports')} style={{ cursor: cardCursor }}>
                                    <div className={`p-2 border rounded-3 bg-white h-100 ${cardHoverClass}`}>
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="fw-bold text-dark small"><i className="fas fa-university text-danger me-1"></i> Move to Bank (Payouts)</span>
                                            <span className="badge bg-danger text-white">Payout</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-baseline">
                                            <h6 className="fw-bold text-success mb-0">{formatCurrency(getStatObj('payouts', 'success').amount)}</h6>
                                            <small className="text-warning fw-bold">{getStatObj('payouts', 'pending').count} Pending</small>
                                        </div>
                                        <div className="mt-2">
                                            <MiniChart type="line" color="#ef4444" data={[30, 45, 25, 50, 40, 65, 80]} />
                                        </div>
                                    </div>
                                </div>

                                {/* 6. Cash Deposit Service */}
                                <div className="col-md-4" onClick={() => handleCardClick('/banking/reports')} style={{ cursor: cardCursor }}>
                                    <div className={`p-2 border rounded-3 bg-white h-100 ${cardHoverClass}`}>
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="fw-bold text-dark small"><i className="fas fa-money-bill-wave text-success me-1"></i> Cash Deposit Service</span>
                                            <span className="badge bg-secondary text-white">Cash</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-baseline">
                                            <h6 className="fw-bold text-success mb-0">{formatCurrency(getStatObj('cash_deposit', 'success').amount)}</h6>
                                            <small className="text-muted">{getStatObj('cash_deposit', 'success').count} Txns</small>
                                        </div>
                                        <div className="mt-2">
                                            <MiniChart type="bar" color="#10b981" data={[12, 20, 15, 30, 25, 40, 50]} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* FOURTH ROW: SYSTEM ALERTS & MERCHANT PIPELINE */}
                    {/* ========================================================================= */}
                    <div className="row g-2 mb-2">
                        {/* System Alerts & Complaints */}
                        <div className="col-md-6" onClick={() => handleCardClick('/banking/admin-complaints')} style={{ cursor: cardCursor }}>
                            <div className={`card border-0 shadow-sm rounded-3 bg-white p-3 h-100 ${cardHoverClass}`}>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '13px' }}>
                                        <i className="fas fa-headset text-warning me-2"></i> System Alerts & Disputes
                                    </h6>
                                    <span className="badge bg-warning text-dark">Complaints Portal</span>
                                </div>
                                <div className="p-2 rounded bg-light d-flex justify-content-between align-items-center">
                                    <div>
                                        <small className="text-muted d-block">Pending Resolution Tickets</small>
                                        <strong className="text-danger fs-5">Track & Solve Tickets</strong>
                                    </div>
                                    {!isAdminOnly && (
                                        <button className="btn btn-sm btn-primary rounded-pill px-3">Open Portal ➔</button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Merchant Onboarding Pipeline */}
                        <div className="col-md-6" onClick={() => handleCardClick('/users/list')} style={{ cursor: cardCursor }}>
                            <div className={`card border-0 shadow-sm rounded-3 bg-white p-3 h-100 ${cardHoverClass}`}>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '13px' }}>
                                        <i className="fas fa-user-check text-success me-2"></i> AEPS Merchant Onboarding Pipeline
                                    </h6>
                                    <span className="badge bg-success text-white">KYC Stages</span>
                                </div>
                                <div className="row g-2 text-center" style={{ fontSize: '11px' }}>
                                    <div className="col-3">
                                        <div className="p-1 rounded bg-light">
                                            <span className="text-muted d-block">Drafts</span>
                                            <strong className="text-dark">{data?.merchants?.total?.drafts || 0}</strong>
                                        </div>
                                    </div>
                                    <div className="col-3">
                                        <div className="p-1 rounded bg-light">
                                            <span className="text-muted d-block">EKYC</span>
                                            <strong className="text-info">{data?.merchants?.total?.ekyc || 0}</strong>
                                        </div>
                                    </div>
                                    <div className="col-3">
                                        <div className="p-1 rounded bg-light">
                                            <span className="text-muted d-block">Bio KYC</span>
                                            <strong className="text-warning">{data?.merchants?.total?.biomatrickyc || 0}</strong>
                                        </div>
                                    </div>
                                    <div className="col-3">
                                        <div className="p-1 rounded bg-light">
                                            <span className="text-muted d-block">2FA Active</span>
                                            <strong className="text-success">{data?.merchants?.total?.['2fa'] || 0}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Custom hover card CSS */}
            <style>{`
                .hover-card {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .hover-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 15px rgba(0,0,0,0.1) !important;
                }
            `}</style>
        </div>
    );
};

export default MasterDashboard;