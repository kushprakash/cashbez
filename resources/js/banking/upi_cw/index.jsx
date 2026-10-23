import React, { useContext, useEffect, useRef, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pageheader from '../../layouts/Pageheader';
import { AuthContext } from '../../core/hooks/context';
import UpiHistory from './history';

const UpiCashWithdrawal = () => {
    const { userData: user } = useContext(AuthContext);
    const apiService = ApiService();

    // Form states
    const [amount, setAmount] = useState('');
    const [customerMobile, setCustomerMobile] = useState('');
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Active Tab state: 'new' | 'history'
    const [activeTab, setActiveTab] = useState('new');

    // QR Payment Modal / Card states
    const [qrData, setQrData] = useState(null); // { intentLink, fpTxnId, refId, amount, expiryDate, vpa, partnerRequestId }
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrExpiry, setQrExpiry] = useState(60);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [txnStatusResult, setTxnStatusResult] = useState(null);

    // History state
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Receipt Modal state
    const [receiptData, setReceiptData] = useState(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);

    // Timer Ref
    const timerRef = useRef(null);
    const pollRef = useRef(null);

    const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab]);

    // Handle Countdown Timer for QR Code
    useEffect(() => {
        if (showQrModal && qrExpiry > 0) {
            timerRef.current = setInterval(() => {
                setQrExpiry((prev) => {
                    if (prev <= 1) {
                        toast.error('QR Code Expired');
                        closeQrModal();
                        clearInterval(timerRef.current);
                        return 0;

                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }

        return () => clearInterval(timerRef.current);
    }, [showQrModal, qrExpiry]);

    // Clean up polling on unmount
    useEffect(() => {
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await apiService.vPost('/api/v2/upicw/history', {
                mid: user?.mid
            });
            if (res.data?.status) {
                setHistory(res.data.data?.data || res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch history', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const validateForm = () => {
        let errs = {};
        const amtNum = parseFloat(amount);

        if (!amount || isNaN(amtNum)) {
            errs.amount = 'Amount is required';
        } else if (amtNum < 100) {
            errs.amount = 'Minimum amount is ₹100';
        } else if (amtNum > 5000) {
            errs.amount = 'Maximum withdrawal limit per transaction is ₹5,000';
        } else if (amtNum % 100 !== 0) {
            errs.amount = 'Amount must be a multiple of ₹100 (e.g., 100, 200, 500)';
        }

        if (customerMobile && !/^[6-9]\d{9}$/.test(customerMobile)) {
            errs.customerMobile = 'Enter a valid 10-digit mobile number';
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleInitiatePayment = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setTxnStatusResult(null);

        try {
            // Get location if available
            let lat = 17.385044;
            let lng = 78.486671;

            if (navigator.geolocation) {
                try {
                    const pos = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                    });
                    lat = pos.coords.latitude;
                    lng = pos.coords.longitude;
                } catch (geoErr) {
                    console.log('Location permission denied or timed out, using default coordinates');
                }
            }

            const response = await apiService.vPost('/api/v2/upicw/initiate-payment', {
                amount: amount,
                customer_mobile: customerMobile,
                remarks: remarks || 'UPI Cash Withdrawal',
                latitude: lat,
                longitude: lng,
                mid: user?.mid
            });

            if (response.data?.status) {
                toast.success('UPI QR Code generated successfully!');
                const data = response.data.data;
                const partnerReqId = response.data.partnerRequestId;

                setQrData({
                    ...data,
                    partnerRequestId: partnerReqId,
                    amount: amount
                });
                setQrExpiry(data.qrExpiryIn || 60);
                setShowQrModal(true);

                // Auto-poll status every 6 seconds for 60 seconds
                startAutoPolling(partnerReqId, data.fpTxnId);
            } else {
                toast.error(response.data?.message || 'Failed to initiate payment');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error initiating payment');
        } finally {
            setLoading(false);
        }
    };

    const startAutoPolling = (partnerReqId, fpTxnId) => {
        if (pollRef.current) clearInterval(pollRef.current);

        let attempts = 0;
        pollRef.current = setInterval(async () => {
            attempts++;
            if (attempts > 10) {
                clearInterval(pollRef.current);
                return;
            }
            const isSuccess = await checkTxnStatus(partnerReqId, fpTxnId, false);
            if (isSuccess) {
                clearInterval(pollRef.current);
            }
        }, 6000);
    };

    const checkTxnStatus = async (partnerReqId, fpTxnId, showToast = true) => {
        setCheckingStatus(true);
        try {
            const res = await apiService.vPost('/api/v2/upicw/check-status', {
                partnerRequestId: partnerReqId,
                fingpayTxnId: fpTxnId
            });

            if (res.data) {
                const status = res.data.status || res.data.txnStatus;
                const msg = res.data.message || res.data.responseMessage || 'Status checked';

                setTxnStatusResult(res.data);

                if (status === true || status === 'SUCCESS' || res.data.responseCode === '00') {
                    if (showToast) toast.success('Transaction Successful!');
                    if (pollRef.current) clearInterval(pollRef.current);
                    return true;
                } else if (status === 'FAILED') {
                    if (showToast) toast.error('Transaction Failed: ' + msg);
                    if (pollRef.current) clearInterval(pollRef.current);
                    return true;
                } else if (showToast) {
                    toast.info('Transaction Pending / In Progress...');
                }
            }
        } catch (err) {
            console.error('Status check error', err);
            if (showToast) toast.error('Status check failed');
        } finally {
            setCheckingStatus(false);
        }
        return false;
    };

    const openReceipt = (item) => {
        setReceiptData(item);
        setShowReceiptModal(true);
    };

    const closeQrModal = () => {
        setShowQrModal(false);
        if (pollRef.current) clearInterval(pollRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        // Refresh history if active
        fetchHistory();
    };

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#f4f6f9', minHeight: '90vh' }}>
            <ToastContainer position="top-right" autoClose={4000} />
            <Pageheader mainheading="UPI Cash Withdrawal" parentfolder="UPI" activepage="Withdrawal" />

            {/* Top Navigation & Header */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 bg-white p-3 rounded-4 shadow-sm border">
                <div className="d-flex align-items-center gap-3">
                    <div className="p-3 rounded-3 text-white d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', width: '52px', height: '52px' }}>
                        <iconify-icon icon="ic:baseline-qr-code-scanner" width="30" height="30"></iconify-icon>
                    </div>
                    <div>
                        <h4 className="fw-bold mb-1" style={{ color: '#1e293b' }}>UPI Cash Withdrawal (UPICW)</h4>
                        <p className="text-muted mb-0 small">Instant Cash Withdrawal via Dynamic UPI QR Code</p>
                    </div>
                </div>

                <div className="d-flex gap-2 mt-2 mt-sm-0">
                    <button
                        className={`btn px-4 py-2 rounded-3 fw-semibold transition-all ${activeTab === 'new' ? 'btn-primary shadow-sm' : 'btn-outline-secondary'}`}
                        onClick={() => setActiveTab('new')}
                        style={activeTab === 'new' ? { backgroundColor: '#4f46e5', borderColor: '#4f46e5' } : {}}
                    >
                        <iconify-icon icon="ic:baseline-add-card" className="me-2" width="18"></iconify-icon>
                        New Withdrawal
                    </button>
                    <button
                        className={`btn px-4 py-2 rounded-3 fw-semibold transition-all ${activeTab === 'history' ? 'btn-primary shadow-sm' : 'btn-outline-secondary'}`}
                        onClick={() => setActiveTab('history')}
                        style={activeTab === 'history' ? { backgroundColor: '#4f46e5', borderColor: '#4f46e5' } : {}}
                    >
                        <iconify-icon icon="ic:baseline-history" className="me-2" width="18"></iconify-icon>
                        Transaction History
                    </button>
                </div>
            </div>

            {/* TAB 1: NEW WITHDRAWAL */}
            {activeTab === 'new' && (
                <div className="row g-4 justify-content-center">
                    <div className="col-lg-7 col-md-10">
                        <div className="card border-0 rounded-4 shadow-sm">
                            <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
                                <span className="fw-bold text-dark fs-6">Initiate Cash Withdrawal</span>
                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill small">
                                    aeps_type = UPICW
                                </span>
                            </div>

                            <div className="card-body p-4">
                                <form onSubmit={handleInitiatePayment}>
                                    {/* Amount Section */}
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold text-secondary small">
                                            ENTER AMOUNT (₹) <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group input-group-lg">
                                            <span className="input-group-text bg-light border-end-0 fw-bold text-dark fs-4">₹</span>
                                            <input
                                                type="number"
                                                step="100"
                                                min="100"
                                                max="5000"
                                                className={`form-control border-start-0 fw-bold fs-3 ${errors.amount ? 'is-invalid' : ''}`}
                                                placeholder="0.00"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                            />
                                            {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
                                        </div>
                                        <div className="form-text text-muted small mt-1">
                                            <iconify-icon icon="ic:outline-info" className="me-1"></iconify-icon>
                                            Amount must be in multiples of ₹100. Min: ₹100 | Max: ₹5,000
                                        </div>
                                    </div>

                                    {/* Quick Amount Selector */}
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold text-secondary small mb-2">QUICK SELECT</label>
                                        <div className="d-flex flex-wrap gap-2">
                                            {quickAmounts.map((amt) => (
                                                <button
                                                    key={amt}
                                                    type="button"
                                                    className={`btn btn-sm px-3 py-2 rounded-3 fw-semibold ${parseFloat(amount) === amt ? 'btn-primary' : 'btn-light border'}`}
                                                    onClick={() => setAmount(amt.toString())}
                                                    style={parseFloat(amount) === amt ? { backgroundColor: '#4f46e5', borderColor: '#4f46e5' } : {}}
                                                >
                                                    + ₹{amt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Customer Mobile */}
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold text-secondary small">
                                            CUSTOMER MOBILE NUMBER (OPTIONAL)
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light"><iconify-icon icon="ic:baseline-phone"></iconify-icon></span>
                                            <input
                                                type="text"
                                                maxLength="10"
                                                className={`form-control ${errors.customerMobile ? 'is-invalid' : ''}`}
                                                placeholder="Enter 10-digit mobile number"
                                                value={customerMobile}
                                                onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, ''))}
                                            />
                                            {errors.customerMobile && <div className="invalid-feedback">{errors.customerMobile}</div>}
                                        </div>
                                    </div>

                                    {/* Remarks */}
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold text-secondary small">REMARKS</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Optional transaction note"
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn w-100 py-3 rounded-3 text-white fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                                        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                Generating UPI QR Code...
                                            </>
                                        ) : (
                                            <>
                                                <iconify-icon icon="ic:baseline-qr-code" width="22" height="22"></iconify-icon>
                                                Generate QR Code & Initiate
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: TRANSACTION HISTORY */}
            {activeTab === 'history' && (
                <UpiHistory isHeader={false} />
            )}

            {/* QR CODE DISPLAY MODAL */}
            {showQrModal && qrData && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                            <div className="modal-header text-white py-3 px-4" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
                                <h5 className="modal-title fw-bold fs-6 d-flex align-items-center gap-2">
                                    <iconify-icon icon="ic:baseline-qr-code-scanner" width="22"></iconify-icon>
                                    Scan QR Code to Withdraw Cash
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={closeQrModal}></button>
                            </div>

                            <div className="modal-body p-4 text-center">
                                {/* Expiry Progress & Timer */}
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1 small">
                                        <span className="text-muted">QR Code Expiry Countdown:</span>
                                        <span className={`fw-bold ${qrExpiry < 15 ? 'text-danger' : 'text-primary'}`}>{qrExpiry} sec</span>
                                    </div>
                                    <div className="progress" style={{ height: '6px' }}>
                                        <div
                                            className={`progress-bar transition-all ${qrExpiry < 15 ? 'bg-danger' : 'bg-primary'}`}
                                            style={{ width: `${(qrExpiry / 60) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* QR Image Display */}
                                <div className="p-3 bg-light rounded-4 border d-inline-block mb-3 shadow-inner position-relative">
                                    {qrData.intentLink ? (
                                        <img
                                            src={qrData.intentLink.startsWith('data:image') ? qrData.intentLink : `data:image/png;base64,${qrData.intentLink}`}
                                            alt="UPI QR Code"
                                            className="img-fluid rounded-3"
                                            style={{ width: '220px', height: '220px', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <div className="d-flex flex-column align-items-center justify-content-center text-muted" style={{ width: '220px', height: '220px' }}>
                                            <iconify-icon icon="ic:baseline-qr-code-2" width="80" height="80"></iconify-icon>
                                            <span className="small mt-2">QR Code Generated</span>
                                        </div>
                                    )}
                                </div>

                                {/* Transaction Info */}
                                <div className="p-3 rounded-3 bg-white border text-start mb-3">
                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                        <span className="text-muted small">Withdrawal Amount:</span>
                                        <span className="fw-bold text-success fs-5">₹{parseFloat(qrData.amount).toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                        <span className="text-muted small">Ref ID / Txn ID:</span>
                                        <span className="fw-semibold text-dark small">{qrData.partnerRequestId || qrData.refId}</span>
                                    </div>
                                    {qrData.vpa && (
                                        <div className="d-flex justify-content-between">
                                            <span className="text-muted small">Merchant VPA:</span>
                                            <span className="fw-semibold text-dark small">{qrData.vpa}</span>
                                        </div>
                                    )}
                                </div>

                                {qrData.qrExpiryNote && (
                                    <div className="alert alert-warning py-2 px-3 small text-start mb-3">
                                        <iconify-icon icon="ic:baseline-warning" className="me-1"></iconify-icon>
                                        {qrData.qrExpiryNote}
                                    </div>
                                )}



                                {/* Status Action Buttons */}
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-outline-primary flex-fill py-2 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-1"
                                        disabled={checkingStatus}
                                        onClick={() => checkTxnStatus(qrData.partnerRequestId, qrData.fpTxnId, true)}
                                    >
                                        {checkingStatus ? (
                                            <span className="spinner-border spinner-border-sm"></span>
                                        ) : (
                                            <iconify-icon icon="ic:baseline-refresh"></iconify-icon>
                                        )}
                                        Check Payment Status
                                    </button>
                                    <button className="btn btn-secondary py-2 px-4 rounded-3 fw-semibold" onClick={closeQrModal}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* RECEIPT MODAL */}
            {showReceiptModal && receiptData && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow-lg">
                            <div className="modal-header bg-dark text-white py-3 px-4">
                                <h5 className="modal-title fw-bold fs-6">Transaction Receipt</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowReceiptModal(false)}></button>
                            </div>
                            <div className="modal-body p-4" id="printable-receipt">
                                <div className="text-center mb-3">
                                    <h5 className="fw-bold mb-1">BHARAT PAY</h5>
                                    <p className="text-muted small mb-0">UPI Cash Withdrawal Receipt</p>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted small">Merchant ID:</span>
                                    <span className="fw-semibold small">{receiptData.mid}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted small">Txn ID:</span>
                                    <span className="fw-semibold small">{receiptData.merchant_txn_id}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted small">Service Type:</span>
                                    <span className="fw-semibold small">{receiptData.aeps_type}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted small">Customer Mobile:</span>
                                    <span className="fw-semibold small">{receiptData.customer_mobile || 'N/A'}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted small">Date & Time:</span>
                                    <span className="fw-semibold small">{new Date(receiptData.created_at).toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted small">Status:</span>
                                    <span className={`fw-bold small ${receiptData.response_status ? 'text-success' : 'text-danger'}`}>
                                        {receiptData.response_status ? 'SUCCESS' : 'FAILED'}
                                    </span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-bold">Total Amount:</span>
                                    <span className="fw-bold text-success fs-4">₹{parseFloat(receiptData.amount).toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="modal-footer bg-light">
                                <button className="btn btn-outline-dark rounded-3 px-4" onClick={() => window.print()}>Print</button>
                                <button className="btn btn-secondary rounded-3 px-4" onClick={() => setShowReceiptModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpiCashWithdrawal;
