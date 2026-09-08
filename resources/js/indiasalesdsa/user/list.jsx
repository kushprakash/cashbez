import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';

const DsaList = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { category, item } = location.state || {};

    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const apiService = ApiService();

    useEffect(() => {
        if (!item) {
            navigate('/dsa/services');
            return;
        }
        fetchLeads();
    }, [item]);

    const fetchLeads = async (page = 1) => {
        try {
            setLoading(true);
            const response = await apiService.vGet(`/api/dsa/utm/list?item_id=${item.id}&page=${page}`);
            if (response.data?.status === 1) {
                setLeads(response.data.data.data || []);
                setPagination(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { bg: 'bg-warning-subtle', text: 'text-warning', label: 'Pending' },
            approved: { bg: 'bg-success-subtle', text: 'text-success', label: 'Approved' },
            rejected: { bg: 'bg-danger-subtle', text: 'text-danger', label: 'Rejected' },
        };
        const s = statusMap[status] || statusMap.pending;
        return <span className={`badge ${s.bg} ${s.text} border rounded-pill px-3`}>{s.label}</span>;
    };

    if (!item) return null;

    return (
        <div className="container py-4">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center gap-3">
                    <button className="btn btn-light btn-sm" onClick={() => navigate('/dsa/dashboard', { state: { category, item } })}>
                        <i className="fa fa-arrow-left"></i>
                    </button>
                    <div>
                        <h5 className="fw-bold mb-0">My Applications</h5>
                        <small className="text-muted">{item.title}</small>
                    </div>
                </div>
                <Link
                    to="/dsa/apply"
                    state={{ category, item }}
                    className="btn btn-primary btn-sm"
                >
                    <i className="fa fa-plus me-1"></i>New
                </Link>
            </div>

            {/* List */}
            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : leads.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fa fa-folder-open fa-3x text-muted opacity-50 mb-3"></i>
                            <p className="text-muted mb-3">No applications found</p>
                            <Link to="/dsa/apply" state={{ category, item }} className="btn btn-primary btn-sm">
                                <i className="fa fa-plus me-1"></i>Apply Now
                            </Link>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0 align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="py-3 ps-4">#</th>
                                        <th className="py-3">Date</th>
                                        <th className="py-3">Name</th>
                                        <th className="py-3">Mobile</th>
                                        <th className="py-3">Status</th>
                                        <th className="py-3">Remarks</th>
                                        <th className="py-3">Payout</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leads.map((lead, index) => (
                                        <tr key={lead.id}>
                                            <td className="ps-4 text-muted">{index + 1}</td>
                                            <td className="text-muted small">
                                                {new Date(lead.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="fw-medium">{lead.name}</td>
                                            <td className="text-muted">{lead.mobile}</td>
                                            <td>{getStatusBadge(lead.status)}</td>
                                            <td>{lead.remarks}</td>
                                            <td>{getStatusBadge(lead.payout_status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="card-footer bg-white border-top py-3">
                        <nav>
                            <ul className="pagination pagination-sm mb-0 justify-content-center">
                                {pagination.current_page > 1 && (
                                    <li className="page-item">
                                        <button className="page-link" onClick={() => fetchLeads(pagination.current_page - 1)}>
                                            <i className="fa fa-chevron-left"></i>
                                        </button>
                                    </li>
                                )}
                                {[...Array(pagination.last_page)].map((_, i) => (
                                    <li key={i} className={`page-item ${pagination.current_page === i + 1 ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => fetchLeads(i + 1)}>
                                            {i + 1}
                                        </button>
                                    </li>
                                ))}
                                {pagination.current_page < pagination.last_page && (
                                    <li className="page-item">
                                        <button className="page-link" onClick={() => fetchLeads(pagination.current_page + 1)}>
                                            <i className="fa fa-chevron-right"></i>
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DsaList;
