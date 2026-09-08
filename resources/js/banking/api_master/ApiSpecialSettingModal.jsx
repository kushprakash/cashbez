import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { toast } from 'react-toastify';

const stateList = [
    { code: 'ALL', label: '🌐 ALL STATES / ALL CIRCLES' },
    { code: 'DELHI', label: 'Delhi NCR' },
    { code: 'MUMBAI', label: 'Mumbai' },
    { code: 'MAHARASHTRA', label: 'Maharashtra & Goa' },
    { code: 'UP EAST', label: 'UP East' },
    { code: 'UP WEST', label: 'UP West & Uttarakhand' },
    { code: 'BIHAR', label: 'Bihar & Jharkhand' },
    { code: 'WEST BENGAL', label: 'West Bengal' },
    { code: 'KOLKATA', label: 'Kolkata' },
    { code: 'GUJARAT', label: 'Gujarat' },
    { code: 'KARNATAKA', label: 'Karnataka' },
    { code: 'TAMIL NADU', label: 'Tamil Nadu & Chennai' },
    { code: 'ANDHRA PRADESH', label: 'Andhra Pradesh & Telangana' },
    { code: 'KERALA', label: 'Kerala' },
    { code: 'PUNJAB', label: 'Punjab' },
    { code: 'HARYANA', label: 'Haryana' },
    { code: 'RAJASTHAN', label: 'Rajasthan' },
    { code: 'MADHYA PRADESH', label: 'MP & Chhattisgarh' },
    { code: 'ODISHA', label: 'Odisha' },
    { code: 'ASSAM', label: 'Assam' },
    { code: 'NORTH EAST', label: 'North East' },
    { code: 'JAMMU & KASHMIR', label: 'Jammu & Kashmir' },
    { code: 'HIMACHAL PRADESH', label: 'Himachal Pradesh' },
    { code: 'CUSTOM', label: '✍️ Custom State...' }
];

const ApiSpecialSettingModal = ({ show, apiItem, onClose }) => {
    const apiService = ApiService();

    const [rules, setRules] = useState([]);
    const [dbCircles, setDbCircles] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form inputs for new rule
    const [operatorCode, setOperatorCode] = useState('JIO');
    const [circle, setCircle] = useState('ALL');
    const [customCircle, setCustomCircle] = useState('');
    const [amount, setAmount] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchCircles = async () => {
        try {
            const response = await apiService.vGet('/api/utility-circles');
            if (response.data && response.data.status === 1 && Array.isArray(response.data.data)) {
                setDbCircles(response.data.data);
            }
        } catch (error) {
            // Keep default list fallback
        }
    };

    const fetchRules = async () => {
        if (!apiItem?.id) return;
        setLoading(true);
        try {
            const response = await apiService.vGet(`/api/api-special-settings?api_id=${apiItem.id}`);
            if (response.data && response.data.status === 1) {
                setRules(response.data.data || []);
            } else {
                toast.error(response.data?.message || 'Failed to fetch special rules');
            }
        } catch (error) {
            toast.error('Error loading special plan rules');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show && apiItem) {
            fetchCircles();
            fetchRules();
        }
    }, [show, apiItem]);

    const handleAddRule = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            toast.warning('Please enter a valid amount');
            return;
        }

        const finalCircle = circle === 'CUSTOM' ? (customCircle.trim().toUpperCase() || 'ALL') : circle;

        setSaving(true);
        try {
            const response = await apiService.vPost('/api/api-special-settings', {
                api_id: apiItem.id,
                operator_code: operatorCode,
                circle: finalCircle,
                amount: parseFloat(amount),
                is_active: isActive
            });

            if (response.data && response.data.status === 1) {
                toast.success('Special Plan rule added successfully');
                setAmount('');
                setCustomCircle('');
                fetchRules();
            } else {
                toast.error(response.data?.message || 'Failed to add rule');
            }
        } catch (error) {
            toast.error('Error saving special plan rule');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (ruleId) => {
        try {
            const response = await apiService.vPost(`/api/api-special-settings/${ruleId}/toggle-status`, {});
            if (response.data && response.data.status === 1) {
                toast.success('Status updated');
                fetchRules();
            } else {
                toast.error('Failed to toggle status');
            }
        } catch (error) {
            toast.error('Error toggling rule status');
        }
    };

    const handleDeleteRule = async (ruleId) => {
        if (!window.confirm('Delete this special plan rule?')) return;
        try {
            const response = await apiService.vDelete(`/api/api-special-settings/${ruleId}`);
            if (response.data && response.data.status === 1) {
                toast.success('Rule deleted');
                fetchRules();
            } else {
                toast.error('Failed to delete rule');
            }
        } catch (error) {
            toast.error('Error deleting rule');
        }
    };

    if (!show || !apiItem) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg rounded-4">
                    
                    {/* Header */}
                    <div className="modal-header border-bottom px-4 py-3 bg-light rounded-top-4">
                        <div>
                            <h5 className="modal-title fw-bold text-dark mb-0" style={{ fontSize: '1.1rem' }}>
                                Special Plan Setting - <span style={{ color: '#6366f1' }}>{apiItem.api_name}</span>
                            </h5>
                            <p className="text-secondary small mb-0">
                                Recharges matching Circle, Operator & Amount will bypass pending checks and route through this API.
                            </p>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body p-4">
                        
                        {/* Form to Add Special Rule */}
                        <form onSubmit={handleAddRule} className="bg-light p-3 rounded-3 mb-4 border">
                            <h6 className="fw-bold text-secondary mb-3 small text-uppercase">Add Special Plan Rule</h6>
                            <div className="row g-3 align-items-end">
                                <div className="col-md-3">
                                    <label className="form-label small fw-semibold text-secondary mb-1">Operator</label>
                                    <select
                                        className="form-select form-select-sm rounded-3"
                                        value={operatorCode}
                                        onChange={(e) => setOperatorCode(e.target.value)}
                                    >
                                        <option value="ALL">ALL OPERATORS</option>
                                        <option value="JIO">JIO</option>
                                        <option value="AIRTEL">AIRTEL</option>
                                        <option value="VI">VI</option>
                                        <option value="BSNL">BSNL</option>
                                        <option value="DTH">DTH</option>
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label small fw-semibold text-secondary mb-1">State / Circle</label>
                                    <select
                                        className="form-select form-select-sm rounded-3"
                                        value={circle}
                                        onChange={(e) => setCircle(e.target.value)}
                                    >
                                        <option value="ALL">🌐 ALL STATES / ALL CIRCLES</option>
                                        {dbCircles.length > 0 ? (
                                            dbCircles.map((st) => (
                                                <option key={st.id} value={st.name}>
                                                    {st.name}
                                                </option>
                                            ))
                                        ) : (
                                            stateList.slice(1, -1).map((st) => (
                                                <option key={st.code} value={st.code}>
                                                    {st.label}
                                                </option>
                                            ))
                                        )}
                                        <option value="CUSTOM">✍️ Custom State...</option>
                                    </select>
                                    {circle === 'CUSTOM' && (
                                        <input
                                            type="text"
                                            className="form-control form-control-sm rounded-3 mt-2"
                                            placeholder="Enter State name"
                                            value={customCircle}
                                            onChange={(e) => setCustomCircle(e.target.value)}
                                            required
                                        />
                                    )}
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label small fw-semibold text-secondary mb-1">Amount (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="form-control form-control-sm rounded-3"
                                        placeholder="e.g. 299 (0 = All Amounts)"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="col-md-3">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="btn btn-sm w-100 text-white fw-bold py-2 rounded-3"
                                        style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                                    >
                                        <i className="fas fa-plus me-1"></i> {saving ? 'Adding...' : 'ADD RULE'}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Rules List Table */}
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 border" style={{ fontSize: '0.85rem' }}>
                                <thead className="bg-light">
                                    <tr className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                                        <th className="py-2 px-3">SR</th>
                                        <th className="py-2 px-3">OPERATOR</th>
                                        <th className="py-2 px-3">STATE / CIRCLE</th>
                                        <th className="py-2 px-3">AMOUNT</th>
                                        <th className="py-2 px-3 text-center">STATUS</th>
                                        <th className="py-2 px-3 text-center">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4">
                                                <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                            </td>
                                        </tr>
                                    ) : rules.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4 text-muted">
                                                No special plan rules added for this API yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        rules.map((rule, idx) => (
                                            <tr key={rule.id}>
                                                <td className="py-2 px-3 text-secondary">{idx + 1}</td>
                                                <td className="py-2 px-3 fw-bold text-dark">{rule.operator_code}</td>
                                                <td className="py-2 px-3">
                                                    {!rule.circle || rule.circle === 'ALL' ? (
                                                        <span className="badge bg-success-subtle text-success border border-success fw-bold px-2 py-1" style={{ fontSize: '0.72rem' }}>
                                                            <i className="fas fa-globe me-1"></i> ALL STATES
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-primary-subtle text-primary border border-primary fw-bold px-2 py-1" style={{ fontSize: '0.72rem' }}>
                                                            <i className="fas fa-map-marker-alt me-1"></i> {rule.circle}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2 px-3 fw-bold text-success">₹{parseFloat(rule.amount).toFixed(2)}</td>
                                                <td className="py-2 px-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(rule.id)}
                                                        className={`btn btn-sm px-3 rounded-pill text-white fw-semibold ${
                                                            rule.is_active ? 'bg-success' : 'bg-secondary'
                                                        }`}
                                                        style={{ fontSize: '0.7rem' }}
                                                    >
                                                        {rule.is_active ? 'ACTIVE' : 'INACTIVE'}
                                                    </button>
                                                </td>
                                                <td className="py-2 px-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteRule(rule.id)}
                                                        className="btn btn-sm btn-outline-danger p-1 border-0"
                                                        title="Delete Rule"
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer border-top pt-2 pb-3 px-4">
                        <button type="button" className="btn btn-secondary px-4 rounded-3" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiSpecialSettingModal;
