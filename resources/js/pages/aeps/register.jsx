import { useContext, useState, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../core/hooks/context';

const AepsRegister = () => {

    const redirect = useNavigate();
    const { userData: user, logout } = useContext(AuthContext);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpReferenceData, setOtpReferenceData] = useState(null);

    const [kycData, setKycData] = useState(null);

    useEffect(() => {
        getCurrentLocation();
        fetchStates();
        fetchKyc();
    }, []);




    const fetchKyc = async () => {
        try {
            const apiService = ApiService();
            const response = await apiService.vGet('/api/v2/aeps/kyc', {});
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
        shop_name: '',
        shop_address: '',
        shop_city: '',
        shop_district: '',
        state_id: '',
        shop_pin_code: '',
        bank_branch: '',
        retailerAadhaarFrontImage: null,
        retailerAadhaarBackImage: null,
        retailerPanFrontImage: null,
        retailerPanBackImage: null,
        retailerShopImage: null
    });

    // Update formData when kycData is available
    useEffect(() => {
        if (kycData) {
            setFormData(prev => ({
                ...prev,
                aadhaar_number: kycData.aadhar_number || '',
                pan_no: kycData.pan_number || '',
                bank_name: kycData.bank_name || '',
                account_number: kycData.account_number || '',
                ifsc_code: kycData.ifsc_code || '',
                bank_branch: kycData.branch || ''
            }));
        }
    }, [kycData]);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [states, setStates] = useState([]);
    const [imagePreviews, setImagePreviews] = useState({
        retailerAadhaarFrontImage: null,
        retailerAadhaarBackImage: null,
        retailerPanFrontImage: null,
        retailerPanBackImage: null,
        retailerShopImage: null
    });




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

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude.toString(),
                        longitude: position.coords.longitude.toString(),
                        shopLatitude: position.coords.latitude.toString(),
                        shopLongitude: position.coords.longitude.toString()
                    }));
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.full_name) newErrors.full_name = 'Full name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        if (!formData.aadhaar_number || formData.aadhaar_number.length !== 12) newErrors.aadhaar_number = 'Valid Aadhar number is required';
        if (!formData.pan_no) newErrors.pan_no = 'PAN number is required';
        if (!formData.account_number) newErrors.account_number = 'Bank account number is required';
        if (!formData.ifsc_code) newErrors.ifsc_code = 'IFSC code is required';
        if (!formData.shop_name) newErrors.shop_name = 'Shop name is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
        
        setFormData(prev => ({
            ...prev,
            [name]: file
        }));

        // Create image preview
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreviews(prev => ({
                    ...prev,
                    [name]: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreviews(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Create a FormData object to handle file uploads
            const formDataToSend = new FormData();

            // Append all form data
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });

            const apiService = ApiService();
            const response = await apiService.vPost('/api/v2/aeps/draft', formDataToSend);

            if (response.data.status === 1) {
                toast.success(response.data.message);
                redirect('/aeps');
            } else {
                toast.error(response.data.message || 'Registration failed. Please try again.');
            }

        } catch (error) {
            console.error('Registration failed:', error);
            toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpVerification = async () => {
        if (!otp) {
            toast.error('Please enter OTP');
            return;
        }

        try {
            const apiService = ApiService();
            const response = await apiService.vPost('/otpValidate', {
                aadharNo: formData.aadharNo,
                otp: otp
            });


            if (response.data.status === true) {
                toast.success('OTP verified successfully');

                // Store the new outlet ID from the response
                const { token, merchantData } = retrieveTokenAndUserData() || {};
                const { mid, mkey, outletId } = merchantData || {};

                if (response.data.outletId) {
                    storeTokenAndUserData({
                        mid: mid,
                        mkey: mkey,
                        outletId: response.data.outletId || outletId || "",
                        token: token
                    });
                }

                setShowOtpModal(false);
                redirect('/aeps'); // Redirect to AEPS page after successful OTP verification

            } else {
                toast.error(response.data.message || 'OTP verification failed');
            }
        } catch (error) {
            console.error('OTP verification failed:', error);
            toast.error(error.response?.data?.message || 'OTP verification failed');
        }
    };

    const handleModalClose = () => {
        setShowOtpModal(false);
        setOtp('');
    };

    return (
        <div className="" style={{ 
            backgroundColor: '#f8f9fa', 
            minHeight: '100vh', 
            padding: '20px 0' 
        }}>
            <div className="col-md-12">
                <div className="card" style={{
                    borderRadius: '15px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    border: 'none',
                    overflow: 'hidden'
                }}>
                    <div className="card-header" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '25px 30px',
                        border: 'none'
                    }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="d-flex align-items-center">
                                <div style={{
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px'
                                }}>
                                    <i className="bi bi-person-plus-fill" style={{ fontSize: '1.5rem' }}></i>
                                </div>
                                <div>
                                    <h4 className="mb-1 fw-bold text-white">Merchant Draft Registration</h4>
                                    <small style={{ opacity: 0.9 }}>Complete your registration to start AEPS & Cash Depost services</small>
                                </div>
                            </span>
                        </div>
                    </div>
                    <div className="card-body" style={{ 
                        padding: '40px 30px',
                        backgroundColor: '#ffffff'
                    }}>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-4">
                                {/* Personal Information Section */}
                                <div className="col-12">
                                    <div style={{
                                        backgroundColor: '#f8f9ff',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        border: '1px solid #e3e6f0',
                                        marginBottom: '20px'
                                    }}>
                                        <h5 style={{
                                            color: '#5a67d8',
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            marginBottom: '20px',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <i className="bi bi-person-circle me-2"></i>
                                            Personal Information
                                        </h5>
                                        
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <label className="form-label" style={{
                                                    fontWeight: '500',
                                                    color: '#4a5568',
                                                    marginBottom: '8px'
                                                }}>Retailer Name*</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
                                                    name="full_name"
                                                    value={formData.full_name}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '2px solid #e2e8f0',
                                                        padding: '12px 16px',
                                                        fontSize: '14px',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = '#5a67d8'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                                {errors.full_name && <div className="invalid-feedback">{errors.full_name}</div>}
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label" style={{
                                                    fontWeight: '500',
                                                    color: '#4a5568',
                                                    marginBottom: '8px'
                                                }}>Email*</label>
                                                <input
                                                    type="email"
                                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '2px solid #e2e8f0',
                                                        padding: '12px 16px',
                                                        fontSize: '14px',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = '#5a67d8'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label" style={{
                                                    fontWeight: '500',
                                                    color: '#4a5568',
                                                    marginBottom: '8px'
                                                }}>Phone Number*</label>
                                                <input
                                                    type="tel"
                                                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '2px solid #e2e8f0',
                                                        padding: '12px 16px',
                                                        fontSize: '14px',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = '#5a67d8'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label" style={{
                                                    fontWeight: '500',
                                                    color: '#4a5568',
                                                    marginBottom: '8px'
                                                }}>Aadhar Number*</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.aadhaar_number ? 'is-invalid' : ''}`}
                                                    name="aadhaar_number"
                                                    value={formData.aadhaar_number}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '2px solid #e2e8f0',
                                                        padding: '12px 16px',
                                                        fontSize: '14px',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = '#5a67d8'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                                {errors.aadhaar_number && <div className="invalid-feedback">{errors.aadhaar_number}</div>}
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label" style={{
                                                    fontWeight: '500',
                                                    color: '#4a5568',
                                                    marginBottom: '8px'
                                                }}>PAN Number*</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.pan_no ? 'is-invalid' : ''}`}
                                                    name="pan_no"
                                                    value={formData.pan_no}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '2px solid #e2e8f0',
                                                        padding: '12px 16px',
                                                        fontSize: '14px',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = '#5a67d8'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                                {errors.pan_no && <div className="invalid-feedback">{errors.pan_no}</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bank Details Section */}
                                <div className="col-12">
                                    <div style={{
                                        backgroundColor: '#f0fff4',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        border: '1px solid #c6f6d5',
                                        marginBottom: '20px'
                                    }}>
                                        <h5 style={{
                                            color: '#2d7d32',
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            marginBottom: '20px',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <i className="bi bi-bank me-2"></i>
                                            Bank Details
                                        </h5>
                                        
                                        <div className="row g-3">
                                            <div className="col-md-3">
                                                <label className="form-label" style={{
                                                    fontWeight: '500',
                                                    color: '#4a5568',
                                                    marginBottom: '8px'
                                                }}>Bank Name*</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.bank_name ? 'is-invalid' : ''}`}
                                                    name="bank_name"
                                                    value={formData.bank_name}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '2px solid #e2e8f0',
                                                        padding: '12px 16px',
                                                        fontSize: '14px',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = '#2d7d32'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                                {errors.bank_name && <div className="invalid-feedback">{errors.bank_name}</div>}
                                            </div>

                                            <div className="col-md-3">
                                                <label className="form-label" style={{
                                                    fontWeight: '500',
                                                    color: '#4a5568',
                                                    marginBottom: '8px'
                                                }}>Account Number*</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.account_number ? 'is-invalid' : ''}`}
                                                    name="account_number"
                                                    value={formData.account_number}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '2px solid #e2e8f0',
                                                        padding: '12px 16px',
                                                        fontSize: '14px',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = '#2d7d32'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                                {errors.account_number && <div className="invalid-feedback">{errors.account_number}</div>}
                                            </div>

                                            <div className="col-md-3">
                                                <label className="form-label" style={{
                                                    fontWeight: '500',
                                                    color: '#4a5568',
                                                    marginBottom: '8px'
                                                }}>IFSC Code*</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.ifsc_code ? 'is-invalid' : ''}`}
                                                    name="ifsc_code"
                                                    value={formData.ifsc_code}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '2px solid #e2e8f0',
                                                        padding: '12px 16px',
                                                        fontSize: '14px',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = '#2d7d32'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                                {errors.ifsc_code && <div className="invalid-feedback">{errors.ifsc_code}</div>}
                                            </div>
                                            
                                            <div className="col-md-6">
                                                <label className="form-label" style={{
                                                    fontWeight: '500',
                                                    color: '#4a5568',
                                                    marginBottom: '8px'
                                                }}>Bank Branch*</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.bank_branch ? 'is-invalid' : ''}`}
                                                    name="bank_branch"
                                                    value={formData.bank_branch}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '2px solid #e2e8f0',
                                                        padding: '12px 16px',
                                                        fontSize: '14px',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = '#2d7d32'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                                {errors.bank_branch && <div className="invalid-feedback">{errors.bank_branch}</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Shop Details Section */}
                                <div className="col-12">
                                    <div style={{
                                        backgroundColor: '#fff8f0',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        border: '1px solid #fed7aa',
                                        marginBottom: '20px'
                                    }}>
                                        <h5 style={{
                                            color: '#c2410c',
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            marginBottom: '20px',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <i className="bi bi-shop me-2"></i>
                                            Shop Details
                                        </h5>
                                        
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label" style={{
                                                    fontWeight: '500',
                                                    color: '#4a5568',
                                                    marginBottom: '8px'
                                                }}>Shop Name*</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.shop_name ? 'is-invalid' : ''}`}
                                                    name="shop_name"
                                                    value={formData.shop_name}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '2px solid #e2e8f0',
                                                        padding: '12px 16px',
                                                        fontSize: '14px',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = '#c2410c'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                                {errors.shop_name && <div className="invalid-feedback">{errors.shop_name}</div>}
                                            </div>

                                            <div className="col-12">
                                                <label className="form-label" style={{
                                                    fontWeight: '500',
                                                    color: '#4a5568',
                                                    marginBottom: '8px'
                                                }}>Shop Address*</label>
                                                <textarea
                                                    className="form-control"
                                                    name="shop_address"
                                                    value={formData.shop_address}
                                                    onChange={handleInputChange}
                                                    rows="3"
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '2px solid #e2e8f0',
                                                        padding: '12px 16px',
                                                        fontSize: '14px',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: '#ffffff',
                                                        resize: 'vertical'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = '#c2410c'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                ></textarea>
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label" style={{
                                                    fontWeight: '500',
                                                    color: '#4a5568',
                                                    marginBottom: '8px'
                                                }}>Shop City*</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="shop_city"
                                                    value={formData.shop_city}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '2px solid #e2e8f0',
                                                        padding: '12px 16px',
                                                        fontSize: '14px',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = '#c2410c'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label" style={{
                                                    fontWeight: '500',
                                                    color: '#4a5568',
                                                    marginBottom: '8px'
                                                }}>Shop District*</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="shop_district"
                                                    value={formData.shop_district}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '2px solid #e2e8f0',
                                                        padding: '12px 16px',
                                                        fontSize: '14px',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = '#c2410c'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label" style={{
                                                    fontWeight: '500',
                                                    color: '#4a5568',
                                                    marginBottom: '8px'
                                                }}>Shop State*</label>
                                                <select
                                                    className="form-control"
                                                    name="state_id"
                                                    value={formData.state_id}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '2px solid #e2e8f0',
                                                        padding: '12px 16px',
                                                        fontSize: '14px',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = '#c2410c'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                >
                                                    <option value="">Select State</option>
                                                    {Array.isArray(states) && states.map(state => (
                                                        <option key={state.stateId} value={state.stateId}>
                                                            {state.state}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label" style={{
                                                    fontWeight: '500',
                                                    color: '#4a5568',
                                                    marginBottom: '8px'
                                                }}>Shop Pincode*</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="shop_pin_code"
                                                    value={formData.shop_pin_code}
                                                    onChange={handleInputChange}
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '2px solid #e2e8f0',
                                                        padding: '12px 16px',
                                                        fontSize: '14px',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = '#c2410c'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Section */}
                                <div className="col-12">
                                    <div style={{
                                        backgroundColor: '#f0f9ff',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        border: '1px solid #bae6fd',
                                        marginBottom: '20px'
                                    }}>
                                        <h5 style={{
                                            color: '#0369a1',
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            marginBottom: '20px',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <i className="bi bi-geo-alt me-2"></i>
                                            Location Details
                                        </h5>
                                        
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label" style={{
                                                    fontWeight: '500',
                                                    color: '#4a5568',
                                                    marginBottom: '8px'
                                                }}>Latitude</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="latitude"
                                                    value={formData.latitude}
                                                    readOnly
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '2px solid #e2e8f0',
                                                        padding: '12px 16px',
                                                        fontSize: '14px',
                                                        backgroundColor: '#f8f9fa',
                                                        color: '#6c757d'
                                                    }}
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label" style={{
                                                    fontWeight: '500',
                                                    color: '#4a5568',
                                                    marginBottom: '8px'
                                                }}>Longitude</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="longitude"
                                                    value={formData.longitude}
                                                    readOnly
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '2px solid #e2e8f0',
                                                        padding: '12px 16px',
                                                        fontSize: '14px',
                                                        backgroundColor: '#f8f9fa',
                                                        color: '#6c757d'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12 mt-4">
                                    <div className="d-flex justify-content-center">
                                        <button
                                            type="submit"
                                            className="btn"
                                            disabled={loading}
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: 'white',
                                                border: 'none',
                                                padding: '15px 50px',
                                                borderRadius: '25px',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                                                transition: 'all 0.3s ease',
                                                transform: loading ? 'scale(0.95)' : 'scale(1)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                                            }}
                                        >
                                            {loading ? (
                                                <>
                                                    <i className="bi bi-hourglass-split me-2"></i>
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check-circle me-2"></i>
                                                    Submit Registration
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* OTP Verification Modal */}
            <div className={`modal fade ${showOtpModal ? 'show' : ''}`}
                style={{ display: showOtpModal ? 'block' : 'none' }}
                tabIndex="-1"
                aria-labelledby="otpModalLabel"
                aria-hidden={!showOtpModal}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content" style={{
                        borderRadius: '15px',
                        border: 'none',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                    }}>
                        <div className="modal-header" style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            borderRadius: '15px 15px 0 0',
                            padding: '20px 30px',
                            border: 'none'
                        }}>
                            <h5 className="modal-title" id="otpModalLabel" style={{
                                fontWeight: '600',
                                fontSize: '18px'
                            }}>
                                <i className="bi bi-shield-check me-2"></i>
                                OTP Verification
                            </h5>
                            <button type="button"
                                className="btn-close btn-close-white"
                                onClick={handleModalClose}
                                aria-label="Close"
                                style={{
                                    filter: 'invert(1)'
                                }}></button>
                        </div>
                        <div className="modal-body" style={{
                            padding: '30px'
                        }}>
                            <div className="text-center mb-4">
                                <div style={{
                                    backgroundColor: '#f0f9ff',
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 20px',
                                    color: '#0369a1'
                                }}>
                                    <i className="bi bi-phone" style={{ fontSize: '2rem' }}></i>
                                </div>
                                <p style={{
                                    color: '#6b7280',
                                    fontSize: '14px',
                                    marginBottom: '20px'
                                }}>
                                    We've sent a verification code to your registered mobile number
                                </p>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="otp" className="form-label" style={{
                                    fontWeight: '500',
                                    color: '#4a5568',
                                    marginBottom: '8px'
                                }}>Enter OTP</label>
                                <input type="text"
                                    className="form-control"
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit OTP"
                                    maxLength="6"
                                    style={{
                                        borderRadius: '8px',
                                        border: '2px solid #e2e8f0',
                                        padding: '12px 16px',
                                        fontSize: '16px',
                                        textAlign: 'center',
                                        letterSpacing: '2px',
                                        fontWeight: '600'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                        </div>
                        <div className="modal-footer" style={{
                            padding: '20px 30px',
                            border: 'none',
                            justifyContent: 'center'
                        }}>
                            <button type="button"
                                className="btn me-3"
                                onClick={handleModalClose}
                                style={{
                                    backgroundColor: '#f8f9fa',
                                    color: '#6c757d',
                                    border: '2px solid #e9ecef',
                                    padding: '10px 25px',
                                    borderRadius: '8px',
                                    fontWeight: '500'
                                }}>
                                Cancel
                            </button>
                            <button type="button"
                                className="btn"
                                onClick={handleOtpVerification}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 30px',
                                    borderRadius: '8px',
                                    fontWeight: '500',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                                }}>
                                <i className="bi bi-check-circle me-2"></i>
                                Verify OTP
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal Backdrop */}
            {showOtpModal && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default AepsRegister;