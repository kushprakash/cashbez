import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ApiService from '../core/services/ApiService';
import { toast } from 'react-toastify';

const CommissionReportPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const apiService = ApiService();

    // Helper to extract initial values from window location
    const getInitialFilters = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const pType = urlParams.get('type');
        const pService = urlParams.get('service') || 'ALL';
        const pAccount = urlParams.get('account') || 'ALL';
        const pStart = urlParams.get('start_date') || '';
        const pEnd = urlParams.get('end_date') || '';

        const isChargeService = ['TDS', '2FA', 'MOVE_TO', 'DMT', 'PAYOUT'].includes(pService);
        const resolvedType = pType || (isChargeService ? 'charges' : 'commission');

        return {
            type: resolvedType,
            serviceType: pService,
            accountType: pAccount,
            startDate: pStart,
            endDate: pEnd
        };
    };

    const initial = getInitialFilters();

    // Filters State
    const [startDate, setStartDate] = useState(initial.startDate);
    const [endDate, setEndDate] = useState(initial.endDate);
    const [type, setType] = useState(initial.type); // 'commission', 'charges'
    const [serviceType, setServiceType] = useState(initial.serviceType);
    const [accountType, setAccountType] = useState(initial.accountType);
    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [records, setRecords] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 20 });
    const [summary, setSummary] = useState({ total_commissions: 0, total_charges: 0, net_earnings: 0, total_transactions: 0 });

    const fetchReport = async (pageNo = 1, currentType = type, currentService = serviceType) => {
        setLoading(true);
        try {
            const payload = {
                page: pageNo,
                start_date: startDate,
                end_date: endDate,
                type: currentType,
                report_type: currentType,
                service_type: currentService,
                service: currentService,
                account_type: accountType,
            };

            const res = await apiService.vPost('/api/agent/commission-report', payload);
            if (res?.data?.status === 1) {
                const data = res.data;
                setRecords(data.data.data || []);
                setPagination({
                    current_page: data.data.current_page || 1,
                    last_page: data.data.last_page || 1,
                    total: data.data.total || 0,
                    per_page: data.data.per_page || 20
                });
                if (data.summary) {
                    setSummary(data.summary);
                }
            } else {
                toast.error(res?.data?.message || 'Failed to fetch report');
            }
        } catch (err) {
            console.error('Error fetching commission report:', err);
            toast.error('Failed to load commission & charges report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const paramType = searchParams.get('type');
        const paramService = searchParams.get('service');
        const paramAccount = searchParams.get('account');
        const paramStart = searchParams.get('start_date');
        const paramEnd = searchParams.get('end_date');

        const isChargeService = ['TDS', '2FA', 'MOVE_TO', 'DMT', 'PAYOUT'].includes(paramService);
        const resolvedType = paramType || (isChargeService ? 'charges' : 'commission');

        if (resolvedType !== type) setType(resolvedType);
        if (paramService !== null && paramService !== serviceType) setServiceType(paramService);
        if (paramAccount !== null && paramAccount !== accountType) setAccountType(paramAccount);
        if (paramStart !== null && paramStart !== startDate) setStartDate(paramStart);
        if (paramEnd !== null && paramEnd !== endDate) setEndDate(paramEnd);
    }, [searchParams]);

    useEffect(() => {
        fetchReport(1, type, serviceType);
    }, [startDate, endDate, type, serviceType, accountType]);

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchReport(1, type, serviceType);
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        setType('commission');
        setServiceType('ALL');
        setAccountType('ALL');
        setSearchParams({});
    };

    const handleExportCsv = async () => {
        setExporting(true);
        try {
            const payload = {
                export: true,
                start_date: startDate,
                end_date: endDate,
                type: type,
                report_type: type,
                service_type: serviceType,
                service: serviceType,
                account_type: accountType,
            };

            const res = await apiService.vPost('/api/agent/commission-report', payload);
            if (res?.data?.status === 1 && Array.isArray(res.data.data)) {
                const exportItems = res.data.data;
                if (exportItems.length === 0) {
                    toast.info('No transactions found to export.');
                    setExporting(false);
                    return;
                }

                // Build CSV string
                const headers = ['#ID', 'Date & Time', 'Description', 'Amount (INR)'];
                const rows = exportItems.map((row, index) => [
                    index + 1,
                    `"${new Date(row.created_at).toLocaleString('en-GB')}"`,
                    `"${(row.description || '').replace(/"/g, '""')}"`,
                    `${row.type === 'CR' ? '+' : '-'}${Number(row.amount || 0).toFixed(2)}`
                ]);

                const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement('a');
                link.setAttribute('href', encodedUri);
                link.setAttribute('download', `Commission_Charges_Report_${new Date().toISOString().slice(0, 10)}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('Report exported successfully!');
            } else {
                toast.error('Failed to export report');
            }
        } catch (err) {
            console.error('Export error:', err);
            toast.error('Error exporting CSV report');
        } finally {
            setExporting(false);
        }
    };

    const formatCurrency = (amt) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amt || 0);
    };

    return (
        <div className="container-fluid px-3 py-3" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
            {/* Header */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 bg-white p-3 rounded-4 shadow-sm border" style={{ borderColor: '#E2E8F0' }}>
                <div>
                    <h4 className="fw-bold mb-1" style={{ color: '#1B2559' }}>
                        {type === 'charges' ? 'TDS & Charges Detailed Report' : 'Commission Detailed Report'}
                    </h4>
                    <p className="text-muted mb-0 small">
                        {type === 'charges' 
                            ? 'Track all TDS deductions, 2FA biometric charges & wallet settlement fees.'
                            : 'Track all service earnings & commissions across active services.'}
                    </p>
                </div>
                <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
                    <Link to="/dashboard" className="btn btn-outline-secondary btn-sm rounded-pill fw-bold px-3">
                        &larr; Back to Dashboard
                    </Link>
                    <button
                        type="button"
                        className="btn btn-success btn-sm rounded-pill fw-bold px-3 d-inline-flex align-items-center gap-1 shadow-sm"
                        onClick={handleExportCsv}
                        disabled={exporting}
                    >
                        <iconify-icon icon="solar:download-bold-duotone" className="fs-5"></iconify-icon>
                        {exporting ? 'Exporting...' : 'Export to CSV'}
                    </button>
                </div>
            </div>

            {/* Summary Cards Row */}
            <div className="row g-3 mb-3">
                {type === 'charges' ? (
                    <>
                        {/* Total TDS & Charges */}
                        <div className="col-md-6">
                            <div className="card border-0 rounded-4 shadow-sm bg-white p-3 h-100" style={{ borderLeft: '5px solid #EF4444' }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '11px' }}>Total TDS &amp; Charges Deducted</small>
                                        <h3 className="fw-extrabold text-danger mb-0 font-monospace" style={{ fontSize: '1.5rem' }}>
                                            {formatCurrency(summary.total_charges)}
                                        </h3>
                                    </div>
                                    <div className="rounded-circle p-2 bg-danger-subtle text-danger d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                                        <iconify-icon icon="solar:bill-cross-bold-duotone" style={{ fontSize: '24px' }}></iconify-icon>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Total Deduction Transactions Count */}
                        <div className="col-md-6">
                            <div className="card border-0 rounded-4 shadow-sm bg-white p-3 h-100" style={{ borderLeft: '5px solid #F59E0B' }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '11px' }}>Total Charge Transactions</small>
                                        <h3 className="fw-extrabold text-warning-emphasis mb-0 font-monospace" style={{ fontSize: '1.5rem' }}>
                                            {summary.total_transactions} txns
                                        </h3>
                                    </div>
                                    <div className="rounded-circle p-2 bg-warning-subtle text-warning-emphasis d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                                        <iconify-icon icon="solar:document-text-bold-duotone" style={{ fontSize: '24px' }}></iconify-icon>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Total Commissions */}
                        <div className="col-md-6">
                            <div className="card border-0 rounded-4 shadow-sm bg-white p-3 h-100" style={{ borderLeft: '5px solid #10B981' }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '11px' }}>Total Commissions Earned</small>
                                        <h3 className="fw-extrabold text-success mb-0 font-monospace" style={{ fontSize: '1.5rem' }}>
                                            {formatCurrency(summary.total_commissions)}
                                        </h3>
                                    </div>
                                    <div className="rounded-circle p-2 bg-success-subtle text-success d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                                        <iconify-icon icon="solar:cup-first-bold-duotone" style={{ fontSize: '24px' }}></iconify-icon>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Total Commission Transactions Count */}
                        <div className="col-md-6">
                            <div className="card border-0 rounded-4 shadow-sm bg-white p-3 h-100" style={{ borderLeft: '5px solid #3B82F6' }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '11px' }}>Total Commission Transactions</small>
                                        <h3 className="fw-extrabold text-primary mb-0 font-monospace" style={{ fontSize: '1.5rem' }}>
                                            {summary.total_transactions} txns
                                        </h3>
                                    </div>
                                    <div className="rounded-circle p-2 bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                                        <iconify-icon icon="solar:wallet-money-bold-duotone" style={{ fontSize: '24px' }}></iconify-icon>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Filter Section */}
            <div className="card border-0 rounded-4 shadow-sm bg-white mb-3">
                <div className="card-body p-3">
                    <form onSubmit={handleFilterSubmit} className="row g-2 align-items-end">
                        {/* Start Date */}
                        <div className="col-md-3 col-6">
                            <label className="form-label fw-bold text-muted small mb-1">Start Date</label>
                            <input
                                type="date"
                                className="form-control form-control-sm rounded-3"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        {/* End Date */}
                        <div className="col-md-3 col-6">
                            <label className="form-label fw-bold text-muted small mb-1">End Date</label>
                            <input
                                type="date"
                                className="form-control form-control-sm rounded-3"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>

                        {/* Service Category */}
                        <div className="col-md-3 col-6">
                            <label className="form-label fw-bold text-muted small mb-1">Service Category</label>
                            <select
                                className="form-select form-select-sm rounded-3 fw-bold"
                                value={serviceType}
                                onChange={(e) => setServiceType(e.target.value)}
                            >
                                {type === 'charges' ? (
                                    <>
                                        <option value="ALL">All Charges</option>
                                        <option value="TDS">TDS (Primary)</option>
                                        <option value="2FA">2FA Charge (Primary)</option>
                                        <option value="MOVE_TO">Move To Charge (Secondary)</option>
                                        <option value="DMT">Money Transfer / DMT (Secondary)</option>
                                        <option value="PAYOUT">Payout Charge (Secondary)</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="ALL">All Commission Services</option>
                                        <option value="RECHARGE">Recharge (Secondary)</option>
                                        <option value="BBPS">BBPS Bills (Secondary)</option>
                                        <option value="AEPS">AEPS / MATM (Primary)</option>
                                        <option value="PAN">PAN Card (Secondary)</option>
                                        <option value="OTHER">Others (Secondary)</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Account Type */}
                        <div className="col-md-3 col-6">
                            <label className="form-label fw-bold text-muted small mb-1">Account Wallet</label>
                            <select
                                className="form-select form-select-sm rounded-3 fw-bold"
                                value={accountType}
                                onChange={(e) => setAccountType(e.target.value)}
                            >
                                <option value="ALL">All Wallets</option>
                                <option value="PRIMARY">Primary (Trade Wallet)</option>
                                <option value="SECONDARY">Secondary (Utility Wallet)</option>
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="col-12 d-flex justify-content-end gap-2 mt-2">
                            <button type="button" onClick={handleReset} className="btn btn-light border btn-sm rounded-pill fw-bold px-4 py-1.5">
                                Reset
                            </button>
                            <button type="submit" className="btn btn-primary btn-sm rounded-pill fw-bold px-4 py-1.5 shadow-sm">
                                Apply Filter
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Data Table Section */}
            <div className="card border-0 rounded-4 shadow-sm bg-white overflow-hidden">
                <div className="card-header bg-white border-0 py-3 px-3 d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold mb-0 text-dark">
                        Passbook Transactions ({pagination.total} Records)
                    </h6>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
                        <thead className="table-light">
                            <tr>
                                <th className="ps-3 py-3" style={{ width: '70px' }}>#ID</th>
                                <th className="py-3" style={{ width: '180px' }}>Date &amp; Time</th>
                                <th className="py-3">Description</th>
                                <th className="pe-3 py-3 text-end" style={{ width: '140px' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-4">
                                        <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                                        Loading passbook entries...
                                    </td>
                                </tr>
                            ) : records.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-4 text-muted">
                                        No commission or charges records found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                records.map((row, index) => (
                                    <tr key={row.id}>
                                        <td className="ps-3 fw-bold text-secondary">
                                            #{(pagination.current_page - 1) * pagination.per_page + index + 1}
                                        </td>
                                        <td className="text-muted fw-semibold">
                                            {new Date(row.created_at).toLocaleString('en-GB')}
                                        </td>
                                        <td className="fw-semibold text-dark">{row.description}</td>
                                        <td className={`pe-3 text-end fw-extrabold font-monospace ${row.type === 'CR' ? 'text-success' : 'text-danger'}`}>
                                            {row.type === 'CR' ? '+' : '-'}{formatCurrency(row.amount)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {pagination.last_page > 1 && (
                    <div className="card-footer bg-white border-0 py-3 px-3 d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                            Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total items)
                        </small>
                        <div className="btn-group">
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                disabled={pagination.current_page === 1}
                                onClick={() => fetchReport(pagination.current_page - 1)}
                            >
                                &laquo; Previous
                            </button>
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                disabled={pagination.current_page === pagination.last_page}
                                onClick={() => fetchReport(pagination.current_page + 1)}
                            >
                                Next &raquo;
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommissionReportPage;
