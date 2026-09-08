import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApiService from '../../core/services/ApiService';

const DsaApply = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { category, item } = location.state || {};

    const [loading, setLoading] = useState(false);

    // Use refs for uncontrolled inputs (faster typing)
    const nameRef = useRef(null);
    const mobileRef = useRef(null);
    const emailRef = useRef(null);

    const apiService = ApiService();

    if (!item) {
        navigate('/dsa/services');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const name = nameRef.current?.value?.trim() || '';
        const mobile = mobileRef.current?.value?.trim() || '';
        const email = emailRef.current?.value?.trim() || '';

        if (!name) {
            toast.error('Please enter your name');
            return;
        }
        if (!mobile || mobile.length !== 10) {
            toast.error('Please enter valid 10-digit mobile number');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                cat_id: category?.id,
                item_id: item.id,
                name,
                mobile,
                email: email || null,
            };

            const response = await apiService.vPost('/api/dsa/utm/utm', payload);

            if (response.data?.status === 1) {
                toast.success('Application submitted successfully!');

                // If link_type is 'path' and has other_url, navigate to success page
                if (item.link_type === 'path' && item.other_url) {
                    navigate('/dsa/success', {
                        state: {
                            category,
                            item,
                            lead: response.data.data,
                            otherUrl: item.other_url
                        }
                    });
                } else {
                    navigate('/dsa/list', { state: { category, item } });
                }
            } else {
                toast.error(response.data?.message || 'Failed to submit application');
            }
        } catch (error) {
            console.error('Apply error:', error);
            toast.error('Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-4">
            {/* Header */}
            <div className="d-flex align-items-center gap-3 mb-4">
                <button className="btn btn-light btn-sm" onClick={() => navigate(-1)}>
                    <i className="fa fa-arrow-left"></i>
                </button>
                <div className="d-flex align-items-center gap-3">
                    <div
                        className="d-flex align-items-center justify-content-center rounded-3 bg-light"
                        style={{ width: '48px', height: '48px' }}
                    >
                        {item.icon ? (
                            <img src={item.icon} alt={item.title} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                        ) : (
                            <i className="fa fa-credit-card text-primary"></i>
                        )}
                    </div>
                    <div>
                        <h5 className="fw-bold mb-0">Apply for {item.title}</h5>
                        <small className="text-muted">{category?.name}</small>
                    </div>
                </div>
            </div>

            {/* Application Form */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-bottom py-3">
                    <h6 className="fw-bold mb-0 text-primary">
                        <i className="fa fa-user-edit me-2"></i>Application Form
                    </h6>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="form-label fw-medium">
                                    Full Name <span className="text-danger">*</span>
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0">
                                        <i className="fa fa-user text-secondary"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0 ps-0"
                                        ref={nameRef}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-medium">
                                    Mobile Number <span className="text-danger">*</span>
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0">
                                        <i className="fa fa-phone text-secondary"></i>
                                    </span>
                                    <input
                                        type="tel"
                                        className="form-control border-start-0 ps-0"
                                        ref={mobileRef}
                                        placeholder="10-digit mobile number"
                                        pattern="[0-9]{10}"
                                        maxLength="10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-medium">
                                    Email Address <span className="text-muted">(Optional)</span>
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0">
                                        <i className="fa fa-envelope text-secondary"></i>
                                    </span>
                                    <input
                                        type="email"
                                        className="form-control border-start-0 ps-0"
                                        ref={emailRef}
                                        placeholder="example@email.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="d-flex gap-3 mt-4 pt-2">
                            <button
                                type="button"
                                className="btn btn-light px-4"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary px-4 flex-grow-1"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa fa-paper-plane me-2"></i>
                                        Submit Application
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Item Details */}
            {(item.target_audience?.length > 0 || item.terms_conditions?.length > 0 || item.instructions?.length > 0) && (
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-bottom py-3">
                        <h6 className="fw-bold mb-0 text-primary">
                            <i className="fa fa-info-circle me-2"></i>Important Information
                        </h6>
                    </div>
                    <div className="card-body p-3">
                        <div className="row g-3">
                            {item.target_audience?.length > 0 && (
                                <div className="col-md-4">
                                    <h6 className="text-primary fw-bold small mb-2">
                                        <i className="fa fa-users me-2"></i>Target Audience
                                    </h6>
                                    <ul className="list-unstyled mb-0 small">
                                        {item.target_audience.map((t, i) => (
                                            <li key={i} className="mb-1">
                                                <i className="fa fa-check-circle text-success me-2"></i>{t}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {item.terms_conditions?.length > 0 && (
                                <div className="col-md-4">
                                    <h6 className="text-warning fw-bold small mb-2">
                                        <i className="fa fa-file-alt me-2"></i>Terms & Conditions
                                    </h6>
                                    <ol className="mb-0 ps-3 small">
                                        {item.terms_conditions.map((t, i) => (
                                            <li key={i} className="mb-1">{t}</li>
                                        ))}
                                    </ol>
                                </div>
                            )}

                            {item.instructions?.length > 0 && (
                                <div className="col-md-4">
                                    <h6 className="text-info fw-bold small mb-2">
                                        <i className="fa fa-list-ol me-2"></i>Instructions
                                    </h6>
                                    <ol className="mb-0 ps-3 small">
                                        {item.instructions.map((t, i) => (
                                            <li key={i} className="mb-1">{t}</li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DsaApply;
