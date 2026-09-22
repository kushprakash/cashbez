import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../core/hooks/context';
import ApiService from '../core/services/ApiService';

const BankAccountBondModal = ({ isOpen, bondData, onClose }) => {
    const { userData } = useContext(AuthContext) || {};
    const [companyName, setCompanyName] = useState(() => {
        return bondData?.company_name ||
               userData?.company_name ||
               userData?.setting?.company_name ||
               localStorage.getItem('company_name') ||
               'CASHBEZ FINANCIAL SERVICES NIDHI LIMITED';
    });

    useEffect(() => {
        if (bondData?.company_name) {
            setCompanyName(bondData.company_name);
            return;
        }
        if (userData?.company_name || userData?.setting?.company_name) {
            setCompanyName(userData?.company_name || userData?.setting?.company_name);
            return;
        }
        const cached = localStorage.getItem('company_name');
        if (cached) {
            setCompanyName(cached);
            return;
        }
        const fetchSettings = async () => {
            try {
                const apiService = ApiService();
                const res = await apiService.vGet('/api/public-settings');
                if (res?.data?.status === 1 && res.data?.setting?.company_name) {
                    setCompanyName(res.data.setting.company_name);
                    localStorage.setItem('company_name', res.data.setting.company_name);
                }
            } catch (err) {
                // Keep default
            }
        };
        fetchSettings();
    }, [bondData, userData]);

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
        virtual_account_number,
        virtual_ifsc,
        virtual_upi_handle,
        qrcode_image,
        qrcode_pdf,
    } = bondData;

    const isSaving = service_type === 'SAVING' || Boolean(virtual_upi_handle || qrcode_image || virtual_account_number);

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
                                fontSize: companyName.length > 25 ? '100px' : '150px',
                                color: 'rgba(30, 58, 138, 0.03)',
                                fontWeight: 900,
                                userSelect: 'none',
                                pointerEvents: 'none',
                                textTransform: 'uppercase',
                                textAlign: 'center',
                                width: '100%',
                                overflow: 'hidden'
                            }}>
                                {companyName ? companyName.split(' ')[0] : 'CASHBEZ'}
                            </div>

                            {/* Header Banner */}
                            <div style={{ textAlign: 'center', borderBottom: '2px solid #1e3a8a', paddingBottom: '16px', marginBottom: '20px' }}>
                                <div style={{ fontSize: '24px', fontWeight: 900, color: '#1e3a8a', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                    {companyName}
                                </div>
                                <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600, marginTop: '2px' }}>
                                    Govt. Registered Financial Institution | Member Deposit Certificate
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '16px', background: '#eff6ff', padding: '8px 14px', borderRadius: '6px', border: '1px solid #bfdbfe', flexWrap: 'wrap', gap: '6px' }}>
                                <span>BOND NO: <strong style={{ color: '#1e3a8a' }}>BND-{account_number}</strong></span>
                                <span>ACCOUNT NO: <strong style={{ color: '#1e3a8a' }}>{account_number}</strong></span>
                                <span>ISSUE DATE: <strong style={{ color: '#1e3a8a' }}>{openingDate}</strong></span>
                                {isSaving ? (
                                    <span>ACCOUNT TYPE: <strong style={{ color: '#15803d' }}>SAVING ACCOUNT</strong></span>
                                ) : (
                                    <span>MATURITY DATE: <strong style={{ color: '#1e3a8a' }}>{maturityDateStr}</strong></span>
                                )}
                            </div>

                            {/* Details Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>

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
                                            {isSaving ? (
                                                <tr><td style={{ color: '#64748b', padding: '3px 0' }}>Deposit Type:</td><td style={{ fontWeight: 700, color: '#15803d' }}>Demand Deposit (Daily Liquidity)</td></tr>
                                            ) : (
                                                <tr><td style={{ color: '#64748b', padding: '3px 0' }}>Minimum Tenor:</td><td style={{ fontWeight: 700, color: '#dc2626' }}>{min_tenor_months} {service_type === 'DD' ? 'Deposits' : 'EMIs'}</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                            </div>

                            {/* Digital Banking & Instant UPI QR Deposit Card (For Saving / QR Accounts) */}
                            {(isSaving || qrcode_image || virtual_upi_handle || virtual_account_number) && (
                                <div style={{
                                    background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
                                    padding: '16px',
                                    borderRadius: '10px',
                                    border: '2px solid #0284c7',
                                    marginBottom: '20px',
                                    boxShadow: '0 2px 8px rgba(2, 132, 199, 0.08)'
                                }}>
                                    <div style={{
                                        fontSize: '13.5px',
                                        fontWeight: 800,
                                        color: '#0369a1',
                                        borderBottom: '1.5px solid #bae6fd',
                                        paddingBottom: '8px',
                                        marginBottom: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <i className="bx bx-qr-scan" style={{ fontSize: '18px' }}></i>
                                            DIGITAL BANKING & DIRECT UPI QR DEPOSIT
                                        </span>
                                        <span style={{ fontSize: '11px', background: '#0284c7', color: '#fff', padding: '2px 10px', borderRadius: '50px', fontWeight: 700 }}>
                                            24x7 Real-Time Credit
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        {/* QR Code Container */}
                                        <div style={{
                                            background: '#ffffff',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1.5px solid #cbd5e1',
                                            textAlign: 'center',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                            minWidth: '140px'
                                        }}>
                                            {qrcode_image ? (
                                                <img
                                                    src={qrcode_image.startsWith('data:') || qrcode_image.startsWith('http') ? qrcode_image : `data:image/png;base64,${qrcode_image}`}
                                                    alt="Saving Account UPI QR Code"
                                                    style={{ width: '130px', height: '130px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '130px',
                                                    height: '130px',
                                                    background: '#f8fafc',
                                                    border: '1.5px dashed #94a3b8',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    textAlign: 'center',
                                                    padding: '10px',
                                                    fontSize: '11px',
                                                    color: '#64748b'
                                                }}>
                                                    UPI QR Code
                                                </div>
                                            )}
                                            <div style={{ fontSize: '10px', fontWeight: 800, color: '#0369a1', marginTop: '6px', letterSpacing: '0.5px' }}>
                                                SCAN & PAY TO DEPOSIT
                                            </div>
                                        </div>

                                        {/* Virtual Account Details Table */}
                                        <div style={{ flex: 1, minWidth: '240px' }}>
                                            <table style={{ width: '100%', fontSize: '12.5px', borderCollapse: 'separate', borderSpacing: '0 5px' }}>
                                                <tbody>
                                                    <tr>
                                                        <td style={{ color: '#475569', fontWeight: 600, width: '42%' }}>Saving Account No:</td>
                                                        <td style={{ fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', fontSize: '13.5px' }}>{account_number}</td>
                                                    </tr>

                                                    <tr>
                                                        <td style={{ color: '#475569', fontWeight: 600 }}>Virtual IFSC Code:</td>
                                                        <td style={{ fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>{virtual_ifsc || 'ICCH0000001'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ color: '#475569', fontWeight: 600 }}>UPI ID / VPA Handle:</td>
                                                        <td style={{ fontWeight: 800, color: '#16a34a', fontFamily: 'monospace' }}>{virtual_upi_handle || `${account_number}@cashbez`}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ color: '#475569', fontWeight: 600 }}>Accepted Channels:</td>
                                                        <td style={{ fontWeight: 600, color: '#334155', fontSize: '11.5px' }}>PhonePe, Google Pay, Paytm, BHIM, Cred, IMPS/NEFT</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            {qrcode_pdf && (
                                                <div style={{ marginTop: '10px' }} className="no-print">
                                                    <a
                                                        href={qrcode_pdf}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            background: '#0284c7',
                                                            color: '#ffffff',
                                                            textDecoration: 'none',
                                                            fontSize: '11.5px',
                                                            fontWeight: 700,
                                                            padding: '5px 14px',
                                                            borderRadius: '6px',
                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                                        }}
                                                    >
                                                        <i className="bx bx-file-blank"></i> View Official QR PDF Certificate
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Financial / Maturity Breakdown Table */}
                            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '8px', border: '1.5px solid #86efac', marginBottom: '20px' }}>
                                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#15803d', borderBottom: '1px solid #bbf7d0', paddingBottom: '6px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <i className="bx bx-calculator"></i> {isSaving ? 'ACCOUNT BALANCE & INTEREST SPECIFICATION' : 'MATURITY & INVESTMENT BREAKDOWN'}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: isSaving ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
                                    <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{isSaving ? 'Opening Deposit' : 'Deposit Amount'}</div>
                                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>₹{Number(opening_amount || current_balance || 0).toLocaleString('en-IN')}</div>
                                    </div>
                                    <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Interest Rate</div>
                                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb' }}>{r}% p.a.</div>
                                    </div>
                                    {isSaving ? (
                                        <div style={{ background: '#166534', color: '#ffffff', padding: '10px', borderRadius: '6px' }}>
                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>Current Available Balance</div>
                                            <div style={{ fontSize: '17px', fontWeight: 900, color: '#ffffff' }}>₹{Number(current_balance || opening_amount || 0).toLocaleString('en-IN')}</div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Tenor (Duration)</div>
                                                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{m} {service_type === 'DD' ? 'Days' : 'Months'}</div>
                                            </div>
                                            <div style={{ background: '#166534', color: '#ffffff', padding: '10px', borderRadius: '6px' }}>
                                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>Est. Maturity Amount</div>
                                                <div style={{ fontSize: '17px', fontWeight: 900, color: '#ffffff' }}>₹{Number(calcMat || 0).toLocaleString('en-IN')}</div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {monthly_payout > 0 && (
                                    <div style={{ marginTop: '10px', fontSize: '12px', fontWeight: 700, color: '#047857', textAlign: 'right' }}>
                                        * MIS Monthly Payout: ₹{Number(monthly_payout).toLocaleString('en-IN')} / month
                                    </div>
                                )}
                            </div>

                            {/* Terms & Conditions */}
                            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', padding: '12px', fontSize: '11.5px', color: '#9f1239', marginBottom: '24px' }}>
                                <strong><i className="bx bx-error-circle"></i> Important Terms & Account Rules:</strong>
                                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                                    {isSaving ? (
                                        <>
                                            <li>Deposits can be made anytime using the assigned Virtual Account, UPI VPA handle, or QR Code.</li>
                                            <li>Real-time credit will be reflected in the account upon successful UPI remittance.</li>
                                            <li>Withdrawals are processed through authorized agent cash payout with secure MPIN confirmation.</li>
                                            <li>Interest is calculated on daily product balance and credited quarterly as per Nidhi Bank guidelines.</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>Pre-closure before minimum threshold ({min_tenor_months} {service_type === 'DD' ? 'deposits' : 'EMIs'}) will attract interest rate reduction penalty (-2.0% p.a.).</li>
                                            <li>Fine & admin processing fee deduction will be applicable on premature closure as per Bank policy.</li>
                                            <li>Original deposit bond certificate must be surrendered during account settlement or premature closure.</li>
                                        </>
                                    )}
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
