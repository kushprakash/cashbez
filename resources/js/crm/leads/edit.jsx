import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const EditLead = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        lead_type_id: '',
        name: '',
        phone: '',
        email: '',
        source_id: '',
        assigned_user_id: '',
        status_id: '',
        priority: 'medium',
        details: '',
        followup_date: '',
    });

    const [leadTypes, setLeadTypes] = useState([]);
    const [leadSources, setLeadSources] = useState([]);
    const [leadStatuses, setLeadStatuses] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const apiService = ApiService();

    useEffect(() => {
        fetchDropdownData();
        fetchLead();
    }, [id]);

    const fetchDropdownData = async () => {
        try {
            const [typesRes, sourcesRes, statusesRes, usersRes] = await Promise.all([
                apiService.vGet('/api/crm/lead-types'),
                apiService.vGet('/api/crm/lead-sources'),
                apiService.vGet('/api/crm/lead-status'),
                apiService.vGet('/api/users')
            ]);

            setLeadTypes(Array.isArray(typesRes.data) ? typesRes.data : []);
            setLeadSources(Array.isArray(sourcesRes.data) ? sourcesRes.data : []);
            setLeadStatuses(Array.isArray(statusesRes.data) ? statusesRes.data : []);
            setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            toast.error('Error fetching dropdown data');
        }
    };

    const fetchLead = async () => {
        try {
            setPageLoading(true);
            const response = await apiService.vGet(`/api/crm/leads/${id}`);
            
            if (response.data) {
                const lead = response.data;
                setFormData({
                    lead_type_id: lead.lead_type_id || '',
                    name: lead.name || '',
                    phone: lead.phone || '',
                    email: lead.email || '',
                    source_id: lead.source_id || '',
                    assigned_user_id: lead.assigned_user_id || '',
                    status_id: lead.status_id || '',
                    priority: lead.priority || 'medium',
                    details: lead.details || '',
                    followup_date: lead.followup_date || '',
                });
            } else {
                toast.error('Lead not found');
                navigate('/crm/leads/list');
            }
        } catch (error) {
            console.error('Error fetching lead:', error);
            toast.error('Error fetching lead data');
            navigate('/crm/leads/list');
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
        
        if (!formData.lead_type_id) newErrors.lead_type_id = 'Lead type is required';
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.phone && !formData.email) {
            newErrors.phone = 'Either phone or email is required';
            newErrors.email = 'Either phone or email is required';
        }
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        
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
            const response = await apiService.vPut(`/api/crm/leads/${id}`, formData);
            
            if (response.data) {
                toast.success('Lead updated successfully');
                navigate('/crm/leads/list');
            } else {
                toast.error('Failed to update lead');
            }
        } catch (error) {
            console.error('Error updating lead:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error(error.response?.data?.message || 'Error updating lead. Please try again.');
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
                currentpage="Edit Lead" 
                activepage="CRM" 
                mainpage="Lead Management" 
            />
            
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Edit Lead</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Lead Type <span className="text-danger">*</span></label>
                                            <select
                                                name="lead_type_id"
                                                value={formData.lead_type_id}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.lead_type_id ? 'is-invalid' : ''}`}
                                                required
                                            >
                                                <option value="">Select Lead Type</option>
                                                {leadTypes.map(type => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.lead_type_id && <div className="invalid-feedback">{errors.lead_type_id}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Name <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                placeholder="Enter lead name"
                                                required
                                            />
                                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Phone</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                                placeholder="Enter phone number"
                                            />
                                            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                placeholder="Enter email address"
                                            />
                                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Source</label>
                                            <select
                                                name="source_id"
                                                value={formData.source_id}
                                                onChange={handleInputChange}
                                                className="form-control"
                                            >
                                                <option value="">Select Source</option>
                                                {leadSources.map(source => (
                                                    <option key={source.id} value={source.id}>
                                                        {source.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Assigned User</label>
                                            <select
                                                name="assigned_user_id"
                                                value={formData.assigned_user_id}
                                                onChange={handleInputChange}
                                                className="form-control"
                                            >
                                                <option value="">Select User</option>
                                                {users.map(user => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Status</label>
                                            <select
                                                name="status_id"
                                                value={formData.status_id}
                                                onChange={handleInputChange}
                                                className="form-control"
                                            >
                                                <option value="">Select Status</option>
                                                {leadStatuses.map(status => (
                                                    <option key={status.id} value={status.id}>
                                                        {status.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Priority</label>
                                            <select
                                                name="priority"
                                                value={formData.priority}
                                                onChange={handleInputChange}
                                                className="form-control"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Follow-up Date</label>
                                            <input
                                                type="date"
                                                name="followup_date"
                                                value={formData.followup_date}
                                                onChange={handleInputChange}
                                                className="form-control"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Details</label>
                                            <textarea
                                                name="details"
                                                value={formData.details}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                rows="4"
                                                placeholder="Enter lead details, notes, requirements..."
                                            ></textarea>
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
                                            'Update Lead'
                                        )}
                                    </button>
                                    <Link to="/crm/leads/list" className="btn btn-secondary">
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

export default EditLead;
