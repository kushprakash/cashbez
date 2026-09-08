import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const GuestPaymentGateway = () => {
    const { accessKey: routeAccessKey } = useParams();
    const [searchParams] = useSearchParams();

    // Extract access_key or reference_id
    const accessKey = routeAccessKey || searchParams.get('access_key') || searchParams.get('accessKey');
    const queryTxnId = searchParams.get('reference_id') || searchParams.get('txnid') || searchParams.get('order_id');

    const [easebuzzLoaded, setEasebuzzLoaded] = useState(false);
    const [txnData, setTxnData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const autoLaunchedRef = useRef(false);
    const pollingTimerRef = useRef(null);
    const redirectingRef = useRef(false);

    // Helper: Perform Redirect
    const triggerRedirect = useCallback((targetUrl, delayMs = 500) => {
        if (!targetUrl || redirectingRef.current) return;
        redirectingRef.current = true;
        setTimeout(() => {
            window.location.href = targetUrl;
        }, delayMs);
    }, []);

    // 1. Load Easebuzz Checkout Web SDK Script
    useEffect(() => {
        if (window.EasebuzzCheckout) {
            setEasebuzzLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://ebz-static.s3.ap-south-1.amazonaws.com/easecheckout/v2.0.0/easebuzz-checkout-v2.min.js';
        script.async = true;
        script.onload = () => {
            console.log('Easebuzz Checkout SDK loaded successfully');
            setEasebuzzLoaded(true);
        };
        script.onerror = () => {
            console.error('Failed to load Easebuzz Checkout SDK');
            setError('Failed to load Easebuzz payment gateway SDK.');
            setLoading(false);
        };

        document.body.appendChild(script);
    }, []);

    // 2. Poll DB Status from /api/pg/transaction every 3 seconds
    const checkTxnStatus = useCallback(async () => {
        if (!accessKey && !queryTxnId) return;

        try {
            const response = await axios.get('/api/pg/transaction', {
                params: {
                    access_key: accessKey || '',
                    txnid: queryTxnId || ''
                }
            });

            if (response.data && response.data.status === 1) {
                const data = response.data.data;
                setTxnData(data);
                setLoading(false);

                const currentStatus = String(data.status).toLowerCase();

                // If transaction is SUCCESS in DB -> Redirect to success_url
                if (currentStatus === 'success' || currentStatus === '1' || currentStatus === 'completed') {
                    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
                    if (data.success_url) {
                        triggerRedirect(data.success_url, 500);
                    }
                } 
                // If transaction is FAILED in DB -> Redirect to failure_url
                else if (currentStatus === 'failed' || currentStatus === 'failure' || currentStatus === '0') {
                    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
                    if (data.failure_url) {
                        triggerRedirect(data.failure_url, 1000);
                    }
                }
            } else {
                if (!txnData) {
                    setError(response.data?.message || 'Invalid or expired transaction session.');
                    setLoading(false);
                }
            }
        } catch (err) {
            console.error('Error checking transaction status:', err);
            if (!txnData) {
                setError('Transaction session not found or expired.');
                setLoading(false);
            }
        }
    }, [accessKey, queryTxnId, txnData, triggerRedirect]);

    // Start status polling
    useEffect(() => {
        if (!accessKey && !queryTxnId) {
            setError('Invalid Payment URL: Missing payment reference key.');
            setLoading(false);
            return;
        }

        checkTxnStatus();
        pollingTimerRef.current = setInterval(checkTxnStatus, 3000);

        return () => {
            if (pollingTimerRef.current) {
                clearInterval(pollingTimerRef.current);
            }
        };
    }, [accessKey, queryTxnId, checkTxnStatus]);

    // 3. Launch Single Easebuzz Payment Modal
    const launchEasebuzzModal = useCallback(() => {
        if (!window.EasebuzzCheckout) return;

        const key = txnData?.key || 'OXWCT9JKVV';
        const env = txnData?.env || 'prod';
        const currentAccessKey = txnData?.access_key || accessKey;

        if (!currentAccessKey) return;

        try {
            const easebuzzCheckout = new window.EasebuzzCheckout(key, env);

            const options = {
                access_key: currentAccessKey,
                onResponse: async (response) => {
                    console.log('Easebuzz Response Callback:', response);
                    const isSuccess = response.status === 'success' || response.status === true || response.status === 1;

                    if (isSuccess) {
                        // Verify backend status
                        try {
                            const formData = new FormData();
                            formData.append('txnid', response.txnid || txnData?.txnid || '');
                            formData.append('status', 'success');
                            formData.append('easepayid', response.easepayid || '');
                            await axios.post('/api/add-money/verify', formData);
                        } catch (verifyErr) {
                            console.error('Backend verification error:', verifyErr);
                        }

                        checkTxnStatus();

                        if (txnData?.success_url) {
                            triggerRedirect(txnData.success_url, 500);
                        }
                    } else {
                        if (txnData?.failure_url) {
                            triggerRedirect(txnData.failure_url, 1000);
                        }
                    }
                },
                theme: '#2563eb'
            };

            easebuzzCheckout.initiatePayment(options);
        } catch (err) {
            console.error('Error initiating Easebuzz checkout:', err);
        }
    }, [txnData, accessKey, checkTxnStatus, triggerRedirect]);

    // 4. Auto-launch Easebuzz Gateway Modal ONLY ONCE
    useEffect(() => {
        if (easebuzzLoaded && txnData && !autoLaunchedRef.current) {
            autoLaunchedRef.current = true;
            launchEasebuzzModal();
        }
    }, [easebuzzLoaded, txnData, launchEasebuzzModal]);

    // Render Error Screen if invalid transaction
    if (error && !txnData) {
        return (
            <div style={styles.fullScreenContainer}>
                <div style={styles.errorBox}>
                    <div style={styles.errorIcon}>✕</div>
                    <h3 style={{ color: '#dc2626', fontWeight: '700', marginTop: '15px' }}>
                        Payment Link Error
                    </h3>
                    <p style={{ color: '#475569', margin: '15px 0', fontSize: '15px' }}>
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.fullScreenContainer}>
            <div style={styles.loadingBox}>
                <div style={styles.spinner}></div>
                <h4 style={{ marginTop: '20px', color: '#0f172a', fontWeight: '700' }}>
                    Connecting to Payment Gateway...
                </h4>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '6px 0 20px' }}>
                    Please wait while Easebuzz Payment Gateway opens.
                </p>
                <button 
                    onClick={launchEasebuzzModal} 
                    style={styles.relaunchBtn}
                >
                    Re-open Payment Window
                </button>
            </div>
        </div>
    );
};

// Clean full-screen neutral container styles for single Easebuzz SDK popup
const styles = {
    fullScreenContainer: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0f172a',
        zIndex: 99999,
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    },
    loadingBox: {
        textAlign: 'center',
        padding: '30px',
        maxWidth: '420px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    },
    relaunchBtn: {
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#ffffff',
        backgroundColor: '#2563eb',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
    },
    errorBox: {
        textAlign: 'center',
        padding: '30px',
        maxWidth: '400px',
        backgroundColor: '#ffffff',
        borderRadius: '16px'
    },
    errorIcon: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        fontSize: '24px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto'
    },
    spinner: {
        width: '45px',
        height: '45px',
        border: '4px solid #e2e8f0',
        borderTop: '4px solid #2563eb',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto'
    }
};

export default GuestPaymentGateway;
