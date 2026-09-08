import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const EmployeeKycView = () => {
    const { userId } = useParams();
    const [kycData, setKycData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const apiService = ApiService();

    useEffect(() => {
        fetchKycData();
    }, [userId]);

    const fetchKycData = async () => {
        try {
            setLoading(true);
            const response = await apiService.vGet(`/api/kyc/details/${userId}`);
            
            if (response.data.status === 1) {
                setKycData(response.data.kyc);
                setUserData(response.data.user);
            } else {
                toast.error('KYC data not found');
            }
        } catch (error) {
            console.error('Error fetching KYC data:', error);
            toast.error('Error fetching KYC data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getKycStatusBadge = (isVerified) => {
        return (
            <span className={`badge ${isVerified ? 'bg-success' : 'bg-warning'}`}>
                {isVerified ? 'Verified' : 'Not Verified'}
            </span>
        );
    };

    const getKycCompletionStatus = () => {
        if (!kycData) return { status: 'Not Started', color: 'danger', percentage: 0 };
        
        let completed = 0;
        let total = 3; // Basic KYC: Aadhaar, PAN, Bank Account
        
        if (kycData.aadhar_verified) completed++;
        if (kycData.pan_verified) completed++;
        if (kycData.account_verified) completed++;
        
        // If corporate user (role 2), add corporate KYC requirement
        if (userData?.role === 2) {
            total = 4;
            if (kycData.kyc_completed) completed++;
        }
        
        const percentage = Math.round((completed / total) * 100);
        
        let status, color;
        if (percentage === 100) {
            status = 'Complete';
            color = 'success';
        } else if (percentage >= 50) {
            status = 'In Progress';
            color = 'warning';
        } else {
            status = 'Incomplete';
            color = 'danger';
        }
        
        return { status, color, percentage, completed, total };
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatAddress = () => {
        if (!kycData) return 'N/A';
        
        const addressParts = [
            kycData.house,
            kycData.street,
            kycData.landmark,
            kycData.vtc,
            kycData.po,
            kycData.subdist,
            kycData.dist,
            kycData.state,
            kycData.country,
            kycData.pincode
        ].filter(part => part && part.trim() !== '');
        
        return addressParts.length > 0 ? addressParts.join(', ') : 'N/A';
    };

    if (loading) {
        return (
            <>
                <Pageheader mainheading="Employee KYC" parentfolder="HRMS" activepage="KYC Details" />
                <div className="page-content-box">
                    <div className="page-content-box-inner">
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const completionStatus = getKycCompletionStatus();

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} />
            <Pageheader mainheading="User/Employee KYC" parentfolder="HRMS" activepage="KYC Details" />
            
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    {/* Header Card */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <div>
                                        <h4 className="mb-0">KYC Details - {userData?.name}</h4>
                                        <small className="text-muted">Employee ID: {userData?.employee?.emp_code || 'N/A'}</small>
                                    </div>
                                    {/* <Link to="/hrms/employees/list" className="btn btn-secondary">
                                        <i className="fa fa-arrow-left me-1"></i> Back to Employees
                                    </Link> */}
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-8">
                                            <h6>KYC Completion Status</h6>
                                            <div className="progress mb-2" style={{ height: '20px' }}>
                                                <div 
                                                    className={`progress-bar bg-${completionStatus.color}`} 
                                                    role="progressbar" 
                                                    style={{ width: `${completionStatus.percentage}%` }}
                                                >
                                                    {completionStatus.percentage}%
                                                </div>
                                            </div>
                                            <p className="mb-0">
                                                <span className={`badge bg-${completionStatus.color}`}>
                                                    {completionStatus.status}
                                                </span>
                                                <span className="ms-2 text-muted">
                                                    {completionStatus.completed} of {completionStatus.total} steps completed
                                                </span>
                                            </p>
                                        </div>
                                        <div className="col-md-4 text-end">
                                            {kycData?.verified_at && (
                                                <div>
                                                    <small className="text-muted">Verified on:</small><br/>
                                                    <strong>{formatDate(kycData.verified_at)}</strong>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KYC Steps */}
                    <div className="row">
                        {/* Aadhaar Verification */}
                        <div className="col-md-6 mb-4">
                            <div className="card h-100">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">
                                        <i className="fa fa-id-card me-2"></i>Aadhaar Verification
                                    </h5>
                                    {getKycStatusBadge(kycData?.aadhar_verified)}
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-8">
                                            {kycData?.aadhar_verified ? (
                                                <div>
                                                    <div className="row">
                                                        <div className="col-6 mb-2">
                                                            <strong>Name:</strong><br/>
                                                            {kycData.name || 'N/A'}
                                                        </div>
                                                        <div className="col-6 mb-2">
                                                            <strong>Aadhaar Number:</strong><br/>
                                                            {kycData.aadhar_number ? `****-****-${kycData.aadhar_number.slice(-4)}` : 'N/A'}
                                                        </div>
                                                        <div className="col-6 mb-2">
                                                            <strong>Gender:</strong><br/>
                                                            {kycData.gender || 'N/A'}
                                                        </div>
                                                        <div className="col-6 mb-2">
                                                            <strong>DOB:</strong><br/>
                                                            {formatDate(kycData.dob)}
                                                        </div>
                                                    </div>
                                                    <div className="row mt-2">
                                                        <div className="col-12">
                                                            <strong>Address:</strong><br/>
                                                            <small>{formatAddress()}</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-muted mb-0">Aadhaar verification not completed</p>
                                            )}
                                        </div>
                                        <div className="col-4 text-center">
                                            <div className="employee-photo">
                                                {kycData?.photo ? (
                                                    <img 
                                                        src={`${kycData.photo}`}
                                                        alt="Employee Photo"
                                                        className="img-fluid rounded-circle border"
                                                        style={{ 
                                                            width: '80px', 
                                                            height: '80px', 
                                                            objectFit: 'cover',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => setShowPhotoModal(true)}
                                                        title="Click to view larger image"
                                                    />
                                                ) : (
                                                    <div 
                                                        className="d-flex align-items-center justify-content-center"
                                                        style={{ 
                                                            width: '80px', 
                                                            height: '80px',
                                                            fontSize: '80px',
                                                            color: '#6c757d'
                                                        }}
                                                    >
                                                        <i className="fa fa-user-circle" aria-hidden="true"></i>
                                                    </div>
                                                )}
                                                <div className="mt-1">
                                                    <small className="text-muted" style={{ fontSize: '10px' }}>
                                                        {kycData?.photo ? (
                                                            <>
                                                                Photo
                                                                <br/>
                                                                <span style={{ fontSize: '8px' }}>
                                                                    <i className="fa fa-expand me-1"></i>
                                                                    Click to enlarge
                                                                </span>
                                                            </>
                                                        ) : 'No Photo'}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PAN Verification */}
                        <div className="col-md-6 mb-4">
                            <div className="card h-100">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">
                                        <i className="fa fa-credit-card me-2"></i>PAN Verification
                                    </h5>
                                    {getKycStatusBadge(kycData?.pan_verified)}
                                </div>
                                <div className="card-body">
                                    {kycData?.pan_verified ? (
                                        <div>
                                            <div className="row">
                                                <div className="col-12">
                                                    <strong>PAN Number:</strong><br/>
                                                    {kycData.pan_number ? `${kycData.pan_number.slice(0, 3)}***${kycData.pan_number.slice(-2)}` : 'N/A'}
                                                </div>
                                            </div>
                                            {kycData.response_pan && (
                                                <div className="mt-3">
                                                    <small className="text-muted">
                                                        <i className="fa fa-check-circle text-success me-1"></i>
                                                        PAN verified successfully
                                                    </small>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-muted mb-0">PAN verification not completed</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bank Account Verification */}
                        <div className="col-md-6 mb-4">
                            <div className="card h-100">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">
                                        <i className="fa fa-university me-2"></i>Bank Account Verification
                                    </h5>
                                    {getKycStatusBadge(kycData?.account_verified)}
                                </div>
                                <div className="card-body">
                                    {kycData?.account_verified ? (
                                        <div>
                                            <div className="row">
                                                <div className="col-6">
                                                    <strong>Bank Name:</strong><br/>
                                                    {kycData.bank_name || 'N/A'}
                                                </div>
                                                <div className="col-6">
                                                    <strong>Branch:</strong><br/>
                                                    {kycData.branch || 'N/A'}
                                                </div>
                                            </div>
                                            <div className="row mt-3">
                                                <div className="col-6">
                                                    <strong>Account Number:</strong><br/>
                                                    {kycData.account_number ? `****${kycData.account_number.slice(-4)}` : 'N/A'}
                                                </div>
                                                <div className="col-6">
                                                    <strong>IFSC Code:</strong><br/>
                                                    {kycData.ifsc_code || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-muted mb-0">Bank account verification not completed</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Corporate KYC (only for role 2) */}
                        {userData?.role === 2 && (
                            <div className="col-md-6 mb-4">
                                <div className="card h-100">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">
                                            <i className="fa fa-building me-2"></i>Corporate KYC
                                        </h5>
                                        {getKycStatusBadge(kycData?.kyc_completed)}
                                    </div>
                                    <div className="card-body">
                                        {kycData?.kyc_completed ? (
                                            <div>
                                                {kycData.business_details && (
                                                    <div>
                                                        <strong>Business Name:</strong><br/>
                                                        {JSON.parse(kycData.business_details)?.name || 'N/A'}
                                                        <br/><br/>
                                                        <strong>Business Type:</strong><br/>
                                                        {JSON.parse(kycData.business_details)?.type || 'N/A'}
                                                        <br/><br/>
                                                        <strong>GSTIN:</strong><br/>
                                                        {JSON.parse(kycData.business_details)?.gstin || 'N/A'}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-muted mb-0">Corporate KYC not completed</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Raw Data (for debugging - can be removed in production) */}
                    {kycData && (
                        <div className="row d-none">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h5 className="mb-0">Raw KYC Data (Debug)</h5>
                                    </div>
                                    <div className="card-body">
                                        <pre className="bg-light p-3" style={{ fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}>
                                            {JSON.stringify(kycData, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Photo Modal */}
            {showPhotoModal && kycData?.photo && (
                <div 
                    className="modal fade show" 
                    style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.8)' }}
                    onClick={() => setShowPhotoModal(false)}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fa fa-user me-2"></i>
                                    Employee Photo - {userData?.name}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setShowPhotoModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body text-center">
                                <img 
                                    src={`${kycData.photo}`}
                                    alt="Employee Photo"
                                    className="img-fluid rounded"
                                    style={{ 
                                        maxHeight: '500px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                    }}
                                />
                                <div className="mt-3">
                                    <p className="text-muted mb-1">
                                        <strong>Employee:</strong> {userData?.name}
                                    </p>
                                    <p className="text-muted mb-0">
                                        <strong>Employee ID:</strong> {userData?.employee?.emp_code || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowPhotoModal(false)}
                                >
                                    <i className="fa fa-times me-1"></i>
                                    Close
                                </button>
                                <a 
                                    href={`data:image/jpeg;base64,${kycData.photo}`}
                                    download={`${userData?.name}_photo.jpg`}
                                    className="btn btn-primary"
                                >
                                    <i className="fa fa-download me-1"></i>
                                    Download Photo
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EmployeeKycView;
