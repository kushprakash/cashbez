import React, { useState, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pageheader from '../../layouts/Pageheader';

const SubscriptionMasterAdd = () => {
    const [form, setForm] = useState({
        main_module_id: '',
        module_id: '',
        sub_module_id: '',
        duration: '',
        duration_type: '',
        descriptions: [''], // Array for multiple descriptions
        price: '',
        status: 1,
    });
    const [mainModules, setMainModules] = useState([]);
    const [modules, setModules] = useState([]);
    const [subModules, setSubModules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const apiService = ApiService();
    const [success, setSuccess] = useState(false);
    useEffect(() => {
        // Fetch main modules on component mount
        apiService.vGet('/api/main-modules').then(res => {
            setMainModules(res.data.modules || []);
        });
    }, []);

    // Fetch modules when main_module_id changes
    useEffect(() => {
        if (form.main_module_id) {
            apiService.vGet(`/api/modules?main_module_id=${form.main_module_id}`).then(res => {
                setModules(res.data.modules || []);
                // Reset module and sub_module when main module changes
                setForm(prev => ({ ...prev, module_id: '', sub_module_id: '' }));
                setSubModules([]);
            });
        } else {
            setModules([]);
            setSubModules([]);
        }
    }, [form.main_module_id]);

    // Fetch sub modules when module_id changes
    useEffect(() => {
        if (form.module_id) {
            apiService.vGet(`/api/sub-modules?module_id=${form.module_id}`).then(res => {
                setSubModules(res.data.submodules || []);
                // Reset sub_module when module changes
                setForm(prev => ({ ...prev, sub_module_id: '' }));
            });
        } else {
            setSubModules([]);
        }
    }, [form.module_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: name === 'status' ? Number(value) : value
        });
    };

    const handleDescriptionChange = (idx, value) => {
        const newDescriptions = [...form.descriptions];
        newDescriptions[idx] = value;
        setForm({ ...form, descriptions: newDescriptions });
    };

    const handleAddDescription = () => {
        setForm({ ...form, descriptions: [...form.descriptions, ''] });
    };

    const handleRemoveDescription = (idx) => {
        const newDescriptions = form.descriptions.filter((_, i) => i !== idx);
        setForm({ ...form, descriptions: newDescriptions });
    };

    const validate = () => {
        const errs = {};
        if (!form.main_module_id) errs.main_module_id = 'Main Module is required';
        if (!form.module_id) errs.module_id = 'Module is required';
        if (!form.duration) errs.duration = 'Duration is required';
        if (!form.duration_type) errs.duration_type = 'Duration type is required';
        if (!form.descriptions || form.descriptions.length === 0 || form.descriptions.some(d => !d.trim())) errs.descriptions = 'At least one description is required';
        if (!form.price) errs.price = 'Price is required';
        if (form.status === '' || form.status === null || form.status === undefined) errs.status = 'Status is required';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        setSuccess(false);
        setErrors(errs);
        if (Object.keys(errs).length > 0) {
            Object.values(errs).forEach(msg => toast.error(msg));
            return;
        }
        setLoading(true);
        // Convert descriptions array to comma-separated string for backend
        const submitData = {
            ...form,
            description: form.descriptions.filter(d => d.trim()).join(','),
        };
        delete submitData.descriptions;
        try {
            const res = await apiService.vPost('/api/subscription-masters', submitData, true, true);
            if (res.data && res.data.status === 1) {
                toast.success(res.data.message || 'Subscription created successfully');
                setSuccess(true);
            } else {
                if (res.data.error) {
                    Object.values(res.data.error).flat().forEach(msg => toast.error(msg));
                } else {
                    toast.error(res.data.message || 'Failed to create subscription');
                }
            }
        } catch (err) {
            if (err?.response?.data?.error) {
                Object.values(err.response.data.error).flat().forEach(msg => toast.error(msg));
            } else {
                toast.error(err?.response?.data?.message || 'Failed to create subscription');
            }
        }
        setLoading(false);
    };

    return (
        <>
            <Pageheader mainheading="Subscription Master" parentfolder="Subscription Plans" activepage="Create" />
            <ToastContainer position="top-right" autoClose={5000} />
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row">

                        <div className="col-md-12">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center rounded-top">
                                    <span className="d-flex align-items-center">
                                        <i className="fa fa-cubes me-2"></i>
                                        <h5 className="mb-0 fw-semibold">Create Subscription Master</h5>
                                    </span>
                                    <Link to="/subscription-master/list" className="btn btn-primary text-white d-flex align-items-center">
                                        <i className="fa fa-list me-1"></i> List
                                    </Link>
                                </div>
                                <div className="card-body p-4">
                                    <form onSubmit={handleSubmit} className="row">
                                        <div className="mb-3 col-md-4">
                                            <label>Main Module</label>
                                            <select className="form-control" name="main_module_id" value={form.main_module_id} onChange={handleChange} required>
                                                <option value="">Select Main Module</option>
                                                {mainModules.map(mm => (
                                                    <option key={mm.id} value={mm.id}>{mm.name}</option>
                                                ))}
                                            </select>
                                            {errors.main_module_id && <div className="text-danger">{errors.main_module_id}</div>}
                                        </div>
                                        <div className="mb-3 col-md-4">
                                            <label>Module</label>
                                            <select className="form-control" name="module_id" value={form.module_id} onChange={handleChange} required disabled={!form.main_module_id}>
                                                <option value="">Select Module</option>
                                                {modules.map(m => (
                                                    <option key={m.id || m.module_id} value={m.id || m.module_id}>{m.name || m.label}</option>
                                                ))}
                                            </select>
                                            {errors.module_id && <div className="text-danger">{errors.module_id}</div>}
                                        </div>

                                        <div className="mb-3 col-md-4">
                                            <label>Duration</label>
                                            <input type="number" className="form-control" name="duration" value={form.duration} onChange={handleChange} />
                                            {errors.duration && <div className="text-danger">{errors.duration}</div>}
                                        </div>
                                        <div className="mb-3 col-md-4">
                                            <label>Duration Type</label>
                                            <select className="form-control" name="duration_type" value={form.duration_type} onChange={handleChange} required>
                                                <option value="">Select Type</option>
                                                <option value="Month">Month</option>
                                                <option value="Year">Year</option>
                                            </select>
                                            {errors.duration_type && <div className="text-danger">{errors.duration_type}</div>}
                                        </div>
                                        <div className="mb-3 col-md-4">
                                            <label>Price</label>
                                            <input type="number" className="form-control" name="price" value={form.price} onChange={handleChange} />
                                            {errors.price && <div className="text-danger">{errors.price}</div>}
                                        </div>
                                        <div className="mb-3 col-md-4">
                                            <label>Status</label>
                                            <select className="form-select" name="status" value={form.status} onChange={handleChange} required>
                                                <option value={1}>Active</option>
                                                <option value={0}>Not Active</option>
                                            </select>
                                            {errors.status && <div className="text-danger">{errors.status}</div>}
                                        </div>
                                        {/* Descriptions Add More System */}
                                        <div className="mb-3 col-md-12">
                                            <label>Descriptions</label>
                                            {form.descriptions.map((desc, idx) => (
                                                <div key={idx} className="d-flex mb-2 align-items-center">
                                                    <input
                                                        type="text"
                                                        className="form-control me-2"
                                                        value={desc}
                                                        onChange={e => handleDescriptionChange(idx, e.target.value)}
                                                        placeholder={`Description ${idx + 1}`}
                                                    />
                                                    {form.descriptions.length > 1 && (
                                                        <button type="button" className="btn btn-danger btn-sm me-2" onClick={() => handleRemoveDescription(idx)}>
                                                            <i className="fa fa-minus"></i>
                                                        </button>
                                                    )}
                                                    {idx === form.descriptions.length - 1 && (
                                                        <button type="button" className="btn btn-primary btn-sm" onClick={handleAddDescription}>
                                                            <i className="fa fa-plus"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            {errors.descriptions && <div className="text-danger">{errors.descriptions}</div>}
                                        </div>
                                        <button type="submit" className="btn btn-primary w-100 text-white" disabled={loading}>Create</button>
                                        {success && <div className="alert alert-success mt-3">Subscription saved successfully!</div>}
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

export default SubscriptionMasterAdd;
