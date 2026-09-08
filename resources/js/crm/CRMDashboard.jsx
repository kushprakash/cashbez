import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../core/services/ApiService';
import Pageheader from '../layouts/Pageheader';

const CRMDashboard = () => {
    const [stats, setStats] = useState({
        totalLeads: 0,
        newLeads: 0,
        qualifiedLeads: 0,
        activeLeads: 0,
        lostLeads: 0,
        pendingFollowups: 0,
        todayFollowups: 0,
        highPriorityLeads: 0,
        statusBreakdown: []
    });
    const [recentLeads, setRecentLeads] = useState([]);
    const [upcomingFollowups, setUpcomingFollowups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [leadStatuses, setLeadStatuses] = useState([]);
    const [followupStatuses, setFollowupStatuses] = useState([]);
    const apiService = ApiService();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch basic data and lookup tables
            const [leadsRes, followupsRes, leadStatusRes, followupStatusRes] = await Promise.all([
                apiService.vGet('/api/crm/leads'),
                apiService.vGet('/api/crm/followups'),
                apiService.vGet('/api/crm/lead-status'),
                apiService.vGet('/api/crm/followup-statuses')
            ]);

            const leads = Array.isArray(leadsRes.data) ? leadsRes.data : [];
            const followups = Array.isArray(followupsRes.data) ? followupsRes.data : [];
            const leadStatusList = Array.isArray(leadStatusRes.data) ? leadStatusRes.data : [];
            const followupStatusList = Array.isArray(followupStatusRes.data) ? followupStatusRes.data : [];

            // Store lookup tables for reference
            setLeadStatuses(leadStatusList);
            setFollowupStatuses(followupStatusList);

            // Debug logging
            console.log('Lead Statuses loaded:', leadStatusList);
            console.log('Followup Statuses loaded:', followupStatusList);

            // Create status name maps for easier lookup
            const statusNameMap = {};
            leadStatusList.forEach(status => {
                statusNameMap[status.id] = status.name?.toLowerCase();
            });

            // Calculate stats with dynamic status checking
            const today = new Date().toISOString().split('T')[0];
            
            // Find statuses dynamically (case-insensitive partial matching)
            const newStatus = leadStatusList.find(status => 
                status.name?.toLowerCase().includes('new')
            );
            
            const qualifiedStatus = leadStatusList.find(status => 
                status.name?.toLowerCase().includes('qualified') || 
                status.name?.toLowerCase().includes('qualify')
            );

            const activeStatus = leadStatusList.find(status => 
                status.name?.toLowerCase().includes('active') || 
                status.name?.toLowerCase().includes('progress')
            );

            const lostStatus = leadStatusList.find(status => 
                status.name?.toLowerCase().includes('lost') || 
                status.name?.toLowerCase().includes('dead') ||
                status.name?.toLowerCase().includes('closed')
            );

            // Debug: Log found statuses
            console.log('Dynamic Status Matching:', {
                newStatus: newStatus?.name,
                qualifiedStatus: qualifiedStatus?.name,
                activeStatus: activeStatus?.name,
                lostStatus: lostStatus?.name
            });

            const stats = {
                totalLeads: leads?.length || 0,
                newLeads: newStatus ? leads?.filter(lead => lead?.status_id === newStatus.id)?.length || 0 : 0,
                qualifiedLeads: qualifiedStatus ? leads?.filter(lead => lead?.status_id === qualifiedStatus.id)?.length || 0 : 0,
                activeLeads: activeStatus ? leads?.filter(lead => lead?.status_id === activeStatus.id)?.length || 0 : 0,
                lostLeads: lostStatus ? leads?.filter(lead => lead?.status_id === lostStatus.id)?.length || 0 : 0,
                pendingFollowups: followups?.filter(f => f && !f.is_completed)?.length || 0,
                todayFollowups: followups?.filter(f => f && f.followup_date === today)?.length || 0,
                highPriorityLeads: leads?.filter(lead => lead?.priority === 'high')?.length || 0,
                // Add breakdown by all statuses
                statusBreakdown: leadStatusList.map(status => ({
                    status: status,
                    count: leads?.filter(lead => lead?.status_id === status.id)?.length || 0
                })).filter(item => item.count > 0) // Only show statuses with leads
            };

            setStats(stats);
            setRecentLeads(leads?.slice(0, 5) || []); // Show last 5 leads
            setUpcomingFollowups(followups?.filter(f => f && !f.is_completed)?.slice(0, 5) || []);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Error loading dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const getTimeBasedGreeting = (name) => {
        name = capitalizeText(name.split(" ")[0]);
        const hours = new Date().getHours();
        if (hours < 12) return `🌞 Good Morning! ${name}, Have a bright and beautiful day!`;
        if (hours < 18) return `☀️ Good Afternoon!  ${name}, Keep shining and stay positive!`;
        return `🌙 Good Evening! ${name}, Relax and unwind, you deserve it!`;
    };


    function capitalizeText(text) {
        return text
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    const getFollowupStatusColor = (statusName) => {
        if (!statusName) return 'secondary';
        const name = statusName.toLowerCase();
        
        if (name.includes('connected') || name.includes('success')) return 'success';
        if (name.includes('positive') || name.includes('interested')) return 'info';
        if (name.includes('not reachable') || name.includes('busy')) return 'warning';
        if (name.includes('not interested') || name.includes('dead')) return 'danger';
        if (name.includes('pending') || name.includes('follow')) return 'primary';
        
        return 'secondary';
    };

    if (loading) {
        return (
            <>
                <Pageheader mainheading="Welcome To Dashboard" parentfolder="CRM" activepage="CRM Dashboard" />
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Pageheader mainheading="Welcome to Dashboard" parentfolder="CRM" activepage="Dashboard" />

            <div className="page-content-box">
                <div className="container-fluid">
                    <div className="stats-card mb-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">{getTimeBasedGreeting('Prakash')}</h5>
                            <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={fetchDashboardData}
                                disabled={loading}
                                title="Refresh Dashboard Data"
                            >
                                <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`} />
                                {loading ? ' Refreshing...' : ' Refresh'}
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="row">
                        <div className="col-lg-2 col-md-4 col-sm-6">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="me-3">
                                            <i className="fa fa-users text-primary fa-2x"></i>
                                        </div>
                                        <div>
                                            <h5 className="mb-1">{stats?.totalLeads || 0}</h5>
                                            <p className="mb-0 text-muted">Total Leads</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-2 col-md-4 col-sm-6">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="me-3">
                                            <i className="fa fa-star text-success fa-2x"></i>
                                        </div>
                                        <div>
                                            <h5 className="mb-1">{stats?.newLeads || 0}</h5>
                                            <p className="mb-0 text-muted">
                                                {(() => {
                                                    const newStatus = leadStatuses.find(status => 
                                                        status.name?.toLowerCase().includes('new')
                                                    );
                                                    return newStatus ? `${newStatus.name} Leads` : 'New Leads';
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-2 col-md-4 col-sm-6">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="me-3">
                                            <i className="fa fa-check text-info fa-2x"></i>
                                        </div>
                                        <div>
                                            <h5 className="mb-1">{stats?.qualifiedLeads || 0}</h5>
                                            <p className="mb-0 text-muted">
                                                {(() => {
                                                    const qualifiedStatus = leadStatuses.find(status => 
                                                        status.name?.toLowerCase().includes('qualified') || 
                                                        status.name?.toLowerCase().includes('qualify')
                                                    );
                                                    return qualifiedStatus ? `${qualifiedStatus.name} Leads` : 'Qualified Leads';
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-2 col-md-4 col-sm-6">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="me-3">
                                            <i className="fa fa-chart-line text-success fa-2x"></i>
                                        </div>
                                        <div>
                                            <h5 className="mb-1">{stats?.activeLeads || 0}</h5>
                                            <p className="mb-0 text-muted">
                                                {(() => {
                                                    const activeStatus = leadStatuses.find(status => 
                                                        status.name?.toLowerCase().includes('active') || 
                                                        status.name?.toLowerCase().includes('progress')
                                                    );
                                                    return activeStatus ? `${activeStatus.name} Leads` : 'Active Leads';
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-2 col-md-4 col-sm-6">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="me-3">
                                            <i className="fa fa-clock text-warning fa-2x"></i>
                                        </div>
                                        <div>
                                            <h5 className="mb-1">{stats?.pendingFollowups || 0}</h5>
                                            <p className="mb-0 text-muted">Pending</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-2 col-md-4 col-sm-6">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="me-3">
                                            <i className="fa fa-calendar text-primary fa-2x"></i>
                                        </div>
                                        <div>
                                            <h5 className="mb-1">{stats?.todayFollowups || 0}</h5>
                                            <p className="mb-0 text-muted">Today</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-2 col-md-4 col-sm-6">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="me-3">
                                            <i className="fa fa-exclamation text-danger fa-2x"></i>
                                        </div>
                                        <div>
                                            <h5 className="mb-1">{stats?.highPriorityLeads || 0}</h5>
                                            <p className="mb-0 text-muted">High Priority</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">Quick Actions</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-lg-3 col-md-6 mb-2">
                                            <Link to="/crm/leads/add" className="btn btn-primary btn-block">
                                                <i className="fa fa-plus me-2"></i>Add New Lead
                                            </Link>
                                        </div>
                                        <div className="col-lg-3 col-md-6 mb-2">
                                            <Link to="/crm/followups/add" className="btn btn-success btn-block">
                                                <i className="fa fa-calendar-plus me-2"></i>Schedule Follow-up
                                            </Link>
                                        </div>
                                        <div className="col-lg-3 col-md-6 mb-2">
                                            <Link to="/crm/activities/add" className="btn btn-info btn-block">
                                                <i className="fa fa-edit me-2"></i>Log Activity
                                            </Link>
                                        </div>
                                        <div className="col-lg-3 col-md-6 mb-2">
                                            <Link to="/crm/leads/list" className="btn btn-secondary btn-block">
                                                <i className="fa fa-list me-2"></i>View All Leads
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">Recent Leads</h5>
                                </div>
                                <div className="card-body">
                                    {recentLeads.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Status</th>
                                                        <th>Priority</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {recentLeads.map((lead, index) => (
                                                        <tr key={lead?.id || `lead-${index}`}>
                                                            <td>
                                                                {(() => {
                                                                    const name = lead?.name;
                                                                    if (!name) return 'N/A';
                                                                    return String(name);
                                                                })()}
                                                            </td>
                                                            <td>
                                                                <span className={`badge badge-${(() => {
                                                                    const leadStatus = leadStatuses.find(status => status.id === lead?.status_id);
                                                                    if (!leadStatus) return 'secondary';
                                                                    
                                                                    const statusName = leadStatus.name?.toLowerCase();
                                                                    if (statusName?.includes('new')) return 'primary';
                                                                    if (statusName?.includes('qualified')) return 'success';
                                                                    if (statusName?.includes('lost') || statusName?.includes('dead')) return 'danger';
                                                                    if (statusName?.includes('active') || statusName?.includes('progress')) return 'info';
                                                                    return 'warning';
                                                                })()}`}>
                                                                    {(() => {
                                                                        const leadStatus = leadStatuses.find(status => status.id === lead?.status_id);
                                                                        return leadStatus?.name || 'Unknown';
                                                                    })()}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`badge badge-${lead?.priority === 'High' ? 'danger' :
                                                                    lead?.priority === 'Medium' ? 'warning' : 'secondary'
                                                                    }`}>
                                                                    {(() => {
                                                                        const priority = lead?.priority;
                                                                        if (!priority) return 'Normal';
                                                                        return String(priority);
                                                                    })()}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <Link to={`/crm/leads/edit/${lead?.id || ''}`} className="btn btn-sm btn-outline-primary">
                                                                    View
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-muted">No recent leads</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">Upcoming Follow-ups</h5>
                                </div>
                                <div className="card-body">
                                    {upcomingFollowups.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Lead</th>
                                                        <th>Date</th>
                                                        <th>Type</th>
                                                        <th>Status</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {upcomingFollowups.map((followup, index) => (
                                                        <tr key={followup?.id || `followup-${index}`}>
                                                            <td>
                                                                {(() => {
                                                                    const lead = followup?.lead;
                                                                    if (!lead) return 'N/A';
                                                                    if (typeof lead === 'string') return lead;
                                                                    if (lead.name) return String(lead.name);
                                                                    return 'N/A';
                                                                })()}
                                                            </td>
                                                            <td>
                                                                {(() => {
                                                                    const date = followup?.followup_date;
                                                                    if (!date) return 'N/A';
                                                                    return String(date);
                                                                })()}
                                                            </td>
                                                            <td>
                                                                <span className="badge badge-info">
                                                                    {(() => {
                                                                        const type = followup?.followup_type;
                                                                        if (!type) return 'N/A';
                                                                        if (typeof type === 'string') return type;
                                                                        if (type.name) return String(type.name);
                                                                        return 'N/A';
                                                                    })()}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`badge badge-${(() => {
                                                                    const followupStatus = followupStatuses.find(status => status.id === followup?.followup_status_id);
                                                                    return followupStatus ? getFollowupStatusColor(followupStatus.name) : 'secondary';
                                                                })()}`}>
                                                                    {(() => {
                                                                        const followupStatus = followupStatuses.find(status => status.id === followup?.followup_status_id);
                                                                        return followupStatus?.name || 'No Status';
                                                                    })()}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <Link to={`/crm/followups/edit/${followup?.id || ''}`} className="btn btn-sm btn-outline-primary">
                                                                    Edit
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-muted">No upcoming follow-ups</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CRMDashboard;
