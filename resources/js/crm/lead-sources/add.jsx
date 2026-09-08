import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const AddLeadSource = () => {
    const [formData, setFormData] = useState({
        name: '',
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const apiService = ApiService();

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
            const response = await apiService.vPost('/api/crm/lead-sources', formData);
            
            if (response.data) {
                toast.success('Lead source created successfully');
                navigate('/crm/lead-sources/list');
            } else {
                toast.error('Failed to create lead source');
            }
        } catch (error) {
            console.error('Error creating lead source:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error(error.response?.data?.message || 'Error creating lead source. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Pageheader 
                currentpage="Add Lead Source" 
                activepage="CRM" 
                mainpage="Lead Source Management" 
            />
            
            <div className="row">
                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Add New Lead Source</h5>
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
                                        placeholder="Enter lead source name (e.g., Website, Facebook, Referral)"
                                        required
                                    />
                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
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
                                            'Create Lead Source'
                                        )}
                                    </button>
                                    <Link to="/crm/lead-sources/list" className="btn btn-secondary">
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

export default AddLeadSource;
