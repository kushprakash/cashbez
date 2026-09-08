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
    const apiService = ApiService();

    useEffect(() => {
        fetchFollowupStatuses();
    }, []);

    const fetchFollowupStatuses = async () => {
        try {
            setLoading(true);
            const response = await apiService.vGet('/api/crm/followup-status');
            
            if (response.data) {
                if (Array.isArray(response.data)) {
                    setFollowupStatuses(response.data);
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    setFollowupStatuses(response.data.data);
                } else {
                    setFollowupStatuses([]);
                }
            } else {
                setFollowupStatuses([]);
            }
        } catch (error) {
            console.error('Error fetching followup statuses:', error);
            toast.error('Error fetching followup statuses. Please try again.');
            setFollowupStatuses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this followup status?')) {
            try {
                let response;
                if (apiService.vDelete) {
                    response = await apiService.vDelete(`/api/crm/followup-status/${id}`);
                } else if (apiService.delete) {
                    response = await apiService.delete(`/api/crm/followup-status`, id);
                } else {
                    // Direct HTTP approach as last resort
                    const { token: authToken, user } = await import('../../core/auth/tokenManager').then(m => m.retrieveTokenAndUserData()) || {};
                    const { axiosAuthorization } = await import('../../core/services/axiosConfig');
                    const httpAuth = axiosAuthorization(authToken, user?.authorization);
                    response = await httpAuth.delete(`/api/crm/followup-status/${id}`);
                }
                
                toast.success('Followup status deleted successfully');
                fetchFollowupStatuses();
            } catch (error) {
                toast.error('Error deleting followup status. Please try again.');
            }
        }
    };

    const filteredStatuses = followupStatuses.filter(status => 
        status.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        status.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            Header: 'ID',
            accessor: 'id',
            disableSortBy: false
        },
        {
            Header: 'Name',
            accessor: 'name',
            disableSortBy: false,
            Cell: ({ row }) => (
                <div className="d-flex align-items-center">
                    <span 
                        className="badge me-2" 
                        style={{ 
                            backgroundColor: row.original.color || '#6c757d', 
                            color: '#fff' 
                        }}
                    >
                        {row.original.name}
                    </span>
                </div>
            )
        },
        {
            Header: 'Description',
            accessor: 'description',
            disableSortBy: true,
            Cell: ({ row }) => (
                <span className="text-muted">{row.original.description || '-'}</span>
            )
        },
        {
            Header: 'Color',
            accessor: 'color',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="d-flex align-items-center">
                    <div 
                        className="color-preview me-2" 
                        style={{ 
                            width: '20px', 
                            height: '20px', 
                            backgroundColor: row.original.color || '#6c757d',
                            border: '1px solid #dee2e6',
                            borderRadius: '3px'
                        }}
                    ></div>
                    <code>{row.original.color || '#6c757d'}</code>
                </div>
            )
        },
        {
            Header: 'Status',
            accessor: 'is_active',
            disableSortBy: false,
            Cell: ({ row }) => (
                <span className={`badge ${row.original.is_active ? 'badge-success' : 'badge-secondary'}`}>
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            Header: 'Created At',
            accessor: 'created_at',
            disableSortBy: false,
            Cell: ({ row }) => row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : '-'
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="btn-group" role="group">
                    <Link 
                        to={`/crm/followup-status/edit/${row.original.id}`} 
                        className="btn btn-sm btn-warning"
                        title="Edit Followup Status"
                    >
                        <i className="fa fa-edit"></i>
                    </Link>
                    <button 
                        onClick={() => handleDelete(row.original.id)}
                        className="btn btn-sm btn-danger"
                        title="Delete Followup Status"
                    >
                        <i className="fa fa-trash"></i>
                    </button>
                </div>
            )
        }
    ];

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
                            <Link to="/crm/followup-status/add" className="btn btn-primary">
                                <i className="fa fa-plus me-2"></i>Add New Status
                            </Link>
                        </div>
                        <div className="card-body">
                            {/* Search Filter */}
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search statuses..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <button 
                                        onClick={fetchFollowupStatuses}
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
                                    data={filteredStatuses}
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

export default FollowupStatusList;
