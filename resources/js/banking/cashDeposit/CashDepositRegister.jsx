import { useContext, useState, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../core/hooks/context';

const CashDepositRegister = () => {
  const redirect = useNavigate();
  const { userData: user, logout } = useContext(AuthContext);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpReferenceData, setOtpReferenceData] = useState(null);
  const [kycData, setKycData] = useState(null);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
    fetchStates();
    fetchKyc();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not get your location. Please enter manually.');
        }
      );
    }
  };

  const fetchStates = async () => {
    try {
      const apiService = ApiService();
      const response = await apiService.vGet('/api/v2/aeps/state-list', {});
      if (response.data.status === 1) {
        setStates(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      toast.error('Failed to fetch states');
    }
  };

  const fetchCities = async (stateId) => {
    try {
      const apiService = ApiService();
      const response = await apiService.vGet(`/api/v2/aeps/cities/${stateId}`, {});
      if (response.data.status === 1) {
        setCities(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast.error('Failed to fetch cities');
    }
  };

  const fetchKyc = async () => {
    try {
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/draft-data', { outletId: user.mid });
      if (response.data.status === 1) {
        setKycData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching KYC data:', error);
      toast.error('Failed to fetch KYC data');
    }
  };

  // Set KYC data fields in formData
  const [formData, setFormData] = useState({
    full_name: user.name || '',
    email: user.email || '',
    phone: user.mobile || '',
    aadhaar_number: '',
    pan_no: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    latitude: '',
    longitude: '',
    address_line1: '',
    address_line2: '',
    state_id: '',
    city_id: '',
    pincode: '',
    shop_name: '',
    settlement_account: '',
    settlement_ifsc: '',
  });

  useEffect(() => {
    if (kycData) {
      setFormData(prev => ({
        ...prev,
        full_name: kycData.full_name || user.name || '',
        email: kycData.email || user.email || '',
        phone: kycData.phone || user.mobile || '',
        aadhaar_number: kycData.aadhaar_number || '',
        pan_no: kycData.pan_no || '',
        bank_name: kycData.bank_name || '',
        account_number: kycData.account_number || '',
        ifsc_code: kycData.ifsc_code || '',
        address_line1: kycData.address_line1 || '',
        address_line2: kycData.address_line2 || '',
        state_id: kycData.state_id || '',
        city_id: kycData.city_id || '',
        pincode: kycData.pincode || '',
        shop_name: kycData.shop_name || '',
        settlement_account: kycData.settlement_account || '',
        settlement_ifsc: kycData.settlement_ifsc || '',
      }));

      if (kycData.state_id) {
        fetchCities(kycData.state_id);
      }
    }
  }, [kycData, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'state_id' && value) {
      fetchCities(value);
      setFormData(prev => ({ ...prev, city_id: '' }));
    }
  };

  const validateForm = () => {
    const requiredFields = [
      'full_name', 'email', 'phone', 'aadhaar_number', 'pan_no',
      'bank_name', 'account_number', 'ifsc_code', 'latitude', 'longitude',
      'address_line1', 'state_id', 'city_id', 'pincode', 'shop_name'
    ];

    for (let field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        toast.error(`Please fill in ${field.replace('_', ' ')}`);
        return false;
      }
    }

    // Validate Aadhaar number
    if (formData.aadhaar_number.length !== 12) {
      toast.error('Aadhaar number must be 12 digits');
      return false;
    }

    // Validate PAN number
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(formData.pan_no)) {
      toast.error('Please enter a valid PAN number');
      return false;
    }

    // Validate phone number
    if (formData.phone.length !== 10) {
      toast.error('Phone number must be 10 digits');
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const apiService = ApiService();
      const submitData = {
        ...formData,
        outletId: user.mid
      };
      const response = await apiService.vPost('/api/v2/aeps/register-draft', submitData);
      
      if (response.data.status === 1) {
        toast.success('Registration draft created successfully!');
        setOtpReferenceData(response.data.data);
        setShowOtpModal(true);
      } else {
        toast.error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/verify-registration-otp', {
        otp: otp,
        reference_id: otpReferenceData?.reference_id,
        outletId: user.mid
      });
      
      if (response.data.status === 1) {
        toast.success('Registration completed successfully!');
        setShowOtpModal(false);
        redirect('/banking/cash-deposit');
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

  return (
    <div className="container-fluid p-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">
                <i className="fas fa-user-plus me-2"></i>
                Cash Deposit Service Registration
              </h4>
              <p className="text-muted mb-0">Complete your registration to enable cash deposit services</p>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Personal Information */}
                  <div className="col-12">
                    <h5 className="border-bottom pb-2 mb-3">Personal Information</h5>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      maxLength="10"
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Aadhaar Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="aadhaar_number"
                      value={formData.aadhaar_number}
                      onChange={handleInputChange}
                      maxLength="12"
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">PAN Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="pan_no"
                      value={formData.pan_no}
                      onChange={handleInputChange}
                      style={{ textTransform: 'uppercase' }}
                      maxLength="10"
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Shop/Business Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="shop_name"
                      value={formData.shop_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Bank Information */}
                  <div className="col-12 mt-4">
                    <h5 className="border-bottom pb-2 mb-3">Bank Information</h5>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Bank Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Account Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="account_number"
                      value={formData.account_number}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">IFSC Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="ifsc_code"
                      value={formData.ifsc_code}
                      onChange={handleInputChange}
                      style={{ textTransform: 'uppercase' }}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Settlement Account</label>
                    <input
                      type="text"
                      className="form-control"
                      name="settlement_account"
                      value={formData.settlement_account}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Settlement IFSC</label>
                    <input
                      type="text"
                      className="form-control"
                      name="settlement_ifsc"
                      value={formData.settlement_ifsc}
                      onChange={handleInputChange}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>

                  {/* Address Information */}
                  <div className="col-12 mt-4">
                    <h5 className="border-bottom pb-2 mb-3">Address Information</h5>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Address Line 1 *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address_line1"
                      value={formData.address_line1}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Address Line 2</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address_line2"
                      value={formData.address_line2}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">State *</label>
                    <select
                      className="form-control"
                      name="state_id"
                      value={formData.state_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select State</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">City *</label>
                    <select
                      className="form-control"
                      name="city_id"
                      value={formData.city_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Pincode *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      maxLength="6"
                      required
                    />
                  </div>

                  {/* Location Information */}
                  <div className="col-12 mt-4">
                    <h5 className="border-bottom pb-2 mb-3">Location Information</h5>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Latitude *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Longitude *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-12 mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-2"></i>
                          Registering...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2"></i>
                          Submit Registration
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Verify Registration OTP</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowOtpModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Please enter the OTP sent to your registered mobile number</p>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowOtpModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={verifyOtp}
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default CashDepositRegister;