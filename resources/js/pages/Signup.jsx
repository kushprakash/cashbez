import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { retrieveTokenAndUserData, storeTokenAndUserData } from '../core/auth/tokenManager';
import SecurityIcon from '@mui/icons-material/Security';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import QrCodeIcon from '@mui/icons-material/QrCode';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import AndroidIcon from '@mui/icons-material/Android';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import styles from './Signup.module.css';
import ThreeBackground from '../components/ThreeBackground';
import DynamicPopup from '../components/DynamicPopup';

const servicesList = [
    "AEPS", "Aadhaar Pay", "Cash Deposit", "Money Transfer", "M-ATM", "QR Collection", "PAN Card", "Insurance"
];

const Signup = () => {
    const navigate = useNavigate();
    const { referralid } = useParams();
    const location = useLocation();
    const { token } = retrieveTokenAndUserData();
    const [playsoreQr, setPlaysoreQr] = useState('');
    const [playsoreUrl, setPlaysoreUrl] = useState('');
    const [step, setStep] = useState(1);
    const [isRegistered, setIsRegistered] = useState(null);
    const [form, setForm] = useState({
        mobile: '',
        otp: '',
        name: '',
        email: '',
        refer_by: '',
    });
    const [roleType, setRoleType] = useState('user'); // 'user', 'api_partner', or 'white_label'
    const [errors, setErrors] = useState({});
    const [logo, setLogo] = useState('');
    const [roles, setRoles] = useState([]);
    const [footer_logo, setFooterLogo] = useState('');
    const [comapnyname, setName] = useState('');
    const [about, setAbout] = useState('Unified Open Banking & API Platform');
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [referStatus, setReferStatus] = useState({ valid: null, name: '', message: '' });
    const [referLoading, setReferLoading] = useState(false);
    const resendIntervalRef = useRef(null);

    // New state for design & QR Login
    const [mode, setMode] = useState('qr');
    const [qrChallenge, setQrChallenge] = useState(null);
    const [qrStatus, setQrStatus] = useState('loading'); // loading, active, expired, approved
    const [qrTimer, setQrTimer] = useState(60);
    const eventSourceRef = useRef(null);

    const [themeColors, setThemeColors] = useState({ primary: '#10b981', secondary: '#06b6d4' }); // Default emerald-500, cyan-500
    const [userId, setUserId] = useState(null); // Store user ID for public popup fetch
    // const [digiLockerLoading, setDigiLockerLoading] = useState(false);

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const res = await axios.get('/api/getLogo');
                if (res && res.data && res.data.status === 1 && res.data.logo) {
                    setLogo(res.data.logo);
                    setFooterLogo(res.data.footer_logo);
                    setName(res.data.name);
                    setPlaysoreQr(res.data.playstore_qr_img);
                    setPlaysoreUrl(res.data.playstore_url);
                    setAbout(res.data.about);
                    setRoles(res.data.roles);
                    if (res.data.color1 && res.data.color2) {
                        setThemeColors({ primary: res.data.color1, secondary: res.data.color2 });
                    }
                    // Extract user_id from first role
                    if (res.data.roles && res.data.roles.length > 0 && res.data.roles[0].user_id) {
                        // Backend will: find this user -> get their admin_mid -> find admin -> use admin's id
                        setUserId(res.data.roles[0].user_id);
                    }
                }
            } catch (e) {
                // final fallback: leave logo empty
            }
        };

        // Check for mode in URL query params (e.g., ?mode=mobile)
        const urlMode = location.pathname;
        if (urlMode === '/mobile-mode' || referralid) {
            setMode('mobile');
        }

        fetchLogo();
    }, [location, referralid]);

    // Handle DigiLocker callback
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('status');
        const accessToken = urlParams.get('access_token');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        // Check if this is a DigiLocker callback
        if (status !== null || error) {
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);

            if (status === '1' && accessToken) {
                // Successful login/registration
                const userName = urlParams.get('name') || 'User';
                localStorage.setItem('token', accessToken);
                // Fetch user data with the token
                axios.post('/api/userdata', {}, {
                    headers: { Authorization: `Bearer ${accessToken}`, Token: accessToken }
                }).then(res => {
                    console.log(res.data);
                    if (res.data && res.data.status === 1 && res.data.user) {
                        storeTokenAndUserData(res.data.user.remember_token, res.data.user);
                        toast.success(`Welcome, ${userName}! Login successful via DigiLocker.`);
                        localStorage.setItem('token', res.data.user.remember_token);

                        setTimeout(() => {
                            navigate('/dashboard');
                        }, 1500);
                    } else {
                        toast.error('Failed to fetch user data');
                    }
                }).catch(() => {
                    toast.error('Failed to verify session');
                });
            } else if (error) {
                toast.error(errorDescription || 'DigiLocker authentication failed');
            }
        }
    }, [navigate]);

    // QR Login Lifecycle
    useEffect(() => {
        if (mode === 'qr') {
            initQrLogin();
        } else {
            // Cleanup if switching away from QR
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        }
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [mode]);

    // QR Timer Effect
    useEffect(() => {
        let interval;
        if (qrStatus === 'active' && qrTimer > 0) {
            interval = setInterval(() => {
                setQrTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [qrStatus, qrTimer]);

    const initQrLogin = async () => {
        setQrStatus('loading');
        try {
            const res = await axios.get('/api/login/qr/init');
            if (res.data && res.data.status === 1) {
                setQrChallenge(res.data.challenge_id);
                setQrStatus('active');
                setQrTimer(60);
                startQrStream(res.data.challenge_id);
            } else {
                setQrStatus('error');
            }
        } catch (e) {
            setQrStatus('error');
        }
    };

    const startQrStream = (challengeId) => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const evtSource = new EventSource(`/api/login/qr/stream/${challengeId}`);
        eventSourceRef.current = evtSource;

        evtSource.onmessage = (event) => {
            // Heartbeat
        };

        evtSource.addEventListener('approved', (event) => {
            const data = JSON.parse(event.data);
            if (data.access_token) {
                localStorage.setItem('token', data.access_token);
                storeTokenAndUserData(data.access_token, data.user);
                toast.success('Login successful!');
                navigate('/dashboard');
                evtSource.close();
            }
        });

        evtSource.addEventListener('timeout', (event) => {
            setQrStatus('expired');
            evtSource.close();
        });

        evtSource.addEventListener('error', (event) => {
            if (event.data) {
                // Server sent an error event
                setQrStatus('expired');
            }
            // Connection error (closed by server or network)
            // If it was a clean close, we might not want to show error, but here we assume stream end = expired/done
            evtSource.close();
        });

        evtSource.onerror = (err) => {
            // Native error (network etc)
            // Often fires on close, so check state
            if (evtSource.readyState === EventSource.CLOSED) {
                if (qrStatus !== 'approved') setQrStatus('expired');
            }
        };
    };

    // Set referral ID from URL params and validate
    useEffect(() => {
        const validateReferralId = async () => {
            if (referralid) {
                setForm((prev) => ({ ...prev, refer_by: referralid }));
                try {
                    const res = await axios.post(`/api/check-refers`, { refer_by: referralid });
                    if (res.data && res.data.status === 1) {
                        setReferStatus({ valid: true, name: res.data.user.name, message: '' });
                    } else {
                        setReferStatus({ valid: false, name: '', message: 'Invalid referral ID' });
                        toast.error('Invalid referral ID');
                        setForm((prev) => ({ ...prev, refer_by: '' }));
                    }
                } catch (err) {
                    setReferStatus({ valid: false, name: '', message: 'Invalid referral ID' });
                    toast.error('Invalid referral ID, Check and try again.');
                    setForm((prev) => ({ ...prev, refer_by: '' }));
                }
            }
        };

        validateReferralId();
    }, [referralid]);

    // Check token on mount and redirect if logged in
    useEffect(() => {
        if (token) {
            fetch('/api/checkToken', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 1) {
                        navigate('/dashboard');
                    } else {
                        // Optionally clear invalid token
                        //localStorage.removeItem('token');
                    }
                })
                .catch(() => {
                    // Optionally clear token on error
                    //localStorage.removeItem('token');
                });
        }
    }, [navigate, token]);

    // Cooldown timer effect
    useEffect(() => {
        if (resendCooldown > 0) {
            resendIntervalRef.current = setInterval(() => {
                setResendCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(resendIntervalRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(resendIntervalRef.current);
    }, [resendCooldown]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (name === 'refer_by') {
            setReferStatus({ valid: null, name: '', message: '' });
            setErrors((prev) => ({ ...prev, refer_by: null }));
        }
    };

    const validateMobile = () => {
        const newErrors = {};
        if (!form.mobile.trim()) newErrors.mobile = 'Mobile is required';
        else if (!/^\d{10}$/.test(form.mobile)) newErrors.mobile = 'Mobile must be 10 digits';
        return newErrors;
    };

    const validateDetails = () => {
        const newErrors = {};
        if (!form.otp.trim()) newErrors.otp = 'OTP is required';
        if (!form.name.trim()) newErrors.name = 'Name is required';
        if (!form.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) newErrors.email = 'Invalid email format';

        // Referral code is only required and validated for User role
        if (roleType === 'user') {
            if (!form.refer_by.trim()) {
                newErrors.refer_by = 'Referral code is required';
            } else if (referStatus.valid !== true) {
                newErrors.refer_by = referStatus.message || 'Please verify your referral code';
            }
        }

        return newErrors;
    };

    const checkReferId = async (referId) => {
        const code = referId || form.refer_by;
        if (!code || !code.trim()) {
            setReferStatus({ valid: false, name: '', message: 'Referral code is required.' });
            return;
        }
        setReferLoading(true);
        try {
            const res = await axios.post(`/api/check-refer`, { refer_by: code.trim() });
            if (res.data && res.data.status === 1) {
                setReferStatus({ valid: true, name: res.data.user.name, message: '' });
                setErrors((prev) => ({ ...prev, refer_by: null }));
            } else {
                setReferStatus({ valid: false, name: '', message: res.data?.message || 'Refer ID not found.' });
            }
        } catch (err) {
            setReferStatus({ valid: false, name: '', message: 'Error checking refer ID.' });
        }
        setReferLoading(false);
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (loading) return;
        const validationErrors = validateMobile();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;
        setLoading(true);
        try {
            const res = await axios.post('/api/send-otp', { mobile: form.mobile, type: 'web' });
            if (res.data && (res.data.status === 1 || res.data.status === 2)) {
                setIsRegistered(res.data.is_registered);
                setStep(2);
            } else {
                setErrors({ mobile: res.data.message || 'Failed to send OTP' });
            }
        } catch (err) {
            setErrors({ mobile: err?.response?.data?.message || 'Error sending OTP' });
            toast.error(err?.response?.data?.message || 'Error sending OTP');
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (loading) return;

        const handleApiError = (data) => {
            if (data?.error && typeof data.error === 'object') {
                const newErrors = {};
                Object.keys(data.error).forEach(key => {
                    if (Array.isArray(data.error[key])) {
                        newErrors[key] = data.error[key][0];
                    }
                });
                setErrors(newErrors);
                toast.error(data.message || 'Validation failed');
            } else {
                setErrors({ otp: data?.message || 'OTP verification failed' });
                toast.error(data?.message || 'OTP verification failed');
            }
        };

        if (isRegistered) {
            if (!form.otp.trim()) {
                setErrors({ otp: 'OTP is required' });
                return;
            }
            setLoading(true);
            try {
                const res = await axios.post('/api/verify-otp', {
                    mobile: form.mobile,
                    otp: form.otp,
                    roleType
                });
                if (res.data && res.data.status === 1 && res.data.user && res.data.access_token) {
                    localStorage.setItem('token', res.data.access_token);
                    storeTokenAndUserData(res.data.access_token, res.data.user);
                    navigate('/dashboard');
                } else {
                    handleApiError(res.data);
                }
            } catch (err) {
                handleApiError(err?.response?.data);
            }
            setLoading(false);
        } else {
            const validationErrors = validateDetails();
            setErrors(validationErrors);
            if (Object.keys(validationErrors).length > 0) return;
            setLoading(true);
            try {
                const res = await axios.post('/api/verify-otp', {
                    mobile: form.mobile,
                    otp: form.otp,
                    name: form.name,
                    email: form.email,
                    refer_by: form.refer_by,
                    role_type: roleType,
                    type: roleType,
                    roleType: roleType,
                });
                if (res.data && res.data.status === 1 && res.data.user && res.data.access_token) {
                    if (roleType === 'api_partner' || roleType === 'white_label') {
                        localStorage.setItem('token', res.data.access_token);
                        storeTokenAndUserData(res.data.access_token, res.data.user);
                        navigate('/dashboard');
                    } else {
                        setStep(3);
                    }
                } else {
                    handleApiError(res.data);
                }
            } catch (err) {
                handleApiError(err?.response?.data);
            }
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (loading || resendCooldown > 0) return;
        setLoading(true);
        try {
            const res = await axios.post('/api/send-otp', { mobile: form.mobile });
            if (res.data && (res.data.status === 1 || res.data.status === 2)) {
                toast.success('OTP resent successfully!');
                setResendCooldown(60); // 60 seconds cooldown
            } else {
                toast.error(res.data.message || 'Failed to resend OTP');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Error resending OTP');
        }
        setLoading(false);
    };

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '16, 185, 129';
    };

    // DigiLocker Login Handler
    // const handleDigiLockerLogin = async (flow = 'signin') => {
    //     if (digiLockerLoading) return;
    //     setDigiLockerLoading(true);
    //     try {
    //         const res = await axios.get(`/api/digilocker/auth?flow=${flow}`);
    //         if (res.data && res.data.status === 1 && res.data.authorization_url) {
    //             // Redirect to DigiLocker authorization page
    //             window.location.href = res.data.authorization_url;
    //         } else {
    //             toast.error(res.data?.message || 'Failed to initiate DigiLocker login');
    //             setDigiLockerLoading(false);
    //         }
    //     } catch (err) {
    //         toast.error(err?.response?.data?.message || 'Error connecting to DigiLocker');
    //         setDigiLockerLoading(false);
    //     }
    // };

    return (
        <div
            className={styles.pageContainer}
            style={{
                '--theme-primary': themeColors.primary,
                '--theme-secondary': themeColors.secondary,
                '--theme-primary-rgb': hexToRgb(themeColors.primary),
                '--theme-secondary-rgb': hexToRgb(themeColors.secondary),
            }}
        >
            <ToastContainer />

            {/* Dynamic Popup - Public/Guest popup for Signup/Login page */}
            {userId && <DynamicPopup screen="login" isLoginScreen={true} userId={userId} />}

            {/* Background Decor */}
            <div className={styles.blurBlob1}></div>
            <div className={styles.blurBlob2}></div>
            <ThreeBackground />

            <div className={`${styles.contentWrapper} container`}>
                <div className="row align-items-center justify-content-between">
                    {/* Left Content */}
                    <div className="col-lg-6 mb-5 mb-lg-0 d-none d-lg-block">
                        {logo && <img src={logo} alt="Logo" className="mb-4" style={{ height: '64px' }} />}
                        <h1 className={styles.heroTitle}>
                            {(about || 'Unified Open Banking & API Platform').split('&').map((part, i, arr) => (
                                <React.Fragment key={i}>
                                    {part}{i < arr.length - 1 && '&'}{i < arr.length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </h1>
                        <p className={styles.heroSubtitle}>
                            All your essential financial solutions in one unified platform.
                        </p>

                        {/* Services Grid */}
                        <div className="mt-4">
                            {servicesList.map((service, idx) => (
                                <span key={idx} className={styles.serviceBadge}>
                                    {service}
                                </span>
                            ))}
                        </div>

                        <div className="d-flex align-items-center gap-2 mt-4 text-muted fw-bold small">
                            <SecurityIcon className="text-success" style={{ fontSize: '1.25rem' }} />
                            <span>Secure & Instant Settlements</span>
                        </div>
                    </div>

                    {/* Right Content - Card */}
                    <div className="col-lg-5">
                        <div className={styles.loginCard}>
                            <div className="text-center mb-4">
                                {logo && <img src={logo} alt="Logo" className="mb-3" style={{ height: '48px' }} />}
                                {isRegistered ? (
                                    <h2 className="h5 fw-bold text-dark">Log In to {comapnyname || 'Cashbez Payment'}</h2>
                                ) : (
                                    <h2 className="h5 fw-bold text-dark">Sign Up to {comapnyname || 'Cashbez Payment'}</h2>
                                )}
                            </div>

                            {mode === 'mobile' ? (
                                <div className="fade show">
                                    {step === 1 && (
                                        <form onSubmit={handleSendOtp}>
                                            <div className="mb-3">
                                                <label className="form-label small text-muted fw-bold">Mobile</label>
                                                <div className={styles.inputWrapper}>
                                                    <input
                                                        type="text"
                                                        name="mobile"
                                                        value={form.mobile}
                                                        onChange={handleChange}
                                                        placeholder="Enter Mobile Number"
                                                        className={`${styles.customInput} ${errors.mobile ? styles.error : ''}`}

                                                    />
                                                    <SmartphoneIcon className={styles.inputIcon} style={{ fontSize: 20 }} />
                                                </div>
                                                {errors.mobile && <div className="text-danger small mt-1">{errors.mobile}</div>}
                                            </div>
                                            <button type="submit" disabled={loading} className={styles.primaryBtn}>
                                                {loading ? 'Sending...' : 'Proceed'}
                                            </button>
                                        </form>
                                    )}

                                    {step === 2 && (
                                        <form onSubmit={handleVerifyOtp}>
                                            {isRegistered ? (
                                                <div className="mb-3">
                                                    <label className="form-label small text-muted fw-bold">OTP</label>
                                                    <div className={styles.inputWrapper}>
                                                        <input
                                                            type="text"
                                                            name="otp"
                                                            value={form.otp}
                                                            onChange={handleChange}
                                                            placeholder="Enter OTP"
                                                            className={`${styles.customInput} ${errors.otp ? styles.error : ''}`}

                                                        />
                                                    </div>
                                                    {errors.otp && <div className="text-danger small mt-1">{errors.otp}</div>}
                                                </div>
                                            ) : (
                                                <>
                                                    {/* <div className="text-center fade show">
                                                        {playsoreQr && (
                                                            <div className="position-relative d-inline-block">
                                                       
                                                                <div
                                                                    className={styles.qrBorderEffect}
                                                                    style={{ '--theme-primary': themeColors.primary, '--theme-secondary': themeColors.secondary }}
                                                                ></div>

                                                                <div className={styles.qrContainer}>

                                                                    <img
                                                                        src={playsoreQr}
                                                                        alt="Login QR"
                                                                        className="w-100 h-100 object-fit-contain"
                                                                    />

                                                                </div>
                                                            </div>
                                                        )}
                                                         <div className="mt-4 text-center">
                                                            <h5 className="fw-bold text-dark mb-2">You are not registered. Please register first.</h5>
                                                            <p className="small text-muted mb-0">Download the <span className="fw-bold text-dark">{comapnyname || 'Cashbez Payment'} App</span> from Play Store.</p>
                                                            <p className="small text-muted mb-0">Complete the quick registration process.</p>
                                                        </div>
                                                        <div className="mt-4">
                                                            <a href={playsoreUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn btn-outline-dark btn-sm rounded-pill px-4 d-inline-flex align-items-center gap-2">
                                                                <AndroidIcon fontSize="small" />
                                                                <span>Open in Play Store</span>
                                                            </a>
                                                        </div> 


                                                    </div> */}

                                                    <div className="mb-3">
                                                        <label className="form-label small text-muted fw-bold">OTP</label>
                                                        <div className={styles.inputWrapper}>
                                                            <input
                                                                type="text"
                                                                name="otp"
                                                                value={form.otp}
                                                                onChange={handleChange}
                                                                placeholder="Enter OTP"
                                                                className={`${styles.customInput} ${errors.otp ? styles.error : ''}`}
                                                            />
                                                            <VerifiedUserIcon className={styles.inputIcon} style={{ fontSize: 20 }} />
                                                        </div>
                                                        {errors.otp && <div className="text-danger small mt-1">{errors.otp}</div>}
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="form-label small text-muted fw-bold">Full Name</label>
                                                        <div className={styles.inputWrapper}>
                                                            <input
                                                                type="text"
                                                                name="name"
                                                                value={form.name}
                                                                onChange={handleChange}
                                                                placeholder="Enter Your Full Name"
                                                                className={`${styles.customInput} ${errors.name ? styles.error : ''}`}
                                                            />
                                                        </div>
                                                        {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="form-label small text-muted fw-bold">Email Address</label>
                                                        <div className={styles.inputWrapper}>
                                                            <input
                                                                type="email"
                                                                name="email"
                                                                value={form.email}
                                                                onChange={handleChange}
                                                                placeholder="Enter Your Email"
                                                                className={`${styles.customInput} ${errors.email ? styles.error : ''}`}
                                                            />
                                                        </div>
                                                        {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
                                                    </div>

                                                    {/* Role Select Option */}
                                                    <div className="mb-3">
                                                        <label className="form-label small text-muted fw-bold d-block">Select Role Option</label>
                                                        <div className="d-flex gap-2">
                                                            <button
                                                                type="button"
                                                                className={`btn btn-sm flex-fill py-2 fw-bold ${roleType === 'user' ? 'btn-success text-white shadow-sm' : 'btn-outline-secondary text-dark'}`}
                                                                style={roleType === 'user' ? { backgroundColor: themeColors.primary, borderColor: themeColors.primary, borderRadius: '0.5rem' } : { borderRadius: '0.5rem' }}
                                                                onClick={() => {
                                                                    setRoleType('user');
                                                                }}
                                                            >
                                                                User
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={`btn btn-sm flex-fill py-2 fw-bold ${roleType === 'api_partner' ? 'btn-success text-white shadow-sm' : 'btn-outline-secondary text-dark'}`}
                                                                style={roleType === 'api_partner' ? { backgroundColor: themeColors.primary, borderColor: themeColors.primary, borderRadius: '0.5rem' } : { borderRadius: '0.5rem' }}
                                                                onClick={() => {
                                                                    setRoleType('api_partner');
                                                                    setForm((prev) => ({ ...prev, refer_by: '' }));
                                                                    setReferStatus({ valid: null, name: '', message: '' });
                                                                    setErrors((prev) => ({ ...prev, refer_by: null }));
                                                                }}
                                                            >
                                                                API Partner
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={`btn btn-sm flex-fill py-2 fw-bold ${roleType === 'white_label' ? 'btn-success text-white shadow-sm' : 'btn-outline-secondary text-dark'}`}
                                                                style={roleType === 'white_label' ? { backgroundColor: themeColors.primary, borderColor: themeColors.primary, borderRadius: '0.5rem' } : { borderRadius: '0.5rem' }}
                                                                onClick={() => {
                                                                    setRoleType('white_label');
                                                                    setForm((prev) => ({ ...prev, refer_by: '' }));
                                                                    setReferStatus({ valid: null, name: '', message: '' });
                                                                    setErrors((prev) => ({ ...prev, refer_by: null }));
                                                                }}
                                                            >
                                                                White Label
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Referral Code Field - Only shown for User role */}
                                                    {roleType === 'user' && (
                                                        <div className="mb-3">
                                                            <label className="form-label small text-muted fw-bold">
                                                                Referral Code <span className="text-danger">*</span>
                                                            </label>
                                                            <div className="d-flex gap-2 align-items-start">
                                                                <div className={`${styles.inputWrapper} flex-grow-1 mb-0`}>
                                                                    <input
                                                                        type="text"
                                                                        name="refer_by"
                                                                        value={form.refer_by}
                                                                        onChange={handleChange}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                e.preventDefault();
                                                                                if (!referralid && form.refer_by && form.refer_by.trim() && referStatus.valid !== true) {
                                                                                    checkReferId(form.refer_by);
                                                                                }
                                                                            }
                                                                        }}
                                                                        placeholder="Enter Referral Code"
                                                                        readOnly={!!referralid}
                                                                        className={`${styles.customInput} ${errors.refer_by || referStatus.valid === false ? styles.error : ''}`}
                                                                    />
                                                                </div>
                                                                {!referralid && referStatus.valid !== true && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-success px-3"
                                                                        onClick={() => checkReferId(form.refer_by)}
                                                                        disabled={referLoading || !form.refer_by || !form.refer_by.trim()}
                                                                        style={{
                                                                            backgroundColor: themeColors.primary,
                                                                            borderColor: themeColors.primary,
                                                                            fontWeight: 600,
                                                                            whiteSpace: 'nowrap',
                                                                            height: '42px',
                                                                            borderRadius: '0.5rem'
                                                                        }}
                                                                    >
                                                                        {referLoading ? 'Verifying...' : 'Verify'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {referStatus.valid === true && (
                                                                <div className="text-success small mt-1 fw-bold">
                                                                    ✓ Referral code valid: {referStatus.name}
                                                                </div>
                                                            )}
                                                            {referStatus.valid === false && (
                                                                <div className="text-danger small mt-1">{referStatus.message}</div>
                                                            )}
                                                            {errors.refer_by && referStatus.valid !== false && (
                                                                <div className="text-danger small mt-1">{errors.refer_by}</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            <>
                                                <div className="text-center mt-2">
                                                    <button
                                                        type="button"
                                                        className={`btn btn-link btn-sm text-decoration-none ${resendCooldown > 0 ? 'text-muted' : 'text-success'}`}
                                                        onClick={handleResendOtp}
                                                        disabled={resendCooldown > 0 || loading}
                                                    >
                                                        {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                                                    </button>
                                                </div>

                                                <button type="submit" disabled={loading} className={styles.primaryBtn}>
                                                    {loading ? 'Verifying...' : (isRegistered ? 'Verify & Login' : 'Verify & Continue')}
                                                </button>
                                            </>

                                        </form>
                                    )}

                                    {step === 3 && (
                                        <form onSubmit={handleSendOtp}>
                                            <>
                                                <div className="text-center fade show">
                                                    {playsoreQr && (
                                                        <div className="position-relative d-inline-block">

                                                            <div
                                                                className={styles.qrBorderEffect}
                                                                style={{ '--theme-primary': themeColors.primary, '--theme-secondary': themeColors.secondary }}
                                                            ></div>

                                                            <div className={styles.qrContainer}>

                                                                <img
                                                                    src={playsoreQr}
                                                                    alt="Login QR"
                                                                    className="w-100 h-100 object-fit-contain"
                                                                />

                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="mt-4 text-center">
                                                        <h5 className="fw-bold text-dark mb-2">Complete Your KYC.</h5>
                                                        <p className="small text-muted mb-0">Download the <span className="fw-bold text-dark">{comapnyname || 'Cashbez Payment'} App</span> from Play Store.</p>
                                                        <p className="small text-muted mb-0">Complete the quick KYC process.</p>
                                                    </div>
                                                    <div className="mt-4">
                                                        <a href={playsoreUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-outline-dark btn-sm rounded-pill px-4 d-inline-flex align-items-center gap-2">
                                                            <AndroidIcon fontSize="small" />
                                                            <span>Open in Play Store</span>
                                                        </a>
                                                    </div>


                                                </div>
                                            </>
                                        </form>
                                    )}


                                </div>
                            ) : (
                                <div className="text-center fade show">
                                    <div className="position-relative d-inline-block">
                                        {/* Gradient Border Effect */}
                                        <div
                                            className={styles.qrBorderEffect}
                                            style={{ '--theme-primary': themeColors.primary, '--theme-secondary': themeColors.secondary }}
                                        ></div>

                                        <div className={styles.qrContainer}>
                                            {qrStatus === 'loading' && (
                                                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                                    <div className="spinner-border text-success mb-2" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                    <span className="small text-muted fw-bold">Generating QR...</span>
                                                </div>
                                            )}

                                            {qrStatus === 'active' && qrChallenge && (
                                                <img
                                                    src={`/api/login/qr/image/${qrChallenge}`}
                                                    alt="Login QR"
                                                    className="w-100 h-100 object-fit-contain"
                                                />
                                            )}

                                            {qrStatus === 'expired' && (
                                                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-75 backdrop-blur">
                                                    <div className="bg-danger bg-opacity-10 rounded-circle p-2 mb-2">
                                                        <RefreshIcon className="text-danger" />
                                                    </div>
                                                    <p className="small fw-bold text-dark mb-2">QR Code Expired</p>
                                                    <button
                                                        onClick={initQrLogin}
                                                        className="btn btn-success btn-sm rounded-pill px-3"
                                                        style={{ backgroundColor: themeColors.primary, borderColor: themeColors.primary }}
                                                    >
                                                        Click to Refresh
                                                    </button>
                                                </div>
                                            )}

                                            {qrStatus === 'error' && (
                                                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-75 backdrop-blur">
                                                    <p className="text-danger fw-bold small mb-2">Connection Error</p>
                                                    <button
                                                        onClick={initQrLogin}
                                                        className="btn btn-light rounded-circle p-2"
                                                    >
                                                        <RefreshIcon className="text-success" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 text-center">
                                        <p className="small fw-bold text-dark mb-1">
                                            Scan with {comapnyname ? comapnyname.split(' ')[0] : 'Cashbez'} App
                                        </p>
                                        <p className="small text-muted mb-0">
                                            Open App &gt; Top Services &gt; Web Login
                                        </p>
                                    </div>

                                    {qrStatus === 'active' && (
                                        <div className="d-inline-flex align-items-center gap-2 mt-3 px-4 py-2 bg-white rounded-pill shadow-sm border" style={{ borderColor: `${themeColors.primary}40` }}>
                                            <div style={{ width: '20px', height: '20px', position: 'relative' }}>
                                                <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                                                    <path
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none"
                                                        stroke="#eee"
                                                        strokeWidth="4"
                                                    />
                                                    <path
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none"
                                                        stroke={themeColors.primary}
                                                        strokeWidth="4"
                                                        strokeDasharray={`${(qrTimer / 60) * 100}, 100`}
                                                    />
                                                </svg>
                                            </div>
                                            <span className="small fw-bold" style={{ color: themeColors.primary, minWidth: '80px' }}>
                                                {qrTimer}s remaining
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Minimal Mode Toggle */}
                            <div className="mt-3 pt-2 border-top text-center">
                                <div className="d-flex justify-content-center gap-3 flex-wrap">
                                    <button
                                        onClick={() => setMode(mode === 'mobile' ? 'qr' : 'mobile')}
                                        className="d-inline-flex align-items-center gap-2"
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: themeColors.primary,
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            padding: '6px 0',
                                            transition: 'opacity 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                                    >
                                        {mode === 'mobile'
                                            ? <><QrCodeIcon style={{ fontSize: 16 }} /> Login with QR</>
                                            : <><SmartphoneIcon style={{ fontSize: 16 }} /> Login with OTP</>
                                        }
                                    </button>
                                    {/* <span className="text-muted">|</span> */}
                                    {/*<button
                                        onClick={() => handleDigiLockerLogin('signin')}
                                        disabled={digiLockerLoading}
                                        className="d-inline-flex align-items-center"
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: digiLockerLoading ? 'not-allowed' : 'pointer',
                                            padding: '4px 0',
                                            transition: 'opacity 0.2s',
                                            opacity: digiLockerLoading ? 0.5 : 1
                                        }}
                                        onMouseOver={(e) => !digiLockerLoading && (e.currentTarget.style.opacity = '0.8')}
                                        onMouseOut={(e) => !digiLockerLoading && (e.currentTarget.style.opacity = '1')}
                                        title="Login with DigiLocker"
                                    >
                                        {digiLockerLoading ? (
                                            <span className="small text-muted">Connecting...</span>
                                        ) : (
                                            <img
                                                src="/js/pages/mp_logo_digilocker.png"
                                                alt="Login with DigiLocker"
                                                style={{ height: '28px', width: 'auto' }}
                                            />
                                        )}
                                    </button>*/}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
