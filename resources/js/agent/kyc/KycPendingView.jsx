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
    const [aadharNumber, setAadharNumber] = useState('');
    const [refid, setRefid] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [verifiedData, setVerifiedData] = useState(null);
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
        setVerifiedData(null);
        setShowModal(true);
    };

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
                toast.success(res.data.message || 'OTP sent successfully!');
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

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            return toast.error('Please enter the 6-digit OTP sent to Aadhaar linked mobile.');
        }

        try {
            setVerifyingOtp(true);
            const res = await api.vPost('/api/agent/financial/kyc/verify-aadhaar-otp', {
                aadhar_number: aadharNumber,
                refid: refid,
                otp: otp
            });

            if (res.data && res.data.status === 1) {
                toast.success(res.data.message || 'Aadhaar Verified Successfully!');
                setVerifiedData(res.data.aadhaar_data);
            } else {
                toast.error(res.data?.message || 'Aadhaar OTP verification failed.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification failed.');
        } finally {
            setVerifyingOtp(false);
        }
    };

    const handleApproveAndSave = async () => {
        if (!verifiedData) {
            return toast.error('Aadhaar OTP verification is mandatory. Please verify OTP first.');
        }

        try {
            setSubmittingApprove(true);
            const res = await api.vPost(`/api/agent/financial/kyc-submit/${selectedMember.id}`, {
                ...verifiedData,
                aadhar_number: aadharNumber,
                verified: true
            });

            if (res.data && res.data.status === 1) {
                toast.success(res.data.message || 'Member KYC Approved & Verified Data Saved!');
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

    return (
        <div className="container-fluid py-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom">
                <div>
                    <h3 className="fw-bold text-dark mb-1">
                        <i className="bx bx-id-card text-warning me-2"></i> Member KYC Verification Queue
                    </h3>
                    <p className="text-muted mb-0">Complete member Aadhaar OTP verification to approve KYC</p>
                </div>
                <div className="d-flex gap-2">
                    <Link to="/agent/financial-dashboard" className="btn btn-secondary fw-bold shadow-sm me-2">
                        <i className="bx bx-arrow-back me-1"></i> Back to Financial Dashboard
                    </Link>
                    <button className="btn btn-outline-primary" onClick={fetchKycPending}>
                        <i className="bx bx-refresh me-1"></i> Refresh List
                    </button>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-3">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Member ID</th>
                                <th>Member Name</th>
                                <th>Mobile</th>
                                <th>Current KYC Status</th>
                                <th>Date Registered</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4">Loading KYC queue...</td></tr>
                            ) : members.length > 0 ? (
                                members.map((m) => (
                                    <tr key={m.id}>
                                        <td className="fw-bold text-primary">{m.member_id}</td>
                                        <td className="fw-semibold">{m.name}</td>
                                        <td>{m.mobile}</td>
                                        <td>
                                            <span className={`badge ${m.kyc_status === 'APPROVED' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                {m.kyc_status}
                                            </span>
                                        </td>
                                        <td className="small text-muted">{new Date(m.created_at).toLocaleDateString()}</td>
                                        <td className="text-end">
                                            <button className="btn btn-sm btn-primary fw-bold me-2" onClick={() => openCompleteKycModal(m)}>
                                                <i className="bx bx-id-card me-1"></i> Complete KYC
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center py-4 text-muted">No pending KYC verifications found in queue.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Complete KYC Modal */}
            {showModal && selectedMember && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header bg-gradient bg-primary text-white border-0 py-3 rounded-top-4">
                                <h5 className="modal-title fw-bold">
                                    <i className="bx bx-id-card me-2"></i> Complete Member KYC Verification
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>

                            <div className="modal-body p-4">
                                {/* Member Info Header Card */}
                                <div className="bg-light p-3 rounded-3 mb-4 border d-flex justify-content-between align-items-center">
                                    <div>
                                        <span className="text-muted small d-block">Member Name</span>
                                        <strong className="fs-5 text-dark">{selectedMember.name}</strong>
                                    </div>
                                    <div>
                                        <span className="text-muted small d-block">Member ID</span>
                                        <span className="badge bg-primary fs-6">{selectedMember.member_id}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted small d-block">Mobile Number</span>
                                        <strong className="text-dark">{selectedMember.mobile}</strong>
                                    </div>
                                </div>

                                {/* Step 1 & 2: Aadhaar Entry & OTP Verification */}
                                <div className="card border p-3 rounded-3 mb-4">


                                    <div className="row g-3 align-items-center">
                                        <div className="col-md-7">
                                            <label className="form-label fw-semibold">12-Digit Aadhaar Number <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg fw-bold tracking-wider"
                                                placeholder="Enter 12-Digit Aadhaar No"
                                                maxLength="12"
                                                value={aadharNumber}
                                                onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, ''))}
                                                disabled={otpSent || verifiedData}
                                            />
                                        </div>
                                        <div className="col-md-5 d-flex align-items-end " style={{ marginTop: "45px" }}>
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
                                                            <i className="bx bx-paper-plane me-1"></i> Send OTP
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <small className="text-success fw-bold">
                                                    <i className="bx bx-check-circle me-1"></i> OTP Sent to Mobile!
                                                </small>
                                            )}
                                        </div>
                                    </div>

                                    {/* OTP Entry Row */}
                                    {otpSent && !verifiedData && (
                                        <div className="mt-3 pt-3 border-top">
                                            <div className="row g-3 align-items-center">
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
                                                <div className="col-md-5 d-flex align-items-end">
                                                    <button
                                                        type="button"
                                                        className="btn btn-info text-white w-100 py-2 fw-bold"
                                                        onClick={handleVerifyOtp}
                                                        disabled={verifyingOtp || otp.length !== 6}
                                                    >
                                                        {verifyingOtp ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                                Verifying...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="bx bx-check-shield me-1"></i> Verify OTP
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Step 3: Verified Data Preview */}
                                {verifiedData ? (
                                    <div className="card border shadow-sm rounded-3 mb-3 overflow-hidden" style={{ backgroundColor: '#ffffff', borderColor: '#198754' }}>
                                        {/* Card Header Bar */}
                                        <div className="d-flex align-items-center justify-content-between p-3 border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="bx bxs-check-circle text-success fs-4"></i>
                                                <div>
                                                    <h6 className="fw-bold text-dark mb-0">Step 2: Verified Aadhaar Information</h6>
                                                    <small className="text-muted">UIDAI Aadhaar Verification Details</small>
                                                </div>
                                            </div>
                                            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-semibold">
                                                <i className="bx bx-check me-1"></i> VERIFIED
                                            </span>
                                        </div>

                                        {/* Card Body Content */}
                                        <div className="p-3" style={{ backgroundColor: '#ffffff' }}>
                                            <div className="row g-3">
                                                {verifiedData.photo && (
                                                    <div className="col-md-3 text-center border-end pe-md-3">
                                                        <div className="position-relative d-inline-block">
                                                            <img
                                                                src={verifiedData.photo}
                                                                alt="Aadhaar Photo"
                                                                className="img-thumbnail rounded-3 shadow-sm mb-2"
                                                                style={{ width: '110px', height: '130px', objectFit: 'cover', border: '2px solid #198754' }}
                                                            />
                                                        </div>
                                                        <small className="d-block text-muted fw-medium">Aadhaar Photo</small>
                                                    </div>
                                                )}

                                                <div className={verifiedData.photo ? "col-md-9 ps-md-3" : "col-md-12"}>
                                                    <div className="row g-2">
                                                        <div className="col-md-6">
                                                            <div className="p-2 rounded bg-light border">
                                                                <span className="text-muted small d-block text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Aadhaar Name</span>
                                                                <strong className="text-dark fs-6">{verifiedData.name || 'N/A'}</strong>
                                                            </div>
                                                        </div>

                                                        <div className="col-md-6">
                                                            <div className="p-2 rounded bg-light border">
                                                                <span className="text-muted small d-block text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Date of Birth</span>
                                                                <strong className="text-dark fs-6">{verifiedData.dob || 'N/A'}</strong>
                                                            </div>
                                                        </div>

                                                        {verifiedData.care_of && (
                                                            <div className="col-md-12">
                                                                <div className="p-2 rounded bg-light border">
                                                                    <span className="text-muted small d-block text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Care Of / Father Name</span>
                                                                    <strong className="text-dark">{verifiedData.care_of}</strong>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="col-md-6">
                                                            <div className="p-2 rounded bg-light border">
                                                                <span className="text-muted small d-block text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Gender</span>
                                                                <strong className="text-dark text-capitalize">{verifiedData.gender || 'N/A'}</strong>
                                                            </div>
                                                        </div>

                                                        <div className="col-md-6">
                                                            <div className="p-2 rounded bg-light border">
                                                                <span className="text-muted small d-block text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Aadhaar Number</span>
                                                                <strong className="text-primary fs-6">{aadharNumber}</strong>
                                                            </div>
                                                        </div>

                                                        <div className="col-md-12">
                                                            <div className="p-2 rounded bg-light border">
                                                                <span className="text-muted small d-block text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Full Address</span>
                                                                <span className="fw-medium text-dark small d-block">{verifiedData.address || `${verifiedData.state || ''} ${verifiedData.pincode || ''}`}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="alert alert-warning py-2 small mb-0">
                                        <i className="bx bx-info-circle me-1"></i>
                                        KYC approval requires verified Aadhaar data. Please send and verify OTP to proceed.
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer bg-light border-0 py-3 px-4 rounded-bottom-4 d-flex justify-content-between">
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>

                                {verifiedData ? (
                                    <button
                                        type="button"
                                        className="btn btn-success px-4 fw-bold shadow-sm"
                                        onClick={handleApproveAndSave}
                                        disabled={submittingApprove}
                                    >
                                        {submittingApprove ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Saving & Approving KYC...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bx bx-check-double me-1"></i> Approve KYC & Save Verified Data
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button type="button" className="btn btn-secondary px-4 fw-bold" disabled>
                                        Approve KYC (Aadhaar Verification Pending)
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
