import React, { useState, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';

const CommissionMasterView = () => {
    const api = ApiService();
    const [commissions, setCommissions] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [serviceFilter, setServiceFilter] = useState('ALL');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [modeFilter, setModeFilter] = useState('ALL'); // ALL, FLAT, SLAB
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [editId, setEditId] = useState(null);

    const initialForm = {
        service_type: 'NEW_MEMBER',
        name: '',
        role_id: '',
        is_slab: false,
        from_amount: 0,
        to_amount: 10000,
        commission_type: 'flat',
        commission_value: 0,
        distributor_commission_type: 'flat',
        distributor_commission_value: 0,
        status: 'ACTIVE',
    };

    const [form, setForm] = useState(initialForm);

    const fetchServiceTypes = async () => {
        try {
            const res = await api.vGet('/api/financial/commissions/service-types');
            if (res.data && res.data.status === 1) {
                setServiceTypes(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch commission service types', err);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await api.vGet('/api/financial/commissions/roles');
            if (res.data && res.data.status === 1) {
                setRoles(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch roles', err);
        }
    };

    const fetchCommissions = async () => {
        try {
            setLoading(true);
            let url = '/api/financial/commissions';
            const params = [];
            if (serviceFilter && serviceFilter !== 'ALL') params.push(`service_type=${serviceFilter}`);
            if (roleFilter && roleFilter !== 'ALL') params.push(`role_id=${roleFilter}`);
            if (statusFilter && statusFilter !== 'ALL') params.push(`status=${statusFilter}`);
            if (search) params.push(`search=${encodeURIComponent(search)}`);
            if (params.length > 0) url += `?${params.join('&')}`;

            const res = await api.vGet(url);
            if (res.data && res.data.status === 1) {
                setCommissions(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch commissions', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServiceTypes();
        fetchRoles();
    }, []);

    useEffect(() => {
        fetchCommissions();
    }, [serviceFilter, roleFilter, statusFilter, search]);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditId(item.id);
            setForm({
                service_type: item.service_type || 'NEW_MEMBER',
                name: item.name || '',
                role_id: item.role_id || '',
                is_slab: !!item.is_slab,
                from_amount: item.from_amount || 0,
                to_amount: item.to_amount || 0,
                commission_type: item.commission_type || 'flat',
                commission_value: item.commission_value || 0,
                distributor_commission_type: item.distributor_commission_type || 'flat',
                distributor_commission_value: item.distributor_commission_value || 0,
                status: item.status || 'ACTIVE',
            });
        } else {
            setEditId(null);
            setForm({
                ...initialForm,
                service_type: serviceFilter !== 'ALL' ? serviceFilter : 'NEW_MEMBER'
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setMessage({ type: '', text: '' });
            const payload = {
                ...form,
                is_slab: form.is_slab ? 1 : 0,
                role_id: form.role_id ? parseInt(form.role_id) : null,
                from_amount: form.is_slab ? parseFloat(form.from_amount) : 0,
                to_amount: form.is_slab ? parseFloat(form.to_amount) : 0,
                commission_value: parseFloat(form.commission_value),
                distributor_commission_value: parseFloat(form.distributor_commission_value || 0),
            };

            let res;
            if (editId) {
                res = await api.vPut(`/api/financial/commissions/${editId}`, payload);
            } else {
                res = await api.vPost('/api/financial/commissions', payload);
            }

            if (res.data && res.data.status === 1) {
                setMessage({ type: 'success', text: res.data.message || 'Commission rule saved successfully!' });
                setShowModal(false);
                fetchCommissions();
            } else {
                setMessage({ type: 'danger', text: res.data?.message || 'Failed to save commission rule.' });
            }
        } catch (err) {
            setMessage({ type: 'danger', text: err.response?.data?.message || err.message || 'An error occurred.' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this commission rule?')) return;
        try {
            const res = await api.vDelete(`/api/financial/commissions/${id}`);
            if (res.data && res.data.status === 1) {
                setMessage({ type: 'success', text: 'Commission rule deleted successfully.' });
                fetchCommissions();
            } else {
                setMessage({ type: 'danger', text: res.data?.message || 'Failed to delete rule.' });
            }
        } catch (err) {
            setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to delete rule.' });
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await api.vPost(`/api/financial/commissions/toggle-status/${id}`, {});
            if (res.data && res.data.status === 1) {
                fetchCommissions();
            }
        } catch (err) {
            console.error('Failed to toggle status', err);
        }
    };

    // Filter by mode locally if set
    const filteredList = commissions.filter(item => {
        if (modeFilter === 'FLAT' && item.is_slab) return false;
        if (modeFilter === 'SLAB' && !item.is_slab) return false;
        return true;
    });

    const getMeta = (code) => {
        return serviceTypes.find(s => s.code === code) || { label: code, icon: 'bx-gift', color: 'primary' };
    };

    return (
        <div className="card shadow-sm border-0">
            {/* Header */}
            <div className="card-header bg-white py-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                    <h5 className="mb-1 fw-bold text-dark">
                        <i className="bx bx-gift text-success me-2"></i> Financial Service Commission Master
                    </h5>
                    <p className="text-muted small mb-0">
                        Configure agent & upline commissions for New Member, Saving, RD, DD, FD, MIS opening and RD, DD deposit collections (Dynamic Slab & Flat modes supported).
                    </p>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <button
                        type="button"
                        className="btn btn-success fw-bold d-flex align-items-center shadow-sm"
                        onClick={() => handleOpenModal()}
                    >
                        <i className="bx bx-plus-circle fs-5 me-1"></i> Add Commission Rule
                    </button>
                </div>
            </div>

            {/* Alert Message */}
            {message.text && (
                <div className={`alert alert-${message.type} alert-dismissible fade show m-3 mb-0`} role="alert">
                    {message.text}
                    <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
                </div>
            )}

            {/* Service Type Tabs / Filters */}
            <div className="px-3 pt-3 pb-2 border-bottom bg-light bg-opacity-50">
                <div className="d-flex flex-wrap gap-2 align-items-center">
                    <button
                        type="button"
                        className={`btn btn-sm rounded-pill fw-semibold ${serviceFilter === 'ALL' ? 'btn-primary' : 'btn-outline-secondary bg-white'}`}
                        onClick={() => setServiceFilter('ALL')}
                    >
                        All Services ({commissions.length})
                    </button>
                    {serviceTypes.map(s => {
                        const count = commissions.filter(c => c.service_type === s.code).length;
                        const isSelected = serviceFilter === s.code;
                        return (
                            <button
                                key={s.code}
                                type="button"
                                className={`btn btn-sm rounded-pill fw-semibold d-flex align-items-center gap-1 ${
                                    isSelected ? 'btn-primary' : 'btn-outline-secondary bg-white'
                                }`}
                                onClick={() => setServiceFilter(s.code)}
                            >
                                <i className={`bx ${s.icon} text-${s.color}`}></i>
                                <span>{s.label}</span>
                                {count > 0 && <span className="badge bg-secondary-subtle text-secondary rounded-pill ms-1">{count}</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Sub-Filters: Role, Mode, Status, Search */}
            <div className="card-body p-3 border-bottom bg-white">
                <div className="row g-2 align-items-center">
                    <div className="col-md-3">
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-light border-end-0">
                                <i className="bx bx-search text-muted"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control form-control-sm border-start-0"
                                placeholder="Search by rule name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="col-md-2 col-6">
                        <select
                            className="form-select form-select-sm"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="ALL">All Roles</option>
                            <option value="GLOBAL">Global / Any Role</option>
                            {roles.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-2 col-6">
                        <select
                            className="form-select form-select-sm"
                            value={modeFilter}
                            onChange={(e) => setModeFilter(e.target.value)}
                        >
                            <option value="ALL">All Modes (Slab & Flat)</option>
                            <option value="FLAT">Flat Only (No Slab)</option>
                            <option value="SLAB">Slab Range Only</option>
                        </select>
                    </div>

                    <div className="col-md-2 col-6">
                        <select
                            className="form-select form-select-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>

                    <div className="col-md-3 col-6 text-md-end text-muted small">
                        Showing <strong>{filteredList.length}</strong> rules
                    </div>
                </div>
            </div>

            {/* Commission Rules Table */}
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                        <tr className="text-uppercase small text-muted">
                            <th className="ps-3" style={{ width: '5%' }}>#</th>
                            <th style={{ width: '22%' }}>Service Type</th>
                            <th style={{ width: '20%' }}>Rule Name & Details</th>
                            <th style={{ width: '13%' }}>Target Role</th>
                            <th style={{ width: '14%' }}>Structure Mode</th>
                            <th style={{ width: '14%' }}>Commission Rate</th>
                            <th style={{ width: '6%' }}>Status</th>
                            <th className="text-end pe-3" style={{ width: '6%' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="text-center py-5">
                                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                                    <span className="text-muted">Loading commission rules...</span>
                                </td>
                            </tr>
                        ) : filteredList.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-5">
                                    <div className="py-4">
                                        <i className="bx bx-gift text-muted fs-1 mb-2 d-block"></i>
                                        <h6 className="fw-bold text-dark">No Commission Rules Configured</h6>
                                        <p className="text-muted small mb-3">
                                            Create dynamic commission rules for member registration, account opening, or collections.
                                        </p>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary rounded-pill px-3"
                                            onClick={() => handleOpenModal()}
                                        >
                                            <i className="bx bx-plus me-1"></i> Add First Rule
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredList.map((item, index) => {
                                const meta = getMeta(item.service_type);
                                return (
                                    <tr key={item.id}>
                                        <td className="ps-3 fw-bold text-muted small">{index + 1}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className={`avatar-sm rounded-circle bg-${meta.color || 'primary'} bg-opacity-10 text-${meta.color || 'primary'} p-2 d-flex align-items-center justify-content-center me-2`}>
                                                    <i className={`bx ${meta.icon || 'bx-gift'} fs-5`}></i>
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{meta.label}</div>
                                                    <span className="badge bg-light text-secondary border small" style={{ fontSize: '10px' }}>
                                                        {item.service_type}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-dark small">{item.name}</div>
                                            {item.distributor_commission_value > 0 && (
                                                <div className="text-muted small" style={{ fontSize: '11px' }}>
                                                    Upline/Dist: <strong>{item.distributor_commission_type === 'percentage' ? `${item.distributor_commission_value}%` : `₹${item.distributor_commission_value}`}</strong>
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {item.role ? (
                                                <span className="badge bg-info-subtle text-info border border-info-subtle">
                                                    <i className="bx bx-user me-1"></i>{item.role.name}
                                                </span>
                                            ) : (
                                                <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                                                    <i className="bx bx-globe me-1"></i>All Roles (Global)
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {item.is_slab ? (
                                                <div>
                                                    <span className="badge bg-purple-subtle text-purple border border-purple-subtle">
                                                        <i className="bx bx-slider-alt me-1"></i>Dynamic Slab
                                                    </span>
                                                    <div className="small text-muted mt-1 fw-bold font-monospace">
                                                        ₹{Number(item.from_amount).toLocaleString()} - ₹{Number(item.to_amount).toLocaleString()}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="badge bg-success-subtle text-success border border-success-subtle">
                                                    <i className="bx bx-check-double me-1"></i>Flat (Universal)
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {item.commission_type === 'percentage' ? (
                                                <div className="d-flex align-items-center">
                                                    <span className="badge bg-warning-subtle text-dark border border-warning fs-6 px-2 py-1 font-monospace">
                                                        {item.commission_value}%
                                                    </span>
                                                    <span className="small text-muted ms-1">Percentage</span>
                                                </div>
                                            ) : (
                                                <div className="d-flex align-items-center">
                                                    <span className="badge bg-success text-white fs-6 px-2 py-1 font-monospace shadow-sm">
                                                        ₹{Number(item.commission_value).toFixed(2)}
                                                    </span>
                                                    <span className="small text-muted ms-1">Fixed Flat</span>
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className={`btn btn-sm py-0 px-2 rounded-pill fw-bold border ${
                                                    item.status === 'ACTIVE'
                                                        ? 'btn-outline-success bg-success-subtle'
                                                        : 'btn-outline-danger bg-danger-subtle'
                                                }`}
                                                onClick={() => handleToggleStatus(item.id)}
                                                title="Click to toggle status"
                                            >
                                                {item.status}
                                            </button>
                                        </td>
                                        <td className="text-end pe-3">
                                            <div className="btn-group btn-group-sm">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary"
                                                    onClick={() => handleOpenModal(item)}
                                                    title="Edit Rule"
                                                >
                                                    <i className="bx bx-edit"></i>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger"
                                                    onClick={() => handleDelete(item.id)}
                                                    title="Delete Rule"
                                                >
                                                    <i className="bx bx-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal: Add / Edit Commission Rule */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content shadow-lg border-0">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header bg-light py-3">
                                    <h5 className="modal-title fw-bold text-dark d-flex align-items-center">
                                        <i className="bx bx-gift text-success me-2 fs-4"></i>
                                        {editId ? 'Edit Financial Commission Rule' : 'Create New Financial Commission Rule'}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    ></button>
                                </div>

                                <div className="modal-body p-4">
                                    <div className="row g-3">
                                        {/* Service Type */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold text-dark small">
                                                Financial Service <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-select"
                                                name="service_type"
                                                value={form.service_type}
                                                onChange={handleFormChange}
                                                required
                                            >
                                                {serviceTypes.map(s => (
                                                    <option key={s.code} value={s.code}>
                                                        {s.label} ({s.category})
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="form-text small">
                                                {getMeta(form.service_type)?.description}
                                            </div>
                                        </div>

                                        {/* Target Role */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold text-dark small">
                                                Target Role (Agent Type)
                                            </label>
                                            <select
                                                className="form-select"
                                                name="role_id"
                                                value={form.role_id}
                                                onChange={handleFormChange}
                                            >
                                                <option value="">All Roles (Global Rule for Everyone)</option>
                                                {roles.map(r => (
                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                ))}
                                            </select>
                                            <div className="form-text small">
                                                Leave as Global or pick a specific role (Retailer, Distributor, etc.)
                                            </div>
                                        </div>

                                        {/* Rule Name */}
                                        <div className="col-md-12">
                                            <label className="form-label fw-bold text-dark small">
                                                Rule Label / Display Name (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="name"
                                                value={form.name}
                                                onChange={handleFormChange}
                                                placeholder="e.g. Standard Member Commission, RD 1k to 10k Slab"
                                            />
                                        </div>

                                        {/* Slab Mode Toggle */}
                                        <div className="col-md-12">
                                            <div className="card p-3 bg-light border-0 rounded-3">
                                                <label className="form-label fw-bold text-dark mb-2">
                                                    Commission Structure Mode <span className="text-danger">*</span>
                                                </label>
                                                <div className="d-flex flex-wrap gap-3">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="is_slab"
                                                            id="mode_flat"
                                                            checked={!form.is_slab}
                                                            onChange={() => setForm(prev => ({ ...prev, is_slab: false }))}
                                                        />
                                                        <label className="form-check-label fw-semibold" htmlFor="mode_flat">
                                                            <i className="bx bx-check-circle text-success me-1"></i> Flat (No Slab / Universal)
                                                            <span className="d-block small text-muted fw-normal">
                                                                Applies uniformly regardless of transaction amount.
                                                            </span>
                                                        </label>
                                                    </div>

                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="is_slab"
                                                            id="mode_slab"
                                                            checked={form.is_slab}
                                                            onChange={() => setForm(prev => ({ ...prev, is_slab: true }))}
                                                        />
                                                        <label className="form-check-label fw-semibold" htmlFor="mode_slab">
                                                            <i className="bx bx-slider-alt text-primary me-1"></i> Dynamic Slab (Amount Range)
                                                            <span className="d-block small text-muted fw-normal">
                                                                Applies only when transaction amount is within specified range.
                                                            </span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* Slab Range Inputs */}
                                                {form.is_slab && (
                                                    <div className="row g-2 mt-2 pt-2 border-top">
                                                        <div className="col-md-6">
                                                            <label className="form-label fw-bold text-dark small">From Amount (₹)</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                className="form-control font-monospace"
                                                                name="from_amount"
                                                                value={form.from_amount}
                                                                onChange={handleFormChange}
                                                                required={form.is_slab}
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label fw-bold text-dark small">To Amount (₹)</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                className="form-control font-monospace"
                                                                name="to_amount"
                                                                value={form.to_amount}
                                                                onChange={handleFormChange}
                                                                required={form.is_slab}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Agent Commission Type & Value */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold text-dark small">
                                                Agent Calculation Type <span className="text-danger">*</span>
                                            </label>
                                            <div className="d-flex gap-2 mb-2">
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm flex-fill fw-bold ${form.commission_type === 'flat' ? 'btn-success' : 'btn-outline-secondary'}`}
                                                    onClick={() => setForm(prev => ({ ...prev, commission_type: 'flat' }))}
                                                >
                                                    <i className="bx bx-money me-1"></i> Flat (₹ Fixed)
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm flex-fill fw-bold ${form.commission_type === 'percentage' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                    onClick={() => setForm(prev => ({ ...prev, commission_type: 'percentage' }))}
                                                >
                                                    <i className="bx bx-purchase-tag me-1"></i> Percentage (%)
                                                </button>
                                            </div>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light fw-bold">
                                                    {form.commission_type === 'flat' ? '₹' : '%'}
                                                </span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    className="form-control font-monospace fs-6 fw-bold"
                                                    name="commission_value"
                                                    value={form.commission_value}
                                                    onChange={handleFormChange}
                                                    placeholder={form.commission_type === 'flat' ? '50.00' : '2.50'}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Optional Distributor Commission */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold text-dark small">
                                                Distributor / Upline Commission (Optional)
                                            </label>
                                            <div className="d-flex gap-2 mb-2">
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm flex-fill fw-bold ${form.distributor_commission_type === 'flat' ? 'btn-outline-dark active' : 'btn-outline-secondary'}`}
                                                    onClick={() => setForm(prev => ({ ...prev, distributor_commission_type: 'flat' }))}
                                                >
                                                    Flat (₹)
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm flex-fill fw-bold ${form.distributor_commission_type === 'percentage' ? 'btn-outline-dark active' : 'btn-outline-secondary'}`}
                                                    onClick={() => setForm(prev => ({ ...prev, distributor_commission_type: 'percentage' }))}
                                                >
                                                    Percentage (%)
                                                </button>
                                            </div>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light fw-bold">
                                                    {form.distributor_commission_type === 'flat' ? '₹' : '%'}
                                                </span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    className="form-control font-monospace"
                                                    name="distributor_commission_value"
                                                    value={form.distributor_commission_value}
                                                    onChange={handleFormChange}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold text-dark small">Rule Status</label>
                                            <select
                                                className="form-select"
                                                name="status"
                                                value={form.status}
                                                onChange={handleFormChange}
                                            >
                                                <option value="ACTIVE">ACTIVE (Enabled)</option>
                                                <option value="INACTIVE">INACTIVE (Disabled)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer bg-light py-2">
                                    <button
                                        type="button"
                                        className="btn btn-secondary fw-semibold"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-success fw-bold d-flex align-items-center"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span> Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bx bx-check-circle me-1"></i> {editId ? 'Update Rule' : 'Save Commission Rule'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommissionMasterView;
