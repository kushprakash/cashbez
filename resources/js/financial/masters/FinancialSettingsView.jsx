import React, { useState, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';

const FinancialSettingsView = ({ selectedAdminId }) => {
    const api = ApiService();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    const [form, setForm] = useState({
        financial_service_name: 'Financial Services',
        financial_service_code: 'FIN',
        currency: 'INR',
        financial_year: '2026-2027',
        member_id_prefix: 'MEM',
        account_number_prefix: 'ACC',
        transaction_id_prefix: 'TXN',
        receipt_prefix: 'REC',
        minimum_member_age: 18,
        maximum_member_age: 80,
        kyc_required_at_account_opening: false,
        kyc_required_at_withdrawal: true,
        aadhaar_verification_required: false,
        pan_verification_required: false,
        bank_verification_required: false,
        withdrawal_approval_required: false,
        account_opening_approval_required: false,
        account_closure_approval_required: false,
        transaction_approval_required: false,
        minimum_withdrawal: 100,
        maximum_withdrawal: 100000,
        daily_withdrawal_limit: 50000,
        monthly_withdrawal_limit: 500000,
        cash_withdrawal_limit: 25000,
        bank_transfer_limit: 100000,
        maturity_notification_days: 7,
        prematurity_notification_days: 7,
        maturity_payment_approval_required: true,
        maturity_kyc_required: true,
        maturity_bank_verification_required: true,
    });

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const url = selectedAdminId ? `/api/financial/settings?admin_id=${selectedAdminId}` : '/api/financial/settings';
            const res = await api.vGet(url);
            if (res.data && res.data.status === 1) {
                setForm(prev => ({ ...prev, ...res.data.data }));
            }
        } catch (err) {
            console.error('Failed to fetch settings', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, [selectedAdminId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setMessage({ type: '', text: '' });
            const payload = { ...form };
            if (selectedAdminId) {
                payload.admin_id = selectedAdminId;
            }
            const res = await api.vPost('/api/financial/settings', payload);
            if (res.data && res.data.status === 1) {
                setMessage({ type: 'success', text: 'Financial Settings updated successfully!' });
            } else {
                setMessage({ type: 'danger', text: res.data.message || 'Failed to update settings.' });
            }
        } catch (err) {
            setMessage({ type: 'danger', text: 'Error saving settings: ' + err.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 text-center">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Loading Financial Settings...</p>
            </div>
        );
    }

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-gradient-primary text-white d-flex align-items-center justify-content-between py-3">
                <h5 className="mb-0 fw-bold">
                    <i className="bx bx-cog me-2"></i> Financial System & KYC Master Settings
                </h5>
                <span className="badge bg-light text-primary fw-semibold px-3 py-2">
                    Scope: {selectedAdminId ? `Admin ID ${selectedAdminId}` : 'Current Tenant'}
                </span>
            </div>
            <div className="card-body p-4">
                {message.text && (
                    <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                        {message.text}
                        <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* General Settings */}
                    <div className="mb-4">
                        <h6 className="text-primary border-bottom pb-2 mb-3 fw-bold">
                            <i className="bx bx-slider-alt me-1"></i> General Settings
                        </h6>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label fw-medium">Financial Service Name</label>
                                <input type="text" className="form-control" name="financial_service_name" value={form.financial_service_name || ''} onChange={handleChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-medium">Service Code</label>
                                <input type="text" className="form-control" name="financial_service_code" value={form.financial_service_code || ''} onChange={handleChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-medium">Currency</label>
                                <input type="text" className="form-control" name="currency" value={form.currency || ''} onChange={handleChange} required />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label fw-medium">Member ID Prefix</label>
                                <input type="text" className="form-control" name="member_id_prefix" value={form.member_id_prefix || ''} onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-medium">Account Prefix</label>
                                <input type="text" className="form-control" name="account_number_prefix" value={form.account_number_prefix || ''} onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-medium">Transaction Prefix</label>
                                <input type="text" className="form-control" name="transaction_id_prefix" value={form.transaction_id_prefix || ''} onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-medium">Receipt Prefix</label>
                                <input type="text" className="form-control" name="receipt_prefix" value={form.receipt_prefix || ''} onChange={handleChange} />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-medium">Minimum Member Age (Years)</label>
                                <input type="number" className="form-control" name="minimum_member_age" value={form.minimum_member_age || 18} onChange={handleChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-medium">Maximum Member Age (Years)</label>
                                <input type="number" className="form-control" name="maximum_member_age" value={form.maximum_member_age || 80} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* KYC Settings */}
                    <div className="mb-4">
                        <h6 className="text-primary border-bottom pb-2 mb-3 fw-bold">
                            <i className="bx bx-id-card me-1"></i> KYC & Verification Rules
                        </h6>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <div className="form-check form-switch card p-3 shadow-sm border">
                                    <input className="form-check-input ms-0 me-3" type="checkbox" name="kyc_required_at_account_opening" id="kyc_opening" checked={form.kyc_required_at_account_opening} onChange={handleChange} />
                                    <label className="form-check-label fw-semibold" htmlFor="kyc_opening">
                                        Mandatory KYC at Account Opening
                                        <div className="text-muted small fw-normal">Default: False (Can open accounts before KYC approval)</div>
                                    </label>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-check form-switch card p-3 shadow-sm border bg-light">
                                    <input className="form-check-input ms-0 me-3" type="checkbox" name="kyc_required_at_withdrawal" id="kyc_withdrawal" checked={form.kyc_required_at_withdrawal} onChange={handleChange} />
                                    <label className="form-check-label fw-semibold text-danger" htmlFor="kyc_withdrawal">
                                        Mandatory KYC at Withdrawal / Settlement
                                        <div className="text-muted small fw-normal">Default: True (Withdrawals strictly blocked until KYC approved)</div>
                                    </label>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" name="aadhaar_verification_required" id="aadhaar_req" checked={form.aadhaar_verification_required} onChange={handleChange} />
                                    <label className="form-check-label" htmlFor="aadhaar_req">Require Aadhaar Verification</label>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" name="pan_verification_required" id="pan_req" checked={form.pan_verification_required} onChange={handleChange} />
                                    <label className="form-check-label" htmlFor="pan_req">Require PAN Verification</label>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" name="bank_verification_required" id="bank_req" checked={form.bank_verification_required} onChange={handleChange} />
                                    <label className="form-check-label" htmlFor="bank_req">Require Bank Verification</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Withdrawal Limits & Approval */}
                    <div className="mb-4">
                        <h6 className="text-primary border-bottom pb-2 mb-3 fw-bold">
                            <i className="bx bx-dollar-circle me-1"></i> Withdrawal Limits & Approvals
                        </h6>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label fw-medium">Minimum Withdrawal</label>
                                <input type="number" step="0.01" className="form-control" name="minimum_withdrawal" value={form.minimum_withdrawal || 0} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-medium">Maximum Withdrawal (Per Txn)</label>
                                <input type="number" step="0.01" className="form-control" name="maximum_withdrawal" value={form.maximum_withdrawal || 0} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-medium">Daily Withdrawal Limit</label>
                                <input type="number" step="0.01" className="form-control" name="daily_withdrawal_limit" value={form.daily_withdrawal_limit || 0} onChange={handleChange} />
                            </div>

                            <div className="col-md-4">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" name="withdrawal_approval_required" id="w_appr" checked={form.withdrawal_approval_required} onChange={handleChange} />
                                    <label className="form-check-label" htmlFor="w_appr">Require Withdrawal Approval</label>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" name="account_opening_approval_required" id="acc_appr" checked={form.account_opening_approval_required} onChange={handleChange} />
                                    <label className="form-check-label" htmlFor="acc_appr">Require Account Opening Approval</label>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" name="maturity_payment_approval_required" id="mat_appr" checked={form.maturity_payment_approval_required} onChange={handleChange} />
                                    <label className="form-check-label" htmlFor="mat_appr">Require Maturity Approval</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end">
                        <button type="submit" className="btn btn-primary px-4 py-2 fw-semibold" disabled={saving}>
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span> Saving...
                                </>
                            ) : (
                                <>
                                    <i className="bx bx-save me-1"></i> Save Settings
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FinancialSettingsView;
