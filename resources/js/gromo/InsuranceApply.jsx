import React, { useContext, useEffect, useState } from 'react';

const InsuranceApply = () => {
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Redirect to InsuranceDekho website
                    window.location.href = 'https://www.insurancedekho.com/';
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{
                textAlign: 'center',
                padding: '40px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto 20px',
                    border: '4px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '4px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                
                <h2 style={{ margin: '0 0 10px', fontSize: '24px' }}>
                    🛡️ Insurance Protection Awaits
                </h2>
                
                <p style={{ margin: '0 0 20px', fontSize: '16px', opacity: 0.9 }}>
                    Taking you to InsuranceDekho for the best insurance deals
                </p>
                
                <div style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: '#FFD700',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
                }}>
                    {countdown}
                </div>
                
                <p style={{ margin: '10px 0 0', fontSize: '14px', opacity: 0.8 }}>
                    Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
                </p>
            </div>
            
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default InsuranceApply;
