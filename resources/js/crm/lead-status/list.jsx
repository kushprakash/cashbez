import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import DataTable from '../../pages/components/DataTable';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';

const LeadStatusList = () => {
    const [leadStatuses, setLeadStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const apiService = ApiService();

    useEffect(() => {
        fetchLeadStatuses();
    }, []);

    const fetchLeadStatuses = async () => {
        try {
            setLoading(true);
            const response = await apiService.vGet('/api/crm/lead-status');
            
            if (response.data) {
                if (Array.isArray(response.data)) {
                    setLeadStatuses(response.data);
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    setLeadStatuses(response.data.data);
                } else {
                    setLeadStatuses([]);
                }
            } else {
                setLeadStatuses([]);
            }
        } catch (error) {
            console.error('Error fetching lead statuses:', error);
            toast.error('Error fetching lead statuses. Please try again.');
            setLeadStatuses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this lead status?')) {
            try {
                console.log('ApiService object:', apiService);
                console.log('Available methods:', Object.keys(apiService));
                
                // Try multiple approaches
                let response;
                if (apiService.vDelete) {
                    response = await apiService.vDelete(`/api/crm/lead-status/${id}`);
                } else if (apiService.delete) {
                    response = await apiService.delete(`/api/crm/lead-status`, id);
                } else {
                    const { token: authToken, user } = await import('../../core/auth/tokenManager').then(m => m.retrieveTokenAndUserData()) || {};
                    const { axiosAuthorization } = await import('../../core/services/axiosConfig');
                    const httpAuth = axiosAuthorization(authToken, user?.authorization);
                    response = await httpAuth.delete(`/api/crm/lead-status/${id}`);
                }
                
                toast.success('Lead status deleted successfully');
                fetchLeadStatuses();
            } catch (error) {
                toast.error('Error deleting lead status. Please try again.');
            }
        }
    };

    const filteredLeadStatuses = leadStatuses.filter(status => 
        status.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            Header: 'Follow-up Type',
            accessor: 'followup_type',
            disableSortBy: false,
            Cell: ({ row }) => (
                <span className="badge bg-info">
                    {row.original.followup_type?.name || 'N/A'}
                </span>
            )
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
                        to={`/crm/lead-status/edit/${row.original.id}`} 
                        className="btn btn-sm btn-primary"
                        title="Edit Lead Status"
                    >
                        <i className="fa fa-edit"></i>
                    </Link>
                    <button 
                        onClick={() => handleDelete(row.original.id)}
                        className="btn btn-sm btn-danger"
                        title="Delete Lead Status"
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
                currentpage="Lead Status" 
                activepage="CRM" 
                mainpage="Lead Status Management" 
            />
            
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Lead Status List</h5>
                            <Link to="/crm/lead-status/add" className="btn btn-primary">
                                <i className="fa fa-plus me-2"></i>Add New Lead Status
                            </Link>
                        </div>
                        <div className="card-body">
                            {/* Search */}
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search lead status..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-8">
                                    <button 
                                        onClick={fetchLeadStatuses}
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
                                    data={filteredLeadStatuses}
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

export default LeadStatusList;
