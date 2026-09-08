import React from 'react';
import { useNavigate } from 'react-router-dom';

const CARD_CONFIG = {
    aadhaar: {
        title: 'Aadhaar Card',
        description: 'Download standard Aadhaar or masked Aadhaar instantly.',
        icon: 'fas fa-fingerprint',
        color: '#FF6B00',
        gradient: 'linear-gradient(135deg, #FF6B00 0%, #FF9800 100%)',
        bgSubtle: '#FFF3E0',
    },
    pan: {
        title: 'PAN Card',
        description: 'Verify and download official PAN details linked to NSDL.',
        icon: 'fas fa-address-card',
        color: '#1565C0',
        gradient: 'linear-gradient(135deg, #1A237E 0%, #1565C0 100%)',
        bgSubtle: '#E3F2FD',
    },
    dl: {
        title: 'Driving Licence',
        description: 'Get verified digital copy of Driving Licence from Transport Dept.',
        icon: 'fas fa-car',
        color: '#2E7D32',
        gradient: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
        bgSubtle: '#E8F5E9',
    },
    voter: {
        title: 'Voter ID',
        description: 'Download Election Commission of India verified Voter ID.',
        icon: 'fas fa-vote-yea',
        color: '#7B1FA2',
        gradient: 'linear-gradient(135deg, #4A148C 0%, #7B1FA2 100%)',
        bgSubtle: '#F3E5F5',
    },
    rc: {
        title: 'Vehicle RC',
        description: 'Download Registration Certificate data from Parivahan.',
        icon: 'fas fa-file-invoice',
        color: '#B71C1C',
        gradient: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
        bgSubtle: '#FFEBEE',
    },
};

const CardDownloads = () => {
    const navigate = useNavigate();

    return (
        <div className="container-fluid py-4 px-3 px-md-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            {/* Header Area */}
            <div className="mb-5 text-center">
                <h2 className="fw-bold mb-2" style={{ color: '#0f172a', letterSpacing: '-0.5px' }}>
                    Document Download Services
                </h2>
                <p className="text-muted fs-6 mx-auto" style={{ maxWidth: '600px' }}>
                    Access, verify, and download official government identity documents instantly and securely.
                </p>
            </div>

            {/* Grid Area */}
            <div className="row g-4 justify-content-center">
                {Object.entries(CARD_CONFIG).map(([key, config]) => (
                    <div className="col-12 col-md-6 col-lg-4" key={key}>
                        <div
                            className="card h-100 border-0 shadow-sm"
                            style={{
                                borderRadius: '16px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)';
                            }}
                            onClick={() => navigate(`/card-download/${key}`)}
                        >
                            {/* Decorative Header Bar */}
                            <div style={{ height: '4px', background: config.gradient, width: '100%' }}></div>

                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <div
                                        className="d-flex align-items-center justify-content-center rounded-3 shadow-sm me-3"
                                        style={{
                                            width: '56px',
                                            height: '56px',
                                            background: config.gradient,
                                            color: 'white',
                                            fontSize: '1.5rem'
                                        }}
                                    >
                                        <i className={config.icon}></i>
                                    </div>
                                    <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>{config.title}</h5>
                                </div>

                                <p className="text-secondary mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                    {config.description}
                                </p>

                                <div className="d-flex align-items-center justify-content-between mt-auto pt-3 border-top position-relative" style={{ zIndex: 1 }}>
                                    <span className="fw-semibold" style={{ color: config.color, fontSize: '0.9rem' }}>
                                        Access Service
                                    </span>
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: '32px', height: '32px', backgroundColor: config.bgSubtle, color: config.color }}
                                    >
                                        <i className="fas fa-arrow-right fs-6"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CardDownloads;
