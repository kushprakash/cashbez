import React, { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import AadhaarCard from './cards/AadhaarCard';
import PanCard from './cards/PanCard';
import DlCard from './cards/DlCard';
import VoterCard from './cards/VoterCard';
import RcCard from './cards/RcCard';
import DigitalIndiaLogo from './Digital_India_logo.png';

const WIDGET_MAP = {
    aadhaar: AadhaarCard,
    pan: PanCard,
    dl: DlCard,
    voter: VoterCard,
    rc: RcCard
};

const CardDownloadView = () => {
    const { cardType, id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // The data passed from the download screen or past downloads
    const cardData = location.state?.data;

    useEffect(() => {
        if (!cardData && id) {
            // Ideally should fetch single download using API here.
        }
    }, [cardData, cardType, id, navigate]);

    if (!cardData) {
        return (
            <div className="container py-5 text-center" style={{ minHeight: '80vh' }}>
                <div className="spinner-border text-primary mb-3" role="status"></div>
                <h5 className="text-secondary fw-semibold">Loading document...</h5>
                <button className="btn btn-primary mt-4 px-4" onClick={() => navigate(`/card-download/${cardType}`)}>
                    <i className="fas fa-arrow-left me-2"></i>Go Back
                </button>
            </div>
        );
    }

    const Widget = WIDGET_MAP[cardType];

    if (!Widget) {
        return <div className="p-5 text-center text-danger fw-bold fs-4">Invalid Card Type</div>;
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .print-area, .print-area * {
                            visibility: visible !important;
                        }
                        .print-area {
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100% !important;
                            padding: 0 !important;
                            margin: 0 !important;
                            border: none !important;
                        }
                        @page {
                            size: auto;
                            margin: 0mm;
                        }
                    }
                `}
            </style>

            <div className="row justify-content-center">
                <div className="col-12 col-xl-10">
                    {/* Top Action Bar */}
                    <div className="d-flex align-items-center justify-content-between mb-4 d-print-none bg-white p-3 rounded-3 shadow-sm">
                        <button className="btn btn-light d-flex align-items-center gap-2 border fw-semibold px-3" onClick={() => navigate(-1)}>
                            <i className="fas fa-arrow-left"></i> Back
                        </button>

                        <div className="d-flex align-items-center gap-4">
                            <h5 className="mb-0 fw-bold d-none d-md-block" style={{ color: '#1e293b' }}>
                                Document ID: <span className="text-primary font-monospace">#{id}</span>
                            </h5>
                            <button className="btn btn-lg d-flex align-items-center gap-2 fw-bold px-4 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', border: 'none' }} onClick={handlePrint}>
                                <i className="fas fa-file-pdf"></i> Download PDF / Print
                            </button>
                        </div>
                    </div>

                    {/* Main Viewer Area */}
                    <div className="card border-0 shadow-lg overflow-hidden" style={{ borderRadius: '16px' }}>

                        <div className="card-header bg-dark d-print-none d-flex align-items-center px-4 py-3 border-0">
                            <div className="d-flex gap-2 me-3">
                                <div className="rounded-circle bg-danger" style={{ width: '12px', height: '12px', opacity: 0.8 }}></div>
                                <div className="rounded-circle bg-warning" style={{ width: '12px', height: '12px', opacity: 0.8 }}></div>
                                <div className="rounded-circle bg-success" style={{ width: '12px', height: '12px', opacity: 0.8 }}></div>
                            </div>
                            <div className="bg-secondary bg-opacity-25 rounded-pill px-4 py-1 text-white-50 mx-auto d-flex align-items-center gap-2" style={{ minWidth: '40%', fontSize: '0.85rem' }}>
                                <i className="fas fa-lock text-success"></i>
                                verified-document-viewer
                            </div>
                        </div>

                        <div className="card-body p-0">
                            <div className="row g-0">
                                {/* Left Side: The Document */}
                                <div className="col-12 col-lg-8 p-4 p-md-5 bg-white border-end position-relative print-area" style={{ minHeight: '600px' }}>

                                    <div className="position-absolute top-50 start-50 translate-middle pointer-events-none" style={{ opacity: 0.03, zIndex: 0 }}>
                                        <i className="fas fa-shield-check" style={{ fontSize: '30rem' }}></i>
                                    </div>

                                    <div className="position-relative" style={{ zIndex: 1 }}>
                                        <div className="text-center mb-5 d-print-none">
                                            <h4 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Verified Digital Copy</h4>
                                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>This document is digitally verified and valid.</p>
                                        </div>

                                        <div className="d-flex justify-content-center">
                                            <div style={{ width: '100%', maxWidth: '600px' }}>
                                                <Widget data={cardData} isPrintView={true} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Verification Details */}
                                <div className="col-12 col-lg-4 bg-light p-4 d-print-none d-flex flex-column">
                                    <div className="text-center mb-5 bg-white py-4 rounded-3 border shadow-sm">
                                        <img src={DigitalIndiaLogo} alt="Digital India" style={{ maxWidth: '180px', height: 'auto' }} />
                                    </div>

                                    <div className="mb-4 flex-grow-1">
                                        <h6 className="fw-bold text-uppercase mb-3 px-1" style={{ color: '#64748b', fontSize: '11px', letterSpacing: '1.5px' }}>
                                            Document Metadata
                                        </h6>
                                        <div className="d-flex flex-column gap-3">
                                            <div className="bg-white p-3 rounded-3 border shadow-sm">
                                                <small className="text-muted d-block mb-1 text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>Verification Status</small>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="rounded-circle bg-success d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px' }}>
                                                        <i className="fas fa-check text-white" style={{ fontSize: '10px' }}></i>
                                                    </div>
                                                    <span className="fw-bold text-success fs-6">Verified Securely</span>
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-3 border shadow-sm">
                                                <small className="text-muted d-block mb-1 text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>Data Source</small>
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="fas fa-server text-indigo-500"></i>
                                                    <span className="fw-semibold" style={{ color: '#1e293b' }}>Authorized Govt. API</span>
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-3 border shadow-sm">
                                                <small className="text-muted d-block mb-1 text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>Generated Timestamp</small>
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="far fa-clock text-blue-500"></i>
                                                    <span className="fw-semibold font-monospace" style={{ color: '#1e293b', fontSize: '13px' }}>
                                                        {new Date().toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-top">
                                        <div className="alert alert-primary mb-0 d-flex align-items-start gap-3 border-0 rounded-3 shadow-sm" style={{ background: 'linear-gradient(to right, #eff6ff, #dbeafe)' }}>
                                            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '32px', height: '32px' }}>
                                                <i className="fas fa-info text-primary"></i>
                                            </div>
                                            <p className="mb-0 text-primary" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                                                Use the <strong className="fw-bold">Download PDF</strong> button to generate a perfectly scaled A4 copy of this document. Ensure background graphics are enabled in your print dialog.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardDownloadView;