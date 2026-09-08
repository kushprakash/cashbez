import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import DataTable from '../../pages/components/DataTable';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ListDepartment = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const apiService = ApiService();

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = () => {
        setLoading(true);
        apiService.vGet(`/api/departments`).then(res => {
            setDepartments(res.data.departments || []);
            setLoading(false);
        }).catch(err => {
            toast.error('Failed to fetch departments');
            setLoading(false);
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department?')) {
            return;
        }
        
        try {
            const res = await apiService.vPost(`/api/departments/${id}`, {}, true, true, 'delete');
            if (res.data && res.data.status === 1) {
                toast.success('Department deleted successfully');
                fetchDepartments(); // Refresh the list
            } else {
                toast.error(res.data.message || 'Failed to delete department');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to delete department');
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus ? 0 : 1;
            const res = await apiService.vPut(`/api/departments/${id}`, { status: newStatus }, true, true, 'put');
            if (res.data && res.data.status === 1) {
                toast.success(`Department ${newStatus ? 'activated' : 'deactivated'} successfully`);
                fetchDepartments(); // Refresh the list
            } else {
                toast.error(res.data.message || 'Failed to update department status');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update department status');
        }
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
            <Pageheader mainheading="Department Management" parentfolder="HRMS" activepage="Department List" />
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card">
                                <div className='card-header d-flex justify-content-between align-items-center rounded-top'>
                                    <span className="d-flex align-items-center">
                                        <i className="bi bi-building me-2" style={{ fontSize: '1.3rem' }}></i>
                                        <h3 className="mb-0 fw-bold">Departments</h3>
                                    </span>
                                    <Link to="/hrms/departments/add" className="btn btn-primary text-white d-flex align-items-center">
                                        <i className="fa fa-plus me-1"></i> Create Department
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
                                                Header: 'Department Name',
                                                accessor: 'name',
                                                Cell: ({ value }) => (
                                                    <span className="fw-semibold">{value}</span>
                                                ),
                                            },
                                            {
                                                Header: 'Status',
                                                accessor: 'status',
                                                Cell: ({ row }) => (
                                                    <button
                                                        className={`btn btn-sm ${row.original.status ? 'btn-success' : 'btn-danger'}`}
                                                        title={`Click to ${row.original.status ? 'deactivate' : 'activate'}`}
                                                    >
                                                        <i className={`fa ${row.original.status ? 'fa-check' : 'fa-times'} me-1`}></i>
                                                        {row.original.status ? 'Active' : 'Inactive'}
                                                    </button>
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
                                                            to={`/hrms/departments/edit/${row.original.id}`} 
                                                            className="btn btn-sm btn-outline-primary"
                                                            title="Edit Department"
                                                        >
                                                            <i className="fa fa-edit"></i>
                                                        </Link>
                                                        {/* <button 
                                                            onClick={() => handleDelete(row.original.id)}
                                                            className="btn btn-sm btn-outline-danger"
                                                            title="Delete Department"
                                                        >
                                                            <i className="fa fa-trash"></i>
                                                        </button> */}
                                                    </div>
                                                ),
                                            },
                                        ]}
                                        data={departments}
                                        title="Departments"
                                        noDataText="No departments found."
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

export default ListDepartment;
