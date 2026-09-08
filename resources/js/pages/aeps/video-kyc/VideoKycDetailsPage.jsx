import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../../core/services/ApiService';
import Pageheader from '../../../layouts/Pageheader';
import { uploadToBunny } from '../../../utils/BunnyUploadService';
import JsonDataViewer from './components/JsonDataViewer';

const VideoKycDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [draft, setDraft] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    // Reject modal state
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectForm, setRejectForm] = useState({
        fields: ['shop_inner', 'shop_outer', 'video_url'], // All selected by default
        remarks: ''
    });
    const [rejectLoading, setRejectLoading] = useState(false);
    // Upload modal state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadType, setUploadType] = useState(null); // 'shop_inner', 'shop_outer', 'video_url'
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadPreview, setUploadPreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    // Edit mode state for editable fields (shop_name, shop_address, email)
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        shop_name: '',
        shop_address: '',
        email: ''
    });
    const [saveLoading, setSaveLoading] = useState(false);
    const apiService = ApiService();

    useEffect(() => {
        fetchDraftDetails();
    }, [id]);

    const fetchDraftDetails = async () => {
        try {
            setLoading(true);
            const response = await apiService.vGet(`/api/v2/aeps/video-kyc/details/${id}`);

            if (response.data.status === 1) {
                setDraft(response.data.data);
            } else {
                toast.error(response.data.message || 'Draft not found');
                navigate(-1);
            }
        } catch (error) {
            console.error('Error fetching draft details:', error);
            toast.error('Error fetching details. Please try again.');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!window.confirm('Are you sure you want to toggle the Video KYC status?')) {
            return;
        }

        try {
            const response = await apiService.vPost(`/api/v2/aeps/video-kyc/toggle-status/${id}`, {});
            if (response.data.status === 1) {
                toast.success('Video KYC status updated successfully');
                // Refresh the data
                await fetchDraftDetails();
            } else {
                toast.error(response.data.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Error updating status. Please try again.');
        }
    };

    const toggleRejectField = (field) => {
        setRejectForm(prev => ({
            ...prev,
            fields: prev.fields.includes(field)
                ? prev.fields.filter(f => f !== field)
                : [...prev.fields, field]
        }));
    };

    const openRejectModal = () => {
        setRejectForm({
            fields: ['shop_inner', 'shop_outer', 'video_url'], // Reset to all selected
            remarks: ''
        });
        setShowRejectModal(true);
    };

    const handleRejectKyc = async () => {
        if (rejectForm.fields.length === 0) {
            toast.error('Please select at least one item to reject');
            return;
        }

        setRejectLoading(true);
        try {
            const response = await apiService.vPost(`/api/v2/aeps/video-kyc/reject/${id}`, {
                fields: rejectForm.fields,
                remarks: rejectForm.remarks || null
            });

            if (response.data.status === 1) {
                toast.success('Video KYC rejected successfully');
                setShowRejectModal(false);
                await fetchDraftDetails();
            } else {
                toast.error(response.data.message || 'Failed to reject Video KYC');
            }
        } catch (error) {
            console.error('Error rejecting Video KYC:', error);
            toast.error(error.response?.data?.message || 'Error rejecting Video KYC. Please try again.');
        } finally {
            setRejectLoading(false);
        }
    };

    // Upload handlers
    const openUploadModal = (type) => {
        setUploadType(type);
        setUploadFile(null);
        setUploadPreview(null);
        setShowUploadModal(true);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadFile(file);
            // Generate preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => setUploadPreview(reader.result);
                reader.readAsDataURL(file);
            } else if (file.type.startsWith('video/')) {
                setUploadPreview(URL.createObjectURL(file));
            }
        }
    };

    const handleUpload = async () => {
        if (!uploadFile || !uploadType) {
            toast.error('Please select a file to upload');
            return;
        }

        setUploadLoading(true);
        setUploadProgress(0);

        try {
            // Determine folder based on upload type
            const folder = uploadType === 'video_url' ? 'aeps_kyc/videos' : 'aeps_kyc/images';

            // Upload directly to Bunny CDN from frontend
            toast.info(`Uploading ${getUploadLabel(uploadType)}...`);
            const bunnyResult = await uploadToBunny(
                uploadFile,
                folder,
                (progress) => setUploadProgress(progress),
                uploadType !== 'video_url' // Compress images only, not videos
            );

            if (!bunnyResult.success) {
                throw new Error(bunnyResult.error || 'Failed to upload to CDN');
            }

            // Send only the URL to server to update database
            const response = await apiService.vPost(`/api/v2/aeps/video-kyc/update-url/${id}`, {
                field: uploadType,
                url: bunnyResult.url
            });

            if (response.data.status === 1) {
                toast.success('File uploaded successfully');
                setShowUploadModal(false);
                setUploadProgress(0);
                await fetchDraftDetails();
            } else {
                toast.error(response.data.message || 'Failed to update database');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error(error.message || error.response?.data?.message || 'Error uploading file. Please try again.');
        } finally {
            setUploadLoading(false);
            setUploadProgress(0);
        }
    };

    const getUploadLabel = (type) => {
        const labels = {
            'shop_inner': 'Shop Inner Image',
            'shop_outer': 'Shop Outer Image',
            'video_url': 'Self Video'
        };
        return labels[type] || type;
    };

    // Edit mode handlers
    const openEditMode = () => {
        setEditForm({
            shop_name: draft.shop_name || '',
            shop_address: draft.shop_address || '',
            email: draft.email || ''
        });
        setIsEditing(true);
    };

    const handleEditInputChange = (field, value) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditForm({
            shop_name: '',
            shop_address: '',
            email: ''
        });
    };

    const saveEditableFields = async () => {
        setSaveLoading(true);
        try {
            const response = await apiService.vPost(`/api/v2/aeps/video-kyc/update-details/${id}`, {
                shop_name: editForm.shop_name,
                shop_address: editForm.shop_address,
                email: editForm.email
            });

            if (response.data.status === 1) {
                const data = response.data.data;
                let successMsg = 'Details updated successfully';
                if (data.email_synced_to_user) {
                    successMsg += ' (Email synced to user account)';
                }
                toast.success(successMsg);
                setIsEditing(false);
                await fetchDraftDetails();
            } else {
                toast.error(response.data.message || 'Failed to update details');
            }
        } catch (error) {
            console.error('Error updating details:', error);
            toast.error(error.response?.data?.message || 'Error updating details. Please try again.');
        } finally {
            setSaveLoading(false);
        }
    };

    // Check if editing is allowed (aeps_status must be 0)
    const canEdit = draft && draft.aeps_status == 0;


    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        setShowImageModal(true);
    };

    const getVerificationBadge = (isVerified) => {
        return (
            <span className={`badge ${isVerified ? 'bg-success' : 'bg-warning'}`}>
                <i className={`fa ${isVerified ? 'fa-check-circle' : 'fa-clock-o'} me-1`}></i>
                {isVerified ? 'Verified' : 'Not Verified'}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <>
                <Pageheader mainheading="AEPS Video KYC Details" parentfolder="Banking" activepage="Loading..." />
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

    if (!draft) {
        return (
            <>
                <Pageheader mainheading="AEPS Video KYC Details" parentfolder="Banking" activepage="Not Found" />
                <div className="page-content-box">
                    <div className="page-content-box-inner">
                        <div className="alert alert-danger">
                            <i className="fa fa-exclamation-triangle me-2"></i>
                            Draft not found
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <Pageheader
                mainheading={`AEPS Video KYC - ${draft.full_name}`}
                parentfolder="Banking"
                activepage="Details"
            />

            <div className="page-content-box">
                <div className="page-content-box-inner">
                    {/* Header Actions */}
                    <div className="row mb-3">
                        <div className="col-12">
                            <div className="d-flex justify-content-between align-items-center">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => navigate(-1)}
                                >
                                    <i className="fa fa-arrow-left me-2"></i>
                                    Back to List
                                </button>
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-danger btn-lg"
                                        onClick={openRejectModal}
                                        style={{ fontWeight: '500' }}
                                    >
                                        <i className="fa fa-ban me-2"></i>
                                        Reject KYC
                                    </button>
                                    <button
                                        className={`btn ${draft.video_kyc_status == 1 ? 'btn-danger' : 'btn-success'} btn-lg`}
                                        onClick={handleToggleStatus}
                                    >
                                        <i className={`fa ${draft.video_kyc_status == 1 ? 'fa-times-circle' : 'fa-check-circle'} me-2`}></i>
                                        {draft.video_kyc_status == 1 ? 'Deactivate' : 'Activate'} Video KYC
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Overview Card */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card shadow-sm">
                                <div className="card-header bg-primary text-white">
                                    <h5 className="mb-0">
                                        <i className="fa fa-info-circle me-2"></i>
                                        Verification Status Overview
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-2 text-center border-end">
                                            <div className="mb-2">
                                                <i className="fa fa-mobile fa-2x text-primary"></i>
                                            </div>
                                            <small className="text-muted d-block">Phone</small>
                                            {getVerificationBadge(draft.phone_verified_at)}
                                        </div>
                                        <div className="col-md-2 text-center border-end">
                                            <div className="mb-2">
                                                <i className="fa fa-envelope fa-2x text-info"></i>
                                            </div>
                                            <small className="text-muted d-block">Email</small>
                                            {getVerificationBadge(draft.email_verified_at)}
                                        </div>
                                        <div className="col-md-2 text-center border-end">
                                            <div className="mb-2">
                                                <i className="fa fa-id-card fa-2x text-success"></i>
                                            </div>
                                            <small className="text-muted d-block">Aadhaar</small>
                                            {getVerificationBadge(draft.aadhaar_verified_at)}
                                        </div>
                                        <div className="col-md-2 text-center border-end">
                                            <div className="mb-2">
                                                <i className="fa fa-credit-card fa-2x text-warning"></i>
                                            </div>
                                            <small className="text-muted d-block">PAN</small>
                                            {getVerificationBadge(draft.pan_verified_at)}
                                        </div>
                                        <div className="col-md-2 text-center border-end">
                                            <div className="mb-2">
                                                <i className="fa fa-university fa-2x text-danger"></i>
                                            </div>
                                            <small className="text-muted d-block">Bank Account</small>
                                            {getVerificationBadge(draft.bank_verified_at)}
                                        </div>
                                        <div className="col-md-2 text-center">
                                            <div className="mb-2">
                                                <i className="fa fa-video-camera fa-2x text-purple"></i>
                                            </div>
                                            <small className="text-muted d-block">Video KYC</small>
                                            <span className={`badge ${draft.video_kyc_status == 1 ? 'bg-success' : 'bg-danger'}`}>
                                                <i className={`fa ${draft.video_kyc_status == 1 ? 'fa-check' : 'fa-times'} me-1`}></i>
                                                {draft.video_kyc_status == 1 ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {/* Left Column */}
                        <div className="col-lg-6">
                            {/* Personal Information */}
                            <div className="card mb-4 shadow-sm">
                                <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">
                                        <i className="fa fa-user me-2"></i>
                                        Personal Information
                                    </h6>
                                    {canEdit && !isEditing && (
                                        <button
                                            className="btn btn-sm btn-light"
                                            onClick={openEditMode}
                                            title="Edit Details"
                                        >
                                            <i className="fa fa-pencil me-1"></i>
                                            Edit
                                        </button>
                                    )}
                                    {isEditing && (
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-sm btn-light"
                                                onClick={cancelEdit}
                                                disabled={saveLoading}
                                            >
                                                <i className="fa fa-times me-1"></i>
                                                Cancel
                                            </button>
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={saveEditableFields}
                                                disabled={saveLoading}
                                            >
                                                {saveLoading ? (
                                                    <><span className="spinner-border spinner-border-sm me-1"></span>Saving...</>
                                                ) : (
                                                    <><i className="fa fa-check me-1"></i>Save</>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="card-body">
                                    <table className="table table-borderless mb-0">
                                        <tbody>
                                            <tr>
                                                <td className="fw-bold" style={{ width: '40%' }}>MID:</td>
                                                <td><span className="badge bg-dark">{draft.mid}</span></td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Full Name:</td>
                                                <td>{draft.full_name}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Phone:</td>
                                                <td>
                                                    <i className="fa fa-phone me-2 text-primary"></i>
                                                    {draft.phone}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold align-middle">
                                                    Email:
                                                    {isEditing && <span className="badge bg-primary ms-2" style={{ fontSize: '9px' }}>EDITABLE</span>}
                                                </td>
                                                <td>
                                                    {isEditing ? (
                                                        <input
                                                            type="email"
                                                            className="form-control form-control-sm"
                                                            value={editForm.email}
                                                            onChange={(e) => handleEditInputChange('email', e.target.value)}
                                                            placeholder="Enter email address"
                                                            style={{
                                                                border: '2px solid #0d6efd',
                                                                borderRadius: '8px',
                                                                padding: '8px 12px',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        />
                                                    ) : (
                                                        <>
                                                            <i className="fa fa-envelope me-2 text-info"></i>
                                                            {draft.email}
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">PAN Number:</td>
                                                <td><code>{draft.pan_no}</code></td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Aadhaar Number:</td>
                                                <td>
                                                    <code>{draft.aadhaar_number ? `****-****-${draft.aadhaar_number.slice(-4)}` : 'N/A'}</code>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Created At:</td>
                                                <td>{formatDate(draft.created_at)}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Company Name:</td>
                                                <td>{draft.created_by?.setting?.company_name || 'N/A'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Bank Details */}
                            <div className="card mb-4 shadow-sm">
                                <div className="card-header bg-success text-white">
                                    <h6 className="mb-0">
                                        <i className="fa fa-university me-2"></i>
                                        Bank Account Details
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <table className="table table-borderless mb-0">
                                        <tbody>
                                            <tr>
                                                <td className="fw-bold" style={{ width: '40%' }}>Bank Name:</td>
                                                <td>{draft.bank_name}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Branch:</td>
                                                <td>{draft.bank_branch}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Account Number:</td>
                                                <td>
                                                    <code>{draft.account_number ? `****${draft.account_number.slice(-4)}` : 'N/A'}</code>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">IFSC Code:</td>
                                                <td><code>{draft.ifsc_code}</code></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Device Information */}
                            <div className="card mb-4 shadow-sm">
                                <div className="card-header bg-secondary text-white">
                                    <h6 className="mb-0">
                                        <i className="fa fa-mobile me-2"></i>
                                        Device Information
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <table className="table table-borderless mb-0">
                                        <tbody>
                                            <tr>
                                                <td className="fw-bold" style={{ width: '40%' }}>IP Address:</td>
                                                <td><code>{draft.ip_address || 'N/A'}</code></td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Device IMEI:</td>
                                                <td><code>{draft.deviceIMEI || 'N/A'}</code></td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Primary Key ID:</td>
                                                <td><small>{draft.primaryKeyId || 'N/A'}</small></td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Encode FP Txn ID:</td>
                                                <td><small>{draft.encodeFPTxnId || 'N/A'}</small></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="col-lg-6">
                            {/* Shop Information */}
                            <div className="card mb-4 shadow-sm">
                                <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">
                                        <i className="fa fa-shopping-bag me-2"></i>
                                        Shop Information
                                    </h6>
                                    {canEdit && !isEditing && (
                                        <button
                                            className="btn btn-sm btn-dark"
                                            onClick={openEditMode}
                                            title="Edit Shop Details"
                                        >
                                            <i className="fa fa-pencil me-1"></i>
                                            Edit
                                        </button>
                                    )}
                                    {isEditing && (
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={cancelEdit}
                                                disabled={saveLoading}
                                            >
                                                <i className="fa fa-times me-1"></i>
                                                Cancel
                                            </button>
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={saveEditableFields}
                                                disabled={saveLoading}
                                            >
                                                {saveLoading ? (
                                                    <><span className="spinner-border spinner-border-sm me-1"></span>Saving...</>
                                                ) : (
                                                    <><i className="fa fa-check me-1"></i>Save</>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="card-body">
                                    <table className="table table-borderless mb-3">
                                        <tbody>
                                            <tr>
                                                <td className="fw-bold align-middle" style={{ width: '40%' }}>
                                                    Shop Name:
                                                    {isEditing && <span className="badge bg-primary ms-2" style={{ fontSize: '9px' }}>EDITABLE</span>}
                                                </td>
                                                <td>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            value={editForm.shop_name}
                                                            onChange={(e) => handleEditInputChange('shop_name', e.target.value)}
                                                            placeholder="Enter shop name"
                                                            style={{
                                                                border: '2px solid #ffc107',
                                                                borderRadius: '8px',
                                                                padding: '8px 12px',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        />
                                                    ) : (
                                                        <>{draft.shop_name || 'N/A'}</>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold align-middle">
                                                    Shop Address:
                                                    {isEditing && <span className="badge bg-primary ms-2" style={{ fontSize: '9px' }}>EDITABLE</span>}
                                                </td>
                                                <td>
                                                    {isEditing ? (
                                                        <textarea
                                                            className="form-control form-control-sm"
                                                            value={editForm.shop_address}
                                                            onChange={(e) => handleEditInputChange('shop_address', e.target.value)}
                                                            placeholder="Enter shop address"
                                                            rows={2}
                                                            style={{
                                                                border: '2px solid #ffc107',
                                                                borderRadius: '8px',
                                                                padding: '8px 12px',
                                                                resize: 'none',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        />
                                                    ) : (
                                                        <>{draft.shop_address || 'N/A'}</>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Status:</td>
                                                <td>
                                                    <span className={`badge ${draft.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                                        {draft.status || 'N/A'}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">AEPS Status:</td>
                                                <td>
                                                    <span className={`badge ${draft.aeps_status > 0 ? 'bg-success' : 'bg-secondary'}`}>
                                                        {draft.aeps_status || 'Pending'}
                                                    </span>
                                                    {draft.aeps_status == 0 && (
                                                        <small className="text-muted ms-2">(Editing allowed)</small>
                                                    )}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    {draft.remarks && (
                                        <div className="alert alert-warning mb-0">
                                            <strong><i className="fa fa-comment me-2"></i>Remarks:</strong>
                                            <p className="mb-0 mt-2">{draft.remarks}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Shop Images */}
                            <div className="card mb-4 shadow-sm">
                                <div className="card-header ">
                                    <h6 className="mb-0">
                                        <i className="fa fa-image me-2"></i>
                                        Shop Images
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h6 className="mb-0">Shop Inner</h6>
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => openUploadModal('shop_inner')}
                                                    title="Upload Shop Inner Image"
                                                >
                                                    <i className="fa fa-upload me-1"></i>
                                                    {draft.shop_inner ? 'Replace' : 'Upload'}
                                                </button>
                                            </div>
                                            {draft.shop_inner ? (
                                                <div
                                                    className="border rounded p-2 text-center"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleImageClick(draft.shop_inner)}
                                                >
                                                    <img
                                                        src={draft.shop_inner}
                                                        alt="Shop Inner"
                                                        className="img-fluid rounded"
                                                        style={{ maxHeight: '200px' }}
                                                    />
                                                    <small className="d-block mt-2 text-muted">
                                                        <i className="fa fa-search-plus me-1"></i>
                                                        Click to enlarge
                                                    </small>
                                                </div>
                                            ) : (
                                                <div className="alert alert-info text-center mb-0">
                                                    <i className="fa fa-image fa-2x mb-2 d-block text-muted"></i>
                                                    No image uploaded
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-md-6">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h6 className="mb-0">Shop Outer</h6>
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => openUploadModal('shop_outer')}
                                                    title="Upload Shop Outer Image"
                                                >
                                                    <i className="fa fa-upload me-1"></i>
                                                    {draft.shop_outer ? 'Replace' : 'Upload'}
                                                </button>
                                            </div>
                                            {draft.shop_outer ? (
                                                <div
                                                    className="border rounded p-2 text-center"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleImageClick(draft.shop_outer)}
                                                >
                                                    <img
                                                        src={draft.shop_outer}
                                                        alt="Shop Outer"
                                                        className="img-fluid rounded"
                                                        style={{ maxHeight: '200px' }}
                                                    />
                                                    <small className="d-block mt-2 text-muted">
                                                        <i className="fa fa-search-plus me-1"></i>
                                                        Click to enlarge
                                                    </small>
                                                </div>
                                            ) : (
                                                <div className="alert alert-info text-center mb-0">
                                                    <i className="fa fa-image fa-2x mb-2 d-block text-muted"></i>
                                                    No image uploaded
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Video KYC */}
                            <div className="card mb-4 shadow-sm">
                                <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">
                                        <i className="fa fa-video-camera me-2"></i>
                                        Video KYC
                                    </h6>
                                    <button
                                        className="btn btn-sm btn-light"
                                        onClick={() => openUploadModal('video_url')}
                                        title="Upload Self Video"
                                    >
                                        <i className="fa fa-upload me-1"></i>
                                        {draft.video_url ? 'Replace' : 'Upload'}
                                    </button>
                                </div>
                                <div className="card-body">
                                    {draft.video_url ? (
                                        <>
                                            <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                                                <iframe
                                                    src={draft.video_url}
                                                    loading="lazy"
                                                    style={{
                                                        border: 0,
                                                        position: 'absolute',
                                                        top: 0,
                                                        height: '100%',
                                                        width: '100%'
                                                    }}
                                                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                            <div className="mt-3 text-center">
                                                <a
                                                    href={draft.video_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-primary"
                                                >
                                                    <i className="fa fa-external-link me-2"></i>
                                                    Open Video in New Tab
                                                </a>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="fa fa-video-camera fa-4x text-muted mb-3"></i>
                                            <p className="text-muted mb-3">No video uploaded yet</p>
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => openUploadModal('video_url')}
                                            >
                                                <i className="fa fa-upload me-2"></i>
                                                Upload Self Video
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* JSON Data Sections */}
                    <div className="row">
                        <div className="col-12">
                            {draft.aadharData && (
                                <JsonDataViewer title="Aadhaar Verification Data" jsonData={draft.aadharData} />
                            )}

                            {draft.panData && (
                                <JsonDataViewer title="PAN Verification Data" jsonData={draft.panData} />
                            )}

                            {draft.accountData && (
                                <JsonDataViewer title="Bank Account Verification Data" jsonData={draft.accountData} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Image Preview Modal */}
            {showImageModal && selectedImage && (
                <div
                    className="modal fade show"
                    style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.9)' }}
                    onClick={() => setShowImageModal(false)}
                >
                    <div className="modal-dialog modal-xl modal-dialog-centered">
                        <div className="modal-content bg-transparent border-0" onClick={e => e.stopPropagation()}>
                            <div className="modal-header border-0 pb-0">
                                <div className="d-flex gap-2">
                                    <span className="badge bg-light text-dark">
                                        <i className="fa fa-image me-2"></i>
                                        {selectedImage === draft.shop_inner ? 'Shop Inner Image' : 'Shop Outer Image'}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setShowImageModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body text-center px-4">
                                {/* Image Container with Zoom */}
                                <div
                                    className="position-relative d-inline-block"
                                    style={{ maxWidth: '100%', maxHeight: '70vh' }}
                                >
                                    <img
                                        src={selectedImage}
                                        alt="Preview"
                                        className="img-fluid rounded shadow-lg"
                                        style={{
                                            maxHeight: '70vh',
                                            width: 'auto',
                                            cursor: 'zoom-in'
                                        }}
                                        onClick={(e) => {
                                            e.target.style.cursor = e.target.style.transform === 'scale(1.5)' ? 'zoom-in' : 'zoom-out';
                                            e.target.style.transform = e.target.style.transform === 'scale(1.5)' ? 'scale(1)' : 'scale(1.5)';
                                            e.target.style.transition = 'transform 0.3s ease';
                                        }}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-4 d-flex justify-content-center gap-2 flex-wrap">
                                    {/* Download Button */}
                                    <a
                                        href={selectedImage}
                                        download={selectedImage === draft.shop_inner ? `${draft.mid}_shop_inner.jpg` : `${draft.mid}_shop_outer.jpg`}
                                        className="btn btn-success"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <i className="fa fa-download me-2"></i>
                                        Download Image
                                    </a>

                                    {/* Open in New Tab */}
                                    <a
                                        href={selectedImage}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                    >
                                        <i className="fa fa-external-link me-2"></i>
                                        Open in New Tab
                                    </a>

                                    {/* Switch Image Buttons */}
                                    {draft.shop_inner && draft.shop_outer && (
                                        <>
                                            {selectedImage === draft.shop_inner && draft.shop_outer && (
                                                <button
                                                    className="btn btn-info"
                                                    onClick={() => setSelectedImage(draft.shop_outer)}
                                                >
                                                    <i className="fa fa-arrow-right me-2"></i>
                                                    View Shop Outer
                                                </button>
                                            )}
                                            {selectedImage === draft.shop_outer && draft.shop_inner && (
                                                <button
                                                    className="btn btn-info"
                                                    onClick={() => setSelectedImage(draft.shop_inner)}
                                                >
                                                    <i className="fa fa-arrow-left me-2"></i>
                                                    View Shop Inner
                                                </button>
                                            )}
                                        </>
                                    )}

                                    {/* Copy Link Button */}
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            navigator.clipboard.writeText(selectedImage);
                                            toast.success('Image URL copied to clipboard!');
                                        }}
                                    >
                                        <i className="fa fa-copy me-2"></i>
                                        Copy Link
                                    </button>
                                </div>

                                {/* Image Info */}
                                <div className="mt-3">
                                    <small className="text-light d-block">
                                        <i className="fa fa-info-circle me-2"></i>
                                        Click on image to zoom in/out
                                    </small>
                                    <small className="text-muted d-block mt-1">
                                        MID: {draft.mid} | Shop: {draft.shop_name}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject KYC Modal - Premium Bank-Grade Design */}
            {showRejectModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
                        <div className="modal-content border-0 shadow-lg overflow-hidden" style={{ borderRadius: '12px' }}>
                            {/* Premium Gradient Header */}
                            <div style={{
                                background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                padding: '14px 18px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div className="d-flex align-items-center gap-2">
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        background: 'rgba(255,255,255,0.2)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <i className="fa fa-ban text-white"></i>
                                    </div>
                                    <span style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>Reject Video KYC</span>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    style={{ opacity: 0.8 }}
                                    onClick={() => setShowRejectModal(false)}
                                ></button>
                            </div>

                            {/* Modal Body */}
                            <div style={{ padding: '18px 20px' }}>
                                {/* Warning Alert */}
                                <div style={{
                                    background: '#fff3cd',
                                    border: '1px solid #ffc107',
                                    borderRadius: '8px',
                                    padding: '10px 12px',
                                    marginBottom: '16px',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '10px'
                                }}>
                                    <i className="fa fa-exclamation-triangle text-warning" style={{ marginTop: '2px' }}></i>
                                    <small style={{ color: '#856404', lineHeight: '1.4' }}>
                                        Selected files will be <strong>permanently deleted</strong> from CDN and cannot be recovered.
                                    </small>
                                </div>

                                {/* Multi-Select Checkboxes */}
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px', display: 'block' }}>
                                        Select items to reject:
                                    </label>

                                    {/* Shop Inner Checkbox */}
                                    <div
                                        onClick={() => draft.shop_inner && toggleRejectField('shop_inner')}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '10px 12px',
                                            background: rejectForm.fields.includes('shop_inner') ? '#fef2f2' : '#f9fafb',
                                            border: `1px solid ${rejectForm.fields.includes('shop_inner') ? '#fecaca' : '#e5e7eb'}`,
                                            borderRadius: '8px',
                                            marginBottom: '8px',
                                            cursor: draft.shop_inner ? 'pointer' : 'not-allowed',
                                            opacity: draft.shop_inner ? 1 : 0.5,
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={rejectForm.fields.includes('shop_inner')}
                                            onChange={() => draft.shop_inner && toggleRejectField('shop_inner')}
                                            disabled={!draft.shop_inner}
                                            style={{ width: '16px', height: '16px', accentColor: '#dc3545' }}
                                        />
                                        <i className="fa fa-image" style={{ color: rejectForm.fields.includes('shop_inner') ? '#dc3545' : '#6b7280' }}></i>
                                        <span style={{ fontSize: '14px', color: '#374151' }}>Shop Inner Image</span>
                                        {!draft.shop_inner && <span className="badge bg-secondary ms-auto" style={{ fontSize: '10px' }}>Not Uploaded</span>}
                                    </div>

                                    {/* Shop Outer Checkbox */}
                                    <div
                                        onClick={() => draft.shop_outer && toggleRejectField('shop_outer')}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '10px 12px',
                                            background: rejectForm.fields.includes('shop_outer') ? '#fef2f2' : '#f9fafb',
                                            border: `1px solid ${rejectForm.fields.includes('shop_outer') ? '#fecaca' : '#e5e7eb'}`,
                                            borderRadius: '8px',
                                            marginBottom: '8px',
                                            cursor: draft.shop_outer ? 'pointer' : 'not-allowed',
                                            opacity: draft.shop_outer ? 1 : 0.5,
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={rejectForm.fields.includes('shop_outer')}
                                            onChange={() => draft.shop_outer && toggleRejectField('shop_outer')}
                                            disabled={!draft.shop_outer}
                                            style={{ width: '16px', height: '16px', accentColor: '#dc3545' }}
                                        />
                                        <i className="fa fa-image" style={{ color: rejectForm.fields.includes('shop_outer') ? '#dc3545' : '#6b7280' }}></i>
                                        <span style={{ fontSize: '14px', color: '#374151' }}>Shop Outer Image</span>
                                        {!draft.shop_outer && <span className="badge bg-secondary ms-auto" style={{ fontSize: '10px' }}>Not Uploaded</span>}
                                    </div>

                                    {/* Video Checkbox */}
                                    <div
                                        onClick={() => draft.video_url && toggleRejectField('video_url')}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '10px 12px',
                                            background: rejectForm.fields.includes('video_url') ? '#fef2f2' : '#f9fafb',
                                            border: `1px solid ${rejectForm.fields.includes('video_url') ? '#fecaca' : '#e5e7eb'}`,
                                            borderRadius: '8px',
                                            cursor: draft.video_url ? 'pointer' : 'not-allowed',
                                            opacity: draft.video_url ? 1 : 0.5,
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={rejectForm.fields.includes('video_url')}
                                            onChange={() => draft.video_url && toggleRejectField('video_url')}
                                            disabled={!draft.video_url}
                                            style={{ width: '16px', height: '16px', accentColor: '#dc3545' }}
                                        />
                                        <i className="fa fa-video-camera" style={{ color: rejectForm.fields.includes('video_url') ? '#dc3545' : '#6b7280' }}></i>
                                        <span style={{ fontSize: '14px', color: '#374151' }}>Self Video</span>
                                        {!draft.video_url && <span className="badge bg-secondary ms-auto" style={{ fontSize: '10px' }}>Not Uploaded</span>}
                                    </div>
                                </div>

                                {/* Remarks Input */}
                                <div style={{ marginBottom: '6px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>
                                        Remarks <span style={{ color: '#9ca3af', fontWeight: '400' }}>(optional)</span>
                                    </label>
                                    <textarea
                                        value={rejectForm.remarks}
                                        onChange={(e) => setRejectForm(prev => ({ ...prev, remarks: e.target.value }))}
                                        placeholder="Enter reason for rejection..."
                                        rows={2}
                                        maxLength={500}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            resize: 'none',
                                            outline: 'none',
                                            transition: 'border-color 0.15s ease'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#dc3545'}
                                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                    />
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div style={{
                                padding: '12px 20px 16px',
                                background: '#f9fafb',
                                borderTop: '1px solid #e5e7eb',
                                display: 'flex',
                                gap: '10px'
                            }}>
                                <button
                                    className="btn btn-light flex-grow-1"
                                    onClick={() => setShowRejectModal(false)}
                                    style={{ fontWeight: '500', borderRadius: '8px', padding: '10px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-danger flex-grow-1"
                                    onClick={handleRejectKyc}
                                    disabled={rejectLoading || rejectForm.fields.length === 0}
                                    style={{
                                        fontWeight: '500',
                                        borderRadius: '8px',
                                        padding: '10px',
                                        opacity: rejectLoading || rejectForm.fields.length === 0 ? 0.6 : 1
                                    }}
                                >
                                    {rejectLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa fa-trash me-2"></i>
                                            Reject Selected ({rejectForm.fields.length})
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Modal - Premium Design */}
            {showUploadModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
                        <div className="modal-content border-0 shadow-lg overflow-hidden" style={{ borderRadius: '12px' }}>
                            {/* Modal Header */}
                            <div style={{
                                background: 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)',
                                padding: '14px 18px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div className="d-flex align-items-center gap-2">
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        background: 'rgba(255,255,255,0.2)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <i className="fa fa-upload text-white"></i>
                                    </div>
                                    <span style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>
                                        Upload {getUploadLabel(uploadType)}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setShowUploadModal(false)}
                                ></button>
                            </div>

                            {/* Modal Body */}
                            <div style={{ padding: '20px' }}>
                                {/* File Input */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        Select {uploadType === 'video_url' ? 'Video' : 'Image'} File
                                    </label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept={uploadType === 'video_url' ? 'video/*' : 'image/*'}
                                        onChange={handleFileSelect}
                                    />
                                    <small className="text-muted">
                                        {uploadType === 'video_url'
                                            ? 'Accepted: MP4, WebM, MOV (max 50MB)'
                                            : 'Accepted: JPG, PNG, WebP (max 5MB)'
                                        }
                                    </small>
                                </div>

                                {/* Preview */}
                                {uploadPreview && (
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Preview</label>
                                        <div className="border rounded p-2 text-center bg-light">
                                            {uploadType === 'video_url' ? (
                                                <video
                                                    src={uploadPreview}
                                                    controls
                                                    style={{ maxWidth: '100%', maxHeight: '250px' }}
                                                />
                                            ) : (
                                                <img
                                                    src={uploadPreview}
                                                    alt="Preview"
                                                    style={{ maxWidth: '100%', maxHeight: '250px' }}
                                                    className="rounded"
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Info Alert */}
                                {draft[uploadType === 'video_url' ? 'video_url' : uploadType] && (
                                    <div className="alert alert-warning mb-0 py-2">
                                        <small>
                                            <i className="fa fa-info-circle me-2"></i>
                                            This will replace the existing {uploadType === 'video_url' ? 'video' : 'image'}.
                                        </small>
                                    </div>
                                )}

                                {/* Upload Progress Bar - Shows during direct CDN upload */}
                                {uploadLoading && uploadProgress > 0 && (
                                    <div className="mt-3">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <small className="text-muted fw-semibold">Uploading to CDN...</small>
                                            <small className="text-primary fw-semibold">{uploadProgress}%</small>
                                        </div>
                                        <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                                            <div
                                                className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                                                role="progressbar"
                                                style={{ width: `${uploadProgress}%`, borderRadius: '4px' }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div style={{
                                padding: '12px 20px 16px',
                                background: '#f9fafb',
                                borderTop: '1px solid #e5e7eb',
                                display: 'flex',
                                gap: '10px'
                            }}>
                                <button
                                    className="btn btn-light flex-grow-1"
                                    onClick={() => setShowUploadModal(false)}
                                    style={{ fontWeight: '500', borderRadius: '8px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary flex-grow-1"
                                    onClick={handleUpload}
                                    disabled={uploadLoading || !uploadFile}
                                    style={{ fontWeight: '500', borderRadius: '8px' }}
                                >
                                    {uploadLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa fa-cloud-upload me-2"></i>
                                            Upload
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VideoKycDetailsPage;
