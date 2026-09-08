import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Pageheader from '../../layouts/Pageheader';
import ApiService from '../../core/services/ApiService';
import { AuthContext } from '../../core/hooks/context';

const AdminCreditCardList = () => {
    const { userData: user } = useContext(AuthContext) || {};
    const [leads, setLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [filters, setFilters] = useState({
        status: '',
        commission_status: '',
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
            const response = await apiService.vGet('/api/admin/credit-card-leads');
            
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

        if (filters.commission_status) {
            filtered = filtered.filter(lead => lead.commission_status === filters.commission_status);
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
            commission_status: '',
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
        return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">All Leads ({filteredLeads.length})</h5>
                            <Link to="/credit-card-leads/commission-report" className="btn btn-success btn-sm">
                                <i className="ti ti-report-money me-1"></i> Commission Report
                            </Link>
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
                                    name="commission_status"
                                    value={filters.commission_status}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Commission</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="released">Released</option>
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
                                    <i className="ti ti-refresh"></i>
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
                                <p className="text-muted">Try adjusting your filters</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>Lead ID</th>
                                            <th>Full Name</th>
                                            <th>Mobile</th>
                                            <th>Card Type</th>
                                            <th>Income</th>
                                            <th>Status</th>
                                            <th>Commission</th>
                                            <th>Created</th>
                                            <th>Action</th>
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
                                                <td>
                                                    <div>{lead.full_name}</div>
                                                    <small className="text-muted">{lead.email}</small>
                                                </td>
                                                <td>{lead.mobile}</td>
                                                <td><span className="badge bg-info">{lead.desired_card}</span></td>
                                                <td>₹{parseFloat(lead.monthly_income).toLocaleString()}</td>
                                                <td>
                                                    <span className={getStatusBadgeClass(lead.status)}>
                                                        {formatStatus(lead.status)}
                                                    </span>
                                                    {lead.status_message && (
                                                        <div className="small text-muted mt-1">{lead.status_message}</div>
                                                    )}
                                                </td>
                                                <td>
                                                    {lead.commission_amount ? (
                                                        <div>
                                                            <div className="fw-bold">₹{parseFloat(lead.commission_amount).toFixed(2)}</div>
                                                            <span className={`badge ${
                                                                lead.commission_status === 'released' ? 'bg-success' :
                                                                lead.commission_status === 'approved' ? 'bg-info' : 'bg-warning'
                                                            }`}>
                                                                {formatStatus(lead.commission_status)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">Not Set</span>
                                                    )}
                                                </td>
                                                <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <Link
                                                        to={`/credit-card-leads/manage/${lead.lead_id}`}
                                                        className="btn btn-sm btn-primary"
                                                    >
                                                        <i className="ti ti-edit me-1"></i> Manage
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
        </>
    );
};

export default AdminCreditCardList;
