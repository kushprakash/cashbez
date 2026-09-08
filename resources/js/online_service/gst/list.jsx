import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import { Link } from 'react-router-dom';
import Pageheader from '../../layouts/Pageheader';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';
import { toast } from 'react-toastify';

const GstList = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const apiService = ApiService();
            const response = await apiService.vGet('/api/online-service/gst');
            if (response.data?.status === 200 || response.data?.status === 1) {
                setApplications(response.data.data);
            } else {
                setApplications([]);
            }
        } catch (error) {
            console.error(error);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Pageheader mainheading="GST Applications" parentfolder="GST" activepage="List" />
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="card shadow-sm border-0">
                        <div className="card-header d-flex justify-content-between align-items-center bg-white border-bottom py-3">
                            <h5 className="mb-0 fw-bold text-primary">My Applications</h5>
                            <Link to="/gst/create" className="btn btn-primary d-flex align-items-center gap-2">
                                <i className="fa fa-plus"></i> New Application
                            </Link>
                        </div>
                        <div className="card-body p-0">
                            {loading ? <TableShimmerLoader /> : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0 align-middle">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="py-3 ps-4">SN</th>
                                                <th className="py-3">Date</th>
                                                <th className="py-3">Business Name</th>
                                                <th className="py-3">Owner Name</th>
                                                <th className="py-3">Mobile</th>
                                                <th className="py-3">Status</th>
                                                <th className="py-3">Message</th>
                                                <th className="py-3 pe-4 text-end">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {applications.length > 0 ? applications.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td className="ps-4 fw-medium text-secondary">{index + 1}</td>
                                                    <td className="text-secondary">{new Date(item.created_at).toLocaleDateString()}</td>
                                                    <td className="fw-medium text-dark">{item.bussiness_name}</td>
                                                    <td className="fw-medium text-dark">{item.bussiness_owner_name}</td>
                                                    <td className="text-secondary">{item.mobile_number}</td>
                                                    <td>
                                                        {item.status === 'pending' && <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-3">Processing</span>}
                                                        {item.status === 'approved' && <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3">Approved</span>}
                                                        {item.status === 'rejected' && <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3">Rejected</span>}
                                                        {item.status === 'error' && <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill px-3">Error</span>}
                                                    </td>
                                                    <td className="text-muted small text-truncate" style={{ maxWidth: '200px', paddingRight: '1rem' }} title={item.message}>{item.message || '-'}</td>
                                                    <td className="pe-4 text-end">
                                                        {item.aplication_reciept ? (
                                                            <a href={`/storage/${item.aplication_reciept}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary" title="Download Receipt">
                                                                <i className="fa fa-download me-1"></i> Receipt
                                                            </a>
                                                        ) : (
                                                            <span className="text-muted small">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="8" className="text-center py-5 text-muted">
                                                        <div className="mb-3">
                                                            <i className="fa fa-folder-open fa-3x opacity-25"></i>
                                                        </div>
                                                        <p className="mb-0">No applications found</p>
                                                    </td>
                                                </tr>
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

export default GstList;
