import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../../core/hooks/context';

const Summary = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [summaryData, setSummary] = useState({
        transactions: {
            data: [],
            current_page: 1,
            last_page: 1,
            total: 0,
            from: 0,
            to: 0,
            per_page: 50,
        },
        comm_slabs: [],
        fingpay_charges: [], // Array of all charge records for date-based lookup
        overall_total_amount: 0,
        be_count: 0,
        ms_count: 0,
        matm_be_count: 0,
    });

    const [filters, setFilters] = useState({
        type: "CW",
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        page: 1,
    });

    const apiService = ApiService();
    const { userData } = useContext(AuthContext);

    useEffect(() => {
        if (userData && userData.role !== 1 && userData.id !== 21) {
            navigate('/');
        }
    }, [userData, navigate]);

    useEffect(() => {
        fetchSummary(true);
    }, [filters.type, filters.startDate, filters.endDate, filters.page]);

    const fetchSummary = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                start_date: filters.startDate,
                end_date: filters.endDate,
                type: filters.type,
                per_page: 50,
                page: filters.page,
            }).toString();

            const response = await apiService.vGet(`/api/banking/summary?${queryParams}`);
            if (response.data && response.data.status === 1) {
                setSummary(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching summary:', error);
            if (showLoading) toast.error('Failed to fetch summary');
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
    };

    const handleTypeChange = (type) => {
        setFilters({ ...filters, type, page: 1 });
    };

    // Helper function to find the applicable fingpay charge based on transaction date
    // Finds the charge record where charge.date <= transaction.created_at (most recent applicable rate)
    const getFingpayChargePercent = (transactionDate) => {
        const txnDate = new Date(transactionDate);
        const typeKey = filters.type.toLowerCase(); // 'cw', 'cd', or 'matm'

        // Find the first charge record where date <= transaction date (already sorted desc)
        const applicableCharge = summaryData.fingpay_charges.find(charge => {
            const chargeDate = new Date(charge.date);
            return chargeDate <= txnDate;
        });

        if (applicableCharge && typeKey !== 'm') {
            return parseFloat(applicableCharge[typeKey] || 0);
        }
        return 0;
    };

    // Helper function to find commission slab for a given amount AND transaction date
    // Finds the slab where slab.date <= transaction.created_at AND amount matches the slab range
    const getCommissionSlab = (amount, transactionDate) => {
        const txnDate = new Date(transactionDate);

        // Find slabs that match the amount range, then find the one with the most recent applicable date
        const matchingSlabs = summaryData.comm_slabs.filter(s => {
            const [min, max] = s.amt_slab.split('-').map(Number);
            return amount >= min && amount <= max;
        });

        // From matching slabs, find the one with date <= transaction date (already sorted by date desc)
        const applicableSlab = matchingSlabs.find(slab => {
            const slabDate = new Date(slab.date);
            return slabDate <= txnDate;
        });

        return applicableSlab || { retailer: 0, distributor: 0, super: 0 };
    };

    // Calculate commissions for a transaction
    const calculateCommissions = (transaction) => {
        const amount = parseFloat(transaction.amount);
        const transactionDate = transaction.created_at;

        // Get the applicable fingpay charge percentage for this transaction's date
        const fingpayChargePercent = getFingpayChargePercent(transactionDate);

        // FingPay net commission (what FingPay charges)
        let fingpayNetComm = 0;

        if (filters.type === 'M') {
            fingpayNetComm = 0;
        } else if (filters.type === 'CW' || filters.type === 'CD' || filters.type === 'MATM') {
            // 3000 > amount*0.5%-finpayChargePercent
            if (amount < 3000) {
                let actualFingPayComm = (amount * 0.5) / 100;

                let finPeChargeAmt = actualFingPayComm * fingpayChargePercent / 100;
                if (finPeChargeAmt < 0.50) {
                    fingpayNetComm = actualFingPayComm - 0.50;
                } else {
                    fingpayNetComm = actualFingPayComm - finPeChargeAmt;
                }
            } else {
                // 15 > 15*finpayChargePercent
                let actualFingPayComm = 15;
                let finPeChargeAmt = actualFingPayComm * fingpayChargePercent / 100;
                fingpayNetComm = actualFingPayComm - finPeChargeAmt;
            }
        }
        else {
            let actualFingPayComm = (amount * 0.5) / 100;
            let finPeChargeAmt = actualFingPayComm * fingpayChargePercent / 100;
            fingpayNetComm = actualFingPayComm - finPeChargeAmt;
        }

        // Get commission slab for this amount AND transaction date
        const slab = getCommissionSlab(amount, transactionDate);

        let retailerComm = parseFloat(slab.retailer || 0);
        let distributorComm = parseFloat(slab.distributor || 0);
        let superComm = parseFloat(slab.super || 0);

        // Cashbez profit = FingPay commission - (retailer + distributor + super)
        let cashbezProfit = fingpayNetComm - (retailerComm + distributorComm + superComm);

        let apiUserComm = 0;

        if (filters.type === 'M') {
            retailerComm = 0;
            distributorComm = 0;
            superComm = 0;
            apiUserComm = 0;
            cashbezProfit = 0;
        } else if (transaction.api_user == true) {

            retailerComm = 0;
            distributorComm = 0;
            superComm = 0;

            if (amount >= 1 && amount <= 799) {
                apiUserComm = fingpayNetComm / 2;
                cashbezProfit = fingpayNetComm - apiUserComm;
            } else if (amount >= 800 && amount <= 3000) {
                apiUserComm = (amount * 0.4) / 100;
                cashbezProfit = fingpayNetComm - apiUserComm;
            } else {
                apiUserComm = 12;
                cashbezProfit = fingpayNetComm - apiUserComm;
            }

        }

        return {
            fingpayNetComm: fingpayNetComm.toFixed(2),
            retailerComm: retailerComm.toFixed(2),
            distributorComm: distributorComm.toFixed(2),
            superComm: superComm.toFixed(2),
            apiUserComm: apiUserComm.toFixed(2),
            cashbezProfit: cashbezProfit.toFixed(2),
        };
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount) => {
        return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= summaryData.transactions.last_page) {
            setFilters({ ...filters, page: newPage });
        }
    };

    // Calculate totals for the current page
    const calculateTotals = () => {
        let totalAmount = 0;
        let totalFingpay = 0;
        let totalRetailer = 0;
        let totalDistributor = 0;
        let totalSuper = 0;
        let totalApiUser = 0;
        let totalCashbez = 0;

        summaryData.transactions.data.forEach(transaction => {
            const commissions = calculateCommissions(transaction);
            totalAmount += parseFloat(transaction.amount);
            totalFingpay += parseFloat(commissions.fingpayNetComm);
            totalRetailer += parseFloat(commissions.retailerComm);
            totalDistributor += parseFloat(commissions.distributorComm);
            totalSuper += parseFloat(commissions.superComm);
            totalApiUser += parseFloat(commissions.apiUserComm);
            totalCashbez += parseFloat(commissions.cashbezProfit);
        });

        return {
            totalAmount: totalAmount.toFixed(2),
            totalFingpay: totalFingpay.toFixed(2),
            totalRetailer: totalRetailer.toFixed(2),
            totalDistributor: totalDistributor.toFixed(2),
            totalSuper: totalSuper.toFixed(2),
            totalApiUser: totalApiUser.toFixed(2),
            totalCashbez: totalCashbez.toFixed(2),
        };
    };

    const totals = summaryData.transactions.data.length > 0 ? calculateTotals() : null;

    const handleExportExcel = async () => {
        try {
            const queryParams = new URLSearchParams({
                start_date: filters.startDate,
                end_date: filters.endDate,
                type: filters.type,
            }).toString();

            const response = await apiService.vGet(`/api/banking/summary/export?${queryParams}`, {
                responseType: 'blob'
            });

            // Create blob from response
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `summary_${filters.type}_${filters.startDate}_to_${filters.endDate}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Export successful!');
        } catch (error) {
            console.error('Error exporting:', error);
            toast.error('Failed to export data');
        }
    };

    const handleExportPayouts = async () => {
        try {
            const queryParams = new URLSearchParams({
                start_date: filters.startDate,
                end_date: filters.endDate,
            }).toString();

            const response = await apiService.vGet(`/api/banking/payouts/export?${queryParams}`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `payouts_${filters.startDate}_to_${filters.endDate}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Payouts exported successfully!');
        } catch (error) {
            console.error('Error exporting payouts:', error);
            toast.error('Failed to export payouts');
        }
    };

    return (
        <div className="reports-container">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar theme="light" />
            <Pageheader mainheading="Profit/Loss Summary" parentfolder="Banking" activepage="Summary" />

            <div className="page-content-box">
                <div className="page-content-box-inner">

                    {/* Filters Card */}
                    <div className="card custom-card border-0 shadow-sm mb-3">
                        <div className="card-body p-3">
                            <div className="row g-3 align-items-end">
                                {/* Transaction Type Selector */}
                                <div className="col-md-4">
                                    <label className="form-label small fw-semibold mb-2">Transaction Type</label>
                                    <div className="btn-group w-100" role="group">
                                        <button
                                            type="button"
                                            className={`btn ${filters.type === 'CW' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                                            onClick={() => handleTypeChange('CW')}
                                        >
                                            CW
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn ${filters.type === 'CD' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                                            onClick={() => handleTypeChange('CD')}
                                        >
                                            CD
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn ${filters.type === 'MATM' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                                            onClick={() => handleTypeChange('MATM')}
                                        >
                                            MATM
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn ${filters.type === 'M' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                                            onClick={() => handleTypeChange('M')}
                                        >
                                            Aadhar Pay (M)
                                        </button>
                                    </div>
                                </div>

                                <div className="col-md-2">
                                    <label className="form-label small fw-semibold mb-2">From Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        className="form-control form-control-sm"
                                        value={filters.startDate}
                                        onChange={handleFilterChange}
                                    />
                                </div>

                                <div className="col-md-2">
                                    <label className="form-label small fw-semibold mb-2">To Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        className="form-control form-control-sm"
                                        value={filters.endDate}
                                        onChange={handleFilterChange}
                                    />
                                </div>

                                <div className="col-md-2">
                                    <button
                                        className="btn btn-primary btn-sm w-100"
                                        onClick={() => fetchSummary(true)}
                                        disabled={loading}
                                    >
                                        <i className="fa fa-sync me-2"></i>
                                        {loading ? 'Loading...' : 'Refresh'}
                                    </button>
                                </div>

                                <div className="col-md-2 d-flex gap-1 align-items-center">
                                    <button
                                        className="btn btn-success btn-sm flex-grow-1"
                                        onClick={handleExportExcel}
                                        disabled={loading || summaryData.transactions.data.length === 0}
                                    >
                                        <i className="fa fa-file-excel me-1"></i>
                                        Export
                                    </button>

                                    {/* Export Payouts Button */}
                                    {(userData?.role == "1" || userData?.id == "21") && (
                                        <button
                                            className="btn btn-dark btn-sm"
                                            onClick={handleExportPayouts}
                                            title="Payouts Export"
                                        >
                                            <i className="fa fa-download me-1"></i>
                                            Payout
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Summary Statistics Card */}
                    {totals && (
                        <div className="card custom-card border-0 shadow-sm mb-3">
                            <div className="card-header bg-light p-2">
                                <h6 className="mb-0 text-primary">Overall Totals (All Transactions)</h6>
                            </div>
                            <div className="card-body p-3">
                                <div className="row g-3">
                                    <div className="col-md-2">
                                        <div className="text-muted small mb-1">Total Amount</div>
                                        <div className="fw-bold text-primary">{formatCurrency(summaryData.overall_total_amount || 0)}</div>
                                    </div>
                                    <div className="col-md-1">
                                        <div className="text-muted small mb-1">BE Count</div>
                                        <div className="fw-bold text-success">{summaryData.be_count || 0}</div>
                                    </div>
                                    <div className="col-md-1">
                                        <div className="text-muted small mb-1">MATM BE Count</div>
                                        <div className="fw-bold text-success">{summaryData.matm_be_count || 0}</div>
                                    </div>
                                    <div className="col-md-1">
                                        <div className="text-muted small mb-1">MS Count</div>
                                        <div className="fw-bold text-success">{summaryData.ms_count || 0}</div>
                                    </div>
                                    <div className="col-md-1">
                                        <div className="text-muted small mb-1">FingPay</div>
                                        <div className="fw-bold text-warning">{formatCurrency(totals.totalFingpay)}</div>
                                    </div>
                                    <div className="col-md-1">
                                        <div className="text-muted small mb-1">Retailer</div>
                                        <div className="fw-bold text-info">{formatCurrency(totals.totalRetailer)}</div>
                                    </div>
                                    <div className="col-md-1">
                                        <div className="text-muted small mb-1">Distributor</div>
                                        <div className="fw-bold text-info">{formatCurrency(totals.totalDistributor)}</div>
                                    </div>
                                    <div className="col-md-1">
                                        <div className="text-muted small mb-1">Super</div>
                                        <div className="fw-bold text-info">{formatCurrency(totals.totalSuper)}</div>
                                    </div>
                                    <div className="col-md-1">
                                        <div className="text-muted small mb-1">API Users</div>
                                        <div className="fw-bold text-info">{formatCurrency(totals.totalApiUser)}</div>
                                    </div>
                                    <div className="col-md-2">
                                        <div className="text-muted small mb-1">Cashbez Profit</div>
                                        <div className="fw-bold text-success">{formatCurrency(totals.totalCashbez)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Data Table Card */}
                    <div className="card custom-card border-0 shadow-sm">
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="text-muted mt-2 mb-0">Loading transactions...</p>
                                </div>
                            ) : summaryData.transactions.data.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="fa fa-inbox fa-3x text-muted mb-3"></i>
                                    <p className="text-muted mb-0">No transactions found for selected criteria</p>
                                </div>
                            ) : (
                                <>
                                    <div className="table-responsive">
                                        <table className="table table-hover table-sm mb-0" style={{ fontSize: '0.875rem' }}>
                                            <thead className="table-light sticky-top">
                                                <tr>
                                                    <th className="px-3 py-2" style={{ width: '60px' }}>S. No</th>
                                                    <th className="px-3 py-2" style={{ width: '180px' }}>Txn Date & Time</th>
                                                    <th className="px-3 py-2 text-end" style={{ width: '120px' }}>Amount</th>
                                                    <th className="px-3 py-2 text-end" style={{ width: '120px' }}>FingPay Comm.</th>
                                                    <th className="px-3 py-2 text-end" style={{ width: '100px' }}>Retailer</th>
                                                    <th className="px-3 py-2 text-end" style={{ width: '100px' }}>Distributor</th>
                                                    <th className="px-3 py-2 text-end" style={{ width: '100px' }}>Super</th>
                                                    <th className="px-3 py-2 text-end" style={{ width: '100px' }}>API User</th>
                                                    <th className="px-3 py-2 text-end" style={{ width: '120px' }}>Cashbez Profit</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {summaryData.transactions.data.map((transaction, index) => {
                                                    const commissions = calculateCommissions(transaction);
                                                    const serialNumber = summaryData.transactions.from + index;

                                                    return (
                                                        <tr key={transaction.id}>
                                                            <td className="px-3 py-2 text-muted">{serialNumber}</td>
                                                            <td className="px-3 py-2">{formatDate(transaction.created_at)}</td>
                                                            <td className="px-3 py-2 text-end fw-semibold">{formatCurrency(transaction.amount)}</td>
                                                            <td className="px-3 py-2 text-end text-warning">{formatCurrency(commissions.fingpayNetComm)}</td>
                                                            <td className="px-3 py-2 text-end text-info">{formatCurrency(commissions.retailerComm)}</td>
                                                            <td className="px-3 py-2 text-end text-info">{formatCurrency(commissions.distributorComm)}</td>
                                                            <td className="px-3 py-2 text-end text-info">{formatCurrency(commissions.superComm)}</td>
                                                            <td className="px-3 py-2 text-end text-info">{formatCurrency(commissions.apiUserComm)}</td>
                                                            <td className="px-3 py-2 text-end fw-semibold text-success">{formatCurrency(commissions.cashbezProfit)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {summaryData.transactions.last_page > 1 && (
                                        <div className="d-flex justify-content-between align-items-center px-3 py-3 border-top">
                                            <div className="text-muted small">
                                                Showing {summaryData.transactions.from} to {summaryData.transactions.to} of {summaryData.transactions.total} transactions
                                            </div>
                                            <nav>
                                                <ul className="pagination pagination-sm mb-0">
                                                    <li className={`page-item ${filters.page === 1 ? 'disabled' : ''}`}>
                                                        <button
                                                            className="page-link"
                                                            onClick={() => handlePageChange(1)}
                                                            disabled={filters.page === 1}
                                                        >
                                                            <i className="fa fa-angle-double-left"></i>
                                                        </button>
                                                    </li>
                                                    <li className={`page-item ${filters.page === 1 ? 'disabled' : ''}`}>
                                                        <button
                                                            className="page-link"
                                                            onClick={() => handlePageChange(filters.page - 1)}
                                                            disabled={filters.page === 1}
                                                        >
                                                            <i className="fa fa-angle-left"></i>
                                                        </button>
                                                    </li>

                                                    {/* Page numbers */}
                                                    {[...Array(Math.min(5, summaryData.transactions.last_page))].map((_, i) => {
                                                        let pageNumber;
                                                        if (summaryData.transactions.last_page <= 5) {
                                                            pageNumber = i + 1;
                                                        } else if (filters.page <= 3) {
                                                            pageNumber = i + 1;
                                                        } else if (filters.page >= summaryData.transactions.last_page - 2) {
                                                            pageNumber = summaryData.transactions.last_page - 4 + i;
                                                        } else {
                                                            pageNumber = filters.page - 2 + i;
                                                        }

                                                        return (
                                                            <li key={pageNumber} className={`page-item ${filters.page === pageNumber ? 'active' : ''}`}>
                                                                <button
                                                                    className="page-link"
                                                                    onClick={() => handlePageChange(pageNumber)}
                                                                >
                                                                    {pageNumber}
                                                                </button>
                                                            </li>
                                                        );
                                                    })}

                                                    <li className={`page-item ${filters.page === summaryData.transactions.last_page ? 'disabled' : ''}`}>
                                                        <button
                                                            className="page-link"
                                                            onClick={() => handlePageChange(filters.page + 1)}
                                                            disabled={filters.page === summaryData.transactions.last_page}
                                                        >
                                                            <i className="fa fa-angle-right"></i>
                                                        </button>
                                                    </li>
                                                    <li className={`page-item ${filters.page === summaryData.transactions.last_page ? 'disabled' : ''}`}>
                                                        <button
                                                            className="page-link"
                                                            onClick={() => handlePageChange(summaryData.transactions.last_page)}
                                                            disabled={filters.page === summaryData.transactions.last_page}
                                                        >
                                                            <i className="fa fa-angle-double-right"></i>
                                                        </button>
                                                    </li>
                                                </ul>
                                            </nav>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Summary;
