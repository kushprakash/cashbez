import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const AddFollowupStatus = () => {
    const [formData, setFormData] = useState({
        name: '',
        color: '#007bff',
        description: '',
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
        
        if (!formData.name) newErrors.name = 'Status name is required';
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
            const response = await apiService.vPost('/api/crm/followup-status', formData);
            
            if (response.data) {
                toast.success('Followup status created successfully');
                navigate('/crm/followup-status/list');
            } else {
                toast.error('Failed to create followup status');
            }
        } catch (error) {
            console.error('Error creating followup status:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error(error.response?.data?.message || 'Error creating followup status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Predefined status options
    const predefinedStatuses = [
        { name: 'Connected', color: '#28a745', description: 'Successfully connected with the lead' },
        { name: 'Positive Response', color: '#17a2b8', description: 'Lead showed positive interest' },
        { name: 'Interested', color: '#007bff', description: 'Lead is interested in the service/product' },
        { name: 'Not Reachable', color: '#ffc107', description: 'Could not reach the lead' },
        { name: 'Busy', color: '#fd7e14', description: 'Lead was busy during the call' },
        { name: 'Callback Requested', color: '#6f42c1', description: 'Lead requested to be called back' },
        { name: 'Not Interested', color: '#dc3545', description: 'Lead is not interested' },
        { name: 'Wrong Number', color: '#6c757d', description: 'Incorrect contact information' },
        { name: 'Meeting Scheduled', color: '#20c997', description: 'Follow-up meeting has been scheduled' },
        { name: 'Proposal Sent', color: '#e83e8c', description: 'Proposal has been sent to the lead' },
        { name: 'Follow Up Later', color: '#6c757d', description: 'Need to follow up at a later time' },
    ];

    const handlePredefinedSelect = (status) => {
        setFormData(prev => ({
            ...prev,
            name: status.name,
            color: status.color,
            description: status.description
        }));
    };

    return (
        <>
            <Pageheader 
                currentpage="Add Followup Status" 
                activepage="CRM" 
                mainpage="Followup Status Management" 
            />
            
            <div className="row">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Add New Followup Status</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Status Name <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                placeholder="Enter status name"
                                                required
                                            />
                                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Color <span className="text-danger">*</span></label>
                                            <div className="input-group">
                                                <input
                                                    type="color"
                                                    name="color"
                                                    value={formData.color}
                                                    onChange={handleInputChange}
                                                    className={`form-control form-control-color ${errors.color ? 'is-invalid' : ''}`}
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    value={formData.color}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                                    className="form-control"
                                                    placeholder="#000000"
                                                />
                                            </div>
                                            {errors.color && <div className="invalid-feedback">{errors.color}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                rows="3"
                                                placeholder="Enter status description"
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <div className="form-check mb-3">
                                            <input
                                                type="checkbox"
                                                name="is_active"
                                                checked={formData.is_active}
                                                onChange={handleInputChange}
                                                className="form-check-input"
                                                id="is_active"
                                            />
                                            <label className="form-check-label" htmlFor="is_active">
                                                Active Status
                                            </label>
                                        </div>
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
                                            'Create Followup Status'
                                        )}
                                    </button>
                                    <Link to="/crm/followup-status/list" className="btn btn-secondary">
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
                            <h6 className="card-title mb-0">Predefined Status Options</h6>
                        </div>
                        <div className="card-body">
                            <div className="list-group list-group-flush">
                                {predefinedStatuses.map((status, index) => (
                                    <div key={index} className="list-group-item border-0 px-0">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="flex-grow-1">
                                                <div className="d-flex align-items-center mb-1">
                                                    <span 
                                                        className="badge me-2" 
                                                        style={{ backgroundColor: status.color, color: '#fff' }}
                                                    >
                                                        {status.name}
                                                    </span>
                                                </div>
                                                <small className="text-muted">{status.description}</small>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => handlePredefinedSelect(status)}
                                            >
                                                Use
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </>
    );
};

export default AddFollowupStatus;
