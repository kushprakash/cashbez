import React, { useContext, useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../core/hooks/context';
import Pageheader from '../layouts/Pageheader';
import { toast } from 'react-toastify';
import AgentDashboard from './AgentDashboard';
import MasterDashboard from '../pages/MasterDashboard';
// Completely isolated Chart Component to prevent DOM node access errors
// Modern React Chart Component following current best practices (2024-2025)
// Memoized to prevent unnecessary re-renders
const ModernChart = React.memo(({ type, height, options, series, fallback = null }) => {
    const [chartState, setChartState] = useState({
        Chart: null,
        loading: true,
        error: false,
        mounted: false
    });
    const chartInstanceRef = useRef(null);
    const containerRef = useRef(null);
    const mountedRef = useRef(false);


    useEffect(() => {
        mountedRef.current = true;

        // Dynamic import following current React patterns
        const loadChart = async () => {
            try {
                // Add small delay to ensure DOM is ready
                await new Promise(resolve => setTimeout(resolve, 100));

                // Use standard import pattern recommended by ApexCharts docs
                const { default: Chart } = await import('react-apexcharts');

                if (mountedRef.current) {
                    setChartState(prev => ({
                        ...prev,
                        Chart,
                        loading: false,
                        mounted: true
                    }));
                }
            } catch (error) {
                console.warn('Chart loading failed:', error);
                if (mountedRef.current) {
                    setChartState(prev => ({
                        ...prev,
                        error: true,
                        loading: false
                    }));
                }
            }
        };

        loadChart();

        return () => {
            mountedRef.current = false;
            // Don't try to destroy chart instance here - let react-apexcharts handle it
            chartInstanceRef.current = null;
        };
    }, []);

    // Validate chart data - handle different chart types
    const isValidData = useMemo(() => {
        if (!series || !Array.isArray(series)) return false;

        // For pie, donut, radialBar charts - series is a flat array of numbers
        if (['pie', 'donut', 'radialBar'].includes(type)) {
            return series.length > 0 && series.some(value => value != null && value > 0);
        }

        // For other charts - series is an array of objects with data property
        return series.some(s => s.data && Array.isArray(s.data) && s.data.length > 0);
    }, [series, type]);

    // Loading state
    if (chartState.loading) {
        return (
            <div
                ref={containerRef}
                className="d-flex align-items-center justify-content-center"
                style={{ height: height || 200 }}
            >
                <div className="text-center">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading chart...</span>
                    </div>
                    <div className="mt-2 small text-muted">Loading chart...</div>
                </div>
            </div>
        );
    }

    // Error state
    if (chartState.error || !chartState.Chart) {
        return fallback || (
            <div
                ref={containerRef}
                className="d-flex align-items-center justify-content-center"
                style={{ height: height || 200 }}
            >
                <div className="text-center text-muted">
                    <iconify-icon icon="solar:chart-broken" className="fs-4 mb-2"></iconify-icon>
                    <div>Chart temporarily unavailable</div>
                </div>
            </div>
        );
    }

    // No data state
    if (!isValidData) {
        return (
            <div
                ref={containerRef}
                className="d-flex align-items-center justify-content-center"
                style={{ height: height || 200 }}
            >
                <div className="text-center text-muted">
                    <iconify-icon icon="solar:chart-outline" className="fs-4 mb-2"></iconify-icon>
                    <div>No data available</div>
                </div>
            </div>
        );
    }

    const { Chart } = chartState;

    // Enhanced chart options following ApexCharts best practices
    const safeOptions = {
        chart: {
            id: `chart-${type}-${Math.random().toString(36).substr(2, 9)}`, // Add unique ID
            fontFamily: "'Inter', sans-serif",
            toolbar: { show: false },
            sparkline: { enabled: false },
            animations: {
                enabled: true,
                speed: 400,
                animateGradually: {
                    enabled: true,
                    delay: 150
                }
            },
            ...options?.chart
        },
        theme: {
            mode: 'light',
            ...options?.theme
        },
        responsive: [{
            breakpoint: 768,
            options: {
                chart: { width: "100%" },
                legend: { position: 'bottom' }
            }
        }],
        ...options
    };

    return (
        <div ref={containerRef} style={{ width: '100%', height: height || 200 }}>
            <Chart
                options={safeOptions}
                series={series}
                type={type}
                height={height}
                width="100%"
            />
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function - only re-render if these props actually change
    return (
        prevProps.type === nextProps.type &&
        prevProps.height === nextProps.height &&
        JSON.stringify(prevProps.series) === JSON.stringify(nextProps.series) &&
        JSON.stringify(prevProps.options) === JSON.stringify(nextProps.options)
    );
});

// Chart-specific error boundary
class ChartErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.warn('Chart error caught:', error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="d-flex align-items-center justify-content-center"
                    style={{ height: this.props.height || 200 }}>
                    <div className="text-center text-muted">
                        <iconify-icon icon="solar:chart-broken" className="fs-4 mb-2"></iconify-icon>
                        <div>Chart unavailable</div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Main SafeChart component - uses ModernChart approach with error boundary
// Memoized to prevent unnecessary re-renders from parent state changes
const SafeChart = React.memo(({ type, height, options, series, fallback = null }) => {
    return (
        <ChartErrorBoundary height={height}>
            <ModernChart
                type={type}
                height={height}
                options={options}
                series={series}
                fallback={fallback}
            />
        </ChartErrorBoundary>
    );
}, (prevProps, nextProps) => {
    // Custom comparison - only re-render if props actually change
    return (
        prevProps.type === nextProps.type &&
        prevProps.height === nextProps.height &&
        JSON.stringify(prevProps.series) === JSON.stringify(nextProps.series) &&
        JSON.stringify(prevProps.options) === JSON.stringify(nextProps.options)
    );
});

const BankingDashboard = ({ dashboardData, dashboardError, selectedModule }) => {
    const { userData: user, logout } = useContext(AuthContext) || {};
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedPeriod, setSelectedPeriod] = useState('today');
    const [animatedValues, setAnimatedValues] = useState({});
    const [isAllowed, setIsAllowed] = useState(user ? (user.role == 1 || user.role == 2 || user.role == 10) : true);

    if (user && (user.role == 1 || user.role == '1' || user.role == 2 || user.role == '2')) {
        return <MasterDashboard dashboardData={dashboardData} />;
    }

    if (user && user.role > 2) {
        return <AgentDashboard dashboardData={dashboardData} user={user} />;
    }

    useEffect(() => {
        if (user) {
            setIsAllowed(user.role == 1 || user.role == 2 || user.role == 10);
        }
    }, [user]);

    // Memoize helper functions to prevent unnecessary re-renders
    const formatCurrency = React.useCallback((amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount || 0);
    }, []);

    const formatNumber = React.useCallback((number) => {
        return new Intl.NumberFormat('en-IN').format(number || 0);
    }, []);

    const getDataForPeriod = React.useCallback((dataObj, period = selectedPeriod) => {
        if (!dataObj) return { success: { count: 0, amount: 0 }, failed: { count: 0, amount: 0 }, pending: { count: 0, amount: 0 } };
        return dataObj[period] || { success: { count: 0, amount: 0 }, failed: { count: 0, amount: 0 }, pending: { count: 0, amount: 0 } };
    }, [selectedPeriod]);

    const calculateSuccessRate = React.useCallback((data) => {
        const total = (data.success?.count || 0) + (data.failed?.count || 0) + (data.pending?.count || 0);
        if (total === 0) return 0;
        return Math.round(((data.success?.count || 0) / total) * 100);
    }, []);

    const capitalizeText = React.useCallback((text) => {
        return text
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }, []);

    const getTimeBasedGreeting = React.useCallback((name) => {
        name = capitalizeText(name.split(" ")[0]);
        const hours = new Date().getHours();
        if (hours < 12) return `🌞 Good Morning! ${name}, Have a bright and beautiful day!`;
        if (hours < 18) return `☀️ Good Afternoon!  ${name}, Keep shining and stay positive!`;
        return `🌙 Good Evening! ${name}, Relax and unwind, you deserve it!`;
    }, [capitalizeText]);

    const getFormattedTime = React.useCallback(() => {
        const options = {
            timeZone: 'Asia/Kolkata',
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };

        const formatted = currentTime.toLocaleString('en-GB', options);
        // Format: "Wed, 29 Oct 2025, 10:18:00 am" -> "Wed 29 Oct, 2025 at 10:18:00 AM"
        return formatted
            .replace(/,\s*/g, ' ')  // Remove commas
            .replace(/(\d{4})\s+(\d{1,2}):/, '$1 at $2:')  // Add "at" before time
            .replace(/\s(am|pm)$/i, (match) => match.toUpperCase())  // Uppercase AM/PM
            .replace(/(\w{3})\s+(\d{2})\s+(\w{3})\s+(\d{4})/, '$1 $2 $3, $4');  // Add comma after month
    }, [currentTime]);

    // Get base URL for referral links
    const getUrl = React.useCallback(() => {
        return window.location.origin;
    }, []);

    // Copy referral link to clipboard
    const copyReferralLink = React.useCallback((e) => {
        e.preventDefault();
        const referralUrl = `${window.location.origin}/referral/${user?.mid}`;

        // Modern clipboard API with fallback
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(referralUrl)
                .then(() => {
                    toast.success('Referral link copied to clipboard!', {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                })
                .catch((err) => {
                    console.error('Failed to copy:', err);
                    fallbackCopyTextToClipboard(referralUrl);
                });
        } else {
            fallbackCopyTextToClipboard(referralUrl);
        }
    }, [user?.mid]);

    // Fallback copy method for older browsers
    const fallbackCopyTextToClipboard = (text) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                toast.success('Referral link copied to clipboard!', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } else {
                toast.error('Failed to copy referral link', {
                    position: "top-right",
                    autoClose: 2000,
                });
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
            toast.error('Failed to copy referral link', {
                position: "top-right",
                autoClose: 2000,
            });
        }

        document.body.removeChild(textArea);
    };

    // Global error handler for ApexCharts
    useEffect(() => {
        const handleGlobalError = (event) => {
            if (event.error && event.error.message &&
                (event.error.message.includes('node') || event.error.message.includes('ApexCharts'))) {
                console.warn('Global ApexCharts error caught and suppressed:', event.error);
                event.preventDefault();
                return false;
            }
        };

        window.addEventListener('error', handleGlobalError);
        window.addEventListener('unhandledrejection', handleGlobalError);

        return () => {
            window.removeEventListener('error', handleGlobalError);
            window.removeEventListener('unhandledrejection', handleGlobalError);
        };
    }, []);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Animate numbers
    useEffect(() => {
        if (dashboardData && dashboardData.accounts) {
            const values = {
                totalBalance: dashboardData.accounts.total_balance,
                availableBalance: dashboardData.accounts.available_balance,
                holdBalance: dashboardData.accounts.hold_balance,
                totalAccounts: dashboardData.accounts.count
            };
            setAnimatedValues(values);
        }
    }, [dashboardData]);

    // Period Filter Component - Memoized component
    const PeriodFilter = React.memo(({ onPeriodChange, activePeriod }) => (
        <div className="btn-group btn-group-sm" role="group">
            {[
                { key: 'today', label: 'Today' },
                { key: 'this_month', label: 'This Month' },
                { key: 'total', label: 'Total' }
            ].map(period => (
                <button
                    key={period.key}
                    type="button"
                    className={`btn ${activePeriod === period.key ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => onPeriodChange(period.key)}
                    style={{ fontSize: '11px', padding: '4px 12px' }}
                >
                    {period.label}
                </button>
            ))}
        </div>
    ));

    // Show error state if data failed to load
    if (dashboardError) {
        return (
            <>
                <Pageheader mainheading="Banking Dashboard" parentfolder="Banking" activepage="Dashboard" />
                <div className="page-content-box">
                    <div className="container-fluid">
                        <div className="alert alert-danger text-center">
                            <iconify-icon icon="solar:danger-triangle-broken" class="fs-1 mb-3"></iconify-icon>
                            <h4>Error Loading Dashboard</h4>
                            <p>{dashboardError}</p>
                            <button className="btn btn-primary" onClick={() => window.location.reload()}>
                                <iconify-icon icon="solar:refresh-broken" class="me-2"></iconify-icon>
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Show loading state if data is not available yet
    if (!dashboardData) {
        return (
            <>
                <Pageheader mainheading="Banking Dashboard" parentfolder="Banking" activepage="Dashboard" />
                <div className="page-content-box">
                    <div className="container-fluid">
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3">Loading dashboard data...</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Note: ChartErrorBoundary is now integrated into SafeChart component
    return (
        <>
            <div className="banking-dashboard">
                {/* Modern Banking Header */}
                <header className="bg-white border-bottom py-3 px-2 shadow-sm mb-4 rounded-3">
                    <div className="container-fluid h-100">
                        <div className="row h-100 align-items-center">

                            <div className="col-md-4">
                                <div className="d-flex align-items-center">
                                    <iconify-icon icon="solar:card-broken" class="fs-1 text-primary me-2"></iconify-icon>
                                    <div>
                                        <h4 className="mb-0 fw-semibold">Banking</h4>
                                        <small>Professional Management Suite</small>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="d-flex align-items-center ">
                                    <div className="me-4">
                                        <small style={{ color: '#7B8A99', fontSize: '0.75rem' }}>Current Time (IST)</small>
                                        <div className="fw-medium" style={{ color: '#2E3B4E', fontSize: '0.800rem' }}>
                                            {getFormattedTime()}
                                        </div>
                                    </div>

                                </div>
                            </div>


                            <div className="col-md-2">
                                <div>
                                    <small style={{ color: '#7B8A99', fontSize: '0.75rem' }}>Welcome</small>
                                    <div className="fw-medium" style={{ color: '#2E3B4E', fontSize: '0.875rem' }}>
                                        {user?.name || 'Administrator'} - {user?.mid || 'Administrator'}
                                    </div>
                                </div>

                            </div>

                            <div className="col-md-2">
                                <div className="d-flex align-items-center ">
                                    <button
                                        className="btn btn-sm d-flex align-items-center"
                                        onClick={() => window.location.reload()}
                                        style={{
                                            backgroundColor: 'rgba(31, 120, 255, 0.1)',
                                            border: '1px solid rgba(31, 120, 255, 0.2)',
                                            color: '#1F78FF',
                                            borderRadius: '6px',
                                            padding: '6px 12px'
                                        }}
                                    >
                                        <iconify-icon icon="solar:refresh-broken" className="me-1" style={{ fontSize: '14px' }}></iconify-icon>
                                        Refresh
                                    </button>
                                    <div
                                        className="m-3 rounded-circle d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            backgroundColor: '#1F78FF',
                                            color: 'white',
                                            fontSize: '14px',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {(user?.name || 'A').charAt(0).toUpperCase()}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </header>

                {/* Compact Referral Link Section */}
                <div className="container-fluid mb-3 d-none">
                    <div
                        className="position-relative overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '12px',
                            padding: '16px 20px',
                            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        <div className="row align-items-center g-3">
                            <div className="col-auto">
                                <div
                                    className="rounded-2 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    <iconify-icon
                                        icon="solar:share-bold"
                                        style={{ fontSize: '20px', color: '#ffffff' }}
                                    ></iconify-icon>
                                </div>
                            </div>

                            <div className="col-auto">
                                <h6 className="mb-0 d-flex align-items-center" style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>
                                    Referral Link
                                    <span
                                        className="badge ms-2"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.25)',
                                            color: '#ffffff',
                                            fontSize: '9px',
                                            fontWeight: '600',
                                            padding: '3px 8px',
                                            borderRadius: '10px'
                                        }}
                                    >
                                        Share & Earn
                                    </span>
                                </h6>
                            </div>

                            <div className="col">
                                <div>
                                    {/* Input Field - Desktop: with button inside, Mobile: full width */}
                                    <div className="position-relative">
                                        <input
                                            type="text"
                                            readOnly
                                            value={`${getUrl()}/referral/${user?.mid}`}
                                            className="form-control"
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.95)',
                                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                                borderRadius: '10px',
                                                padding: '10px 16px',
                                                paddingRight: window.innerWidth >= 768 ? '120px' : '16px',
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                color: '#667eea',
                                                fontFamily: 'Monaco, Consolas, monospace',
                                                letterSpacing: '0.3px',
                                                cursor: 'text',
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                                            }}
                                            onClick={(e) => e.target.select()}
                                        />
                                        {/* Desktop Copy Button - Inside Input */}
                                        <button
                                            onClick={copyReferralLink}
                                            className="btn btn-sm position-absolute d-none d-md-block"
                                            style={{
                                                top: '50%',
                                                right: '6px',
                                                transform: 'translateY(-50%)',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '8px 16px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                                                transition: 'all 0.2s ease',
                                                minWidth: '100px'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                                            }}
                                        >
                                            <iconify-icon
                                                icon="solar:copy-bold"
                                                className="me-1"
                                                style={{ fontSize: '14px' }}
                                            ></iconify-icon>
                                            Copy
                                        </button>
                                    </div>

                                    {/* Mobile Copy Button - Below Input, Centered */}
                                    <div className="d-md-none text-center mt-2">
                                        <button
                                            onClick={copyReferralLink}
                                            className="btn btn-sm"
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '10px 24px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                                                transition: 'all 0.2s ease',
                                                minWidth: '140px'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                                            }}
                                        >
                                            <iconify-icon
                                                icon="solar:copy-bold"
                                                className="me-2"
                                                style={{ fontSize: '16px' }}
                                            ></iconify-icon>
                                            Copy Link
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container-fluid" >
                    {/* Greeting & Period Filter */}
                    <div className="row align-items-center my-3">
                        <div className="col-md-6">
                            <h5 className="mb-1 fw-semibold" style={{ color: '#2E3B4E', fontSize: '1.25rem' }}>
                                {getTimeBasedGreeting(user?.name || 'User')}
                            </h5>
                            <p className="mb-0" style={{ color: '#7B8A99', fontSize: '0.875rem' }}>
                                Here's what's happening with your banking operations today.
                            </p>
                        </div>
                        <div className="col-md-6 d-flex justify-content-md-end mt-3 mt-md-0">
                            <PeriodFilter onPeriodChange={setSelectedPeriod} activePeriod={selectedPeriod} />
                        </div>
                    </div>

                    {isAllowed && (
                        <div>
                            {/* Modern Account Overview Cards */}
                            {/* DUAL WALLET SUMMARY BOXES (TRADE WALLET primary_status=1 & UTILITY WALLET primary_status=0) */}
                            <div className="row g-3 my-2">
                                {(() => {
                                    const tradeWallet = dashboardData.accounts?.trade_wallet || {
                                        count: (dashboardData.user_wallets || []).filter(w => w.is_primary || w.primary_status == 1).length,
                                        total_balance: (dashboardData.user_wallets || []).filter(w => w.is_primary || w.primary_status == 1).reduce((acc, curr) => acc + Number(curr.balance || 0), 0),
                                        hold_balance: (dashboardData.user_wallets || []).filter(w => w.is_primary || w.primary_status == 1).reduce((acc, curr) => acc + Number(curr.hold_amount || 0), 0),
                                        available_balance: (dashboardData.user_wallets || []).filter(w => w.is_primary || w.primary_status == 1).reduce((acc, curr) => acc + (Number(curr.balance || 0) - Number(curr.hold_amount || 0)), 0),
                                    };

                                    const utilityWallet = dashboardData.accounts?.utility_wallet || {
                                        count: (dashboardData.user_wallets || []).filter(w => !w.is_primary && w.primary_status != 1).length,
                                        total_balance: (dashboardData.user_wallets || []).filter(w => !w.is_primary && w.primary_status != 1).reduce((acc, curr) => acc + Number(curr.balance || 0), 0),
                                        hold_balance: (dashboardData.user_wallets || []).filter(w => !w.is_primary && w.primary_status != 1).reduce((acc, curr) => acc + Number(curr.hold_amount || 0), 0),
                                        available_balance: (dashboardData.user_wallets || []).filter(w => !w.is_primary && w.primary_status != 1).reduce((acc, curr) => acc + (Number(curr.balance || 0) - Number(curr.hold_amount || 0)), 0),
                                    };

                                    return (
                                        <>
                                            {/* Trade Wallet Card (primary_status = 1) */}
                                            <div className="col-12 col-md-6">
                                                <div className="card border-0 shadow-sm rounded-3 bg-white border-start border-4 border-success p-3 h-100">
                                                    <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="p-2 rounded-3 bg-success bg-opacity-10 text-success">
                                                                <iconify-icon icon="solar:wallet-money-broken" class="fs-4"></iconify-icon>
                                                            </div>
                                                            <div>
                                                                <h6 className="fw-bold text-dark mb-0">Trade Wallet</h6>
                                                                <small className="text-muted" style={{ fontSize: '11px' }}>Primary Status = 1 (Main Wallet)</small>
                                                            </div>
                                                        </div>
                                                        <span className="badge bg-success bg-opacity-10 text-success px-2 py-1">
                                                            {tradeWallet.count} Accounts
                                                        </span>
                                                    </div>

                                                    <div className="row text-center g-2">
                                                        <div className="col-4">
                                                            <small className="text-muted d-block" style={{ fontSize: '11px' }}>Total Balance</small>
                                                            <strong className="text-dark fs-6">{formatCurrency(tradeWallet.total_balance)}</strong>
                                                        </div>
                                                        <div className="col-4">
                                                            <small className="text-muted d-block" style={{ fontSize: '11px' }}>Hold Balance</small>
                                                            <strong className="text-warning fs-6">{formatCurrency(tradeWallet.hold_balance)}</strong>
                                                        </div>
                                                        <div className="col-4">
                                                            <small className="text-muted d-block" style={{ fontSize: '11px' }}>Available Balance</small>
                                                            <strong className="text-success fs-6">{formatCurrency(tradeWallet.available_balance)}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Utility Wallet Card (primary_status = 0) */}
                                            <div className="col-12 col-md-6">
                                                <div className="card border-0 shadow-sm rounded-3 bg-white border-start border-4 border-info p-3 h-100">
                                                    <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="p-2 rounded-3 bg-info bg-opacity-10 text-info">
                                                                <iconify-icon icon="solar:card-broken" class="fs-4"></iconify-icon>
                                                            </div>
                                                            <div>
                                                                <h6 className="fw-bold text-dark mb-0">Utility Wallet</h6>
                                                                <small className="text-muted" style={{ fontSize: '11px' }}>Primary Status = 0 (Secondary Wallet)</small>
                                                            </div>
                                                        </div>
                                                        <span className="badge bg-info bg-opacity-10 text-info px-2 py-1">
                                                            {utilityWallet.count} Accounts
                                                        </span>
                                                    </div>

                                                    <div className="row text-center g-2">
                                                        <div className="col-4">
                                                            <small className="text-muted d-block" style={{ fontSize: '11px' }}>Total Balance</small>
                                                            <strong className="text-dark fs-6">{formatCurrency(utilityWallet.total_balance)}</strong>
                                                        </div>
                                                        <div className="col-4">
                                                            <small className="text-muted d-block" style={{ fontSize: '11px' }}>Hold Balance</small>
                                                            <strong className="text-warning fs-6">{formatCurrency(utilityWallet.hold_balance)}</strong>
                                                        </div>
                                                        <div className="col-4">
                                                            <small className="text-muted d-block" style={{ fontSize: '11px' }}>Available Balance</small>
                                                            <strong className="text-info fs-6">{formatCurrency(utilityWallet.available_balance)}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            {/* AEPS Analytics with ApexCharts */}
                            <div className="row g-6 my-3">
                                <div className="col-12 col-lg-8">
                                    <div
                                        className="bg-white h-100"
                                        style={{
                                            borderRadius: '16px',
                                            border: '2px solid #E0E7FF',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                            padding: '24px',
                                            background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)'
                                        }}
                                    >
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <div className="d-flex align-items-center">
                                                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px', backgroundColor: '#4F46E5', boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.4)' }}>
                                                    <iconify-icon icon="solar:card-transfer-broken" className="fs-4" style={{ color: '#FFFFFF' }}></iconify-icon>
                                                </div>
                                                <div>
                                                    <h5 className="mb-0 fw-bold" style={{ color: '#111827', fontSize: '16px' }}>AEPS Transaction Analytics</h5>
                                                    <small style={{ color: '#6B7280', fontWeight: '500' }}>Aadhaar Enabled Payment System Performance</small>
                                                </div>
                                            </div>
                                        </div>

                                        {/* AEPS Charts Section */}
                                        <div className="row g-4 mb-4 d-none">
                                            {/* Cash Withdrawal & Aadhaar Pay - Stacked Column Chart */}
                                            <div className="col-lg-6 d-none">
                                                <div className="p-3 rounded" style={{ backgroundColor: 'rgba(31, 120, 255, 0.02)', border: '1px solid rgba(31, 120, 255, 0.1)' }}>
                                                    <div className="d-flex align-items-center mb-3">
                                                        <iconify-icon icon="solar:wallet-money-broken" className="fs-5 me-2" style={{ color: '#1F78FF' }}></iconify-icon>
                                                        <div>
                                                            <h6 className="mb-0 fw-semibold" style={{ color: '#2E3B4E', fontSize: '14px' }}>Monetary Transactions</h6>
                                                            <small style={{ color: '#7B8A99', fontSize: '11px' }}>Cash Withdrawal & Aadhaar Pay</small>
                                                        </div>
                                                    </div>
                                                    {dashboardData.aeps ? (
                                                        <SafeChart
                                                            type="bar"
                                                            height={280}
                                                            options={{
                                                                chart: {
                                                                    stacked: true,
                                                                    toolbar: { show: false },
                                                                    background: 'transparent'
                                                                },
                                                                colors: ['#27AE60', '#EB5757', '#F2C94C'],
                                                                plotOptions: {
                                                                    bar: {
                                                                        horizontal: false,
                                                                        borderRadius: 6,
                                                                        columnWidth: '55%',
                                                                        dataLabels: {
                                                                            position: 'top'
                                                                        }
                                                                    }
                                                                },
                                                                dataLabels: {
                                                                    enabled: false
                                                                },
                                                                xaxis: {
                                                                    categories: ['Cash Withdrawal', 'Aadhaar Pay'],
                                                                    labels: {
                                                                        style: {
                                                                            colors: '#7B8A99',
                                                                            fontSize: '11px',
                                                                            fontWeight: 500
                                                                        }
                                                                    }
                                                                },
                                                                yaxis: {
                                                                    labels: {
                                                                        style: { colors: '#7B8A99', fontSize: '11px' },
                                                                        formatter: (val) => val >= 1000 ? `₹${(val / 1000).toFixed(0)}K` : `₹${val}`
                                                                    }
                                                                },
                                                                legend: {
                                                                    position: 'top',
                                                                    horizontalAlign: 'right',
                                                                    labels: { colors: '#7B8A99' },
                                                                    fontSize: '11px',
                                                                    markers: {
                                                                        width: 10,
                                                                        height: 10,
                                                                        radius: 2
                                                                    }
                                                                },
                                                                tooltip: {
                                                                    y: {
                                                                        formatter: (val) => `₹${val.toLocaleString()}`,
                                                                        title: {
                                                                            formatter: (seriesName) => seriesName + ':'
                                                                        }
                                                                    },
                                                                    style: {
                                                                        fontSize: '12px'
                                                                    }
                                                                },
                                                                grid: {
                                                                    borderColor: '#f1f1f1',
                                                                    strokeDashArray: 3,
                                                                    padding: {
                                                                        top: 0,
                                                                        right: 10,
                                                                        bottom: 0,
                                                                        left: 10
                                                                    }
                                                                }
                                                            }}
                                                            series={[
                                                                {
                                                                    name: 'Success',
                                                                    data: [
                                                                        getDataForPeriod(dashboardData.aeps?.cw).success?.amount || 0,
                                                                        getDataForPeriod(dashboardData.aeps?.ap).success?.amount || 0
                                                                    ]
                                                                },
                                                                {
                                                                    name: 'Failed',
                                                                    data: [
                                                                        getDataForPeriod(dashboardData.aeps?.cw).failed?.amount || 0,
                                                                        getDataForPeriod(dashboardData.aeps?.ap).failed?.amount || 0
                                                                    ]
                                                                },
                                                                {
                                                                    name: 'Pending',
                                                                    data: [
                                                                        getDataForPeriod(dashboardData.aeps?.cw).pending?.amount || 0,
                                                                        getDataForPeriod(dashboardData.aeps?.ap).pending?.amount || 0
                                                                    ]
                                                                }
                                                            ]}
                                                        />
                                                    ) : (
                                                        <div className="d-flex align-items-center justify-content-center" style={{ height: 280 }}>
                                                            <div className="text-center text-muted">
                                                                <iconify-icon icon="solar:chart-broken" className="fs-4 mb-2"></iconify-icon>
                                                                <div style={{ fontSize: '12px' }}>Data not available</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Balance Enquiry & Mini Statement - Grouped Column Chart */}
                                            <div className="col-lg-6 d-none">
                                                <div className="p-3 rounded" style={{ backgroundColor: 'rgba(139, 92, 246, 0.02)', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                                                    <div className="d-flex align-items-center mb-3">
                                                        <iconify-icon icon="solar:clipboard-list-broken" className="fs-5 me-2" style={{ color: '#8B5CF6' }}></iconify-icon>
                                                        <div>
                                                            <h6 className="mb-0 fw-semibold" style={{ color: '#2E3B4E', fontSize: '14px' }}>Information Services</h6>
                                                            <small style={{ color: '#7B8A99', fontSize: '11px' }}>Balance Enquiry & Mini Statement</small>
                                                        </div>
                                                    </div>
                                                    {dashboardData.aeps ? (
                                                        <SafeChart
                                                            type="bar"
                                                            height={280}
                                                            options={{
                                                                chart: {
                                                                    stacked: false,
                                                                    toolbar: { show: false },
                                                                    background: 'transparent'
                                                                },
                                                                colors: ['#27AE60', '#EB5757', '#F2C94C'],
                                                                plotOptions: {
                                                                    bar: {
                                                                        horizontal: false,
                                                                        borderRadius: 6,
                                                                        columnWidth: '65%',
                                                                        dataLabels: {
                                                                            position: 'top'
                                                                        }
                                                                    }
                                                                },
                                                                dataLabels: {
                                                                    enabled: false
                                                                },
                                                                stroke: {
                                                                    show: true,
                                                                    width: 2,
                                                                    colors: ['transparent']
                                                                },
                                                                xaxis: {
                                                                    categories: ['Balance Enquiry', 'Mini Statement'],
                                                                    labels: {
                                                                        style: {
                                                                            colors: '#7B8A99',
                                                                            fontSize: '11px',
                                                                            fontWeight: 500
                                                                        }
                                                                    }
                                                                },
                                                                yaxis: {
                                                                    labels: {
                                                                        style: { colors: '#7B8A99', fontSize: '11px' },
                                                                        formatter: (val) => Math.round(val).toString()
                                                                    },
                                                                    title: {
                                                                        text: 'Transaction Count',
                                                                        style: {
                                                                            color: '#7B8A99',
                                                                            fontSize: '11px',
                                                                            fontWeight: 500
                                                                        }
                                                                    }
                                                                },
                                                                legend: {
                                                                    position: 'top',
                                                                    horizontalAlign: 'right',
                                                                    labels: { colors: '#7B8A99' },
                                                                    fontSize: '11px',
                                                                    markers: {
                                                                        width: 10,
                                                                        height: 10,
                                                                        radius: 2
                                                                    }
                                                                },
                                                                tooltip: {
                                                                    y: {
                                                                        formatter: (val) => `${val} transactions`,
                                                                        title: {
                                                                            formatter: (seriesName) => seriesName + ':'
                                                                        }
                                                                    },
                                                                    style: {
                                                                        fontSize: '12px'
                                                                    }
                                                                },
                                                                grid: {
                                                                    borderColor: '#f1f1f1',
                                                                    strokeDashArray: 3,
                                                                    padding: {
                                                                        top: 0,
                                                                        right: 10,
                                                                        bottom: 0,
                                                                        left: 10
                                                                    }
                                                                }
                                                            }}
                                                            series={[
                                                                {
                                                                    name: 'Success',
                                                                    data: [
                                                                        getDataForPeriod(dashboardData.aeps?.be).success?.count || 0,
                                                                        getDataForPeriod(dashboardData.aeps?.ms).success?.count || 0
                                                                    ]
                                                                },
                                                                {
                                                                    name: 'Failed',
                                                                    data: [
                                                                        getDataForPeriod(dashboardData.aeps?.be).failed?.count || 0,
                                                                        getDataForPeriod(dashboardData.aeps?.ms).failed?.count || 0
                                                                    ]
                                                                },
                                                                {
                                                                    name: 'Pending',
                                                                    data: [
                                                                        getDataForPeriod(dashboardData.aeps?.be).pending?.count || 0,
                                                                        getDataForPeriod(dashboardData.aeps?.ms).pending?.count || 0
                                                                    ]
                                                                }
                                                            ]}
                                                        />
                                                    ) : (
                                                        <div className="d-flex align-items-center justify-content-center" style={{ height: 280 }}>
                                                            <div className="text-center text-muted">
                                                                <iconify-icon icon="solar:chart-broken" className="fs-4 mb-2"></iconify-icon>
                                                                <div style={{ fontSize: '12px' }}>Data not available</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* AEPS Detailed Summary Stats */}
                                        <div className="row g-3">
                                            {/* Cash Withdrawal Summary */}
                                            <div className="col-md-6">
                                                <div className="p-3 rounded h-100" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                                        <div className="d-flex align-items-center">
                                                            <div className="rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px', backgroundColor: '#EEF2FF' }}>
                                                                <iconify-icon icon="solar:wallet-money-broken" className="fs-5" style={{ color: '#4F46E5' }}></iconify-icon>
                                                            </div>
                                                            <div>
                                                                <h6 className="mb-0 fw-bold" style={{ color: '#111827', fontSize: '14px' }}>Cash Withdrawal</h6>
                                                                <small style={{ color: '#6B7280', fontSize: '11px' }}>Monetary Transaction</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {(() => {
                                                        const cwData = getDataForPeriod(dashboardData.aeps?.cw);
                                                        const totalCount = (cwData.success?.count || 0) + (cwData.failed?.count || 0) + (cwData.pending?.count || 0);
                                                        const totalAmount = (cwData.success?.amount || 0) + (cwData.failed?.amount || 0) + (cwData.pending?.amount || 0);
                                                        const successRate = totalCount > 0 ? Math.round(((cwData.success?.count || 0) / totalCount) * 100) : 0;
                                                        return (
                                                            <>
                                                                <div className="row mb-3">
                                                                    <div className="col-6">
                                                                        <small style={{ color: '#6B7280', fontSize: '11px', fontWeight: '500' }}>Total Transactions</small>
                                                                        <div className="fw-bold" style={{ color: '#4F46E5', fontSize: '20px' }}>{formatNumber(totalCount)}</div>
                                                                    </div>
                                                                    <div className="col-6 text-end">
                                                                        <small style={{ color: '#6B7280', fontSize: '11px', fontWeight: '500' }}>Total Amount</small>
                                                                        <div className="fw-bold" style={{ color: '#111827', fontSize: '16px' }}>{formatCurrency(totalAmount)}</div>
                                                                    </div>
                                                                </div>

                                                                {/* Success Details */}
                                                                <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                                                                    <div className="d-flex align-items-center justify-content-between">
                                                                        <div>
                                                                            <small style={{ color: '#065F46', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>✓ SUCCESS</small>
                                                                            <div style={{ color: '#047857', fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>
                                                                                {formatNumber(cwData.success?.count || 0)} transactions
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-end">
                                                                            <div style={{ color: '#047857', fontSize: '14px', fontWeight: '700' }}>{formatCurrency(cwData.success?.amount || 0)}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Pending Details */}
                                                                <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
                                                                    <div className="d-flex align-items-center justify-content-between">
                                                                        <div>
                                                                            <small style={{ color: '#92400E', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>⏳ PENDING</small>
                                                                            <div style={{ color: '#B45309', fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>
                                                                                {formatNumber(cwData.pending?.count || 0)} transactions
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-end">
                                                                            <div style={{ color: '#B45309', fontSize: '14px', fontWeight: '700' }}>{formatCurrency(cwData.pending?.amount || 0)}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Failed Details */}
                                                                <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA' }}>
                                                                    <div className="d-flex align-items-center justify-content-between">
                                                                        <div>
                                                                            <small style={{ color: '#991B1B', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>✕ FAILED</small>
                                                                            <div style={{ color: '#DC2626', fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>
                                                                                {formatNumber(cwData.failed?.count || 0)} transactions
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-end">
                                                                            <div style={{ color: '#DC2626', fontSize: '14px', fontWeight: '700' }}>{formatCurrency(cwData.failed?.amount || 0)}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="d-flex justify-content-between align-items-center mt-3 pt-2" style={{ borderTop: '1px solid #E5E7EB' }}>
                                                                    <small style={{ color: '#6B7280', fontSize: '11px', fontWeight: '600' }}>Success Rate</small>
                                                                    <span className="badge px-3 py-1" style={{
                                                                        backgroundColor: successRate >= 70 ? '#10B981' : '#EF4444',
                                                                        color: '#FFFFFF',
                                                                        fontSize: '12px',
                                                                        fontWeight: '700'
                                                                    }}>{successRate}%</span>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </div>

                                            {/* Aadhaar Pay Summary */}
                                            <div className="col-md-6">
                                                <div className="p-3 rounded h-100" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                                        <div className="d-flex align-items-center">
                                                            <div className="rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px', backgroundColor: '#ECFDF5' }}>
                                                                <iconify-icon icon="solar:card-transfer-broken" className="fs-5" style={{ color: '#059669' }}></iconify-icon>
                                                            </div>
                                                            <div>
                                                                <h6 className="mb-0 fw-bold" style={{ color: '#111827', fontSize: '14px' }}>Aadhaar Pay</h6>
                                                                <small style={{ color: '#6B7280', fontSize: '11px' }}>Monetary Transaction</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {(() => {
                                                        const apData = getDataForPeriod(dashboardData.aeps?.ap);
                                                        const totalCount = (apData.success?.count || 0) + (apData.failed?.count || 0) + (apData.pending?.count || 0);
                                                        const totalAmount = (apData.success?.amount || 0) + (apData.failed?.amount || 0) + (apData.pending?.amount || 0);
                                                        const successRate = totalCount > 0 ? Math.round(((apData.success?.count || 0) / totalCount) * 100) : 0;
                                                        return (
                                                            <>
                                                                <div className="row mb-3">
                                                                    <div className="col-6">
                                                                        <small style={{ color: '#6B7280', fontSize: '11px', fontWeight: '500' }}>Total Transactions</small>
                                                                        <div className="fw-bold" style={{ color: '#059669', fontSize: '20px' }}>{formatNumber(totalCount)}</div>
                                                                    </div>
                                                                    <div className="col-6 text-end">
                                                                        <small style={{ color: '#6B7280', fontSize: '11px', fontWeight: '500' }}>Total Amount</small>
                                                                        <div className="fw-bold" style={{ color: '#111827', fontSize: '16px' }}>{formatCurrency(totalAmount)}</div>
                                                                    </div>
                                                                </div>

                                                                {/* Success Details */}
                                                                <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                                                                    <div className="d-flex align-items-center justify-content-between">
                                                                        <div>
                                                                            <small style={{ color: '#065F46', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>✓ SUCCESS</small>
                                                                            <div style={{ color: '#047857', fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>
                                                                                {formatNumber(apData.success?.count || 0)} transactions
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-end">
                                                                            <div style={{ color: '#047857', fontSize: '14px', fontWeight: '700' }}>{formatCurrency(apData.success?.amount || 0)}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Pending Details */}
                                                                <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
                                                                    <div className="d-flex align-items-center justify-content-between">
                                                                        <div>
                                                                            <small style={{ color: '#92400E', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>⏳ PENDING</small>
                                                                            <div style={{ color: '#B45309', fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>
                                                                                {formatNumber(apData.pending?.count || 0)} transactions
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-end">
                                                                            <div style={{ color: '#B45309', fontSize: '14px', fontWeight: '700' }}>{formatCurrency(apData.pending?.amount || 0)}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Failed Details */}
                                                                <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA' }}>
                                                                    <div className="d-flex align-items-center justify-content-between">
                                                                        <div>
                                                                            <small style={{ color: '#991B1B', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>✕ FAILED</small>
                                                                            <div style={{ color: '#DC2626', fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>
                                                                                {formatNumber(apData.failed?.count || 0)} transactions
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-end">
                                                                            <div style={{ color: '#DC2626', fontSize: '14px', fontWeight: '700' }}>{formatCurrency(apData.failed?.amount || 0)}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="d-flex justify-content-between align-items-center mt-3 pt-2" style={{ borderTop: '1px solid #E5E7EB' }}>
                                                                    <small style={{ color: '#6B7280', fontSize: '11px', fontWeight: '600' }}>Success Rate</small>
                                                                    <span className="badge px-3 py-1" style={{
                                                                        backgroundColor: successRate >= 70 ? '#10B981' : '#EF4444',
                                                                        color: '#FFFFFF',
                                                                        fontSize: '12px',
                                                                        fontWeight: '700'
                                                                    }}>{successRate}%</span>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </div>

                                            {/* Balance Enquiry Summary */}
                                            <div className="col-md-6">
                                                <div className="p-3 rounded h-100" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                                        <div className="d-flex align-items-center">
                                                            <div className="rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px', backgroundColor: '#F5F3FF' }}>
                                                                <iconify-icon icon="solar:clipboard-check-broken" className="fs-5" style={{ color: '#7C3AED' }}></iconify-icon>
                                                            </div>
                                                            <div>
                                                                <h6 className="mb-0 fw-bold" style={{ color: '#111827', fontSize: '14px' }}>Balance Enquiry</h6>
                                                                <small style={{ color: '#6B7280', fontSize: '11px' }}>Information Service</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {(() => {
                                                        const beData = getDataForPeriod(dashboardData.aeps?.be);
                                                        const totalCount = (beData.success?.count || 0) + (beData.failed?.count || 0) + (beData.pending?.count || 0);
                                                        const successRate = totalCount > 0 ? Math.round(((beData.success?.count || 0) / totalCount) * 100) : 0;
                                                        return (
                                                            <>
                                                                <div className="mb-3">
                                                                    <small style={{ color: '#6B7280', fontSize: '11px', fontWeight: '500' }}>Total Queries</small>
                                                                    <div className="fw-bold" style={{ color: '#7C3AED', fontSize: '24px' }}>{formatNumber(totalCount)}</div>
                                                                </div>

                                                                {/* Success Details */}
                                                                <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                                                                    <div className="d-flex align-items-center justify-content-between">
                                                                        <small style={{ color: '#065F46', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>✓ SUCCESS</small>
                                                                        <div style={{ color: '#047857', fontSize: '15px', fontWeight: '700' }}>
                                                                            {formatNumber(beData.success?.count || 0)}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Pending Details */}
                                                                <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
                                                                    <div className="d-flex align-items-center justify-content-between">
                                                                        <small style={{ color: '#92400E', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>⏳ PENDING</small>
                                                                        <div style={{ color: '#B45309', fontSize: '15px', fontWeight: '700' }}>
                                                                            {formatNumber(beData.pending?.count || 0)}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Failed Details */}
                                                                <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA' }}>
                                                                    <div className="d-flex align-items-center justify-content-between">
                                                                        <small style={{ color: '#991B1B', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>✕ FAILED</small>
                                                                        <div style={{ color: '#DC2626', fontSize: '15px', fontWeight: '700' }}>
                                                                            {formatNumber(beData.failed?.count || 0)}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="d-flex justify-content-between align-items-center mt-3 pt-2" style={{ borderTop: '1px solid #E5E7EB' }}>
                                                                    <small style={{ color: '#6B7280', fontSize: '11px', fontWeight: '600' }}>Success Rate</small>
                                                                    <span className="badge px-3 py-1" style={{
                                                                        backgroundColor: successRate >= 70 ? '#10B981' : '#EF4444',
                                                                        color: '#FFFFFF',
                                                                        fontSize: '12px',
                                                                        fontWeight: '700'
                                                                    }}>{successRate}%</span>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </div>

                                            {/* Mini Statement Summary */}
                                            <div className="col-md-6">
                                                <div className="p-3 rounded h-100" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                                        <div className="d-flex align-items-center">
                                                            <div className="rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px', backgroundColor: '#FFFBEB' }}>
                                                                <iconify-icon icon="solar:document-text-broken" className="fs-5" style={{ color: '#D97706' }}></iconify-icon>
                                                            </div>
                                                            <div>
                                                                <h6 className="mb-0 fw-bold" style={{ color: '#111827', fontSize: '14px' }}>Mini Statement</h6>
                                                                <small style={{ color: '#6B7280', fontSize: '11px' }}>Information Service</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {(() => {
                                                        const msData = getDataForPeriod(dashboardData.aeps?.ms);
                                                        const totalCount = (msData.success?.count || 0) + (msData.failed?.count || 0) + (msData.pending?.count || 0);
                                                        const successRate = totalCount > 0 ? Math.round(((msData.success?.count || 0) / totalCount) * 100) : 0;
                                                        return (
                                                            <>
                                                                <div className="mb-3">
                                                                    <small style={{ color: '#6B7280', fontSize: '11px', fontWeight: '500' }}>Total Requests</small>
                                                                    <div className="fw-bold" style={{ color: '#D97706', fontSize: '24px' }}>{formatNumber(totalCount)}</div>
                                                                </div>

                                                                {/* Success Details */}
                                                                <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                                                                    <div className="d-flex align-items-center justify-content-between">
                                                                        <small style={{ color: '#065F46', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>✓ SUCCESS</small>
                                                                        <div style={{ color: '#047857', fontSize: '15px', fontWeight: '700' }}>
                                                                            {formatNumber(msData.success?.count || 0)}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Pending Details */}
                                                                <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
                                                                    <div className="d-flex align-items-center justify-content-between">
                                                                        <small style={{ color: '#92400E', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>⏳ PENDING</small>
                                                                        <div style={{ color: '#B45309', fontSize: '15px', fontWeight: '700' }}>
                                                                            {formatNumber(msData.pending?.count || 0)}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Failed Details */}
                                                                <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA' }}>
                                                                    <div className="d-flex align-items-center justify-content-between">
                                                                        <small style={{ color: '#991B1B', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>✕ FAILED</small>
                                                                        <div style={{ color: '#DC2626', fontSize: '15px', fontWeight: '700' }}>
                                                                            {formatNumber(msData.failed?.count || 0)}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="d-flex justify-content-between align-items-center mt-3 pt-2" style={{ borderTop: '1px solid #E5E7EB' }}>
                                                                    <small style={{ color: '#6B7280', fontSize: '11px', fontWeight: '600' }}>Success Rate</small>
                                                                    <span className="badge px-3 py-1" style={{
                                                                        backgroundColor: successRate >= 70 ? '#10B981' : '#EF4444',
                                                                        color: '#FFFFFF',
                                                                        fontSize: '12px',
                                                                        fontWeight: '700'
                                                                    }}>{successRate}%</span>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Utility Services with Donut Charts */}
                                <div className="col-12 col-lg-4">
                                    <div
                                        className="bg-white h-100"
                                        style={{
                                            borderRadius: '16px',
                                            border: '2px solid #E0E7FF',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                            padding: '24px',
                                            background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)'
                                        }}
                                    >
                                        <div className="d-flex align-items-center mb-4">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px', backgroundColor: '#3B82F6', boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)' }}>
                                                <iconify-icon icon="solar:smartphone-2-broken" className="fs-4" style={{ color: '#FFFFFF' }}></iconify-icon>
                                            </div>
                                            <div>
                                                <h5 className="mb-0 fw-bold" style={{ color: '#111827', fontSize: '16px' }}>Utility Services</h5>
                                                <small style={{ color: '#6B7280', fontWeight: '500' }}>Recharge & Bill Payments</small>
                                            </div>
                                        </div>

                                        {/* Utility Chart & Stats */}
                                        <div className="mb-4">
                                            {dashboardData.utility ? (() => {
                                                const mobileData = getDataForPeriod(dashboardData.utility?.mobile);
                                                const dthData = getDataForPeriod(dashboardData.utility?.dth);
                                                const billData = getDataForPeriod(dashboardData.utility?.bill);

                                                // Calculate totals for each service
                                                const mobileTotal = (mobileData.success?.amount || 0) + (mobileData.failed?.amount || 0) + (mobileData.pending?.amount || 0);
                                                const dthTotal = (dthData.success?.amount || 0) + (dthData.failed?.amount || 0) + (dthData.pending?.amount || 0);
                                                const billTotal = (billData.success?.amount || 0) + (billData.failed?.amount || 0) + (billData.pending?.amount || 0);
                                                const grandTotal = mobileTotal + dthTotal + billTotal;

                                                // Calculate counts
                                                const mobileCount = (mobileData.success?.count || 0) + (mobileData.failed?.count || 0) + (mobileData.pending?.count || 0);
                                                const dthCount = (dthData.success?.count || 0) + (dthData.failed?.count || 0) + (dthData.pending?.count || 0);
                                                const billCount = (billData.success?.count || 0) + (billData.failed?.count || 0) + (billData.pending?.count || 0);
                                                const totalCount = mobileCount + dthCount + billCount;

                                                // Check if we have any data
                                                const hasData = grandTotal > 0 || totalCount > 0;

                                                if (!hasData) {
                                                    return (
                                                        <div className="d-flex align-items-center justify-content-center" style={{ height: 300 }}>
                                                            <div className="text-center text-muted">
                                                                <iconify-icon icon="solar:inbox-broken" className="fs-1 mb-3" style={{ color: '#E5E7EB' }}></iconify-icon>
                                                                <h6 className="mb-1" style={{ color: '#7B8A99' }}>No Utility Transactions</h6>
                                                                <small style={{ color: '#A0AEC0', fontSize: '11px' }}>No recharge or bill payment data for this period</small>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                // Prepare chart series - ensure we have at least minimal values for visibility
                                                const chartSeries = [
                                                    Math.max(parseFloat(mobileTotal.toFixed(2)), 0.01),
                                                    Math.max(parseFloat(dthTotal.toFixed(2)), 0.01),
                                                    Math.max(parseFloat(billTotal.toFixed(2)), 0.01)
                                                ];

                                                // Check if all values are effectively zero
                                                const allZero = mobileTotal === 0 && dthTotal === 0 && billTotal === 0;

                                                return (
                                                    <>
                                                        {/* Donut Chart */}
                                                        {!allZero ? (
                                                            <SafeChart
                                                                type="donut"
                                                                height={200}
                                                                options={{
                                                                    chart: {
                                                                        background: 'transparent',
                                                                        animations: {
                                                                            enabled: true,
                                                                            speed: 800
                                                                        }
                                                                    },
                                                                    colors: ['#1F78FF', '#8B5CF6', '#27AE60'],
                                                                    labels: ['Mobile Recharge', 'DTH Recharge', 'Bill Payment'],
                                                                    legend: {
                                                                        show: false
                                                                    },
                                                                    plotOptions: {
                                                                        pie: {
                                                                            donut: {
                                                                                size: '65%',
                                                                                labels: {
                                                                                    show: true,
                                                                                    name: {
                                                                                        show: true,
                                                                                        fontSize: '10px',
                                                                                        color: '#7B8A99',
                                                                                        offsetY: -5,
                                                                                        fontWeight: 500
                                                                                    },
                                                                                    value: {
                                                                                        show: true,
                                                                                        fontSize: '16px',
                                                                                        fontWeight: 700,
                                                                                        color: '#2E3B4E',
                                                                                        offsetY: 5,
                                                                                        formatter: (val) => `₹${Math.round(parseFloat(val))}`
                                                                                    },
                                                                                    total: {
                                                                                        show: true,
                                                                                        label: 'Total Amount',
                                                                                        fontSize: '10px',
                                                                                        color: '#7B8A99',
                                                                                        fontWeight: 500,
                                                                                        formatter: () => `₹${Math.round(grandTotal)}`
                                                                                    }
                                                                                }
                                                                            },
                                                                            expandOnClick: true
                                                                        }
                                                                    },
                                                                    dataLabels: {
                                                                        enabled: true,
                                                                        formatter: function (val, opts) {
                                                                            const actualValue = [mobileTotal, dthTotal, billTotal][opts.seriesIndex];
                                                                            if (actualValue === 0) return '';
                                                                            return `${Math.round(val)}%`;
                                                                        },
                                                                        style: {
                                                                            fontSize: '12px',
                                                                            fontWeight: 700,
                                                                            colors: ['#fff']
                                                                        },
                                                                        dropShadow: {
                                                                            enabled: true,
                                                                            blur: 3,
                                                                            opacity: 0.8
                                                                        }
                                                                    },
                                                                    tooltip: {
                                                                        enabled: true,
                                                                        y: {
                                                                            formatter: (val, opts) => {
                                                                                const actualValue = [mobileTotal, dthTotal, billTotal][opts.seriesIndex];
                                                                                return `₹${actualValue.toFixed(2)}`;
                                                                            },
                                                                            title: {
                                                                                formatter: (seriesName) => seriesName
                                                                            }
                                                                        },
                                                                        style: {
                                                                            fontSize: '12px'
                                                                        }
                                                                    },
                                                                    stroke: {
                                                                        show: true,
                                                                        width: 3,
                                                                        colors: ['#fff']
                                                                    },
                                                                    states: {
                                                                        hover: {
                                                                            filter: {
                                                                                type: 'lighten',
                                                                                value: 0.1
                                                                            }
                                                                        }
                                                                    }
                                                                }}
                                                                series={chartSeries}
                                                            />
                                                        ) : (
                                                            <div className="d-flex align-items-center justify-content-center" style={{ height: 200 }}>
                                                                <div className="text-center text-muted">
                                                                    <iconify-icon icon="solar:chart-outline" className="fs-4 mb-2"></iconify-icon>
                                                                    <div style={{ fontSize: '12px' }}>All amounts are ₹0</div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Enhanced Service Breakdown Cards - Compact */}
                                                        <div className="mt-3">
                                                            {/* Mobile Recharge */}
                                                            <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#DBEAFE', border: '2px solid #93C5FD' }}>
                                                                <div className="d-flex align-items-center justify-content-between">
                                                                    <div className="d-flex align-items-center flex-grow-1">
                                                                        <div className="rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px', backgroundColor: '#3B82F6', flexShrink: 0 }}>
                                                                            <iconify-icon icon="solar:smartphone-2-broken" style={{ fontSize: '16px', color: '#FFFFFF' }}></iconify-icon>
                                                                        </div>
                                                                        <div className="flex-grow-1">
                                                                            <div className="d-flex justify-content-between align-items-center">
                                                                                <small style={{ color: '#1E40AF', fontSize: '11px', fontWeight: '700' }}>Mobile Recharge</small>
                                                                                <div style={{ color: '#1E3A8A', fontSize: '14px', fontWeight: '800' }}>{formatCurrency(mobileTotal)}</div>
                                                                            </div>
                                                                            <div className="d-flex justify-content-between align-items-center mt-1">
                                                                                <small style={{ color: '#60A5FA', fontSize: '10px', fontWeight: '600' }}>{mobileCount} trans</small>
                                                                                <div className="d-flex gap-1" style={{ fontSize: '10px' }}>
                                                                                    {mobileData.success?.count > 0 && <span style={{ color: '#047857', fontWeight: '700' }}>✓{mobileData.success.count}</span>}
                                                                                    {mobileData.pending?.count > 0 && <span style={{ color: '#D97706', fontWeight: '700' }}>⏳{mobileData.pending.count}</span>}
                                                                                    {mobileData.failed?.count > 0 && <span style={{ color: '#DC2626', fontWeight: '700' }}>✕{mobileData.failed.count}</span>}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* DTH Recharge */}
                                                            <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#F5F3FF', border: '2px solid #C4B5FD' }}>
                                                                <div className="d-flex align-items-center justify-content-between">
                                                                    <div className="d-flex align-items-center flex-grow-1">
                                                                        <div className="rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px', backgroundColor: '#8B5CF6', flexShrink: 0 }}>
                                                                            <iconify-icon icon="solar:tv-broken" style={{ fontSize: '16px', color: '#FFFFFF' }}></iconify-icon>
                                                                        </div>
                                                                        <div className="flex-grow-1">
                                                                            <div className="d-flex justify-content-between align-items-center">
                                                                                <small style={{ color: '#6B21A8', fontSize: '11px', fontWeight: '700' }}>DTH Recharge</small>
                                                                                <div style={{ color: '#5B21B6', fontSize: '14px', fontWeight: '800' }}>{formatCurrency(dthTotal)}</div>
                                                                            </div>
                                                                            <div className="d-flex justify-content-between align-items-center mt-1">
                                                                                <small style={{ color: '#A78BFA', fontSize: '10px', fontWeight: '600' }}>{dthCount} trans</small>
                                                                                <div className="d-flex gap-1" style={{ fontSize: '10px' }}>
                                                                                    {dthData.success?.count > 0 && <span style={{ color: '#047857', fontWeight: '700' }}>✓{dthData.success.count}</span>}
                                                                                    {dthData.pending?.count > 0 && <span style={{ color: '#D97706', fontWeight: '700' }}>⏳{dthData.pending.count}</span>}
                                                                                    {dthData.failed?.count > 0 && <span style={{ color: '#DC2626', fontWeight: '700' }}>✕{dthData.failed.count}</span>}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Bill Payment */}
                                                            <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#ECFDF5', border: '2px solid #A7F3D0' }}>
                                                                <div className="d-flex align-items-center justify-content-between">
                                                                    <div className="d-flex align-items-center flex-grow-1">
                                                                        <div className="rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px', backgroundColor: '#10B981', flexShrink: 0 }}>
                                                                            <iconify-icon icon="solar:bill-list-broken" style={{ fontSize: '16px', color: '#FFFFFF' }}></iconify-icon>
                                                                        </div>
                                                                        <div className="flex-grow-1">
                                                                            <div className="d-flex justify-content-between align-items-center">
                                                                                <small style={{ color: '#065F46', fontSize: '11px', fontWeight: '700' }}>Bill Payment</small>
                                                                                <div style={{ color: '#047857', fontSize: '14px', fontWeight: '800' }}>{formatCurrency(billTotal)}</div>
                                                                            </div>
                                                                            <div className="d-flex justify-content-between align-items-center mt-1">
                                                                                <small style={{ color: '#34D399', fontSize: '10px', fontWeight: '600' }}>{billCount} trans</small>
                                                                                <div className="d-flex gap-1" style={{ fontSize: '10px' }}>
                                                                                    {billData.success?.count > 0 && <span style={{ color: '#047857', fontWeight: '700' }}>✓{billData.success.count}</span>}
                                                                                    {billData.pending?.count > 0 && <span style={{ color: '#D97706', fontWeight: '700' }}>⏳{billData.pending.count}</span>}
                                                                                    {billData.failed?.count > 0 && <span style={{ color: '#DC2626', fontWeight: '700' }}>✕{billData.failed.count}</span>}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Overall Status Summary - Compact */}
                                                        <div className="mt-3 p-2 rounded-3" style={{ background: 'linear-gradient(135deg, #F3F4F6 0%, #FFFFFF 100%)', border: '2px solid #E5E7EB' }}>
                                                            <div className="row g-2 text-center">
                                                                <div className="col-4">
                                                                    <div className="p-2 rounded-3" style={{ backgroundColor: '#ECFDF5' }}>
                                                                        <div style={{ color: '#047857', fontSize: '20px', fontWeight: '800', lineHeight: '1' }}>
                                                                            {(mobileData.success?.count || 0) + (dthData.success?.count || 0) + (billData.success?.count || 0)}
                                                                        </div>
                                                                        <small style={{ color: '#065F46', fontSize: '9px', fontWeight: '700', letterSpacing: '0.5px' }}>SUCCESS</small>
                                                                        <div style={{ color: '#10B981', fontSize: '10px', fontWeight: '700', marginTop: '2px' }}>
                                                                            {formatCurrency((mobileData.success?.amount || 0) + (dthData.success?.amount || 0) + (billData.success?.amount || 0))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-4">
                                                                    <div className="p-2 rounded-3" style={{ backgroundColor: '#FEF3C7' }}>
                                                                        <div style={{ color: '#B45309', fontSize: '20px', fontWeight: '800', lineHeight: '1' }}>
                                                                            {(mobileData.pending?.count || 0) + (dthData.pending?.count || 0) + (billData.pending?.count || 0)}
                                                                        </div>
                                                                        <small style={{ color: '#92400E', fontSize: '9px', fontWeight: '700', letterSpacing: '0.5px' }}>PENDING</small>
                                                                        <div style={{ color: '#F59E0B', fontSize: '10px', fontWeight: '700', marginTop: '2px' }}>
                                                                            {formatCurrency((mobileData.pending?.amount || 0) + (dthData.pending?.amount || 0) + (billData.pending?.amount || 0))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-4">
                                                                    <div className="p-2 rounded-3" style={{ backgroundColor: '#FEE2E2' }}>
                                                                        <div style={{ color: '#DC2626', fontSize: '20px', fontWeight: '800', lineHeight: '1' }}>
                                                                            {(mobileData.failed?.count || 0) + (dthData.failed?.count || 0) + (billData.failed?.count || 0)}
                                                                        </div>
                                                                        <small style={{ color: '#991B1B', fontSize: '9px', fontWeight: '700', letterSpacing: '0.5px' }}>FAILED</small>
                                                                        <div style={{ color: '#EF4444', fontSize: '10px', fontWeight: '700', marginTop: '2px' }}>
                                                                            {formatCurrency((mobileData.failed?.amount || 0) + (dthData.failed?.amount || 0) + (billData.failed?.amount || 0))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })() : (
                                                <div className="d-flex align-items-center justify-content-center" style={{ height: 300 }}>
                                                    <div className="text-center text-muted">
                                                        <iconify-icon icon="solar:chart-broken" className="fs-4 mb-2"></iconify-icon>
                                                        <div>Utility data not available</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Utility Action Cards */}
                                        <div className="d-grid gap-2">
                                            {(() => {
                                                const mobileData = getDataForPeriod(dashboardData.utility?.mobile);
                                                const dthData = getDataForPeriod(dashboardData.utility?.dth);
                                                const billData = getDataForPeriod(dashboardData.utility?.bill);

                                                return (
                                                    <>
                                                        <Link
                                                            to="/banking/mobile/recharge"
                                                            className="btn d-flex align-items-center justify-content-between"
                                                            style={{
                                                                backgroundColor: 'rgba(31, 120, 255, 0.1)',
                                                                border: '1px solid rgba(31, 120, 255, 0.2)',
                                                                color: '#1F78FF',
                                                                borderRadius: '8px',
                                                                padding: '10px 14px'
                                                            }}
                                                        >
                                                            <div className="d-flex align-items-center">
                                                                <iconify-icon icon="solar:smartphone-2-broken" className="me-2" style={{ fontSize: '18px' }}></iconify-icon>
                                                                <div className="text-start">
                                                                    <div style={{ fontSize: '12px', fontWeight: 500 }}>Mobile Recharge</div>
                                                                    <small style={{ fontSize: '9px', opacity: 0.7 }}>
                                                                        {formatNumber((mobileData.success?.count || 0) + (mobileData.failed?.count || 0) + (mobileData.pending?.count || 0))} transactions
                                                                    </small>
                                                                </div>
                                                            </div>
                                                            <div className="text-end">
                                                                <div style={{ fontSize: '11px', fontWeight: 600 }}>
                                                                    {formatCurrency((mobileData.success?.amount || 0) + (mobileData.failed?.amount || 0) + (mobileData.pending?.amount || 0))}
                                                                </div>
                                                                {mobileData.pending?.count > 0 && (
                                                                    <span className="badge bg-primary" style={{ fontSize: '8px' }}>
                                                                        {mobileData.pending.count} pending
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </Link>

                                                        <button
                                                            className="btn d-flex align-items-center justify-content-between"
                                                            style={{
                                                                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                                                color: '#8B5CF6',
                                                                borderRadius: '8px',
                                                                padding: '10px 14px'
                                                            }}
                                                        >
                                                            <div className="d-flex align-items-center">
                                                                <iconify-icon icon="solar:tv-broken" className="me-2" style={{ fontSize: '18px' }}></iconify-icon>
                                                                <div className="text-start">
                                                                    <div style={{ fontSize: '12px', fontWeight: 500 }}>DTH Recharge</div>
                                                                    <small style={{ fontSize: '9px', opacity: 0.7 }}>
                                                                        {formatNumber((dthData.success?.count || 0) + (dthData.failed?.count || 0) + (dthData.pending?.count || 0))} transactions
                                                                    </small>
                                                                </div>
                                                            </div>
                                                            <div className="text-end">
                                                                <div style={{ fontSize: '11px', fontWeight: 600 }}>
                                                                    {formatCurrency((dthData.success?.amount || 0) + (dthData.failed?.amount || 0) + (dthData.pending?.amount || 0))}
                                                                </div>
                                                                {dthData.pending?.count > 0 && (
                                                                    <span className="badge" style={{ backgroundColor: '#8B5CF6', fontSize: '8px' }}>
                                                                        {dthData.pending.count} pending
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </button>

                                                        <button
                                                            className="btn d-flex align-items-center justify-content-between"
                                                            style={{
                                                                backgroundColor: 'rgba(39, 174, 96, 0.1)',
                                                                border: '1px solid rgba(39, 174, 96, 0.2)',
                                                                color: '#27AE60',
                                                                borderRadius: '8px',
                                                                padding: '10px 14px'
                                                            }}
                                                        >
                                                            <div className="d-flex align-items-center">
                                                                <iconify-icon icon="solar:bill-list-broken" className="me-2" style={{ fontSize: '18px' }}></iconify-icon>
                                                                <div className="text-start">
                                                                    <div style={{ fontSize: '12px', fontWeight: 500 }}>Bill Payment</div>
                                                                    <small style={{ fontSize: '9px', opacity: 0.7 }}>
                                                                        {formatNumber((billData.success?.count || 0) + (billData.failed?.count || 0) + (billData.pending?.count || 0))} transactions
                                                                    </small>
                                                                </div>
                                                            </div>
                                                            <div className="text-end">
                                                                <div style={{ fontSize: '11px', fontWeight: 600 }}>
                                                                    {formatCurrency((billData.success?.amount || 0) + (billData.failed?.amount || 0) + (billData.pending?.amount || 0))}
                                                                </div>
                                                                {billData.pending?.count > 0 && (
                                                                    <span className="badge bg-success" style={{ fontSize: '8px' }}>
                                                                        {billData.pending.count} pending
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </button>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Services Row with Modern Cards */}
                            <div className="row g-6 my-3">
                                {/* Payouts with Funnel Chart */}
                                <div className="col-12 col-md-6 col-lg-4">
                                    <div
                                        className="bg-white h-100"
                                        style={{
                                            borderRadius: '16px',
                                            border: '2px solid #DBEAFE',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                            padding: '24px',
                                            background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)'
                                        }}
                                    >
                                        <div className="d-flex align-items-center mb-4">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px', backgroundColor: '#3B82F6', boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)' }}>
                                                <iconify-icon icon="solar:card-send-broken" className="fs-4" style={{ color: '#FFFFFF' }}></iconify-icon>
                                            </div>
                                            <div>
                                                <h5 className="mb-0 fw-bold" style={{ color: '#111827', fontSize: '15px' }}>Payouts</h5>
                                                <small style={{ color: '#6B7280', fontWeight: '500' }}>Money Transfer Status</small>
                                            </div>
                                        </div>

                                        {(() => {
                                            if (!dashboardData.payouts) {
                                                return (
                                                    <div className="d-flex align-items-center justify-content-center" style={{ height: 200 }}>
                                                        <div className="text-center text-muted">
                                                            <iconify-icon icon="solar:chart-broken" className="fs-4 mb-2"></iconify-icon>
                                                            <div>Payout data not available</div>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            const payoutData = getDataForPeriod(dashboardData.payouts);
                                            const totalCount = (payoutData.success?.count || 0) + (payoutData.failed?.count || 0) + (payoutData.pending?.count || 0);
                                            const totalAmount = (payoutData.success?.amount || 0) + (payoutData.failed?.amount || 0) + (payoutData.pending?.amount || 0);
                                            const successRate = totalCount > 0 ? Math.round(((payoutData.success?.count || 0) / totalCount) * 100) : 0;

                                            return (
                                                <>
                                                    <div className="row mb-3">
                                                        <div className="col-6">
                                                            <small style={{ color: '#6B7280', fontSize: '11px', fontWeight: '500' }}>Total Transactions</small>
                                                            <div className="fw-bold" style={{ color: '#3B82F6', fontSize: '20px' }}>{formatNumber(totalCount)}</div>
                                                        </div>
                                                        <div className="col-6 text-end">
                                                            <small style={{ color: '#6B7280', fontSize: '11px', fontWeight: '500' }}>Total Amount</small>
                                                            <div className="fw-bold" style={{ color: '#111827', fontSize: '16px' }}>{formatCurrency(totalAmount)}</div>
                                                        </div>
                                                    </div>

                                                    {/* Success Details */}
                                                    <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <small style={{ color: '#065F46', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>✓ SUCCESS</small>
                                                                <div style={{ color: '#047857', fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>
                                                                    {formatNumber(payoutData.success?.count || 0)} transactions
                                                                </div>
                                                            </div>
                                                            <div className="text-end">
                                                                <div style={{ color: '#047857', fontSize: '14px', fontWeight: '700' }}>{formatCurrency(payoutData.success?.amount || 0)}</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Pending Details */}
                                                    <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <small style={{ color: '#92400E', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>⏳ PENDING</small>
                                                                <div style={{ color: '#B45309', fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>
                                                                    {formatNumber(payoutData.pending?.count || 0)} transactions
                                                                </div>
                                                            </div>
                                                            <div className="text-end">
                                                                <div style={{ color: '#B45309', fontSize: '14px', fontWeight: '700' }}>{formatCurrency(payoutData.pending?.amount || 0)}</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Failed Details */}
                                                    <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA' }}>
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <small style={{ color: '#991B1B', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>✕ FAILED</small>
                                                                <div style={{ color: '#DC2626', fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>
                                                                    {formatNumber(payoutData.failed?.count || 0)} transactions
                                                                </div>
                                                            </div>
                                                            <div className="text-end">
                                                                <div style={{ color: '#DC2626', fontSize: '14px', fontWeight: '700' }}>{formatCurrency(payoutData.failed?.amount || 0)}</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="d-flex justify-content-between align-items-center mt-3 pt-2" style={{ borderTop: '1px solid #E5E7EB' }}>
                                                        <small style={{ color: '#6B7280', fontSize: '11px', fontWeight: '600' }}>Success Rate</small>
                                                        <span className="badge px-3 py-1" style={{
                                                            backgroundColor: successRate >= 70 ? '#10B981' : '#EF4444',
                                                            color: '#FFFFFF',
                                                            fontSize: '12px',
                                                            fontWeight: '700'
                                                        }}>{successRate}%</span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Add Fund with Progress Bar */}
                                <div className="col-12 col-md-6 col-lg-4">
                                    <div
                                        className="bg-white h-100"
                                        style={{
                                            borderRadius: '16px',
                                            border: '2px solid #FDE68A',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                            padding: '24px',
                                            background: 'linear-gradient(135deg, #FEF3C7 0%, #FFFFFF 100%)'
                                        }}
                                    >
                                        <div className="d-flex align-items-center mb-4">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px', backgroundColor: '#F59E0B', boxShadow: '0 8px 16px -4px rgba(245, 158, 11, 0.4)' }}>
                                                <iconify-icon icon="solar:wallet-money-broken" className="fs-4" style={{ color: '#FFFFFF' }}></iconify-icon>
                                            </div>
                                            <div>
                                                <h5 className="mb-0 fw-bold" style={{ color: '#111827', fontSize: '15px' }}>Add Fund</h5>
                                                <small style={{ color: '#6B7280', fontWeight: '500' }}>Wallet Top-up Requests</small>
                                            </div>
                                        </div>

                                        {(() => {
                                            if (!dashboardData.add_fund) {
                                                return (
                                                    <div className="d-flex align-items-center justify-content-center" style={{ height: 180 }}>
                                                        <div className="text-center text-muted">
                                                            <iconify-icon icon="solar:chart-broken" className="fs-4 mb-2"></iconify-icon>
                                                            <div>Add Fund data not available</div>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            const addFundData = getDataForPeriod(dashboardData.add_fund);
                                            const totalCount = (addFundData.success?.count || 0) + (addFundData.failed?.count || 0) + (addFundData.pending?.count || 0);
                                            const totalAmount = (addFundData.success?.amount || 0) + (addFundData.failed?.amount || 0) + (addFundData.pending?.amount || 0);
                                            const successRate = totalCount > 0 ? Math.round(((addFundData.success?.count || 0) / totalCount) * 100) : 0;

                                            return (
                                                <>
                                                    <div className="row mb-3">
                                                        <div className="col-6">
                                                            <small style={{ color: '#6B7280', fontSize: '11px', fontWeight: '500' }}>Total Requests</small>
                                                            <div className="fw-bold" style={{ color: '#F59E0B', fontSize: '20px' }}>{formatNumber(totalCount)}</div>
                                                        </div>
                                                        <div className="col-6 text-end">
                                                            <small style={{ color: '#6B7280', fontSize: '11px', fontWeight: '500' }}>Total Amount</small>
                                                            <div className="fw-bold" style={{ color: '#111827', fontSize: '16px' }}>{formatCurrency(totalAmount)}</div>
                                                        </div>
                                                    </div>

                                                    {/* Success Details */}
                                                    <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <small style={{ color: '#065F46', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>✓ SUCCESS</small>
                                                                <div style={{ color: '#047857', fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>
                                                                    {formatNumber(addFundData.success?.count || 0)} requests
                                                                </div>
                                                            </div>
                                                            <div className="text-end">
                                                                <div style={{ color: '#047857', fontSize: '14px', fontWeight: '700' }}>{formatCurrency(addFundData.success?.amount || 0)}</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Pending Details */}
                                                    <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <small style={{ color: '#92400E', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>⏳ PENDING</small>
                                                                <div style={{ color: '#B45309', fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>
                                                                    {formatNumber(addFundData.pending?.count || 0)} requests
                                                                </div>
                                                            </div>
                                                            <div className="text-end">
                                                                <div style={{ color: '#B45309', fontSize: '14px', fontWeight: '700' }}>{formatCurrency(addFundData.pending?.amount || 0)}</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Failed Details */}
                                                    <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA' }}>
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <small style={{ color: '#991B1B', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>✕ FAILED</small>
                                                                <div style={{ color: '#DC2626', fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>
                                                                    {formatNumber(addFundData.failed?.count || 0)} requests
                                                                </div>
                                                            </div>
                                                            <div className="text-end">
                                                                <div style={{ color: '#DC2626', fontSize: '14px', fontWeight: '700' }}>{formatCurrency(addFundData.failed?.amount || 0)}</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="d-flex justify-content-between align-items-center mt-3 pt-2" style={{ borderTop: '1px solid #E5E7EB' }}>
                                                        <small style={{ color: '#6B7280', fontSize: '11px', fontWeight: '600' }}>Success Rate</small>
                                                        <span className="badge px-3 py-1" style={{
                                                            backgroundColor: successRate >= 70 ? '#10B981' : '#EF4444',
                                                            color: '#FFFFFF',
                                                            fontSize: '12px',
                                                            fontWeight: '700'
                                                        }}>{successRate}%</span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Users Chart - Only for Super Admin and Admin */}
                                {(user?.role === "1" || user?.role === "2") && (
                                    <div className="col-12 col-md-6 col-lg-4 g-6 my-3">
                                        <div
                                            className="bg-white h-100"
                                            style={{
                                                borderRadius: '16px',
                                                border: '2px solid #C4B5FD',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                                padding: '24px',
                                                background: 'linear-gradient(135deg, #F5F3FF 0%, #FFFFFF 100%)'
                                            }}
                                        >
                                            <div className="d-flex align-items-center mb-4">
                                                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px', backgroundColor: '#8B5CF6', boxShadow: '0 8px 16px -4px rgba(139, 92, 246, 0.4)' }}>
                                                    <iconify-icon icon="solar:user-rounded-broken" className="fs-4" style={{ color: '#FFFFFF' }}></iconify-icon>
                                                </div>
                                                <div>
                                                    <h5 className="mb-0 fw-bold" style={{ color: '#111827', fontSize: '15px' }}>Users</h5>
                                                    <small style={{ color: '#6B7280', fontWeight: '500' }}>Active User Base</small>
                                                </div>
                                            </div>

                                            {(() => {
                                                if (!dashboardData.users) {
                                                    return (
                                                        <div className="d-flex align-items-center justify-content-center" style={{ height: 200 }}>
                                                            <div className="text-center text-muted">
                                                                <iconify-icon icon="solar:chart-broken" className="fs-4 mb-2"></iconify-icon>
                                                                <div>User data not available</div>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                const userData = getDataForPeriod(dashboardData.users);
                                                const activeUsers = userData?.active || 0;
                                                const inactiveUsers = userData?.inactive || 0;
                                                const totalUsers = activeUsers + inactiveUsers;

                                                return (
                                                    <>
                                                        <div className="mb-3">
                                                            <small style={{ color: '#6B7280', fontSize: '11px', fontWeight: '500' }}>Total Users</small>
                                                            <div className="fw-bold" style={{ color: '#8B5CF6', fontSize: '24px' }}>{formatNumber(totalUsers)}</div>
                                                        </div>

                                                        {/* Active Users */}
                                                        <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                <small style={{ color: '#065F46', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>✓ ACTIVE</small>
                                                                <div style={{ color: '#047857', fontSize: '15px', fontWeight: '700' }}>
                                                                    {formatNumber(activeUsers)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Inactive Users */}
                                                        <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#F3F4F6', border: '1px solid #D1D5DB' }}>
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                <small style={{ color: '#4B5563', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>○ INACTIVE</small>
                                                                <div style={{ color: '#6B7280', fontSize: '15px', fontWeight: '700' }}>
                                                                    {formatNumber(inactiveUsers)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="d-flex justify-content-between align-items-center mt-3 pt-2" style={{ borderTop: '1px solid #E5E7EB' }}>
                                                            <small style={{ color: '#6B7280', fontSize: '11px', fontWeight: '600' }}>Activity Rate</small>
                                                            <span className="badge px-3 py-1" style={{
                                                                backgroundColor: totalUsers > 0 && (activeUsers / totalUsers) >= 0.7 ? '#10B981' : '#EF4444',
                                                                color: '#FFFFFF',
                                                                fontSize: '12px',
                                                                fontWeight: '700'
                                                            }}>{totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}%</span>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {/* Merchants Chart - Only for Super Admin and Admin */}
                                {(user?.role === "1" || user?.role === "2") && (
                                    <div className="col-12 col-lg-4 g-6 my-3">
                                        <div
                                            className="bg-white h-100"
                                            style={{
                                                borderRadius: '16px',
                                                border: '2px solid #A7F3D0',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                                padding: '24px',
                                                background: 'linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)'
                                            }}
                                        >
                                            <div className="d-flex align-items-center justify-content-between mb-4">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px', backgroundColor: '#10B981', boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.4)' }}>
                                                        <iconify-icon icon="solar:shop-broken" className="fs-4" style={{ color: '#FFFFFF' }}></iconify-icon>
                                                    </div>
                                                    <div>
                                                        <h5 className="mb-0 fw-bold" style={{ color: '#111827', fontSize: '16px' }}>Merchants</h5>
                                                        <small style={{ color: '#6B7280', fontWeight: '500' }}>Platform Merchant Network</small>
                                                    </div>
                                                </div>
                                            </div>

                                            {(() => {
                                                if (!dashboardData.merchants) {
                                                    return (
                                                        <div className="d-flex align-items-center justify-content-center" style={{ height: 200 }}>
                                                            <div className="text-center text-muted">
                                                                <iconify-icon icon="solar:chart-broken" className="fs-4 mb-2"></iconify-icon>
                                                                <div>Merchant data not available</div>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                const merchantData = getDataForPeriod(dashboardData.merchants);
                                                const drafts = merchantData?.drafts || 0;
                                                const onboarding = merchantData?.onboarding || 0;
                                                const ekyc = merchantData?.ekyc || 0;
                                                const biomatrickyc = merchantData?.biomatrickyc || 0;
                                                const twofa = merchantData?.['2fa'] || 0;
                                                const totalActive = merchantData?.total_active || 0;
                                                const inProgress = drafts + onboarding + ekyc + biomatrickyc + twofa;
                                                const totalMerchants = totalActive + inProgress;

                                                // Check if we have any merchants
                                                const hasMerchants = totalMerchants > 0;

                                                return (
                                                    <>
                                                        {/* Total Merchants Display */}
                                                        <div className="mb-3">
                                                            <div className="text-center">
                                                                <div style={{ color: '#10B981', fontSize: '32px', fontWeight: '800' }}>
                                                                    {formatNumber(totalMerchants)}
                                                                </div>
                                                                <small style={{ color: '#6B7280', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>TOTAL MERCHANTS</small>
                                                            </div>
                                                        </div>

                                                        {/* Active/In Progress Status Summary */}
                                                        <div className="row g-2 mb-3">
                                                            <div className="col-6">
                                                                <div className="rounded-3" style={{ backgroundColor: '#ECFDF5', padding: '12px', border: '2px solid #A7F3D0' }}>
                                                                    <div className="d-flex align-items-center mb-1">
                                                                        <span style={{ fontSize: '14px', marginRight: '4px' }}>✓</span>
                                                                        <small style={{ color: '#059669', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>Active</small>
                                                                    </div>
                                                                    <div style={{ color: '#059669', fontSize: '18px', fontWeight: '800' }}>
                                                                        {formatNumber(totalActive)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-6">
                                                                <div className="rounded-3" style={{ backgroundColor: '#FEF3C7', padding: '12px', border: '2px solid #FDE68A' }}>
                                                                    <div className="d-flex align-items-center mb-1">
                                                                        <span style={{ fontSize: '14px', marginRight: '4px' }}>⏳</span>
                                                                        <small style={{ color: '#D97706', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>In Progress</small>
                                                                    </div>
                                                                    <div style={{ color: '#D97706', fontSize: '18px', fontWeight: '800' }}>
                                                                        {formatNumber(inProgress)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Detailed Breakdown */}
                                                        <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '12px' }}>
                                                            <small style={{ color: '#6B7280', fontSize: '10px', fontWeight: '600', letterSpacing: '0.5px' }}>STATUS BREAKDOWN</small>
                                                            <div className="row g-2 mt-1">
                                                                <div className="col-6">
                                                                    <div className="rounded-3" style={{ backgroundColor: '#FEF3C7', padding: '8px 10px', border: '1px solid #FDE68A' }}>
                                                                        <small style={{ color: '#D97706', fontSize: '9px', fontWeight: '600' }}>DRAFTS</small>
                                                                        <div style={{ color: '#D97706', fontSize: '16px', fontWeight: '800' }}>{formatNumber(drafts)}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-6">
                                                                    <div className="rounded-3" style={{ backgroundColor: '#DBEAFE', padding: '8px 10px', border: '1px solid #93C5FD' }}>
                                                                        <small style={{ color: '#2563EB', fontSize: '9px', fontWeight: '600' }}>ONBOARDING</small>
                                                                        <div style={{ color: '#2563EB', fontSize: '16px', fontWeight: '800' }}>{formatNumber(onboarding)}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-6">
                                                                    <div className="rounded-3" style={{ backgroundColor: '#ECFDF5', padding: '8px 10px', border: '1px solid #A7F3D0' }}>
                                                                        <small style={{ color: '#059669', fontSize: '9px', fontWeight: '600' }}>eKYC</small>
                                                                        <div style={{ color: '#059669', fontSize: '16px', fontWeight: '800' }}>{formatNumber(ekyc)}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-6">
                                                                    <div className="rounded-3" style={{ backgroundColor: '#F5F3FF', padding: '8px 10px', border: '1px solid #C4B5FD' }}>
                                                                        <small style={{ color: '#7C3AED', fontSize: '9px', fontWeight: '600' }}>BIO KYC</small>
                                                                        <div style={{ color: '#7C3AED', fontSize: '16px', fontWeight: '800' }}>{formatNumber(biomatrickyc)}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-12">
                                                                    <div className="rounded-3" style={{ backgroundColor: '#DBEAFE', padding: '8px 10px', border: '1px solid #93C5FD' }}>
                                                                        <small style={{ color: '#2563EB', fontSize: '9px', fontWeight: '600' }}>2FA PENDING</small>
                                                                        <div style={{ color: '#2563EB', fontSize: '16px', fontWeight: '800' }}>{formatNumber(twofa)}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Activity Rate Badge */}
                                                        <div className="text-center mt-3 p-2 rounded-3" style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                                                            <small style={{ color: '#059669', fontSize: '11px', fontWeight: '700' }}>
                                                                {totalMerchants > 0 ? ((totalActive / totalMerchants) * 100).toFixed(1) : 0}% Active Rate
                                                            </small>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {/* Cash Deposit Status */}
                                {dashboardData.cash_deposit && (
                                    <div className="col-12 col-lg-4 g-6 my-3">
                                        <div
                                            className="bg-white h-100"
                                            style={{
                                                borderRadius: '16px',
                                                border: '2px solid #A7F3D0',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                                padding: '24px',
                                                background: 'linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)'
                                            }}
                                        >
                                            <div className="d-flex align-items-center justify-content-between mb-4">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px', backgroundColor: '#10B981', boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.4)' }}>
                                                        <iconify-icon icon="solar:banknote-2-broken" className="fs-4" style={{ color: '#FFFFFF' }}></iconify-icon>
                                                    </div>
                                                    <div>
                                                        <h5 className="mb-0 fw-bold" style={{ color: '#111827', fontSize: '16px' }}>Cash Deposit Transactions</h5>
                                                        <small style={{ color: '#6B7280', fontWeight: '500' }}>Physical Cash Deposit Processing</small>
                                                    </div>
                                                </div>
                                            </div>

                                            {(() => {
                                                const cashData = getDataForPeriod(dashboardData.cash_deposit);
                                                const successRate = calculateSuccessRate(cashData);
                                                const totalCount = (cashData.success?.count || 0) + (cashData.failed?.count || 0) + (cashData.pending?.count || 0);
                                                const totalAmount = (cashData.success?.amount || 0) + (cashData.failed?.amount || 0) + (cashData.pending?.amount || 0);
                                                const hasData = totalCount > 0 || totalAmount > 0;

                                                return (
                                                    <>
                                                        <div className="row mb-3">
                                                            <div className="col-6">
                                                                <small style={{ color: '#6B7280', fontSize: '11px', fontWeight: '500' }}>Total Transactions</small>
                                                                <div className="fw-bold" style={{ color: '#10B981', fontSize: '20px' }}>{formatNumber(totalCount)}</div>
                                                            </div>
                                                            <div className="col-6 text-end">
                                                                <small style={{ color: '#6B7280', fontSize: '11px', fontWeight: '500' }}>Total Amount</small>
                                                                <div className="fw-bold" style={{ color: '#111827', fontSize: '16px' }}>{formatCurrency(totalAmount)}</div>
                                                            </div>
                                                        </div>

                                                        {/* Success Details */}
                                                        <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                <div>
                                                                    <small style={{ color: '#065F46', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>✓ SUCCESS</small>
                                                                    <div style={{ color: '#047857', fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>
                                                                        {formatNumber(cashData.success?.count || 0)} transactions
                                                                    </div>
                                                                </div>
                                                                <div className="text-end">
                                                                    <div style={{ color: '#047857', fontSize: '14px', fontWeight: '700' }}>{formatCurrency(cashData.success?.amount || 0)}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Pending Details */}
                                                        <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                <div>
                                                                    <small style={{ color: '#92400E', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>⏳ PENDING</small>
                                                                    <div style={{ color: '#B45309', fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>
                                                                        {formatNumber(cashData.pending?.count || 0)} transactions
                                                                    </div>
                                                                </div>
                                                                <div className="text-end">
                                                                    <div style={{ color: '#B45309', fontSize: '14px', fontWeight: '700' }}>{formatCurrency(cashData.pending?.amount || 0)}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Failed Details */}
                                                        <div className="mb-2 p-2 rounded-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA' }}>
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                <div>
                                                                    <small style={{ color: '#991B1B', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>✕ FAILED</small>
                                                                    <div style={{ color: '#DC2626', fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>
                                                                        {formatNumber(cashData.failed?.count || 0)} transactions
                                                                    </div>
                                                                </div>
                                                                <div className="text-end">
                                                                    <div style={{ color: '#DC2626', fontSize: '14px', fontWeight: '700' }}>{formatCurrency(cashData.failed?.amount || 0)}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="d-flex justify-content-between align-items-center mt-3 pt-2" style={{ borderTop: '1px solid #E5E7EB' }}>
                                                            <small style={{ color: '#6B7280', fontSize: '11px', fontWeight: '600' }}>Success Rate</small>
                                                            <div className="badge" style={{ backgroundColor: successRate >= 80 ? '#ECFDF5' : successRate >= 50 ? '#FEF3C7' : '#FEE2E2', color: successRate >= 80 ? '#047857' : successRate >= 50 ? '#B45309' : '#DC2626', fontSize: '11px', fontWeight: '700', padding: '4px 10px' }}>
                                                                {successRate}%
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {/* System Alerts & Performance */}
                                {(user?.role === "1" || user?.role === "2") && (

                                    <div className="col-12 col-lg-4 g-6 my-3">
                                        <div
                                            className="bg-white h-100"
                                            style={{
                                                borderRadius: '16px',
                                                border: '2px solid #FDE68A',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                                padding: '24px',
                                                background: 'linear-gradient(135deg, #FEF3C7 0%, #FFFFFF 100%)'
                                            }}
                                        >
                                            <div className="d-flex align-items-center mb-4">
                                                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px', backgroundColor: '#F59E0B', boxShadow: '0 8px 16px -4px rgba(245, 158, 11, 0.4)' }}>
                                                    <iconify-icon icon="solar:danger-triangle-broken" className="fs-4" style={{ color: '#FFFFFF' }}></iconify-icon>
                                                </div>
                                                <div>
                                                    <h5 className="mb-0 fw-bold" style={{ color: '#111827', fontSize: '16px' }}>System Alerts</h5>
                                                    <small style={{ color: '#6B7280', fontWeight: '500' }}>Critical Issues & Notifications</small>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="alert-list">
                                                    {/* High Pending Payouts Alert */}
                                                    {(dashboardData.payouts?.total?.pending?.amount || 0) > 300000 && (
                                                        <div className="alert border-0 rounded-3 mb-3" style={{ backgroundColor: '#FEF3C7', border: '2px solid #FDE68A' }}>
                                                            <div className="d-flex align-items-center">
                                                                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', backgroundColor: '#F59E0B', flexShrink: 0 }}>
                                                                    <iconify-icon icon="solar:card-send-broken" className="fs-5" style={{ color: '#FFFFFF' }}></iconify-icon>
                                                                </div>
                                                                <div>
                                                                    <strong style={{ fontSize: '13px', color: '#92400E', fontWeight: '700' }}>High Pending Payouts</strong>
                                                                    <p className="mb-0" style={{ fontSize: '12px', color: '#B45309', fontWeight: '500' }}>
                                                                        {formatCurrency(dashboardData.payouts?.total?.pending?.amount)} pending review
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Failed AEPS Transactions */}
                                                    {(() => {
                                                        const totalFailedAEPS = Object.values(dashboardData.aeps || {}).reduce((sum, service) => {
                                                            return sum + (service.total?.failed?.amount || 0);
                                                        }, 0);

                                                        return totalFailedAEPS > 50000 && (
                                                            <div className="alert border-0 rounded-3 mb-3" style={{ backgroundColor: '#FEE2E2', border: '2px solid #FECACA' }}>
                                                                <div className="d-flex align-items-center">
                                                                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', backgroundColor: '#EF4444', flexShrink: 0 }}>
                                                                        <iconify-icon icon="solar:card-transfer-broken" className="fs-5" style={{ color: '#FFFFFF' }}></iconify-icon>
                                                                    </div>
                                                                    <div>
                                                                        <strong style={{ fontSize: '13px', color: '#991B1B', fontWeight: '700' }}>AEPS Failures</strong>
                                                                        <p className="mb-0" style={{ fontSize: '12px', color: '#DC2626', fontWeight: '500' }}>
                                                                            {formatCurrency(totalFailedAEPS)} in failed transactions
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}

                                                    {/* Merchant KYC Pending - Only for Super Admin and Admin */}
                                                    {(user?.role === 1 || user?.role === 2) && (dashboardData.merchants?.total?.drafts || 0) > 20 && (
                                                        <div className="alert border-0 rounded-3 mb-3" style={{ backgroundColor: '#DBEAFE', border: '2px solid #93C5FD' }}>
                                                            <div className="d-flex align-items-center">
                                                                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', backgroundColor: '#3B82F6', flexShrink: 0 }}>
                                                                    <iconify-icon icon="solar:users-group-rounded-broken" className="fs-5" style={{ color: '#FFFFFF' }}></iconify-icon>
                                                                </div>
                                                                <div>
                                                                    <strong style={{ fontSize: '13px', color: '#1E40AF', fontWeight: '700' }}>KYC Pending</strong>
                                                                    <p className="mb-0" style={{ fontSize: '12px', color: '#2563EB', fontWeight: '500' }}>
                                                                        {formatNumber(dashboardData.merchants?.total?.drafts)} merchants need KYC
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* System Performance Gauge */}
                                                    <div className="mt-4">
                                                        <h6 className="text-muted mb-3" style={{ fontSize: '12px' }}>SYSTEM PERFORMANCE</h6>
                                                        <div className="text-center">
                                                            {(() => {
                                                                const totalTransactions = Object.values(dashboardData.aeps || {}).reduce((sum, service) => {
                                                                    const data = service.total || {};
                                                                    return sum + (data.success?.count || 0) + (data.failed?.count || 0);
                                                                }, 0);

                                                                const totalSuccess = Object.values(dashboardData.aeps || {}).reduce((sum, service) => {
                                                                    return sum + (service.total?.success?.count || 0);
                                                                }, 0);

                                                                const overallSuccessRate = totalTransactions > 0 ? Math.round((totalSuccess / totalTransactions) * 100) : 0;

                                                                return (
                                                                    <>
                                                                        <div className="position-relative d-inline-block">
                                                                            <svg width="120" height="120" className="position-relative">
                                                                                <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f3f4" strokeWidth="8" />
                                                                                <circle
                                                                                    cx="60" cy="60" r="50"
                                                                                    fill="none"
                                                                                    stroke={overallSuccessRate >= 80 ? "#27AE60" : overallSuccessRate >= 60 ? "#F2C94C" : "#EB5757"}
                                                                                    strokeWidth="8"
                                                                                    strokeDasharray={`${overallSuccessRate * 3.14} 314`}
                                                                                    strokeLinecap="round"
                                                                                    transform="rotate(-90 60 60)"
                                                                                />
                                                                            </svg>
                                                                            <div className="position-absolute top-50 start-50 translate-middle text-center">
                                                                                <h4 className="mb-0 fw-bold" style={{
                                                                                    color: overallSuccessRate >= 80 ? "#27AE60" : overallSuccessRate >= 60 ? "#F2C94C" : "#EB5757"
                                                                                }}>
                                                                                    {overallSuccessRate}%
                                                                                </h4>
                                                                                <small className="text-muted" style={{ fontSize: '10px' }}>Success Rate</small>
                                                                            </div>
                                                                        </div>
                                                                        <div className="mt-2">
                                                                            <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                                                                                Based on {formatNumber(totalTransactions)} transactions
                                                                            </small>
                                                                        </div>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default BankingDashboard;
