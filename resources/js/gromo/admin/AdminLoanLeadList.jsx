import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import { AuthContext } from '../../core/hooks/context';
import Pageheader from '../../layouts/Pageheader';

const AdminLoanLeadList = () => {
    const { userData: user } = useContext(AuthContext) || {};
    const [leads, setLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [filters, setFilters] = useState({
        status: '',
        loan_type: '',
        commission_status: '',
        assigned_to: '',
        search: '',
        date_from: '',
        date_to: ''
    });

    useEffect(() => {
        fetchLeads();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, leads]);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const apiService = ApiService();
            const response = await apiService.vGet('/api/admin/loan-leads', filters);
            
            if (response.data.status === 1) {
                setLeads(response.data.data.leads);
                setFilteredLeads(response.data.data.leads);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Failed to load leads');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...leads];

        if (filters.status) {
            filtered = filtered.filter(lead => lead.status === filters.status);
        }

        if (filters.loan_type) {
            filtered = filtered.filter(lead => lead.loan_type === filters.loan_type);
        }

        if (filters.commission_status) {
            filtered = filtered.filter(lead => lead.commission_status === filters.commission_status);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(lead => 
                lead.lead_id.toLowerCase().includes(searchLower) ||
                lead.full_name.toLowerCase().includes(searchLower) ||
                lead.mobile.includes(searchLower) ||
                lead.email.toLowerCase().includes(searchLower) ||
                (lead.business_name && lead.business_name.toLowerCase().includes(searchLower))
            );
        }

        if (filters.date_from) {
            filtered = filtered.filter(lead => 
                new Date(lead.created_at) >= new Date(filters.date_from)
            );
        }

        if (filters.date_to) {
            filtered = filtered.filter(lead => 
                new Date(lead.created_at) <= new Date(filters.date_to)
            );
        }

        setFilteredLeads(filtered);
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
            status: '',
            loan_type: '',
            commission_status: '',
            assigned_to: '',
            search: '',
            date_from: '',
            date_to: ''
        });
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

    const getLoanTypeBadge = (loanType) => {
        return loanType === 'business' ? 
            <span className="badge bg-warning">Business</span> : 
            <span className="badge bg-info">Personal</span>;
    };

    const getCommissionBadge = (commission) => {
        if (!commission) return <span className="badge bg-secondary">N/A</span>;
        
        const badges = {
            'pending': 'badge bg-warning',
            'approved': 'badge bg-info',
            'released': 'badge bg-success',
            'cancelled': 'badge bg-danger'
        };
        
        return <span className={badges[commission] || 'badge bg-secondary'}>{formatStatus(commission)}</span>;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <>
                <Pageheader mainheading="Loan Leads" parentfolder="Loan" activepage="Dashboard" />
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
                <Pageheader mainheading="Loan Leads" parentfolder="Loan" activepage="Dashboard" />
                <div className="container-fluid mt-2">
                    <div className="alert alert-danger">{error}</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Pageheader mainheading="Loan Leads" parentfolder="Loan" activepage="Dashboard" />
            <div className="container-fluid mt-2">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">All Leads ({filteredLeads.length})</h5>
                            <div className="d-flex gap-2">
                                <Link to="/loan-leads/dashboard" className="btn btn-outline-info btn-sm">
                                    <i className="ti ti-dashboard me-1"></i> Dashboard
                                </Link>
                                <Link to="/loan-leads/commission-report" className="btn btn-success btn-sm">
                                    <i className="ti ti-report-money me-1"></i> Commission Report
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="card-body border-bottom">
                        <div className="row g-3">
                            <div className="col-md-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    name="search"
                                    placeholder="Search leads..."
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                />
                            </div>

                            <div className="col-md-2">
                                <select
                                    className="form-select"
                                    name="status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Status</option>
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="document_pending">Document Pending</option>
                                    <option value="under_review">Under Review</option>
                                    <option value="processing">Processing</option>
                                    <option value="approved">Approved</option>
                                    <option value="disbursed">Disbursed</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="col-md-2">
                                <select
                                    className="form-select"
                                    name="loan_type"
                                    value={filters.loan_type}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Types</option>
                                    <option value="personal">Personal</option>
                                    <option value="business">Business</option>
                                </select>
                            </div>

                            <div className="col-md-2">
                                <select
                                    className="form-select"
                                    name="commission_status"
                                    value={filters.commission_status}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Commission</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="released">Released</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="col-md-2">
                                <input
                                    type="date"
                                    className="form-control"
                                    name="date_from"
                                    value={filters.date_from}
                                    onChange={handleFilterChange}
                                />
                            </div>

                            <div className="col-md-1">
                                <button
                                    className="btn btn-outline-secondary w-100"
                                    onClick={resetFilters}
                                    title="Reset Filters"
                                >
                                    CLEAR 
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="card-body border-bottom">
                        <div className="row g-3">
                            <div className="col-6 col-md-3">
                                <div className="text-center">
                                    <h4 className="text-primary mb-0">{filteredLeads.length}</h4>
                                    <small className="text-muted">Total Leads</small>
                                </div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="text-center">
                                    <h4 className="text-info mb-0">{filteredLeads.filter(l => l.loan_type === 'personal').length}</h4>
                                    <small className="text-muted">Personal Loans</small>
                                </div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="text-center">
                                    <h4 className="text-warning mb-0">{filteredLeads.filter(l => l.loan_type === 'business').length}</h4>
                                    <small className="text-muted">Business Loans</small>
                                </div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="text-center">
                                    <h4 className="text-success mb-0">
                                        {formatCurrency(filteredLeads.reduce((sum, lead) => sum + (parseFloat(lead.commission_amount) || 0), 0))}
                                    </h4>
                                    <small className="text-muted">Total Commission</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Leads Table */}
                    <div className="card-body">
                        {filteredLeads.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="ti ti-file-off fs-1 text-muted mb-3"></i>
                                <h5 className="text-muted">No leads found</h5>
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
                                                <th>Type</th>
                                                <th>Customer</th>
                                                <th>Contact</th>
                                                <th>Loan Amount</th>
                                                <th>Status</th>
                                                <th>Commission</th>
                                                <th>Applied Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredLeads.map(lead => (
                                                <tr key={lead.id}>
                                                    <td>
                                                        <span className="badge bg-light text-dark fw-bold">
                                                            {lead.lead_id}
                                                        </span>
                                                    </td>
                                                    <td>{getLoanTypeBadge(lead.loan_type)}</td>
                                                    <td>
                                                        <div>
                                                            <div className="fw-bold">{lead.full_name}</div>
                                                            {lead.loan_type === 'business' && lead.business_name && (
                                                                <small className="text-muted">{lead.business_name}</small>
                                                            )}
                                                            {lead.user && (
                                                                <small className="text-muted d-block">
                                                                    Applied by: {lead.user.name}
                                                                </small>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <div>{lead.mobile}</div>
                                                            <small className="text-muted text-break">{lead.email}</small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="fw-bold text-success">
                                                            {formatCurrency(lead.loan_amount)}
                                                        </span>
                                                        <div>
                                                            <small className="text-muted">{lead.loan_tenure} months</small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={getStatusBadgeClass(lead.status)}>
                                                            {formatStatus(lead.status)}
                                                        </span>
                                                        {lead.assigned_to && lead.assigned_to.name && (
                                                            <div>
                                                                <small className="text-muted">
                                                                    Assigned to: {lead.assigned_to.name}
                                                                </small>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {lead.commission_amount ? (
                                                            <div>
                                                                <div className="fw-bold">{formatCurrency(lead.commission_amount)}</div>
                                                                {getCommissionBadge(lead.commission_status)}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted">Not Set</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div>{new Date(lead.created_at).toLocaleDateString()}</div>
                                                        <small className="text-muted">
                                                            {new Date(lead.created_at).toLocaleTimeString()}
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <Link 
                                                            to={`/loan-leads/manage/${lead.id}`}
                                                            className="btn btn-sm btn-outline-primary"
                                                            title="Manage Lead"
                                                        >
                                                            Manage
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="d-lg-none">
                                    {filteredLeads.map(lead => (
                                        <div key={lead.id} className="card mb-3 border-start border-primary border-3">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div className="d-flex gap-2">
                                                        <span className="badge bg-light text-dark fw-bold">
                                                            {lead.lead_id}
                                                        </span>
                                                        {getLoanTypeBadge(lead.loan_type)}
                                                    </div>
                                                    <div className="text-end">
                                                        <span className={getStatusBadgeClass(lead.status)}>
                                                            {formatStatus(lead.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <h6 className="card-title mb-2">
                                                    {lead.full_name}
                                                    {lead.loan_type === 'business' && lead.business_name && (
                                                        <div className="text-muted small">{lead.business_name}</div>
                                                    )}
                                                </h6>
                                                
                                                <div className="row text-sm">
                                                    <div className="col-6">
                                                        <div className="mb-2">
                                                            <strong>Contact:</strong><br />
                                                            <span className="text-muted">{lead.mobile}</span><br />
                                                            <span className="text-muted text-break">{lead.email}</span>
                                                        </div>
                                                        <div className="mb-2">
                                                            <strong>Loan Amount:</strong><br />
                                                            <span className="fw-bold text-success">{formatCurrency(lead.loan_amount)}</span>
                                                            <div><small className="text-muted">{lead.loan_tenure} months</small></div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="mb-2">
                                                            <strong>Applied By:</strong><br />
                                                            <span className="text-muted">{lead.user?.name || 'N/A'}</span>
                                                        </div>
                                                        <div className="mb-2">
                                                            <strong>Commission:</strong><br />
                                                            {lead.commission_amount ? (
                                                                <div>
                                                                    <div className="fw-bold">{formatCurrency(lead.commission_amount)}</div>
                                                                    {getCommissionBadge(lead.commission_status)}
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted">Not Set</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {lead.assigned_to && (
                                                    <div className="mt-2 pt-2 border-top">
                                                        <small className="text-muted">
                                                            <strong>Assigned to:</strong> {lead.assigned_to.name}
                                                        </small>
                                                    </div>
                                                )}

                                                <div className="mt-3 d-flex justify-content-between align-items-center">
                                                    <small className="text-muted">
                                                        Applied: {new Date(lead.created_at).toLocaleDateString()}
                                                    </small>
                                                    <Link 
                                                        to={`/loan-leads/manage/${lead.id}`}
                                                        className="btn btn-sm btn-outline-primary"
                                                    >
                                                        Manage
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminLoanLeadList;