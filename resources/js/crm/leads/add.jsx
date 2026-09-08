import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const AddLead = () => {
    const [formData, setFormData] = useState({
        lead_type_id: '',
        name: '',
        phone: '',
        email: '',
        source_id: '',
        assigned_user_id: '',
        followup_type_id: '',
        status_id: '',
        lead_status_id: '',
        priority: 'medium',
        details: '',
        followup_date: '',
    });

    const [leadTypes, setLeadTypes] = useState([]);
    const [leadSources, setLeadSources] = useState([]);
    const [followupTypes, setFollowupTypes] = useState([]);
    const [followupStatuses, setFollowupStatuses] = useState([]);
    const [leadStatusOptions, setLeadStatusOptions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const apiService = ApiService();

    useEffect(() => {
        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        try {
            const [typesRes, usersRes] = await Promise.all([
                apiService.vGet('/api/crm/lead-types'),
                apiService.vGet('/api/employees'),
            ]);

            setLeadTypes(Array.isArray(typesRes.data) ? typesRes.data : []);
            setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            toast.error('Error fetching dropdown data');
        }
    };

    // When Lead Type changes → load Lead Sources for that lead type
    const fetchSourcesByLeadType = async (leadTypeId) => {
        if (!leadTypeId) {
            setLeadSources([]);
            setFollowupTypes([]);
            setFollowupStatuses([]);
            setLeadStatusOptions([]);
            return;
        }
        try {
            const response = await apiService.vGet(`/api/crm/lead-sources?lead_type_id=${leadTypeId}`);
            setLeadSources(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching lead sources:', error);
            setLeadSources([]);
        }
        // Reset dependent dropdowns
        setFollowupTypes([]);
        setFollowupStatuses([]);
        setLeadStatusOptions([]);
    };

    // When Lead Source changes → load Followup Types for that lead source
    const fetchFollowupTypesBySource = async (sourceId) => {
        if (!sourceId) {
            setFollowupTypes([]);
            setFollowupStatuses([]);
            setLeadStatusOptions([]);
            return;
        }
        try {
            const response = await apiService.vGet(`/api/crm/followup-types?lead_source_id=${sourceId}`);
            setFollowupTypes(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching followup types:', error);
            setFollowupTypes([]);
        }
        // Reset dependent dropdowns
        setFollowupStatuses([]);
        setLeadStatusOptions([]);
    };

    // When Followup Type changes → load Followup Statuses AND Lead Statuses
    const fetchStatusesByFollowupType = async (followupTypeId) => {
        if (!followupTypeId) {
            setFollowupStatuses([]);
            setLeadStatusOptions([]);
            return;
        }
        try {
            const [followupStatusRes, leadStatusRes] = await Promise.all([
                apiService.vGet(`/api/crm/followup-statuses?followup_type_id=${followupTypeId}`),
                apiService.vGet(`/api/crm/lead-status?followup_type_id=${followupTypeId}`),
            ]);
            setFollowupStatuses(Array.isArray(followupStatusRes.data) ? followupStatusRes.data : []);
            setLeadStatusOptions(Array.isArray(leadStatusRes.data) ? leadStatusRes.data : []);
        } catch (error) {
            console.error('Error fetching statuses:', error);
            setFollowupStatuses([]);
            setLeadStatusOptions([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'lead_type_id') {
            setFormData(prev => ({
                ...prev,
                lead_type_id: value,
                source_id: '',
                followup_type_id: '',
                status_id: '',
                lead_status_id: '',
            }));
            fetchSourcesByLeadType(value);
        } else if (name === 'source_id') {
            setFormData(prev => ({
                ...prev,
                source_id: value,
                followup_type_id: '',
                status_id: '',
                lead_status_id: '',
            }));
            fetchFollowupTypesBySource(value);
        } else if (name === 'followup_type_id') {
            setFormData(prev => ({
                ...prev,
                followup_type_id: value,
                status_id: '',
                lead_status_id: '',
            }));
            fetchStatusesByFollowupType(value);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

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
            const response = await apiService.vPost('/api/crm/leads', formData);

            if (response.data) {
                toast.success('Lead created successfully');
                navigate('/crm/leads/list');
            } else {
                toast.error('Failed to create lead');
            }
        } catch (error) {
            console.error('Error creating lead:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error(error.response?.data?.message || 'Error creating lead. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Pageheader
                currentpage="Add Lead"
                activepage="CRM"
                mainpage="Lead Management"
            />

            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Add New Lead</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    {/* Row 1: Lead Type + Name */}


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

                                    {/* Row 2: Phone + Email */}
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

                                    {/* Row 3: Lead Source + Follow-up Type */}
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Lead Source</label>
                                            <select
                                                name="source_id"
                                                value={formData.source_id}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                disabled={!formData.lead_type_id}
                                                required
                                            >
                                                <option value="">{formData.lead_type_id ? 'Select Source' : 'Select Lead Type first'}</option>
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
                                            <label className="form-label">Follow-up Type</label>
                                            <select
                                                name="followup_type_id"
                                                value={formData.followup_type_id}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                disabled={!formData.source_id}
                                                required
                                            >
                                                <option value="">{formData.source_id ? 'Select Follow-up Type' : 'Select Lead Source first'}</option>
                                                {followupTypes.map(type => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Assigned User (hidden) */}
                                    <div className="col-md-6 d-none">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Assigned User</label>
                                            <select
                                                name="assigned_user_id"
                                                value={formData.assigned_user_id}
                                                onChange={handleInputChange}
                                                className="form-control"
                                            >
                                                <option value="">Select User</option>
                                                {users.map(data => (
                                                    <option key={data.user.id} value={data.user.id}>
                                                        {data.user.name} {data.emp_code}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Row 4: Follow-up Status + Lead Status */}
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Follow-up Status</label>
                                            <select
                                                name="status_id"
                                                value={formData.status_id}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                disabled={!formData.followup_type_id}
                                            >
                                                <option value="">{formData.followup_type_id ? 'Select Followup Status' : 'Select Follow-up Type first'}</option>
                                                {followupStatuses.map(status => (
                                                    <option key={status.id} value={status.id}>
                                                        {status.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label className="form-label">Lead Status</label>
                                            <select
                                                name="lead_status_id"
                                                value={formData.lead_status_id}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                disabled={!formData.followup_type_id}
                                            >
                                                <option value="">{formData.followup_type_id ? 'Select Lead Status' : 'Select Follow-up Type first'}</option>
                                                {leadStatusOptions.map(status => (
                                                    <option key={status.id} value={status.id}>
                                                        {status.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Row 5: Priority + Follow-up Date */}
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
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Row 6: Details */}
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
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Lead'
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

export default AddLead;
