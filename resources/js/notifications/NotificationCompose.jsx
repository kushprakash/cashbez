import React, { useState, useEffect } from 'react';
import ApiService from '../core/services/ApiService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Pageheader from '../layouts/Pageheader';

const NotificationCompose = () => {
    const navigate = useNavigate();
    const apiService = ApiService();
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        type: 'promotional',
        target: 'all',
        selectedUsers: [],
    });

    const fetchFcmUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await apiService.vGet('/api/fcm/users');
            if (response.data.status) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        if (formData.target === 'selected') {
            fetchFcmUsers();
        }
    }, [formData.target]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleUserSelect = (userId) => {
        setFormData(prev => ({
            ...prev,
            selectedUsers: prev.selectedUsers.includes(userId)
                ? prev.selectedUsers.filter(id => id !== userId)
                : [...prev.selectedUsers, userId]
        }));
    };

    const handleSelectAll = () => {
        setFormData(prev => ({
            ...prev,
            selectedUsers: prev.selectedUsers.length === users.length 
                ? [] 
                : users.map(u => u.id)
        }));
    };

    const handleSend = async () => {
        if (!formData.title || !formData.body) {
            toast.error('Title and body are required');
            return;
        }

        if (formData.target === 'selected' && formData.selectedUsers.length === 0) {
            toast.error('Please select at least one user');
            return;
        }

        setLoading(true);

        try {
            let endpoint = '/api/fcm/send-campaign';
            let payload = {
                title: formData.title,
                body: formData.body,
                type: formData.type,
            };

            if (formData.target === 'selected') {
                payload.user_ids = formData.selectedUsers;
            }

            const response = await apiService.vPost(endpoint, payload);

            if (response.data.status) {
                toast.success(`Notification sent! Delivered to ${response.data.data.tokens_delivered} devices.`);
                navigate('/notification/list');
            } else {
                toast.error(response.data.message || 'Failed to send notification');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || 'Failed to send notification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Pageheader mainheading="Compose Notification" parentfolder="Notifications" activepage="Compose" />
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row">
                        <div className="col-lg-8 mx-auto">
                            <div className="card shadow-sm">
                                <div className="card-header bg-white">
                                    <h5 className="mb-0 fw-bold">New Push Notification</h5>
                                </div>
                                <div className="card-body">
                                    {/* Title */}
                                    <div className="mb-3">
                                        <label className="form-label fw-medium">Title *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.title}
                                            onChange={(e) => handleChange('title', e.target.value)}
                                            maxLength={100}
                                            placeholder="Enter notification title"
                                        />
                                        <small className="text-muted">{formData.title.length}/100 characters</small>
                                    </div>

                                    {/* Body */}
                                    <div className="mb-3">
                                        <label className="form-label fw-medium">Message *</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            value={formData.body}
                                            onChange={(e) => handleChange('body', e.target.value)}
                                            maxLength={500}
                                            placeholder="Enter notification message"
                                        ></textarea>
                                        <small className="text-muted">{formData.body.length}/500 characters</small>
                                    </div>

                                    {/* Type */}
                                    <div className="mb-3">
                                        <label className="form-label fw-medium">Type</label>
                                        <select
                                            className="form-select"
                                            value={formData.type}
                                            onChange={(e) => handleChange('type', e.target.value)}
                                        >
                                            <option value="transaction">Transaction</option>
                                            <option value="account">Account</option>
                                            <option value="system">System</option>
                                            <option value="promotional">Promotional</option>
                                            <option value="security">Security</option>
                                            <option value="service">Service</option>
                                        </select>
                                    </div>

                                    {/* Target */}
                                    <div className="mb-3">
                                        <label className="form-label fw-medium">Send To</label>
                                        <select
                                            className="form-select"
                                            value={formData.target}
                                            onChange={(e) => handleChange('target', e.target.value)}
                                        >
                                            <option value="all">All Users with FCM Tokens</option>
                                            <option value="selected">Selected Users</option>
                                        </select>
                                    </div>

                                    {/* User Selection */}
                                    {formData.target === 'selected' && (
                                        <div className="mb-3">
                                            <label className="form-label fw-medium">
                                                Select Users ({formData.selectedUsers.length} selected)
                                            </label>
                                            <div className="border rounded p-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                {loadingUsers ? (
                                                    <div className="text-center py-3">
                                                        <div className="spinner-border spinner-border-sm"></div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="form-check mb-2">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id="selectAll"
                                                                checked={formData.selectedUsers.length === users.length}
                                                                onChange={handleSelectAll}
                                                            />
                                                            <label className="form-check-label fw-bold" htmlFor="selectAll">
                                                                Select All ({users.length} users)
                                                            </label>
                                                        </div>
                                                        <hr />
                                                        {users.map(user => (
                                                            <div key={user.id} className="form-check mb-1">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    id={`user-${user.id}`}
                                                                    checked={formData.selectedUsers.includes(user.id)}
                                                                    onChange={() => handleUserSelect(user.id)}
                                                                />
                                                                <label className="form-check-label" htmlFor={`user-${user.id}`}>
                                                                    {user.name}
                                                                    <small className="text-muted ms-2">
                                                                        ({user.mobile})
                                                                        <span className="badge bg-primary ms-1">{user.token_count} device(s)</span>
                                                                    </small>
                                                                </label>
                                                            </div>
                                                        ))}
                                                        {users.length === 0 && (
                                                            <div className="text-muted text-center py-3">
                                                                No users with FCM tokens found
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="d-flex gap-2 justify-content-end mt-4">
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => navigate('/notification/list')}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleSend}
                                            disabled={loading || !formData.title || !formData.body}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-paper-plane me-1"></i>
                                                    Send Notification
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NotificationCompose;
