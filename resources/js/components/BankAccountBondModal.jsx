import React from 'react';

const BankAccountBondModal = ({ isOpen, bondData, onClose }) => {
    if (!isOpen || !bondData) return null;

    const handlePrint = () => {
        window.print();
    };

    const {
        account_number,
        service_type = 'DD',
        plan_name,
        opening_amount,
        current_balance,
        interest_rate = 7.5,
        duration_months = 12,
        created_at,
        member,
        nominee_name,
        nominee_relation,
        maturity_amount,
        estimated_interest,
        monthly_payout,
        min_tenor_months = service_type === 'DD' ? 300 : 10,
    } = bondData;

    const memberName = member?.name || 'Valued Member';
    const memberCode = member?.member_code || member?.id || 'MB-001';
    const memberPhone = member?.mobile || member?.phone || 'N/A';
    const memberAddress = member?.address || 'Registered Address';
    const openingDate = created_at ? new Date(created_at).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');

    const matDate = new Date();
    matDate.setMonth(matDate.getMonth() + parseInt(duration_months || 12, 10));
    const maturityDateStr = matDate.toLocaleDateString('en-IN');

    // Calculate maturity amount if not provided
    const P = Number(opening_amount || current_balance || 0);
    const r = Number(interest_rate || 7.5);
    const m = Number(duration_months || (service_type === 'DD' ? 365 : 12));
    
    let calcMat = maturity_amount;
    if (!calcMat || calcMat <= 0) {
        if (service_type === 'FD') {
            calcMat = Math.round(P + (P * (r / 100) * (m / 12)));
        } else if (service_type === 'RD') {
            const tot = P * m;
            const inst = P * (m * (m + 1) / 2) * (r / 1200);
            calcMat = Math.round(tot + inst);
        } else if (service_type === 'DD') {
            const days = m;
            const tot = P * days;
            const inst = P * (days * (days + 1) / 2) * (r / 36500);
            calcMat = Math.round(tot + inst);
        } else {
            calcMat = P;
        }
    }

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 1060 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    
                    {/* Non-printable modal header */}
                    <div className="modal-header bg-dark text-white border-0 py-3 px-4 no-print d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                            <i className="bx bx-award text-warning fs-4"></i>
                            <span className="fw-bold fs-5 text-white">Official Account Bond & Deposit Certificate</span>
                        </div>
                        <div className="d-flex gap-2">
                            <button type="button" className="btn btn-warning btn-sm fw-bold d-flex align-items-center gap-1" onClick={handlePrint}>
                                <i className="bx bx-printer"></i> Print Bond Certificate
                            </button>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>
                    </div>

                    <div className="modal-body p-4 bg-white" id="printable-bond-certificate">
                        <style>{`
                            @media print {
                                body * { visibility: hidden !important; }
                                #printable-bond-certificate, #printable-bond-certificate * { visibility: visible !important; }
                                #printable-bond-certificate { position: fixed !important; left: 0 !important; top: 0 !important; width: 100% !important; height: 100% !important; padding: 20px !important; margin: 0 !important; background: white !important; }
                                .no-print { display: none !important; }
                            }
                        `}</style>

                        {/* Certificate Main Frame */}
                        <div style={{
                            border: '6px double #1e3a8a',
                            borderRadius: '12px',
                            padding: '24px',
                            background: '#fffdf9',
                            position: 'relative',
                            boxShadow: 'inset 0 0 100px rgba(30, 58, 138, 0.03)'
                        }}>
                            {/* Watermark Logo */}
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                fontSize: '160px',
                                color: 'rgba(30, 58, 138, 0.03)',
                                fontWeight: 900,
                                userSelect: 'none',
                                pointerEvents: 'none',
                                textTransform: 'uppercase'
                            }}>
                                CASHBEZ
                            </div>

                            {/* Header Banner */}
                            <div style={{ textAlign: 'center', borderBottom: '2px solid #1e3a8a', paddingBottom: '16px', marginBottom: '20px' }}>
                                <div style={{ fontSize: '24px', fontWeight: 900, color: '#1e3a8a', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                    CASHBEZ FINANCIAL SERVICES NIDHI LIMITED
                                </div>
                                <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600, marginTop: '2px' }}>
                                    Govt. Registered Nidhi Bank Institution | Member Deposit Certificate
                                </div>
                                <div style={{
                                    display: 'inline-block',
                                    background: '#1e3a8a',
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    fontSize: '13px',
                                    padding: '4px 20px',
                                    borderRadius: '50px',
                                    marginTop: '10px',
                                    letterSpacing: '0.5px'
                                }}>
                                    {service_type} ACCOUNT CERTIFICATE & DEPOSIT BOND
                                </div>
                            </div>

                            {/* Bond No & Key Meta */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '16px', background: '#eff6ff', padding: '8px 14px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                                <span>BOND NO: <strong style={{ color: '#1e3a8a' }}>BND-{account_number}</strong></span>
                                <span>ACCOUNT NO: <strong style={{ color: '#1e3a8a' }}>{account_number}</strong></span>
                                <span>ISSUE DATE: <strong style={{ color: '#1e3a8a' }}>{openingDate}</strong></span>
                                <span>MATURITY DATE: <strong style={{ color: '#1e3a8a' }}>{maturityDateStr}</strong></span>
                            </div>

                            {/* Details Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                
                                {/* Member Details */}
                                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e3a8a', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <i className="bx bx-user-pin"></i> MEMBER DETAILS
                                    </div>
                                    <table style={{ width: '100%', fontSize: '12px' }}>
                                        <tbody>
                                            <tr><td style={{ color: '#64748b', padding: '3px 0' }}>Member Name:</td><td style={{ fontWeight: 700, color: '#0f172a' }}>{memberName}</td></tr>
                                            <tr><td style={{ color: '#64748b', padding: '3px 0' }}>Member Code:</td><td style={{ fontWeight: 700, color: '#0f172a' }}>{memberCode}</td></tr>
                                            <tr><td style={{ color: '#64748b', padding: '3px 0' }}>Contact No:</td><td style={{ fontWeight: 700, color: '#0f172a' }}>{memberPhone}</td></tr>
                                            <tr><td style={{ color: '#64748b', padding: '3px 0' }}>Address:</td><td style={{ fontWeight: 600, color: '#0f172a' }}>{memberAddress}</td></tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Nominee Details & Plan Info */}
                                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e3a8a', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <i className="bx bx-id-card"></i> NOMINEE & PLAN DETAILS
                                    </div>
                                    <table style={{ width: '100%', fontSize: '12px' }}>
                                        <tbody>
                                            <tr><td style={{ color: '#64748b', padding: '3px 0' }}>Nominee Name:</td><td style={{ fontWeight: 700, color: '#0f172a' }}>{nominee_name || member?.nominee_name || 'N/A'}</td></tr>
                                            <tr><td style={{ color: '#64748b', padding: '3px 0' }}>Relationship:</td><td style={{ fontWeight: 700, color: '#0f172a' }}>{nominee_relation || member?.nominee_relation || 'N/A'}</td></tr>
                                            <tr><td style={{ color: '#64748b', padding: '3px 0' }}>Selected Plan:</td><td style={{ fontWeight: 700, color: '#0f172a' }}>{plan_name || `${service_type} Plan`}</td></tr>
                                            <tr><td style={{ color: '#64748b', padding: '3px 0' }}>Minimum Tenor:</td><td style={{ fontWeight: 700, color: '#dc2626' }}>{min_tenor_months} {service_type === 'DD' ? 'Deposits' : 'EMIs'}</td></tr>
                                        </tbody>
                                    </table>
                                </div>

                            </div>

                            {/* Financial / Maturity Breakdown Table */}
                            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '8px', border: '1.5px solid #86efac', marginBottom: '20px' }}>
                                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#15803d', borderBottom: '1px solid #bbf7d0', paddingBottom: '6px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <i className="bx bx-calculator"></i> MATURITY & INVESTMENT BREAKDOWN
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
                                    <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Deposit Amount</div>
                                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>₹{Number(opening_amount || current_balance || 0).toLocaleString('en-IN')}</div>
                                    </div>
                                    <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Interest Rate</div>
                                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb' }}>{r}% p.a.</div>
                                    </div>
                                    <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Tenor (Duration)</div>
                                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{m} {service_type === 'DD' ? 'Days' : 'Months'}</div>
                                    </div>
                                    <div style={{ background: '#166534', color: '#ffffff', padding: '10px', borderRadius: '6px' }}>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>Est. Maturity Amount</div>
                                        <div style={{ fontSize: '17px', fontWeight: 900, color: '#ffffff' }}>₹{Number(calcMat || 0).toLocaleString('en-IN')}</div>
                                    </div>
                                </div>
                                {monthly_payout > 0 && (
                                    <div style={{ marginTop: '10px', fontSize: '12px', fontWeight: 700, color: '#047857', textAlign: 'right' }}>
                                        * MIS Monthly Payout: ₹{Number(monthly_payout).toLocaleString('en-IN')} / month
                                    </div>
                                )}
                            </div>

                            {/* Terms & Pre-Close Policy */}
                            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', padding: '12px', fontSize: '11.5px', color: '#9f1239', marginBottom: '24px' }}>
                                <strong><i className="bx bx-error-circle"></i> Important Terms & Pre-Closure Rules:</strong>
                                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                                    <li>Pre-closure before minimum threshold ({min_tenor_months} {service_type === 'DD' ? 'deposits' : 'EMIs'}) will attract interest rate reduction penalty (-2.0% p.a.).</li>
                                    <li>Fine & admin processing fee deduction will be applicable on premature closure as per Bank policy.</li>
                                    <li>Original deposit bond certificate must be surrendered during account settlement or premature closure.</li>
                                </ul>
                            </div>

                            {/* Signatures & Bank Stamp */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '30px', paddingTop: '20px' }}>
                                <div style={{ textAlign: 'center', width: '180px' }}>
                                    <div style={{ borderTop: '1.5px dashed #64748b', paddingTop: '6px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                                        Account Holder Signature
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        width: '85px', height: '85px', borderRadius: '50%', border: '2px double #1e3a8a',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto',
                                        fontSize: '10px', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase',
                                        transform: 'rotate(-12deg)', background: 'rgba(30, 58, 138, 0.04)'
                                    }}>
                                        BANK SEAL STAMP
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center', width: '180px' }}>
                                    <div style={{ borderTop: '1.5px dashed #64748b', paddingTop: '6px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                                        Authorized Signatory
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="modal-footer bg-light border-0 py-3 px-4 no-print d-flex justify-content-between">
                        <small className="text-muted"><i className="bx bx-check-shield text-success me-1"></i> Official Verified Bank Account Certificate Bond</small>
                        <button type="button" className="btn btn-secondary px-4 fw-bold" onClick={onClose}>Close</button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BankAccountBondModal;
