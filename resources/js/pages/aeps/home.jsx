import { useContext, useEffect, useRef, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { captureFingerprint, captureFingerprint1, discoverBiometricDevice, retrieveDeviceInformation } from "./mantra_morpho/BiometricScannerComponent";
import './App.css';
import npciLogo from './npci-logo.png';
import { parseStringPromise } from 'xml2js';
import { AuthContext } from '../../core/hooks/context';
import LoadingOverlay from '../../components/LoadingOverlay';


const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
  },
  formSection: {
    marginBottom: '20px',
  },
  sectionTitle: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '8px',
    fontWeight: 'normal',
  },
  dropdown: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    cursor: 'pointer',
  },
  fastCashButton: {
    padding: '8px 16px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    color: '#495057',
    margin: '0 8px 8px 0',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  fastCashButtonActive: {
    backgroundColor: '#e7f1ff',
    borderColor: '#3b82f6',
    color: '#3b82f6',
  },
  serviceButton: {
    width: '100%',
    padding: '8px 16px',
    textAlign: 'left',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#f8faff',
    color: '#3b82f6',
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputAddon: {
    position: 'absolute',
    left: '15px',
    color: '#6B7280',
    fontSize: '14px',
    pointerEvents: 'none',
    zIndex: 2,
  },
  inputWithPrefix: {
    paddingLeft: '45px !important',
  },
  deviceSelector: {
    display: 'flex',
    gap: '15px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  deviceOption: {
    flex: 1,
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  deviceOptionActive: {
    borderColor: '#6c5ce7',
    backgroundColor: '#f5f3ff',
  },
  deviceIcon: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f3ff',
    borderRadius: '50%',
    color: '#6c5ce7',
  },
  error: {
    color: '#dc3545',
    fontSize: '12px',
    marginTop: '4px',
  },
  inputError: {
    borderColor: '#dc3545 !important',
    backgroundColor: '#fff8f8 !important',
  },
  header: {
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    padding: '15px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#444',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },
  quickBankBtn: {
    padding: '4px 8px',
    margin: '0 4px 4px 0',
    backgroundColor: 'white',
    border: '1px solid #6c5ce7',
    color: '#6c5ce7',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  quickBankBtnActive: {
    backgroundColor: '#6c5ce7',
    color: 'white',
  },
  actionButton: {
    backgroundColor: '#6c5ce7',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  modeButton: {
    minWidth: '220px',
    padding: '15px 25px',
    borderRadius: '10px',
    transition: 'all 0.3s ease',
    backgroundColor: 'white',
    border: '2px solid #6c5ce7',
    color: '#6c5ce7',
    fontWeight: '500',
  },
  modeButtonActive: {
    backgroundColor: '#6c5ce7',
    color: 'white',
  },
  primaryAccountCard: {
    background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
    borderRadius: '50px',
    padding: '8px 24px',
    color: 'white',
    boxShadow: '0 4px 15px rgba(108, 92, 231, 0.3)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minWidth: '280px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  balanceLabel: {
    fontSize: '11px',
    opacity: '0.9',
    marginBottom: '2px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: '18px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    lineHeight: '1.2',
  },
  toggleBtn: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'white',
    transition: 'background 0.2s',
  }
};



const Home = () => {
  const redirect = useNavigate();
  const isFirstRender = useRef(true);
  const submitButtonRef = useRef(null);
  const { userData: user, logout } = useContext(AuthContext);


  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showEkycOtpModal, setShowEkycOtpModal] = useState(false);
  const [showBiometricEkycModal, setShowBiometricEkycModal] = useState(false);
  const [showTwoFAModal, setShowTwoFAModal] = useState(false);
  const [showAepsOtpModal, setShowAepsOtpModal] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [deviceModalLoading, setDeviceModalLoading] = useState(false);
  const [mposSerialNumber, setMposSerialNumber] = useState('');
  const [aepsOtp, setAepsOtp] = useState('');
  const [txnOtpRequestId, setTxnOtpRequestId] = useState(null);
  const [sendAepsOtpLoading, setSendAepsOtpLoading] = useState(false);
  const [loading2FA, setLoading2FA] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [ekycOtpLoading, setEkycOtpLoading] = useState(false);
  const [biometricEkycLoading, setBiometricEkycLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [ekycOtp, setEkycOtp] = useState('');
  const [ekycOtpData, setEkycOtpData] = useState(null);
  const [aadharNo, setAadharNo] = useState('');
  const [otpReferenceData, setOtpReferenceData] = useState(null);
  const [selectedMode, setSelectedMode] = useState('CW'); // CW, MINI, BE, M

  // Verification states
  const [verificationData, setVerificationData] = useState(null);
  const [currentVerificationStep, setCurrentVerificationStep] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationForm, setVerificationForm] = useState({
    mobile: '',
    email: '',
    aadhaar: '',
    pan: '',
    bankAccount: '',
    ifsc: '',
    otp: ''
  });

  // Form states
  const [mobile, setMobile] = useState('');
  const [banks, setBankList] = useState([]);
  const [bankIin, setBankIin] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricData, setBiometricData] = useState(null);
  const [device, setDevice] = useState('Mantra');
  const [deviceIMEI, setDeviceIMEI] = useState('');
  const [errors, setErrors] = useState({
    mobile: '',
    aadharNo: '',
    bankIin: '',
    amount: '',
    deviceIMEI: '',
  });

  const [favoriteBanks, setFavoriteBanks] = useState([]);
  const [aepsDraft, setAepsDraft] = useState([]);
  const [primaryAccount, setPrimaryAccount] = useState(null);
  const [showPrimaryBalance, setShowPrimaryBalance] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (location.state && (location.state.mode || location.state.aadhaarNumber || location.state.customerMobile || location.state.bankIin)) {
      const { mode, aadhaarNumber, customerMobile, bankIin: passedBankIin } = location.state;
      if (mode) setSelectedMode(mode);
      if (aadhaarNumber) setAadharNo(aadhaarNumber);
      if (customerMobile) setMobile(customerMobile);
      if (passedBankIin) setBankIin(passedBankIin);

      // Clear location state from history so page refresh (F5) clears the form data
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const savedFavs = localStorage.getItem('favoriteBanks');
    if (savedFavs) {
      try {
        setFavoriteBanks(JSON.parse(savedFavs));
      } catch (error) {
        console.error('Error parsing favorite banks:', error);
      }
    }
  }, []);

  const addToFavorites = (bank) => {
    if (!bank) return;

    setFavoriteBanks(prev => {
      // Check if bank already exists
      const exists = prev.some(b => b.iinno === bank.iinno);
      let newFavs = [...prev];

      if (!exists) {
        newFavs.unshift(bank); // Add to beginning
      } else {
        // If exists, move to top
        newFavs = newFavs.filter(b => b.iinno !== bank.iinno);
        newFavs.unshift(bank);
      }

      // Keep only top 5
      if (newFavs.length > 5) {
        newFavs = newFavs.slice(0, 5);
      }

      localStorage.setItem('favoriteBanks', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const removeFromFavorites = (bankIinno) => {
    setFavoriteBanks(prev => {
      const newFavs = prev.filter(b => b.iinno !== bankIinno);
      localStorage.setItem('favoriteBanks', JSON.stringify(newFavs));
      return newFavs;
    });
  };



  const getBankList = async () => {
    const apiService = ApiService();
    const response = await apiService.vPost('/api/v2/aeps/bank-list', {});

    if (response.data.status === 1) {
      setBankList(response.data.data || []);
    }
  }

  const fetchPrimaryAccount = async () => {
    try {
      const apiService = ApiService();
      const response = await apiService.vGet('/api/accounts/primary');
      if (response.data.status === 1) {
        setPrimaryAccount(response.data.data.account);
      }
    } catch (error) {
      console.error('Failed to fetch primary account:', error);
    }
  };

  const checkstatus = async () => {
    setLoading2FA(true);
    try {
      // Check the status of the registration
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/draft-data', { outletId: user.mid });

      if (response.data.status === 1) {
        const data = response.data.data;

        setAepsDraft(data);

        setVerificationData(data);
        setDeviceIMEI(data.deviceIMEI || '');
        if (data.deviceName) {
          setDevice(data.deviceName);
        }
        if (data.mposSerialNumber) {
          setMposSerialNumber(data.mposSerialNumber);
        }
        // Pre-populate verification form with existing data from draft
        setVerificationForm(prev => ({
          ...prev,
          mobile: data.phone || '',
          email: data.email || '',
          aadhaar: data.aadhaar_number || '',
          pan: data.pan_no || '',
          bankAccount: data.account_number || '',
          ifsc: data.ifsc_code || ''
        }));

        // Check verification status and start verification flow - PAN first
        if (data.pan_verified_at === 0) {
          setCurrentVerificationStep('pan');
          setShowVerificationModal(true);
        } else if (data.phone_verified_at === 0) {
          setCurrentVerificationStep('mobile');
          setShowVerificationModal(true);
        } else if (data.email_verified_at === 0) {
          setCurrentVerificationStep('email');
          setShowVerificationModal(true);
        } else if (data.aadhaar_verified_at === 0) {
          setCurrentVerificationStep('aadhaar');
          setShowVerificationModal(true);
        } else if (data.bank_verified_at === 0) {
          setCurrentVerificationStep('bank');
          setShowVerificationModal(true);
        } else if (data.aeps_status === 0) {
          // All verifications complete, show onboarding modal
          setShowOnboardingModal(true);
        } else if (data.aeps_status === 1) {
          //setAadharNo(data.aadhaar_number || '');
          setShowEkycOtpModal(true);
        } else if (data.aeps_status === 2) {
          setShowBiometricEkycModal(true);
        } else if (data.aeps_status === 3) {
          setShowBiometricEkycModal(false);
          setShowTwoFAModal(true);
        } else if (data.ap_status === 0) {
          if (selectedMode === 'M') {
            setShowBiometricEkycModal(false);
            setShowTwoFAModal(true);
          }


        }
        //toast.success('check2FAAuth successfully');
      } else {
        redirect('/register');
      }
    } catch (error) {
      toast.error('check2FAAuth failed');
    } finally {
      setLoading2FA(false);
    }
  }

  const handleUpdateDeviceSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!deviceIMEI) {
      toast.error('Please enter Device IMEI / Serial Number');
      return;
    }

    const outletId = verificationData?.mid || user?.mid;
    if (!outletId) {
      toast.error('Merchant Outlet ID not found');
      return;
    }

    try {
      setDeviceModalLoading(true);
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/change-device', {
        outletId: outletId,
        deviceName: device,
        deviceIMEI: deviceIMEI,
        mposSerialNumber: mposSerialNumber || ''
      });

      if (response.data.status === 1) {
        toast.success(response.data.message || 'Device information updated successfully');
        setShowDeviceModal(false);
        setVerificationData(prev => ({
          ...prev,
          deviceIMEI: deviceIMEI,
          deviceName: device,
          mposSerialNumber: mposSerialNumber
        }));
        setDeviceIMEI(deviceIMEI);
        checkstatus();
      } else {
        toast.error(response.data.message || 'Failed to update device information');
      }
    } catch (error) {
      console.error('Update device error:', error);
      toast.error(error.response?.data?.message || 'Error updating device information');
    } finally {
      setDeviceModalLoading(false);
    }
  };

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    if (mode === 'CW' || mode === 'M') {
      setMobile('');
      setAadharNo('');
      setBankIin('');
      setAmount('');
      setBiometricData(null);
    }
  };

  useEffect(() => {
    if (selectedMode === 'M' && aepsDraft?.ap_status === 0) {
      setShowBiometricEkycModal(false);
      setShowTwoFAModal(true);
    }
  }, [selectedMode, aepsDraft]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      checkstatus();
      getBankList();
      fetchPrimaryAccount();
    }
  }, []);

  // Verification methods
  const sendMobileOtp = async () => {
    if (!verificationForm.mobile) {
      toast.error('Please enter mobile number');
      return;
    }

    try {
      setVerificationLoading(true);
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/send-mobile-otp', {
        mobile: verificationForm.mobile,
        pan_no: verificationData.pan_no
      });

      if (response.data.status === 1) {
        toast.success('OTP sent to mobile number');
        setOtpReferenceData(response.data);
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setVerificationLoading(false);
    }
  };

  const verifyMobileOtp = async () => {
    if (!verificationForm.otp) {
      toast.error('Please enter OTP');
      return;
    }

    try {
      setVerificationLoading(true);
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/verify-mobile-otp', {
        mobile: verificationForm.mobile,
        otp: verificationForm.otp,
        pan_no: verificationData.pan_no
      });

      if (response.data.status === 1) {
        toast.success('Mobile number verified successfully');
        moveToNextVerification();
      } else {
        toast.error(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setVerificationLoading(false);
    }
  };

  const sendEmailOtp = async () => {
    if (!verificationForm.email) {
      toast.error('Please enter email address');
      return;
    }

    try {
      setVerificationLoading(true);
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/send-email-otp', {
        email: verificationForm.email,
        pan_no: verificationData.pan_no
      });

      if (response.data.status === 1) {
        toast.success('OTP sent to email address');
        setOtpReferenceData(response.data);
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setVerificationLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    if (!verificationForm.otp) {
      toast.error('Please enter OTP');
      return;
    }

    try {
      setVerificationLoading(true);
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/verify-email-otp', {
        email: verificationForm.email,
        otp: verificationForm.otp,
        pan_no: verificationData.pan_no
      });

      if (response.data.status === 1) {
        toast.success('Email verified successfully');
        moveToNextVerification();
      } else {
        toast.error(response.data.message || 'Email verification failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Email verification failed');
    } finally {
      setVerificationLoading(false);
    }
  };

  const sendAadhaarOtp = async () => {
    if (!verificationForm.aadhaar) {
      toast.error('Please enter Aadhaar number');
      return;
    }

    try {
      setVerificationLoading(true);
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/send-aadhaar-otp', {
        aadhaar: verificationForm.aadhaar,
        pan_no: verificationData.pan_no
      });

      if (response.data.status === 1) {
        toast.success('OTP sent for Aadhaar verification');
        setOtpReferenceData(response.data);
      } else {
        toast.error(response.data.message || 'Failed to send Aadhaar OTP');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send Aadhaar OTP');
    } finally {
      setVerificationLoading(false);
    }
  };

  const verifyAadhaarOtp = async () => {
    if (!verificationForm.otp) {
      toast.error('Please enter OTP');
      return;
    }

    try {
      setVerificationLoading(true);
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/verify-aadhaar-otp', {
        txnid: otpReferenceData.txnid,
        otp: verificationForm.otp,
        pan_no: verificationData.pan_no
      });

      if (response.data.status === 1) {
        toast.success('Aadhaar verified successfully');
        moveToNextVerification();
      } else {
        toast.error(response.data.message || 'Aadhaar verification failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Aadhaar verification failed');
    } finally {
      setVerificationLoading(false);
    }
  };

  const verifyPan = async () => {
    if (!verificationForm.pan) {
      toast.error('Please enter PAN number');
      return;
    }

    try {
      setVerificationLoading(true);
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/verify-pan', {
        pan: verificationForm.pan,
        pan_no: verificationData.pan_no
      });

      if (response.data.status === 1) {
        toast.success('PAN verified successfully');
        moveToNextVerification();
      } else {
        toast.error(response.data.message || 'PAN verification failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'PAN verification failed');
    } finally {
      setVerificationLoading(false);
    }
  };

  const verifyBankAccount = async () => {
    if (!verificationForm.bankAccount || !verificationForm.ifsc) {
      toast.error('Please enter bank account number and IFSC code');
      return;
    }

    try {
      setVerificationLoading(true);
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/verify-bank-account', {
        account_number: verificationForm.bankAccount,
        ifsc: verificationForm.ifsc,
        pan_no: verificationData.pan_no
      });

      if (response.data.status === 1) {
        toast.success('Bank account verified successfully');
        moveToNextVerification();
      } else {
        toast.error(response.data.message || 'Bank account verification failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bank account verification failed');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleOnboarding = async () => {
    if (!verificationData) {
      toast.error('Verification data not available');
      return;
    }

    try {
      setOnboardingLoading(true);
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/onboard', {
        aeps_draft_id: verificationData.id,
        pan_no: verificationData.pan_no
      });

      if (response.data.status === 1) {
        toast.success('Onboarding completed successfully');
        setShowOnboardingModal(false);
        // Show e-KYC OTP modal
        setShowEkycOtpModal(true);
      } else {
        toast.error(response.data.message || 'Onboarding failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Onboarding failed');
    } finally {
      setOnboardingLoading(false);
    }
  };

  const getEkycOtp = async () => {
    if (!verificationData) {
      toast.error('Verification data not available');
      return;
    }

    try {
      setEkycOtpLoading(true);
      const apiService = ApiService();

      // Get current location
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by this browser');
        return;
      }

      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const response = await apiService.vPost('/api/v2/aeps/get-otp', {
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
            deviceIMEI: deviceIMEI, //set posted device IMEI
            pan_no: verificationData.pan_no
          });

          if (response.data.status === 1) {
            toast.success('OTP sent successfully');
            setEkycOtpData(response.data);
            //console.log('ekycOtpData is null:', response.data);
          } else {
            toast.error(response.data.message || 'Failed to send OTP');
          }
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
          setEkycOtpLoading(false);
        }
      }, (error) => {
        toast.error('Failed to get location: ' + error.message);
        setEkycOtpLoading(false);
      });
    } catch (error) {
      toast.error('Failed to get location');
      setEkycOtpLoading(false);
    }
  };

  const verifyEkycOtp = async () => {
    if (!ekycOtp) {
      toast.error('Please enter OTP');
      return;
    }

    if (!ekycOtpData) {

      console.log('ekycOtpData is null:', ekycOtpData);
      toast.error('OTP data not available');
      return;
    }

    try {
      setEkycOtpLoading(true);
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/verify-otp', {
        deviceIMEI: deviceIMEI, //set posted device IMEI 
        pan_no: verificationData.pan_no,
        otp: ekycOtp,
        primaryKeyId: ekycOtpData.data.data.primaryKeyId.toString(),
        encodeFPTxnId: ekycOtpData.data.data.encodeFPTxnId
      });

      checkstatus();

      if (response.data.status === 1) {
        toast.success('e-KYC OTP verified successfully');
        setShowEkycOtpModal(false);
        setShowBiometricEkycModal(true);
      } else {
        toast.error(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setEkycOtpLoading(false);
    }
  };


  const parseBiometricData = async (xml) => {

    const parsedXml = await parseStringPromise(xml, { explicitArray: false });
    // Optionally remove unwanted characters (if needed):
    const jsonStrClean = JSON.stringify(parsedXml).replace(/[@?#]/g, '');
    const parsedData = JSON.parse(jsonStrClean);

    const resp = {
      errCode: parseInt(parsedData?.PidData?.Resp?.$?.errCode) || "",
      errInfo: (parsedData?.PidData?.Resp?.$?.errInfo) || "",
      fCount: parseInt(parsedData?.PidData?.Resp?.$?.fCount) || "",
      fType: parseInt(parsedData?.PidData?.Resp?.$?.fType) || "",
      iCount: 0,
      iType: null,
      pCount: 0,
      pType: 0,
      nmPoints: parseInt(parsedData?.PidData?.Resp?.$?.nmPoints) || "",
      qScore: parseInt(parsedData?.PidData?.Resp?.$?.qScore) || "",
      dpID: (parsedData?.PidData?.DeviceInfo?.$?.dpId) || "",
      rdsID: (parsedData?.PidData?.DeviceInfo?.$?.rdsId) || "",
      rdsVer: (parsedData?.PidData?.DeviceInfo?.$?.rdsVer) || "",
      dc: (parsedData?.PidData?.DeviceInfo?.$?.dc) || "",
      mi: (parsedData?.PidData?.DeviceInfo?.$?.mi) || "",
      mc: (parsedData?.PidData?.DeviceInfo?.$?.mc) || "",
      ci: (parsedData?.PidData?.Skey?.$?.ci) || "",
      sessionKey: (parsedData?.PidData?.Skey?._) || "",
      hmac: (typeof parsedData?.PidData?.Hmac === 'string'
        ? parsedData.PidData.Hmac
        : (parsedData?.PidData?.Hmac?._ || "")),
      PidDatatype: (parsedData?.PidData?.Data?.$?.type) || "",
      Piddata: (parsedData?.PidData?.Data?._) || ""
    };

    return resp;

  }

  const handleBiometricEkyc = async () => {
    if (!biometricData) {
      toast.error('Please capture fingerprint first');
      return;
    }

    try {
      setBiometricEkycLoading(true);

      const parsedData = await parseBiometricData(biometricData);

      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/biometric-ekyc', {
        pan_no: verificationData.pan_no,
        xml: biometricData,
        deviceType: device,
        deviceIMEI: deviceIMEI || verificationData?.deviceIMEI,
        primaryKeyId: verificationData.primaryKeyId,
        encodeFPTxnId: verificationData.encodeFPTxnId
      });

      if (response.data.status === 1) {
        toast.success('Biometric e-KYC completed successfully');
        setShowBiometricEkycModal(false);
        // Refresh status to check if 2FA is now required
        checkstatus();
      } else {
        setBiometricData(false);
        toast.error(response.data.message || 'Biometric e-KYC failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Biometric e-KYC failed');
    } finally {
      setBiometricEkycLoading(false);
    }
  };

  const moveToNextVerification = async () => {
    // Reset form fields
    setVerificationForm(prev => ({ ...prev, otp: '' }));
    setOtpReferenceData(null);

    // Refresh verification data to check current status
    try {
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/draft-data', { outletId: user?.mid });

      if (response.data.status === 1) {
        const data = response.data.data;
        setVerificationData(data);

        // Re-populate verification form with existing data from draft
        setVerificationForm(prev => ({
          ...prev,
          mobile: data.phone || '',
          email: data.email || '',
          aadhaar: data.aadhaar_number || '',
          pan: data.pan_no || '',
          bankAccount: data.account_number || '',
          ifsc: data.ifsc_code || '',
          otp: '' // Keep OTP empty for new verification
        }));

        // Check next verification step based on current status - PAN first
        if (data.pan_verified_at === 0) {
          setCurrentVerificationStep('pan');
        } else if (data.phone_verified_at === 0) {
          setCurrentVerificationStep('mobile');
        } else if (data.email_verified_at === 0) {
          setCurrentVerificationStep('email');
        } else if (data.aadhaar_verified_at === 0) {
          setCurrentVerificationStep('aadhaar');
        } else if (data.bank_verified_at === 0) {
          setCurrentVerificationStep('bank');
        } else {
          // All verifications complete, close modal and proceed
          setShowVerificationModal(false);
          setCurrentVerificationStep('');
          toast.success('All verifications completed successfully!');

          // Check if ready for onboarding or AEPS
          if (data.aeps_status === 0) {
            // Show onboarding modal
            setShowOnboardingModal(true);
          } else if (data.aeps_status === 1) {
            setAadharNo(data.aadhaar_number || '');
            setShowOtpModal(true);
          } else if (data.aeps_status === 2) {
            setShowBiometricEkycModal(true);
          } else if (data.aeps_status === 3) {
            // Show 2FA modal for additional authentication
            setAadharNo(data.aadhaar_number || '');
            setShowTwoFAModal(true);
          }
        }
      }
    } catch (error) {
      console.error('Failed to refresh verification status:', error);
      toast.error('Failed to check verification status');
    }
  };

  const handleVerificationFormChange = (field, value) => {
    setVerificationForm(prev => ({ ...prev, [field]: value }));
  };

  const closeVerificationModal = () => {
    setShowVerificationModal(false);
    setCurrentVerificationStep('');
    setVerificationForm({
      mobile: '',
      email: '',
      aadhaar: '',
      pan: '',
      bankAccount: '',
      ifsc: '',
      otp: ''
    });
    setOtpReferenceData(null);
  };

  const closeOnboardingModal = () => {
    setShowOnboardingModal(false);
  };

  const closeEkycOtpModal = () => {
    setShowEkycOtpModal(false);
    setEkycOtp('');
    setEkycOtpData(null);
  };

  const closeBiometricEkycModal = () => {
    setShowBiometricEkycModal(false);
    setBiometricData(null);
  };

  // const handleTwoFAModal = () => {
  //   setShowTwoFAModal(false);
  //   setBiometricData(null);
  // };

  const handleTwoFAModal = async (xmlData = null) => {
    const dataToSend = typeof xmlData === 'string' ? xmlData : biometricData;

    if (!dataToSend) {
      toast.error('Please capture fingerprint first');
      return;
    }

    try {
      setBiometricEkycLoading(true);

      const parsedData = await parseBiometricData(dataToSend);

      // Determine serviceType: AP for Aadhaar Pay, AEPS for others (CW, MS, BE)
      const serviceType = selectedMode === 'M' ? 'AP' : 'AEPS';

      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/2fa', {
        pan_no: verificationData.pan_no,
        xml: dataToSend,
        deviceType: device,
        deviceIMEI: deviceIMEI || verificationData?.deviceIMEI,
        primaryKeyId: verificationData.primaryKeyId,
        encodeFPTxnId: verificationData.encodeFPTxnId,
        serviceType: serviceType
      });

      if (response.data.status === 1) {
        toast.success('2FA completed successfully');
        setShowTwoFAModal(false);
        // Refresh status to check if 2FA is now required
        checkstatus();
      } else {
        setBiometricData(false);
        toast.error(response.data.message || 'Biometric e-KYC failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Biometric e-KYC failed');
    } finally {
      setBiometricEkycLoading(false);
    }
  };

  const closeAll = () => {
    redirect('/dashboard');
  };

  const handleOtpVerification = async () => {
    if (!otp) {
      toast.error('Please enter OTP');
      return;
    }

    try {
      const apiService = ApiService();
      const response = await apiService.vPost('/otpValidate', {
        aadharNo: aadharNo,
        otp: otp
      });


      if (response.data.status === true) {
        toast.success('OTP verified successfully');

        // Store the new outlet ID from the response
        // const { token, merchantData } = retrieveTokenAndUserData() || {};
        // const { mid, mkey, outletId } = merchantData || {};

        // if (response.data.outletId) {
        //   storeTokenAndUserData({
        //     mid: mid,
        //     mkey: mkey,
        //     outletId: response.data.outletId || outletId || "",
        //     token: token
        //   });
        // }

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

  const checkDeviceService = () => {
    return device === 'Mantra' ? 'Mantra RD Service' : 'Morpho RD Service';
  };

  // Validate form before capture
  const validateBeforeCapture = () => {
    const requiredFields = {
      mobile: mobile,
      aadharNo: aadharNo,
      bankIin: bankIin
    };

    // For AP and CW modes, amount is also required
    if (selectedMode === 'AP' || selectedMode === 'CW') {
      requiredFields.amount = amount;
    }

    // Check each required field
    const missingFields = [];

    if (!requiredFields.mobile || !/^[0-9]{10}$/.test(requiredFields.mobile)) {
      missingFields.push('Mobile Number (10 digits)');
    }

    if (!requiredFields.aadharNo || !/^[0-9]{12}$/.test(requiredFields.aadharNo)) {
      missingFields.push('Aadhaar Number (12 digits)');
    }

    if (!requiredFields.bankIin || requiredFields.bankIin === '0') {
      missingFields.push('Bank');
    }

    // For AP and CW, check amount
    if ((selectedMode === 'AP' || selectedMode === 'CW')) {
      if (!requiredFields.amount || parseFloat(requiredFields.amount) <= 0) {
        missingFields.push('Amount');
      }
    }

    if (missingFields.length > 0) {
      const fieldsList = missingFields.join(', ');
      toast.error(`Please fill the following required fields: ${fieldsList}`);
      return false;
    }

    return true;
  };

  const handleSendAepsOtp = async () => {
    if (!validateBeforeCapture()) {
      return false;
    }
    try {
      setSendAepsOtpLoading(true);
      const apiService = ApiService();
      const response = await apiService.vPost('/api/v2/aeps/send-aeps-otp', {
        outletId: verificationData.mid,
        aadhaarNumber: aadharNo,
        aepsType: selectedMode,
        bankID: bankIin,
        customerMobile: mobile,
        amount: amount,
        deviceIMEI: deviceIMEI
      });

      if (response.data && response.data.status === 1) {
        toast.success(response.data.message || 'Aadhaar OTP sent successfully');
        const fpTxnId = response.data?.fpTransactionId
          || response.data?.txnOtpRequestId
          || response.data?.data?.fpTransactionId
          || response.data?.data?.data?.fpTransactionId;
        if (fpTxnId) {
          setTxnOtpRequestId(fpTxnId);
        }
        setShowAepsOtpModal(true);
        return true;
      } else {
        toast.error(response.data?.message || 'Failed to send OTP');
        setTxnOtpRequestId(null);
        setAepsOtp('');
        return false;
      }
    } catch (error) {
      console.error('Send OTP failed:', error);
      toast.error(error.response?.data?.message || 'Failed to send OTP');
      setTxnOtpRequestId(null);
      setAepsOtp('');
      return false;
    } finally {
      setSendAepsOtpLoading(false);
    }
  };

  const handleCapture = async (type = null) => {
    // Validate form before capturing
    if (type !== '2fa') {
      if (!validateBeforeCapture()) {
        return;
      }

      // Check if amount > 5000 for CW or M, enforce OTP generation and entry before capture
      if ((selectedMode === 'CW' || selectedMode === 'M') && parseFloat(amount) > 5000) {
        if (!txnOtpRequestId) {
          await handleSendAepsOtp();
          return;
        }
        if (!aepsOtp) {
          toast.error('Please enter the Aadhaar OTP before capturing fingerprint');
          setShowAepsOtpModal(true);
          return;
        }
      }
    }


    try {
      setLoading(true);
      const serviceName = checkDeviceService();

      // Discover the device
      const discoveryData = await discoverBiometricDevice(device.toLowerCase());
      if (!discoveryData.methodUrl) {
        throw new Error(`${serviceName} not found. Please check if the service is installed and running.`);
      }

      // Capture fingerprint with OTP passed to RD service
      const isMantra = device.toLowerCase() === 'mantra';
      const captureData = await captureFingerprint(discoveryData.methodUrl, isMantra, aepsOtp || '');
      if (!captureData.success) {
        throw new Error(captureData.error || 'Failed to capture fingerprint');
      }

      setBiometricData(captureData.data);
      toast.success('Fingerprint captured successfully');

      if (showTwoFAModal) {
        await handleTwoFAModal(captureData.data);
      } else {
        // Auto-submit the form after successful capture for all transaction types
        setTimeout(() => {
          if (submitButtonRef.current) {
            submitButtonRef.current.click();
          }
        }, 500); // Small delay to ensure state is updated
      }

    } catch (error) {
      const errorMessage = error.message.includes('Failed to fetch')
        ? `${checkDeviceService()} is not running. Please ensure:\n1. The service is installed\n2. Service is running in system tray\n3. Try restarting the service`
        : error.message;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCapture1 = async () => {
    try {
      setLoading(true);
      const serviceName = checkDeviceService();

      // Discover the device
      const discoveryData = await discoverBiometricDevice(device.toLowerCase());
      if (!discoveryData.methodUrl) {
        throw new Error(`${serviceName} not found. Please check if the service is installed and running.`);
      }

      // Capture fingerprint
      const captureData = await captureFingerprint1(discoveryData.methodUrl);
      if (!captureData.success) {
        throw new Error(captureData.error || 'Failed to capture fingerprint');
      }

      setBiometricData(captureData.data);
      toast.success('Fingerprint captured successfully');

      if (showTwoFAModal) {
        await handleTwoFAModal(captureData.data);
      }

    } catch (error) {
      const errorMessage = error.message.includes('Failed to fetch')
        ? `${checkDeviceService()} is not running. Please ensure:\n1. The service is installed\n2. Service is running in system tray\n3. Try restarting the service`
        : error.message;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'mobile':
        if (!value) {
          error = 'Mobile number is required';
        } else if (!/^[0-9]{10}$/.test(value)) {
          error = 'Enter valid 10-digit mobile number';
        }
        break;
      case 'aadharNo':
        if (!value) {
          error = 'Aadhaar number is required';
        } else if (!/^[0-9]{12}$/.test(value)) {
          error = 'Enter valid 12-digit Aadhaar number';
        }
        break;
      case 'amount':
        if ((selectedMode === 'CW' || selectedMode === 'M')) {
          if (!value) {
            error = 'Amount is required';
          } else if (parseFloat(value) <= 0) {
            error = 'Amount must be greater than 0';
          }
        }
        break;
      case 'bankIin':
        if (!value) {
          error = 'Please select a bank';
        }
        break;

      default:
        break;
    }
    return error;
  };

  const handleFieldChange = (name, value) => {
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));

    // Reset OTP requirement if key fields change
    if (['amount', 'mobile', 'aadharNo'].includes(name)) {
      setTxnOtpRequestId(null);
      setAepsOtp('');
    }

    switch (name) {
      case 'mobile':
        setMobile(value);
        break;
      case 'aadharNo':
        setAadharNo(value);
        break;
      case 'amount':
        setAmount(value);
        break;
      case 'bankIin':
        setBankIin(value);
        if (value && value !== '0') {
          const selectedBank = banks.find(b => b.iinno === value);
          if (selectedBank) {
            addToFavorites(selectedBank);
          }
        }
        break;
      case 'deviceIMEI':
        setDeviceIMEI(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {
      mobile: validateField('mobile', mobile),
      aadharNo: validateField('aadharNo', aadharNo),
      bankIin: validateField('bankIin', bankIin),
      amount: validateField('amount', amount),
      deviceIMEI: validateField('deviceIMEI', deviceIMEI),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error !== '')) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    if ((selectedMode === 'CW' || selectedMode === 'M') && !amount) {
      toast.error('Please enter amount');
      return;
    }

    if ((selectedMode === 'CW' || selectedMode === 'M') && parseFloat(amount) > 5000 && !aepsOtp) {
      toast.error('Aadhaar OTP is required for transactions above ₹5,000');
      setShowAepsOtpModal(true);
      return;
    }

    if (!biometricData) {
      toast.error('Please capture fingerprint');
      return;
    }

    try {
      setLoading(true);

      const parsedData = await parseBiometricData(biometricData);
      const apiService = ApiService();

      // Find the selected bank's name from the banks array
      const selectedBank = banks.find(bank => bank.iinno === bankIin);
      const bankName = selectedBank ? selectedBank.bankName : '';

      const response = await apiService.vPost('/api/v2/aeps/doAeps', {
        outletId: verificationData.mid,
        aadhaarNumber: aadharNo,
        aepsType: selectedMode,
        bankID: bankIin,
        bankName: bankName,
        deviceType: device,
        customerMobile: mobile,
        amount: (selectedMode === 'CW' || selectedMode === 'M') ? amount : "",
        xml: biometricData,
        deviceIMEI: deviceIMEI,
        otp: aepsOtp,
        txnOtpRequestId: txnOtpRequestId
      });

      if (response.data.status === 1) {
        toast.success('Transaction successful');

        // Create state data object first
        const agentName = response?.data?.shop_name || response?.data?.data?.shop_name || response?.data.data?.data?.shop_name || "";
        const agentMobile = response?.data?.shop_phone || response?.data?.data?.shop_phone || response?.data.data?.data?.shop_phone || "";

        const receiptData = {
          state: {
            transactionData: response.data.data,
            transactionType: selectedMode,
            aadhaarNumber: aadharNo,
            bankName: bankName,
            bankIin: bankIin,
            customerMobile: mobile,
            agentName: agentName,
            agentMobile: agentMobile,
            logo: response.data.logo || '',
            message: response.data.message || '',
          }
        };
        // Reset form data before navigation
        setMobile('');
        setAadharNo('');
        setAmount('');
        setBankIin('');
        setBiometricData(null);
        setAepsOtp('');
        setTxnOtpRequestId(null);

        // Navigate after state reset
        setTimeout(() => {
          redirect('/aeps-receipt', receiptData);
        }, 100);

      } else {
        toast.error(response.data.message || 'Transaction failed');

        // Create state data object first
        const receiptData = {
          state: {
            transactionData: response.data.data,
            transactionType: selectedMode,
            aadhaarNumber: aadharNo,
            bankName: bankName,
            bankIin: bankIin,
            customerMobile: mobile,
            agentName: response?.data?.shop_name || "",
            agentMobile: response?.data?.shop_phone || "",
            logo: response.data.logo || '',
            message: response.data.message || '',
          }
        };

        // Navigate after state reset
        setTimeout(() => {
          redirect('/aeps-receipt', receiptData);
        }, 100);


      }
    } catch (error) {
      console.error('Transaction failed:', error);
      toast.error(error.response?.data?.message || 'Transaction failed');

      // Find the selected bank's name
      const selectedBank = banks.find(bank => bank.iinno === bankIin);
      const bankName = selectedBank ? selectedBank.bankName : 'N/A';

      // Create mock transaction data with N/A values for failed transactions
      const mockTransactionData = {
        transactionStatus: 'failed',
        transactionType: selectedMode,
        transactionAmount: (selectedMode === 'CW' || selectedMode === 'M') ? amount : 'N/A',
        fpTransactionId: 'N/A',
        merchantTxnId: 'N/A',
        requestTransactionTime: new Date().toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).replace(',', ''),
        customerName: 'N/A',
        bankName: bankName,
        balanceAmount: 'N/A',
        stan: 'N/A',
        terminalId: 'N/A',
        bankRRN: 'N/A'
      };

      // Create state data object first
      const receiptData = {
        state: {
          transactionData: mockTransactionData,
          transactionType: selectedMode,
          aadhaarNumber: aadharNo,
          bankName: bankName,
          customerMobile: mobile,
          logo: error.response?.data?.logo || '',
          message: error.response?.data?.message || '',
        }
      };

      // Navigate after state reset
      setTimeout(() => {
        redirect('/aeps-receipt', receiptData);
      }, 100);

    } finally {
      setLoading(false);
    }
  };


  const isAnyLoading = loading || loading2FA || onboardingLoading || ekycOtpLoading || biometricEkycLoading || verificationLoading;

  let loadingText = "Processing Transaction...";

  if (loading) {
    if (selectedMode === 'CW') loadingText = "Processing Cash Withdrawal...";
    else if (selectedMode === 'MS') loadingText = "Fetching Mini Statement...";
    else if (selectedMode === 'BE') loadingText = "Checking Balance...";
    else if (selectedMode === 'M') loadingText = "Processing Aadhaar Pay...";
  }

  if (loading2FA) loadingText = "2FA Verification...";
  if (onboardingLoading) loadingText = "Onboarding in progress...";
  if (ekycOtpLoading) loadingText = "Verifying OTP...";
  if (biometricEkycLoading) loadingText = "Processing Biometric Data...";
  if (verificationLoading) loadingText = "Verifying details...";

  return (
    <div className="" style={{ position: 'relative' }}>
      <LoadingOverlay
        visible={isAnyLoading}
        title={loadingText}
        subtitle="Please wait while we process your request securely..."
      />


      <div className="card" style={styles.container}>
        <div className='card-header' style={styles.header}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-1">
              <div style={{
                backgroundColor: '#f5f3ff',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6c5ce7'
              }}>
                <i className="bi bi-shield-check fs-5"></i>
              </div>
              <div>
                <h5 className="mb-0">AEPS Transaction</h5>
                <small className="text-muted">Secured by NPCI Guidelines</small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">

              {primaryAccount && (
                <div style={styles.primaryAccountCard}>
                  <div className="d-flex align-items-center gap-3">
                    <div style={{
                      width: '30px',
                      height: '30px',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px'
                    }}>
                      <i className="fa fa-wallet"></i>
                    </div>
                    <div>
                      <div style={styles.balanceLabel}>Primary Balance</div>
                      <div style={styles.balanceAmount}>
                        {showPrimaryBalance ? primaryAccount.balance : 'XXXX.XX'}
                        <button
                          style={styles.toggleBtn}
                          onClick={() => setShowPrimaryBalance(!showPrimaryBalance)}
                          type="button"
                        >
                          <i className={`fa fa-eye${showPrimaryBalance ? '-slash' : ''}`} style={{ fontSize: '12px' }}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}



              {/*  device number update button show here */}
              <button
                onClick={() => setShowDeviceModal(true)}
                style={{
                  background: '#e8f4ff',
                  border: '1px dashed #6c5ce7',
                  color: '#6c5ce7',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="Update your device"
              >
                <i className="bi bi-phone-vibrate"></i>
                <span>Update Device</span>
              </button>





              {/* <span onClick={() => handleLogout()} style={{ */}
              <Link to="/aeps-history" style={{
                backgroundColor: '#6c5ce7',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500'
              }}>AEPS History</Link>
              <img
                src={npciLogo}
                alt="NPCI Logo"
                style={{ height: '40px', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>

        <div className='card-body'>

          <div className="d-flex justify-content-around flex-wrap" style={{ marginBottom: '10px' }}>
            <button
              type="button"
              style={{
                ...styles.modeButton,
                ...(selectedMode === 'CW' && styles.modeButtonActive)
              }}
              onClick={() => handleModeChange('CW')}
            >
              <i className="bi bi-cash me-2"></i>
              Cash Withdrawal
            </button>

            <button
              type="button"
              style={{
                ...styles.modeButton,
                ...(selectedMode === 'MS' && styles.modeButtonActive)
              }}
              onClick={() => handleModeChange('MS')}
            >
              <i className="bi bi-receipt me-2"></i>
              Mini Statement
            </button>

            <button
              type="button"
              style={{
                ...styles.modeButton,
                ...(selectedMode === 'BE' && styles.modeButtonActive)
              }}
              onClick={() => handleModeChange('BE')}
            >
              <i className="bi bi-wallet2 me-2"></i>
              Balance Enquiry
            </button>

            <button
              type="button"
              style={{
                ...styles.modeButton,
                ...(selectedMode === 'M' && styles.modeButtonActive)
              }}
              onClick={() => handleModeChange('M')}
            >
              <i className="bi bi-person-badge me-2"></i>
              Aadhaar Pay
            </button>
          </div>
          <form onSubmit={handleSubmit} className='mt-3 card p-3'>

            <div className="row">


              <div className="col-md-6">
                <h6 style={styles.sectionTitle}>Enter Aadhar Number</h6>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: errors.aadharNo ? '1px solid #dc3545' : '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                  }}
                  value={aadharNo}
                  onChange={(e) => handleFieldChange('aadharNo', e.target.value)}
                  placeholder="Enter Aadhaar number"
                  maxLength="12"
                />
                {errors.aadharNo && <div style={styles.error}>{errors.aadharNo}</div>}
              </div>

              <div className="col-md-6">
                <div style={styles.formSection}>
                  <h6 style={styles.sectionTitle}>Enter Customer Mobile Number</h6>
                  <div style={styles.inputGroup}>
                    <span style={{
                      position: 'absolute',
                      left: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#666',
                      fontSize: '14px',
                      pointerEvents: 'none'
                    }}>+91-</span>
                    <input
                      type="tel"
                      style={{
                        ...styles.input,
                        paddingLeft: '40px',
                        width: '100%',
                        padding: '8px 12px',
                        border: errors.mobile ? '1px solid #dc3545' : '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: 'white',
                      }}
                      value={mobile}
                      onChange={(e) => handleFieldChange('mobile', e.target.value)}
                      placeholder="Enter mobile number"
                      maxLength="10"
                    />
                  </div>
                  {errors.mobile && <div style={styles.error}>{errors.mobile}</div>}
                </div>
              </div>


            </div>

            {(selectedMode === 'CW' || selectedMode === 'M') && (
              <div style={styles.formSection}>
                <h6 style={styles.sectionTitle}>Enter amount you like to withdraw or select from fast cash</h6>
                <div className="row align-items-center">
                  <div className="col-md-4">
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute',
                        left: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#666',
                        fontSize: '14px'
                      }}>₹</span>
                      <input
                        type="number"
                        style={{
                          width: '100%',
                          padding: '8px 12px 8px 25px',
                          border: errors.amount ? '1px solid #dc3545' : '1px solid #ddd',
                          borderRadius: '4px',
                          backgroundColor: 'white',
                        }}
                        value={amount}
                        onChange={(e) => handleFieldChange('amount', e.target.value)}
                        placeholder="Enter amount"
                      />
                    </div>
                    {errors.amount && <div style={styles.error}>{errors.amount}</div>}
                  </div>
                  <div className="col-md-8">
                    <div className="d-flex flex-wrap">
                      {[500, 1000, 2000, 3000, 5000, 10000].map((value) => (
                        <button
                          key={value}
                          type="button"
                          style={{
                            ...styles.fastCashButton,
                            ...(amount === value.toString() && styles.fastCashButtonActive)
                          }}
                          onClick={() => handleFieldChange('amount', value.toString())}
                        >
                          ₹{value}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}



            <div className="col-md-12">

              <div className="row">

                <div className="col-md-12">
                  {favoriteBanks.length > 0 && (
                    <div className="mb-1">
                      <label style={styles.label}>Favorite Banks</label>
                      <div className="d-flex flex-wrap">
                        {favoriteBanks.map((bank) => (
                          <button
                            key={bank.iinno}
                            type="button"
                            style={{
                              ...styles.quickBankBtn,
                              ...(bankIin === bank.iinno && styles.quickBankBtnActive),
                              position: 'relative',
                              paddingRight: '20px'
                            }}
                            onClick={() => handleFieldChange('bankIin', bank.iinno)}
                          >
                            {bank.bankName}
                            <i
                              className="bi bi-x-circle-fill"
                              style={{
                                position: 'absolute',
                                right: '2px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#dc3545',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromFavorites(bank.iinno);
                              }}
                            ></i>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label style={styles.label}>Other Banks</label>
                  <select
                    style={{
                      ...styles.input,
                      ...(errors.bankIin && styles.inputError)
                    }}
                    name="bankIin"
                    value={bankIin}
                    onChange={(e) => handleFieldChange('bankIin', e.target.value)}
                    className="shadow-sm"
                  >
                    <option value="0">Select Bank</option>
                    {banks.map((b) => (
                      <option key={b.iinno} value={b.iinno}>
                        {b.bankName}
                      </option>
                    ))}
                  </select>
                  {errors.bankIin && <div style={styles.error}>{errors.bankIin}</div>}
                </div>

              </div>
            </div>




            <div className="col-md-12 mt-3">
              <div style={styles.formGroup}>
                <label style={styles.label}>Biometric Device</label>

                <div className="row" >
                  <div className="col-md-2">
                    <div
                      style={{
                        ...styles.deviceOption,
                        ...(device === 'Mantra' && styles.deviceOptionActive),
                        width: '100%'
                      }}
                      onClick={() => setDevice('Mantra')}
                    >
                      <span style={styles.deviceIcon}>
                        <i className="bi bi-fingerprint"></i>
                      </span>
                      <div>
                        <div style={{ fontWeight: 500 }}>Mantra</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>RD Service</div>
                      </div>
                      <input
                        type="radio"
                        name="device"
                        value="Mantra"
                        checked={device === 'Mantra'}
                        onChange={() => { }}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>

                  <div className="col-md-2">
                    <div
                      style={{
                        ...styles.deviceOption,
                        ...(device === 'Morpho' && styles.deviceOptionActive),
                        width: '100%'
                      }}
                      onClick={() => setDevice('Morpho')}
                    >
                      <span style={styles.deviceIcon}>
                        <i className="bi bi-fingerprint"></i>
                      </span>
                      <div>
                        <div style={{ fontWeight: 500 }}>Morpho</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>RD Service</div>
                      </div>
                      <input
                        type="radio"
                        name="device"
                        value="Morpho"
                        checked={device === 'Morpho'}
                        onChange={() => { }}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>

                  <div className="col-md-2">
                    <div
                      style={{
                        ...styles.deviceOption,
                        ...(device === 'Startek' && styles.deviceOptionActive),
                        width: '100%'
                      }}
                      onClick={() => setDevice('Startek')}
                    >
                      <span style={styles.deviceIcon}>
                        <i className="bi bi-fingerprint"></i>
                      </span>
                      <div>
                        <div style={{ fontWeight: 500 }}>Startek</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>RD Service</div>
                      </div>
                      <input
                        type="radio"
                        name="device"
                        value="Startek"
                        checked={device === 'Startek'}
                        onChange={() => { }}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>

                  <div className="col-md-2">
                    <div
                      style={{
                        ...styles.deviceOption,
                        ...(device === 'SecuGen' && styles.deviceOptionActive),
                        width: '100%'
                      }}
                      onClick={() => setDevice('SecuGen')}
                    >
                      <span style={styles.deviceIcon}>
                        <i className="bi bi-fingerprint"></i>
                      </span>
                      <div>
                        <div style={{ fontWeight: 500 }}>SecuGen</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>RD Service</div>
                      </div>
                      <input
                        type="radio"
                        name="device"
                        value="SecuGen"
                        checked={device === 'SecuGen'}
                        onChange={() => { }}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>

                  <div className="col-md-2">
                    <div
                      style={{
                        ...styles.deviceOption,
                        ...(device === 'Precision' && styles.deviceOptionActive),
                        width: '100%'
                      }}
                      onClick={() => setDevice('Precision')}
                    >
                      <span style={styles.deviceIcon}>
                        <i className="bi bi-fingerprint"></i>
                      </span>
                      <div>
                        <div style={{ fontWeight: 500 }}>Precision</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>RD Service</div>
                      </div>
                      <input
                        type="radio"
                        name="device"
                        value="Precision"
                        checked={device === 'Precision'}
                        onChange={() => { }}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>

                  <div className="col-md-2">
                    <div
                      style={{
                        ...styles.deviceOption,
                        ...(device === 'Evolution' && styles.deviceOptionActive),
                        width: '100%'
                      }}
                      onClick={() => setDevice('Evolution')}
                    >
                      <span style={styles.deviceIcon}>
                        <i className="bi bi-fingerprint"></i>
                      </span>
                      <div>
                        <div style={{ fontWeight: 500 }}>Evolution</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>RD Service</div>
                      </div>
                      <input
                        type="radio"
                        name="device"
                        value="Evolution"
                        checked={device === 'Evolution'}
                        onChange={() => { }}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Device IMEI Input */}
            <div className="col-md-12 mt-3 d-none">
              <div style={styles.formGroup}>
                <label style={styles.label}>Device IMEI Number</label>
                <input
                  type="text"
                  style={{
                    ...styles.input,
                    width: '100%',
                    padding: '10px 12px',
                    border: errors.deviceIMEI ? '1px solid #dc3545' : '1px solid #e0e0e0',
                    borderRadius: '6px',
                    backgroundColor: '#f8f9fa',
                  }}
                  value={deviceIMEI}
                  onChange={(e) => handleFieldChange('deviceIMEI', e.target.value)}
                  placeholder="Enter device IMEI number"
                  maxLength="15"
                />
                {errors.deviceIMEI && <div style={styles.error}>{errors.deviceIMEI}</div>}
                <small className="form-text text-muted">
                  Enter the 15-digit IMEI number of your biometric device
                </small>
              </div>
            </div>




            <div className="col-12 card-footer d-flex justify-content-center mt-3">
              <div className="d-flex gap-3 mt-3">
                <button
                  type="button"
                  style={{
                    ...styles.actionButton,
                    backgroundColor: 'white',
                    border: '2px solid #6c5ce7',
                    color: '#6c5ce7'
                  }}
                  onClick={() => handleCapture()}
                  disabled={loading}
                >
                  {loading ? 'Capturing...' : 'Capture Fingerprint'}
                </button>
                <button
                  ref={submitButtonRef}
                  type="submit"
                  style={styles.actionButton}
                  disabled={loading || !biometricData}
                  className="d-none btn btn-primary"
                >
                  {loading ? 'Processing...' : 'Submit'}
                </button>
              </div>
            </div>
          </form>

          <div className="col-12 mt-4 d-none">
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-info-circle text-primary"></i>
                <strong>NPCI Guidelines</strong>
              </div>
              <ul className="mb-0" style={{ fontSize: '13px', color: '#666' }}>
                <li>Ensure biometric device is NPCI certified and properly connected</li>
                <li>Verify customer's Aadhaar number before proceeding</li>
                <li>Maximum transaction limit as per NPCI guidelines</li>
                <li>Keep customer informed about transaction status</li>
                <li>Follow all security protocols for customer data protection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>





      {/* Verification Modal */}
      <div className={`modal fade ${showVerificationModal ? 'show' : ''}`}
        style={{ display: showVerificationModal ? 'block' : 'none' }}
        tabIndex="-1"
        aria-labelledby="verificationModalLabel"
        aria-hidden={!showVerificationModal}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className='mt-2' >
                {currentVerificationStep === 'mobile' && 'Mobile Number Verification'}
                {currentVerificationStep === 'email' && 'Email Verification'}
                {currentVerificationStep === 'aadhaar' && 'Aadhaar Verification'}
                {currentVerificationStep === 'pan' && 'PAN Verification'}
                {currentVerificationStep === 'bank' && 'Bank Account Verification'}
              </h5>
              <button type="button"
                className="btn-close"
                onClick={closeAll}
                aria-label="Close"></button>
            </div>


            <div className="modal-body">
              {/* Progress Indicator */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="text-muted">Verification Progress</small>
                  <small className="text-muted">
                    Step {
                      currentVerificationStep === 'pan' ? '1' :
                        currentVerificationStep === 'mobile' ? '2' :
                          currentVerificationStep === 'email' ? '3' :
                            currentVerificationStep === 'aadhaar' ? '4' :
                              currentVerificationStep === 'bank' ? '5' : '1'
                    } of 5
                  </small>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div className="progress-bar bg-success" role="progressbar"
                    style={{
                      width: `${currentVerificationStep === 'pan' ? '20' :
                        currentVerificationStep === 'mobile' ? '40' :
                          currentVerificationStep === 'email' ? '60' :
                            currentVerificationStep === 'aadhaar' ? '80' :
                              currentVerificationStep === 'bank' ? '100' : '20'
                        }%`
                    }}>
                  </div>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <small className={`${currentVerificationStep === 'pan' ? 'text-primary fw-bold' : 'text-muted'}`}>PAN</small>
                  <small className={`${currentVerificationStep === 'mobile' ? 'text-primary fw-bold' : 'text-muted'}`}>Mobile</small>
                  <small className={`${currentVerificationStep === 'email' ? 'text-primary fw-bold' : 'text-muted'}`}>Email</small>
                  <small className={`${currentVerificationStep === 'aadhaar' ? 'text-primary fw-bold' : 'text-muted'}`}>Aadhaar</small>
                  <small className={`${currentVerificationStep === 'bank' ? 'text-primary fw-bold' : 'text-muted'}`}>Bank</small>
                </div>
              </div>
              {/* Mobile Verification */}
              {currentVerificationStep === 'mobile' && (
                <div>
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Please verify your mobile number to continue with the AEPS onboarding process.
                  </div>
                  <div className="mb-3">
                    <label htmlFor="mobile" className="form-label">Mobile Number</label>
                    <input type="tel"
                      className="form-control"
                      id="mobile"
                      value={verificationForm.mobile}
                      onChange={(e) => handleVerificationFormChange('mobile', e.target.value)}
                      placeholder="Enter mobile number"
                      maxLength="10" readOnly />
                  </div>
                  {!otpReferenceData ? (
                    <button type="button"
                      className="btn btn-primary"
                      onClick={sendMobileOtp}
                      disabled={verificationLoading || !verificationForm.mobile}>
                      {verificationLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Sending...
                        </>
                      ) : 'Send OTP'}
                    </button>
                  ) : (
                    <div>
                      <div className="alert alert-success">
                        <i className="bi bi-check-circle me-2"></i>
                        OTP sent successfully to {verificationForm.mobile}
                      </div>
                      <div className="mb-3">
                        <label htmlFor="mobileOtp" className="form-label">Enter OTP</label>
                        <input type="text"
                          className="form-control"
                          id="mobileOtp"
                          value={verificationForm.otp}
                          onChange={(e) => handleVerificationFormChange('otp', e.target.value)}
                          placeholder="Enter OTP sent to your mobile"
                          maxLength="6" />
                      </div>
                      <div className="d-flex gap-2">
                        <button type="button"
                          className="btn btn-success"
                          onClick={verifyMobileOtp}
                          disabled={verificationLoading || !verificationForm.otp}>
                          {verificationLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Verifying...
                            </>
                          ) : 'Verify OTP'}
                        </button>
                        <button type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setOtpReferenceData(null);
                            setVerificationForm(prev => ({ ...prev, otp: '' }));
                          }}>
                          Resend OTP
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Email Verification */}
              {currentVerificationStep === 'email' && (
                <div>
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Please verify your email address to continue.
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input type="email"
                      className="form-control"
                      id="email"
                      value={verificationForm.email}
                      onChange={(e) => handleVerificationFormChange('email', e.target.value)}
                      placeholder="Enter email address"
                      readOnly />
                  </div>
                  {!otpReferenceData ? (
                    <button type="button"
                      className="btn btn-primary"
                      onClick={sendEmailOtp}
                      disabled={verificationLoading || !verificationForm.email}>
                      {verificationLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Sending...
                        </>
                      ) : 'Send OTP'}
                    </button>
                  ) : (
                    <div>
                      <div className="alert alert-success">
                        <i className="bi bi-check-circle me-2"></i>
                        OTP sent successfully to {verificationForm.email}
                      </div>
                      <div className="mb-3">
                        <label htmlFor="emailOtp" className="form-label">Enter OTP</label>
                        <input type="text"
                          className="form-control"
                          id="emailOtp"
                          value={verificationForm.otp}
                          onChange={(e) => handleVerificationFormChange('otp', e.target.value)}
                          placeholder="Enter OTP sent to your email"
                          maxLength="6" />
                      </div>
                      <div className="d-flex gap-2">
                        <button type="button"
                          className="btn btn-success"
                          onClick={verifyEmailOtp}
                          disabled={verificationLoading || !verificationForm.otp}>
                          {verificationLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Verifying...
                            </>
                          ) : 'Verify OTP'}
                        </button>
                        <button type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setOtpReferenceData(null);
                            setVerificationForm(prev => ({ ...prev, otp: '' }));
                          }}>
                          Resend OTP
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Aadhaar Verification */}
              {currentVerificationStep === 'aadhaar' && (
                <div>
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Please verify your Aadhaar number for identity verification.
                  </div>
                  <div className="mb-3">
                    <label htmlFor="aadhaar" className="form-label">Aadhaar Number</label>
                    <input type="text"
                      className="form-control"
                      id="aadhaar"
                      value={verificationForm.aadhaar}
                      onChange={(e) => handleVerificationFormChange('aadhaar', e.target.value)}
                      placeholder="Enter 12-digit Aadhaar number"
                      maxLength="12"
                      readOnly />
                    <div className="form-text">
                      Enter your 12-digit Aadhaar number without spaces
                    </div>
                  </div>
                  {!otpReferenceData ? (
                    <button type="button"
                      className="btn btn-primary"
                      onClick={sendAadhaarOtp}
                      disabled={verificationLoading || !verificationForm.aadhaar || verificationForm.aadhaar.length !== 12}>
                      {verificationLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Sending...
                        </>
                      ) : 'Send OTP'}
                    </button>
                  ) : (
                    <div>
                      <div className="alert alert-success">
                        <i className="bi bi-check-circle me-2"></i>
                        OTP sent successfully for Aadhaar verification
                      </div>
                      <div className="mb-3">
                        <label htmlFor="aadhaarOtp" className="form-label">Enter OTP</label>
                        <input type="text"
                          className="form-control"
                          id="aadhaarOtp"
                          value={verificationForm.otp}
                          onChange={(e) => handleVerificationFormChange('otp', e.target.value)}
                          placeholder="Enter OTP sent for Aadhaar verification"
                          maxLength="6" />
                      </div>
                      <div className="d-flex gap-2">
                        <button type="button"
                          className="btn btn-success"
                          onClick={verifyAadhaarOtp}
                          disabled={verificationLoading || !verificationForm.otp}>
                          {verificationLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Verifying...
                            </>
                          ) : 'Verify OTP'}
                        </button>
                        <button type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setOtpReferenceData(null);
                            setVerificationForm(prev => ({ ...prev, otp: '' }));
                          }}>
                          Resend OTP
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PAN Verification */}
              {currentVerificationStep === 'pan' && (
                <div>
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Please verify your PAN number for KYC compliance.
                  </div>
                  <div className="mb-3">
                    <label htmlFor="pan" className="form-label">PAN Number</label>
                    <input type="text"
                      className="form-control"
                      id="pan"
                      value={verificationForm.pan}
                      onChange={(e) => handleVerificationFormChange('pan', e.target.value.toUpperCase())}
                      placeholder="Enter PAN number (e.g., ABCDE1234F)"
                      maxLength="10"
                      style={{ textTransform: 'uppercase' }}
                      readOnly />
                    <div className="form-text">
                      PAN should be in format: ABCDE1234F (5 letters, 4 digits, 1 letter)
                    </div>
                  </div>
                  <button type="button"
                    className="btn btn-success"
                    onClick={verifyPan}
                    disabled={verificationLoading || !verificationForm.pan || verificationForm.pan.length !== 10}>
                    {verificationLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Verifying...
                      </>
                    ) : 'Verify PAN'}
                  </button>
                </div>
              )}

              {/* Bank Account Verification */}
              {currentVerificationStep === 'bank' && (
                <div>
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Please verify your bank account details for settlement purposes.
                  </div>
                  <div className="mb-3">
                    <label htmlFor="bankAccount" className="form-label">Bank Account Number</label>
                    <input type="text"
                      className="form-control"
                      id="bankAccount"
                      value={verificationForm.bankAccount}
                      onChange={(e) => handleVerificationFormChange('bankAccount', e.target.value)}
                      placeholder="Enter bank account number"
                      readOnly />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="ifsc" className="form-label">IFSC Code</label>
                    <input type="text"
                      className="form-control"
                      id="ifsc"
                      value={verificationForm.ifsc}
                      onChange={(e) => handleVerificationFormChange('ifsc', e.target.value.toUpperCase())}
                      placeholder="Enter IFSC code (e.g., SBIN0001234)"
                      maxLength="11"
                      style={{ textTransform: 'uppercase' }}
                      readOnly />
                    <div className="form-text">
                      IFSC code should be 11 characters (e.g., SBIN0001234)
                    </div>
                  </div>
                  <button type="button"
                    className="btn btn-success"
                    onClick={verifyBankAccount}
                    disabled={verificationLoading || !verificationForm.bankAccount || !verificationForm.ifsc}>
                    {verificationLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Verifying...
                      </>
                    ) : 'Verify Bank Account'}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      {/* Verification Modal Backdrop */}
      {showVerificationModal && <div className="modal-backdrop fade show"></div>}

      {/* OTP Verification Modal */}
      <div className={`modal fade ${showOtpModal ? 'show' : ''}`}
        style={{ display: showOtpModal ? 'block' : 'none' }}
        tabIndex="-1"
        aria-labelledby="otpModalLabel"
        aria-hidden={!showOtpModal}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className='mt-2' >OTP Verification</h5>
              <button type="button"
                className="btn-close"
                onClick={closeAll}
                aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="otp" className="form-label">Enter OTP</label>
                <input type="text"
                  className="form-control"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP sent to your mobile" />
              </div>
            </div>
            <div className="modal-footer">

              <button type="button"
                className="btn btn-primary"
                onClick={handleOtpVerification}>Verify OTP</button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal Backdrop */}
      {showOtpModal && <div className="modal-backdrop fade show"></div>}

      {/* Onboarding Modal */}
      <div className={`modal fade ${showOnboardingModal ? 'show' : ''}`}
        style={{ display: showOnboardingModal ? 'block' : 'none' }}
        tabIndex="-1"
        aria-labelledby="onboardingModalLabel"
        aria-hidden={!showOnboardingModal}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className='mt-2' >AEPS Onboarding</h5>
              <button type="button"
                className="btn-close"
                onClick={closeAll}
                aria-label="Close"></button>
            </div>

            <div className="modal-body">
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                All verifications completed successfully. Please proceed with AEPS onboarding.
              </div>

              {verificationData && (
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label"><strong>PAN Number</strong></label>
                      <input type="text" className="form-control" value={verificationData.pan_no || ''} readOnly />
                    </div>
                    <div className="mb-3">
                      <label className="form-label"><strong>Full Name</strong></label>
                      <input type="text" className="form-control" value={verificationData.full_name || ''} readOnly />
                    </div>
                    <div className="mb-3">
                      <label className="form-label"><strong>Mobile Number</strong></label>
                      <input type="text" className="form-control" value={verificationData.phone || ''} readOnly />
                    </div>
                    <div className="mb-3">
                      <label className="form-label"><strong>Email Address</strong></label>
                      <input type="text" className="form-control" value={verificationData.email || ''} readOnly />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label"><strong>Aadhaar Number</strong></label>
                      <input type="text" className="form-control" value={verificationData.aadhaar_number || ''} readOnly />
                    </div>
                    <div className="mb-3">
                      <label className="form-label"><strong>Shop Name</strong></label>
                      <input type="text" className="form-control" value={verificationData.shop_name || ''} readOnly />
                    </div>
                    <div className="mb-3">
                      <label className="form-label"><strong>Shop Address</strong></label>
                      <input type="text" className="form-control" value={verificationData.shop_address || ''} readOnly />
                    </div>
                    <div className="mb-3">
                      <label className="form-label"><strong>Bank Account</strong></label>
                      <input type="text" className="form-control" value={verificationData.account_number || ''} readOnly />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">

              <button type="button"
                className="btn btn-primary"
                onClick={handleOnboarding}
                disabled={onboardingLoading}>
                {onboardingLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Onboarding...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-right me-2"></i>
                    Start Onboarding
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {showOnboardingModal && <div className="modal-backdrop fade show"></div>}

      {/* e-KYC OTP Modal */}
      <div className={`modal fade ${showEkycOtpModal ? 'show' : ''}`}
        style={{ display: showEkycOtpModal ? 'block' : 'none' }}
        tabIndex="-1"
        aria-labelledby="ekycOtpModalLabel"
        aria-hidden={!showEkycOtpModal}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className='mt-2' >e-KYC Verification</h5>
              {/*  device number update button show here */}
              <button
                onClick={() => setShowDeviceModal(true)}
                style={{
                  background: '#e8f4ff',
                  border: '1px dashed #6c5ce7',
                  color: '#6c5ce7',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginLeft: '100px'
                }}
                title="Update your device"
              >
                <i className="bi bi-phone-vibrate"></i>
                <span>Update Device</span>
              </button>
              <button type="button"
                className="btn-close"
                onClick={closeAll}
                aria-label="Close"></button>
            </div>

            <div className="modal-body">
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Please get OTP for e-KYC verification to complete the AEPS setup.
              </div>

              <div className="mb-3">
                <label htmlFor="mobileNumber" className="form-label">Mobile Number</label>
                <input type="text"
                  className="form-control"
                  id="mobileNumber"
                  value={verificationData?.phone || ''}
                  readOnly />
              </div>
              <div className="mb-3">
                <label htmlFor="panNumber" className="form-label">PAN Number</label>
                <input type="text"
                  className="form-control"
                  id="panNumber"
                  value={verificationData?.pan_no || ''}
                  readOnly />
              </div>
              <div className="mb-3">
                <label htmlFor="aadhaarNumber" className="form-label">Aadhaar Number</label>
                <input type="text"
                  className="form-control"
                  id="aadhaarNumber"
                  value={verificationData?.aadhaar_number || ''}
                  readOnly />
              </div>

              <div className="mb-3">
                <label htmlFor="deviceIMEI" className="form-label">Device IMEI</label>
                <input type="text"
                  className="form-control"
                  id="deviceIMEI"
                  value={deviceIMEI}
                  onChange={(e) => setDeviceIMEI(e.target.value)}
                  placeholder="Enter Device IMEI" />
              </div>

              {!ekycOtpData ? (
                <div className="text-center">
                  <button type="button"
                    className="btn btn-primary"
                    onClick={getEkycOtp}
                    disabled={ekycOtpLoading}>
                    {ekycOtpLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Getting OTP...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-phone me-2"></i>
                        Get OTP
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="alert alert-success">
                    <i className="bi bi-check-circle me-2"></i>
                    OTP sent successfully for e-KYC verification
                  </div>
                  <div className="mb-3">
                    <label htmlFor="ekycOtp" className="form-label">Enter OTP</label>
                    <input type="text"
                      className="form-control"
                      id="ekycOtp"
                      value={ekycOtp}
                      onChange={(e) => setEkycOtp(e.target.value)}
                      placeholder="Enter OTP for e-KYC"
                      maxLength="6" />
                  </div>
                  <div className="d-flex gap-2">
                    <button type="button"
                      className="btn btn-success"
                      onClick={verifyEkycOtp}
                      disabled={ekycOtpLoading || !ekycOtp}>
                      {ekycOtpLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Verifying...
                        </>
                      ) : 'Verify OTP'}
                    </button>
                    <button type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setEkycOtpData(null);
                        setEkycOtp('');
                      }}>
                      Get New OTP
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showEkycOtpModal && <div className="modal-backdrop fade show"></div>}

      {/* Biometric e-KYC Modal */}
      <div className={`modal fade ${showBiometricEkycModal ? 'show' : ''}`}
        style={{ display: showBiometricEkycModal ? 'block' : 'none' }}
        tabIndex="-1"
        aria-labelledby="biometricEkycModalLabel"
        aria-hidden={!showBiometricEkycModal}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className='mt-2' >Biometric e-KYC</h5>

              {/*  device number update button show here */}
              <button
                onClick={() => setShowDeviceModal(true)}
                style={{
                  background: '#e8f4ff',
                  border: '1px dashed #6c5ce7',
                  color: '#6c5ce7',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginLeft: '100px'
                }}
                title="Update your device"
              >
                <i className="bi bi-phone-vibrate"></i>
                <span>Update Device</span>
              </button>

              <button type="button"
                className="btn-close"
                onClick={closeAll}
                aria-label="Close"></button>
            </div>

            <div className="modal-body">
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Please select your fingerprint device and capture your biometric for e-KYC verification.
              </div>

              {/* Device Selection */}
              <div className="mb-4">
                <label className="form-label"><strong>Select Fingerprint Device</strong></label>
                <div className="row g-2">
                  <div className="col-md-4">
                    <div
                      style={{
                        ...styles.deviceOption,
                        ...(device === 'Mantra' && styles.deviceOptionActive),
                        width: '100%'
                      }}
                      onClick={() => setDevice('Mantra')}
                    >
                      <span style={styles.deviceIcon}>
                        <i className="bi bi-fingerprint"></i>
                      </span>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>Mantra</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>RD Service</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div
                      style={{
                        ...styles.deviceOption,
                        ...(device === 'Morpho' && styles.deviceOptionActive),
                        width: '100%'
                      }}
                      onClick={() => setDevice('Morpho')}
                    >
                      <span style={styles.deviceIcon}>
                        <i className="bi bi-fingerprint"></i>
                      </span>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>Morpho</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>RD Service</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div
                      style={{
                        ...styles.deviceOption,
                        ...(device === 'Startek' && styles.deviceOptionActive),
                        width: '100%'
                      }}
                      onClick={() => setDevice('Startek')}
                    >
                      <span style={styles.deviceIcon}>
                        <i className="bi bi-fingerprint"></i>
                      </span>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>Startek</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>RD Service</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div
                      style={{
                        ...styles.deviceOption,
                        ...(device === 'SecuGen' && styles.deviceOptionActive),
                        width: '100%'
                      }}
                      onClick={() => setDevice('SecuGen')}
                    >
                      <span style={styles.deviceIcon}>
                        <i className="bi bi-fingerprint"></i>
                      </span>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>SecuGen</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>RD Service</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div
                      style={{
                        ...styles.deviceOption,
                        ...(device === 'Precision' && styles.deviceOptionActive),
                        width: '100%'
                      }}
                      onClick={() => setDevice('Precision')}
                    >
                      <span style={styles.deviceIcon}>
                        <i className="bi bi-fingerprint"></i>
                      </span>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>Precision</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>RD Service</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div
                      style={{
                        ...styles.deviceOption,
                        ...(device === 'Evolution' && styles.deviceOptionActive),
                        width: '100%'
                      }}
                      onClick={() => setDevice('Evolution')}
                    >
                      <span style={styles.deviceIcon}>
                        <i className="bi bi-fingerprint"></i>
                      </span>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>Evolution</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>RD Service</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fingerprint Capture */}
              <div className="text-center mb-3">
                <div className="mb-3">
                  <i className="bi bi-fingerprint" style={{ fontSize: '4rem', color: biometricData ? '#28a745' : '#6c757d' }}></i>
                </div>
                {biometricData ? (
                  <div className="alert alert-success">
                    <i className="bi bi-check-circle me-2"></i>
                    Fingerprint captured successfully using {device}
                  </div>
                ) : (
                  <button type="button"
                    className="btn btn-outline-primary"
                    onClick={() => handleCapture1()}
                    disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Capturing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-fingerprint me-2"></i>
                        Capture Fingerprint
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="modal-footer d-flex justify-content-center align-items-center">
              <button type="button"
                className="btn btn-success"
                onClick={handleBiometricEkyc}
                disabled={biometricEkycLoading || !biometricData}>
                {biometricEkycLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Complete e-KYC
                  </>
                )}
              </button>

            </div>
          </div>
        </div>
      </div>
      {showBiometricEkycModal && <div className="modal-backdrop fade show"></div>}

      {/* 2FA Modal */}
      <div className={`modal fade ${showTwoFAModal ? 'show' : ''}`}
        style={{ display: showTwoFAModal ? 'block' : 'none' }}
        tabIndex="-1"
        aria-labelledby="twoFAModalLabel"
        aria-hidden={!showTwoFAModal}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className='mt-2' > {selectedMode === 'M' && 'Aadhar Pay'} 2FA</h5>
              {/*  device number update button show here */}
              <button
                onClick={() => setShowDeviceModal(true)}
                style={{
                  background: '#e8f4ff',
                  border: '1px dashed #6c5ce7',
                  color: '#6c5ce7',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginLeft: '100px'
                }}
                title="Update your device"
              >
                <i className="bi bi-phone-vibrate"></i>
                <span>Update Device</span>
              </button>
              <button type="button"
                className="btn-close"
                onClick={closeAll}
                aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Please select your fingerprint device and capture your biometric for authentication.
              </div>

              {/* Device Selection */}
              <div className="mb-4">
                <label className="form-label"><strong>Select Fingerprint Device</strong></label>
                <div className="row g-2">
                  <div className="col-md-4">
                    <div
                      style={{
                        ...styles.deviceOption,
                        ...(device === 'Mantra' && styles.deviceOptionActive),
                        width: '100%'
                      }}
                      onClick={() => setDevice('Mantra')}
                    >
                      <span style={styles.deviceIcon}>
                        <i className="bi bi-fingerprint"></i>
                      </span>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>Mantra</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>RD Service</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div
                      style={{
                        ...styles.deviceOption,
                        ...(device === 'Morpho' && styles.deviceOptionActive),
                        width: '100%'
                      }}
                      onClick={() => setDevice('Morpho')}
                    >
                      <span style={styles.deviceIcon}>
                        <i className="bi bi-fingerprint"></i>
                      </span>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>Morpho</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>RD Service</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div
                      style={{
                        ...styles.deviceOption,
                        ...(device === 'Startek' && styles.deviceOptionActive),
                        width: '100%'
                      }}
                      onClick={() => setDevice('Startek')}
                    >
                      <span style={styles.deviceIcon}>
                        <i className="bi bi-fingerprint"></i>
                      </span>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>Startek</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>RD Service</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div
                      style={{
                        ...styles.deviceOption,
                        ...(device === 'SecuGen' && styles.deviceOptionActive),
                        width: '100%'
                      }}
                      onClick={() => setDevice('SecuGen')}
                    >
                      <span style={styles.deviceIcon}>
                        <i className="bi bi-fingerprint"></i>
                      </span>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>SecuGen</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>RD Service</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div
                      style={{
                        ...styles.deviceOption,
                        ...(device === 'Precision' && styles.deviceOptionActive),
                        width: '100%'
                      }}
                      onClick={() => setDevice('Precision')}
                    >
                      <span style={styles.deviceIcon}>
                        <i className="bi bi-fingerprint"></i>
                      </span>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>Precision</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>RD Service</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div
                      style={{
                        ...styles.deviceOption,
                        ...(device === 'Evolution' && styles.deviceOptionActive),
                        width: '100%'
                      }}
                      onClick={() => setDevice('Evolution')}
                    >
                      <span style={styles.deviceIcon}>
                        <i className="bi bi-fingerprint"></i>
                      </span>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>Evolution</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>RD Service</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fingerprint Capture */}
              <div className="text-center mb-3">
                <div className="mb-3">
                  <i className="bi bi-fingerprint" style={{ fontSize: '4rem', color: biometricData ? '#28a745' : '#6c757d' }}></i>
                </div>
                {biometricData ? (
                  <div className="alert alert-success">
                    <i className="bi bi-check-circle me-2"></i>
                    Fingerprint captured successfully using {device}
                  </div>
                ) : (
                  <button type="button"
                    className="btn btn-outline-primary"
                    onClick={() => handleCapture('2fa')}
                    disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Capturing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-fingerprint me-2"></i>
                        Capture Fingerprint
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="modal-footer d-flex justify-content-center align-items-center d-none">
              <button type="button"
                className="btn btn-success"
                onClick={handleTwoFAModal}
                disabled={!biometricData}>
                {biometricData ? (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Authentication Complete
                  </>
                ) : (
                  <>
                    <i className="bi bi-lock me-2"></i>
                    Capture Required
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {showTwoFAModal && <div className="modal-backdrop fade show"></div>}

      {/* AEPS > 5000 OTP Modal */}
      <div className={`modal fade ${showAepsOtpModal ? 'show' : ''}`}
        style={{ display: showAepsOtpModal ? 'block' : 'none' }}
        tabIndex="-1"
        aria-labelledby="aepsOtpModalLabel"
        aria-hidden={!showAepsOtpModal}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title mt-2">Aadhaar OTP Required</h5>
              <button type="button"
                className="btn-close"
                onClick={() => {
                  setShowAepsOtpModal(false);
                  setAepsOtp('');
                }}
                aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-warning">
                <i className="bi bi-shield-exclamation me-2"></i>
                As per NPCI guidelines, transactions above ₹5,000 require customer Aadhaar OTP verification.
              </div>
              <div className="mb-3">
                <label className="form-label">Transaction Amount</label>
                <input type="text" className="form-control" value={`₹ ${amount}`} readOnly />
              </div>
              <div className="mb-3">
                <label className="form-label">Aadhaar Number</label>
                <input type="text" className="form-control" value={aadharNo} readOnly />
              </div>
              <div className="mb-3">
                <label htmlFor="aepsOtpInput" className="form-label">Enter 6-digit Aadhaar OTP received on Customer Mobile</label>
                <input
                  type="text"
                  id="aepsOtpInput"
                  className="form-control"
                  value={aepsOtp}
                  onChange={(e) => setAepsOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowAepsOtpModal(false);
                  setAepsOtp('');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!aepsOtp || aepsOtp.length < 4}
                onClick={async () => {
                  setShowAepsOtpModal(false);
                  toast.info('OTP saved. Please scan customer fingerprint to complete transaction.');
                  setTimeout(() => {
                    handleCapture();
                  }, 300);
                }}
              >
                <i className="bi bi-check-circle me-2"></i>
                Submit OTP & Scan Fingerprint
              </button>
            </div>
          </div>
        </div>
      </div>
      {showAepsOtpModal && <div className="modal-backdrop fade show"></div>}

      {/* Update Device Modal */}
      <div
        className={`modal fade ${showDeviceModal ? 'show' : ''}`}
        style={{ display: showDeviceModal ? 'block' : 'none' }}
        tabIndex="-1"
        aria-labelledby="deviceModalLabel"
        aria-hidden={!showDeviceModal}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow-lg border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)', color: 'white', borderBottom: 'none' }}>
              <h5 className="modal-title d-flex align-items-center gap-2 mb-0 fw-bold">
                <i className="bi bi-phone-vibrate"></i>
                Update Device Information
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowDeviceModal(false)}
                aria-label="Close"
              ></button>
            </div>
            <form onSubmit={handleUpdateDeviceSubmit}>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label text-muted fw-semibold">Merchant Outlet ID</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={verificationData?.mid || user?.mid || ''}
                    readOnly
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted fw-semibold">Biometric Device Model</label>
                  <select
                    className="form-select shadow-sm"
                    value={device}
                    onChange={(e) => setDevice(e.target.value)}
                  >
                    <option value="Mantra">Mantra RD Service</option>
                    <option value="Morpho">Morpho RD Service</option>
                    <option value="Startek">Startek RD Service</option>
                    <option value="SecuGen">SecuGen RD Service</option>
                    <option value="Precision">Precision RD Service</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted fw-semibold">
                    Device IMEI / Serial Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control shadow-sm"
                    placeholder="Enter Device IMEI or Serial Number"
                    value={deviceIMEI}
                    onChange={(e) => setDeviceIMEI(e.target.value)}
                    required
                  />
                  <small className="text-muted">Required for NPCI / Fingpay biometric verification.</small>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted fw-semibold">m-ATM Serial Number (Optional)</label>
                  <input
                    type="text"
                    className="form-control shadow-sm"
                    placeholder="Enter m-ATM Serial Number if applicable"
                    value={mposSerialNumber}
                    onChange={(e) => setMposSerialNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer bg-light border-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  style={{ borderRadius: '8px' }}
                  onClick={() => setShowDeviceModal(false)}
                  disabled={deviceModalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn text-white px-4"
                  style={{
                    backgroundColor: '#6c5ce7',
                    borderRadius: '8px',
                    fontWeight: '500'
                  }}
                  disabled={deviceModalLoading}
                >
                  {deviceModalLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Save Device Info
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {showDeviceModal && <div className="modal-backdrop fade show"></div>}

    </div >
  );
};

export default Home;