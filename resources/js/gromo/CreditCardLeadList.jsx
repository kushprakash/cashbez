import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Pageheader from '../layouts/Pageheader';
import ApiService from '../core/services/ApiService';
import { AuthContext } from '../core/hooks/context';

const CreditCardLeadList = () => {
    const { userData: user } = useContext(AuthContext) || {};
    const [leads, setLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [filters, setFilters] = useState({
        status: '',
        desired_card: '',
        lead_source: '',
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
            const response = await apiService.vGet('/api/credit-card-leads', filters);
            
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

        if (filters.desired_card) {
            filtered = filtered.filter(lead => lead.desired_card === filters.desired_card);
        }

        if (filters.lead_source) {
            filtered = filtered.filter(lead => lead.lead_source === filters.lead_source);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(lead => 
                lead.lead_id.toLowerCase().includes(searchLower) ||
                lead.full_name.toLowerCase().includes(searchLower) ||
                lead.mobile.includes(searchLower) ||
                lead.email.toLowerCase().includes(searchLower)
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
            desired_card: '',
            lead_source: '',
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
            'approved': 'badge bg-success',
            'rejected': 'badge bg-danger',
            'cancelled': 'badge bg-dark'
        };
        return statusClasses[status] || 'badge bg-secondary';
    };

    const formatStatus = (status) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
                     <div className="row ">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body py-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="card-title mb-0">Quick Actions</h5>
                                        <div className="d-flex gap-2">
                                            <Link to="/credit-card" className="btn btn-outline-primary btn-sm">
                                                <i className="ti ti-plus me-1"></i> Credit Card Dashboard
                                            </Link>
                                          
                                            <Link to="/credit-card/create" className="btn btn-outline-primary btn-sm">
                                                <i className="ti ti-plus me-1"></i> Apply for Credit Card
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
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            <div className="col-md-2">
                                <select
                                    className="form-select"
                                    name="desired_card"
                                    value={filters.desired_card}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Cards</option>
                                    <option value="Cashback">Cashback</option>
                                    <option value="Rewards">Rewards</option>
                                    <option value="Travel">Travel</option>
                                    <option value="Fuel">Fuel</option>
                                    <option value="Shopping">Shopping</option>
                                    <option value="Premium">Premium</option>
                                    <option value="Basic">Basic</option>
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
                                    RESET FILTER
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Leads Table */}
                    <div className="card-body">
                        {filteredLeads.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="ti ti-file-off fs-1 text-muted mb-3"></i>
                                <h5 className="text-muted">No leads found</h5>
                                <p className="text-muted">Try adjusting your filters or create a new lead</p>
                                <Link to="/gromo/credit-card/create" className="btn btn-primary">
                                    <i className="ti ti-plus me-1"></i> Create New Lead
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className="table-responsive d-none d-lg-block">
                                    <table className="table table-hover align-middle">
                                        <thead>
                                            <tr>
                                                <th>Lead ID</th>
                                                <th>Full Name</th>
                                                <th>Mobile</th>
                                                <th>Email</th>
                                                <th>Desired Card</th>
                                                <th>Monthly Income</th>
                                                <th>Status</th>
                                                <th>Commission</th>
                                                <th>Created</th>
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
                                                    <td>{lead.full_name}</td>
                                                    <td>{lead.mobile}</td>
                                                    <td>{lead.email}</td>
                                                    <td>{lead.desired_card}</td>
                                                    <td>₹{parseFloat(lead.monthly_income).toLocaleString()}</td>
                                                    <td>
                                                        <span className={getStatusBadgeClass(lead.status)}>
                                                            {formatStatus(lead.status)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {lead.commission_amount ? (
                                                            <div>
                                                                <div className="fw-bold">₹{parseFloat(lead.commission_amount).toFixed(2)}</div>
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
                                                    <div>
                                                        <span className="badge bg-light text-dark fw-bold">
                                                            {lead.lead_id}
                                                        </span>
                                                    </div>
                                                    <div className="text-end">
                                                        <span className={getStatusBadgeClass(lead.status)}>
                                                            {formatStatus(lead.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <h6 className="card-title mb-2">{lead.full_name}</h6>
                                                
                                                <div className="row text-sm">
                                                    <div className="col-6">
                                                        <div className="mb-2">
                                                            <strong>Mobile:</strong><br />
                                                            <span className="text-muted">{lead.mobile}</span>
                                                        </div>
                                                        <div className="mb-2">
                                                            <strong>Desired Card:</strong><br />
                                                            <span className="text-muted">{lead.desired_card}</span>
                                                        </div>
                                                        <div className="mb-2">
                                                            <strong>Created:</strong><br />
                                                            <span className="text-muted">{new Date(lead.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="mb-2">
                                                            <strong>Email:</strong><br />
                                                            <span className="text-muted text-break">{lead.email}</span>
                                                        </div>
                                                        <div className="mb-2">
                                                            <strong>Monthly Income:</strong><br />
                                                            <span className="text-muted">₹{parseFloat(lead.monthly_income).toLocaleString()}</span>
                                                        </div>
                                                        <div className="mb-2">
                                                            <strong>Commission:</strong><br />
                                                            {lead.commission_amount ? (
                                                                <div>
                                                                    <div className="fw-bold">₹{parseFloat(lead.commission_amount).toFixed(2)}</div>
                                                                    {getCommissionBadge(lead.commission_status)}
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted">-</span>
                                                            )}
                                                        </div>
                                                    </div>
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

export default CreditCardLeadList;
