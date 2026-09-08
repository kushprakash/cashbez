import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const AddBeneficiary = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    account: '',
    confirmAccount: '',
    ifsc: '',
    otp: '',
    type: 0  // 0 for customer, 1 for self
  });
  const [errors, setErrors] = useState({});
  const [ifscVerification, setIfscVerification] = useState(null);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle mobile number formatting (only digits)
    let formattedValue = value;
    if (name === 'mobile') {
      formattedValue = value.replace(/\D/g, ''); // Remove non-digits
      if (formattedValue.length > 10) {
        formattedValue = formattedValue.slice(0, 10); // Limit to 10 digits
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Auto-verify IFSC when it's complete
    if (name === 'ifsc' && value.length === 11) {
      verifyIfsc(value);
    }
  };

  const verifyIfsc = async (ifscCode) => {
    try {
      const response = await fetch(`https://ifsc.razorpay.com/${ifscCode}`);
      if (response.ok) {
        const data = await response.json();
        setIfscVerification({
          verified: true,
          branch: data.BRANCH,
          bank: data.BANK,
          city: data.CITY,
          state: data.STATE
        });
        toast.success('IFSC verified successfully');
      } else {
        setIfscVerification({
          verified: false,
          error: 'Invalid IFSC code'
        });
        toast.error('Invalid IFSC code');
      }
    } catch (error) {
      setIfscVerification({
        verified: false,
        error: 'Failed to verify IFSC'
      });
      toast.error('Failed to verify IFSC');
    }
  };

  const sendOtp = async () => {
    try {
      setLoading(true);
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/banking-send-otp', {});
      
      if (response.data.status === 1) {
        setOtpSent(true);
        toast.success('OTP sent successfully');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Beneficiary name is required';
    }

    // Mobile validation (optional but must be valid if provided)
    if (formData.mobile.trim()) {
      if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
        newErrors.mobile = 'Mobile number must be a valid 10-digit Indian number';
      }
    }

    if (!formData.account.trim()) {
      newErrors.account = 'Account number is required';
    } else if (formData.account.length < 9 || formData.account.length > 18) {
      newErrors.account = 'Account number must be between 9 and 18 digits';
    }

    if (!formData.confirmAccount.trim()) {
      newErrors.confirmAccount = 'Please confirm account number';
    } else if (formData.account !== formData.confirmAccount) {
      newErrors.confirmAccount = 'Account numbers do not match';
    }

    if (!formData.ifsc.trim()) {
      newErrors.ifsc = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc)) {
      newErrors.ifsc = 'Invalid IFSC code format';
    }

    if (!formData.otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!otpSent) {
      toast.error('Please request OTP first');
      return;
    }

    try {
      setLoading(true);
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/beneficiaries', formData);
      if (response.data.status === 1) {
        toast.success('Beneficiary added successfully');
        navigate('/banking/beneficiary');
      } else {
        toast.error(response.data.message);
        if (response.data.errors) {
          setErrors(response.data.errors);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add beneficiary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Pageheader 
        mainheading="Add Beneficiary" 
        parentfolder="Banking" 
        activepage="Add Beneficiary" 
      />
      
      <div className="page-content-box">
        <div className="page-content-box-inner">
          <div className="row ">
            <div className="col-md-8">
              <div className="card">
              

                 <div className="card-header d-flex justify-content-between align-items-center rounded-top">
                      <span className="d-flex align-items-center">
                          <i className="bi bi-person-badge me-2" style={{ fontSize: '1.3rem' }}></i>
                          <h5 className="mb-0 fw-semibold">Add New Beneficiary</h5>
                      </span>
                    <Link to="/banking/beneficiary" className="btn btn-primary text-white d-flex align-items-center">
                    <i className="fa fa-list me-1"></i> Beneficiary List
                      </Link>
                  </div>
                
                <div className="card-body">
  
              
                  <form onSubmit={handleSubmit}>
                    {/* Hidden field for type */}
                    <input
                      type="hidden"
                      name="type"
                      value={formData.type}
                    />
                    
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Beneficiary Name *</label>
                          <input
                            type="text"
                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter beneficiary name"
                          />
                          {errors.name && (
                            <div className="invalid-feedback">{errors.name}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Mobile Number</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fa fa-mobile"></i>
                            </span>
                            <input
                              type="tel"
                              className={`form-control ${errors.mobile ? 'is-invalid' : ''}`}
                              name="mobile"
                              value={formData.mobile}
                              onChange={handleInputChange}
                              placeholder="Enter mobile number"
                              maxLength="10"
                            />
                            {errors.mobile && (
                              <div className="invalid-feedback">{errors.mobile}</div>
                            )}
                          </div>
                        
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Account Number *</label>
                          <input
                            type="text"
                            className={`form-control ${errors.account ? 'is-invalid' : ''}`}
                            name="account"
                            value={formData.account}
                            onChange={handleInputChange}
                            placeholder="Enter account number"
                          />
                          {errors.account && (
                            <div className="invalid-feedback">{errors.account}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Confirm Account Number *</label>
                          <input
                            type="text"
                            className={`form-control ${errors.confirmAccount ? 'is-invalid' : ''}`}
                            name="confirmAccount"
                            value={formData.confirmAccount}
                            onChange={handleInputChange}
                            placeholder="Confirm account number"
                          />
                          {errors.confirmAccount && (
                            <div className="invalid-feedback">{errors.confirmAccount}</div>
                          )}
                          {formData.account && formData.confirmAccount && formData.account === formData.confirmAccount && (
                            <div className="text-success mt-1">
                              <i className="fa fa-check-circle"></i> Account numbers match
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">IFSC Code *</label>
                          <input
                            type="text"
                            className={`form-control ${errors.ifsc ? 'is-invalid' : ''}`}
                            name="ifsc"
                            value={formData.ifsc}
                            onChange={handleInputChange}
                            placeholder="Enter IFSC code"
                            style={{ textTransform: 'uppercase' }}
                          />
                          {errors.ifsc && (
                            <div className="invalid-feedback">{errors.ifsc}</div>
                          )}
                          {ifscVerification && (
                            <div className={`mt-2 ${ifscVerification.verified ? 'text-success' : 'text-danger'}`}>
                              {ifscVerification.verified ? (
                                <div>
                                  <i className="fa fa-check-circle"></i> IFSC Verified
                                  <br />
                                  <small>
                                    {ifscVerification.bank} - {ifscVerification.branch}
                                    <br />
                                    {ifscVerification.city}, {ifscVerification.state}
                                  </small>
                                </div>
                              ) : (
                                <div>
                                  <i className="fa fa-times-circle"></i> {ifscVerification.error}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">OTP Verification *</label>
                          <div className="input-group">
                            <input
                              type="text"
                              className={`form-control ${errors.otp ? 'is-invalid' : ''}`}
                              name="otp"
                              value={formData.otp}
                              onChange={handleInputChange}
                              placeholder="Enter 6-digit OTP"
                              maxLength={6}
                            />
                            <button
                              type="button"
                              className="btn btn-outline-primary"
                              onClick={sendOtp}
                              disabled={loading || !formData.name || !formData.account || !formData.confirmAccount || !formData.ifsc || formData.account !== formData.confirmAccount}
                            >
                              {loading ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                            </button>
                          </div>
                          {errors.otp && (
                            <div className="invalid-feedback d-block">{errors.otp}</div>
                          )}
                          {otpSent && (
                            <div className="text-success mt-2">
                              <i className="fa fa-check-circle"></i> OTP sent to your registered mobile number
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="alert alert-info">
                      <i className="fa fa-info-circle"></i>
                      <strong>Note:</strong> Once added, beneficiary details cannot be edited or deleted. You can only view beneficiaries.
                    </div>

                    <div className="d-flex justify-content-between">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/banking/beneficiary')}
                      >
                        <i className="fa fa-arrow-left me-1"></i> Back to List
                      </button>
                      
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !otpSent}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1"></span>
                            Adding...
                          </>
                        ) : (
                          <>
                            <i className="fa fa-save me-1"></i> Add Beneficiary
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
      </div>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default AddBeneficiary;
