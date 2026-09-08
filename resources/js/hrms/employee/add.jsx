import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const AddEmployee = () => {
    const [formData, setFormData] = useState({
        // User fields
        name: '',
        email: '',
        mobile: '',
        password: '',
        password_confirmation: '',
        role_id: '',
        // Employee fields
        emp_code: '',
        department_id: '',
        designation_id: '',
        join_date: '',
        dob: '',
        gender: '',
        contact_no: '',
        address: '',
        emergency_contact: '',
        status: 1, // Default to true (Active)
    });

    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const apiService = ApiService();

    useEffect(() => {
        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        try {
            const response = await apiService.vGet('/api/employees/dropdown/data');
            
            if (response.data && response.data.status === 1) {
                const { roles, departments, designations } = response.data.data;
                
                // Ensure we always set arrays
                setRoles(Array.isArray(roles) ? roles : []);
                setDepartments(Array.isArray(departments) ? departments : []);
                setDesignations(Array.isArray(designations) ? designations : []);
            } else {
                // Fallback to individual API calls if dropdown endpoint fails
                const [rolesRes, departmentsRes, designationsRes] = await Promise.all([
                    apiService.vGet('/api/admin-roles'),
                    apiService.vGet('/api/departments'),
                    apiService.vGet('/api/designations')
                ]);

                setRoles(Array.isArray(rolesRes.data.roles) ? rolesRes.data.roles : 
                         Array.isArray(rolesRes.data) ? rolesRes.data : []);
                setDepartments(Array.isArray(departmentsRes.data.departments) ? departmentsRes.data.departments : 
                              Array.isArray(departmentsRes.data) ? departmentsRes.data : []);
                setDesignations(Array.isArray(designationsRes.data.designations) ? designationsRes.data.designations : 
                               Array.isArray(designationsRes.data) ? designationsRes.data : []);
            }
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            toast.error('Error fetching dropdown data');
            // Set empty arrays on error
            setRoles([]);
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
        
        // User validation
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.mobile) newErrors.mobile = 'Mobile number is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (!formData.password_confirmation) newErrors.password_confirmation = 'Password confirmation is required';
        if (formData.password !== formData.password_confirmation) newErrors.password_confirmation = 'Passwords do not match';
        if (!formData.role_id) newErrors.role_id = 'Role is required';
        
        // Employee validation
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
            return;
        }

        setLoading(true);
        try {
            const res = await apiService.vPost('/api/employees', formData, true, true);
            if (res.data && res.data.status === 1) {
                toast.success('Employee added successfully!');
                navigate('/hrms/employees/list');
            } else {
                // Handle server-side validation errors
                if (res.data.error) {
                    // Set server errors to state to display in form
                    setErrors(res.data.error);
                    // Also show toast messages
                    Object.values(res.data.error).flat().forEach(msg => toast.error(msg));
                } else {
                    toast.error(res.data.message || 'Failed to create employee');
                }
            }
        } catch (error) {
            console.error('Error adding employee:', error);
            if (error?.response?.data?.errors) {
                // Set server errors to state to display in form
                setErrors(error.response.data.errors);
                // Also show toast messages
                Object.values(error.response.data.errors).flat().forEach(msg => toast.error(msg));
            } else if (error?.response?.data?.error) {
                // Handle the specific error format you showed
                setErrors(error.response.data.error);
                Object.values(error.response.data.error).flat().forEach(msg => toast.error(msg));
            } else {
                toast.error(error?.response?.data?.message || 'Error adding employee. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
            <Pageheader mainheading="Employee Management" parentfolder="HRMS" activepage="Create Employee" />
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center rounded-top">
                                    <span className="d-flex align-items-center">
                                        <i className="bi bi-person-plus me-2" style={{ fontSize: '1.3rem' }}></i>
                                        <h5 className="mb-0 fw-semibold">Add New Employee</h5>
                                    </span>
                                    <Link to="/hrms/employees/list" className="btn btn-primary text-white d-flex align-items-center">
                                        <i className="fa fa-list me-1"></i> Employee List
                                    </Link>
                                </div>
                                <div className="card-body p-4">
                                    <form onSubmit={handleSubmit} className="row">
                                        
                                        {/* User Information Section */}
                                        <div className="col-12 mb-4">
                                            <h6 className="text-primary border-bottom pb-2 mb-3">
                                                <i className="fa fa-user me-2"></i>User Information
                                            </h6>
                                        </div>

                                        {/* Name */}
                                        <div className="mb-3 col-md-3">
                                            <label>Full Name <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                placeholder="Enter full name"
                                            />
                                            {errors.name && <div className="text-danger mt-1 small">{errors.name}</div>}
                                        </div>

                                        {/* mobile */}
                                        <div className="mb-3 col-md-3">
                                            <label>Mobile <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                name="mobile"
                                                value={formData.mobile}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.mobile ? 'is-invalid' : ''}`}
                                                placeholder="Enter mobile number"
                                            />
                                            {errors.mobile && <div className="text-danger mt-1 small">{errors.mobile}</div>}
                                        </div>
                                        {/* Email */}
                                        <div className="mb-3 col-md-3">
                                            <label>Email <span className="text-danger">*</span></label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                placeholder="Enter email address"
                                            />
                                            {errors.email && <div className="text-danger mt-1 small">{errors.email}</div>}
                                        </div>

                                        {/* Password */}
                                        <div className="mb-3 col-md-3">
                                            <label>Password <span className="text-danger">*</span></label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                                placeholder="Enter password"
                                            />
                                            {errors.password && <div className="text-danger mt-1 small">{errors.password}</div>}
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="mb-3 col-md-3">
                                            <label>Confirm Password <span className="text-danger">*</span></label>
                                            <input
                                                type="password"
                                                name="password_confirmation"
                                                value={formData.password_confirmation}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.password_confirmation ? 'is-invalid' : ''}`}
                                                placeholder="Confirm password"
                                            />
                                            {errors.password_confirmation && <div className="text-danger mt-1 small">{errors.password_confirmation}</div>}
                                        </div>

                                        {/* Role Dropdown */}
                                        <div className="mb-3 col-md-3">
                                            <label>Role <span className="text-danger">*</span></label>
                                            <select
                                                name="role_id"
                                                value={formData.role_id}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.role_id ? 'is-invalid' : ''}`}
                                            >
                                                <option value="">Select Role</option>
                                                {Array.isArray(roles) && roles.map(role => (
                                                    <option key={role.id} value={role.id}>
                                                        {role.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.role_id && <div className="text-danger mt-1 small">{errors.role_id}</div>}
                                        </div>

                                        {/* Employee Information Section */}
                                        <div className="col-12 mb-4 mt-4">
                                            <h6 className="text-primary border-bottom pb-2 mb-3">
                                                <i className="fa fa-id-card me-2"></i>Employee Information
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
                                                className={`form-control ${errors.emp_code ? 'is-invalid' : ''}`}
                                                placeholder="Enter employee code"
                                            />
                                            {errors.emp_code && <div className="text-danger mt-1 small">{errors.emp_code}</div>}
                                        </div>

                                        {/* Department Dropdown */}
                                        <div className="mb-3 col-md-3">
                                            <label>Department <span className="text-danger">*</span></label>
                                            <select
                                                name="department_id"
                                                value={formData.department_id}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.department_id ? 'is-invalid' : ''}`}
                                            >
                                                <option value="">Select Department</option>
                                                {Array.isArray(departments) && departments.map(dept => (
                                                    <option key={dept.id} value={dept.id}>
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.department_id && <div className="text-danger mt-1 small">{errors.department_id}</div>}
                                        </div>

                                        {/* Designation Dropdown */}
                                        <div className="mb-3 col-md-3">
                                            <label>Designation <span className="text-danger">*</span></label>
                                            <select
                                                name="designation_id"
                                                value={formData.designation_id}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.designation_id ? 'is-invalid' : ''}`}
                                            >
                                                <option value="">Select Designation</option>
                                                {Array.isArray(designations) && designations.map(designation => (
                                                    <option key={designation.id} value={designation.id}>
                                                        {designation.name || designation.title}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.designation_id && <div className="text-danger mt-1 small">{errors.designation_id}</div>}
                                        </div>

                                        {/* Join Date */}
                                        <div className="mb-3 col-md-3">
                                            <label>Join Date <span className="text-danger">*</span></label>
                                            <input
                                                type="date"
                                                name="join_date"
                                                value={formData.join_date}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.join_date ? 'is-invalid' : ''}`}
                                            />
                                            {errors.join_date && <div className="text-danger mt-1 small">{errors.join_date}</div>}
                                        </div>

                                        {/* Date of Birth */}
                                        <div className="mb-3 col-md-3">
                                            <label>Date of Birth</label>
                                            <input
                                                type="date"
                                                name="dob"
                                                value={formData.dob}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.dob ? 'is-invalid' : ''}`}
                                            />
                                            {errors.dob && <div className="text-danger mt-1 small">{errors.dob}</div>}
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
                                                {loading ? 'Creating...' : 'Create Employee'}
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

export default AddEmployee;
