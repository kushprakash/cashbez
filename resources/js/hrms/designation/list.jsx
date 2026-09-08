import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import DataTable from '../../pages/components/DataTable';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ListDesignation = () => {
    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(true);
    const apiService = ApiService();

    useEffect(() => {
        fetchDesignations();
    }, []);

    const fetchDesignations = () => {
        setLoading(true);
        apiService.vGet(`/api/designations`).then(res => {
            setDesignations(res.data.designations || []);
            setLoading(false);
        }).catch(err => {
            toast.error('Failed to fetch designations');
            setLoading(false);
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this designation?')) {
            return;
        }
        
        try {
            const res = await apiService.vPost(`/api/designations/${id}`, {}, true, true, 'delete');
            if (res.data && res.data.status === 1) {
                toast.success('Designation deleted successfully');
                fetchDesignations(); // Refresh the list
            } else {
                toast.error(res.data.message || 'Failed to delete designation');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to delete designation');
        }
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
            <Pageheader mainheading="Designation Management" parentfolder="HRMS" activepage="Designation List" />
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card">
                                <div className='card-header d-flex justify-content-between align-items-center rounded-top'>
                                    <span className="d-flex align-items-center">
                                        <i className="bi bi-person-badge me-2" style={{ fontSize: '1.3rem' }}></i>
                                        <h3 className="mb-0 fw-bold">Designations</h3>
                                    </span>
                                    <Link to="/hrms/designations/add" className="btn btn-primary text-white d-flex align-items-center">
                                        <i className="fa fa-plus me-1"></i> Create Designation
                                    </Link>
                                </div>
                                <div className="card-body p-0">
                                    {loading && <TableShimmerLoader />}
                                    <DataTable
                                        columns={[
                                            {
                                                Header: 'ID',
                                                accessor: 'id',
                                                Cell: ({ value }) => (
                                                    <span className="badge bg-light text-dark">{value}</span>
                                                ),
                                            },
                                            {
                                                Header: 'Designation Title',
                                                accessor: 'title',
                                                Cell: ({ value }) => (
                                                    <span className="fw-semibold">{value}</span>
                                                ),
                                            },
                                            {
                                                Header: 'Department',
                                                accessor: 'department.name',
                                                Cell: ({ value }) => (
                                                    <span className="badge bg-info text-white">{value || '-'}</span>
                                                ),
                                            },
                                            {
                                                Header: 'Created By',
                                                accessor: 'user.name',
                                                Cell: ({ value }) => (
                                                    <span className="text-muted">{value || '-'}</span>
                                                ),
                                            },
                                            {
                                                Header: 'Created Date',
                                                accessor: 'created_at',
                                                Cell: ({ value }) => {
                                                    if (!value) return '-';
                                                    const date = new Date(value);
                                                    return date.toLocaleDateString('en-IN', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    });
                                                },
                                            },
                                            {
                                                Header: 'Actions',
                                                id: 'actions',
                                                disableSortBy: true,
                                                Cell: ({ row }) => (
                                                    <div className="d-flex gap-2">
                                                        <Link 
                                                            to={`/hrms/designations/edit/${row.original.id}`} 
                                                            className="btn btn-sm btn-outline-primary"
                                                            title="Edit Designation"
                                                        >
                                                            <i className="fa fa-edit"></i>
                                                        </Link>
                                                        {/* <button 
                                                            onClick={() => handleDelete(row.original.id)}
                                                            className="btn btn-sm btn-outline-danger"
                                                            title="Delete Designation"
                                                        >
                                                            <i className="fa fa-trash"></i>
                                                        </button> */}
                                                    </div>
                                                ),
                                            },
                                        ]}
                                        data={designations}
                                        title="Designations"
                                        noDataText="No designations found."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ListDesignation;
