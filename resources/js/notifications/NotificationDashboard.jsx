import React, { useState, useEffect } from 'react';
import ApiService from '../core/services/ApiService';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Pageheader from '../layouts/Pageheader';

const NotificationDashboard = () => {
    const apiService = ApiService();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('7days');

    useEffect(() => {
        fetchStats();
    }, [period]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await apiService.vGet('/api/fcm/dashboard-stats', { params: { period } });
            if (response.data.status) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Failed to load dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Pageheader mainheading="Push Notifications" parentfolder="Notifications" activepage="Dashboard" />
                <div className="page-content-box">
                    <div className="page-content-box-inner">
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!stats) return null;

    return (
        <>
            <Pageheader mainheading="Push Notifications" parentfolder="Notifications" activepage="Dashboard" />
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    {/* Stats Cards */}
                    <div className="row g-3 mb-4">
                        <div className="col-sm-6 col-lg-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <p className="text-muted mb-1 small">Total Sent</p>
                                            <h3 className="mb-0 fw-bold">{stats.total_notifications || 0}</h3>
                                            <small className="text-muted">All notifications</small>
                                        </div>
                                        <div className="bg-primary bg-opacity-10 p-3 rounded">
                                            <i className="fas fa-bell text-primary fs-4"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <p className="text-muted mb-1 small">Delivered</p>
                                            <h3 className="mb-0 fw-bold text-success">{stats.total_sent || 0}</h3>
                                            <small className="text-muted">{stats.delivery_rate || 0}% rate</small>
                                        </div>
                                        <div className="bg-success bg-opacity-10 p-3 rounded">
                                            <i className="fas fa-check-circle text-success fs-4"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <p className="text-muted mb-1 small">Failed</p>
                                            <h3 className="mb-0 fw-bold text-danger">{stats.total_failed || 0}</h3>
                                            <small className="text-muted">Failed to deliver</small>
                                        </div>
                                        <div className="bg-danger bg-opacity-10 p-3 rounded">
                                            <i className="fas fa-times-circle text-danger fs-4"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <p className="text-muted mb-1 small">Partial</p>
                                            <h3 className="mb-0 fw-bold text-warning">{stats.total_partial || 0}</h3>
                                            <small className="text-muted">Some devices failed</small>
                                        </div>
                                        <div className="bg-warning bg-opacity-10 p-3 rounded">
                                            <i className="fas fa-exclamation-triangle text-warning fs-4"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <div className="card shadow-sm">
                                <div className="card-header bg-white">
                                    <h5 className="mb-0 fw-bold">By Type</h5>
                                </div>
                                <div className="card-body">
                                    {stats.by_type?.map((item) => (
                                        <div key={item.type} className="mb-3">
                                            <div className="d-flex justify-content-between mb-1">
                                                <small className="text-capitalize fw-medium">{item.type}</small>
                                                <small className="fw-bold">{item.count}</small>
                                            </div>
                                            <div className="progress" style={{ height: '8px' }}>
                                                <div
                                                    className="progress-bar bg-primary"
                                                    style={{ width: `${(item.count / stats.total_notifications) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card shadow-sm">
                                <div className="card-header bg-white">
                                    <h5 className="mb-0 fw-bold">By Status</h5>
                                </div>
                                <div className="card-body">
                                    {stats.by_status?.map((item) => {
                                        const colorClass = item.status === 'sent' ? 'bg-success' :
                                            item.status === 'failed' ? 'bg-danger' :
                                            item.status === 'partial' ? 'bg-warning' : 'bg-primary';
                                        return (
                                            <div key={item.status} className="mb-3">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <small className="text-capitalize fw-medium">{item.status}</small>
                                                    <small className="fw-bold">{item.count}</small>
                                                </div>
                                                <div className="progress" style={{ height: '8px' }}>
                                                    <div
                                                        className={`progress-bar ${colorClass}`}
                                                        style={{ width: `${(item.count / stats.total_notifications) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Notifications */}
                    <div className="card shadow-sm">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">Recent Notifications</h5>
                            <Link to="/notification/list" className="btn btn-sm btn-outline-primary">
                                View All
                            </Link>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th>Title</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                            <th>Delivered</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recent_notifications?.slice(0, 10).map((notif) => (
                                            <tr key={notif.id}>
                                                <td className="fw-medium">{notif.title}</td>
                                                <td>
                                                    <span className="badge bg-secondary text-capitalize">
                                                        {notif.type}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${
                                                        notif.status === 'sent' ? 'bg-success' :
                                                        notif.status === 'failed' ? 'bg-danger' :
                                                        notif.status === 'partial' ? 'bg-warning' : 'bg-info'
                                                    }`}>
                                                        {notif.status}
                                                    </span>
                                                </td>
                                                <td>{notif.tokens_delivered}/{notif.tokens_sent}</td>
                                                <td>
                                                    <small className="text-muted">
                                                        {new Date(notif.created_at).toLocaleDateString()}
                                                    </small>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NotificationDashboard;
