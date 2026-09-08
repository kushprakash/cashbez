import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';

const DsaDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { category, item } = location.state || {};

    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const apiService = ApiService();

    useEffect(() => {
        if (!item) {
            navigate('/dsa/services');
            return;
        }
        fetchStats();
    }, [item]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            // Use utm/list endpoint with item_id filter to calculate stats
            const response = await apiService.vGet(`/api/dsa/utm/list?item_id=${item.id}&per_page=1000`);
            if (response.data?.status === 1) {
                const leads = response.data.data?.data || [];
                setStats({
                    total: leads.length,
                    pending: leads.filter(l => l.status === 'pending').length,
                    approved: leads.filter(l => l.status === 'approved').length,
                    rejected: leads.filter(l => l.status === 'rejected').length,
                });
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!item) return null;

    const statCards = [
        { label: 'Total', value: stats.total, bg: 'bg-primary-subtle', icon: 'fa-file-alt', iconBg: 'bg-primary', color: 'text-primary' },
        { label: 'Pending', value: stats.pending, bg: 'bg-warning-subtle', icon: 'fa-clock', iconBg: 'bg-warning', color: 'text-warning' },
        { label: 'Approved', value: stats.approved, bg: 'bg-success-subtle', icon: 'fa-check-circle', iconBg: 'bg-success', color: 'text-success' },
        { label: 'Rejected', value: stats.rejected, bg: 'bg-danger-subtle', icon: 'fa-times-circle', iconBg: 'bg-danger', color: 'text-danger' },
    ];

    return (
        <div className="container py-4">
            {/* Header */}
            <div className="d-flex align-items-center gap-3 mb-4">
                <button className="btn btn-light btn-sm" onClick={() => navigate('/dsa/services')}>
                    <i className="fa fa-arrow-left"></i>
                </button>
                <div className="d-flex align-items-center gap-3">
                    <div
                        className="d-flex align-items-center justify-content-center rounded-3 bg-light"
                        style={{ width: '48px', height: '48px' }}
                    >
                        {item.icon ? (
                            <img src={item.icon} alt={item.title} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                        ) : (
                            <i className="fa fa-credit-card text-primary"></i>
                        )}
                    </div>
                    <div>
                        <h5 className="fw-bold mb-0">{item.title}</h5>
                        <small className="text-muted">{category?.name}</small>
                    </div>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="mb-4">
                <h6 className="fw-bold mb-1">Overview</h6>
                <p className="text-muted small mb-3">Track your {item.title} applications</p>

                <div className="row g-3">
                    {statCards.map((stat, index) => (
                        <div key={index} className="col-6 col-md-3">
                            <div className={`card border-0 ${stat.bg} h-100`}>
                                <div className="card-body p-3">
                                    <div className={`d-inline-flex align-items-center justify-content-center rounded-2 ${stat.bg} mb-2`} style={{ width: '36px', height: '36px' }}>
                                        <i className={`fa ${stat.icon} ${stat.color}`}></i>
                                    </div>
                                    <h3 className="fw-bold mb-0">{loading ? '-' : stat.value}</h3>
                                    <small className="text-muted">{stat.label}</small>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-4">
                <h6 className="fw-bold mb-3">Quick Actions</h6>

                <div className="d-flex flex-column gap-3">
                    <Link
                        to="/dsa/apply"
                        state={{ category, item }}
                        className="card border-0 shadow-sm text-decoration-none"
                    >
                        <div className="card-body d-flex align-items-center justify-content-between p-3">
                            <div className="d-flex align-items-center gap-3">
                                <div className="d-flex align-items-center justify-content-center rounded-3 bg-success-subtle" style={{ width: '42px', height: '42px' }}>
                                    <i className="fa fa-plus-circle text-success"></i>
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0 text-dark">New Application</h6>
                                    <small className="text-muted">Apply for {item.title}</small>
                                </div>
                            </div>
                            <i className="fa fa-chevron-right text-muted"></i>
                        </div>
                    </Link>

                    <Link
                        to="/dsa/list"
                        state={{ category, item }}
                        className="card border-0 shadow-sm text-decoration-none"
                    >
                        <div className="card-body d-flex align-items-center justify-content-between p-3">
                            <div className="d-flex align-items-center gap-3">
                                <div className="d-flex align-items-center justify-content-center rounded-3 bg-primary-subtle" style={{ width: '42px', height: '42px' }}>
                                    <i className="fa fa-list-alt text-primary"></i>
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0 text-dark">Track Applications</h6>
                                    <small className="text-muted">View status and history</small>
                                </div>
                            </div>
                            <i className="fa fa-chevron-right text-muted"></i>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Item Details */}
            {(item.target_audience?.length > 0 || item.terms_conditions?.length > 0 || item.instructions?.length > 0) && (
                <div className="mb-4">
                    <h6 className="fw-bold mb-3">Details</h6>
                    <div className="row g-3">
                        {item.target_audience?.length > 0 && (
                            <div className="col-md-4">
                                <div className="card border-0 bg-light h-100">
                                    <div className="card-body p-3">
                                        <h6 className="text-primary fw-bold mb-3">
                                            <i className="fa fa-users me-2"></i>Target Audience
                                        </h6>
                                        <ul className="list-unstyled mb-0 small">
                                            {item.target_audience.map((t, i) => (
                                                <li key={i} className="mb-2">
                                                    <i className="fa fa-check-circle text-success me-2"></i>{t}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {item.terms_conditions?.length > 0 && (
                            <div className="col-md-4">
                                <div className="card border-0 bg-light h-100">
                                    <div className="card-body p-3">
                                        <h6 className="text-warning fw-bold mb-3">
                                            <i className="fa fa-file-alt me-2"></i>Terms & Conditions
                                        </h6>
                                        <ol className="mb-0 ps-3 small">
                                            {item.terms_conditions.map((t, i) => (
                                                <li key={i} className="mb-2">{t}</li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        )}

                        {item.instructions?.length > 0 && (
                            <div className="col-md-4">
                                <div className="card border-0 bg-light h-100">
                                    <div className="card-body p-3">
                                        <h6 className="text-info fw-bold mb-3">
                                            <i className="fa fa-list-ol me-2"></i>Instructions
                                        </h6>
                                        <ol className="mb-0 ps-3 small">
                                            {item.instructions.map((t, i) => (
                                                <li key={i} className="mb-2">{t}</li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DsaDashboard;
