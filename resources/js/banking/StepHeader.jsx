import React from 'react';
import { useNavigate } from 'react-router-dom';

const StepHeader = ({ title, subtitle, icon, onBack, showBack = true, backUrl = '/banking/bill/payment' }) => {
    const navigate = useNavigate();

    const handleBackClick = () => {
        if (onBack) {
            onBack();
        } else if (backUrl) {
            navigate(backUrl);
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-between p-3 border bg-white rounded-3 mb-3 shadow-sm">
            <div className="d-flex align-items-center flex-grow-1 me-3">
                {showBack && (
                    <button
                        type="button"
                        onClick={handleBackClick}
                        className="btn btn-sm btn-outline-secondary me-3 d-inline-flex align-items-center justify-content-center flex-shrink-0"
                        title="Back"
                        style={{ width: '36px', height: '36px', borderRadius: '50%', padding: 0 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                )}
                {icon && <div className="me-3 flex-shrink-0">{icon}</div>}
                <div className="flex-grow-1 overflow-hidden">
                    <h5 className="fw-bold mb-0 text-dark text-truncate" style={{ fontSize: '1.1rem', color: '#1e293b' }}>
                        {title}
                    </h5>
                    {subtitle && (
                        <p className="mb-0 text-muted small text-truncate">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            <div className="d-flex align-items-center flex-shrink-0 gap-3">
                <img
                    src="/assets/bharat-connect.PNG"
                    alt="Bharat Connect"
                    style={{ maxHeight: '38px', width: 'auto', objectFit: 'contain' }}
                />
            </div>
        </div>
    );
};

export default StepHeader;
