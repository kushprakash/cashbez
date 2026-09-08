import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RechargeOperatorForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const apiService = ApiService();

    const [categories, setCategories] = useState([]);
    const [circles, setCircles] = useState([]);

    const [form, setForm] = useState({
        name: '',
        category: '',
        type: '',
        state: '',
        code: '',
        label: '',
        is_active: true
    });

    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // Fetch Category options and Circle options
    useEffect(() => {
        loadDropdownOptions();
        if (isEdit) {
            fetchOperatorData();
        }
    }, [id]);

    const loadDropdownOptions = async () => {
        try {
            // Load BBPS Categories
            const catRes = await apiService.vGet('/api/bbps-categories?per_page=all');
            if (catRes.data && catRes.data.status === 1) {
                setCategories(catRes.data.data || []);
            } else {
                // Fallback to service-categories API
                const fallCat = await apiService.vGet('/api/service-categories');
                if (fallCat.data && fallCat.data.data) {
                    setCategories(fallCat.data.data.map(c => typeof c === 'string' ? { name: c, category: c } : c));
                }
            }

            // Load Utility Circles
            const cirRes = await apiService.vGet('/api/utility-circles?per_page=all');
            if (cirRes.data && cirRes.data.status === 1) {
                setCircles(cirRes.data.data || []);
            }
        } catch (err) {
            console.error('Error loading dropdown options:', err);
        }
    };

    const fetchOperatorData = async () => {
        setFetching(true);
        try {
            const response = await apiService.vGet(`/api/recharge/operators/${id}`);
            if (response.data && response.data.status === 1) {
                const op = response.data.data;
                setForm({
                    name: op.name || '',
                    category: op.category || op.type || '',
                    type: op.type || op.category || '',
                    state: op.state || '',
                    code: op.code || op.operator_code || '',
                    label: op.label || op.name || '',
                    is_active: op.is_active !== false
                });

                if (op.icon || op.logo || op.biller_icon) {
                    setLogoPreview(op.icon || op.logo || op.biller_icon);
                }
            } else {
                toast.error(response.data?.message || 'Failed to load operator');
            }
        } catch (error) {
            toast.error('Error fetching operator data');
        } finally {
            setFetching(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setForm(prev => {
            const updated = { ...prev, [name]: val };
            // Category select populates both category and type
            if (name === 'category') {
                updated.type = value;
            }
            if (name === 'name' && !prev.label) {
                updated.label = value;
            }
            return updated;
        });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleReset = () => {
        if (isEdit) {
            fetchOperatorData();
        } else {
            setForm({
                name: '',
                category: '',
                type: '',
                state: '',
                code: '',
                label: '',
                is_active: true
            });
            setLogoFile(null);
            setLogoPreview(null);
        }
        toast.info('Form reset');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.category.trim()) {
            toast.error('Category is required');
            return;
        }
        if (!form.code.trim()) {
            toast.error('Operator Code is required');
            return;
        }
        if (!form.name.trim()) {
            toast.error('Name is required');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('code', form.code.toUpperCase());
            formData.append('operator_code', form.code.toUpperCase());
            formData.append('category', form.category);
            formData.append('type', form.type || form.category);
            formData.append('state', form.state || '');
            formData.append('label', form.label || form.name);
            formData.append('is_active', form.is_active ? '1' : '0');

            if (logoFile) {
                formData.append('operator_logo', logoFile);
            }

            let response;
            if (isEdit) {
                response = await apiService.vPost(`/api/recharge/operators/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                response = await apiService.vPost('/api/recharge/operators', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (response.data && response.data.status === 1) {
                toast.success(isEdit ? 'Operator updated successfully' : 'Operator created successfully');
                setTimeout(() => {
                    navigate('/recharge/operator/report');
                }, 1000);
            } else {
                toast.error(response.data?.message || 'Failed to save operator');
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Error submitting form');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="page-content-box mt-0 pt-0 text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="page-content-box mt-0 pt-0">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header / Breadcrumb */}
            <div className="d-flex justify-content-between align-items-center mb-4 px-2 pt-3">
                <div>
                    <h5 className="fw-bold mb-0 text-dark" style={{ color: '#4b5563', fontSize: '1.2rem' }}>
                        <span className="text-muted fw-normal">Utility Operator / </span>
                        <span className="text-secondary fw-bold">{isEdit ? 'Edit' : 'Add'}</span>
                    </h5>
                </div>
                <div>
                    <button
                        type="button"
                        onClick={() => navigate('/recharge/operator/report')}
                        className="btn px-4 py-2 text-white fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                        style={{
                            backgroundColor: '#6c5ce7',
                            borderColor: '#6c5ce7',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }}
                    >
                        <i className="fas fa-list"></i> OPERATOR REPORT
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">
                    <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-2">
                        <h6 className="fw-bold mb-0" style={{ color: '#6366f1', fontSize: '0.95rem' }}>
                            Utility Operator Details
                        </h6>
                    </div>

                    <div className="card-body p-4">
                        <div className="row g-4">
                            {/* Step 1: Category Selection (maps to utility_operators.category and utility_operators.type) */}
                            <div className="col-md-6">
                                <label className="form-label text-secondary small fw-medium">
                                    Category <span className="text-danger">*</span>
                                </label>
                                <select
                                    name="category"
                                    className="form-select"
                                    value={form.category}
                                    onChange={handleInputChange}
                                    required
                                    style={{ borderRadius: '6px', fontSize: '0.875rem' }}
                                >
                                    <option value="">Select BBPS Category</option>
                                    {categories.map((cat, idx) => (
                                        <option key={cat.id || idx} value={cat.category || cat.name}>
                                            {cat.name} ({cat.category || cat.name})
                                        </option>
                                    ))}
                                </select>
                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                    Saved in <code>utility_operators.category</code> &amp; <code>utility_operators.type</code>
                                </small>
                            </div>

                            {/* Step 2: Circle Selection (maps to utility_operators.state) */}
                            <div className="col-md-6">
                                <label className="form-label text-secondary small fw-medium">
                                    State / Circle
                                </label>
                                <select
                                    name="state"
                                    className="form-select"
                                    value={form.state}
                                    onChange={handleInputChange}
                                    style={{ borderRadius: '6px', fontSize: '0.875rem' }}
                                >
                                    <option value="">Select Utility Circle</option>
                                    {circles.map((cir, idx) => (
                                        <option key={cir.id || idx} value={cir.code || cir.id}>
                                            {cir.name} ({cir.code})
                                        </option>
                                    ))}
                                </select>
                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                    Saved in <code>utility_operators.state</code>
                                </small>
                            </div>

                            {/* Operator Code */}
                            <div className="col-md-6">
                                <label className="form-label text-secondary small fw-medium">
                                    Operator Code <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    className="form-control"
                                    placeholder="e.g. JIO, AIRTEL, BESCOM"
                                    value={form.code}
                                    onChange={handleInputChange}
                                    required
                                    style={{ borderRadius: '6px', fontSize: '0.875rem' }}
                                />
                            </div>

                            {/* Operator Name */}
                            <div className="col-md-6">
                                <label className="form-label text-secondary small fw-medium">
                                    Operator Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    placeholder="e.g. Reliance Jio"
                                    value={form.name}
                                    onChange={handleInputChange}
                                    required
                                    style={{ borderRadius: '6px', fontSize: '0.875rem' }}
                                />
                            </div>

                            {/* Operator Label */}
                            <div className="col-md-6">
                                <label className="form-label text-secondary small fw-medium">
                                    Display Label
                                </label>
                                <input
                                    type="text"
                                    name="label"
                                    className="form-control"
                                    placeholder="e.g. Jio Prepaid"
                                    value={form.label}
                                    onChange={handleInputChange}
                                    style={{ borderRadius: '6px', fontSize: '0.875rem' }}
                                />
                            </div>

                            {/* Operator Icon Upload */}
                            <div className="col-md-6">
                                <label className="form-label text-secondary small fw-medium">Operator Icon / Logo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control"
                                    onChange={handleLogoChange}
                                    style={{ borderRadius: '6px', fontSize: '0.8rem' }}
                                />
                            </div>

                            {/* Icon Preview */}
                            <div className="col-md-12 text-center py-2">
                                <div
                                    className="border rounded-3 d-inline-flex flex-column align-items-center justify-content-center p-3 bg-light"
                                    style={{ minWidth: '140px', minHeight: '100px', borderColor: '#e2e8f0' }}
                                >
                                    {logoPreview ? (
                                        <img
                                            src={logoPreview}
                                            alt="Operator Preview"
                                            style={{ maxWidth: '120px', maxHeight: '80px', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <span className="text-muted small">No Icon Selected</span>
                                    )}
                                </div>
                            </div>

                            {/* Is Active Status */}
                            <div className="col-md-12">
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="isActiveSwitch"
                                        name="is_active"
                                        checked={form.is_active}
                                        onChange={handleInputChange}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <label className="form-check-label fw-semibold small text-secondary" htmlFor="isActiveSwitch">
                                        Operator Active Status
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit / Reset Actions */}
                <div className="d-flex justify-content-center gap-3 pb-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn text-white fw-bold px-5 py-2 shadow-sm"
                        style={{
                            backgroundColor: '#6366f1',
                            borderColor: '#6366f1',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                SAVING...
                            </>
                        ) : (
                            'SUBMIT OPERATOR'
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        className="btn text-white fw-bold px-5 py-2 shadow-sm"
                        style={{
                            backgroundColor: '#ff6b6b',
                            borderColor: '#ff6b6b',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }}
                    >
                        RESET
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RechargeOperatorForm;
