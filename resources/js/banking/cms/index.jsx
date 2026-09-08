import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Pageheader from '../../layouts/Pageheader';
import ApiService from '../../core/services/ApiService';

import { AuthContext } from '../../core/hooks/context';
import { notify } from '../../core/messages/Toast';


const CMSService = () => {
    const navigate = useNavigate();
    const { userData } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [merchantId] = useState(userData?.mid);
    const [cmsUrl, setCmsUrl] = useState(null);
    const [error, setError] = useState(null);
    const [loginStatus, setLoginStatus] = useState('loading'); // 'loading', 'success', 'error'

    useEffect(() => {
        if (merchantId) {
            handleLogin();
        } else {
            setError('Merchant ID not found. Please complete your profile.');
            setLoginStatus('error');
            setLoading(false);
        }
    }, [merchantId]);

    const handleLogin = async () => {
        setLoading(true);
        setError(null);
        setLoginStatus('loading');

        try {
            const apiService = ApiService();
            const resp = await apiService.vPost(`/api/v2/cmsLogin`, { outletId: merchantId });

            if (resp.data) {
                if (resp.data.status === 1 && resp.data.url) {
                    setCmsUrl(resp.data.url);
                    setLoginStatus('success');
                    notify.success('CMS Portal Ready!');

                    // Open in new tab automatically
                    window.open(resp.data.url, '_blank', 'noopener,noreferrer');
                } else {
                    setError(resp.data.message || 'Failed to generate CMS login URL.');
                    setLoginStatus('error');
                    notify.error(resp.data.message || 'Login Failed.');
                }
            } else {
                setError('Login Session Expired. Please try again.');
                setLoginStatus('error');
                notify.error('Login Session Expired.');
            }
        } catch (err) {
            console.error('CMS Login Error:', err);
            setError('Network error. Please check your connection and try again.');
            setLoginStatus('error');
            notify.error('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const openCmsPortal = () => {
        if (cmsUrl) {
            window.open(cmsUrl, '_blank', 'noopener,noreferrer');
        } else {
            handleLogin();
        }
    };

    return (
        <>
            <Pageheader
                mainheading="CMS Service"
                parentfolder="Home"
                activepage="CMS Service"
            />

            <div className="container py-5">
                {/* Loading State */}
                {loginStatus === 'loading' && (
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Connecting to CMS Portal...</p>
                    </div>
                )}

                {/* Error State */}
                {loginStatus === 'error' && (
                    <div className="text-center">
                        <div className="alert alert-danger d-inline-block" role="alert">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            {error}
                        </div>
                        <div className="mt-3">
                            <button
                                className="btn btn-primary"
                                onClick={handleLogin}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Retrying...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-arrow-clockwise me-2"></i>
                                        Retry
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Success State */}
                {loginStatus === 'success' && (
                    <div className="text-center">
                        <div className="alert alert-success d-inline-block" role="alert">
                            <i className="bi bi-check-circle-fill me-2"></i>
                            CMS Portal is ready! A new tab should have opened.
                        </div>

                        <div className="card mt-4 mx-auto" style={{ maxWidth: '500px' }}>
                            <div className="card-body">
                                <h5 className="card-title">
                                    <i className="bi bi-bank me-2"></i>
                                    Cash Management System
                                </h5>
                                <p className="card-text text-muted">
                                    Click the button below to open the CMS portal if it didn't open automatically.
                                </p>
                                <button
                                    className="btn btn-primary btn-lg w-100"
                                    onClick={openCmsPortal}
                                >
                                    <i className="bi bi-box-arrow-up-right me-2"></i>
                                    Open CMS Portal
                                </button>

                                <div className="mt-3">
                                    <button
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={handleLogin}
                                        disabled={loading}
                                    >
                                        <i className="bi bi-arrow-clockwise me-1"></i>
                                        Generate New Session
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 text-muted small">
                            <p className="mb-1">
                                <i className="bi bi-info-circle me-1"></i>
                                If the portal doesn't open, please allow pop-ups for this site.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CMSService;