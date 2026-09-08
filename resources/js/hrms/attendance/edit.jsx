import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const EditAttendance = () => {
    const [formData, setFormData] = useState({
        date: '',
        check_in: '',
        check_out: '',
        status: 'Present',
        notes: '',
        user_id: ''
    });
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [errors, setErrors] = useState({});
    const [attendance, setAttendance] = useState(null);
    
    const navigate = useNavigate();
    const { id } = useParams();
    const apiService = ApiService();

    useEffect(() => {
        fetchEmployees();
        if (id) {
            fetchAttendance();
        }
    }, [id]);

    const fetchEmployees = async () => {
        try {
            const response = await apiService.vGet('/api/attendance/employees');
            if (response.data && response.data.status === 1) {
                setEmployees(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchAttendance = async () => {
        setLoadingData(true);
        try {
            const response = await apiService.vGet(`/api/attendance/${id}`);
            if (response.data && response.data.status === 1) {
                const data = response.data.data;
                setAttendance(data);
                setFormData({
                    date: data.date,
                    check_in: data.check_in ? new Date(data.check_in).toISOString().slice(0, 16) : '',
                    check_out: data.check_out ? new Date(data.check_out).toISOString().slice(0, 16) : '',
                    status: data.status || 'Present',
                    notes: data.notes || '',
                    user_id: data.user_id
                });
            } else {
                toast.error('Attendance record not found');
                navigate('/hrms/attendance/list');
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
            toast.error('Error fetching attendance record');
            navigate('/hrms/attendance/list');
        } finally {
            setLoadingData(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.user_id) newErrors.user_id = 'Employee is required';
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.status) newErrors.status = 'Status is required';
        
        if (formData.check_in && formData.check_out) {
            const checkIn = new Date(formData.check_in);
            const checkOut = new Date(formData.check_out);
            if (checkOut <= checkIn) {
                newErrors.check_out = 'Check out time must be after check in time';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                check_in: formData.check_in ? new Date(formData.check_in).toISOString() : null,
                check_out: formData.check_out ? new Date(formData.check_out).toISOString() : null
            };

            const response = await apiService.vPut(`/api/attendance/${id}`, payload, true, true);
            
            if (response.data && response.data.status === 1) {
                toast.success('Attendance updated successfully!');
                navigate('/hrms/attendance/list');
            } else {
                if (response.data.error) {
                    setErrors(response.data.error);
                    Object.values(response.data.error).flat().forEach(msg => toast.error(msg));
                } else {
                    toast.error(response.data.message || 'Failed to update attendance');
                }
            }
        } catch (error) {
            console.error('Error updating attendance:', error);
            if (error?.response?.data?.errors) {
                setErrors(error.response.data.errors);
                Object.values(error.response.data.errors).flat().forEach(msg => toast.error(msg));
            } else if (error?.response?.data?.error) {
                setErrors(error.response.data.error);
                Object.values(error.response.data.error).flat().forEach(msg => toast.error(msg));
            } else {
                toast.error(error?.response?.data?.message || 'Error updating attendance. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return '-';
        return new Date(timeString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const calculateHours = () => {
        if (formData.check_in && formData.check_out) {
            const checkIn = new Date(formData.check_in);
            const checkOut = new Date(formData.check_out);
            const diff = checkOut - checkIn;
            const hours = diff / (1000 * 60 * 60);
            return hours > 0 ? hours.toFixed(2) : 0;
        }
        return 0;
    };

    if (loadingData) {
        return (
            <>
                <Pageheader mainheading="Attendance Management" parentfolder="HRMS" activepage="Edit Attendance" />
                <div className="page-content-box">
                    <div className="page-content-box-inner">
                        <div className="text-center p-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading attendance record...</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
            <Pageheader mainheading="Attendance Management" parentfolder="HRMS" activepage="Edit Attendance" />
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center rounded-top">
                                    <span className="d-flex align-items-center">
                                        <i className="bi bi-pencil-square me-2" style={{ fontSize: '1.3rem' }}></i>
                                        <h5 className="mb-0 fw-semibold">Edit Attendance</h5>
                                    </span>
                                    <Link to="/hrms/attendance/list" className="btn btn-primary text-white d-flex align-items-center">
                                        <i className="fa fa-list me-1"></i> Attendance List
                                    </Link>
                                </div>
                                <div className="card-body p-4">
                                    
                                    {/* Current Attendance Info */}
                                    {attendance && (
                                        <div className="alert alert-info mb-4">
                                            <h6 className="mb-2">Current Attendance Information</h6>
                                            <div className="row">
                                                <div className="col-md-3">
                                                    <strong>Employee:</strong> {attendance.user?.name}
                                                </div>
                                                <div className="col-md-3">
                                                    <strong>Date:</strong> {new Date(attendance.date).toLocaleDateString()}
                                                </div>
                                                <div className="col-md-3">
                                                    <strong>Check In:</strong> {formatTime(attendance.check_in)}
                                                </div>
                                                <div className="col-md-3">
                                                    <strong>Check Out:</strong> {formatTime(attendance.check_out)}
                                                </div>
                                            </div>
                                            {attendance.check_in_address && (
                                                <div className="mt-2">
                                                    <strong>Check In Location:</strong> {attendance.check_in_address}
                                                </div>
                                            )}
                                            {attendance.check_out_address && (
                                                <div className="mt-1">
                                                    <strong>Check Out Location:</strong> {attendance.check_out_address}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="row">
                                        
                                        {/* Employee Selection */}
                                        <div className="mb-3 col-md-6">
                                            <label>Employee <span className="text-danger">*</span></label>
                                            <select
                                                name="user_id"
                                                value={formData.user_id}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.user_id ? 'is-invalid' : ''}`}
                                            >
                                                <option value="">Select Employee</option>
                                                {employees.map(employee => (
                                                    <option key={employee.id} value={employee.id}>
                                                        {employee.name} ({employee.emp_code})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.user_id && <div className="text-danger mt-1 small">{errors.user_id}</div>}
                                        </div>

                                        {/* Date */}
                                        <div className="mb-3 col-md-6">
                                            <label>Date <span className="text-danger">*</span></label>
                                            <input
                                                type="date"
                                                name="date"
                                                value={formData.date}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.date ? 'is-invalid' : ''}`}
                                            />
                                            {errors.date && <div className="text-danger mt-1 small">{errors.date}</div>}
                                        </div>

                                        {/* Check In Time */}
                                        <div className="mb-3 col-md-6">
                                            <label>Check In Time</label>
                                            <input
                                                type="datetime-local"
                                                name="check_in"
                                                value={formData.check_in}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.check_in ? 'is-invalid' : ''}`}
                                            />
                                            {errors.check_in && <div className="text-danger mt-1 small">{errors.check_in}</div>}
                                        </div>

                                        {/* Check Out Time */}
                                        <div className="mb-3 col-md-6">
                                            <label>Check Out Time</label>
                                            <input
                                                type="datetime-local"
                                                name="check_out"
                                                value={formData.check_out}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.check_out ? 'is-invalid' : ''}`}
                                            />
                                            {errors.check_out && <div className="text-danger mt-1 small">{errors.check_out}</div>}
                                        </div>

                                        {/* Status */}
                                        <div className="mb-3 col-md-6">
                                            <label>Status <span className="text-danger">*</span></label>
                                            <select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.status ? 'is-invalid' : ''}`}
                                            >
                                                <option value="Present">Present</option>
                                                <option value="Absent">Absent</option>
                                                <option value="Late">Late</option>
                                                <option value="Half Day">Half Day</option>
                                                <option value="On Leave">On Leave</option>
                                            </select>
                                            {errors.status && <div className="text-danger mt-1 small">{errors.status}</div>}
                                        </div>

                                        {/* Calculated Hours */}
                                        <div className="mb-3 col-md-6">
                                            <label>Total Hours (Calculated)</label>
                                            <input
                                                type="text"
                                                value={`${calculateHours()} hours`}
                                                className="form-control"
                                                readOnly
                                            />
                                        </div>

                                        {/* Notes */}
                                        <div className="mb-3 col-12">
                                            <label>Notes</label>
                                            <textarea
                                                name="notes"
                                                value={formData.notes}
                                                onChange={handleInputChange}
                                                rows="4"
                                                className="form-control"
                                                placeholder="Add any notes about this attendance record..."
                                            />
                                        </div>

                                        {/* Selfie Preview */}
                                        {(attendance?.check_in_selfie || attendance?.check_out_selfie) && (
                                            <div className="col-12 mb-4">
                                                <h6 className="border-bottom pb-2 mb-3">
                                                    <i className="fa fa-camera me-2"></i>Selfie Records
                                                </h6>
                                                <div className="row">
                                                    {attendance.check_in_selfie && (
                                                        <div className="col-md-6">
                                                            <div className="card">
                                                                <div className="card-header">
                                                                    <h6 className="mb-0">Check In Selfie</h6>
                                                                </div>
                                                                <div className="card-body text-center">
                                                                    <img 
                                                                        src={`/storage/${attendance.check_in_selfie}`}
                                                                        alt="Check In Selfie"
                                                                        className="img-fluid"
                                                                        style={{ maxHeight: '200px', borderRadius: '8px' }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {attendance.check_out_selfie && (
                                                        <div className="col-md-6">
                                                            <div className="card">
                                                                <div className="card-header">
                                                                    <h6 className="mb-0">Check Out Selfie</h6>
                                                                </div>
                                                                <div className="card-body text-center">
                                                                    <img 
                                                                        src={`/storage/${attendance.check_out_selfie}`}
                                                                        alt="Check Out Selfie"
                                                                        className="img-fluid"
                                                                        style={{ maxHeight: '200px', borderRadius: '8px' }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="col-12">
                                            <div className="d-flex gap-3">
                                                <button 
                                                    type="submit" 
                                                    className="btn btn-success flex-fill" 
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fa fa-save me-2"></i>Update Attendance
                                                        </>
                                                    )}
                                                </button>
                                                <Link 
                                                    to="/hrms/attendance/list" 
                                                    className="btn btn-secondary flex-fill"
                                                >
                                                    <i className="fa fa-times me-2"></i>Cancel
                                                </Link>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditAttendance;
