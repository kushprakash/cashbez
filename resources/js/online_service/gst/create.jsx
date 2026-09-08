import React, { useState, useRef, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { uploadToBunny } from '../../utils/BunnyUploadService';

const CreateGst = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        bussiness_name: '',
        bussiness_owner_name: '',
        mobile_number: '',
        email_id: '',
        pancard_number: '',
        aadharcard_number: '',
        bussiness_address_type_name: '',
    });

    const [files, setFiles] = useState({
        pancard_file: null,
        aadharcard_front: null,
        aadharcard_back: null,
        bussiness_address_file: null,
        shop_banner: null,
    });

    const addressProofOptions = [
        "Rental Agreement",
        "Land Receipt",
        "Electric Bill",
        "Property Tax Receipt",
        "Other"
    ];

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (name, file) => {
        if (file) {
            // 500KB limit
            if (file.size > 500 * 1024) {
                toast.error(`${name.replace(/_/g, ' ')} must be less than 500KB`);
                return;
            }
            setFiles(prev => ({ ...prev, [name]: file }));
        } else {
            // Check if it's explicitly null (likely from remove button)
            setFiles(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const fileFields = [
            { name: 'pancard_file', label: 'Pan Card' },
            { name: 'aadharcard_front', label: 'Aadhar Front' },
            { name: 'aadharcard_back', label: 'Aadhar Back' },
            { name: 'bussiness_address_file', label: formData.bussiness_address_type_name ? `${formData.bussiness_address_type_name} File` : 'Business Address Proof' },
            { name: 'shop_banner', label: 'Shop Banner' }
        ];

        try {
            const apiService = ApiService();

            // Basic validation
            for (const field of fileFields) {
                if (!files[field.name]) {
                    toast.error(`Please upload ${field.label}`);
                    setLoading(false);
                    return;
                }
            }

            // Ensure address type is selected
            if (!formData.bussiness_address_type_name) {
                toast.error('Please select a Business Address Type');
                setLoading(false);
                return;
            }

            // Upload files directly to BunnyCDN
            toast.info('Uploading documents...');
            const fileUrls = {};
            
            for (const field of fileFields) {
                if (files[field.name]) {
                    const result = await uploadToBunny(files[field.name], 'gst_documents');
                    if (result.success) {
                        fileUrls[field.name] = result.url;
                    } else {
                        toast.error(`Failed to upload ${field.label}: ${result.error}`);
                        setLoading(false);
                        return;
                    }
                }
            }

            // Combine payload with file URLs
            const finalPayload = { ...formData, ...fileUrls };

            // Send to backend (URLs only, no files)
            const response = await apiService.vPost('/api/online-service/gst', finalPayload);

            if (response.data.status === 1) {
                toast.success(response.data.message);
                navigate('/gst/list');
            } else {
                toast.error(response.data.message || 'Failed to submit');
            }
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data) {
                toast.error(error.response.data.message || 'Failed to submit application');
            } else {
                toast.error('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getAddressFileLabel = () => {
        if (formData.bussiness_address_type_name) {
            return `${formData.bussiness_address_type_name} File`;
        }
        return 'Business Address Proof';
    };

    return (
        <>
            <Pageheader mainheading="Apply for GST" parentfolder="GST" activepage="Create" />
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <form onSubmit={handleSubmit}>

                        {/* Card 1: Related Details */}
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-header bg-white border-bottom py-3 px-4">
                                <h5 className="mb-0 fw-bold text-primary">Related Details</h5>
                            </div>
                            <div className="card-body p-4">
                                <h6 className="fw-bold mb-4 text-uppercase text-secondary fs-7 ls-1">Personal & Business Information</h6>
                                <div className="row g-4">
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label className="form-label fw-medium">Business Name <span className="text-danger">*</span></label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0"><i className="fa fa-briefcase text-secondary"></i></span>
                                                <input type="text" className="form-control border-start-0 ps-0" placeholder="Enter Business Name" name="bussiness_name" value={formData.bussiness_name} onChange={handleInputChange} required />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label className="form-label fw-medium">Business Owner Name <span className="text-danger">*</span></label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0"><i className="fa fa-user text-secondary"></i></span>
                                                <input type="text" className="form-control border-start-0 ps-0" placeholder="Enter Full Name" name="bussiness_owner_name" value={formData.bussiness_owner_name} onChange={handleInputChange} required />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label className="form-label fw-medium">Mobile Number <span className="text-danger">*</span></label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0"><i className="fa fa-phone text-secondary"></i></span>
                                                <input type="text" className="form-control border-start-0 ps-0" placeholder="10 Digit Mobile No" pattern="[0-9]{10}" maxLength="10" name="mobile_number" value={formData.mobile_number} onChange={handleInputChange} required />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label className="form-label fw-medium">Email ID <span className="text-danger">*</span></label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0"><i className="fa fa-envelope text-secondary"></i></span>
                                                <input type="email" className="form-control border-start-0 ps-0" placeholder="example@email.com" name="email_id" value={formData.email_id} onChange={handleInputChange} required />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label className="form-label fw-medium">Pan Card Number <span className="text-danger">*</span></label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0"><i className="fa fa-id-card text-secondary"></i></span>
                                                <input type="text" className="form-control border-start-0 ps-0" placeholder="Enter PAN Number" name="pancard_number" value={formData.pancard_number} onChange={handleInputChange} required />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label className="form-label fw-medium">Aadhar Card Number <span className="text-danger">*</span></label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0"><i className="fa fa-id-badge text-secondary"></i></span>
                                                <input type="text" className="form-control border-start-0 ps-0" placeholder="Enter 12 Digit Aadhar" name="aadharcard_number" value={formData.aadharcard_number} onChange={handleInputChange} required />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label className="form-label fw-medium">Business Address Type <span className="text-danger">*</span></label>
                                            <select
                                                className="form-select form-select-lg fs-6"
                                                name="bussiness_address_type_name"
                                                value={formData.bussiness_address_type_name}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Address Proof Type</option>
                                                {addressProofOptions.map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Card 2: Document Uploads */}
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-header bg-white border-bottom py-3 px-4">
                                <h5 className="mb-0 fw-bold text-primary">Upload Documents</h5>
                            </div>
                            <div className="card-body p-4">
                                <div className="alert alert-info border-0 bg-info-subtle text-info-emphasis mb-4">
                                    <i className="fa fa-info-circle me-2"></i>
                                    Max file size allowed is <strong>500KB</strong> per document. Allowed formats: Image (JPG, PNG) or PDF.
                                </div>
                                <div className="row g-4">
                                    {/* Standard Files */}
                                    <div className="col-md-4">
                                        <FileUpload
                                            label="Pan Card"
                                            name="pancard_file"
                                            file={files.pancard_file}
                                            onFileChange={handleFileChange}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <FileUpload
                                            label="Aadhar Front"
                                            name="aadharcard_front"
                                            file={files.aadharcard_front}
                                            onFileChange={handleFileChange}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <FileUpload
                                            label="Aadhar Back"
                                            name="aadharcard_back"
                                            file={files.aadharcard_back}
                                            onFileChange={handleFileChange}
                                        />
                                    </div>

                                    {/* Dynamic Address File */}
                                    {formData.bussiness_address_type_name && (
                                        <div className="col-md-6 fade-in-up">
                                            <FileUpload
                                                label={getAddressFileLabel()}
                                                name="bussiness_address_file"
                                                file={files.bussiness_address_file}
                                                onFileChange={handleFileChange}
                                                highlight={true}
                                            />
                                        </div>
                                    )}

                                    <div className={formData.bussiness_address_type_name ? "col-md-6" : "col-md-6"}>
                                        <FileUpload
                                            label="Shop Banner"
                                            name="shop_banner"
                                            file={files.shop_banner}
                                            onFileChange={handleFileChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="d-flex justify-content-end gap-3 mb-5">
                            <button type="button" className="btn btn-lg btn-light border px-4" onClick={() => navigate('/gst/list')}>Cancel</button>
                            <button type="submit" className="btn btn-lg btn-primary px-5 shadow-sm" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>Submit Application <i className="fa fa-paper-plane ms-2"></i></>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
            <style>{`
                .fade-in-up {
                    animation: fadeInUp 0.5s ease-out;
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
};

const FileUpload = ({ label, name, file, onFileChange, highlight = false }) => {
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (file && file.type.startsWith('image/')) {
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setPreviewUrl(null);
        }
    }, [file]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDropInternal = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) onFileChange(name, droppedFile);
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        onFileChange(name, null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className="h-100">
            <label className="form-label fw-semibold text-dark mb-2">{label} <span className="text-danger">*</span></label>
            <div
                className={`
                    border-2 border-dashed rounded-3 p-3 text-center transition-all d-flex flex-column align-items-center justify-content-center position-relative
                    ${isDragging ? 'border-primary bg-primary-subtle' : (highlight ? 'border-primary border-opacity-50 bg-light' : 'border-secondary-subtle bg-light')}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDropInternal}
                onClick={() => inputRef.current && inputRef.current.click()}
                style={{ cursor: 'pointer', minHeight: '180px', transition: 'all 0.2s', overflow: 'hidden' }}
            >
                <input
                    type="file"
                    ref={inputRef}
                    className="d-none"
                    onChange={(e) => onFileChange(name, e.target.files[0])}
                    accept="image/*,.pdf"
                />

                {file ? (
                    <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center animate__animated animate__fadeIn">
                        <button
                            type="button"
                            className="btn btn-danger btn-sm rounded-circle position-absolute top-0 end-0 m-2 p-0 d-flex align-items-center justify-content-center shadow-sm"
                            style={{ width: '26px', height: '26px', zIndex: 10 }}
                            onClick={handleRemove}
                            title="Remove file"
                        >
                            <i className="fa fa-times text-white" style={{ fontSize: '14px' }}></i>
                        </button>

                        {previewUrl ? (
                            <div className="mb-2 position-relative d-flex justify-content-center align-items-center" style={{ width: '100%', height: '110px' }}>
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="img-fluid rounded shadow-sm bg-white border"
                                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                />
                            </div>
                        ) : (
                            <div className="mb-3">
                                <i className="fa fa-file-pdf fa-4x text-danger shadow-sm rounded-circle p-2 bg-white"></i>
                            </div>
                        )}
                        <p className="mb-0 fw-bold text-truncate w-75 mx-auto small text-dark" title={file.name}>{file.name}</p>
                        <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill mt-1 px-3 py-1">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                ) : (
                    <div className="text-muted opacity-75">
                        <div className="mb-3">
                            <i className={`fa ${highlight ? 'fa-folder-open text-primary' : 'fa-cloud-arrow-up'} fa-3x`}></i>
                        </div>
                        <p className="mb-1 small fw-bold text-uppercase ls-1">Click to Upload</p>
                        <p className="small mb-0">or Drag & Drop here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateGst;
