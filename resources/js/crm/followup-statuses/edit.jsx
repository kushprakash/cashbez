import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const EditFollowupStatus = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [followupTypes, setFollowupTypes] = useState([]);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        color: '#007bff',
        description: '',
        followup_type_id: '',
        sort_order: '',
        is_active: true
    });

    const apiService = ApiService();

    useEffect(() => {
        fetchFollowupStatus();
        fetchFollowupTypes();
    }, [id]);

    const fetchFollowupStatus = async () => {
        try {
            setFetchLoading(true);
            
            let response;
            if (apiService.vGet) {
                response = await apiService.vGet(`/api/crm/followup-statuses/${id}`);
            } else if (apiService.get) {
                response = await apiService.get(`/api/crm/followup-statuses/${id}`);
            } else {
                const { token: authToken, user } = await import('../../core/auth/tokenManager').then(m => m.retrieveTokenAndUserData()) || {};
                const { axiosAuthorization } = await import('../../core/services/axiosConfig');
                const httpAuth = axiosAuthorization(authToken, user?.authorization);
                response = await httpAuth.get(`/api/crm/followup-statuses/${id}`);
            }

            if (response?.data) {
                const status = response.data;
                setFormData({
                    name: status.name || '',
                    color: status.color || '#007bff',
                    description: status.description || '',
                    followup_type_id: status.followup_type_id || '',
                    sort_order: status.sort_order || '',
                    is_active: status.is_active !== undefined ? status.is_active : true
                });
            }
        } catch (error) {
            console.error('Error fetching followup status:', error);
            toast.error('Error fetching followup status details');
            navigate('/crm/followup-statuses/list');
        } finally {
            setFetchLoading(false);
        }
    };

    const fetchFollowupTypes = async () => {
        try {
            let response;
            if (apiService.vGet) {
                response = await apiService.vGet('/api/crm/followup-types');
            } else if (apiService.get) {
                response = await apiService.get('/api/crm/followup-types');
            } else {
                const { token: authToken, user } = await import('../../core/auth/tokenManager').then(m => m.retrieveTokenAndUserData()) || {};
                const { axiosAuthorization } = await import('../../core/services/axiosConfig');
                const httpAuth = axiosAuthorization(authToken, user?.authorization);
                response = await httpAuth.get('/api/crm/followup-types');
            }
            
            if (response?.data) {
                setFollowupTypes(response.data);
            }
        } catch (error) {
            console.error('Error fetching followup types:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.color.trim()) {
            newErrors.color = 'Color is required';
        }

        if (formData.sort_order && (isNaN(formData.sort_order) || formData.sort_order < 0)) {
            newErrors.sort_order = 'Sort order must be a positive number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            
            const submitData = {
                ...formData,
                sort_order: formData.sort_order ? parseInt(formData.sort_order) : 0,
                followup_type_id: formData.followup_type_id || null
            };

            let response;
            if (apiService.vPut) {
                response = await apiService.vPut(`/api/crm/followup-statuses/${id}`, submitData);
            } else if (apiService.put) {
                response = await apiService.put(`/api/crm/followup-statuses/${id}`, submitData);
            } else {
                const { token: authToken, user } = await import('../../core/auth/tokenManager').then(m => m.retrieveTokenAndUserData()) || {};
                const { axiosAuthorization } = await import('../../core/services/axiosConfig');
                const httpAuth = axiosAuthorization(authToken, user?.authorization);
                response = await httpAuth.put(`/api/crm/followup-statuses/${id}`, submitData);
            }

            if (response?.data) {
                toast.success('Followup status updated successfully!');
                setTimeout(() => {
                    navigate('/crm/followup-statuses/list');
                }, 1500);
            }
        } catch (error) {
            console.error('Error updating followup status:', error);
            
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                toast.error('Error updating followup status. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const predefinedColors = [
        '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
        '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#6c757d'
    ];

    if (fetchLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <Pageheader 
                currentpage="Edit Followup Status" 
                activepage="CRM" 
                mainpage="Followup Status Management" 
            />
            
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Edit Followup Status</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">
                                                Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Enter status name"
                                            />
                                            {errors.name && (
                                                <div className="invalid-feedback">{errors.name}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">
                                                Followup Type
                                            </label>
                                            <select
                                                name="followup_type_id"
                                                className={`form-control ${errors.followup_type_id ? 'is-invalid' : ''}`}
                                                value={formData.followup_type_id}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select Followup Type</option>
                                                {followupTypes.map(type => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.followup_type_id && (
                                                <div className="invalid-feedback">{errors.followup_type_id}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">
                                                Color <span className="text-danger">*</span>
                                            </label>
                                            <div className="d-flex align-items-center gap-2">
                                                <input
                                                    type="color"
                                                    name="color"
                                                    className={`form-control form-control-color ${errors.color ? 'is-invalid' : ''}`}
                                                    value={formData.color}
                                                    onChange={handleInputChange}
                                                    style={{ width: '60px', height: '40px' }}
                                                />
                                                <input
                                                    type="text"
                                                    name="color"
                                                    className={`form-control ${errors.color ? 'is-invalid' : ''}`}
                                                    value={formData.color}
                                                    onChange={handleInputChange}
                                                    placeholder="#007bff"
                                                />
                                            </div>
                                            <div className="mt-2">
                                                <small className="text-muted">Quick colors:</small>
                                                <div className="d-flex flex-wrap gap-1 mt-1">
                                                    {predefinedColors.map(color => (
                                                        <button
                                                            key={color}
                                                            type="button"
                                                            className="btn p-1"
                                                            style={{ 
                                                                backgroundColor: color, 
                                                                width: '30px', 
                                                                height: '30px',
                                                                border: formData.color === color ? '2px solid #000' : '1px solid #ddd'
                                                            }}
                                                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            {errors.color && (
                                                <div className="invalid-feedback">{errors.color}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Sort Order</label>
                                            <input
                                                type="number"
                                                name="sort_order"
                                                className={`form-control ${errors.sort_order ? 'is-invalid' : ''}`}
                                                value={formData.sort_order}
                                                onChange={handleInputChange}
                                                placeholder="0"
                                                min="0"
                                            />
                                            {errors.sort_order && (
                                                <div className="invalid-feedback">{errors.sort_order}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                name="description"
                                                className="form-control"
                                                rows="3"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                placeholder="Enter status description"
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <div className="form-group mb-3">
                                            <div className="form-check">
                                                <input
                                                    type="checkbox"
                                                    name="is_active"
                                                    className="form-check-input"
                                                    id="is_active"
                                                    checked={formData.is_active}
                                                    onChange={handleInputChange}
                                                />
                                                <label className="form-check-label" htmlFor="is_active">
                                                    Active Status
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview */}
                                    <div className="col-md-12">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Preview:</label>
                                            <div>
                                                <span 
                                                    className="badge me-2" 
                                                    style={{ backgroundColor: formData.color }}
                                                >
                                                    {formData.name || 'Status Name'}
                                                </span>
                                                {formData.followup_type_id && (
                                                    <span className="badge bg-info me-2">
                                                        {followupTypes.find(t => t.id == formData.followup_type_id)?.name}
                                                    </span>
                                                )}
                                                <span className={`badge ${formData.is_active ? 'bg-success' : 'bg-danger'}`}>
                                                    {formData.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group d-flex gap-2">
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa fa-save me-2"></i>Update Status
                                            </>
                                        )}
                                    </button>
                                    <Link to="/crm/followup-statuses/list" className="btn btn-secondary">
                                        <i className="fa fa-times me-2"></i>Cancel
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            
            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
};

export default EditFollowupStatus;
