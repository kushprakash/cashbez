import { useContext, useState, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../core/hooks/context';

const CashDepositEkyc = () => {
  const redirect = useNavigate();
  const { userData: user, logout } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpReferenceData, setOtpReferenceData] = useState(null);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const [formData, setFormData] = useState({
    aadhaar_number: '',
    mobile_number: '',
    name: '',
    email: '',
    address: '',
    pincode: '',
    state: '',
    district: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Pre-fill user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        mobile_number: user.mobile || '',
      }));
      setMobileNumber(user.mobile || '');
    }
  }, [user]);

  const validateAadhaar = (aadhaar) => {
    return /^\d{12}$/.test(aadhaar);
  };

  const validateMobile = (mobile) => {
    return /^[6-9]\d{9}$/.test(mobile);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.aadhaar_number || !validateAadhaar(formData.aadhaar_number)) {
      newErrors.aadhaar_number = 'Please enter a valid 12-digit Aadhaar number';
    }

    if (!formData.mobile_number || !validateMobile(formData.mobile_number)) {
      newErrors.mobile_number = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter a valid name';
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

  const sendEkycOtp = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/send-ekyc-otp', {
        aadhaar_number: formData.aadhaar_number,
        mobile_number: formData.mobile_number,
        name: formData.name,
        email: formData.email,
        outletId: user.mid
      });

      if (response.data.status === 1) {
        setOtpReferenceData(response.data.data);
        setOtpSent(true);
        setAadhaarNumber(formData.aadhaar_number);
        setMobileNumber(formData.mobile_number);
        toast.success('OTP sent successfully to your Aadhaar registered mobile number');
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send eKYC OTP error:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyEkycOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/verify-ekyc-otp', {
        otp: otp,
        reference_id: otpReferenceData?.reference_id,
        aadhaar_number: aadhaarNumber,
        mobile_number: mobileNumber,
        outletId: user.mid
      });

      if (response.data.status === 1) {
        toast.success('eKYC verification successful!');
        // Store eKYC data if needed
        setTimeout(() => {
          redirect('/banking/cash-deposit/biometric-kyc');
        }, 2000);
      } else {
        toast.error(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error('Verify eKYC OTP error:', error);
      toast.error('OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    try {
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/resend-ekyc-otp', {
        reference_id: otpReferenceData?.reference_id,
        aadhaar_number: aadhaarNumber,
        mobile_number: mobileNumber,
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
    if (otpSent) {
      setOtpSent(false);
      setOtp('');
      setOtpReferenceData(null);
    } else {
      redirect('/banking/cash-deposit/register');
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">
                <i className="fas fa-id-card me-2"></i>
                eKYC Verification
              </h4>
              <p className="text-muted mb-0">
                {otpSent 
                  ? 'Enter the OTP sent to your Aadhaar registered mobile number'
                  : 'Complete your eKYC verification to proceed with Cash Deposit service'
                }
              </p>
            </div>

            <div className="card-body">
              {!otpSent ? (
                // eKYC Form
                <form onSubmit={(e) => { e.preventDefault(); sendEkycOtp(); }}>
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-id-card me-2"></i>
                      Aadhaar Number *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.aadhaar_number ? 'is-invalid' : ''}`}
                      name="aadhaar_number"
                      value={formData.aadhaar_number}
                      onChange={handleInputChange}
                      placeholder="Enter 12-digit Aadhaar number"
                      maxLength="12"
                      required
                    />
                    {errors.aadhaar_number && (
                      <div className="invalid-feedback">{errors.aadhaar_number}</div>
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
                      placeholder="Enter 10-digit mobile number"
                      maxLength="10"
                      required
                    />
                    {errors.mobile_number && (
                      <div className="invalid-feedback">{errors.mobile_number}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-user me-2"></i>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                  </div>

                  <div className="mb-3">
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
                      placeholder="Enter your email address"
                      required
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Note:</strong> Make sure the mobile number you enter is registered with your Aadhaar. 
                    The OTP will be sent to this number for verification.
                  </div>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-md-2"
                      onClick={goBack}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Back
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-2"></i>
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2"></i>
                          Send OTP
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                // OTP Verification
                <div>
                  <div className="text-center mb-4">
                    <div className="mb-3">
                      <i className="fas fa-mobile-alt fa-3x text-primary"></i>
                    </div>
                    <h5>OTP Verification</h5>
                    <p className="text-muted">
                      We've sent a 6-digit OTP to your Aadhaar registered mobile number<br />
                      <strong>XXXXXXX{mobileNumber.slice(-3)}</strong>
                    </p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-center d-block">Enter OTP</label>
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
                      onClick={verifyEkycOtp}
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
                          Verify OTP
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
                      Didn't receive OTP? Resend
                    </button>
                  </div>

                  <div className="text-center mt-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={goBack}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Change Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="alert alert-warning mt-3">
            <i className="fas fa-shield-alt me-2"></i>
            <strong>Security Notice:</strong> Your Aadhaar information is encrypted and secure. 
            We comply with UIDAI guidelines for Aadhaar verification.
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

export default CashDepositEkyc;