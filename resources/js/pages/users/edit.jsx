import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { notify } from '../../core/messages/Toast';
import Pageheader from '../../layouts/Pageheader';

const EditUser = () => {
    const { id } = useParams();
    const [form, setForm] = useState({
        mobile: '',
        email: '',
        name: '',
        role: '',
        aadhar_number: '',
        refer_by: '',
        status: '1', // Default status set to Active
    });
    const [roles, setRoles] = useState([]);
    const [referName, setReferName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const apiService = ApiService();

    useEffect(() => {
        apiService.vGet(`/api/users/${id}`).then(res => {
            if (res.data && res.data.user) {
                setForm({
                    mobile: res.data.user.mobile || '',
                    email: res.data.user.email || '',
                    name: res.data.user.name || '',
                    role: res.data.user.role || '',
                    aadhar_number: res.data.user.aadhar_number || '',
                    refer_by: res.data.user.refer_by || '',
                    status: res.data.user.status !== undefined && res.data.user.status !== null ? Number(res.data.user.status) : 1,
                });
            }
        });
        apiService.vGet('/api/roles').then(res => {
            setRoles(res.data.roles || []);
        });
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: name === 'status' ? Number(value) : value
        });
        if (name === 'refer_by') {
            setReferName('');
        }
    };

    const handleReferCheck = async () => {
        if (!form.refer_by) return;
        try {
            const res = await apiService.vPost('/api/check-refer', form, true, true);
            if (res.data && res.data.status === 1 && res.data.user) {
                setReferName(res.data.user.name || '');
            } else {
                setReferName('');
                notify.error(res.data.message || 'Refer ID not found');
            }
        } catch (err) {
            setReferName('');
            const errorMsg = err?.response?.data?.message || 'Refer ID not found';
            if (err?.response?.data?.error) {
                Object.values(err.response.data.error).flat().forEach(msg => notify.error(msg));
            } else {
                notify.error(errorMsg);
            }
        }
    };

    const validate = () => {
        const errs = {};
        if (!form.mobile) errs.mobile = 'Mobile is required';
        if (!form.name) errs.name = 'Name is required';
        if (!form.role) errs.role = 'Role is required';
        if (form.status === '' || form.status === null || form.status === undefined) errs.status = 'Status is required';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length > 0) {
            Object.values(errs).forEach(msg => notify.error(msg));
            return;
        }
        setLoading(true);
        try {
            const res = await apiService.vPost(`/api/users/${id}`, form, true, true, 'put');
            if (res.data && res.data.status === 1) {
                navigate('/users/list');
            } else {
                if (res.data.error) {
                    Object.values(res.data.error).flat().forEach(msg => notify.error(msg));
                } else {
                    notify.error(res.data.message || 'Failed to update user');
                }
            }
        } catch (err) {
            if (err?.response?.data?.error) {
                Object.values(err.response.data.error).flat().forEach(msg => notify.error(msg));
            } else {
                notify.error(err?.response?.data?.message || 'Failed to update user');
            }
        }
        setLoading(false);
    };

    return (
        <>
            <Pageheader mainheading="Users Master" parentfolder="Users" activepage="Edit" />
            <div className="page-content-box">
            <div className="page-content-box-inner">
                <div className="row">

                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center rounded-top">
                                <span className="d-flex align-items-center">
                                    <i className="bi bi-person-badge me-2" style={{ fontSize: '1.3rem' }}></i>
                                    <h5 className="mb-0 fw-semibold">Edit User</h5>
                                </span>
                                <Link to="/users/list" className="btn btn-primary text-white d-flex align-items-center">
                                    <i className="fa fa-list me-1"></i> User List
                                </Link>
                            </div>
                            <div className="card-body p-4">
                                <form onSubmit={handleSubmit} className='row'>
                                    <div className="mb-3 col-md-3">
                                        <label>Mobile</label>
                                        <input type="text" className="form-control" name="mobile" value={form.mobile} onChange={handleChange} />
                                        {errors.mobile && <div className="text-danger">{errors.mobile}</div>}
                                    </div>
                                    <div className="mb-3 col-md-3">
                                        <label>Email</label>
                                        <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} />
                                    </div>
                                    <div className="mb-3 col-md-3">
                                        <label>Name</label>
                                        <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} />
                                        {errors.name && <div className="text-danger">{errors.name}</div>}
                                    </div>
                                    <div className="mb-3 col-md-3">
                                        <label>Role</label>
                                        <select className="form-control" name="role" value={form.role} onChange={handleChange}>
                                            <option value="">Select Role</option>
                                            {roles.map(role => (
                                                <option key={role.id} value={role.id}>{role.name}</option>
                                            ))}
                                        </select>
                                        {errors.role && <div className="text-danger">{errors.role}</div>}
                                    </div>
                                    <div className="mb-3 col-md-3">
                                        <label>Aadhar Number</label>
                                        <input type="text" className="form-control" name="aadhar_number" value={form.aadhar_number} onChange={handleChange} />
                                        {errors.aadhar_number && <div className="text-danger">{errors.aadhar_number}</div>}
                                    </div>
                                    <div className="mb-3 d-none">
                                        <label>Refer By (MID)</label>
                                        <div className="d-flex align-items-center">
                                            <input type="text" className="form-control" name="refer_by" value={form.refer_by} onChange={handleChange} onBlur={handleReferCheck} />
                                            {referName && <span className="ms-2">{referName}</span>}
                                        </div>
                                        {errors.refer_by && <div className="text-danger">{errors.refer_by}</div>}
                                    </div>

                                    <div className="mb-3 col-md-3">
                                        <label >Status</label>
                                        <select
                                            id="status"
                                            name="status"
                                            className="form-select"
                                            value={form.status}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value={1}>Active</option>
                                            <option value={0}>Not Active</option>
                                        </select>
                                        {errors.status && <div className="text-danger">{errors.status}</div>}
                                    </div>

                                    <button type="submit" className="btn btn-primary w-100 text-white" disabled={loading}>Update</button>
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

export default EditUser;
