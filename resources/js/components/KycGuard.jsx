import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import KycService from '../core/services/KycService';
import { retrieveTokenAndUserData } from '../core/auth/tokenManager';

const KycGuard = ({ children }) => {
    const [kycChecked, setKycChecked] = useState(false);
    const [kycRequired, setKycRequired] = useState(false);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Routes that should be exempt from KYC check
    const exemptRoutes = [
        '/users/kyc',
        '/signin',
        '/signup'
    ];

    // Routes that should show KYC banner instead of redirect
    const bannerRoutes = [
        '/dashboard'
    ];

    useEffect(() => {
        // Check if user is logged in
        const { user, token } = retrieveTokenAndUserData() || {};
        const isLoggedIn = !!(user && token);
        setUserLoggedIn(isLoggedIn);
        
        if (isLoggedIn) {
            checkKycStatus();
        } else {
            // User not logged in, skip KYC check
            setKycChecked(true);
            setKycRequired(false);
        }
    }, [location.pathname]);

    // Also check on component mount and when user login status might change
    useEffect(() => {
        const interval = setInterval(() => {
            const { user, token } = retrieveTokenAndUserData() || {};
            const isLoggedIn = !!(user && token);
            
            if (isLoggedIn !== userLoggedIn) {
                setUserLoggedIn(isLoggedIn);
                
                if (isLoggedIn) {
                    // User just logged in, check KYC immediately
                    setKycChecked(false); // Reset check status
                    checkKycStatus();
                }
            }
        }, 500); // Check every 500ms for faster response

        return () => clearInterval(interval);
    }, [userLoggedIn]);

    // Listen for storage events (when login happens in another tab/window)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'token' || e.key === 'user') {
                const { user, token } = retrieveTokenAndUserData() || {};
                const isLoggedIn = !!(user && token);
                
                if (isLoggedIn && !userLoggedIn) {
                    setUserLoggedIn(true);
                    setKycChecked(false);
                    checkKycStatus();
                }
            }
        };

        const handleUserLoggedIn = (e) => {
            setUserLoggedIn(true);
            setKycChecked(false);
            // Small delay to ensure token is properly stored
            setTimeout(() => {
                checkKycStatus();
            }, 200);
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('userLoggedIn', handleUserLoggedIn);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userLoggedIn', handleUserLoggedIn);
        };
    }, [userLoggedIn]);

    const checkKycStatus = async () => {
        try {
            const { user, token } = retrieveTokenAndUserData() || {};
            
            // Skip KYC check for admin users or if no user
            if (!user || !token) {
                setKycChecked(true);
                setKycRequired(false);
                return;
            }

            if (KycService.isAdmin(user)) {
                setKycChecked(true);
                setKycRequired(false);
                return;
            }

            // Skip KYC check for exempt routes
            if (exemptRoutes.some(route => location.pathname.startsWith(route))) {
                setKycChecked(true);
                setKycRequired(false);
                return;
            }

            // Check KYC status
            const kycStatus = await KycService.checkKycStatus();
            
            setKycRequired(kycStatus.required);
            setKycChecked(true);

            // Debug: Log current route and KYC status
            console.log('KYC Debug - Current route:', location.pathname);
            console.log('KYC Debug - KYC required:', kycStatus.required);
            console.log('KYC Debug - Is banner route:', bannerRoutes.some(route => location.pathname.startsWith(route)));

            // Redirect to KYC page if required and not already on KYC page
            if (kycStatus.required && !location.pathname.startsWith('/users/kyc')) {
                console.log('KYC Debug - Redirecting to KYC page from:', location.pathname);
                navigate('/users/kyc', { 
                    replace: true,
                    state: { from: location.pathname }
                });
                return;
            }

            // If we're on dashboard and KYC is required, still show banner as backup
            if (bannerRoutes.some(route => location.pathname.startsWith(route)) && kycStatus.required) {
                console.log('KYC Debug - On dashboard with incomplete KYC - should show banner');
                return;
            }
        } catch (error) {
            console.error('KYC check failed:', error);
            // Don't block user flow if KYC check fails
            setKycChecked(true);
            setKycRequired(false);
        }
    };

    // Show loading while checking KYC status
    if (!kycChecked) {
        return (
            <div className="d-flex align-items-center justify-content-center min-vh-100">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Verifying account status...</p>
                </div>
            </div>
        );
    }

    // Show KYC required banner on dashboard if KYC is incomplete
    if (kycRequired && location.pathname === '/dashboard') {
        return (
            <>
                <KycRequiredBanner />
                {children}
            </>
        );
    }

    return children;
};

const KycRequiredBanner = () => {
    const navigate = useNavigate();

    return (
        <div className="alert alert-warning alert-dismissible fade show mb-0" role="alert" style={{ borderRadius: 0 }}>
            <div className="container-fluid">
                <div className="row align-items-center">
                    <div className="col-md-10">
                        <div className="d-flex align-items-center">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            <div>
                                <strong>KYC Verification Required</strong>
                                <p className="mb-0 small">
                                    Please complete your KYC verification to access all features and ensure account security.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 text-end">
                        <button
                            type="button"
                            className="btn btn-warning btn-sm"
                            onClick={() => navigate('/users/kyc')}
                        >
                            Complete KYC
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KycGuard;
