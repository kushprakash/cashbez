import React, { useState, useEffect } from 'react';
import ApiService from '../core/services/ApiService';
import FinancialSettingsView from './masters/FinancialSettingsView';
import MembershipPlanMaster from './masters/MembershipPlanMaster';
import PlanMasterView from './masters/PlanMasterView';
import ChargePenaltyMaster from './masters/ChargePenaltyMaster';

const FinancialMasterHub = () => {
    const api = ApiService();
    const [activeTab, setActiveTab] = useState('SETTINGS'); // SETTINGS, MEMBERSHIP, SAVING, DD, RD, FD, MIS, CHARGES
    const [summary, setSummary] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(true);

    // Super Admin state
    const [adminsList, setAdminsList] = useState([]);
    const [selectedAdminId, setSelectedAdminId] = useState('');

    const fetchSummary = async () => {
        try {
            setLoadingSummary(true);
            let url = '/api/financial/master/summary';
            if (selectedAdminId) url += `?admin_id=${selectedAdminId}`;
            const res = await api.vGet(url);
            if (res.data && res.data.status === 1) {
                setSummary(res.data.data);
                if (res.data.data.is_super_admin && adminsList.length === 0) {
                    fetchAdminsList();
                }
            }
        } catch (err) {
            console.error('Failed to fetch master summary', err);
        } finally {
            setLoadingSummary(false);
        }
    };

    const fetchAdminsList = async () => {
        try {
            const res = await api.vGet('/api/financial/super-admin/admins-list');
            if (res.data && res.data.status === 1) {
                setAdminsList(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch admin list', err);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, [selectedAdminId]);

    const masterButtons = [
        { key: 'SETTINGS', label: 'General & KYC Settings', icon: 'bx-cog', color: 'primary', desc: 'System prefixes, age limits & KYC mandatory rules' },
        { key: 'MEMBERSHIP', label: 'Membership Master', icon: 'bx-id-card', color: 'success', desc: 'Configure membership types, fees & GST' },
        { key: 'SAVING', label: 'Saving Plan Master', icon: 'bx-wallet', color: 'info', desc: 'Saving account min balance & interest rules' },
        { key: 'DD', label: 'Daily Deposit (DD)', icon: 'bx-calendar-event', color: 'warning', desc: 'Daily collection plans & grace periods' },
        { key: 'RD', label: 'Recurring Deposit (RD)', icon: 'bx-refresh', color: 'purple', desc: 'Monthly installments & compounding rules' },
        { key: 'FD', label: 'Fixed Deposit (FD)', icon: 'bx-vault', color: 'danger', desc: 'FD interest payout, lock-in & premature penalty' },
        { key: 'MIS', label: 'MIS Plan Master', icon: 'bx-line-chart', color: 'teal', desc: 'Monthly income scheme investment & payouts' },
        { key: 'CHARGES', label: 'Charges & Penalties', icon: 'bx-error', color: 'dark', desc: 'Fee schedules, service charges & late penalties' },
    ];

    return (
        <div className="container-fluid py-4">
            {/* Header Title */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom">
                <div>
                    <h3 className="fw-bold text-dark mb-1">
                        <i className="bx bx-store-alt text-primary me-2"></i> Financial Master Center
                    </h3>
                    <p className="text-muted mb-0">Central control room for all financial product configurations, membership plans, settings & charges</p>
                </div>

                {/* Super Admin Tenant Filter */}
                {summary && summary.is_super_admin && (
                    <div className="card shadow-sm border-0 bg-light p-2 mt-2 mt-md-0" style={{ minWidth: '300px' }}>
                        <div className="d-flex align-items-center">
                            <i className="bx bx-shield-quarter text-danger fs-4 me-2"></i>
                            <div className="flex-grow-1">
                                <label className="form-label mb-0 fw-bold text-dark small">Super Admin - View Report For:</label>
                                <select
                                    className="form-select form-select-sm mt-1"
                                    value={selectedAdminId}
                                    onChange={(e) => setSelectedAdminId(e.target.value)}
                                >
                                    <option value="">All Admins / Aggregate Data</option>
                                    {adminsList.map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.name} ({a.email || a.mobile || `MID: ${a.mid}`})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* KPI Summary Cards */}
            <div className="row g-3 mb-4">
                <div className="col-xl-3 col-md-6">
                    <div className="card border-0 shadow-sm rounded-3 bg-gradient bg-primary text-white">
                        <div className="card-body p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <span className="text-white-50 small fw-medium">Active Financial Plans</span>
                                <h3 className="fw-bold text-white mb-0 mt-1">
                                    {loadingSummary ? '...' : summary?.active_plans ?? 0}
                                </h3>
                            </div>
                            <div className="bg-white bg-opacity-25 rounded-circle p-3">
                                <i className="bx bx-layers fs-2 text-white"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6">
                    <div className="card border-0 shadow-sm rounded-3 bg-gradient bg-success text-white">
                        <div className="card-body p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <span className="text-white-50 small fw-medium">Active Memberships</span>
                                <h3 className="fw-bold text-white mb-0 mt-1">
                                    {loadingSummary ? '...' : summary?.active_memberships ?? 0}
                                </h3>
                            </div>
                            <div className="bg-white bg-opacity-25 rounded-circle p-3">
                                <i className="bx bx-id-card fs-2 text-white"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6">
                    <div className="card border-0 shadow-sm rounded-3 bg-gradient bg-info text-white">
                        <div className="card-body p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <span className="text-white-50 small fw-medium">Configured Charges & Fees</span>
                                <h3 className="fw-bold text-white mb-0 mt-1">
                                    {loadingSummary ? '...' : summary?.total_charges_penalties ?? 0}
                                </h3>
                            </div>
                            <div className="bg-white bg-opacity-25 rounded-circle p-3">
                                <i className="bx bx-coin-stack fs-2 text-white"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6">
                    <div className="card border-0 shadow-sm rounded-3 bg-gradient bg-secondary text-white">
                        <div className="card-body p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <span className="text-white-50 small fw-medium">KYC Rule at Withdrawal</span>
                                <h4 className="fw-bold text-white mb-0 mt-1">
                                    {summary?.settings?.kyc_required_at_withdrawal ? 'MANDATORY' : 'OPTIONAL'}
                                </h4>
                            </div>
                            <div className="bg-white bg-opacity-25 rounded-circle p-3">
                                <i className="bx bx-lock-alt fs-2 text-white"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Master Links Button Grid */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3">
                    <h6 className="mb-0 fw-bold text-dark">
                        <i className="bx bx-grid-alt text-primary me-2"></i> Master Management Modules
                    </h6>
                </div>
                <div className="card-body p-3">
                    <div className="row g-3">
                        {masterButtons.map((btn) => {
                            const isActive = activeTab === btn.key;
                            return (
                                <div key={btn.key} className="col-xl-3 col-md-4 col-sm-6">
                                    <button
                                        type="button"
                                        className={`btn w-100 text-start p-3 rounded-3 border transition-all h-100 ${
                                            isActive
                                                ? 'btn-primary text-white shadow'
                                                : 'btn-light hover-shadow text-dark border-light-subtle'
                                        }`}
                                        onClick={() => setActiveTab(btn.key)}
                                    >
                                        <div className="d-flex align-items-center mb-2">
                                            <i className={`bx ${btn.icon} fs-3 me-2 ${isActive ? 'text-white' : 'text-primary'}`}></i>
                                            <span className="fw-bold fs-6">{btn.label}</span>
                                        </div>
                                        <p className={`small mb-0 ${isActive ? 'text-white-50' : 'text-muted'}`}>
                                            {btn.desc}
                                        </p>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Active View Container */}
            <div className="active-master-view">
                {activeTab === 'SETTINGS' && (
                    <FinancialSettingsView selectedAdminId={selectedAdminId} />
                )}

                {activeTab === 'MEMBERSHIP' && (
                    <MembershipPlanMaster selectedAdminId={selectedAdminId} />
                )}

                {activeTab === 'SAVING' && (
                    <PlanMasterView serviceType="SAVING" selectedAdminId={selectedAdminId} />
                )}

                {activeTab === 'DD' && (
                    <PlanMasterView serviceType="DD" selectedAdminId={selectedAdminId} />
                )}

                {activeTab === 'RD' && (
                    <PlanMasterView serviceType="RD" selectedAdminId={selectedAdminId} />
                )}

                {activeTab === 'FD' && (
                    <PlanMasterView serviceType="FD" selectedAdminId={selectedAdminId} />
                )}

                {activeTab === 'MIS' && (
                    <PlanMasterView serviceType="MIS" selectedAdminId={selectedAdminId} />
                )}

                {activeTab === 'CHARGES' && (
                    <ChargePenaltyMaster selectedAdminId={selectedAdminId} />
                )}
            </div>
        </div>
    );
};

export default FinancialMasterHub;
