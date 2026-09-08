import React, { useContext,useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { retrieveTokenAndUserData } from '../core/auth/tokenManager';
import KycService from '../core/services/KycService';
import { AuthContext } from '../core/hooks/context';

const KycStatusIndicator = () => {
    const [kycStatus, setKycStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const { userData: user, logout } = useContext(AuthContext);
    useEffect(() => {
        checkLoginStatus();
        
        // Listen for login events
        const handleUserLoggedIn = () => {
            console.log('KycStatusIndicator: User login detected');
            checkLoginStatus();
            checkKycStatus();
        };

        window.addEventListener('userLoggedIn', handleUserLoggedIn);
        return () => window.removeEventListener('userLoggedIn', handleUserLoggedIn);
    }, []);

    const checkLoginStatus = () => {
        const { user, token } = retrieveTokenAndUserData() || {};
        const isLoggedIn = !!(user && token);
        setUserLoggedIn(isLoggedIn);
        
        if (isLoggedIn) {
            checkKycStatus();
        }
    };

    const checkKycStatus = async () => {
        try {
            setLoading(true);
            const status = await KycService.checkKycStatus();
            setKycStatus(status);
            
            // Show modal if KYC is required
            if (status?.required) {
                setShowModal(true);
            }
        } catch (error) {
            console.error('KYC status check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoToKyc = () => {
        setShowModal(false);
        navigate('/users/kyc');
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    if (!userLoggedIn || !kycStatus?.required) {
        return null;
    }

    return (
        <>
            {/* Modal Backdrop */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* Modal Content */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        padding: '30px',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                        textAlign: 'center',
                        position: 'relative'
                    }}>
                        {/* Close Button */}
                        

                        {/* KYC Icon */}
                        <div style={{
                            marginBottom: '20px'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                backgroundColor: '#f39c12',
                                borderRadius: '50%',
                                margin: '0 auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '36px',
                                color: 'white'
                            }}>
                                🔐
                            </div>
                        </div>

                        {/* Title */}
                        <h3 style={{
                            margin: '0 0 15px 0',
                            color: '#2c3e50',
                            fontWeight: '600'
                        }}>
                            KYC Verification Required
                        </h3>

                        {/* Description */}
                        <p style={{
                            margin: '0 0 25px 0',
                            color: '#7f8c8d',
                            lineHeight: '1.5',
                            fontSize: '16px'
                        }}>
                            To ensure security and compliance, please complete your KYC (Know Your Customer) verification process before accessing all features.
                        </p>

                        {/* Status Info */}
                        <div style={{
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffeaa7',
                            borderRadius: '5px',
                            padding: '15px',
                            marginBottom: '25px',
                            textAlign: 'left'
                        }}>
                            <div style={{ fontWeight: '600', color: '#856404', marginBottom: '8px' }}>
                                Current Status:
                            </div>
                            <div style={{ color: '#856404', fontSize: '14px' }}>
                                <div>Status: <span style={{ fontWeight: '600' }}>KYC Required</span></div>
                                <div>Action: Complete verification process</div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '15px',
                            justifyContent: 'center'
                        }}>
                            <button 
                                onClick={handleGoToKyc}
                                style={{
                                    backgroundColor: '#27ae60',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    padding: '12px 24px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#219a52'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#27ae60'}
                            >
                                Complete KYC Now
                            </button>
                            
                            <button 
                                onClick={checkKycStatus}
                                disabled={loading}
                                style={{
                                    backgroundColor: '#3498db',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    padding: '12px 24px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1,
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#2980b9')}
                                onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#3498db')}
                            >
                                {loading ? 'Checking...' : 'Refresh Status'}
                            </button>

                            <button
                                onClick={logout}
                                disabled={loading}
                                style={{
                                    backgroundColor: '#db4a34ff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    padding: '12px 24px',
                                    fontSize: '16px',   
                                    fontWeight: '600',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1,
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#2980b9')}
                                onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#3498db')}
                            >
                                {loading ? 'processing...' : 'Logout'}
                            </button>
                        </div>

                        {/* Debug Info (can be removed in production) */}
                        <div style={{
                            marginTop: '20px',
                            fontSize: '12px',
                            color: '#95a5a6',
                            textAlign: 'left',
                            backgroundColor: '#f8f9fa',
                            padding: '10px',
                            borderRadius: '5px'
                        }}>
                            <div style={{ fontWeight: '600', marginBottom: '5px' }}>Debug Info:</div>
                            <div>Redirect Path: {kycStatus?.redirect}</div>
                            <div>User Logged In: {userLoggedIn ? 'Yes' : 'No'}</div>
                            <div>KYC Required: {kycStatus?.required ? 'Yes' : 'No'}</div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default KycStatusIndicator;
