import React from 'react';
import './LoadingOverlay.css';

const LoadingOverlay = ({ visible, title = "Processing Transaction", subtitle = "Please maintain a stable connection" }) => {
    if (!visible) return null;

    return (
        <div className="banking-loading-overlay">
            <div className="banking-loading-card">
                <div className="banking-spinner-wrapper">
                    <div className="banking-spinner-ring"></div>
                    {/* Minimal Lock Icon inside the spinner */}
                    <div className="banking-spinner-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                <div className="banking-text-content">
                    <h3 className="banking-title">{title}</h3>
                    <p className="banking-subtitle">{subtitle}</p>
                </div>

                <div className="banking-secure-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    <span>100% SECURE</span>
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlay;
