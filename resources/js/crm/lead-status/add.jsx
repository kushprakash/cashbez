import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const AddLeadStatus = () => {
    const [formData, setFormData] = useState({
        name: '',
        color: '#6c757d',
        followup_type_id: '',
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [followupTypes, setFollowupTypes] = useState([]);
    const navigate = useNavigate();
    const apiService = ApiService();

    useEffect(() => {
        fetchFollowupTypes();
    }, []);

    const fetchFollowupTypes = async () => {
        try {
            const response = await apiService.vGet('/api/crm/followup-types');
            setFollowupTypes(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching followup types:', error);
            toast.error('Error fetching followup types');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
        if (!formData.followup_type_id) newErrors.followup_type_id = 'Follow-up Type is required';
        
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
            const response = await apiService.vPost('/api/crm/lead-status', formData);
            
            if (response.data) {
                toast.success('Lead status created successfully');
                navigate('/crm/lead-status/list');
            } else {
                toast.error('Failed to create lead status');
            }
        } catch (error) {
            console.error('Error creating lead status:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error(error.response?.data?.message || 'Error creating lead status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const predefinedColors = [
        { name: 'Success', value: '#28a745' },
        { name: 'Info', value: '#17a2b8' },
        { name: 'Warning', value: '#ffc107' },
        { name: 'Danger', value: '#dc3545' },
        { name: 'Primary', value: '#007bff' },
        { name: 'Secondary', value: '#6c757d' },
        { name: 'Dark', value: '#343a40' },
        { name: 'Purple', value: '#6f42c1' },
        { name: 'Pink', value: '#e83e8c' },
        { name: 'Orange', value: '#fd7e14' },
    ];

    return (
        <>
            <Pageheader 
                currentpage="Add Lead Status" 
                activepage="CRM" 
                mainpage="Lead Status Management" 
            />
            
            <div className="row">
                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Add New Lead Status</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group mb-3">
                                    <label className="form-label">Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                        placeholder="Enter status name (e.g., New, Contacted, Positive)"
                                        required
                                    />
                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                </div>

                                <div className="form-group mb-3">
                                    <label className="form-label">Follow-up Type <span className="text-danger">*</span></label>
                                    <select
                                        name="followup_type_id"
                                        value={formData.followup_type_id}
                                        onChange={handleInputChange}
                                        className={`form-select ${errors.followup_type_id ? 'is-invalid' : ''}`}
                                        required
                                    >
                                        <option value="">Select Follow-up Type</option>
                                        {followupTypes.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.followup_type_id && <div className="invalid-feedback">{errors.followup_type_id[0]}</div>}
                                    <small className="text-muted">Select which follow-up type this status applies to</small>
                                </div>

                                <div className="form-group mb-3">
                                    <label className="form-label">Color</label>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <input
                                                type="color"
                                                name="color"
                                                value={formData.color}
                                                onChange={handleInputChange}
                                                className="form-control form-control-color"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <input
                                                type="text"
                                                name="color"
                                                value={formData.color}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                placeholder="#6c757d"
                                            />
                                        </div>
                                    </div>
                                    <small className="text-muted">Choose a color for the status badge</small>
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
                                    <label className="form-label">Preview</label>
                                    <div>
                                        <span 
                                            className="badge" 
                                            style={{ backgroundColor: formData.color, fontSize: '14px' }}
                                        >
                                            {formData.name || 'Sample Status'}
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
                                            'Create Lead Status'
                                        )}
                                    </button>
                                    <Link to="/crm/lead-status/list" className="btn btn-secondary">
                                        Cancel
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </>
    );
};

export default AddLeadStatus;
