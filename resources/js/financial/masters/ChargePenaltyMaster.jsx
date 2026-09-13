import React, { useState, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';

const ChargePenaltyMaster = ({ selectedAdminId }) => {
    const api = ApiService();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [editId, setEditId] = useState(null);

    const initialForm = {
        service_type: 'ALL',
        category: 'CHARGE',
        charge_type: 'ACCOUNT_OPENING',
        penalty_type: 'OTHER',
        name: '',
        amount: 0,
        percentage: 0,
        gst_applicable: false,
        gst_percentage: 18,
        status: 'ACTIVE',
    };

    const [form, setForm] = useState(initialForm);

    const fetchItems = async () => {
        try {
            setLoading(true);
            let url = '/api/financial/charges-penalties';
            const params = [];
            if (selectedAdminId) params.push(`admin_id=${selectedAdminId}`);
            if (categoryFilter) params.push(`category=${categoryFilter}`);
            if (search) params.push(`search=${encodeURIComponent(search)}`);
            if (params.length > 0) url += `?${params.join('&')}`;

            const res = await api.vGet(url);
            if (res.data && res.data.status === 1) {
                setItems(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch charges and penalties', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [selectedAdminId, categoryFilter, search]);

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
            setForm({ ...initialForm, ...item });
        } else {
            setEditId(null);
            setForm({ ...initialForm });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setMessage({ type: '', text: '' });
            const payload = { ...form };
            if (selectedAdminId) payload.admin_id = selectedAdminId;

            let res;
            if (editId) {
                res = await api.vPut(`/api/financial/charges-penalties/${editId}`, payload);
            } else {
                res = await api.vPost('/api/financial/charges-penalties', payload);
            }

            if (res.data && res.data.status === 1) {
                setMessage({ type: 'success', text: `Charge/Penalty ${editId ? 'updated' : 'created'} successfully!` });
                setShowModal(false);
                fetchItems();
            } else {
                setMessage({ type: 'danger', text: res.data.message || 'Operation failed.' });
            }
        } catch (err) {
            setMessage({ type: 'danger', text: 'Error saving entry: ' + err.message });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this charge/penalty entry?')) return;
        try {
            const res = await api.vDelete(`/api/financial/charges-penalties/${id}`);
            if (res.data && res.data.status === 1) {
                setMessage({ type: 'success', text: 'Deleted successfully!' });
                fetchItems();
            }
        } catch (err) {
            setMessage({ type: 'danger', text: 'Failed to delete' });
        }
    };

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3 d-flex align-items-center justify-content-between">
                <div>
                    <h5 className="mb-0 fw-bold text-dark">
                        <i className="bx bx-error text-primary me-2"></i> Charges & Penalties Master
                    </h5>
                    <small className="text-muted">Configure fee schedules, service charges & late payment penalties</small>
                </div>
                <button className="btn btn-primary fw-medium" onClick={() => handleOpenModal()}>
                    <i className="bx bx-plus me-1"></i> Add Charge / Penalty
                </button>
            </div>

            <div className="card-body p-4">
                {message.text && (
                    <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                        {message.text}
                        <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
                    </div>
                )}

                {/* Filters */}
                <div className="row g-3 mb-4">
                    <div className="col-md-6">
                        <div className="input-group">
                            <span className="input-group-text bg-white"><i className="bx bx-search"></i></span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search charge or penalty name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                            <option value="">All Categories (Charge & Penalty)</option>
                            <option value="CHARGE">CHARGE</option>
                            <option value="PENALTY">PENALTY</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-2 text-muted">Loading entries...</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle border">
                            <thead className="table-light">
                                <tr>
                                    <th>Category</th>
                                    <th>Name</th>
                                    <th>Service</th>
                                    <th>Type</th>
                                    <th>Fixed Amount</th>
                                    <th>Percentage</th>
                                    <th>GST</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-4 text-muted">
                                            No charge or penalty entries configured. Click "Add Charge / Penalty" to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <span className={`badge ${item.category === 'CHARGE' ? 'bg-primary' : 'bg-warning text-dark'}`}>
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="fw-semibold">{item.name}</td>
                                            <td>{item.service_type}</td>
                                            <td>{item.category === 'CHARGE' ? item.charge_type : item.penalty_type}</td>
                                            <td className="fw-bold">₹{parseFloat(item.amount || 0).toFixed(2)}</td>
                                            <td>{parseFloat(item.percentage || 0) > 0 ? `${item.percentage}%` : '-'}</td>
                                            <td>{item.gst_applicable ? `${item.gst_percentage}%` : 'No'}</td>
                                            <td>
                                                <span className={`badge ${item.status === 'ACTIVE' ? 'bg-success' : 'bg-danger'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpenModal(item)}>
                                                    <i className="bx bx-edit-alt"></i> Edit
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}>
                                                    <i className="bx bx-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title fw-bold">
                                    {editId ? 'Edit Charge / Penalty' : 'Add Charge / Penalty'}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Category</label>
                                            <select className="form-select" name="category" value={form.category} onChange={handleFormChange}>
                                                <option value="CHARGE">CHARGE</option>
                                                <option value="PENALTY">PENALTY</option>
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Service Type</label>
                                            <select className="form-select" name="service_type" value={form.service_type} onChange={handleFormChange}>
                                                <option value="ALL">ALL SERVICES</option>
                                                <option value="SAVING">SAVING</option>
                                                <option value="DD">DAILY DEPOSIT (DD)</option>
                                                <option value="RD">RECURRING DEPOSIT (RD)</option>
                                                <option value="FD">FIXED DEPOSIT (FD)</option>
                                                <option value="MIS">MIS</option>
                                                <option value="MEMBERSHIP">MEMBERSHIP</option>
                                            </select>
                                        </div>

                                        <div className="col-md-12">
                                            <label className="form-label fw-medium">Name / Title</label>
                                            <input type="text" className="form-control" name="name" value={form.name} onChange={handleFormChange} required placeholder="e.g. Account Opening Fee, Late DD Penalty" />
                                        </div>

                                        {form.category === 'CHARGE' ? (
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">Charge Type</label>
                                                <select className="form-select" name="charge_type" value={form.charge_type || ''} onChange={handleFormChange}>
                                                    <option value="ACCOUNT_OPENING">ACCOUNT_OPENING</option>
                                                    <option value="DEPOSIT">DEPOSIT</option>
                                                    <option value="WITHDRAWAL">WITHDRAWAL</option>
                                                    <option value="ACCOUNT_CLOSURE">ACCOUNT_CLOSURE</option>
                                                    <option value="STATEMENT">STATEMENT</option>
                                                    <option value="DUPLICATE_PASSBOOK">DUPLICATE_PASSBOOK</option>
                                                    <option value="NOMINEE_CHANGE">NOMINEE_CHANGE</option>
                                                    <option value="MATURITY">MATURITY</option>
                                                    <option value="PREMATURE_CLOSURE">PREMATURE_CLOSURE</option>
                                                    <option value="MEMBERSHIP">MEMBERSHIP</option>
                                                    <option value="OTHER">OTHER</option>
                                                </select>
                                            </div>
                                        ) : (
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">Penalty Type</label>
                                                <select className="form-select" name="penalty_type" value={form.penalty_type || ''} onChange={handleFormChange}>
                                                    <option value="DD_LATE_PAYMENT">DD_LATE_PAYMENT</option>
                                                    <option value="RD_LATE_INSTALLMENT">RD_LATE_INSTALLMENT</option>
                                                    <option value="MINIMUM_BALANCE">MINIMUM_BALANCE</option>
                                                    <option value="PREMATURE_FD">PREMATURE_FD</option>
                                                    <option value="ACCOUNT_DORMANCY">ACCOUNT_DORMANCY</option>
                                                    <option value="OTHER">OTHER</option>
                                                </select>
                                            </div>
                                        )}

                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Fixed Amount (₹)</label>
                                            <input type="number" step="0.01" className="form-control" name="amount" value={form.amount} onChange={handleFormChange} />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Percentage (%)</label>
                                            <input type="number" step="0.01" className="form-control" name="percentage" value={form.percentage} onChange={handleFormChange} />
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-check form-switch mt-4">
                                                <input className="form-check-input" type="checkbox" name="gst_applicable" id="c_gst" checked={form.gst_applicable} onChange={handleFormChange} />
                                                <label className="form-check-label fw-medium" htmlFor="c_gst">GST Applicable</label>
                                            </div>
                                        </div>

                                        {form.gst_applicable && (
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">GST Percentage (%)</label>
                                                <input type="number" step="0.01" className="form-control" name="gst_percentage" value={form.gst_percentage} onChange={handleFormChange} />
                                            </div>
                                        )}

                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Status</label>
                                            <select className="form-select" name="status" value={form.status} onChange={handleFormChange}>
                                                <option value="ACTIVE">ACTIVE</option>
                                                <option value="INACTIVE">INACTIVE</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? 'Saving...' : (editId ? 'Update Entry' : 'Create Entry')}
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

export default ChargePenaltyMaster;
