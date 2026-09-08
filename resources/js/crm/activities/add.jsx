import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const AddActivity = () => {
    const [formData, setFormData] = useState({
        lead_id: '',
        activity_type: 'Call',
        details: '',
        next_followup: '',
    });

    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const apiService = ApiService();

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const response = await apiService.vGet('/api/crm/leads');
            setLeads(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching leads:', error);
            toast.error('Error fetching leads');
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
        
        if (!formData.lead_id) newErrors.lead_id = 'Lead is required';
        if (!formData.activity_type) newErrors.activity_type = 'Activity type is required';
        if (!formData.details) newErrors.details = 'Details are required';
        
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
            const response = await apiService.vPost('/api/crm/lead-activities', formData);
            
            if (response.data) {
                toast.success('Activity created successfully');
                navigate('/crm/activities/list');
            } else {
                toast.error('Failed to create activity');
            }
        } catch (error) {
            console.error('Error creating activity:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error(error.response?.data?.message || 'Error creating activity. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const activityTypes = [
        { value: 'Call', icon: 'fa-phone', color: 'primary' },
        { value: 'Meeting', icon: 'fa-users', color: 'success' },
        { value: 'Note', icon: 'fa-sticky-note', color: 'info' },
        { value: 'Email', icon: 'fa-envelope', color: 'warning' },
    ];

    return (
        <>
            <Pageheader 
                currentpage="Add Activity" 
                activepage="CRM" 
                mainpage="Activity Management" 
            />
            
            <div className="row">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Add New Activity</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Lead <span className="text-danger">*</span></label>
                                            <select
                                                name="lead_id"
                                                value={formData.lead_id}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.lead_id ? 'is-invalid' : ''}`}
                                                required
                                            >
                                                <option value="">Select Lead</option>
                                                {leads.map(lead => (
                                                    <option key={lead.id} value={lead.id}>
                                                        {lead.name} - {lead.phone || lead.email}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.lead_id && <div className="invalid-feedback">{errors.lead_id}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Activity Type <span className="text-danger">*</span></label>
                                            <select
                                                name="activity_type"
                                                value={formData.activity_type}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.activity_type ? 'is-invalid' : ''}`}
                                                required
                                            >
                                                {activityTypes.map(type => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.value}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.activity_type && <div className="invalid-feedback">{errors.activity_type}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Next Follow-up Date</label>
                                            <input
                                                type="date"
                                                name="next_followup"
                                                value={formData.next_followup}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Details <span className="text-danger">*</span></label>
                                            <textarea
                                                name="details"
                                                value={formData.details}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.details ? 'is-invalid' : ''}`}
                                                rows="5"
                                                placeholder="Enter activity details, notes, discussion points..."
                                                required
                                            ></textarea>
                                            {errors.details && <div className="invalid-feedback">{errors.details}</div>}
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
                                            'Create Activity'
                                        )}
                                    </button>
                                    <Link to="/crm/activities/list" className="btn btn-secondary">
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
                            <h6 className="card-title mb-0">Activity Types Guide</h6>
                        </div>
                        <div className="card-body">
                            {activityTypes.map(type => (
                                <div key={type.value} className="d-flex align-items-center mb-2">
                                    <span className={`badge badge-${type.color} me-2`}>
                                        <i className={`fa ${type.icon}`}></i>
                                    </span>
                                    <div>
                                        <strong>{type.value}</strong>
                                        <br />
                                        <small className="text-muted">
                                            {type.value === 'Call' && 'Phone conversations, cold calls'}
                                            {type.value === 'Meeting' && 'Face-to-face or video meetings'}
                                            {type.value === 'Note' && 'General notes and observations'}
                                            {type.value === 'Email' && 'Email communications'}
                                        </small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </>
    );
};

export default AddActivity;
