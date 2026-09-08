import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const EditLeadSource = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '',
    });

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const apiService = ApiService();

    useEffect(() => {
        fetchLeadSource();
    }, [id]);

    const fetchLeadSource = async () => {
        try {
            setPageLoading(true);
            const response = await apiService.vGet(`/api/crm/lead-sources/${id}`);
            
            if (response.data) {
                const leadSource = response.data;
                setFormData({
                    name: leadSource.name || '',
                });
            } else {
                toast.error('Lead source not found');
                navigate('/crm/lead-sources/list');
            }
        } catch (error) {
            console.error('Error fetching lead source:', error);
            toast.error('Error fetching lead source data');
            navigate('/crm/lead-sources/list');
        } finally {
            setPageLoading(false);
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
            const response = await apiService.vPut(`/api/crm/lead-sources/${id}`, formData);
            
            if (response.data) {
                toast.success('Lead source updated successfully');
                navigate('/crm/lead-sources/list');
            } else {
                toast.error('Failed to update lead source');
            }
        } catch (error) {
            console.error('Error updating lead source:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error(error.response?.data?.message || 'Error updating lead source. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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
                currentpage="Edit Lead Source" 
                activepage="CRM" 
                mainpage="Lead Source Management" 
            />
            
            <div className="row">
                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Edit Lead Source</h5>
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
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Lead Source'
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

export default EditLeadSource;
