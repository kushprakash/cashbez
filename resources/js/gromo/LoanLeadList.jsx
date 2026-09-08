import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../core/services/ApiService';
import { AuthContext } from '../core/hooks/context';

const LoanLeadList = () => {
    const { userData: user } = useContext(AuthContext) || {};
    const [leads, setLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [filters, setFilters] = useState({
        loan_type: '',
        status: '',
        loan_purpose: '',
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
            const response = await apiService.vGet('/api/loan-leads', filters);
            
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

        if (filters.loan_type) {
            filtered = filtered.filter(lead => lead.loan_type === filters.loan_type);
        }

        if (filters.status) {
            filtered = filtered.filter(lead => lead.status === filters.status);
        }

        if (filters.loan_purpose) {
            filtered = filtered.filter(lead => lead.loan_purpose === filters.loan_purpose);
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
            loan_type: '',
            status: '',
            loan_purpose: '',
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
                <div className="container-fluid">
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
                <div className="container-fluid mt-4">
                    <div className="alert alert-danger">{error}</div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="container-fluid mt-2">
                <div className="card border-0 shadow-sm">
                    <div className="row">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body py-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="card-title mb-0">
                                            <i className="ti ti-currency-rupee me-2 text-primary"></i>
                                            Quick Actions
                                        </h5>
                                        <div className="d-flex gap-2">
                                            <Link to="/loan-apply" className="btn btn-outline-primary btn-sm">
                                                <i className="ti ti-dashboard me-1"></i> Loan Dashboard
                                            </Link>
                                            <Link to="/loan-apply/create" className="btn btn-outline-primary btn-sm">
                                                <i className="ti ti-plus me-1"></i> Apply for Loan
                                            </Link>
                                        </div>
                                    </div>
                                </div>
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
                                    placeholder="Search applications..."
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                />
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
                                <input
                                    type="date"
                                    className="form-control"
                                    name="date_from"
                                    value={filters.date_from}
                                    onChange={handleFilterChange}
                                />
                            </div>

                            <div className="col-md-2">
                                <input
                                    type="date"
                                    className="form-control"
                                    name="date_to"
                                    value={filters.date_to}
                                    onChange={handleFilterChange}
                                />
                            </div>

                            <div className="col-md-1">
                                <button
                                    className="btn btn-outline-secondary w-100"
                                    onClick={resetFilters}
                                    title="Reset Filters"
                                >
                                    CLEAR FILTER
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
                                    <small className="text-muted">Total Applications</small>
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

                    {/* Loans Table */}
                    <div className="card-body">
                        {filteredLeads.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="ti ti-file-off fs-1 text-muted mb-3"></i>
                                <h5 className="text-muted">No loan applications found</h5>
                                <p className="text-muted">Try adjusting your filters or create a new application</p>
                                <Link to="/loan-apply/create" className="btn btn-primary">
                                    <i className="ti ti-plus me-1"></i> Apply for Loan
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className="table-responsive d-none d-lg-block">
                                    <table className="table table-hover align-middle">
                                        <thead>
                                            <tr>
                                                <th>Application ID</th>
                                                <th>Type</th>
                                                <th>Full Name</th>
                                                <th>Mobile</th>
                                                <th>Email</th>
                                                <th>Loan Amount</th>
                                                <th>Tenure</th>
                                                <th>Status</th>
                                                <th>Commission</th>
                                                <th>Applied Date</th>
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
                                                        </div>
                                                    </td>
                                                    <td>{lead.mobile}</td>
                                                    <td className="text-break">{lead.email}</td>
                                                    <td>{formatCurrency(lead.loan_amount)}</td>
                                                    <td>{lead.loan_tenure} months</td>
                                                    <td>
                                                        <span className={getStatusBadgeClass(lead.status)}>
                                                            {formatStatus(lead.status)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {lead.commission_amount ? (
                                                            <div>
                                                                <div className="fw-bold">{formatCurrency(lead.commission_amount)}</div>
                                                                {getCommissionBadge(lead.commission_status)}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted">-</span>
                                                        )}
                                                    </td>
                                                    <td>{new Date(lead.created_at).toLocaleDateString()}</td>
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
                                                            <strong>Mobile:</strong><br />
                                                            <span className="text-muted">{lead.mobile}</span>
                                                        </div>
                                                        <div className="mb-2">
                                                            <strong>Loan Amount:</strong><br />
                                                            <span className="text-muted">{formatCurrency(lead.loan_amount)}</span>
                                                        </div>
                                                        <div className="mb-2">
                                                            <strong>Applied Date:</strong><br />
                                                            <span className="text-muted">{new Date(lead.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="mb-2">
                                                            <strong>Email:</strong><br />
                                                            <span className="text-muted text-break">{lead.email}</span>
                                                        </div>
                                                        <div className="mb-2">
                                                            <strong>Tenure:</strong><br />
                                                            <span className="text-muted">{lead.loan_tenure} months</span>
                                                        </div>
                                                        <div className="mb-2">
                                                            <strong>Commission:</strong><br />
                                                            {lead.commission_amount ? (
                                                                <div>
                                                                    <div className="fw-bold">{formatCurrency(lead.commission_amount)}</div>
                                                                    {getCommissionBadge(lead.commission_status)}
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted">-</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Additional Details for Business Loans */}
                                                {lead.loan_type === 'business' && (
                                                    <div className="mt-3 pt-3 border-top">
                                                        <div className="row text-sm">
                                                            {lead.business_type && (
                                                                <div className="col-6">
                                                                    <strong>Business Type:</strong><br />
                                                                    <span className="text-muted">{formatStatus(lead.business_type)}</span>
                                                                </div>
                                                            )}
                                                            {lead.annual_turnover && (
                                                                <div className="col-6">
                                                                    <strong>Annual Turnover:</strong><br />
                                                                    <span className="text-muted">{formatCurrency(lead.annual_turnover)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Additional Details for Personal Loans */}
                                                {lead.loan_type === 'personal' && (
                                                    <div className="mt-3 pt-3 border-top">
                                                        <div className="row text-sm">
                                                            {lead.employment_type && (
                                                                <div className="col-6">
                                                                    <strong>Employment:</strong><br />
                                                                    <span className="text-muted">{formatStatus(lead.employment_type)}</span>
                                                                </div>
                                                            )}
                                                            {lead.monthly_income && (
                                                                <div className="col-6">
                                                                    <strong>Monthly Income:</strong><br />
                                                                    <span className="text-muted">{formatCurrency(lead.monthly_income)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Loan Purpose */}
                                                {lead.loan_purpose && (
                                                    <div className="mt-2">
                                                        <small className="text-muted">
                                                            <strong>Purpose:</strong> {formatStatus(lead.loan_purpose)}
                                                        </small>
                                                    </div>
                                                )}
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

export default LoanLeadList;