import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import KycService from '../../core/services/KycService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pageheader from '../../layouts/Pageheader';

const KycForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [kycData, setKycData] = useState(null);
    const [userRole, setUserRole] = useState(1);
    const [isCorporate, setIsCorporate] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    // Aadhaar verification state
    const [aadhaarForm, setAadhaarForm] = useState({
        aadhar_number: '',
        otp: '',
        txnid: ''
    });
    const [otpSent, setOtpSent] = useState(false);
    
    // PAN verification state
    const [panForm, setPanForm] = useState({
        pan_number: ''
    });
    
    // Bank account verification state
    const [bankForm, setBankForm] = useState({
        account_number: '',
        ifsc_code: ''
    });
    
    // Corporate KYC state
    const [corporateForm, setCorporateForm] = useState({
        authorized_signatory: [{
            name: '',
            mobile: '',
            email: '',
            address: '',
            addressProof: 'Aadhar',
            aadhaarNumber: '',
            panNumber: ''
        }],
        bank_details: {
            bankName: '',
            accountNumber: '',
            ifsc: '',
            branch: '',
            cancelledCheque: '',
            accountHolderName: ''
        },
        business_details: {
            type: '',
            entity: '',
            category: '',
            gstin: '',
            name: '',
            description: '',
            websiteRegistrationDate: '',
            domainOrigin: '',
            websiteURL: '',
            streetNo: '',
            pinCode: '',
            city: '',
            state: '',
            bussinessAddress: '',
            area: ''
        }
    });

    const apiService = ApiService();

    useEffect(() => {
        fetchKycStatus();
    }, []);

    const fetchKycStatus = async () => {
        try {
            setLoading(true);
            const response = await apiService.vGet('/api/kyc/status');
            if (response.data.status === 1) {
                setKycData(response.data.kyc);
                setUserRole(response.data.user_role);
                setIsCorporate(response.data.is_corporate);
                
                // Determine current step based on verification status
                if (!response.data.kyc.aadhar_verified) {
                    setCurrentStep(1);
                } else if (!response.data.kyc.pan_verified) {
                    setCurrentStep(2);
                } else if (!response.data.kyc.account_verified) {
                    setCurrentStep(3);
                } else if (response.data.is_corporate && !response.data.kyc.kyc_completed) {
                    setCurrentStep(4);
                } else {
                    setCurrentStep(5); // Completed
                }
            }
        } catch (error) {
            toast.error('Failed to fetch KYC status');
        } finally {
            setLoading(false);
        }
    };

    const handleKycCompletion = () => {
        // Clear KYC cache
        KycService.clearCache();
        
        // Show success message
        toast.success('KYC verification completed successfully!');
        
        // Navigate back to the original page or dashboard
        const returnPath = location.state?.from || '/dashboard';
        
        setTimeout(() => {
            navigate(returnPath, { replace: true });
        }, 2000);
    };

    const handleAadhaarChange = (e) => {
        const { name, value } = e.target;
        setAadhaarForm(prev => ({ ...prev, [name]: value }));
    };

    const sendAadhaarOtp = async () => {
        if (!aadhaarForm.aadhar_number || aadhaarForm.aadhar_number.length !== 12) {
            toast.error('Please enter a valid 12-digit Aadhaar number');
            return;
        }

        try {
            setLoading(true);
            const response = await apiService.vPost('/api/kyc/aadhaar/send-otp', {
                aadhar_number: aadhaarForm.aadhar_number
            });
            
            if (response.data.status === 1) {
                setOtpSent(true);
                setAadhaarForm(prev => ({ ...prev, txnid: response.data.txnid }));
                toast.success('OTP sent successfully');
            } else {
                toast.error(response.data.message || 'Failed to send OTP');
            }
        } catch (error) {
            toast.error('Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const verifyAadhaarOtp = async () => {
        if (!aadhaarForm.otp || aadhaarForm.otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        try {
            setLoading(true);
            const response = await apiService.vPost('/api/kyc/aadhaar/verify-otp', {
                otp: aadhaarForm.otp,
                txnid: aadhaarForm.txnid,
                aadhar_number: aadhaarForm.aadhar_number
            });
            
            if (response.data.status === 1) {
                setKycData(response.data.kyc);
                setCurrentStep(2);
                toast.success('Aadhaar verified successfully');
            } else {
                toast.error(response.data.message || 'OTP verification failed');
            }
        } catch (error) {
            toast.error('OTP verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePanChange = (e) => {
        const { name, value } = e.target;
        setPanForm(prev => ({ ...prev, [name]: value.toUpperCase() }));
    };

    const verifyPan = async () => {
        if (!panForm.pan_number || panForm.pan_number.length !== 10) {
            toast.error('Please enter a valid PAN number');
            return;
        }

        try {
            setLoading(true);
            const response = await apiService.vPost('/api/kyc/pan/verify', panForm);
            
            if (response.data.status === 1) {
                setKycData(prev => ({ ...prev, pan_verified: true, pan_number: panForm.pan_number }));
                setCurrentStep(3);
                toast.success('PAN verified successfully');
            } else {
                toast.error(response.data.message || 'PAN verification failed');
            }
        } catch (error) {
            toast.error('PAN verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleBankChange = (e) => {
        const { name, value } = e.target;
        setBankForm(prev => ({ ...prev, [name]: value }));
    };

    const verifyBankAccount = async () => {
        if (!bankForm.account_number || !bankForm.ifsc_code) {
            toast.error('Please enter account number and IFSC code');
            return;
        }

        try {
            setLoading(true);
            const response = await apiService.vPost('/api/kyc/bank/verify', bankForm);
            
            if (response.data.status === 1) {
                setKycData(prev => ({ 
                    ...prev, 
                    account_verified: true, 
                    account_number: bankForm.account_number,
                    ifsc_code: bankForm.ifsc_code
                }));
                
                if (isCorporate) {
                    setCurrentStep(4);
                } else {
                    setCurrentStep(5);
                }
                toast.success('Bank account verified successfully');
            } else {
                toast.error(response.data.message || 'Bank account verification failed');
            }
        } catch (error) {
            toast.error('Bank account verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCorporateChange = (section, field, value, index = null) => {
        setCorporateForm(prev => {
            const newForm = { ...prev };
            if (index !== null) {
                newForm[section][index][field] = value;
            } else {
                newForm[section][field] = value;
            }
            return newForm;
        });
    };

    const addAuthorizedSignatory = () => {
        setCorporateForm(prev => ({
            ...prev,
            authorized_signatory: [
                ...prev.authorized_signatory,
                {
                    name: '',
                    mobile: '',
                    email: '',
                    address: '',
                    addressProof: 'Aadhar',
                    aadhaarNumber: '',
                    panNumber: ''
                }
            ]
        }));
    };

    const removeAuthorizedSignatory = (index) => {
        setCorporateForm(prev => ({
            ...prev,
            authorized_signatory: prev.authorized_signatory.filter((_, i) => i !== index)
        }));
    };

    const submitCorporateKyc = async () => {
        try {
            setLoading(true);
            const response = await apiService.vPost('/api/kyc/corporate', corporateForm);
            
            if (response.data.status === 1) {
                setKycData(response.data.kyc);
                setCurrentStep(5);
                toast.success('Corporate KYC submitted successfully');
            } else {
                toast.error(response.data.message || 'Corporate KYC submission failed');
            }
        } catch (error) {
            toast.error('Corporate KYC submission failed');
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => {
        const steps = [
            { step: 1, title: 'Aadhaar Verification', completed: kycData?.aadhar_verified },
            { step: 2, title: 'PAN Verification', completed: kycData?.pan_verified },
            { step: 3, title: 'Bank Account Verification', completed: kycData?.account_verified },
        ];

        if (isCorporate) {
            steps.push({ step: 4, title: 'Corporate Details', completed: kycData?.kyc_completed });
        }

        return (
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="step-indicator d-flex justify-content-between mb-4">
                                {steps.map((item, index) => (
                                    <div key={item.step} className={`step ${currentStep >= item.step ? 'active' : ''} ${item.completed ? 'completed' : ''}`}>
                                        <div className="step-number">
                                            {item.completed ? '✓' : item.step}
                                        </div>
                                        <div className="step-title">{item.title}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderAadhaarVerification = () => (
        <div className="row">
            <div className="col-md-6">
                <div className="card">
                    <div className="card-header">
                        <h5 className="card-title">Aadhaar Verification</h5>
                    </div>
                    <div className="card-body">
                        <div className="form-group mb-3">
                            <label className="form-label">Aadhaar Number</label>
                            <input
                                type="text"
                                className="form-control"
                                name="aadhar_number"
                                value={aadhaarForm.aadhar_number}
                                onChange={handleAadhaarChange}
                                placeholder="Enter 12-digit Aadhaar number"
                                maxLength="12"
                                disabled={otpSent}
                            />
                        </div>
                        
                        {!otpSent ? (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={sendAadhaarOtp}
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        ) : (
                            <>
                                <div className="form-group mb-3">
                                    <label className="form-label">Enter OTP</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="otp"
                                        value={aadhaarForm.otp}
                                        onChange={handleAadhaarChange}
                                        placeholder="Enter 6-digit OTP"
                                        maxLength="6"
                                    />
                                </div>
                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        onClick={verifyAadhaarOtp}
                                        disabled={loading}
                                    >
                                        {loading ? 'Verifying...' : 'Verify OTP'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setOtpSent(false)}
                                    >
                                        Resend OTP
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPanVerification = () => (
        <div className="row">
            <div className="col-md-6">
                <div className="card">
                    <div className="card-header">
                        <h5 className="card-title">PAN Verification</h5>
                    </div>
                    <div className="card-body">
                        <div className="form-group mb-3">
                            <label className="form-label">PAN Number</label>
                            <input
                                type="text"
                                className="form-control"
                                name="pan_number"
                                value={panForm.pan_number}
                                onChange={handlePanChange}
                                placeholder="Enter PAN number"
                                maxLength="10"
                                style={{ textTransform: 'uppercase' }}
                            />
                        </div>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={verifyPan}
                            disabled={loading}
                        >
                            {loading ? 'Verifying...' : 'Verify PAN'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderBankVerification = () => (
        <div className="row">
            <div className="col-md-6">
                <div className="card">
                    <div className="card-header">
                        <h5 className="card-title">Bank Account Verification</h5>
                    </div>
                    <div className="card-body">
                        <div className="form-group mb-3">
                            <label className="form-label">Account Number</label>
                            <input
                                type="text"
                                className="form-control"
                                name="account_number"
                                value={bankForm.account_number}
                                onChange={handleBankChange}
                                placeholder="Enter account number"
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label">IFSC Code</label>
                            <input
                                type="text"
                                className="form-control"
                                name="ifsc_code"
                                value={bankForm.ifsc_code}
                                onChange={handleBankChange}
                                placeholder="Enter IFSC code"
                                maxLength="11"
                                style={{ textTransform: 'uppercase' }}
                            />
                        </div>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={verifyBankAccount}
                            disabled={loading}
                        >
                            {loading ? 'Verifying...' : 'Verify Account'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCorporateKyc = () => (
        <div className="row">
            <div className="col-12">
                <div className="card">
                    <div className="card-header">
                        <h5 className="card-title">Corporate KYC Details</h5>
                    </div>
                    <div className="card-body">
                        {/* Authorized Signatory */}
                        <h6 className="mb-3">Authorized Signatory</h6>
                        {corporateForm.authorized_signatory.map((signatory, index) => (
                            <div key={index} className="border p-3 mb-3">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={signatory.name}
                                                onChange={(e) => handleCorporateChange('authorized_signatory', 'name', e.target.value, index)}
                                                placeholder="Enter name"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Mobile</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={signatory.mobile}
                                                onChange={(e) => handleCorporateChange('authorized_signatory', 'mobile', e.target.value, index)}
                                                placeholder="Enter mobile number"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={signatory.email}
                                                onChange={(e) => handleCorporateChange('authorized_signatory', 'email', e.target.value, index)}
                                                placeholder="Enter email"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Aadhaar Number</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={signatory.aadhaarNumber}
                                                onChange={(e) => handleCorporateChange('authorized_signatory', 'aadhaarNumber', e.target.value, index)}
                                                placeholder="Enter Aadhaar number"
                                                maxLength="12"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        {corporateForm.authorized_signatory.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm"
                                                onClick={() => removeAuthorizedSignatory(index)}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="btn btn-secondary mb-4"
                            onClick={addAuthorizedSignatory}
                        >
                            Add Signatory
                        </button>

                        {/* Bank Details */}
                        <h6 className="mb-3">Bank Details</h6>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label">Bank Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={corporateForm.bank_details.bankName}
                                        onChange={(e) => handleCorporateChange('bank_details', 'bankName', e.target.value)}
                                        placeholder="Enter bank name"
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label">Account Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={corporateForm.bank_details.accountNumber}
                                        onChange={(e) => handleCorporateChange('bank_details', 'accountNumber', e.target.value)}
                                        placeholder="Enter account number"
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label">IFSC Code</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={corporateForm.bank_details.ifsc}
                                        onChange={(e) => handleCorporateChange('bank_details', 'ifsc', e.target.value)}
                                        placeholder="Enter IFSC code"
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label">Branch</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={corporateForm.bank_details.branch}
                                        onChange={(e) => handleCorporateChange('bank_details', 'branch', e.target.value)}
                                        placeholder="Enter branch name"
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label">Account Holder Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={corporateForm.bank_details.accountHolderName}
                                        onChange={(e) => handleCorporateChange('bank_details', 'accountHolderName', e.target.value)}
                                        placeholder="Enter account holder name"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Business Details */}
                        <h6 className="mb-3">Business Details</h6>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label">Business Type</label>
                                    <select
                                        className="form-control"
                                        value={corporateForm.business_details.type}
                                        onChange={(e) => handleCorporateChange('business_details', 'type', e.target.value)}
                                    >
                                        <option value="">Select business type</option>
                                        <option value="Proprietorship Firm">Proprietorship Firm</option>
                                        <option value="Partnership Firm">Partnership Firm</option>
                                        <option value="Private Limited">Private Limited</option>
                                        <option value="Public Limited">Public Limited</option>
                                        <option value="LLP">LLP</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label">Business Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={corporateForm.business_details.name}
                                        onChange={(e) => handleCorporateChange('business_details', 'name', e.target.value)}
                                        placeholder="Enter business name"
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label">GSTIN</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={corporateForm.business_details.gstin}
                                        onChange={(e) => handleCorporateChange('business_details', 'gstin', e.target.value)}
                                        placeholder="Enter GSTIN"
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label">Category</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={corporateForm.business_details.category}
                                        onChange={(e) => handleCorporateChange('business_details', 'category', e.target.value)}
                                        placeholder="Enter business category"
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label">City</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={corporateForm.business_details.city}
                                        onChange={(e) => handleCorporateChange('business_details', 'city', e.target.value)}
                                        placeholder="Enter city"
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label">State</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={corporateForm.business_details.state}
                                        onChange={(e) => handleCorporateChange('business_details', 'state', e.target.value)}
                                        placeholder="Enter state"
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label className="form-label">PIN Code</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={corporateForm.business_details.pinCode}
                                        onChange={(e) => handleCorporateChange('business_details', 'pinCode', e.target.value)}
                                        placeholder="Enter PIN code"
                                    />
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="form-group mb-3">
                                    <label className="form-label">Business Address</label>
                                    <textarea
                                        className="form-control"
                                        value={corporateForm.business_details.bussinessAddress}
                                        onChange={(e) => handleCorporateChange('business_details', 'bussinessAddress', e.target.value)}
                                        placeholder="Enter complete business address"
                                        rows="3"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={submitCorporateKyc}
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Submit Corporate KYC'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderKycCompleted = () => (
        <div className="row">
            <div className="col-12">
                <div className="card">
                    <div className="card-body text-center">
                        <div className="mb-4">
                            <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h4 className="text-success">KYC Verification Completed!</h4>
                        <p className="text-muted">
                            Your {isCorporate ? 'corporate ' : ''}KYC verification has been completed successfully.
                        </p>
                        {kycData?.verified_at && (
                            <p className="text-muted">
                                Verified on: {new Date(kycData.verified_at).toLocaleDateString()}
                            </p>
                        )}
                        <div className="mt-4">
                            <button 
                                type="button" 
                                className="btn btn-primary"
                                onClick={handleKycCompletion}
                            >
                                Continue to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return renderAadhaarVerification();
            case 2:
                return renderPanVerification();
            case 3:
                return renderBankVerification();
            case 4:
                return renderCorporateKyc();
            case 5:
                return renderKycCompleted();
            default:
                return renderAadhaarVerification();
        }
    };

    if (loading && !kycData) {
        return (
            <div className="app-content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-body text-center">
                                    <div className="spinner-border" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                    <p className="mt-2">Loading KYC data...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Pageheader currentpage="KYC Verification" activepage="User" mainpage="KYC" />
            <div className="app-content">
                <div className="container-fluid">
                    {renderStepIndicator()}
                    {renderCurrentStep()}
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
            
            <style jsx>{`
                .step-indicator {
                    padding: 20px 0;
                }
                .step {
                    text-align: center;
                    flex: 1;
                }
                .step-number {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background-color: #e9ecef;
                    color: #6c757d;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 10px;
                    font-weight: bold;
                }
                .step.active .step-number {
                    background-color: #007bff;
                    color: white;
                }
                .step.completed .step-number {
                    background-color: #28a745;
                    color: white;
                }
                .step-title {
                    font-size: 12px;
                    color: #6c757d;
                }
                .step.active .step-title {
                    color: #007bff;
                    font-weight: bold;
                }
                .step.completed .step-title {
                    color: #28a745;
                }
            `}</style>
        </>
    );
};

export default KycForm;
