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
               'FINANCIAL SERVICES  LIMITED';
    });
    const [signatureUrl, setSignatureUrl] = useState(() => {
        return bondData?.sign ||
               userData?.setting?.sign ||
               userData?.sign ||
               localStorage.getItem('admin_sign') ||
               null;
    });

    useEffect(() => {
        if (bondData?.company_name) {
            setCompanyName(bondData.company_name);
        } else if (userData?.company_name || userData?.setting?.company_name) {
            setCompanyName(userData?.company_name || userData?.setting?.company_name);
        }
        if (bondData?.sign) {
            setSignatureUrl(bondData.sign);
        } else if (userData?.setting?.sign || userData?.sign) {
            setSignatureUrl(userData?.setting?.sign || userData?.sign);
        }

        const cached = localStorage.getItem('company_name');
        if (cached && !bondData?.company_name && !userData?.company_name) {
            setCompanyName(cached);
        }
        const cachedSign = localStorage.getItem('admin_sign');
        if (cachedSign && !bondData?.sign && !userData?.setting?.sign) {
            setSignatureUrl(cachedSign);
        }

        const fetchSettings = async () => {
            try {
                const apiService = ApiService();
                const res = await apiService.vGet('/api/public-settings');
                if (res?.data?.status === 1 && res.data?.setting) {
                    if (res.data.setting.company_name) {
                        setCompanyName(res.data.setting.company_name);
                        localStorage.setItem('company_name', res.data.setting.company_name);
                    }
                    if (res.data.setting.sign) {
                        setSignatureUrl(res.data.setting.sign);
                        localStorage.setItem('admin_sign', res.data.setting.sign);
                    }
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

    // Virtual banking details & QR source resolver
    const resolvedUpiHandle = virtual_upi_handle || (virtual_account_number ? `${virtual_account_number}@yesbank` : null);

    const qrImageSrc = (() => {
        if (qrcode_image) {
            if (qrcode_image.startsWith('data:') || qrcode_image.startsWith('http://') || qrcode_image.startsWith('https://')) {
                return qrcode_image;
            }
            if (qrcode_image.startsWith('/')) {
                return qrcode_image;
            }
            if (qrcode_image.length > 200 || !qrcode_image.includes('.')) {
                return `data:image/png;base64,${qrcode_image}`;
            }
            return `/${qrcode_image}`;
        }
        if (resolvedUpiHandle || virtual_account_number) {
            return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${resolvedUpiHandle || virtual_account_number}&pn=${encodeURIComponent(memberName || 'Member')}`)}`;
        }
        return null;
    })();

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

                    <div className="modal-body p-3 bg-white" id="printable-bond-certificate">
                        <style>{`
                            @page {
                                size: A4 portrait;
                                margin: 6mm 8mm;
                            }
                            @media print {
                                html, body {
                                    height: auto !important;
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    overflow: visible !important;
                                    background: #ffffff !important;
                                    -webkit-print-color-adjust: exact !important;
                                    print-color-adjust: exact !important;
                                }
                                body * {
                                    visibility: hidden !important;
                                }
                                .modal, .modal-dialog, .modal-content, .modal-body {
                                    position: static !important;
                                    overflow: visible !important;
                                    height: auto !important;
                                    max-height: none !important;
                                    padding: 0 !important;
                                    margin: 0 !important;
                                    border: none !important;
                                    box-shadow: none !important;
                                    background: transparent !important;
                                }
                                #printable-bond-certificate, #printable-bond-certificate * {
                                    visibility: visible !important;
                                }
                                #printable-bond-certificate {
                                    position: absolute !important;
                                    left: 0 !important;
                                    top: 0 !important;
                                    width: 100% !important;
                                    max-width: 100% !important;
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    background: #ffffff !important;
                                    overflow: visible !important;
                                    box-shadow: none !important;
                                    page-break-inside: avoid !important;
                                    page-break-after: avoid !important;
                                }
                                .no-print {
                                    display: none !important;
                                }
                            }
                        `}</style>

                        {/* Certificate Main Frame */}
                        <div style={{
                            border: '4px double #1e3a8a',
                            borderRadius: '10px',
                            padding: '14px 18px',
                            background: '#fffdf9',
                            position: 'relative',
                            boxShadow: 'inset 0 0 80px rgba(30, 58, 138, 0.02)'
                        }}>
                            {/* Watermark Logo */}
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                fontSize: companyName.length > 25 ? '70px' : '90px',
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
                            <div style={{ textAlign: 'center', borderBottom: '1.5px solid #1e3a8a', paddingBottom: '8px', marginBottom: '10px' }}>
                                <div style={{ fontSize: '19px', fontWeight: 900, color: '#1e3a8a', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                    {companyName}
                                </div>
                                <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, marginTop: '1px' }}>
                                    Govt. Registered Financial Institution | Member Deposit Certificate
                                </div>
                                <div style={{
                                    display: 'inline-block',
                                    background: '#1e3a8a',
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    fontSize: '11.5px',
                                    padding: '3px 18px',
                                    borderRadius: '50px',
                                    marginTop: '6px',
                                    letterSpacing: '0.5px'
                                }}>
                                    {service_type} ACCOUNT CERTIFICATE & DEPOSIT BOND
                                </div>
                            </div>

                            {/* Bond No & Key Meta */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '10px', background: '#eff6ff', padding: '6px 12px', borderRadius: '6px', border: '1px solid #bfdbfe', flexWrap: 'wrap', gap: '4px' }}>
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
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>

                                {/* Member Details */}
                                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e3a8a', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <i className="bx bx-user-pin"></i> MEMBER DETAILS
                                    </div>
                                    <table style={{ width: '100%', fontSize: '11.5px' }}>
                                        <tbody>
                                            <tr><td style={{ color: '#64748b', padding: '2px 0', width: '38%' }}>Member Name:</td><td style={{ fontWeight: 700, color: '#0f172a' }}>{memberName}</td></tr>
                                            <tr><td style={{ color: '#64748b', padding: '2px 0' }}>Member Code:</td><td style={{ fontWeight: 700, color: '#0f172a' }}>{memberCode}</td></tr>
                                            <tr><td style={{ color: '#64748b', padding: '2px 0' }}>Contact No:</td><td style={{ fontWeight: 700, color: '#0f172a' }}>{memberPhone}</td></tr>
                                            <tr><td style={{ color: '#64748b', padding: '2px 0' }}>Address:</td><td style={{ fontWeight: 600, color: '#0f172a' }}>{memberAddress}</td></tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Nominee Details & Plan Info */}
                                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e3a8a', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <i className="bx bx-id-card"></i> NOMINEE & PLAN DETAILS
                                    </div>
                                    <table style={{ width: '100%', fontSize: '11.5px' }}>
                                        <tbody>
                                            <tr><td style={{ color: '#64748b', padding: '2px 0', width: '38%' }}>Nominee Name:</td><td style={{ fontWeight: 700, color: '#0f172a' }}>{nominee_name || member?.nominee_name || 'N/A'}</td></tr>
                                            <tr><td style={{ color: '#64748b', padding: '2px 0' }}>Relationship:</td><td style={{ fontWeight: 700, color: '#0f172a' }}>{nominee_relation || member?.nominee_relation || 'N/A'}</td></tr>
                                            <tr><td style={{ color: '#64748b', padding: '2px 0' }}>Selected Plan:</td><td style={{ fontWeight: 700, color: '#0f172a' }}>{plan_name || `${service_type} Plan`}</td></tr>
                                            {isSaving ? (
                                                <tr><td style={{ color: '#64748b', padding: '2px 0' }}>Deposit Type:</td><td style={{ fontWeight: 700, color: '#15803d' }}>Demand Deposit (Daily Liquidity)</td></tr>
                                            ) : (
                                                <tr><td style={{ color: '#64748b', padding: '2px 0' }}>Minimum Tenor:</td><td style={{ fontWeight: 700, color: '#dc2626' }}>{min_tenor_months} {service_type === 'DD' ? 'Deposits' : 'EMIs'}</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                            </div>

                            {/* Digital Banking & Instant UPI QR Deposit Card (For Saving / QR Accounts) */}
                            {(isSaving || qrcode_image || virtual_upi_handle || virtual_account_number) && (
                                <div style={{
                                    background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    border: '1.5px solid #0284c7',
                                    marginBottom: '10px',
                                    boxShadow: '0 1px 4px rgba(2, 132, 199, 0.06)'
                                }}>
                                    <div style={{
                                        fontSize: '12px',
                                        fontWeight: 800,
                                        color: '#0369a1',
                                        borderBottom: '1px solid #bae6fd',
                                        paddingBottom: '4px',
                                        marginBottom: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <i className="bx bx-qr-scan" style={{ fontSize: '15px' }}></i>
                                            DIGITAL BANKING & DIRECT UPI QR DEPOSIT
                                        </span>
                                        <span style={{ fontSize: '10px', background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '50px', fontWeight: 700 }}>
                                            24x7 Real-Time Credit
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        {/* QR Code Container */}
                                        <div style={{
                                            background: '#ffffff',
                                            padding: '6px',
                                            borderRadius: '6px',
                                            border: '1px solid #cbd5e1',
                                            textAlign: 'center',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                            minWidth: '110px'
                                        }}>
                                            {qrImageSrc ? (
                                                <img
                                                    src={qrImageSrc}
                                                    alt="Saving Account UPI QR Code"
                                                    style={{ width: '95px', height: '95px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '95px',
                                                    height: '95px',
                                                    background: '#f8fafc',
                                                    border: '1px dashed #94a3b8',
                                                    borderRadius: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    textAlign: 'center',
                                                    padding: '6px',
                                                    fontSize: '10px',
                                                    color: '#64748b'
                                                }}>
                                                    UPI QR Code
                                                </div>
                                            )}
                                            <div style={{ fontSize: '9px', fontWeight: 800, color: '#0369a1', marginTop: '4px', letterSpacing: '0.5px' }}>
                                                SCAN & PAY TO DEPOSIT
                                            </div>
                                        </div>

                                        {/* Virtual Account Details Table */}
                                        <div style={{ flex: 1, minWidth: '220px' }}>
                                            <table style={{ width: '100%', fontSize: '11.5px', borderCollapse: 'separate', borderSpacing: '0 3px' }}>
                                                <tbody>
                                                    <tr>
                                                        <td style={{ color: '#475569', fontWeight: 600, width: '40%' }}>Saving Account No:</td>
                                                        <td style={{ fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', fontSize: '12px' }}>{account_number}</td>
                                                    </tr>

                                                    <tr>
                                                        <td style={{ color: '#475569', fontWeight: 600 }}>Virtual IFSC Code:</td>
                                                        <td style={{ fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>{virtual_ifsc || 'ICCH0000001'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ color: '#475569', fontWeight: 600 }}>UPI ID / VPA Handle:</td>
                                                        <td style={{ fontWeight: 800, color: '#16a34a', fontFamily: 'monospace' }}>{resolvedUpiHandle || `${account_number}@cashbez`}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ color: '#475569', fontWeight: 600 }}>Accepted Channels:</td>
                                                        <td style={{ fontWeight: 600, color: '#334155', fontSize: '10.5px' }}>PhonePe, Google Pay, Paytm, BHIM, Cred, IMPS/NEFT</td>
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
                            <div style={{ background: '#f0fdf4', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #86efac', marginBottom: '10px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 800, color: '#15803d', borderBottom: '1px solid #bbf7d0', paddingBottom: '4px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <i className="bx bx-calculator"></i> {isSaving ? 'ACCOUNT BALANCE & INTEREST SPECIFICATION' : 'MATURITY & INVESTMENT BREAKDOWN'}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: isSaving ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
                                    <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                        <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>{isSaving ? 'Opening Deposit' : 'Deposit Amount'}</div>
                                        <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>₹{Number(opening_amount || current_balance || 0).toLocaleString('en-IN')}</div>
                                    </div>
                                    <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                        <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>Interest Rate</div>
                                        <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#2563eb' }}>{r}% p.a.</div>
                                    </div>
                                    {isSaving ? (
                                        <div style={{ background: '#166534', color: '#ffffff', padding: '6px 8px', borderRadius: '6px' }}>
                                            <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>Available Balance</div>
                                            <div style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff' }}>₹{Number(current_balance || opening_amount || 0).toLocaleString('en-IN')}</div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                                <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>Tenor (Duration)</div>
                                                <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>{m} {service_type === 'DD' ? 'Days' : 'Months'}</div>
                                            </div>
                                            <div style={{ background: '#166534', color: '#ffffff', padding: '6px 8px', borderRadius: '6px' }}>
                                                <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>Est. Maturity</div>
                                                <div style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff' }}>₹{Number(calcMat || 0).toLocaleString('en-IN')}</div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {monthly_payout > 0 && (
                                    <div style={{ marginTop: '6px', fontSize: '11px', fontWeight: 700, color: '#047857', textAlign: 'right' }}>
                                        * MIS Monthly Payout: ₹{Number(monthly_payout).toLocaleString('en-IN')} / month
                                    </div>
                                )}
                            </div>

                            {/* Terms & Conditions */}
                            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', padding: '8px 12px', fontSize: '10.5px', color: '#9f1239', marginBottom: '12px', lineHeight: '1.35' }}>
                                <strong><i className="bx bx-error-circle"></i> Important Terms & Account Rules:</strong>
                                <ul style={{ margin: '3px 0 0 16px', padding: 0 }}>
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

                            {/* Authorized Signatory Only (Right-aligned, Clean single-page fit) */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: '12px', paddingTop: '4px' }}>
                                <div style={{ textAlign: 'center', minWidth: '190px' }}>
                                    {signatureUrl ? (
                                        <div style={{ marginBottom: '2px', minHeight: '48px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                                            <img
                                                src={signatureUrl.startsWith('http') || signatureUrl.startsWith('/') || signatureUrl.startsWith('data:') ? signatureUrl : `/${signatureUrl}`}
                                                alt="Authorized Signatory"
                                                style={{ maxHeight: '48px', maxWidth: '160px', objectFit: 'contain' }}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ height: '42px' }}></div>
                                    )}
                                    <div style={{ borderTop: '1.5px solid #1e3a8a', paddingTop: '4px', fontSize: '11.5px', fontWeight: 800, color: '#1e3a8a', letterSpacing: '0.5px' }}>
                                        Authorized Signatory
                                    </div>
                                    <div style={{ fontSize: '9.5px', color: '#64748b', fontWeight: 600, marginTop: '1px' }}>
                                        {companyName}
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
