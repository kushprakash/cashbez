import React, { useState, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const AddFundReceipt = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const txnId = searchParams.get('txnid');
    const [loading, setLoading] = useState(!!txnId);
    const [status, setStatus] = useState(false);
    const [message, setMessage] = useState('');

    const handleSmartBack = () => {
        try {
            // Case 1: Standard Javascript Channel (Android/Flutter)
            if (window.BackChannel) {
                window.BackChannel.postMessage(JSON.stringify({
                    type: "BACK_PRESSED",
                    source: "SMART_BACK"
                }));
                return;
            }

            // Case 2: iOS WebKit (WKWebView)
            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.BackChannel) {
                window.webkit.messageHandlers.BackChannel.postMessage(JSON.stringify({
                    type: "BACK_PRESSED",
                    source: "SMART_BACK"
                }));
                return;
            }

            // Case 3: Flutter InAppWebView (specific plugin)
            if (window.flutter_inappwebview) {
                window.flutter_inappwebview.callHandler('BACK_PRESSED');
                return;
            }
        } catch (error) {
            console.warn('Smart Back Error:', error);
        }

        // Case 4: Normal Web Browser / Fallback
        navigate('/banking/add-fund-history');
    };

    useEffect(() => {
        if (txnId) {
            const verifyPayment = async () => {
                try {
                    setLoading(true);
                    const apiService = ApiService();
                    const response = await apiService.vPost('/api/add-money/verify', { txnid: txnId }, true, true);
                    const { data } = response;

                    if (data.status !== 1 && data.status !== true && data.success !== true) {
                        setStatus(false);
                        setMessage(data.message || 'Payment verification failed.');
                    } else {
                        setStatus(true);
                        setMessage(data.message || 'Payment successfully verified.');
                    }
                } catch (err) {
                    setStatus(false);
                    setMessage('An error occurred during verification.');
                } finally {
                    setLoading(false);
                }
            };

            verifyPayment();
        } else {
            setLoading(false);
        }
    }, [txnId]);

    // Show loading screen when verifying payment
    if (loading) {
        return (
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row justify-content-center">
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-body text-center p-5">
                                    <div className="mb-4">
                                        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                    <h4 className="mb-3">Verifying Payment...</h4>
                                    <p className="text-muted">Please wait while we verify your payment transaction.</p>
                                    <p className="text-muted mb-0"><small>Transaction ID: {txnId}</small></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-content-box">
            <div className="page-content-box-inner">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body text-center p-5">
                                {status ? (
                                    // Success Message
                                    <>
                                        <div className="mb-4">
                                            <i className="fa fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                                        </div>
                                        <h2 className="mb-3 fw-bold text-success">Payment Successful!</h2>
                                        <p className="text-muted fs-5 mb-4">
                                            {message}
                                        </p>
                                        <div className="d-grid gap-2 col-md-8 mx-auto">
                                            <button
                                                onClick={handleSmartBack}
                                                className="btn btn-primary btn-lg"
                                            >
                                                Go Back
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    // Failed Message
                                    <>
                                        <div className="mb-4">
                                            <i className="fa fa-times-circle text-danger" style={{ fontSize: '4rem' }}></i>
                                        </div>
                                        <h2 className="mb-3 fw-bold text-danger">Payment Failed</h2>
                                        <p className="text-muted fs-5 mb-4">
                                            {message}
                                        </p>
                                        <div className="d-grid gap-2 col-md-8 mx-auto">
                                            <button
                                                onClick={handleSmartBack}
                                                className="btn btn-primary btn-lg"
                                            >
                                                Go Back
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddFundReceipt;
