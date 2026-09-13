import React, { useState, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';

const MembershipPlanMaster = ({ selectedAdminId }) => {
    const api = ApiService();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [editId, setEditId] = useState(null);

    const initialForm = {
        membership_type: 'ORDINARY',
        membership_code: '',
        membership_name: '',
        membership_fee: 0,
        gst_applicable: false,
        gst_percentage: 18,
        validity: 1,
        validity_unit: 'YEARS',
        renewal_required: true,
        renewal_fee: 0,
        late_renewal_fee: 0,
        status: 'ACTIVE',
    };

    const [form, setForm] = useState(initialForm);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            let url = '/api/financial/membership-plans';
            const params = [];
            if (selectedAdminId) params.push(`admin_id=${selectedAdminId}`);
            if (search) params.push(`search=${encodeURIComponent(search)}`);
            if (statusFilter) params.push(`status=${statusFilter}`);
            if (params.length > 0) url += `?${params.join('&')}`;

            const res = await api.vGet(url);
            if (res.data && res.data.status === 1) {
                setPlans(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch membership plans', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, [selectedAdminId, search, statusFilter]);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleOpenModal = (plan = null) => {
        if (plan) {
            setEditId(plan.id);
            setForm({
                membership_type: plan.membership_type || 'ORDINARY',
                membership_code: plan.membership_code || '',
                membership_name: plan.membership_name || '',
                membership_fee: plan.membership_fee || 0,
                gst_applicable: plan.gst_applicable || false,
                gst_percentage: plan.gst_percentage || 18,
                validity: plan.validity || 1,
                validity_unit: plan.validity_unit || 'YEARS',
                renewal_required: plan.renewal_required !== false,
                renewal_fee: plan.renewal_fee || 0,
                late_renewal_fee: plan.late_renewal_fee || 0,
                status: plan.status || 'ACTIVE',
            });
        } else {
            setEditId(null);
            setForm({
                ...initialForm,
                membership_code: 'MEM-' + Math.floor(1000 + Math.random() * 9000)
            });
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
                res = await api.vPut(`/api/financial/membership-plans/${editId}`, payload);
            } else {
                res = await api.vPost('/api/financial/membership-plans', payload);
            }

            if (res.data && res.data.status === 1) {
                setMessage({ type: 'success', text: `Membership plan ${editId ? 'updated' : 'created'} successfully!` });
                setShowModal(false);
                fetchPlans();
            } else {
                setMessage({ type: 'danger', text: res.data.message || 'Operation failed.' });
            }
        } catch (err) {
            setMessage({ type: 'danger', text: 'Error saving plan: ' + err.message });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this membership plan?')) return;
        try {
            const res = await api.vDelete(`/api/financial/membership-plans/${id}`);
            if (res.data && res.data.status === 1) {
                setMessage({ type: 'success', text: 'Membership plan deleted successfully!' });
                fetchPlans();
            }
        } catch (err) {
            setMessage({ type: 'danger', text: 'Failed to delete plan' });
        }
    };

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3 d-flex align-items-center justify-content-between">
                <div>
                    <h5 className="mb-0 fw-bold text-dark">
                        <i className="bx bx-id-card text-primary me-2"></i> Membership Plan Master
                    </h5>
                    <small className="text-muted">Configure & manage membership plans for members</small>
                </div>
                <button className="btn btn-primary fw-medium" onClick={() => handleOpenModal()}>
                    <i className="bx bx-plus me-1"></i> Add Membership Plan
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
                                placeholder="Search plan name or code..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">All Statuses</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-2 text-muted">Loading membership plans...</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle border">
                            <thead className="table-light">
                                <tr>
                                    <th>Code</th>
                                    <th>Plan Name</th>
                                    <th>Type</th>
                                    <th>Fee</th>
                                    <th>GST</th>
                                    <th>Total Fee</th>
                                    <th>Validity</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {plans.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-4 text-muted">
                                            No membership plans found. Click "Add Membership Plan" to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    plans.map((p) => (
                                        <tr key={p.id}>
                                            <td><span className="badge bg-secondary">{p.membership_code}</span></td>
                                            <td className="fw-semibold">{p.membership_name}</td>
                                            <td>{p.membership_type}</td>
                                            <td>₹{parseFloat(p.membership_fee).toFixed(2)}</td>
                                            <td>{p.gst_applicable ? `${p.gst_percentage}%` : 'No'}</td>
                                            <td className="fw-bold text-success">₹{parseFloat(p.total_fee).toFixed(2)}</td>
                                            <td>{p.validity} {p.validity_unit}</td>
                                            <td>
                                                <span className={`badge ${p.status === 'ACTIVE' ? 'bg-success' : 'bg-danger'}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpenModal(p)}>
                                                    <i className="bx bx-edit-alt"></i> Edit
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}>
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
                                    {editId ? 'Edit Membership Plan' : 'Create New Membership Plan'}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Membership Code</label>
                                            <input type="text" className="form-control" name="membership_code" value={form.membership_code} onChange={handleFormChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Membership Name</label>
                                            <input type="text" className="form-control" name="membership_name" value={form.membership_name} onChange={handleFormChange} required />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Type</label>
                                            <select className="form-select" name="membership_type" value={form.membership_type} onChange={handleFormChange}>
                                                <option value="ORDINARY">ORDINARY</option>
                                                <option value="CLASS_A">CLASS A</option>
                                                <option value="CLASS_B">CLASS B</option>
                                                <option value="NOMINAL">NOMINAL</option>
                                                <option value="ASSOCIATE">ASSOCIATE</option>
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Membership Fee (₹)</label>
                                            <input type="number" step="0.01" className="form-control" name="membership_fee" value={form.membership_fee} onChange={handleFormChange} required />
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-check form-switch mt-4">
                                                <input className="form-check-input" type="checkbox" name="gst_applicable" id="gst_app" checked={form.gst_applicable} onChange={handleFormChange} />
                                                <label className="form-check-label fw-medium" htmlFor="gst_app">GST Applicable</label>
                                            </div>
                                        </div>

                                        {form.gst_applicable && (
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">GST Percentage (%)</label>
                                                <input type="number" step="0.01" className="form-control" name="gst_percentage" value={form.gst_percentage} onChange={handleFormChange} />
                                            </div>
                                        )}

                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Validity Period</label>
                                            <input type="number" className="form-control" name="validity" value={form.validity} onChange={handleFormChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Validity Unit</label>
                                            <select className="form-select" name="validity_unit" value={form.validity_unit} onChange={handleFormChange}>
                                                <option value="DAYS">DAYS</option>
                                                <option value="MONTHS">MONTHS</option>
                                                <option value="YEARS">YEARS</option>
                                                <option value="LIFETIME">LIFETIME</option>
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Renewal Fee (₹)</label>
                                            <input type="number" step="0.01" className="form-control" name="renewal_fee" value={form.renewal_fee} onChange={handleFormChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Late Renewal Fee (₹)</label>
                                            <input type="number" step="0.01" className="form-control" name="late_renewal_fee" value={form.late_renewal_fee} onChange={handleFormChange} />
                                        </div>

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
                                        {saving ? 'Saving...' : (editId ? 'Update Plan' : 'Create Plan')}
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

export default MembershipPlanMaster;
