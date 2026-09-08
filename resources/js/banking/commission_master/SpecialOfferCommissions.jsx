import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SpecialOfferCommissions = () => {
    const navigate = useNavigate();
    const apiService = ApiService();

    const [offers, setOffers] = useState([]);
    const [apis, setApis] = useState([]);
    const [circles, setCircles] = useState([]);
    const [roles, setRoles] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form inputs
    const [title, setTitle] = useState('');
    const [selectedApiId, setSelectedApiId] = useState('');
    const [operatorCode, setOperatorCode] = useState('JIO');
    const [circle, setCircle] = useState('ALL');
    const [amount, setAmount] = useState('0');
    const [commissionType, setCommissionType] = useState('percentage');
    const [commissionVal, setCommissionVal] = useState('');
    const [assignType, setAssignType] = useState('all');
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [userQuery, setUserQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [offRes, apiRes, circRes, roleRes, userRes] = await Promise.all([
                apiService.vGet('/api/commission-master/special-offers'),
                apiService.vGet('/api/api-pending-settings?service_type=Prepaid'),
                apiService.vGet('/api/utility-circles'),
                apiService.vGet('/api/commission-master/roles'),
                apiService.vGet('/api/commission-master/users/search?q=')
            ]);

            if (offRes.data && offRes.data.status === 1) setOffers(offRes.data.data || []);
            if (apiRes.data && apiRes.data.status === 1 && apiRes.data.data?.apis) setApis(apiRes.data.data.apis);
            if (circRes.data && circRes.data.status === 1) setCircles(circRes.data.data || []);
            if (roleRes.data && roleRes.data.status === 1) setRoles(roleRes.data.data || []);
            if (userRes.data && userRes.data.status === 1) {
                setAllUsers(userRes.data.data || []);
                setSearchResults(userRes.data.data || []);
            }
        } catch (error) {
            toast.error('Error loading special offers data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Search user for special offer assignment
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (userQuery.trim().length > 0) {
                try {
                    const response = await apiService.vGet(`/api/commission-master/users/search?q=${encodeURIComponent(userQuery)}`);
                    if (response.data && response.data.status === 1) {
                        setSearchResults(response.data.data || []);
                    }
                } catch (error) {
                    // ignore
                }
            } else {
                setSearchResults(allUsers);
            }
        }, 200);
        return () => clearTimeout(timer);
    }, [userQuery, allUsers]);

    const handleCreateOffer = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.warning('Please enter offer title');
            return;
        }
        if (!commissionVal || parseFloat(commissionVal) < 0) {
            toast.warning('Please enter valid commission value');
            return;
        }
        if (assignType === 'user' && !selectedUser) {
            toast.warning('Please select a specific user');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                title: title,
                api_id: selectedApiId || null,
                operator_code: operatorCode,
                circle: circle,
                amount: parseFloat(amount) || 0,
                commission_type: commissionType,
                commission_val: parseFloat(commissionVal) || 0,
                assign_type: assignType,
                role_id: assignType === 'role' ? selectedRoleId : null,
                user_id: assignType === 'user' && selectedUser ? selectedUser.id : null
            };

            const response = await apiService.vPost('/api/commission-master/special-offers', payload);
            if (response.data && response.data.status === 1) {
                toast.success('Special offer commission rule created!');
                setTitle('');
                setAmount('0');
                setCommissionVal('');
                setSelectedUser(null);
                setUserQuery('');
                fetchData();
            } else {
                toast.error(response.data?.message || 'Failed to create special offer');
            }
        } catch (error) {
            toast.error('Error saving special offer rule');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (offerId) => {
        try {
            const response = await apiService.vPost(`/api/commission-master/special-offers/${offerId}/toggle-status`, {});
            if (response.data && response.data.status === 1) {
                toast.success('Special offer status updated');
                fetchData();
            } else {
                toast.error('Failed to toggle status');
            }
        } catch (error) {
            toast.error('Error toggling status');
        }
    };

    const handleDeleteOffer = async (offerId) => {
        if (!window.confirm('Delete this special offer rule?')) return;
        try {
            const response = await apiService.vDelete(`/api/commission-master/special-offers/${offerId}`);
            if (response.data && response.data.status === 1) {
                toast.success('Special offer deleted');
                fetchData();
            } else {
                toast.error('Failed to delete offer');
            }
        } catch (error) {
            toast.error('Error deleting offer');
        }
    };

    return (
        <div className="page-content-box mt-0 pt-0">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 px-2 pt-3">
                <div>
                    <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.2rem' }}>
                        <span className="text-muted fw-normal">Commission Master / </span>
                        <span className="text-secondary fw-bold">Special Offer Commissions</span>
                    </h5>
                    <p className="text-secondary small mb-0">Create special promotional commission rules for specific Operator + Circle + Amount combinations</p>
                </div>
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/commission-master/packages')}
                        className="btn btn-sm btn-outline-primary rounded-3 px-3 fw-semibold"
                    >
                        <i className="fas fa-boxes me-1"></i> Packages List
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/commission-master/assignments')}
                        className="btn btn-sm btn-outline-primary rounded-3 px-3 fw-semibold"
                    >
                        <i className="fas fa-user-tag me-1"></i> Assignments
                    </button>
                </div>
            </div>

            {/* Form Card */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4 bg-light rounded-4 border">
                    <h6 className="fw-bold text-dark mb-3 small text-uppercase">
                        <i className="fas fa-gift text-warning me-1"></i> Add Special Offer Commission Rule
                    </h6>

                    <form onSubmit={handleCreateOffer}>
                        <div className="row g-3 align-items-end">
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold text-secondary mb-1">Offer Title <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm rounded-3"
                                    placeholder="e.g. JIO Bihar ₹299 5% Extra Offer"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

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
                                    <option value="ALL">🌐 ALL STATES / CIRCLES</option>
                                    {circles.map(c => (
                                        <option key={c.id} value={c.name}>📍 {c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-2">
                                <label className="form-label small fw-semibold text-secondary mb-1">Amount (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="form-control form-control-sm rounded-3"
                                    placeholder="0 = All Amounts"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label small fw-semibold text-secondary mb-1">Commission Type & Rate</label>
                                <div className="input-group input-group-sm">
                                    <select
                                        className="form-select form-select-sm"
                                        value={commissionType}
                                        onChange={(e) => setCommissionType(e.target.value)}
                                        style={{ maxWidth: '110px' }}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="flat">Flat (₹)</option>
                                    </select>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="form-control form-control-sm text-end fw-bold text-success"
                                        placeholder="e.g. 5.00"
                                        value={commissionVal}
                                        onChange={(e) => setCommissionVal(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="col-md-3">
                                <label className="form-label small fw-semibold text-secondary mb-1">Assign Offer Scope</label>
                                <select
                                    className="form-select form-select-sm rounded-3"
                                    value={assignType}
                                    onChange={(e) => {
                                        setAssignType(e.target.value);
                                        setSelectedUser(null);
                                    }}
                                >
                                    <option value="all">🌐 ALL USERS (Global Offer)</option>
                                    <option value="role">👥 Specific User Role</option>
                                    <option value="user">👤 Specific Individual User</option>
                                </select>
                            </div>

                            {assignType === 'role' && (
                                <div className="col-md-3">
                                    <label className="form-label small fw-semibold text-secondary mb-1">Select Role</label>
                                    <select
                                        className="form-select form-select-sm rounded-3"
                                        value={selectedRoleId}
                                        onChange={(e) => setSelectedRoleId(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Select Role --</option>
                                        {roles.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {assignType === 'user' && (
                                <div className="col-md-3 position-relative">
                                    <label className="form-label small fw-semibold text-secondary mb-1">Search User</label>

                                    <div className="input-group input-group-sm">
                                        <input
                                            type="text"
                                            className="form-control form-control-sm rounded-3 fw-semibold"
                                            placeholder="Name / MID / Mobile"
                                            value={selectedUser ? `${selectedUser.name} ${selectedUser.mid ? '— MID: ' + selectedUser.mid : ''}` : userQuery}
                                            onFocus={() => setShowUserDropdown(true)}
                                            onChange={(e) => {
                                                setSelectedUser(null);
                                                setUserQuery(e.target.value);
                                                setShowUserDropdown(true);
                                            }}
                                            required={!selectedUser}
                                        />
                                        {selectedUser && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm rounded-end-3"
                                                onClick={() => {
                                                    setSelectedUser(null);
                                                    setUserQuery('');
                                                }}
                                                title="Clear Selection"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>

                                    {showUserDropdown && searchResults.length > 0 && !selectedUser && (
                                        <ul className="list-group position-absolute w-100 shadow-lg border mt-1" style={{ zIndex: 1050, maxHeight: '220px', overflowY: 'auto' }}>
                                            {searchResults.map((u) => (
                                                <button
                                                    key={u.id}
                                                    type="button"
                                                    className="list-group-item list-group-item-action small py-2 px-3 text-start border-bottom"
                                                    onClick={() => {
                                                        setSelectedUser(u);
                                                        setShowUserDropdown(false);
                                                    }}
                                                >
                                                    <div className="fw-bold text-dark">{u.name}</div>
                                                    <div className="text-primary small" style={{ fontSize: '0.75rem' }}>
                                                        {u.mid ? `MID: ${u.mid}` : ''} {u.mobile ? `| Mobile: ${u.mobile}` : ''}
                                                    </div>
                                                </button>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            <div className="col-md-3">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn btn-sm text-white fw-bold w-100 py-2 rounded-3"
                                    style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                                >
                                    <i className="fas fa-plus me-1"></i> {saving ? 'SAVING...' : 'CREATE SPECIAL OFFER'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Special Offer Rules Table */}
            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                    <h6 className="fw-bold text-dark mb-3 small text-uppercase">
                        Active Special Offer Commission Rules
                    </h6>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 border" style={{ fontSize: '0.85rem' }}>
                            <thead className="bg-light">
                                <tr className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                                    <th className="py-3 px-3">SR NO</th>
                                    <th className="py-3 px-3">OFFER TITLE</th>
                                    <th className="py-3 px-3">OPERATOR</th>
                                    <th className="py-3 px-3">CIRCLE</th>
                                    <th className="py-3 px-3">PLAN AMOUNT</th>
                                    <th className="py-3 px-3">SPECIAL COMMISSION</th>
                                    <th className="py-3 px-3">ASSIGNED TO</th>
                                    <th className="py-3 px-3 text-center">STATUS</th>
                                    <th className="py-3 px-3 text-center">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                        </td>
                                    </tr>
                                ) : offers.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-5 text-muted">
                                            No special offer commission rules created yet. Use the form above to add one.
                                        </td>
                                    </tr>
                                ) : (
                                    offers.map((off, idx) => (
                                        <tr key={off.id}>
                                            <td className="py-3 px-3 text-secondary">{idx + 1}</td>
                                            <td className="py-3 px-3 fw-bold text-dark">{off.title}</td>
                                            <td className="py-3 px-3 fw-semibold text-primary">{off.operator_code}</td>
                                            <td className="py-3 px-3 text-secondary">{off.circle || 'ALL'}</td>
                                            <td className="py-3 px-3 fw-bold text-dark">
                                                {off.amount > 0 ? `₹${off.amount}` : 'ALL Amounts'}
                                            </td>
                                            <td className="py-3 px-3 fw-bold text-success">
                                                {off.commission_type === 'percentage' ? `${off.commission_val}%` : `₹${off.commission_val}`}
                                            </td>
                                            <td className="py-3 px-3">
                                                {off.assign_type === 'all' && <span className="badge bg-success-subtle text-success border">🌐 ALL USERS</span>}
                                                {off.assign_type === 'role' && <span className="badge bg-primary-subtle text-primary border">👥 {off.role_info?.name || 'Role'}</span>}
                                                {off.assign_type === 'user' && (
                                                    <span className="badge bg-info-subtle text-info border">
                                                        👤 {off.user_info?.name || 'User'} {off.user_info?.mid ? `(MID: ${off.user_info.mid})` : ''}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(off.id)}
                                                    className={`btn btn-sm px-3 rounded-pill text-white fw-semibold ${off.is_active ? 'bg-success' : 'bg-secondary'}`}
                                                    style={{ fontSize: '0.7rem' }}
                                                >
                                                    {off.is_active ? 'ACTIVE' : 'INACTIVE'}
                                                </button>
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteOffer(off.id)}
                                                    className="btn btn-sm btn-outline-danger border-0 p-1"
                                                    title="Delete Offer"
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
            </div>
        </div>
    );
};

export default SpecialOfferCommissions;
