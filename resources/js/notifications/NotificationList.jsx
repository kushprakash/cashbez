import React, { useState, useEffect } from 'react';
import ApiService from '../core/services/ApiService';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Pageheader from '../layouts/Pageheader';

const NotificationList = () => {
    const apiService = ApiService();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [type, setType] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchLogs();
    }, [page, search, status, type]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = { page, per_page: 20 };
            if (search) params.search = search;
            if (status) params.status = status;
            if (type) params.type = type;

            const response = await apiService.vGet('/api/fcm/logs', { params });
            if (response.data.status) {
                setLogs(response.data.data);
                setTotalPages(response.data.last_page);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this notification log?')) return;
        
        try {
            await apiService.vDelete(`/api/fcm/logs/${id}`);
            toast.success('Notification log deleted');
            fetchLogs();
        } catch (error) {
            toast.error('Failed to delete log');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <>
            <Pageheader mainheading="Notification Logs" parentfolder="Notifications" activepage="List" />
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="card shadow-sm">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">All Notifications</h5>
                            <Link to="/notification/compose" className="btn btn-primary btn-sm">
                                <i className="fas fa-plus me-1"></i> Compose
                            </Link>
                        </div>

                        {/* Filters */}
                        <div className="card-body pb-2">
                            <div className="row g-2">
                                <div className="col-md-4">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Search notifications..."
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setPage(1);
                                        }}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <select
                                        className="form-select form-select-sm"
                                        value={status}
                                        onChange={(e) => {
                                            setStatus(e.target.value);
                                            setPage(1);
                                        }}
                                    >
                                        <option value="">All Status</option>
                                        <option value="sent">Sent</option>
                                        <option value="failed">Failed</option>
                                        <option value="partial">Partial</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <select
                                        className="form-select form-select-sm"
                                        value={type}
                                        onChange={(e) => {
                                            setType(e.target.value);
                                            setPage(1);
                                        }}
                                    >
                                        <option value="">All Types</option>
                                        <option value="transaction">Transaction</option>
                                        <option value="account">Account</option>
                                        <option value="system">System</option>
                                        <option value="promotional">Promotional</option>
                                        <option value="security">Security</option>
                                        <option value="service">Service</option>
                                    </select>
                                </div>
                                <div className="col-md-2 text-end">
                                    <button className="btn btn-sm btn-outline-primary" onClick={fetchLogs}>
                                        <i className="fas fa-sync"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status"></div>
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    No notifications found
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th>Title</th>
                                                <th>Type</th>
                                                <th>Status</th>
                                                <th>Delivered</th>
                                                <th>Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {logs.map((log) => (
                                                <tr key={log.id}>
                                                    <td>
                                                        <div className="fw-medium">{log.title}</div>
                                                        <small className="text-muted">{log.body.substring(0, 60)}...</small>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-secondary text-capitalize">
                                                            {log.type}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${
                                                            log.status === 'sent' ? 'bg-success' :
                                                            log.status === 'failed' ? 'bg-danger' :
                                                            log.status === 'partial' ? 'bg-warning' : 'bg-info'
                                                        }`}>
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div>{log.tokens_delivered}/{log.tokens_sent}</div>
                                                        {log.tokens_failed > 0 && (
                                                            <small className="text-danger">
                                                                {log.tokens_failed} failed
                                                            </small>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <small>{formatDate(log.created_at)}</small>
                                                    </td>
                                                    <td>
                                                        <Link
                                                            to={`/notification/view/${log.id}`}
                                                            className="btn btn-sm btn-outline-primary me-1"
                                                        >
                                                            View
                                                        </Link>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDelete(log.id)}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="card-footer bg-white">
                                <nav>
                                    <ul className="pagination pagination-sm justify-content-center mb-0">
                                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setPage(page - 1)}>
                                                Previous
                                            </button>
                                        </li>
                                        {[...Array(totalPages)].map((_, i) => (
                                            <li key={i + 1} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => setPage(i + 1)}>
                                                    {i + 1}
                                                </button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setPage(page + 1)}>
                                                Next
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default NotificationList;
