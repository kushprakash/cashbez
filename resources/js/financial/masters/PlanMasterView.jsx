import React, { useState, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';

const titleMap = {
    SAVING: 'Saving Account Plan Master',
    DD: 'Daily Deposit (DD) Plan Master',
    RD: 'Recurring Deposit (RD) Plan Master',
    FD: 'Fixed Deposit (FD) Plan Master',
    MIS: 'Monthly Income Scheme (MIS) Plan Master',
};

const iconMap = {
    SAVING: 'bx-wallet',
    DD: 'bx-calendar-event',
    RD: 'bx-refresh',
    FD: 'bx-vault',
    MIS: 'bx-line-chart',
};

const getInitialForm = (serviceType) => ({
    service_type: serviceType,
    plan_code: '',
    plan_name: '',
    description: '',
    status: 'ACTIVE',
    minimum_opening_amount: 500,
    maximum_opening_amount: 100000,
    minimum_balance: 500,
    maximum_total_balance: 1000000,
    maximum_daily_deposit: 50000,
    maximum_monthly_deposit: 500000,
    minimum_daily_deposit: 10,
    minimum_installment: 100,
    maximum_installment: 50000,
    installment_frequency: 'MONTHLY',
    minimum_installments: serviceType === 'DD' ? 300 : serviceType === 'RD' ? 10 : 1,
    minimum_investment: 5000,
    maximum_investment: 1000000,
    maximum_total_investment: 5000000,
    minimum_duration: 12,
    maximum_duration: 60,
    duration_unit: 'MONTHS',
    interest_rate: 6.5,
    interest_type: 'SIMPLE',
    interest_calculation_method: 'DAILY_PRODUCT',
    interest_calculation_frequency: 'QUARTERLY',
    interest_credit_frequency: 'QUARTERLY',
    compounding_frequency: 'QUARTERLY',
    interest_payout: 'AT_MATURITY',
    payout_frequency: 'MONTHLY',
    payout_day: 1,
    grace_period: 5,
    late_payment_allowed: true,
    late_payment_charge: 50,
    late_fee: 10,
    missed_installment_charge: 50,
    maximum_missed_deposits: 3,
    maximum_missed_installments: 3,
    withdrawal_allowed: true,
    minimum_withdrawal: 100,
    maximum_withdrawal: 50000,
    daily_withdrawal_limit: 25000,
    monthly_withdrawal_limit: 250000,
    withdrawal_charge: 0,
    account_opening_charge: 50,
    account_closure_charge: 100,
    premature_closure_allowed: true,
    premature_closure_charge: 100,
    premature_closure_penalty: 1,
    minimum_lockin_period: 3,
    lockin_period: 12,
    premature_penalty: 1,
    reduced_interest_rate: 4.5,
    auto_renewal: false,
    renewal_type: 'NO_RENEWAL',
    nominee_required: true,
    joint_account_allowed: false,
    minor_account_allowed: false,
    dormant_period: 365,
});

const PlanMasterView = ({ serviceType = 'SAVING', selectedAdminId }) => {
    const api = ApiService();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState(() => getInitialForm(serviceType));

    // Debounce search input to keep typing ultra-fast
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 350);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            let url = `/api/financial/plans?service_type=${serviceType}`;
            if (selectedAdminId) url += `&admin_id=${selectedAdminId}`;
            if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
            if (statusFilter) url += `&status=${statusFilter}`;

            const res = await api.vGet(url);
            if (res.data && res.data.status === 1) {
                setPlans(res.data.data || []);
            }
        } catch (err) {
            console.error(`Failed to fetch ${serviceType} plans`, err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setForm(getInitialForm(serviceType));
        fetchPlans();
    }, [serviceType, selectedAdminId, debouncedSearch, statusFilter]);

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
            setForm({ ...getInitialForm(serviceType), ...plan });
        } else {
            setEditId(null);
            setForm({
                ...getInitialForm(serviceType),
                plan_code: `${serviceType}-${Math.floor(100 + Math.random() * 900)}`
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setMessage({ type: '', text: '' });
            const payload = { ...form, service_type: serviceType };
            if (selectedAdminId) payload.admin_id = selectedAdminId;

            let res;
            if (editId) {
                res = await api.vPut(`/api/financial/plans/${editId}`, payload);
            } else {
                res = await api.vPost('/api/financial/plans', payload);
            }

            if (res.data && res.data.status === 1) {
                setMessage({ type: 'success', text: `${titleMap[serviceType]} ${editId ? 'updated' : 'created'} successfully!` });
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
        if (!window.confirm(`Are you sure you want to delete this ${serviceType} plan?`)) return;
        try {
            const res = await api.vDelete(`/api/financial/plans/${id}`);
            if (res.data && res.data.status === 1) {
                setMessage({ type: 'success', text: 'Plan deleted successfully!' });
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
                        <i className={`bx ${iconMap[serviceType]} text-primary me-2`}></i> {titleMap[serviceType]}
                    </h5>
                    <small className="text-muted">Configure and manage active {serviceType} financial product rules</small>
                </div>
                <button className="btn btn-primary fw-medium" onClick={() => handleOpenModal()}>
                    <i className="bx bx-plus me-1"></i> Add New Plan
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
                                placeholder={`Search ${serviceType} plan code or name...`}
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
                        <p className="mt-2 text-muted">Loading {serviceType} plans...</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle border">
                            <thead className="table-light">
                                <tr>
                                    <th>Code</th>
                                    <th>Plan Name</th>
                                    <th>Interest Rate</th>
                                    {serviceType === 'SAVING' && <th>Min Balance</th>}
                                    {serviceType === 'DD' && <th>Min Daily Amt</th>}
                                    {serviceType === 'RD' && <th>Installment</th>}
                                    {(serviceType === 'FD' || serviceType === 'MIS') && <th>Min Investment</th>}
                                    {(serviceType === 'DD' || serviceType === 'RD') && <th>Min EMIs Required</th>}
                                    <th>Duration</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {plans.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-4 text-muted">
                                            No {serviceType} plans found. Click "Add New Plan" to configure one.
                                        </td>
                                    </tr>
                                ) : (
                                    plans.map((p) => (
                                        <tr key={p.id}>
                                            <td><span className="badge bg-secondary">{p.plan_code}</span></td>
                                            <td className="fw-semibold">{p.plan_name}</td>
                                            <td className="fw-bold text-success">{p.interest_rate}% p.a.</td>
                                            {serviceType === 'SAVING' && <td>₹{parseFloat(p.minimum_balance || 0).toFixed(2)}</td>}
                                            {serviceType === 'DD' && <td>₹{parseFloat(p.minimum_daily_deposit || 0).toFixed(2)}</td>}
                                            {serviceType === 'RD' && <td>₹{parseFloat(p.minimum_installment || 0).toFixed(2)} / {p.installment_frequency}</td>}
                                            {(serviceType === 'FD' || serviceType === 'MIS') && <td>₹{parseFloat(p.minimum_investment || 0).toFixed(2)}</td>}
                                            {(serviceType === 'DD' || serviceType === 'RD') && (
                                                <td><span className="badge bg-danger-subtle text-danger border border-danger-subtle fw-bold">{p.minimum_installments || (p.service_type === 'DD' ? 300 : 10)} {p.service_type === 'DD' ? 'Deposits' : 'EMIs'}</span></td>
                                            )}
                                            <td>{p.minimum_duration} - {p.maximum_duration} {p.duration_unit}</td>
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
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title fw-bold">
                                    {editId ? `Edit ${serviceType} Plan` : `Create New ${serviceType} Plan`}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Plan Code</label>
                                            <input type="text" className="form-control" name="plan_code" value={form.plan_code} onChange={handleFormChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Plan Name</label>
                                            <input type="text" className="form-control" name="plan_name" value={form.plan_name} onChange={handleFormChange} required />
                                        </div>

                                        <div className="col-md-12">
                                            <label className="form-label fw-medium">Description</label>
                                            <textarea className="form-control" rows="2" name="description" value={form.description || ''} onChange={handleFormChange}></textarea>
                                        </div>

                                        {/* Service Specific Fields */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Interest Rate (% p.a.)</label>
                                            <input type="number" step="0.01" className="form-control" name="interest_rate" value={form.interest_rate} onChange={handleFormChange} required />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Interest Type</label>
                                            <select className="form-select" name="interest_type" value={form.interest_type} onChange={handleFormChange}>
                                                <option value="SIMPLE">SIMPLE</option>
                                                <option value="COMPOUND">COMPOUND</option>
                                            </select>
                                        </div>

                                        {serviceType === 'SAVING' && (
                                            <>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-medium">Minimum Opening Amount (₹)</label>
                                                    <input type="number" step="0.01" className="form-control" name="minimum_opening_amount" value={form.minimum_opening_amount} onChange={handleFormChange} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-medium">Minimum Balance (₹)</label>
                                                    <input type="number" step="0.01" className="form-control" name="minimum_balance" value={form.minimum_balance} onChange={handleFormChange} />
                                                </div>
                                            </>
                                        )}

                                        {serviceType === 'DD' && (
                                            <>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-medium">Minimum Daily Deposit (₹)</label>
                                                    <input type="number" step="0.01" className="form-control" name="minimum_daily_deposit" value={form.minimum_daily_deposit} onChange={handleFormChange} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-medium">Grace Period (Days)</label>
                                                    <input type="number" className="form-control" name="grace_period" value={form.grace_period} onChange={handleFormChange} />
                                                </div>
                                            </>
                                        )}

                                        {serviceType === 'RD' && (
                                            <>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-medium">Minimum Installment (₹)</label>
                                                    <input type="number" step="0.01" className="form-control" name="minimum_installment" value={form.minimum_installment} onChange={handleFormChange} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-medium">Compounding Frequency</label>
                                                    <select className="form-select" name="compounding_frequency" value={form.compounding_frequency} onChange={handleFormChange}>
                                                        <option value="MONTHLY">MONTHLY</option>
                                                        <option value="QUARTERLY">QUARTERLY</option>
                                                        <option value="YEARLY">YEARLY</option>
                                                    </select>
                                                </div>
                                            </>
                                        )}

                                        {(serviceType === 'DD' || serviceType === 'RD') && (
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold text-danger">Minimum Number of EMI / Installments Required</label>
                                                <input
                                                    type="number"
                                                    className="form-control fw-bold border-danger"
                                                    name="minimum_installments"
                                                    value={form.minimum_installments || ''}
                                                    onChange={handleFormChange}
                                                    min="1"
                                                    placeholder={serviceType === 'DD' ? 'e.g. 300 Daily Deposits' : 'e.g. 10 Monthly EMIs'}
                                                />
                                                <small className="text-muted d-block mt-1">
                                                    {serviceType === 'DD' ? 'Min daily deposits required for maturity payout' : 'Min monthly EMIs required for maturity payout'}
                                                </small>
                                            </div>
                                        )}

                                        {(serviceType === 'FD' || serviceType === 'MIS') && (
                                            <>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-medium">Minimum Investment Amount (₹)</label>
                                                    <input type="number" step="0.01" className="form-control" name="minimum_investment" value={form.minimum_investment} onChange={handleFormChange} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-medium">Lock-in Period (Months)</label>
                                                    <input type="number" className="form-control" name="lockin_period" value={form.lockin_period} onChange={handleFormChange} />
                                                </div>
                                            </>
                                        )}

                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Minimum Duration</label>
                                            <input type="number" className="form-control" name="minimum_duration" value={form.minimum_duration} onChange={handleFormChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Duration Unit</label>
                                            <select className="form-select" name="duration_unit" value={form.duration_unit} onChange={handleFormChange}>
                                                <option value="DAYS">DAYS</option>
                                                <option value="MONTHS">MONTHS</option>
                                                <option value="YEARS">YEARS</option>
                                            </select>
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

export default PlanMasterView;
