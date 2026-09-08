import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import DataTable from '../../pages/components/DataTable';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';

const ActivityList = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [leads, setLeads] = useState([]);
    const apiService = ApiService();

    useEffect(() => {
        fetchActivities();
        fetchLeads();
    }, []);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const response = await apiService.vGet('/api/crm/lead-activities');
            
            if (response.data) {
                if (Array.isArray(response.data)) {
                    setActivities(response.data);
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    setActivities(response.data.data);
                } else {
                    setActivities([]);
                }
            } else {
                setActivities([]);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            toast.error('Error fetching activities. Please try again.');
            setActivities([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchLeads = async () => {
        try {
            const response = await apiService.vGet('/api/crm/leads');
            setLeads(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching leads:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this activity?')) {
            try {
             
                // Try multiple approaches
                let response;
                if (apiService.vDelete) {
                    response = await apiService.vDelete(`/api/crm/lead-activities/${id}`);
                } else if (apiService.delete) {
                    response = await apiService.delete(`/api/crm/lead-activities`, id);
                } else {
                    // Direct HTTP approach as last resort
                    const { token: authToken, user } = await import('../../core/auth/tokenManager').then(m => m.retrieveTokenAndUserData()) || {};
                    const { axiosAuthorization } = await import('../../core/services/axiosConfig');
                    const httpAuth = axiosAuthorization(authToken, user?.authorization);
                    response = await httpAuth.delete(`/api/crm/lead-activities/${id}`);
                }
                
                toast.success('Activity deleted successfully');
                fetchActivities();
            } catch (error) {
                toast.error('Error deleting activity. Please try again.');
            }
        }
    };

    const getLeadName = (leadId) => {
        const lead = leads.find(l => l.id === leadId);
        return lead ? lead.name : `Lead #${leadId}`;
    };

    const filteredActivities = activities.filter(activity => {
        const matchesSearch = activity.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             getLeadName(activity.lead_id).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === '' || activity.activity_type === typeFilter;
        
        return matchesSearch && matchesType;
    });

    const getActivityTypeIcon = (type) => {
        switch(type.toLowerCase()) {
            case 'call': return 'fa-phone';
            case 'meeting': return 'fa-users';
            case 'note': return 'fa-sticky-note';
            case 'email': return 'fa-envelope';
            default: return 'fa-comment';
        }
    };

    const getActivityTypeColor = (type) => {
        switch(type.toLowerCase()) {
            case 'call': return 'primary';
            case 'meeting': return 'success';
            case 'note': return 'info';
            case 'email': return 'warning';
            default: return 'secondary';
        }
    };

    const columns = [
        {
            Header: 'ID',
            accessor: 'id',
            disableSortBy: false
        },
        {
            Header: 'Lead',
            accessor: 'lead_id',
            disableSortBy: false,
            Cell: ({ row }) => (
                <Link to={`/crm/leads/edit/${row.original.lead_id}`} className="text-primary">
                    {getLeadName(row.original.lead_id)}
                </Link>
            )
        },
        {
            Header: 'Type',
            accessor: 'activity_type',
            disableSortBy: false,
            Cell: ({ row }) => (
                <span className={`badge badge-${getActivityTypeColor(row.original.activity_type)}`}>
                    <i className={`fa ${getActivityTypeIcon(row.original.activity_type)} me-1`}></i>
                    {row.original.activity_type}
                </span>
            )
        },
        {
            Header: 'Details',
            accessor: 'details',
            disableSortBy: true,
            Cell: ({ row }) => row.original.details ? 
                (row.original.details.length > 50 ? row.original.details.substring(0, 50) + '...' : row.original.details) : '-'
        },
        {
            Header: 'Next Follow-up',
            accessor: 'next_followup',
            disableSortBy: false,
            Cell: ({ row }) => row.original.next_followup ? 
                new Date(row.original.next_followup).toLocaleDateString() : '-'
        },
        {
            Header: 'Created At',
            accessor: 'created_at',
            disableSortBy: false,
            Cell: ({ row }) => new Date(row.original.created_at).toLocaleString()
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="btn-group" role="group">
                    <Link 
                        to={`/crm/activities/view/${row.original.id}`} 
                        className="btn btn-sm btn-info"
                        title="View Activity"
                    >
                        <i className="fa fa-eye"></i>
                    </Link>
                    <Link 
                        to={`/crm/activities/edit/${row.original.id}`} 
                        className="btn btn-sm btn-primary"
                        title="Edit Activity"
                    >
                        <i className="fa fa-edit"></i>
                    </Link>
                    <button 
                        onClick={() => handleDelete(row.original.id)}
                        className="btn btn-sm btn-danger"
                        title="Delete Activity"
                    >
                        <i className="fa fa-trash"></i>
                    </button>
                </div>
            )
        }
    ];

    const activityTypes = ['Call', 'Meeting', 'Note', 'Email'];

    return (
        <>
            <Pageheader 
                currentpage="Lead Activities" 
                activepage="CRM" 
                mainpage="Activity Management" 
            />
            
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Lead Activities List</h5>
                            <Link to="/crm/activities/add" className="btn btn-primary">
                                <i className="fa fa-plus me-2"></i>Add New Activity
                            </Link>
                        </div>
                        <div className="card-body">
                            {/* Filters */}
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search activities..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <select
                                        className="form-control"
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                    >
                                        <option value="">All Types</option>
                                        {activityTypes.map(type => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-5">
                                    <button 
                                        onClick={fetchActivities}
                                        className="btn btn-secondary"
                                    >
                                        <i className="fa fa-refresh me-2"></i>Refresh
                                    </button>
                                </div>
                            </div>

                            {/* Data Table */}
                            {loading ? (
                                <TableShimmerLoader />
                            ) : (
                                <DataTable
                                    data={filteredActivities}
                                    columns={columns}
                                    searchable={false}
                                    itemsPerPageOptions={[10, 25, 50, 100]}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </>
    );
};

export default ActivityList;
