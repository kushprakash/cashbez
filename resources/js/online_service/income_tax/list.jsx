import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import { Link } from 'react-router-dom';

const IncomeTaxList = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const apiService = ApiService();
        try {
            const response = await apiService.vGet('/api/online-service/income-tax');
            if (response.data.status === 1) {
                setApplications(response.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const badges = {
            'pending': 'bg-warning-subtle text-warning border-warning-subtle',
            'approved': 'bg-success-subtle text-success border-success-subtle',
            'rejected': 'bg-danger-subtle text-danger border-danger-subtle',
            'error': 'bg-secondary-subtle text-secondary border-secondary-subtle',
        };
        const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
        const badgeClass = badges[status] || 'bg-light text-dark';

        return <span className={`badge ${badgeClass} border rounded-pill px-3`}>{label}</span>;
    };

    return (
        <>
            <Pageheader mainheading="Application History" parentfolder="Income Tax" activepage="List" />
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center px-4">
                            <h5 className="mb-0 fw-bold text-primary">My Applications</h5>
                            <Link to="/income-tax/create" className="btn btn-primary btn-sm"><i className="fa fa-plus me-2"></i> File New</Link>
                        </div>
                        <div className="card-body p-0">
                            {loading ? <TableShimmerLoader /> : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0 align-middle">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="py-3 ps-4">Date</th>
                                                <th>Type</th>
                                                <th>Ref / PAN</th>
                                                <th>Status</th>
                                                <th>Remark</th>
                                                <th className="text-end pe-4">Receipt</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {applications.map((app) => (
                                                <tr key={app.id}>
                                                    <td className="ps-4 text-secondary">{new Date(app.created_at).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className="fw-bold text-dark text-capitalize">{app.application_type}</span>
                                                    </td>
                                                    <td>
                                                        <div className="fw-medium">{app.pan_number}</div>
                                                        <small className="text-muted">{app.bussiness_name || app.mobile_number}</small>
                                                    </td>
                                                    <td><StatusBadge status={app.status} /></td>
                                                    <td>{app.message || '-'}</td>
                                                    <td className="text-end pe-4">
                                                        {app.application_reciept ? (
                                                            <a href={`/storage/${app.application_reciept}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-success-subtle text-success fw-bold border border-success-subtle">
                                                                <i className="fa fa-download me-1"></i> Download
                                                            </a>
                                                        ) : <span className="text-muted small">NA</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                            {applications.length === 0 && (
                                                <tr><td colSpan="6" className="text-center py-5 text-muted">No applications found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default IncomeTaxList;
