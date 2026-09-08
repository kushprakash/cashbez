import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import ApiService from '../core/services/ApiService';
import axios from 'axios';
import { apiUrl } from '../core/config';
import { storeTokenAndUserData } from '../core/auth/tokenManager';

const CreditCardDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentLeads, setRecentLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activePeriod, setActivePeriod] = useState('today');

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [token, setToken] = useState(null);



    useEffect(() => {

         const urlToken = searchParams.get('token');

        if (urlToken) {
            setToken(urlToken);
            fetchUserProfile(urlToken);
        } 
       
        fetchDashboardData();

    }, [activePeriod, searchParams]);


    const fetchUserProfile = async (authToken) => {
        try {
            setLoading(true);
            setError(null);


            let config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: `${apiUrl}api/userdata`,
                    headers: {
                        'Content-Type': 'application/json',
                        'Token': authToken,
                }
            };

            const response = await axios.request(config);


            if (response.data.status === 1) {
                setUserData(response.data.user);
                localStorage.setItem('token', authToken);
                storeTokenAndUserData(authToken, response.data.user);
                fetchDashboardData();
            } else {
                setError(response.data.message || 'Failed to fetch user data');
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError('Failed to load user profile. Please check your token.');
        } finally {
            setLoading(false);
        }
    };


    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const apiService = ApiService();
            const response = await apiService.vGet('/api/credit-card-leads/dashboard', {
                period: activePeriod
            });
            
            if (response.data.status === 1) {
                setStats(response.data.data.stats);
                setRecentLeads(response.data.data.recent_leads);
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

    const handlePeriodChange = (period) => {
        setActivePeriod(period);
    };

    const getStatusBadgeClass = (status) => {
        const statusClasses = {
            'new': 'badge bg-primary',
            'contacted': 'badge bg-info',
            'document_pending': 'badge bg-warning',
            'under_review': 'badge bg-secondary',
            'in_review': 'badge bg-secondary',
            'process': 'badge bg-info',
            'processing': 'badge bg-info',
            'approved': 'badge bg-success',
            'success': 'badge bg-success',
            'rejected': 'badge bg-danger',
            'reject': 'badge bg-danger',
            'cancelled': 'badge bg-dark'
        };
        return statusClasses[status] || 'badge bg-secondary';
    };

    const formatStatus = (status) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Period Filter Component
    const PeriodFilter = ({ onPeriodChange, activePeriod }) => (
        <div className="btn-group btn-group-sm" role="group">
            {[
                { key: 'today', label: 'Today' },
                { key: 'month', label: 'This Month' },
                { key: 'year', label: 'This Year' }
            ].map(period => (
                <button
                    key={period.key}
                    type="button"
                    className={`btn ${activePeriod === period.key ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => onPeriodChange(period.key)}
                    style={{ fontSize: '11px', padding: '4px 12px' }}
                >
                    {period.label}
                </button>
            ))}
        </div>
    );

    if (loading) {
        return (
            <>
              
                <div className="container-fluid mt-2">
                    {/* Quick Actions Header */}
                    <div className="row ">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body py-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="card-title mb-0">Quick Actions</h5>
                                        <div className="d-flex gap-2">
                                            <Link to="/credit-card/create" className="btn btn-outline-primary btn-sm">
                                                <i className="ti ti-plus me-1"></i> Apply for Credit Card
                                            </Link>
                                            <Link to="/credit-card/list" className="btn btn-outline-primary btn-sm">
                                                <i className="ti ti-list me-1"></i> View All Applications
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
                <div className="container-fluid mt-2">
                    {/* Quick Actions Header */}
                    <div className="row ">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body py-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="card-title mb-0">Quick Actions</h5>
                                        <div className="d-flex gap-2">
                                            <Link to="/credit-card/create" className="btn btn-outline-primary btn-sm">
                                                <i className="ti ti-plus me-1"></i> Apply for Credit Card
                                            </Link>
                                            <Link to="/credit-card/list" className="btn btn-outline-primary btn-sm">
                                                <i className="ti ti-list me-1"></i> View All Applications
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="alert alert-danger">{error}</div>
                </div>
            </>
        );
    }

    return (
        <>
            
            <div className="container-fluid mt-2">
                {/* Quick Actions Header */}
                <div className="row ">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body py-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">Quick Actions</h5>
                                    <div className="d-flex gap-2">
                                        <Link to="/credit-card/create" className="btn btn-outline-primary btn-sm">
                                            <i className="ti ti-plus me-1"></i> Apply for Credit Card
                                        </Link>
                                        <Link to="/credit-card/list" className="btn btn-outline-primary btn-sm">
                                            <i className="ti ti-list me-1"></i> View All Applications
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="row ">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body py-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">Filter by Period</h6>
                                    <PeriodFilter onPeriodChange={handlePeriodChange} activePeriod={activePeriod} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="row  ">
                    <div className="col-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="avatar-sm rounded-circle bg-primary-subtle">
                                            <span className="avatar-title text-primary fs-3">
                                                <i className="ti ti-credit-card"></i>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h4 className="mb-0">{stats?.total || 0}</h4>
                                        <p className="text-muted mb-0">Applications</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="avatar-sm rounded-circle bg-warning-subtle">
                                            <span className="avatar-title text-warning fs-3">
                                                <i className="ti ti-clock"></i>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h4 className="mb-0">{stats?.in_review || stats?.under_review || 0}</h4>
                                        <p className="text-muted mb-0">In Review</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="avatar-sm rounded-circle bg-info-subtle">
                                            <span className="avatar-title text-info fs-3">
                                                <i className="ti ti-file-settings"></i>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h4 className="mb-0">{stats?.process || stats?.processing || 0}</h4>
                                        <p className="text-muted mb-0">Process</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="avatar-sm rounded-circle bg-danger-subtle">
                                            <span className="avatar-title text-danger fs-3">
                                                <i className="ti ti-x"></i>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h4 className="mb-0">{stats?.reject || stats?.rejected || 0}</h4>
                                        <p className="text-muted mb-0">Rejected</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="avatar-sm rounded-circle bg-success-subtle">
                                            <span className="avatar-title text-success fs-3">
                                                <i className="ti ti-check"></i>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h4 className="mb-0">{stats?.success || stats?.approved || 0}</h4>
                                        <p className="text-muted mb-0">Success</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="avatar-sm rounded-circle bg-primary-subtle">
                                            <span className="avatar-title text-primary fs-3">
                                                <i className="ti ti-check"></i>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h4 className="mb-0">₹{stats?.commission?.released?.toFixed(2) || '0.00'}</h4>
                                        <p className="text-muted mb-0">Income</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

              

                {/* Recent Applications */}
                <div className="row">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
                                <h5 className="card-title mb-0">Recent Applications</h5>
                                <Link to="list" className="btn btn-sm btn-outline-primary">
                                    View All
                                </Link>
                            </div>
                            <div className="card-body">
                                {recentLeads.length === 0 ? (
                                    <div className="text-center py-4">
                                        <i className="ti ti-file-off fs-1 text-muted mb-2"></i>
                                        <p className="text-muted">No applications found</p>
                                        <Link to="create" className="btn btn-primary btn-sm">
                                            Apply for Your First Credit Card
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
                                                        <th>Full Name</th>
                                                        <th>Mobile</th>
                                                        <th>Desired Card</th>
                                                        <th>Status</th>
                                                        <th>Applied Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {recentLeads.map(lead => (
                                                        <tr key={lead.id}>
                                                            <td>
                                                                <span className="badge bg-light text-dark">{lead.lead_id}</span>
                                                            </td>
                                                            <td>{lead.full_name}</td>
                                                            <td>{lead.mobile}</td>
                                                            <td>{lead.desired_card}</td>
                                                            <td>
                                                                <span className={getStatusBadgeClass(lead.status)}>
                                                                    {formatStatus(lead.status)}
                                                                </span>
                                                            </td>
                                                            <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile Card View */}
                                        <div className="d-lg-none">
                                            {recentLeads.map(lead => (
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
                                                                    <strong>Applied Date:</strong><br />
                                                                    <span className="text-muted">{new Date(lead.created_at).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                            <div className="col-6">
                                                                <div className="mb-2">
                                                                    <strong>Desired Card:</strong><br />
                                                                    <span className="text-muted">{lead.desired_card}</span>
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
                </div>
            </div>
        </>
    );
};

export default CreditCardDashboard;
