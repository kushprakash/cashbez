import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../core/services/ApiService';
import { toast } from 'react-toastify';

const MyCommissionStructure = () => {
    const apiService = ApiService();

    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);
    const [moduleGroups, setModuleGroups] = useState({});
    const [activeTab, setActiveTab] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCommissionStructure = async () => {
        setLoading(true);
        try {
            const res = await apiService.vGet('/api/my-commission-structure');
            if (res?.data?.status === 1) {
                setUserInfo(res.data.user_info || null);
                setModuleGroups(res.data.module_groups || {});
            } else {
                toast.error(res?.data?.message || 'Failed to load commission structure');
            }
        } catch (err) {
            console.error('Error fetching commission structure:', err);
            toast.error('Failed to fetch commission slabs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissionStructure();
    }, []);

    // List of module group keys available
    const availableModuleNames = Object.keys(moduleGroups);

    // Get total items in a module group
    const getGroupItemCount = (modName) => {
        if (modName === 'ALL') {
            return Object.values(moduleGroups).reduce((acc, curr) => acc + (curr?.length || 0), 0);
        }
        return moduleGroups[modName]?.length || 0;
    };

    // Filter items per module group
    const getFilteredGroups = () => {
        const result = {};

        const filterItems = (items) => {
            if (!searchTerm.trim()) return items;
            const term = searchTerm.toLowerCase();
            return items.filter(i =>
                (i.title || '').toLowerCase().includes(term) ||
                (i.operator || '').toLowerCase().includes(term) ||
                (i.source || '').toLowerCase().includes(term) ||
                (i.module_name || '').toLowerCase().includes(term)
            );
        };

        if (activeTab === 'ALL') {
            Object.keys(moduleGroups).forEach(modName => {
                const filtered = filterItems(moduleGroups[modName] || []);
                if (filtered.length > 0) {
                    result[modName] = filtered;
                }
            });
        } else {
            const filtered = filterItems(moduleGroups[activeTab] || []);
            if (filtered.length > 0) {
                result[activeTab] = filtered;
            }
        }

        return result;
    };

    const filteredGroups = getFilteredGroups();
    const filteredGroupNames = Object.keys(filteredGroups);

    const getModuleIcon = (modName) => {
        const upper = modName.toUpperCase();
        if (upper.includes('AEPS')) return 'fas fa-fingerprint text-primary';
        if (upper.includes('MATM') || upper.includes('ATM')) return 'fas fa-credit-card text-info';
        if (upper.includes('CASH') || upper.includes('DEPOSIT')) return 'fas fa-university text-success';
        if (upper.includes('RECHARGE') || upper.includes('UTILITY')) return 'fas fa-mobile-alt text-purple';
        if (upper.includes('BILL') || upper.includes('BBPS')) return 'fas fa-file-invoice-dollar text-warning';
        if (upper.includes('PAYOUT') || upper.includes('SETTLEMENT')) return 'fas fa-money-bill-wave text-danger';
        if (upper.includes('DMT') || upper.includes('MONEY')) return 'fas fa-exchange-alt text-secondary';
        if (upper.includes('SPECIAL') || upper.includes('OFFER')) return 'fas fa-gift text-danger';
        return 'fas fa-cubes text-primary';
    };

    return (
        <div className="container-fluid px-3 py-3" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>


            {/* Module Type Tabs */}
            <div className="card border-0 rounded-4 shadow-sm bg-white mb-4">
                <div className="card-body p-2">
                    <ul className="nav nav-pills flex-wrap gap-2">
                        <li className="nav-item">
                            <button
                                type="button"
                                className={`nav-link rounded-3 fw-bold d-flex align-items-center gap-2 px-3 py-2 transition-all ${activeTab === 'ALL' ? 'active bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
                                onClick={() => setActiveTab('ALL')}
                            >
                                <i className="fas fa-th-large"></i>
                                <span>All Modules</span>
                                <span className={`badge rounded-pill ${activeTab === 'ALL' ? 'bg-white text-primary' : 'bg-secondary-subtle text-dark'}`}>
                                    {getGroupItemCount('ALL')}
                                </span>
                            </button>
                        </li>

                        {availableModuleNames.map((modName) => {
                            const count = getGroupItemCount(modName);
                            const isActive = activeTab === modName;
                            return (
                                <li className="nav-item" key={modName}>
                                    <button
                                        type="button"
                                        className={`nav-link rounded-3 fw-bold d-flex align-items-center gap-2 px-3 py-2 transition-all ${isActive ? 'active bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
                                        onClick={() => setActiveTab(modName)}
                                    >
                                        <i className={getModuleIcon(modName)}></i>
                                        <span>{modName}</span>
                                        <span className={`badge rounded-pill ${isActive ? 'bg-white text-primary' : 'bg-secondary-subtle text-dark'}`}>
                                            {count}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            {/* Search Bar */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div className="position-relative flex-grow-1" style={{ maxWidth: '400px' }}>
                    <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                    <input
                        type="text"
                        className="form-control rounded-pill ps-5 border-0 shadow-sm"
                        placeholder="Search service, operator, amount range..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="text-muted small fw-bold">
                    Total <span className="text-primary">{getGroupItemCount(activeTab)}</span> active slab rules
                </div>
            </div>

            {/* Module Type Wise Grouped Cards */}
            {loading ? (
                <div className="card border-0 rounded-4 shadow-sm bg-white p-5 text-center">
                    <div className="spinner-border text-primary me-2" role="status"></div>
                    <span className="fw-bold text-muted mt-2 d-block">Loading User Role Commission structure module type wise...</span>
                </div>
            ) : filteredGroupNames.length === 0 ? (
                <div className="card border-0 rounded-4 shadow-sm bg-white p-5 text-center text-muted">
                    <i className="fas fa-folder-open text-secondary display-5 mb-3 d-block"></i>
                    <h5>No active commission or charge slabs found.</h5>
                    <p className="small mb-0">Try changing your search term or select another Module Type tab.</p>
                </div>
            ) : (
                filteredGroupNames.map((modName, idx) => {
                    const items = filteredGroups[modName] || [];
                    return (
                        <div key={idx} className="card border-0 rounded-4 shadow-sm bg-white overflow-hidden mb-4">
                            {/* Module Header */}
                            <div className="card-header bg-light py-3 px-4 border-bottom d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-2">
                                    <i className={`${getModuleIcon(modName)} fs-5`}></i>
                                    <h5 className="fw-bold mb-0 text-dark">{modName}</h5>
                                </div>
                                <span className="badge bg-primary-subtle text-primary border border-primary px-3 py-1.5 rounded-pill fw-bold">
                                    {items.length} Slab Rules
                                </span>
                            </div>

                            {/* Slabs Table */}
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0" style={{ fontSize: '13.5px' }}>
                                    <thead className="table-dark">
                                        <tr>
                                            <th className="ps-4 py-3" style={{ width: '50px' }}>#</th>
                                            <th className="py-3">SubModule / Operator / Service</th>
                                            <th className="py-3">Type</th>
                                            <th className="py-3">Amount Range (Slab)</th>
                                            <th className="py-3 text-center">Commission / Charge Value</th>
                                            <th className="pe-4 py-3 text-end">Source Rule</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((row, rowIdx) => (
                                            <tr key={rowIdx}>
                                                <td className="ps-4 fw-bold text-muted">{rowIdx + 1}</td>
                                                <td>
                                                    <div className="fw-bold text-dark fs-6">{row.title}</div>
                                                    {row.operator_code && row.operator_code !== 'ALL' && (
                                                        <small className="text-muted">Code: <strong className="text-primary font-monospace">{row.operator_code}</strong></small>
                                                    )}
                                                </td>
                                                <td>
                                                    {row.txn_type === 'charge' ? (
                                                        <span className="badge bg-danger-subtle text-danger border border-danger px-2.5 py-1 rounded-pill fw-bold">
                                                            <i className="fas fa-minus-circle me-1"></i> Charge / Fee
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-success-subtle text-success border border-success px-2.5 py-1 rounded-pill fw-bold">
                                                            <i className="fas fa-plus-circle me-1"></i> Commission
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="font-monospace fw-bold text-dark">
                                                        ₹{row.from_amt} &rarr; ₹{row.to_amt}
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <div className={`font-monospace fw-extrabold fs-6 ${row.txn_type === 'charge' ? 'text-danger' : 'text-success'}`}>
                                                        {row.comm_type === '%' ? `${row.comm_val}%` : `₹${row.comm_val}`}
                                                    </div>
                                                    <small className="text-muted">({row.comm_type === '%' ? 'Percentage' : 'Flat Amount'})</small>
                                                </td>
                                                <td className="pe-4 text-end">
                                                    <span className="badge bg-light text-dark border px-3 py-1.5 rounded-pill fw-bold shadow-xs">
                                                        <i className="fas fa-cube text-primary me-1"></i> {row.source}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default MyCommissionStructure;
