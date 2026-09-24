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

    const [userVaData, setUserVaData] = useState(null);
    const [qrForm, setQrForm] = useState({
        name: user?.name || '',
        account_number: '',
        account_ifsc: ''
    });
    const [qrLoading, setQrLoading] = useState(false);
    const [copiedField, setCopiedField] = useState('');

    // Sync qrForm with user_kyc bank details from dashboard API
    useEffect(() => {
        const kyc = data?.kyc_account;
        if (kyc) {
            setQrForm({
                name: kyc.name || user?.name || '',
                account_number: kyc.account_number || '',
                account_ifsc: kyc.ifsc_code || ''
            });
        } else if (user?.name) {
            setQrForm(prev => ({
                ...prev,
                name: prev.name || user.name
            }));
        }
    }, [data?.kyc_account, user]);

    const vaData = userVaData || data?.va_data;

    const handleGenerateQrSubmit = async (e) => {
        e.preventDefault();
        if (!qrForm.name || !qrForm.account_number || !qrForm.account_ifsc) {
            toast.error('Please enter Account Holder Name, Account Number and IFSC Code');
            return;
        }
        setQrLoading(true);
        try {
            const response = await apiService.vPost('/api/va/generate-qr', {
                name: qrForm.name,
                account_number: qrForm.account_number,
                account_ifsc: qrForm.account_ifsc
            });
            if (response?.data?.status === 1) {
                toast.success(response.data.message || 'Virtual Account QR Generated Successfully!');
                setUserVaData(response.data.data);
            } else {
                toast.error(response?.data?.message || 'Failed to generate Virtual Account QR');
            }
        } catch (error) {
            console.error('Error generating QR:', error);
            toast.error(error?.response?.data?.message || 'Failed to generate Virtual Account QR');
        } finally {
            setQrLoading(false);
        }
    };

    const handleCopy = (text, fieldName) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            setCopiedField(fieldName);
            toast.success('Copied to clipboard!');
            setTimeout(() => setCopiedField(''), 2000);
        }
    };

    const handleShare = (text, title) => {
        if (navigator.share) {
            navigator.share({ title: title, text: text }).catch(() => { });
        } else {
            handleCopy(text, title);
        }
    };

    const qrImageUrl = vaData?.qrcode_image || (
        vaData?.virtual_upi_handle || vaData?.virtual_account_number ?
            `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${vaData.virtual_upi_handle || vaData.virtual_account_number}&pn=${encodeURIComponent(vaData.username || user?.name || 'Admin')}`
            : null
    );

    const handleDownloadPdf = () => {
        if (vaData?.qrcode_pdf) {
            window.open(vaData.qrcode_pdf, '_blank');
        } else if (vaData?.qrcode_image || qrImageUrl) {
            const qrSrc = vaData?.qrcode_image || qrImageUrl;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head><title>QR Code</title></head>
                    <body style="text-align:center; padding: 40px;">
                        <h2>UPI Payment QR Code</h2>
                        <img src="${qrSrc}" style="max-width:300px; margin-top:20px;" />
                        <p style="font-size:18px; font-weight:bold; margin-top:15px;">${vaData?.virtual_upi_handle || vaData?.virtual_account_number || ''}</p>
                        <script>window.onload = function() { window.print(); }</script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        } else {
            toast.error('QR Image/PDF not available');
        }
    };

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
                    {/* SECOND ROW: OVERALL TRANSACTION STATUS STATS, ANALYTICS & VIRTUAL QR CODE */}
                    {/* ========================================================================= */}
                    <div className="row g-2 mb-2">
                        {/* LEFT SIDE (col-lg-8): SYSTEM ANALYTICS & OVERVIEW */}
                        <div className="col-lg-8">
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

                            {/* Service-wise Analytics */}
                            <div className="card border-0 shadow-sm rounded-3 bg-white mb-0 h-100">
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
                        </div>

                        {/* RIGHT SIDE (col-lg-4): VIRTUAL ACCOUNT QR CODE CARD & GENERATOR FORM */}
                        <div className="col-lg-4">
                            {!vaData ? (
                                /* Premium High-Contrast Card Design when no Virtual Account (vaData) exists */
                                <div className="card border-0 rounded-4 shadow-sm h-100 bg-white overflow-hidden" style={{ border: '1px solid #CBD5E1' }}>
                                    {/* Header */}
                                    <div className="card-header border-0 py-2.5 px-3" style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)' }}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-white bg-opacity-20 text-white rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', minWidth: '32px' }}>
                                                    <iconify-icon icon="solar:qr-code-bold-duotone" style={{ fontSize: '20px' }}></iconify-icon>
                                                </div>
                                                <div>
                                                    <h6 className="fw-bold mb-0 text-white tracking-wide d-flex align-items-center" style={{ fontSize: '13.5px' }}>
                                                        Create Virtual QR Code
                                                    </h6>
                                                    <small className="text-white-50" style={{ fontSize: '10px' }}>Linked with Verified KYC Bank Account</small>
                                                </div>
                                            </div>
                                            <span className="badge bg-warning text-dark fw-bold px-2 py-1 shadow-sm" style={{ fontSize: '9.5px', borderRadius: '6px' }}>
                                                ✓ KYC VERIFIED
                                            </span>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="card-body p-3 d-flex flex-column justify-content-between">
                                        <form onSubmit={handleGenerateQrSubmit} className="d-flex flex-column h-100 justify-content-between">
                                            {/* Hidden Inputs for Name, Account, IFSC */}
                                            <input type="hidden" name="name" value={qrForm.name} />
                                            <input type="hidden" name="account_number" value={qrForm.account_number} />
                                            <input type="hidden" name="account_ifsc" value={qrForm.account_ifsc} />

                                            {/* High-Contrast Account Details Display Box (Compact 50-50 Layout) */}
                                            <div className="d-flex flex-column gap-2 mb-2">

                                                {/* 1. Account Holder Name */}
                                                <div className="p-2 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }}>
                                                    <div className="d-flex align-items-center">
                                                        <div className="rounded-3 bg-primary-subtle text-primary p-1.5 me-2 d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', minWidth: '30px' }}>
                                                            <iconify-icon icon="solar:user-bold-duotone" style={{ fontSize: '16px' }}></iconify-icon>
                                                        </div>
                                                        <div className="w-100 overflow-hidden">
                                                            <span className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>Account Holder Name</span>
                                                            <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '12.5px', color: '#0F172A' }}>
                                                                {qrForm.name || data?.kyc_account?.name || user?.name || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 2. Account Number & IFSC Code 50% - 50% */}
                                                <div className="row g-2">
                                                    {/* Account Number (50%) */}
                                                    <div className="col-6">
                                                        <div className="p-2 rounded-3 border h-100" style={{ backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }}>
                                                            <div className="d-flex align-items-center">
                                                                <div className="rounded-3 bg-success-subtle text-success p-1.5 me-1.5 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', minWidth: '28px' }}>
                                                                    <iconify-icon icon="solar:card-bold-duotone" style={{ fontSize: '15px' }}></iconify-icon>
                                                                </div>
                                                                <div className="w-100 overflow-hidden">
                                                                    <span className="text-muted d-block fw-bold text-uppercase text-truncate" style={{ fontSize: '8.5px', letterSpacing: '0.4px' }}>Account No</span>
                                                                    <span className="fw-bold text-dark font-monospace text-truncate d-block" style={{ fontSize: '11.5px', color: '#0F172A' }}>
                                                                        {qrForm.account_number || data?.kyc_account?.account_number || 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* IFSC Code (50%) */}
                                                    <div className="col-6">
                                                        <div className="p-2 rounded-3 border h-100" style={{ backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }}>
                                                            <div className="d-flex align-items-center">
                                                                <div className="rounded-3 bg-info-subtle text-info p-1.5 me-1.5 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', minWidth: '28px' }}>
                                                                    <iconify-icon icon="solar:banknote-bold-duotone" style={{ fontSize: '15px' }}></iconify-icon>
                                                                </div>
                                                                <div className="w-100 overflow-hidden">
                                                                    <span className="text-muted d-block fw-bold text-uppercase text-truncate" style={{ fontSize: '8.5px', letterSpacing: '0.4px' }}>IFSC Code</span>
                                                                    <span className="fw-bold text-primary font-monospace text-truncate d-block" style={{ fontSize: '11.5px' }}>
                                                                        {qrForm.account_ifsc || data?.kyc_account?.ifsc_code || 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Fallback inputs if KYC bank details are missing */}
                                                {(!qrForm.account_number || !qrForm.account_ifsc) && (
                                                    <div className="p-2 bg-warning-subtle rounded-3 border border-warning">
                                                        <div className="text-warning-emphasis fw-bold mb-1" style={{ fontSize: '10px' }}>
                                                            <iconify-icon icon="solar:danger-triangle-bold" className="me-1 align-middle"></iconify-icon>
                                                            KYC Bank details missing. Please enter below:
                                                        </div>
                                                        <div className="row g-1.5">
                                                            <div className="col-6">
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm rounded-2 fw-bold"
                                                                    placeholder="Account Number"
                                                                    value={qrForm.account_number}
                                                                    onChange={(e) => setQrForm(prev => ({ ...prev, account_number: e.target.value }))}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="col-6">
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm rounded-2 fw-bold text-uppercase"
                                                                    placeholder="IFSC Code"
                                                                    value={qrForm.account_ifsc}
                                                                    onChange={(e) => setQrForm(prev => ({ ...prev, account_ifsc: e.target.value.toUpperCase() }))}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Generate Button */}
                                            <button
                                                type="submit"
                                                disabled={qrLoading}
                                                className="btn btn-primary btn-sm w-100 rounded-pill py-2.5 fw-bold shadow-sm d-flex align-items-center justify-content-center text-white"
                                                style={{ fontSize: '12.5px', background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)', border: 'none' }}
                                            >
                                                {qrLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        &nbsp;Generating QR Code...
                                                    </>
                                                ) : (
                                                    <>
                                                        <iconify-icon icon="solar:qr-code-bold" className="me-2 fs-5 text-warning"></iconify-icon>
                                                        &nbsp;Click to Generate Virtual QR
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ) : (
                                /* Rendered when Virtual Account (vaData) exists */
                                <div className="card border-0 rounded-4 shadow-sm h-100 bg-white overflow-hidden" style={{ border: '1px solid #CBD5E1' }}>
                                    {/* Header */}
                                    <div className="card-header border-0 py-2.5 px-3" style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)' }}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-white bg-opacity-20 text-white rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', minWidth: '32px' }}>
                                                    <iconify-icon icon="solar:qr-code-bold-duotone" style={{ fontSize: '20px' }}></iconify-icon>
                                                </div>
                                                <div>
                                                    <h6 className="fw-bold mb-0 text-white tracking-wide d-flex align-items-center" style={{ fontSize: '13.5px' }}>
                                                        UPI Virtual QR Code
                                                    </h6>
                                                    <small className="text-white-50" style={{ fontSize: '10px' }}>Linked with Verified KYC Bank Account</small>
                                                </div>
                                            </div>
                                            <span className="badge bg-warning text-dark fw-bold px-2 py-1 shadow-sm" style={{ fontSize: '9.5px', borderRadius: '6px' }}>
                                                ✓ ACTIVE
                                            </span>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="card-body p-3 d-flex align-items-center">
                                        <div className="row g-2 align-items-center w-100 mx-0">
                                            {/* LEFT SIDE: QR CODE */}
                                            <div className="col-5 text-center p-0">
                                                <div className="bg-white shadow-sm p-2 rounded-3 border d-inline-block mw-100">
                                                    {qrImageUrl ? (
                                                        <img
                                                            src={qrImageUrl}
                                                            alt="QR Code"
                                                            className="img-fluid rounded-2"
                                                            style={{ width: '125px', height: '125px', objectFit: 'contain' }}
                                                        />
                                                    ) : (
                                                        <div className="p-3 text-muted fw-bold" style={{ fontSize: '11px' }}>QR Code Ready</div>
                                                    )}
                                                </div>
                                                <div className="text-dark fw-bold mt-1.5 d-flex align-items-center justify-content-center" style={{ fontSize: '11px', color: '#1E293B' }}>
                                                    <iconify-icon icon="solar:camera-bold-duotone" className="me-1 text-primary" style={{ fontSize: '14px' }}></iconify-icon>
                                                    Scan &amp; Add Fund
                                                </div>
                                            </div>

                                            {/* RIGHT SIDE: UPI ID CARD & BUTTONS */}
                                            <div className="col-7 ps-2 pe-0 d-flex flex-column justify-content-center">
                                                {/* UPI ID BOX CARD */}
                                                <div className="p-2.5 rounded-3 border mb-2.5 shadow-xs" style={{ backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }}>
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <span className="text-muted fw-bold text-uppercase d-flex align-items-center" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>
                                                            <iconify-icon icon="solar:wallet-money-bold-duotone" className="me-1 text-primary" style={{ fontSize: '13px' }}></iconify-icon>
                                                            Virtual UPI ID
                                                        </span>
                                                        {copiedField === 'upi' && (
                                                            <span className="badge bg-success-subtle text-success fw-bold px-1.5 py-0.5" style={{ fontSize: '8.5px' }}>
                                                                ✓ Copied
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center gap-1">
                                                        <span className="fw-bold text-dark font-monospace text-truncate user-select-all" style={{ fontSize: '12.5px', color: '#0F172A' }} title={vaData.virtual_upi_handle || vaData.virtual_account_number}>
                                                            {vaData.virtual_upi_handle || vaData.virtual_account_number || 'N/A'}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-white border rounded-pill px-2 py-0.5 d-flex align-items-center text-primary shadow-xs flex-shrink-0"
                                                            onClick={() => handleCopy(vaData.virtual_upi_handle || vaData.virtual_account_number || '', 'upi')}
                                                            title="Copy UPI ID"
                                                            style={{ fontSize: '10.5px', fontWeight: '600', backgroundColor: '#FFFFFF' }}
                                                        >
                                                            <iconify-icon icon={copiedField === 'upi' ? "solar:check-circle-bold" : "solar:copy-bold"} className="me-1" style={{ fontSize: '13px', color: copiedField === 'upi' ? '#10B981' : '#2563EB' }}></iconify-icon>
                                                            {copiedField === 'upi' ? 'Copied' : 'Copy'}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* ACTION BUTTONS: DOWNLOAD QR & SHARE QR WITH MARGIN/GAP */}
                                                <div className="d-flex flex-column gap-2">
                                                    {/* 1. DOWNLOAD QR BUTTON */}
                                                    <button
                                                        type="button"
                                                        className="btn btn-success btn-sm rounded-pill py-2 px-3 fw-bold d-flex align-items-center justify-content-center text-white shadow-sm text-decoration-none hover-scale"
                                                        onClick={handleDownloadPdf}
                                                        style={{ fontSize: '12px', background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)', border: 'none' }}
                                                    >
                                                        <iconify-icon icon="solar:download-minimalistic-bold-duotone" className="me-1.5 fs-5"></iconify-icon>
                                                        Download QR
                                                    </button>

                                                    {/* 2. SHARE QR BUTTON */}
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-sm rounded-pill py-2 px-3 fw-bold d-flex align-items-center justify-content-center shadow-sm text-decoration-none hover-scale"
                                                        onClick={() => handleShare(`UPI ID: ${vaData.virtual_upi_handle || vaData.virtual_account_number || ''}`, 'Share Payment QR')}
                                                        style={{ fontSize: '12px', borderColor: '#2563EB', color: '#2563EB' }}
                                                    >
                                                        <iconify-icon icon="solar:share-bold-duotone" className="me-1.5 fs-5"></iconify-icon>
                                                        Share QR
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
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