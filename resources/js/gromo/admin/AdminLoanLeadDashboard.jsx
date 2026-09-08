import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import { AuthContext } from '../../core/hooks/context';
import Pageheader from '../../layouts/Pageheader';

const AdminLoanLeadDashboard = () => {
    const { userData: user } = useContext(AuthContext) || {};
    const [data, setData] = useState({
        stats: {
            status: {},
            loan_type: {},
            commission: {}
        },
        recent_leads: [],
        requires_attention: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const apiService = ApiService();
            const response = await apiService.vGet('/api/admin/loan-leads/dashboard');
            
            if (response.data.status === 1) {
                setData(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        const statusClasses = {
            'new': 'badge bg-primary',
            'contacted': 'badge bg-info',
            'document_pending': 'badge bg-warning',
            'under_review': 'badge bg-secondary',
            'processing': 'badge bg-info',
            'approved': 'badge bg-success',
            'disbursed': 'badge bg-success',
            'rejected': 'badge bg-danger',
            'cancelled': 'badge bg-dark'
        };
        return statusClasses[status] || 'badge bg-secondary';
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
                <Pageheader mainheading="Loan Leads" parentfolder="Loan" activepage="Dashboard" />
                <div className="container-fluid mt-4 mt-2">
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
                <Pageheader mainheading="Loan Leads" parentfolder="Loan" activepage="Dashboard" />
                <div className="container-fluid mt-4 mt-2">
                    <div className="alert alert-danger">{error}</div>
                </div>
            </>
        );
    }

    return (
        <>
           <Pageheader mainheading="Loan Leads" parentfolder="Loan" activepage="Dashboard" />
            <div className="container-fluid">
                {/* Quick Actions */}
                <div className="row mb-4 mt-2">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body py-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">
                                        <i className="ti ti-currency-rupee me-2 text-primary"></i>
                                        Quick Actions
                                    </h5>
                                    <div className="d-flex gap-2">
                                        <Link to="/loan-leads/list" className="btn btn-outline-primary btn-sm">
                                            <i className="ti ti-list me-1"></i> Manage Leads
                                        </Link>
                                        <Link to="/loan-leads/commission-report" className="btn btn-outline-success btn-sm">
                                            <i className="ti ti-report-money me-1"></i> Commission Report
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Statistics */}
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="avatar-lg rounded-circle bg-primary-subtle">
                                            <span className="avatar-title text-primary fs-2">
                                                <i className="ti ti-files"></i>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h3 className="mb-0">{data.stats.status.total || 0}</h3>
                                        <p className="text-muted mb-1">Total Applications</p>
                                        <small className="text-muted">
                                            Personal: {data.stats.loan_type.personal || 0} | 
                                            Business: {data.stats.loan_type.business || 0}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100">
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
                                        <h3 className="mb-0">{(data.stats.status.new || 0) + (data.stats.status.document_pending || 0)}</h3>
                                        <p className="text-muted mb-1">Needs Attention</p>
                                        <small className="text-muted">
                                            New: {data.stats.status.new || 0} | 
                                            Docs: {data.stats.status.document_pending || 0}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="avatar-lg rounded-circle bg-success-subtle">
                                            <span className="avatar-title text-success fs-2">
                                                <i className="ti ti-check-circle"></i>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h3 className="mb-0">{(data.stats.status.approved || 0) + (data.stats.status.disbursed || 0)}</h3>
                                        <p className="text-muted mb-1">Successful</p>
                                        <small className="text-muted">
                                            Approved: {data.stats.status.approved || 0} | 
                                            Disbursed: {data.stats.status.disbursed || 0}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="avatar-lg rounded-circle bg-info-subtle">
                                            <span className="avatar-title text-info fs-2">
                                                <i className="ti ti-progress"></i>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h3 className="mb-0">{(data.stats.status.contacted || 0) + (data.stats.status.under_review || 0) + (data.stats.status.processing || 0)}</h3>
                                        <p className="text-muted mb-1">In Progress</p>
                                        <small className="text-muted">
                                            Processing: {data.stats.status.processing || 0}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Commission Overview */}
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <h4 className="text-warning mb-0">{formatCurrency(data.stats.commission.total_pending)}</h4>
                                <small className="text-muted">Pending Commission</small>
                                <div className="mt-1">
                                    <span className="badge bg-warning">{data.stats.commission.pending_count || 0} Leads</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <h4 className="text-info mb-0">{formatCurrency(data.stats.commission.total_approved)}</h4>
                                <small className="text-muted">Approved Commission</small>
                                <div className="mt-1">
                                    <span className="badge bg-info">{data.stats.commission.approved_count || 0} Leads</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <h4 className="text-success mb-0">{formatCurrency(data.stats.commission.total_released)}</h4>
                                <small className="text-muted">Released Commission</small>
                                <div className="mt-1">
                                    <span className="badge bg-success">{data.stats.commission.released_count || 0} Leads</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <h4 className="text-primary mb-0">
                                    {formatCurrency(
                                        (data.stats.commission.total_pending || 0) + 
                                        (data.stats.commission.total_approved || 0) + 
                                        (data.stats.commission.total_released || 0)
                                    )}
                                </h4>
                                <small className="text-muted">Total Commission</small>
                                <div className="mt-1">
                                    <span className="badge bg-primary">
                                        {(data.stats.commission.pending_count || 0) + 
                                         (data.stats.commission.approved_count || 0) + 
                                         (data.stats.commission.released_count || 0)} Leads
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="row">
                    {/* Leads Requiring Attention */}
                    <div className="col-xl-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-transparent">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">
                                        <i className="ti ti-alert-circle me-2 text-warning"></i>
                                        Requires Attention ({data.requires_attention.length})
                                    </h5>
                                    <Link to="/loan-leads/list?status=new,document_pending" className="btn btn-sm btn-outline-warning">
                                        View All
                                    </Link>
                                </div>
                            </div>
                            <div className="card-body">
                                {data.requires_attention.length === 0 ? (
                                    <div className="text-center text-muted py-4">
                                        <i className="ti ti-check-circle fs-1 mb-3"></i>
                                        <p>All caught up! No leads require immediate attention.</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-sm table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Lead ID</th>
                                                    <th>Customer</th>
                                                    <th>Type</th>
                                                    <th>Status</th>
                                                    <th>Applied</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.requires_attention.map(lead => (
                                                    <tr key={lead.id}>
                                                        <td>
                                                            <span className="badge bg-light text-dark fw-bold">
                                                                {lead.lead_id}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <div className="fw-bold">{lead.full_name}</div>
                                                                <small className="text-muted">{lead.mobile}</small>
                                                            </div>
                                                        </td>
                                                        <td>{getLoanTypeBadge(lead.loan_type)}</td>
                                                        <td>
                                                            <span className={getStatusBadgeClass(lead.status)}>
                                                                {formatStatus(lead.status)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <small className="text-muted">
                                                                {new Date(lead.created_at).toLocaleDateString()}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <Link 
                                                                to={`/loan-leads/manage/${lead.id}`}
                                                                className="btn btn-sm btn-outline-primary"
                                                            >
                                                                Manage
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Leads */}
                    <div className="col-xl-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-transparent">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">
                                        <i className="ti ti-clock me-2 text-info"></i>
                                        Recent Applications ({data.recent_leads.length})
                                    </h5>
                                    <Link to="/loan-leads/list" className="btn btn-sm btn-outline-info">
                                        View All
                                    </Link>
                                </div>
                            </div>
                            <div className="card-body">
                                {data.recent_leads.length === 0 ? (
                                    <div className="text-center text-muted py-4">
                                        <i className="ti ti-file-off fs-1 mb-3"></i>
                                        <p>No recent applications found.</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-sm table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Lead ID</th>
                                                    <th>Customer</th>
                                                    <th>Type</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.recent_leads.map(lead => (
                                                    <tr key={lead.id}>
                                                        <td>
                                                            <span className="badge bg-light text-dark fw-bold">
                                                                {lead.lead_id}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <div className="fw-bold">{lead.full_name}</div>
                                                                <small className="text-muted">{lead.mobile}</small>
                                                            </div>
                                                        </td>
                                                        <td>{getLoanTypeBadge(lead.loan_type)}</td>
                                                        <td>
                                                            <span className="fw-bold text-success">
                                                                {formatCurrency(lead.loan_amount)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={getStatusBadgeClass(lead.status)}>
                                                                {formatStatus(lead.status)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <Link 
                                                                to={`/loan-leads/manage/${lead.id}`}
                                                                className="btn btn-sm btn-outline-primary"
                                                            >
                                                                Manage
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminLoanLeadDashboard;