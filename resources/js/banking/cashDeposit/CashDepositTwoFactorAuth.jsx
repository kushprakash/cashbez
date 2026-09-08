import { useContext, useState, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../core/hooks/context';

const CashDepositTwoFactorAuth = () => {
  const navigate = useNavigate();
  const { userData: user } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpReferenceData, setOtpReferenceData] = useState(null);
  const [authMethod, setAuthMethod] = useState('sms'); // 'sms', 'email'
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    transaction_pin: '',
    confirm_pin: '',
    mobile_number: user?.mobile || '',
    email: user?.email || '',
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { id: 1, title: 'Set Transaction PIN', desc: 'Create a secure PIN for transactions' },
    { id: 2, title: 'Verify Identity', desc: 'Confirm your identity via OTP' },
    { id: 3, title: 'Activation Complete', desc: 'Two-factor authentication enabled' }
  ];

  const validatePin = (pin) => {
    return /^\d{4,6}$/.test(pin);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.transaction_pin || !validatePin(formData.transaction_pin)) {
      newErrors.transaction_pin = 'PIN must be 4-6 digits';
    }

    if (formData.transaction_pin !== formData.confirm_pin) {
      newErrors.confirm_pin = 'PINs do not match';
    }

    if (!formData.mobile_number || formData.mobile_number.length !== 10) {
      newErrors.mobile_number = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const setupTwoFactorAuth = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/setup-two-factor', {
        transaction_pin: formData.transaction_pin,
        mobile_number: formData.mobile_number,
        email: formData.email,
        outletId: user.mid
      });

      if (response.data.status === 1) {
        setCurrentStep(2);
        toast.success('Transaction PIN set successfully. Please verify your identity.');
      } else {
        toast.error(response.data.message || 'Failed to set up two-factor authentication');
      }
    } catch (error) {
      console.error('Two-factor setup error:', error);
      toast.error('Failed to set up two-factor authentication');
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationOtp = async () => {
    setLoading(true);
    try {
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/send-2fa-otp', {
        method: authMethod,
        mobile_number: formData.mobile_number,
        email: formData.email,
        outletId: user.mid
      });

      if (response.data.status === 1) {
        setOtpReferenceData(response.data.data);
        setOtpSent(true);
        toast.success(`OTP sent successfully to your ${authMethod === 'sms' ? 'mobile' : 'email'}`);
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpAndActivate = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/verify-2fa-otp', {
        otp: otp,
        reference_id: otpReferenceData?.reference_id,
        method: authMethod,
        outletId: user.mid
      });

      if (response.data.status === 1) {
        setCurrentStep(3);
        toast.success('Two-factor authentication activated successfully!');
        
        setTimeout(() => {
          navigate('/banking/cash-deposit');
        }, 2000);
      } else {
        toast.error(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    try {
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/resend-2fa-otp', {
        reference_id: otpReferenceData?.reference_id,
        method: authMethod,
        outletId: user.mid
      });

      if (response.data.status === 1) {
        toast.success('OTP resent successfully');
        setOtp('');
      } else {
        toast.error(response.data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (currentStep === 2 && !otpSent) {
      setCurrentStep(1);
    } else if (currentStep === 2 && otpSent) {
      setOtpSent(false);
      setOtp('');
      setOtpReferenceData(null);
    } else {
      navigate('/banking/cash-deposit/biometric-kyc');
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="d-flex justify-content-center mb-4">
        {steps.map((step, index) => (
          <div key={step.id} className="d-flex align-items-center">
            <div 
              className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${
                step.id <= currentStep 
                  ? 'bg-primary text-white' 
                  : 'bg-light text-muted'
              }`}
              style={{ width: '40px', height: '40px', fontSize: '14px' }}
            >
              {step.id < currentStep ? (
                <i className="fas fa-check"></i>
              ) : (
                step.id
              )}
            </div>
            <div className="me-3">
              <div className={`fw-bold ${step.id <= currentStep ? 'text-primary' : 'text-muted'}`}>
                {step.title}
              </div>
              <small className="text-muted">{step.desc}</small>
            </div>
            {index < steps.length - 1 && (
              <div 
                className={`me-3 ${step.id < currentStep ? 'bg-primary' : 'bg-light'}`}
                style={{ width: '50px', height: '2px' }}
              ></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h5 className="text-center mb-4">Set Transaction PIN</h5>
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="mb-3">
                  <label className="form-label">
                    <i className="fas fa-lock me-2"></i>
                    Transaction PIN *
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.transaction_pin ? 'is-invalid' : ''}`}
                    name="transaction_pin"
                    value={formData.transaction_pin}
                    onChange={handleInputChange}
                    placeholder="Enter 4-6 digit PIN"
                    maxLength="6"
                    required
                  />
                  {errors.transaction_pin && (
                    <div className="invalid-feedback">{errors.transaction_pin}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <i className="fas fa-lock me-2"></i>
                    Confirm PIN *
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.confirm_pin ? 'is-invalid' : ''}`}
                    name="confirm_pin"
                    value={formData.confirm_pin}
                    onChange={handleInputChange}
                    placeholder="Re-enter PIN to confirm"
                    maxLength="6"
                    required
                  />
                  {errors.confirm_pin && (
                    <div className="invalid-feedback">{errors.confirm_pin}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <i className="fas fa-mobile-alt me-2"></i>
                    Mobile Number *
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.mobile_number ? 'is-invalid' : ''}`}
                    name="mobile_number"
                    value={formData.mobile_number}
                    onChange={handleInputChange}
                    placeholder="Enter mobile number"
                    maxLength="10"
                    required
                  />
                  {errors.mobile_number && (
                    <div className="invalid-feedback">{errors.mobile_number}</div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label">
                    <i className="fas fa-envelope me-2"></i>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Security Note:</strong> Your transaction PIN will be required for all cash deposit transactions. 
                  Keep it secure and don't share with anyone.
                </div>

                <div className="d-grid">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={setupTwoFactorAuth}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Setting up...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-shield-alt me-2"></i>
                        Setup Two-Factor Authentication
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h5 className="text-center mb-4">Verify Your Identity</h5>
            
            {!otpSent ? (
              <div className="row justify-content-center">
                <div className="col-md-6">
                  <p className="text-center text-muted mb-4">
                    Choose how you'd like to receive the verification code
                  </p>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="authMethod"
                        id="sms"
                        value="sms"
                        checked={authMethod === 'sms'}
                        onChange={(e) => setAuthMethod(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="sms">
                        <i className="fas fa-sms me-2"></i>
                        SMS to {formData.mobile_number}
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="authMethod"
                        id="email"
                        value="email"
                        checked={authMethod === 'email'}
                        onChange={(e) => setAuthMethod(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="email">
                        <i className="fas fa-envelope me-2"></i>
                        Email to {formData.email}
                      </label>
                    </div>
                  </div>

                  <div className="d-grid">
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={sendVerificationOtp}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-2"></i>
                          Sending...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2"></i>
                          Send Verification Code
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="row justify-content-center">
                <div className="col-md-6">
                  <div className="text-center mb-4">
                    <i className={`fas ${authMethod === 'sms' ? 'fa-mobile-alt' : 'fa-envelope'} fa-3x text-primary mb-3`}></i>
                    <h6>Verification Code Sent</h6>
                    <p className="text-muted">
                      Enter the 6-digit code sent to your {authMethod === 'sms' ? 'mobile' : 'email'}
                    </p>
                  </div>

                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control text-center fs-5"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength="6"
                      style={{ letterSpacing: '0.5rem' }}
                    />
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={verifyOtpAndActivate}
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-2"></i>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check me-2"></i>
                          Verify & Activate
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center mt-3">
                    <button
                      type="button"
                      className="btn btn-link"
                      onClick={resendOtp}
                      disabled={loading}
                    >
                      Didn't receive the code? Resend
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="text-center">
            <i className="fas fa-check-circle fa-5x text-success mb-4"></i>
            <h4 className="text-success mb-3">Two-Factor Authentication Activated!</h4>
            <p className="text-muted mb-4">
              Your Cash Deposit service is now fully secured with two-factor authentication. 
              You can now start processing cash deposit transactions.
            </p>
            <div className="alert alert-success">
              <i className="fas fa-shield-alt me-2"></i>
              <strong>Security Enabled:</strong> All transactions will now require your PIN and biometric verification.
            </div>
            <p className="text-muted">Redirecting to Cash Deposit service...</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="card-header text-center">
              <h4 className="card-title mb-0">
                <i className="fas fa-shield-alt me-2"></i>
                Two-Factor Authentication Setup
              </h4>
              <p className="text-muted mb-0">Secure your Cash Deposit service with enhanced authentication</p>
            </div>

            <div className="card-body">
              {renderStepIndicator()}
              {renderStepContent()}

              {/* Navigation */}
              <div className="d-flex justify-content-between mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={goBack}
                  disabled={loading}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Back
                </button>

                {currentStep === 3 && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => navigate('/banking/cash-deposit')}
                  >
                    <i className="fas fa-arrow-right me-2"></i>
                    Go to Cash Deposit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default CashDepositTwoFactorAuth;