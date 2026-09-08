import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Pageheader from '../../layouts/Pageheader';
import ApiService from '../../core/services/ApiService';
import { AuthContext } from '../../core/hooks/context';

const AdminCreditCardDashboard = () => {
    const { userData: user } = useContext(AuthContext) || {};
    const [stats, setStats] = useState(null);
    const [recentLeads, setRecentLeads] = useState([]);
    const [requiresAttention, setRequiresAttention] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const apiService = ApiService();
            const response = await apiService.vGet('/api/admin/credit-card-leads/dashboard', {});
            
            if (response.data.status === 1) {
                setStats(response.data.data.stats);
                setRecentLeads(response.data.data.recent_leads);
                setRequiresAttention(response.data.data.requires_attention);
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
            'approved': 'badge bg-success',
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

    if (loading) {
        return (
            <>
                <Pageheader
                    currentpage="Admin Dashboard"
                    activepage="Gromo Admin"
                    mainpage="Dashboard"
                />
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
                <Pageheader
                    currentpage="Admin Dashboard"
                    activepage="Gromo Admin"
                    mainpage="Dashboard"
                />
                <div className="container-fluid">
                    <div className="alert alert-danger">{error}</div>
                </div>
            </>
        );
    }

    return (
        <>
          

            <Pageheader mainheading=" Credit Card" parentfolder=" Credit Card" activepage="Dashboard" />
            
            <div className="container-fluid mt-2">
                {/* Stats Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-xl-2 col-md-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <h3 className="text-primary mb-2">{stats?.total || 0}</h3>
                                <p className="text-muted mb-0 small">Total Leads</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-2 col-md-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <h3 className="text-info mb-2">{stats?.new || 0}</h3>
                                <p className="text-muted mb-0 small">New</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-2 col-md-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <h3 className="text-warning mb-2">{stats?.document_pending || 0}</h3>
                                <p className="text-muted mb-0 small">Doc Pending</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-2 col-md-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <h3 className="text-secondary mb-2">{stats?.under_review || 0}</h3>
                                <p className="text-muted mb-0 small">Under Review</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-2 col-md-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <h3 className="text-success mb-2">{stats?.approved || 0}</h3>
                                <p className="text-muted mb-0 small">Approved</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-2 col-md-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <h3 className="text-danger mb-2">{stats?.rejected || 0}</h3>
                                <p className="text-muted mb-0 small">Rejected</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Commission Stats */}
                {stats?.commission && (
                    <div className="row g-3 mb-4">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-transparent">
                                    <h5 className="card-title mb-0">Commission Overview</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="text-center p-3 border-end">
                                                <h3 className="text-warning mb-2">{formatCurrency(stats.commission.total_pending)}</h3>
                                                <p className="text-muted mb-1">Pending Commission</p>
                                                <span className="badge bg-warning">{stats.commission.pending_count || 0} Leads</span>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="text-center p-3 border-end">
                                                <h3 className="text-info mb-2">{formatCurrency(stats.commission.total_approved)}</h3>
                                                <p className="text-muted mb-1">Approved Commission</p>
                                                <span className="badge bg-info">{stats.commission.approved_count || 0} Leads</span>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="text-center p-3">
                                                <h3 className="text-success mb-2">{formatCurrency(stats.commission.total_released)}</h3>
                                                <p className="text-muted mb-1">Released Commission</p>
                                                <span className="badge bg-success">{stats.commission.released_count || 0} Leads</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="row g-3 mb-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title mb-3">Quick Actions</h5>
                                <div className="d-flex gap-2 flex-wrap">
                                    <Link to="/credit-card-leads/list" className="btn btn-primary">
                                        <i className="ti ti-list me-1"></i> View All Leads
                                    </Link>
                                    <Link to="/credit-card-leads/commission-report" className="btn btn-outline-success">
                                        <i className="ti ti-report-money me-1"></i> Commission Report
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-3">
                    {/* Requires Attention */}
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-transparent">
                                <h5 className="card-title mb-0 text-danger">
                                    <i className="ti ti-alert-circle me-2"></i>Requires Attention
                                </h5>
                            </div>
                            <div className="card-body">
                                {requiresAttention.length === 0 ? (
                                    <div className="text-center py-4">
                                        <i className="ti ti-check-circle fs-1 text-success mb-2"></i>
                                        <p className="text-muted">All caught up!</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover table-sm align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Lead ID</th>
                                                    <th>Name</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {requiresAttention.map(lead => (
                                                    <tr key={lead.id}>
                                                        <td><span className="badge bg-light text-dark">{lead.lead_id}</span></td>
                                                        <td>{lead.full_name}</td>
                                                        <td><span className={getStatusBadgeClass(lead.status)}>{formatStatus(lead.status)}</span></td>
                                                        <td>
                                                            <Link 
                                                                to={`/credit-card-leads/manage/${lead.lead_id}`}
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
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
                                <h5 className="card-title mb-0">Recent Leads</h5>
                                <Link to="/credit-card/list" className="btn btn-sm btn-outline-primary">
                                    View All
                                </Link>
                            </div>
                            <div className="card-body">
                                {recentLeads.length === 0 ? (
                                    <div className="text-center py-4">
                                        <i className="ti ti-file-off fs-1 text-muted mb-2"></i>
                                        <p className="text-muted">No leads found</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover table-sm align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Lead ID</th>
                                                    <th>Name</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentLeads.map(lead => (
                                                    <tr key={lead.id}>
                                                        <td><span className="badge bg-light text-dark">{lead.lead_id}</span></td>
                                                        <td>{lead.full_name}</td>
                                                        <td><span className={getStatusBadgeClass(lead.status)}>{formatStatus(lead.status)}</span></td>
                                                        <td>
                                                            <Link 
                                                                to={`/credit-card-leads/manage/${lead.lead_id}`}
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

export default AdminCreditCardDashboard;
