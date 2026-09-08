import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import DataTable from '../../pages/components/DataTable';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';

const FollowupStatusList = () => {
    const [followupStatuses, setFollowupStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [followupTypes, setFollowupTypes] = useState([]);
    
    const apiService = ApiService();

    useEffect(() => {
        fetchFollowupStatuses();
        fetchFollowupTypes();
    }, []);

    const fetchFollowupStatuses = async () => {
        try {
            setLoading(true);
            
            // Try multiple approaches for API calls
            let response;
            if (apiService.vGet) {
                response = await apiService.vGet('/api/crm/followup-statuses');
            } else if (apiService.get) {
                response = await apiService.get('/api/crm/followup-statuses');
            } else {
                const { token: authToken, user } = await import('../../core/auth/tokenManager').then(m => m.retrieveTokenAndUserData()) || {};
                const { axiosAuthorization } = await import('../../core/services/axiosConfig');
                const httpAuth = axiosAuthorization(authToken, user?.authorization);
                response = await httpAuth.get('/api/crm/followup-statuses');
            }
            
            if (response?.data) {
                setFollowupStatuses(response.data);
            }
        } catch (error) {
            console.error('Error fetching followup statuses:', error);
            toast.error('Error fetching followup statuses. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchFollowupTypes = async () => {
        try {
            let response;
            if (apiService.vGet) {
                response = await apiService.vGet('/api/crm/followup-types');
            } else if (apiService.get) {
                response = await apiService.get('/api/crm/followup-types');
            } else {
                const { token: authToken, user } = await import('../../core/auth/tokenManager').then(m => m.retrieveTokenAndUserData()) || {};
                const { axiosAuthorization } = await import('../../core/services/axiosConfig');
                const httpAuth = axiosAuthorization(authToken, user?.authorization);
                response = await httpAuth.get('/api/crm/followup-types');
            }
            
            if (response?.data) {
                setFollowupTypes(response.data);
            }
        } catch (error) {
            console.error('Error fetching followup types:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this followup status?')) {
            try {
                
                // Try multiple approaches
                let response;
                if (apiService.vDelete) {
                    response = await apiService.vDelete(`/api/crm/followup-statuses/${id}`);
                } else if (apiService.delete) {
                    response = await apiService.delete(`/api/crm/followup-statuses`, id);
                } else {
                    const { token: authToken, user } = await import('../../core/auth/tokenManager').then(m => m.retrieveTokenAndUserData()) || {};
                    const { axiosAuthorization } = await import('../../core/services/axiosConfig');
                    const httpAuth = axiosAuthorization(authToken, user?.authorization);
                    response = await httpAuth.delete(`/api/crm/followup-statuses/${id}`);
                }
                
                toast.success('Followup status deleted successfully');
                fetchFollowupStatuses();
            } catch (error) {
                toast.error('Error deleting followup status. Please try again.');
            }
        }
    };

    const filteredFollowupStatuses = followupStatuses.filter(status => {
        const matchesSearch = status.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             status.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !typeFilter || status.followup_type_id == typeFilter;
        return matchesSearch && matchesType;
    });

    const columns = [
        {
            Header: 'ID',
            accessor: 'id',
            disableSortBy: false
        },
        {
            Header: 'Name',
            accessor: 'name',
            disableSortBy: false
        },
        {
            Header: 'Color',
            accessor: 'color',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="d-flex align-items-center">
                    <span 
                        className="badge me-2" 
                        style={{ backgroundColor: row.original.color || '#6c757d', minWidth: '60px' }}
                    >
                        {row.original.name}
                    </span>
                    <small className="text-muted">{row.original.color || '#6c757d'}</small>
                </div>
            )
        },
        {
            Header: 'Followup Type',
            accessor: 'followup_type',
            disableSortBy: true,
            Cell: ({ row }) => (
                <span className="badge bg-info">
                    {row.original.followup_type?.name || 'Not assigned'}
                </span>
            )
        },
        {
            Header: 'Description',
            accessor: 'description',
            disableSortBy: true,
            Cell: ({ row }) => (
                <span className="text-muted">
                    {row.original.description ? 
                        (row.original.description.length > 50 ? 
                            row.original.description.substring(0, 50) + '...' : 
                            row.original.description
                        ) : 
                        'N/A'
                    }
                </span>
            )
        },
        {
            Header: 'Sort Order',
            accessor: 'sort_order',
            disableSortBy: false,
            Cell: ({ row }) => (
                <span className="badge bg-secondary">
                    {row.original.sort_order || 0}
                </span>
            )
        },
        {
            Header: 'Status',
            accessor: 'is_active',
            disableSortBy: false,
            Cell: ({ row }) => (
                <span className={`badge ${row.original.is_active ? 'bg-success' : 'bg-danger'}`}>
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            Header: 'Created At',
            accessor: 'created_at',
            disableSortBy: false,
            Cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString()
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="d-flex gap-2">
                    <Link 
                        to={`/crm/followup-statuses/view/${row.original.id}`}
                        className="btn btn-sm btn-outline-info"
                        title="View Details"
                    >
                        <i className="fa fa-eye"></i>
                    </Link>
                    <Link 
                        to={`/crm/followup-statuses/edit/${row.original.id}`}
                        className="btn btn-sm btn-outline-primary"
                        title="Edit"
                    >
                        <i className="fa fa-edit"></i>
                    </Link>
                    <button
                        onClick={() => handleDelete(row.original.id)}
                        className="btn btn-sm btn-outline-danger"
                        title="Delete"
                    >
                        <i className="fa fa-trash"></i>
                    </button>
                </div>
            )
        }
    ];

    if (loading) {
        return <TableShimmerLoader />;
    }

    return (
        <>
            <Pageheader 
                currentpage="Followup Status Management" 
                activepage="CRM" 
                mainpage="Followup Status Management" 
            />
            
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Followup Statuses List</h5>
                            <Link to="/crm/followup-statuses/add" className="btn btn-primary">
                                <i className="fa fa-plus me-2"></i>Add New Status
                            </Link>
                        </div>
                        <div className="card-body">
                            {/* Filters */}
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>Search:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search by name or description..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>Filter by Type:</label>
                                        <select
                                            className="form-control"
                                            value={typeFilter}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                        >
                                            <option value="">All Types</option>
                                            {followupTypes.map(type => (
                                                <option key={type.id} value={type.id}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Data Table */}
                            <DataTable
                                columns={columns}
                                data={filteredFollowupStatuses}
                                loading={loading}
                                searchable={false}
                                showSearchField={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
};

export default FollowupStatusList;
