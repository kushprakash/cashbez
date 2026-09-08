import React, { useState, useEffect, useCallback } from 'react';
import ApiService from '../../core/services/ApiService';
import { Link, useSearchParams } from 'react-router-dom';
import Pageheader from '../../layouts/Pageheader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddFundRequest = () => {
    const [searchParams] = useSearchParams();
    const [amount, setAmount] = useState('');
    const [accountId, setAccountId] = useState('');
    const [loading, setLoading] = useState(false);
    const [wallets, setWallets] = useState([]);
    const [refreshingBalance, setRefreshingBalance] = useState(false);
    const [easebuzzLoaded, setEasebuzzLoaded] = useState(false);
    const [hasAutoTriggered, setHasAutoTriggered] = useState(false);

    // QR Code State
    const [vaData, setVaData] = useState(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [copiedField, setCopiedField] = useState('');
    const [qrForm, setQrForm] = useState({
        name: '',
        account_number: '',
        account_ifsc: ''
    });

    const apiService = ApiService();

    // Easebuzz Environment
    const easebuzzEnv = 'prod'; // Change to 'test' for testing

    // Load Easebuzz Checkout SDK
    useEffect(() => {
        if (window.EasebuzzCheckout) {
            setEasebuzzLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src =
            'https://ebz-static.s3.ap-south-1.amazonaws.com/easecheckout/v2.0.0/easebuzz-checkout-v2.min.js';
        script.async = true;

        script.onload = () => {
            console.log('Easebuzz Checkout SDK loaded');
            setEasebuzzLoaded(true);
        };

        script.onerror = () => {
            console.error('Failed to load Easebuzz Checkout SDK');
            toast.error('Failed to load payment gateway');
        };

        document.body.appendChild(script);

        return () => {
            // Script is kept for reuse
        };
    }, []);

    // Fetch Wallets Function
    const fetchWallets = useCallback(async () => {
        setRefreshingBalance(true);
        try {
            const res = await apiService.vGet('/api/accounts');

            if (res.data && res.data.data && res.data.data.accounts) {
                setWallets(res.data.data.accounts);
            } else if (res.data && res.data.accounts) {
                setWallets(res.data.accounts);
            } else if (res.data && Array.isArray(res.data)) {
                setWallets(res.data);
            }
        } catch (err) {
            console.error('Error fetching wallets:', err);
            toast.error('Failed to load wallets');
        } finally {
            setRefreshingBalance(false);
        }
    }, []);

    useEffect(() => {
        fetchWallets();
    }, [fetchWallets]);

    // Fetch existing QR / Virtual Account details on page load
    const fetchVaData = useCallback(async () => {
        try {
            const res = await apiService.vGet('/api/qr-details');
            if (res?.data?.status === 1 && res?.data?.data) {
                setVaData(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching VA details:', err);
        }
    }, []);

    useEffect(() => {
        fetchVaData();
    }, [fetchVaData]);

    // Fetch KYC details for pre-filling QR form hidden fields
    useEffect(() => {
        const fetchKycAccountDetails = async () => {
            try {
                const res = await apiService.vGet('/api/dashboard');
                const kyc = res?.data?.data?.kyc_account || res?.data?.kyc_account;
                const user = res?.data?.data?.user || res?.data?.user;

                if (kyc) {
                    setQrForm({
                        name: kyc.name || user?.name || '',
                        account_number: kyc.account_number || '',
                        account_ifsc: kyc.ifsc_code || kyc.account_ifsc || ''
                    });
                } else if (user?.name) {
                    setQrForm(prev => ({
                        ...prev,
                        name: prev.name || user.name
                    }));
                }
            } catch (err) {
                console.error('Error fetching KYC details:', err);
            }
        };

        fetchKycAccountDetails();
    }, []);

    // Automatically select Utility Wallet (primary_status === false / 0)
    const utilityWallet = wallets.find(
        acc => acc.primary_status === false || acc.primary_status === 0 || acc.primary_status === '0' || acc.primary_status === 'false'
    ) || wallets[0];

    useEffect(() => {
        if (utilityWallet && utilityWallet.id) {
            setAccountId(utilityWallet.id);
        }
    }, [utilityWallet]);

    // Initiate payment helper
    const initiatePaymentFlow = useCallback(async (targetAccountId, targetAmount) => {
        const finalAccountId = targetAccountId || utilityWallet?.id;

        if (!finalAccountId) {
            toast.error('Utility wallet not found');
            return;
        }

        if (!targetAmount || parseFloat(targetAmount) < 1) {
            toast.error('Amount must be at least ₹1');
            return;
        }

        if (!easebuzzLoaded || !window.EasebuzzCheckout) {
            toast.error('Payment gateway is loading. Please try again.');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('amount', targetAmount);
            formData.append('account_id', finalAccountId);

            const response = await apiService.vPost(
                '/api/add-money/request',
                formData,
                true,
                true
            );

            const { data } = response;
            console.log('Payment API Response:', data);

            const accessKey =
                data?.data?.access_key ||
                data?.access_key ||
                data?.data?.payment?.access_key;

            const merchantKey =
                data?.data?.key ||
                data?.key ||
                data?.data?.merchant_key ||
                'OXWCT9JKVV';

            const activeEnv = data?.data?.env || easebuzzEnv;

            if (!accessKey) {
                throw new Error(
                    data?.message ||
                    'Payment access key not received from server'
                );
            }

            const easebuzzCheckout = new window.EasebuzzCheckout(
                merchantKey,
                activeEnv
            );

            const options = {
                access_key: accessKey,

                onResponse: async (response) => {
                    console.log('Easebuzz Payment Response:', response);

                    if (
                        response.status === 'success' ||
                        response.status === true ||
                        response.status === 1
                    ) {
                        toast.success('Payment completed successfully');

                        try {
                            const verifyData = new FormData();
                            verifyData.append('txnid', data?.data?.txnid || response.txnid || '');
                            verifyData.append('status', 'success');
                            verifyData.append('easepayid', response.easepayid || '');

                            await apiService.vPost('/api/add-money/verify', verifyData, true, true);
                            fetchWallets(); // Refresh wallet balance
                        } catch (vErr) {
                            console.error('Error verifying payment with backend:', vErr);
                        }

                        setAmount('');
                    } else if (
                        response.status === 'userCancelled' ||
                        response.result === 'userCancelled'
                    ) {
                        toast.info('Payment was cancelled');
                    } else {
                        toast.error(response.error_Message || 'Payment failed or declined');
                    }

                    setLoading(false);
                },

                theme: '#123456'
            };

            easebuzzCheckout.initiatePayment(options);

        } catch (err) {
            console.error('Error submitting fund request:', err);

            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                'Failed to initiate payment';

            toast.error(errorMessage);
            setLoading(false);
        }
    }, [easebuzzLoaded, easebuzzEnv, utilityWallet, fetchWallets]);

    // Handle URL search params on page load
    useEffect(() => {
        const urlAmount = searchParams.get('amount');
        const urlAccountId = searchParams.get('account_id') || searchParams.get('accountId');

        if (urlAmount) {
            setAmount(urlAmount);
        }

        if (urlAmount && (urlAccountId || utilityWallet?.id) && easebuzzLoaded && !hasAutoTriggered && !loading) {
            setHasAutoTriggered(true);
            initiatePaymentFlow(urlAccountId || utilityWallet?.id, urlAmount);
        }
    }, [searchParams, easebuzzLoaded, hasAutoTriggered, loading, initiatePaymentFlow, utilityWallet]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await initiatePaymentFlow(accountId || utilityWallet?.id, amount);
    };

    // Quick amount setter
    const addPresetAmount = (val) => {
        const current = parseFloat(amount || 0);
        setAmount(String(current + val));
    };

    // QR Code Generation on Button Click (/api/va/generate-qr)
    const handleGenerateQrSubmit = async (e) => {
        e.preventDefault();
        if (!qrForm.name || !qrForm.account_number || !qrForm.account_ifsc) {
            toast.error('Please enter Account Holder Name, Account Number and IFSC Code');
            return;
        }
        setQrLoading(true);
        try {
            const response = await apiService.vPost('/api/va/generate-qr', {
                name: qrForm.name,
                account_number: qrForm.account_number,
                account_ifsc: qrForm.account_ifsc
            });
            if (response?.data?.status === 1) {
                toast.success(response.data.message || 'QR Code Generated Successfully!');
                setVaData(response.data.data);
            } else {
                toast.error(response?.data?.message || 'Failed to generate QR Code');
            }
        } catch (error) {
            console.error('Error generating QR:', error);
            toast.error(error?.response?.data?.message || 'Failed to generate QR Code');
        } finally {
            setQrLoading(false);
        }
    };

    const handleCopy = (text, fieldName) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            setCopiedField(fieldName);
            toast.success('Copied to clipboard!');
            setTimeout(() => setCopiedField(''), 2000);
        }
    };

    const handleShare = (text, title) => {
        if (navigator.share) {
            navigator.share({ title: title, text: text }).catch(() => { });
        } else {
            handleCopy(text, title);
        }
    };

    const handleDownloadPdf = () => {
        if (vaData?.qrcode_pdf) {
            window.open(vaData.qrcode_pdf, '_blank');
        } else if (vaData?.qrcode_image) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head><title>QR Code</title></head>
                    <body style="text-align:center; padding: 40px;">
                        <h2>UPI Payment QR Code</h2>
                        <img src="${vaData.qrcode_image}" style="max-width:300px; margin-top:20px;" />
                        <p style="font-size:18px; font-weight:bold; margin-top:15px;">${vaData.virtual_upi_handle || ''}</p>
                        <script>window.onload = function() { window.print(); }</script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        } else {
            toast.error('QR Image/PDF not available');
        }
    };

    const formatCurrency = (val) => {
        const num = parseFloat(val || 0);
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(num);
    };

    const qrImageUrl = vaData?.qrcode_image || (
        vaData?.virtual_upi_handle ?
            `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${vaData.virtual_upi_handle}&pn=${encodeURIComponent(vaData.username || 'Merchant')}`
            : null
    );

    return (
        <>
            <Pageheader
                mainheading="Add Fund Request"
                parentfolder="Banking"
                activepage="Add Fund"
            />

            <ToastContainer position="top-right" autoClose={3000} />

            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row g-3 justify-content-center">

                        {/* LEFT COLUMN: ADD FUND FORM (ORIGINAL DESIGN) */}
                        <div className="col-lg-5 col-md-6">
                            <div className="card border-0 rounded-4 shadow-sm">
                                <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
                                    <span className="d-flex align-items-center">
                                        <i className="bi bi-wallet2 text-primary me-2" style={{ fontSize: '1.3rem' }}></i>
                                        <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>
                                            Add Fund
                                        </h5>
                                    </span>

                                    <Link
                                        to="/banking/add-fund-history"
                                        className="btn btn-outline-primary btn-sm rounded-pill d-flex align-items-center px-3"
                                    >
                                        <i className="fa fa-list me-1"></i>
                                        History
                                    </Link>
                                </div>

                                <div className="card-body p-4">
                                    <form onSubmit={handleSubmit}>

                                        {/* UTILITY WALLET BALANCE DISPLAY BOX */}
                                        <div className="p-3 mb-4 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                            <div className="d-flex justify-content-between align-items-baseline">
                                                <div>


                                                    <div className="d-flex align-items-center gap-2 my-1">
                                                        <span className="badge bg-primary text-white mb-1 px-2 py-1" style={{ fontSize: '10px' }}>
                                                            UTILITY WALLET
                                                        </span>
                                                        <small className="text-muted" style={{ fontSize: '11.5px' }}></small>
                                                        {/* RELOAD BALANCE BUTTON RIGHT AFTER AVAILABLE BALANCE */}
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-light border rounded-circle p-0 d-inline-flex align-items-center justify-content-center shadow-xs"
                                                            onClick={fetchWallets}
                                                            disabled={refreshingBalance}
                                                            title="Reload Balance"
                                                            style={{ width: '24px', height: '24px' }}
                                                        >
                                                            <i className={`fa fa-refresh text-primary ${refreshingBalance ? 'fa-spin' : ''}`} style={{ fontSize: '11px' }}></i>
                                                        </button>
                                                    </div>

                                                    <h3 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.5rem', color: '#0F172A' }}>
                                                        {formatCurrency(utilityWallet?.raw_available_balance ?? utilityWallet?.available_balance ?? utilityWallet?.balance)}
                                                    </h3>
                                                </div>

                                                {utilityWallet?.number && (
                                                    <div className="text-end">
                                                        <small className="text-muted d-block" style={{ fontSize: '10px' }}>Acc No.</small>
                                                        <span className="font-monospace fw-bold text-dark" style={{ fontSize: '12px' }}>
                                                            {utilityWallet.number}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* AMOUNT INPUT (No Wallet Select) */}
                                        <div className="mb-4">
                                            <label htmlFor="amount" className="form-label fw-semibold text-dark" style={{ fontSize: '13px' }}>
                                                Enter Amount (₹)
                                            </label>

                                            <div className="input-group">
                                                <span className="input-group-text bg-white fw-bold text-muted">₹</span>
                                                <input
                                                    type="number"
                                                    id="amount"
                                                    className="form-control form-control-lg fw-bold"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    placeholder="Enter amount to add"
                                                    step="0.01"
                                                    min="1"
                                                    required
                                                    style={{ fontSize: '1.1rem' }}
                                                />
                                            </div>
                                        </div>

                                        {/* PROCEED TO PAY BUTTON */}
                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100 rounded-pill py-2.5 fw-bold text-white shadow-sm"
                                            disabled={loading || !easebuzzLoaded}
                                            style={{ fontSize: '1rem', background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)', border: 'none' }}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Processing Payment...
                                                </>
                                            ) : !easebuzzLoaded ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Loading Payment Gateway...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-cash-coin me-2"></i>
                                                    Proceed to Pay
                                                </>
                                            )}
                                        </button>

                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: QR CODE SECTION */}
                        <div className="col-lg-7 col-md-6">
                            <div className="card border-0 rounded-4 shadow-sm bg-white overflow-hidden">
                                <div className="card-header bg-white border-bottom p-3">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-success-subtle text-success rounded-3 p-2 me-2.5 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                                            <iconify-icon icon="solar:qr-code-bold-duotone" style={{ fontSize: '22px' }}></iconify-icon>
                                        </div>
                                        <div className='me-2'>
                                            <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '15px' }}>
                                                &nbsp;UPI Virtual QR Code
                                            </h6>
                                            <small className="text-muted" style={{ fontSize: '11px' }}>&nbsp;&nbsp;&nbsp;&nbsp;Linked with Verified KYC Account</small>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body p-3.5">
                                    {vaData ? (
                                        /* AFTER GENERATING DATA: QR AUTOMATICALLY SHOWS INLINE WITH DOWNLOAD & SHARE BUTTONS */
                                        <div className="d-flex flex-column align-items-center justify-content-between text-center">
                                            {/* QR IMAGE (AUTO SHOW) */}
                                            {qrImageUrl ? (
                                                <div className="p-2.5 bg-white rounded-4 border shadow-sm my-1 position-relative" style={{ maxWidth: '210px' }}>
                                                    <img
                                                        src={qrImageUrl}
                                                        alt="UPI QR Code"
                                                        className="img-fluid rounded-3"
                                                        style={{ width: '180px', height: '180px', objectFit: 'contain' }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="p-3 bg-light rounded-3 my-1 text-muted fw-bold">
                                                    QR Code Ready
                                                </div>
                                            )}

                                            {/* UPI ID BOX CARD */}
                                            <div className="p-2.5 rounded-3 border my-2 shadow-xs w-100" style={{ backgroundColor: '#F8FAFC', borderColor: '#CBD5E1', maxWidth: '320px' }}>
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <span className="text-muted fw-bold text-uppercase d-flex align-items-center" style={{ fontSize: '9.5px', letterSpacing: '0.5px' }}>
                                                        <iconify-icon icon="solar:wallet-money-bold-duotone" className="me-1 text-primary" style={{ fontSize: '13px' }}></iconify-icon>
                                                        Virtual UPI ID
                                                    </span>
                                                    {copiedField === 'upi' && (
                                                        <span className="badge bg-success-subtle text-success fw-bold px-1.5 py-0.5" style={{ fontSize: '8.5px' }}>
                                                            ✓ Copied
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center gap-1">
                                                    <span className="fw-bold text-dark font-monospace text-truncate user-select-all" style={{ fontSize: '13px', color: '#0F172A' }} title={vaData.virtual_upi_handle}>
                                                        {vaData.virtual_upi_handle || 'N/A'}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-white border rounded-pill px-2.5 py-0.5 d-flex align-items-center text-primary shadow-xs flex-shrink-0"
                                                        onClick={() => handleCopy(vaData.virtual_upi_handle, 'upi')}
                                                        title="Copy UPI ID"
                                                        style={{ fontSize: '11px', fontWeight: '600', backgroundColor: '#FFFFFF' }}
                                                    >
                                                        <iconify-icon icon="solar:check-circle-bold" className="me-1" style={{ fontSize: '13px', color: copiedField === 'upi' ? '#10B981' : '#2563EB' }}></iconify-icon>
                                                        {copiedField === 'upi' ? 'Copied' : 'Copy'}
                                                    </button>
                                                </div>
                                            </div>

                                            <p className="text-muted mb-3" style={{ fontSize: '11px' }}>
                                                Scan using Google Pay, PhonePe, or Paytm to add funds.
                                            </p>

                                            {/* ACTION BUTTONS: DOWNLOAD PDF & SHARE QR */}
                                            <div className="d-flex flex-wrap justify-content-center gap-2.5 w-100" style={{ maxWidth: '320px' }}>
                                                {/* 1. DOWNLOAD PDF */}
                                                <button
                                                    type="button"
                                                    className="btn btn-success btn-sm rounded-pill px-3 py-2 fw-bold d-flex align-items-center justify-content-center text-white shadow-sm flex-fill"
                                                    onClick={handleDownloadPdf}
                                                    style={{ fontSize: '12px', background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)', border: 'none' }}
                                                >
                                                    <iconify-icon icon="solar:download-minimalistic-bold-duotone" className="me-1.5 fs-5"></iconify-icon>
                                                    Download QR
                                                </button>

                                                {/* 2. SHARE QR */}
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary btn-sm rounded-pill px-3 py-2 fw-bold d-flex align-items-center justify-content-center shadow-sm flex-fill"
                                                    onClick={() => handleShare(`UPI ID: ${vaData.virtual_upi_handle || ''}`, 'Share Payment QR')}
                                                    style={{ fontSize: '12px', borderColor: '#2563EB', color: '#2563EB' }}
                                                >
                                                    <iconify-icon icon="solar:share-bold-duotone" className="me-1.5 fs-5"></iconify-icon>
                                                    Share QR
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* BEFORE GENERATING DATA: COMPACT HIGH-CONTRAST CARD WITH HIDDEN INPUTS & CREATE BUTTON */
                                        <form onSubmit={handleGenerateQrSubmit} className="d-flex flex-column justify-content-between">
                                            {/* Hidden Inputs for Name, Account Number, IFSC */}
                                            <input type="hidden" name="name" value={qrForm.name} />
                                            <input type="hidden" name="account_number" value={qrForm.account_number} />
                                            <input type="hidden" name="account_ifsc" value={qrForm.account_ifsc} />

                                            {/* Compact Account Details Display Box */}
                                            <div className="d-flex flex-column gap-2 mb-2">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="text-muted fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.4px' }}>Verified Bank Account</span>
                                                    <span className="badge bg-success-subtle text-success border border-success-subtle fw-bold px-2 py-1" style={{ fontSize: '9px', borderRadius: '6px' }}>
                                                        ✓ KYC VERIFIED
                                                    </span>
                                                </div>

                                                {/* 1. Account Holder Name */}
                                                <div className="p-2 rounded-3 border bg-light" style={{ borderColor: '#E2E8F0' }}>
                                                    <div className="d-flex align-items-center">
                                                        <div className="rounded-circle bg-primary-subtle text-primary p-1.5 me-2 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', minWidth: '28px' }}>
                                                            <iconify-icon icon="solar:user-bold-duotone" style={{ fontSize: '16px' }}></iconify-icon>
                                                        </div>
                                                        <div className="w-100 overflow-hidden">
                                                            <span className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '8.5px' }}>Account Holder</span>
                                                            <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '12px' }}>
                                                                {qrForm.name || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 2. Account Number & IFSC Code (50% - 50%) */}
                                                <div className="row g-2">
                                                    {/* Account Number */}
                                                    <div className="col-6">
                                                        <div className="p-2 rounded-3 border bg-light" style={{ borderColor: '#E2E8F0' }}>
                                                            <div className="d-flex align-items-center">
                                                                <div className="rounded-circle bg-success-subtle text-success p-1.5 me-1.5 d-flex align-items-center justify-content-center" style={{ width: '26px', height: '26px', minWidth: '26px' }}>
                                                                    <iconify-icon icon="solar:card-bold-duotone" style={{ fontSize: '14px' }}></iconify-icon>
                                                                </div>
                                                                <div className="w-100 overflow-hidden">
                                                                    <span className="text-muted d-block fw-bold text-uppercase text-truncate" style={{ fontSize: '8.5px' }}>Acc No</span>
                                                                    <span className="fw-bold text-dark font-monospace text-truncate d-block" style={{ fontSize: '11px' }}>
                                                                        {qrForm.account_number || 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* IFSC Code */}
                                                    <div className="col-6">
                                                        <div className="p-2 rounded-3 border bg-light" style={{ borderColor: '#E2E8F0' }}>
                                                            <div className="d-flex align-items-center">
                                                                <div className="rounded-circle bg-info-subtle text-info p-1.5 me-1.5 d-flex align-items-center justify-content-center" style={{ width: '26px', height: '26px', minWidth: '26px' }}>
                                                                    <iconify-icon icon="solar:banknote-bold-duotone" style={{ fontSize: '14px' }}></iconify-icon>
                                                                </div>
                                                                <div className="w-100 overflow-hidden">
                                                                    <span className="text-muted d-block fw-bold text-uppercase text-truncate" style={{ fontSize: '8.5px' }}>IFSC</span>
                                                                    <span className="fw-bold text-primary font-monospace text-truncate d-block" style={{ fontSize: '11px' }}>
                                                                        {qrForm.account_ifsc || 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Click to Generate Virtual QR Button */}
                                            <button
                                                type="submit"
                                                disabled={qrLoading}
                                                className="btn btn-success w-100 rounded-pill py-2.5 fw-bold text-white shadow-sm mt-2"
                                                style={{ background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)', border: 'none', fontSize: '0.95rem' }}
                                            >
                                                {qrLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <iconify-icon icon="solar:qr-code-bold" class="me-1.5 fs-5 align-middle"></iconify-icon>
                                                        Click to Generate Virtual QR
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default AddFundRequest;