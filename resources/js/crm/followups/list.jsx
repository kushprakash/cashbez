import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import DataTable from '../../pages/components/DataTable';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';

const FollowupList = () => {
    const [followups, setFollowups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const apiService = ApiService();

    useEffect(() => {
        fetchFollowups();
    }, []);

    const fetchFollowups = async () => {
        try {
            setLoading(true);
            const response = await apiService.vGet('/api/crm/followups');
            
            if (response.data) {
                if (Array.isArray(response.data)) {
                    setFollowups(response.data);
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    setFollowups(response.data.data);
                } else {
                    setFollowups([]);
                }
            } else {
                setFollowups([]);
            }
        } catch (error) {
            console.error('Error fetching followups:', error);
            toast.error('Error fetching followups. Please try again.');
            setFollowups([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this followup?')) {
            try {
           
                // Try multiple approaches
                let response;
                if (apiService.vDelete) {
                    response = await apiService.vDelete(`/api/crm/followups/${id}`);
                } else if (apiService.delete) {
                    response = await apiService.delete(`/api/crm/followups`, id);
                } else {
                    // Direct HTTP approach as last resort
                    const { token: authToken, user } = await import('../../core/auth/tokenManager').then(m => m.retrieveTokenAndUserData()) || {};
                    const { axiosAuthorization } = await import('../../core/services/axiosConfig');
                    const httpAuth = axiosAuthorization(authToken, user?.authorization);
                    response = await httpAuth.delete(`/api/crm/followups/${id}`);
                }
                
                toast.success('Followup deleted successfully');
                fetchFollowups();
            } catch (error) {
                toast.error('Error deleting followup. Please try again.');
            }
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await apiService.vPut(`/api/crm/followups/${id}`, { status });
            toast.success('Followup status updated successfully');
            fetchFollowups();
        } catch (error) {
            console.error('Error updating followup status:', error);
            toast.error('Error updating followup status. Please try again.');
        }
    };

    const filteredFollowups = followups.filter(followup => {
        const matchesSearch = followup.notes?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '' || followup.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const columns = [
        {
            Header: 'ID',
            accessor: 'id',
            disableSortBy: false
        },
        {
            Header: 'Lead ID',
            accessor: 'lead_id',
            disableSortBy: false
        },
        {
            Header: 'Follow-up Date',
            accessor: 'followup_date',
            disableSortBy: false,
            Cell: ({ row }) => new Date(row.original.followup_date).toLocaleString()
        },
        {
            Header: 'Notes',
            accessor: 'notes',
            disableSortBy: true,
            Cell: ({ row }) => row.original.notes ? 
                (row.original.notes.length > 50 ? row.original.notes.substring(0, 50) + '...' : row.original.notes) : '-'
        },
        {
            Header: 'Status',
            accessor: 'status',
            disableSortBy: false,
            Cell: ({ row }) => (
                <select
                    className={`form-select form-select-sm ${
                        row.original.status === 'done' ? 'bg-success text-white' : 'bg-warning'
                    }`}
                    value={row.original.status}
                    onChange={(e) => handleStatusChange(row.original.id, e.target.value)}
                >
                    <option value="pending">Pending</option>
                    <option value="done">Done</option>
                </select>
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
                        to={`/crm/followups/edit/${row.original.id}`} 
                        className="btn btn-sm btn-primary"
                        title="Edit Followup"
                    >
                        <i className="fa fa-edit"></i>
                    </Link>
                    <button 
                        onClick={() => handleDelete(row.original.id)}
                        className="btn btn-sm btn-danger"
                        title="Delete Followup"
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
                currentpage="Followups" 
                activepage="CRM" 
                mainpage="Followup Management" 
            />
            
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Followups List</h5>
                            <Link to="/crm/followups/add" className="btn btn-primary">
                                <i className="fa fa-plus me-2"></i>Add New Followup
                            </Link>
                        </div>
                        <div className="card-body">
                            {/* Filters */}
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search followups..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <select
                                        className="form-control"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="done">Done</option>
                                    </select>
                                </div>
                                <div className="col-md-5">
                                    <button 
                                        onClick={fetchFollowups}
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
                                    data={filteredFollowups}
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

export default FollowupList;
