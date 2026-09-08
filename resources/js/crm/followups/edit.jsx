import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const EditFollowup = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        lead_id: '',
        followup_date: '',
        followup_time: '',
        followup_type: 'Call',
        notes: '',
        is_completed: false,
    });

    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const apiService = ApiService();

    useEffect(() => {
        fetchLeads();
        fetchFollowup();
    }, [id]);

    const fetchLeads = async () => {
        try {
            const response = await apiService.vGet('/api/crm/leads');
            setLeads(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching leads:', error);
            toast.error('Error fetching leads');
        }
    };

    const fetchFollowup = async () => {
        try {
            setPageLoading(true);
            const response = await apiService.vGet(`/api/crm/followups/${id}`);
            
            if (response.data) {
                const followup = response.data;
                setFormData({
                    lead_id: followup.lead_id || '',
                    followup_date: followup.followup_date || '',
                    followup_time: followup.followup_time || '',
                    followup_type: followup.followup_type || 'Call',
                    notes: followup.notes || '',
                    is_completed: followup.is_completed || false,
                });
            } else {
                toast.error('Follow-up not found');
                navigate('/crm/followups/list');
            }
        } catch (error) {
            console.error('Error fetching follow-up:', error);
            toast.error('Error fetching follow-up data');
            navigate('/crm/followups/list');
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
        
        if (!formData.lead_id) newErrors.lead_id = 'Lead is required';
        if (!formData.followup_date) newErrors.followup_date = 'Follow-up date is required';
        if (!formData.followup_time) newErrors.followup_time = 'Follow-up time is required';
        if (!formData.followup_type) newErrors.followup_type = 'Follow-up type is required';
        
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
            const response = await apiService.vPut(`/api/crm/followups/${id}`, formData);
            
            if (response.data) {
                toast.success('Follow-up updated successfully');
                navigate('/crm/followups/list');
            } else {
                toast.error('Failed to update follow-up');
            }
        } catch (error) {
            console.error('Error updating follow-up:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error(error.response?.data?.message || 'Error updating follow-up. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const followupTypes = [
        { value: 'Call', icon: 'fa-phone', color: 'primary' },
        { value: 'Meeting', icon: 'fa-users', color: 'success' },
        { value: 'Email', icon: 'fa-envelope', color: 'warning' },
        { value: 'Demo', icon: 'fa-desktop', color: 'info' },
        { value: 'Proposal', icon: 'fa-file-text', color: 'secondary' },
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
                currentpage="Edit Follow-up" 
                activepage="CRM" 
                mainpage="Follow-up Management" 
            />
            
            <div className="row">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Edit Follow-up</h5>
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
                                            <label className="form-label">Follow-up Type <span className="text-danger">*</span></label>
                                            <select
                                                name="followup_type"
                                                value={formData.followup_type}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.followup_type ? 'is-invalid' : ''}`}
                                                required
                                            >
                                                {followupTypes.map(type => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.value}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.followup_type && <div className="invalid-feedback">{errors.followup_type}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Follow-up Date <span className="text-danger">*</span></label>
                                            <input
                                                type="date"
                                                name="followup_date"
                                                value={formData.followup_date}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.followup_date ? 'is-invalid' : ''}`}
                                                required
                                            />
                                            {errors.followup_date && <div className="invalid-feedback">{errors.followup_date}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Follow-up Time <span className="text-danger">*</span></label>
                                            <input
                                                type="time"
                                                name="followup_time"
                                                value={formData.followup_time}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.followup_time ? 'is-invalid' : ''}`}
                                                required
                                            />
                                            {errors.followup_time && <div className="invalid-feedback">{errors.followup_time}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Notes</label>
                                            <textarea
                                                name="notes"
                                                value={formData.notes}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                rows="4"
                                                placeholder="Enter follow-up agenda, discussion points, or special instructions..."
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <div className="form-check mb-3">
                                            <input
                                                type="checkbox"
                                                name="is_completed"
                                                checked={formData.is_completed}
                                                onChange={handleInputChange}
                                                className="form-check-input"
                                                id="is_completed"
                                            />
                                            <label className="form-check-label" htmlFor="is_completed">
                                                Mark as completed
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
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Follow-up'
                                        )}
                                    </button>
                                    <Link to="/crm/followups/list" className="btn btn-secondary">
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
                            <h6 className="card-title mb-0">Follow-up Types</h6>
                        </div>
                        <div className="card-body">
                            {followupTypes.map(type => (
                                <div key={type.value} className="d-flex align-items-center mb-2">
                                    <span className={`badge badge-${type.color} me-2`}>
                                        <i className={`fa ${type.icon}`}></i>
                                    </span>
                                    <div>
                                        <strong>{type.value}</strong>
                                        <br />
                                        <small className="text-muted">
                                            {type.value === 'Call' && 'Phone conversations and discussions'}
                                            {type.value === 'Meeting' && 'Face-to-face or video meetings'}
                                            {type.value === 'Email' && 'Email communications and follow-ups'}
                                            {type.value === 'Demo' && 'Product demonstrations and presentations'}
                                            {type.value === 'Proposal' && 'Proposal review and negotiations'}
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

export default EditFollowup;
