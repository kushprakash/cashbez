import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApiService from '../core/services/ApiService';

const AgentDashboard = ({ dashboardData, user }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [timeframe, setTimeframe] = useState('today');
    const [copiedField, setCopiedField] = useState('');
    const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
    const [userAccounts, setUserAccounts] = useState([]);
    const [userVaData, setUserVaData] = useState(null);
    const [refreshingBalance, setRefreshingBalance] = useState(false);
    const [qrForm, setQrForm] = useState({
        name: user?.name || '',
        account_number: '',
        account_ifsc: ''
    });
    const [qrLoading, setQrLoading] = useState(false);
    const [showCommissionModal, setShowCommissionModal] = useState(false);
    const [selectedCommissionService, setSelectedCommissionService] = useState('ALL');
    const [commissionRangeFilter, setCommissionRangeFilter] = useState('monthly');
    const [activeBanners, setActiveBanners] = useState([]);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    const apiService = ApiService();

    // Set or fetch dynamic active banners for retailer home dashboard
    useEffect(() => {
        if (dashboardData?.banners && Array.isArray(dashboardData.banners) && dashboardData.banners.length > 0) {
            setActiveBanners(dashboardData.banners);
        } else {
            const fetchActiveBanners = async () => {
                try {
                    const res = await apiService.vGet('/api/banners/active?type=home');
                    const list = res?.data?.data || res?.data;
                    if (Array.isArray(list) && list.length > 0) {
                        setActiveBanners(list);
                        return;
                    }
                } catch (e) {
                    // Fallback to admin route
                }

                try {
                    const res2 = await apiService.vGet('/api/admin/banners/active?type=home');
                    const list2 = res2?.data?.data || res2?.data;
                    if (Array.isArray(list2) && list2.length > 0) {
                        setActiveBanners(list2);
                    }
                } catch (err) {
                    console.error('Failed to fetch active banners:', err);
                }
            };
            fetchActiveBanners();
        }
    }, [dashboardData?.banners]);

    // Auto-slide dynamic banners every 4.5 seconds
    useEffect(() => {
        if (activeBanners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentBannerIndex(prev => (prev + 1) % activeBanners.length);
        }, 4500);
        return () => clearInterval(timer);
    }, [activeBanners.length]);

    // Fetch root accounts on mount
    useEffect(() => {
        apiService.vGet('/api/accounts/root-accounts')
            .then(res => {
                if (res?.data?.status === 1 && Array.isArray(res?.data?.data?.accounts)) {
                    setUserAccounts(res.data.data.accounts);
                }
            })
            .catch(err => console.error('Failed to fetch root accounts in AgentDashboard:', err));
    }, []);

    // Manual reload function for both wallet balances
    const refreshWallets = async () => {
        setRefreshingBalance(true);
        try {
            const res = await apiService.vGet('/api/accounts/root-accounts');
            if (res?.data?.status === 1 && Array.isArray(res?.data?.data?.accounts)) {
                setUserAccounts(res.data.data.accounts);
                toast.success('Wallet balances reloaded!');
            } else {
                const fallbackRes = await apiService.vGet('/api/accounts');
                const accounts = fallbackRes?.data?.data?.accounts || fallbackRes?.data?.accounts || fallbackRes?.data;
                if (Array.isArray(accounts)) {
                    setUserAccounts(accounts);
                    toast.success('Wallet balances reloaded!');
                }
            }
        } catch (err) {
            console.error('Failed to refresh wallets:', err);
            toast.error('Failed to reload balance');
        } finally {
            setRefreshingBalance(false);
        }
    };

    // Sync qrForm with user_kyc bank details from dashboard API
    useEffect(() => {
        const kyc = dashboardData?.kyc_account;
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
    }, [dashboardData?.kyc_account, user]);

    // Wallets loaded from userAccounts if available (or refreshed), fallback to dashboardData.user_wallets
    const activeAccounts = (userAccounts && userAccounts.length > 0) ? userAccounts : (dashboardData?.user_wallets || []);

    // primary_status === false -> Utility Wallet (has Add Fund button)
    // primary_status === true -> Trade Wallet (has Settlement button)
    const utilityWallet = activeAccounts.find(acc => acc.primary_status === false || acc.primary_status === 0 || acc.primary_status === '0' || acc.primary_status === 'false');
    const tradeWallet = activeAccounts.find(acc => acc.primary_status === true || acc.primary_status === 1 || acc.primary_status === '1' || acc.primary_status === 'true');

    // Virtual account data matched from va table by user mid/mobile from dashboard API
    const vaData = userVaData || dashboardData?.va_data;

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

    const offersList = [
        {
            id: 1,
            title: 'Refer & Earn',
            desc: 'Refer more retailers and earn exciting rewards!',
            btnText: 'Refer Now',
            btnLink: '#',
            icon: 'fxemoji:wrappedgift',
            bg: '#F0F5FF',
            color: '#1D4ED8',
            btnBg: '#0D6EFD'
        },
        {
            id: 2,
            title: '2% Extra Cashback',
            desc: 'Get 2% instant cashback on utility bill payments today!',
            btnText: 'Pay Bills',
            btnLink: '/banking/bill/payment',
            icon: 'solar:ticket-star-bold-duotone',
            bg: '#ECFDF5',
            color: '#047857',
            btnBg: '#10B981'
        },
        {
            id: 3,
            title: 'Upgrade to VIP',
            desc: 'Get maximum commission slabs on AEPS & DMT transactions!',
            btnText: 'Upgrade Now',
            btnLink: '#',
            icon: 'solar:crown-star-bold-duotone',
            bg: '#F5F3FF',
            color: '#6D28D9',
            btnBg: '#8B5CF6'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Auto-slide Exclusive Offers every 4 seconds
    useEffect(() => {
        const offerTimer = setInterval(() => {
            setCurrentOfferIndex(prev => (prev + 1) % offersList.length);
        }, 4000);
        return () => clearInterval(offerTimer);
    }, [offersList.length]);

    const nextOffer = () => {
        setCurrentOfferIndex(prev => (prev + 1) % offersList.length);
    };

    const prevOffer = () => {
        setCurrentOfferIndex(prev => (prev - 1 + offersList.length) % offersList.length);
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
            `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${vaData.virtual_upi_handle || vaData.virtual_account_number}&pn=${encodeURIComponent(vaData.username || user?.name || 'Agent')}`
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    const capitalizeText = (text) => {
        return text
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const getTimeBasedGreeting = (name) => {
        if (!name) name = 'User';
        name = capitalizeText(name.split(" ")[0]);
        const hours = new Date().getHours();
        if (hours < 12) return `🌞 Good Morning! ${name}, Have a bright day!`;
        if (hours < 18) return `☀️ Good Afternoon!  ${name}, Keep shining!`;
        return `🌙 Good Evening! ${name}, Relax & unwind!`;
    };

    const getFormattedTime = () => {
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
        return formatted
            .replace(/,\s*/g, ' ')
            .replace(/(\d{4})\s+(\d{1,2}):/, '$1 at $2:')
            .replace(/\s(am|pm)$/i, (match) => match.toUpperCase())
            .replace(/(\w{3})\s+(\d{2})\s+(\w{3})\s+(\d{4})/, '$1 $2 $3, $4');
    };

    // Helper function to extract count & amount safely from category structure in dashboardData according to timeframe
    const extractCategoryStats = (categoryObj, period = timeframe) => {
        if (!categoryObj) return { count: 0, amount: 0 };

        if (categoryObj[period]) {
            const succ = categoryObj[period].success || {};
            return {
                count: Number(succ.count || 0),
                amount: Number(succ.amount || 0)
            };
        }

        if (categoryObj.total) {
            const succ = categoryObj.total.success || {};
            return {
                count: Number(succ.count || 0),
                amount: Number(succ.amount || 0)
            };
        }

        // If sub-categories exist (e.g. aeps: {cw, ap, be, ms} or utility: {mobile, dth, bill})
        let totalCount = 0;
        let totalAmount = 0;
        Object.values(categoryObj).forEach(subCat => {
            if (subCat) {
                const periodData = subCat[period] || subCat.total || {};
                if (periodData.success) {
                    totalCount += Number(periodData.success.count || 0);
                    totalAmount += Number(periodData.success.amount || 0);
                }
            }
        });
        return { count: totalCount, amount: totalAmount };
    };

    // Calculate individual section stats from live dashboardData
    const aepsStats = extractCategoryStats(dashboardData?.aeps);
    const cashDepositStats = extractCategoryStats(dashboardData?.cash_deposit);
    const utilityStats = extractCategoryStats(dashboardData?.utility);
    const payoutStats = extractCategoryStats(dashboardData?.payouts);

    // Total Business = AEPS + Cash Deposit + Utility + Payouts
    const totalBusinessStats = {
        amount: aepsStats.amount + cashDepositStats.amount + utilityStats.amount + payoutStats.amount,
        count: aepsStats.count + cashDepositStats.count + utilityStats.count + payoutStats.count
    };

    // Last 7 Passbook Transactions from Backend API
    const recentTransactions = (dashboardData?.recent_passbook && dashboardData.recent_passbook.length > 0)
        ? dashboardData.recent_passbook.slice(0, 7)
        : [];

    // Retailer Commission Breakdown Data
    const rawCommStats = dashboardData?.commission_stats;
    const commStats = (rawCommStats && rawCommStats[timeframe])
        ? rawCommStats[timeframe]
        : (rawCommStats || {
            total_commission: 0,
            recharge_commission: 0,
            bbps_commission: 0,
            aeps_commission: 0,
            pan_commission: 0,
            other_commission: 0,
            recharge_txns: 0,
            bbps_txns: 0,
            aeps_txns: 0,
            pan_txns: 0,
            other_txns: 0,
        });

    // Retailer Charges Breakdown Data
    const rawChargesStats = dashboardData?.charges_stats;
    const chargesStats = (rawChargesStats && rawChargesStats[timeframe])
        ? rawChargesStats[timeframe]
        : (rawChargesStats || {
            total_charges: 0,
            tds: 0,
            two_fa_charge: 0,
            move_to_charge: 0,
            dmt_charge: 0,
            payout_charge: 0
        });

    const getFilteredCommissionDetails = () => {
        switch (selectedCommissionService) {
            case 'RECHARGE':
                return {
                    name: 'Mobile & DTH Recharge Commission',
                    amount: commStats.recharge_commission,
                    txns: commStats.recharge_txns,
                    icon: 'solar:cellphone-bold-duotone',
                    color: '#3B82F6',
                    badgeBg: 'bg-primary-subtle text-primary',
                    desc: 'Commission earned from prepaid, postpaid & DTH recharges'
                };
            case 'BBPS':
                return {
                    name: 'BBPS & Utility Bill Pay Commission',
                    amount: commStats.bbps_commission,
                    txns: commStats.bbps_txns,
                    icon: 'solar:bolt-bold-duotone',
                    color: '#F59E0B',
                    badgeBg: 'bg-warning-subtle text-warning-emphasis',
                    desc: 'Commission earned from Electricity, Water, Gas & Utility bills'
                };
            case 'AEPS':
                return {
                    name: 'AEPS & MATM Withdrawal Commission',
                    amount: commStats.aeps_commission,
                    txns: commStats.aeps_txns,
                    icon: 'ic:baseline-fingerprint',
                    color: '#10B981',
                    badgeBg: 'bg-success-subtle text-success',
                    desc: 'Commission earned from Aadhaar Cash Withdrawal & Mini Statement'
                };
            case 'PAN_CARD':
                return {
                    name: 'PAN Card & Identity Service Commission',
                    amount: commStats.pan_commission,
                    txns: commStats.pan_txns,
                    icon: 'solar:card-bold-duotone',
                    color: '#0EA5E9',
                    badgeBg: 'bg-info-subtle text-info',
                    desc: 'Commission earned from PAN application & CMS services'
                };
            case 'OTHER':
                return {
                    name: 'Other Applicable Service Commissions',
                    amount: commStats.other_commission,
                    txns: commStats.other_txns,
                    icon: 'solar:widget-5-bold-duotone',
                    color: '#8B5CF6',
                    badgeBg: 'bg-purple-subtle text-purple',
                    desc: 'Commission earned from Money Transfer (DMT), Payouts, Loans & Cards'
                };
            default:
                return {
                    name: 'Total Commission Earned (All Services)',
                    amount: commStats.total_commission,
                    txns: (commStats.recharge_txns + commStats.bbps_txns + commStats.aeps_txns + commStats.pan_txns + commStats.other_txns),
                    icon: 'solar:cup-first-bold-duotone',
                    color: '#F59E0B',
                    badgeBg: 'bg-warning-subtle text-warning-emphasis',
                    desc: 'Combined earnings & commission volume across all active services'
                };
        }
    };

    // Quick Services with Guaranteed 3D SVG & Icon Badges
    const quickServices = [
        {
            name: 'AEPS',
            icon: 'ic:baseline-fingerprint',
            svg: (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#FFFFFF', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))' }}>
                    <path d="M17.81 4.47A9.99 9.99 0 0 0 12 2C9.07 2 6.44 3.26 4.6 5.27A1 1 0 0 0 6.07 6.63C7.57 4.99 9.67 4 12 4c1.86 0 3.59.62 4.98 1.66a1 1 0 0 0 1.23-1.57zM3.46 9.15a1 1 0 0 0 1.4.3 12.02 12.02 0 0 1 14.28 0 1 1 0 1 0 1.16-1.63A14.02 14.02 0 0 0 3.65 7.75a1 1 0 0 0-.19 1.4zM12 8a8 8 0 0 0-6.17 2.9 1 1 0 0 0 1.54 1.28A6 6 0 0 1 12 10c2.42 0 4.6 1.43 5.56 3.62a1 1 0 0 0 1.84-.78A8 8 0 0 0 12 8zm-3 7c0-1.66 1.34-3 3-3s3 1.34 3 3v5a1 1 0 0 1-2 0v-5a1 1 0 0 0-2 0v6a1 1 0 0 1-2 0v-6z" />
                </svg>
            ),
            link: '/aeps',
            bgGradient: 'linear-gradient(145deg, #3B82F6 0%, #1D4ED8 100%)',
            shadowColor: 'rgba(59, 130, 246, 0.45)'
        },
        { name: 'mATM', icon: 'mdi:credit-card-wireless', link: '/m-atm/withdrawal', bgGradient: 'linear-gradient(145deg, #10B981 0%, #047857 100%)', shadowColor: 'rgba(16, 185, 129, 0.45)' },
        { name: 'Cash Deposit', icon: 'mdi:cash-plus', link: '/cash-deposit', bgGradient: 'linear-gradient(145deg, #F59E0B 0%, #B45309 100%)', shadowColor: 'rgba(245, 158, 11, 0.45)' },
        { name: 'BBPS', icon: 'mdi:lightning-bolt', link: '/banking/bill/payment', bgGradient: 'linear-gradient(145deg, #F97316 0%, #C2410C 100%)', shadowColor: 'rgba(249, 115, 22, 0.45)' },
        { name: 'Recharge', icon: 'mdi:cellphone-wireless', link: '/banking/mobile/recharge', bgGradient: 'linear-gradient(145deg, #EC4899 0%, #BE185D 100%)', shadowColor: 'rgba(236, 72, 153, 0.45)' },
        { name: 'DTH', icon: 'mdi:satellite-variant', link: '/banking/dth-recharge', bgGradient: 'linear-gradient(145deg, #8B5CF6 0%, #6D28D9 100%)', shadowColor: 'rgba(139, 92, 246, 0.45)' },
        { name: 'PAN Card', icon: 'mdi:card-account-details', link: '#', bgGradient: 'linear-gradient(145deg, #14B8A6 0%, #0F766E 100%)', shadowColor: 'rgba(20, 184, 166, 0.45)' },
        { name: 'DMT', icon: 'mdi:bank-transfer', link: '/banking/beneficiary', bgGradient: 'linear-gradient(145deg, #6366F1 0%, #4338CA 100%)', shadowColor: 'rgba(99, 102, 241, 0.45)' },
    ];

    return (
        <div className="agent-dashboard bg-light py-2" style={{ backgroundColor: '#F4F7FE' }}>
            <div className="container-fluid px-3">

                {/* Greeting & Agent Details Section */}
                <div className="row align-items-center mb-2 bg-white px-3 py-2 rounded-4 shadow-sm mx-0 border" style={{ borderColor: '#CBD5E1' }}>
                    <div className="col-md-4">
                        <h5 className="mb-1 fw-bold" style={{ color: '#1B2559', fontSize: '1.15rem' }}>
                            {getTimeBasedGreeting(user?.name || 'User')}
                        </h5>
                        <p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
                            Here's what's happening with your operations {timeframe === 'today' ? 'today' : timeframe === 'this_month' ? 'this month' : timeframe === 'this_year' ? 'this year' : 'all time'}.
                        </p>
                    </div>

                    <div className="col-md-4 mt-2 mt-md-0 d-flex justify-content-md-center">
                        <div className="btn-group btn-group-sm bg-light p-1 rounded-pill border shadow-xs">
                            <button
                                type="button"
                                className={`btn btn-sm rounded-pill px-2.5 py-0.5 fw-bold ${timeframe === 'today' ? 'btn-primary text-white shadow-sm' : 'btn-light text-secondary'}`}
                                style={{ fontSize: '11px' }}
                                onClick={() => setTimeframe('today')}
                            >
                                Today
                            </button>
                            <button
                                type="button"
                                className={`btn btn-sm rounded-pill px-2.5 py-0.5 fw-bold ${timeframe === 'this_month' ? 'btn-primary text-white shadow-sm' : 'btn-light text-secondary'}`}
                                style={{ fontSize: '11px' }}
                                onClick={() => setTimeframe('this_month')}
                            >
                                This Month
                            </button>
                            <button
                                type="button"
                                className={`btn btn-sm rounded-pill px-2.5 py-0.5 fw-bold ${timeframe === 'this_year' ? 'btn-primary text-white shadow-sm' : 'btn-light text-secondary'}`}
                                style={{ fontSize: '11px' }}
                                onClick={() => setTimeframe('this_year')}
                            >
                                This Year
                            </button>
                            <button
                                type="button"
                                className={`btn btn-sm rounded-pill px-2.5 py-0.5 fw-bold ${timeframe === 'total' ? 'btn-primary text-white shadow-sm' : 'btn-light text-secondary'}`}
                                style={{ fontSize: '11px' }}
                                onClick={() => setTimeframe('total')}
                            >
                                All Time
                            </button>
                        </div>
                    </div>

                    <div className="col-md-4 mt-2 mt-md-0 d-flex justify-content-md-end">
                        <div className="d-flex align-items-center">
                            <div className="me-3 text-md-end">
                                <div className="fw-bold" style={{ fontSize: '14px', color: '#1B2559' }}>{user?.name || 'Agent Name'}</div>


                                <div style={{ fontSize: '11.5px', color: '#334155', fontWeight: '600' }}>
                                    ID: <span className="text-dark fw-bold">{user?.mid || 'MID12345'}</span> | Mobile: <span className="text-dark fw-bold">{user?.mobile || '+91 9876543210'}</span>
                                </div>
                                <div style={{ fontSize: '10.5px', color: '#475569', fontWeight: '600' }}>
                                    Joined: <span className="text-dark">{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GB') : '12 Jan 2024'}</span>
                                </div>
                            </div>
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    backgroundColor: '#1F78FF',
                                    color: 'white',
                                    fontSize: '18px',
                                    fontWeight: '700'
                                }}
                            >
                                {(user?.name || 'A').charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Section: Banner and Wallets */}
                <div className="row mb-2 g-2">
                    {/* Dynamic Sliding Promotional Banner */}
                    <div className="col-lg-7">
                        {activeBanners.length > 0 ? (
                            <div
                                className="card border-0 h-100 rounded-4 overflow-hidden shadow-sm position-relative"
                                style={{ minHeight: '160px', backgroundColor: 'transparent' }}
                            >
                                <div
                                    className="w-100 h-100 position-relative d-flex align-items-center justify-content-center"
                                    onClick={() => {
                                        const currentBanner = activeBanners[currentBannerIndex];
                                        if (currentBanner?.redirect_url) {
                                            if (currentBanner.redirect_url.startsWith('http://') || currentBanner.redirect_url.startsWith('https://')) {
                                                window.open(currentBanner.redirect_url, '_blank');
                                            } else {
                                                window.location.href = currentBanner.redirect_url;
                                            }
                                        }
                                    }}
                                    style={{ cursor: activeBanners[currentBannerIndex]?.redirect_url ? 'pointer' : 'default' }}
                                >
                                    <img
                                        src={activeBanners[currentBannerIndex]?.image || activeBanners[currentBannerIndex]?.image_url}
                                        alt={`Banner ${currentBannerIndex + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'fill',
                                            borderRadius: '16px',
                                            transition: 'all 0.5s ease-in-out'
                                        }}
                                    />
                                </div>

                                {/* Next / Prev Controls for Multi-Banner */}
                                {activeBanners.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-dark position-absolute start-0 top-50 translate-middle-y ms-2 rounded-circle opacity-75 shadow-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentBannerIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length);
                                            }}
                                            style={{ width: '28px', height: '28px', padding: 0, zIndex: 10 }}
                                        >
                                            ‹
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-dark position-absolute end-0 top-50 translate-middle-y me-2 rounded-circle opacity-75 shadow-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentBannerIndex(prev => (prev + 1) % activeBanners.length);
                                            }}
                                            style={{ width: '28px', height: '28px', padding: 0, zIndex: 10 }}
                                        >
                                            ›
                                        </button>

                                        {/* Carousel Dots */}
                                        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2 d-flex gap-1 px-2 py-1 rounded-pill" style={{ zIndex: 10, backgroundColor: 'rgba(0,0,0,0.35)' }}>
                                            {activeBanners.map((_, idx) => (
                                                <span
                                                    key={idx}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCurrentBannerIndex(idx);
                                                    }}
                                                    style={{
                                                        width: idx === currentBannerIndex ? '18px' : '7px',
                                                        height: '7px',
                                                        borderRadius: '4px',
                                                        backgroundColor: idx === currentBannerIndex ? '#ffffff' : 'rgba(255,255,255,0.6)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s'
                                                    }}
                                                ></span>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            /* Fallback Default Banner */
                            <div className="card border-0 h-100 rounded-4 overflow-hidden shadow-sm" style={{ background: 'linear-gradient(90deg, #1A2980 0%, #26D0CE 100%)' }}>
                                <div className="card-body p-3 d-flex align-items-center position-relative">
                                    <div className="position-relative z-index-1 w-65">
                                        <h4 className="text-white fw-bold mb-1" style={{ fontSize: '1.25rem' }}>Grow Your Business with BharatPay!</h4>
                                        <p className="text-white-50 mb-2" style={{ fontSize: '12px' }}>Offer trusted digital services &amp; earn high commissions.</p>
                                        <button className="btn btn-light btn-sm rounded-pill px-4 fw-bold shadow-sm" style={{ color: '#1A2980', fontSize: '12px' }}>View Offers</button>
                                    </div>
                                    <div className="position-absolute end-0 top-0 h-100 d-none d-md-block" style={{ width: '35%' }}>
                                        <div className="h-100 w-100 d-flex align-items-center justify-content-center">
                                            <iconify-icon icon="solar:graph-up-bold-duotone" style={{ fontSize: '110px', color: 'rgba(255,255,255,0.25)' }}></iconify-icon>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Wallets */}
                    <div className="col-lg-5">
                        <div className="row h-100 g-2">
                            {/* Utility Wallet (primary_status = false) */}
                            <div className="col-sm-6 h-100">
                                <div className="card border-0 rounded-4 shadow-sm h-100">
                                    <div className="card-body d-flex flex-column p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <div className="text-muted fw-bold" style={{ fontSize: '12px' }}>Utility Wallet Balance</div>
                                            <div className="d-flex align-items-center gap-1.5">
                                                <span className="badge bg-info-subtle text-info fw-bold" style={{ fontSize: '9px' }}>Utility</span>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-light border rounded-circle p-0 d-inline-flex align-items-center justify-content-center shadow-xs cursor-pointer"
                                                    onClick={refreshWallets}
                                                    disabled={refreshingBalance}
                                                    title="Reload Utility Wallet Balance"
                                                    style={{ width: '24px', height: '24px', backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }}
                                                >
                                                    <iconify-icon
                                                        icon="solar:restart-bold"
                                                        className={`text-primary ${refreshingBalance ? 'spin-icon' : ''}`}
                                                        style={{ fontSize: '13px' }}
                                                    ></iconify-icon>
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="fw-bold mb-2" style={{ color: '#1B2559', fontSize: '1.4rem' }}>
                                            {formatCurrency(utilityWallet ? (utilityWallet.raw_available_balance ?? utilityWallet.available_balance) : (dashboardData?.accounts?.available_balance || 0))}
                                        </h3>
                                        <div className="progress mb-2" style={{ height: '5px', backgroundColor: '#E2E8F0' }}>
                                            <div className="progress-bar bg-primary rounded-pill" role="progressbar" style={{ width: '70%' }}></div>
                                        </div>
                                        <Link to="/banking/add-fund-request" className="btn btn-primary btn-sm w-100 rounded-pill mt-auto fw-bold py-1.5 shadow-sm text-center text-decoration-none" style={{ fontSize: '12px' }}>Add Fund</Link>
                                    </div>
                                </div>
                            </div>

                            {/* Trade Wallet (primary_status = true) */}
                            <div className="col-sm-6 h-100">
                                <div className="card border-0 rounded-4 shadow-sm h-100">
                                    <div className="card-body d-flex flex-column p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <div className="text-muted fw-bold" style={{ fontSize: '12px' }}>Trade Wallet Balance</div>
                                            <div className="d-flex align-items-center gap-1.5">
                                                <span className="badge bg-primary-subtle text-primary fw-bold" style={{ fontSize: '9px' }}>Trade</span>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-light border rounded-circle p-0 d-inline-flex align-items-center justify-content-center shadow-xs cursor-pointer"
                                                    onClick={refreshWallets}
                                                    disabled={refreshingBalance}
                                                    title="Reload Trade Wallet Balance"
                                                    style={{ width: '24px', height: '24px', backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }}
                                                >
                                                    <iconify-icon
                                                        icon="solar:restart-bold"
                                                        className={`text-primary ${refreshingBalance ? 'spin-icon' : ''}`}
                                                        style={{ fontSize: '13px' }}
                                                    ></iconify-icon>
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="fw-bold mb-2" style={{ color: '#1B2559', fontSize: '1.4rem' }}>
                                            {formatCurrency(tradeWallet ? (tradeWallet.raw_available_balance ?? tradeWallet.available_balance) : 0)}
                                        </h3>
                                        <div className="progress mb-2" style={{ height: '5px', backgroundColor: '#E2E8F0' }}>
                                            <div className="progress-bar bg-dark rounded-pill" role="progressbar" style={{ width: '40%' }}></div>
                                        </div>
                                        <Link to="/banking/move-to" className="btn btn-dark btn-sm w-100 rounded-pill mt-auto fw-bold py-1.5 shadow-sm text-center text-decoration-none" style={{ backgroundColor: '#1B2559', fontSize: '12px' }}>Settlement</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Section: Quick Services & Account Details */}
                <div className="row mb-2 g-2">
                    {/* Quick Services with Guaranteed 3D Logo Badges */}
                    <div className="col-lg-8">
                        <div className="card border-0 rounded-4 shadow-sm h-100">
                            <div className="card-header bg-white border-0 pt-3 pb-1 px-3 d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold mb-0" style={{ color: '#1B2559', fontSize: '14px' }}>Quick Services</h6>
                                <button className="btn btn-link text-primary text-decoration-none p-0 d-flex align-items-center fw-bold" style={{ fontSize: '12px' }}>
                                    <iconify-icon icon="solar:settings-linear" className="me-1"></iconify-icon> &nbsp; Customize
                                </button>
                            </div>
                            <div className="card-body p-3">
                                <div className="row g-2">
                                    {quickServices.map((service, index) => (
                                        <div className="col-3 col-md-auto flex-grow-1 text-center" key={index}>
                                            <Link to={service.link} className="text-decoration-none group">
                                                <div className="position-relative d-flex align-items-center justify-content-center mx-auto mb-2 transition-all hover-scale"
                                                    style={{
                                                        width: '74px',
                                                        height: '74px',
                                                        borderRadius: '22px',
                                                        background: service.bgGradient,
                                                        boxShadow: `0 10px 22px -5px ${service.shadowColor}, inset 0 2px 3px rgba(255, 255, 255, 0.6), inset 0 -3px 5px rgba(0, 0, 0, 0.35)`
                                                    }}>
                                                    {/* Glossy top sheen overlay */}
                                                    <div className="position-absolute top-0 start-0 w-100 h-50"
                                                        style={{
                                                            background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)',
                                                            borderTopLeftRadius: '22px',
                                                            borderTopRightRadius: '22px'
                                                        }}></div>

                                                    {/* 3D SVG or Iconify Icon */}
                                                    {service.svg ? (
                                                        service.svg
                                                    ) : (
                                                        <iconify-icon icon={service.icon} style={{ fontSize: '38px', color: '#FFFFFF', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))' }}></iconify-icon>
                                                    )}
                                                </div>
                                                <div className="fw-bold text-dark" style={{ fontSize: '12px' }}>{service.name}</div>
                                            </Link>
                                        </div>
                                    ))}


                                    {/* INSIDE QUICK SERVICES CARD BODY: TOTAL COMMISSION EARNED & CHARGES BARS */}
                                    <div className="mt-3">
                                        {/* 1. TOTAL EARNINGS SECTION */}
                                        <div className="mb-3">
                                            {/* Header Row */}
                                            <div className="d-flex align-items-center justify-content-between mb-2">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="rounded-circle p-1.5 d-flex align-items-center justify-content-center text-warning shadow-xs flex-shrink-0" style={{ backgroundColor: '#FFFBEB', width: '32px', height: '32px' }}>
                                                        <iconify-icon icon="solar:cup-first-bold-duotone" style={{ fontSize: '20px', color: '#D97706' }}></iconify-icon>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                                        <span className="fw-extrabold text-dark" style={{ fontSize: '14px', letterSpacing: '0.2px' }}>Total Earnings :</span>
                                                        <h4 className="fw-extrabold mb-0 font-monospace" style={{ fontSize: '1.2rem', color: '#92400E' }}>
                                                            {formatCurrency(commStats.total_commission)}
                                                        </h4>
                                                    </div>
                                                </div>

                                                <Link
                                                    to="/banking/commission-report"
                                                    className="btn btn-success btn-sm rounded-pill fw-bold d-inline-flex align-items-center shadow-sm text-white hover-scale text-decoration-none"
                                                    style={{ padding: '4px 16px', fontSize: '12.5px', fontWeight: 700 }}
                                                >
                                                    <iconify-icon icon="solar:eye-bold-duotone" className="me-1 fs-6"></iconify-icon>
                                                    View Details &amp; Filters
                                                </Link>
                                            </div>

                                            {/* 5 Commission Service Pills Row */}
                                            <div className="row g-2">
                                                {/* 1. Recharge */}
                                                <div className="col-6 col-sm flex-grow-1">
                                                    <Link
                                                        to="/banking/commission-report?service=RECHARGE"
                                                        className="p-1.5 px-2 rounded-3 border text-center cursor-pointer hover-scale transition-all shadow-xs d-block text-decoration-none"
                                                        style={{ borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' }}
                                                    >
                                                        <div className="d-flex align-items-center justify-content-center gap-1 mb-0.5">
                                                            <iconify-icon icon="solar:cellphone-bold-duotone" className="text-primary" style={{ fontSize: '13px' }}></iconify-icon>
                                                            <span className="fw-extrabold text-primary text-uppercase text-truncate" style={{ fontSize: '10px' }}>Recharge</span>
                                                        </div>
                                                        <span className="fw-extrabold text-dark font-monospace d-block text-truncate" style={{ fontSize: '12.5px' }}>
                                                            {formatCurrency(commStats.recharge_commission)}
                                                        </span>
                                                    </Link>
                                                </div>

                                                {/* 2. BBPS */}
                                                <div className="col-6 col-sm flex-grow-1">
                                                    <Link
                                                        to="/banking/commission-report?service=BBPS"
                                                        className="p-1.5 px-2 rounded-3 border text-center cursor-pointer hover-scale transition-all shadow-xs d-block text-decoration-none"
                                                        style={{ borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }}
                                                    >
                                                        <div className="d-flex align-items-center justify-content-center gap-1 mb-0.5">
                                                            <iconify-icon icon="solar:bolt-bold-duotone" className="text-warning-emphasis" style={{ fontSize: '13px' }}></iconify-icon>
                                                            <span className="fw-extrabold text-warning-emphasis text-uppercase text-truncate" style={{ fontSize: '10px' }}>BBPS Bills</span>
                                                        </div>
                                                        <span className="fw-extrabold text-dark font-monospace d-block text-truncate" style={{ fontSize: '12.5px' }}>
                                                            {formatCurrency(commStats.bbps_commission)}
                                                        </span>
                                                    </Link>
                                                </div>

                                                {/* 3. AEPS */}
                                                <div className="col-6 col-sm flex-grow-1">
                                                    <Link
                                                        to="/banking/commission-report?service=AEPS"
                                                        className="p-1.5 px-2 rounded-3 border text-center cursor-pointer hover-scale transition-all shadow-xs d-block text-decoration-none"
                                                        style={{ borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' }}
                                                    >
                                                        <div className="d-flex align-items-center justify-content-center gap-1 mb-0.5">
                                                            <iconify-icon icon="ic:baseline-fingerprint" className="text-success" style={{ fontSize: '13px' }}></iconify-icon>
                                                            <span className="fw-extrabold text-success text-uppercase text-truncate" style={{ fontSize: '10px' }}>AEPS Cash</span>
                                                        </div>
                                                        <span className="fw-extrabold text-dark font-monospace d-block text-truncate" style={{ fontSize: '12.5px' }}>
                                                            {formatCurrency(commStats.aeps_commission)}
                                                        </span>
                                                    </Link>
                                                </div>

                                                {/* 4. PAN Card */}
                                                <div className="col-6 col-sm flex-grow-1">
                                                    <Link
                                                        to="/banking/commission-report?service=PAN"
                                                        className="p-1.5 px-2 rounded-3 border text-center cursor-pointer hover-scale transition-all shadow-xs d-block text-decoration-none"
                                                        style={{ borderColor: '#BAE6FD', backgroundColor: '#F0F9FF' }}
                                                    >
                                                        <div className="d-flex align-items-center justify-content-center gap-1 mb-0.5">
                                                            <iconify-icon icon="solar:card-bold-duotone" className="text-info" style={{ fontSize: '13px' }}></iconify-icon>
                                                            <span className="fw-extrabold text-info text-uppercase text-truncate" style={{ fontSize: '10px' }}>PAN Card</span>
                                                        </div>
                                                        <span className="fw-extrabold text-dark font-monospace d-block text-truncate" style={{ fontSize: '12.5px' }}>
                                                            {formatCurrency(commStats.pan_commission)}
                                                        </span>
                                                    </Link>
                                                </div>

                                                {/* 5. Others */}
                                                <div className="col-6 col-sm flex-grow-1">
                                                    <Link
                                                        to="/banking/commission-report?service=OTHER"
                                                        className="p-1.5 px-2 rounded-3 border text-center cursor-pointer hover-scale transition-all shadow-xs d-block text-decoration-none"
                                                        style={{ borderColor: '#DDD6FE', backgroundColor: '#F5F3FF' }}
                                                    >
                                                        <div className="d-flex align-items-center justify-content-center gap-1 mb-0.5">
                                                            <iconify-icon icon="solar:widget-5-bold-duotone" style={{ color: '#7C3AED', fontSize: '13px' }}></iconify-icon>
                                                            <span className="fw-extrabold text-uppercase text-truncate" style={{ color: '#7C3AED', fontSize: '10px' }}>Others</span>
                                                        </div>
                                                        <span className="fw-extrabold text-dark font-monospace d-block text-truncate" style={{ fontSize: '12.5px' }}>
                                                            {formatCurrency(commStats.other_commission)}
                                                        </span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. TDS & CHARGES DEDUCTED SECTION (EXACT SAME UI STRUCTURE & SIZING) */}
                                        <div>
                                            {/* Header Row */}
                                            <div className="d-flex align-items-center justify-content-between mb-2">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="rounded-circle p-1.5 d-flex align-items-center justify-content-center text-danger shadow-xs flex-shrink-0" style={{ backgroundColor: '#FEF2F2', width: '32px', height: '32px' }}>
                                                        <iconify-icon icon="solar:bill-cross-bold-duotone" style={{ fontSize: '20px', color: '#DC2626' }}></iconify-icon>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                                        <span className="fw-extrabold text-danger" style={{ fontSize: '14px', letterSpacing: '0.2px' }}>TDS &amp; Charges Deducted :</span>
                                                        <h4 className="fw-extrabold mb-0 font-monospace text-danger" style={{ fontSize: '1.2rem' }}>
                                                            {formatCurrency(chargesStats.total_charges || 0)}
                                                        </h4>
                                                    </div>
                                                </div>

                                                <Link
                                                    to="/banking/commission-report?type=charges"
                                                    className="btn btn-outline-danger btn-sm rounded-pill fw-bold d-inline-flex align-items-center shadow-sm hover-scale text-decoration-none"
                                                    style={{ padding: '4px 16px', fontSize: '12.5px', fontWeight: 700 }}
                                                >
                                                    <iconify-icon icon="solar:eye-bold-duotone" className="me-1 fs-6"></iconify-icon>
                                                    View Charges Report
                                                </Link>
                                            </div>

                                            {/* 5 Charges Service Pills Row (Exact same size, padding & height as commissions) */}
                                            <div className="row g-2">
                                                {/* 1. TDS (Primary) */}
                                                <div className="col-6 col-sm flex-grow-1">
                                                    <Link
                                                        to="/banking/commission-report?type=charges&service=TDS"
                                                        className="p-1.5 px-2 rounded-3 border text-center cursor-pointer hover-scale transition-all shadow-xs d-block text-decoration-none"
                                                        style={{ borderColor: '#FECACA', backgroundColor: '#FEF2F2' }}
                                                    >
                                                        <div className="d-flex align-items-center justify-content-center gap-1 mb-0.5">
                                                            <iconify-icon icon="solar:document-text-bold-duotone" className="text-danger" style={{ fontSize: '13px' }}></iconify-icon>
                                                            <span className="fw-extrabold text-danger text-uppercase text-truncate" style={{ fontSize: '10px' }}>TDS (Primary)</span>
                                                        </div>
                                                        <span className="fw-extrabold text-dark font-monospace d-block text-truncate" style={{ fontSize: '12.5px' }}>
                                                            {formatCurrency(chargesStats.tds || 0)}
                                                        </span>
                                                    </Link>
                                                </div>

                                                {/* 2. 2FA (Primary) */}
                                                <div className="col-6 col-sm flex-grow-1">
                                                    <Link
                                                        to="/banking/commission-report?type=charges&service=2FA"
                                                        className="p-1.5 px-2 rounded-3 border text-center cursor-pointer hover-scale transition-all shadow-xs d-block text-decoration-none"
                                                        style={{ borderColor: '#FECDD3', backgroundColor: '#FFF1F2' }}
                                                    >
                                                        <div className="d-flex align-items-center justify-content-center gap-1 mb-0.5">
                                                            <iconify-icon icon="solar:shield-warning-bold-duotone" style={{ color: '#E11D48', fontSize: '13px' }}></iconify-icon>
                                                            <span className="fw-extrabold text-uppercase text-truncate" style={{ color: '#E11D48', fontSize: '10px' }}>2FA (Primary)</span>
                                                        </div>
                                                        <span className="fw-extrabold text-dark font-monospace d-block text-truncate" style={{ fontSize: '12.5px' }}>
                                                            {formatCurrency(chargesStats.two_fa_charge || 0)}
                                                        </span>
                                                    </Link>
                                                </div>

                                                {/* 3. Move To (Secondary) */}
                                                <div className="col-6 col-sm flex-grow-1">
                                                    <Link
                                                        to="/banking/commission-report?type=charges&service=MOVE_TO"
                                                        className="p-1.5 px-2 rounded-3 border text-center cursor-pointer hover-scale transition-all shadow-xs d-block text-decoration-none"
                                                        style={{ borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }}
                                                    >
                                                        <div className="d-flex align-items-center justify-content-center gap-1 mb-0.5">
                                                            <iconify-icon icon="solar:card-transfer-bold-duotone" style={{ color: '#D97706', fontSize: '13px' }}></iconify-icon>
                                                            <span className="fw-extrabold text-uppercase text-truncate" style={{ color: '#D97706', fontSize: '10px' }}>Move To (Secondary)</span>
                                                        </div>
                                                        <span className="fw-extrabold text-dark font-monospace d-block text-truncate" style={{ fontSize: '12.5px' }}>
                                                            {formatCurrency(chargesStats.move_to_charge || 0)}
                                                        </span>
                                                    </Link>
                                                </div>

                                                {/* 4. DMT (Secondary) */}
                                                <div className="col-6 col-sm flex-grow-1">
                                                    <Link
                                                        to="/banking/commission-report?type=charges&service=DMT"
                                                        className="p-1.5 px-2 rounded-3 border text-center cursor-pointer hover-scale transition-all shadow-xs d-block text-decoration-none"
                                                        style={{ borderColor: '#C7D2FE', backgroundColor: '#EEF2FF' }}
                                                    >
                                                        <div className="d-flex align-items-center justify-content-center gap-1 mb-0.5">
                                                            <iconify-icon icon="solar:banknote-bold-duotone" style={{ color: '#4F46E5', fontSize: '13px' }}></iconify-icon>
                                                            <span className="fw-extrabold text-uppercase text-truncate" style={{ color: '#4F46E5', fontSize: '10px' }}>DMT (Secondary)</span>
                                                        </div>
                                                        <span className="fw-extrabold text-dark font-monospace d-block text-truncate" style={{ fontSize: '12.5px' }}>
                                                            {formatCurrency(chargesStats.dmt_charge || 0)}
                                                        </span>
                                                    </Link>
                                                </div>

                                                {/* 5. Payout (Secondary) */}
                                                <div className="col-6 col-sm flex-grow-1">
                                                    <Link
                                                        to="/banking/commission-report?type=charges&service=PAYOUT"
                                                        className="p-1.5 px-2 rounded-3 border text-center cursor-pointer hover-scale transition-all shadow-xs d-block text-decoration-none"
                                                        style={{ borderColor: '#DDD6FE', backgroundColor: '#F5F3FF' }}
                                                    >
                                                        <div className="d-flex align-items-center justify-content-center gap-1 mb-0.5">
                                                            <iconify-icon icon="solar:wallet-2-bold-duotone" style={{ color: '#7C3AED', fontSize: '13px' }}></iconify-icon>
                                                            <span className="fw-extrabold text-uppercase text-truncate" style={{ color: '#7C3AED', fontSize: '10px' }}>Payout (Secondary)</span>
                                                        </div>
                                                        <span className="fw-extrabold text-dark font-monospace d-block text-truncate" style={{ fontSize: '12.5px' }}>
                                                            {formatCurrency(chargesStats.payout_charge || 0)}
                                                        </span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>      </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Details & Static QR (Full QR & Copy/Share Feature) OR Request Form */}
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
                                                            {qrForm.name || dashboardData?.kyc_account?.name || user?.name || 'N/A'}
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
                                                                    {qrForm.account_number || dashboardData?.kyc_account?.account_number || 'N/A'}
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
                                                                    {qrForm.account_ifsc || dashboardData?.kyc_account?.ifsc_code || 'N/A'}
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

                {/* Bottom Section: Stats Cards */}
                <div className="row g-2">
                    <div className="col-lg-8">
                        {/* Stats Row */}
                        <div className="row g-2 mb-2">
                            {/* Card 1: Total Business (Blue Border) */}
                            <div className="col-6 col-md-3">
                                <div className="card rounded-4 shadow-sm h-100" style={{ border: '2px solid #3B82F6', backgroundColor: '#FFFFFF' }}>
                                    <div className="card-body p-2.5">
                                        <div className="text-primary fw-bold mb-1 d-flex justify-content-between align-items-center" style={{ fontSize: '13px' }}>
                                            <span>Total Business</span>
                                            <iconify-icon icon="solar:chart-square-bold-duotone" className="fs-5 text-primary"></iconify-icon>
                                        </div>
                                        <div className="fw-bold text-dark mb-1" style={{ fontSize: '1.25rem' }}>
                                            {formatCurrency(totalBusinessStats.amount)}
                                        </div>
                                        <div className="fw-semibold text-muted" style={{ fontSize: '12px' }}>
                                            Total: <span className="fw-bold text-dark">{totalBusinessStats.count.toLocaleString()}</span> Txns
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: AEPS Txns (Green Border) */}
                            <div className="col-6 col-md-3">
                                <div className="card rounded-4 shadow-sm h-100" style={{ border: '2px solid #10B981', backgroundColor: '#FFFFFF' }}>
                                    <div className="card-body p-2.5">
                                        <div className="text-success fw-bold mb-1 d-flex justify-content-between align-items-center" style={{ fontSize: '13px' }}>
                                            <span>AEPS Txns</span>
                                            <iconify-icon icon="ic:baseline-fingerprint" className="fs-5 text-success"></iconify-icon>
                                        </div>
                                        <div className="fw-bold text-dark mb-1" style={{ fontSize: '1.25rem' }}>
                                            {formatCurrency(aepsStats.amount)}
                                        </div>
                                        <div className="fw-semibold text-muted" style={{ fontSize: '12px' }}>
                                            Total: <span className="fw-bold text-dark">{aepsStats.count.toLocaleString()}</span> Txns
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: Total Payout (Purple Border) */}
                            <div className="col-6 col-md-3">
                                <div className="card rounded-4 shadow-sm h-100" style={{ border: '2px solid #8B5CF6', backgroundColor: '#FFFFFF' }}>
                                    <div className="card-body p-2.5">
                                        <div className="fw-bold mb-1 d-flex justify-content-between align-items-center" style={{ fontSize: '13px', color: '#8B5CF6' }}>
                                            <span>Total Payout</span>
                                            <iconify-icon icon="solar:wallet-money-bold-duotone" className="fs-5" style={{ color: '#8B5CF6' }}></iconify-icon>
                                        </div>
                                        <div className="fw-bold text-dark mb-1" style={{ fontSize: '1.25rem' }}>
                                            {formatCurrency(payoutStats.amount)}
                                        </div>
                                        <div className="fw-semibold text-muted" style={{ fontSize: '12px' }}>
                                            Total: <span className="fw-bold text-dark">{payoutStats.count.toLocaleString()}</span> Txns
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 4: Total Utility (Cyan Border) */}
                            <div className="col-6 col-md-3">
                                <div className="card rounded-4 shadow-sm h-100" style={{ border: '2px solid #0EA5E9', backgroundColor: '#FFFFFF' }}>
                                    <div className="card-body p-2.5">
                                        <div className="fw-bold mb-1 d-flex justify-content-between align-items-center" style={{ fontSize: '13px', color: '#0EA5E9' }}>
                                            <span>Total Utility</span>
                                            <iconify-icon icon="solar:bolt-bold-duotone" className="fs-5" style={{ color: '#0EA5E9' }}></iconify-icon>
                                        </div>
                                        <div className="fw-bold text-dark mb-1" style={{ fontSize: '1.25rem' }}>
                                            {formatCurrency(utilityStats.amount)}
                                        </div>
                                        <div className="fw-semibold text-muted" style={{ fontSize: '12px' }}>
                                            Total: <span className="fw-bold text-dark">{utilityStats.count.toLocaleString()}</span> Txns
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Offers, Tools, Support - Interactive Sliding Offers Carousel */}
                        <div className="row g-2">
                            {/* Card 1: Exclusive Offers You (Interactive Slider) */}
                            <div className="col-md-4">
                                <div className="card border-0 rounded-4 shadow-sm h-100 bg-white" style={{ border: '1px solid #E2E8F0' }}>
                                    <div className="card-header bg-white border-0 pt-3 pb-0 px-3 d-flex justify-content-between align-items-center">
                                        <h6 className="fw-bold mb-0" style={{ color: '#1B2559', fontSize: '13px' }}>Exclusive Offers You</h6>
                                        <a href="#" className="text-primary text-decoration-none fw-bold" style={{ fontSize: '11px' }}>View All</a>
                                    </div>
                                    <div className="card-body p-3 d-flex flex-column justify-content-between">
                                        <div className="position-relative p-3 rounded-4 d-flex align-items-center justify-content-center transition-all"
                                            style={{ backgroundColor: offersList[currentOfferIndex].bg, minHeight: '140px' }}>

                                            {/* Left Carousel Arrow */}
                                            <button className="btn btn-light rounded-circle shadow-sm position-absolute top-50 start-0 translate-middle-y ms-1 d-flex align-items-center justify-content-center p-0"
                                                onClick={prevOffer}
                                                style={{ width: '26px', height: '26px', zIndex: 2, border: '1px solid #E2E8F0' }}>
                                                <iconify-icon icon="solar:alt-arrow-left-linear" style={{ fontSize: '14px', color: '#475569' }}></iconify-icon>
                                            </button>

                                            {/* Right Carousel Arrow */}
                                            <button className="btn btn-light rounded-circle shadow-sm position-absolute top-50 end-0 translate-middle-y me-1 d-flex align-items-center justify-content-center p-0"
                                                onClick={nextOffer}
                                                style={{ width: '26px', height: '26px', zIndex: 2, border: '1px solid #E2E8F0' }}>
                                                <iconify-icon icon="solar:alt-arrow-right-linear" style={{ fontSize: '14px', color: '#475569' }}></iconify-icon>
                                            </button>

                                            {/* Dynamic Content Layout */}
                                            <div className="d-flex align-items-center px-2">
                                                <div className="me-2 flex-shrink-0">
                                                    <iconify-icon icon={offersList[currentOfferIndex].icon} style={{ fontSize: '52px', color: offersList[currentOfferIndex].btnBg }}></iconify-icon>
                                                </div>
                                                <div>
                                                    <h6 className="fw-bold mb-1" style={{ fontSize: '13px', color: offersList[currentOfferIndex].color }}>
                                                        {offersList[currentOfferIndex].title}
                                                    </h6>
                                                    <p className="text-muted mb-2" style={{ fontSize: '10px', lineHeight: '1.3' }}>
                                                        {offersList[currentOfferIndex].desc}
                                                    </p>
                                                    <Link to={offersList[currentOfferIndex].btnLink}
                                                        className="btn btn-primary btn-sm rounded-pill px-3 py-1 fw-bold shadow-sm text-decoration-none d-inline-block"
                                                        style={{ fontSize: '11px', backgroundColor: offersList[currentOfferIndex].btnBg, borderColor: offersList[currentOfferIndex].btnBg }}>
                                                        {offersList[currentOfferIndex].btnText}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Carousel Dots */}
                                        <div className="d-flex justify-content-center align-items-center gap-1 mt-2">
                                            {offersList.map((_, idx) => (
                                                <div key={idx}
                                                    onClick={() => setCurrentOfferIndex(idx)}
                                                    className="rounded-circle cursor-pointer transition-all"
                                                    style={{
                                                        width: idx === currentOfferIndex ? '16px' : '6px',
                                                        height: '6px',
                                                        borderRadius: '3px',
                                                        backgroundColor: idx === currentOfferIndex ? offersList[currentOfferIndex].btnBg : '#CBD5E1'
                                                    }}></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Business Tools */}
                            <div className="col-md-4">
                                <div className="card border-0 rounded-4 shadow-sm h-100 bg-white" style={{ border: '1px solid #E2E8F0' }}>
                                    <div className="card-header bg-white border-0 pt-3 pb-0 px-3">
                                        <h6 className="fw-bold mb-0" style={{ color: '#1B2559', fontSize: '13px' }}>Business Tools</h6>
                                    </div>
                                    <div className="card-body p-3 d-flex flex-column justify-content-between">
                                        {/* Item 1 */}
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="rounded-3 d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                                                style={{ width: '34px', height: '34px', backgroundColor: '#EFF6FF' }}>
                                                <iconify-icon icon="solar:chart-2-bold-duotone" className="text-primary" style={{ fontSize: '18px' }}></iconify-icon>
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark" style={{ fontSize: '12px', lineHeight: '1.2' }}>Commission Chart</div>
                                                <div className="text-muted" style={{ fontSize: '10px' }}>Check latest commission slabs</div>
                                            </div>
                                        </div>

                                        {/* Item 2 */}
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="rounded-3 d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                                                style={{ width: '34px', height: '34px', backgroundColor: '#EFF6FF' }}>
                                                <iconify-icon icon="solar:document-text-bold-duotone" className="text-primary" style={{ fontSize: '18px' }}></iconify-icon>
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark" style={{ fontSize: '12px', lineHeight: '1.2' }}>Settlement Report</div>
                                                <div className="text-muted" style={{ fontSize: '10px' }}>View settlement & payout details</div>
                                            </div>
                                        </div>

                                        {/* Item 3 */}
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="rounded-3 d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                                                style={{ width: '34px', height: '34px', backgroundColor: '#EFF6FF' }}>
                                                <iconify-icon icon="solar:wallet-money-bold-duotone" className="text-primary" style={{ fontSize: '18px' }}></iconify-icon>
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark" style={{ fontSize: '12px', lineHeight: '1.2' }}>Transaction Limits</div>
                                                <div className="text-muted" style={{ fontSize: '10px' }}>Check your service limits</div>
                                            </div>
                                        </div>

                                        {/* Item 4 */}
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-3 d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                                                style={{ width: '34px', height: '34px', backgroundColor: '#DCFCE7' }}>
                                                <iconify-icon icon="solar:check-circle-bold-duotone" style={{ color: '#16A34A', fontSize: '18px' }}></iconify-icon>
                                            </div>
                                            <div className="flex-grow-1 d-flex justify-content-between align-items-center">
                                                <div>
                                                    <div className="fw-bold text-dark" style={{ fontSize: '12px', lineHeight: '1.2' }}>Service Status</div>
                                                    <div className="text-muted" style={{ fontSize: '10px' }}>Check live service status</div>
                                                </div>
                                                <span className="badge rounded-pill fw-bold px-2 py-1"
                                                    style={{ backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '9px' }}>
                                                    Live
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: Need Help? (Dynamic Links) */}
                            <div className="col-md-4">
                                <div className="card border-0 rounded-4 shadow-sm h-100 bg-white" style={{ border: '1px solid #E2E8F0' }}>
                                    <div className="card-header bg-white border-0 pt-3 pb-0 px-3">
                                        <h6 className="fw-bold mb-0" style={{ color: '#1B2559', fontSize: '13px' }}>Need Help?</h6>
                                        <div className="text-muted" style={{ fontSize: '10px' }}>Our support team is here to help you</div>
                                    </div>
                                    <div className="card-body p-3 d-flex flex-column justify-content-between">
                                        {/* Item 1: Live Chat */}
                                        <Link to="/chat" className="d-flex align-items-center p-2 rounded-3 mb-1 border text-decoration-none group hover-scale" style={{ backgroundColor: '#FAFAFA', borderColor: '#E2E8F0' }}>
                                            <div className="rounded-3 d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                                                style={{ width: '30px', height: '30px', backgroundColor: '#DCFCE7' }}>
                                                <iconify-icon icon="solar:chat-round-dots-bold-duotone" style={{ color: '#16A34A', fontSize: '16px' }}></iconify-icon>
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark" style={{ fontSize: '12px', lineHeight: '1.2' }}>Live Chat</div>
                                                <div className="text-muted" style={{ fontSize: '10px' }}>Chat with our executive</div>
                                            </div>
                                        </Link>

                                        {/* Item 2: Call Support */}
                                        <a href={`tel:${dashboardData?.support_setting?.mobile_no || dashboardData?.support_setting?.landline_no || '9536042639'}`}
                                            className="d-flex align-items-center p-2 rounded-3 mb-1 border text-decoration-none hover-scale"
                                            style={{ backgroundColor: '#FAFAFA', borderColor: '#E2E8F0' }}>
                                            <div className="rounded-3 d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                                                style={{ width: '30px', height: '30px', backgroundColor: '#EFF6FF' }}>
                                                <iconify-icon icon="solar:phone-bold-duotone" className="text-primary" style={{ fontSize: '16px' }}></iconify-icon>
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark" style={{ fontSize: '12px', lineHeight: '1.2' }}>Call Support</div>
                                                <div className="text-primary fw-bold" style={{ fontSize: '10.5px' }}>
                                                    {dashboardData?.support_setting?.mobile_no || dashboardData?.support_setting?.landline_no || '+91 95360 42639'}
                                                </div>
                                            </div>
                                        </a>

                                        {/* Item 3: WhatsApp */}
                                        <a href={`https://wa.me/${(dashboardData?.support_setting?.whatsapp_no || '9546042639').replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="d-flex align-items-center p-2 rounded-3 mb-2 border text-decoration-none hover-scale"
                                            style={{ backgroundColor: '#FAFAFA', borderColor: '#E2E8F0' }}>
                                            <div className="rounded-3 d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                                                style={{ width: '30px', height: '30px', backgroundColor: '#DCFCE7' }}>
                                                <iconify-icon icon="logos:whatsapp-icon" style={{ fontSize: '15px' }}></iconify-icon>
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark" style={{ fontSize: '12px', lineHeight: '1.2' }}>WhatsApp Support</div>
                                                <div className="text-success fw-bold" style={{ fontSize: '10.5px' }}>
                                                    {dashboardData?.support_setting?.whatsapp_no || '+91 95460 42639'}
                                                </div>
                                            </div>
                                        </a>

                                        {/* Raise Ticket Button */}
                                        <Link to="/complaints/create" className="btn btn-sm w-100 rounded-pill fw-bold py-1.5 shadow-sm text-center text-decoration-none"
                                            style={{ backgroundColor: '#EEF2FF', color: '#3563E9', fontSize: '11px', border: '1px solid #E0E7FF' }}>
                                            Raise a Ticket
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent 7 Passbook Transactions */}
                    <div className="col-lg-4">
                        <div className="card border-0 rounded-4 shadow-sm h-100">
                            <div className="card-header bg-white border-0 px-3 pt-3 pb-2 d-flex justify-content-between align-items-center border-bottom">
                                <h6 className="fw-bold mb-0 d-flex align-items-center" style={{ color: '#1B2559', fontSize: '13px' }}>
                                    <iconify-icon icon="solar:refresh-circle-linear" className="me-1 text-primary fs-5"></iconify-icon>
                                    &nbsp;Recent Transactions (Last 7)
                                </h6>
                                <Link to="/banking/accounts" className="text-primary text-decoration-none fw-bold" style={{ fontSize: '11px' }}>
                                    View All &rarr;
                                </Link>
                            </div>
                            <div className="card-body px-3 py-2 d-flex flex-column justify-content-between">
                                <div className="flex-grow-1">
                                    {recentTransactions.length > 0 ? (
                                        recentTransactions.map((txn) => {
                                            const isCredit = txn.type === 'CR';
                                            return (
                                                <div className="d-flex justify-content-between align-items-center py-2 border-bottom" key={txn.id} style={{ borderColor: '#F1F5F9' }}>
                                                    <div className="d-flex align-items-center overflow-hidden me-2">
                                                        <div className="rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                                                            style={{ width: '30px', height: '30px', backgroundColor: isCredit ? '#DCFCE7' : '#FEE2E2' }}>
                                                            <i
                                                                className={isCredit ? "fa fa-arrow-down" : "fa fa-arrow-up"}
                                                                style={{ color: isCredit ? '#16A34A' : '#DC2626', fontSize: '13px' }}
                                                            ></i>
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <div className="fw-bold text-dark text-truncate" style={{ fontSize: '11.5px', maxWidth: '140px' }} title={txn.description || 'Transaction'}>
                                                                {txn.description || `Txn #${txn.transaction_id}`}
                                                            </div>
                                                            <div className="text-muted" style={{ fontSize: '9.5px' }}>
                                                                {txn.created_at ? new Date(txn.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-end flex-shrink-0">
                                                        <div className={`fw-bold ${isCredit ? 'text-success' : 'text-danger'}`} style={{ fontSize: '11.5px' }}>
                                                            {isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
                                                        </div>
                                                        <span className={`badge rounded-pill py-0.5 px-1.5 fw-bold ${isCredit ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`} style={{ fontSize: '8.5px' }}>
                                                            {txn.type}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-4 text-muted" style={{ fontSize: '12px' }}>
                                            <iconify-icon icon="solar:inbox-line" style={{ fontSize: '32px' }} className="d-block mb-1 mx-auto text-secondary"></iconify-icon>
                                            No recent transactions found
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SERVICE-WISE COMMISSION EARNINGS MODAL WITH SET FILTERS */}
                {showCommissionModal && (
                    <div className="modal show d-block fade-in" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1055, backdropFilter: 'blur(4px)' }}>
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">

                                {/* Modal Header */}
                                <div className="modal-header border-bottom py-3 px-4" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)' }}>
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-3 p-2 me-2.5 d-flex align-items-center justify-content-center text-warning" style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}>
                                            <iconify-icon icon="solar:cup-first-bold-duotone" style={{ fontSize: '24px' }}></iconify-icon>
                                        </div>
                                        <div>
                                            <h6 className="modal-title fw-bold text-white mb-0" style={{ fontSize: '16px' }}>
                                                Service-Wise Commission Breakdown &amp; Filters
                                            </h6>
                                            <small className="text-white-50" style={{ fontSize: '11px' }}>Detailed commission reports for Retailer earnings</small>
                                        </div>
                                    </div>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowCommissionModal(false)}></button>
                                </div>

                                <div className="modal-body p-4 bg-light">

                                    {/* Filter Tabs for Services */}
                                    <div className="d-flex flex-wrap gap-1.5 mb-3 bg-white p-1.5 rounded-3 border shadow-xs">
                                        {[
                                            { key: 'ALL', label: 'All Services', icon: 'solar:widget-5-bold-duotone' },
                                            { key: 'RECHARGE', label: 'Recharge', icon: 'solar:cellphone-bold-duotone' },
                                            { key: 'BBPS', label: 'BBPS Bills', icon: 'solar:bolt-bold-duotone' },
                                            { key: 'AEPS', label: 'AEPS Cash', icon: 'ic:baseline-fingerprint' },
                                            { key: 'PAN_CARD', label: 'PAN Card', icon: 'solar:card-bold-duotone' },
                                            { key: 'OTHER', label: 'Others', icon: 'solar:wallet-money-bold-duotone' },
                                        ].map(tab => (
                                            <button
                                                key={tab.key}
                                                type="button"
                                                className={`btn btn-sm rounded-pill fw-bold px-3 py-1.5 d-flex align-items-center gap-1 transition-all ${selectedCommissionService === tab.key ? 'btn-primary text-white shadow-xs' : 'btn-light text-muted border-0'}`}
                                                style={{ fontSize: '11.5px' }}
                                                onClick={() => setSelectedCommissionService(tab.key)}
                                            >
                                                <iconify-icon icon={tab.icon} style={{ fontSize: '14px' }}></iconify-icon>
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Active Selected Service Summary Box */}
                                    {(() => {
                                        const currentInfo = getFilteredCommissionDetails();
                                        return (
                                            <div className="card border-0 rounded-3 shadow-xs mb-3 bg-white border" style={{ borderColor: '#E2E8F0' }}>
                                                <div className="card-body p-3">
                                                    <div className="row align-items-center g-3">
                                                        <div className="col-md-7">
                                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                                <span className={`badge ${currentInfo.badgeBg} fw-bold px-2 py-0.5 rounded-pill`} style={{ fontSize: '10px' }}>
                                                                    ACTIVE FILTER
                                                                </span>
                                                                <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '14px' }}>{currentInfo.name}</h6>
                                                            </div>
                                                            <p className="text-muted mb-0" style={{ fontSize: '11.5px' }}>{currentInfo.desc}</p>
                                                        </div>

                                                        <div className="col-md-5 text-md-end border-md-start ps-md-3">
                                                            <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.4px' }}>Earnings Volume</small>
                                                            <h4 className="fw-bold text-success mb-0" style={{ fontSize: '1.4rem' }}>
                                                                {formatCurrency(currentInfo.amount)}
                                                            </h4>
                                                            <small className="text-muted" style={{ fontSize: '11px' }}>
                                                                Count: <strong className="text-dark">{currentInfo.txns}</strong> Transactions
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* All 5 Service Cards Grid */}
                                    <div className="row g-2 mb-3">
                                        <div className="col-6 col-md-4">
                                            <div className="p-2.5 rounded-3 border bg-white shadow-xs">
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '8.5px' }}>📱 Recharge Commission</small>
                                                <span className="fw-bold text-primary fs-6 d-block">{formatCurrency(commStats.recharge_commission)}</span>
                                                <small className="text-muted" style={{ fontSize: '10px' }}>{commStats.recharge_txns} Txns</small>
                                            </div>
                                        </div>

                                        <div className="col-6 col-md-4">
                                            <div className="p-2.5 rounded-3 border bg-white shadow-xs">
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '8.5px' }}>💡 BBPS Bills Commission</small>
                                                <span className="fw-bold text-warning fs-6 d-block">{formatCurrency(commStats.bbps_commission)}</span>
                                                <small className="text-muted" style={{ fontSize: '10px' }}>{commStats.bbps_txns} Txns</small>
                                            </div>
                                        </div>

                                        <div className="col-6 col-md-4">
                                            <div className="p-2.5 rounded-3 border bg-white shadow-xs">
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '8.5px' }}>🖐️ AEPS Cash Commission</small>
                                                <span className="fw-bold text-success fs-6 d-block">{formatCurrency(commStats.aeps_commission)}</span>
                                                <small className="text-muted" style={{ fontSize: '10px' }}>{commStats.aeps_txns} Txns</small>
                                            </div>
                                        </div>

                                        <div className="col-6 col-md-6">
                                            <div className="p-2.5 rounded-3 border bg-white shadow-xs">
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '8.5px' }}>📄 PAN Card Commission</small>
                                                <span className="fw-bold text-info fs-6 d-block">{formatCurrency(commStats.pan_commission)}</span>
                                                <small className="text-muted" style={{ fontSize: '10px' }}>{commStats.pan_txns} Txns</small>
                                            </div>
                                        </div>

                                        <div className="col-6 col-md-6">
                                            <div className="p-2.5 rounded-3 border bg-white shadow-xs">
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '8.5px' }}>⚡ Other Services Commission</small>
                                                <span className="fw-bold text-purple fs-6 d-block">{formatCurrency(commStats.other_commission)}</span>
                                                <small className="text-muted" style={{ fontSize: '10px' }}>{commStats.other_txns} Txns</small>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Filtered Passbook Transactions */}
                                    <div className="card border-0 rounded-3 shadow-xs bg-white border">
                                        <div className="card-header bg-white border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
                                            <span className="fw-bold text-dark" style={{ fontSize: '12.5px' }}>Recent Commission Ledger</span>
                                            <span className="badge bg-light text-secondary border fw-bold" style={{ fontSize: '9.5px' }}>FILTERED RECORD</span>
                                        </div>
                                        <div className="card-body p-0">
                                            {recentTransactions.length > 0 ? (
                                                <div className="table-responsive">
                                                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '12px' }}>
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th className="ps-3 py-2 text-muted fw-bold">DATE</th>
                                                                <th className="py-2 text-muted fw-bold">DESCRIPTION</th>
                                                                <th className="py-2 text-muted fw-bold">TYPE</th>
                                                                <th className="pe-3 py-2 text-end text-muted fw-bold">COMMISSION</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {recentTransactions.map((tx, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="ps-3 py-2 text-muted" style={{ fontSize: '11px' }}>
                                                                        {tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-GB') : 'N/A'}
                                                                    </td>
                                                                    <td className="py-2 fw-semibold text-dark text-truncate" style={{ maxWidth: '220px' }}>
                                                                        {tx.description || 'Service Transaction Commission'}
                                                                    </td>
                                                                    <td className="py-2">
                                                                        <span className={`badge ${tx.type === 'CR' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} fw-bold px-2 py-0.5`} style={{ fontSize: '9px' }}>
                                                                            {tx.type === 'CR' ? 'CR (Earned)' : 'DR'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="pe-3 py-2 text-end fw-bold text-success">
                                                                        +{formatCurrency(tx.amount)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-muted" style={{ fontSize: '12px' }}>
                                                    <iconify-icon icon="solar:inbox-line" style={{ fontSize: '28px' }} className="d-block mb-1 mx-auto text-secondary"></iconify-icon>
                                                    No transaction records for selected filter
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>


                            </div>
                        </div>
                    </div>
                )}

            </div>

            <style jsx="true">{`
                .hover-scale {
                    transition: transform 0.2s ease-in-out;
                }
                .hover-scale:hover {
                    transform: scale(1.08);
                }
                .cursor-pointer {
                    cursor: pointer;
                }
                .transition-all {
                    transition: all 0.25s ease-in-out;
                }
                .z-index-1 {
                    z-index: 1;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin-icon {
                    display: inline-block;
                    animation: spin 0.8s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default AgentDashboard;
