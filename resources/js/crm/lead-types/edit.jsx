import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const EditLeadType = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const apiService = ApiService();

    useEffect(() => {
        fetchLeadType();
    }, [id]);

    const fetchLeadType = async () => {
        try {
            setPageLoading(true);
            const response = await apiService.vGet(`/api/crm/lead-types/${id}`);
            
            if (response.data) {
                const leadType = response.data;
                setFormData({
                    name: leadType.name || '',
                    description: leadType.description || '',
                });
            } else {
                toast.error('Lead type not found');
                navigate('/crm/lead-types/list');
            }
        } catch (error) {
            console.error('Error fetching lead type:', error);
            toast.error('Error fetching lead type data');
            navigate('/crm/lead-types/list');
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
            const response = await apiService.vPut(`/api/crm/lead-types/${id}`, formData);
            
            if (response.data) {
                toast.success('Lead type updated successfully');
                navigate('/crm/lead-types/list');
            } else {
                toast.error('Failed to update lead type');
            }
        } catch (error) {
            console.error('Error updating lead type:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error(error.response?.data?.message || 'Error updating lead type. Please try again.');
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
                currentpage="Edit Lead Type" 
                activepage="CRM" 
                mainpage="Lead Type Management" 
            />
            
            <div className="row">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Edit Lead Type</h5>
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
                                        placeholder="Enter lead type name (e.g., Loan, Sales, School)"
                                        required
                                    />
                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                </div>

                                <div className="form-group mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        rows="4"
                                        placeholder="Enter description for this lead type..."
                                    ></textarea>
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
                                            'Update Lead Type'
                                        )}
                                    </button>
                                    <Link to="/crm/lead-types/list" className="btn btn-secondary">
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

export default EditLeadType;
