import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../core/hooks/context';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserProfile = () => {
    const { userData: contextUser } = useContext(AuthContext) || {};
    const [userProfile, setUserProfile] = useState(null);
    const [kycData, setKycData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copiedField, setCopiedField] = useState('');

    const apiService = ApiService();

    useEffect(() => {
        fetchProfileDetails();
    }, []);

    const fetchProfileDetails = async () => {
        setLoading(true);
        try {
            const [userRes, dashboardRes] = await Promise.allSettled([
                apiService.vPost('/api/userdata'),
                apiService.vGet('/api/dashboard')
            ]);

            let liveUser = contextUser;
            if (userRes.status === 'fulfilled' && userRes.value?.data?.user) {
                liveUser = { ...contextUser, ...userRes.value.data.user };
                if (userRes.value.data.user.kyc) {
                    setKycData(userRes.value.data.user.kyc);
                }
            } else if (userRes.status === 'fulfilled' && userRes.value?.data?.data?.user) {
                liveUser = { ...contextUser, ...userRes.value.data.data.user };
                if (userRes.value.data.data.user.kyc) {
                    setKycData(userRes.value.data.data.user.kyc);
                }
            }

            if (dashboardRes.status === 'fulfilled' && dashboardRes.value?.data) {
                const dbData = dashboardRes.value.data.data || dashboardRes.value.data;
                if (dbData?.kyc_account) {
                    setKycData(prev => ({ ...prev, ...dbData.kyc_account }));
                }
                if (dbData?.user) {
                    liveUser = { ...liveUser, ...dbData.user };
                }
            }

            setUserProfile(liveUser);
        } catch (err) {
            console.error('Error fetching profile details:', err);
            setUserProfile(contextUser);
        } finally {
            setLoading(false);
        }
    };

    const user = userProfile || contextUser || {};
    const kyc = kycData || user.kyc || {};

    const getUserRole = (u) => {
        if (u?.role_name && u.role_name !== 'Unknown') return u.role_name;
        const rId = Number(u?.role);
        if (rId === 1) return 'Admin';
        if (rId === 2) return 'Master Distributor';
        if (rId === 3) return 'Distributor';
        if (rId === 4 || rId === 5) return 'Retailer';
        if (typeof u?.role === 'string' && u.role !== 'Unknown' && isNaN(Number(u.role))) return u.role;
        return 'Retailer';
    };

    const handleCopy = (text, fieldName) => {
        if (text && navigator.clipboard) {
            navigator.clipboard.writeText(text);
            setCopiedField(fieldName);
            toast.success('Copied to clipboard!');
            setTimeout(() => setCopiedField(''), 2000);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <>
            <Pageheader mainheading="My Profile" parentfolder="Account" activepage="User Profile" />
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="page-content-box pb-4">
                <div className="page-content-box-inner">

                    {/* TOP PROFILE HEADER CARD */}
                    <div className="card border-0 rounded-4 shadow-sm bg-white overflow-hidden mb-3.5">
                        {/* Gradient & Image Header Banner */}
                        <div
                            className="position-relative py-4 px-4 text-white overflow-hidden rounded-top-4"
                            style={{
                                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 58, 138, 0.82) 50%, rgba(37, 99, 235, 0.85) 100%), url("/assets/images/small/img-3.jpg") center/cover no-repeat',
                                minHeight: '145px'
                            }}
                        >
                            {/* Geometric Dot Grid Overlay Pattern */}
                            <div
                                className="position-absolute inset-0 opacity-20 pointer-events-none"
                                style={{
                                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
                                    backgroundSize: '18px 18px'
                                }}
                            ></div>

                            {/* Floating Glassmorphism Profile Badges on Right */}
                            <div className="position-absolute end-0 top-0 h-100 d-flex align-items-center pe-4 gap-3 pointer-events-none d-none d-md-flex" style={{ zIndex: 2 }}>
                                <div className="p-2.5 rounded-3 text-white shadow-sm d-flex align-items-center gap-2" style={{ background: 'rgba(255, 255, 255, 0.14)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.22)' }}>
                                    <iconify-icon icon="solar:shield-check-bold-duotone" style={{ fontSize: '24px' }} className="text-warning"></iconify-icon>
                                    <div>
                                        <small className="d-block text-white-50 fw-bold" style={{ fontSize: '8.5px', letterSpacing: '0.4px' }}>VERIFICATION</small>
                                        <span className="fw-bold" style={{ fontSize: '11px' }}>{kyc?.kyc_completed ? 'Full KYC Verified' : 'Standard Profile'}</span>
                                    </div>
                                </div>

                                <div className="p-2.5 rounded-3 text-white shadow-sm d-flex align-items-center gap-2" style={{ background: 'rgba(255, 255, 255, 0.14)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.22)' }}>
                                    <iconify-icon icon="solar:user-speak-bold-duotone" style={{ fontSize: '24px' }} className="text-info"></iconify-icon>
                                    <div>
                                        <small className="d-block text-white-50 fw-bold" style={{ fontSize: '8.5px', letterSpacing: '0.4px' }}>USER ROLE</small>
                                        <span className="fw-bold text-capitalize" style={{ fontSize: '11px' }}>{getUserRole(user)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card-body p-3.5 pt-0 position-relative" style={{ marginTop: '-45px' }}>
                            <div className="row align-items-end g-3">
                                <div className="col-auto">
                                    <div className="position-relative">
                                        {(kyc?.photo || user?.photo) ? (
                                            <img
                                                src={kyc?.photo || user?.photo}
                                                alt={user?.name || 'User Avatar'}
                                                className="rounded-circle border border-3 border-white shadow-sm"
                                                style={{ width: '90px', height: '90px', objectFit: 'cover', backgroundColor: '#FFFFFF' }}
                                            />
                                        ) : (
                                            <div
                                                className="rounded-circle border border-3 border-white shadow-sm d-flex align-items-center justify-content-center fw-bold text-white fs-2"
                                                style={{
                                                    width: '90px',
                                                    height: '90px',
                                                    background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'
                                                }}
                                            >
                                                {(user?.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="position-absolute bottom-0 end-0 bg-success border border-2 border-white rounded-circle p-1.5" title="Active Account"></span>
                                    </div>
                                </div>

                                <div className="col-md mt-3" style={{ marginTop: '25px' }}>
                                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1 mt-3" style={{ marginTop: '25px' }}>
                                        <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.25rem' }}>
                                            {kyc?.name || user?.name || 'User Name'}
                                        </h4>
                                        <span className="badge bg-primary-subtle text-primary fw-bold px-2.5 py-0.5 rounded-pill" style={{ fontSize: '10.5px' }}>
                                            {getUserRole(user)}
                                        </span>
                                        {kyc?.kyc_completed || kyc?.account_verified ? (
                                            <span className="badge bg-success-subtle text-success border border-success-subtle fw-bold px-2 py-0.5 rounded-pill" style={{ fontSize: '10px' }}>
                                                ✓ KYC Verified
                                            </span>
                                        ) : (
                                            <span className="badge bg-warning-subtle text-warning border border-warning-subtle fw-bold px-2 py-0.5 rounded-pill" style={{ fontSize: '10px' }}>
                                                ⚠️ Pending KYC
                                            </span>
                                        )}
                                    </div>

                                    <div className="d-flex flex-wrap align-items-center gap-3 text-muted" style={{ fontSize: '12px' }}>
                                        <div className="d-flex align-items-center gap-1">
                                            <iconify-icon icon="solar:card-bold-duotone" className="text-primary fs-6"></iconify-icon>
                                            MID: <span className="fw-bold text-dark font-monospace">{user?.mid || user?.id || 'N/A'}</span>
                                            {user?.mid && (
                                                <button
                                                    className="btn btn-sm btn-link p-0 text-primary border-0 ms-1 d-inline-flex align-items-center"
                                                    onClick={() => handleCopy(user.mid, 'mid')}
                                                    title="Copy MID"
                                                >
                                                    <iconify-icon icon={copiedField === 'mid' ? "solar:check-circle-bold" : "solar:copy-bold"} style={{ fontSize: '14px' }}></iconify-icon>
                                                </button>
                                            )}
                                        </div>

                                        <div className="d-flex align-items-center gap-1">
                                            <iconify-icon icon="solar:phone-bold-duotone" className="text-success fs-6"></iconify-icon>
                                            Mobile: <span className="fw-bold text-dark">{kyc?.mobile || user?.mobile || 'N/A'}</span>
                                        </div>

                                        <div className="d-flex align-items-center gap-1">
                                            <iconify-icon icon="solar:calendar-bold-duotone" className="text-info fs-6"></iconify-icon>
                                            Joining Date: <span className="fw-semibold text-dark">{formatDate(user?.created_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-auto ms-auto d-flex flex-wrap gap-2">
                                    <Link to="/id-card" className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1 fw-bold d-flex align-items-center shadow-xs" style={{ fontSize: '11.5px' }}>
                                        <iconify-icon icon="solar:user-id-bold-duotone" className="me-1 fs-6"></iconify-icon>
                                        ID Card
                                    </Link>
                                    <Link to="/certificate" className="btn btn-outline-success btn-sm rounded-pill px-3 py-1 fw-bold d-flex align-items-center shadow-xs" style={{ fontSize: '11.5px' }}>
                                        <iconify-icon icon="solar:document-text-bold-duotone" className="me-1 fs-6"></iconify-icon>
                                        Certificate
                                    </Link>
                                    <Link to="/shop-banner" className="btn btn-outline-info btn-sm rounded-pill px-3 py-1 fw-bold d-flex align-items-center shadow-xs" style={{ fontSize: '11.5px' }}>
                                        <iconify-icon icon="solar:gallery-bold-duotone" className="me-1 fs-6"></iconify-icon>
                                        Shop Banner
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT 2-COLUMN BALANCED GRID */}
                    <div className="row g-3">

                        {/* LEFT COLUMN: PERSONAL, BUSINESS & ADDRESS */}
                        <div className="col-lg-6">
                            <div className="card border-0 rounded-4 shadow-sm bg-white h-100">
                                <div className="card-header bg-white border-bottom py-2.5 px-3.5 d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-primary-subtle text-primary rounded-3 p-1.5 me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                            <iconify-icon icon="solar:user-bold-duotone" style={{ fontSize: '18px' }}></iconify-icon>
                                        </div>
                                        <div>
                                            <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '14px' }}>
                                                Personal, Business &amp; Address Info
                                            </h6>
                                            <small className="text-muted" style={{ fontSize: '10.5px' }}>User profile &amp; location details</small>
                                        </div>
                                    </div>
                                    <span className="badge bg-light text-secondary border fw-bold px-2 py-0.5" style={{ fontSize: '9.5px' }}>PROFILE &amp; ADDRESS</span>
                                </div>

                                <div className="card-body p-3.5">
                                    {/* Personal & Business Info Section */}
                                    <div className="d-flex align-items-center gap-1.5 mb-2.5 pb-1 border-bottom">
                                        <iconify-icon icon="solar:user-id-bold-duotone" className="text-primary fs-5"></iconify-icon>
                                        <span className="fw-bold text-primary text-uppercase" style={{ fontSize: '11.5px', letterSpacing: '0.4px' }}>Personal &amp; Business Profile</span>
                                    </div>

                                    <div className="row g-2 mb-3.5">
                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.4px' }}>Full Name</small>
                                                <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '12.5px' }}>{kyc?.name || user?.name || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.4px' }}>Shop / Business Name</small>
                                                <span className="fw-bold text-primary text-truncate d-block" style={{ fontSize: '12.5px' }}>{user?.shop_name || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.4px' }}>Date of Birth (DOB)</small>
                                                <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '12.5px' }}>{formatDate(kyc?.dob)}</span>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.4px' }}>Gender</small>
                                                <span className="fw-bold text-dark text-capitalize d-block" style={{ fontSize: '12.5px' }}>{kyc?.gender || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.4px' }}>Mobile Number</small>
                                                <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '12.5px' }}>{kyc?.mobile || user?.mobile || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.4px' }}>Email Address</small>
                                                <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '12.5px' }} title={kyc?.email || user?.email}>{kyc?.email || user?.email || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.4px' }}>Joining Date</small>
                                                <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '12.5px' }}>{formatDate(user?.created_at)}</span>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.4px' }}>Referral / Refer By</small>
                                                <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '12.5px' }}>{user?.refer_by || 'Direct Join'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address & Location Section */}
                                    <div className="d-flex align-items-center gap-1.5 mb-2.5 pb-1 border-bottom">
                                        <iconify-icon icon="solar:map-point-bold-duotone" className="text-warning fs-5"></iconify-icon>
                                        <span className="fw-bold text-warning text-uppercase" style={{ fontSize: '11.5px', letterSpacing: '0.4px' }}>Address &amp; Location Details</span>
                                    </div>

                                    <div className="row g-2">
                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '8.5px' }}>House / Building</small>
                                                <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '12px' }}>{kyc?.house || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '8.5px' }}>Street / Locality</small>
                                                <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '12px' }}>{kyc?.street || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '8.5px' }}>Landmark</small>
                                                <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '12px' }}>{kyc?.landmark || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '8.5px' }}>Village / Town / City (VTC)</small>
                                                <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '12px' }}>{kyc?.vtc || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '8.5px' }}>Sub-District / Tehsil</small>
                                                <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '12px' }}>{kyc?.subdist || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '8.5px' }}>District</small>
                                                <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '12px' }}>{kyc?.dist || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '8.5px' }}>State</small>
                                                <span className="fw-bold text-primary text-truncate d-block" style={{ fontSize: '12px' }}>{kyc?.state || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '8.5px' }}>Pincode &amp; Country</small>
                                                <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '12px' }}>
                                                    {kyc?.pincode ? `${kyc.pincode} (${kyc?.country || 'India'})` : 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase mb-0.5" style={{ fontSize: '8.5px' }}>Full Combined Address</small>
                                                <span className="fw-bold text-dark d-block" style={{ fontSize: '12px', lineHeight: '1.3' }}>
                                                    {user?.address || 'Address not updated'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: KYC DOCUMENTS & BANKING */}
                        <div className="col-lg-6">
                            <div className="card border-0 rounded-4 shadow-sm bg-white h-100">
                                <div className="card-header bg-white border-bottom py-2.5 px-3.5 d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-info-subtle text-info rounded-3 p-1.5 me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                            <iconify-icon icon="solar:shield-check-bold-duotone" style={{ fontSize: '18px' }}></iconify-icon>
                                        </div>
                                        <div>
                                            <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '14px' }}>
                                                KYC Documents &amp; Bank Details
                                            </h6>
                                            <small className="text-muted" style={{ fontSize: '10.5px' }}>Identity &amp; settlement bank credentials</small>
                                        </div>
                                    </div>
                                    {kyc?.kyc_completed ? (
                                        <span className="badge bg-success text-white fw-bold px-2 py-0.5" style={{ fontSize: '9.5px' }}>✓ FULLY VERIFIED</span>
                                    ) : (
                                        <span className="badge bg-warning text-dark fw-bold px-2 py-0.5" style={{ fontSize: '9.5px' }}>PENDING</span>
                                    )}
                                </div>

                                <div className="card-body p-3.5">
                                    {/* Official Identity Documents Section */}
                                    <div className="d-flex align-items-center gap-1.5 mb-2.5 pb-1 border-bottom">
                                        <iconify-icon icon="solar:verified-check-bold-duotone" className="text-info fs-5"></iconify-icon>
                                        <span className="fw-bold text-info text-uppercase" style={{ fontSize: '11.5px', letterSpacing: '0.4px' }}>Official Identity Documents</span>
                                    </div>

                                    <div className="row g-2 mb-3.5">
                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                                <div className="d-flex justify-content-between align-items-center mb-0.5">
                                                    <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.4px' }}>Aadhaar Number</small>
                                                    {kyc?.aadhar_verified ? (
                                                        <span className="badge bg-success-subtle text-success fw-bold py-0 px-1" style={{ fontSize: '8.5px' }}>✓ Verified</span>
                                                    ) : (
                                                        <span className="badge bg-secondary-subtle text-secondary fw-bold py-0 px-1" style={{ fontSize: '8.5px' }}>Unverified</span>
                                                    )}
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <span className="fw-bold text-dark font-monospace" style={{ fontSize: '12.5px' }}>
                                                        {kyc?.aadhar_number ? kyc.aadhar_number : 'N/A'}
                                                    </span>
                                                    {kyc?.aadhar_number && (
                                                        <button
                                                            className="btn btn-sm btn-link p-0 text-primary border-0 d-inline-flex align-items-center"
                                                            onClick={() => handleCopy(kyc.aadhar_number, 'aadhar')}
                                                            title="Copy Aadhaar Number"
                                                        >
                                                            <iconify-icon icon={copiedField === 'aadhar' ? "solar:check-circle-bold" : "solar:copy-bold"} style={{ fontSize: '14px' }}></iconify-icon>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                                <div className="d-flex justify-content-between align-items-center mb-0.5">
                                                    <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.4px' }}>PAN Number</small>
                                                    {kyc?.pan_verified ? (
                                                        <span className="badge bg-success-subtle text-success fw-bold py-0 px-1" style={{ fontSize: '8.5px' }}>✓ Verified</span>
                                                    ) : (
                                                        <span className="badge bg-secondary-subtle text-secondary fw-bold py-0 px-1" style={{ fontSize: '8.5px' }}>Unverified</span>
                                                    )}
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <span className="fw-bold text-primary font-monospace text-uppercase" style={{ fontSize: '12.5px' }}>
                                                        {kyc?.pan_number ? kyc.pan_number : 'N/A'}
                                                    </span>
                                                    {kyc?.pan_number && (
                                                        <button
                                                            className="btn btn-sm btn-link p-0 text-primary border-0 d-inline-flex align-items-center"
                                                            onClick={() => handleCopy(kyc.pan_number, 'pan')}
                                                            title="Copy PAN Number"
                                                        >
                                                            <iconify-icon icon={copiedField === 'pan' ? "solar:check-circle-bold" : "solar:copy-bold"} style={{ fontSize: '14px' }}></iconify-icon>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase mb-0.5" style={{ fontSize: '9px', letterSpacing: '0.4px' }}>DigiLocker Status</small>
                                                {kyc?.digilocker_verified ? (
                                                    <span className="fw-bold text-success d-flex align-items-center gap-1" style={{ fontSize: '12px' }}>
                                                        <iconify-icon icon="solar:check-circle-bold" style={{ fontSize: '15px' }}></iconify-icon>
                                                        DigiLocker Verified
                                                    </span>
                                                ) : (
                                                    <span className="fw-bold text-muted" style={{ fontSize: '12px' }}>Not Linked</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase mb-0.5" style={{ fontSize: '9px', letterSpacing: '0.4px' }}>KYC Verified Date</small>
                                                <span className="fw-bold text-dark d-block" style={{ fontSize: '12.5px' }}>{formatDate(kyc?.verified_at || kyc?.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Verified Bank Account Details Section */}
                                    <div className="d-flex align-items-center gap-1.5 mb-2.5 pb-1 border-bottom">
                                        <iconify-icon icon="solar:card-transfer-bold-duotone" className="text-success fs-5"></iconify-icon>
                                        <span className="fw-bold text-success text-uppercase" style={{ fontSize: '11.5px', letterSpacing: '0.4px' }}>Verified Bank Account Details</span>
                                    </div>

                                    <div className="row g-2">
                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.4px' }}>Account Holder Name</small>
                                                <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '12.5px' }}>
                                                    {kyc?.name || user?.name || 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.4px' }}>Bank Name</small>
                                                <span className="fw-bold text-primary text-truncate d-block" style={{ fontSize: '12.5px' }}>
                                                    {kyc?.bank_name || 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.4px' }}>Account Number</small>
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <span className="fw-bold text-dark font-monospace text-truncate" style={{ fontSize: '12.5px' }}>
                                                        {kyc?.account_number || 'N/A'}
                                                    </span>
                                                    {kyc?.account_number && (
                                                        <button
                                                            className="btn btn-sm btn-link p-0 text-primary border-0 ms-1 d-inline-flex align-items-center"
                                                            onClick={() => handleCopy(kyc.account_number, 'account')}
                                                            title="Copy Account Number"
                                                        >
                                                            <iconify-icon icon={copiedField === 'account' ? "solar:check-circle-bold" : "solar:copy-bold"} style={{ fontSize: '14px' }}></iconify-icon>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }}>
                                                <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.4px' }}>IFSC Code &amp; Branch</small>
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <span className="fw-bold text-primary font-monospace text-truncate" style={{ fontSize: '12.5px' }}>
                                                        {kyc?.ifsc_code || kyc?.account_ifsc || 'N/A'} {kyc?.branch ? `(${kyc.branch})` : ''}
                                                    </span>
                                                    {(kyc?.ifsc_code || kyc?.account_ifsc) && (
                                                        <button
                                                            className="btn btn-sm btn-link p-0 text-primary border-0 ms-1 d-inline-flex align-items-center"
                                                            onClick={() => handleCopy(kyc?.ifsc_code || kyc?.account_ifsc, 'ifsc')}
                                                            title="Copy IFSC Code"
                                                        >
                                                            <iconify-icon icon={copiedField === 'ifsc' ? "solar:check-circle-bold" : "solar:copy-bold"} style={{ fontSize: '14px' }}></iconify-icon>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                    {user?.is_api_partner == 1 && (
                                        <>
                                            {/* API Details Section */}
                                            <div className="d-flex align-items-center gap-1.5 mt-3.5 mb-2.5 pb-1 border-bottom">
                                                <iconify-icon icon="solar:key-minimalistic-square-bold-duotone" className="text-success fs-5"></iconify-icon>
                                                <span className="fw-bold text-success text-uppercase" style={{ fontSize: '11.5px', letterSpacing: '0.4px' }}>API Details</span>
                                            </div>

                                            <div className="row g-2">
                                                <div className="col-sm-6">
                                                    <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }}>
                                                        <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.4px' }}>MID</small>
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <span className="fw-bold text-dark font-monospace text-truncate" style={{ fontSize: '12.5px' }}>
                                                                {user?.mid || 'N/A'}
                                                            </span>
                                                            {user?.mid && (
                                                                <button
                                                                    className="btn btn-sm btn-link p-0 text-primary border-0 ms-1 d-inline-flex align-items-center"
                                                                    onClick={() => handleCopy(user.mid, 'mid_api')}
                                                                    title="Copy MID"
                                                                >
                                                                    <iconify-icon icon={copiedField === 'mid_api' ? "solar:check-circle-bold" : "solar:copy-bold"} style={{ fontSize: '14px' }}></iconify-icon>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-sm-6">
                                                    <div className="p-2 px-2.5 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }}>
                                                        <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.4px' }}>MKEY</small>
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <span className="fw-bold text-primary font-monospace text-truncate" style={{ fontSize: '12.5px' }}>
                                                                {user?.mkey || 'N/A'}
                                                            </span>
                                                            {user?.mkey && (
                                                                <button
                                                                    className="btn btn-sm btn-link p-0 text-primary border-0 ms-1 d-inline-flex align-items-center"
                                                                    onClick={() => handleCopy(user.mkey, 'mkey')}
                                                                    title="Copy MKEY"
                                                                >
                                                                    <iconify-icon icon={copiedField === 'mkey' ? "solar:check-circle-bold" : "solar:copy-bold"} style={{ fontSize: '14px' }}></iconify-icon>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}


                                </div>


                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </>
    );
};

export default UserProfile;
