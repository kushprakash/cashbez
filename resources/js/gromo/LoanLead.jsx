import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ApiService from '../core/services/ApiService';
import { AuthContext } from '../core/hooks/context';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateLoanLead = () => {
    const { userData: user } = useContext(AuthContext) || {};
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [loanType, setLoanType] = useState('personal');
    const [formData, setFormData] = useState({
        user_id: user?.id || '',
        loan_type: 'personal',
        full_name: '',
        mobile: '',
        email: '',
        dob: '',
        pan: '',
        // Personal Loan Fields
        employment_type: 'salaried',
        monthly_income: '',
        company_name: '',
        job_title: '',
        work_experience: '',
        // Business Loan Fields
        business_name: '',
        business_type: 'proprietorship',
        business_category: '',
        business_registration_number: '',
        gst_number: '',
        business_vintage: '',
        annual_turnover: '',
        monthly_profit: '',
        business_address: '',
        business_city: '',
        business_state: '',
        business_pincode: '',
        // Common Loan Fields
        loan_amount: '',
        loan_purpose: '',
        loan_tenure: '',
        existing_loans: false,
        existing_loan_amount: '',
        credit_score: '',
        // Personal/Residential Address
        address: '',
        city: '',
        state: '',
        pincode: '',
        // Additional Fields
        bank_statements_months: 12,
        collateral_available: false,
        collateral_type: '',
        collateral_value: '',
        lead_source: 'Website',
        preferred_contact_time: 'anytime',
        consent: false,
        notes: ''
    });

    const [errors, setErrors] = useState({});

    // Employment Types for Personal Loans
    const employmentTypes = [
        { value: 'salaried', label: 'Salaried Employee' },
        { value: 'self_employed', label: 'Self Employed' },
        { value: 'business', label: 'Business Owner' },
        { value: 'unemployed', label: 'Unemployed' }
    ];

    // Business Types for Business Loans
    const businessTypes = [
        { value: 'proprietorship', label: 'Sole Proprietorship' },
        { value: 'partnership', label: 'Partnership' },
        { value: 'private_limited', label: 'Private Limited Company' },
        { value: 'public_limited', label: 'Public Limited Company' },
        { value: 'llp', label: 'Limited Liability Partnership (LLP)' },
        { value: 'other', label: 'Other' }
    ];

    // Personal Loan Purposes
    const personalLoanPurposes = [
        { value: 'debt_consolidation', label: 'Debt Consolidation' },
        { value: 'home_improvement', label: 'Home Improvement' },
        { value: 'medical', label: 'Medical Expenses' },
        { value: 'education', label: 'Education' },
        { value: 'wedding', label: 'Wedding' },
        { value: 'travel', label: 'Travel' },
        { value: 'other', label: 'Other' }
    ];

    // Business Loan Purposes
    const businessLoanPurposes = [
        { value: 'working_capital', label: 'Working Capital' },
        { value: 'equipment_purchase', label: 'Equipment Purchase' },
        { value: 'business_expansion', label: 'Business Expansion' },
        { value: 'inventory', label: 'Inventory' },
        { value: 'debt_consolidation', label: 'Debt Consolidation' },
        { value: 'other', label: 'Other' }
    ];

    const contactTimes = [
        { value: 'morning', label: 'Morning (9 AM - 12 PM)' },
        { value: 'afternoon', label: 'Afternoon (12 PM - 4 PM)' },
        { value: 'evening', label: 'Evening (4 PM - 8 PM)' },
        { value: 'anytime', label: 'Anytime' }
    ];

    const handleLoanTypeChange = (type) => {
        setLoanType(type);
        setFormData(prev => ({
            ...prev,
            loan_type: type,
            loan_purpose: '' // Reset loan purpose when changing type
        }));
        setErrors({});
    };

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

    const validateGST = (gst) => {
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        return gstRegex.test(gst.toUpperCase());
    };

    const validateForm = () => {
        const newErrors = {};

        // Backend required fields - Common for all loan types
        if (!formData.full_name.trim()) {
            newErrors.full_name = 'Full name is required';
        }

        if (!formData.mobile.trim()) {
            newErrors.mobile = 'Mobile number is required';
        } else if (!/^[+]?[0-9]{10,20}$/.test(formData.mobile)) {
            newErrors.mobile = 'Mobile number must be 10-20 digits';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.dob) {
            newErrors.dob = 'Date of birth is required';
        } else {
            const today = new Date();
            const birthDate = new Date(formData.dob);
            if (birthDate >= today) {
                newErrors.dob = 'Date of birth must be before today';
            }
        }

        if (!formData.pan.trim()) {
            newErrors.pan = 'PAN number is required';
        } else if (!validatePAN(formData.pan)) {
            newErrors.pan = 'Invalid PAN format (e.g., ABCDE1234F)';
        }

        if (!formData.loan_amount || formData.loan_amount < 10000) {
            newErrors.loan_amount = 'Loan amount is required (minimum ₹10,000)';
        }

        if (!formData.loan_tenure || formData.loan_tenure < 6 || formData.loan_tenure > 360) {
            newErrors.loan_tenure = 'Loan tenure must be between 6-360 months';
        }

        if (!formData.consent) {
            newErrors.consent = 'You must provide consent to proceed';
        }

        // Personal loan specific validations (backend requirements)
        if (loanType === 'personal') {
            if (!formData.employment_type) {
                newErrors.employment_type = 'Employment type is required';
            }

            if (!formData.monthly_income || formData.monthly_income < 10000) {
                newErrors.monthly_income = 'Monthly income is required (minimum ₹10,000)';
            }

            // Job details are optional for all employment types
            // Only validate if fields are filled to ensure correct format
            if (formData.company_name && formData.company_name.length > 255) {
                newErrors.company_name = 'Company name must be less than 255 characters';
            }

            if (formData.job_title && formData.job_title.length > 255) {
                newErrors.job_title = 'Job title must be less than 255 characters';
            }

            if (formData.work_experience && formData.work_experience < 0) {
                newErrors.work_experience = 'Work experience cannot be negative';
            }
        }

        // Business loan specific validations (backend requirements)
        if (loanType === 'business') {
            if (!formData.business_name.trim()) {
                newErrors.business_name = 'Business name is required';
            }

            if (!formData.business_type) {
                newErrors.business_type = 'Business type is required';
            }

            if (!formData.business_vintage || formData.business_vintage < 6) {
                newErrors.business_vintage = 'Business vintage is required (minimum 6 months)';
            }

            if (!formData.annual_turnover || formData.annual_turnover < 100000) {
                newErrors.annual_turnover = 'Annual turnover is required (minimum ₹1,00,000)';
            }

            if (formData.gst_number && !validateGST(formData.gst_number)) {
                newErrors.gst_number = 'Invalid GST number format';
            }
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
            const submitData = {
                ...formData,
                pan: formData.pan.toUpperCase(),
                gst_number: formData.gst_number ? formData.gst_number.toUpperCase() : null
            };

            const response = await apiService.vPost('/api/loan-leads', submitData);

            if (response.data.status === 1) {
                setSuccessData(response.data);
                setSuccess(true);
                toast.success('Loan application submitted successfully');
            } else {
                toast.error(response.data.message || 'Failed to submit application');
            }
        } catch (err) {
            console.error(err);
            if (err?.response?.data?.error) {
                Object.values(err.response.data.error).flat().forEach(msg => toast.error(msg));
            } else {
                toast.error(err?.response?.data?.message || 'An error occurred while submitting the application');
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
                        <h2 className="text-success mb-3">
                            <i className="ti ti-check-circle me-2"></i>
                            Application Submitted Successfully!
                        </h2>
                        <p className="text-muted mb-4">
                            Your {loanType} loan application has been submitted successfully. Our team will review your application and contact you soon.
                        </p>

                        {/* Application Details */}
                        {successData?.data?.lead_id && (
                            <div className="alert alert-success">
                                <h6 className="mb-2">
                                    <i className="ti ti-id me-2"></i>
                                    Application ID: <strong>{successData.data.lead_id}</strong>
                                </h6>
                                <p className="mb-0">Please keep this ID for future reference</p>
                            </div>
                        )}

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
                                onClick={() => navigate('/loan-apply/list')}
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
                                        loan_type: 'personal',
                                        full_name: '',
                                        mobile: '',
                                        email: '',
                                        dob: '',
                                        pan: '',
                                        employment_type: 'salaried',
                                        monthly_income: '',
                                        company_name: '',
                                        job_title: '',
                                        work_experience: '',
                                        business_name: '',
                                        business_type: 'proprietorship',
                                        business_category: '',
                                        business_registration_number: '',
                                        gst_number: '',
                                        business_vintage: '',
                                        annual_turnover: '',
                                        monthly_profit: '',
                                        business_address: '',
                                        business_city: '',
                                        business_state: '',
                                        business_pincode: '',
                                        loan_amount: '',
                                        loan_purpose: '',
                                        loan_tenure: '',
                                        existing_loans: false,
                                        existing_loan_amount: '',
                                        credit_score: '',
                                        address: '',
                                        city: '',
                                        state: '',
                                        pincode: '',
                                        bank_statements_months: 12,
                                        collateral_available: false,
                                        collateral_type: '',
                                        collateral_value: '',
                                        lead_source: 'Website',
                                        preferred_contact_time: 'anytime',
                                        consent: false,
                                        notes: ''
                                    });
                                    setLoanType('personal');
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
                <div className="row">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body py-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">Quick Actions</h5>
                                    <div className="d-flex gap-2">
                                        <Link to="/loan-apply" className="btn btn-outline-primary btn-sm">
                                            <i className="ti ti-dashboard me-1"></i> Loan Dashboard
                                        </Link>
                                        <Link to="/loan-apply/list" className="btn btn-outline-primary btn-sm">
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
                                <h5 className="mb-0">Loan Application Form</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    {/* Loan Type Selection */}
                                    <div className="mb-4">
                                        <h6 className="text-primary mb-3">Select Loan Type</h6>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <div 
                                                    className={`card h-100 ${loanType === 'personal' ? 'border-primary bg-primary-subtle' : 'border-secondary'}`}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleLoanTypeChange('personal')}
                                                >
                                                    <div className="card-body text-center">
                                                        <i className="ti ti-user fs-1 text-primary mb-3"></i>
                                                        <h5 className="card-title">Personal Loan</h5>
                                                        <p className="card-text text-muted">For personal expenses, debt consolidation, medical needs, etc.</p>
                                                        {loanType === 'personal' && (
                                                            <i className="ti ti-check-circle text-success fs-4"></i>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div 
                                                    className={`card h-100 ${loanType === 'business' ? 'border-primary bg-primary-subtle' : 'border-secondary'}`}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleLoanTypeChange('business')}
                                                >
                                                    <div className="card-body text-center">
                                                        <i className="ti ti-building-bank fs-1 text-warning mb-3"></i>
                                                        <h5 className="card-title">Business Loan</h5>
                                                        <p className="card-text text-muted">For business expansion, working capital, equipment purchase, etc.</p>
                                                        {loanType === 'business' && (
                                                            <i className="ti ti-check-circle text-success fs-4"></i>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Personal Information */}
                                    <div className="mb-4">
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
                                                    maxLength="20"
                                                />
                                                {errors.mobile && <div className="invalid-feedback">{errors.mobile}</div>}
                                                <small className="text-muted">Enter 10-20 digit mobile number</small>
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

                                    {/* Personal Loan Specific Fields */}
                                    {loanType === 'personal' && (
                                        <div className="mb-4">
                                            <h6 className="text-primary mb-3">Employment Information</h6>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label">Employment Type <span className="text-danger">*</span></label>
                                                    <select
                                                        className={`form-select ${errors.employment_type ? 'is-invalid' : ''}`}
                                                        name="employment_type"
                                                        value={formData.employment_type}
                                                        onChange={handleChange}
                                                    >
                                                        {employmentTypes.map(type => (
                                                            <option key={type.value} value={type.value}>{type.label}</option>
                                                        ))}
                                                    </select>
                                                    {errors.employment_type && <div className="invalid-feedback">{errors.employment_type}</div>}
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
                                                        min="10000"
                                                    />
                                                    {errors.monthly_income && <div className="invalid-feedback">{errors.monthly_income}</div>}
                                                    <small className="text-muted">Minimum income: ₹10,000</small>
                                                </div>

                                                {/* Job Details Section - Optional for all employment types */}
                                                <div className="col-12">
                                                    <div className="alert alert-info py-2">
                                                        <small><i className="ti ti-info-circle me-1"></i>
                                                        The following job details are optional and can help us process your application faster.
                                                        </small>
                                                    </div>
                                                </div>

                                                {/* Job Details - Optional for all employment types */}
                                                <div className="col-md-6">
                                                    <label className="form-label">Company Name</label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors.company_name ? 'is-invalid' : ''}`}
                                                        name="company_name"
                                                        value={formData.company_name}
                                                        onChange={handleChange}
                                                        placeholder="Enter company name"
                                                        maxLength="255"
                                                    />
                                                    {errors.company_name && <div className="invalid-feedback">{errors.company_name}</div>}
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Job Title</label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors.job_title ? 'is-invalid' : ''}`}
                                                        name="job_title"
                                                        value={formData.job_title}
                                                        onChange={handleChange}
                                                        placeholder="Enter job title"
                                                        maxLength="255"
                                                    />
                                                    {errors.job_title && <div className="invalid-feedback">{errors.job_title}</div>}
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Work Experience (years)</label>
                                                    <input
                                                        type="number"
                                                        className={`form-control ${errors.work_experience ? 'is-invalid' : ''}`}
                                                        name="work_experience"
                                                        value={formData.work_experience}
                                                        onChange={handleChange}
                                                        placeholder="2"
                                                        min="0"
                                                        step="0.5"
                                                    />
                                                    {errors.work_experience && <div className="invalid-feedback">{errors.work_experience}</div>}
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Loan Purpose</label>
                                                    <select
                                                        className="form-select"
                                                        name="loan_purpose"
                                                        value={formData.loan_purpose}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="">Select purpose</option>
                                                        {personalLoanPurposes.map(purpose => (
                                                            <option key={purpose.value} value={purpose.value}>{purpose.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Business Loan Specific Fields */}
                                    {loanType === 'business' && (
                                        <div className="mb-4">
                                            <h6 className="text-primary mb-3">Business Information</h6>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label">Business Name <span className="text-danger">*</span></label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors.business_name ? 'is-invalid' : ''}`}
                                                        name="business_name"
                                                        value={formData.business_name}
                                                        onChange={handleChange}
                                                        placeholder="Enter business name"
                                                    />
                                                    {errors.business_name && <div className="invalid-feedback">{errors.business_name}</div>}
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Business Type <span className="text-danger">*</span></label>
                                                    <select
                                                        className={`form-select ${errors.business_type ? 'is-invalid' : ''}`}
                                                        name="business_type"
                                                        value={formData.business_type}
                                                        onChange={handleChange}
                                                    >
                                                        {businessTypes.map(type => (
                                                            <option key={type.value} value={type.value}>{type.label}</option>
                                                        ))}
                                                    </select>
                                                    {errors.business_type && <div className="invalid-feedback">{errors.business_type}</div>}
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Business Category</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="business_category"
                                                        value={formData.business_category}
                                                        onChange={handleChange}
                                                        placeholder="e.g., Manufacturing, Retail, Services"
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Business Registration Number</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="business_registration_number"
                                                        value={formData.business_registration_number}
                                                        onChange={handleChange}
                                                        placeholder="Enter registration number"
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">GST Number</label>
                                                    <input
                                                        type="text"
                                                        className={`form-control text-uppercase ${errors.gst_number ? 'is-invalid' : ''}`}
                                                        name="gst_number"
                                                        value={formData.gst_number}
                                                        onChange={handleChange}
                                                        placeholder="22AAAAA0000A1Z5"
                                                        maxLength="15"
                                                    />
                                                    {errors.gst_number && <div className="invalid-feedback">{errors.gst_number}</div>}
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Business Vintage (months) <span className="text-danger">*</span></label>
                                                    <input
                                                        type="number"
                                                        className={`form-control ${errors.business_vintage ? 'is-invalid' : ''}`}
                                                        name="business_vintage"
                                                        value={formData.business_vintage}
                                                        onChange={handleChange}
                                                        placeholder="36"
                                                        min="6"
                                                    />
                                                    {errors.business_vintage && <div className="invalid-feedback">{errors.business_vintage}</div>}
                                                    <small className="text-muted">Minimum: 6 months</small>
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Annual Turnover (₹) <span className="text-danger">*</span></label>
                                                    <input
                                                        type="number"
                                                        className={`form-control ${errors.annual_turnover ? 'is-invalid' : ''}`}
                                                        name="annual_turnover"
                                                        value={formData.annual_turnover}
                                                        onChange={handleChange}
                                                        placeholder="2000000"
                                                        min="100000"
                                                    />
                                                    {errors.annual_turnover && <div className="invalid-feedback">{errors.annual_turnover}</div>}
                                                    <small className="text-muted">Minimum turnover: ₹1,00,000</small>
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Monthly Profit (₹)</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="monthly_profit"
                                                        value={formData.monthly_profit}
                                                        onChange={handleChange}
                                                        placeholder="100000"
                                                        min="0"
                                                    />
                                                </div>

                                                <div className="col-md-12">
                                                    <label className="form-label">Business Address</label>
                                                    <textarea
                                                        className="form-control"
                                                        name="business_address"
                                                        value={formData.business_address}
                                                        onChange={handleChange}
                                                        placeholder="Enter business address"
                                                        rows="3"
                                                    />
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="form-label">Business City</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="business_city"
                                                        value={formData.business_city}
                                                        onChange={handleChange}
                                                        placeholder="Enter city"
                                                    />
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="form-label">Business State</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="business_state"
                                                        value={formData.business_state}
                                                        onChange={handleChange}
                                                        placeholder="Enter state"
                                                    />
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="form-label">Business Pincode</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="business_pincode"
                                                        value={formData.business_pincode}
                                                        onChange={handleChange}
                                                        placeholder="Enter pincode"
                                                        maxLength="6"
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Loan Purpose</label>
                                                    <select
                                                        className="form-select"
                                                        name="loan_purpose"
                                                        value={formData.loan_purpose}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="">Select purpose</option>
                                                        {businessLoanPurposes.map(purpose => (
                                                            <option key={purpose.value} value={purpose.value}>{purpose.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Loan Details */}
                                    <div className="mb-4">
                                        <h6 className="text-primary mb-3">Loan Details</h6>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Loan Amount (₹) <span className="text-danger">*</span></label>
                                                <input
                                                    type="number"
                                                    className={`form-control ${errors.loan_amount ? 'is-invalid' : ''}`}
                                                    name="loan_amount"
                                                    value={formData.loan_amount}
                                                    onChange={handleChange}
                                                    placeholder="500000"
                                                    min="10000"
                                                />
                                                {errors.loan_amount && <div className="invalid-feedback">{errors.loan_amount}</div>}
                                                <small className="text-muted">Minimum amount: ₹10,000</small>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label">Loan Tenure (months) <span className="text-danger">*</span></label>
                                                <input
                                                    type="number"
                                                    className={`form-control ${errors.loan_tenure ? 'is-invalid' : ''}`}
                                                    name="loan_tenure"
                                                    value={formData.loan_tenure}
                                                    onChange={handleChange}
                                                    placeholder="24"
                                                    min="6"
                                                    max="360"
                                                />
                                                {errors.loan_tenure && <div className="invalid-feedback">{errors.loan_tenure}</div>}
                                                <small className="text-muted">Range: 6-360 months</small>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        name="existing_loans"
                                                        id="existing_loans"
                                                        checked={formData.existing_loans}
                                                        onChange={handleChange}
                                                    />
                                                    <label className="form-check-label" htmlFor="existing_loans">
                                                        I have existing loans
                                                    </label>
                                                </div>
                                            </div>

                                            {formData.existing_loans && (
                                                <div className="col-md-6">
                                                    <label className="form-label">Existing Loan Amount (₹)</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="existing_loan_amount"
                                                        value={formData.existing_loan_amount}
                                                        onChange={handleChange}
                                                        placeholder="200000"
                                                        min="0"
                                                    />
                                                </div>
                                            )}

                                            <div className="col-md-6">
                                                <label className="form-label">Credit Score (if known)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="credit_score"
                                                    value={formData.credit_score}
                                                    onChange={handleChange}
                                                    placeholder="750"
                                                    min="300"
                                                    max="900"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Information */}
                                    <div className="mb-4">
                                        <h6 className="text-primary mb-3">Residential Address</h6>
                                        <div className="row g-3">
                                            <div className="col-md-12">
                                                <label className="form-label">Address</label>
                                                <textarea
                                                    className="form-control"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    placeholder="Enter residential address"
                                                    rows="3"
                                                />
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label">City</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    placeholder="Enter city"
                                                />
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label">State</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleChange}
                                                    placeholder="Enter state"
                                                />
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label">Pincode</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="pincode"
                                                    value={formData.pincode}
                                                    onChange={handleChange}
                                                    placeholder="Enter pincode"
                                                    maxLength="6"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Information */}
                                    <div className="mb-4">
                                        <h6 className="text-primary mb-3">Additional Information</h6>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        name="collateral_available"
                                                        id="collateral_available"
                                                        checked={formData.collateral_available}
                                                        onChange={handleChange}
                                                    />
                                                    <label className="form-check-label" htmlFor="collateral_available">
                                                        I have collateral available
                                                    </label>
                                                </div>
                                            </div>

                                            {formData.collateral_available && (
                                                <>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Collateral Type</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="collateral_type"
                                                            value={formData.collateral_type}
                                                            onChange={handleChange}
                                                            placeholder="e.g., Property, Gold, Bonds"
                                                        />
                                                    </div>

                                                    <div className="col-md-6">
                                                        <label className="form-label">Collateral Value (₹)</label>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            name="collateral_value"
                                                            value={formData.collateral_value}
                                                            onChange={handleChange}
                                                            placeholder="1000000"
                                                            min="0"
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            <div className="col-md-12">
                                                <label className="form-label">Additional Notes</label>
                                                <textarea
                                                    className="form-control"
                                                    name="notes"
                                                    value={formData.notes}
                                                    onChange={handleChange}
                                                    placeholder="Any additional information you'd like to share"
                                                    rows="3"
                                                />
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
                                                I consent to the processing of my personal data for loan application purposes and agree to the terms and conditions. <span className="text-danger">*</span>
                                            </label>
                                            {errors.consent && <div className="invalid-feedback d-block">{errors.consent}</div>}
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="d-flex gap-2 justify-content-end">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => navigate('/loan-apply')}
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

export default CreateLoanLead;