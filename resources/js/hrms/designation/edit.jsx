import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pageheader from '../../layouts/Pageheader';

const EditDesignation = () => {
    const { id } = useParams();
    const [form, setForm] = useState({
        title: '',
        department_id: '',
    });
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [departmentsLoading, setDepartmentsLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const apiService = ApiService();

    useEffect(() => {
        fetchDesignation();
        fetchDepartments();
    }, [id]);

    const fetchDesignation = async () => {
        try {
            setPageLoading(true);
            const res = await apiService.vGet(`/api/designations/${id}`);
            if (res.data && res.data.designation) {
                setForm({
                    title: res.data.designation.title || '',
                    department_id: res.data.designation.department_id || '',
                });
            } else {
                toast.error('Designation not found');
                navigate('/hrms/designations/list');
            }
        } catch (err) {
            toast.error('Failed to fetch designation details');
            navigate('/hrms/designations/list');
        } finally {
            setPageLoading(false);
        }
    };

    const fetchDepartments = () => {
        setDepartmentsLoading(true);
        apiService.vGet(`/api/departments/active/list`).then(res => {
            setDepartments(res.data.departments || []);
            setDepartmentsLoading(false);
        }).catch(err => {
            toast.error('Failed to fetch departments');
            setDepartmentsLoading(false);
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: name === 'department_id' ? (value === '' ? '' : Number(value)) : value
        });
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validate = () => {
        const errs = {};
        if (!form.title) errs.title = 'Designation title is required';
        if (form.title && form.title.length < 2) errs.title = 'Designation title must be at least 2 characters';
        if (!form.department_id) errs.department_id = 'Department is required';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length > 0) {
            Object.values(errs).forEach(msg => toast.error(msg));
            return;
        }
        setLoading(true);
        try {
            const res = await apiService.vPut(`/api/designations/${id}`, form, true, true, 'put');
            if (res.data && res.data.status === 1) {
                toast.success('Designation updated successfully');
                navigate('/hrms/designations/list');
            } else {
                if (res.data.error) {
                    Object.values(res.data.error).flat().forEach(msg => toast.error(msg));
                } else {
                    toast.error(res.data.message || 'Failed to update designation');
                }
            }
        } catch (err) {
            if (err?.response?.data?.error) {
                Object.values(err.response.data.error).flat().forEach(msg => toast.error(msg));
            } else {
                toast.error(err?.response?.data?.message || 'Failed to update designation');
            }
        }
        setLoading(false);
    };

    if (pageLoading) {
        return (
            <>
                <Pageheader mainheading="Designation Management" parentfolder="HRMS" activepage="Edit Designation" />
                <div className="page-content-box">
                    <div className="page-content-box-inner">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-body p-4 text-center">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-2">Loading designation details...</p>
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
            <Pageheader mainheading="Designation Management" parentfolder="HRMS" activepage="Edit Designation" />
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center rounded-top">
                                    <span className="d-flex align-items-center">
                                        <i className="bi bi-person-badge me-2" style={{ fontSize: '1.3rem' }}></i>
                                        <h5 className="mb-0 fw-semibold">Edit Designation</h5>
                                    </span>
                                    <Link to="/hrms/designations/list" className="btn btn-primary text-white d-flex align-items-center">
                                        <i className="fa fa-list me-1"></i> Designation List
                                    </Link>
                                </div>
                                <div className="card-body p-4">
                                    <form onSubmit={handleSubmit} className="row">
                                        <div className="mb-3 col-md-6">
                                            <label htmlFor="title" className="form-label">Designation Title <span className="text-danger">*</span></label>
                                            <input 
                                                type="text" 
                                                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                                id="title"
                                                name="title" 
                                                value={form.title} 
                                                onChange={handleChange}
                                                placeholder="Enter designation title"
                                            />
                                            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                                        </div>
                                        
                                        <div className="mb-3 col-md-6">
                                            <label htmlFor="department_id" className="form-label">Department <span className="text-danger">*</span></label>
                                            <select
                                                id="department_id"
                                                name="department_id"
                                                className={`form-select ${errors.department_id ? 'is-invalid' : ''}`}
                                                value={form.department_id}
                                                onChange={handleChange}
                                                disabled={departmentsLoading}
                                            >
                                                <option value="">
                                                    {departmentsLoading ? 'Loading departments...' : 'Select Department'}
                                                </option>
                                                {departments.map(department => (
                                                    <option key={department.id} value={department.id}>
                                                        {department.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.department_id && <div className="invalid-feedback">{errors.department_id}</div>}
                                        </div>

                                        <div className="col-12">
                                            <div className="d-flex justify-content-end gap-2">
                                                <Link to="/hrms/designations/list" className="btn btn-secondary">
                                                    <i className="fa fa-times me-1"></i> Cancel
                                                </Link>
                                                <button type="submit" className="btn btn-primary" disabled={loading || departmentsLoading}>
                                                    {loading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fa fa-save me-1"></i> Update Designation
                                                        </>
                                                    )}
                                                </button>
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

export default EditDesignation;
