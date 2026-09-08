import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const DsaSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { category, item, lead, otherUrl } = location.state || {};
    const [copied, setCopied] = useState(false);

    if (!item || !otherUrl) {
        navigate('/dsa/services');
        return null;
    }

    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(otherUrl);
            setCopied(true);
            toast.success('URL copied to clipboard!');
            setTimeout(() => setCopied(false), 3000);
        } catch (error) {
            toast.error('Failed to copy URL');
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Apply for ${item.title}`,
                    text: `Complete your ${item.title} application using this link:`,
                    url: otherUrl,
                });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    handleCopyUrl();
                }
            }
        } else {
            handleCopyUrl();
        }
    };

    const handleOpenUrl = () => {
        window.open(otherUrl, '_blank');
    };

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    {/* Success Card */}
                    <div className="card border-0 shadow-sm text-center">
                        <div className="card-body p-5">
                            {/* Success Icon */}
                            <div className="mb-4">
                                <div
                                    className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success-subtle"
                                    style={{ width: '80px', height: '80px' }}
                                >
                                    <i className="fa fa-check fa-2x text-success"></i>
                                </div>
                            </div>

                            <h4 className="fw-bold mb-2">Application Submitted!</h4>
                            <p className="text-muted mb-4">
                                Your application for <strong>{item.title}</strong> has been submitted successfully.
                            </p>

                            {/* URL Card */}
                            <div className="card bg-light border-0 mb-4">
                                <div className="card-body p-3">
                                    <h6 className="fw-bold mb-2 text-dark">
                                        <i className="fa fa-link me-2 text-primary"></i>
                                        Complete Your Application
                                    </h6>
                                    <p className="small text-muted mb-3">
                                        Use this link to complete your {item.title} registration
                                    </p>
                                    <div className="input-group mb-3">
                                        <input
                                            type="text"
                                            className="form-control form-control-sm bg-white"
                                            value={otherUrl}
                                            readOnly
                                        />
                                        <button
                                            className={`btn btn-sm ${copied ? 'btn-success' : 'btn-outline-primary'}`}
                                            onClick={handleCopyUrl}
                                        >
                                            <i className={`fa ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                                        </button>
                                    </div>

                                    <div className="d-flex gap-2 justify-content-center">
                                        <button
                                            className="btn btn-primary flex-grow-1"
                                            onClick={handleOpenUrl}
                                        >
                                            <i className="fa fa-external-link-alt me-2"></i>
                                            Open Link
                                        </button>
                                        <button
                                            className="btn btn-outline-primary"
                                            onClick={handleShare}
                                        >
                                            <i className="fa fa-share-alt"></i>
                                        </button>
                                        <button
                                            className={`btn ${copied ? 'btn-success' : 'btn-outline-primary'}`}
                                            onClick={handleCopyUrl}
                                        >
                                            <i className={`fa ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Info Alert */}
                            <div className="alert alert-info border-0 small text-start mb-4">
                                <i className="fa fa-info-circle me-2"></i>
                                The application link has been sent to your registered mobile and email.
                            </div>

                            {/* Actions */}
                            <div className="d-flex gap-2 justify-content-center">
                                <Link
                                    to="/dsa/dashboard"
                                    state={{ category, item }}
                                    className="btn btn-light"
                                >
                                    <i className="fa fa-arrow-left me-2"></i>
                                    Dashboard
                                </Link>
                                <Link
                                    to="/dsa/list"
                                    state={{ category, item }}
                                    className="btn btn-outline-primary"
                                >
                                    <i className="fa fa-list me-2"></i>
                                    My Applications
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    {item.instructions?.length > 0 && (
                        <div className="card border-0 shadow-sm mt-4">
                            <div className="card-header bg-white border-bottom py-3">
                                <h6 className="fw-bold mb-0 text-primary">
                                    <i className="fa fa-list-ol me-2"></i>Next Steps
                                </h6>
                            </div>
                            <div className="card-body p-3">
                                <ol className="mb-0 ps-3">
                                    {item.instructions.map((instruction, i) => (
                                        <li key={i} className="mb-2">{instruction}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DsaSuccess;
