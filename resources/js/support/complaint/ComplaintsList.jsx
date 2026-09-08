import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import complaintService from '../services/complaintService';
import DataTable from '../../pages/components/DataTable';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';

const ComplaintsList = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        category: '',
        priority: '',
        assigned_to: '',
        date_from: '',
        date_to: ''
    });
    const [categories, setCategories] = useState({});
    const [assignees, setAssignees] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async (filterParams = filters) => {
        try {
            setLoading(true);
            const res = await complaintService.getComplaints(filterParams);
            const response = res.data;
            console.log('Fetched complaints response:', response);
            if (response.status === 1) {
                setComplaints(response.data.complaints);
                setCategories(response.data.categories);
                setAssignees(response.data.assignees);
            }
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
    };

    const applyFilters = () => {
        fetchComplaints(filters);
    };

    const clearFilters = () => {
        const emptyFilters = {
            status: '',
            category: '',
            priority: '',
            assigned_to: '',
            date_from: '',
            date_to: ''
        };
        setFilters(emptyFilters);
        fetchComplaints(emptyFilters);
    };

    const getStatusBadgeClass = (status) => {
        const badges = {
            'NEW': 'warning',
            'ASSIGNED': 'info',
            'IN_PROGRESS': 'primary',
            'RESOLVED': 'success',
            'CLOSED': 'secondary',
            'CANCELLED': 'danger'
        };
        return badges[status] || 'light';
    };

    const getCategoryBadgeClass = (category) => {
        const badges = {
            'TRANSACTION': 'danger',
            'ACCOUNT': 'warning',
            'TECHNICAL': 'info',
            'BILLING': 'secondary',
            'KYC': 'primary',
            'OTHER': 'light'
        };
        return badges[category] || 'light';
    };

    const getPriorityBadgeClass = (priority) => {
        const badges = {
            'URGENT': 'danger',
            'HIGH': 'warning',
            'MEDIUM': 'info',
            'LOW': 'secondary'
        };
        return badges[priority] || 'light';
    };

    return (
        <>
            <Pageheader 
                mainheading="Complaints Management" 
                parentfolder="Complaints" 
                activepage="All Complaints" 
            />
            
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    
                    {/* Filter Section */}
                    <div className="card mb-4 border-0 shadow-sm">
                        <div className="card-header bg-white border-0">
                            <h5 className="mb-0 fw-bold">
                                <i className="fas fa-filter me-2"></i>
                                Filters
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <label className="form-label">Status</label>
                                    <select 
                                        className="form-select"
                                        name="status"
                                        value={filters.status}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">All Status</option>
                                        <option value="NEW">New</option>
                                        <option value="ASSIGNED">Assigned</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="RESOLVED">Resolved</option>
                                        <option value="CLOSED">Closed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">Category</label>
                                    <select 
                                        className="form-select"
                                        name="category"
                                        value={filters.category}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">All Categories</option>
                                        {Object.entries(categories).map(([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">Priority</label>
                                    <select 
                                        className="form-select"
                                        name="priority"
                                        value={filters.priority}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">All Priorities</option>
                                        <option value="URGENT">Urgent</option>
                                        <option value="HIGH">High</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="LOW">Low</option>
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">Assigned To</label>
                                    <select 
                                        className="form-select"
                                        name="assigned_to"
                                        value={filters.assigned_to}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">All Assignees</option>
                                        {assignees.map((assignee) => (
                                            <option key={assignee.value} value={assignee.value}>
                                                {assignee.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">Date From</label>
                                    <input 
                                        type="date"
                                        className="form-control"
                                        name="date_from"
                                        value={filters.date_from}
                                        onChange={handleFilterChange}
                                    />
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">Date To</label>
                                    <input 
                                        type="date"
                                        className="form-control"
                                        name="date_to"
                                        value={filters.date_to}
                                        onChange={handleFilterChange}
                                    />
                                </div>

                                <div className="col-md-6 d-flex align-items-end">
                                    <button 
                                        className="btn btn-primary me-2"
                                        onClick={applyFilters}
                                    >
                                        <i className="fas fa-search me-1"></i>
                                        Apply Filters
                                    </button>
                                    <button 
                                        className="btn btn-outline-secondary"
                                        onClick={clearFilters}
                                    >
                                        <i className="fas fa-times me-1"></i>
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Complaints Table */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">
                                All Complaints
                                <span className="badge bg-primary ms-2">{complaints.length}</span>
                            </h5>
                            <Link to="/complaints/create" className="btn btn-primary">
                                <i className="fa fa-plus me-1"></i>
                                Create Complaint
                            </Link>
                        </div>
                        <div className="card-body p-0">
                            {loading ? (
                                <TableShimmerLoader />
                            ) : (
                                <DataTable
                                    columns={[
                                        {
                                            Header: '#',
                                            id: 'serial',
                                            Cell: ({ row }) => row.index + 1
                                        },
                                        {
                                            Header: 'Complaint ID',
                                            accessor: 'complaint_id',
                                            Cell: ({ row }) => (
                                                <span className="fw-bold text-primary">
                                                    {row.original.complaint_id}
                                                    {row.original.chat_thread_id && (
                                                        <i className="fas fa-comments text-info ms-2" title="Has chat"></i>
                                                    )}
                                                </span>
                                            )
                                        },
                                        {
                                            Header: 'Title',
                                            accessor: 'title',
                                            Cell: ({ row }) => (
                                                <div style={{ maxWidth: '300px' }}>
                                                    <div className="fw-semibold">{row.original.title}</div>
                                                    {row.original.user && (
                                                        <small className="text-muted">
                                                            {row.original.user.name} • {row.original.user.mobile}
                                                        </small>
                                                    )}
                                                </div>
                                            )
                                        },
                                        {
                                            Header: 'Category',
                                            accessor: 'category',
                                            Cell: ({ row }) => (
                                                <span className={`badge bg-${getCategoryBadgeClass(row.original.category)}`}>
                                                    {row.original.category}
                                                </span>
                                            )
                                        },
                                        {
                                            Header: 'Priority',
                                            accessor: 'priority',
                                            Cell: ({ row }) => (
                                                <span className={`badge bg-${getPriorityBadgeClass(row.original.priority)}`}>
                                                    {row.original.priority}
                                                </span>
                                            )
                                        },
                                        {
                                            Header: 'Status',
                                            accessor: 'status',
                                            Cell: ({ row }) => (
                                                <span className={`badge bg-${getStatusBadgeClass(row.original.status)}`}>
                                                    {row.original.status}
                                                </span>
                                            )
                                        },
                                        {
                                            Header: 'Assigned To',
                                            accessor: 'assigned_to',
                                            Cell: ({ row }) => {
                                                // Check both snake_case and camelCase
                                                const assignedUser = row.original.assigned_to_user || row.original.assignedTo;
                                                if (assignedUser && assignedUser.name) {
                                                    return assignedUser.name;
                                                }
                                                return <span className="text-muted">Unassigned</span>;
                                            }
                                        },
                                        {
                                            Header: 'Created',
                                            accessor: 'created_on',
                                            Cell: ({ row }) => (
                                                <small>{new Date(row.original.created_on).toLocaleString()}</small>
                                            )
                                        },
                                        {
                                            Header: 'Actions',
                                            id: 'actions',
                                            disableSortBy: true,
                                            Cell: ({ row }) => (
                                                <div className="btn-group btn-group-sm" role="group">
                                                    <Link 
                                                        to={`/complaints/view/${row.original.complaint_id}`}
                                                        className="btn btn-outline-primary"
                                                        title="View Details"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </Link>
                                                    {row.original.chat_thread_id && (
                                                        <Link 
                                                            to={`/chat/${row.original.chat_thread_id}`}
                                                            className="btn btn-outline-info"
                                                            title="Open Chat"
                                                        >
                                                            <i className="fas fa-comments"></i>
                                                        </Link>
                                                    )}
                                                </div>
                                            )
                                        }
                                    ]}
                                    data={complaints}
                                    title="Complaints"
                                    noDataText="No complaints found."
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ComplaintsList;