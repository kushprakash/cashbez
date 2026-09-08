import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const AddFollowupType = () => {
    const [formData, setFormData] = useState({
        name: '',
        color: '#007bff',
        description: '',
        sort_order: 0,
        is_active: true,
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const apiService = ApiService();

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
            const response = await apiService.vPost('/api/crm/followup-types', formData);
            
            if (response.data) {
                toast.success('Followup type created successfully');
                navigate('/crm/followup-types/list');
            } else {
                toast.error('Failed to create followup type');
            }
        } catch (error) {
            console.error('Error creating followup type:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error(error.response?.data?.message || 'Error creating followup type. Please try again.');
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

    return (
        <>
            <Pageheader 
                currentpage="Add Followup Type" 
                activepage="CRM" 
                mainpage="Followup Type Management" 
            />
            
            <div className="row">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Add New Followup Type</h5>
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
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Followup Type'
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
                                Followup Type Guidelines
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="alert alert-info">
                                <h6 className="alert-heading">Tips for Creating Followup Types:</h6>
                                <ul className="mb-0">
                                    <li><strong>Name:</strong> Keep it short and descriptive (e.g., Call, Meeting, Email)</li>
                                    <li><strong>Color:</strong> Use distinct colors to help users quickly identify types</li>
                                    <li><strong>Sort Order:</strong> Lower numbers appear first in dropdowns</li>
                                    <li><strong>Status:</strong> Only active types will be available for selection</li>
                                </ul>
                            </div>
                            
                            <div className="mt-3">
                                <h6>Common Followup Types:</h6>
                                <div className="d-flex flex-wrap gap-1">
                                    <span className="badge bg-primary">📞 Call</span>
                                    <span className="badge bg-success">👥 Meeting</span>
                                    <span className="badge bg-info">📧 Email</span>
                                    <span className="badge bg-warning">💻 Demo</span>
                                    <span className="badge bg-danger">📄 Proposal</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </>
    );
};

export default AddFollowupType;
