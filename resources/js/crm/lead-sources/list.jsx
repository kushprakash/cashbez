import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import DataTable from '../../pages/components/DataTable';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';

const LeadSourceList = () => {
    const [leadSources, setLeadSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const apiService = ApiService();

    useEffect(() => {
        fetchLeadSources();
    }, []);

    const fetchLeadSources = async () => {
        try {
            setLoading(true);
            const response = await apiService.vGet('/api/crm/lead-sources');
            
            if (response.data) {
                if (Array.isArray(response.data)) {
                    setLeadSources(response.data);
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    setLeadSources(response.data.data);
                } else {
                    setLeadSources([]);
                }
            } else {
                setLeadSources([]);
            }
        } catch (error) {
            console.error('Error fetching lead sources:', error);
            toast.error('Error fetching lead sources. Please try again.');
            setLeadSources([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this lead source?')) {
            try {
             
                // Try multiple approaches
                let response;
                if (apiService.vDelete) {
                    response = await apiService.vDelete(`/api/crm/lead-sources/${id}`);
                } else if (apiService.delete) {
                    response = await apiService.delete(`/api/crm/lead-sources`, id);
                } else {
                    // Direct HTTP approach as last resort
                    const { token: authToken, user } = await import('../../core/auth/tokenManager').then(m => m.retrieveTokenAndUserData()) || {};
                    const { axiosAuthorization } = await import('../../core/services/axiosConfig');
                    const httpAuth = axiosAuthorization(authToken, user?.authorization);
                    response = await httpAuth.delete(`/api/crm/lead-sources/${id}`);
                }
                
                toast.success('Lead source deleted successfully');
                fetchLeadSources();
            } catch (error) {
                toast.error('Error deleting lead source. Please try again.');
            }
        }
    };

    const filteredLeadSources = leadSources.filter(source => 
        source.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
                        to={`/crm/lead-sources/edit/${row.original.id}`} 
                        className="btn btn-sm btn-primary"
                        title="Edit Lead Source"
                    >
                        <i className="fa fa-edit"></i>
                    </Link>
                    <button 
                        onClick={() => handleDelete(row.original.id)}
                        className="btn btn-sm btn-danger"
                        title="Delete Lead Source"
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
                currentpage="Lead Sources" 
                activepage="CRM" 
                mainpage="Lead Source Management" 
            />
            
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Lead Sources List</h5>
                            <Link to="/crm/lead-sources/add" className="btn btn-primary">
                                <i className="fa fa-plus me-2"></i>Add New Lead Source
                            </Link>
                        </div>
                        <div className="card-body">
                            {/* Search */}
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search lead sources..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-8">
                                    <button 
                                        onClick={fetchLeadSources}
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
                                    data={filteredLeadSources}
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

export default LeadSourceList;
