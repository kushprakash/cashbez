import React, { useState, useEffect, useContext } from 'react';
import Pageheader from '../../layouts/Pageheader';
import ApiService from '../../core/services/ApiService';
import { AuthContext } from '../../core/hooks/context';

const CommissionReport = () => {
    const { userData: user } = useContext(AuthContext) || {};
    const [summary, setSummary] = useState(null);
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [filters, setFilters] = useState({
        date_from: '',
        date_to: ''
    });

    useEffect(() => {
        fetchCommissionReport();
    }, []);

    const fetchCommissionReport = async () => {
        try {
            setLoading(true);
            const apiService = ApiService();
            
            // Build query parameters
            const queryParams = new URLSearchParams();
            if (filters.date_from) queryParams.append('date_from', filters.date_from);
            if (filters.date_to) queryParams.append('date_to', filters.date_to);
            
            const endpoint = `/api/admin/credit-card-leads/commission-report${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await apiService.vGet(endpoint);
            
            if (response.data.status === 1) {
                setSummary(response.data.data.summary);
                setCommissions(response.data.data.commissions);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Failed to load commission report');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleApplyFilter = () => {
        fetchCommissionReport();
    };

    const resetFilters = () => {
        setFilters({
            date_from: '',
            date_to: ''
        });
    };

    const getCommissionBadge = (status) => {
        const badges = {
            'pending': 'badge bg-warning',
            'approved': 'badge bg-info',
            'released': 'badge bg-success',
            'cancelled': 'badge bg-danger'
        };
        return badges[status] || 'badge bg-secondary';
    };

    const formatStatus = (status) => {
        return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const exportToCSV = () => {
        const headers = ['Lead ID', 'Full Name', 'Mobile', 'Commission Amount', 'Status', 'Released At', 'Released By'];
        const rows = commissions.map(c => [
            c.lead_id,
            c.full_name,
            c.mobile,
            c.commission_amount,
            c.commission_status,
            c.commission_released_at ? new Date(c.commission_released_at).toLocaleString() : 'N/A',
            c.commission_released_by?.name || 'N/A'
        ]);

        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += headers.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.join(',') + '\n';
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `commission_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <>
                <Pageheader mainheading=" Credit Card" parentfolder=" Credit Card" activepage="Dashboard" />
                <div className="container-fluid mt-2">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Pageheader mainheading=" Credit Card" parentfolder=" Credit Card" activepage="Dashboard" />
                <div className="container-fluid mt-2">
                    <div className="alert alert-danger">{error}</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Pageheader mainheading=" Credit Card" parentfolder=" Credit Card" activepage="Dashboard" />

            <div className="container-fluid mt-2">
                {/* Summary Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="avatar-lg rounded-circle bg-warning-subtle">
                                            <span className="avatar-title text-warning fs-2">
                                                <i className="ti ti-clock"></i>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h3 className="mb-0">{formatCurrency(summary?.pending?.amount)}</h3>
                                        <p className="text-muted mb-1">Pending Commission</p>
                                        <span className="badge bg-warning">{summary?.pending?.count || 0} Leads</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="avatar-lg rounded-circle bg-info-subtle">
                                            <span className="avatar-title text-info fs-2">
                                                <i className="ti ti-check"></i>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h3 className="mb-0">{formatCurrency(summary?.approved?.amount)}</h3>
                                        <p className="text-muted mb-1">Approved Commission</p>
                                        <span className="badge bg-info">{summary?.approved?.count || 0} Leads</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="avatar-lg rounded-circle bg-success-subtle">
                                            <span className="avatar-title text-success fs-2">
                                                <i className="ti ti-wallet"></i>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h3 className="mb-0">{formatCurrency(summary?.released?.amount)}</h3>
                                        <p className="text-muted mb-1">Released Commission</p>
                                        <span className="badge bg-success">{summary?.released?.count || 0} Leads</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Export */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Commission Details</h5>
                            <button 
                                className="btn btn-success btn-sm"
                                onClick={exportToCSV}
                                disabled={commissions.length === 0}
                            >
                                <i className="ti ti-download me-1"></i> Export CSV
                            </button>
                        </div>
                    </div>

                    <div className="card-body border-bottom">
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label">Date From</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="date_from"
                                    value={filters.date_from}
                                    onChange={handleFilterChange}
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">Date To</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="date_to"
                                    value={filters.date_to}
                                    onChange={handleFilterChange}
                                />
                            </div>

                            <div className="col-md-3 d-flex align-items-end">
                                <button
                                    className="btn btn-primary me-2"
                                    onClick={handleApplyFilter}
                                >
                                    Apply Filter
                                </button>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={resetFilters}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Commission Table */}
                    <div className="card-body">
                        {commissions.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="ti ti-report-off fs-1 text-muted mb-3"></i>
                                <h5 className="text-muted">No commission data found</h5>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>Lead ID</th>
                                            <th>User Details</th>
                                            <th>Desired Card</th>
                                            <th>Commission Amount</th>
                                            <th>Status</th>
                                            <th>Released At</th>
                                            <th>Released By</th>
                                            <th>Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {commissions.map(commission => (
                                            <tr key={commission.id}>
                                                <td>
                                                    <span className="badge bg-light text-dark fw-bold">
                                                        {commission.lead_id}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div><strong>{commission.full_name}</strong></div>
                                                    <small className="text-muted">{commission.mobile}</small>
                                                </td>
                                                <td><span className="badge bg-info">{commission.desired_card}</span></td>
                                                <td>
                                                    <strong className="text-success">
                                                        {formatCurrency(commission.commission_amount)}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <span className={getCommissionBadge(commission.commission_status)}>
                                                        {formatStatus(commission.commission_status)}
                                                    </span>
                                                </td>
                                                <td>
                                                    {commission.commission_released_at ? 
                                                        new Date(commission.commission_released_at).toLocaleString() : 
                                                        <span className="text-muted">Not Released</span>
                                                    }
                                                </td>
                                                <td>
                                                    {commission.commission_released_by?.name || 
                                                        <span className="text-muted">-</span>
                                                    }
                                                </td>
                                                <td>{new Date(commission.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="table-light">
                                        <tr>
                                            <th colSpan="3" className="text-end">Total:</th>
                                            <th>
                                                {formatCurrency(commissions.reduce((sum, c) => sum + parseFloat(c.commission_amount || 0), 0))}
                                            </th>
                                            <th colSpan="4"></th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CommissionReport;
