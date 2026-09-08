import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import DataTable from '../../pages/components/DataTable';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';

const FollowupTypeList = () => {
    const [followupTypes, setFollowupTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const apiService = ApiService();

    useEffect(() => {
        fetchFollowupTypes();
    }, []);

    const fetchFollowupTypes = async () => {
        try {
            setLoading(true);
            const response = await apiService.vGet('/api/crm/followup-types');
            
            if (response.data) {
                if (Array.isArray(response.data)) {
                    setFollowupTypes(response.data);
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    setFollowupTypes(response.data.data);
                } else {
                    setFollowupTypes([]);
                }
            } else {
                setFollowupTypes([]);
            }
        } catch (error) {
            console.error('Error fetching followup types:', error);
            toast.error('Error fetching followup types. Please try again.');
            setFollowupTypes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this followup type?')) {
            try {
                console.log('ApiService object:', apiService);
                console.log('Available methods:', Object.keys(apiService));
                
                // Try multiple approaches
                let response;
                if (apiService.vDelete) {
                    response = await apiService.vDelete(`/api/crm/followup-types/${id}`);
                } else if (apiService.delete) {
                    response = await apiService.delete(`/api/crm/followup-types`, id);
                } else {
                    const { token: authToken, user } = await import('../../core/auth/tokenManager').then(m => m.retrieveTokenAndUserData()) || {};
                    const { axiosAuthorization } = await import('../../core/services/axiosConfig');
                    const httpAuth = axiosAuthorization(authToken, user?.authorization);
                    response = await httpAuth.delete(`/api/crm/followup-types/${id}`);
                }
                
                toast.success('Followup type deleted successfully');
                fetchFollowupTypes();
            } catch (error) {
                toast.error('Error deleting followup type. Please try again.');
            }
        }
    };

    const filteredFollowupTypes = followupTypes.filter(type => 
        type.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
            Header: 'Admin',
            accessor: 'admin',
            disableSortBy: true,
            Cell: ({ row }) => (
                <span className="text-muted">
                    {row.original.admin ? 
                        row.original.admin.name : 
                        (row.original.created_by ? 'System' : 'N/A')
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
                <div className="btn-group" role="group">
                    <Link 
                        to={`/crm/followup-types/view/${row.original.id}`} 
                        className="btn btn-sm btn-info"
                        title="View Followup Type"
                    >
                        <i className="fa fa-eye"></i>
                    </Link>
                    <Link 
                        to={`/crm/followup-types/edit/${row.original.id}`} 
                        className="btn btn-sm btn-primary"
                        title="Edit Followup Type"
                    >
                        <i className="fa fa-edit"></i>
                    </Link>
                    <button 
                        onClick={() => handleDelete(row.original.id)}
                        className="btn btn-sm btn-danger"
                        title="Delete Followup Type"
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
                currentpage="Followup Types" 
                activepage="CRM" 
                mainpage="Followup Type Management" 
            />
            
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Followup Types List</h5>
                            <Link to="/crm/followup-types/add" className="btn btn-primary">
                                <i className="fa fa-plus me-2"></i>Add New Followup Type
                            </Link>
                        </div>
                        <div className="card-body">
                            {/* Search */}
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search followup types..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-8">
                                    <button 
                                        onClick={fetchFollowupTypes}
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
                                    data={filteredFollowupTypes}
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

export default FollowupTypeList;
