import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const EditFollowupType = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '',
        color: '#007bff',
        description: '',
        sort_order: 0,
        is_active: true,
    });

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const apiService = ApiService();

    useEffect(() => {
        fetchFollowupType();
    }, [id]);

    const fetchFollowupType = async () => {
        try {
            setPageLoading(true);
            const response = await apiService.vGet(`/api/crm/followup-types/${id}`);
            
            if (response.data) {
                const followupType = response.data;
                setFormData({
                    name: followupType.name || '',
                    color: followupType.color || '#007bff',
                    description: followupType.description || '',
                    sort_order: followupType.sort_order || 0,
                    is_active: followupType.is_active !== undefined ? followupType.is_active : true,
                });
            } else {
                toast.error('Followup type not found');
                navigate('/crm/followup-types/list');
            }
        } catch (error) {
            console.error('Error fetching followup type:', error);
            toast.error('Error fetching followup type data');
            navigate('/crm/followup-types/list');
        } finally {
            setPageLoading(false);
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
        
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.color) newErrors.color = 'Color is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the errors before submitting');
            return;
        }

        setLoading(true);
        try {
            const response = await apiService.vPut(`/api/crm/followup-types/${id}`, formData);
            
            if (response.data) {
                toast.success('Followup type updated successfully');
                navigate('/crm/followup-types/list');
            } else {
                toast.error('Failed to update followup type');
            }
        } catch (error) {
            console.error('Error updating followup type:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error(error.response?.data?.message || 'Error updating followup type. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const predefinedColors = [
        { name: 'Primary', value: '#007bff' },
        { name: 'Success', value: '#28a745' },
        { name: 'Info', value: '#17a2b8' },
        { name: 'Warning', value: '#ffc107' },
        { name: 'Danger', value: '#dc3545' },
        { name: 'Secondary', value: '#6c757d' },
        { name: 'Dark', value: '#343a40' },
        { name: 'Purple', value: '#6f42c1' },
        { name: 'Pink', value: '#e83e8c' },
        { name: 'Orange', value: '#fd7e14' },
    ];

    if (pageLoading) {
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
                currentpage="Edit Followup Type" 
                activepage="CRM" 
                mainpage="Followup Type Management" 
            />
            
            <div className="row">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Edit Followup Type</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Name <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                placeholder="Enter type name (e.g., Call, Meeting, Email)"
                                                required
                                            />
                                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Sort Order</label>
                                            <input
                                                type="number"
                                                name="sort_order"
                                                value={formData.sort_order}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                min="0"
                                                placeholder="0"
                                            />
                                            <small className="text-muted">Lower numbers appear first</small>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        rows="3"
                                        placeholder="Enter description for this followup type..."
                                    ></textarea>
                                </div>

                                <div className="form-group mb-3">
                                    <label className="form-label">Color <span className="text-danger">*</span></label>
                                    <div className="row">
                                        <div className="col-md-3">
                                            <input
                                                type="color"
                                                name="color"
                                                value={formData.color}
                                                onChange={handleInputChange}
                                                className={`form-control form-control-color ${errors.color ? 'is-invalid' : ''}`}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-9">
                                            <input
                                                type="text"
                                                name="color"
                                                value={formData.color}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.color ? 'is-invalid' : ''}`}
                                                placeholder="#007bff"
                                            />
                                        </div>
                                    </div>
                                    {errors.color && <div className="invalid-feedback d-block">{errors.color}</div>}
                                    <small className="text-muted">Choose a color for the followup type badge</small>
                                </div>

                                <div className="form-group mb-3">
                                    <label className="form-label">Quick Colors</label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {predefinedColors.map((color, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                className="btn btn-sm"
                                                style={{ backgroundColor: color.value, color: 'white' }}
                                                onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                                                title={color.name}
                                            >
                                                {color.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group mb-3">
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleInputChange}
                                            className="form-check-input"
                                            id="is_active"
                                        />
                                        <label className="form-check-label" htmlFor="is_active">
                                            Active
                                        </label>
                                        <small className="form-text text-muted d-block">
                                            Only active followup types will be available for selection
                                        </small>
                                    </div>
                                </div>

                                <div className="form-group mb-3">
                                    <label className="form-label">Preview</label>
                                    <div>
                                        <span 
                                            className="badge" 
                                            style={{ backgroundColor: formData.color, fontSize: '14px' }}
                                        >
                                            <i className="fa fa-calendar me-1"></i>
                                            {formData.name || 'Sample Type'}
                                        </span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary me-2"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Followup Type'
                                        )}
                                    </button>
                                    <Link to="/crm/followup-types/list" className="btn btn-secondary">
                                        Cancel
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="card-title mb-0">
                                <i className="fa fa-info-circle me-2"></i>
                                Editing Guidelines
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="alert alert-warning">
                                <h6 className="alert-heading">Important Notice:</h6>
                                <p className="mb-0">
                                    Changing the name or deactivating this followup type may affect existing followups 
                                    and statuses that are currently using this type.
                                </p>
                            </div>
                            
                            <div className="mt-3">
                                <h6>Current Usage:</h6>
                                <p className="text-muted small">
                                    This followup type may be in use by existing followup records. 
                                    Consider the impact before making significant changes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </>
    );
};

export default EditFollowupType;
