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

    // Active UPI QR Code State
    const [qrData, setQrData] = useState(null);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const [copiedField, setCopiedField] = useState('');

    const apiService = ApiService();

    // Helper to trigger SweetAlert2 modal
    const fireSwal = async (options) => {
        const swal = window.Swal || window.sweetAlert || window.SweetAlert || window.Sweetalert2;
        if (swal) {
            return swal.fire(options);
        }
        alert((options.title || '') + '\n' + (options.text || ''));
        return { isConfirmed: true };
    };

    // Helper for device ID
    const getDeviceId = () => {
        let devId = localStorage.getItem('app_device_id');
        if (!devId) {
            devId = 'DEV_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
            localStorage.setItem('app_device_id', devId);
        }
        return devId;
    };

    // Fetch Wallets
    const fetchWallets = useCallback(async () => {
        setRefreshingBalance(true);
        try {
            const res = await apiService.vGet('/api/accounts');

            if (res?.data?.data?.accounts) {
                setWallets(res.data.data.accounts);
            } else if (res?.data?.accounts) {
                setWallets(res.data.accounts);
            } else if (Array.isArray(res?.data)) {
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

    // Automatically select Utility Wallet (primary_status === false / 0)
    const utilityWallet = wallets.find(
        acc => acc.primary_status === false || acc.primary_status === 0 || acc.primary_status === '0' || acc.primary_status === 'false'
    ) || wallets[0];

    useEffect(() => {
        if (utilityWallet && utilityWallet.id) {
            setAccountId(utilityWallet.id);
        }
    }, [utilityWallet]);

    // Handle URL search params on page load
    useEffect(() => {
        const urlAmount = searchParams.get('amount');
        if (urlAmount) {
            setAmount(urlAmount);
        }
    }, [searchParams]);

    // Currency Formatter
    const formatCurrency = (val) => {
        const num = parseFloat(val || 0);
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(num);
    };

    // Timer Formatter (MM:SS)
    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Preset amount buttons
    const presetAmounts = [100, 500, 1000, 2000, 5000];
    const handlePresetClick = (preset) => {
        setAmount(String(preset));
    };

    // Step 1: Initiate UPI Intent (/api/add-fund/upi-intent)
    const handleInitiatePayment = async (e) => {
        e.preventDefault();

        const numAmount = parseFloat(amount);
        if (!amount || isNaN(numAmount) || numAmount < 10) {
            toast.error('Minimum amount must be ₹10');
            return;
        }

        if (numAmount > 50000) {
            toast.error('Maximum allowed amount is ₹50,000');
            return;
        }

        const targetAccountId = accountId || utilityWallet?.id;
        if (!targetAccountId) {
            toast.error('Utility wallet not found. Please refresh page.');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                amount: numAmount,
                account_id: targetAccountId,
                device_id: getDeviceId()
            };

            const response = await apiService.vPost('/api/add-fund/upi-intent', payload);

            if (response?.data?.status === 1 && response?.data?.data) {
                setQrData(response.data.data);
                setTimeLeft(300); // 5 minutes countdown
                toast.success('QR Code generated. Please scan to complete payment.');
            } else {
                const errMsg = response?.data?.message || 'Failed to initiate UPI transaction';
                fireSwal({
                    title: 'Payment Failed',
                    text: errMsg,
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#EF4444'
                });
            }
        } catch (err) {
            console.error('Error initiating UPI intent:', err);
            const errMsg = err?.response?.data?.message || err?.message || 'Something went wrong while initiating payment';
            fireSwal({
                title: 'Payment Failed',
                text: errMsg,
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#EF4444'
            });
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Poll verifyPayment (/api/add-fund/verify) every second while QR is showing
    useEffect(() => {
        if (!qrData || !qrData.txnid) return;

        let isMounted = true;
        let isChecking = false;

        const intervalId = setInterval(async () => {
            if (isChecking) return;
            isChecking = true;

            try {
                const response = await apiService.vPost('/api/add-fund/verify', {
                    txnid: qrData.txnid
                });

                if (!isMounted) return;

                const resData = response?.data;

                // Case 1: Payment Complete / Success
                if (resData?.status === 1) {
                    clearInterval(intervalId);

                    await fireSwal({
                        title: 'Payment Successful!',
                        text: resData.message || 'Payment has been completed successfully. Fund credited to your wallet!',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#10B981',
                        allowOutsideClick: false,
                        allowEscapeKey: false
                    });

                    // On OK click, return to clean Add Fund Request state
                    if (isMounted) {
                        setQrData(null);
                        setAmount('');
                        fetchWallets();
                    }
                    return;
                }

                // Case 2: Payment Failed
                if (resData?.status === 2 || resData?.failed === true) {
                    clearInterval(intervalId);

                    await fireSwal({
                        title: 'Payment Failed',
                        text: resData.message || 'Payment has failed or was cancelled.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#EF4444',
                        allowOutsideClick: false,
                        allowEscapeKey: false
                    });

                    if (isMounted) {
                        setQrData(null);
                    }
                    return;
                }

                // If status is 0 (Pending), continue next polling tick
            } catch (err) {
                console.error('Verify payment poll error:', err);
            } finally {
                isChecking = false;
            }
        }, 1000); // Verify API runs every second

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [qrData, apiService, fetchWallets]);

    // Countdown Timer for QR Expiry (5 minutes)
    useEffect(() => {
        if (!qrData) return;

        const timerId = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerId);
                    fireSwal({
                        title: 'Payment Timed Out',
                        text: 'QR Code has expired. Please generate a new QR code to try again.',
                        icon: 'warning',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#F59E0B',
                        allowOutsideClick: false,
                        allowEscapeKey: false
                    }).then(() => {
                        setQrData(null);
                    });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [qrData]);

    // Cancel current QR code session
    const handleCancelPayment = () => {
        setQrData(null);
    };

    // Copy to clipboard helper
    const handleCopy = (text, fieldName) => {
        if (!text) return;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            setCopiedField(fieldName);
            toast.success(`Copied ${fieldName} to clipboard!`);
            setTimeout(() => setCopiedField(''), 2000);
        }
    };

    const qrImageUrl = qrData?.upi_intent ?
        `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrData.upi_intent)}`
        : null;

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

                        {/* CASE 1: AMOUNT INPUT FORM (When QR is NOT yet generated) */}

                        <div className="col-lg-6 col-md-8 col-sm-10 col-12">
                            <div className="card border-0 rounded-4 shadow-sm bg-white overflow-hidden">
                                <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
                                    <span className="d-flex align-items-center">
                                        <div className="bg-primary-subtle text-primary rounded-3 p-2 me-2.5 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                                            <i className="bi bi-wallet2 text-primary" style={{ fontSize: '1.2rem' }}></i>
                                        </div>
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
                                    <form onSubmit={handleInitiatePayment}>

                                        {/* UTILITY WALLET BALANCE DISPLAY BOX */}
                                        <div className="p-3 mb-4 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                            <div className="d-flex justify-content-between align-items-baseline">
                                                <div>
                                                    <div className="d-flex align-items-center gap-2 my-1">
                                                        <span className="badge bg-primary text-white mb-1 px-2 py-1" style={{ fontSize: '10px' }}>
                                                            UTILITY WALLET
                                                        </span>
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

                                        {/* AMOUNT INPUT */}
                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <label htmlFor="amount" className="form-label fw-semibold text-dark mb-0" style={{ fontSize: '13px' }}>
                                                    Enter Amount (₹)
                                                </label>
                                                <span className="text-muted" style={{ fontSize: '11px' }}>
                                                    Min ₹10 • Max ₹50,000
                                                </span>
                                            </div>

                                            <div className="input-group">
                                                <span className="input-group-text bg-light fw-bold text-dark">₹</span>
                                                <input
                                                    type="number"
                                                    id="amount"
                                                    className="form-control form-control-lg fw-bold"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    placeholder="Enter amount to add"
                                                    step="1"
                                                    min="10"
                                                    max="50000"
                                                    required
                                                    style={{ fontSize: '1.2rem' }}
                                                />
                                            </div>
                                        </div>

                                        {/* QUICK PRESET AMOUNT CHIPS */}
                                        <div className="mb-4">
                                            <small className="text-muted d-block mb-1.5 fw-semibold" style={{ fontSize: '11px' }}>
                                                Quick Select Amount:
                                            </small>
                                            <div className="d-flex flex-wrap gap-2">
                                                {presetAmounts.map((val) => (
                                                    <button
                                                        key={val}
                                                        type="button"
                                                        className={`btn btn-sm rounded-pill px-3 py-1 fw-bold ${parseFloat(amount) === val ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
                                                        onClick={() => handlePresetClick(val)}
                                                        style={{ fontSize: '12px' }}
                                                    >
                                                        +₹{val.toLocaleString('en-IN')}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* SUBMIT BUTTON */}
                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100 rounded-pill py-2.5 fw-bold text-white shadow-sm d-flex align-items-center justify-content-center"
                                            disabled={loading}
                                            style={{ fontSize: '1rem', background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)', border: 'none' }}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Generating QR Code...
                                                </>
                                            ) : (
                                                <>
                                                    <iconify-icon icon="solar:qr-code-bold" class="me-2 fs-5 align-middle"></iconify-icon>
                                                    Proceed to Pay with QR
                                                </>
                                            )}
                                        </button>

                                    </form>
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