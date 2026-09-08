import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import { toast } from 'react-toastify';
import Pageheader from '../../layouts/Pageheader';
import { Select } from 'antd';
import { uploadToBunny } from '../../utils/BunnyUploadService';

const PopupForm = () => {
    const apiService = ApiService();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [members, setMembers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        image_url: '',
        image_position: 'center',
        button_text: '',
        button_link: '',
        popup_type: 'general',
        show_on_screen: 'both',
        priority: 10,
        display_start: '',
        display_end: '',
        show_after_seconds: 0,
        auto_close_seconds: 5,
        display_frequency: 'always',
        is_repeatable: true,
        is_dismissible: true,
        status: 'active',
        target_users: [],
        target_roles: []
    });

    // App internal routes for button link dropdown
    const appRoutes = [
        { label: 'Dashboard Routes', options: [
            { value: '/dashboard', label: 'Dashboard' },
            { value: '/profile', label: 'Profile' },
            { value: '/settings', label: 'Settings' },
        ]},
        { label: 'Banking Routes', options: [
            { value: '/aeps', label: 'AEPS' },
            { value: '/dmt', label: 'Money Transfer (DMT)' },
            { value: '/p2p', label: 'P2P Transfer' },
            { value: '/qr-screen', label: 'UPI QR' },
            { value: '/accounts', label: 'Accounts' },
        ]},
        { label: 'Utility Routes', options: [
            { value: '/recharge', label: 'Mobile Recharge' },
            { value: '/dth', label: 'DTH Recharge' },
            { value: '/electricity', label: 'Electricity Bill' },
            { value: '/bill-categories', label: 'Bill Categories' },
        ]},
        { label: 'Finance Routes', options: [
            { value: '/loan', label: 'Loan' },
            { value: '/insurance', label: 'Insurance' },
            { value: '/cibil', label: 'CIBIL Check' },
        ]},
        { label: 'Support Routes', options: [
            { value: '/help-support', label: 'Help & Support' },
            { value: '/contact', label: 'Contact Us' },
        ]},
    ];

    useEffect(() => {
        fetchMembers();
        fetchRoles();
        if (isEdit) {
            fetchPopup();
        }
    }, [id]);

    const fetchPopup = async () => {
        setLoading(true);
        try {
            const response = await apiService.vGet(`/api/popups/${id}`);
            if (response.data.status === 1) {
                const popup = response.data.data;
                setFormData({
                    ...popup,
                    target_users: popup.target_users_array || [],
                    target_roles: popup.target_roles_array || [],
                    display_start: popup.display_start ? popup.display_start.slice(0, 16) : '',
                    display_end: popup.display_end ? popup.display_end.slice(0, 16) : '',
                });
                if (popup.image_url) {
                    setImagePreview(popup.image_url);
                }
            }
        } catch (error) {
            toast.error('Failed to load popup');
            navigate('/popup/list');
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const response = await apiService.vGet('/api/popups/members/list', { params: { limit: 100 } });
            if (response.data.status === 1) {
                setMembers(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await apiService.vGet('/api/popups/roles/list');
            if (response.data.status === 1) {
                setRoles(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be less than 2MB');
            return;
        }

        // Store file and show preview
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        // Clear image_url since we're using file upload
        setFormData(prev => ({ ...prev, image_url: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const submitData = { ...formData };
            
            // Handle empty dates
            if (!submitData.display_start) submitData.display_start = null;
            if (!submitData.display_end) submitData.display_end = null;
            
            // Convert booleans to 1/0 for FormData compatibility
            submitData.is_repeatable = submitData.is_repeatable ? 1 : 0;
            submitData.is_dismissible = submitData.is_dismissible ? 1 : 0;

            // Upload image to BunnyCDN if file is selected
            if (imageFile) {
                toast.info('Uploading image...');
                const result = await uploadToBunny(imageFile, 'popups');
                if (result.success) {
                    submitData.image_url = result.url;
                } else {
                    toast.error('Image upload failed: ' + result.error);
                    setSaving(false);
                    return;
                }
            }

            if (isEdit) {
                const response = await apiService.vPut(`/api/popups/${id}`, submitData);
                if (response.data.status === 1) {
                    toast.success('Popup updated successfully');
                    navigate('/popup/list');
                } else {
                    toast.error(response.data.message || 'Failed to update popup');
                }
            } else {
                const response = await apiService.vPost('/api/popups', submitData);
                if (response.data.status === 1) {
                    toast.success('Popup created successfully');
                    navigate('/popup/list');
                } else {
                    toast.error(response.data.message || 'Failed to create popup');
                }
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(isEdit ? 'Failed to update popup' : 'Failed to create popup');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <>
            <Pageheader 
                mainheading={isEdit ? "Edit Popup" : "Add Popup"} 
                parentfolder="Popups" 
                activepage={isEdit ? "Edit" : "Add"} 
            />
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            {/* Main Content */}
                            <div className="col-lg-8">
                                <div className="card shadow-sm mb-3">
                                    <div className="card-header bg-primary text-white">
                                        <h6 className="mb-0">Popup Content</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-8">
                                                <label className="form-label">Title</label>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    className="form-control"
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    placeholder="Popup title (optional)"
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Popup Type</label>
                                                <select
                                                    name="popup_type"
                                                    className="form-select"
                                                    value={formData.popup_type}
                                                    onChange={handleChange}
                                                >
                                                    <option value="general">General</option>
                                                    <option value="offer">Offer</option>
                                                    <option value="announcement">Announcement</option>
                                                    <option value="custom">Custom</option>
                                                </select>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Message</label>
                                                <textarea
                                                    name="message"
                                                    className="form-control"
                                                    rows="4"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    placeholder="Popup message content..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Image Section */}
                                <div className="card shadow-sm mb-3">
                                    <div className="card-header">
                                        <h6 className="mb-0">Popup Image</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Upload Image</label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                                <small className="text-muted">Max 2MB, JPG/PNG/GIF</small>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Or Image URL</label>
                                                <input
                                                    type="url"
                                                    name="image_url"
                                                    className="form-control"
                                                    value={formData.image_url}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        setImagePreview(e.target.value);
                                                    }}
                                                    placeholder="https://example.com/image.jpg"
                                                />
                                            </div>
                                            {imagePreview && (
                                                <div className="col-12">
                                                    <img 
                                                        src={imagePreview} 
                                                        alt="Preview" 
                                                        style={{ maxWidth: '200px', borderRadius: '8px' }}
                                                    />
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-sm btn-outline-danger ms-2"
                                                        onClick={() => {
                                                            setImagePreview(null);
                                                            setImageFile(null);
                                                            setFormData(prev => ({ ...prev, image_url: '' }));
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            )}
                                            <div className="col-md-6">
                                                <label className="form-label">Image Position</label>
                                                <select
                                                    name="image_position"
                                                    className="form-select"
                                                    value={formData.image_position}
                                                    onChange={handleChange}
                                                >
                                                    <option value="top">Top</option>
                                                    <option value="center">Center</option>
                                                    <option value="background">Background</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Button Section */}
                                <div className="card shadow-sm mb-3">
                                    <div className="card-header">
                                        <h6 className="mb-0">Action Button</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <label className="form-label">Button Text</label>
                                                <input
                                                    type="text"
                                                    name="button_text"
                                                    className="form-control"
                                                    value={formData.button_text}
                                                    onChange={handleChange}
                                                    placeholder="e.g. View Details"
                                                />
                                            </div>
                                            <div className="col-md-8">
                                                <label className="form-label">Button Link</label>
                                                <div className="input-group">
                                                    <select
                                                        className="form-select"
                                                        style={{ maxWidth: '200px' }}
                                                        onChange={(e) => {
                                                            if (e.target.value) {
                                                                setFormData(prev => ({ ...prev, button_link: e.target.value }));
                                                            }
                                                        }}
                                                    >
                                                        <option value="">Select Route...</option>
                                                        {appRoutes.map(group => (
                                                            <optgroup key={group.label} label={group.label}>
                                                                {group.options.map(opt => (
                                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                ))}
                                                            </optgroup>
                                                        ))}
                                                    </select>
                                                    <input
                                                        type="text"
                                                        name="button_link"
                                                        className="form-control"
                                                        value={formData.button_link}
                                                        onChange={handleChange}
                                                        placeholder="Route or external URL"
                                                    />
                                                </div>
                                                <small className="text-muted">
                                                    For login screen popups, only external URLs (https://) will work
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Targeting Section */}
                                <div className="card shadow-sm mb-3">
                                    <div className="card-header">
                                        <h6 className="mb-0">Targeting <small className="text-muted">(Leave empty for all users)</small></h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Target Roles</label>
                                                <Select
                                                    mode="multiple"
                                                    style={{ width: '100%' }}
                                                    placeholder="Select roles..."
                                                    value={formData.target_roles}
                                                    onChange={(value) => setFormData(prev => ({ ...prev, target_roles: value }))}
                                                    options={roles.map(r => ({ value: r.id, label: r.name }))}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Target Users</label>
                                                <Select
                                                    mode="multiple"
                                                    style={{ width: '100%' }}
                                                    placeholder="Select users..."
                                                    value={formData.target_users}
                                                    onChange={(value) => setFormData(prev => ({ ...prev, target_users: value }))}
                                                    options={members.map(m => ({ value: m.id, label: `${m.name} (${m.mobile_no})` }))}
                                                    showSearch
                                                    filterOption={(input, option) =>
                                                        option.label.toLowerCase().includes(input.toLowerCase())
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="col-lg-4">
                                <div className="card shadow-sm mb-3">
                                    <div className="card-header">
                                        <h6 className="mb-0">Display Settings</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <label className="form-label">Show on Screen</label>
                                            <select
                                                name="show_on_screen"
                                                className="form-select"
                                                value={formData.show_on_screen}
                                                onChange={handleChange}
                                            >
                                                <option value="home">Home (Dashboard)</option>
                                                <option value="login">Login</option>
                                                <option value="both">Both</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Priority</label>
                                            <input
                                                type="number"
                                                name="priority"
                                                className="form-control"
                                                value={formData.priority}
                                                onChange={handleChange}
                                                min="1"
                                            />
                                            <small className="text-muted">Lower number = Higher priority</small>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Display Frequency</label>
                                            <select
                                                name="display_frequency"
                                                className="form-select"
                                                value={formData.display_frequency}
                                                onChange={handleChange}
                                            >
                                                <option value="always">Always (Every app open)</option>
                                                <option value="once">Once (Until dismissed)</option>
                                                <option value="once_per_day">Once per Day</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Status</label>
                                            <select
                                                name="status"
                                                className="form-select"
                                                value={formData.status}
                                                onChange={handleChange}
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="card shadow-sm mb-3">
                                    <div className="card-header">
                                        <h6 className="mb-0">Timing</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <label className="form-label">Display Start</label>
                                            <input
                                                type="datetime-local"
                                                name="display_start"
                                                className="form-control"
                                                value={formData.display_start}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Display End</label>
                                            <input
                                                type="datetime-local"
                                                name="display_end"
                                                className="form-control"
                                                value={formData.display_end}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Show After (seconds)</label>
                                            <input
                                                type="number"
                                                name="show_after_seconds"
                                                className="form-control"
                                                value={formData.show_after_seconds}
                                                onChange={handleChange}
                                                min="0"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Auto Close Button After (seconds)</label>
                                            <input
                                                type="number"
                                                name="auto_close_seconds"
                                                className="form-control"
                                                value={formData.auto_close_seconds}
                                                onChange={handleChange}
                                                min="1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="card shadow-sm mb-3">
                                    <div className="card-header">
                                        <h6 className="mb-0">Options</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="form-check mb-2">
                                            <input
                                                type="checkbox"
                                                name="is_dismissible"
                                                className="form-check-input"
                                                checked={formData.is_dismissible}
                                                onChange={handleChange}
                                                id="isDismissible"
                                            />
                                            <label className="form-check-label" htmlFor="isDismissible">
                                                User can dismiss popup
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                name="is_repeatable"
                                                className="form-check-input"
                                                checked={formData.is_repeatable}
                                                onChange={handleChange}
                                                id="isRepeatable"
                                            />
                                            <label className="form-check-label" htmlFor="isRepeatable">
                                                Repeatable popup
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="d-grid gap-2">
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-1"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            <>{isEdit ? 'Update Popup' : 'Create Popup'}</>
                                        )}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary"
                                        onClick={() => navigate('/popup/list')}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default PopupForm;
