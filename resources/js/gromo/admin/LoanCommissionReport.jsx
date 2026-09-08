import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import { AuthContext } from '../../core/hooks/context';
import Pageheader from '../../layouts/Pageheader';

const LoanCommissionReport = () => {
    const { userData: user } = useContext(AuthContext) || {};
    const [commissions, setCommissions] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [filters, setFilters] = useState({
        commission_status: '',
        loan_type: '',
        date_from: '',
        date_to: ''
    });

    useEffect(() => {
        fetchCommissionReport();
    }, [filters]);

    const fetchCommissionReport = async () => {
        try {
            setLoading(true);
            const apiService = ApiService();
            const response = await apiService.vGet('/api/admin/loan-leads/commission-report', filters);
            
            if (response.data.status === 1) {
                setCommissions(response.data.data.commissions);
                setSummary(response.data.data.summary);
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

    const resetFilters = () => {
        setFilters({
            commission_status: '',
            loan_type: '',
            date_from: '',
            date_to: ''
        });
    };

    const exportToCSV = () => {
        if (commissions.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = [
            'Lead ID',
            'Customer Name',
            'Mobile',
            'Loan Type',
            'Loan Amount',
            'Commission Amount',
            'Commission Status',
            'Application Date',
            'Released Date',
            'Released By'
        ];

        const csvData = commissions.map(commission => [
            commission.lead_id,
            commission.full_name,
            commission.mobile,
            commission.loan_type.charAt(0).toUpperCase() + commission.loan_type.slice(1),
            commission.loan_amount,
            commission.commission_amount,
            commission.commission_status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            new Date(commission.created_at).toLocaleDateString(),
            commission.commission_released_at ? new Date(commission.commission_released_at).toLocaleDateString() : '',
            commission.commission_released_by ? commission.commission_released_by.name : ''
        ]);

        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `loan_commission_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const getLoanTypeBadge = (loanType) => {
        return loanType === 'business' ? 
            <span className="badge bg-warning">Business</span> : 
            <span className="badge bg-info">Personal</span>;
    };

    if (loading) {
        return (
            <>
                
                <Pageheader mainheading="Commission Report" parentfolder="Loan" activepage="Commission" />
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
                <Pageheader mainheading="Commission Report" parentfolder="Loan" activepage="Commission" />
                <div className="container-fluid mt-2">
                    <div className="alert alert-danger">{error}</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Pageheader mainheading="Commission Report" parentfolder="Loan" activepage="Commission" />

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
                                        <h3 className="mb-0">{formatCurrency(summary?.pending?.amount || 0)}</h3>
                                        <p className="text-muted mb-1">Pending Commission</p>
                                        <small className="text-muted">{summary?.pending?.count || 0} Leads</small>
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
                                        <h3 className="mb-0">{formatCurrency(summary?.approved?.amount || 0)}</h3>
                                        <p className="text-muted mb-1">Approved Commission</p>
                                        <small className="text-muted">{summary?.approved?.count || 0} Leads</small>
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
                                                <i className="ti ti-currency-rupee"></i>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h3 className="mb-0">{formatCurrency(summary?.released?.amount || 0)}</h3>
                                        <p className="text-muted mb-1">Released Commission</p>
                                        <small className="text-muted">{summary?.released?.count || 0} Leads</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Commission Report */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Commission Details ({commissions.length})</h5>
                            <div className="d-flex gap-2">
                                <Link to="/loan-leads/dashboard" className="btn btn-outline-info btn-sm">
                                    <i className="ti ti-dashboard me-1"></i> Dashboard
                                </Link>
                                <Link to="/loan-leads/list" className="btn btn-outline-primary btn-sm">
                                    <i className="ti ti-list me-1"></i> All Leads
                                </Link>
                                <button onClick={exportToCSV} className="btn btn-success btn-sm">
                                    <i className="ti ti-download me-1"></i> Export CSV
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="card-body border-bottom">
                        <div className="row g-3">
                            <div className="col-md-3">
                                <select
                                    className="form-select"
                                    name="commission_status"
                                    value={filters.commission_status}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Commission Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="released">Released</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="col-md-3">
                                <select
                                    className="form-select"
                                    name="loan_type"
                                    value={filters.loan_type}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Loan Types</option>
                                    <option value="personal">Personal</option>
                                    <option value="business">Business</option>
                                </select>
                            </div>

                            <div className="col-md-2">
                                <input
                                    type="date"
                                    className="form-control"
                                    name="date_from"
                                    value={filters.date_from}
                                    onChange={handleFilterChange}
                                    placeholder="From Date"
                                />
                            </div>

                            <div className="col-md-2">
                                <input
                                    type="date"
                                    className="form-control"
                                    name="date_to"
                                    value={filters.date_to}
                                    onChange={handleFilterChange}
                                    placeholder="To Date"
                                />
                            </div>

                            <div className="col-md-2">
                                <button
                                    className="btn btn-outline-secondary w-100"
                                    onClick={resetFilters}
                                    title="Reset Filters"
                                >
                                    <i className="ti ti-refresh me-1"></i> Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Commission Table */}
                    <div className="card-body">
                        {commissions.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="ti ti-file-off fs-1 text-muted mb-3"></i>
                                <h5 className="text-muted">No commission data found</h5>
                                <p className="text-muted">Try adjusting your filters or check back later</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className="table-responsive d-none d-lg-block">
                                    <table className="table table-hover align-middle">
                                        <thead>
                                            <tr>
                                                <th>Lead ID</th>
                                                <th>Customer</th>
                                                <th>Loan Type</th>
                                                <th>Loan Amount</th>
                                                <th>Commission Amount</th>
                                                <th>Status</th>
                                                <th>Released At</th>
                                                <th>Released By</th>
                                                <th>Applied Date</th>
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
                                                    <td>{getLoanTypeBadge(commission.loan_type)}</td>
                                                    <td>
                                                        <span className="fw-bold text-primary">
                                                            {formatCurrency(commission.loan_amount)}
                                                        </span>
                                                    </td>
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
                                                            new Date(commission.commission_released_at).toLocaleDateString() :
                                                            <span className="text-muted">-</span>
                                                        }
                                                    </td>
                                                    <td>
                                                        {commission.commission_released_by ? 
                                                            commission.commission_released_by.name :
                                                            <span className="text-muted">-</span>
                                                        }
                                                    </td>
                                                    <td>
                                                        <div>{new Date(commission.created_at).toLocaleDateString()}</div>
                                                        <small className="text-muted">
                                                            {new Date(commission.created_at).toLocaleTimeString()}
                                                        </small>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="d-lg-none">
                                    {commissions.map(commission => (
                                        <div key={commission.id} className="card mb-3 border-start border-success border-3">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div className="d-flex gap-2">
                                                        <span className="badge bg-light text-dark fw-bold">
                                                            {commission.lead_id}
                                                        </span>
                                                        {getLoanTypeBadge(commission.loan_type)}
                                                    </div>
                                                    <div className="text-end">
                                                        <span className={getCommissionBadge(commission.commission_status)}>
                                                            {formatStatus(commission.commission_status)}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <h6 className="card-title mb-2">{commission.full_name}</h6>
                                                
                                                <div className="row text-sm">
                                                    <div className="col-6">
                                                        <div className="mb-2">
                                                            <strong>Mobile:</strong><br />
                                                            <span className="text-muted">{commission.mobile}</span>
                                                        </div>
                                                        <div className="mb-2">
                                                            <strong>Loan Amount:</strong><br />
                                                            <span className="fw-bold text-primary">{formatCurrency(commission.loan_amount)}</span>
                                                        </div>
                                                        <div className="mb-2">
                                                            <strong>Applied Date:</strong><br />
                                                            <span className="text-muted">{new Date(commission.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="mb-2">
                                                            <strong>Commission:</strong><br />
                                                            <span className="fw-bold text-success">{formatCurrency(commission.commission_amount)}</span>
                                                        </div>
                                                        <div className="mb-2">
                                                            <strong>Released At:</strong><br />
                                                            <span className="text-muted">
                                                                {commission.commission_released_at ? 
                                                                    new Date(commission.commission_released_at).toLocaleDateString() : 
                                                                    'Not Released'
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="mb-2">
                                                            <strong>Released By:</strong><br />
                                                            <span className="text-muted">
                                                                {commission.commission_released_by ? 
                                                                    commission.commission_released_by.name : 
                                                                    '-'
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Total Summary */}
                                <div className="mt-4 p-3 bg-light rounded">
                                    <div className="row text-center">
                                        <div className="col-6 col-md-3">
                                            <strong>Total Commissions:</strong><br />
                                            <span className="text-primary fs-5">{commissions.length}</span>
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <strong>Personal Loans:</strong><br />
                                            <span className="text-info fs-5">{commissions.filter(c => c.loan_type === 'personal').length}</span>
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <strong>Business Loans:</strong><br />
                                            <span className="text-warning fs-5">{commissions.filter(c => c.loan_type === 'business').length}</span>
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <strong>Total Amount:</strong><br />
                                            <span className="text-success fs-5">
                                                {formatCurrency(summary?.total?.amount || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoanCommissionReport;