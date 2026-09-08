import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import DataTable from '../../pages/components/DataTable';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';
import ErrorBoundary from '../../pages/components/ErrorBoundary';

const LeadList = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [followupTypeFilter, setFollowupTypeFilter] = useState('');
    const [followupStatusFilter, setFollowupStatusFilter] = useState('');
    const [leadTypes, setLeadTypes] = useState([]);
    const [leadStatuses, setLeadStatuses] = useState([]);

    // Follow-up modal states
    const [showFollowupModal, setShowFollowupModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [followupFormData, setFollowupFormData] = useState({
        lead_id: '',
        followup_date: '',
        followup_time: '',
        followup_type: '',
        followup_status: '',
        lead_status: '',
        notes: '',
        is_completed: false,
    });
    const [followupLoading, setFollowupLoading] = useState(false);
    const [followupErrors, setFollowupErrors] = useState({});

    // Dynamic dropdown states
    const [followupTypes, setFollowupTypes] = useState([]);
    const [followupStatuses, setFollowupStatuses] = useState([]);
    const [allFollowupStatuses, setAllFollowupStatuses] = useState([]);
    const [leadStatusOptions, setLeadStatusOptions] = useState([]);

    // Lead activities states
    const [leadActivities, setLeadActivities] = useState([]);
    const [activitiesLoading, setActivitiesLoading] = useState(false);
    const [lastFollowupActivity, setLastFollowupActivity] = useState(null);

    const apiService = ApiService();

    // Helper function to get next business day
    const getNextBusinessDay = () => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // If tomorrow is Saturday (6) or Sunday (0), move to Monday
        if (tomorrow.getDay() === 6) { // Saturday
            tomorrow.setDate(tomorrow.getDate() + 2); // Move to Monday
        } else if (tomorrow.getDay() === 0) { // Sunday
            tomorrow.setDate(tomorrow.getDate() + 1); // Move to Monday
        }

        return tomorrow.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    };

    useEffect(() => {
        fetchLeads();
        fetchDropdownData();
        fetchFollowupData();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const response = await apiService.vGet('/api/crm/leads');

            if (response.data) {
                if (Array.isArray(response.data)) {
                    setLeads(response.data);
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    setLeads(response.data.data);
                } else {
                    setLeads([]);
                }
            } else {
                setLeads([]);
            }
        } catch (error) {
            console.error('Error fetching leads:', error);
            toast.error('Error fetching leads. Please try again.');
            setLeads([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const [typesRes, statusesRes, leadStatusRes] = await Promise.all([
                apiService.vGet('/api/crm/lead-types'),
                apiService.vGet('/api/crm/lead-status'),
                apiService.vGet('/api/crm/lead-status')
            ]);

            setLeadTypes(Array.isArray(typesRes.data) ? typesRes.data : []);
            setLeadStatuses(Array.isArray(statusesRes.data) ? statusesRes.data : []);
            setLeadStatusOptions(Array.isArray(leadStatusRes.data) ? leadStatusRes.data : []);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }
    };

    const fetchFollowupData = async () => {
        try {
            const [followupTypesRes, followupStatusesRes] = await Promise.all([
                apiService.vGet('/api/crm/followup-types'),
                apiService.vGet('/api/crm/followup-statuses')
            ]);

            setFollowupTypes(Array.isArray(followupTypesRes.data) ? followupTypesRes.data : []);
            setAllFollowupStatuses(Array.isArray(followupStatusesRes.data) ? followupStatusesRes.data : []);
            setFollowupStatuses(Array.isArray(followupStatusesRes.data) ? followupStatusesRes.data : []);
        } catch (error) {
            console.error('Error fetching followup data:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            try {
                console.log('ApiService object:', apiService);
                console.log('Available methods:', Object.keys(apiService));

                // Try multiple approaches
                let response;
                if (apiService.vDelete) {
                    response = await apiService.vDelete(`/api/crm/leads/${id}`);
                } else if (apiService.delete) {
                    response = await apiService.delete(`/api/crm/leads`, id);
                } else {
                    // Direct HTTP approach as last resort
                    const { token: authToken, user } = await import('../../core/auth/tokenManager').then(m => m.retrieveTokenAndUserData()) || {};
                    const { axiosAuthorization } = await import('../../core/services/axiosConfig');
                    const httpAuth = axiosAuthorization(authToken, user?.authorization);
                    response = await httpAuth.delete(`/api/crm/leads/${id}`);
                }

                toast.success('Lead deleted successfully');
                fetchLeads();
            } catch (error) {
                toast.error('Error deleting lead. Please try again.');
            }
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await apiService.vPatch(`/api/crm/leads/${id}/status`, { status });
            toast.success('Lead status updated successfully');
            fetchLeads();
        } catch (error) {
            console.error('Error updating lead status:', error);
            toast.error('Error updating lead status. Please try again.');
        }
    };

    const [showOnlyTimeline, setShowOnlyTimeline] = useState(false);

    // Fetch lead activities
    // Fetch lead activities (used for refreshing activities after form submission)
    const fetchLeadActivities = async (leadId) => {
        try {
            setActivitiesLoading(true);
            const response = await apiService.vGet(`/api/crm/leads/${leadId}/activities`);

            if (response.data && response.data.activities) {
                setLeadActivities(response.data.activities);
                return response.data.activities; // Return activities for use in other functions
            } else {
                setLeadActivities([]);
                return [];
            }
        } catch (error) {
            console.error('Error fetching lead activities:', error);
            setLeadActivities([]);
            return [];
        } finally {
            setActivitiesLoading(false);
        }
    };

    // Follow-up modal functions
    const handleOpenFollowupModal = async (lead, isViewOnly = false) => {
        setSelectedLead(lead);
        setFollowupErrors({});
        setShowOnlyTimeline(isViewOnly);
        setShowFollowupModal(true);

        // Reset followup statuses to show all initially
        setFollowupStatuses(allFollowupStatuses);

        // Fetch followup types for this lead's source_id
        if (lead.source_id) {
            try {
                const ftRes = await apiService.vGet(`/api/crm/followup-types?lead_source_id=${lead.source_id}`);
                if (Array.isArray(ftRes.data)) {
                    setFollowupTypes(ftRes.data);
                }
            } catch (error) {
                console.error('Error fetching followup types by lead source:', error);
            }
        }

        // Fetch lead activities first to get the last activity data
        setActivitiesLoading(true);
        try {
            const response = await apiService.vGet(`/api/crm/leads/${lead.id}/activities`);

            if (response.data && response.data.activities) {
                setLeadActivities(response.data.activities);

                // Find the last followup_created activity to pre-populate form
                const lastFollowupActivity = response.data.activities.find(
                    activity => activity.activity_type === 'followup_created'
                );

                // Store for notification display
                setLastFollowupActivity(lastFollowupActivity);

                // Set form data with last activity details or smart defaults
                const initialFormData = {
                    lead_id: lead.id,
                    followup_date: getNextBusinessDay(), // Set default to next business day
                    followup_time: '10:00', // Default time
                    followup_type: '',
                    followup_status: '',
                    lead_status: lead.status_id || '',
                    notes: '',
                    is_completed: false,
                };

                // Pre-populate with last activity data if available
                if (lastFollowupActivity) {
                    console.log('Pre-populating form with last activity:', lastFollowupActivity);

                    if (lastFollowupActivity.followup_type) {
                        initialFormData.followup_type = lastFollowupActivity.followup_type_id ? lastFollowupActivity.followup_type_id.toString() : '';

                        // Filter statuses for the pre-selected type
                        if (lastFollowupActivity.followup_type_id) {
                            try {
                                const [statusResponse, leadStatusResponse] = await Promise.all([
                                    apiService.vGet(`/api/crm/followup-statuses?followup_type_id=${lastFollowupActivity.followup_type_id}`),
                                    apiService.vGet(`/api/crm/lead-status?followup_type_id=${lastFollowupActivity.followup_type_id}`)
                                ]);
                                setFollowupStatuses(Array.isArray(statusResponse.data) ? statusResponse.data : []);
                                setLeadStatusOptions(Array.isArray(leadStatusResponse.data) ? leadStatusResponse.data : []);

                                // Auto-select the first available status or the same status as last time
                                if (statusResponse.data && statusResponse.data.length > 0) {
                                    initialFormData.followup_status = lastFollowupActivity.followup_status_id ?
                                        lastFollowupActivity.followup_status_id.toString() :
                                        statusResponse.data[0].id.toString();
                                }
                            } catch (error) {
                                console.error('Error fetching filtered followup statuses:', error);
                                const filtered = allFollowupStatuses.filter(status =>
                                    status.followup_type_id === parseInt(lastFollowupActivity.followup_type_id)
                                );
                                setFollowupStatuses(filtered);
                                setLeadStatusOptions([]);
                                if (filtered.length > 0) {
                                    initialFormData.followup_status = lastFollowupActivity.followup_status_id ?
                                        lastFollowupActivity.followup_status_id.toString() :
                                        filtered[0].id.toString();
                                }
                            }
                        }
                    }

                    if (lastFollowupActivity.followup_time) {
                        initialFormData.followup_time = lastFollowupActivity.followup_time;
                    }

                    // Ensure lead status is string
                    if (lastFollowupActivity.lead_status_id) {
                        initialFormData.lead_status = lastFollowupActivity.lead_status_id.toString();
                    } else if (lead.status_id) {
                        initialFormData.lead_status = lead.status_id.toString();
                    }

                    // Smart notes pre-filling
                    if (lastFollowupActivity.followup_notes) {
                        initialFormData.notes = lastFollowupActivity.followup_notes;
                    }
                } else {
                    console.log('No previous follow-up activity found, using smart defaults');

                    // Auto-select default follow-up type (first available or "Call")
                    if (followupTypes.length > 0) {
                        // Try to find "Call" type first, otherwise use first available
                        const callType = followupTypes.find(type =>
                            type.name.toLowerCase().includes('call') ||
                            type.name.toLowerCase().includes('phone')
                        );
                        const defaultType = callType || followupTypes[0];
                        initialFormData.followup_type = defaultType.id.toString();

                        // Auto-select statuses for the default type
                        try {
                            const [statusResponse, leadStatusResponse] = await Promise.all([
                                apiService.vGet(`/api/crm/followup-statuses?followup_type_id=${defaultType.id}`),
                                apiService.vGet(`/api/crm/lead-status?followup_type_id=${defaultType.id}`)
                            ]);
                            if (statusResponse.data && statusResponse.data.length > 0) {
                                setFollowupStatuses(statusResponse.data);
                                // Auto-select first status or "connected" if available
                                const connectedStatus = statusResponse.data.find(status =>
                                    status.name.toLowerCase().includes('connect') ||
                                    status.name.toLowerCase().includes('pending')
                                );
                                initialFormData.followup_status = (connectedStatus?.id || statusResponse.data[0].id).toString();
                            }
                            setLeadStatusOptions(Array.isArray(leadStatusResponse.data) ? leadStatusResponse.data : []);
                            // Auto-select first lead status if available
                            if (leadStatusResponse.data && leadStatusResponse.data.length > 0) {
                                initialFormData.lead_status = leadStatusResponse.data[0].id.toString();
                            }
                        } catch (error) {
                            console.error('Error fetching default followup statuses:', error);
                            const filtered = allFollowupStatuses.filter(status =>
                                status.followup_type_id === parseInt(defaultType.id)
                            );
                            setFollowupStatuses(filtered);
                            setLeadStatusOptions([]);
                            if (filtered.length > 0) {
                                initialFormData.followup_status = filtered[0].id.toString();
                            }
                        }
                    }

                    // Auto-select lead status (keep current or select first available)
                    if (!initialFormData.lead_status && leadStatusOptions.length > 0) {
                        // Try to find "Active" or "In Progress" status, otherwise use first
                        const activeStatus = leadStatusOptions.find(status =>
                            status.name.toLowerCase().includes('active') ||
                            status.name.toLowerCase().includes('progress') ||
                            status.name.toLowerCase().includes('new')
                        );
                        initialFormData.lead_status = (activeStatus?.id || leadStatusOptions[0].id).toString();
                    } else if (initialFormData.lead_status) {
                        initialFormData.lead_status = initialFormData.lead_status.toString();
                    }
                }

                setFollowupFormData(initialFormData);

            } else {
                setLeadActivities([]);
                // Set smart default form data if no activities
                const smartDefaults = {
                    lead_id: lead.id,
                    followup_date: getNextBusinessDay(),
                    followup_time: '10:00',
                    followup_type: '',
                    followup_status: '',
                    lead_status: lead.status_id ? lead.status_id.toString() : '',
                    notes: '',
                    is_completed: false,
                };

                // Auto-select default follow-up type
                if (followupTypes.length > 0) {
                    const callType = followupTypes.find(type =>
                        type.name.toLowerCase().includes('call') ||
                        type.name.toLowerCase().includes('phone')
                    );
                    smartDefaults.followup_type = (callType || followupTypes[0]).id.toString();
                }

                // Auto-select lead status if not set
                if (!smartDefaults.lead_status && leadStatusOptions.length > 0) {
                    const activeStatus = leadStatusOptions.find(status =>
                        status.name.toLowerCase().includes('active') ||
                        status.name.toLowerCase().includes('new')
                    );
                    smartDefaults.lead_status = (activeStatus?.id || leadStatusOptions[0].id).toString();
                }

                setFollowupFormData(smartDefaults);

            }
        } catch (error) {
            console.error('Error fetching lead activities:', error);
            setLeadActivities([]);
            // Set smart default form data on error
            const smartDefaults = {
                lead_id: lead.id,
                followup_date: getNextBusinessDay(),
                followup_time: '10:00',
                followup_type: '',
                followup_status: '',
                lead_status: lead.status_id ? lead.status_id.toString() : '',
                notes: '',
                is_completed: false,
            };

            // Auto-select defaults even on error
            if (followupTypes.length > 0) {
                const callType = followupTypes.find(type =>
                    type.name.toLowerCase().includes('call') ||
                    type.name.toLowerCase().includes('phone')
                );
                smartDefaults.followup_type = (callType || followupTypes[0]).id.toString();
            }

            if (!smartDefaults.lead_status && leadStatusOptions.length > 0) {
                const activeStatus = leadStatusOptions.find(status =>
                    status.name.toLowerCase().includes('active') ||
                    status.name.toLowerCase().includes('new')
                );
                smartDefaults.lead_status = (activeStatus?.id || leadStatusOptions[0].id).toString();
            }

            setFollowupFormData(smartDefaults);

        } finally {
            setActivitiesLoading(false);
        }
    };

    // Filter followup statuses and lead statuses based on selected type
    const handleFollowupTypeChange = async (e) => {
        const typeId = e.target.value;
        setFollowupFormData(prev => ({
            ...prev,
            followup_type: typeId,
            followup_status: '', // Reset status when type changes
            lead_status: '' // Reset lead status when type changes
        }));

        // Filter statuses and lead statuses for selected type
        if (typeId) {
            try {
                const [statusResponse, leadStatusResponse] = await Promise.all([
                    apiService.vGet(`/api/crm/followup-statuses?followup_type_id=${typeId}`),
                    apiService.vGet(`/api/crm/lead-status?followup_type_id=${typeId}`)
                ]);
                setFollowupStatuses(Array.isArray(statusResponse.data) ? statusResponse.data : []);
                setLeadStatusOptions(Array.isArray(leadStatusResponse.data) ? leadStatusResponse.data : []);
            } catch (error) {
                console.error('Error fetching filtered statuses:', error);
                // Fallback to filtering from all statuses
                const filtered = allFollowupStatuses.filter(status =>
                    status.followup_type_id === parseInt(typeId)
                );
                setFollowupStatuses(filtered);
                setLeadStatusOptions([]);
            }
        } else {
            setFollowupStatuses(allFollowupStatuses);
            setLeadStatusOptions([]);
        }

        // Clear error when user starts selecting
        if (followupErrors.followup_type) {
            setFollowupErrors(prev => ({
                ...prev,
                followup_type: ''
            }));
        }
    };

    const handleCloseFollowupModal = () => {
        setShowFollowupModal(false);
        setSelectedLead(null);
        setLastFollowupActivity(null);
        setFollowupFormData({
            lead_id: '',
            followup_date: '',
            followup_time: '',
            followup_type: '',
            followup_status: '',
            lead_status: '',
            notes: '',
            is_completed: false,
        });
        setFollowupErrors({});
        setLeadActivities([]);
        setActivitiesLoading(false);
        // Reset followup statuses to show all
        setFollowupStatuses(allFollowupStatuses);
    };

    const handleFollowupInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Handle followup type change specially
        if (name === 'followup_type') {
            handleFollowupTypeChange(e);
            return;
        }

        setFollowupFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user starts typing
        if (followupErrors[name]) {
            setFollowupErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateFollowupForm = () => {
        const newErrors = {};

        if (!followupFormData.lead_id) newErrors.lead_id = 'Lead is required';
        if (!followupFormData.followup_date) newErrors.followup_date = 'Follow-up date is required';
        if (!followupFormData.followup_time) newErrors.followup_time = 'Follow-up time is required';
        if (!followupFormData.followup_type) newErrors.followup_type = 'Follow-up type is required';

        setFollowupErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFollowupSubmit = async (e) => {
        e.preventDefault();

        if (!validateFollowupForm()) {
            toast.error('Please fix the errors before submitting');
            return;
        }

        setFollowupLoading(true);
        try {
            // Submit follow-up
            const response = await apiService.vPost('/api/crm/followups', followupFormData);

            if (response.data) {
                toast.success('Follow-up scheduled successfully');

                // Update lead status if changed
                if (followupFormData.lead_status && followupFormData.lead_status !== selectedLead.status_id) {
                    try {
                        const statusResponse = await apiService.vPatch(`/api/crm/leads/${selectedLead.id}/status`, {
                            status_id: parseInt(followupFormData.lead_status)
                        });

                        toast.success('Lead status updated successfully');
                    } catch (statusError) {
                        const errorMessage = statusError.response?.data?.message ||
                            statusError.response?.data?.error ||
                            'Failed to update lead status';
                        toast.warning(`Follow-up scheduled but ${errorMessage.toLowerCase()}`);
                    }
                }

                // Refresh activities to show the new follow-up activity
                fetchLeadActivities(selectedLead.id);
                // Reset form but keep modal open to show updated activities
                setFollowupFormData({
                    lead_id: selectedLead.id,
                    followup_date: '',
                    followup_time: '',
                    followup_type: '',
                    followup_status: '',
                    lead_status: selectedLead.status_id || '',
                    notes: '',
                    is_completed: false,
                });
                setFollowupErrors({});
                fetchLeads(); // Refresh leads to update follow-up dates
            } else {
                toast.error('Failed to schedule follow-up');
            }
        } catch (error) {
            console.error('Error scheduling follow-up:', error);
            if (error.response?.data?.errors) {
                setFollowupErrors(error.response.data.errors);
            }
            toast.error(error.response?.data?.message || 'Error scheduling follow-up. Please try again.');
        } finally {
            setFollowupLoading(false);
        }
    };

    // Utility functions for activities
    const getActivityIcon = (activityType) => {
        const icons = {
            'lead_created': 'fa-plus-circle',
            'lead_updated': 'fa-edit',
            'lead_assigned': 'fa-user-plus',
            'status_changed': 'fa-exchange-alt',
            'followup_created': 'fa-calendar-plus',
            'followup_completed': 'fa-calendar-check',
            'lead_closed': 'fa-check-circle',
            'lead_lost': 'fa-times-circle',
            'communication': 'fa-phone',
            'custom_field_updated': 'fa-cog',
            'Call': 'fa-phone',
            'Meeting': 'fa-users',
            'Email': 'fa-envelope',
            'Note': 'fa-sticky-note',
            'Demo': 'fa-desktop',
            'Proposal': 'fa-file-text'
        };
        return icons[activityType] || 'fa-info-circle';
    };

    const getActivityColor = (activityType) => {
        const colors = {
            'lead_created': 'success',
            'lead_updated': 'info',
            'lead_assigned': 'primary',
            'status_changed': 'warning',
            'followup_created': 'info',
            'followup_completed': 'success',
            'lead_closed': 'success',
            'lead_lost': 'danger',
            'communication': 'primary',
            'custom_field_updated': 'secondary',
            'Call': 'primary',
            'Meeting': 'success',
            'Email': 'warning',
            'Note': 'info',
            'Demo': 'info',
            'Proposal': 'secondary'
        };
        return colors[activityType] || 'secondary';
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'N/A';
        const date = new Date(dateTime);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '' || lead.status_id?.toString() === statusFilter;
        const matchesType = typeFilter === '' || lead.lead_type_id?.toString() === typeFilter;
        const matchesPriority = priorityFilter === '' || lead.priority === priorityFilter;

        // Check latest followup type and status
        const latestFollowupType = lead.latestFollowup?.followupType;
        const latestFollowupStatus = lead.latestFollowup?.followupStatus;

        const matchesFollowupType = followupTypeFilter === '' ||
            (latestFollowupType && latestFollowupType.id?.toString() === followupTypeFilter);
        const matchesFollowupStatus = followupStatusFilter === '' ||
            (latestFollowupStatus && latestFollowupStatus.id?.toString() === followupStatusFilter);

        return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesFollowupType && matchesFollowupStatus;
    });

    const columns = [
        {
            Header: 'ID',
            accessor: 'id',
            disableSortBy: false
        },
        {
            Header: 'Name',
            accessor: 'name',
            disableSortBy: false
        },
        {
            Header: 'Phone',
            accessor: 'phone',
            disableSortBy: true
        },
        {
            Header: 'Email',
            accessor: 'email',
            disableSortBy: true
        },
        {
            Header: 'Type',
            accessor: 'lead_type_id',
            disableSortBy: true,
            Cell: ({ row }) => {
                const leadType = leadTypes.find(type => type.id === row.original.lead_type_id);
                return leadType ? leadType.name : '-';
            }
        },
        {
            Header: 'Priority',
            accessor: 'priority',
            disableSortBy: false,
            Cell: ({ row }) => {
                // Check for latest priority from activities, fallback to lead.priority
                const latestActivity = row.original.activities?.find(activity =>
                    activity.activity_type === 'lead_updated' && activity.details.includes('priority')
                );
                const currentPriority = row.original.priority;

                return currentPriority ? currentPriority : '-';
            }
        },
        {
            Header: 'Lead Status',
            accessor: 'status_id',
            disableSortBy: true,
            Cell: ({ row }) => {
                // Use current lead status
                const status = leadStatuses.find(s => s.id === row.original.status_id);
                return status ? (
                    <span className="badge" style={{ backgroundColor: status.color }}>
                        {status.name}
                    </span>
                ) : '-';
            }
        },
        {
            Header: 'Follow-up Type',
            accessor: 'latest_followup_type',
            disableSortBy: true,
            Cell: ({ row }) => {
                // Get the latest followup type from latestFollowup relationship
                const followupType = row.original.latest_followup?.followup_type?.name;
                return followupType ? followupType : '-';
            }
        },
        {
            Header: 'Follow-up Status',
            accessor: 'latest_followup_status',
            disableSortBy: true,
            Cell: ({ row }) => {
                // Get the latest followup status from latestFollowup relationship
                const followupStatus = row.original.latest_followup?.followup_status?.name;
                // return followupStatus ? (
                //     <span className="badge" style={{ backgroundColor: followupStatus.color || '#6c757d' }}>
                //         {followupStatus.name}
                //     </span>
                // ) : '-';
                return followupStatus ? followupStatus : '-';
            }
        },
        {
            Header: 'Follow-up Date',
            accessor: 'followup_date',
            disableSortBy: false,
            Cell: ({ row }) => row.original.followup_date ? new Date(row.original.followup_date).toLocaleDateString() : '-'
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => {
                // Find max position for the current lead's followup type
                let isFinalStatus = false;
                if (row.original.status && leadStatusOptions && leadStatusOptions.length > 0) {
                    const currentTypeId = row.original.status.followup_type_id;
                    const statusesForType = leadStatusOptions.filter(s => s.followup_type_id === currentTypeId);
                    if (statusesForType.length > 0) {
                        const maxPosition = Math.max(...statusesForType.map(s => parseInt(s.position, 10) || 0));
                        isFinalStatus = parseInt(row.original.status.position, 10) >= maxPosition;
                    }
                }

                return (
                    <div className="btn-group" role="group">
                        {isFinalStatus ? (
                            <button
                                onClick={() => handleOpenFollowupModal(row.original, true)}
                                className="btn btn-sm btn-success"
                                title="Activities"
                            >
                                Activities
                            </button>
                        ) : (
                            <button
                                onClick={() => handleOpenFollowupModal(row.original, false)}
                                className="btn btn-sm btn-warning"
                                title="Schedule Follow-up"
                            >
                                Follow Up
                            </button>
                        )}


                        {/*  <Link
                        to={`/crm/leads/view/${row.original.id}`}
                        className="btn btn-sm btn-info"
                        title="View Lead"
                    >
                        <i className="fa fa-eye"></i>
                    </Link>
                    <Link
                        to={`/crm/leads/edit/${row.original.id}`}

                        className="btn btn-sm btn-warning"
                        title="Edit Lead"
                    >
                        <i className="fa fa-edit"></i>
                    </Link>

                    <button
                        onClick={() => handleDelete(row.original.id)}
                        className="btn btn-sm btn-danger"
                        title="Delete Lead"
                    >
                        <i className="fa fa-trash"></i>
                    </button> */}
                    </div>
                );
            }
        }
    ];

    return (
        <ErrorBoundary>
            <Pageheader
                currentpage="Lead Management"
                activepage="CRM"
                mainpage="Lead Management"
            />

            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Leads List</h5>
                            <div className="d-flex gap-2">
                                {/* <Link to="/crm/followup-types/list" className="btn btn-outline-secondary">
                                    <i className="fa fa-cog me-2"></i>Followup Types
                                </Link>
                                <Link to="/crm/followup-statuses/list" className="btn btn-outline-info">
                                    <i className="fa fa-tags me-2"></i>Followup Statuses
                                </Link> */}
                                <Link to="/crm/leads/add" className="btn btn-primary">
                                    <i className="fa fa-plus me-2"></i>Add New Lead
                                </Link>
                            </div>
                        </div>
                        <div className="card-body">
                            {/* Filters */}
                            <div className="row mb-3">
                                <div className="col-md-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search leads..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <select
                                        className="form-control"
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                    >
                                        <option value="">All Types</option>
                                        {leadTypes.map(type => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <select
                                        className="form-control"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="">All Lead Status</option>
                                        {leadStatuses.map(status => (
                                            <option key={status.id} value={status.id}>
                                                {status.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <select
                                        className="form-control"
                                        value={priorityFilter}
                                        onChange={(e) => setPriorityFilter(e.target.value)}
                                    >
                                        <option value="">All Priorities</option>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <button
                                        onClick={fetchLeads}
                                        className="btn btn-secondary"
                                    >
                                        <i className="fa fa-refresh me-2"></i>Refresh
                                    </button>
                                </div>
                            </div>

                            {/* Additional Filters Row */}
                            <div className="row mb-3">
                                <div className="col-md-3">
                                    <select
                                        className="form-control"
                                        value={followupTypeFilter}
                                        onChange={(e) => setFollowupTypeFilter(e.target.value)}
                                    >
                                        <option value="">All Followup Types</option>
                                        {followupTypes.map(type => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <select
                                        className="form-control"
                                        value={followupStatusFilter}
                                        onChange={(e) => setFollowupStatusFilter(e.target.value)}
                                    >
                                        <option value="">All Followup Status</option>
                                        {followupStatuses.map(status => (
                                            <option key={status.id} value={status.id}>
                                                {status.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    {/* Empty space for future filters or alignment */}
                                </div>
                            </div>

                            {/* Data Table */}
                            {loading ? (
                                <TableShimmerLoader />
                            ) : (
                                <DataTable
                                    data={filteredLeads}
                                    columns={columns}
                                    searchable={false}
                                    itemsPerPageOptions={[10, 25, 50, 100]}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Follow-up Modal */}
            {showFollowupModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fa fa-calendar-plus me-2"></i>
                                    Schedule Follow-up for {selectedLead?.name}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCloseFollowupModal}
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body">
                                {/* Follow-up Form Section */}
                                {/* Follow-up Form Section */}
                                {!showOnlyTimeline && (
                                    <>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group mb-3">
                                                    <label className="form-label">Lead Information</label>
                                                    <div className="card bg-light">
                                                        <div className="card-body py-2">
                                                            <strong>{selectedLead?.name}</strong><br />
                                                            <small className="text-muted">
                                                                {selectedLead?.phone && `Phone: ${selectedLead.phone}`}
                                                                {selectedLead?.phone && selectedLead?.email && ' | '}
                                                                {selectedLead?.email && `Email: ${selectedLead.email}`}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>

                                            <div className="col-md-4">
                                                <div className="form-group mb-3">
                                                    <label className="form-label">Follow-up Type <span className="text-danger">*</span></label>
                                                    <select
                                                        name="followup_type"
                                                        value={followupFormData.followup_type}
                                                        onChange={handleFollowupTypeChange}
                                                        className={`form-control ${followupErrors.followup_type ? 'is-invalid' : ''}`}
                                                        required
                                                    >
                                                        <option value="">Select Follow-up Type</option>
                                                        {followupTypes.map(type => (
                                                            <option key={type.id} value={type.id}>
                                                                {type.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {followupErrors.followup_type && <div className="invalid-feedback">{followupErrors.followup_type}</div>}
                                                </div>
                                            </div>

                                            <div className="col-md-4">
                                                <div className="form-group mb-3">
                                                    <label className="form-label">Follow-up Status</label>
                                                    <select
                                                        name="followup_status"
                                                        value={followupFormData.followup_status}
                                                        onChange={handleFollowupInputChange}
                                                        className={`form-control ${followupErrors.followup_status ? 'is-invalid' : ''}`}
                                                        disabled={!followupFormData.followup_type}
                                                    >
                                                        <option value="">
                                                            {!followupFormData.followup_type ? 'Select Follow-up Type First' : 'Select Status'}
                                                        </option>
                                                        {followupStatuses.map(status => (
                                                            <option key={status.id} value={status.id}>
                                                                {status.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {followupErrors.followup_status && <div className="invalid-feedback">{followupErrors.followup_status}</div>}
                                                </div>
                                            </div>

                                            <div className="col-md-4">
                                                <div className="form-group mb-3">
                                                    <label className="form-label">Lead Status</label>
                                                    <select
                                                        name="lead_status"
                                                        value={followupFormData.lead_status}
                                                        onChange={handleFollowupInputChange}
                                                        className={`form-control ${followupErrors.lead_status ? 'is-invalid' : ''}`}
                                                    >
                                                        <option value="">Select Lead Status</option>
                                                        {leadStatusOptions.map(status => (
                                                            <option key={status.id} value={status.id}>
                                                                {status.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {followupErrors.lead_status && <div className="invalid-feedback">{followupErrors.lead_status}</div>}
                                                </div>
                                            </div>

                                            <div className="col-md-3">
                                                <div className="form-group mb-3">
                                                    <label className="form-label">Next Follow-up Date <span className="text-danger">*</span></label>
                                                    <input
                                                        type="date"
                                                        name="followup_date"
                                                        value={followupFormData.followup_date}
                                                        onChange={handleFollowupInputChange}
                                                        className={`form-control ${followupErrors.followup_date ? 'is-invalid' : ''}`}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        required
                                                    />
                                                    {followupErrors.followup_date && <div className="invalid-feedback">{followupErrors.followup_date}</div>}
                                                </div>
                                            </div>

                                            <div className="col-md-3">
                                                <div className="form-group mb-3">
                                                    <label className="form-label">Next Follow-up Time <span className="text-danger">*</span></label>
                                                    <input
                                                        type="time"
                                                        name="followup_time"
                                                        value={followupFormData.followup_time}
                                                        onChange={handleFollowupInputChange}
                                                        className={`form-control ${followupErrors.followup_time ? 'is-invalid' : ''}`}
                                                        required
                                                    />
                                                    {followupErrors.followup_time && <div className="invalid-feedback">{followupErrors.followup_time}</div>}
                                                </div>
                                            </div>

                                            <div className="col-md-3">
                                                <div className="form-group mb-3">
                                                    <label className="form-label">&nbsp;</label>
                                                    <div className="form-check">
                                                        <input
                                                            type="checkbox"
                                                            name="is_completed"
                                                            checked={followupFormData.is_completed}
                                                            onChange={handleFollowupInputChange}
                                                            className="form-check-input"
                                                            id="is_completed"
                                                        />
                                                        <label className="form-check-label" htmlFor="is_completed">
                                                            Mark as completed
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-9">
                                                <div className="form-group mb-3">
                                                    <label className="form-label">Notes</label>
                                                    <textarea
                                                        name="notes"
                                                        value={followupFormData.notes}
                                                        onChange={handleFollowupInputChange}
                                                        className="form-control"
                                                        rows="2"
                                                        placeholder="Enter follow-up agenda, discussion points, or special instructions..."
                                                    ></textarea>
                                                </div>
                                            </div>

                                            <div className="col-md-3">
                                                <div className="form-group mb-3">
                                                    <label className="form-label">&nbsp;</label>
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary w-100"
                                                        disabled={followupLoading}
                                                        onClick={handleFollowupSubmit}
                                                    >
                                                        {followupLoading ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                                Scheduling...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fa fa-calendar-check me-1"></i>
                                                                Schedule
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <hr />
                                    </>
                                )}

                                {/* Lead Activities Section - Full Width */}
                                <div className="row">
                                    <div className="col-12">
                                        <div className="card">
                                            <div className="card-header">
                                                <h6 className="card-title mb-0">
                                                    <i className="fa fa-history me-2"></i>
                                                    Lead Activities & Timeline
                                                </h6>
                                            </div>
                                            <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                {activitiesLoading ? (
                                                    <div className="text-center py-4">
                                                        <div className="spinner-border spinner-border-sm" role="status">
                                                            <span className="sr-only">Loading...</span>
                                                        </div>
                                                        <p className="mt-2 mb-0 text-muted">Loading activities...</p>
                                                    </div>
                                                ) : leadActivities.length > 0 ? (
                                                    <div className="list-group list-group-flush">
                                                        {leadActivities.map((activity, index) => (
                                                            <div key={activity.id} className="list-group-item border-0 border-bottom">
                                                                <div className="d-flex justify-content-between align-items-start">
                                                                    <div className="flex-grow-1">
                                                                        {/* Activity Type Badge */}
                                                                        <div className="mb-2">
                                                                            <span className={`badge bg-${getActivityColor(activity.activity_type)} me-2`}>
                                                                                <i className={`fa ${getActivityIcon(activity.activity_type)} me-1`}></i>
                                                                                {(activity.activity_type || '').replace('_', ' ').toUpperCase()}
                                                                            </span>

                                                                            {/* Show Lead Status if available */}
                                                                            {activity.lead_status && (
                                                                                <span
                                                                                    className="badge me-2"
                                                                                    style={{ backgroundColor: activity.lead_status_color || '#6c757d' }}
                                                                                >
                                                                                    Lead: {activity.lead_status}
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {/* Activity Details */}
                                                                        <div className="mb-2">
                                                                            <span className="text-dark">{activity.details}</span>
                                                                        </div>

                                                                        {/* Enhanced Followup Information */}
                                                                        {activity.activity_type === 'followup_created' && (
                                                                            <div className="row g-2 mb-2">
                                                                                {activity.followup_type && (
                                                                                    <div className="col-auto">
                                                                                        <small className="d-flex align-items-center">
                                                                                            <span
                                                                                                className="badge me-1"
                                                                                                style={{ backgroundColor: activity.followup_type_color || '#0d6efd' }}
                                                                                            >
                                                                                                Type: {activity.followup_type}
                                                                                            </span>
                                                                                        </small>
                                                                                    </div>
                                                                                )}

                                                                                {activity.followup_status && (
                                                                                    <div className="col-auto">
                                                                                        <small className="d-flex align-items-center">
                                                                                            <span
                                                                                                className="badge me-1"
                                                                                                style={{ backgroundColor: activity.followup_status_color || '#198754' }}
                                                                                            >
                                                                                                Status: {activity.followup_status}
                                                                                            </span>
                                                                                        </small>
                                                                                    </div>
                                                                                )}

                                                                                {activity.followup_time && (
                                                                                    <div className="col-auto">
                                                                                        <small className="text-info d-flex align-items-center">
                                                                                            <i className="fa fa-clock me-1"></i>
                                                                                            Time: {activity.followup_time}
                                                                                        </small>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}

                                                                        {/* Next Followup Date */}
                                                                        {activity.next_followup && (
                                                                            <div className="mb-1">
                                                                                <small className="text-info d-flex align-items-center">
                                                                                    <i className="fa fa-calendar me-1"></i>
                                                                                    <strong>Next Followup: {new Date(activity.next_followup).toLocaleDateString()}</strong>
                                                                                </small>
                                                                            </div>
                                                                        )}

                                                                        {/* Followup Notes */}
                                                                        {activity.followup_notes && (
                                                                            <div className="mt-2">
                                                                                <small className="text-muted">
                                                                                    <i className="fa fa-sticky-note me-1"></i>
                                                                                    <em>Notes: {activity.followup_notes}</em>
                                                                                </small>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* User and Time Info */}
                                                                    <div className="text-end">
                                                                        {activity.user && (
                                                                            <div className="mb-1">
                                                                                <small className="text-secondary d-flex align-items-center justify-content-end">
                                                                                    <i className="fa fa-user me-1"></i>
                                                                                    {activity.user.name || `User #${activity.user_id}`}
                                                                                </small>
                                                                            </div>
                                                                        )}
                                                                        <div>
                                                                            <small className="text-muted">
                                                                                {formatDateTime(activity.created_at)}
                                                                            </small>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4">
                                                        <i className="fa fa-history fa-3x text-muted mb-3"></i>
                                                        <p className="text-muted">No activities found for this lead.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCloseFollowupModal}
                                    disabled={followupLoading}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer />
        </ErrorBoundary>
    );
};

export default LeadList;
