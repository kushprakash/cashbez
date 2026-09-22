import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApiService from '../../core/services/ApiService';

const KycPendingView = () => {
    const api = ApiService();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    // Step 1: Aadhaar state
    const [aadharNumber, setAadharNumber] = useState('');
    const [refid, setRefid] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [verifiedData, setVerifiedData] = useState(null);

    // Step 2: Bank Account state
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [verifyingBank, setVerifyingBank] = useState(false);
    const [verifiedBankData, setVerifiedBankData] = useState(null);

    // Step 3: Approval state
    const [submittingApprove, setSubmittingApprove] = useState(false);

    const fetchKycPending = async () => {
        try {
            setLoading(true);
            const res = await api.vGet('/api/agent/financial/kyc-pending');
            if (res.data && res.data.status === 1) {
                setMembers(res.data.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch KYC pending members', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKycPending();
    }, []);

    const openCompleteKycModal = (member) => {
        setSelectedMember(member);
        setAadharNumber(member.aadhar_number || '');
        setRefid('');
        setOtp('');
        setOtpSent(false);

        // If member already has aadhar_verified == true in database, restore it immediately
        if (member.aadhar_verified) {
            setVerifiedData({
                name: member.name,
                care_of: member.father_name,
                dob: member.dob,
                gender: member.gender,
                address: member.address,
                state: member.state,
                pincode: member.pincode,
                photo: member.photo,
                aadhar_number: member.aadhar_number,
                verified: true
            });
        } else {
            setVerifiedData(null);
        }

        // Bank Account state restoration
        setAccountNumber(member.account_number || '');
        setIfscCode(member.ifsc_code || '');
        if (member.account_verified) {
            setVerifiedBankData({
                account_number: member.account_number,
                ifsc_code: member.ifsc_code,
                bank_name: member.bank_name,
                branch: member.bank_branch,
                account_holder_name: member.account_holder_name,
                verified: true
            });
        } else {
            setVerifiedBankData(null);
        }

        setShowModal(true);
    };

    // Step 1: Send Aadhaar OTP
    const handleSendOtp = async () => {
        if (!aadharNumber || aadharNumber.length !== 12) {
            return toast.error('Please enter a valid 12-digit Aadhaar Number.');
        }

        try {
            setSendingOtp(true);
            const res = await api.vPost('/api/agent/financial/kyc/send-aadhaar-otp', {
                aadhar_number: aadharNumber
            });

            if (res.data && res.data.status === 1) {
                toast.success(res.data.message || 'OTP sent successfully to Aadhaar linked mobile!');
                setRefid(res.data.refid || '');
                setOtpSent(true);
            } else {
                toast.error(res.data?.message || 'Failed to send Aadhaar OTP.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP.');
        } finally {
            setSendingOtp(false);
        }
    };

    // Step 1: Verify Aadhaar OTP (Immediately saves to DB so it is never lost on logout)
    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            return toast.error('Please enter the 6-digit OTP sent to Aadhaar linked mobile.');
        }

        try {
            setVerifyingOtp(true);
            const res = await api.vPost('/api/agent/financial/kyc/verify-aadhaar-otp', {
                aadhar_number: aadharNumber,
                refid: refid,
                otp: otp,
                member_id: selectedMember?.id
            });

            if (res.data && res.data.status === 1) {
                toast.success(res.data.message || 'Aadhaar Verified & Saved Successfully!');
                setVerifiedData(res.data.aadhaar_data);
                if (res.data.member) {
                    setSelectedMember(res.data.member);
                }
                fetchKycPending();
            } else {
                toast.error(res.data?.message || 'Aadhaar OTP verification failed.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification failed.');
        } finally {
            setVerifyingOtp(false);
        }
    };

    // Step 2: Verify Bank Account (/api/v2/verify/bank-account via backend)
    const handleVerifyBankAccount = async () => {
        if (!accountNumber || accountNumber.trim().length < 6) {
            return toast.error('Please enter a valid Bank Account Number.');
        }
        if (!ifscCode || ifscCode.trim().length !== 11) {
            return toast.error('Please enter a valid 11-character IFSC Code.');
        }

        try {
            setVerifyingBank(true);
            const res = await api.vPost('/api/agent/financial/kyc/verify-bank-account', {
                member_id: selectedMember?.id,
                account_number: accountNumber.trim(),
                ifsc_code: ifscCode.trim().toUpperCase()
            });

            if (res.data && res.data.status === 1) {
                toast.success(res.data.message || 'Bank Account Verified & Saved Successfully!');
                setVerifiedBankData(res.data.bank_data);
                if (res.data.member) {
                    setSelectedMember(res.data.member);
                }
                fetchKycPending();
            } else {
                toast.error(res.data?.message || 'Bank Account verification failed.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Bank verification failed.');
        } finally {
            setVerifyingBank(false);
        }
    };

    // Step 3: Final KYC Approval & Submit
    const handleApproveAndSave = async () => {
        const isAadhaarDone = !!verifiedData || !!selectedMember?.aadhar_verified;
        const isBankDone = !!verifiedBankData || !!selectedMember?.account_verified;

        if (!isAadhaarDone) {
            return toast.error('Aadhaar OTP verification is mandatory. Please verify Aadhaar first.');
        }
        if (!isBankDone) {
            return toast.error('Bank Account verification is mandatory. Please verify Bank Account first.');
        }

        try {
            setSubmittingApprove(true);
            const res = await api.vPost(`/api/agent/financial/kyc-submit/${selectedMember.id}`, {
                ...(verifiedData || {}),
                aadhar_number: aadharNumber,
                account_number: accountNumber,
                ifsc_code: ifscCode,
                bank_name: verifiedBankData?.bank_name,
                bank_branch: verifiedBankData?.branch,
                account_holder_name: verifiedBankData?.account_holder_name,
                verified: true,
                aadhar_verified: true,
                account_verified: true
            });

            if (res.data && res.data.status === 1) {
                toast.success(res.data.message || 'Member KYC Approved & Verified Successfully!');
                setShowModal(false);
                fetchKycPending();
            } else {
                toast.error(res.data?.message || 'Failed to approve KYC.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit KYC approval.');
        } finally {
            setSubmittingApprove(false);
        }
    };

    const isAadhaarVerified = !!verifiedData || !!selectedMember?.aadhar_verified;
    const isBankVerified = !!verifiedBankData || !!selectedMember?.account_verified;
    const canApprove = isAadhaarVerified && isBankVerified;

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom">
                <div>
                    <h3 className="fw-bold text-dark mb-1">
                        <i className="bx bx-id-card text-primary me-2"></i> Member KYC Verification Queue
                    </h3>
                    <p className="text-muted mb-0">
                        Complete Member <strong>Aadhaar OTP</strong> and <strong>Bank Account Verification</strong> to approve KYC
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <Link to="/agent/financial-dashboard" className="btn btn-secondary fw-bold shadow-sm me-2">
                        <i className="bx bx-arrow-back me-1"></i> Back to Financial Dashboard
                    </Link>
                    <button className="btn btn-outline-primary" onClick={fetchKycPending}>
                        <i className="bx bx-refresh me-1"></i> Refresh Queue
                    </button>
                </div>
            </div>

            {/* Pending Members Table */}
            <div className="card border-0 shadow-sm rounded-3">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Member ID</th>
                                <th>Member Name</th>
                                <th>Mobile</th>
                                <th>Aadhaar Status</th>
                                <th>Bank Account Status</th>
                                <th>KYC Status</th>
                                <th>Registered</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-4 text-muted">
                                        <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                                        Loading KYC queue...
                                    </td>
                                </tr>
                            ) : members.length > 0 ? (
                                members.map((m) => (
                                    <tr key={m.id}>
                                        <td className="fw-bold text-primary">{m.member_id}</td>
                                        <td className="fw-semibold text-dark">{m.name}</td>
                                        <td>{m.mobile}</td>
                                        <td>
                                            {m.aadhar_verified ? (
                                                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                                                    <i className="bx bx-check-circle me-1"></i> Aadhaar Verified
                                                </span>
                                            ) : (
                                                <span className="badge bg-light text-muted border px-2 py-1">
                                                    <i className="bx bx-time-five me-1"></i> Aadhaar Pending
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {m.account_verified ? (
                                                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                                                    <i className="bx bx-check-circle me-1"></i> Account Verified
                                                </span>
                                            ) : (
                                                <span className="badge bg-light text-muted border px-2 py-1">
                                                    <i className="bx bx-time-five me-1"></i> Account Pending
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${m.kyc_status === 'APPROVED' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                {m.kyc_status}
                                            </span>
                                        </td>
                                        <td className="small text-muted">{new Date(m.created_at).toLocaleDateString()}</td>
                                        <td className="text-end">
                                            <button className="btn btn-sm btn-primary fw-bold shadow-sm" onClick={() => openCompleteKycModal(m)}>
                                                <i className="bx bx-id-card me-1"></i> Complete KYC
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-4 text-muted">
                                        No pending KYC verifications found in queue.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Complete KYC Modal (Aadhaar + Bank Account Verification) */}
            {showModal && selectedMember && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 1070 }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: '850px' }}>
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                            {/* Modal Header */}
                            <div className="modal-header bg-primary text-white border-0 py-3">
                                <div className="d-flex align-items-center">
                                    <i className="bx bx-shield-quarter fs-3 me-2"></i>
                                    <div>
                                        <h5 className="modal-title fw-bold mb-0">Member KYC Verification</h5>
                                        <small className="opacity-75">Step 1: Aadhaar OTP &bull; Step 2: Bank Account &bull; Step 3: Approve</small>
                                    </div>
                                </div>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>

                            <div className="modal-body p-4" style={{ maxHeight: '76vh', overflowY: 'auto' }}>
                                {/* Member Info Header Card */}
                                <div className="bg-light p-3 rounded-3 mb-4 border d-flex flex-wrap justify-content-between align-items-center gap-2">
                                    <div>
                                        <span className="text-muted small d-block">Member Name</span>
                                        <strong className="fs-6 text-dark">{selectedMember.name}</strong>
                                    </div>
                                    <div>
                                        <span className="text-muted small d-block">Member ID</span>
                                        <span className="badge bg-primary fs-6">{selectedMember.member_id}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted small d-block">Mobile Number</span>
                                        <strong className="text-dark">{selectedMember.mobile}</strong>
                                    </div>
                                    <div>
                                        <span className="text-muted small d-block">Current KYC</span>
                                        <span className={`badge ${selectedMember.kyc_status === 'APPROVED' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                            {selectedMember.kyc_status}
                                        </span>
                                    </div>
                                </div>

                                {/* Stepper Visual Tracker */}
                                <div className="row g-2 mb-4 text-center">
                                    <div className="col-6">
                                        <div className={`p-2 rounded-3 border ${isAadhaarVerified ? 'bg-success-subtle border-success text-success fw-bold' : 'bg-primary-subtle border-primary text-primary fw-bold'}`}>
                                            <i className={`bx ${isAadhaarVerified ? 'bx-check-circle' : 'bx-radio-circle-marked'} me-1`}></i>
                                            Step 1: Aadhaar Verification {isAadhaarVerified && '✓'}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className={`p-2 rounded-3 border ${isBankVerified ? 'bg-success-subtle border-success text-success fw-bold' : (!isAadhaarVerified ? 'bg-light text-muted' : 'bg-info-subtle border-info text-dark fw-bold')}`}>
                                            <i className={`bx ${isBankVerified ? 'bx-check-circle' : (!isAadhaarVerified ? 'bx-lock-alt' : 'bx-radio-circle-marked')} me-1`}></i>
                                            Step 2: Account Verification {isBankVerified && '✓'}
                                        </div>
                                    </div>
                                </div>

                                {/* ========================================================= */}
                                {/* STEP 1: AADHAAR VERIFICATION                             */}
                                {/* ========================================================= */}
                                <div className="card border rounded-3 mb-4 overflow-hidden">
                                    <div className="card-header bg-light d-flex justify-content-between align-items-center py-2 px-3">
                                        <div className="fw-bold text-dark d-flex align-items-center">
                                            <i className="bx bx-id-card text-primary fs-5 me-2"></i>
                                            <span>Step 1: Aadhaar Verification (UIDAI OTP)</span>
                                        </div>
                                        {isAadhaarVerified ? (
                                            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                                                <i className="bx bx-check me-1"></i> Aadhaar Verified & Saved
                                            </span>
                                        ) : (
                                            <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1">
                                                Verification Pending
                                            </span>
                                        )}
                                    </div>

                                    <div className="card-body p-3">
                                        {isAadhaarVerified ? (
                                            /* Verified Aadhaar Card */
                                            <div className="bg-white rounded-3">
                                                <div className="row g-3 align-items-center">
                                                    {verifiedData?.photo && (
                                                        <div className="col-md-3 text-center border-end pe-md-3">
                                                            <img
                                                                src={verifiedData.photo}
                                                                alt="Aadhaar Photo"
                                                                className="img-thumbnail rounded-3 shadow-sm mb-1"
                                                                style={{ width: '100px', height: '120px', objectFit: 'cover', border: '2px solid #198754' }}
                                                            />
                                                            <small className="d-block text-success fw-semibold">
                                                                <i className="bx bx-check-circle me-1"></i> UIDAI Photo
                                                            </small>
                                                        </div>
                                                    )}
                                                    <div className={verifiedData?.photo ? "col-md-9 ps-md-3" : "col-md-12"}>
                                                        <div className="row g-2">
                                                            <div className="col-md-6">
                                                                <div className="p-2 rounded bg-light border">
                                                                    <span className="text-muted small d-block">Aadhaar Name</span>
                                                                    <strong className="text-dark">{verifiedData?.name || selectedMember.name}</strong>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="p-2 rounded bg-light border">
                                                                    <span className="text-muted small d-block">Aadhaar Number</span>
                                                                    <strong className="text-primary font-monospace">{aadharNumber || selectedMember.aadhar_number || 'Verified'}</strong>
                                                                </div>
                                                            </div>
                                                            {verifiedData?.care_of && (
                                                                <div className="col-md-6">
                                                                    <div className="p-2 rounded bg-light border">
                                                                        <span className="text-muted small d-block">Care Of / Father</span>
                                                                        <span className="text-dark fw-medium">{verifiedData.care_of}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {verifiedData?.dob && (
                                                                <div className="col-md-6">
                                                                    <div className="p-2 rounded bg-light border">
                                                                        <span className="text-muted small d-block">Date of Birth</span>
                                                                        <span className="text-dark fw-medium">{verifiedData.dob}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="col-12">
                                                                <div className="p-2 rounded bg-light border">
                                                                    <span className="text-muted small d-block">Registered Address</span>
                                                                    <span className="text-dark small">
                                                                        {verifiedData?.address || `${selectedMember.address || ''} ${selectedMember.state || ''} ${selectedMember.pincode || ''}`}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="alert alert-success mt-3 py-2 small mb-0 d-flex align-items-center">
                                                    <i className="bx bx-check-shield fs-5 me-2 text-success"></i>
                                                    <span>Aadhaar data is permanently verified and saved. It will remain preserved even after logout.</span>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Unverified: Aadhaar Entry & OTP form */
                                            <div>
                                                <div className="row g-3 align-items-end">
                                                    <div className="col-md-7">
                                                        <label className="form-label fw-semibold">12-Digit Aadhaar Number <span className="text-danger">*</span></label>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-lg fw-bold tracking-wider"
                                                            placeholder="Enter 12-Digit Aadhaar Number"
                                                            maxLength="12"
                                                            value={aadharNumber}
                                                            onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, ''))}
                                                            disabled={otpSent}
                                                        />
                                                    </div>
                                                    <div className="col-md-5">
                                                        {!otpSent ? (
                                                            <button
                                                                type="button"
                                                                className="btn btn-primary w-100 py-2 fw-bold"
                                                                onClick={handleSendOtp}
                                                                disabled={sendingOtp || aadharNumber.length !== 12}
                                                            >
                                                                {sendingOtp ? (
                                                                    <>
                                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                                        Sending OTP...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <i className="bx bx-paper-plane me-1"></i> Send Aadhaar OTP
                                                                    </>
                                                                )}
                                                            </button>
                                                        ) : (
                                                            <div className="text-success fw-bold py-2">
                                                                <i className="bx bx-check-circle me-1"></i> OTP Sent to Mobile!
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* OTP Entry Row */}
                                                {otpSent && (
                                                    <div className="mt-3 pt-3 border-top">
                                                        <div className="row g-3 align-items-end">
                                                            <div className="col-md-7">
                                                                <label className="form-label fw-semibold">Enter 6-Digit Aadhaar OTP <span className="text-danger">*</span></label>
                                                                <input
                                                                    type="password"
                                                                    className="form-control form-control-lg text-center fw-bold fs-4 tracking-widest"
                                                                    placeholder="••••••"
                                                                    maxLength="6"
                                                                    value={otp}
                                                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                                                    autoFocus
                                                                />
                                                            </div>
                                                            <div className="col-md-5">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-info text-white w-100 py-2 fw-bold"
                                                                    onClick={handleVerifyOtp}
                                                                    disabled={verifyingOtp || otp.length !== 6}
                                                                >
                                                                    {verifyingOtp ? (
                                                                        <>
                                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                                            Verifying OTP...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i className="bx bx-check-shield me-1"></i> Verify Aadhaar OTP
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ========================================================= */}
                                {/* STEP 2: BANK ACCOUNT VERIFICATION                         */}
                                {/* ========================================================= */}
                                <div className="card border rounded-3 mb-4 overflow-hidden">
                                    <div className="card-header bg-light d-flex justify-content-between align-items-center py-2 px-3">
                                        <div className="fw-bold text-dark d-flex align-items-center">
                                            <i className="bx bx-building-house text-success fs-5 me-2"></i>
                                            <span>Step 2: Bank Account Verification (/api/v2/verify/bank-account)</span>
                                        </div>
                                        {isBankVerified ? (
                                            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                                                <i className="bx bx-check me-1"></i> Account Verified & Saved
                                            </span>
                                        ) : (
                                            <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1">
                                                Account Pending
                                            </span>
                                        )}
                                    </div>

                                    <div className="card-body p-3">
                                        {!isAadhaarVerified ? (
                                            /* Locked state if Aadhaar is not yet verified */
                                            <div className="text-center py-3 text-muted">
                                                <i className="bx bx-lock-alt fs-2 text-warning mb-1"></i>
                                                <h6 className="fw-bold mb-1">Bank Account Verification Locked</h6>
                                                <small>Please complete Step 1 (Aadhaar OTP verification) above to unlock Bank Account Verification.</small>
                                            </div>
                                        ) : isBankVerified ? (
                                            /* Verified Bank Account Details Card */
                                            <div className="bg-white rounded-3">
                                                <div className="row g-2">
                                                    <div className="col-md-6">
                                                        <div className="p-2 rounded bg-light border">
                                                            <span className="text-muted small d-block">Account Holder Name (From Bank)</span>
                                                            <strong className="text-dark fs-6">
                                                                {verifiedBankData?.account_holder_name || selectedMember.account_holder_name || 'Verified'}
                                                            </strong>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="p-2 rounded bg-light border">
                                                            <span className="text-muted small d-block">Bank Name</span>
                                                            <strong className="text-primary fs-6">
                                                                {verifiedBankData?.bank_name || selectedMember.bank_name || 'N/A'}
                                                            </strong>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="p-2 rounded bg-light border">
                                                            <span className="text-muted small d-block">Bank Account Number</span>
                                                            <strong className="text-dark font-monospace">
                                                                {accountNumber || selectedMember.account_number}
                                                            </strong>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="p-2 rounded bg-light border">
                                                            <span className="text-muted small d-block">IFSC Code & Branch</span>
                                                            <strong className="text-dark font-monospace">
                                                                {ifscCode || selectedMember.ifsc_code} {verifiedBankData?.branch ? `(${verifiedBankData.branch})` : (selectedMember.bank_branch ? `(${selectedMember.bank_branch})` : '')}
                                                            </strong>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="alert alert-success mt-3 py-2 small mb-0 d-flex align-items-center">
                                                    <i className="bx bx-check-circle fs-5 me-2 text-success"></i>
                                                    <span>Bank Account validated successfully via banking gateway and linked to member record.</span>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Form to input Account No and IFSC */
                                            <div>
                                                <p className="text-muted small mb-3">
                                                    Enter member's Bank Account Number and IFSC code to verify account holder name and status.
                                                </p>
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label fw-semibold">
                                                            Bank Account Number <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-lg font-monospace fw-bold"
                                                            placeholder="Enter Bank Account No"
                                                            value={accountNumber}
                                                            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                                                            disabled={verifyingBank}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label fw-semibold">
                                                            Bank IFSC Code <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-lg text-uppercase font-monospace fw-bold"
                                                            placeholder="e.g. SBIN0001234"
                                                            maxLength="11"
                                                            value={ifscCode}
                                                            onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                                                            disabled={verifyingBank}
                                                        />
                                                    </div>
                                                    <div className="col-12 text-end">
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary px-4 py-2 fw-bold shadow-sm"
                                                            onClick={handleVerifyBankAccount}
                                                            disabled={verifyingBank || !accountNumber || ifscCode.length !== 11}
                                                        >
                                                            {verifyingBank ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                                    Verifying Bank Account...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="bx bx-check-shield me-1"></i> Verify Bank Account
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="modal-footer bg-light border-0 py-3 px-4 d-flex justify-content-between">
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                                    Cancel & Close
                                </button>

                                {canApprove ? (
                                    <button
                                        type="button"
                                        className="btn btn-success px-4 py-2 fw-bold shadow-sm"
                                        onClick={handleApproveAndSave}
                                        disabled={submittingApprove}
                                    >
                                        {submittingApprove ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Approving KYC...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bx bx-check-double me-1"></i> Approve KYC (Aadhaar + Account Verified)
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button type="button" className="btn btn-secondary px-4 py-2 fw-bold" disabled>
                                        <i className="bx bx-lock-alt me-1"></i>
                                        Approve KYC ({!isAadhaarVerified ? 'Aadhaar Pending' : 'Account Verification Pending'})
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KycPendingView;
