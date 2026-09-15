import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ApiService from '../core/services/ApiService';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FinancialDataCache from '../core/services/FinancialDataCache';
import MpinModal from '../components/MpinModal';
import MemberSelectSearch from '../components/MemberSelectSearch';
import OpenDepositAccountModal from '../components/OpenDepositAccountModal';
import BankAccountBondModal from '../components/BankAccountBondModal';
import SavingWithdrawalModal from '../components/SavingWithdrawalModal';
import AccountDepositModal from '../components/AccountDepositModal';


/* ─────────────────────────────────────────────────────────────
   Styles
───────────────────────────────────────────────────────────── */
const S = {
    page: {
        backgroundColor: '#eef1f8', minHeight: '100vh',
        padding: '20px 20px 40px', fontFamily: "'Inter', 'Segoe UI', sans-serif",
    },
    headerTitle: {
        fontWeight: 800, fontSize: '22px', color: '#0f172a',
        display: 'flex', alignItems: 'center', gap: '8px', margin: 0,
    },
    walletPill: {
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: '50px',
        padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '10px',
        boxShadow: '0 1px 4px rgba(0,0,0,.06)',
    },
    walletIcon: {
        background: '#eff6ff', borderRadius: '8px', width: 34, height: 34,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: '#2563eb',
    },
    productCard: {
        background: '#fff', borderRadius: '14px', padding: '18px 18px 14px',
        boxShadow: '0 1px 6px rgba(0,0,0,.07)', border: '1px solid #f1f5f9', height: '100%',
    },
    cardTitle: { fontWeight: 700, fontSize: '15px', color: '#0f172a', marginBottom: '14px' },
    btnRow:     { display: 'flex', gap: '10px', marginBottom: '10px' },
    btnRowLast: { display: 'flex', gap: '10px' },
    btnPrimary: {
        flex: 1, background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '10px',
        padding: '10px 6px', fontWeight: 600, fontSize: '12.5px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap', lineHeight: 1.2,
    },
    btnLight: {
        flex: 1, background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '10px',
        padding: '10px 6px', fontWeight: 600, fontSize: '12.5px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap', lineHeight: 1.2,
    },
    btnGreen: {
        flex: 1, background: '#d1fae5', color: '#065f46', border: 'none', borderRadius: '10px',
        padding: '10px 6px', fontWeight: 600, fontSize: '12.5px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap', lineHeight: 1.2,
    },
    btnAmber: {
        flex: 1, background: '#fff7ed', color: '#92400e', border: 'none', borderRadius: '10px',
        padding: '10px 6px', fontWeight: 600, fontSize: '12.5px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap', lineHeight: 1.2,
    },
    btnGreenFull: {
        flex: 1, background: '#d1fae5', color: '#065f46', border: 'none', borderRadius: '10px',
        padding: '10px 6px', fontWeight: 600, fontSize: '12.5px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        cursor: 'pointer', textDecoration: 'none', lineHeight: 1.2,
    },
    panel: {
        background: '#fff', borderRadius: '14px', padding: '18px',
        boxShadow: '0 1px 6px rgba(0,0,0,.07)', border: '1px solid #f1f5f9', height: '100%',
    },
    metricCard: {
        background: '#fff', border: '1px solid #f1f5f9',
        borderRadius: '12px', padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,.05)',
    },
    commCard: {
        background: '#1d4ed8', borderRadius: '12px', padding: '16px',
        color: '#fff', height: '100%', display: 'flex', flexDirection: 'column',
    },
    commChartCard: {
        background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px',
        padding: '14px', height: '100%', display: 'flex', flexDirection: 'column',
    },
    pillGroup: {
        background: '#f1f5f9', borderRadius: '50px', padding: '3px', display: 'flex', gap: '2px',
    },
    pill: (active) => ({
        border: 'none', borderRadius: '50px', padding: '4px 14px', fontSize: '12px',
        fontWeight: 600, background: active ? '#1d4ed8' : 'transparent',
        color: active ? '#fff' : '#64748b', cursor: 'pointer',
    }),
};

/* ─── Instant Navigation & Action Helpers ─────────────────── */
const DashboardLink = ({ to, children, style, className = '' }) => {
    const navigate = useNavigate();
    return (
        <a
            href={to}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(to);
            }}
            className={className}
            style={{
                ...style,
                userSelect: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'manipulation',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
            <span style={{ pointerEvents: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}>
                {children}
            </span>
        </a>
    );
};

const DashboardBtn = ({ onClick, children, style, className = '', type = 'button' }) => {
    return (
        <button
            type={type}
            onClick={(e) => {
                e.stopPropagation();
                onClick && onClick(e);
            }}
            className={className}
            style={{
                ...style,
                userSelect: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'manipulation',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
            <span style={{ pointerEvents: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}>
                {children}
            </span>
        </button>
    );
};

/* ─── Convert data array → smooth SVG cubic bezier path ──── */
const toSvgPath = (values, viewW = 200, viewH = 50, padding = 4) => {
    if (!values || values.length === 0) return `M0,${viewH - padding}`;
    const max = Math.max(...values, 1);
    const pts = values.map((v, i) => ({
        x: (i / Math.max(values.length - 1, 1)) * viewW,
        y: viewH - padding - ((v / max) * (viewH - padding * 2)),
    }));
    if (pts.length === 1) return `M0,${pts[0].y} L${viewW},${pts[0].y}`;
    // Smooth bezier
    let d = `M${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const cpx = (prev.x + curr.x) / 2;
        d += ` C${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
    }
    return d;
};

/* ─── Real data wave line chart ──────────────────────────── */
const WaveChart = ({ data, key: dataKey, color, id, labels }) => {
    const values = (data || []).map(d => d[dataKey] || 0);
    const hasData = values.some(v => v > 0);
    const path = hasData ? toSvgPath(values, 200, 50, 4) : 'M0,42 C50,35 100,20 150,28 S180,35 200,15';
    const lastPt = (() => {
        if (!values.length) return { x: 200, y: 15 };
        const max = Math.max(...values, 1);
        const last = values[values.length - 1];
        return { x: 200, y: 50 - 4 - (last / max) * (50 - 8) };
    })();
    // Slice labels: show first, mid, last
    const showLabels = labels?.length > 4
        ? [labels[0], labels[Math.floor(labels.length / 3)], labels[Math.floor(labels.length * 2 / 3)], labels[labels.length - 1]]
        : (labels || []);

    return (
        <div>
            <svg viewBox="0 0 200 50" style={{ width: '100%', height: 46, display: 'block' }}>
                <defs>
                    <linearGradient id={`wg${id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`${path} L200,50 L0,50 Z`} fill={`url(#wg${id})`} />
                <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {hasData && (
                    <circle cx={lastPt.x} cy={lastPt.y} r="3" fill={color} stroke="#fff" strokeWidth="1.5" />
                )}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#94a3b8', marginTop: 2 }}>
                {showLabels.map((l, i) => <span key={i}>{l}</span>)}
            </div>
        </div>
    );
};

/* ─── Real data bar chart ─────────────────────────────────── */
const RealBarChart = ({ data, dataKey, color, labels }) => {
    const values = (data || []).map(d => d[dataKey] || 0);
    const displayData = values.length > 0 ? values : [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const hasData = values.some(v => v > 0);
    const max = Math.max(...displayData, 1);
    const total = 200;
    const w = total / displayData.length - 2;

    const showLabels = labels?.length > 4
        ? [labels[0], labels[Math.floor(labels.length / 3)], labels[Math.floor(labels.length * 2 / 3)], labels[labels.length - 1]]
        : (labels || []);

    return (
        <div>
            <svg viewBox={`0 0 ${total} 50`} style={{ width: '100%', height: 46, display: 'block' }}>
                {displayData.map((v, i) => {
                    const h = hasData ? Math.max((v / max) * 44, v > 0 ? 3 : 0) : (((i % 3) + 1) * 10);
                    return (
                        <rect key={i}
                            x={i * (total / displayData.length) + 1}
                            y={50 - h} width={w} height={h} rx="2"
                            fill={color} fillOpacity={i % 2 === 0 ? 0.9 : 0.5}
                        />
                    );
                })}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#94a3b8', marginTop: 2 }}>
                {showLabels.map((l, i) => <span key={i}>{l}</span>)}
            </div>
        </div>
    );
};

/* ─── Commission Earnings area chart ─────────────────────── */
const CommissionAreaChart = ({ data, labels }) => {
    const values = (data || []).map(d => d.commission || 0);
    const hasData = values.some(v => v > 0);

    const viewW = 240, viewH = 110;
    let areaPath = '', linePath = '', endPoint = { x: viewW, y: 10 };

    if (hasData) {
        const max = Math.max(...values, 1);
        const pts = values.map((v, i) => ({
            x: (i / Math.max(values.length - 1, 1)) * viewW,
            y: viewH - 8 - ((v / max) * (viewH - 20)),
        }));
        let pathD = `M${pts[0].x},${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) {
            const prev = pts[i - 1];
            const curr = pts[i];
            const cpx = (prev.x + curr.x) / 2;
            pathD += ` C${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
        }
        linePath = pathD;
        areaPath = `${pathD} L${viewW},${viewH} L0,${viewH} Z`;
        endPoint = pts[pts.length - 1];
    } else {
        // Fallback decorative path
        linePath = 'M0,105 C30,100 60,90 90,78 S140,60 170,48 S210,30 240,10';
        areaPath = 'M0,105 C30,100 60,90 90,78 S140,60 170,48 S210,30 240,10 L240,110 L0,110 Z';
        endPoint = { x: 240, y: 10 };
    }

    const showLabels = labels?.length > 7
        ? labels.filter((_, i) => i % Math.ceil(labels.length / 7) === 0 || i === labels.length - 1).slice(0, 7)
        : (labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']);

    return (
        <div style={{ display: 'flex', flex: 1, gap: 6 }}>
            {/* Y-axis */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 9, color: '#94a3b8', paddingBottom: 18, minWidth: 28, textAlign: 'right' }}>
                {hasData ? (() => {
                    const max = Math.max(...values);
                    return [max, max * 0.75, max * 0.5, max * 0.25, 0].map((v, i) => (
                        <span key={i}>{v >= 1000 ? Math.round(v / 1000) + 'K' : Math.round(v)}</span>
                    ));
                })() : ['250K', '200K', '150K', '100K', '50K'].map((l, i) => <span key={i}>{l}</span>)}
            </div>

            {/* Chart */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <svg viewBox={`0 0 ${viewW} ${viewH}`} style={{ width: '100%', flex: 1 }} preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="commGradReal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                        </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    {[viewH * 0.2, viewH * 0.4, viewH * 0.6, viewH * 0.8].map(y => (
                        <line key={y} x1="0" y1={y} x2={viewW} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 3" />
                    ))}
                    <path d={areaPath} fill="url(#commGradReal)" />
                    <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx={endPoint.x} cy={endPoint.y} r="4" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                </svg>
                {/* X-axis labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#94a3b8', paddingTop: 3 }}>
                    {showLabels.map((l, i) => <span key={i}>{l}</span>)}
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   Inline Dashboard Modals
───────────────────────────────────────────────────────────── */

const DashboardCreateMemberModal = ({ isOpen, onClose, onSuccess }) => {
    const api = ApiService();
    const [plans, setPlans] = useState(() => FinancialDataCache.getCachedMembershipPlans());
    const [submitting, setSubmitting] = useState(false);
    const [showMpin, setShowMpin] = useState(false);
    const [pendingForm, setPendingForm] = useState(null);

    const initialPlan = plans[0];
    const [form, setForm] = useState({
        name: '',
        father_name: '',
        dob: '',
        gender: 'male',
        mobile: '',
        email: '',
        address: '',
        pincode: '',
        membership_plan_id: initialPlan?.id || '',
        membership_fee: initialPlan?.total_fee || initialPlan?.membership_fee || 0,
        nominee_name: '',
        nominee_relation: '',
    });

    useEffect(() => {
        if (isOpen) {
            const cached = FinancialDataCache.getCachedMembershipPlans();
            if (cached.length > 0) {
                setPlans(cached);
                setForm(prev => ({
                    ...prev,
                    membership_plan_id: prev.membership_plan_id || cached[0].id,
                    membership_fee: prev.membership_fee || (cached[0].total_fee || cached[0].membership_fee || 0)
                }));
            }
            FinancialDataCache.getMembershipPlans(api).then(planList => {
                if (planList && planList.length > 0) {
                    setPlans(planList);
                    setForm(prev => ({
                        ...prev,
                        membership_plan_id: prev.membership_plan_id || planList[0].id,
                        membership_fee: prev.membership_fee || (planList[0].total_fee || planList[0].membership_fee || 0)
                    }));
                }
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePlanChange = (e) => {
        const pId = e.target.value;
        const selected = plans.find(p => p.id == pId);
        setForm(prev => ({
            ...prev,
            membership_plan_id: pId,
            membership_fee: selected ? (selected.total_fee || selected.membership_fee || 0) : 0
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || !form.mobile) {
            return toast.error('Please enter name and mobile number');
        }
        setPendingForm(form);
        const fee = parseFloat(form.membership_fee || 0);
        if (fee > 0) {
            setShowMpin(true);
        } else {
            submitMember(form, '');
        }
    };

    const submitMember = async (formData, mpinCode) => {
        try {
            setSubmitting(true);
            const res = await api.vPost('/api/agent/financial/members', { ...formData, mpin: mpinCode });
            if (res.data && res.data.status === 1) {
                FinancialDataCache.invalidateMembers();
                toast.success(res.data.message || 'Member registered successfully!');
                setShowMpin(false);
                onClose();
                onSuccess();
            } else {
                toast.error(res.data?.message || 'Failed to register member.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error occurred during registration.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-0 py-3 px-4 rounded-top-4" style={{ backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="bx bx-user-plus" style={{ fontSize: '22px', color: '#ffffff' }}></i>
                                <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '17px' }}>Register New Member</span>
                            </div>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose} style={{ filter: 'brightness(0) invert(1)' }}></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                                {plans.length > 0 && (
                                    <div className="mb-4">
                                        <label className="form-label fw-bold text-dark">Membership Plan <span className="text-danger">*</span></label>
                                        <select
                                            className="form-select form-select-lg fw-semibold text-primary"
                                            value={form.membership_plan_id}
                                            onChange={handlePlanChange}
                                            required
                                        >
                                            {plans.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.membership_name} ({p.membership_code}) — Fee: ₹{parseFloat(p.total_fee || p.membership_fee || 0).toFixed(2)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <h6 className="fw-bold text-primary mb-3"><i className="bx bx-id-card me-1"></i> Personal Details</h6>
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Full Name <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Father's Name</label>
                                        <input type="text" className="form-control" value={form.father_name} onChange={e => setForm({...form, father_name: e.target.value})} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Mobile Number <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} maxLength="10" required />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Gender</label>
                                        <select className="form-select" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Date of Birth</label>
                                        <input type="date" className="form-control" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} />
                                    </div>
                                </div>
                                <h6 className="fw-bold text-primary mb-3"><i className="bx bx-map me-1"></i> Address Details</h6>
                                <div className="row g-3 mb-4">
                                    <div className="col-md-8">
                                        <label className="form-label fw-semibold">Address</label>
                                        <input type="text" className="form-control" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Pincode</label>
                                        <input type="text" className="form-control" value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} />
                                    </div>
                                </div>
                                <h6 className="fw-bold text-primary mb-3"><i className="bx bx-user-check me-1"></i> Nominee Details</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Nominee Name</label>
                                        <input type="text" className="form-control" value={form.nominee_name} onChange={e => setForm({...form, nominee_name: e.target.value})} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Nominee Relation</label>
                                        <input type="text" className="form-control" value={form.nominee_relation} onChange={e => setForm({...form, nominee_relation: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer bg-light border-0 py-3 px-4 rounded-bottom-4">
                                <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
                                <button type="submit" className="btn btn-primary px-4 fw-bold shadow-sm">Proceed to Register Member</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <MpinModal
                isOpen={showMpin}
                onClose={() => setShowMpin(false)}
                onConfirm={(pin) => submitMember(pendingForm, pin)}
                title="Confirm & Register Member"
                serviceTitle="Membership Fee Payment"
                amount={pendingForm?.membership_fee}
                loading={submitting}
            />
        </>
    );
};

const DashboardOpenSavingModal = ({ isOpen, onClose, onSuccess }) => {
    const api = ApiService();
    const [members, setMembers] = useState(() => FinancialDataCache.getCachedMembers());
    const [plans, setPlans] = useState(() => FinancialDataCache.getCachedPlans('SAVING'));
    const [showMpin, setShowMpin] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        member_id: '',
        plan_id: '',
        plan_name: '',
        opening_amount: '',
        min_amount: 0,
        max_amount: null
    });

    useEffect(() => {
        if (isOpen) {
            const cachedM = FinancialDataCache.getCachedMembers();
            const cachedP = FinancialDataCache.getCachedPlans('SAVING');
            if (cachedM.length > 0) setMembers(cachedM);
            if (cachedP.length > 0) setPlans(cachedP);

            FinancialDataCache.getMembers(api).then(m => m && setMembers(m));
            FinancialDataCache.getPlans(api, 'SAVING').then(p => p && setPlans(p));
            setForm({
                member_id: '',
                plan_id: '',
                plan_name: '',
                opening_amount: '',
                min_amount: 0,
                max_amount: null
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePlanChange = (e) => {
        const pId = e.target.value;
        if (!pId) return setForm(prev => ({ ...prev, plan_id: '', plan_name: '', opening_amount: '', min_amount: 0, max_amount: null }));
        const selected = plans.find(p => p.id == pId);
        if (selected) {
            const minAmt = parseFloat(selected.minimum_opening_amount || selected.minimum_installment || selected.minimum_investment || selected.min_amount || 0);
            const maxAmt = selected.maximum_opening_amount ? parseFloat(selected.maximum_opening_amount) : null;
            setForm(prev => ({
                ...prev, plan_id: selected.id, plan_name: selected.plan_name,
                opening_amount: minAmt > 0 ? String(minAmt) : '', min_amount: minAmt, max_amount: maxAmt
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.member_id) return toast.error('Please select a member.');
        if (!form.plan_id && plans.length > 0) return toast.error('Please select an Account Plan.');
        const amount = parseFloat(form.opening_amount || 0);
        if (form.min_amount > 0 && amount < form.min_amount) {
            return toast.error(`Opening amount must be at least ₹${form.min_amount}.`);
        }
        setShowMpin(true);
    };

    const handleMpinConfirm = async (pin) => {
        try {
            setSubmitting(true);
            const res = await api.vPost('/api/agent/financial/saving/open', { ...form, mpin: pin });
            if (res.data?.status === 1) {
                FinancialDataCache.invalidateSavingAccounts();
                toast.success(res.data.message || 'Saving Account Opened Successfully!');
                setShowMpin(false);
                onClose();
                onSuccess();
            } else {
                toast.error(res.data?.message || 'Opening account failed.');
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
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-0 py-3 px-4 rounded-top-4" style={{ backgroundColor: '#10b981', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="bx bx-buildings" style={{ fontSize: '22px', color: '#ffffff' }}></i>
                                <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '17px' }}>Saving Account Opening</span>
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
                                    <label className="form-label fw-semibold">Select Account Plan / Type <span className="text-danger">*</span></label>
                                    <select className="form-select" value={form.plan_id} onChange={handlePlanChange} required>
                                        <option value="">-- Select Account Plan --</option>
                                        {plans.map(p => (
                                            <option key={p.id} value={p.id}>{p.plan_name} ({p.plan_code || 'PLAN'})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Opening Deposit Amount (₹) <span className="text-danger">*</span></label>
                                    <input
                                        type="number" className="form-control form-control-lg fw-bold"
                                        value={form.opening_amount}
                                        onChange={e => setForm({...form, opening_amount: e.target.value})}
                                        min={form.min_amount || 0}
                                        placeholder={form.min_amount ? `Min Amount ₹${form.min_amount}` : 'Enter Deposit Amount'}
                                        required
                                    />
                                    {form.plan_id && form.min_amount > 0 && (
                                        <small className="text-muted mt-1 d-block">Min Opening Amount: ₹{form.min_amount}</small>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer bg-light border-0 py-3 px-4">
                                <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
                                <button type="submit" className="btn btn-success px-4 fw-bold">OPEN ACCOUNT</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <MpinModal
                isOpen={showMpin}
                onClose={() => setShowMpin(false)}
                onConfirm={handleMpinConfirm}
                title="Confirm & Open Saving Account"
                serviceTitle="Saving Account Opening"
                planName={form.plan_name || "Saving Plan"}
                amount={parseFloat(form.opening_amount || 0)}
                memberInfo={members.find(m => m.id == form.member_id)}
                loading={submitting}
            />
        </>
    );
};


/* ═══════════════════════════════════════════════════════════
   MATURITY CALCULATOR HELPER
   ═══════════════════════════════════════════════════════════ */
const calculateMaturity = (serviceType, amountStr, durationStr, rateStr) => {
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

/* ═══════════════════════════════════════════════════════════ */
const AgentFinancialDashboard = () => {
    const api = useMemo(() => ApiService(), []);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [summary, setSummary] = useState(null);
    const [timeFilter, setTimeFilter] = useState('Today');
    const [activeModal, setActiveModal] = useState(null); // 'CREATE_MEMBER' | 'OPEN_SAVING' | 'OPEN_DD' | 'OPEN_RD' | 'OPEN_FD' | 'OPEN_MIS'
    const [bondModalData, setBondModalData] = useState(null);
    const summaryCache = useRef({});

    const fetchSummary = useCallback(async (period, force = false) => {
        if (!force && summaryCache.current[period]) {
            setSummary(summaryCache.current[period]);
            setRefreshing(true);
        } else {
            if (!summary) setLoading(true);
            else setRefreshing(true);
        }
        try {
            const res = await api.vGet(`/api/agent/financial/dashboard?period=${encodeURIComponent(period)}`);
            if (res?.data?.status === 1) {
                summaryCache.current[period] = res.data.data;
                setSummary(res.data.data);
            }
        } catch (e) {
            console.error('Dashboard fetch failed', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [api, summary]);

    useEffect(() => { fetchSummary(timeFilter); }, [timeFilter, fetchSummary]);

    useEffect(() => {
        // Preload common caches in background for instant modal opens
        FinancialDataCache.getMembers(api);
        FinancialDataCache.getMembershipPlans(api);
        FinancialDataCache.getPlans(api, 'SAVING');
        FinancialDataCache.getPlans(api, 'DD');
        FinancialDataCache.getPlans(api, 'RD');
        FinancialDataCache.getPlans(api, 'FD');
        FinancialDataCache.getPlans(api, 'MIS');
        FinancialDataCache.getSavingAccounts(api);
    }, [api]);

    const handleModalSuccess = useCallback(() => {
        summaryCache.current = {};
        fetchSummary(timeFilter, true);
    }, [fetchSummary, timeFilter]);

    const kpis        = summary?.kpis || {};
    const wallet      = summary?.utility_wallet;
    const comm        = kpis.commissions || {};
    const periodTrend = summary?.period_trend || [];
    const monthTrend  = summary?.monthly_trend || [];

    // Use period_trend for charts (matches selected time filter)
    const trendLabels = periodTrend.map(d => d.label);

    const fmt  = (n, dec = 2) => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    const fmtN = (n) => Number(n || 0).toLocaleString('en-IN');

    const totalEarnings = kpis.total_earnings ?? 0;

    const commRows = [
        { dot: '#38bdf8', label: 'Member Commission',         val: comm.member_commission  ?? 0 },
        { dot: '#06b6d4', label: 'Saving Deposit Commission', val: comm.saving_commission  ?? 0 },
        { dot: '#10b981', label: 'DD Deposit Commission',     val: comm.dd_commission      ?? 0 },
        { dot: '#f87171', label: 'RD Deposit Commission',     val: comm.rd_commission      ?? 0 },
        { dot: '#fbbf24', label: 'FD Commission',             val: comm.fd_commission      ?? 0 },
        { dot: '#a78bfa', label: 'MIS Commission',            val: comm.mis_commission     ?? 0 },
    ];

    return (
        <div style={S.page}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <h2 style={S.headerTitle}>
                    <i className="bx bx-bar-chart-alt-2" style={{ fontSize: 26, color: '#2563eb' }}></i>
                    Financial Dashboard
                </h2>
                <div style={S.walletPill}>
                    <div style={S.walletIcon}><i className="bx bx-wallet-alt"></i></div>
                    <div>
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Utility Wallet Balance</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                            ₹{wallet ? fmt(wallet.balance) : '0.00'}
                        </div>
                    </div>
                </div>
            </div>

            {/* 6 Product Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }}>

                <div style={S.productCard}>
                    <div style={S.cardTitle}>Member</div>
                    <div style={S.btnRow}>
                        <DashboardBtn onClick={() => setActiveModal('CREATE_MEMBER')} style={S.btnPrimary}>
                            <i className="bx bx-user-plus" style={{ fontSize: 16 }}></i>
                            <span>Create Member</span>
                        </DashboardBtn>
                        <DashboardLink to="/agent/members" style={S.btnLight}>
                            <i className="bx bx-list-ul" style={{ fontSize: 16 }}></i>
                            <span>Member List</span>
                        </DashboardLink>
                    </div>
                    <div style={S.btnRowLast}>
                        <DashboardLink to="/agent/members" style={{ ...S.btnGreen, fontSize: '11.5px' }}>
                            <i className="bx bx-shield-quarter" style={{ fontSize: 16 }}></i>
                            <span>KYC Approved Member</span>
                        </DashboardLink>
                        <DashboardLink to="/agent/kyc-pending" style={{ ...S.btnAmber, fontSize: '11.5px' }}>
                            <i className="bx bx-time-five" style={{ fontSize: 16 }}></i>
                            <span>KYC Pending Member</span>
                        </DashboardLink>
                    </div>
                </div>

                <div style={S.productCard}>
                    <div style={S.cardTitle}>Saving</div>
                    <div style={S.btnRow}>
                        <DashboardBtn onClick={() => setActiveModal('OPEN_SAVING')} style={S.btnPrimary}>
                            <i className="bx bx-buildings" style={{ fontSize: 16 }}></i>
                            <span>Open Account</span>
                        </DashboardBtn>
                        <DashboardLink to="/agent/saving-accounts" style={S.btnLight}>
                            <i className="bx bx-list-ul" style={{ fontSize: 16 }}></i>
                            <span>Account List</span>
                        </DashboardLink>
                    </div>
                    <div style={S.btnRowLast}>
                        <DashboardBtn onClick={() => setActiveModal('DEPOSIT_SAVING')} style={{ ...S.btnGreen, border: 'none' }}>
                            <i className="bx bx-money" style={{ fontSize: 16 }}></i>
                            <span>Deposit</span>
                        </DashboardBtn>
                        <DashboardBtn onClick={() => setActiveModal('WITHDRAW_SAVING')} style={{ ...S.btnGreen, background: '#ecfdf5', border: 'none' }}>
                            <i className="bx bx-wallet" style={{ fontSize: 16 }}></i>
                            <span>Withdrawal</span>
                        </DashboardBtn>
                    </div>
                </div>

                <div style={S.productCard}>
                    <div style={S.cardTitle}>Daily Deposit</div>
                    <div style={S.btnRow}>
                        <DashboardBtn onClick={() => setActiveModal('OPEN_DD')} style={S.btnPrimary}>
                            <i className="bx bx-plus-circle" style={{ fontSize: 16 }}></i>
                            <span>Open Account</span>
                        </DashboardBtn>
                        <DashboardLink to="/agent/dd-accounts" style={S.btnLight}>
                            <i className="bx bx-list-ul" style={{ fontSize: 16 }}></i>
                            <span>Account List</span>
                        </DashboardLink>
                    </div>
                    <div style={S.btnRowLast}>
                        <DashboardBtn onClick={() => setActiveModal('DEPOSIT_DD')} style={{ ...S.btnGreen, border: 'none' }}>
                            <i className="bx bx-transfer" style={{ fontSize: 16 }}></i>
                            <span>Deposit</span>
                        </DashboardBtn>
                        <DashboardLink to="/agent/maturity-center" style={{ ...S.btnGreen, fontSize: '11.5px' }}>
                            <i className="bx bx-calendar-check" style={{ fontSize: 16 }}></i>
                            <span>Maturity Accounts</span>
                        </DashboardLink>
                    </div>
                </div>

                <div style={S.productCard}>
                    <div style={S.cardTitle}>Recurring Deposit</div>
                    <div style={S.btnRow}>
                        <DashboardBtn onClick={() => setActiveModal('OPEN_RD')} style={S.btnPrimary}>
                            <i className="bx bx-time" style={{ fontSize: 16 }}></i>
                            <span>Open Account</span>
                        </DashboardBtn>
                        <DashboardLink to="/agent/rd-accounts" style={S.btnLight}>
                            <i className="bx bx-list-ul" style={{ fontSize: 16 }}></i>
                            <span>Account List</span>
                        </DashboardLink>
                    </div>
                    <div style={S.btnRowLast}>
                        <DashboardBtn onClick={() => setActiveModal('DEPOSIT_RD')} style={{ ...S.btnGreen, border: 'none' }}>
                            <i className="bx bx-money-withdraw" style={{ fontSize: 16 }}></i>
                            <span>Deposit</span>
                        </DashboardBtn>
                        <DashboardLink to="/agent/maturity-center" style={{ ...S.btnGreen, fontSize: '11.5px' }}>
                            <i className="bx bx-refresh" style={{ fontSize: 16 }}></i>
                            <span>Maturity Accounts</span>
                        </DashboardLink>
                    </div>
                </div>

                <div style={S.productCard}>
                    <div style={S.cardTitle}>Fixed Deposit</div>
                    <div style={S.btnRow}>
                        <DashboardBtn onClick={() => setActiveModal('OPEN_FD')} style={S.btnPrimary}>
                            <i className="bx bx-lock-alt" style={{ fontSize: 16 }}></i>
                            <span>Open Account</span>
                        </DashboardBtn>
                        <DashboardLink to="/agent/fd-accounts" style={S.btnLight}>
                            <i className="bx bx-list-ul" style={{ fontSize: 16 }}></i>
                            <span>Account List</span>
                        </DashboardLink>
                    </div>
                    <div style={S.btnRowLast}>
                        <DashboardLink to="/agent/maturity-center" style={S.btnGreenFull}>
                            <i className="bx bx-layer-plus" style={{ fontSize: 16 }}></i>
                            <span>Maturity Accounts</span>
                        </DashboardLink>
                    </div>
                </div>

                <div style={S.productCard}>
                    <div style={S.cardTitle}>MIS</div>
                    <div style={S.btnRow}>
                        <DashboardBtn onClick={() => setActiveModal('OPEN_MIS')} style={S.btnPrimary}>
                            <i className="bx bx-percent" style={{ fontSize: 16 }}></i>
                            <span>Open Account</span>
                        </DashboardBtn>
                        <DashboardLink to="/agent/mis-accounts" style={S.btnLight}>
                            <i className="bx bx-list-ul" style={{ fontSize: 16 }}></i>
                            <span>Account List</span>
                        </DashboardLink>
                    </div>
                    <div style={S.btnRowLast}>
                        <DashboardLink to="/agent/maturity-center" style={S.btnGreenFull}>
                            <i className="bx bx-calendar" style={{ fontSize: 16 }}></i>
                            <span>Maturity Accounts</span>
                        </DashboardLink>
                    </div>
                </div>

            </div>

            {/* Render Dashboard Modals — Lazy conditional mounting for maximum performance */}
            {activeModal === 'CREATE_MEMBER' && (
                <DashboardCreateMemberModal
                    isOpen={true}
                    onClose={() => setActiveModal(null)}
                    onSuccess={handleModalSuccess}
                />
            )}
            {activeModal === 'OPEN_SAVING' && (
                <DashboardOpenSavingModal
                    isOpen={true}
                    onClose={() => setActiveModal(null)}
                    onSuccess={handleModalSuccess}
                />
            )}
            {activeModal === 'OPEN_DD' && (
                <OpenDepositAccountModal
                    serviceType="DD"
                    isOpen={true}
                    onClose={() => setActiveModal(null)}
                    onSuccess={handleModalSuccess}
                    onOpenBond={(bondData) => setBondModalData(bondData)}
                />
            )}
            {activeModal === 'OPEN_RD' && (
                <OpenDepositAccountModal
                    serviceType="RD"
                    isOpen={true}
                    onClose={() => setActiveModal(null)}
                    onSuccess={handleModalSuccess}
                    onOpenBond={(bondData) => setBondModalData(bondData)}
                />
            )}
            {activeModal === 'OPEN_FD' && (
                <OpenDepositAccountModal
                    serviceType="FD"
                    isOpen={true}
                    onClose={() => setActiveModal(null)}
                    onSuccess={handleModalSuccess}
                    onOpenBond={(bondData) => setBondModalData(bondData)}
                />
            )}
            {activeModal === 'OPEN_MIS' && (
                <OpenDepositAccountModal
                    serviceType="MIS"
                    isOpen={true}
                    onClose={() => setActiveModal(null)}
                    onSuccess={handleModalSuccess}
                    onOpenBond={(bondData) => setBondModalData(bondData)}
                />
            )}
            {activeModal === 'WITHDRAW_SAVING' && (
                <SavingWithdrawalModal
                    isOpen={true}
                    onClose={() => setActiveModal(null)}
                    onSuccess={handleModalSuccess}
                />
            )}

            {/* Deposit Modals */}
            {activeModal === 'DEPOSIT_SAVING' && (
                <AccountDepositModal
                    isOpen={true}
                    serviceType="SAVING"
                    onClose={() => setActiveModal(null)}
                    onSuccess={handleModalSuccess}
                />
            )}
            {activeModal === 'DEPOSIT_DD' && (
                <AccountDepositModal
                    isOpen={true}
                    serviceType="DD"
                    onClose={() => setActiveModal(null)}
                    onSuccess={handleModalSuccess}
                />
            )}
            {activeModal === 'DEPOSIT_RD' && (
                <AccountDepositModal
                    isOpen={true}
                    serviceType="RD"
                    onClose={() => setActiveModal(null)}
                    onSuccess={handleModalSuccess}
                />
            )}

            {/* Bank Account Bond Certificate Modal */}
            {bondModalData && (
                <BankAccountBondModal
                    isOpen={true}
                    bondData={bondModalData}
                    onClose={() => setBondModalData(null)}
                />
            )}



            {/* Bottom Two Panels */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 14 }}>

                {/* Business Analytics */}
                <div style={S.panel}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <i className="bx bx-trending-up" style={{ fontSize: 20, color: '#2563eb' }}></i>
                            <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>Business Analytics</span>
                            {refreshing && (
                                <span style={{ fontSize: 11, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500 }}>
                                    <i className="bx bx-loader-alt bx-spin"></i>
                                </span>
                            )}
                        </div>
                        <div style={S.pillGroup}>
                            {['Today', 'This Week', 'This Month', 'This Year'].map(p => (
                                <button key={p} style={S.pill(timeFilter === p)} onClick={() => setTimeFilter(p)}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading && !summary ? (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
                            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 28 }}></i>
                            <div style={{ marginTop: 8, fontSize: 13 }}>Loading data...</div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, opacity: refreshing ? 0.75 : 1, transition: 'opacity 0.15s ease' }}>

                            {/* Total Deposits — wave line from period_trend deposits */}
                            <div style={S.metricCard}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Total Deposits</span>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#dcfce7', borderRadius: 50, padding: '1px 6px', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <i className="bx bx-up-arrow-alt" style={{ fontSize: 11 }}></i>Trend
                                    </span>
                                </div>
                                <div style={{ fontWeight: 800, fontSize: 17, color: '#0f172a', marginBottom: 6 }}>
                                    ₹{fmt(kpis.period_deposits_sum ?? 0)}
                                </div>
                                <WaveChart data={periodTrend} dataKey="deposit" color="#2563eb" id="dep" labels={trendLabels} />
                            </div>

                            {/* New Accounts — wave from monthly member additions */}
                            <div style={S.metricCard}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>New Accounts</span>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', background: '#fee2e2', borderRadius: 50, padding: '1px 6px', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <i className="bx bx-up-arrow-alt" style={{ fontSize: 11 }}></i>Trend
                                    </span>
                                </div>
                                <div style={{ fontWeight: 800, fontSize: 17, color: '#0f172a', marginBottom: 6 }}>
                                    {fmtN(kpis.total_accounts ?? 0)}
                                </div>
                                {/* Use 12-month member trend for accounts */}
                                <WaveChart
                                    data={monthTrend}
                                    dataKey="new_members"
                                    color="#10b981"
                                    id="acc"
                                    labels={monthTrend.map(d => d.month)}
                                />
                            </div>

                            {/* Transactions — bar from period_trend txn_count */}
                            <div style={S.metricCard}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Transactions</span>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#dcfce7', borderRadius: 50, padding: '1px 6px', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <i className="bx bx-up-arrow-alt" style={{ fontSize: 11 }}></i>Trend
                                    </span>
                                </div>
                                <div style={{ fontWeight: 800, fontSize: 17, color: '#0f172a', marginBottom: 6 }}>
                                    {fmtN(kpis.period_txn_count ?? 0)}
                                </div>
                                <RealBarChart data={periodTrend} dataKey="txn_count" color="#10b981" labels={trendLabels} />
                            </div>

                            {/* Active Users — bar from 12-month trend txn_count */}
                            <div style={S.metricCard}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Active Members</span>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#2563eb', background: '#dbeafe', borderRadius: 50, padding: '1px 7px', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <i className="bx bx-user" style={{ fontSize: 11 }}></i>Active
                                    </span>
                                </div>
                                <div style={{ fontWeight: 800, fontSize: 17, color: '#0f172a', marginBottom: 6 }}>
                                    {fmtN(kpis.active_members ?? kpis.total_members ?? 0)}
                                </div>
                                <RealBarChart data={monthTrend} dataKey="txn_count" color="#2563eb" labels={monthTrend.map(d => d.month)} />
                            </div>

                        </div>
                    )}
                </div>

                {/* Commission Earnings */}
                <div style={S.panel}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>Commission Earnings</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <i className="bx bx-calendar" style={{ fontSize: 13 }}></i>{timeFilter}
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, height: 'calc(100% - 46px)' }}>

                        {/* Blue total card */}
                        <div style={S.commCard}>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>
                                Total Earnings ({timeFilter})
                            </div>
                            <div style={{ fontWeight: 900, fontSize: 20, color: '#fff', marginBottom: 12 }}>
                                {loading && !summary
                                    ? <i className="bx bx-loader-alt bx-spin"></i>
                                    : `₹${fmt(totalEarnings)}`
                                }
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                                {commRows.map((r, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,.75)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: r.dot, display: 'inline-block', flexShrink: 0 }}></span>
                                            {r.label}
                                        </span>
                                        <strong style={{ fontSize: 10.5, color: '#fff' }}>
                                            {loading && !summary ? '—' : `₹${fmt(r.val)}`}
                                        </strong>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Commission area chart — real period_trend commission data */}
                        <div style={S.commChartCard}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Commission</span>
                                <span style={{ fontSize: 11, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 5, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 3 }}>
                                    {timeFilter} <i className="bx bx-chevron-down" style={{ fontSize: 12 }}></i>
                                </span>
                            </div>
                            {loading && !summary ? (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                    <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 24 }}></i>
                                </div>
                            ) : (
                                <CommissionAreaChart data={periodTrend} labels={trendLabels} />
                            )}
                        </div>

                    </div>
                </div>

            </div>

        </div>
    );
};

export default AgentFinancialDashboard;
