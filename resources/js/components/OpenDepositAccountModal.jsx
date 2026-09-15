import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApiService from '../core/services/ApiService';
import MemberSelectSearch from './MemberSelectSearch';
import MpinModal from './MpinModal';

export const calculateMaturity = (serviceType, amountStr, durationStr, rateStr) => {
    const P = parseFloat(amountStr || 0);
    const m = parseInt(durationStr || (serviceType === 'DD' ? 365 : 12), 10);
    const r = parseFloat(rateStr || 0);

    if (!P || P <= 0 || !m || m <= 0) {
        return { principal: 0, interest: 0, maturity: 0, monthlyPayout: 0 };
    }

    if (serviceType === 'FD') {
        const interest = P * (r / 100) * (m / 12);
        return { principal: P, interest: Math.round(interest), maturity: Math.round(P + interest), monthlyPayout: 0 };
    } else if (serviceType === 'RD') {
        const totalDeposit = P * m;
        const interest = P * (m * (m + 1) / 2) * (r / 1200);
        return { principal: totalDeposit, interest: Math.round(interest), maturity: Math.round(totalDeposit + interest), monthlyPayout: 0 };
    } else if (serviceType === 'DD') {
        const rate = r || 6.5;
        const days = m;
        const totalDeposit = P * days;
        const interest = P * (days * (days + 1) / 2) * (rate / 36500);
        return { principal: totalDeposit, interest: Math.round(interest), maturity: Math.round(totalDeposit + interest), monthlyPayout: 0 };
    } else if (serviceType === 'MIS') {
        const monthlyPayout = (P * (r / 100)) / 12;
        const totalInterest = monthlyPayout * m;
        return { principal: P, interest: Math.round(totalInterest), maturity: Math.round(P + totalInterest), monthlyPayout: Math.round(monthlyPayout) };
    }
    return { principal: P, interest: 0, maturity: P, monthlyPayout: 0 };
};

import FinancialDataCache from '../core/services/FinancialDataCache';

const OpenDepositAccountModal = ({ serviceType, isOpen, onClose, onSuccess, onOpenBond }) => {
    const api = ApiService();
    const [members, setMembers] = useState(() => FinancialDataCache.getCachedMembers());
    const [plans, setPlans] = useState(() => FinancialDataCache.getCachedPlans(serviceType));
    const [showMpin, setShowMpin] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const serviceMeta = {
        DD:  { name: 'Daily Deposit (DD)', title: 'Daily Deposit Account Opening', label: 'Daily Deposit Amount (₹)', bgColor: '#2563eb', btnColor: 'btn-warning text-dark', icon: 'bx-calendar-event', defaultRate: '6.5' },
        RD:  { name: 'Recurring Deposit (RD)', title: 'Recurring Deposit Account Opening', label: 'Monthly Installment Amount (₹)', bgColor: '#6f42c1', btnColor: 'btn-primary', icon: 'bx-time', defaultRate: '7.5' },
        FD:  { name: 'Fixed Deposit (FD)', title: 'Fixed Deposit Account Opening', label: 'Principal Deposit Amount (₹)', bgColor: '#ef4444', btnColor: 'btn-danger', icon: 'bx-lock-alt', defaultRate: '8.5' },
        MIS: { name: 'MIS (Monthly Income)', title: 'MIS Account Opening', label: 'Investment Amount (₹)', bgColor: '#06b6d4', btnColor: 'btn-info text-white', icon: 'bx-percent', defaultRate: '9.0' },
    }[serviceType] || { name: 'Account', title: 'Account Opening', label: 'Amount (₹)', bgColor: '#2563eb', btnColor: 'btn-primary', icon: 'bx-plus-circle', defaultRate: '7.5' };

    const [form, setForm] = useState({
        member_id: '',
        plan_id: '',
        plan_name: '',
        amount: '',
        min_amount: 0,
        max_amount: null,
        duration_months: serviceType === 'DD' ? '365' : '12',
        interest_rate: serviceMeta.defaultRate,
        min_tenor_months: serviceType === 'DD' ? 300 : serviceType === 'RD' ? 10 : 1,
        nominee_name: '',
        nominee_relation: '',
    });

    useEffect(() => {
        if (isOpen) {
            const cachedM = FinancialDataCache.getCachedMembers();
            const cachedP = FinancialDataCache.getCachedPlans(serviceType);
            if (cachedM.length > 0) setMembers(cachedM);
            if (cachedP.length > 0) setPlans(cachedP);

            // Background fetch / sync
            FinancialDataCache.getMembers(api).then(m => m && setMembers(m));
            FinancialDataCache.getPlans(api, serviceType).then(p => p && setPlans(p));

            setForm({
                member_id: '',
                plan_id: '',
                plan_name: '',
                amount: '',
                min_amount: 0,
                max_amount: null,
                duration_months: serviceType === 'DD' ? '365' : '12',
                interest_rate: serviceMeta.defaultRate,
                min_tenor_months: serviceType === 'DD' ? 300 : serviceType === 'RD' ? 10 : 1,
                nominee_name: '',
                nominee_relation: '',
            });
        }
    }, [isOpen, serviceType]);

    if (!isOpen) return null;

    const handlePlanChange = (e) => {
        const pId = e.target.value;
        if (!pId) return setForm(prev => ({
            ...prev, plan_id: '', plan_name: '', amount: '', min_amount: 0, max_amount: null,
            interest_rate: serviceMeta.defaultRate, min_tenor_months: serviceType === 'DD' ? 300 : serviceType === 'RD' ? 10 : 1
        }));
        const selected = plans.find(p => p.id == pId);
        if (selected) {
            const minAmt = parseFloat(selected.minimum_daily_deposit ?? selected.minimum_installment ?? selected.minimum_opening_amount ?? selected.minimum_investment ?? selected.min_amount ?? 0);
            const maxAmt = selected.maximum_daily_deposit ?? selected.maximum_installment ?? selected.maximum_opening_amount ?? selected.maximum_investment ?? selected.max_amount;
            const duration = selected.minimum_duration || selected.duration || (serviceType === 'DD' ? 365 : 12);
            const rate = selected.interest_rate ? String(selected.interest_rate) : serviceMeta.defaultRate;
            const minTenor = selected.minimum_installments || selected.minimum_tenor || (serviceType === 'DD' ? 300 : serviceType === 'RD' ? 10 : 1);

            setForm(prev => ({
                ...prev,
                plan_id: selected.id,
                plan_name: selected.plan_name,
                amount: minAmt > 0 ? String(minAmt) : '',
                min_amount: minAmt,
                max_amount: maxAmt ? parseFloat(maxAmt) : null,
                duration_months: String(duration),
                interest_rate: rate,
                min_tenor_months: minTenor
            }));
        }
    };

    const matResult = calculateMaturity(serviceType, form.amount, form.duration_months, form.interest_rate);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.member_id) return toast.error('Please select a member.');
        if (!form.plan_id && plans.length > 0) return toast.error('Please select an Account Plan.');
        const amt = parseFloat(form.amount || 0);
        if (form.min_amount > 0 && amt < form.min_amount) {
            return toast.error(`Amount must be at least ₹${form.min_amount}.`);
        }
        setShowMpin(true);
    };

    const handleMpinConfirm = async (pin) => {
        try {
            setSubmitting(true);
            const res = await api.vPost('/api/agent/financial/accounts/open', {
                ...form,
                service_type: serviceType,
                mpin: pin
            });
            if (res.data?.status === 1) {
                toast.success(res.data.message || `${serviceMeta.name} Account Opened Successfully!`);
                FinancialDataCache.invalidateSavingAccounts();
                setShowMpin(false);
                onClose();
                if (onSuccess) onSuccess();

                const createdAcc = res.data.data || {};
                const selectedMember = members.find(m => m.id == form.member_id);

                if (onOpenBond) {
                    onOpenBond({
                        ...createdAcc,
                        service_type: serviceType,
                        plan_name: form.plan_name,
                        opening_amount: parseFloat(form.amount || 0),
                        interest_rate: parseFloat(form.interest_rate || serviceMeta.defaultRate),
                        duration_months: parseInt(form.duration_months || (serviceType === 'DD' ? 365 : 12), 10),
                        maturity_amount: matResult.maturity,
                        estimated_interest: matResult.interest,
                        monthly_payout: matResult.monthlyPayout,
                        min_tenor_months: form.min_tenor_months || (serviceType === 'DD' ? 300 : 10),
                        nominee_name: form.nominee_name || createdAcc.nominee_name || selectedMember?.nominee_name,
                        nominee_relation: form.nominee_relation || createdAcc.nominee_relation || selectedMember?.nominee_relation,
                        member: selectedMember || createdAcc.member
                    });
                }
            } else {
                toast.error(res.data?.message || 'Account opening failed.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Transaction failed.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-0 py-3 px-4 rounded-top-4" style={{ backgroundColor: serviceMeta.bgColor, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className={`bx ${serviceMeta.icon}`} style={{ fontSize: '22px', color: '#ffffff' }}></i>
                                <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '17px' }}>{serviceMeta.title}</span>
                            </div>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose} style={{ filter: 'brightness(0) invert(1)' }}></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body p-4">
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Select Member <span className="text-danger">*</span></label>
                                    <MemberSelectSearch members={members} value={form.member_id} onChange={(id) => setForm(prev => ({...prev, member_id: id}))} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold d-flex justify-content-between">
                                        <span>Select Account Plan / Type <span className="text-danger">*</span></span>
                                        {form.plan_id && (
                                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle fs-6">
                                                Rate: {form.interest_rate}% p.a.
                                            </span>
                                        )}
                                    </label>
                                    <select className="form-select" value={form.plan_id} onChange={handlePlanChange} required>
                                        <option value="">-- Select Account Plan --</option>
                                        {plans.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.plan_name} ({p.interest_rate || serviceMeta.defaultRate}% p.a.)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">{serviceMeta.label} <span className="text-danger">*</span></label>
                                    <input
                                        type="number" className="form-control form-control-lg fw-bold"
                                        value={form.amount}
                                        onChange={e => setForm({...form, amount: e.target.value})}
                                        min={form.min_amount || 1}
                                        placeholder={form.min_amount ? `Min ₹${form.min_amount}` : 'Enter Amount'}
                                        required
                                    />
                                    {form.plan_id && form.min_amount > 0 && (
                                        <small className="text-muted mt-1 d-block">Min Opening Amount: ₹{form.min_amount}</small>
                                    )}
                                </div>

                                <div className="row g-3 mb-3">
                                    <div className="col-6">
                                        <label className="form-label fw-semibold">
                                            Duration ({serviceType === 'DD' ? 'Days' : 'Months'}) <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number" className="form-control form-control-lg fw-bold"
                                            value={form.duration_months}
                                            onChange={e => setForm({...form, duration_months: e.target.value})}
                                            min="1" required
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label fw-semibold text-danger">Minimum Number of EMI</label>
                                        <div className="input-group">
                                            <input
                                                type="text" className="form-control form-control-lg fw-bold bg-danger-subtle text-danger border-danger-subtle"
                                                value={`Min EMI ${form.min_tenor_months || 10} Times Required`}
                                                readOnly
                                            />
                                            <span className="input-group-text bg-danger-subtle text-danger border-danger-subtle"><i className="bx bx-shield-quarter"></i></span>
                                        </div>
                                    </div>
                                </div>

                                {matResult.maturity > 0 && (
                                    <div className="p-3 mb-2 rounded-3 border" style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="fw-bold text-success fs-6"><i className="bx bx-calculator me-1"></i> Dynamic Maturity Calculation</span>
                                            <span className="badge bg-danger text-white px-3 py-1">
                                                Min EMI {form.min_tenor_months || 10} Times Required
                                            </span>
                                        </div>
                                        <div className="row text-center g-2">
                                            <div className="col-4">
                                                <small className="text-muted d-block fw-semibold">Total Deposit</small>
                                                <strong className="fs-6 text-dark">₹{matResult.principal.toLocaleString('en-IN')}</strong>
                                            </div>
                                            <div className="col-4">
                                                <small className="text-muted d-block fw-semibold">Est. Interest ({form.interest_rate}% p.a.)</small>
                                                <strong className="fs-6 text-primary">+₹{matResult.interest.toLocaleString('en-IN')}</strong>
                                            </div>
                                            <div className="col-4">
                                                <small className="text-muted d-block fw-semibold">Est. Maturity Amount</small>
                                                <strong className="fs-5 text-success">₹{matResult.maturity.toLocaleString('en-IN')}</strong>
                                            </div>
                                        </div>
                                        {matResult.monthlyPayout > 0 && (
                                            <div className="mt-2 text-center text-info fw-bold small">
                                                * MIS Monthly Income Payout: ₹{matResult.monthlyPayout.toLocaleString('en-IN')} / month
                                            </div>
                                        )}
                                        <div className="mt-2 pt-2 border-top text-muted" style={{ fontSize: '11.5px' }}>
                                            <i className="bx bx-error-circle text-danger me-1"></i>
                                            <strong>Note:</strong> If pre-closed before min EMI requirement ({form.min_tenor_months || 10} Times), pre-close interest penalty (-2.0% p.a.) & fine deduction applies.
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer bg-light border-0 py-3 px-4">
                                <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
                                <button type="submit" className={`btn ${serviceMeta.btnColor} px-4 fw-bold`}>Proceed to MPIN & Open</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <MpinModal
                isOpen={showMpin}
                onClose={() => setShowMpin(false)}
                onConfirm={handleMpinConfirm}
                title={`Confirm & Open ${serviceMeta.name}`}
                serviceTitle={`${serviceMeta.name} Account Opening`}
                planName={form.plan_name || `${serviceType} Plan`}
                amount={parseFloat(form.amount || 0)}
                memberInfo={members.find(m => m.id == form.member_id)}
                walletName="Utility Wallet"
                loading={submitting}
            />
        </>
    );
};

export default OpenDepositAccountModal;
