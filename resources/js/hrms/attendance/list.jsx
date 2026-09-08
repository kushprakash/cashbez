import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const AttendanceList = () => {
    const [attendances, setAttendances] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        start_date: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
        end_date: new Date().toISOString().split('T')[0], // Today
        user_id: ''
    });
    const [summary, setSummary] = useState({
        total_records: 0,
        present_days: 0,
        absent_days: 0,
        total_hours: 0
    });
    const [selectedSelfie, setSelectedSelfie] = useState(null);
    const [showEmployeeSelect, setShowEmployeeSelect] = useState(false);

    const apiService = ApiService();

    useEffect(() => {
        fetchEmployees();
        fetchAttendances();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await apiService.vGet('/api/attendance/employees');
            if (response.data && response.data.status === 1) {
                const empData = response.data.data;
                setEmployees(Array.isArray(empData) ? empData : []);
            } else {
                setEmployees([]);
            }
        } catch (error) {
            setEmployees([]);
            console.error('Error fetching employees:', error);
        }
    };

    const fetchAttendances = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.start_date) params.append('start_date', filters.start_date);
            if (filters.end_date) params.append('end_date', filters.end_date);
            if (filters.user_id) params.append('user_id', filters.user_id);

            const response = await apiService.vGet(`/api/attendance?${params.toString()}`);
            
            if (response.data && response.data.status === 1) {
                setAttendances(response.data.data);
                setSummary(response.data.summary);
                // Check if user is admin (mid == admin_mid) from first attendance record
                if (response.data.data && response.data.data.length > 0) {
                    const user = response.data.data[0].user;
                    if (user && user.mid && user.admin_mid && user.mid === user.admin_mid) {
                        setShowEmployeeSelect(true);
                    } else {
                        setShowEmployeeSelect(false);
                    }
                }
            } else {
                setAttendances([]);
                setSummary({
                    total_records: 0,
                    present_days: 0,
                    absent_days: 0,
                    total_hours: 0
                });
                setShowEmployeeSelect(false);
            }
        } catch (error) {
            console.error('Error fetching attendances:', error);
            toast.error('Error fetching attendance records');
            setAttendances([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = () => {
        fetchAttendances();
    };

    const resetFilters = () => {
        setFilters({
            start_date: new Date(new Date().setDate(1)).toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
            user_id: ''
        });
        setTimeout(() => {
            fetchAttendances();
        }, 100);
    };

    const formatTime = (timeString) => {
        if (!timeString) return '-';
        return new Date(timeString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
    };

    const formatTotalHours = (hours) => {
        if (!hours) return '0h 0m';
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    };

    const showSelfie = (imagePath, type) => {
        if (imagePath) {
            setSelectedSelfie({
                url: `/storage/${imagePath}`,
                type: type
            });
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Present':
                return <span className="badge bg-success">Present</span>;
            case 'Absent':
                return <span className="badge bg-danger">Absent</span>;
            case 'Late':
                return <span className="badge bg-warning">Late</span>;
            case 'Half Day':
                return <span className="badge bg-info">Half Day</span>;
            default:
                return <span className="badge bg-secondary">{status}</span>;
        }
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
            <Pageheader mainheading="Attendance Management" parentfolder="HRMS" activepage="Attendance List" />
            
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    
                    {/* Summary Cards */}
                    <div className="row mb-4">
                        <div className="col-lg-3 col-md-6">
                            <div className="card bg-primary text-white">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h6 className="card-title text-white-50">Total Records</h6>
                                            <h3 className="mb-0">{summary.total_records}</h3>
                                        </div>
                                        <div className="align-self-center">
                                            <i className="fa fa-calendar fa-2x opacity-50"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="card bg-success text-white">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h6 className="card-title text-white-50">Present Days</h6>
                                            <h3 className="mb-0">{summary.present_days}</h3>
                                        </div>
                                        <div className="align-self-center">
                                            <i className="fa fa-check-circle fa-2x opacity-50"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="card bg-danger text-white">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h6 className="card-title text-white-50">Absent Days</h6>
                                            <h3 className="mb-0">{summary.absent_days}</h3>
                                        </div>
                                        <div className="align-self-center">
                                            <i className="fa fa-times-circle fa-2x opacity-50"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="card bg-info text-white">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h6 className="card-title text-white-50">Total Hours</h6>
                                            <h3 className="mb-0">{formatTotalHours(summary.total_hours)}</h3>
                                        </div>
                                        <div className="align-self-center">
                                            <i className="fa fa-clock fa-2x opacity-50"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center rounded-top">
                                    <span className="d-flex align-items-center">
                                        <i className="bi bi-list-ul me-2" style={{ fontSize: '1.3rem' }}></i>
                                        <h5 className="mb-0 fw-semibold">Attendance Records</h5>
                                    </span>
                                    <Link to="/hrms/attendance/add" className="btn btn-primary text-white d-flex align-items-center">
                                        <i className="fa fa-plus me-1"></i> Mark Attendance
                                    </Link>
                                </div>
                                
                                {/* Filters */}
                                <div className="card-body border-bottom">
                                    <div className="row">
                                        <div className="col-md-3">
                                            <label className="form-label">Start Date</label>
                                            <input
                                                type="date"
                                                name="start_date"
                                                value={filters.start_date}
                                                onChange={handleFilterChange}
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">End Date</label>
                                            <input
                                                type="date"
                                                name="end_date"
                                                value={filters.end_date}
                                                onChange={handleFilterChange}
                                                className="form-control"
                                            />
                                        </div>
                                        {showEmployeeSelect && (
                                            <div className="col-md-3 d-none">
                                                <label className="form-label">Employee</label>
                                                <select
                                                    name="user_id"
                                                    value={filters.user_id}
                                                    onChange={handleFilterChange}
                                                    className="form-control"
                                                >
                                                    <option value="">All Employees</option>
                                                    {Array.isArray(employees) && employees.map(employee => (
                                                        <option key={employee.id} value={employee.id}>
                                                            {employee.name} ({employee.emp_code})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        <div className="col-md-3 d-flex align-items-end gap-2">
                                            <button 
                                                className="btn btn-primary"
                                                onClick={handleSearch}
                                                disabled={loading}
                                            >
                                                <i className="fa fa-search me-1"></i>Search
                                            </button>
                                            <button 
                                                className="btn btn-outline-secondary"
                                                onClick={resetFilters}
                                            >
                                                <i className="fa fa-refresh me-1"></i>Reset
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body p-0">
                                    {loading ? (
                                        <div className="text-center p-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <p className="mt-2">Loading attendance records...</p>
                                        </div>
                                    ) : attendances.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-hover mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Employee</th>
                                                        <th>Check In</th>
                                                        <th>Check Out</th>
                                                        <th>Total Hours</th>
                                                        <th>Status</th>
                                                        <th>Location</th>
                                                        <th>Selfie</th>
                                                        <th>Notes</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {attendances.map((attendance, index) => (
                                                        <tr key={attendance.id}>
                                                            <td>{formatDate(attendance.date)}</td>
                                                            <td>
                                                                <div>
                                                                    <strong>{attendance.user?.name}</strong>
                                                                    {attendance.employee && (
                                                                        <div className="small text-muted">
                                                                            {attendance.employee.emp_code}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div>{formatTime(attendance.check_in)}</div>
                                                                {attendance.check_in_address && (
                                                                    <div className="small text-muted" title={attendance.check_in_address}>
                                                                        {attendance.check_in_address.substring(0, 30)}...
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <div>{formatTime(attendance.check_out)}</div>
                                                                {attendance.check_out_address && (
                                                                    <div className="small text-muted" title={attendance.check_out_address}>
                                                                        {attendance.check_out_address.substring(0, 30)}...
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <span className="badge bg-info">
                                                                    {attendance.formatted_total_hours || formatTotalHours(attendance.total_hours)}
                                                                </span>
                                                            </td>
                                                            <td>{getStatusBadge(attendance.status)}</td>
                                                            <td>
                                                                {attendance.check_in_latitude && attendance.check_in_longitude && (
                                                                    <button 
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        onClick={() => window.open(`https://maps.google.com/?q=${attendance.check_in_latitude},${attendance.check_in_longitude}`, '_blank')}
                                                                        title="View on Google Maps"
                                                                    >
                                                                        <i className="fa fa-map-marker-alt"></i>
                                                                    </button>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <div className="d-flex gap-1">
                                                                    {attendance.check_in_selfie && (
                                                                        <button 
                                                                            className="btn btn-sm btn-outline-success"
                                                                            onClick={() => showSelfie(attendance.check_in_selfie, 'Check In')}
                                                                            title="Check In Selfie"
                                                                        >
                                                                            <i className="fa fa-camera"></i> In
                                                                        </button>
                                                                    )}
                                                                    {attendance.check_out_selfie && (
                                                                        <button 
                                                                            className="btn btn-sm btn-outline-danger"
                                                                            onClick={() => showSelfie(attendance.check_out_selfie, 'Check Out')}
                                                                            title="Check Out Selfie"
                                                                        >
                                                                            <i className="fa fa-camera"></i> Out
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                {attendance.notes && (
                                                                    <button 
                                                                        className="btn btn-sm btn-outline-info"
                                                                        title={attendance.notes}
                                                                    >
                                                                        <i className="fa fa-sticky-note"></i>
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center p-4">
                                            <i className="fa fa-calendar-times fa-3x text-muted mb-3"></i>
                                            <h5 className="text-muted">No Attendance Records Found</h5>
                                            <p className="text-muted">No attendance records found for the selected criteria.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selfie Modal */}
            {selectedSelfie && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setSelectedSelfie(null)}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h5 className="modal-title">{selectedSelfie.type} Selfie</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setSelectedSelfie(null)}
                                ></button>
                            </div>
                            <div className="modal-body text-center">
                                <img 
                                    src={selectedSelfie.url} 
                                    alt={selectedSelfie.type} 
                                    className="img-fluid"
                                    style={{ maxHeight: '400px' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AttendanceList;
