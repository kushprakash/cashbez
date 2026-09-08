import React, { useState, useEffect } from 'react';
import ApiService from '../core/services/ApiService';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Pageheader from '../layouts/Pageheader';

const NotificationView = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const apiService = ApiService();
    const [log, setLog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [retrying, setRetrying] = useState(false);

    useEffect(() => {
        if (id) {
            fetchLog();
        }
    }, [id]);

    const fetchLog = async () => {
        setLoading(true);
        try {
            const response = await apiService.vGet(`/api/fcm/logs/${id}`);
            if (response.data.status) {
                setLog(response.data.data);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load notification details');
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = async () => {
        setRetrying(true);
        try {
            const response = await apiService.vPost(`/api/fcm/retry-failed/${id}`);
            if (response.data.status) {
                toast.success('Notification retried successfully');
                fetchLog();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to retry');
        } finally {
            setRetrying(false);
        }
    };

    const getStatusBadge = (status) => {
        const classes = {
            sent: 'bg-success',
            failed: 'bg-danger',
            partial: 'bg-warning',
            pending: 'bg-info'
        };
        return `badge ${classes[status] || 'bg-secondary'}`;
    };

    if (loading) {
        return (
            <>
                <Pageheader mainheading="Notification Details" parentfolder="Notifications" activepage="View" />
                <div className="page-content-box">
                    <div className="page-content-box-inner">
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary"></div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!log) {
        return (
            <>
                <Pageheader mainheading="Notification Details" parentfolder="Notifications" activepage="View" />
                <div className="page-content-box">
                    <div className="page-content-box-inner">
                        <div className="alert alert-danger">Notification not found</div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Pageheader mainheading="Notification Details" parentfolder="Notifications" activepage="View" />
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <Link to="/notification/list" className="btn btn-outline-secondary btn-sm">
                            <i className="fas fa-arrow-left me-1"></i> Back to List
                        </Link>
                        {(log.status === 'failed' || log.status === 'partial') && (
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleRetry}
                                disabled={retrying}
                            >
                                {retrying ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-1"></span>
                                        Retrying...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-redo me-1"></i> Retry
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    <div className="row g-3">
                        {/* Main Content */}
                        <div className="col-lg-8">
                            <div className="card shadow-sm mb-3">
                                <div className="card-body">
                                    <h4 className="card-title mb-3">{log.title}</h4>
                                    <div className="d-flex gap-2 mb-3">
                                        <span className={getStatusBadge(log.status)}>
                                            {log.status}
                                        </span>
                                        <span className="badge bg-secondary text-capitalize">
                                            {log.type}
                                        </span>
                                    </div>
                                    <p className="text-muted">{log.body}</p>
                                    <hr />
                                    {log.data && Object.keys(log.data).length > 0 && (
                                        <>
                                            <h6 className="fw-bold mb-2">Additional Data</h6>
                                            <div className="bg-light p-3 rounded">
                                                <pre className="mb-0" style={{ fontSize: '0.875rem' }}>
                                                    {JSON.stringify(log.data, null, 2)}
                                                </pre>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* FCM Response */}
                            <div className="card shadow-sm">
                                <div className="card-header bg-white">
                                    <h6 className="mb-0 fw-bold">FCM Response</h6>
                                </div>
                                <div className="card-body">
                                    <div className="bg-light p-3 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        <pre className="mb-0" style={{ fontSize: '0.875rem' }}>
                                            {JSON.stringify(log.fcm_response, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="col-lg-4">
                            {/* Delivery Stats */}
                            <div className="card shadow-sm mb-3">
                                <div className="card-header bg-white">
                                    <h6 className="mb-0 fw-bold">Delivery Statistics</h6>
                                </div>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between py-2 border-bottom">
                                        <span className="text-muted">Tokens Sent:</span>
                                        <strong>{log.tokens_sent}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between py-2 border-bottom">
                                        <span className="text-success">Delivered:</span>
                                        <strong className="text-success">{log.tokens_delivered}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between py-2 border-bottom">
                                        <span className="text-danger">Failed:</span>
                                        <strong className="text-danger">{log.tokens_failed}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between py-2">
                                        <span className="text-muted">Success Rate:</span>
                                        <strong>{log.success_rate}%</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Meta Information */}
                            <div className="card shadow-sm">
                                <div className="card-header bg-white">
                                    <h6 className="mb-0 fw-bold">Information</h6>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <small className="text-muted d-block">Sent By</small>
                                        <strong>{log.sender?.name || 'System'}</strong>
                                    </div>
                                    {log.user && (
                                        <div className="mb-3">
                                            <small className="text-muted d-block">Recipient</small>
                                            <strong>{log.user.name}</strong>
                                            <br />
                                            <small className="text-muted">{log.user.email}</small>
                                        </div>
                                    )}
                                    {log.campaign_id && (
                                        <div className="mb-3">
                                            <small className="text-muted d-block">Campaign ID</small>
                                            <code className="text-primary">{log.campaign_id}</code>
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <small className="text-muted d-block">Created At</small>
                                        <strong>{new Date(log.created_at).toLocaleString()}</strong>
                                    </div>
                                    {log.sent_at && (
                                        <div>
                                            <small className="text-muted d-block">Sent At</small>
                                            <strong>{new Date(log.sent_at).toLocaleString()}</strong>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NotificationView;
