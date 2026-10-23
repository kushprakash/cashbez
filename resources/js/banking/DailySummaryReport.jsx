import React, { useState, useEffect, useMemo } from 'react';
import ApiService from '../core/services/ApiService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DailySummaryReport() {
    const apiService = ApiService();

    // Default to today's date formatted as YYYY-MM-DD
    const getTodayDateStr = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getYesterdayDateStr = () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [selectedDate, setSelectedDate] = useState(getTodayDateStr());
    const [selectedEntityId, setSelectedEntityId] = useState('all'); // 'all' for super admin, 'self' for admin
    const [entityList, setEntityList] = useState([]);
    const [currentUserInfo, setCurrentUserInfo] = useState(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [hideZeroRows, setHideZeroRows] = useState(false);

    const [reportData, setReportData] = useState({
        trade_wallet: {
            wallet_name: 'Trade Wallet',
            primary_status: true,
            opening_balance: 0,
            credits: [],
            debits: [],
            total_credit: 0,
            total_debit: 0,
            closing_balance: 0,
            system_closing_balance: 0
        },
        utility_wallet: {
            wallet_name: 'Utility Wallet',
            primary_status: false,
            opening_balance: 0,
            credits: [],
            debits: [],
            total_credit: 0,
            total_debit: 0,
            closing_balance: 0,
            system_closing_balance: 0
        },
        target_info: null
    });

    useEffect(() => {
        initOptionsAndReport();
    }, []);

    const initOptionsAndReport = async () => {
        try {
            const res = await apiService.vGet('/api/daily-summary-report/admins');
            let initialEntityId = 'all';

            if (res && res.data && res.data.status === 1) {
                const superAdm = !!res.data.is_super_admin;
                const adm = !!res.data.is_admin;
                setIsSuperAdmin(superAdm);
                setIsAdmin(adm);
                if (res.data.current_user) {
                    setCurrentUserInfo(res.data.current_user);
                }
                if (Array.isArray(res.data.data)) {
                    setEntityList(res.data.data);
                }

                if (adm && !superAdm) {
                    initialEntityId = 'self';
                    setSelectedEntityId('self');
                }
            }
            fetchReport(selectedDate, initialEntityId);
        } catch (err) {
            console.warn('Error fetching options list:', err);
            fetchReport(selectedDate, 'all');
        }
    };

    const fetchReport = async (date, entityId) => {
        setLoading(true);
        try {
            const params = { date };
            if (entityId && entityId !== 'all') {
                if (entityId === 'self') {
                    params.user_id = currentUserInfo?.id || 'self';
                } else {
                    params.user_id = entityId;
                    params.admin_id = entityId;
                }
            } else if (entityId === 'all') {
                params.admin_id = 'all';
            }

            const res = await apiService.vGet('/api/daily-summary-report', params);
            if (res && res.data && res.data.status === 1 && res.data.data) {
                setReportData(res.data.data);
                if (res.data.data.is_super_admin) {
                    setIsSuperAdmin(true);
                }
                if (res.data.data.is_admin) {
                    setIsAdmin(true);
                }
            } else {
                toast.error(res?.data?.message || 'Failed to fetch summary report');
            }
        } catch (err) {
            console.error('Error fetching daily summary report:', err);
            toast.error('An error occurred while loading the report');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e) => {
        const d = e.target.value;
        setSelectedDate(d);
        fetchReport(d, selectedEntityId);
    };

    const handleSetDate = (dStr) => {
        setSelectedDate(dStr);
        fetchReport(dStr, selectedEntityId);
    };

    const handleEntityChange = (e) => {
        const entityId = e.target.value;
        setSelectedEntityId(entityId);
        fetchReport(selectedDate, entityId);
    };

    const handleRefresh = () => {
        fetchReport(selectedDate, selectedEntityId);
    };

    const handlePrint = () => {
        window.print();
    };

    const formatCurrency = (val) => {
        const num = Number(val || 0);
        return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Filter helper for rows
    const filterRows = (items) => {
        if (!Array.isArray(items)) return [];
        return items.filter(item => {
            const matchesSearch = !searchTerm || item.label.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesZero = !hideZeroRows || item.amount > 0 || item.count > 0;
            return matchesSearch && matchesZero;
        });
    };

    const tradeCredits = useMemo(() => filterRows(reportData.trade_wallet?.credits), [reportData.trade_wallet, searchTerm, hideZeroRows]);
    const tradeDebits = useMemo(() => filterRows(reportData.trade_wallet?.debits), [reportData.trade_wallet, searchTerm, hideZeroRows]);

    const utilityCredits = useMemo(() => filterRows(reportData.utility_wallet?.credits), [reportData.utility_wallet, searchTerm, hideZeroRows]);
    const utilityDebits = useMemo(() => filterRows(reportData.utility_wallet?.debits), [reportData.utility_wallet, searchTerm, hideZeroRows]);

    // Active label for display
    const selectedScopeLabel = useMemo(() => {
        if (isSuperAdmin) {
            if (selectedEntityId === 'all') return 'All Users Combined (Admins + Users)';
            const found = entityList.find(a => String(a.id) === String(selectedEntityId));
            return found ? `Admin: ${found.name} (${found.mid})` : `User #${selectedEntityId}`;
        }
        if (isAdmin) {
            if (selectedEntityId === 'self') return `My Admin & Downline Users (${currentUserInfo?.name || 'Self'})`;
            const found = entityList.find(u => String(u.id) === String(selectedEntityId));
            return found ? `User: ${found.name} (${found.mid})` : `User #${selectedEntityId}`;
        }
        return reportData.target_info ? `${reportData.target_info.name} (${reportData.target_info.mid})` : 'My Wallet';
    }, [selectedEntityId, entityList, isSuperAdmin, isAdmin, currentUserInfo, reportData.target_info]);

    return (
        <div className="container-fluid py-3 px-3">
            <ToastContainer />
            <style>{`
                .font-monospace { font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
                .table-responsive-custom { max-height: 380px; overflow-y: auto; }
                .summary-formula-box {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 10px 14px;
                }
                .highlight-val {
                    font-size: 1.1rem;
                    font-weight: 700;
                }
                @media print {
                    .d-print-none { display: none !important; }
                    .d-print-block { display: block !important; }
                    body { background: #fff !important; color: #000 !important; font-size: 11px; }
                    .card { border: 1px solid #999 !important; box-shadow: none !important; margin-bottom: 15px !important; page-break-inside: avoid; }
                    .table-responsive-custom { max-height: none !important; overflow: visible !important; }
                    .print-row { display: flex !important; flex-direction: row !important; }
                    .print-col-6 { width: 50% !important; flex: 0 0 50% !important; }
                }
            `}</style>

            {/* Top Toolbar / Filter Bar */}
            <div className="card shadow-sm border-0 mb-3 d-print-none">
                <div className="card-body p-3">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                        {/* Title and Role Badge */}
                        <div className="d-flex align-items-center gap-2">
                            <div className="bg-primary text-white rounded p-2 d-flex align-items-center justify-content-center">
                                <i className="bx bx-receipt fs-4"></i>
                            </div>
                            <div>
                                <h4 className="fw-bold text-dark mb-0">Daily Summary Report</h4>
                                <div className="d-flex align-items-center gap-2 mt-1">
                                    <span className={`badge ${isSuperAdmin ? 'bg-primary' : (isAdmin ? 'bg-info' : 'bg-secondary')} text-white`}>
                                        {isSuperAdmin ? 'Super Admin' : (isAdmin ? 'Admin' : 'User')}
                                    </span>
                                    <span className="text-muted small">
                                        Scope: <strong>{selectedScopeLabel}</strong>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Filters and Actions */}
                        <div className="d-flex flex-wrap align-items-center gap-2">
                            {/* Date Quick Selector */}
                            <div className="btn-group btn-group-sm" role="group">
                                <button
                                    type="button"
                                    onClick={() => handleSetDate(getTodayDateStr())}
                                    className={`btn ${selectedDate === getTodayDateStr() ? 'btn-primary' : 'btn-outline-secondary'}`}
                                >
                                    Today
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSetDate(getYesterdayDateStr())}
                                    className={`btn ${selectedDate === getYesterdayDateStr() ? 'btn-primary' : 'btn-outline-secondary'}`}
                                >
                                    Yesterday
                                </button>
                            </div>

                            {/* Date Picker */}
                            <div className="d-flex align-items-center bg-light border rounded px-2 py-1">
                                <label className="small text-muted mb-0 me-1 fw-bold">Date:</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    className="form-control form-control-sm border-0 bg-transparent fw-bold"
                                    style={{ width: '135px' }}
                                />
                            </div>

                            {/* Filter Dropdown for Super Admin (Admin Selector) */}
                            {isSuperAdmin && (
                                <div className="d-flex align-items-center bg-light border rounded px-2 py-1">
                                    <label className="small text-muted mb-0 me-1 fw-bold">Admin/User:</label>
                                    <select
                                        value={selectedEntityId}
                                        onChange={handleEntityChange}
                                        className="form-select form-select-sm border-0 bg-transparent fw-bold text-dark"
                                        style={{ minWidth: '180px', maxWidth: '240px' }}
                                    >
                                        <option value="all">All Users Combined</option>
                                        {entityList.map(adm => (
                                            <option key={adm.id} value={adm.id}>
                                                {adm.name} ({adm.mid})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Filter Dropdown for Admin (My Wallet vs Downline User Selector) */}
                            {isAdmin && !isSuperAdmin && (
                                <div className="d-flex align-items-center bg-light border rounded px-2 py-1">
                                    <label className="small text-muted mb-0 me-1 fw-bold">View:</label>
                                    <select
                                        value={selectedEntityId}
                                        onChange={handleEntityChange}
                                        className="form-select form-select-sm border-0 bg-transparent fw-bold text-dark"
                                        style={{ minWidth: '190px', maxWidth: '250px' }}
                                    >
                                        <option value="self">All My Users ({currentUserInfo?.name || 'Self'})</option>
                                        {entityList.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} ({u.mid})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Search Particulars */}
                            <div className="position-relative" style={{ width: '160px' }}>
                                <input
                                    type="text"
                                    placeholder="Search particulars..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="form-control form-control-sm pe-4"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm('')}
                                        className="btn btn-sm btn-link text-muted position-absolute end-0 top-0 text-decoration-none px-2 py-1"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Toggle Hide Zero Rows */}
                            <button
                                type="button"
                                onClick={() => setHideZeroRows(!hideZeroRows)}
                                className={`btn btn-sm ${hideZeroRows ? 'btn-primary' : 'btn-outline-secondary'} d-flex align-items-center gap-1`}
                                title="Show/Hide rows with 0 amount"
                            >
                                <i className={`bx ${hideZeroRows ? 'bx-check-square' : 'bx-checkbox'} fs-6`}></i>
                                <span>{hideZeroRows ? 'Active Only' : 'All Rows'}</span>
                            </button>

                            {/* Refresh Button */}
                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={loading}
                                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                title="Refresh data"
                            >
                                <i className={`bx bx-refresh ${loading ? 'bx-spin' : ''} fs-6`}></i>
                                <span>Refresh</span>
                            </button>

                            {/* Print Button */}
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="btn btn-sm btn-success d-flex align-items-center gap-1"
                                title="Print report"
                            >
                                <i className="bx bx-printer fs-6"></i>
                                <span>Print</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Header (Visible during Print only) */}
            <div className="d-none d-print-block mb-3 pb-2 border-bottom text-center">
                <h3 className="fw-bold mb-1 text-uppercase">DAILY SUMMARY REPORT</h3>
                <p className="mb-0 text-muted small">
                    <strong>Date:</strong> {selectedDate} &nbsp;|&nbsp; 
                    <strong>Scope:</strong> {selectedScopeLabel} &nbsp;|&nbsp; 
                    <strong>Generated on:</strong> {new Date().toLocaleString()}
                </p>
            </div>

            {/* High-Level Overview Cards */}
            <div className="row g-3 mb-3 d-print-none">
                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card shadow-sm border-0 border-start border-4 border-primary h-100">
                        <div className="card-body p-3">
                            <span className="text-muted small fw-semibold text-uppercase">Trade Opening / Closing</span>
                            <div className="fw-bold fs-6 text-dark font-monospace mt-1">
                                Open: ₹ {formatCurrency(reportData.trade_wallet?.opening_balance)}
                            </div>
                            <div className="fw-bold fs-6 text-primary font-monospace">
                                Close: ₹ {formatCurrency(reportData.trade_wallet?.closing_balance)}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card shadow-sm border-0 border-start border-4 border-info h-100">
                        <div className="card-body p-3">
                            <span className="text-muted small fw-semibold text-uppercase">Trade Credit / Debit</span>
                            <div className="fw-bold fs-6 text-success font-monospace mt-1">
                                Credit: +₹ {formatCurrency(reportData.trade_wallet?.total_credit)}
                            </div>
                            <div className="fw-bold fs-6 text-danger font-monospace">
                                Debit: -₹ {formatCurrency(reportData.trade_wallet?.total_debit)}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card shadow-sm border-0 border-start border-4 border-success h-100">
                        <div className="card-body p-3">
                            <span className="text-muted small fw-semibold text-uppercase">Utility Opening / Closing</span>
                            <div className="fw-bold fs-6 text-dark font-monospace mt-1">
                                Open: ₹ {formatCurrency(reportData.utility_wallet?.opening_balance)}
                            </div>
                            <div className="fw-bold fs-6 text-success font-monospace">
                                Close: ₹ {formatCurrency(reportData.utility_wallet?.closing_balance)}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card shadow-sm border-0 border-start border-4 border-warning h-100">
                        <div className="card-body p-3">
                            <span className="text-muted small fw-semibold text-uppercase">Utility Credit / Debit</span>
                            <div className="fw-bold fs-6 text-success font-monospace mt-1">
                                Credit: +₹ {formatCurrency(reportData.utility_wallet?.total_credit)}
                            </div>
                            <div className="fw-bold fs-6 text-danger font-monospace">
                                Debit: -₹ {formatCurrency(reportData.utility_wallet?.total_debit)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* SIDE-BY-SIDE WALLET REPORTS IN A SINGLE ROW (TRADE WALLET + UTILITY WALLET) */}
            {/* ========================================================================= */}
            <div className="row g-3 print-row mb-4">
                {/* ── LEFT COLUMN: TRADE WALLET ── */}
                <div className="col-12 col-xl-6 print-col-6">
                    <div className="card shadow-sm border-0 h-100 d-flex flex-column">
                        {/* Header */}
                        <div className="card-header bg-primary text-white py-2 px-3 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <i className="bx bx-wallet fs-5"></i>
                                <h5 className="fw-bold mb-0 text-uppercase tracking-wider fs-6">Trade Wallet</h5>
                            </div>
                            <span className="badge bg-white text-primary fw-bold text-uppercase">
                                Primary
                            </span>
                        </div>

                        {/* Opening Balance */}
                        <div className="bg-light border-bottom p-2 px-3 d-flex justify-content-between align-items-center">
                            <span className="fw-bold text-secondary text-uppercase small">Opening Balance:</span>
                            <span className="fw-bold text-primary font-monospace">
                                ₹ {formatCurrency(reportData.trade_wallet?.opening_balance)}
                            </span>
                        </div>

                        {/* Credit & Debit Tables Container */}
                        <div className="card-body p-2 flex-grow-1 d-flex flex-column gap-3">
                            {/* Trade Credit Table */}
                            <div className="border rounded">
                                <div className="bg-success bg-opacity-10 border-bottom p-2 px-3 d-flex justify-content-between align-items-center">
                                    <span className="fw-bold text-success small text-uppercase"><i className="bx bx-down-arrow-circle me-1"></i>Trade Credit</span>
                                    <span className="badge bg-success text-white">
                                        Total: ₹ {formatCurrency(reportData.trade_wallet?.total_credit)}
                                    </span>
                                </div>
                                <div className="table-responsive-custom">
                                    <table className="table table-hover table-striped table-bordered align-middle text-sm mb-0">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th className="text-center py-1.5" style={{ width: '35px' }}>#</th>
                                                <th className="py-1.5">PARTICULARS</th>
                                                <th className="text-center py-1.5" style={{ width: '65px' }}>COUNT</th>
                                                <th className="text-end py-1.5" style={{ width: '120px' }}>AMOUNT (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tradeCredits.length > 0 ? (
                                                tradeCredits.map((item, idx) => (
                                                    <tr key={item.key || idx}>
                                                        <td className="text-center text-muted font-monospace small py-1">{idx + 1}</td>
                                                        <td className="fw-semibold text-dark py-1 small">{item.label}</td>
                                                        <td className="text-center font-monospace py-1 small">
                                                            {item.count > 0 ? (
                                                                <span className="badge bg-success-subtle text-success border border-success-subtle px-1.5 py-0.5">
                                                                    {item.count}
                                                                </span>
                                                            ) : <span className="text-muted">0</span>}
                                                        </td>
                                                        <td className="text-end font-monospace fw-bold text-success py-1 small">
                                                            {item.amount > 0 ? `+${formatCurrency(item.amount)}` : '0.00'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="4" className="text-center text-muted py-3 small">No credit txns</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Trade Debit Table */}
                            <div className="border rounded">
                                <div className="bg-danger bg-opacity-10 border-bottom p-2 px-3 d-flex justify-content-between align-items-center">
                                    <span className="fw-bold text-danger small text-uppercase"><i className="bx bx-up-arrow-circle me-1"></i>Trade Debit</span>
                                    <span className="badge bg-danger text-white">
                                        Total: ₹ {formatCurrency(reportData.trade_wallet?.total_debit)}
                                    </span>
                                </div>
                                <div className="table-responsive-custom">
                                    <table className="table table-hover table-striped table-bordered align-middle text-sm mb-0">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th className="text-center py-1.5" style={{ width: '35px' }}>#</th>
                                                <th className="py-1.5">PARTICULARS</th>
                                                <th className="text-center py-1.5" style={{ width: '65px' }}>COUNT</th>
                                                <th className="text-end py-1.5" style={{ width: '120px' }}>AMOUNT (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tradeDebits.length > 0 ? (
                                                tradeDebits.map((item, idx) => (
                                                    <tr key={item.key || idx}>
                                                        <td className="text-center text-muted font-monospace small py-1">{idx + 1}</td>
                                                        <td className="fw-semibold text-dark py-1 small">{item.label}</td>
                                                        <td className="text-center font-monospace py-1 small">
                                                            {item.count > 0 ? (
                                                                <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-1.5 py-0.5">
                                                                    {item.count}
                                                                </span>
                                                            ) : <span className="text-muted">0</span>}
                                                        </td>
                                                        <td className="text-end font-monospace fw-bold text-danger py-1 small">
                                                            {item.amount > 0 ? `-${formatCurrency(item.amount)}` : '0.00'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="4" className="text-center text-muted py-3 small">No debit txns</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Trade Closing Balance Footer */}
                        <div className="card-footer bg-light p-2.5 border-top">
                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                                <span className="small text-muted fw-semibold text-uppercase">Trade Closing Balance</span>
                                <span className="fw-bold text-primary font-monospace highlight-val">
                                    ₹ {formatCurrency(reportData.trade_wallet?.closing_balance)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN: UTILITY WALLET ── */}
                <div className="col-12 col-xl-6 print-col-6">
                    <div className="card shadow-sm border-0 h-100 d-flex flex-column">
                        {/* Header */}
                        <div className="card-header bg-success text-white py-2 px-3 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <i className="bx bx-credit-card-front fs-5"></i>
                                <h5 className="fw-bold mb-0 text-uppercase tracking-wider fs-6">Utility Wallet</h5>
                            </div>
                            <span className="badge bg-white text-success fw-bold text-uppercase">
                                Utility
                            </span>
                        </div>

                        {/* Opening Balance */}
                        <div className="bg-light border-bottom p-2 px-3 d-flex justify-content-between align-items-center">
                            <span className="fw-bold text-secondary text-uppercase small">Opening Balance:</span>
                            <span className="fw-bold text-success font-monospace">
                                ₹ {formatCurrency(reportData.utility_wallet?.opening_balance)}
                            </span>
                        </div>

                        {/* Credit & Debit Tables Container */}
                        <div className="card-body p-2 flex-grow-1 d-flex flex-column gap-3">
                            {/* Utility Credit Table */}
                            <div className="border rounded">
                                <div className="bg-success bg-opacity-10 border-bottom p-2 px-3 d-flex justify-content-between align-items-center">
                                    <span className="fw-bold text-success small text-uppercase"><i className="bx bx-down-arrow-circle me-1"></i>Utility Credit</span>
                                    <span className="badge bg-success text-white">
                                        Total: ₹ {formatCurrency(reportData.utility_wallet?.total_credit)}
                                    </span>
                                </div>
                                <div className="table-responsive-custom">
                                    <table className="table table-hover table-striped table-bordered align-middle text-sm mb-0">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th className="text-center py-1.5" style={{ width: '35px' }}>#</th>
                                                <th className="py-1.5">PARTICULARS</th>
                                                <th className="text-center py-1.5" style={{ width: '65px' }}>COUNT</th>
                                                <th className="text-end py-1.5" style={{ width: '120px' }}>AMOUNT (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {utilityCredits.length > 0 ? (
                                                utilityCredits.map((item, idx) => (
                                                    <tr key={item.key || idx}>
                                                        <td className="text-center text-muted font-monospace small py-1">{idx + 1}</td>
                                                        <td className="fw-semibold text-dark py-1 small">{item.label}</td>
                                                        <td className="text-center font-monospace py-1 small">
                                                            {item.count > 0 ? (
                                                                <span className="badge bg-success-subtle text-success border border-success-subtle px-1.5 py-0.5">
                                                                    {item.count}
                                                                </span>
                                                            ) : <span className="text-muted">0</span>}
                                                        </td>
                                                        <td className="text-end font-monospace fw-bold text-success py-1 small">
                                                            {item.amount > 0 ? `+${formatCurrency(item.amount)}` : '0.00'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="4" className="text-center text-muted py-3 small">No credit txns</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Utility Debit Table */}
                            <div className="border rounded">
                                <div className="bg-danger bg-opacity-10 border-bottom p-2 px-3 d-flex justify-content-between align-items-center">
                                    <span className="fw-bold text-danger small text-uppercase"><i className="bx bx-up-arrow-circle me-1"></i>Utility Debit</span>
                                    <span className="badge bg-danger text-white">
                                        Total: ₹ {formatCurrency(reportData.utility_wallet?.total_debit)}
                                    </span>
                                </div>
                                <div className="table-responsive-custom">
                                    <table className="table table-hover table-striped table-bordered align-middle text-sm mb-0">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th className="text-center py-1.5" style={{ width: '35px' }}>#</th>
                                                <th className="py-1.5">PARTICULARS</th>
                                                <th className="text-center py-1.5" style={{ width: '65px' }}>COUNT</th>
                                                <th className="text-end py-1.5" style={{ width: '120px' }}>AMOUNT (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {utilityDebits.length > 0 ? (
                                                utilityDebits.map((item, idx) => (
                                                    <tr key={item.key || idx}>
                                                        <td className="text-center text-muted font-monospace small py-1">{idx + 1}</td>
                                                        <td className="fw-semibold text-dark py-1 small">{item.label}</td>
                                                        <td className="text-center font-monospace py-1 small">
                                                            {item.count > 0 ? (
                                                                <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-1.5 py-0.5">
                                                                    {item.count}
                                                                </span>
                                                            ) : <span className="text-muted">0</span>}
                                                        </td>
                                                        <td className="text-end font-monospace fw-bold text-danger py-1 small">
                                                            {item.amount > 0 ? `-${formatCurrency(item.amount)}` : '0.00'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="4" className="text-center text-muted py-3 small">No debit txns</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Utility Closing Balance Footer */}
                        <div className="card-footer bg-light p-2.5 border-top">
                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                                <span className="small text-muted fw-semibold text-uppercase">Utility Closing Balance</span>
                                <span className="fw-bold text-success font-monospace highlight-val">
                                    ₹ {formatCurrency(reportData.utility_wallet?.closing_balance)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
