import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import DataTable from '../../pages/components/DataTable';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [departments, setDepartments] = useState([]);
    const apiService = ApiService();

    useEffect(() => {
        fetchEmployees();
        fetchDepartments();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await apiService.vGet('/api/employees');
            
            // Handle both response formats
            if (response.data) {
                if (Array.isArray(response.data)) {
                    setEmployees(response.data);
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    setEmployees(response.data.data);
                } else if (response.data.status === 1 && Array.isArray(response.data.data)) {
                    setEmployees(response.data.data);
                } else {
                    setEmployees([]);
                }
            } else {
                setEmployees([]);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.error('Error fetching employees. Please try again.');
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await apiService.vGet('/api/departments');
            
            // Handle both response formats
            if (response.data) {
                if (Array.isArray(response.data)) {
                    setDepartments(response.data);
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    setDepartments(response.data.data);
                } else if (response.data.departments && Array.isArray(response.data.departments)) {
                    setDepartments(response.data.departments);
                } else {
                    setDepartments([]);
                }
            } else {
                setDepartments([]);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
            setDepartments([]);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                await apiService.vDelete(`/api/employees/${id}`);
                setEmployees(employees.filter(emp => emp.id !== id));
                toast.success('Employee deleted successfully!');
            } catch (error) {
                console.error('Error deleting employee:', error);
                toast.error('Error deleting employee. Please try again.');
            }
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
            await apiService.vPost(`/api/employees/${id}/status`, { status: newStatus });
            setEmployees(employees.map(emp => 
                emp.id === id ? { ...emp, status: newStatus } : emp
            ));
            toast.success('Employee status updated successfully!');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Error updating status. Please try again.');
        }
    };

    // Filter employees based on search term, status, and department
    const filteredEmployees = employees.filter(employee => {
        const matchesSearch = employee.emp_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             employee.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             employee.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '' || employee.status === statusFilter;
        const matchesDepartment = departmentFilter === '' || employee.department_id.toString() === departmentFilter;
        
        return matchesSearch && matchesStatus && matchesDepartment;
    });

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
            <Pageheader mainheading="Employee Management" parentfolder="HRMS" activepage="Employee List" />
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card">
                                <div className='card-header d-flex justify-content-between align-items-center rounded-top'>
                                    <h3 className="mb-0 fw-bold">Employees</h3>
                                    <Link to="/hrms/employees/add" className="btn btn-primary text-white d-flex align-items-center">
                                        <i className="fa fa-plus me-1"></i> Add Employee
                                    </Link>
                                </div>
                                <div className="card-body p-0">
                                    {loading && <TableShimmerLoader />}
                                    <DataTable
                                        columns={[
                                            {
                                                Header: 'ID',
                                                accessor: 'id',
                                            },
                                            {
                                                Header: 'Employee Code',
                                                accessor: 'emp_code',
                                            },
                                            {
                                                Header: 'Name',
                                                accessor: 'user.name',
                                                Cell: ({ row }) => row.original.user?.name || 'N/A',
                                            },
                                            {
                                                Header: 'Email',
                                                accessor: 'user.email',
                                                Cell: ({ row }) => row.original.user?.email || 'N/A',
                                            },
                                            {
                                                Header: 'Department',
                                                accessor: 'department.name',
                                                Cell: ({ row }) => row.original.department?.name || 'N/A',
                                            },
                                            {
                                                Header: 'Designation',
                                                accessor: 'designation.name',
                                                Cell: ({ row }) => row.original.designation?.name || 'N/A',
                                            },
                                            {
                                                Header: 'Join Date',
                                                accessor: 'join_date',
                                                Cell: ({ row }) => {
                                                    if (!row.original.join_date) return 'N/A';
                                                    return new Date(row.original.join_date).toLocaleDateString();
                                                },
                                            },
                                            {
                                                Header: 'Contact',
                                                accessor: 'contact_no',
                                                Cell: ({ row }) => row.original.contact_no || 'N/A',
                                            },
                                            {
                                                Header: 'Status',
                                                accessor: 'status',
                                                Cell: ({ row }) => (
                                                    <button
                                                         onClick={() => toggleStatus(row.original.id, row.original.status)}
                                                        className={`btn btn-sm ${
                                                            row.original.status === 'Active'
                                                                ? 'btn-success'
                                                                : 'btn-danger'
                                                        }`}
                                                    >
                                                        {row.original.status === 'Active' ? 'Active' : 'Inactive'}
                                                    </button>
                                                ),
                                            },
                                            {
                                                Header: 'Action',
                                                accessor: 'action',
                                                disableSortBy: true,
                                                Cell: ({ row }) => (
                                                    <div className="d-flex gap-2">
                                                        <Link 
                                                            to={`/hrms/employees/edit/${row.original.id}`} 
                                                            className="btn btn-sm btn-primary"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <Link 
                                                            to={`/hrms/employees/kyc/${row.original.user_id || row.original.user?.id}`} 
                                                            className="btn btn-sm btn-info text-white"
                                                            title="View KYC Details"
                                                        >
                                                            View KYC
                                                        </Link>
                                                        {/* <button
                                                            onClick={() => handleDelete(row.original.id)}
                                                            className="btn btn-sm btn-danger"
                                                        >
                                                            Delete
                                                        </button> */}
                                                    </div>
                                                ),
                                            },
                                        ]}
                                        data={filteredEmployees}
                                        title="Employees"
                                        noDataText="No employees found."
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

export default EmployeeList;
