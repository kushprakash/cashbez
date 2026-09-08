import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const EditEmployee = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const apiService = ApiService();
    
    const [formData, setFormData] = useState({
        emp_code: '',
        department_id: '',
        designation_id: '',
        join_date: '',
        dob: '',
        gender: '',
        contact_no: '',
        address: '',
        emergency_contact: '',
        status: 1
    });

    const [employee, setEmployee] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchEmployee();
        fetchDropdownData();
    }, [id]);

    const fetchEmployee = async () => {
        try {
            const response = await apiService.vGet(`/api/employees/${id}`);
            const employeeData = response.data.data || response.data;
            
            setEmployee(employeeData);
            setFormData({
                emp_code: employeeData.emp_code || '',
                department_id: employeeData.department_id || '',
                designation_id: employeeData.designation_id || '',
                join_date: employeeData.join_date || '',
                dob: employeeData.dob || '',
                gender: employeeData.gender || '',
                contact_no: employeeData.contact_no || '',
                address: employeeData.address || '',
                emergency_contact: employeeData.emergency_contact || '',
                status: employeeData.status || 'Active'
            });
        } catch (error) {
            console.error('Error fetching employee:', error);
            toast.error('Error fetching employee data. Please try again.');
            navigate('/hrms/employees/list');
        } finally {
            setPageLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const response = await apiService.vGet('/api/employees/dropdown/data');
            
            if (response.data && response.data.status === 1) {
                const { departments, designations } = response.data.data;
                setDepartments(Array.isArray(departments) ? departments : []);
                setDesignations(Array.isArray(designations) ? designations : []);
            } else {
                // Fallback to individual API calls
                const [departmentsRes, designationsRes] = await Promise.all([
                    apiService.vGet('/api/departments'),
                    apiService.vGet('/api/designations')
                ]);
                
                setDepartments(departmentsRes.data.data || departmentsRes.data || []);
                setDesignations(designationsRes.data.data || designationsRes.data || []);
            }
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            toast.error('Error fetching dropdown data');
            setDepartments([]);
            setDesignations([]);
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
        
        if (!formData.emp_code) newErrors.emp_code = 'Employee code is required';
        if (!formData.department_id) newErrors.department_id = 'Department is required';
        if (!formData.designation_id) newErrors.designation_id = 'Designation is required';
        if (!formData.join_date) newErrors.join_date = 'Join date is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            Object.values(errors).forEach(msg => toast.error(msg));
            return;
        }

        setLoading(true);
        try {
            const res = await apiService.vPut(`/api/employees/${id}`, formData, true, true);
            if (res.data && res.data.status === 1) {
                toast.success('Employee updated successfully!');
                navigate('/hrms/employees/list');
            } else {
                if (res.data.error) {
                    Object.values(res.data.error).flat().forEach(msg => toast.error(msg));
                } else {
                    toast.error(res.data.message || 'Failed to update employee');
                }
            }
        } catch (error) {
            console.error('Error updating employee:', error);
            if (error?.response?.data?.errors) {
                Object.values(error.response.data.errors).flat().forEach(msg => toast.error(msg));
            } else {
                toast.error(error?.response?.data?.message || 'Error updating employee. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <>
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
                <Pageheader mainheading="Employee Management" parentfolder="HRMS" activepage="Edit Employee" />
                <div className="page-content-box">
                    <div className="page-content-box-inner">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-body text-center">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-2">Loading employee data...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
            <Pageheader mainheading="Employee Management" parentfolder="HRMS" activepage="Edit Employee" />
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center rounded-top">
                                    <span className="d-flex align-items-center">
                                        <i className="bi bi-person-gear me-2" style={{ fontSize: '1.3rem' }}></i>
                                        <h5 className="mb-0 fw-semibold">Edit Employee</h5>
                                    </span>
                                    <Link to="/hrms/employees/list" className="btn btn-primary text-white d-flex align-items-center">
                                        <i className="fa fa-list me-1"></i> Employee List
                                    </Link>
                                </div>
                                <div className="card-body p-4">
                                    {employee && (
                                        <div className="row mb-4">
                                            <div className="col-12">
                                                <div className="alert alert-info">
                                                    <h6 className="text-info mb-2">
                                                        <i className="fa fa-info-circle me-2"></i>Employee Information
                                                    </h6>
                                                    <p className="mb-1"><strong>Name:</strong> {employee.user?.name}</p>
                                                    <p className="mb-1"><strong>Email:</strong> {employee.user?.email}</p>
                                                    <p className="mb-0"><strong>Employee Code:</strong> {employee.emp_code}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <form onSubmit={handleSubmit} className="row">
                                        
                                        {/* Employee Information Section */}
                                        <div className="col-12 mb-4">
                                            <h6 className="text-primary border-bottom pb-2 mb-3">
                                                <i className="fa fa-id-card me-2"></i>Update Employee Information
                                            </h6>
                                        </div>

                                        {/* Employee Code */}
                                        <div className="mb-3 col-md-3">
                                            <label>Employee Code <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                name="emp_code"
                                                value={formData.emp_code}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                placeholder="Enter employee code"
                                            />
                                            {errors.emp_code && <div className="text-danger">{errors.emp_code}</div>}
                                        </div>

                                        {/* Department Dropdown */}
                                        <div className="mb-3 col-md-3">
                                            <label>Department <span className="text-danger">*</span></label>
                                            <select
                                                name="department_id"
                                                value={formData.department_id}
                                                onChange={handleInputChange}
                                                className="form-control"
                                            >
                                                <option value="">Select Department</option>
                                                {Array.isArray(departments) && departments.map(dept => (
                                                    <option key={dept.id} value={dept.id}>
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.department_id && <div className="text-danger">{errors.department_id}</div>}
                                        </div>

                                        {/* Designation Dropdown */}
                                        <div className="mb-3 col-md-3">
                                            <label>Designation <span className="text-danger">*</span></label>
                                            <select
                                                name="designation_id"
                                                value={formData.designation_id}
                                                onChange={handleInputChange}
                                                className="form-control"
                                            >
                                                <option value="">Select Designation</option>
                                                {Array.isArray(designations) && designations.map(designation => (
                                                    <option key={designation.id} value={designation.id}>
                                                        {designation.name || designation.title}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.designation_id && <div className="text-danger">{errors.designation_id}</div>}
                                        </div>

                                        {/* Join Date */}
                                        <div className="mb-3 col-md-3">
                                            <label>Join Date <span className="text-danger">*</span></label>
                                            <input
                                                type="date"
                                                name="join_date"
                                                value={formData.join_date}
                                                onChange={handleInputChange}
                                                className="form-control"
                                            />
                                            {errors.join_date && <div className="text-danger">{errors.join_date}</div>}
                                        </div>

                                        {/* Date of Birth */}
                                        <div className="mb-3 col-md-3">
                                            <label>Date of Birth</label>
                                            <input
                                                type="date"
                                                name="dob"
                                                value={formData.dob}
                                                onChange={handleInputChange}
                                                className="form-control"
                                            />
                                        </div>

                                        {/* Gender */}
                                        <div className="mb-3 col-md-3">
                                            <label>Gender</label>
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleInputChange}
                                                className="form-control"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        {/* Contact Number */}
                                        <div className="mb-3 col-md-3">
                                            <label>Contact Number</label>
                                            <input
                                                type="tel"
                                                name="contact_no"
                                                value={formData.contact_no}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                placeholder="Enter contact number"
                                            />
                                        </div>

                                        {/* Status */}
                                        <div className="mb-3 col-md-3">
                                            <label>Status</label>
                                            <select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                className="form-control"
                                            >
                                                <option value={1}>Active</option>
                                                <option value={0}>Inactive</option>
                                            </select>
                                        </div>

                                        {/* Address */}
                                        <div className="mb-3 col-md-6">
                                            <label>Address</label>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                rows="3"
                                                className="form-control"
                                                placeholder="Enter address"
                                            />
                                        </div>

                                        {/* Emergency Contact */}
                                        <div className="mb-3 col-md-6">
                                            <label>Emergency Contact</label>
                                            <textarea
                                                name="emergency_contact"
                                                value={formData.emergency_contact}
                                                onChange={handleInputChange}
                                                rows="3"
                                                className="form-control"
                                                placeholder="Enter emergency contact details"
                                            />
                                        </div>

                                        <div className="col-12">
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary w-100 text-white" 
                                                disabled={loading}
                                            >
                                                {loading ? 'Updating...' : 'Update Employee'}
                                            </button>
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

export default EditEmployee;
