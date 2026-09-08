import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pageheader from '../../layouts/Pageheader';

const EditDepartment = () => {
    const { id } = useParams();
    const [form, setForm] = useState({
        name: '',
        status: 1,
    });
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const apiService = ApiService();

    useEffect(() => {
        fetchDepartment();
    }, [id]);

    const fetchDepartment = async () => {
        try {
            setPageLoading(true);
            const res = await apiService.vGet(`/api/departments/${id}`);
            if (res.data && res.data.department) {
                setForm({
                    name: res.data.department.name || '',
                    status: res.data.department.status !== undefined && res.data.department.status !== null 
                        ? Number(res.data.department.status) : 1,
                });
            } else {
                toast.error('Department not found');
                navigate('/hrms/departments/list');
            }
        } catch (err) {
            toast.error('Failed to fetch department details');
            navigate('/hrms/departments/list');
        } finally {
            setPageLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: name === 'status' ? Number(value) : value
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
        if (!form.name) errs.name = 'Department name is required';
        if (form.name && form.name.length < 2) errs.name = 'Department name must be at least 2 characters';
        if (form.status === '' || form.status === null || form.status === undefined) errs.status = 'Status is required';
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
            const res = await apiService.vPut(`/api/departments/${id}`, form, true, true, 'put');
            if (res.data && res.data.status === 1) {
                toast.success('Department updated successfully');
                navigate('/hrms/departments/list');
            } else {
                if (res.data.error) {
                    Object.values(res.data.error).flat().forEach(msg => toast.error(msg));
                } else {
                    toast.error(res.data.message || 'Failed to update department');
                }
            }
        } catch (err) {
            if (err?.response?.data?.error) {
                Object.values(err.response.data.error).flat().forEach(msg => toast.error(msg));
            } else {
                toast.error(err?.response?.data?.message || 'Failed to update department');
            }
        }
        setLoading(false);
    };

    if (pageLoading) {
        return (
            <>
                <Pageheader mainheading="Department Management" parentfolder="HRMS" activepage="Edit Department" />
                <div className="page-content-box">
                    <div className="page-content-box-inner">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-body p-4 text-center">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-2">Loading department details...</p>
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
            <Pageheader mainheading="Department Management" parentfolder="HRMS" activepage="Edit Department" />
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center rounded-top">
                                    <span className="d-flex align-items-center">
                                        <i className="bi bi-building me-2" style={{ fontSize: '1.3rem' }}></i>
                                        <h5 className="mb-0 fw-semibold">Edit Department</h5>
                                    </span>
                                    <Link to="/hrms/departments/list" className="btn btn-primary text-white d-flex align-items-center">
                                        <i className="fa fa-list me-1"></i> Department List
                                    </Link>
                                </div>
                                <div className="card-body p-4">
                                    <form onSubmit={handleSubmit} className="row">
                                        <div className="mb-3 col-md-6">
                                            <label htmlFor="name" className="form-label">Department Name <span className="text-danger">*</span></label>
                                            <input 
                                                type="text" 
                                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                id="name"
                                                name="name" 
                                                value={form.name} 
                                                onChange={handleChange}
                                                placeholder="Enter department name"
                                            />
                                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                        </div>
                                        
                                        <div className="mb-3 col-md-6">
                                            <label htmlFor="status" className="form-label">Status <span className="text-danger">*</span></label>
                                            <select
                                                id="status"
                                                name="status"
                                                className={`form-select ${errors.status ? 'is-invalid' : ''}`}
                                                value={form.status}
                                                onChange={handleChange}
                                            >
                                                <option value={1}>Active</option>
                                                <option value={0}>Inactive</option>
                                            </select>
                                            {errors.status && <div className="invalid-feedback">{errors.status}</div>}
                                        </div>

                                        <div className="col-12">
                                            <div className="d-flex justify-content-end gap-2">
                                                <Link to="/hrms/departments/list" className="btn btn-secondary">
                                                    <i className="fa fa-times me-1"></i> Cancel
                                                </Link>
                                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                                    {loading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fa fa-save me-1"></i> Update Department
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

export default EditDepartment;
