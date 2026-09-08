import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import AadhaarCard from './cards/AadhaarCard';
import PanCard from './cards/PanCard';
import DlCard from './cards/DlCard';
import VoterCard from './cards/VoterCard';
import RcCard from './cards/RcCard';

const CARD_CONFIG = {
    aadhaar: {
        title: 'Aadhaar Card Download',
        icon: 'fas fa-id-card',
        color: '#FF6B00',
        gradient: 'linear-gradient(135deg, #FF6B00, #FF9800)',
        placeholder: 'Enter 12-digit Aadhaar Number',
        regex: /^[0-9]{12}$/,
        errorMsg: 'Enter valid 12-digit Aadhaar number',
        maxLen: 12,
        needsOtp: true,
        Widget: AadhaarCard,
    },
    pan: {
        title: 'PAN Card Download',
        icon: 'fas fa-address-card',
        color: '#1565C0',
        gradient: 'linear-gradient(135deg, #1565C0, #42A5F5)',
        placeholder: 'Enter 10-character PAN Number',
        regex: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i,
        errorMsg: 'Enter valid PAN (eg. ABCDE1234F)',
        maxLen: 10,
        needsOtp: false,
        Widget: PanCard,
    },
    dl: {
        title: 'Driving Licence Download',
        icon: 'fas fa-car',
        color: '#2E7D32',
        gradient: 'linear-gradient(135deg, #2E7D32, #66BB6A)',
        placeholder: 'Enter DL Number',
        regex: /^.{5,20}$/,
        errorMsg: 'Enter valid DL number',
        maxLen: 20,
        needsOtp: false,
        needsDob: true,
        Widget: DlCard,
    },
    voter: {
        title: 'Voter ID Download',
        icon: 'fas fa-vote-yea',
        color: '#7B1FA2',
        gradient: 'linear-gradient(135deg, #7B1FA2, #AB47BC)',
        placeholder: 'Enter EPIC Number',
        regex: /^.{5,20}$/,
        errorMsg: 'Enter valid EPIC number',
        maxLen: 20,
        needsOtp: false,
        Widget: VoterCard,
    },
    rc: {
        title: 'RC (Vehicle Registration) Download',
        icon: 'fas fa-car-side',
        color: '#B71C1C',
        gradient: 'linear-gradient(135deg, #B71C1C, #E53935)',
        placeholder: 'Enter Vehicle Number (eg. MH12AB1234)',
        regex: /^.{5,15}$/,
        errorMsg: 'Enter valid vehicle number',
        maxLen: 15,
        needsOtp: false,
        Widget: RcCard,
    },
};

const CardDownload = () => {
    const { cardType } = useParams();
    const navigate = useNavigate();
    const config = CARD_CONFIG[cardType];
    const receiptRef = useRef(null);

    // State
    const [docNumber, setDocNumber] = useState('');
    const [dob, setDob] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [consent, setConsent] = useState(false);
    const [downloads, setDownloads] = useState([]);
    const [loadingDownloads, setLoadingDownloads] = useState(false);

    // MPIN Modal
    const [showMpinModal, setShowMpinModal] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [mpin, setMpin] = useState('');
    const [mpinLoading, setMpinLoading] = useState(false);

    // Aadhaar OTP
    const [otpStep, setOtpStep] = useState(false);
    const [refid, setRefid] = useState('');
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);

    // Receipt
    const [receiptData, setReceiptData] = useState(null);
    const [showReceipt, setShowReceipt] = useState(false);
    const [downloadId, setDownloadId] = useState(null);

    const apiService = ApiService();

    useEffect(() => {
        if (config) {
            fetchAccounts();
            fetchDownloads();
            // Reset state on card type change
            setDocNumber('');
            setDob('');
            setError('');
            setConsent(false);
            setOtpStep(false);
            setRefid('');
            setOtp('');
        }
    }, [cardType]);


    const fetchAccounts = async () => {
        try {
            const response = await apiService.vGet('/api/accounts');

            if (response.data && response.data.status === 1) {
                const accountsData = response.data.data;
                if (Array.isArray(accountsData)) {
                    setAccounts(accountsData);
                    const primary = accountsData.find(a => a.primary_status === true);
                    if (primary) setSelectedAccount(primary.id);
                } else if (accountsData && Array.isArray(accountsData.accounts)) {
                    setAccounts(accountsData.accounts);
                    const primary = accountsData.accounts.find(a => a.primary_status === true);
                    if (primary) setSelectedAccount(primary.id);
                } else {
                    setAccounts([]);
                }
            } else {
                setAccounts([]);
            }
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
            setAccounts([]);
        }
    };


    const fetchDownloads = async () => {
        setLoadingDownloads(true);
        try {
            const res = await apiService.vGet(`/api/v2/card-download/my-downloads?card_type=${cardType}`);
            if (res?.data?.status === 1) setDownloads(res.data.data || []);
        } catch (e) { console.error(e); }
        setLoadingDownloads(false);
    };

    // Validate & open MPIN modal
    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!config.regex.test(docNumber.trim())) {
            setError(config.errorMsg);
            return;
        }
        if (config.needsDob && !dob) {
            setError('Date of Birth is required for DL verification');
            return;
        }
        if (!consent) {
            setError('Please accept the Terms & Conditions and Data Usage Policy to proceed.');
            return;
        }

        // For Aadhaar — send OTP first (no MPIN yet)
        if (config.needsOtp && !otpStep) {
            sendAadhaarOtp();
            return;
        }

        setShowMpinModal(true);
        setMpin('');
    };

    // Aadhaar OTP send
    const sendAadhaarOtp = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await apiService.vPost('/api/v2/card-download/aadhaar-send-otp', {
                doc_number: docNumber.trim(),
            });
            if (res?.data?.status === 1) {
                setOtpStep(true);
                setRefid(res.data.data?.refid || '');
            } else {
                setError(res?.data?.message || 'Failed to send OTP');
            }
        } catch (e) {
            setError('Network error while sending OTP');
        }
        setLoading(false);
    };

    // Process download (non-Aadhaar or Aadhaar verify)
    const processDownload = async () => {
        if (!mpin || mpin.length !== 4) {
            setError('Enter valid 4-digit MPIN');
            return;
        }
        setMpinLoading(true);
        setError('');

        try {
            let res;
            if (config.needsOtp) {
                // Aadhaar verify
                res = await apiService.vPost('/api/v2/card-download/aadhaar-verify', {
                    refid,
                    otp,
                    account_id: selectedAccount,
                    mpin,
                });
            } else {
                res = await apiService.vPost('/api/v2/card-download/download', {
                    card_type: cardType,
                    doc_number: docNumber.trim().toUpperCase(),
                    dob: dob || undefined,
                    account_id: selectedAccount,
                    mpin,
                });
            }

            if (res?.data?.status === 1) {
                setDownloadId(res.data.download_id);
                setShowMpinModal(false);
                setOtpStep(false);

                // Navigate to view screen with data
                navigate(`/card-download/${cardType}/${res.data.download_id}`, { state: { data: res.data.data } });
            } else {
                setError(res?.data?.message || 'Download failed');
            }
        } catch (e) {
            console.error(e);
            setError('Network error');
        }
        setMpinLoading(false);
    };

    // Print receipt
    const handlePrintReceipt = async (id) => {
        try {
            const res = await apiService.vGet(`/api/v2/card-download/receipt/${id}`);
            if (res?.data?.status === 1) {
                setReceiptData(res.data.data);
                setShowReceipt(true);
                setTimeout(() => {
                    const printable = receiptRef.current;
                    if (printable) {
                        const win = window.open('', '_blank');
                        win.document.write(`
                            <html><head><title>Receipt</title>
                            <style>
                                body { font-family: 'Segoe UI', sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
                                .receipt-header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 10px; margin-bottom: 15px; }
                                .receipt-header h3 { margin: 0; color: #1565C0; }
                                .receipt-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dotted #eee; }
                                .receipt-row .label { color: #666; font-size: 13px; }
                                .receipt-row .value { font-weight: 600; font-size: 13px; }
                                .amount-row { background: #f0f7ff; padding: 8px; border-radius: 6px; margin: 10px 0; text-align: center; }
                                .amount-row .amt { font-size: 24px; font-weight: bold; color: #1565C0; }
                                .footer { text-align: center; margin-top: 15px; font-size: 11px; color: #999; border-top: 2px dashed #ccc; padding-top: 10px; }
                                @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                            </style></head><body>
                            ${printable.innerHTML}
                            <script>window.onload = function(){ window.print(); }</script>
                            </body></html>
                        `);
                        win.document.close();
                    }
                }, 300);
            }
        } catch (e) { console.error(e); }
    };

    if (!config) {
        return (
            <div className="container py-5 text-center">
                <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h4>Invalid card type: <code>{cardType}</code></h4>
                <p className="text-muted">Valid types: aadhaar, pan, dl, voter, rc</p>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4 px-3 px-md-4">
            {/* Page Header */}
            <div className="d-flex align-items-center gap-3 mb-4">
                <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: '48px', height: '48px', background: config.gradient }}>
                    <i className={`${config.icon} text-white`}></i>
                </div>
                <div>
                    <h4 className="mb-0 fw-bold" style={{ color: '#1e293b' }}>{config.title}</h4>
                    <small className="text-muted">Download Charge: ₹25</small>
                </div>
            </div>

            <div className="row g-4">
                {/* LEFT: Form + Result */}
                <div className="col-lg-7">
                    {/* Input Form */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Document Number</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        placeholder={config.placeholder}
                                        value={docNumber}
                                        onChange={e => setDocNumber(e.target.value.toUpperCase())}
                                        maxLength={config.maxLen}
                                        style={{ borderColor: config.color + '40', letterSpacing: '1px' }}
                                    />
                                </div>

                                {config.needsDob && (
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Date of Birth</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={dob}
                                            onChange={e => setDob(e.target.value)}
                                        />
                                    </div>
                                )}

                                {/* Aadhaar OTP field */}
                                {otpStep && (
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Enter OTP sent to registered mobile</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg text-center"
                                            placeholder="Enter 6-digit OTP"
                                            value={otp}
                                            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            maxLength={6}
                                            style={{ letterSpacing: '8px', fontWeight: 'bold' }}
                                        />
                                    </div>
                                )}

                                {error && (
                                    <div className="alert alert-danger py-2 d-flex align-items-center gap-2" role="alert">
                                        <i className="fas fa-exclamation-circle"></i>
                                        {error}
                                    </div>
                                )}

                                {/* Consent Checkbox */}
                                <div className="mb-4 form-check bg-light p-3 rounded border">
                                    <input
                                        className="form-check-input ms-1 me-2 mt-1"
                                        type="checkbox"
                                        id="consentCheck"
                                        checked={consent}
                                        onChange={(e) => {
                                            setConsent(e.target.checked);
                                            setError('');
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <label className="form-check-label text-muted" htmlFor="consentCheck" style={{ fontSize: '13px', cursor: 'pointer', lineHeight: '1.4' }}>
                                        I hereby give my explicit consent to verify this document. I understand that the generated receipt and verified document are for my personal use only. I agree to the <span className="text-primary fw-semibold" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open('/card-download-tnc', '_blank'); }} style={{ textDecoration: 'underline' }}>Terms & Conditions</span> regarding data usage and compliance.
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-lg w-100 text-white fw-bold"
                                    style={{ background: config.gradient, border: 'none' }}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
                                    ) : otpStep ? (
                                        <><i className="fas fa-check-circle me-2"></i>Verify OTP & Download (₹25)</>
                                    ) : config.needsOtp ? (
                                        <><i className="fas fa-paper-plane me-2"></i>Send OTP</>
                                    ) : (
                                        <><i className="fas fa-download me-2"></i>Download Card (₹25)</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>


                </div>

                {/* RIGHT: Past Downloads */}
                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-0 py-3">
                            <h6 className="mb-0 fw-bold">
                                <i className="fas fa-history me-2" style={{ color: config.color }}></i>
                                Past Downloads
                            </h6>
                        </div>
                        <div className="card-body p-0">
                            {loadingDownloads ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border spinner-border-sm text-primary"></div>
                                </div>
                            ) : downloads.length === 0 ? (
                                <div className="text-center py-4 text-muted">
                                    <i className="fas fa-inbox fa-2x mb-2 d-block opacity-50"></i>
                                    <small>No downloads yet</small>
                                </div>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {downloads.map(dl => (
                                        <div key={dl.id} className="list-group-item px-3 py-3">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <div className="fw-semibold" style={{ color: '#1e293b' }}>
                                                        {dl.customer_name || dl.doc_number}
                                                    </div>
                                                    <small className="text-muted font-monospace">{dl.doc_number}</small>
                                                    <br />
                                                    <small className="text-muted">{dl.created_at}</small>
                                                </div>
                                                <div className="d-flex gap-1">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => navigate(`/card-download/${cardType}/${dl.id}`, { state: { data: dl.data } })}
                                                        title="View"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-success"
                                                        onClick={() => handlePrintReceipt(dl.id)}
                                                        title="Print Receipt"
                                                    >
                                                        <i className="fas fa-print"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MPIN Modal */}
            {showMpinModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowMpinModal(false)}>
                    <div className="modal-dialog modal-dialog-centered modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header py-3 text-white" style={{ background: config.gradient }}>
                                <h6 className="modal-title fw-bold">
                                    <i className="fas fa-lock me-2"></i>Confirm Payment
                                </h6>
                                <button className="btn-close btn-close-white" onClick={() => setShowMpinModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                {/* Amount Display */}
                                <div className="text-center mb-4 p-3 rounded" style={{ backgroundColor: '#f0f7ff' }}>
                                    <small className="text-muted d-block">Charge Amount</small>
                                    <h2 className="fw-bold mb-0" style={{ color: config.color }}>₹25</h2>
                                    <small className="text-success fw-semibold">₹20 commission will be returned</small>
                                </div>

                                {/* Account Select */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Select Wallet</label>
                                    <select
                                        className="form-select"
                                        value={selectedAccount}
                                        onChange={e => setSelectedAccount(e.target.value)}
                                    >
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>
                                                {acc.name} — {acc.balance}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* MPIN Input */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Enter MPIN</label>
                                    <input
                                        type="password"
                                        className="form-control form-control-lg text-center"
                                        placeholder="● ● ● ●"
                                        value={mpin}
                                        onChange={e => setMpin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        maxLength={4}
                                        style={{ letterSpacing: '12px', fontSize: '24px' }}
                                        autoFocus
                                    />
                                </div>

                                {error && (
                                    <div className="alert alert-danger py-2 small">{error}</div>
                                )}

                                <button
                                    className="btn btn-lg w-100 text-white fw-bold"
                                    style={{ background: config.gradient, border: 'none' }}
                                    onClick={processDownload}
                                    disabled={mpinLoading || mpin.length < 4}
                                >
                                    {mpinLoading ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
                                    ) : (
                                        <><i className="fas fa-check-circle me-2"></i>Pay ₹25 & Download</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Receipt for Print */}
            <div style={{ display: 'none' }}>
                <div ref={receiptRef}>
                    {receiptData && (
                        <div>
                            <div className="receipt-header">
                                <h3>CashBez</h3>
                                <p style={{ margin: '2px 0', fontSize: '12px', color: '#666' }}>Card Download Service Receipt</p>
                            </div>
                            <div className="receipt-row">
                                <span className="label">Receipt ID</span>
                                <span className="value">#{receiptData.id}</span>
                            </div>
                            <div className="receipt-row">
                                <span className="label">Txn ID</span>
                                <span className="value">{receiptData.transaction_id}</span>
                            </div>
                            <div className="receipt-row">
                                <span className="label">Card Type</span>
                                <span className="value">{receiptData.card_type?.toUpperCase()}</span>
                            </div>
                            <div className="receipt-row">
                                <span className="label">Doc Number</span>
                                <span className="value">{receiptData.doc_number}</span>
                            </div>
                            <div className="receipt-row">
                                <span className="label">Customer Name</span>
                                <span className="value">{receiptData.customer_name || '-'}</span>
                            </div>
                            <div className="receipt-row">
                                <span className="label">Date</span>
                                <span className="value">{receiptData.date}</span>
                            </div>
                            <div className="amount-row">
                                <div style={{ fontSize: '12px', color: '#666' }}>Amount Paid</div>
                                <div className="amt">₹{receiptData.amount}</div>
                            </div>
                            <div className="receipt-row">
                                <span className="label">Shop</span>
                                <span className="value">{receiptData.shop_name}</span>
                            </div>
                            {receiptData.shop_address && (
                                <div className="receipt-row">
                                    <span className="label">Address</span>
                                    <span className="value" style={{ fontSize: '11px' }}>{receiptData.shop_address}</span>
                                </div>
                            )}
                            <div className="receipt-row">
                                <span className="label">Merchant</span>
                                <span className="value">{receiptData.merchant_name}</span>
                            </div>
                            <div className="footer">
                                Thank you for using CashBez!<br />
                                This is a computer generated receipt.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
};

export default CardDownload;
