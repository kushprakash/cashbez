import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Pageheader from '../layouts/Pageheader';
import ApiService from '../core/services/ApiService';
import { AuthContext } from '../core/hooks/context';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateCreditCardLead = () => {
    const { userData: user } = useContext(AuthContext) || {};
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [formData, setFormData] = useState({
        user_id: user?.id || '',
        full_name: '',
        mobile: '',
        email: '',
        dob: '',
        pan: '',
        monthly_income: '',
        desired_card: 'Cashback',
        lead_source: 'Website',
        preferred_contact_time: 'anytime',
        consent: false,
        notes: ''
    });

    const [errors, setErrors] = useState({});

    const cardTypes = [
        { value: 'Cashback', label: 'Cashback Card' },
        { value: 'Rewards', label: 'Rewards Card' },
        { value: 'Travel', label: 'Travel Card' },
        { value: 'Fuel', label: 'Fuel Card' },
        { value: 'Shopping', label: 'Shopping Card' },
        { value: 'Premium', label: 'Premium Card' },
        { value: 'Basic', label: 'Basic Card' }
    ];

    const leadSources = [
        { value: 'Website', label: 'Website' },
        { value: 'Mobile App', label: 'Mobile App' },
        { value: 'Referral', label: 'Referral' },
        { value: 'Partner', label: 'Partner' },
        { value: 'Direct', label: 'Direct' }
    ];

    const contactTimes = [
        { value: 'morning', label: 'Morning (9 AM - 12 PM)' },
        { value: 'afternoon', label: 'Afternoon (12 PM - 4 PM)' },
        { value: 'evening', label: 'Evening (4 PM - 8 PM)' },
        { value: 'anytime', label: 'Anytime' }
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validatePAN = (pan) => {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return panRegex.test(pan.toUpperCase());
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.full_name.trim()) {
            newErrors.full_name = 'Full name is required';
        }

        if (!formData.mobile.trim()) {
            newErrors.mobile = 'Mobile number is required';
        } else if (!/^[+]?[0-9]{10,15}$/.test(formData.mobile)) {
            newErrors.mobile = 'Invalid mobile number format';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.dob) {
            newErrors.dob = 'Date of birth is required';
        }

        if (!formData.pan.trim()) {
            newErrors.pan = 'PAN number is required';
        } else if (!validatePAN(formData.pan)) {
            newErrors.pan = 'Invalid PAN format (e.g., ABCDE1234F)';
        }

        if (!formData.monthly_income || formData.monthly_income <= 0) {
            newErrors.monthly_income = 'Monthly income is required';
        }

        if (!formData.consent) {
            newErrors.consent = 'You must provide consent to proceed';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fill all required fields correctly');
            return;
        }

        try {
            setLoading(true);
            const apiService = ApiService();
            const response = await apiService.vPost('/api/credit-card-leads', {
                ...formData,
                pan: formData.pan.toUpperCase()
            });

            if (response.data.status === 1) {
                setSuccessData(response.data);
                setSuccess(true);
                // Optionally show toast as well
                toast.success('Credit card lead created successfully');
            } else {
                toast.error(response.data.message || 'Failed to create lead');
            }
        } catch (err) {
            console.error(err);
            if (err?.response?.data?.error) {
                Object.values(err.response.data.error).flat().forEach(msg => toast.error(msg));
            } else {
                toast.error(err?.response?.data?.message || 'An error occurred while creating the lead');
            }
        } finally {
            setLoading(false);
        }
    };

    // Success Page Component
    const SuccessPage = () => (
        <div className="container-fluid mt-4">
            
            <div className="row justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
                <div className="col-md-8 col-lg-6">
                    <div className="text-center">
                        {/* Animated Check Circle */}
                        <div className="success-animation mb-4">
                            <div className="success-circle">
                                <div className="success-tick">
                                    <svg width="60" height="60" viewBox="0 0 60 60" className="checkmark">
                                        <circle 
                                            cx="30" 
                                            cy="30" 
                                            r="25" 
                                            fill="none" 
                                            stroke="#28a745" 
                                            strokeWidth="3"
                                            className="checkmark-circle"
                                        />
                                        <path 
                                            fill="none" 
                                            stroke="#28a745" 
                                            strokeWidth="3" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            d="M18 30l8 8 16-16"
                                            className="checkmark-check"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Success Message */}
                        <h2 className="text-success mb-3 ">
                            <i className="ti ti-check-circle me-2"></i>
                            Application Submitted Successfully!
                        </h2>
                        <p className="text-muted mb-4">
                            Your credit card application has been submitted successfully. Our team will review your application and contact you soon.
                        </p>


                        {/* Next Steps */}
                        <div className="alert alert-info">
                            <h6 className="mb-2">
                                <i className="ti ti-info-circle me-2"></i>
                                What's Next?
                            </h6>
                            <ul className="list-unstyled mb-0 text-start">
                                <li>• Our team will review your application within 24-48 hours</li>
                                <li>• You'll receive a call or email for verification</li>
                                <li>• Additional documents may be requested if needed</li>
                                <li>• Final approval decision will be communicated via email/SMS</li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex gap-3 justify-content-center">
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/credit-card/list')}
                            >
                                <i className="ti ti-list me-2"></i>
                                View All Applications
                            </button>
                            <button
                                className="btn btn-outline-primary"
                                onClick={() => {
                                    setSuccess(false);
                                    setSuccessData(null);
                                    setFormData({
                                        user_id: user?.id || '',
                                        full_name: '',
                                        mobile: '',
                                        email: '',
                                        dob: '',
                                        pan: '',
                                        monthly_income: '',
                                        desired_card: 'Cashback',
                                        lead_source: 'Website',
                                        preferred_contact_time: 'anytime',
                                        consent: false,
                                        notes: ''
                                    });
                                }}
                            >
                                <i className="ti ti-plus me-2"></i>
                                Submit Another Application
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS for Animation */}
            <style jsx>{`
                .success-animation {
                    position: relative;
                    display: inline-block;
                }

                .success-circle {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: linear-gradient(45deg, #e8f5e8, #d4edda);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto;
                    animation: scaleIn 0.5s ease-out;
                    box-shadow: 0 8px 25px rgba(40, 167, 69, 0.2);
                }

                .checkmark {
                    animation: checkmarkAnimation 0.8s ease-in-out 0.3s both;
                }

                .checkmark-circle {
                    stroke-dasharray: 157;
                    stroke-dashoffset: 157;
                    animation: circleAnimation 0.6s ease-in-out forwards;
                }

                .checkmark-check {
                    stroke-dasharray: 48;
                    stroke-dashoffset: 48;
                    animation: checkAnimation 0.3s ease-in-out 0.6s forwards;
                }

                @keyframes scaleIn {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.1);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                @keyframes circleAnimation {
                    0% {
                        stroke-dashoffset: 157;
                    }
                    100% {
                        stroke-dashoffset: 0;
                    }
                }

                @keyframes checkAnimation {
                    0% {
                        stroke-dashoffset: 48;
                    }
                    100% {
                        stroke-dashoffset: 0;
                    }
                }

                @keyframes checkmarkAnimation {
                    0% {
                        transform: scale(0);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                    100% {
                        transform: scale(1);
                    }
                }

                .card {
                    animation: slideUp 0.6s ease-out 0.5s both;
                }

                @keyframes slideUp {
                    0% {
                        transform: translateY(30px);
                        opacity: 0;
                    }
                    100% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );

    // If success, show success page
    if (success) {
        return (
            <>
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
                <SuccessPage />
            </>
        );
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
         

            <div className="container-fluid mt-2">

               <div className="row ">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body py-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">Quick Actions</h5>
                                    <div className="d-flex gap-2">
                                      
                                        <Link to="/credit-card" className="btn btn-outline-primary btn-sm">
                                            <i className="ti ti-plus me-1"></i> Credit Card Dashboard
                                        </Link>

                                         <Link to="/credit-card/list" className="btn btn-outline-primary btn-sm">
                                            <i className="ti ti-list me-1"></i> View All Applications
                                        </Link>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row justify-content-center">
                    <div className="col-xl-10">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">Credit Card Application Form</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    {/* Personal Information */}
                                    <div className="mb-2">
                                        <h6 className="text-primary mb-3">Personal Information</h6>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Full Name <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
                                                    name="full_name"
                                                    value={formData.full_name}
                                                    onChange={handleChange}
                                                    placeholder="Enter full name"
                                                />
                                                {errors.full_name && <div className="invalid-feedback">{errors.full_name}</div>}
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label">Mobile Number <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.mobile ? 'is-invalid' : ''}`}
                                                    name="mobile"
                                                    value={formData.mobile}
                                                    onChange={handleChange}
                                                    placeholder="+919876543210"
                                                />
                                                {errors.mobile && <div className="invalid-feedback">{errors.mobile}</div>}
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label">Email Address <span className="text-danger">*</span></label>
                                                <input
                                                    type="email"
                                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="your@email.com"
                                                />
                                                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label">Date of Birth <span className="text-danger">*</span></label>
                                                <input
                                                    type="date"
                                                    className={`form-control ${errors.dob ? 'is-invalid' : ''}`}
                                                    name="dob"
                                                    value={formData.dob}
                                                    onChange={handleChange}
                                                    max={new Date().toISOString().split('T')[0]}
                                                />
                                                {errors.dob && <div className="invalid-feedback">{errors.dob}</div>}
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label">PAN Number <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className={`form-control text-uppercase ${errors.pan ? 'is-invalid' : ''}`}
                                                    name="pan"
                                                    value={formData.pan}
                                                    onChange={handleChange}
                                                    placeholder="ABCDE1234F"
                                                    maxLength="10"
                                                />
                                                {errors.pan && <div className="invalid-feedback">{errors.pan}</div>}
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label">Monthly Income (₹) <span className="text-danger">*</span></label>
                                                <input
                                                    type="number"
                                                    className={`form-control ${errors.monthly_income ? 'is-invalid' : ''}`}
                                                    name="monthly_income"
                                                    value={formData.monthly_income}
                                                    onChange={handleChange}
                                                    placeholder="50000"
                                                    min="0"
                                                />
                                                {errors.monthly_income && <div className="invalid-feedback">{errors.monthly_income}</div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Preferences */}
                                    <div className="mb-4">
                                      
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Desired Card Type <span className="text-danger">*</span></label>
                                                <select
                                                    className="form-select"
                                                    name="desired_card"
                                                    value={formData.desired_card}
                                                    onChange={handleChange}
                                                >
                                                    {cardTypes.map(type => (
                                                        <option key={type.value} value={type.value}>{type.label}</option>
                                                    ))}
                                                </select>
                                            </div>


                                            <div className="col-md-6">
                                                <label className="form-label">Preferred Contact Time</label>
                                                <select
                                                    className="form-select"
                                                    name="preferred_contact_time"
                                                    value={formData.preferred_contact_time}
                                                    onChange={handleChange}
                                                >
                                                    {contactTimes.map(time => (
                                                        <option key={time.value} value={time.value}>{time.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                       
                                        </div>
                                    </div>

                                    {/* Consent */}
                                    <div className="mb-4">
                                        <div className="form-check">
                                            <input
                                                className={`form-check-input ${errors.consent ? 'is-invalid' : ''}`}
                                                type="checkbox"
                                                name="consent"
                                                id="consent"
                                                checked={formData.consent}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor="consent">
                                                I consent to the processing of my personal data for credit card application purposes and agree to the terms and conditions. <span className="text-danger">*</span>
                                            </label>
                                            {errors.consent && <div className="invalid-feedback d-block">{errors.consent}</div>}
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="d-flex gap-2 justify-content-end">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => navigate('/credit-card')}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="ti ti-check me-1"></i> Submit Application
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateCreditCardLead;
