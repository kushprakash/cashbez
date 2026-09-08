import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import complaintService from '../services/complaintService';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const CreateComplaint = () => {
    const [form, setForm] = useState({
        user_id: '',
        title: '',
        description: '',
        category: '',
        priority: 'MEDIUM',
    });
    const [memberInfo, setMemberInfo] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [searchModal, setSearchModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const navigate = useNavigate();
    const apiService = ApiService();

    const categories = {
        'TRANSACTION': 'Transaction Issues',
        'ACCOUNT': 'Account Issues',
        'TECHNICAL': 'Technical Support',
        'BILLING': 'Billing & Payments',
        'KYC': 'KYC & Verification',
        'OTHER': 'Other'
    };

    const priorities = [
        { value: 'LOW', label: 'Low', color: 'secondary' },
        { value: 'MEDIUM', label: 'Medium', color: 'info' },
        { value: 'HIGH', label: 'High', color: 'warning' },
        { value: 'URGENT', label: 'Urgent', color: 'danger' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        // Clear error for this field
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles([...files, ...selectedFiles]);
    };

    const removeFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
    };

    const searchMembers = async () => {
        if (!searchTerm || searchTerm.length < 3) {
            return;
        }

        try {
            setSearchLoading(true);
            const response = await apiService.vGet(`/api/users/search?query=${searchTerm}`);
            if (response.status === 1) {
                setSearchResults(response.users || []);
            }
        } catch (error) {
            console.error('Error searching members:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    const selectMember = (member) => {
        setForm({ ...form, user_id: member.user_id });
        setMemberInfo(member);
        setSearchModal(false);
        setSearchTerm('');
        setSearchResults([]);
    };

    const validate = () => {
        const newErrors = {};

        if (!form.user_id) {
            newErrors.user_id = 'Please select a member';
        }
        if (!form.title || form.title.trim().length < 5) {
            newErrors.title = 'Title must be at least 5 characters';
        }
        if (!form.description || form.description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        }
        if (!form.category) {
            newErrors.category = 'Please select a category';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            setLoading(true);
            
            const formData = new FormData();
            formData.append('user_id', form.user_id);
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('category', form.category);
            formData.append('priority', form.priority);

            files.forEach((file, index) => {
                formData.append(`attachments[${index}]`, file);
            });

            const response = await complaintService.createComplaint(formData);

            if (response.status === 1) {
                alert('Complaint created successfully!');
                navigate(`/complaints/view/${response.data.complaint_id}`);
            } else {
                alert(response.message || 'Error creating complaint');
            }
        } catch (error) {
            console.error('Error creating complaint:', error);
            alert('Error creating complaint. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (file) => {
        const type = file.type;
        if (type.startsWith('image/')) return 'fa-image text-primary';
        if (type.startsWith('video/')) return 'fa-video text-danger';
        if (type.includes('pdf')) return 'fa-file-pdf text-danger';
        if (type.includes('word')) return 'fa-file-word text-primary';
        if (type.includes('excel') || type.includes('spreadsheet')) return 'fa-file-excel text-success';
        return 'fa-file text-secondary';
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <>
            <Pageheader 
                mainheading="Create Complaint" 
                parentfolder="Complaints" 
                activepage="Create New" 
            />
            
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <form onSubmit={handleSubmit}>
                                {/* Member Selection Card */}
                                <div className="card mb-4 border-0 shadow-sm">
                                    <div className="card-header bg-white border-0">
                                        <h5 className="mb-0 fw-bold">
                                            <i className="fas fa-user me-2 text-primary"></i>
                                            Member Information
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        {!memberInfo ? (
                                            <div className="text-center py-4">
                                                <i className="fas fa-user-circle fa-4x text-muted mb-3"></i>
                                                <p className="text-muted mb-3">No member selected</p>
                                                <button 
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={() => setSearchModal(true)}
                                                >
                                                    <i className="fas fa-search me-2"></i>
                                                    Search Member
                                                </button>
                                                {errors.user_id && (
                                                    <div className="text-danger mt-2">{errors.user_id}</div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>
                                                    <h6 className="mb-1 fw-bold">{memberInfo.name}</h6>
                                                    <p className="mb-0 text-muted">
                                                        <i className="fas fa-phone me-2"></i>
                                                        {memberInfo.mobile}
                                                    </p>
                                                    <p className="mb-0 text-muted">
                                                        <i className="fas fa-envelope me-2"></i>
                                                        {memberInfo.email || 'N/A'}
                                                    </p>
                                                </div>
                                                <button 
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => {
                                                        setMemberInfo(null);
                                                        setForm({ ...form, user_id: '' });
                                                    }}
                                                >
                                                    <i className="fas fa-times me-2"></i>
                                                    Change
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Complaint Details Card */}
                                <div className="card mb-4 border-0 shadow-sm">
                                    <div className="card-header bg-white border-0">
                                        <h5 className="mb-0 fw-bold">
                                            <i className="fas fa-edit me-2 text-primary"></i>
                                            Complaint Details
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            {/* Title */}
                                            <div className="col-12">
                                                <label className="form-label fw-semibold">
                                                    Title <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                                    name="title"
                                                    value={form.title}
                                                    onChange={handleChange}
                                                    placeholder="Brief description of the issue"
                                                    maxLength="255"
                                                />
                                                {errors.title && (
                                                    <div className="invalid-feedback">{errors.title}</div>
                                                )}
                                            </div>

                                            {/* Description */}
                                            <div className="col-12">
                                                <label className="form-label fw-semibold">
                                                    Description <span className="text-danger">*</span>
                                                </label>
                                                <textarea
                                                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                                    name="description"
                                                    value={form.description}
                                                    onChange={handleChange}
                                                    rows="5"
                                                    placeholder="Detailed description of the complaint..."
                                                ></textarea>
                                                {errors.description && (
                                                    <div className="invalid-feedback">{errors.description}</div>
                                                )}
                                            </div>

                                            {/* Category */}
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">
                                                    Category <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                                                    name="category"
                                                    value={form.category}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select Category</option>
                                                    {Object.entries(categories).map(([key, value]) => (
                                                        <option key={key} value={key}>{value}</option>
                                                    ))}
                                                </select>
                                                {errors.category && (
                                                    <div className="invalid-feedback">{errors.category}</div>
                                                )}
                                            </div>

                                            {/* Priority */}
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">
                                                    Priority <span className="text-danger">*</span>
                                                </label>
                                                <div className="d-flex gap-2">
                                                    {priorities.map((priority) => (
                                                        <button
                                                            key={priority.value}
                                                            type="button"
                                                            className={`btn flex-fill ${form.priority === priority.value ? `btn-${priority.color}` : `btn-outline-${priority.color}`}`}
                                                            onClick={() => setForm({ ...form, priority: priority.value })}
                                                        >
                                                            {priority.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* File Attachments Card */}
                                <div className="card mb-4 border-0 shadow-sm">
                                    <div className="card-header bg-white border-0">
                                        <h5 className="mb-0 fw-bold">
                                            <i className="fas fa-paperclip me-2 text-primary"></i>
                                            Attachments (Optional)
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <label className="btn btn-outline-primary w-100" style={{ cursor: 'pointer' }}>
                                                <i className="fas fa-upload me-2"></i>
                                                Choose Files
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={handleFileChange}
                                                    style={{ display: 'none' }}
                                                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                                />
                                            </label>
                                            <small className="text-muted d-block mt-2">
                                                Supported: Images, PDF, Word, Excel (Max 10MB per file)
                                            </small>
                                        </div>

                                        {files.length > 0 && (
                                            <div className="row g-2">
                                                {files.map((file, index) => (
                                                    <div key={index} className="col-md-6">
                                                        <div className="card border">
                                                            <div className="card-body p-3">
                                                                <div className="d-flex align-items-center">
                                                                    <div className="flex-shrink-0">
                                                                        <i className={`fas ${getFileIcon(file)} fa-2x`}></i>
                                                                    </div>
                                                                    <div className="flex-grow-1 ms-3">
                                                                        <h6 className="mb-0 text-truncate">{file.name}</h6>
                                                                        <small className="text-muted">{formatFileSize(file.size)}</small>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() => removeFile(index)}
                                                                    >
                                                                        <i className="fas fa-times"></i>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => navigate('/complaints/list')}
                                                disabled={loading}
                                            >
                                                <i className="fas fa-arrow-left me-2"></i>
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Creating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-check me-2"></i>
                                                        Create Complaint
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
            </div>

            {/* Member Search Modal */}
            {searchModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-search me-2"></i>
                                    Search Member
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close"
                                    onClick={() => setSearchModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="input-group mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by name, mobile, or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && searchMembers()}
                                    />
                                    <button 
                                        className="btn btn-primary"
                                        onClick={searchMembers}
                                        disabled={searchLoading}
                                    >
                                        {searchLoading ? (
                                            <span className="spinner-border spinner-border-sm"></span>
                                        ) : (
                                            <i className="fas fa-search"></i>
                                        )}
                                    </button>
                                </div>

                                {searchResults.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Mobile</th>
                                                    <th>Email</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {searchResults.map((member) => (
                                                    <tr key={member.user_id}>
                                                        <td>{member.name}</td>
                                                        <td>{member.mobile}</td>
                                                        <td>{member.email || 'N/A'}</td>
                                                        <td>
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => selectMember(member)}
                                                            >
                                                                Select
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : searchTerm.length >= 3 ? (
                                    <div className="text-center py-4">
                                        <i className="fas fa-search fa-3x text-muted mb-3"></i>
                                        <p className="text-muted">No members found</p>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <i className="fas fa-info-circle fa-3x text-info mb-3"></i>
                                        <p className="text-muted">Enter at least 3 characters to search</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CreateComplaint;
